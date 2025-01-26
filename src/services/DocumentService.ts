import { supabase } from '@/config/supabase';
import { RealtimeSyncService } from './RealtimeSyncService';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export class DocumentService {
  private static syncInitialized = false;

  static async getDocuments(userId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get documents:', error);
      throw error;
    }
  }

  static async uploadDocument(
    userId: string,
    file: File,
    title: string
  ): Promise<Document> {
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Create document record in the database
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          title,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  static async deleteDocument(documentId: string): Promise<void> {
    try {
      // Get document details first to delete from storage
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL
      const filePath = document.file_url.split('/').pop();
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  static initializeSync(userId: string, onDocumentUpdate: (payload: any) => void): void {
    if (this.syncInitialized) return;
    
    RealtimeSyncService.subscribe({
      table: 'documents',
      event: '*',
      filter: `user_id=eq.${userId}`,
      onSync: onDocumentUpdate,
    });
    this.syncInitialized = true;
  }

  static cleanup(): void {
    if (!this.syncInitialized) return;
    
    RealtimeSyncService.unsubscribe('documents', '*');
    this.syncInitialized = false;
  }
}

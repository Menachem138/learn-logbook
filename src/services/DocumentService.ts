import { supabase } from '@/integrations/supabase/client';
import { realtimeSync } from './RealtimeSyncService';

export interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export class DocumentService {
  static async uploadDocument(file: File): Promise<Document> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Upload file to Supabase storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Create document record in the database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          user_id: user.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Subscribe to real-time updates for this document
      realtimeSync.subscribeToTable({
        table: 'documents',
        onUpdate: (newData) => {
          if (newData.id === document.id) {
            window.dispatchEvent(
              new CustomEvent('documentUpdate', { detail: newData })
            );
          }
        },
      });

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  static async getDocuments(): Promise<Document[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get document details to delete from storage
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const fileName = document.file_url.split('/').pop();
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([`${user.id}/${fileName}`]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  static async updateDocument(documentId: string, updates: Partial<Document>): Promise<Document> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
}

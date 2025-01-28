import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentInput } from '@/types/documents';
import { DocumentCard } from './DocumentCard';
import { AddDocumentDialog } from './AddDocumentDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToStorage, deleteFileFromStorage } from '@/utils/fileStorage';
import { useAuth } from '@/hooks/useAuth';

export function Documents() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

  const addDocumentMutation = useMutation({
    mutationFn: async (input: DocumentInput) => {
      if (!session?.user) throw new Error('User not authenticated');
      if (!input.file) throw new Error('No file provided');

      // Upload to Supabase Storage
      const uploadResult = await uploadFileToStorage(input.file, session.user.id);
      
      // Save to Supabase Database
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: session.user.id,
          title: input.title,
          description: input.description,
          type: input.type,
          file_url: uploadResult.publicUrl,
          file_size: uploadResult.fileSize,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "הצלחה",
        description: "המסמך נוסף בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Error adding document:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת המסמך",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (document: Document) => {
      console.log('Attempting to delete document:', document);
      
      if (!session?.user) throw new Error('User not authenticated');

      // Extract file path from URL
      const urlParts = document.file_url?.split('content_library/');
      if (urlParts && urlParts.length > 1) {
        try {
          await deleteFileFromStorage(urlParts[1]);
          console.log('Successfully deleted file from storage');
        } catch (error) {
          console.error('Error deleting file from storage:', error);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from Supabase Database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id)
        .eq('user_id', session.user.id); // Add user_id check for extra security

      if (error) {
        console.error('Error deleting from database:', error);
        throw error;
      }
      
      console.log('Successfully deleted document from database');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "הצלחה",
        description: "המסמך נמחק בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת המסמך",
        variant: "destructive",
      });
    },
  });

  const handleAddDocument = async (input: DocumentInput) => {
    await addDocumentMutation.mutateAsync(input);
  };

  const handleDeleteDocument = async (document: Document) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק מסמך זה?')) {
      await deleteDocumentMutation.mutateAsync(document);
    }
  };

  if (!session) {
    return (
      <div className="text-center p-4">
        <p>יש להתחבר כדי לצפות במסמכים</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">מסמכים</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          הוסף מסמך
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center p-4">
          <p>טוען...</p>
        </div>
      ) : documents?.length === 0 ? (
        <div className="text-center p-4">
          <p>אין מסמכים עדיין</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents?.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={handleDeleteDocument}
            />
          ))}
        </div>
      )}

      <AddDocumentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddDocument}
      />
    </div>
  );
}

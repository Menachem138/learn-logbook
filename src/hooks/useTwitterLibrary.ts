import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Tweet {
  id: string;
  tweet_id: string;
  url: string;
  user_id: string;
  created_at: string;
}

interface AddTweetParams {
  tweetId: string;
  url: string;
}

export function useTwitterLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tweets = [], isLoading } = useQuery({
    queryKey: ['tweets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tweets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading tweets",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Tweet[];
    },
  });

  const addTweet = useMutation({
    mutationFn: async ({ tweetId, url }: AddTweetParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tweets')
        .insert({
          tweet_id: tweetId,
          url: url,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      toast({
        title: "Tweet added",
        description: "The tweet has been added to your library",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding tweet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTweet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tweets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      toast({
        title: "Tweet deleted",
        description: "The tweet has been removed from your library",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting tweet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    tweets,
    isLoading,
    addTweet,
    deleteTweet,
  };
}
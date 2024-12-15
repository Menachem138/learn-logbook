import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase, adminClient } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Trash2, Youtube } from 'lucide-react';
import type { Database } from '@/types/database';

type Video = Database['public']['Tables']['videos']['Row'];

export function VideoLibrary() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { toast } = useToast();

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const addVideo = useCallback(async () => {
    const videoId = extractVideoId(newVideoUrl);
    if (!videoId) {
      toast({
        title: "שגיאה",
        description: "כתובת URL לא חוקית של YouTube",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`https://noembed.com/embed?url=${newVideoUrl}`);
      const data = await response.json();

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase
        .from('videos')
        .insert({
          title: data.title,
          url: newVideoUrl,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          video_id: videoId,
          user_id: userData.user.id
        });

      if (error) throw error;

      fetchVideos();
      setNewVideoUrl('');

      toast({
        title: "הצלחה",
        description: "הסרטון נוסף בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת הסרטון",
        variant: "destructive",
      });
      console.error('Error adding video:', error);
    }
  }, [newVideoUrl, toast]);

  const deleteVideo = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchVideos();
      toast({
        title: "הצלחה",
        description: "הסרטון נמחק בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הסרטון",
        variant: "destructive",
      });
      console.error('Error deleting video:', error);
    }
  }, [toast]);

  const fetchVideos = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת הסרטונים",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const createVideosTable = async () => {
      try {
        const { error } = await adminClient.rpc('exec_sql', {
          query: `
            CREATE TABLE IF NOT EXISTS public.videos (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              title TEXT NOT NULL,
              url TEXT NOT NULL,
              thumbnail TEXT NOT NULL,
              video_id TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
            );

            ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

            DO $$
            BEGIN
              CREATE POLICY "Users can view their own videos"
                ON public.videos FOR SELECT USING (auth.uid() = user_id);
            EXCEPTION
              WHEN duplicate_object THEN null;
            END $$;

            DO $$
            BEGIN
              CREATE POLICY "Users can insert their own videos"
                ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);
            EXCEPTION
              WHEN duplicate_object THEN null;
            END $$;

            DO $$
            BEGIN
              CREATE POLICY "Users can update their own videos"
                ON public.videos FOR UPDATE USING (auth.uid() = user_id);
            EXCEPTION
              WHEN duplicate_object THEN null;
            END $$;

            DO $$
            BEGIN
              CREATE POLICY "Users can delete their own videos"
                ON public.videos FOR DELETE USING (auth.uid() = user_id);
            EXCEPTION
              WHEN duplicate_object THEN null;
            END $$;
          `
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error creating videos table:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה ביצירת טבלת הסרטונים",
          variant: "destructive",
        });
      }
    };

    createVideosTable();
    fetchVideos();
  }, [toast]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="הכנס קישור לסרטון YouTube"
          value={newVideoUrl}
          onChange={(e) => setNewVideoUrl(e.target.value)}
          className="flex-1 text-right"
          dir="rtl"
        />
        <Button
          onClick={addVideo}
          className="flex items-center gap-2"
        >
          <Youtube className="h-4 w-4" />
          הוסף סרטון
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="relative group rounded-lg overflow-hidden shadow-md bg-white"
          >
            <div className="relative aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <Button
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={() => {
                    setSelectedVideo(video);
                    setIsModalOpen(true);
                  }}
                >
                  <Youtube className="h-12 w-12 text-white" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-right">{video.title}</h3>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => deleteVideo(video.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-right">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${extractVideoId(selectedVideo.url)}`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

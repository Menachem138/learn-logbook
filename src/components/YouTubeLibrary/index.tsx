import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Play as PlayIcon, Trash2, Loader2 } from "lucide-react";
import { useYouTubeStore } from "../../stores/youtube";
import { YouTubePlayer } from "./YouTubePlayer";
import { AddVideoDialog } from "./AddVideoDialog";
import { useAuth } from "../../components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function YouTubeLibrary() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { videos, isLoading, fetchVideos, deleteVideo } = useYouTubeStore();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeLibrary = async () => {
      console.log('YouTubeLibrary: Initializing...', {
        authLoading,
        user: user?.id,
        isLoading
      });

      if (!authLoading) {
        if (!user) {
          console.log('YouTubeLibrary: No authenticated user, redirecting to login');
          setError('נא להתחבר כדי לצפות בסרטונים');
          navigate('/login', { replace: true });
          return;
        }

        try {
          console.log('YouTubeLibrary: Fetching videos for user:', user.id);
          await fetchVideos();
          console.log('YouTubeLibrary: Videos fetched successfully:', videos.length);
        } catch (error) {
          console.error('YouTubeLibrary: Error fetching videos:', error);
          setError('אירעה שגיאה בטעינת הסרטונים');
          toast({
            title: "שגיאה",
            description: "אירעה שגיאה בטעינת הסרטונים",
            variant: "destructive",
          });
        }
      }
    };

    initializeLibrary();
  }, [user, authLoading, navigate, fetchVideos, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      console.log('YouTubeLibrary: Initiating video deletion for ID:', id);
      await deleteVideo(id);
      console.log('YouTubeLibrary: Video deletion completed');
      toast({
        title: "הצלחה",
        description: "הסרטון נמחק בהצלחה",
      });
    } catch (error) {
      console.error('YouTubeLibrary: Error deleting video:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת הסרטון",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">טוען...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[200px] flex-col gap-4">
        <Alert variant="destructive">
          <AlertDescription>{error || 'נא להתחבר כדי לצפות בסרטונים'}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/login')}>התחבר</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ספריית סרטוני YouTube</h2>
        <div className="space-x-2 flex flex-row-reverse">
          <Button onClick={() => setIsAddingVideo(true)} className="bg-primary hover:bg-primary/90">
            הוסף סרטון
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            התנתק
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px] flex-col gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>טוען את הספרייה...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <div className="text-muted-foreground">אין סרטונים בספרייה</div>
          <Button 
            variant="link" 
            onClick={() => setIsAddingVideo(true)}
            className="mt-2"
          >
            לחץ כאן להוספת סרטון
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="p-4 group relative hover:shadow-lg transition-shadow">
              <div
                className="relative aspect-video cursor-pointer rounded-md overflow-hidden"
                onClick={() => setSelectedVideo(video.video_id)}
              >
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                  <PlayIcon className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="mt-3 font-medium line-clamp-2">{video.title}</h3>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteVideo(video.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {selectedVideo && (
        <YouTubePlayer
          videoId={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      <AddVideoDialog
        isOpen={isAddingVideo}
        onClose={() => setIsAddingVideo(false)}
      />
    </div>
  );
}
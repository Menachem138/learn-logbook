import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Play as PlayIcon, Trash2 } from "lucide-react";
import { useYouTubeStore } from "../../stores/youtube";
import { YouTubePlayer } from "./YouTubePlayer";
import { AddVideoDialog } from "./AddVideoDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useAuth } from "../../components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import type { YouTubeVideo } from "../../stores/youtube";
import { getYouTubeThumbnail } from "../../utils/youtube";

export function YouTubeLibrary() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { videos, isLoading, fetchVideos, deleteVideo } = useYouTubeStore();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [videoToDelete, setVideoToDelete] = useState<YouTubeVideo | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('No authenticated user, redirecting to login');
        setError('נא להתחבר כדי לצפות בסרטונים');
        navigate('/login', { replace: true });
        return;
      }

      console.log('Initializing videos with auth state:', {
        isAuthenticated: !!user,
        videosCount: videos.length,
        isLoading
      });

      try {
        console.log('Fetching videos from Supabase...');
        fetchVideos();
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('אירעה שגיאה בטעינת הסרטונים');
      }
    }
  }, [user, authLoading, navigate, fetchVideos]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const handleDelete = async () => {
    if (!videoToDelete) return;
    try {
      await deleteVideo(videoToDelete.id);
      setIsDeleteDialogOpen(false);
      setVideoToDelete(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      setError('אירעה שגיאה במחיקת הסרטון');
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">טוען...</div>;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => navigate('/login')}>התחבר</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ספריית סרטוני YouTube</h2>
        <div className="space-x-2 flex flex-row-reverse">
          <Button onClick={() => setIsAddingVideo(true)}>
            הוסף סרטון
          </Button>
          <Button onClick={handleSignOut}>התנתק</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="relative cursor-pointer hover:shadow-lg transition-shadow overflow-visible"
            onClick={() => setSelectedVideo(video.id)}
            data-testid="video-card"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVideoToDelete(video);
                setIsDeleteDialogOpen(true);
              }}
              className="absolute top-2 right-2 z-[100] p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-md"
              data-testid="delete-video-button"
              style={{ width: '32px', height: '32px' }}
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
            <div className="aspect-video relative">
              <img
                src={getYouTubeThumbnail(video.url)}
                alt={video.title}
                className="w-full h-full object-cover"
                data-testid="video-thumbnail"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const currentQuality = img.src.match(/\/(\w+)\.jpg$/)?.[1];
                  const qualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];
                  const currentIndex = qualities.indexOf(currentQuality || '');

                  if (currentIndex < qualities.length - 1) {
                    const nextQuality = qualities[currentIndex + 1];
                    const videoId = video.url.match(/(?:youtube\.com\/watch\?v=|youtu.be\/|youtube.com\/shorts\/|youtube.com\/embed\/)([^&\n?#]+)/)?.[1];
                    if (videoId) {
                      img.src = `https://img.youtube.com/vi/${videoId}/${nextQuality}.jpg`;
                    }
                  }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayIcon className="h-12 w-12 text-white opacity-80" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate" data-testid="video-title">{video.title}</h3>
            </div>
          </Card>
        ))}
      </div>

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

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setVideoToDelete(null);
        }}
        onConfirm={handleDelete}
        videoTitle={videoToDelete?.title ?? ''}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Trash2 } from "lucide-react";
import { useYouTubeStore } from "../../stores/youtube";
import { AddVideoDialog } from "./AddVideoDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { YouTubePlayer } from "./YouTubePlayer";
import { useAuth } from "../../components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import type { YouTubeVideo } from "../../stores/youtube";
import { getYouTubeThumbnail, parseYouTubeUrl } from "../../utils/youtube";

export function YouTubeLibrary() {
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { videos, isLoading, error: storeError, initialized, fetchVideos, deleteVideo } = useYouTubeStore();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [videoToDelete, setVideoToDelete] = useState<YouTubeVideo | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('No authenticated user, redirecting to login');
        setError('נא להתחבר כדי לצפות בסרטונים');
        navigate('/login', { replace: true });
        return;
      }

      if (!initialized && !isLoading) {
        console.log('Initializing videos with auth state:', {
          isAuthenticated: !!user,
          videosCount: videos.length,
          isLoading,
          initialized
        });

        try {
          console.log('Fetching videos from Supabase...');
          fetchVideos();
        } catch (error) {
          console.error('Error fetching videos:', error);
          setError('אירעה שגיאה בטעינת הסרטונים');
        }
      }
    }
  }, [user, authLoading, navigate, fetchVideos, initialized, isLoading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const handleDelete = async () => {
    if (!videoToDelete) {
      console.log('No video selected for deletion');
      return;
    }
    try {
      console.log('Attempting to delete video:', videoToDelete.title);
      await deleteVideo(videoToDelete.id);
      console.log('Video deleted successfully');
      setIsDeleteDialogOpen(false);
      setVideoToDelete(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      setError('אירעה שגיאה במחיקת הסרטון');
    }
  };

  const handleVideoClick = (e: React.MouseEvent, video: YouTubeVideo) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey) {
      return;
    }

    e.preventDefault();
    const videoId = parseYouTubeUrl(video.url);
    if (videoId) {
      setActiveVideoId(videoId);
    }
  };

  if (authLoading || (!initialized && isLoading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <div className="text-gray-600">טוען את ספריית הסרטונים...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <div className="text-red-500 mb-4">{error || storeError}</div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="relative group hover:shadow-lg transition-shadow overflow-hidden"
            data-testid="video-card"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setVideoToDelete(video);
                setIsDeleteDialogOpen(true);
              }}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-red-500/40 hover:bg-red-600/60 transition-colors"
              data-testid="delete-video-button"
              aria-label="מחק סרטון"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
            <div
              onClick={(e) => handleVideoClick(e, video)}
              className="block cursor-pointer relative group"
              data-testid="video-link"
            >
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={getYouTubeThumbnail(video.url)}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-testid="video-thumbnail"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.log('Thumbnail load error, falling back to default quality');
                    const videoId = video.video_id;
                    if (videoId) {
                      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 text-right" dir="rtl" data-testid="video-title">
                  {video.title}
                </h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {activeVideoId && (
        <YouTubePlayer
          videoId={activeVideoId}
          onClose={() => setActiveVideoId(null)}
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

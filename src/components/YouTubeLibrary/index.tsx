import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Play as PlayIcon } from "lucide-react";
import { useYouTubeStore } from "../../stores/youtube";
import { YouTubePlayer } from "./YouTubePlayer";
import { AddVideoDialog } from "./AddVideoDialog";

export function YouTubeLibrary() {
  const { videos, isLoading, error, fetchVideos, initializeSubscription, cleanup } = useYouTubeStore();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  useEffect(() => {
    console.log('YouTubeLibrary mounted - initializing subscription');
    initializeSubscription();
    return () => {
      console.log('YouTubeLibrary unmounting - cleaning up subscription');
      cleanup();
    };
  }, [initializeSubscription, cleanup]);

  useEffect(() => {
    console.log('Fetching initial videos');
    fetchVideos();
  }, [fetchVideos]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" dir="rtl">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ספריית סרטוני YouTube</h2>
        <Button onClick={() => setIsAddingVideo(true)}>
          הוסף סרטון
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="p-4">
            <div
              className="relative aspect-video cursor-pointer"
              onClick={() => setSelectedVideo(video.video_id)}
            >
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50">
                <PlayIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="mt-2 font-medium">{video.title}</h3>
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
    </div>
  );
}

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useYouTubeStore } from "../../stores/youtube";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";
import { parseYouTubeUrl, getYouTubeVideoDetails } from "../../utils/youtube";
import { supabase } from "../../integrations/supabase/client";

interface AddVideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVideoDialog({ isOpen, onClose }: AddVideoDialogProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const { fetchVideos } = useYouTubeStore();
  const isLoading = useYouTubeStore(state => state.isLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', user, 'Auth error:', authError);

      if (!user || authError) {
        console.error('Authentication error:', authError);
        setError('נא להתחבר כדי להוסיף סרטונים');
        return;
      }

      const videoId = parseYouTubeUrl(url);
      if (!videoId) {
        setError('קישור YouTube לא תקין');
        return;
      }

      console.log('Fetching video details for:', videoId);
      const details = await getYouTubeVideoDetails(videoId);
      console.log('Video details:', details);

      console.log('Inserting video into Supabase...');
      const { data, error: insertError } = await supabase
        .from('youtube_videos')
        .insert([{
          video_id: videoId,
          title: details.title,
          thumbnail_url: details.thumbnail,
          url: url,
          user_id: user.id
        }])
        .select();

      console.log('Supabase insert response:', { data, error: insertError });

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw insertError;
      }

      await fetchVideos();
      setUrl("");
      onClose();
    } catch (err) {
      console.error('Error adding video:', err);
      setError('שגיאה בהוספת הסרטון');
    }
  };

  const getHebrewError = (error: string) => {
    if (error.includes('API key')) {
      return 'מפתח ה-API של YouTube לא מוגדר';
    }
    if (error.includes('Invalid YouTube URL')) {
      return 'פורמט כתובת URL לא חוקי של YouTube';
    }
    return 'שגיאה בהוספת הסרטון';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוסף סרטון YouTube</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="הכנס קישור YouTube"
            className="w-full"
            disabled={isLoading}
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{getHebrewError(error)}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                טוען...
              </>
            ) : (
              'הוסף'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

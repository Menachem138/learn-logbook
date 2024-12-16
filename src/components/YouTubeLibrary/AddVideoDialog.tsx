import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useYouTubeStore } from "../../stores/youtube";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";

interface AddVideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVideoDialog({ isOpen, onClose }: AddVideoDialogProps) {
  const addVideo = useYouTubeStore(state => state.addVideo);
  const error = useYouTubeStore(state => state.error);
  const isLoading = useYouTubeStore(state => state.isLoading);
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      return;
    }

    console.log('Attempting to add video:', url);
    try {
      await addVideo(url);
      console.log('Video added successfully');
      setUrl("");
      onClose();
    } catch (err) {
      console.error('Error adding video:', err);
    }
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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !url.trim()}
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

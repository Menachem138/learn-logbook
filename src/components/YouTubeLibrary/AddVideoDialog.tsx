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
  // Use separate selectors to prevent unnecessary re-renders
  const addVideo = useYouTubeStore(state => state.addVideo);
  const error = useYouTubeStore(state => state.error);
  const isLoading = useYouTubeStore(state => state.isLoading);
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVideo(url);
      setUrl("");
      onClose();
    } catch (err) {
      // Error will be handled by the store
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

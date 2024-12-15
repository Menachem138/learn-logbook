import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { LibraryItem, LibraryItemType } from "@/types/library";
import { getYouTubeVideoId, isValidYouTubeUrl } from "@/utils/youtube";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<LibraryItem> & { file?: File }) => void;
  initialData?: LibraryItem | null;
}

export function ItemDialog({ isOpen, onClose, onSubmit, initialData }: ItemDialogProps) {
  const { register, handleSubmit, reset, watch, setValue } = useForm<LibraryItem & { youtube_url?: string; file?: File }>({
    defaultValues: initialData || {
      title: "",
      content: "",
      type: "note" as LibraryItemType,
    },
  });

  const selectedType = watch("type");
  const youtubeUrl = watch("youtube_url");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isLoadingTitle, setIsLoadingTitle] = React.useState(false);

  const fetchVideoTitle = async (videoId: string) => {
    try {
      console.log('Fetching title for video:', videoId);
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      console.log('Received video data:', data);
      return data.title || '';
    } catch (error) {
      console.error('Error fetching video title:', error);
      return '';
    }
  };

  useEffect(() => {
    if (selectedType === 'youtube' && youtubeUrl) {
      console.log('URL changed:', youtubeUrl);
      if (isValidYouTubeUrl(youtubeUrl)) {
        const videoId = getYouTubeVideoId(youtubeUrl);
        console.log('Valid YouTube URL, video ID:', videoId);
        if (videoId) {
          setIsLoadingTitle(true);
          fetchVideoTitle(videoId).then((title) => {
            console.log('Setting title to:', title);
            if (title) {
              setValue('title', title);
            }
            setIsLoadingTitle(false);
          });
        }
      } else {
        console.log('Invalid YouTube URL');
      }
    }
  }, [youtubeUrl, selectedType, setValue]);

  const onSubmitForm = async (data: any) => {
    try {
      let formData;

      if (data.type === 'youtube') {
        const videoId = getYouTubeVideoId(data.youtube_url);
        if (!videoId) {
          return;
        }
        formData = {
          ...data,
          file_details: {
            youtube_id: videoId,
            path: `youtube/${videoId}`,
            type: 'youtube'
          }
        };
      } else {
        formData = {
          ...data,
          file: selectedFile,
        };
      }

      onSubmit(formData);
      setSelectedFile(null);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "ערוך פריט" : "הוסף פריט חדש"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <Input
              placeholder="כותרת"
              {...register("title", { required: true })}
              disabled={selectedType === 'youtube' && isLoadingTitle}
            />
          </div>
          <div>
            <select
              className="w-full p-2 border rounded-md"
              {...register("type", { required: true })}
            >
              <option value="note">הערה</option>
              <option value="link">קישור</option>
              <option value="image">תמונה</option>
              <option value="video">וידאו</option>
              <option value="youtube">YouTube</option>
              <option value="whatsapp">וואטסאפ</option>
              <option value="pdf">PDF</option>
              <option value="question">שאלה</option>
            </select>
          </div>
          <div>
            <Textarea
              placeholder={selectedType === 'question' ? "מה השאלה שלך?" : "תוכן"}
              {...register("content", { required: true })}
            />
          </div>

          {selectedType === 'youtube' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                הכנס קישור YouTube
              </label>
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                {...register("youtube_url", {
                  required: selectedType === 'youtube',
                  onChange: (e) => {
                    const url = e.target.value;
                    console.log('YouTube URL changed:', url);
                    if (isValidYouTubeUrl(url)) {
                      const videoId = getYouTubeVideoId(url);
                      console.log('Valid YouTube URL, video ID:', videoId);
                      if (videoId) {
                        setIsLoadingTitle(true);
                        fetchVideoTitle(videoId).then((title) => {
                          console.log('Setting title to:', title);
                          if (title) {
                            setValue('title', title);
                          }
                          setIsLoadingTitle(false);
                        });
                      }
                    }
                  }
                })}
                dir="ltr"
              />
            </div>
          )}

          {(selectedType === 'image' || selectedType === 'video' || selectedType === 'pdf') && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {selectedType === 'image' ? 'העלה תמונה' : selectedType === 'video' ? 'העלה וידאו' : 'העלה PDF'}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={
                    selectedType === 'image'
                      ? "image/*"
                      : selectedType === 'video'
                      ? "video/*"
                      : "application/pdf"
                  }
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {selectedFile && (
                  <span className="text-sm text-gray-500">
                    {selectedFile.name}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit">
              {initialData ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

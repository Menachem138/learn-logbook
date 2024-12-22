import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LibraryItemType } from "@/types/library";

interface FileUploadProps {
  type: LibraryItemType;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filesCount?: number;
}

export function FileUpload({ type, onChange, filesCount }: FileUploadProps) {
  const isImageType = type === 'image' || type === 'image_album';
  const isFileUploadType = isImageType || type === 'video' || type === 'pdf';

  if (!isFileUploadType) return null;

  const getUploadLabel = () => {
    if (type === 'image') return 'העלה תמונה';
    if (type === 'image_album') return 'העלה תמונות';
    if (type === 'video') return 'העלה וידאו';
    return 'העלה PDF';
  };

  const getAcceptTypes = () => {
    if (isImageType) return "image/*";
    if (type === 'video') return "video/*";
    return "application/pdf";
  };

  return (
    <div className="space-y-2">
      <Label>{getUploadLabel()}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={getAcceptTypes()}
          multiple={type === 'image_album'}
          onChange={onChange}
          className="flex-1"
        />
        {filesCount !== undefined && filesCount > 0 && (
          <span className="text-sm text-gray-500">
            {filesCount} {filesCount === 1 ? 'קובץ' : 'קבצים'} נבחרו
          </span>
        )}
      </div>
    </div>
  );
}
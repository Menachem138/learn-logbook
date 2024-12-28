import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document } from "@/types/documents";
import { FileIcon, Trash2 } from "lucide-react";

interface DocumentCardProps {
  document: Document;
  onDelete: (document: Document) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const handleDownload = () => {
    // For PDFs from Cloudinary, ensure we're using the raw URL
    const downloadUrl = document.file_url.includes('cloudinary') && document.type === 'application/pdf'
      ? document.file_url.replace('/image/upload/', '/raw/upload/')
      : document.file_url;
    
    window.open(downloadUrl, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileIcon className="h-5 w-5" />
          {document.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">{document.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleDownload}>
          פתח/הורד
        </Button>
        <Button variant="destructive" onClick={() => onDelete(document)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
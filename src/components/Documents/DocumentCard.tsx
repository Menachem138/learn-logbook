import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Edit } from "lucide-react";
import { Document } from '@/types/documents';

interface DocumentCardProps {
  document: Document;
  onEdit?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
}

export function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
  const handleDownload = () => {
    // Add fl_attachment for PDFs from Cloudinary to force download
    const downloadUrl = document.file_url.includes('cloudinary') 
      ? `${document.file_url}?fl=attachment`
      : document.file_url;
    
    window.open(downloadUrl, '_blank');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{document.title}</h3>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(document)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(document)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {document.description && (
          <p className="text-sm text-muted-foreground">{document.description}</p>
        )}
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="uppercase">{document.type}</span>
          {document.file_size && (
            <span>• {formatFileSize(document.file_size)}</span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          פתח/הורד
        </Button>
      </CardFooter>
    </Card>
  );
}
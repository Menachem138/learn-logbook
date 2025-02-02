declare module 'expo-document-picker' {
  interface DocumentPickerResult {
    type: 'success' | 'cancel';
    uri?: string;
    name?: string;
    size?: number;
    mimeType?: string;
  }

  export function getDocumentAsync(options?: {
    type?: string | string[];
    copyToCacheDirectory?: boolean;
  }): Promise<DocumentPickerResult>;
}

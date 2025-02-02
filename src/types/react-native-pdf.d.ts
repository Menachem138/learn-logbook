declare module 'react-native-pdf' {
  import { Component } from 'react';
  import { ViewStyle, NativeSyntheticEvent } from 'react-native';

  export interface PdfSourceType {
    uri?: string;
    base64?: string;
    headers?: { [key: string]: string };
    method?: string;
    cache?: boolean;
  }

  export interface PdfLoadEventData {
    numberOfPages: number;
    page: number;
    message?: string;
  }

  export interface PdfErrorEventData {
    error: Error;
    message?: string;
  }

  export interface PdfProps {
    source: PdfSourceType | number;
    page?: number;
    scale?: number;
    minScale?: number;
    maxScale?: number;
    horizontal?: boolean;
    spacing?: number;
    password?: string;
    style?: ViewStyle;
    enablePaging?: boolean;
    enableRTL?: boolean;
    enableAnnotationRendering?: boolean;
    onLoadComplete?: (numberOfPages: number, path: string, size?: { width: number; height: number }, filePath?: string) => void;
    onPageChanged?: (page: number, numberOfPages: number) => void;
    onError?: (error: Error) => void;
    onPageSingleTap?: (page: number) => void;
    onScaleChanged?: (scale: number) => void;
    renderActivityIndicator?: () => JSX.Element;
    onLoadProgress?: (percent: number) => void;
    activityIndicator?: () => JSX.Element;
    activityIndicatorProps?: { [key: string]: any };
  }

  export default class Pdf extends Component<PdfProps> {}
}

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

declare module 'react-native-blob-util' {
  interface RNFetchBlobConfig {
    fileCache?: boolean;
    appendExt?: string;
    path?: string;
    addAndroidDownloads?: {
      useDownloadManager?: boolean;
      notification?: boolean;
      title?: string;
      description?: string;
      mime?: string;
      mediaScannable?: boolean;
      path?: string;
    };
  }

  interface RNFetchBlobStat {
    lastModified: string;
    size: string;
    type: string;
    path: string;
  }

  interface RNFetchBlobRNFetchBlobConfig extends RNFetchBlobConfig {
    trusty?: boolean;
    timeout?: number;
    followRedirect?: boolean;
    headers?: { [key: string]: string };
  }

  export default class RNFetchBlob {
    static config(options: RNFetchBlobConfig): RNFetchBlob;
    static fs: {
      readFile(path: string, encoding?: string): Promise<string>;
      writeFile(path: string, data: string, encoding?: string): Promise<void>;
      exists(path: string): Promise<boolean>;
      stat(path: string): Promise<RNFetchBlobStat>;
      unlink(path: string): Promise<void>;
      mkdir(path: string): Promise<void>;
    };
    fetch(method: string, url: string, headers?: { [key: string]: string }, body?: string | FormData): Promise<{
      data: string;
      respInfo: { status: number; headers: { [key: string]: string } };
    }>;
  }
}

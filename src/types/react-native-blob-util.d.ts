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

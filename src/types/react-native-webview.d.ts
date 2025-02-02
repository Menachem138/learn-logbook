declare module 'react-native-webview' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface WebViewProps {
    source: { uri: string } | { html: string } | { uri?: string; headers?: { [key: string]: string } };
    style?: ViewStyle;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    startInLoadingState?: boolean;
    scalesPageToFit?: boolean;
    scrollEnabled?: boolean;
    showsVerticalScrollIndicator?: boolean;
    onError?: (syntheticEvent: any) => void;
    onLoadEnd?: () => void;
    onLoadStart?: () => void;
    onLoad?: () => void;
    onNavigationStateChange?: (navState: { url: string; loading: boolean }) => void;
  }

  export class WebView extends Component<WebViewProps> {}
}

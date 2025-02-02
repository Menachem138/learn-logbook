import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/components/theme/ThemeProvider';

interface TwitterFeedProps {
  username: string;
}

export function TwitterFeed({ username }: TwitterFeedProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const twitterEmbed = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          body { margin: 0; background-color: ${isDark ? '#000' : '#fff'}; }
        </style>
      </head>
      <body>
        <a 
          class="twitter-timeline" 
          data-theme="${isDark ? 'dark' : 'light'}"
          data-chrome="noheader nofooter noborders transparent"
          href="https://twitter.com/${username}?ref_src=twsrc%5Etfw"
        >
          Loading tweets...
        </a>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ html: twitterEmbed }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 500,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

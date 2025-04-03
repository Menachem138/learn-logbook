
import React, { useState } from 'react';
import { useTwitterLibrary } from '@/hooks/useTwitterLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WebView } from 'react-native-webview';
import { Platform, View, Text, StyleSheet } from 'react-native';

// Cross-platform TweetEmbed component
const TweetEmbed = ({ tweetId }: { tweetId: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // HTML template for embedding tweet in WebView
  const tweetHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body { margin: 0; padding: 0; font-family: sans-serif; overflow: hidden; }
          .twitter-tweet { margin: 0 auto; }
        </style>
      </head>
      <body>
        <blockquote class="twitter-tweet" data-conversation="none">
          <a href="https://twitter.com/user/status/${tweetId}"></a>
        </blockquote>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
        <script>
          // Send message when tweet is loaded or fails
          let loaded = false;
          window.addEventListener('message', function() {
            if (!loaded) {
              window.ReactNativeWebView.postMessage('loaded');
              loaded = true;
            }
          });
          
          // Fallback in case tweet doesn't load within 5 seconds
          setTimeout(function() {
            if (!loaded) {
              window.ReactNativeWebView.postMessage('error');
            }
          }, 5000);
        </script>
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    // For web, we can use a simpler approach with the Twitter script
    return (
      <div 
        dangerouslySetInnerHTML={{
          __html: `<blockquote class="twitter-tweet" data-conversation="none"><a href="https://twitter.com/user/status/${tweetId}"></a></blockquote>
          <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`
        }}
      />
    );
  }

  // For mobile platforms (iOS, Android)
  if (hasError) {
    return (
      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          לא ניתן לטעון את הציוץ. ייתכן שחוסם פרסומות או הגדרות פרטיות מונעים את הטעינה.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <View style={{ height: 300, width: '100%' }}>
      <WebView
        source={{ html: tweetHtml }}
        style={{ backgroundColor: 'transparent' }}
        onMessage={(event) => {
          const message = event.nativeEvent.data;
          if (message === 'loaded') {
            setIsLoading(false);
          } else if (message === 'error') {
            setHasError(true);
          }
        }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <Text>טוען ציוץ...</Text>
          </View>
        )}
      />
      {isLoading && (
        <View style={styles.loading}>
          <Text>טוען ציוץ...</Text>
        </View>
      )}
    </View>
  );
};

// Define styles for the mobile version
const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  }
});

export function TwitterLibrary() {
  const [newTweetUrl, setNewTweetUrl] = useState('');
  const { tweets, isLoading, addTweet, deleteTweet } = useTwitterLibrary();

  const extractTweetId = (url: string): string | null => {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleAddTweet = async () => {
    const tweetId = extractTweetId(newTweetUrl);
    if (!tweetId) return;

    await addTweet.mutateAsync({
      tweetId,
      url: newTweetUrl,
    });
    setNewTweetUrl('');
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-background text-foreground transition-colors duration-300">
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-background text-foreground transition-colors duration-300">
      <div className="space-y-6">
        <div className="flex gap-2">
          <Input
            value={newTweetUrl}
            onChange={(e) => setNewTweetUrl(e.target.value)}
            placeholder="הכנס קישור לציוץ"
            className="flex-1"
          />
          <Button 
            onClick={handleAddTweet}
            disabled={!newTweetUrl || addTweet.isPending}
          >
            {addTweet.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'הוסף ציוץ'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="relative bg-background rounded-lg shadow-sm transition-colors duration-300">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={() => deleteTweet.mutate(tweet.id)}
                disabled={deleteTweet.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <TweetEmbed tweetId={tweet.tweet_id} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

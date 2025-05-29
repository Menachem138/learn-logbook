
import React, { useState } from 'react';
import { useTwitterLibrary } from '@/hooks/useTwitterLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Web-only TweetEmbed component
const TweetEmbed = ({ tweetId }: { tweetId: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  React.useEffect(() => {
    // Load Twitter widgets script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.twttr) {
        // @ts-ignore
        window.twttr.widgets.load();
        setIsLoading(false);
      }
    };
    script.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      document.head.appendChild(script);
    } else {
      setIsLoading(false);
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [tweetId]);

  if (hasError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          לא ניתן לטעון את הציוץ. ייתכן שחוסם פרסומות או הגדרות פרטיות מונעים את הטעינה.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="mr-2">טוען ציוץ...</span>
        </div>
      )}
      <div 
        dangerouslySetInnerHTML={{
          __html: `<blockquote class="twitter-tweet" data-conversation="none"><a href="https://twitter.com/user/status/${tweetId}"></a></blockquote>`
        }}
      />
    </div>
  );
};

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

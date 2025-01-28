import React, { useState, useEffect } from 'react';
import { useTwitterLibrary } from '@/hooks/useTwitterLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TwitterWidgets {
  createTweet(
    tweetId: string,
    container: HTMLElement,
    options?: {
      align?: 'left' | 'center' | 'right';
      conversation?: 'all' | 'none';
    }
  ): Promise<HTMLElement | null>;
}

interface TwitterWindow extends Window {
  twttr?: {
    widgets: TwitterWidgets;
  };
}

// Add Twitter widgets script with error handling
const loadTwitterScript = () => {
  if ((window as TwitterWindow).twttr) return Promise.resolve(true);
  
  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

const TweetEmbed = ({ tweetId }: { tweetId: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const renderTweet = async () => {
      const scriptLoaded = await loadTwitterScript();
      if (!scriptLoaded) {
        setIsBlocked(true);
        return;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        try {
          const tweet = await (window as TwitterWindow).twttr?.widgets.createTweet(
            tweetId,
            containerRef.current,
            {
              align: 'center',
              conversation: 'none',
            }
          );
          
          if (!tweet) {
            setIsBlocked(true);
          }
        } catch (error) {
          console.error('Error rendering tweet:', error);
          setIsBlocked(true);
        }
      }
    };

    renderTweet();
  }, [tweetId]);

  if (isBlocked) {
    return (
      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          לא ניתן לטעון את הציוץ. ייתכן שחוסם פרסומות או הגדרות פרטיות מונעים את הטעינה.
        </AlertDescription>
      </Alert>
    );
  }

  return <div ref={containerRef} />;
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

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuthUrl, getOAuth2Client, addEventToCalendar } from '@/utils/googleCalendar';
import { ScheduleItem } from './scheduleData';

interface GoogleCalendarSyncProps {
  dayName: string;
  scheduleItem: ScheduleItem;
}

export function GoogleCalendarSync({ dayName, scheduleItem }: GoogleCalendarSyncProps) {
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      // Get auth URL and redirect user to Google consent screen
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      toast({
        title: 'שגיאה בסנכרון',
        description: 'לא ניתן לסנכרן עם Google Calendar כרגע',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-2"
      onClick={handleSync}
    >
      <Calendar className="h-4 w-4 mr-2" />
      סנכרן ל-Google Calendar
    </Button>
  );
}
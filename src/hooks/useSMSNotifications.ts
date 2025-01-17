import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SendSMSParams {
  phoneNumber: string;
  message: string;
}

export const useSMSNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendSMS = async ({ phoneNumber, message }: SendSMSParams) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { phoneNumber, message }
      });

      if (error) throw error;

      toast({
        title: "הודעה נשלחה בהצלחה",
        description: "ההודעה נשלחה למספר " + phoneNumber,
      });

      return data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בשליחת ההודעה",
        description: error.message || "אירעה שגיאה בשליחת ההודעה",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendSMS,
    isLoading
  };
};
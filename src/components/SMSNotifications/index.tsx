import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSMSNotifications } from '@/hooks/useSMSNotifications';

export function SMSNotifications() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const { sendSMS, isLoading } = useSMSNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !message) return;

    try {
      await sendSMS({ phoneNumber, message });
      // נקה את הטופס אחרי שליחה מוצלחת
      setPhoneNumber('');
      setMessage('');
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>שלח הודעת SMS</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">מספר טלפון</label>
            <Input
              id="phone"
              type="tel"
              placeholder="הכנס מספר טלפון"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">תוכן ההודעה</label>
            <Input
              id="message"
              placeholder="הכנס את תוכן ההודעה"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !phoneNumber || !message}
          >
            {isLoading ? 'שולח...' : 'שלח הודעה'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
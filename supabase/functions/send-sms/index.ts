import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  phoneNumber: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    console.log('Checking Twilio credentials...');
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio credentials');
      throw new Error('Missing Twilio credentials');
    }

    const { phoneNumber, message }: SMSRequest = await req.json();
    console.log('Received request to send SMS:', { phoneNumber, message });

    if (!phoneNumber || !message) {
      console.error('Missing required fields');
      throw new Error('Missing required fields');
    }

    // Format phone number to E.164 format if it's an Israeli number
    const formattedPhoneNumber = phoneNumber.startsWith('0') 
      ? `+972${phoneNumber.substring(1)}` 
      : phoneNumber;

    console.log('Sending SMS to:', formattedPhoneNumber);
    
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      },
      body: new URLSearchParams({
        To: formattedPhoneNumber,
        From: TWILIO_PHONE_NUMBER,
        Body: message,
      }),
    });

    const result = await response.json();
    console.log('Twilio API response:', result);

    if (!response.ok) {
      console.error('Twilio API error:', result);
      throw new Error('Failed to send SMS');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
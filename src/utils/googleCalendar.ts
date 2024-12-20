import { google } from 'googleapis';
import { supabase } from '@/integrations/supabase/client';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export const getOAuth2Client = async () => {
  const { data: { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } } = await supabase
    .functions.invoke('get-google-credentials');

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${window.location.origin}/auth/google/callback`
  );
};

export const getAuthUrl = async () => {
  const oauth2Client = await getOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
};

export const addEventToCalendar = async (auth: any, eventDetails: {
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}) => {
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: eventDetails.title,
    start: {
      dateTime: eventDetails.startTime,
      timeZone: 'Asia/Jerusalem',
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: 'Asia/Jerusalem',
    },
    description: eventDetails.description,
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};
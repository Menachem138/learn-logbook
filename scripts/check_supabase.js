import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://shjwvwhijgehquuteekv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NzUwMTUsImV4cCI6MjA0OTM1MTAxNX0.LPqNr6-y38ZsjD9FrBwysFd9G0J417xNd67h5OPGeXE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkPolicies() {
  try {
    // Sign in with provided credentials
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'masterai.digital@gmail.com',
      password: 'TTsghn5896'
    });

    if (signInError) {
      console.error('Auth error:', signInError);
      return;
    }

    console.log('Auth successful:', authData);

    // Try to select videos
    const { data: selectData, error: selectError } = await supabase
      .from('youtube_videos')
      .select('*');

    console.log('Select response:', { data: selectData, error: selectError });

    // Try to insert a test video
    const { data: insertData, error: insertError } = await supabase
      .from('youtube_videos')
      .insert([{
        video_id: 'test123',
        title: 'Test Video',
        thumbnail_url: 'https://example.com/thumb.jpg',
        url: 'https://youtube.com/test',
        user_id: authData.user.id
      }])
      .select();

    console.log('Insert response:', { data: insertData, error: insertError });
  } catch (err) {
    console.error('Error:', err);
  }
}

checkPolicies();

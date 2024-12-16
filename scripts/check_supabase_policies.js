import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://shjwvwhijgehquuteekv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NzUwMTUsImV4cCI6MjA0OTM1MTAxNX0.LPqNr6-y38ZsjD9FrBwysFd9G0J417xNd67h5OPGeXE'
);

async function checkPolicies() {
  try {
    // First, authenticate the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'masterai.digital@gmail.com',
      password: 'TTsghn5896'
    });

    if (authError) {
      console.error('Authentication error:', authError);
      return;
    }

    console.log('Successfully authenticated:', authData.user);

    // Try to get the RLS policies
    const { data: policies, error: policiesError } = await supabase
      .from('youtube_videos')
      .select()
      .limit(1);

    console.log('Policies test result:', { data: policies, error: policiesError });

    // Try to insert a test video
    const { data: insertData, error: insertError } = await supabase
      .from('youtube_videos')
      .insert([
        {
          video_id: 'test123',
          title: 'Test Video',
          thumbnail_url: 'https://example.com/thumb.jpg',
          url: 'https://youtube.com/watch?v=test123',
          user_id: authData.user.id
        }
      ])
      .select();

    console.log('Insert test result:', { data: insertData, error: insertError });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkPolicies();

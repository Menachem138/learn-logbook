import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const initSupabase = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export const fetchUserData = async (supabase: any, userId: string) => {
  console.log('Fetching user data from Supabase...')
  
  const [journalEntries, timerSessions, studyGoals, courseProgress, contentItems] = await Promise.all([
    supabase.from('learning_journal')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('timer_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('started_at', { ascending: false }),
    supabase.from('study_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .limit(3),
    supabase.from('course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true),
    supabase.from('content_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  return {
    journalEntries,
    timerSessions,
    studyGoals,
    courseProgress,
    contentItems
  }
}
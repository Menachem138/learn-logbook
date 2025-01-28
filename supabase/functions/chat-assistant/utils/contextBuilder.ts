interface TimerSession {
  type: 'study' | 'break';
  duration: number;
  started_at: string;
  ended_at?: string;
}

interface TimerStats {
  studyTime: number;
  breakTime: number;
  sessions: TimerSession[];
}

export const calculateTimerStats = (timerSessions: TimerSession[]): TimerStats => {
  const stats = timerSessions.reduce((acc, session) => {
    if (session.type === 'study') {
      acc.studyTime += session.duration || 0
    } else if (session.type === 'break') {
      acc.breakTime += session.duration || 0
    }
    acc.sessions.push(session)
    return acc
  }, { studyTime: 0, breakTime: 0, sessions: [] })

  return stats
}

interface JournalEntry {
  content: string;
  created_at: string;
}

interface StudyGoal {
  title: string;
  description: string;
  deadline?: string;
}

interface ContentItem {
  title: string;
  type: string;
  cloudinary_url: string;
  created_at: string;
}

interface UserData {
  timerSessions: { data: TimerSession[] };
  journalEntries: { data: JournalEntry[] };
  studyGoals: { data: StudyGoal[] };
  courseProgress: { data: unknown[] };
  contentItems: { data: ContentItem[] };
}

export const buildContext = (userData: UserData) => {
  const timerStats = calculateTimerStats(userData.timerSessions.data || [])
  
  const studyHours = Math.floor(timerStats.studyTime / (1000 * 60 * 60))
  const studyMinutes = Math.floor((timerStats.studyTime % (1000 * 60 * 60)) / (1000 * 60))
  const breakHours = Math.floor(timerStats.breakTime / (1000 * 60 * 60))
  const breakMinutes = Math.floor((timerStats.breakTime % (1000 * 60 * 60)) / (1000 * 60))

  return {
    studyTime: `${studyHours} hours and ${studyMinutes} minutes`,
    breakTime: `${breakHours} hours and ${breakMinutes} minutes`,
    recentJournalEntries: userData.journalEntries.data?.map((entry: JournalEntry) => ({
      content: entry.content,
      date: new Date(entry.created_at).toLocaleDateString()
    })) || [],
    activeGoals: userData.studyGoals.data?.map((goal: StudyGoal) => ({
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'
    })) || [],
    completedLessons: userData.courseProgress.data?.length || 0,
    recentContent: userData.contentItems.data?.map((item: ContentItem) => ({
      title: item.title,
      type: item.type,
      url: item.cloudinary_url,
      created: new Date(item.created_at).toLocaleDateString()
    })) || []
  }
}

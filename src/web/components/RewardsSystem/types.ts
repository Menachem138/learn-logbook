export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  type: 'badge' | 'trophy' | 'star';
  earned_at: string;
  created_at: string;
  user_id: string;
}
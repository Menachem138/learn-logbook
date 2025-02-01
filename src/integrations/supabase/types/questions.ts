export interface Question {
  id: string;
  user_id: string;
  content: string;
  answer: string | null;
  is_answered: boolean;
  created_at: string;
}

export interface QuestionInsert {
  user_id: string;
  content: string;
  answer?: string | null;
  is_answered?: boolean;
}

export interface QuestionUpdate {
  content?: string;
  answer?: string | null;
  is_answered?: boolean;
}
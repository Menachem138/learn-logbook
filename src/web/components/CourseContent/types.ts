export interface Lesson {
  title: string;
  duration: string;
  completed: boolean;
}

export interface Section {
  title: string;
  lessons: Lesson[];
}
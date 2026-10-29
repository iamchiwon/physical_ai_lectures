export type Difficulty = "입문" | "중급" | "심화";

export type CalloutTone = "concept" | "tip" | "warning";

export interface LessonCallout {
  title: string;
  body: string;
  tone: CalloutTone;
}

export interface CodeExample {
  language: "python" | "cpp" | "bash" | "yaml";
  content: string;
  caption?: string;
}

export interface ContentSection {
  heading: string;
  body?: string;
  bullets?: string[];
  callout?: LessonCallout;
  code?: CodeExample;
}

export interface MultipleChoiceCheck {
  id: string;
  type: "multiple-choice";
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ShortAnswerCheck {
  id: string;
  type: "short-answer";
  question: string;
  answer: string;
  acceptedKeywords: string[];
  explanation: string;
}

export type QuickCheck = MultipleChoiceCheck | ShortAnswerCheck;

export interface Lesson {
  id: string;
  chapter: number;
  order: number;
  title: string;
  duration: number;
  difficulty: Difficulty;
  summary: string;
  objectives: string[];
  sections: ContentSection[];
  quickCheck: QuickCheck[];
  keywords: string[];
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface CourseStats {
  moduleCount: number;
  lessonCount: number;
  totalMinutes: number;
  questionCount: number;
}

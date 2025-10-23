export type Likert5 = 1 | 2 | 3 | 4 | 5;

export interface DealBreakerFlag {
  isDealBreaker: boolean;
  note?: string;
}

export interface SectionAnswer {
  id: string;
  label: string;
  value: string | number | boolean | Likert5 | string[];
  meta?: {
    unit?: '°C' | 'months' | 'days' | 'guests/mo' | 'time-24h';
    endpoints?: [string, string];
  };
  dealBreaker?: DealBreakerFlag;
}

export interface Section {
  id: string;
  title: string;
  whyItMatters: string;
  answers: SectionAnswer[];
}

export interface QuestionnaireResult {
  generatedAtISO: string;
  student: { name: string; email?: string };
  sections: Section[];
}

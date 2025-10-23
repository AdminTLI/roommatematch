import type { QuestionnaireResult, SectionAnswer } from '@/types/report';

export const toTime24 = (s?: string | number): string => {
  if (!s) return '';
  const num = typeof s === 'string' ? parseInt(s, 10) : s;
  if (isNaN(num)) return '';
  
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const withUnit = (v: number, unit: string): string => `${v} ${unit}`;

export const clampMonths = (m: number): number => Math.max(1, Math.min(m, 24));

export const toRange = (v: number, pad = 1): [number, number] => [
  Math.max(0, v - pad),
  v + pad
];

export function normalizeSections(raw: QuestionnaireResult): QuestionnaireResult {
  return {
    ...raw,
    sections: raw.sections.map(section => ({
      ...section,
      answers: section.answers.map(normalizeAnswer)
    }))
  };
}

function normalizeAnswer(answer: SectionAnswer): SectionAnswer {
  const { value, meta } = answer;
  
  let normalizedValue = value;
  
  // Normalize time values
  if (meta?.unit === 'time-24h' && typeof value === 'number') {
    normalizedValue = toTime24(value);
  }
  
  // Add units to numeric values
  if (typeof value === 'number' && meta?.unit) {
    if (meta.unit === '€/month') {
      normalizedValue = withUnit(value, '€/month');
    } else if (meta.unit === 'guests/mo') {
      normalizedValue = withUnit(value, 'guests/month');
    } else if (meta.unit === 'minutes') {
      normalizedValue = withUnit(value, 'minutes');
    }
  }
  
  // Clamp extreme values
  if (typeof value === 'number') {
    if (answer.id.includes('budget') && value > 2000) {
      normalizedValue = '€2000+/month';
    } else if (answer.id.includes('guests') && value > 20) {
      normalizedValue = '20+ guests/month';
    } else if (answer.id.includes('commute') && value > 120) {
      normalizedValue = '120+ minutes';
    }
  }
  
  return {
    ...answer,
    value: normalizedValue
  };
}

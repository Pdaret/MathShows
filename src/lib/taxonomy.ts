// Single registry for the filter layers. Pure data, no Astro imports (content.config.ts uses it too).
// New article needs a new subject/format? Add one line here; the frontmatter schema picks it up.

/** موضوع: مقاله درباره‌ی چه حوزه‌ای است. */
export const SUBJECTS = {
  math: "ریاضی",
  engineering: "مهندسی",
  physics: "فیزیک",
  chemistry: "شیمی",
  cs: "علوم کامپیوتر",
} as const;

/** نوع تجربه: مقاله چطور یاد می‌دهد. */
export const FORMATS = {
  interactive: "تعاملی",
  animation: "انیمیشن",
  calculator: "ماشین‌حساب",
  intuitive: "شهودی",
  derivation: "استخراج و اثبات",
} as const;

export const LEVELS = {
  beginner: "مقدماتی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
} as const;

export type Subject = keyof typeof SUBJECTS;
export type Format = keyof typeof FORMATS;
export type Level = keyof typeof LEVELS;

const keys = <T extends object>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];
export const SUBJECT_KEYS = keys(SUBJECTS);
export const FORMAT_KEYS = keys(FORMATS);
export const LEVEL_KEYS = keys(LEVELS);

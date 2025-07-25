export type Locale = (typeof locales)[number];

export const locales = ['en', 'th'] as const;
export const defaultLocale: Locale = 'en';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en'
});

export type Locale = (typeof routing)['locales'][number]

// Keep backward compatibility
export const i18n = {
  defaultLocale: 'en' as const,
  locales: ['en', 'ar'] as const,
}
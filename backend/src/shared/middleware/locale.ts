import { Context, Next } from 'hono';

export type SupportedLocale = 'en' | 'ar';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'ar'];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * Middleware to detect and set the user's preferred locale
 * Priority: 
 * 1. Query parameter (?lang=ar)
 * 2. Accept-Language header
 * 3. Default to 'en'
 */
export async function localeMiddleware(c: Context, next: Next) {
  // Check query parameter first
  const queryLang = c.req.query('lang') as SupportedLocale;
  if (queryLang && SUPPORTED_LOCALES.includes(queryLang)) {
    c.set('locale', queryLang);
    return next();
  }

  // Check Accept-Language header
  const acceptLanguage = c.req.header('Accept-Language');
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "ar,en;q=0.9,en-US;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .map(lang => lang.split('-')[0]); // Remove country code (en-US -> en)

    // Find the first supported language
    const preferredLang = languages.find(lang => 
      SUPPORTED_LOCALES.includes(lang as SupportedLocale)
    ) as SupportedLocale;

    if (preferredLang) {
      c.set('locale', preferredLang);
      return next();
    }
  }

  // Default to English
  c.set('locale', DEFAULT_LOCALE);
  return next();
}

/**
 * Helper function to get localized content from translation object
 */
export function getLocalizedContent(
  translations: { en: string; ar: string } | null | undefined,
  locale: SupportedLocale,
  fallback: string = ''
): string {
  if (!translations) return fallback;
  
  return translations[locale] || translations[DEFAULT_LOCALE] || fallback;
}

/**
 * Helper function to create translation object
 */
export function createTranslation(en: string, ar: string) {
  return { en, ar };
}
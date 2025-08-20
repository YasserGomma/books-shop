import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n.config';
 
export default getRequestConfig(async ({ requestLocale }) => {
  // This function runs on the server for each request.
  let locale = await requestLocale;
  
  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
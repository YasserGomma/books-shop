import { auth } from '@/lib/auth'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n.config'

const intlMiddleware = createMiddleware(routing)

export default auth((req) => {
  // Run the internationalization middleware
  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
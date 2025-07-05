import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Since we can't use cookies-next, use Next.js built-in cookies API instead
// Note: The usage will need to be updated in the middleware function accordingly
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = cookies().get('auth_token')?.value;

  // Protect dashboard route
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
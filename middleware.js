import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/doctors(.*)',
  '/onboarding(.*)',
  '/doctor(.*)',
  '/admin(.*)',
  '/video-call(.*)',
  '/appointments(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/doctors(.*)',
    '/onboarding(.*)',
    '/doctor(.*)',
    '/admin(.*)',
    '/video-call(.*)',
    '/appointments(.*)',
     '/api/(.*)',
     '/((?!_next|favicon.ico|logo.png|images|public).*)',
  ],
};

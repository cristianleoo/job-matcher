import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, redirectToSignIn } = auth();

    // If the user is not signed in and the route is protected, redirect to sign in
    if (!userId && isProtectedRoute(req)) {
        return redirectToSignIn({ returnBackUrl: "/" });
    }

    if (userId && isProtectedRoute(req)) {
        return NextResponse.next();

    }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
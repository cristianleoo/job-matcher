import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Protect all routes except for those that are explicitly allowed
const isProtectedRoute = (req: NextRequest) => {
    const publicRoutes = ['/api/auth', '/_next', '/favicon.ico']; // Add any public routes here
    return !publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));
};

export default clerkMiddleware(async (auth, req) => {
    const { userId, getToken, redirectToSignIn } = auth();

    // Check if the user is not authenticated and is trying to access a protected route
    if (!userId && isProtectedRoute(req)) {
        return redirectToSignIn({ returnBackUrl: req.nextUrl.pathname });
    }

    if (userId && isProtectedRoute(req)) {
        try {
            const token = await getToken();
            const response = await fetch(`${req.nextUrl.origin}/api/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                console.error('Error from /api/auth:', await response.text());
                return NextResponse.next();
            }

            const data = await response.json();
            console.log('User data:', data);

        } catch (error) {
            console.error('Error calling /api/auth:', error);
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, getToken, redirectToSignIn } = auth();

    if (!userId && isProtectedRoute(req)) {
        return redirectToSignIn({ returnBackUrl: "/" });
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
                // You might want to handle this error case differently
                return NextResponse.next();
            }

            const data = await response.json();
            console.log('User data:', data);

            // You can do something with the user data here if needed

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
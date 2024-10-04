"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Header() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-white shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-bold">JobifAI</span>
      </Link>
      <nav>
        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.firstName || user.username}!</span>
            <Link href="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="flex gap-2">
            <SignInButton mode="modal">
              <Button variant="ghost">Log in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Sign up</Button>
            </SignUpButton>
          </div>
        )}
      </nav>
    </header>
  );
}
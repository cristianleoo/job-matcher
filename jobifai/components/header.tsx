"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              JobifAI
            </Link>
            <div className="hidden ml-10 space-x-8 lg:block">
              <Link href="/chat" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Chat
              </Link>
              <Link href="/job-search" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Job Search
              </Link>
              <Link href="/applications" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Applications
              </Link>
              <Link href="/dashboard" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
          <div className="ml-10 flex items-center space-x-4">
            <Link href="/profile" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Profile
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>
    </header>
  );
}
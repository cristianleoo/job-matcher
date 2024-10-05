"use client";

import { ApplicationTracker } from "@/components/application-tracker";

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Application Tracker</h1>
      <ApplicationTracker />
    </div>
  );
}
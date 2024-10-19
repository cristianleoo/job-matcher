"use client";

import { ApplicationTracker } from "@/components/application-tracker";

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-3xl font-bold mb-6">Job Applications</h1> */}
      <ApplicationTracker />
    </div>
  );
}
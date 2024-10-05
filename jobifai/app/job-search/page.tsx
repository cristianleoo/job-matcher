"use client";

import { JobSearch } from "@/components/job-search";

export default function JobSearchPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Job Search</h1>
      <JobSearch />
    </div>
  );
}
"use client";

import { ApplicationDashboard } from "@/components/application-dashboard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Application Dashboard</h1>
      <ApplicationDashboard />
    </div>
  );
}
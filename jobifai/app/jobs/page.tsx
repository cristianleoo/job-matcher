"use client";

import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/userStore';

interface Job {
  id: string;
  title: string;
  company: string;
  status: string;
  applied_date: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!supabaseUserId) {
        console.log('Waiting for Supabase user ID...');
        return;
      }

      try {
        console.log('Fetching jobs with Supabase user ID:', supabaseUserId);
        const response = await fetch(`/api/jobs?supabaseUserId=${supabaseUserId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, [supabaseUserId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Job Applications</h1>
      {supabaseUserId ? (
        jobs.length === 0 ? (
          <p className="text-gray-600">No job applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Title</th>
                  <th className="py-2 px-4 border-b text-left">Company</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job: Job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{job.title}</td>
                    <td className="py-2 px-4 border-b">{job.company}</td>
                    <td className="py-2 px-4 border-b">{job.status}</td>
                    <td className="py-2 px-4 border-b">{new Date(job.applied_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <p className="text-gray-600">Loading user data...</p>
      )}
    </div>
  );
}
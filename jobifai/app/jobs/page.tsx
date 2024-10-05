"use client";

import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/userStore';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: string;
  status: string;
  applied_date: string;
}

export default function JobsPage() {
  console.log('JobsPage component rendered'); // Step 1: Verify component rendering

  const [jobs, setJobs] = useState<Job[]>([]);
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);

  useEffect(() => {
    if (supabaseUserId) {
      fetchJobs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseUserId]);

  const fetchJobs = async () => {
    if (!supabaseUserId) {
      console.log('Waiting for Supabase user ID...');
      return;
    }

    try {
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
      console.log('Jobs fetched:', data); // Step 2: Check if jobs are being fetched
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!supabaseUserId) return;

    try {
      const response = await fetch(`/api/jobs?jobId=${jobId}&supabaseUserId=${supabaseUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      // Refresh the job list after successful deletion
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Job Applications</h1>
      {jobs.length === 0 ? (
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
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job: Job) => {
                console.log('Rendering job:', job); // Step 3: Inspect table rendering
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{job.title}</td>
                    <td className="py-2 px-4 border-b">{job.company}</td>
                    <td className="py-2 px-4 border-b">{job.status}</td>
                    <td className="py-2 px-4 border-b">{new Date(job.applied_date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <Link href={`/jobs/${job.id}`} passHref>
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                            View
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
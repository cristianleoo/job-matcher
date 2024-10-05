"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/lib/userStore';
import Link from 'next/link';

interface JobDetails {
  id: string;
  title: string;
  company: string;
  status: string;
  applied_date: string;
  description: string;
  location: string;
  job_url: string;
}

export default function JobDetailsPage() {
  const [job, setJob] = useState<JobDetails | null>(null);
  const { id } = useParams();
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);

  const fetchJobDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${id}?supabaseUserId=${supabaseUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  }, [supabaseUserId, id]);

  useEffect(() => {
    if (supabaseUserId) {
      fetchJobDetails();
    }
  }, [supabaseUserId, id, fetchJobDetails]);

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
      <h2 className="text-xl font-semibold mb-2">{job.company}</h2>
      <p className="mb-2">Location: {job.location}</p>
      <p className="mb-2">Status: {job.status}</p>
      <p className="mb-2">Applied Date: {new Date(job.applied_date).toLocaleDateString()}</p>
      <h3 className="text-lg font-semibold mt-4 mb-2">Job Description:</h3>
      <p className="mb-4">{job.description}</p>
      <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
        View Original Job Posting
      </a>
      <div className="mt-8">
        <Link href="/jobs">
          <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Back to Job List
          </button>
        </Link>
      </div>
    </div>
  );
}
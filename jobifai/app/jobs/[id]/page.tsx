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
  location: string;
  employment_type: string;
  experience_level: string;
  remote_type: string;
  skills: string[] | null;
  responsibilities: string[] | null;
  requirements: string[] | null;
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
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="font-semibold">Location:</p>
          <p>{job.location || 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Status:</p>
          <p>{job.status || 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Applied Date:</p>
          <p>{job.applied_date ? new Date(job.applied_date).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Employment Type:</p>
          <p>{job.employment_type || 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Experience Level:</p>
          <p>{job.experience_level || 'N/A'}</p>
        </div>
        <div>
          <p className="font-semibold">Remote Type:</p>
          <p>{job.remote_type || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Skills:</h3>
        {job.skills && job.skills.length > 0 ? (
          <ul className="list-disc list-inside">
            {job.skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        ) : (
          <p>No skills listed</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Responsibilities:</h3>
        {job.responsibilities && job.responsibilities.length > 0 ? (
          <ul className="list-disc list-inside">
            {job.responsibilities.map((responsibility, index) => (
              <li key={index}>{responsibility}</li>
            ))}
          </ul>
        ) : (
          <p>No responsibilities listed</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Requirements:</h3>
        {job.requirements && job.requirements.length > 0 ? (
          <ul className="list-disc list-inside">
            {job.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        ) : (
          <p>No requirements listed</p>
        )}
      </div>

      <div className="mt-8">
        <Link href="/applications">
          <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Back to Job List
          </button>
        </Link>
      </div>
    </div>
  );
}
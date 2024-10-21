"use client";

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/lib/userStore';

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
  original_content: string | null;
  [key: string]: string | string[] | null;
}

export default function JobDetailsPage() {
  const [job, setJob] = useState<JobDetails | null>(null);
  const [showOriginalContent, setShowOriginalContent] = useState(false);
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

  const toggleOriginalContent = () => {
    setShowOriginalContent(!showOriginalContent);
  };

  useEffect(() => {
    if (supabaseUserId) {
      fetchJobDetails();
    }
  }, [supabaseUserId, id, fetchJobDetails]);

  if (!job) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <h2 className="text-xl text-gray-600 mb-4">{job.company}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: "Location", value: job.location },
              { label: "Status", value: job.status },
              { label: "Applied Date", value: job.applied_date ? new Date(job.applied_date).toLocaleDateString() : 'N/A' },
              { label: "Employment Type", value: job.employment_type },
              { label: "Experience Level", value: job.experience_level },
              { label: "Remote Type", value: job.remote_type },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-1">{value || 'N/A'}</p>
              </div>
            ))}
          </div>

          {['Skills', 'Responsibilities', 'Requirements'].map((section) => (
            <div key={section} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{section}:</h3>
              {job[section.toLowerCase() as keyof typeof job] && Array.isArray(job[section.toLowerCase() as keyof typeof job]) && (job[section.toLowerCase() as keyof typeof job] as string[]).length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {(job[section.toLowerCase() as keyof typeof job] as string[]).map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No {section.toLowerCase()} listed</p>
              )}
            </div>
          ))}

          {job.original_content && (
            <div className="mt-6">
              <button
                onClick={toggleOriginalContent}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out"
              >
                {showOriginalContent ? 'Hide Original Content' : 'Show Original Content'}
              </button>
              {showOriginalContent && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Original Job Posting:</h3>
                  <pre className="whitespace-pre-wrap text-sm">{job.original_content}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/applications">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1">
            Back to Job List
          </button>
        </Link>
      </div>
    </div>
  );
}

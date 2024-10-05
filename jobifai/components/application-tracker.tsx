"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useUserStore } from '@/lib/userStore';
import { AddJobForm } from './add-job-form';

interface JobApplication {
  id: string;
  title: string;
  company: string;
  status: string;
  applied_date: string;
}

export function ApplicationTracker() {
  const { isLoaded, userId } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!supabaseUserId) return;
    try {
      const response = await fetch(`/api/jobs?supabaseUserId=${supabaseUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, [supabaseUserId]);

  useEffect(() => {
    if (isLoaded && userId && supabaseUserId) {
      fetchApplications();
    }
  }, [isLoaded, userId, supabaseUserId, fetchApplications]);

  const handleDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs?jobId=${jobId}&supabaseUserId=${supabaseUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      // Refresh the application list after successful deletion
      fetchApplications();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleJobAdded = () => {
    setShowSuccessMessage(true);
    fetchApplications();
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add New Job Application</h2>
      <AddJobForm onJobAdded={handleJobAdded} />
      
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4 mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Job added successfully.</span>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4 mt-8">Your Applications</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.company}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app.applied_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link href={`/jobs/${app.id}`}>
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                        View
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
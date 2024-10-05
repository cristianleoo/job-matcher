"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useUserStore } from '@/lib/userStore';
import { AddJobForm } from './add-job-form';
import React from 'react';
import { FaLock } from 'react-icons/fa'; // Import the lock icon

interface JobApplication {
  id: string;
  title: string;
  company: string;
  status: string;
  applied_date: string;
  location: string;
  employment_type: string;
  experience_level: string;
  remote_type: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
}

export function ApplicationTracker() {
  const { isLoaded, userId } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'url'>('content');
  const [jobUrl, setJobUrl] = useState('');
  const [jobContent, setJobContent] = useState('');
  const [extractedJobInfo, setExtractedJobInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);

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

  const extractJobInfo = async (input: string, type: 'url' | 'content') => {
    setIsLoading(true);
    setShowJobForm(false);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Extract job information from this ${type === 'url' ? 'URL' : 'job posting content'}: ${input}

Please provide the following information in a JSON format:
{
  "job_title": "",
  "company": "",
  "location": "",
  "employment_type": "",
  "experience_level": "",
  "remote_type": "",
  "skills": [],
  "responsibilities": [],
  "requirements": []
}

Ensure all fields are filled, using "N/A" if the information is not available. For arrays, provide at least one item or ["N/A"] if no information is found.`,
          supabaseUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract job information');
      }

      const reader = response.body?.getReader();
      let result = '';
      while (true) {
        const { done, value } = (await reader?.read()) ?? { done: true, value: undefined };
        if (done) break;
        result += new TextDecoder().decode(value);
      }

      console.log('Raw response:', result); // Log raw response

      try {
        // Extract JSON from the response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in the response');
        }
        const jsonString = jsonMatch[0];
        const extractedInfo = JSON.parse(jsonString);
        console.log('Parsed extractedInfo:', extractedInfo);
        setExtractedJobInfo(extractedInfo);
        setShowJobForm(true);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        // If parsing fails, show the form with empty fields for manual input
        setExtractedJobInfo(null);
        setShowJobForm(true);
      }
    } catch (error) {
      console.error('Error extracting job information:', error);
      // If extraction fails, show the form with empty fields for manual input
      setExtractedJobInfo(null);
      setShowJobForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add New Job Application</h2>
      
      <div className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
        <button
          onClick={() => setActiveTab('content')}
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
            ${activeTab === 'content' ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}
        >
          Paste Content
        </button>
        <button
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-gray-400 cursor-not-allowed flex items-center justify-center`}
          title="Coming Soon"
        >
          Enter URL <FaLock className="ml-2" />
        </button>
      </div>

      {activeTab === 'content' && (
        <>
          <textarea
            value={jobContent}
            onChange={(e) => setJobContent(e.target.value)}
            placeholder="Paste job posting content here"
            className="w-full p-2 border rounded h-40"
          />
          <button
            onClick={() => extractJobInfo(jobContent, 'content')}
            className="mt-2 bg-blue-500 text-white p-2 rounded w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Extracting...' : 'Extract Job Info'}
          </button>
        </>
      )}

      {isLoading && (
        <div className="mt-4">
          <p>Extracting job information...</p>
        </div>
      )}

      {showJobForm && extractedJobInfo && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Extracted Job Information</h3>
          <AddJobForm onJobAdded={handleJobAdded} extractedJobInfo={extractedJobInfo} />
        </div>
      )}

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remote</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.employment_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.experience_level}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.remote_type}</td>
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
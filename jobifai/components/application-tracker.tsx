"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useUserStore } from '@/lib/userStore';
import { AddJobForm } from './add-job-form';
import React from 'react';
import { FaLock } from 'react-icons/fa'; // Import the lock icon
import { ResumeEditor } from './resume-editor';

interface JobApplication {
  id: string;
  title: string;
  company: string;
  status: string;
  applied_date: string;
  location: string;
  employment_type?: string;
  experience_level?: string;
  remote_type?: string;
  skills?: string[];
  responsibilities?: string[];
  requirements?: string[];
  job_url?: string;
  description: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface Education {
  institution: string;
  degree: string;
  graduationDate: string;
}

interface Project {
  name: string;
  description: string[];
  technologies: string[];
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
  const [showResumeEditor, setShowResumeEditor] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async () => {
      if (supabaseUserId) {
        try {
          const response = await fetch(`/api/user-profile?supabaseUserId=${supabaseUserId}`);
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data);
          } else {
            console.error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [supabaseUserId]);

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

  const handleJobAdded = async (jobData: JobApplication) => {
    try {
      console.log('Job data to be sent:', jobData); // Add this line for debugging

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobData,
          supabaseUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add job application');
      }

      const result = await response.json();
      console.log('Job added successfully:', result); // Add this line for debugging

      setShowSuccessMessage(true);
      fetchApplications();
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error adding job application:', error);
      if (error instanceof Error) {
        alert(error.message || 'Failed to add job application');
      } else {
        alert('Failed to add job application');
      }
    }
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
  "title": "", # this is the job title
  "company": "", # this is the company name
  "location": "", # this is the location of the job
  "employment_type": "", # this is the employment type of the job
  "experience_level": "", # this is the experience level of the job
  "remote_type": "", # this is the remote type of the job
  "skills": [], # this is the skills required for the job
  "responsibilities": [], # this is the responsibilities of the job
  "requirements": [], # this is the requirements of the job
  "job_url": "", # this is the URL of the job
  "description": "" # this is the description of the job
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

  const handleEditResume = (job: JobApplication) => {
    setSelectedJob(job);
    setShowResumeEditor(true);
  };

  const handleSaveResume = async (updatedResume: string) => {
    if (selectedJob && supabaseUserId) {
      try {
        const response = await fetch('/api/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabaseUserId,
            jobId: selectedJob.id,
            content: updatedResume,
          }),
        });

        if (response.ok) {
          alert('Resume saved successfully');
          setShowResumeEditor(false);
        } else {
          throw new Error('Failed to save resume');
        }
      } catch (error) {
        console.error('Error saving resume:', error);
        alert('Failed to save resume');
      }
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs`, { // Ensure the correct endpoint is used
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: jobId, // Ensure this is correctly named
          jobStatus: newStatus,
          supabaseUserId: supabaseUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update job status');
      }

      // Refresh the application list after successful update
      fetchApplications();
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-500 text-white';
      case 'Interview':
        return 'bg-yellow-500 text-white';
      case 'Offer':
        return 'bg-green-500 text-white';
      case 'Rejected':
        return 'bg-red-500 text-white';
      default:
        return '';
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
          <AddJobForm onJobAdded={(jobData) => {
            handleJobAdded({ ...jobData, id: Date.now().toString() }).catch(console.error);
          }} extractedJobInfo={extractedJobInfo} />
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`p-1 rounded ${getStatusColor(app.status)}`}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
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
                      onClick={() => handleEditResume(app)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Edit Resume
                    </button>
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

      {showResumeEditor && selectedJob && userProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-11/12 shadow-lg rounded-md bg-white">
            <h2 className="text-2xl font-bold mb-4">Edit Resume for {selectedJob.title}</h2>
            <ResumeEditor
              jobDescription={selectedJob.description}
              userProfile={{ 
                id: userProfile.id, 
                name: userProfile.name, 
                email: userProfile.email, 
                experiences: userProfile.experiences, // ... existing code ...
                education: userProfile.education, // Added missing property
                projects: userProfile.projects // Added missing property
              }}
              onSave={handleSaveResume}
            />
            <button
              onClick={() => setShowResumeEditor(false)}
              className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
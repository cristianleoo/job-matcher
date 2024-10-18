"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useUserStore } from '@/lib/userStore';
import { AddJobForm } from './add-job-form';
import React from 'react';
import { FaLock } from 'react-icons/fa'; // Import the lock icon
import { ResumeEditor } from './resume-editor';
import { motion } from 'framer-motion';
import { EyeIcon, PencilSquareIcon, TrashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

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
  const [showInterviewPlan, setShowInterviewPlan] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showParsedContent, setShowParsedContent] = useState(true);

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
      console.log('Job data to be sent:', jobData);

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobData,
          status: 'Not Applied', // Set default status to 'Not Applied'
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
      setShowParsedContent(false); // Hide the parsed content area
      setJobContent(''); // Clear the job content input
      setExtractedJobInfo(null); // Clear the extracted job info
      setShowJobForm(false); // Hide the job form
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
  "job_url": "", # this is the URL of the job. If the job is not found, please return an empty string.
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
      case 'Not Applied':
        return 'bg-purple-500 text-white';
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

  const handlePrepareInterview = (job: JobApplication) => {
    setSelectedJobId(job.id);
    setShowInterviewPlan(true);
  };

  const handleScrapeJobUrl = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scrape-linkedin-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape job data');
      }

      const jobData = await response.json();
      
      // Use the existing extractJobInfo function to parse the scraped content
      await extractJobInfo(jobData.description, 'content');
    } catch (error) {
      console.error('Error scraping job:', error);
      alert('Failed to scrape job data. Please try again.');
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
          onClick={() => setActiveTab('url')}
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
            ${activeTab === 'url' ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}
        >
          Enter URL
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

      {activeTab === 'url' && (
        <div>
          <input
            type="text"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="Enter LinkedIn job URL"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={() => handleScrapeJobUrl(jobUrl)}
            className="mt-2 bg-blue-500 text-white p-2 rounded w-full"
          >
            Scrape Job Info
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center mt-8">
          <div className="relative w-24 h-24">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full"
                style={{ borderTopColor: 'transparent' }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
          <p className="mt-4 text-lg font-semibold text-blue-600">Extracting job information...</p>
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
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-sm text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3">Title</th>
              <th scope="col" className="px-3 py-3 text-center">Company</th>
              <th scope="col" className="px-3 py-3 text-center">Location</th>
              <th scope="col" className="px-3 py-3 text-center">Type</th>
              <th scope="col" className="px-3 py-3 text-center">Experience</th>
              <th scope="col" className="px-3 py-3 text-center">Remote</th>
              <th scope="col" className="px-3 py-3 text-center">Status</th>
              <th scope="col" className="px-3 py-3 text-center">Applied Date</th>
              <th scope="col" className="px-3 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <tr key={app.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap">{app.title}</td>
                <td className="px-3 py-4 text-center">{app.company}</td>
                <td className="px-3 py-4 text-center">{app.location}</td>
                <td className="px-3 py-4 text-center">{app.employment_type}</td>
                <td className="px-3 py-4 text-center">{app.experience_level}</td>
                <td className="px-3 py-4 text-center">{app.remote_type}</td>
                <td className="px-3 py-4 text-center">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`p-2 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}
                  >
                    <option value="Not Applied">Not Applied</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-3 py-4 text-center">{new Date(app.applied_date).toLocaleDateString()}</td>
                <td className="px-3 py-4 text-center">
                  <div className="flex justify-center space-x-3">
                    <Link href={`/jobs/${app.id}`}>
                      <button className="text-blue-600 hover:text-blue-800" title="View Details">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleEditResume(app)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit Resume"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePrepareInterview(app)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Prepare Interview"
                    >
                      <AcademicCapIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Application"
                    >
                      <TrashIcon className="w-5 h-5" />
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

      {/* {showInterviewPlan && selectedJobId && (
        <InterviewPreparationPlan jobId={selectedJobId} onClose={() => setShowInterviewPlan(false)} />
      )} */}
    </div>
  );
}

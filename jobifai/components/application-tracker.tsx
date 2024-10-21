"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useUserStore } from '@/lib/userStore';
import { AddJobForm } from './add-job-form';
import React from 'react';
import { ResumeEditor } from './resume-editor';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, PencilSquareIcon, TrashIcon, AcademicCapIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { calculateCosineSimilarity } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface JobApplication {
  id?: string; // Make id optional
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
  similarity_score?: number;
  original_content?: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!supabaseUserId) return;
    try {
      const response = await fetch(`/api/jobs?supabaseUserId=${supabaseUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      console.log('Fetched applications:', data);
      const dataWithScores = await Promise.all(data.map(async (app: JobApplication) => {
        const similarityScore = userProfile
          ? await calculateCosineSimilarity(app.description, userProfile)
          : null;
        return {
          ...app,
          similarity_score: similarityScore
        };
      }));
      setApplications(dataWithScores);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, [supabaseUserId, userProfile]);

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
          original_content: jobContent,
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
    setIsDialogOpen(false);
    // Reset states at the beginning of extraction
    setShowJobForm(false);
    setExtractedJobInfo(null);
    setShowParsedContent(true);

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
  "title": "",
  "company": "",
  "location": "",
  "employment_type": "",
  "experience_level": "",
  "remote_type": "",
  "skills": [],
  "responsibilities": [],
  "requirements": [],
  "job_url": "",
  "description": ""
}

Ensure all fields are filled, using "N/A" if the information is not available. For arrays, provide at least one item or ["N/A"] if no information is found.`,
          supabaseUserId,
          original_content: jobContent,
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
        setShowParsedContent(true);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        // If parsing fails, show the form with empty fields for manual input
        setExtractedJobInfo(null);
        setShowJobForm(true);
        setShowParsedContent(false);
      }
    } catch (error) {
      console.error('Error extracting job information:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to extract job information: ${errorMessage}`);
      setExtractedJobInfo(null);
      setShowJobForm(true);
      setShowParsedContent(false);
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
    if (job.id) {
      setSelectedJobId(job.id);
      setShowInterviewPlan(true);
    } else {
      console.error('Job ID is undefined');
      // Optionally, you can show an error message to the user
    }
  };

  const handleScrapeJobUrl = async (url: string) => {
    setIsLoading(true);
    try {
      // Step 1: Scrape the job content from the URL
      const response = await fetch('/api/linkedin-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape job data');
      }

      const scrapedData = await response.json();
      
      // Step 2: Extract job info from the scraped content
      await extractJobInfo(scrapedData.description, 'content');
    } catch (error) {
      console.error('Error scraping job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to scrape job data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSimilarityScore = (score: number | undefined | null) => {
    if (score === undefined || score === null) return 'N/A';
    const percentage = Math.round(score * 100);
    
    return (
      <div className="w-12 h-12">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textSize: '28px',
            pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
            textColor: '#3e98c7',
            trailColor: '#d6d6d6',
          })}
        />
      </div>
    );
  };

  const handleClearExtraction = () => {
    setShowParsedContent(false);
    setJobContent('');
    setExtractedJobInfo(null);
    setShowJobForm(false);
    setJobUrl(''); // Also clear the URL input
  };

  const loadingCircleVariants = {
    start: {
      y: "0%"
    },
    end: {
      y: "100%"
    }
  };

  const loadingCircleTransition = {
    duration: 0.5,
    yoyo: Infinity,
    ease: "easeInOut"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2" onClick={() => setIsDialogOpen(true)}>
              <PlusIcon className="h-5 w-5" />
              <span>Add New Job</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[1800px] w-[98vw]">
            <DialogHeader>
              <DialogTitle>Add New Job Application</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="content" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Paste Content</TabsTrigger>
                <TabsTrigger value="url">Enter URL</TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <textarea
                  value={jobContent}
                  onChange={(e) => setJobContent(e.target.value)}
                  placeholder="Paste job posting content here"
                  className="w-full p-2 border rounded h-40 mt-4"
                />
                <Button 
                  onClick={() => extractJobInfo(jobContent, 'content')}
                  className="w-full mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Extracting...' : 'Extract Job Info'}
                </Button>
              </TabsContent>
              <TabsContent value="url">
                <Input
                  type="text"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="Enter LinkedIn job URL"
                  className="w-full mt-4"
                />
                <Button 
                  onClick={() => handleScrapeJobUrl(jobUrl)}
                  className="w-full mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Scraping...' : 'Scrape Job Info'}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <AnimatePresence>
        {showJobForm && extractedJobInfo && showParsedContent && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            <Card className="mb-8 shadow-lg border-t-4 border-blue-500">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-700">Add Job Application</CardTitle>
              </CardHeader>
              <CardContent>
                <AddJobForm onJobAdded={handleJobAdded} extractedJobInfo={extractedJobInfo} />
                <Button 
                  onClick={handleClearExtraction} 
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white transition-colors duration-300"
                >
                  Clear Extraction
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md mb-4"
            role="alert"
          >
            <p className="font-bold">Success!</p>
            <p>Job added successfully.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Title</th>
                  <th scope="col" className="px-6 py-3">Company</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Applied Date</th>
                  <th scope="col" className="px-6 py-3">Match</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{app.title}</td>
                    <td className="px-6 py-4">{app.company}</td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id ?? '', e.target.value)}
                        className={`p-2 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}
                      >
                        <option value="Not Applied">Not Applied</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">{new Date(app.applied_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12">
                        {renderSimilarityScore(app.similarity_score)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link href={`/jobs/${app.id}`}>
                          <Button variant="outline" size="icon" title="View Details">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="icon" title="Edit Resume" onClick={() => handleEditResume(app)}>
                          <PencilSquareIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" title="Prepare Interview" onClick={() => handlePrepareInterview(app)}>
                          <AcademicCapIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" title="Delete Application" onClick={() => handleDelete(app.id ?? '')}>
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showResumeEditor && selectedJob && userProfile && (
        <Dialog open={showResumeEditor} onOpenChange={setShowResumeEditor}>
          <DialogContent className="max-w-7xl">
            <DialogHeader>
              <DialogTitle>Edit Resume for {selectedJob.title}</DialogTitle>
            </DialogHeader>
            <ResumeEditor
              jobDescription={selectedJob.description}
              userProfile={userProfile}
              onSave={handleSaveResume}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* {showInterviewPlan && selectedJobId && (
        <InterviewPreparationPlan jobId={selectedJobId} onClose={() => setShowInterviewPlan(false)} />
      )} */}

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-lg shadow-2xl flex flex-col items-center space-y-4"
            >
              <div className="flex space-x-2">
                {[0, 1, 2].map((index) => (
                  <motion.span
                    key={index}
                    variants={loadingCircleVariants}
                    transition={loadingCircleTransition}
                    animate="end"
                    initial="start"
                    className="w-4 h-4 bg-blue-500 rounded-full"
                    style={{
                      transformOrigin: "center center",
                    }}
                  />
                ))}
              </div>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-semibold text-gray-700"
              >
                Extracting job info...
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

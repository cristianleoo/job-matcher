"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from 'next/link';

interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  status: string;
  applied_date: string;
  job_url: string;
  notes: string;
  description: string;
}

export default function JobDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/jobs/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        const data = await response.json();
        setJob(data);
        setNotes(data.notes || '');
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const updateNotes = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) {
        throw new Error('Failed to update notes');
      }
      alert('Notes updated successfully');
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Failed to update notes');
    }
  };

  const deleteJob = async () => {
    if (confirm('Are you sure you want to delete this job application?')) {
      try {
        const response = await fetch(`/api/jobs/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete job application');
        }
        alert('Job application deleted successfully');
        router.push('/applications');
      } catch (error) {
        console.error('Error deleting job application:', error);
        alert('Failed to delete job application');
      }
    }
  };

  if (isLoading) {
    return <div>Loading job details...</div>;
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{job.title}</h1>
      <p className="text-xl mb-2">{job.company}</p>
      <p className="mb-4">{job.location}</p>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Job Description</h2>
        <div dangerouslySetInnerHTML={{ __html: job.description }} />
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Application Status</h2>
        <p>{job.status}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Your Notes</h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="w-full mb-2"
          placeholder="Add your personal notes about this job application here..."
        />
        <Button onClick={updateNotes}>Update Notes</Button>
      </div>
      <div className="flex space-x-4">
        <Link href={job.job_url} target="_blank" rel="noopener noreferrer">
          <Button>View Original Job Posting</Button>
        </Link>
        <Button variant="destructive" onClick={deleteJob}>Delete Job Application</Button>
      </div>
    </div>
  );
}
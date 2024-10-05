"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Job {
  title: string;
  company: string;
  location: string;
  link: string;
  remote: boolean;
  jobTypes: string[];
  tags: string[];
}

export function JobSearch() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/job-search?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
      const data = await response.json();
      console.log('Data received:', data); // Add this line
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Jobs state updated:', jobs);
  }, [jobs]);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Job keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Button onClick={searchJobs} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search Jobs'}
        </Button>
      </div>
      <div className="space-y-4">
        {jobs.length === 0 && <p>No jobs found.</p>}
        {jobs.map((job, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <h3 className="font-bold text-lg">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company} - {job.location}</p>
            <p className="mt-2">
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${job.remote ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                {job.remote ? 'Remote' : 'On-site'}
              </span>
              {job.jobTypes.map((type, i) => (
                <span key={i} className="ml-2 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-800">
                  {type}
                </span>
              ))}
            </p>
            <div className="mt-2">
              {job.tags.map((tag, i) => (
                <span key={i} className="inline-block mr-2 mb-2 px-2 py-1 text-xs bg-gray-100 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <a href={job.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-blue-500 hover:underline">
              View Job
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
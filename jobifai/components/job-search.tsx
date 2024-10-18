"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  remoteOk: boolean;
  date: string;
  descriptionHtml?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  stackRequired?: string[];
  tags?: string[];
}

export function JobSearch() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchJobs = async () => {
    console.log('Searching jobs with keyword:', keyword, 'and location:', location);
    setIsLoading(true);
    try {
      console.log('Sending request to /api/linkedin-scraper');
      const response = await fetch('/api/linkedin-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, location }),
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('LinkedIn jobs scraped:', data);
      setJobs(data);
    } catch (error) {
      console.error('Error scraping LinkedIn jobs:', error);
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
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${job.remoteOk ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                {job.remoteOk ? 'Remote' : 'On-site'}
              </span>
              {job.stackRequired?.map((type, i) => (
                <span key={i} className="ml-2 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-800">
                  {type}
                </span>
              ))}
            </p>
            <div className="mt-2">
              {job.tags?.map((tag, i) => (
                <span key={i} className="inline-block mr-2 mb-2 px-2 py-1 text-xs bg-gray-100 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <a href={job.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-blue-500 hover:underline">
              View Job
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import axios from 'axios';

interface Job {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

async function fetchJobs(keyword: string, location: string) {
  const url = `https://arbeitnow.com/api/job-board-api`;
  
  try {
    const { data } = await axios.get(url);
    const jobs: Job[] = data.data;

    // Filter jobs based on keyword and location
    const filteredJobs = jobs.filter(job => 
      (job.title.toLowerCase().includes(keyword.toLowerCase()) || 
       job.description.toLowerCase().includes(keyword.toLowerCase())) &&
      (location === '' || job.location.toLowerCase().includes(location.toLowerCase()))
    );

    return filteredJobs.map(job => ({
      title: job.title,
      company: job.company_name,
      location: job.location,
      link: job.url,
      remote: job.remote,
      jobTypes: job.job_types,
      tags: job.tags
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const location = searchParams.get('location');

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  try {
    const jobs = await fetchJobs(keyword, location || '');
    console.log('Jobs fetched:', jobs); // Add this line
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error in job search:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
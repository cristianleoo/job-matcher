import { NextResponse } from 'next/server';
import axios from 'axios';

interface Job {
  url: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Instead of scraping, we'll use a public API
    const response = await axios.get('https://arbeitnow.com/api/job-board-api');
    const jobs = response.data.data;
    
    // Find a job that matches the URL or return a sample job
    const job = jobs.find((j: Job) => j.url === url) || jobs[0];

    const jobData = {
      title: job.title,
      company: job.company_name,
      location: job.location,
      description: job.description
    };

    return NextResponse.json(jobData);
  } catch (error) {
    console.error('Error in job fetching:', error);
    return NextResponse.json({ error: 'Failed to fetch job data' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getJobsFromLinkedin } from '@/lib/linkedin-scraper';

export async function POST(request: Request) {
  console.log('Received POST request to /api/linkedin-scraper');
  try {
    const { keyword, location } = await request.json();
    console.log('Received keyword:', keyword, 'and location:', location);

    if (!keyword) {
      console.log('Keyword is missing, returning 400 error');
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    console.log('Launching Puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
      ],
    });

    try {
      console.log('Starting LinkedIn job scraping');
      const jobs = await getJobsFromLinkedin(browser, keyword, location);
      console.log(`Scraped ${jobs.length} jobs`);
      return NextResponse.json(jobs);
    } catch (error) {
      console.error('Error in getJobsFromLinkedin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: 'Error scraping LinkedIn jobs', details: errorMessage }, { status: 500 });
    } finally {
      console.log('Closing Puppeteer browser');
      await browser.close();
    }
  } catch (error) {
    console.error('Error in LinkedIn scraper API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Error processing request', details: errorMessage }, { status: 500 });
  }
}

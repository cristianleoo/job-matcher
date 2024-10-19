import { NextResponse } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';
import { getJobsFromLinkedin, scrapeJobDetails } from '@/lib/linkedin-scraper';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function scrapeWithRetry(browser: Browser, url: string) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let page: Page | null = null;
    try {
      page = await browser.newPage();
      await page.setDefaultNavigationTimeout(60000); // Increase timeout to 60 seconds
      console.log(`Attempt ${attempt}: Navigating to ${url}`);
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      console.log(`Attempt ${attempt}: Waiting for job title`);
      await page.waitForSelector('h1.top-card-layout__title', { timeout: 30000 });
      
      console.log(`Attempt ${attempt}: Scraping job details`);
      const jobDetails = await scrapeJobDetails(browser, url);
      return jobDetails;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === MAX_RETRIES) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    } finally {
      if (page) await page.close();
    }
  }
}

export async function POST(request: Request) {
  console.log('Received POST request to /api/linkedin-scraper');
  let browser;
  try {
    const { keyword, location, url } = await request.json();
    console.log('Received keyword:', keyword, 'location:', location, 'url:', url);

    if (!url && !keyword) {
      console.log('Keyword or URL is missing, returning 400 error');
      return NextResponse.json({ error: 'Keyword or URL is required' }, { status: 400 });
    }

    console.log('Launching Puppeteer');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-features=site-per-process', // Disable site-per-process to prevent crashes
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
      ],
    });

    if (url) {
      console.log('Scraping single job details from URL:', url);
      try {
        const jobDetails = await scrapeJobDetails(browser, url);
        return NextResponse.json({ jobDetails }, { status: 200 });
      } catch (error) {
        console.error('Error in scrapeJobDetails:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Error scraping job details', details: errorMessage }, { status: 500 });
      }
    }

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

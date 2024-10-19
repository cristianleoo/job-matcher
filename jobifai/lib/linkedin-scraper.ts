import { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  remoteOk: boolean;
  date: string;
  descriptionHtml?: string | null;
  descriptionText?: string | null;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  stackRequired?: string[];
}

const urlQueryPage = (search: string, location: string, pageNumber: number) =>
  `https://linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${search}&start=${pageNumber * 25}${location ? '&location=' + location : ''}`;

async function getJobsFromLinkedinPage(page: Page): Promise<Job[]> {
  console.log('Extracting jobs from LinkedIn page');
  return page.evaluate(() => {
    const collection: HTMLCollection = document.body.children;
    const results: Job[] = [];
    for (let i = 0; i < collection.length; i++) {
      try {
        const item = collection.item(i)!;
        const title = item.getElementsByClassName('base-search-card__title')[0].textContent!.trim();
        const remoteOk: boolean = !!title.match(/remote|No office location/gi);

        const url = (
          (item.getElementsByClassName('base-card__full-link')[0] as HTMLLinkElement) ||
          (item.getElementsByClassName('base-search-card--link')[0] as HTMLLinkElement)
        ).href;

        const companyNameAndLinkContainer = item.getElementsByClassName('base-search-card__subtitle')[0];
        const companyName = companyNameAndLinkContainer.textContent!.trim();
        const companyLocation = item.getElementsByClassName('job-search-card__location')[0].textContent!.trim();

        const dateTime = (
          item.getElementsByClassName('job-search-card__listdate')[0] ||
          item.getElementsByClassName('job-search-card__listdate--new')[0]
        ).getAttribute('datetime');
        const postedDate = new Date(dateTime!).toISOString();

        const result: Job = {
          id: item.children[0].getAttribute('data-entity-urn') as string,
          title: title,
          company: companyName,
          location: companyLocation,
          url: url,
          remoteOk: remoteOk,
          date: postedDate,
        };

        results.push(result);
      } catch (e) {
        console.error(`Error extracting job ${i}:`, e);
      }
    }
    console.log(`Extracted ${results.length} jobs from page`);
    return results;
  });
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getJobsFromAllPages(page: Page, keyword: string, location: string): Promise<Job[]> {
  console.log('Starting to fetch jobs from all pages');
  let allJobs: Job[] = [];
  let pageNumber = 0;
  let hasMoreJobs = true;
  const maxPages = 5; // Limit to 5 pages to avoid excessive scraping

  while (hasMoreJobs && pageNumber < maxPages) {
    const url = urlQueryPage(keyword, location, pageNumber);
    console.log(`Navigating to page ${pageNumber}:`, url);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      const jobs = await getJobsFromLinkedinPage(page);

      if (jobs.length === 0) {
        console.log('No more jobs found, stopping pagination');
        hasMoreJobs = false;
      } else {
        console.log(`Found ${jobs.length} jobs on page ${pageNumber}`);
        allJobs = [...allJobs, ...jobs];
        pageNumber++;
      }
    } catch (error) {
      console.error(`Error scraping page ${pageNumber}:`, error);
      // If there's an error, we'll try to continue with the next page
    }

    // Add a delay between requests to avoid rate limiting
    await delay(2000 + Math.random() * 1000); // Random delay between 2-3 seconds
  }

  console.log(`Total jobs found: ${allJobs.length}`);
  return allJobs;
}

export async function getJobsFromLinkedin(browser: Browser, keyword: string, location: string): Promise<Job[]> {
  console.log('Starting LinkedIn job scraping');
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });

  try {
    const jobs = await getJobsFromAllPages(page, keyword, location);
    console.log(`Finished scraping, found ${jobs.length} jobs`);
    return jobs;
  } finally {
    await page.close();
  }
}

export async function scrapeJobDetails(browser: Browser, url: string): Promise<Partial<Job>> {
  console.log('Starting job details scraping');
  console.log('Fetching job details page:', url);
  let retries = 3;

  while (retries > 0) {
    try {
      // Fetch the HTML content using axios
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      const $ = cheerio.load(response.data);
      const descriptionElement = $('.show-more-less-html__markup');

      if (descriptionElement.length > 0) {
        const descriptionHtml = descriptionElement.html();
        const descriptionText = descriptionElement.text();

        console.log('Scraped job details successfully');
        return {
          url,
          descriptionHtml: descriptionHtml || undefined,
          descriptionText: descriptionText || undefined,
        };
      } else {
        console.log('Description element not found in HTML. Falling back to Puppeteer.');
        return await scrapeWithPuppeteer(browser, url);
      }
    } catch (error) {
      console.error(`Error scraping job details (attempt ${4 - retries}/3):`, error);
      retries--;
      if (retries === 0) {
        console.error('Max retries reached. Returning partial data.');
        return { url };
      }
      await delay(5000 + Math.random() * 5000); // Random delay between 5-10 seconds
    }
  }

  return { url };
}

async function scrapeWithPuppeteer(browser: Browser, url: string): Promise<Partial<Job>> {
  let page: Page | null = null;
  try {
    page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    await page.waitForFunction(() => {
      const element = document.querySelector('.show-more-less-html__markup');
      return element && element.textContent && element.textContent.length > 0;
    }, { timeout: 30000 });

    const jobDetails = await page.evaluate(() => {
      const descriptionElement = document.querySelector('.show-more-less-html__markup');
      return {
        descriptionHtml: descriptionElement ? descriptionElement.innerHTML : null,
        descriptionText: descriptionElement ? descriptionElement.textContent : null
      };
    });

    console.log('Scraped job details with Puppeteer');
    return {
      url,
      descriptionHtml: jobDetails.descriptionHtml || undefined,
      descriptionText: jobDetails.descriptionText || undefined
    };
  } catch (error) {
    console.error('Error scraping with Puppeteer:', error);
    return { url };
  } finally {
    if (page && !page.isClosed()) {
      await page.close().catch(e => console.error('Error closing page:', e));
    }
  }
}

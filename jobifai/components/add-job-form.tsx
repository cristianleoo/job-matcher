import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@clerk/nextjs';
import React from 'react';

export function AddJobForm() {
  const { userId } = useAuth();
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
  });
  const [jobUrl, setJobUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobUrl(e.target.value);
    setIsManualEntry(false);
  };

  const handleScrape = async () => {
    if (!jobUrl) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const scrapedData = await response.json();
      console.log('Scraped data:', scrapedData);
      setJobData(scrapedData);
    } catch (error) {
      console.error('Error fetching job data:', error);
      alert('Failed to fetch job data. Please enter details manually.');
      setIsManualEntry(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, jobData, jobUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to add job');
      }

      // Reset form and show success message
      setJobData({ title: '', company: '', location: '', description: '' });
      setJobUrl('');
      setIsManualEntry(false);
      alert('Job added successfully!');
    } catch (error) {
      console.error('Error adding job:', error);
      alert('Failed to add job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Job URL"
          value={jobUrl}
          onChange={handleUrlChange}
          className="flex-grow"
        />
        <Button type="button" onClick={handleScrape} disabled={isLoading || !jobUrl}>
          Scrape
        </Button>
      </div>
      {(isManualEntry || jobData.title) && (
        <>
          <Input
            name="title"
            placeholder="Job Title"
            value={jobData.title}
            onChange={handleInputChange}
            required
          />
          <Input
            name="company"
            placeholder="Company"
            value={jobData.company}
            onChange={handleInputChange}
            required
          />
          <Input
            name="location"
            placeholder="Location"
            value={jobData.location}
            onChange={handleInputChange}
            required
          />
          <Textarea
            name="description"
            placeholder="Job Description"
            value={jobData.description}
            onChange={handleInputChange}
            required
          />
        </>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Job'}
      </Button>
    </form>
  );
}
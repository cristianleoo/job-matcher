import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface JobApplication {
  title: string;
  company: string;
  location: string;
  employment_type: string;
  experience_level: string;
  remote_type: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  job_url?: string; // Make job_url optional
  description: string;
  status: string;
  applied_date: string;
}

interface AddJobFormProps {
  onJobAdded: (jobData: JobApplication) => void;
  extractedJobInfo: Partial<JobApplication>;
}

export function AddJobForm({ onJobAdded, extractedJobInfo }: AddJobFormProps) {
  const [jobData, setJobData] = useState<JobApplication>({
    title: extractedJobInfo.title || '',
    company: extractedJobInfo.company || '',
    location: extractedJobInfo.location || '',
    employment_type: extractedJobInfo.employment_type || '',
    experience_level: extractedJobInfo.experience_level || '',
    remote_type: extractedJobInfo.remote_type || '',
    skills: extractedJobInfo.skills || [],
    responsibilities: extractedJobInfo.responsibilities || [],
    requirements: extractedJobInfo.requirements || [],
    job_url: extractedJobInfo.job_url || '',
    description: extractedJobInfo.description || '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'skills' | 'responsibilities' | 'requirements') => {
    const values = e.target.value.split('\n').filter(item => item.trim() !== '');
    setJobData(prevData => ({ ...prevData, [field]: values }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate job_url if provided
    // if (jobData.job_url && !isValidUrl(jobData.job_url)) {
    //   alert("Please enter a valid URL or leave it empty.");
    //   return;
    // }

    onJobAdded(jobData);
  };

  // Function to validate URL
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (_) {
      return false;  
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
        <Input type="text" id="title" name="title" value={jobData.title} onChange={handleInputChange} required />
      </div>
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
        <Input type="text" id="company" name="company" value={jobData.company} onChange={handleInputChange} required />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
        <Input type="text" id="location" name="location" value={jobData.location} onChange={handleInputChange} required />
      </div>
      <div>
        <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700">Employment Type</label>
        <Input type="text" id="employment_type" name="employment_type" value={jobData.employment_type} onChange={handleInputChange} />
      </div>
      <div>
        <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700">Experience Level</label>
        <Input type="text" id="experience_level" name="experience_level" value={jobData.experience_level} onChange={handleInputChange} />
      </div>
      <div>
        <label htmlFor="remote_type" className="block text-sm font-medium text-gray-700">Remote Type</label>
        <Input type="text" id="remote_type" name="remote_type" value={jobData.remote_type} onChange={handleInputChange} />
      </div>
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (one per line)</label>
        <Textarea id="skills" name="skills" value={jobData.skills.join('\n')} onChange={(e) => handleArrayInputChange(e, 'skills')} rows={3} />
      </div>
      <div>
        <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700">Responsibilities (one per line)</label>
        <Textarea id="responsibilities" name="responsibilities" value={jobData.responsibilities.join('\n')} onChange={(e) => handleArrayInputChange(e, 'responsibilities')} rows={3} />
      </div>
      <div>
        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">Requirements (one per line)</label>
        <Textarea id="requirements" name="requirements" value={jobData.requirements.join('\n')} onChange={(e) => handleArrayInputChange(e, 'requirements')} rows={3} />
      </div>
      <div>
        <label htmlFor="job_url" className="block text-sm font-medium text-gray-700">Job URL</label>
        <Input type="text" id="job_url" name="job_url" value={jobData.job_url} onChange={handleInputChange} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
        <Textarea id="description" name="description" value={jobData.description} onChange={handleInputChange} rows={5} required />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Application Status</label>
        <Input type="text" id="status" name="status" value={jobData.status} onChange={handleInputChange} required />
      </div>
      <div>
        <label htmlFor="applied_date" className="block text-sm font-medium text-gray-700">Applied Date</label>
        <Input type="date" id="applied_date" name="applied_date" value={jobData.applied_date} onChange={handleInputChange} required />
      </div>
      <Button type="submit">Add Job Application</Button>
    </form>
  );
}
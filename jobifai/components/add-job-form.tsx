import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@clerk/nextjs';
import React from 'react';
import { useUserStore } from '@/lib/userStore';

interface JobFormData {
  title: string;
  company: string;
  status: string;
  applied_date: string;
  location: string;
  employment_type: string;
  experience_level: string;
  remote_type: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
}

interface ExtractedJobInfo {
  job_title?: string;
  company?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  remote_type?: string;
  skills?: string[];
  responsibilities?: string[];
  requirements?: string[];
}

export function AddJobForm({ onJobAdded, extractedJobInfo }: { onJobAdded: () => void, extractedJobInfo: ExtractedJobInfo }) {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    location: '',
    employment_type: '',
    experience_level: '',
    remote_type: '',
    skills: [],
    responsibilities: [],
    requirements: [],
  });

  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);

  useEffect(() => {
    if (extractedJobInfo) {
      setFormData(prev => ({
        ...prev,
        title: extractedJobInfo.job_title || '',
        company: extractedJobInfo.company || '',
        location: extractedJobInfo.location || '',
        employment_type: extractedJobInfo.employment_type || '',
        experience_level: extractedJobInfo.experience_level || '',
        remote_type: extractedJobInfo.remote_type || '',
        skills: extractedJobInfo.skills || [],
        responsibilities: extractedJobInfo.responsibilities || [],
        requirements: extractedJobInfo.requirements || [],
      }));
    }
  }, [extractedJobInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobData: formData, supabaseUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add job');
      }

      // Call the onJobAdded callback
      onJobAdded();
    } catch (error) {
      console.error('Error adding job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="title"
        placeholder="Job Title"
        value={formData.title}
        onChange={handleInputChange}
        required
      />
      <Input
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleInputChange}
        required
      />
      <Input
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleInputChange}
        required
      />
      <Input
        name="employment_type"
        placeholder="Employment Type"
        value={formData.employment_type}
        onChange={handleInputChange}
        required
      />
      <Input
        name="experience_level"
        placeholder="Experience Level"
        value={formData.experience_level}
        onChange={handleInputChange}
        required
      />
      <Input
        name="remote_type"
        placeholder="Remote Type"
        value={formData.remote_type}
        onChange={handleInputChange}
        required
      />
      <Textarea
        name="skills"
        placeholder="Skills (comma-separated)"
        value={formData.skills.join(', ')}
        onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }))}
        required
      />
      <Textarea
        name="responsibilities"
        placeholder="Responsibilities (one per line)"
        value={formData.responsibilities.join('\n')}
        onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value.split('\n').map(s => s.trim()) }))}
        required
      />
      <Textarea
        name="requirements"
        placeholder="Requirements (one per line)"
        value={formData.requirements.join('\n')}
        onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value.split('\n').map(s => s.trim()) }))}
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Job'}
      </Button>
    </form>
  );
}
"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MinusCircle, Upload, X } from 'lucide-react';
import { useUserStore } from '@/lib/userStore';

export function UserProfileForm() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [''],
    workExperience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
    education: [{ institution: '', degree: '', fieldOfStudy: '', graduationDate: '' }],
    portfolioLinks: [''],
    jobPreferences: {
      desiredPosition: '',
      desiredIndustry: '',
      desiredSalary: '',
      remotePreference: '',
    },
    linkedinProfile: '',
    githubProfile: '',
    personalWebsite: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);

  type ProfileField = 'workExperience' | 'education';
  type WorkExperience = { company: string; position: string; startDate: string; endDate: string; description: string };
  type Education = { institution: string; degree: string; fieldOfStudy: string; graduationDate: string };

  useEffect(() => {
    if (user) {
      setProfile(prevProfile => ({
        ...prevProfile,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({ ...prevProfile, [name]: value }));
  };

  const handleArrayChange = (index: number, field: string, subfield: string | null, value: string) => {
    setProfile((prevProfile) => {
        const currentField = prevProfile[field as keyof typeof prevProfile];
        if (Array.isArray(currentField)) {
            const newArray = [...currentField];
            if (subfield) {
                newArray[index] = {
                    ...(newArray[index] as object),
                    [subfield]: value
                } as typeof newArray[number];
            }
            // Return the updated profile with the new array
            return { ...prevProfile, [field]: newArray };
        }
        // If it's not an array, return the profile unchanged
        return prevProfile;
    });
  };

  const handleAddItem = (field: string) => {
    setProfile((prevProfile) => ({
        ...prevProfile,
        [field]: [...(prevProfile[field as ProfileField] as (WorkExperience | Education)[]),
            field === 'workExperience' ? { company: '', position: '', startDate: '', endDate: '', description: '' } :
            field === 'education' ? { institution: '', degree: '', fieldOfStudy: '', graduationDate: '' } : '']
      }));
  };

  const handleRemoveItem = (field: string, index: number) => {
    setProfile(prevProfile => ({
        ...prevProfile,
        [field]: (prevProfile[field as keyof typeof prevProfile] as unknown[]).filter((_, i) => i !== index)
        }));
  };

  const readFileContent = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', supabaseUserId || '');

    try {
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResume(file);
      
      const shouldPopulate = window.confirm("Would you like to populate the form fields with information from your resume?");
      
      if (shouldPopulate) {
        try {
          const content = await readFileContent(file);
          await extractResumeInfo(content);
        } catch (error) {
          console.error('Error reading file:', error);
          alert('There was an error reading your file. Please try again.');
        }
      }
    }
  };

  const extractResumeInfo = async (content: string) => {
    try {
      // Parse the content returned by Gemini
      const extractedInfo = JSON.parse(content);
      
      // Update profile state with extracted information
      setProfile(prev => ({
        ...prev,
        ...extractedInfo,
        firstName: prev.firstName, // Keep Clerk-provided firstName
        lastName: prev.lastName,   // Keep Clerk-provided lastName
        email: prev.email,         // Keep Clerk-provided email
      }));
    } catch (error) {
      console.error('Error parsing extracted resume information:', error);
      alert('There was an error processing your resume. Please try again or fill in the information manually.');
    }
  };

  const handleRemoveFile = () => {
    setResume(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the profile data to your backend
    // You'll need to handle file upload separately, possibly using FormData
    console.log('Profile data:', profile);
    console.log('Resume file:', resume);
    alert('Profile updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resume upload section */}
      <div>
        <Label htmlFor="resume">Resume</Label>
        <div className="flex items-center gap-2 mt-2">
          <Input
            id="resume"
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Resume
          </Button>
          {resume && (
            <div className="flex items-center gap-2">
              <span>{resume.name}</span>
              <Button
                type="button"
                onClick={handleRemoveFile}
                size="icon"
                variant="destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" value={profile.firstName} readOnly />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" value={profile.lastName} readOnly />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={profile.email} readOnly />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" value={profile.phone} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" value={profile.location} onChange={handleChange} />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <textarea id="bio" name="bio" value={profile.bio} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      <div>
        <Label>Skills</Label>
        {profile.skills.map((skill, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <Input
              value={skill}
              onChange={(e) => handleArrayChange(index, 'skills', null, e.target.value)}
            />
            {index === profile.skills.length - 1 ? (
              <Button type="button" onClick={() => handleAddItem('skills')} size="icon"><PlusCircle className="h-4 w-4" /></Button>
            ) : (
              <Button type="button" onClick={() => handleRemoveItem('skills', index)} size="icon" variant="destructive"><MinusCircle className="h-4 w-4" /></Button>
            )}
          </div>
        ))}
      </div>

      <div>
        <Label>Work Experience</Label>
        {profile.workExperience.map((exp, index) => (
          <div key={index} className="border p-4 rounded-md mt-2">
            <Input className="mb-2" placeholder="Company" value={exp.company} onChange={(e) => handleArrayChange(index, 'workExperience', 'company', e.target.value)} />
            <Input className="mb-2" placeholder="Position" value={exp.position} onChange={(e) => handleArrayChange(index, 'workExperience', 'position', e.target.value)} />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Input type="date" placeholder="Start Date" value={exp.startDate} onChange={(e) => handleArrayChange(index, 'workExperience', 'startDate', e.target.value)} />
              <Input type="date" placeholder="End Date" value={exp.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleArrayChange(index, 'workExperience', 'endDate', e.target.value)} />
            </div>
            <textarea className="mb-2 w-full p-2 border rounded" placeholder="Description" value={exp.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleArrayChange(index, 'workExperience', 'description', e.target.value)} />
            {index === profile.workExperience.length - 1 ? (
              <Button type="button" onClick={() => handleAddItem('workExperience')}>Add Experience</Button>
            ) : (
              <Button type="button" onClick={() => handleRemoveItem('workExperience', index)} variant="destructive">Remove</Button>
            )}
          </div>
        ))}
      </div>

      <div>
        <Label>Education</Label>
        {profile.education.map((edu, index) => (
          <div key={index} className="border p-4 rounded-md mt-2">
            <Input className="mb-2" placeholder="Institution" value={edu.institution} onChange={(e) => handleArrayChange(index, 'education', 'institution', e.target.value)} />
            <Input className="mb-2" placeholder="Degree" value={edu.degree} onChange={(e) => handleArrayChange(index, 'education', 'degree', e.target.value)} />
            <Input className="mb-2" placeholder="Field of Study" value={edu.fieldOfStudy} onChange={(e) => handleArrayChange(index, 'education', 'fieldOfStudy', e.target.value)} />
            <Input type="date" placeholder="Graduation Date" value={edu.graduationDate} onChange={(e) => handleArrayChange(index, 'education', 'graduationDate', e.target.value)} />
            {index === profile.education.length - 1 ? (
              <Button type="button" onClick={() => handleAddItem('education')} className="mt-2">Add Education</Button>
            ) : (
              <Button type="button" onClick={() => handleRemoveItem('education', index)} variant="destructive" className="mt-2">Remove</Button>
            )}
          </div>
        ))}
      </div>

      <div>
        <Label>Portfolio Links</Label>
        {profile.portfolioLinks.map((link, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <Input
              type="url"
              value={link}
              onChange={(e) => handleArrayChange(index, 'portfolioLinks', null, e.target.value)}
              placeholder="https://..."
            />
            {index === profile.portfolioLinks.length - 1 ? (
              <Button type="button" onClick={() => handleAddItem('portfolioLinks')} size="icon"><PlusCircle className="h-4 w-4" /></Button>
            ) : (
              <Button type="button" onClick={() => handleRemoveItem('portfolioLinks', index)} size="icon" variant="destructive"><MinusCircle className="h-4 w-4" /></Button>
            )}
          </div>
        ))}
      </div>

      <div>
        <Label>Job Preferences</Label>
        <Input className="mt-2" placeholder="Desired Position" value={profile.jobPreferences.desiredPosition} onChange={(e) => setProfile(prev => ({ ...prev, jobPreferences: { ...prev.jobPreferences, desiredPosition: e.target.value } }))} />
        <Input className="mt-2" placeholder="Desired Industry" value={profile.jobPreferences.desiredIndustry} onChange={(e) => setProfile(prev => ({ ...prev, jobPreferences: { ...prev.jobPreferences, desiredIndustry: e.target.value } }))} />
        <Input className="mt-2" placeholder="Desired Salary" type="number" value={profile.jobPreferences.desiredSalary} onChange={(e) => setProfile(prev => ({ ...prev, jobPreferences: { ...prev.jobPreferences, desiredSalary: e.target.value } }))} />
        <Input className="mt-2" placeholder="Remote Preference" value={profile.jobPreferences.remotePreference} onChange={(e) => setProfile(prev => ({ ...prev, jobPreferences: { ...prev.jobPreferences, remotePreference: e.target.value } }))} />
      </div>

      <div>
        <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
        <Input id="linkedinProfile" name="linkedinProfile" value={profile.linkedinProfile} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="githubProfile">GitHub Profile</Label>
        <Input id="githubProfile" name="githubProfile" value={profile.githubProfile} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="personalWebsite">Personal Website</Label>
        <Input id="personalWebsite" name="personalWebsite" value={profile.personalWebsite} onChange={handleChange} />
      </div>

      <Button type="submit" className="w-full">Update Profile</Button>
    </form>
  );
}
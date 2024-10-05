"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MinusCircle, Upload, X } from 'lucide-react';
import { useUserStore } from '@/lib/userStore';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function UserProfileForm() {
  const { user } = useUser();
  const { userId: clerkId } = useAuth();
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
    
    try {
      // Update user information
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: supabaseUserId,
          clerk_id: clerkId,
          email: profile.email,
          full_name: `${profile.firstName} ${profile.lastName}`,
          phone: profile.phone,
          location: profile.location,
          linkedin_profile: profile.linkedinProfile,
          github_profile: profile.githubProfile,
          personal_website: profile.personalWebsite,
        });

      if (userError) throw userError;


      // Update skills
      const { error: skillsError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', supabaseUserId);

      if (skillsError) throw skillsError;

      for (const skill of profile.skills) {
        const { data: skillData, error: skillInsertError } = await supabase
          .from('skills')
          .upsert({ name: skill }, { onConflict: 'name' })
          .select('id')
          .single();

        if (skillInsertError) throw skillInsertError;

        const { error: userSkillError } = await supabase
          .from('user_skills')
          .insert({
            user_id: supabaseUserId,
            skill_id: skillData.id,
            proficiency_level: 3, // Default level, you might want to add this to your form
          });

        if (userSkillError) throw userSkillError;
      }

      console.log("skills updated")

      // Only update job preferences if they exist
      if (profile.jobPreferences && Object.keys(profile.jobPreferences).some(key => 
        profile.jobPreferences[key as keyof typeof profile.jobPreferences]
      )) {
        const { error: jobPrefError } = await supabase
          .from('job_preferences')
          .upsert({
            user_id: supabaseUserId,
            desired_role: profile.jobPreferences.desiredPosition,
            desired_industry: profile.jobPreferences.desiredIndustry,
            min_salary: parseInt(profile.jobPreferences.desiredSalary),
            remote_preference: profile.jobPreferences.remotePreference,
          });

        if (jobPrefError) throw jobPrefError;
      }

      console.log("job preferences updated")

      // Update work experience
      await supabase
        .from('work_experience')
        .delete()
        .eq('user_id', supabaseUserId);

      for (const exp of profile.workExperience) {
        const { error: workExpError } = await supabase
          .from('work_experience')
          .insert({
            user_id: supabaseUserId,
            company: exp.company,
            position: exp.position,
            start_date: exp.startDate,
            end_date: exp.endDate,
            description: exp.description,
          });

        if (workExpError) throw workExpError;
      }

      console.log("work experience updated")

      // Update education
      await supabase
        .from('education')
        .delete()
        .eq('user_id', supabaseUserId);

      for (const edu of profile.education) {
        const { error: eduError } = await supabase
          .from('education')
          .insert({
            user_id: supabaseUserId,
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.fieldOfStudy,
            graduation_date: edu.graduationDate,
          });

        if (eduError) throw eduError;
      }

      console.log("education updated")

      // Update portfolio links
      await supabase
        .from('portfolio_links')
        .delete()
        .eq('user_id', supabaseUserId);

      for (const link of profile.portfolioLinks) {
        const { error: linkError } = await supabase
          .from('portfolio_links')
          .insert({
            user_id: supabaseUserId,
            url: link,
          });

        if (linkError) throw linkError;
      }

      console.log("portfolio links updated")

      // Handle resume upload if a new file is selected
      if (resume) {
        const fileName = `public/${supabaseUserId}_resume.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('user_resumes')
          .upload(fileName, resume, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Save resume reference in the resumes table
        const { error: resumeError } = await supabase
          .from('resumes')
          .upsert({
            user_id: supabaseUserId,
            title: fileName,
            content: "",
            version: 1, // You might want to implement versioning logic
          });

        if (resumeError) throw resumeError;
      }

      console.log("resume updated")

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('There was an error updating your profile. Please try again.');
    }
  };

  // Add this useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!supabaseUserId) return;

      try {
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', supabaseUserId)
          .single();

        if (userError) throw userError;

        // Fetch skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('user_skills')
          .select('skills(name)')
          .eq('user_id', supabaseUserId);

        if (skillsError) throw skillsError;

        // Fetch job preferences
        const { data: jobPrefData, error: jobPrefError } = await supabase
          .from('job_preferences')
          .select('*')
          .eq('user_id', supabaseUserId)
          .single();

        if (jobPrefError && jobPrefError.code !== 'PGRST116') throw jobPrefError;

        // Fetch work experience
        const { data: workExpData, error: workExpError } = await supabase
          .from('work_experience')
          .select('*')
          .eq('user_id', supabaseUserId);

        if (workExpError) throw workExpError;

        // Fetch education
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .select('*')
          .eq('user_id', supabaseUserId);

        if (educationError) throw educationError;

        // Fetch portfolio links
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio_links')
          .select('*')
          .eq('user_id', supabaseUserId);

        if (portfolioError) throw portfolioError;

        // Update the profile state with fetched data
        setProfile(prevProfile => ({
          ...prevProfile,
          firstName: userData.full_name.split(' ')[0] || prevProfile.firstName,
          lastName: userData.full_name.split(' ').slice(1).join(' ') || prevProfile.lastName,
          email: userData.email || prevProfile.email,
          phone: userData.phone || '',
          location: userData.location || '',
          linkedinProfile: userData.linkedin_profile || '',
          githubProfile: userData.github_profile || '',
          personalWebsite: userData.personal_website || '',
          skills: skillsData.map(skill => skill.skills.name) || [''],
          workExperience: workExpData.map(exp => ({
            company: exp.company,
            position: exp.position,
            startDate: exp.start_date,
            endDate: exp.end_date,
            description: exp.description,
          })) || [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
          education: educationData.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.field_of_study,
            graduationDate: edu.graduation_date,
          })) || [{ institution: '', degree: '', fieldOfStudy: '', graduationDate: '' }],
          portfolioLinks: portfolioData.map(link => link.url) || [''],
          jobPreferences: {
            desiredPosition: jobPrefData?.desired_role || '',
            desiredIndustry: jobPrefData?.desired_industry || '',
            desiredSalary: jobPrefData?.min_salary?.toString() || '',
            remotePreference: jobPrefData?.remote_preference || '',
          },
        }));

      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('There was an error loading your profile data. Please try refreshing the page.');
      }
    };

    fetchUserData();
  }, [supabaseUserId]);

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
"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MinusCircle, Upload, X, MessageSquare, Download, Camera, Edit2 } from 'lucide-react';
import { useUserStore } from '@/lib/userStore';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set the worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
    skills: [''], // Ensure there's at least one entry
    workExperience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }], // Ensure there's at least one entry
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
  const [existingResume, setExistingResume] = useState<string | null>(null);
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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

        // Fetch resume information
        const { data: resumeData, error: resumeError } = await supabase
          .from('resumes')
          .select('title')
          .eq('user_id', supabaseUserId)
          .single();

        if (resumeError && resumeError.code !== 'PGRST116') throw resumeError;

        if (resumeData) {
          setExistingResume(resumeData.title);
        }

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
          skills: skillsData?.flatMap(item => (Array.isArray(item.skills) ? item.skills : [item.skills]).map(skill => skill?.name || '')).filter(Boolean) || [''],
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

  // Add this function to handle chatting with the resume
  const handleChatWithResume = () => {
    router.push('/chat?context=resume');
  };

  const handleDownloadResume = async () => {
    if (!supabaseUserId || !existingResume) return;

    try {
      const { data, error } = await supabase.storage
        .from('user_resumes')
        .download(`public/${supabaseUserId}_resume.pdf`);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('There was an error downloading your resume. Please try again.');
    }
  };

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !supabaseUserId) return;

    try { 
      const fileName = `${supabaseUserId}_avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars/public')  // Make sure this bucket name is correct
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars/public')
        .getPublicUrl(fileName);

      // Update the user's avatar URL in your database
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', supabaseUserId);

      if (updateError) throw updateError;

      // Update the local user state or refetch user data
      // This depends on how you're managing user state in your app
      // For example:
      // setUser(prevUser => ({ ...prevUser, avatarUrl: publicUrl }));

      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('There was an error updating your profile picture. Please try again.');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!supabaseUserId) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', supabaseUserId)
          .single();

        if (error) throw error;

        if (data && data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [supabaseUserId]);

  useEffect(() => {
    const fetchResume = async () => {
      if (!supabaseUserId || !existingResume) return;

      try {
        const { data, error } = await supabase.storage
          .from('user_resumes')
          .createSignedUrl(`public/${supabaseUserId}_resume.pdf`, 3600); // URL valid for 1 hour

        if (error) throw error;

        setPdfUrl(data.signedUrl);
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    };

    fetchResume();
  }, [supabaseUserId, existingResume]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <Button type="submit" className="px-6">Save Changes</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <CardContent className="-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white">
                <AvatarImage src={avatarUrl || user?.imageUrl} alt={user?.fullName || "User"} />
                <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full bg-white text-gray-700 shadow-lg"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Input
                type="file"
                ref={avatarInputRef}
                className="hidden"
                onChange={handleAvatarChange}
                accept="image/*"
              />
            </div>
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h2 className="text-2xl font-semibold">{user?.fullName}</h2>
              <p className="text-gray-500">{profile.email}</p>
              {avatarFile && (
                <Button type="button" onClick={handleAvatarUpload} className="mt-2" variant="outline">
                  Update Profile Picture
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input id="firstName" name="firstName" value={profile.firstName} readOnly className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input id="lastName" name="lastName" value={profile.lastName} readOnly className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input id="email" name="email" type="email" value={profile.email} readOnly className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                  <Input id="phone" name="phone" type="tel" value={profile.phone} onChange={handleChange} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                  <Input id="location" name="location" value={profile.location} onChange={handleChange} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                  <textarea 
                    id="bio" 
                    name="bio" 
                    value={profile.bio} 
                    onChange={handleChange} 
                    className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">Skills</h3>
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

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
              {profile.workExperience.map((exp, index) => (
                <div key={index} className="border p-4 rounded-md mt-2">
                  <Input className="mb-2" placeholder="Company" value={exp.company} onChange={(e) => handleArrayChange(index, 'workExperience', 'company', e.target.value)} />
                  <Input className="mb-2" placeholder="Position" value={exp.position} onChange={(e) => handleArrayChange(index, 'workExperience', 'position', e.target.value)} />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input type="date" placeholder="Start Date" value={exp.startDate} onChange={(e) => handleArrayChange(index, 'workExperience', 'startDate', e.target.value)} />
                    <Input type="date" placeholder="End Date" value={exp.endDate} onChange={(e) => handleArrayChange(index, 'workExperience', 'endDate', e.target.value)} />
                  </div>
                  <textarea className="mb-2 w-full p-2 border rounded" placeholder="Description" value={exp.description} onChange={(e) => handleArrayChange(index, 'workExperience', 'description', e.target.value)} />
                  {index === profile.workExperience.length - 1 ? (
                    <Button type="button" onClick={() => handleAddItem('workExperience')}>Add Experience</Button>
                  ) : (
                    <Button type="button" onClick={() => handleRemoveItem('workExperience', index)} variant="destructive">Remove</Button>
                  )}
                </div>
              ))}

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">Job Preferences</h3>
              <Input className="mt-2" placeholder="Desired Position" value={profile.jobPreferences.desiredPosition} onChange={(e) => setProfile(prev => ({ ...prev, jobPreferences: { ...prev.jobPreferences, desiredPosition: e.target.value } }))} />
              <Input className="mt-2" placeholder="Desired Industry" value={profile.jobPreferences.desiredIndustry} onChange={(e) => setProfile(prev => ({ ...prev, jobPreferences: { ...prev.jobPreferences, desiredIndustry: e.target.value } }))} />
              <Input className="mt-2" placeholder="Desired Salary" type="number" value={profile.jobPreferences.desiredSalary} onChange={(e) => setProfile(prev => ({ ...prev, jobPreferences: { ...prev.jobPreferences, desiredSalary: e.target.value } }))} />
              <Input className="mt-2" placeholder="Remote Preference" value={profile.jobPreferences.remotePreference} onChange={(e) => setProfile(prev => ({ ...prev, jobPreferences: { ...prev.jobPreferences, remotePreference: e.target.value } }))} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">Portfolio Links</h3>
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

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">Social Profiles</h3>
              <div className="space-y-2">
                <Input id="linkedinProfile" name="linkedinProfile" value={profile.linkedinProfile} onChange={handleChange} placeholder="LinkedIn Profile" />
                <Input id="githubProfile" name="githubProfile" value={profile.githubProfile} onChange={handleChange} placeholder="GitHub Profile" />
                <Input id="personalWebsite" name="personalWebsite" value={profile.personalWebsite} onChange={handleChange} placeholder="Personal Website" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume">
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {existingResume ? 'Update Resume' : 'Upload Resume'}
                </Button>
                {(resume || existingResume) && (
                  <div className="flex items-center gap-2">
                    <span>Resume loaded successfully</span>
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
                {existingResume && (
                  <>
                    <Button
                      type="button"
                      onClick={handleDownloadResume}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Resume
                    </Button>
                    <Button
                      type="button"
                      onClick={handleChatWithResume}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat with Resume
                    </Button>
                  </>
                )}
              </div>
              {pdfUrl && (
                <div className="mt-6 flex flex-col items-center">
                  <div className="border rounded-lg shadow-lg overflow-hidden">
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      options={{
                        cMapUrl: 'cmaps/',
                        cMapPacked: true,
                      }}
                    >
                      <Page 
                        pageNumber={pageNumber} 
                        width={600} // Adjust this value to fit your layout
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </div>
                  <p className="text-center mt-4 text-sm text-gray-600">
                    Page {pageNumber} of {numPages}
                  </p>
                  <div className="flex justify-center mt-2 gap-2">
                    <Button
                      onClick={() => setPageNumber(pageNumber - 1)}
                      disabled={pageNumber <= 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPageNumber(pageNumber + 1)}
                      disabled={pageNumber >= (numPages || 0)}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
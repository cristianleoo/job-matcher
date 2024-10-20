import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGlobe, FaTrash } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/lib/userStore';
import { Experience, Education, Project, UserProfile } from '@/app/types';
import axios from 'axios';
import { calculateSimilarity } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { ChatInterface } from '@/components/ChatInterface';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface ResumeEditorProps {
  jobDescription: string;
  userProfile: UserProfile;
  onSave: (updatedResume: string) => Promise<void>;
}

export function ResumeEditor({ jobDescription, userProfile, onSave }: ResumeEditorProps) {
  const { user } = useUser();
  const supabaseUserId = useUserStore((state) => state.supabaseUserId);
  const [resume, setResume] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    summary: '',
    experience: [] as Experience[],
    education: [] as Education[],
    skills: [] as string[],
    projects: [] as Project[],
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [similarityScore, setSimilarityScore] = useState<number>(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<'summary' | 'skills' | 'experience' | 'education' | null>(null);
  const [sectionContent, setSectionContent] = useState<string>('');

  useEffect(() => {
    if (user && supabaseUserId) {
      fetchUserProfile();
    }
  }, [user, supabaseUserId]);

  const generateSuggestions = useCallback((jobDesc: string, profile: typeof resume): string[] => {
    const keywords = extractKeywords(jobDesc);
    return [
      `Consider highlighting these skills: ${keywords.join(', ')}`,
      'Tailor your experience descriptions to match job requirements',
      'Add quantifiable achievements to stand out',
    ];
  }, []);

  useEffect(() => {
    const generatedSuggestions = generateSuggestions(jobDescription, resume);
    setSuggestions(generatedSuggestions);
  }, [jobDescription, resume, generateSuggestions]);

  useEffect(() => {
    const score = calculateSimilarity(resume, jobDescription);
    setSimilarityScore(score);
  }, [resume, jobDescription]);

  const fetchUserProfile = async () => {
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

      // Update the resume state with fetched data
      setResume({
        name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        linkedin: userData.linkedin_profile || '',
        portfolio: userData.personal_website || '',
        summary: '', // Add a summary field to the users table if needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        experience: workExpData.map((exp: any) => ({
          company: exp.company,
          position: exp.position,
          startDate: exp.start_date,
          endDate: exp.end_date,
          description: exp.description.split('\n'),
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        education: educationData.map((edu: any) => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.field_of_study,
          graduationDate: edu.graduation_date,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        skills: skillsData?.flatMap((item: any) => item.skills?.name || []) || [],
        projects: [], // Add a projects table if needed
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const extractKeywords = (text: string): string[] => {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    return text.toLowerCase().split(/\W+/).filter(word => word.length > 2 && !commonWords.has(word));
  };

  const handleSave = async () => {
    try {
      // Update user information
      await supabase
        .from('users')
        .update({
          full_name: resume.name,
          email: resume.email,
          phone: resume.phone,
          location: resume.location,
          linkedin_profile: resume.linkedin,
          personal_website: resume.portfolio,
        })
        .eq('id', supabaseUserId);

      // Update skills
      await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', supabaseUserId);

      for (const skill of resume.skills) {
        const { data: skillData } = await supabase
          .from('skills')
          .upsert({ name: skill }, { onConflict: 'name' })
          .select('id')
          .single();

        await supabase
          .from('user_skills')
          .insert({
            user_id: supabaseUserId,
            skill_id: skillData!.id,
            proficiency_level: 3, // Default level
          });
      }

      // Update work experience
      await supabase
        .from('work_experience')
        .delete()
        .eq('user_id', supabaseUserId);

      for (const exp of resume.experience) {
        await supabase
          .from('work_experience')
          .insert({
            user_id: supabaseUserId,
            company: exp.company,
            position: exp.position,
            start_date: exp.startDate,
            end_date: exp.endDate,
            description: exp.description.join('\n'),
          });
      }

      // Update education
      await supabase
        .from('education')
        .delete()
        .eq('user_id', supabaseUserId);

      for (const edu of resume.education) {
        await supabase
          .from('education')
          .insert({
            user_id: supabaseUserId,
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.fieldOfStudy,
            graduation_date: edu.graduationDate,
          });
      }

      onSave(JSON.stringify(resume));
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setResume(prev => ({ ...prev, [field]: Array.isArray(value) ? value : value }));
  };

  const handleExperienceChange = (index: number, field: string, value: string | string[]) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index 
          ? { 
              ...exp, 
              [field]: field === 'description' 
                ? (typeof value === 'string' ? value.split('\n').map(item => item.trim().replace(/^[•-]\s*/, '')) : value)
                : value 
            } 
          : exp
      )
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEducation = [...resume.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setResume(prev => ({ ...prev, education: newEducation }));
  };

  const handleProjectChange = (index: number, field: string, value: string | string[]) => {
    const newProjects = [...resume.projects];
    if (field === 'description') {
      newProjects[index] = { ...newProjects[index], [field]: value.toString().split('\n') };
    } else if (field === 'technologies') {
      newProjects[index] = { ...newProjects[index], [field]: (value as string).split(',').map(tech => tech.trim()) };
    } else {
      newProjects[index] = { ...newProjects[index], [field]: value };
    }
    setResume(prev => ({ ...prev, projects: newProjects }));
  };

  const deleteExperience = (index: number) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const deleteEducation = (index: number) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const deleteProject = (index: number) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const deleteField = (field: string) => {
    setResume(prev => {
      const newResume = { ...prev };
      if (field === 'linkedin' || field === 'portfolio' || field === 'summary') {
        delete newResume[field];
      } else if (field === 'skills') {
        newResume.skills = [];
      }
      return newResume;
    });
  };

  const deleteSkill = (index: number) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Add this function near your other handler functions
  const addField = (field: string) => {
    setResume(prev => ({
      ...prev,
      [field]: field === 'skills' ? [] : ''
    }));
  };

  const toggleSection = (section: string) => {
    setHiddenSections(prev => {
      const newHidden = new Set(prev);
      if (newHidden.has(section)) {
        newHidden.delete(section);
      } else {
        newHidden.add(section);
      }
      return newHidden;
    });
  };

  const regenerateSection = async (section: 'summary' | 'skills' | 'experience' | 'education') => {
    try {
      let prompt = '';
      let currentContent = '';

      if (section === 'summary') {
        prompt = `Based on the following resume content and job description, create a brief professional summary that highlights why the candidate is a good fit for the position. Do not invent new information:`;
        currentContent = `Resume: ${JSON.stringify(resume)}\n\nJob Description: ${jobDescription}`;
      } else if (section === 'skills') {
        prompt = `Based on the following resume skills and job description, provide a comma-separated list of the most relevant skills. Only include skills that are mentioned in the resume:`;
        currentContent = `Current Skills: ${resume.skills.join(', ')}\n\nJob Description: ${jobDescription}`;
      } else if (section === 'experience') {
        const mostRecentJob = resume.experience[0];
        prompt = `Improve the following job description to better match the job posting. Only use information provided in the original description:`;
        currentContent = `Current Job Description for ${mostRecentJob.position} at ${mostRecentJob.company}:\n${mostRecentJob.description.join('\n')}\n\nJob Posting: ${jobDescription}`;
      } else if (section === 'education') {
        const mostRecentEducation = resume.education[0];
        prompt = `Based on the following education details and job description, suggest improvements or additions to better align with the job requirements. Do not invent new information:`;
        currentContent = `Current Education: ${mostRecentEducation.degree} in ${mostRecentEducation.fieldOfStudy} from ${mostRecentEducation.institution}, graduated on ${mostRecentEducation.graduationDate}\n\nJob Description: ${jobDescription}`;
      }

      const response = await axios.post('/api/generate-content', { prompt, currentContent, section, jobDescription });
      const generatedContent = response.data.generatedContent;

      if (section === 'summary') {
        setResume(prev => ({ ...prev, summary: generatedContent }));
      } else if (section === 'skills') {
        setResume(prev => ({ ...prev, skills: generatedContent.split(', ').map((skill: string) => skill.trim()) }));
      } else if (section === 'experience') {
        setResume(prev => ({
          ...prev,
          experience: prev.experience.map((exp, index) => 
            index === 0 ? { ...exp, description: generatedContent.split('\n').map((item: string) => item.trim()) } : exp
          )
        }));
      } else if (section === 'education') {
        setResume(prev => ({
          ...prev,
          education: prev.education.map((edu, index) => 
            index === 0 ? { ...edu, fieldOfStudy: generatedContent } : edu
          )
        }));
      }
    } catch (error) {
      console.error('Error regenerating content:', error);
      // Handle the error appropriately (e.g., show an error message to the user)
    }
  };

  const handleCustomRegenerate = (section: 'summary' | 'skills' | 'experience' | 'education') => {
    setCurrentSection(section);
    let content = '';
    if (section === 'experience' && resume.experience.length > 0) {
      content = resume.experience[0].description.join('\n');
    } else if (section === 'skills') {
      content = resume.skills.join(', ');
    } else if (section === 'summary') {
      content = resume.summary || '';
    } else if (section === 'education' && resume.education.length > 0) {
      content = `${resume.education[0].degree} in ${resume.education[0].fieldOfStudy} from ${resume.education[0].institution}, graduated on ${resume.education[0].graduationDate}`;
    }
    setSectionContent(content);
    setChatOpen(true);
  };

  const handleApplyChanges = (content: string) => {
    if (currentSection === 'summary') {
      setResume(prev => ({ ...prev, summary: content, sectionContent: content }));
    } else if (currentSection === 'skills') {
      setResume(prev => ({ ...prev, skills: content.split(', ').map(skill => skill.trim()), sectionContent: content }));
    } else if (currentSection === 'experience') {
      setResume(prev => ({
        ...prev,
        experience: prev.experience.map((exp, index) => 
          index === 0 ? { ...exp, description: content.split('\n').map(item => item.trim()) } : exp
        )
      }));
    } else if (currentSection === 'education') {
      setResume(prev => ({
        ...prev,
        education: prev.education.map((edu, index) => 
          index === 0 ? { ...edu, fieldOfStudy: content } : edu
        )
      }));
    }
    setChatOpen(false);
  };

  const renderSimilarityScore = (score: number) => {
    const percentage = Math.round(score * 100);
    return (
      <div className="w-20 h-20">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textSize: '28px',
            pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
            textColor: '#3e98c7',
            trailColor: '#d6d6d6',
          })}
        />
      </div>
    );
  };

  return (
    <div className="flex w-full h-[calc(100vh-4rem)] bg-white shadow-xl rounded-lg overflow-hidden">
      {/* Resume Preview */}
      <div className="w-1/2 bg-gray-50 p-6 overflow-y-auto border-r border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Resume-Job Posting Similarity:</h2>
          {renderSimilarityScore(similarityScore)}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">{resume.name}</h1>
          <div className="flex justify-center space-x-3 text-sm text-gray-600">
            <span className="flex items-center"><FaEnvelope className="mr-1" />{resume.email}</span>
            <span className="flex items-center"><FaPhone className="mr-1" />{resume.phone}</span>
            <span className="flex items-center"><FaMapMarkerAlt className="mr-1" />{resume.location}</span>
          </div>
          <div className="flex justify-center space-x-4 mt-2 text-gray-600">
            {!hiddenSections.has('linkedin') && resume.linkedin && (
              <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <FaLinkedin className="mr-2" />LinkedIn
              </a>
            )}
            {!hiddenSections.has('portfolio') && resume.portfolio && (
              <a href={resume.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <FaGlobe className="mr-2" />Portfolio
              </a>
            )}
          </div>
        </div>

        {!hiddenSections.has('summary') && resume.summary && (
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Professional Summary</h2>
            <p>{resume.summary}</p>
          </section>
        )}

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Experience</h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold">{exp.position}</h3>
              <p className="text-gray-700 mb-1">{exp.company}</p>
              <p className="text-gray-600 mb-2">{`${exp.startDate} - ${exp.endDate}`}</p>
              <ul className="list-disc pl-5">
                {exp.description.map((item, i) => (
                  <li key={i} className="mb-1">{item.replace(/^[•-]\s*/, '')}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xl font-semibold">{edu.degree}</h3>
                <p className="text-gray-600 text-sm">Graduated: {edu.graduationDate}</p>
              </div>
              <p className="text-gray-700">{edu.institution}</p>
            </div>
          ))}
        </section>

        {!hiddenSections.has('skills') && (
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Skills</h2>
            <p>{resume.skills.join(', ')}</p>
          </section>
        )}

        {!hiddenSections.has('projects') && (
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Projects</h2>
            {resume.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-xl font-semibold">{project.name}</h3>
                <ul className="list-disc pl-5">
                  {project.description.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="text-gray-600 mt-2">Technologies: {project.technologies.join(', ')}</p>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Edit Form or Chat Interface */}
      {chatOpen ? (
        <div className="w-1/2 p-6">
          <ChatInterface
            onClose={() => setChatOpen(false)}
            onApply={handleApplyChanges}
            section={currentSection!}
            supabaseUserId={supabaseUserId || ''}
            resumeContent={JSON.stringify(resume)}
            sectionContent={sectionContent}
          />
        </div>
      ) : (
        <div className="w-1/2 space-y-4 overflow-y-auto p-6">
          <Input
            value={resume.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Full Name"
            className="text-base"
          />
          <Input
            value={resume.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Email"
            className="text-base"
          />
          <Input
            value={resume.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Phone"
            className="text-base"
          />
          <Input
            value={resume.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Location"
            className="text-base"
          />
          <div className="flex items-center space-x-2">
            <Input
              value={resume.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="LinkedIn URL"
              className="text-base"
            />
            <Button onClick={() => toggleSection('linkedin')} className="bg-blue-500 hover:bg-blue-600 text-white">
              {hiddenSections.has('linkedin') ? 'Show' : 'Hide'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              value={resume.portfolio}
              onChange={(e) => handleInputChange('portfolio', e.target.value)}
              placeholder="Portfolio URL"
              className="text-base"
            />
            <Button onClick={() => toggleSection('portfolio')} className="bg-blue-500 hover:bg-blue-600 text-white">
              {hiddenSections.has('portfolio') ? 'Show' : 'Hide'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Professional Summary</h3>
            <Button onClick={() => toggleSection('summary')} className="bg-blue-500 hover:bg-blue-600 text-white">
              {hiddenSections.has('summary') ? 'Show' : 'Hide'}
            </Button>
            <Button onClick={() => regenerateSection('summary')} className="bg-green-500 hover:bg-green-600 text-white">
              Regenerate
            </Button>
            <Button
              onClick={() => handleCustomRegenerate('summary')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Custom Regenerate
            </Button>
          </div>
          <Textarea
            value={resume.summary || ''}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            placeholder="Professional Summary"
            rows={4}
            className="text-base"
          />

          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Skills</h3>
            <Button onClick={() => toggleSection('skills')} className="bg-blue-500 hover:bg-blue-600 text-white">
              {hiddenSections.has('skills') ? 'Show' : 'Hide'}
            </Button>
            <Button onClick={() => regenerateSection('skills')} className="bg-green-500 hover:bg-green-600 text-white">
              Regenerate
            </Button>
            <Button
              onClick={() => handleCustomRegenerate('skills')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Custom Regenerate
            </Button>
          </div>
          <div className="space-y-2">
            {resume.skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...resume.skills];
                    newSkills[index] = e.target.value;
                    handleInputChange('skills', newSkills);
                  }}
                  className="text-base"
                />
                <Button onClick={() => deleteSkill(index)} className="bg-red-500 hover:bg-red-600 text-white">
                  <FaTrash />
                </Button>
              </div>
            ))}
            <Button onClick={() => handleInputChange('skills', [...resume.skills, ''])} className="bg-green-500 hover:bg-green-600 text-white">
              Add Skill
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Experience</h3>
            {resume.experience.map((exp, index) => (
              <div key={index} className="space-y-2 border p-4 rounded-lg bg-gray-50">
                <Input
                  value={exp.position}
                  onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                  placeholder="Position"
                  className="text-base"
                />
                <Input
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  placeholder="Company"
                  className="text-base"
                />
                <div className="flex space-x-2">
                  <Input
                    value={exp.startDate}
                    onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                    placeholder="Start Date"
                    className="text-base"
                  />
                  <Input
                    value={exp.endDate}
                    onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                    placeholder="End Date"
                    className="text-base"
                  />
                </div>
                <Textarea
                  value={exp.description.map(item => `• ${item.replace(/^[•-]\s*/, '')}`).join('\n')}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  placeholder="Description (one bullet point per line)"
                  rows={5}
                  className="text-base"
                />
                <Button onClick={() => deleteExperience(index)} className="bg-red-500 hover:bg-red-600 text-white">
                  <FaTrash className="mr-2" /> Delete Experience
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Education</h3>
            <Button onClick={() => regenerateSection('education')} className="bg-green-500 hover:bg-green-600 text-white">
              Regenerate
            </Button>
            <Button
              onClick={() => handleCustomRegenerate('education')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Custom Regenerate
            </Button>
          </div>
          {resume.education.map((edu, index) => (
            <div key={index} className="space-y-2 border p-4 rounded">
              <Input
                value={edu.institution}
                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                placeholder="Institution"
              />
              <Input
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                placeholder="Degree"
              />
              <Input
                value={edu.graduationDate}
                onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                placeholder="Graduation Date"
              />
              <Button onClick={() => deleteEducation(index)} className="bg-red-500 hover:bg-red-600 text-white">
                <FaTrash className="mr-2" /> Delete Education
              </Button>
            </div>
          ))}

          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Projects</h3>
            <Button onClick={() => toggleSection('projects')} className="bg-blue-500 hover:bg-blue-600 text-white">
              {hiddenSections.has('projects') ? 'Show' : 'Hide'}
            </Button>
          </div>
          {resume.projects.map((project, index) => (
            <div key={index} className="space-y-2 border p-4 rounded">
              <Input
                value={project.name}
                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                placeholder="Project Name"
              />
              <Textarea
                value={project.description.join('\n')}
                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                placeholder="Project Description (one bullet point per line)"
                rows={5}
              />
              <Input
                value={project.technologies.join(', ')}
                onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                placeholder="Technologies (comma-separated)"
              />
              <Button onClick={() => deleteProject(index)} className="bg-red-500 hover:bg-red-600 text-white">
                <FaTrash className="mr-2" /> Delete Project
              </Button>
            </div>
          ))}
          <Button 
            onClick={() => setResume(prev => ({ ...prev, projects: [...prev.projects, { name: '', description: [], technologies: [] }] }))} 
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Add Project
          </Button>

          <div className="flex space-x-4 justify-center mt-8">
            <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3">
              Save Resume
            </Button>
            <Button onClick={() => window.print()} className="bg-green-500 hover:bg-green-600 text-white text-lg px-6 py-3">
              Print / Save as PDF
            </Button>
          </div>

          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Suggestions:</h3>
            <ul className="list-disc pl-5">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          {/* Add these buttons after the existing input fields in the edit form */}
          {resume.linkedin === undefined && (
            <Button onClick={() => addField('linkedin')} className="bg-green-500 hover:bg-green-600 text-white">
              Add LinkedIn
            </Button>
          )}
          {resume.portfolio === undefined && (
            <Button onClick={() => addField('portfolio')} className="bg-green-500 hover:bg-green-600 text-white">
              Add Portfolio
            </Button>
          )}
          {resume.summary === undefined && (
            <Button onClick={() => addField('summary')} className="bg-green-500 hover:bg-green-600 text-white">
              Add Professional Summary
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
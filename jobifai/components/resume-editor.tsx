import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGlobe, FaTrash } from 'react-icons/fa';

interface ResumeEditorProps {
  jobDescription: string;
  userProfile: UserProfile;
  onSave: (updatedResume: string) => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface Education {
  institution: string;
  degree: string;
  graduationDate: string;
}

interface Project {
  name: string;
  description: string[];
  technologies: string[];
}

// First, define the interfaces
interface ResumeEditorProps {
  jobDescription: string;
  userProfile: UserProfile;
  onSave: (updatedResume: string) => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface Education {
  institution: string;
  degree: string;
  graduationDate: string;
}

interface Project {
  name: string;
  description: string[];
  technologies: string[];
}

// Then, define the utility functions
const splitBulletPoints = (text: string): string[] => {
  return text.split('\n')
    .map(item => item.trim())
    .filter(item => item !== '')
    .map(item => item.replace(/^[•\-]\s*/, '')); // Remove leading bullet points or dashes
};

// Now, define the ResumeEditor component
export function ResumeEditor({ jobDescription, userProfile, onSave }: ResumeEditorProps) {
  const [resume, setResume] = useState<UserProfile>({
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    location: userProfile.location || '',
    linkedin: userProfile.linkedin || '',
    portfolio: userProfile.portfolio || '',
    summary: userProfile.summary || '',
    experience: userProfile.experience.map(exp => ({
      ...exp,
      description: Array.isArray(exp.description) 
        ? exp.description 
        : splitBulletPoints(exp.description as string)
    })) || [],
    education: userProfile.education || [],
    skills: userProfile.skills || [],
    projects: userProfile.projects || []
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const generatedSuggestions = generateSuggestions(jobDescription, userProfile);
    setSuggestions(generatedSuggestions);
  }, [jobDescription, userProfile]);

  const generateSuggestions = (jobDesc: string, profile: UserProfile): string[] => {
    const keywords = extractKeywords(jobDesc);
    return [
      `Consider highlighting these skills: ${keywords.join(', ')}`,
      'Tailor your experience descriptions to match job requirements',
      'Add quantifiable achievements to stand out',
    ];
  };

  const extractKeywords = (text: string): string[] => {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    return text.toLowerCase().split(/\W+/).filter(word => word.length > 2 && !commonWords.has(word));
  };

  const handleSave = () => {
    onSave(JSON.stringify(resume));
  };

  const handlePrint = () => {
    window.print();
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
                ? (typeof value === 'string' ? splitBulletPoints(value) : value)
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

  return (
    <div className="flex space-x-4">
      {/* Resume Preview */}
      <div className="w-1/2 bg-white p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{resume.name}</h1>
          <div className="flex justify-center space-x-4 text-gray-600">
            <span className="flex items-center"><FaEnvelope className="mr-2" />{resume.email}</span>
            <span className="flex items-center"><FaPhone className="mr-2" />{resume.phone}</span>
            <span className="flex items-center"><FaMapMarkerAlt className="mr-2" />{resume.location}</span>
          </div>
          <div className="flex justify-center space-x-4 mt-2 text-gray-600">
            <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center">
              <FaLinkedin className="mr-2" />LinkedIn
            </a>
            <a href={resume.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center">
              <FaGlobe className="mr-2" />Portfolio
            </a>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Professional Summary</h2>
          <p>{resume.summary}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Experience</h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold">{exp.position}</h3>
              <p className="text-gray-700 mb-1">{exp.company}</p>
              <p className="text-gray-600 mb-2">{`${exp.startDate} - ${exp.endDate}`}</p>
              <ul className="list-disc pl-5">
                {exp.description.map((item, i) => (
                  <li key={i} className="mb-1">{item}</li>
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

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Skills</h2>
          <p>{resume.skills.join(', ')}</p>
        </section>

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
      </div>

      {/* Edit Form */}
      <div className="w-1/2 space-y-4 overflow-y-auto h-screen pb-20">
        <Input
          value={resume.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Full Name"
        />
        <Input
          value={resume.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Email"
        />
        <Input
          value={resume.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Phone"
        />
        <Input
          value={resume.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="Location"
        />
        <Input
          value={resume.linkedin}
          onChange={(e) => handleInputChange('linkedin', e.target.value)}
          placeholder="LinkedIn URL"
        />
        <Input
          value={resume.portfolio}
          onChange={(e) => handleInputChange('portfolio', e.target.value)}
          placeholder="Portfolio URL"
        />
        <Textarea
          value={resume.summary}
          onChange={(e) => handleInputChange('summary', e.target.value)}
          placeholder="Professional Summary"
          rows={4}
        />

        <h3 className="text-xl font-semibold">Experience</h3>
        {resume.experience.map((exp, index) => (
          <div key={index} className="space-y-2 border p-4 rounded">
            <Input
              value={exp.position}
              onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
              placeholder="Position"
            />
            <Input
              value={exp.company}
              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
              placeholder="Company"
            />
            <div className="flex space-x-2">
              <Input
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                placeholder="Start Date"
              />
              <Input
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                placeholder="End Date"
              />
            </div>
            <Textarea
              value={exp.description.map(item => `• ${item}`).join('\n')}
              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
              placeholder="Description (one bullet point per line)"
              rows={5}
            />
            <Button onClick={() => deleteExperience(index)} className="bg-red-500 hover:bg-red-600 text-white">
              <FaTrash className="mr-2" /> Delete Experience
            </Button>
          </div>
        ))}

        <h3 className="text-xl font-semibold">Education</h3>
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

        <h3 className="text-xl font-semibold">Skills</h3>
        <Textarea
          value={resume.skills.join(', ')}
          onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(skill => skill.trim()))}
          placeholder="Skills (comma-separated)"
          rows={3}
        />

        <h3 className="text-xl font-semibold">Projects</h3>
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

        <div className="flex space-x-4 justify-center mt-6">
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white">Save Resume</Button>
          <Button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white">Print / Save as PDF</Button>
        </div>

        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Suggestions:</h3>
          <ul className="list-disc pl-5">
            {/* Your list items go here */}
          </ul>
        </div>
      </div>
    </div>
  );
}
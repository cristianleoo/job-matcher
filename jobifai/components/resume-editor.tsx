import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ResumeEditorProps {
  jobDescription: string;
  userProfile: UserProfile;
  onSave: (updatedResume: string) => void;
}

interface UserProfile {
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
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  graduationDate: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export function ResumeEditor({ jobDescription, userProfile, onSave }: ResumeEditorProps) {
  const [resume, setResume] = useState(userProfile);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Generate suggestions based on job description
    const generatedSuggestions = generateSuggestions(jobDescription, userProfile);
    setSuggestions(generatedSuggestions);
  }, [jobDescription, userProfile]);

  const generateSuggestions = (jobDesc: string, profile: UserProfile): string[] => {
    // Implement logic to generate suggestions based on job description and user profile
    // This is a placeholder implementation
    const keywords = extractKeywords(jobDesc);
    return [
      `Consider highlighting these skills: ${keywords.join(', ')}`,
      'Tailor your experience descriptions to match job requirements',
      'Add quantifiable achievements to stand out',
    ];
  };

  const extractKeywords = (text: string): string[] => {
    // Implement keyword extraction logic
    // This is a simple placeholder implementation
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    return text.toLowerCase().split(/\W+/).filter(word => word.length > 2 && !commonWords.has(word));
  };

  const handleSave = () => {
    onSave(JSON.stringify(resume));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div id="resume" className="bg-white p-8 shadow-lg max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{userProfile.name}</h1>
        <p className="text-gray-600 mb-4">{userProfile.email} | {userProfile.phone}</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2 border-b-2 border-gray-300">Experience</h2>
        {resume.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-xl font-semibold">{exp.position}</h3>
            <p className="text-gray-600">{exp.company} | {exp.startDate} - {exp.endDate}</p>
            <Textarea
              value={exp.description}
              onChange={(e) => {
                const newExperience = [...resume.experience];
                newExperience[index].description = e.target.value;
                setResume({ ...resume, experience: newExperience });
              }}
              className="mt-2"
              rows={3}
            />
          </div>
        ))}

        <h2 className="text-2xl font-semibold mt-6 mb-2 border-b-2 border-gray-300">Education</h2>
        {resume.education.map((edu, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-xl font-semibold">{edu.degree}</h3>
            <p className="text-gray-600">{edu.institution} | Graduated: {edu.graduationDate}</p>
          </div>
        ))}

        <h2 className="text-2xl font-semibold mt-6 mb-2 border-b-2 border-gray-300">Skills</h2>
        <Textarea
          value={resume.skills.join(', ')}
          onChange={(e) => setResume({ ...resume, skills: e.target.value.split(', ') })}
          className="mt-2"
          rows={3}
        />

        <h2 className="text-2xl font-semibold mt-6 mb-2 border-b-2 border-gray-300">Projects</h2>
        {resume.projects.map((project, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-xl font-semibold">{project.name}</h3>
            <Textarea
              value={project.description}
              onChange={(e) => {
                const newProjects = [...resume.projects];
                newProjects[index].description = e.target.value;
                setResume({ ...resume, projects: newProjects });
              }}
              className="mt-2"
              rows={3}
            />
            <p className="text-gray-600 mt-2">Technologies: {project.technologies.join(', ')}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Suggestions:</h3>
        <ul className="list-disc pl-5">
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>

      <div className="flex space-x-4">
        <Button onClick={handleSave}>Save Resume</Button>
        <Button onClick={handlePrint}>Print / Save as PDF</Button>
      </div>
    </div>
  );
}
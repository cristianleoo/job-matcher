import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGlobe } from 'react-icons/fa';

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

  return (
    <div className="space-y-4">
      <div id="resume" className="bg-white p-8 shadow-lg max-w-4xl mx-auto">
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
          <Textarea
            value={resume.summary || ''}
            onChange={(e) => setResume({ ...resume, summary: e.target.value })}
            className="w-full"
            rows={4}
            placeholder="Write a brief professional summary..."
          />
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Experience</h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xl font-semibold">{exp.position}</h3>
                <p className="text-gray-600 text-sm">{exp.startDate} - {exp.endDate}</p>
              </div>
              <p className="text-gray-700 mb-2">{exp.company}</p>
              <Textarea
                value={exp.description}
                onChange={(e) => {
                  const newExperience = [...resume.experience];
                  newExperience[index].description = e.target.value;
                  setResume({ ...resume, experience: newExperience });
                }}
                className="w-full"
                rows={3}
              />
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
          <Textarea
            value={resume.skills.join(', ')}
            onChange={(e) => setResume({ ...resume, skills: e.target.value.split(', ') })}
            className="w-full"
            rows={3}
          />
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 border-b-2 border-gray-300 pb-1">Projects</h2>
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
                className="w-full mt-2"
                rows={3}
              />
              <p className="text-gray-600 mt-2">Technologies: {project.technologies.join(', ')}</p>
            </div>
          ))}
        </section>
      </div>

      <div className="mt-4 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Suggestions:</h3>
        <ul className="list-disc pl-5">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="text-gray-700">{suggestion}</li>
          ))}
        </ul>
      </div>

      <div className="flex space-x-4 justify-center mt-6">
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white">Save Resume</Button>
        <Button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white">Print / Save as PDF</Button>
      </div>
    </div>
  );
}
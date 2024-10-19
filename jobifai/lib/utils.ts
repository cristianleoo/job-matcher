import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Experience, Education, Project, UserProfile } from '@/app/types';
import { ResumeType } from '@/components/resume-editor';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Resume {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b(\w+)\b/g) || [];
}

function calculateTF(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  return tf;
}

function calculateCosineSimilarity(tf1: Record<string, number>, tf2: Record<string, number>): number {
  const keys = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  keys.forEach(key => {
    const v1 = tf1[key] || 0;
    const v2 = tf2[key] || 0;
    dotProduct += v1 * v2;
    magnitude1 += v1 * v1;
    magnitude2 += v2 * v2;
  });

  const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  return magnitude ? dotProduct / magnitude : 0;
}

export function calculateSimilarity(resume: ResumeType, jobDescription: string): number {
  // Convert resume to a string
  const resumeString = JSON.stringify(resume).toLowerCase();
  const jobDescLower = jobDescription.toLowerCase();

  // Count matching words
  const resumeWords = new Set(resumeString.match(/\w+/g) || []);
  const jobWords = new Set(jobDescLower.match(/\w+/g) || []);
  const matchingWords = [...resumeWords].filter(word => jobWords.has(word));

  // Calculate similarity score
  const similarity = matchingWords.length / jobWords.size;
  return Math.min(similarity, 1); // Ensure the score is between 0 and 1
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Experience, Education, Project, UserProfile } from '@/app/types';
import { ResumeType } from 'lib/types';

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

export async function calculateCosineSimilarity(jobDescription: string, userProfile: UserProfile): Promise<number> {
  // This is a placeholder implementation
  // You should replace this with an actual cosine similarity calculation
  // or a call to an API that performs this calculation
  
  // For now, we'll return a random number between 0 and 1
  return Math.random();
}

export function calculateSimilarity(resume: ResumeType, jobDescription: string): number {
  // Convert resume to a string
  const resumeString = JSON.stringify(resume).toLowerCase();
  const jobDescLower = jobDescription.toLowerCase();

  // Count matching words
  const resumeWords = new Set(resumeString.match(/\w+/g) || []);
  const jobWords = new Set(jobDescLower.match(/\w+/g) || []);
  const matchingWords = Array.from(resumeWords).filter(word => jobWords.has(word));

  // Calculate similarity score
  const similarity = matchingWords.length / jobWords.size;
  return Math.min(similarity, 1); // Ensure the score is between 0 and 1
}

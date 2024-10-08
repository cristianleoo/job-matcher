export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string;
  linkedin_profile: string;
  github_profile: string;
  personal_website: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
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
export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  graduationDate: string;
}

export interface Project {
  name: string;
  description: string[];
  technologies: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  profilePicture?: string;
  skills?: string[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  // Add any other relevant fields for your application
}
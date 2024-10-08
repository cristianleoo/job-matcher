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
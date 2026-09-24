export type CVBasics = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  photo: string;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Education = {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  link: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
};

export type CVSectionType =
  | "basics"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "custom";

export type CVSection = {
  id: string;
  type: CVSectionType;
  title: string;
  visible: boolean;
  order: number;
  data:
    | CVBasics
    | string
    | string[]
    | Experience[]
    | Education[]
    | Project[]
    | Certification[]
    | {
        content: string;
      };
};

export type CVDocumentSettings = {
  templateId: string;
  accentColor?: string;
  fontFamily?: string;
};

export type CVDocument = {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  settings: CVDocumentSettings;
  sections: CVSection[];
};
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

type CVSectionBase = {
  id: string;
  title: string;
  visible: boolean;
  order: number;
};

export type CVBasicsSection = CVSectionBase & {
  type: "basics";
  data: CVBasics;
};

export type CVSummarySection = CVSectionBase & {
  type: "summary";
  data: string;
};

export type CVExperienceSection = CVSectionBase & {
  type: "experience";
  data: Experience[];
};

export type CVEducationSection = CVSectionBase & {
  type: "education";
  data: Education[];
};

export type CVSkillsSection = CVSectionBase & {
  type: "skills";
  data: string[];
};

export type CVProjectsSection = CVSectionBase & {
  type: "projects";
  data: Project[];
};

export type CVCertificationsSection = CVSectionBase & {
  type: "certifications";
  data: Certification[];
};

export type CVCustomSection = CVSectionBase & {
  type: "custom";
  data: {
    content: string;
  };
};

export type CVSection =
  | CVBasicsSection
  | CVSummarySection
  | CVExperienceSection
  | CVEducationSection
  | CVSkillsSection
  | CVProjectsSection
  | CVCertificationsSection
  | CVCustomSection;

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
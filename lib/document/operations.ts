import type {
  CVBasics,
  CVDocument,
  CVSection,
  CVSectionType,
  Certification,
  Education,
  Experience,
  Project,
} from "./types";

export function getSection(
  document: CVDocument,
  type: CVSectionType,
): CVSection | undefined {
  return document.sections.find((section) => section.type === type);
}

export function getBasics(document: CVDocument): CVBasics {
  const section = getSection(document, "basics");

  if (section && typeof section.data === "object" && !Array.isArray(section.data)) {
    return section.data as CVBasics;
  }

  return {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    photo: "",
  };
}

export function getSummary(document: CVDocument): string {
  const section = getSection(document, "summary");
  return typeof section?.data === "string" ? section.data : "";
}

export function getSkills(document: CVDocument): string[] {
  const section = getSection(document, "skills");
  return Array.isArray(section?.data)
    ? (section.data as string[])
    : [];
}

export function getExperience(document: CVDocument): Experience[] {
  const section = getSection(document, "experience");
  return Array.isArray(section?.data)
    ? (section.data as Experience[])
    : [];
}

export function getEducation(document: CVDocument): Education[] {
  const section = getSection(document, "education");
  return Array.isArray(section?.data)
    ? (section.data as Education[])
    : [];
}

export function getProjects(document: CVDocument): Project[] {
  const section = getSection(document, "projects");
  return Array.isArray(section?.data)
    ? (section.data as Project[])
    : [];
}

export function getCertifications(
  document: CVDocument,
): Certification[] {
  const section = getSection(document, "certifications");

  return Array.isArray(section?.data)
    ? (section.data as Certification[])
    : [];
}

export function updateSectionData(
  document: CVDocument,
  type: CVSectionType,
  data: CVSection["data"],
): CVDocument {
  return {
    ...document,
    updatedAt: new Date().toISOString(),
    sections: document.sections.map((section) =>
      section.type === type
        ? { ...section, data }
        : section,
    ),
  };
}

export function updateBasics(
  document: CVDocument,
  field: keyof CVBasics,
  value: string,
): CVDocument {
  const basics = getBasics(document);

  return updateSectionData(document, "basics", {
    ...basics,
    [field]: value,
  });
}

export function updateSummary(
  document: CVDocument,
  value: string,
): CVDocument {
  return updateSectionData(document, "summary", value);
}

export function updateSkills(
  document: CVDocument,
  skills: string[],
): CVDocument {
  return updateSectionData(document, "skills", skills);
}

export function updateExperience(
  document: CVDocument,
  items: Experience[],
): CVDocument {
  return updateSectionData(document, "experience", items);
}

export function updateEducation(
  document: CVDocument,
  items: Education[],
): CVDocument {
  return updateSectionData(document, "education", items);
}

export function updateProjects(
  document: CVDocument,
  items: Project[],
): CVDocument {
  return updateSectionData(document, "projects", items);
}

export function updateCertifications(
  document: CVDocument,
  items: Certification[],
): CVDocument {
  return updateSectionData(document, "certifications", items);
}

export function createDocumentFromLegacyCV(
  value: unknown,
): CVDocument | null {
  if (!value || typeof value !== "object") return null;

  const legacy = value as Record<string, unknown>;
  const basics = legacy.basics;

  if (
    !basics ||
    typeof basics !== "object" ||
    Array.isArray(basics) ||
    typeof legacy.summary !== "string" ||
    !Array.isArray(legacy.skills) ||
    !Array.isArray(legacy.experience) ||
    !Array.isArray(legacy.education) ||
    !Array.isArray(legacy.projects) ||
    !Array.isArray(legacy.certifications)
  ) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    id: `cv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "Untitled CV",
    version: 1,
    createdAt: now,
    updatedAt: now,
    settings: {
      templateId: "professional",
    },
    sections: [
      {
        id: `basics-${Date.now()}`,
        type: "basics",
        title: "Personal information",
        visible: true,
        order: 0,
        data: basics as CVBasics,
      },
      {
        id: `summary-${Date.now()}`,
        type: "summary",
        title: "Profile",
        visible: true,
        order: 1,
        data: legacy.summary,
      },
      {
        id: `experience-${Date.now()}`,
        type: "experience",
        title: "Experience",
        visible: true,
        order: 2,
        data: legacy.experience as Experience[],
      },
      {
        id: `education-${Date.now()}`,
        type: "education",
        title: "Education",
        visible: true,
        order: 3,
        data: legacy.education as Education[],
      },
      {
        id: `skills-${Date.now()}`,
        type: "skills",
        title: "Skills",
        visible: true,
        order: 4,
        data: legacy.skills as string[],
      },
      {
        id: `projects-${Date.now()}`,
        type: "projects",
        title: "Projects",
        visible: true,
        order: 5,
        data: legacy.projects as Project[],
      },
      {
        id: `certifications-${Date.now()}`,
        type: "certifications",
        title: "Certifications",
        visible: true,
        order: 6,
        data: legacy.certifications as Certification[],
      },
    ],
  };
}
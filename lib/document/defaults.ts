import type {
  CVBasics,
  CVDocument,
  CVSection,
} from "./types";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function createDefaultBasics(): CVBasics {
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

export function createDefaultSections(): CVSection[] {
  return [
    {
      id: createId("basics"),
      type: "basics",
      title: "Personal information",
      visible: true,
      order: 0,
      data: createDefaultBasics(),
    },
    {
      id: createId("summary"),
      type: "summary",
      title: "Profile",
      visible: true,
      order: 1,
      data: "",
    },
    {
      id: createId("experience"),
      type: "experience",
      title: "Experience",
      visible: true,
      order: 2,
      data: [],
    },
    {
      id: createId("education"),
      type: "education",
      title: "Education",
      visible: true,
      order: 3,
      data: [],
    },
    {
      id: createId("skills"),
      type: "skills",
      title: "Skills",
      visible: true,
      order: 4,
      data: [],
    },
    {
      id: createId("projects"),
      type: "projects",
      title: "Projects",
      visible: true,
      order: 5,
      data: [],
    },
    {
      id: createId("certifications"),
      type: "certifications",
      title: "Certifications",
      visible: true,
      order: 6,
      data: [],
    },
  ];
}

export function createDefaultDocument(): CVDocument {
  const now = new Date().toISOString();

  return {
    id: createId("cv"),
    name: "Untitled CV",
    version: 1,
    createdAt: now,
    updatedAt: now,
    settings: {
      templateId: "professional",
    },
    sections: createDefaultSections(),
  };
}
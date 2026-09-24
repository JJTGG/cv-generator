import type {
  CVBasics,
  CVDocument,
  CVSection,
  CVSectionType,
} from "./types";

const SECTION_TYPES: CVSectionType[] = [
  "basics",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "custom",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBasics(value: unknown): value is CVBasics {
  if (!isRecord(value)) return false;

  return (
    isString(value.name) &&
    isString(value.title) &&
    isString(value.email) &&
    isString(value.phone) &&
    isString(value.location) &&
    isString(value.website) &&
    isString(value.linkedin) &&
    isString(value.photo)
  );
}

function isSectionType(value: unknown): value is CVSectionType {
  return (
    isString(value) &&
    SECTION_TYPES.includes(value as CVSectionType)
  );
}

function isSection(value: unknown): value is CVSection {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isSectionType(value.type) &&
    isString(value.title) &&
    typeof value.visible === "boolean" &&
    typeof value.order === "number" &&
    "data" in value
  );
}

export function isValidCVDocument(
  value: unknown,
): value is CVDocument {
  if (!isRecord(value)) return false;

  if (
    !isString(value.id) ||
    !isString(value.name) ||
    typeof value.version !== "number" ||
    !isString(value.createdAt) ||
    !isString(value.updatedAt)
  ) {
    return false;
  }

  if (!isRecord(value.settings)) return false;

  if (!isString(value.settings.templateId)) {
    return false;
  }

  if (!Array.isArray(value.sections)) {
    return false;
  }

  return value.sections.every(isSection);
}

export function validateCVDocument(value: unknown): string[] {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return ["Document must be an object."];
  }

  if (!isString(value.id) || value.id.trim() === "") {
    errors.push("Document ID is missing.");
  }

  if (!isString(value.name) || value.name.trim() === "") {
    errors.push("Document name is missing.");
  }

  if (
    typeof value.version !== "number" ||
    !Number.isInteger(value.version) ||
    value.version < 1
  ) {
    errors.push("Document version is invalid.");
  }

  if (!isString(value.createdAt)) {
    errors.push("Created timestamp is missing.");
  }

  if (!isString(value.updatedAt)) {
    errors.push("Updated timestamp is missing.");
  }

  if (!isRecord(value.settings)) {
    errors.push("Document settings are missing.");
  } else if (
    !isString(value.settings.templateId) ||
    value.settings.templateId.trim() === ""
  ) {
    errors.push("Template ID is missing.");
  }

  if (!Array.isArray(value.sections)) {
    errors.push("Document sections must be an array.");
  } else {
    value.sections.forEach((section, index) => {
      if (!isSection(section)) {
        errors.push(`Section ${index + 1} is invalid.`);
      }
    });
  }

  return errors;
}

export function getBasicsSection(
  document: CVDocument,
): CVSection | undefined {
  return document.sections.find(
    (section) => section.type === "basics",
  );
}

export function isValidBasics(value: unknown): value is CVBasics {
  return isBasics(value);
}
import type {
  Certification,
  CVBasics,
  CVDocument,
  CVSection,
  CVSectionType,
  Education,
  Experience,
  Project,
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

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => isString(item))
  );
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

function isExperience(value: unknown): value is Experience {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.role) &&
    isString(value.company) &&
    isString(value.location) &&
    isString(value.startDate) &&
    isString(value.endDate) &&
    isString(value.description)
  );
}

function isEducation(value: unknown): value is Education {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.degree) &&
    isString(value.school) &&
    isString(value.location) &&
    isString(value.startDate) &&
    isString(value.endDate)
  );
}

function isProject(value: unknown): value is Project {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.description) &&
    isString(value.link)
  );
}

function isCertification(
  value: unknown,
): value is Certification {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.issuer) &&
    isString(value.date) &&
    isString(value.link)
  );
}

function isCustomSectionData(
  value: unknown,
): value is { content: string } {
  return (
    isRecord(value) &&
    isString(value.content)
  );
}

function isSectionType(value: unknown): value is CVSectionType {
  return (
    isString(value) &&
    SECTION_TYPES.includes(value as CVSectionType)
  );
}

function isValidSectionData(
  type: CVSectionType,
  data: unknown,
): boolean {
  switch (type) {
    case "basics":
      return isBasics(data);

    case "summary":
      return isString(data);

    case "experience":
      return (
        Array.isArray(data) &&
        data.every(isExperience)
      );

    case "education":
      return (
        Array.isArray(data) &&
        data.every(isEducation)
      );

    case "skills":
      return isStringArray(data);

    case "projects":
      return (
        Array.isArray(data) &&
        data.every(isProject)
      );

    case "certifications":
      return (
        Array.isArray(data) &&
        data.every(isCertification)
      );

    case "custom":
      return isCustomSectionData(data);

    default:
      return false;
  }
}

function isSection(value: unknown): value is CVSection {
  if (!isRecord(value)) return false;

  if (
    !isString(value.id) ||
    value.id.trim() === "" ||
    !isSectionType(value.type) ||
    !isString(value.title) ||
    typeof value.visible !== "boolean" ||
    typeof value.order !== "number" ||
    !Number.isFinite(value.order)
  ) {
    return false;
  }

  return isValidSectionData(value.type, value.data);
}

export function isValidCVDocument(
  value: unknown,
): value is CVDocument {
  if (!isRecord(value)) return false;

  if (
    !isString(value.id) ||
    value.id.trim() === "" ||
    !isString(value.name) ||
    value.name.trim() === "" ||
    typeof value.version !== "number" ||
    !Number.isInteger(value.version) ||
    value.version < 1 ||
    !isString(value.createdAt) ||
    !isString(value.updatedAt)
  ) {
    return false;
  }

  if (!isRecord(value.settings)) return false;

  if (
    !isString(value.settings.templateId) ||
    value.settings.templateId.trim() === ""
  ) {
    return false;
  }

  if (!Array.isArray(value.sections)) {
    return false;
  }

  if (!value.sections.every(isSection)) {
    return false;
  }

  const sectionIds = value.sections.map(
    (section) => section.id,
  );

  if (new Set(sectionIds).size !== sectionIds.length) {
    return false;
  }

  return true;
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
    return errors;
  }

  const sectionIds = new Set<string>();

  value.sections.forEach((section, index) => {
    const position = index + 1;

    if (!isRecord(section)) {
      errors.push(`Section ${position} is invalid.`);
      return;
    }

    if (
      !isString(section.id) ||
      section.id.trim() === ""
    ) {
      errors.push(`Section ${position} has no ID.`);
    } else if (sectionIds.has(section.id)) {
      errors.push(
        `Section ${position} has a duplicate ID.`,
      );
    } else {
      sectionIds.add(section.id);
    }

    if (!isSectionType(section.type)) {
      errors.push(
        `Section ${position} has an invalid type.`,
      );
    }

    if (!isString(section.title)) {
      errors.push(
        `Section ${position} title is invalid.`,
      );
    }

    if (typeof section.visible !== "boolean") {
      errors.push(
        `Section ${position} visibility is invalid.`,
      );
    }

    if (
      typeof section.order !== "number" ||
      !Number.isFinite(section.order)
    ) {
      errors.push(
        `Section ${position} order is invalid.`,
      );
    }

    if (
      isSectionType(section.type) &&
      !isValidSectionData(
        section.type,
        section.data,
      )
    ) {
      errors.push(
        `Section ${position} data is invalid for type "${section.type}".`,
      );
    }
  });

  return errors;
}

export function getBasicsSection(
  document: CVDocument,
): CVSection | undefined {
  return document.sections.find(
    (section) => section.type === "basics",
  );
}

export function isValidBasics(
  value: unknown,
): value is CVBasics {
  return isBasics(value);
}
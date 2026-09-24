import type { CVDocument } from "../document/types";
import { isValidCVDocument } from "../document/validation";

const STORAGE_KEY = "cv-studio-document";

type StoredDocument = {
  version: number;
  document: CVDocument;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadDocument(): CVDocument | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === "object" &&
      "document" in parsed &&
      isValidCVDocument(parsed.document)
    ) {
      return parsed.document;
    }

    if (isValidCVDocument(parsed)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveDocument(document: CVDocument): boolean {
  if (!canUseStorage()) return false;

  try {
    const stored: StoredDocument = {
      version: document.version,
      document,
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(stored),
    );

    return true;
  } catch {
    return false;
  }
}

export function removeDocument(): boolean {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
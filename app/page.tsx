"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { CVEditor } from "@/components/editor/CVEditor";
import { CVPreview } from "@/components/preview/CVPreview";
import { createDefaultDocument } from "@/lib/document/defaults";
import {
  createDocumentFromLegacyCV,
} from "@/lib/document/operations";
import type { CVDocument } from "@/lib/document/types";
import { isValidCVDocument } from "@/lib/document/validation";
import {
  loadDocument,
  removeDocument,
  saveDocument,
} from "@/lib/persistence/localStorage";

const STORAGE_KEY = "cv-studio-document";

export default function HomePage() {
  const [cv, setCv] = useState<CVDocument | null>(null);
  const [ready, setReady] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let document = loadDocument();

    if (!document) {
      try {
        const legacyRaw =
          window.localStorage.getItem(STORAGE_KEY);

        if (legacyRaw) {
          const legacyParsed: unknown =
            JSON.parse(legacyRaw);

          const migrated =
            createDocumentFromLegacyCV(legacyParsed);

          if (migrated) {
            document = migrated;
            saveDocument(migrated);
          }
        }
      } catch {
        // Ignore malformed legacy data.
      }
    }

    if (!document) {
      document = createDefaultDocument();
    }

    setCv(document);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !cv) return;

    const timeout = window.setTimeout(() => {
      saveDocument(cv);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [cv, ready]);

  function resetDocument() {
    const confirmed = window.confirm(
      "Reset this CV? All current content will be removed.",
    );

    if (!confirmed) return;

    const nextDocument = createDefaultDocument();

    removeDocument();
    setCv(nextDocument);
  }

  function exportDocument() {
    if (!cv) return;

    const payload = JSON.stringify(
      {
        version: cv.version,
        document: cv,
      },
      null,
      2,
    );

    const blob = new Blob([payload], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");

    anchor.href = url;
    anchor.download = "cv-studio-document.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function importDocument() {
    fileInputRef.current?.click();
  }

  function handleImportFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImportError("");

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(
          String(reader.result),
        );

        let imported: CVDocument | null = null;

        if (
          parsed &&
          typeof parsed === "object" &&
          "document" in parsed
        ) {
          const wrapped = parsed as {
            document?: unknown;
          };

          if (isValidCVDocument(wrapped.document)) {
            imported = wrapped.document;
          }
        } else if (isValidCVDocument(parsed)) {
          imported = parsed;
        } else {
          imported = createDocumentFromLegacyCV(parsed);
        }

        if (!imported) {
          setImportError(
            "That file does not contain a valid CV document.",
          );
          return;
        }

        setCv({
          ...imported,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        setImportError(
          "Could not read that file as JSON.",
        );
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setImportError("Could not read that file.");
      event.target.value = "";
    };

    reader.readAsText(file);
  }

  function printDocument() {
    window.print();
  }

  if (!ready || !cv) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-6 text-sm text-gray-500">
        Loading CV Studio…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3]">
      <header className="cv-app-header sticky top-0 z-20 border-b border-gray-200 bg-[#f5f5f3]/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-gray-900">
              CV Studio
            </h1>

            <p className="text-xs text-gray-500">
              Your document stays in this browser.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={importDocument}
              className="border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-gray-500 hover:text-gray-900"
            >
              Import
            </button>

            <button
              type="button"
              onClick={exportDocument}
              className="border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-gray-500 hover:text-gray-900"
            >
              Export
            </button>

            <button
              type="button"
              onClick={printDocument}
              className="bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-700"
            >
              Print / PDF
            </button>
          </div>
        </div>
      </header>

      {importError ? (
        <div className="cv-import-error border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700 print:hidden">
          {importError}
        </div>
      ) : null}

      <div className="cv-layout mx-auto grid max-w-[1500px] lg:grid-cols-[430px_minmax(0,1fr)]">
        <CVEditor
          document={cv}
          onChange={setCv}
          onReset={resetDocument}
        />

        <CVPreview document={cv} />
      </div>
    </main>
  );
}
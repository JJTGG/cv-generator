"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import type {
  Certification,
  CVBasics,
  CVDocument,
  Education,
  Experience,
  Project,
} from "@/lib/document/types";
import {
  createDefaultDocument,
} from "@/lib/document/defaults";
import {
  createDocumentFromLegacyCV,
  getBasics,
  getCertifications,
  getEducation,
  getExperience,
  getProjects,
  getSkills,
  getSummary,
  updateBasics,
  updateCertifications,
  updateEducation,
  updateExperience,
  updateProjects,
  updateSectionData,
  updateSkills,
  updateSummary,
} from "@/lib/document/operations";
import { isValidCVDocument } from "@/lib/document/validation";
import {
  loadDocument,
  removeDocument,
  saveDocument,
} from "@/lib/persistence/localStorage";
import { ProfessionalTemplate } from "@/components/preview/templates/ProfessionalTemplate";

const STORAGE_KEY = "cv-studio-document";

function createItemId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function EditorField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-700"
      />
    </label>
  );
}

function EditorTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y border border-gray-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-gray-900 outline-none transition focus:border-gray-700"
      />
    </label>
  );
}

function EditorSection({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="border-b border-gray-200 px-5 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {title}
        </h2>
        {action}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ItemActions({
  onRemove,
}: {
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-4 transition hover:text-red-600"
    >
      Remove
    </button>
  );
}

function EmptyState({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="text-sm leading-relaxed text-gray-500">
      {children}
    </p>
  );
}

export default function HomePage() {
  const [cv, setCv] = useState<CVDocument | null>(null);
  const [ready, setReady] = useState(false);
  const [importError, setImportError] = useState("");
  const [skillInput, setSkillInput] = useState("");
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

  function updateDocument(
    nextDocument: CVDocument,
  ) {
    setCv(nextDocument);
  }

  function handleBasicsChange(
    field: keyof CVBasics,
    value: string,
  ) {
    if (!cv) return;

    updateDocument(
      updateBasics(cv, field, value),
    );
  }

  function handleSummaryChange(value: string) {
    if (!cv) return;

    updateDocument(
      updateSummary(cv, value),
    );
  }

  function addSkill() {
    if (!cv) return;

    const skill = skillInput.trim();

    if (!skill) return;

    const existingSkills = getSkills(cv);

    if (
      existingSkills.some(
        (item) =>
          item.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      setSkillInput("");
      return;
    }

    updateDocument(
      updateSkills(cv, [
        ...existingSkills,
        skill,
      ]),
    );

    setSkillInput("");
  }

  function handleSkillInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skillToRemove: string) {
    if (!cv) return;

    updateDocument(
      updateSkills(
        cv,
        getSkills(cv).filter(
          (skill) => skill !== skillToRemove,
        ),
      ),
    );
  }

  function handleExperienceChange(
    id: string,
    field: keyof Experience,
    value: string,
  ) {
    if (!cv) return;

    const experience = getExperience(cv).map(
      (item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
    );

    updateDocument(
      updateExperience(cv, experience),
    );
  }

  function addExperience() {
    if (!cv) return;

    const experience = [
      ...getExperience(cv),
      {
        id: createItemId("experience"),
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ];

    updateDocument(
      updateExperience(cv, experience),
    );
  }

  function removeExperience(id: string) {
    if (!cv) return;

    updateDocument(
      updateExperience(
        cv,
        getExperience(cv).filter(
          (item) => item.id !== id,
        ),
      ),
    );
  }

  function handleEducationChange(
    id: string,
    field: keyof Education,
    value: string,
  ) {
    if (!cv) return;

    const education = getEducation(cv).map(
      (item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
    );

    updateDocument(
      updateEducation(cv, education),
    );
  }

  function addEducation() {
    if (!cv) return;

    const education = [
      ...getEducation(cv),
      {
        id: createItemId("education"),
        degree: "",
        school: "",
        location: "",
        startDate: "",
        endDate: "",
      },
    ];

    updateDocument(
      updateEducation(cv, education),
    );
  }

  function removeEducation(id: string) {
    if (!cv) return;

    updateDocument(
      updateEducation(
        cv,
        getEducation(cv).filter(
          (item) => item.id !== id,
        ),
      ),
    );
  }

  function handleProjectChange(
    id: string,
    field: keyof Project,
    value: string,
  ) {
    if (!cv) return;

    const projects = getProjects(cv).map(
      (item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
    );

    updateDocument(
      updateProjects(cv, projects),
    );
  }

  function addProject() {
    if (!cv) return;

    const projects = [
      ...getProjects(cv),
      {
        id: createItemId("project"),
        name: "",
        description: "",
        link: "",
      },
    ];

    updateDocument(
      updateProjects(cv, projects),
    );
  }

  function removeProject(id: string) {
    if (!cv) return;

    updateDocument(
      updateProjects(
        cv,
        getProjects(cv).filter(
          (item) => item.id !== id,
        ),
      ),
    );
  }

  function handleCertificationChange(
    id: string,
    field: keyof Certification,
    value: string,
  ) {
    if (!cv) return;

    const certifications =
      getCertifications(cv).map(
        (item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
              }
            : item,
      );

    updateDocument(
      updateCertifications(
        cv,
        certifications,
      ),
    );
  }

  function addCertification() {
    if (!cv) return;

    const certifications = [
      ...getCertifications(cv),
      {
        id: createItemId("certification"),
        name: "",
        issuer: "",
        date: "",
        link: "",
      },
    ];

    updateDocument(
      updateCertifications(
        cv,
        certifications,
      ),
    );
  }

  function removeCertification(id: string) {
    if (!cv) return;

    updateDocument(
      updateCertifications(
        cv,
        getCertifications(cv).filter(
          (item) => item.id !== id,
        ),
      ),
    );
  }

  function resetDocument() {
    const confirmed = window.confirm(
      "Reset this CV? All current content will be removed.",
    );

    if (!confirmed) return;

    const nextDocument =
      createDefaultDocument();

    removeDocument();
    setCv(nextDocument);
    setSkillInput("");
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

    const url =
      URL.createObjectURL(blob);

    const anchor =
      window.document.createElement("a");

    anchor.href = url;
    anchor.download =
      "cv-studio-document.json";
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
        const parsed: unknown =
          JSON.parse(
            String(reader.result),
          );

        let imported:
          | CVDocument
          | null = null;

        if (
          parsed &&
          typeof parsed === "object" &&
          "document" in parsed
        ) {
          const wrapped =
            parsed as {
              document?: unknown;
            };

          if (
            isValidCVDocument(
              wrapped.document,
            )
          ) {
            imported =
              wrapped.document;
          }
        } else if (
          isValidCVDocument(parsed)
        ) {
          imported = parsed;
        } else {
          imported =
            createDocumentFromLegacyCV(
              parsed,
            );
        }

        if (!imported) {
          setImportError(
            "That file does not contain a valid CV document.",
          );
          return;
        }

        setCv({
          ...imported,
          updatedAt:
            new Date().toISOString(),
        });

        setSkillInput("");
      } catch {
        setImportError(
          "Could not read that file as JSON.",
        );
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setImportError(
        "Could not read that file.",
      );
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

  const basics = getBasics(cv);
  const summary = getSummary(cv);
  const skills = getSkills(cv);
  const experience = getExperience(cv);
  const education = getEducation(cv);
  const projects = getProjects(cv);
  const certifications =
    getCertifications(cv);

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
              onChange={
                handleImportFile
              }
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
        <aside className="cv-editor-sidebar min-h-[calc(100vh-61px)] border-r border-gray-200 bg-[#f5f5f3] print:hidden">
          <div className="sticky top-[61px] max-h-[calc(100vh-61px)] overflow-y-auto">
            <EditorSection title="Personal information">
              <EditorField
                label="Name"
                value={basics.name}
                onChange={(value) =>
                  handleBasicsChange(
                    "name",
                    value,
                  )
                }
                placeholder="Your name"
              />

              <EditorField
                label="Professional title"
                value={basics.title}
                onChange={(value) =>
                  handleBasicsChange(
                    "title",
                    value,
                  )
                }
                placeholder="Software Developer"
              />

              <EditorField
                label="Email"
                value={basics.email}
                onChange={(value) =>
                  handleBasicsChange(
                    "email",
                    value,
                  )
                }
                placeholder="you@example.com"
                type="email"
              />

              <EditorField
                label="Phone"
                value={basics.phone}
                onChange={(value) =>
                  handleBasicsChange(
                    "phone",
                    value,
                  )
                }
                placeholder="+234..."
              />

              <EditorField
                label="Location"
                value={basics.location}
                onChange={(value) =>
                  handleBasicsChange(
                    "location",
                    value,
                  )
                }
                placeholder="Abeokuta, Nigeria"
              />

              <EditorField
                label="Website"
                value={basics.website}
                onChange={(value) =>
                  handleBasicsChange(
                    "website",
                    value,
                  )
                }
                placeholder="https://example.com"
              />

              <EditorField
                label="LinkedIn"
                value={basics.linkedin}
                onChange={(value) =>
                  handleBasicsChange(
                    "linkedin",
                    value,
                  )
                }
                placeholder="https://linkedin.com/in/..."
              />
            </EditorSection>

            <EditorSection title="Profile">
              <EditorTextarea
                label="Summary"
                value={summary}
                onChange={
                  handleSummaryChange
                }
                placeholder="A concise professional summary..."
                rows={7}
              />
            </EditorSection>

            <EditorSection
              title="Experience"
              action={
                <button
                  type="button"
                  onClick={
                    addExperience
                  }
                  className="text-xs font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
                >
                  Add
                </button>
              }
            >
              {experience.length === 0 ? (
                <EmptyState>
                  Add your professional
                  experience.
                </EmptyState>
              ) : (
                experience.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="space-y-4 border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">
                          Experience{" "}
                          {index + 1}
                        </p>

                        <ItemActions
                          onRemove={() =>
                            removeExperience(
                              item.id,
                            )
                          }
                        />
                      </div>

                      <EditorField
                        label="Role"
                        value={item.role}
                        onChange={(
                          value,
                        ) =>
                          handleExperienceChange(
                            item.id,
                            "role",
                            value,
                          )
                        }
                        placeholder="Software Developer"
                      />

                      <EditorField
                        label="Company"
                        value={
                          item.company
                        }
                        onChange={(
                          value,
                        ) =>
                          handleExperienceChange(
                            item.id,
                            "company",
                            value,
                          )
                        }
                        placeholder="Company name"
                      />

                      <EditorField
                        label="Location"
                        value={
                          item.location
                        }
                        onChange={(
                          value,
                        ) =>
                          handleExperienceChange(
                            item.id,
                            "location",
                            value,
                          )
                        }
                        placeholder="Lagos, Nigeria"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <EditorField
                          label="Start"
                          value={
                            item.startDate
                          }
                          onChange={(
                            value,
                          ) =>
                            handleExperienceChange(
                              item.id,
                              "startDate",
                              value,
                            )
                          }
                          placeholder="2024"
                        />

                        <EditorField
                          label="End"
                          value={
                            item.endDate
                          }
                          onChange={(
                            value,
                          ) =>
                            handleExperienceChange(
                              item.id,
                              "endDate",
                              value,
                            )
                          }
                          placeholder="Present"
                        />
                      </div>

                      <EditorTextarea
                        label="Description"
                        value={
                          item.description
                        }
                        onChange={(
                          value,
                        ) =>
                          handleExperienceChange(
                            item.id,
                            "description",
                            value,
                          )
                        }
                        placeholder="Describe your responsibilities and results..."
                        rows={6}
                      />
                    </div>
                  ),
                )
              )}
            </EditorSection>

            <EditorSection
              title="Education"
              action={
                <button
                  type="button"
                  onClick={
                    addEducation
                  }
                  className="text-xs font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
                >
                  Add
                </button>
              }
            >
              {education.length === 0 ? (
                <EmptyState>
                  Add your education
                  history.
                </EmptyState>
              ) : (
                education.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="space-y-4 border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">
                          Education{" "}
                          {index + 1}
                        </p>

                        <ItemActions
                          onRemove={() =>
                            removeEducation(
                              item.id,
                            )
                          }
                        />
                      </div>

                      <EditorField
                        label="Degree / qualification"
                        value={
                          item.degree
                        }
                        onChange={(
                          value,
                        ) =>
                          handleEducationChange(
                            item.id,
                            "degree",
                            value,
                          )
                        }
                        placeholder="B.Sc. Computer Science"
                      />

                      <EditorField
                        label="School"
                        value={
                          item.school
                        }
                        onChange={(
                          value,
                        ) =>
                          handleEducationChange(
                            item.id,
                            "school",
                            value,
                          )
                        }
                        placeholder="University name"
                      />

                      <EditorField
                        label="Location"
                        value={
                          item.location
                        }
                        onChange={(
                          value,
                        ) =>
                          handleEducationChange(
                            item.id,
                            "location",
                            value,
                          )
                        }
                        placeholder="Ogun, Nigeria"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <EditorField
                          label="Start"
                          value={
                            item.startDate
                          }
                          onChange={(
                            value,
                          ) =>
                            handleEducationChange(
                              item.id,
                              "startDate",
                              value,
                            )
                          }
                          placeholder="2020"
                        />

                        <EditorField
                          label="End"
                          value={
                            item.endDate
                          }
                          onChange={(
                            value,
                          ) =>
                            handleEducationChange(
                              item.id,
                              "endDate",
                              value,
                            )
                          }
                          placeholder="2024"
                        />
                      </div>
                    </div>
                  ),
                )
              )}
            </EditorSection>

            <EditorSection title="Skills">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(event) =>
                      setSkillInput(
                        event.target.value,
                      )
                    }
                    onKeyDown={
                      handleSkillInputKeyDown
                    }
                    placeholder="Type a skill"
                    className="min-w-0 flex-1 border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-700"
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="shrink-0 bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
                  >
                    Add
                  </button>
                </div>

                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map(
                      (skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700"
                        >
                          <span className="break-words">
                            {skill}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeSkill(
                                skill,
                              )
                            }
                            aria-label={`Remove ${skill}`}
                            className="text-gray-400 transition hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-gray-500">
                    Add individual skills
                    using the field above.
                  </p>
                )}
              </div>
            </EditorSection>

            <EditorSection
              title="Projects"
              action={
                <button
                  type="button"
                  onClick={addProject}
                  className="text-xs font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
                >
                  Add
                </button>
              }
            >
              {projects.length === 0 ? (
                <EmptyState>
                  Add projects that
                  demonstrate your work.
                </EmptyState>
              ) : (
                projects.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="space-y-4 border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">
                          Project{" "}
                          {index + 1}
                        </p>

                        <ItemActions
                          onRemove={() =>
                            removeProject(
                              item.id,
                            )
                          }
                        />
                      </div>

                      <EditorField
                        label="Name"
                        value={item.name}
                        onChange={(
                          value,
                        ) =>
                          handleProjectChange(
                            item.id,
                            "name",
                            value,
                          )
                        }
                        placeholder="Project name"
                      />

                      <EditorTextarea
                        label="Description"
                        value={
                          item.description
                        }
                        onChange={(
                          value,
                        ) =>
                          handleProjectChange(
                            item.id,
                            "description",
                            value,
                          )
                        }
                        placeholder="What did you build?"
                        rows={5}
                      />

                      <EditorField
                        label="Link"
                        value={item.link}
                        onChange={(
                          value,
                        ) =>
                          handleProjectChange(
                            item.id,
                            "link",
                            value,
                          )
                        }
                        placeholder="https://github.com/..."
                      />
                    </div>
                  ),
                )
              )}
            </EditorSection>

            <EditorSection
              title="Certifications"
              action={
                <button
                  type="button"
                  onClick={
                    addCertification
                  }
                  className="text-xs font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
                >
                  Add
                </button>
              }
            >
              {certifications.length === 0 ? (
                <EmptyState>
                  Add certifications,
                  courses, or credentials.
                </EmptyState>
              ) : (
                certifications.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="space-y-4 border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">
                          Certification{" "}
                          {index + 1}
                        </p>

                        <ItemActions
                          onRemove={() =>
                            removeCertification(
                              item.id,
                            )
                          }
                        />
                      </div>

                      <EditorField
                        label="Name"
                        value={item.name}
                        onChange={(
                          value,
                        ) =>
                          handleCertificationChange(
                            item.id,
                            "name",
                            value,
                          )
                        }
                        placeholder="Certification name"
                      />

                      <EditorField
                        label="Issuer"
                        value={
                          item.issuer
                        }
                        onChange={(
                          value,
                        ) =>
                          handleCertificationChange(
                            item.id,
                            "issuer",
                            value,
                          )
                        }
                        placeholder="Issuing organization"
                      />

                      <EditorField
                        label="Date"
                        value={item.date}
                        onChange={(
                          value,
                        ) =>
                          handleCertificationChange(
                            item.id,
                            "date",
                            value,
                          )
                        }
                        placeholder="2026"
                      />

                      <EditorField
                        label="Link"
                        value={item.link}
                        onChange={(
                          value,
                        ) =>
                          handleCertificationChange(
                            item.id,
                            "link",
                            value,
                          )
                        }
                        placeholder="https://..."
                      />
                    </div>
                  ),
                )
              )}
            </EditorSection>

            <EditorSection title="Document">
              <button
                type="button"
                onClick={resetDocument}
                className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:border-red-300 hover:text-red-600"
              >
                Reset CV
              </button>
            </EditorSection>

            <div className="px-5 py-6 text-xs leading-relaxed text-gray-400">
              Changes are saved automatically
              in this browser. Use Export to
              keep a portable backup.
            </div>
          </div>
        </aside>

        <section className="cv-print-root min-w-0 overflow-x-auto bg-[#deded9] p-5 lg:p-10 print:bg-white print:p-0">
          <div className="cv-print-page mx-auto w-fit">
            <ProfessionalTemplate
              document={cv}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
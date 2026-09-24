"use client";

import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  Certification,
  CVBasics,
  CVDocument,
  Education,
  Experience,
  Project,
} from "@/lib/document/types";
import { createDefaultDocument } from "@/lib/document/defaults";
import { ProfessionalTemplate } from "@/components/preview/templates/ProfessionalTemplate";
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
} from "@/lib/document/operations";
import {
  isValidCVDocument,
  validateCVDocument,
} from "@/lib/document/validation";
import {
  loadDocument,
  saveDocument,
} from "@/lib/persistence/localStorage";

const STORAGE_KEY = "cv-studio-document";

type SaveState = "loading" | "saved" | "saving" | "error";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function getLegacyStoredValue(): unknown | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Home() {
  const [cv, setCv] = useState<CVDocument>(() =>
    createDefaultDocument(),
  );
  const [activeSection, setActiveSection] = useState("personal");
  const [skillInput, setSkillInput] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveState, setSaveState] =
    useState<SaveState>("loading");

  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentDocument = loadDocument();

    if (currentDocument) {
      setCv(currentDocument);
      setHasLoaded(true);
      setSaveState("saved");
      return;
    }

    const legacyValue = getLegacyStoredValue();

    if (legacyValue) {
      let legacyData: unknown = legacyValue;

      if (
        typeof legacyValue === "object" &&
        legacyValue !== null &&
        "data" in legacyValue
      ) {
        legacyData = legacyValue.data;
      }

      const migrated = createDocumentFromLegacyCV(
        legacyData,
      );

      if (migrated) {
        setCv(migrated);

        // Persist the migrated document immediately so the
        // old format is replaced by the new document model.
        saveDocument(migrated);

        setHasLoaded(true);
        setSaveState("saved");
        return;
      }
    }

    setHasLoaded(true);
    setSaveState("saved");
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    setSaveState("saving");

    const timeout = window.setTimeout(() => {
      const saved = saveDocument(cv);
      setSaveState(saved ? "saved" : "error");
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [cv, hasLoaded]);

  const basics = getBasics(cv);
  const summary = getSummary(cv);
  const skills = getSkills(cv);
  const experience = getExperience(cv);
  const education = getEducation(cv);
  const projects = getProjects(cv);
  const certifications = getCertifications(cv);

  function updateBasicField(
    field: keyof CVBasics,
    value: string,
  ) {
    setCv((current) =>
      updateBasics(current, field, value),
    );
  }

  function updateSummaryValue(value: string) {
    setCv((current) =>
      updateSectionData(current, "summary", value),
    );
  }

  function addSkill() {
    const skill = skillInput.trim();

    if (!skill) return;

    setCv((current) => {
      const currentSkills = getSkills(current);

      if (
        currentSkills.some(
          (item) =>
            item.toLowerCase() === skill.toLowerCase(),
        )
      ) {
        return current;
      }

      return updateSkills(current, [
        ...currentSkills,
        skill,
      ]);
    });

    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setCv((current) =>
      updateSkills(
        current,
        getSkills(current).filter(
          (item) => item !== skill,
        ),
      ),
    );
  }

  function addExperience() {
    setCv((current) =>
      updateExperience(current, [
        ...getExperience(current),
        {
          id: createId("experience"),
          role: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ]),
    );
  }

  function updateExperienceItem(
    id: string,
    field: keyof Experience,
    value: string,
  ) {
    setCv((current) =>
      updateExperience(
        current,
        getExperience(current).map((item) =>
          item.id === id
            ? { ...item, [field]: value }
            : item,
        ),
      ),
    );
  }

  function removeExperience(id: string) {
    setCv((current) =>
      updateExperience(
        current,
        getExperience(current).filter(
          (item) => item.id !== id,
        ),
      ),
    );
  }

  function addEducation() {
    setCv((current) =>
      updateEducation(current, [
        ...getEducation(current),
        {
          id: createId("education"),
          degree: "",
          school: "",
          location: "",
          startDate: "",
          endDate: "",
        },
      ]),
    );
  }

  function updateEducationItem(
    id: string,
    field: keyof Education,
    value: string,
  ) {
    setCv((current) =>
      updateEducation(
        current,
        getEducation(current).map((item) =>
          item.id === id
            ? { ...item, [field]: value }
            : item,
        ),
      ),
    );
  }

  function removeEducation(id: string) {
    setCv((current) =>
      updateEducation(
        current,
        getEducation(current).filter(
          (item) => item.id !== id,
        ),
      ),
    );
  }

  function addProject() {
    setCv((current) =>
      updateProjects(current, [
        ...getProjects(current),
        {
          id: createId("project"),
          name: "",
          description: "",
          link: "",
        },
      ]),
    );
  }

  function updateProjectItem(
    id: string,
    field: keyof Project,
    value: string,
  ) {
    setCv((current) =>
      updateProjects(
        current,
        getProjects(current).map((item) =>
          item.id === id
            ? { ...item, [field]: value }
            : item,
        ),
      ),
    );
  }

  function removeProject(id: string) {
    setCv((current) =>
      updateProjects(
        current,
        getProjects(current).filter(
          (item) => item.id !== id,
        ),
      ),
    );
  }

  function addCertification() {
    setCv((current) =>
      updateCertifications(current, [
        ...getCertifications(current),
        {
          id: createId("certification"),
          name: "",
          issuer: "",
          date: "",
          link: "",
        },
      ]),
    );
  }

  function updateCertificationItem(
    id: string,
    field: keyof Certification,
    value: string,
  ) {
    setCv((current) =>
      updateCertifications(
        current,
        getCertifications(current).map((item) =>
          item.id === id
            ? { ...item, [field]: value }
            : item,
        ),
      ),
    );
  }

  function removeCertification(id: string) {
    setCv((current) =>
      updateCertifications(
        current,
        getCertifications(current).filter(
          (item) => item.id !== id,
        ),
      ),
    );
  }

  function resetCV() {
    const confirmed = window.confirm(
      "Reset this CV? All saved CV data in this browser will be deleted.",
    );

    if (!confirmed) return;

    const nextDocument = createDefaultDocument();

    setCv(nextDocument);
    setActiveSection("personal");
    setSkillInput("");

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors. Autosave will attempt to persist
      // the fresh document again.
    }
  }

  function exportJSON() {
    const validationErrors = validateCVDocument(cv);

    if (validationErrors.length > 0) {
      window.alert(
        `This CV cannot be exported because its document data is invalid.\n\n${validationErrors.join(
          "\n",
        )}`,
      );
      return;
    }

    const blob = new Blob(
      [JSON.stringify(cv, null, 2)],
      {
        type: "application/json",
      },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${cv.name
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "cv-studio-document"}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function openImportPicker() {
    importInputRef.current?.click();
  }

  async function importJSON(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);

      let importedDocument: CVDocument | null =
        null;

      if (isValidCVDocument(parsed)) {
        importedDocument = parsed;
      } else if (
        parsed &&
        typeof parsed === "object" &&
        "document" in parsed &&
        isValidCVDocument(parsed.document)
      ) {
        importedDocument = parsed.document;
      }

      if (!importedDocument) {
        const errors = validateCVDocument(parsed);

        window.alert(
          `This file is not a valid CV Studio document.${
            errors.length
              ? `\n\n${errors.join("\n")}`
              : ""
          }`,
        );

        return;
      }

      const normalizedDocument: CVDocument = {
        ...importedDocument,
        updatedAt: new Date().toISOString(),
      };

      setCv(normalizedDocument);
      setActiveSection("personal");
      setSkillInput("");
    } catch {
      window.alert(
        "The selected file could not be imported. Make sure it is valid JSON and was exported from CV Studio.",
      );
    } finally {
      event.target.value = "";
    }
  }

  function printCV() {
    window.print();
  }

  const navigation = [
    ["personal", "Personal"],
    ["experience", "Experience"],
    ["education", "Education"],
    ["skills", "Skills"],
    ["projects", "Projects"],
    ["certifications", "Certifications"],
  ];

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-[#171717]">
      <header className="cv-app-header sticky top-0 z-30 border-b border-[#deded9] bg-[#f5f5f3]/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-5 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#73736e]">
              CV Studio
            </p>

            <h1 className="text-lg font-semibold tracking-tight">
              Create your CV
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-[#777] sm:inline">
              {saveState === "loading" && "Loading…"}
              {saveState === "saving" && "Saving…"}
              {saveState === "saved" && "Saved locally"}
              {saveState === "error" && "Save failed"}
            </span>

            <button
              type="button"
              onClick={exportJSON}
              className="hidden rounded-md border border-[#c9c9c3] bg-white px-3 py-2 text-xs font-medium transition hover:border-[#999] sm:inline-flex"
            >
              Export
            </button>

            <button
              type="button"
              onClick={openImportPicker}
              className="hidden rounded-md border border-[#c9c9c3] bg-white px-3 py-2 text-xs font-medium transition hover:border-[#999] sm:inline-flex"
            >
              Import
            </button>

            <button
              type="button"
              onClick={printCV}
              className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#30302d]"
            >
              Save PDF
            </button>

            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={importJSON}
              className="hidden"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[430px_minmax(0,1fr)]">
        <aside className="cv-editor-sidebar border-r border-[#deded9] bg-[#f5f5f3] print:hidden lg:min-h-[calc(100vh-4rem)]">
          <div className="p-5 lg:p-7">
            <div className="mb-7">
              <p className="text-sm text-[#73736e]">
                Build your CV one section at a time.
              </p>
            </div>

            <nav className="mb-8 grid grid-cols-2 gap-1 rounded-lg bg-[#e9e9e5] p-1 sm:grid-cols-3">
              {navigation.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`rounded-md px-2 py-2 text-xs font-medium transition ${
                    activeSection === id
                      ? "bg-white text-[#171717] shadow-sm"
                      : "text-[#73736e] hover:text-[#171717]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {activeSection === "personal" && (
              <div className="space-y-7">
                <EditorGroup
                  title="Personal information"
                  description="The details employers will use to identify and contact you."
                >
                  <Field
                    label="Full name"
                    value={basics.name}
                    onChange={(value) =>
                      updateBasicField("name", value)
                    }
                    placeholder="e.g. John Doe"
                  />

                  <Field
                    label="Professional title"
                    value={basics.title}
                    onChange={(value) =>
                      updateBasicField("title", value)
                    }
                    placeholder="e.g. Frontend Developer"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Email"
                      value={basics.email}
                      onChange={(value) =>
                        updateBasicField("email", value)
                      }
                      placeholder="you@example.com"
                    />

                    <Field
                      label="Phone"
                      value={basics.phone}
                      onChange={(value) =>
                        updateBasicField("phone", value)
                      }
                      placeholder="+234..."
                    />
                  </div>

                  <Field
                    label="Location"
                    value={basics.location}
                    onChange={(value) =>
                      updateBasicField(
                        "location",
                        value,
                      )
                    }
                    placeholder="City, Country"
                  />

                  <Field
                    label="Website"
                    value={basics.website}
                    onChange={(value) =>
                      updateBasicField(
                        "website",
                        value,
                      )
                    }
                    placeholder="yourwebsite.com"
                  />

                  <Field
                    label="LinkedIn"
                    value={basics.linkedin}
                    onChange={(value) =>
                      updateBasicField(
                        "linkedin",
                        value,
                      )
                    }
                    placeholder="linkedin.com/in/..."
                  />
                </EditorGroup>

                <EditorGroup
                  title="Professional summary"
                  description="A short introduction that tells an employer what you bring."
                >
                  <Textarea
                    value={summary}
                    onChange={updateSummaryValue}
                    placeholder="Write 2–4 sentences about your professional background, strengths and focus."
                  />
                </EditorGroup>

                <div className="border-t border-[#deded9] pt-6">
                  <button
                    type="button"
                    onClick={resetCV}
                    className="w-full border border-[#d1bcbc] bg-white px-4 py-2.5 text-sm font-medium text-[#7d3838] transition hover:border-[#a66] hover:bg-[#fffafa]"
                  >
                    Reset CV
                  </button>
                </div>
              </div>
            )}

            {activeSection === "experience" && (
              <ExperienceEditor
                items={experience}
                onAdd={addExperience}
                onUpdate={updateExperienceItem}
                onRemove={removeExperience}
              />
            )}

            {activeSection === "education" && (
              <EducationEditor
                items={education}
                onAdd={addEducation}
                onUpdate={updateEducationItem}
                onRemove={removeEducation}
              />
            )}

            {activeSection === "skills" && (
              <EditorGroup
                title="Skills"
                description="Add the skills that are relevant to the role you're applying for."
              >
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={(event) =>
                      setSkillInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="e.g. TypeScript"
                    className="min-w-0 flex-1 border border-[#d2d2cc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#777]"
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-[#171717] px-4 text-sm font-medium text-white"
                  >
                    Add
                  </button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() =>
                          removeSkill(skill)
                        }
                        className="border border-[#d2d2cc] bg-white px-3 py-1.5 text-xs hover:border-[#999]"
                        title="Remove skill"
                      >
                        {skill} ×
                      </button>
                    ))}
                  </div>
                )}

                {skills.length === 0 && (
                  <EmptyText>
                    No skills added yet. Add your most
                    relevant skills.
                  </EmptyText>
                )}
              </EditorGroup>
            )}

            {activeSection === "projects" && (
              <ProjectEditor
                items={projects}
                onAdd={addProject}
                onUpdate={updateProjectItem}
                onRemove={removeProject}
              />
            )}

            {activeSection === "certifications" && (
              <CertificationEditor
                items={certifications}
                onAdd={addCertification}
                onUpdate={updateCertificationItem}
                onRemove={removeCertification}
              />
            )}
          </div>
        </aside>

        <section className="cv-print-root min-w-0 overflow-x-auto bg-[#deded9] p-5 lg:p-10 print:bg-white print:p-0">
          <div className="mx-auto w-fit">
            <ProfessionalTemplate document={cv} />
          </div>
        </section>
      </div>
    </main>
  );
}

function ExperienceEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: Experience[];
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof Experience,
    value: string,
  ) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <EditorGroup
      title="Experience"
      description="Start with your most recent or most relevant work experience."
    >
      <AddButton onClick={onAdd}>
        Add experience
      </AddButton>

      {items.length === 0 && (
        <EmptyText>
          No experience added yet.
        </EmptyText>
      )}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="space-y-4 border border-[#d7d7d1] bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#666]">
              Experience {index + 1}
            </p>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-xs text-[#8a3b3b] hover:underline"
            >
              Remove
            </button>
          </div>

          <Field
            label="Role"
            value={item.role}
            onChange={(value) =>
              onUpdate(item.id, "role", value)
            }
            placeholder="e.g. Frontend Developer"
          />

          <Field
            label="Company"
            value={item.company}
            onChange={(value) =>
              onUpdate(
                item.id,
                "company",
                value,
              )
            }
            placeholder="Company name"
          />

          <Field
            label="Location"
            value={item.location}
            onChange={(value) =>
              onUpdate(
                item.id,
                "location",
                value,
              )
            }
            placeholder="City, Country"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start"
              value={item.startDate}
              onChange={(value) =>
                onUpdate(
                  item.id,
                  "startDate",
                  value,
                )
              }
              placeholder="Jan 2024"
            />

            <Field
              label="End"
              value={item.endDate}
              onChange={(value) =>
                onUpdate(
                  item.id,
                  "endDate",
                  value,
                )
              }
              placeholder="Present"
            />
          </div>

          <Textarea
            label="Description"
            value={item.description}
            onChange={(value) =>
              onUpdate(
                item.id,
                "description",
                value,
              )
            }
            placeholder="Describe your responsibilities, achievements and measurable results."
          />
        </div>
      ))}
    </EditorGroup>
  );
}

function EducationEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: Education[];
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof Education,
    value: string,
  ) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <EditorGroup
      title="Education"
      description="Add your relevant academic or professional qualifications."
    >
      <AddButton onClick={onAdd}>
        Add education
      </AddButton>

      {items.length === 0 && (
        <EmptyText>
          No education added yet.
        </EmptyText>
      )}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="space-y-4 border border-[#d7d7d1] bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#666]">
              Education {index + 1}
            </p>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-xs text-[#8a3b3b] hover:underline"
            >
              Remove
            </button>
          </div>

          <Field
            label="Degree / qualification"
            value={item.degree}
            onChange={(value) =>
              onUpdate(
                item.id,
                "degree",
                value,
              )
            }
            placeholder="e.g. B.Sc. Computer Science"
          />

          <Field
            label="School / institution"
            value={item.school}
            onChange={(value) =>
              onUpdate(
                item.id,
                "school",
                value,
              )
            }
            placeholder="Institution name"
          />

          <Field
            label="Location"
            value={item.location}
            onChange={(value) =>
              onUpdate(
                item.id,
                "location",
                value,
              )
            }
            placeholder="City, Country"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start"
              value={item.startDate}
              onChange={(value) =>
                onUpdate(
                  item.id,
                  "startDate",
                  value,
                )
              }
              placeholder="2020"
            />

            <Field
              label="End"
              value={item.endDate}
              onChange={(value) =>
                onUpdate(
                  item.id,
                  "endDate",
                  value,
                )
              }
              placeholder="2024"
            />
          </div>
        </div>
      ))}
    </EditorGroup>
  );
}

function ProjectEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: Project[];
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof Project,
    value: string,
  ) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <EditorGroup
      title="Projects"
      description="Showcase relevant work, personal projects or major accomplishments."
    >
      <AddButton onClick={onAdd}>
        Add project
      </AddButton>

      {items.length === 0 && (
        <EmptyText>
          No projects added yet.
        </EmptyText>
      )}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="space-y-4 border border-[#d7d7d1] bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#666]">
              Project {index + 1}
            </p>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-xs text-[#8a3b3b] hover:underline"
            >
              Remove
            </button>
          </div>

          <Field
            label="Project name"
            value={item.name}
            onChange={(value) =>
              onUpdate(
                item.id,
                "name",
                value,
              )
            }
            placeholder="Project name"
          />

          <Textarea
            label="Description"
            value={item.description}
            onChange={(value) =>
              onUpdate(
                item.id,
                "description",
                value,
              )
            }
            placeholder="What did you build, improve or accomplish?"
          />

          <Field
            label="Link"
            value={item.link}
            onChange={(value) =>
              onUpdate(
                item.id,
                "link",
                value,
              )
            }
            placeholder="https://..."
          />
        </div>
      ))}
    </EditorGroup>
  );
}

function CertificationEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: Certification[];
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof Certification,
    value: string,
  ) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <EditorGroup
      title="Certifications"
      description="Add professional certifications, courses or credentials."
    >
      <AddButton onClick={onAdd}>
        Add certification
      </AddButton>

      {items.length === 0 && (
        <EmptyText>
          No certifications added yet.
        </EmptyText>
      )}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="space-y-4 border border-[#d7d7d1] bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#666]">
              Certification {index + 1}
            </p>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-xs text-[#8a3b3b] hover:underline"
            >
              Remove
            </button>
          </div>

          <Field
            label="Certification"
            value={item.name}
            onChange={(value) =>
              onUpdate(
                item.id,
                "name",
                value,
              )
            }
            placeholder="Certification name"
          />

          <Field
            label="Issuer"
            value={item.issuer}
            onChange={(value) =>
              onUpdate(
                item.id,
                "issuer",
                value,
              )
            }
            placeholder="Issuing organization"
          />

          <Field
            label="Date"
            value={item.date}
            onChange={(value) =>
              onUpdate(
                item.id,
                "date",
                value,
              )
            }
            placeholder="2025"
          />

          <Field
            label="Link"
            value={item.link}
            onChange={(value) =>
              onUpdate(
                item.id,
                "link",
                value,
              )
            }
            placeholder="https://..."
          />
        </div>
      ))}
    </EditorGroup>
  );
}

function EditorGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-[#7a7a74]">
          {description}
        </p>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function AddButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border border-[#bdbdb7] bg-white px-4 py-2.5 text-sm font-medium transition hover:border-[#777] hover:bg-[#fafaf8]"
    >
      + {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium text-[#555]">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full border border-[#d2d2cc] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[#aaa] focus:border-[#777]"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[11px] font-medium text-[#555]">
          {label}
        </span>
      )}

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={6}
        className="w-full resize-y border border-[#d2d2cc] bg-white px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-[#aaa] focus:border-[#777]"
      />
    </label>
  );
}

function EmptyText({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="border border-dashed border-[#d2d2cc] px-4 py-4 text-xs leading-5 text-[#777]">
      {children}
    </p>
  );
}
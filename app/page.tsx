"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Education = {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  link: string;
};

type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
};

type CVData = {
  basics: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    photo: string;
  };
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
};

type StoredCV = {
  version: 1;
  data: CVData;
};

const STORAGE_KEY = "cv-studio-document";

const initialCV: CVData = {
  basics: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    photo: "",
  },
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneInitialCV(): CVData {
  return JSON.parse(JSON.stringify(initialCV));
}

function isValidCVData(value: unknown): value is CVData {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<CVData>;

  return (
    typeof candidate.basics === "object" &&
    candidate.basics !== null &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.skills) &&
    Array.isArray(candidate.experience) &&
    Array.isArray(candidate.education) &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.certifications)
  );
}

export default function Home() {
  const [cv, setCv] = useState<CVData>(initialCV);
  const [activeSection, setActiveSection] = useState("personal");
  const [skillInput, setSkillInput] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveState, setSaveState] = useState<
    "loading" | "saved" | "saving"
  >("loading");

  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: unknown = JSON.parse(stored);

        if (
          parsed &&
          typeof parsed === "object" &&
          "data" in parsed &&
          isValidCVData(parsed.data)
        ) {
          setCv(parsed.data);
        } else if (isValidCVData(parsed)) {
          setCv(parsed);
        }
      }
    } catch {
      // Ignore invalid or unavailable local storage data.
    } finally {
      setHasLoaded(true);
      setSaveState("saved");
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    setSaveState("saving");

    const timeout = window.setTimeout(() => {
      try {
        const stored: StoredCV = {
          version: 1,
          data: cv,
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(stored),
        );

        setSaveState("saved");
      } catch {
        setSaveState("saved");
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [cv, hasLoaded]);

  function updateBasics(
    field: keyof CVData["basics"],
    value: string,
  ) {
    setCv((current) => ({
      ...current,
      basics: {
        ...current.basics,
        [field]: value,
      },
    }));
  }

  function updateSummary(value: string) {
    setCv((current) => ({
      ...current,
      summary: value,
    }));
  }

  function addSkill() {
    const skill = skillInput.trim();

    if (!skill) return;

    setCv((current) => {
      if (current.skills.includes(skill)) return current;

      return {
        ...current,
        skills: [...current.skills, skill],
      };
    });

    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setCv((current) => ({
      ...current,
      skills: current.skills.filter((item) => item !== skill),
    }));
  }

  function addExperience() {
    setCv((current) => ({
      ...current,
      experience: [
        ...current.experience,
        {
          id: createId(),
          role: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  }

  function updateExperience(
    id: string,
    field: keyof Experience,
    value: string,
  ) {
    setCv((current) => ({
      ...current,
      experience: current.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeExperience(id: string) {
    setCv((current) => ({
      ...current,
      experience: current.experience.filter((item) => item.id !== id),
    }));
  }

  function addEducation() {
    setCv((current) => ({
      ...current,
      education: [
        ...current.education,
        {
          id: createId(),
          degree: "",
          school: "",
          location: "",
          startDate: "",
          endDate: "",
        },
      ],
    }));
  }

  function updateEducation(
    id: string,
    field: keyof Education,
    value: string,
  ) {
    setCv((current) => ({
      ...current,
      education: current.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeEducation(id: string) {
    setCv((current) => ({
      ...current,
      education: current.education.filter((item) => item.id !== id),
    }));
  }

  function addProject() {
    setCv((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          id: createId(),
          name: "",
          description: "",
          link: "",
        },
      ],
    }));
  }

  function updateProject(
    id: string,
    field: keyof Project,
    value: string,
  ) {
    setCv((current) => ({
      ...current,
      projects: current.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeProject(id: string) {
    setCv((current) => ({
      ...current,
      projects: current.projects.filter((item) => item.id !== id),
    }));
  }

  function addCertification() {
    setCv((current) => ({
      ...current,
      certifications: [
        ...current.certifications,
        {
          id: createId(),
          name: "",
          issuer: "",
          date: "",
          link: "",
        },
      ],
    }));
  }

  function updateCertification(
    id: string,
    field: keyof Certification,
    value: string,
  ) {
    setCv((current) => ({
      ...current,
      certifications: current.certifications.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeCertification(id: string) {
    setCv((current) => ({
      ...current,
      certifications: current.certifications.filter(
        (item) => item.id !== id,
      ),
    }));
  }

  function resetCV() {
    const confirmed = window.confirm(
      "Reset this CV? All saved CV data in this browser will be deleted.",
    );

    if (!confirmed) return;

    setCv(cloneInitialCV());
    setActiveSection("personal");
    setSkillInput("");
  }

  function exportJSON() {
    const stored: StoredCV = {
      version: 1,
      data: cv,
    };

    const blob = new Blob([JSON.stringify(stored, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cv-studio-document.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  function openImportPicker() {
    importInputRef.current?.click();
  }

  async function importJSON(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);

      let importedData: CVData | null = null;

      if (
        parsed &&
        typeof parsed === "object" &&
        "data" in parsed &&
        isValidCVData(parsed.data)
      ) {
        importedData = parsed.data;
      } else if (isValidCVData(parsed)) {
        importedData = parsed;
      }

      if (!importedData) {
        window.alert(
          "This file does not contain a valid CV Studio document.",
        );
        return;
      }

      setCv(importedData);
      setActiveSection("personal");
    } catch {
      window.alert(
        "The selected file could not be imported. Make sure it is a valid CV JSON file.",
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
      <header className="sticky top-0 z-30 border-b border-[#deded9] bg-[#f5f5f3]/95 backdrop-blur print:hidden">
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
        <aside className="border-r border-[#deded9] bg-[#f5f5f3] print:hidden lg:min-h-[calc(100vh-4rem)]">
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
                    value={cv.basics.name}
                    onChange={(value) => updateBasics("name", value)}
                    placeholder="e.g. John Doe"
                  />

                  <Field
                    label="Professional title"
                    value={cv.basics.title}
                    onChange={(value) => updateBasics("title", value)}
                    placeholder="e.g. Frontend Developer"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Email"
                      value={cv.basics.email}
                      onChange={(value) => updateBasics("email", value)}
                      placeholder="you@example.com"
                    />

                    <Field
                      label="Phone"
                      value={cv.basics.phone}
                      onChange={(value) => updateBasics("phone", value)}
                      placeholder="+234..."
                    />
                  </div>

                  <Field
                    label="Location"
                    value={cv.basics.location}
                    onChange={(value) => updateBasics("location", value)}
                    placeholder="City, Country"
                  />

                  <Field
                    label="Website"
                    value={cv.basics.website}
                    onChange={(value) => updateBasics("website", value)}
                    placeholder="yourwebsite.com"
                  />

                  <Field
                    label="LinkedIn"
                    value={cv.basics.linkedin}
                    onChange={(value) => updateBasics("linkedin", value)}
                    placeholder="linkedin.com/in/..."
                  />
                </EditorGroup>

                <EditorGroup
                  title="Professional summary"
                  description="A short introduction that tells an employer what you bring."
                >
                  <Textarea
                    value={cv.summary}
                    onChange={updateSummary}
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
                items={cv.experience}
                onAdd={addExperience}
                onUpdate={updateExperience}
                onRemove={removeExperience}
              />
            )}

            {activeSection === "education" && (
              <EducationEditor
                items={cv.education}
                onAdd={addEducation}
                onUpdate={updateEducation}
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

                {cv.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {cv.skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="border border-[#d2d2cc] bg-white px-3 py-1.5 text-xs hover:border-[#999]"
                        title="Remove skill"
                      >
                        {skill} ×
                      </button>
                    ))}
                  </div>
                )}

                {cv.skills.length === 0 && (
                  <EmptyText>
                    No skills added yet. Add your most relevant skills.
                  </EmptyText>
                )}
              </EditorGroup>
            )}

            {activeSection === "projects" && (
              <ProjectEditor
                items={cv.projects}
                onAdd={addProject}
                onUpdate={updateProject}
                onRemove={removeProject}
              />
            )}

            {activeSection === "certifications" && (
              <CertificationEditor
                items={cv.certifications}
                onAdd={addCertification}
                onUpdate={updateCertification}
                onRemove={removeCertification}
              />
            )}
          </div>
        </aside>

        <section className="min-w-0 overflow-x-auto bg-[#deded9] p-5 lg:p-10 print:bg-white print:p-0">
          <div className="mx-auto w-fit">
            <CVPreview cv={cv} />
          </div>
        </section>
      </div>
    </main>
  );
}

function CVPreview({ cv }: { cv: CVData }) {
  const hasContact =
    cv.basics.email ||
    cv.basics.phone ||
    cv.basics.location ||
    cv.basics.website ||
    cv.basics.linkedin;

  return (
    <article className="cv-paper">
      <header className="cv-section-keep-together border-b-[1.5px] border-[#222] pb-5">
        <h2 className="text-[30px] font-semibold tracking-[-0.035em] text-[#111]">
          {cv.basics.name || "Your Name"}
        </h2>

        <p className="mt-1 text-[15px] font-medium text-[#555]">
          {cv.basics.title || "Professional Title"}
        </p>

        {hasContact && (
          <div className="mt-4 flex max-w-[650px] flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-[#555]">
            {cv.basics.email && <span>{cv.basics.email}</span>}
            {cv.basics.phone && <span>{cv.basics.phone}</span>}
            {cv.basics.location && <span>{cv.basics.location}</span>}
            {cv.basics.website && <span>{cv.basics.website}</span>}
            {cv.basics.linkedin && <span>{cv.basics.linkedin}</span>}
          </div>
        )}
      </header>

      {cv.summary && (
        <CVSection title="Profile">
          <p>{cv.summary}</p>
        </CVSection>
      )}

      {cv.experience.length > 0 && (
        <CVSection title="Experience">
          <div className="space-y-4">
            {cv.experience.map((item) => (
              <div key={item.id} className="cv-entry-keep-together">
                <div className="flex justify-between gap-6">
                  <div>
                    <p className="font-semibold text-[#111]">
                      {item.role || "Role"}
                    </p>

                    <p className="mt-0.5">
                      {item.company || "Company"}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                  </div>

                  {(item.startDate || item.endDate) && (
                    <p className="whitespace-nowrap text-[10px] text-[#666]">
                      {item.startDate}
                      {item.startDate || item.endDate ? " — " : ""}
                      {item.endDate}
                    </p>
                  )}
                </div>

                {item.description && (
                  <p className="mt-2 whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CVSection>
      )}

      {cv.projects.length > 0 && (
        <CVSection title="Projects">
          <div className="space-y-4">
            {cv.projects.map((item) => (
              <div key={item.id} className="cv-entry-keep-together">
                <p className="font-semibold text-[#111]">
                  {item.name || "Project"}
                </p>

                {item.description && (
                  <p className="mt-1 whitespace-pre-line">
                    {item.description}
                  </p>
                )}

                {item.link && (
                  <p className="mt-1 text-[10px] text-[#666]">
                    {item.link}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CVSection>
      )}

      {cv.education.length > 0 && (
        <CVSection title="Education">
          <div className="space-y-4">
            {cv.education.map((item) => (
              <div key={item.id} className="cv-entry-keep-together">
                <div className="flex justify-between gap-6">
                  <div>
                    <p className="font-semibold text-[#111]">
                      {item.degree || "Degree or qualification"}
                    </p>

                    <p className="mt-0.5">
                      {item.school || "Institution"}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                  </div>

                  {(item.startDate || item.endDate) && (
                    <p className="whitespace-nowrap text-[10px] text-[#666]">
                      {item.startDate}
                      {item.startDate || item.endDate ? " — " : ""}
                      {item.endDate}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CVSection>
      )}

      {cv.certifications.length > 0 && (
        <CVSection title="Certifications">
          <div className="space-y-3">
            {cv.certifications.map((item) => (
              <div key={item.id} className="cv-entry-keep-together">
                <p className="font-semibold text-[#111]">
                  {item.name || "Certification"}
                </p>

                <p>
                  {item.issuer}
                  {item.date ? ` · ${item.date}` : ""}
                </p>
              </div>
            ))}
          </div>
        </CVSection>
      )}

      {cv.skills.length > 0 && (
        <CVSection title="Skills">
          <p>{cv.skills.join(" · ")}</p>
        </CVSection>
      )}
    </article>
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
      <AddButton onClick={onAdd}>Add experience</AddButton>

      {items.length === 0 && (
        <EmptyText>No experience added yet.</EmptyText>
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
            onChange={(value) => onUpdate(item.id, "role", value)}
            placeholder="e.g. Frontend Developer"
          />

          <Field
            label="Company"
            value={item.company}
            onChange={(value) => onUpdate(item.id, "company", value)}
            placeholder="Company name"
          />

          <Field
            label="Location"
            value={item.location}
            onChange={(value) => onUpdate(item.id, "location", value)}
            placeholder="City, Country"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start"
              value={item.startDate}
              onChange={(value) =>
                onUpdate(item.id, "startDate", value)
              }
              placeholder="Jan 2024"
            />

            <Field
              label="End"
              value={item.endDate}
              onChange={(value) =>
                onUpdate(item.id, "endDate", value)
              }
              placeholder="Present"
            />
          </div>

          <Textarea
            label="Description"
            value={item.description}
            onChange={(value) =>
              onUpdate(item.id, "description", value)
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
      <AddButton onClick={onAdd}>Add education</AddButton>

      {items.length === 0 && (
        <EmptyText>No education added yet.</EmptyText>
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
              onUpdate(item.id, "degree", value)
            }
            placeholder="e.g. B.Sc. Computer Science"
          />

          <Field
            label="School / institution"
            value={item.school}
            onChange={(value) =>
              onUpdate(item.id, "school", value)
            }
            placeholder="Institution name"
          />

          <Field
            label="Location"
            value={item.location}
            onChange={(value) =>
              onUpdate(item.id, "location", value)
            }
            placeholder="City, Country"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start"
              value={item.startDate}
              onChange={(value) =>
                onUpdate(item.id, "startDate", value)
              }
              placeholder="2020"
            />

            <Field
              label="End"
              value={item.endDate}
              onChange={(value) =>
                onUpdate(item.id, "endDate", value)
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
      <AddButton onClick={onAdd}>Add project</AddButton>

      {items.length === 0 && (
        <EmptyText>No projects added yet.</EmptyText>
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
            onChange={(value) => onUpdate(item.id, "name", value)}
            placeholder="Project name"
          />

          <Textarea
            label="Description"
            value={item.description}
            onChange={(value) =>
              onUpdate(item.id, "description", value)
            }
            placeholder="What did you build, improve or accomplish?"
          />

          <Field
            label="Link"
            value={item.link}
            onChange={(value) => onUpdate(item.id, "link", value)}
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
      <AddButton onClick={onAdd}>Add certification</AddButton>

      {items.length === 0 && (
        <EmptyText>No certifications added yet.</EmptyText>
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
              onUpdate(item.id, "name", value)
            }
            placeholder="Certification name"
          />

          <Field
            label="Issuer"
            value={item.issuer}
            onChange={(value) =>
              onUpdate(item.id, "issuer", value)
            }
            placeholder="Issuing organization"
          />

          <Field
            label="Date"
            value={item.date}
            onChange={(value) =>
              onUpdate(item.id, "date", value)
            }
            placeholder="2025"
          />

          <Field
            label="Link"
            value={item.link}
            onChange={(value) =>
              onUpdate(item.id, "link", value)
            }
            placeholder="https://..."
          />
        </div>
      ))}
    </EditorGroup>
  );
}

function CVSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cv-section-keep-together mt-7">
      <h3 className="mb-3 border-b border-[#d7d7d2] pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#222]">
        {title}
      </h3>

      <div className="text-[11px] leading-[1.6] text-[#444]">
        {children}
      </div>
    </section>
  );
}

function EditorGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>

        <p className="mt-1 text-xs leading-5 text-[#7a7a74]">
          {description}
        </p>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

function AddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
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
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full resize-y border border-[#d2d2cc] bg-white px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-[#aaa] focus:border-[#777]"
      />
    </label>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed border-[#d2d2cc] px-4 py-4 text-xs leading-5 text-[#777]">
      {children}
    </p>
  );
}
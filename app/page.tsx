"use client";

import { useState } from "react";

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
  experience: {
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    link: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
    link: string;
  }[];
};

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

export default function Home() {
  const [cv, setCv] = useState<CVData>(initialCV);
  const [activeSection, setActiveSection] = useState("personal");

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

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-[#171717]">
      <header className="sticky top-0 z-30 border-b border-[#deded9] bg-[#f5f5f3]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#73736e]">
              CV Studio
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              Create your CV
            </h1>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#30302d]"
          >
            Save PDF
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[430px_minmax(0,1fr)]">
        <aside className="border-r border-[#deded9] bg-[#f5f5f3] lg:min-h-[calc(100vh-4rem)]">
          <div className="p-5 lg:p-7">
            <div className="mb-7">
              <p className="text-sm text-[#73736e]">
                Build your CV one section at a time.
              </p>
            </div>

            <nav className="mb-8 grid grid-cols-3 gap-1 rounded-lg bg-[#e9e9e5] p-1">
              {[
                ["personal", "Personal"],
                ["experience", "Experience"],
                ["education", "Education"],
              ].map(([id, label]) => (
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
              </div>
            )}

            {activeSection === "experience" && (
              <EmptyEditorSection
                title="Experience"
                description="Your work history will appear here."
              />
            )}

            {activeSection === "education" && (
              <EmptyEditorSection
                title="Education"
                description="Your education history will appear here."
              />
            )}

            <div className="mt-10 border-t border-[#deded9] pt-5">
              <p className="text-xs leading-5 text-[#8a8a84]">
                Your CV preview updates as you type. More sections will be
                added in the next build step.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 overflow-x-auto bg-[#deded9] p-5 lg:p-10">
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
      <header className="border-b-[1.5px] border-[#222] pb-5">
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

      <CVSection title="Experience">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between gap-6">
              <div>
                <p className="font-semibold text-[#111]">
                  Your most recent role
                </p>
                <p className="mt-0.5">Company Name</p>
              </div>

              <p className="whitespace-nowrap text-[10px] text-[#666]">
                Start — Present
              </p>
            </div>

            <p className="mt-2 text-[#777]">
              Add your work experience from the editor. Your responsibilities
              and achievements will appear here.
            </p>
          </div>
        </div>
      </CVSection>

      <CVSection title="Education">
        <div>
          <p className="font-semibold text-[#111]">
            Your degree or qualification
          </p>
          <p className="mt-0.5">Institution Name</p>
        </div>
      </CVSection>

      <CVSection title="Skills">
        <p className="text-[#777]">
          Your professional skills will appear here.
        </p>
      </CVSection>
    </article>
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
    <section className="mt-7">
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

function EmptyEditorSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="border border-dashed border-[#c9c9c3] bg-white/50 p-6">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-[#777]">{description}</p>
      <p className="mt-5 text-xs font-medium text-[#555]">
        This section is coming in the next build step.
      </p>
    </section>
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
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={6}
      className="w-full resize-y border border-[#d2d2cc] bg-white px-3 py-2.5 text-sm leading-6 outline-none transition placeholder:text-[#aaa] focus:border-[#777]"
    />
  );
}
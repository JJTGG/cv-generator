import type {
  Certification,
  CVDocument,
  CVSection,
  Education,
  Experience,
  Project,
} from "@/lib/document/types";
import {
  getBasics,
  getCertifications,
  getEducation,
  getExperience,
  getProjects,
  getSkills,
  getSummary,
} from "@/lib/document/operations";
import type { ReactNode } from "react";

type ProfessionalTemplateProps = {
  document: CVDocument;
};

function hasText(value: string) {
  return value.trim().length > 0;
}

function isCustomSectionData(
  value: unknown,
): value is { content: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "content" in value &&
    typeof value.content === "string"
  );
}

function hasExperienceContent(item: Experience) {
  return [
    item.role,
    item.company,
    item.location,
    item.startDate,
    item.endDate,
    item.description,
  ].some(hasText);
}

function hasEducationContent(item: Education) {
  return [
    item.degree,
    item.school,
    item.location,
    item.startDate,
    item.endDate,
  ].some(hasText);
}

function hasProjectContent(item: Project) {
  return [
    item.name,
    item.description,
    item.link,
  ].some(hasText);
}

function hasCertificationContent(item: Certification) {
  return [
    item.name,
    item.issuer,
    item.date,
    item.link,
  ].some(hasText);
}

function hasSectionContent(
  document: CVDocument,
  section: CVSection,
): boolean {
  switch (section.type) {
    case "basics": {
      const basics = getBasics(document);

      return Object.values(basics).some((value) =>
        hasText(value),
      );
    }

    case "summary":
      return hasText(getSummary(document));

    case "skills":
      return getSkills(document).some(hasText);

    case "experience":
      return getExperience(document).some(
        hasExperienceContent,
      );

    case "education":
      return getEducation(document).some(
        hasEducationContent,
      );

    case "projects":
      return getProjects(document).some(
        hasProjectContent,
      );

    case "certifications":
      return getCertifications(document).some(
        hasCertificationContent,
      );

    case "custom":
      return (
        isCustomSectionData(section.data) &&
        hasText(section.data.content)
      );

    default:
      return false;
  }
}

function formatDateRange(
  startDate: string,
  endDate: string,
) {
  if (startDate && endDate) {
    return `${startDate} — ${endDate}`;
  }

  return startDate || endDate;
}

function ExperienceEntry({
  item,
}: {
  item: Experience;
}) {
  const dateRange = formatDateRange(
    item.startDate,
    item.endDate,
  );

  return (
    <article className="cv-entry-keep-together">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {hasText(item.role) && (
            <h3 className="font-semibold text-gray-900">
              {item.role}
            </h3>
          )}

          {hasText(item.company) && (
            <p className="text-sm text-gray-700">
              {item.company}
              {hasText(item.location) &&
                ` · ${item.location}`}
            </p>
          )}
        </div>

        {hasText(dateRange) && (
          <p className="shrink-0 text-right text-xs text-gray-500">
            {dateRange}
          </p>
        )}
      </div>

      {hasText(item.description) && (
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-gray-700">
          {item.description}
        </p>
      )}
    </article>
  );
}

function EducationEntry({
  item,
}: {
  item: Education;
}) {
  const dateRange = formatDateRange(
    item.startDate,
    item.endDate,
  );

  return (
    <article className="cv-entry-keep-together">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {hasText(item.degree) && (
            <h3 className="font-semibold text-gray-900">
              {item.degree}
            </h3>
          )}

          {hasText(item.school) && (
            <p className="text-sm text-gray-700">
              {item.school}
              {hasText(item.location) &&
                ` · ${item.location}`}
            </p>
          )}
        </div>

        {hasText(dateRange) && (
          <p className="shrink-0 text-right text-xs text-gray-500">
            {dateRange}
          </p>
        )}
      </div>
    </article>
  );
}

function ProjectEntry({
  item,
}: {
  item: Project;
}) {
  return (
    <article className="cv-entry-keep-together">
      {hasText(item.name) && (
        <h3 className="font-semibold text-gray-900">
          {item.name}
        </h3>
      )}

      {hasText(item.description) && (
        <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-gray-700">
          {item.description}
        </p>
      )}

      {hasText(item.link) && (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-all text-xs text-gray-600 underline underline-offset-2"
        >
          {item.link}
        </a>
      )}
    </article>
  );
}

function CertificationEntry({
  item,
}: {
  item: Certification;
}) {
  return (
    <article className="cv-entry-keep-together">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {hasText(item.name) && (
            <h3 className="font-semibold text-gray-900">
              {item.name}
            </h3>
          )}

          {hasText(item.issuer) && (
            <p className="text-sm text-gray-700">
              {item.issuer}
            </p>
          )}
        </div>

        {hasText(item.date) && (
          <p className="shrink-0 text-right text-xs text-gray-500">
            {item.date}
          </p>
        )}
      </div>

      {hasText(item.link) && (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-all text-xs text-gray-600 underline underline-offset-2"
        >
          {item.link}
        </a>
      )}
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="cv-section-keep-together mt-7">
      <h2 className="border-b border-gray-300 pb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gray-900">
        {title}
      </h2>

      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ProfessionalTemplate({
  document,
}: ProfessionalTemplateProps) {
  const basics = getBasics(document);
  const summary = getSummary(document);

  const skills = getSkills(document).filter(hasText);

  const experience = getExperience(document).filter(
    hasExperienceContent,
  );

  const education = getEducation(document).filter(
    hasEducationContent,
  );

  const projects = getProjects(document).filter(
    hasProjectContent,
  );

  const certifications = getCertifications(document).filter(
    hasCertificationContent,
  );

  const visibleSections = [...document.sections]
    .filter((section) => section.visible)
    .filter((section) =>
      hasSectionContent(document, section),
    )
    .sort((a, b) => a.order - b.order);

  return (
    <article className="cv-paper cv-document mx-auto bg-white text-[13px] leading-relaxed text-gray-800 shadow-sm print:mx-0 print:shadow-none">
      <header className="border-b-2 border-gray-900 pb-5">
        <h1 className="break-words text-3xl font-bold tracking-tight text-gray-950">
          {hasText(basics.name)
            ? basics.name
            : "Your Name"}
        </h1>

        {hasText(basics.title) && (
          <p className="mt-1 text-base text-gray-600">
            {basics.title}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          {hasText(basics.email) && (
            <a
              href={`mailto:${basics.email}`}
              className="break-all underline-offset-2 hover:underline"
            >
              {basics.email}
            </a>
          )}

          {hasText(basics.phone) && (
            <span>{basics.phone}</span>
          )}

          {hasText(basics.location) && (
            <span>{basics.location}</span>
          )}

          {hasText(basics.website) && (
            <a
              href={basics.website}
              target="_blank"
              rel="noreferrer"
              className="break-all underline-offset-2 hover:underline"
            >
              {basics.website}
            </a>
          )}

          {hasText(basics.linkedin) && (
            <a
              href={basics.linkedin}
              target="_blank"
              rel="noreferrer"
              className="break-all underline-offset-2 hover:underline"
            >
              {basics.linkedin}
            </a>
          )}
        </div>
      </header>

      {visibleSections.map((section) => {
        if (section.type === "basics") {
          return null;
        }

        switch (section.type) {
          case "summary":
            return (
              <Section
                key={section.id}
                title={section.title || "Profile"}
              >
                <p className="whitespace-pre-line break-words text-sm leading-6 text-gray-700">
                  {summary}
                </p>
              </Section>
            );

          case "experience":
            return (
              <Section
                key={section.id}
                title={section.title || "Experience"}
              >
                <div className="space-y-5">
                  {experience.map((item) => (
                    <ExperienceEntry
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              </Section>
            );

          case "education":
            return (
              <Section
                key={section.id}
                title={section.title || "Education"}
              >
                <div className="space-y-5">
                  {education.map((item) => (
                    <EducationEntry
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              </Section>
            );

          case "skills":
            return (
              <Section
                key={section.id}
                title={section.title || "Skills"}
              >
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-700">
                  {skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </Section>
            );

          case "projects":
            return (
              <Section
                key={section.id}
                title={section.title || "Projects"}
              >
                <div className="space-y-5">
                  {projects.map((item) => (
                    <ProjectEntry
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              </Section>
            );

          case "certifications":
            return (
              <Section
                key={section.id}
                title={section.title || "Certifications"}
              >
                <div className="space-y-5">
                  {certifications.map((item) => (
                    <CertificationEntry
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              </Section>
            );

          case "custom":
            if (!isCustomSectionData(section.data)) {
              return null;
            }

            return (
              <Section
                key={section.id}
                title={
                  section.title ||
                  "Additional information"
                }
              >
                <p className="whitespace-pre-line break-words text-sm leading-6 text-gray-700">
                  {section.data.content}
                </p>
              </Section>
            );

          default:
            return null;
        }
      })}
    </article>
  );
}
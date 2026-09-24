import type { CVDocument } from "@/lib/document/types";
import { getTemplate } from "@/lib/templates/registry";

type CVPreviewProps = {
  document: CVDocument;
};

export function CVPreview({ document }: CVPreviewProps) {
  const template =
    getTemplate(document.settings.templateId) ??
    getTemplate("professional");

  if (!template) {
    return null;
  }

  const Template = template.component;

  return (
    <section className="cv-print-root min-w-0 overflow-x-auto bg-[#deded9] p-5 lg:p-10 print:bg-white print:p-0">
      <div className="cv-print-page mx-auto w-fit">
        <Template document={document} />
      </div>
    </section>
  );
}
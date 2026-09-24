import type { CVDocument } from "@/lib/document/types";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";

type CVPreviewProps = {
  document: CVDocument;
};

export function CVPreview({ document }: CVPreviewProps) {
  return (
    <section className="cv-print-root min-w-0 overflow-x-auto bg-[#deded9] p-5 lg:p-10 print:bg-white print:p-0">
      <div className="cv-print-page mx-auto w-fit">
        <ProfessionalTemplate document={document} />
      </div>
    </section>
  );
}
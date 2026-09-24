import type { ComponentType } from "react";

import type { CVDocument } from "@/lib/document/types";
import { ProfessionalTemplate } from "@/components/preview/templates/ProfessionalTemplate";

export type CVTemplate = {
  id: string;
  name: string;
  description: string;
  component: ComponentType<{
    document: CVDocument;
  }>;
};

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: "professional",
    name: "Professional",
    description: "A clean, traditional CV layout.",
    component: ProfessionalTemplate,
  },
];

export function getTemplate(
  templateId: string,
): CVTemplate | undefined {
  return CV_TEMPLATES.find(
    (template) => template.id === templateId,
  );
}
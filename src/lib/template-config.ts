export type TemplateId = "tech"

export interface TemplateInfo {
  id: TemplateId
  name: string
  description: string
  icon: string
  available: boolean
  previewColor: string
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "tech",
    name: "TechShop",
    description: "Ideal para tiendas de electrónica, cómputo y gadgets",
    icon: "🖥️",
    available: true,
    previewColor: "#10b981",
  },
]

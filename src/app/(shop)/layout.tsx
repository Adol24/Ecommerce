import { TemplateShopWrapper } from "@/components/templates/TemplateShopWrapper"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TemplateShopWrapper>{children}</TemplateShopWrapper>
}

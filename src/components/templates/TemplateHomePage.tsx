"use client"

import { HeroBanner } from "@/components/home/HeroBanner"
import { ServiceFeatures } from "@/components/home/ServiceFeatures"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FlashSaleSection } from "@/components/home/FlashSaleSection"
import { PromoBanners } from "@/components/home/PromoBanners"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { BrandSection } from "@/components/home/BrandSection"
import { NewsletterSection } from "@/components/home/NewsletterSection"

export function TemplateHomePage() {
  return (
    <>
      <HeroBanner />
      <ServiceFeatures />
      <CategoryGrid />
      <FlashSaleSection />
      <PromoBanners />
      <FeaturedProducts />
      <BrandSection />
      <NewsletterSection />
    </>
  )
}

import { FashionHero } from "./FashionHero"
import { FashionCategoryBar } from "./FashionCategoryBar"
import { FashionFeaturedCollection } from "./FashionFeaturedCollection"
import { FashionFlashBanner } from "./FashionFlashBanner"
import { FashionTopSelling } from "./FashionTopSelling"
import { FashionVideoSection } from "./FashionVideoSection"
import { FashionCollections } from "./FashionCollections"
import { FashionTrendingFlash } from "./FashionTrendingFlash"
import { FashionReviews } from "./FashionReviews"
import { FashionNewsletter } from "./FashionNewsletter"
import { FashionBlog } from "./FashionBlog"
import { FashionInstagram } from "./FashionInstagram"

export function FashionHome() {
  return (
    <>
      <FashionHero />
      <FashionCategoryBar />
      <FashionFeaturedCollection />
      <FashionFlashBanner />
      <FashionTopSelling />
      <FashionVideoSection />
      <FashionCollections />
      <FashionTrendingFlash />
      <FashionReviews />
      <FashionNewsletter />
      <FashionBlog />
      <FashionInstagram />
    </>
  )
}

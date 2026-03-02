"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { ArrowRight } from "lucide-react"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"
import { hexToBgStyle, type HeroSlideConfig, type MiniBannerConfig } from "@/lib/homepage-config"
import { cn } from "@/lib/utils"

// ─── Slide content (shared across all background types) ───────────────────────
function SlideContent({ slide }: { slide: HeroSlideConfig }) {
  const isWhite = slide.textColor !== "dark"

  const subtitleColor = slide.subtitleColor ?? "primary"
  const subtitleStyle: React.CSSProperties =
    subtitleColor === "primary"
      ? { color: "var(--primary)" }
      : { color: subtitleColor }

  const titleStyle: React.CSSProperties = slide.titleColor
    ? { color: slide.titleColor }
    : {}

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-center gap-3 px-6 py-8 sm:gap-4 sm:px-8 sm:py-10 md:px-10",
        isWhite ? "text-white" : "text-foreground"
      )}
    >
      {slide.badge && (
        <span
          className={cn(
            "inline-block w-fit rounded px-2.5 py-1 text-xs font-semibold tracking-wide",
            isWhite ? "bg-white/20 backdrop-blur-sm" : "bg-black/10"
          )}
        >
          {slide.badge}
        </span>
      )}
      <h2
        className="text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl lg:text-5xl"
        style={titleStyle}
      >
        {slide.title}
        {slide.subtitle && (
          <span className="mt-0.5 block" style={subtitleStyle}>{slide.subtitle}</span>
        )}
      </h2>
      {slide.description && (
        <p
          className={cn(
            "max-w-xs text-sm leading-relaxed sm:max-w-sm sm:text-base",
            isWhite ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {slide.description}
        </p>
      )}
      <div className="flex flex-wrap gap-2.5 pt-1">
        {slide.ctaText && (
          <Button asChild className="h-9 px-5 text-sm font-semibold sm:h-10 sm:px-6">
            <Link href={slide.ctaHref || "/products"}>{slide.ctaText}</Link>
          </Button>
        )}
        {slide.secondaryCtaText && (
          <Button
            asChild
            variant="outline"
            className={cn(
              "h-9 px-5 text-sm font-semibold sm:h-10 sm:px-6",
              isWhite
                ? "border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                : "border-foreground/20"
            )}
          >
            <Link href={slide.secondaryCtaHref || "/products"}>{slide.secondaryCtaText}</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Image slide (full bg image + overlay) ────────────────────────────────────
function ImageSlide({ slide, index }: { slide: HeroSlideConfig; index: number }) {
  return (
    <div className="relative h-[280px] overflow-hidden rounded-xl sm:h-[340px] md:h-[420px]">
      {slide.bgImage && (
        <Image
          src={slide.bgImage}
          alt={slide.title}
          fill
          className="object-cover"
          priority={index === 0}
          sizes="(max-width: 640px) 100vw, 65vw"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: slide.overlayColor || "#000000",
          opacity: (slide.overlayOpacity ?? 45) / 100,
        }}
      />
      <div className="absolute inset-0">
        <SlideContent slide={slide} />
      </div>
    </div>
  )
}

// ─── Color slide (solid bg, no image) ────────────────────────────────────────
function ColorSlide({ slide }: { slide: HeroSlideConfig }) {
  return (
    <div
      className="relative h-[280px] overflow-hidden rounded-xl sm:h-[340px] md:h-[420px]"
      style={hexToBgStyle(slide.bgColor || "#1e3a5f")}
    >
      <div className="absolute inset-0">
        <SlideContent slide={slide} />
      </div>
    </div>
  )
}

// ─── Split slide (left color + text | right image) ────────────────────────────
function SplitSlide({ slide, index }: { slide: HeroSlideConfig; index: number }) {
  return (
    <div className="relative h-[280px] overflow-hidden rounded-xl sm:h-[340px] md:h-[420px]">
      {/* Left panel: solid color + content */}
      <div
        className="absolute inset-y-0 left-0 w-[55%]"
        style={hexToBgStyle(slide.bgColor || "#1e3a5f")}
      >
        <SlideContent slide={slide} />
      </div>
      {/* Right panel: image */}
      <div className="absolute inset-y-0 right-0 w-[45%]">
        {slide.bgImage && (
          <Image
            src={slide.bgImage}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="45vw"
          />
        )}
        {(slide.splitOverlayOpacity ?? 0) > 0 && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#000000",
              opacity: (slide.splitOverlayOpacity ?? 0) / 100,
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Mini Banner ──────────────────────────────────────────────────────────────
function MiniBanner({ banner }: { banner: MiniBannerConfig }) {
  const hasImage = Boolean(banner.image)
  const overlayOpacity = (banner.overlayOpacity ?? 95) / 100

  return (
    <Link href={banner.href} className="group relative flex-1 overflow-hidden rounded-xl">
      {/* Background image */}
      {hasImage && (
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          className="object-cover"
          sizes="35vw"
        />
      )}
      {/* Color overlay */}
      <div
        className="absolute inset-0"
        style={{ ...hexToBgStyle(banner.bgColorHex), opacity: overlayOpacity }}
      />
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-6 text-white">
        {banner.label && (
          <span className="text-[11px] font-bold uppercase tracking-widest opacity-75">
            {banner.label}
          </span>
        )}
        <p className="text-xl font-black leading-tight xl:text-2xl">{banner.title}</p>
        {banner.subtitle && (
          <p className="text-sm font-medium opacity-90">{banner.subtitle}</p>
        )}
        {banner.ctaText && (
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold">
            {banner.ctaText}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </Link>
  )
}

// ─── HeroBanner ───────────────────────────────────────────────────────────────
export function HeroBanner() {
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const { settings } = useStoreSettings()

  const slides = React.useMemo(
    () => settings.homepageConfig.heroSlides.filter((s) => s.visible),
    [settings.homepageConfig.heroSlides]
  )

  const miniBanners = React.useMemo(
    () => settings.homepageConfig.miniBanners.filter((b) => b.visible),
    [settings.homepageConfig.miniBanners]
  )

  React.useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  if (slides.length === 0) return null

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex gap-3">
          {/* Main Carousel — 65% */}
          <div className="min-w-0 flex-[65]">
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              opts={{ loop: true }}
              setApi={setApi}
            >
              <CarouselContent>
                {slides.map((slide, index) => (
                  <CarouselItem key={slide.id}>
                    {slide.backgroundType === "color" ? (
                      <ColorSlide slide={slide} />
                    ) : slide.backgroundType === "split" ? (
                      <SplitSlide slide={slide} index={index} />
                    ) : (
                      <ImageSlide slide={slide} index={index} />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="left-3 h-8 w-8 sm:left-4" />
              <CarouselNext className="right-3 h-8 w-8 sm:right-4" />
            </Carousel>

            {/* Slide dots — outside the slide, below it */}
            {slides.length > 1 && (
              <div className="mt-2.5 flex justify-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => api?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mini banners — 35%, hidden on mobile */}
          {miniBanners.length > 0 && (
            <div className="hidden flex-[35] flex-col gap-3 lg:flex">
              {miniBanners.map((banner) => (
                <MiniBanner key={banner.id} banner={banner} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

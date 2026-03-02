"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"

export function PromoBanners() {
  const { settings } = useStoreSettings()
  const banners = settings.homepageConfig.promoBanners.filter((b) => b.visible)

  if (banners.length === 0) return null

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 gap-4 ${banners.length >= 3 ? "sm:grid-cols-3" : banners.length === 2 ? "sm:grid-cols-2" : ""}`}>
          {banners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.href}
              className="group relative h-40 overflow-hidden rounded-lg sm:h-44"
            >
              {banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              )}
              <div
                className="absolute inset-0 opacity-75"
                style={{ backgroundColor: banner.overlayHex }}
              />
              <div className="absolute inset-0 flex flex-col justify-center px-5 text-white">
                <span className="text-xs font-semibold tracking-widest opacity-80">
                  {banner.label}
                </span>
                <h3 className="mt-1 text-2xl font-bold leading-tight">{banner.title}</h3>
                <p className="text-sm opacity-90">{banner.subtitle}</p>
                <div className="mt-3 flex items-center gap-1 text-sm font-semibold">
                  {banner.ctaText}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import {
  Gift, Tag, Truck, Star, Coins, CreditCard, RotateCcw, ShieldCheck,
  Package, Heart, Percent, Zap, Award, Clock, Headphones, ThumbsUp,
  CheckCircle, Bell, ShoppingBag, Sparkles, Home, MapPin, BadgePercent,
} from "lucide-react"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"
import { SERVICE_COLOR_CLASS_MAP } from "@/lib/homepage-config"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Gift, Tag, Truck, Star, Coins, CreditCard, RotateCcw, ShieldCheck,
  Package, Heart, Percent, Zap, Award, Clock, Headphones, ThumbsUp,
  CheckCircle, Bell, ShoppingBag, Sparkles, Home, MapPin, BadgePercent,
}

export function ServiceFeatures() {
  const { settings } = useStoreSettings()
  const features = settings.homepageConfig.serviceFeatures.filter((f) => f.visible)

  if (features.length === 0) return null

  return (
    <section className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div
          className="flex gap-1 overflow-x-auto py-3 sm:justify-around sm:gap-0 scrollbar-none"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {features.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon] ?? Package
            const colorClass = SERVICE_COLOR_CLASS_MAP[feature.colorKey] ?? SERVICE_COLOR_CLASS_MAP.orange
            return (
              <div
                key={feature.id}
                className="flex min-w-[80px] flex-col items-center gap-1.5 px-3 py-2 sm:min-w-0 sm:flex-row sm:gap-2"
                style={{ scrollSnapAlign: "start" }}
              >
                {index > 0 && (
                  <div className="absolute hidden h-6 w-px bg-border sm:block" style={{ left: 0 }} />
                )}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-center text-xs font-medium sm:text-left sm:text-[13px]">
                  {feature.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

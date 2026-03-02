"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Flame, ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import { useProductsStore } from "@/stores/products-store"
import { useCartStore } from "@/stores/cart-store"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"
import { isFlashSaleActive } from "@/lib/homepage-config"
import { useAppRealtimeRefresh } from "@/hooks/useAppRealtimeRefresh"
import type { Product } from "@/types"

const FALLBACK_END = new Date(Date.now() + 1000 * 60 * 60 * 8)

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now())
    return {
      hours: Math.floor(diff / 1000 / 3600),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }
  const [time, setTime] = React.useState(calc)
  React.useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return time
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-8 w-9 items-center justify-center rounded bg-destructive text-sm font-bold text-white tabular-nums sm:h-9 sm:w-11 sm:text-base">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-0.5 text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=400&h=400&fit=crop"

function FlashProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = React.useState(false)

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const soldPercent = React.useMemo(() => {
    const hash = product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    return 30 + (hash % 55)
  }, [product.id])

  const image = product.images?.[0] || PLACEHOLDER

  return (
    <div className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-white">
        {hasDiscount && (
          <div className="absolute left-0 top-0 z-10 rounded-br bg-destructive px-1.5 py-0.5 text-xs font-bold text-white">
            -{discountPercent}%
          </div>
        )}
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-contain p-3 transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 20vw"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/products/${product.slug}`}>
          <h4 className="line-clamp-2 text-xs font-medium leading-tight hover:text-primary sm:text-sm">
            {product.name}
          </h4>
        </Link>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-primary sm:text-lg">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.originalPrice!.toFixed(2)}
            </span>
          )}
        </div>

        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Vendidos</span>
            <span>{soldPercent}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-destructive" style={{ width: `${soldPercent}%` }} />
          </div>
        </div>

        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={handleAdd}
          disabled={product.stock === 0}
          variant={added ? "secondary" : "default"}
        >
          {added ? (
            <><Check className="mr-1.5 h-3.5 w-3.5" /> Agregado</>
          ) : (
            <><ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Agregar</>
          )}
        </Button>
      </div>
    </div>
  )
}

export function FlashSaleSection() {
  const { settings } = useStoreSettings()
  const flashConfig = settings?.homepageConfig?.flashSale ?? {
    visible: false,
    endDate: "",
    scheduledStartDate: "",
    productIds: [],
    maxProducts: 8,
  }

  const { featuredProducts, products, fetchFeaturedProducts, fetchProducts } = useProductsStore()

  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    align: "start",
  })

  // ─── Reactive active state ────────────────────────────────────────────────
  // Re-evaluated every second so the section auto-hides when endDate passes
  // and auto-shows when scheduledStartDate arrives.
  const [isActive, setIsActive] = React.useState(() => isFlashSaleActive(flashConfig))

  React.useEffect(() => {
    setIsActive(isFlashSaleActive(flashConfig))
    const id = setInterval(() => setIsActive(isFlashSaleActive(flashConfig)), 1000)
    return () => clearInterval(id)
  }, [flashConfig])

  React.useEffect(() => {
    if (featuredProducts.length === 0) void fetchFeaturedProducts()
    if (products.length === 0) void fetchProducts()
  }, [featuredProducts.length, products.length, fetchFeaturedProducts, fetchProducts])

  useAppRealtimeRefresh(["products"], React.useCallback(async () => {
    await Promise.all([fetchFeaturedProducts(), fetchProducts()])
  }, [fetchFeaturedProducts, fetchProducts]))

  // Countdown target — derived from config
  const countdownTarget = React.useMemo(() => {
    if (flashConfig.endDate) {
      const d = new Date(flashConfig.endDate)
      return isNaN(d.getTime()) ? FALLBACK_END : d
    }
    return FALLBACK_END
  }, [flashConfig.endDate])

  // Countdown tick — always runs (hooks must not be conditional)
  const time = useCountdown(countdownTarget)

  // Products to display — ALL hooks must be declared before any early return
  const saleProducts: Product[] = React.useMemo(() => {
    const max = flashConfig.maxProducts || 8
    if (flashConfig.productIds.length > 0) {
      const byId = new Map(products.map((p) => [p.id, p]))
      const selected = flashConfig.productIds
        .map((id) => byId.get(id))
        .filter((p): p is Product => p !== undefined)
      return selected.slice(0, max)
    }
    return featuredProducts.slice(0, max)
  }, [flashConfig.productIds, flashConfig.maxProducts, products, featuredProducts])

  // ─── Early returns — ONLY after all hooks ────────────────────────────────
  if (!isActive) return null
  if (saleProducts.length === 0) return null

  return (
    <section className="border-y py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-bold sm:text-xl">VENTA FLASH</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <CountdownUnit value={time.hours} label="HRS" />
              <span className="mb-4 font-bold text-muted-foreground">:</span>
              <CountdownUnit value={time.minutes} label="MIN" />
              <span className="mb-4 font-bold text-muted-foreground">:</span>
              <CountdownUnit value={time.seconds} label="SEG" />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => emblaApi?.scrollPrev()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => emblaApi?.scrollNext()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {saleProducts.map((product) => (
              <div
                key={product.id}
                className="min-w-0 flex-[0_0_calc(50%-6px)] sm:flex-[0_0_calc(33.333%-8px)] md:flex-[0_0_calc(25%-9px)] lg:flex-[0_0_calc(20%-10px)]"
              >
                <FlashProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

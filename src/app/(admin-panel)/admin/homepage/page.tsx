"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Save, Flame, LayoutTemplate, Sparkles, Image as ImageIcon,
  Gift, Tag, Truck, Star, Coins, CreditCard, RotateCcw, ShieldCheck,
  Package, Heart, Percent, Zap, Award, Clock, Headphones, ThumbsUp,
  CheckCircle, Bell, ShoppingBag, Home, MapPin, BadgePercent, Search,
  GripVertical, ChevronDown, ChevronUp, Plus, Trash2, SlidersHorizontal,
  Loader2, Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedClient } from "@/lib/realtime-publish-client"
import {
  type HomepageConfig,
  type HeroSlideConfig,
  type HeroBackgroundType,
  type MiniBannerConfig,
  type ServiceFeatureConfig,
  type FlashSaleConfig,
  type PromoBannerConfig,
  SERVICE_ICON_OPTIONS,
  SERVICE_COLOR_OPTIONS,
  MINI_BANNER_COLOR_PRESETS,
  PROMO_OVERLAY_PRESETS,
  HERO_BG_COLOR_PRESETS,
  HERO_OVERLAY_COLOR_PRESETS,
  hexToBgStyle,
  emptyHeroSlide,
} from "@/lib/homepage-config"

// ─── Icon map (all imported statically for bundle safety) ─────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Gift, Tag, Truck, Star, Coins, CreditCard, RotateCcw, ShieldCheck,
  Package, Heart, Percent, Zap, Award, Clock, Headphones, ThumbsUp,
  CheckCircle, Bell, ShoppingBag, Sparkles, Home, MapPin, BadgePercent,
}

// ─── Simple single-image upload field ────────────────────────────────────────
function ImageUrlField({
  value,
  onChange,
  label,
  placeholder,
  folder = "banners",
}: {
  value: string
  onChange: (url: string) => void
  label: string
  placeholder?: string
  folder?: string
}) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const sigRes = await fetch("/api/upload/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      })
      const sigData = await sigRes.json()
      if (!sigData.success) throw new Error("Firma inválida")

      const form = new FormData()
      form.append("file", file)
      form.append("api_key", sigData.data.apiKey)
      form.append("timestamp", sigData.data.timestamp.toString())
      form.append("signature", sigData.data.signature)
      form.append("folder", folder)

      const upRes = await fetch(sigData.uploadUrl, { method: "POST", body: form })
      const upData = await upRes.json()
      if (upData.secure_url) onChange(upData.secure_url)
    } catch {
      // silent fail — user can paste URL manually
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://..."}
          className="h-8 flex-1 text-xs"
        />
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(file)
            }}
          />
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors">
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        </label>
      </div>
    </div>
  )
}

// ─── Link Picker Field ────────────────────────────────────────────────────────
type SimpleItem = { name: string; slug: string }

const STATIC_LINK_OPTIONS = [
  { value: "/products", label: "Todos los productos" },
  { value: "/", label: "Inicio" },
] as const

function LinkPickerField({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  const [cats, setCats] = useState<SimpleItem[]>([])
  const [brands, setBrands] = useState<SimpleItem[]>([])
  const [customMode, setCustomMode] = useState(false)

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setCats(d) })
      .catch(() => {})
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setBrands(d) })
      .catch(() => {})
  }, [])

  const knownValues = useMemo(() => {
    const set = new Set<string>(["/products", "/"])
    cats.forEach((c) => set.add(`/products?category=${c.slug}`))
    brands.forEach((b) => set.add(`/products?brand=${b.slug}`))
    return set
  }, [cats, brands])

  // After cats/brands load, check if current value is "custom"
  useEffect(() => {
    if (cats.length === 0 && brands.length === 0) return
    if (value && !knownValues.has(value)) setCustomMode(true)
    else setCustomMode(false)
  }, [cats, brands, knownValues, value])

  const isCustom = customMode || Boolean(value && !knownValues.has(value) && cats.length > 0)
  const selectValue = isCustom ? "__custom__" : (value || "/products")

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          if (v === "__custom__") {
            setCustomMode(true)
          } else {
            setCustomMode(false)
            onChange(v)
          }
        }}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Seleccionar destino..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-[10px]">Páginas</SelectLabel>
            {STATIC_LINK_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
            ))}
          </SelectGroup>
          {cats.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-[10px]">Por categoría</SelectLabel>
              {cats.map((c) => (
                <SelectItem key={c.slug} value={`/products?category=${c.slug}`} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {brands.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-[10px]">Por marca</SelectLabel>
              {brands.map((b) => (
                <SelectItem key={b.slug} value={`/products?brand=${b.slug}`} className="text-xs">
                  {b.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          <SelectGroup>
            <SelectItem value="__custom__" className="text-xs text-muted-foreground">
              URL personalizada...
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {isCustom && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/products?category=..."
          className="h-8 text-xs"
        />
      )}
    </div>
  )
}

// ─── Text color preset swatches ───────────────────────────────────────────────
const TITLE_COLOR_PRESETS = [
  { label: "Heredar", value: "", preview: null },
  { label: "Blanco",  value: "#ffffff", preview: "#ffffff" },
  { label: "Gris claro", value: "#e5e7eb", preview: "#e5e7eb" },
  { label: "Ámbar",   value: "#fbbf24", preview: "#fbbf24" },
  { label: "Cyan",    value: "#22d3ee", preview: "#22d3ee" },
  { label: "Rosa",    value: "#f472b6", preview: "#f472b6" },
  { label: "Oscuro",  value: "#1f2937", preview: "#1f2937" },
]

const SUBTITLE_COLOR_PRESETS = [
  { label: "Primario", value: "primary",  preview: null },
  { label: "Blanco",   value: "#ffffff",  preview: "#ffffff" },
  { label: "Ámbar",    value: "#fbbf24",  preview: "#fbbf24" },
  { label: "Cyan",     value: "#22d3ee",  preview: "#22d3ee" },
  { label: "Rosa",     value: "#f472b6",  preview: "#f472b6" },
  { label: "Oscuro",   value: "#1f2937",  preview: "#1f2937" },
]

// ─── Hero Slide Card ──────────────────────────────────────────────────────────
function HeroSlideCard({
  slide,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  slide: HeroSlideConfig
  index: number
  total: number
  onChange: (s: HeroSlideConfig) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [expanded, setExpanded] = useState(index === 0)
  const set = <K extends keyof HeroSlideConfig>(k: K, v: HeroSlideConfig[K]) =>
    onChange({ ...slide, [k]: v })

  const bgTypeLabel: Record<HeroBackgroundType, string> = {
    image: "Imagen de fondo",
    color: "Color sólido",
    split: "Split (color + imagen)",
  }

  // Mini preview style
  const previewStyle = (): React.CSSProperties => {
    if (slide.backgroundType === "image") {
      return slide.bgImage
        ? { backgroundImage: `url(${slide.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { backgroundColor: "#1f2937" }
    }
    if (slide.backgroundType === "color") {
      return slide.bgColor === "primary"
        ? { backgroundColor: "var(--primary)" }
        : { backgroundColor: slide.bgColor || "#1e3a5f" }
    }
    // split
    return { backgroundColor: slide.bgColor || "#1e3a5f" }
  }

  return (
    <Card className={`transition-opacity ${!slide.visible ? "opacity-60" : ""}`}>
      {/* Header row */}
      <CardHeader className="pb-0 pt-3 px-4">
        <div className="flex items-center gap-2">
          {/* Reorder */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mini thumbnail */}
          <div
            className="h-9 w-14 shrink-0 overflow-hidden rounded border"
            style={previewStyle()}
          />

          {/* Title + type */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              Slide {index + 1}{slide.title ? ` — ${slide.title}` : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">{bgTypeLabel[slide.backgroundType]}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={slide.visible}
              onCheckedChange={(v) => set("visible", v)}
              className="scale-90"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onRemove}
              disabled={total <= 1}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-4 px-4 pb-4">
          {/* Background type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de fondo</Label>
            <Select
              value={slide.backgroundType}
              onValueChange={(v) => set("backgroundType", v as HeroBackgroundType)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Imagen de fondo completo</SelectItem>
                <SelectItem value="color">Color sólido (sin imagen)</SelectItem>
                <SelectItem value="split">Split: izquierda color / derecha imagen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Content fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Badge / Etiqueta</Label>
              <Input value={slide.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Nuevo Lanzamiento" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Color de texto base</Label>
              <Select value={slide.textColor} onValueChange={(v) => set("textColor", v as "white" | "dark")}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">Blanco (fondos oscuros)</SelectItem>
                  <SelectItem value="dark">Oscuro (fondos claros)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Título + color */}
          <div className="space-y-1">
            <Label className="text-xs">Título</Label>
            <Input value={slide.title} onChange={(e) => set("title", e.target.value)} placeholder="RTX Serie 40" className="h-8 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Color del título</Label>
            <div className="flex flex-wrap items-center gap-2">
              {TITLE_COLOR_PRESETS.map((p) =>
                p.preview === null ? (
                  <button
                    key={p.value}
                    type="button"
                    title={p.label}
                    onClick={() => set("titleColor", p.value)}
                    className={`h-7 rounded border px-2 text-[10px] font-medium transition-colors ${
                      slide.titleColor === p.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ) : (
                  <button
                    key={p.value}
                    type="button"
                    title={p.label}
                    onClick={() => set("titleColor", p.value)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      slide.titleColor === p.value ? "border-foreground scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: p.preview }}
                  />
                )
              )}
              <input
                type="color"
                value={slide.titleColor && slide.titleColor !== "" ? slide.titleColor : "#ffffff"}
                onChange={(e) => set("titleColor", e.target.value)}
                className="h-6 w-6 cursor-pointer rounded-full border-2 border-border"
                title="Color personalizado"
              />
            </div>
          </div>

          {/* Subtítulo + color */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Subtítulo</Label>
              <Input value={slide.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Potencia Máxima" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Descripción</Label>
              <Input value={slide.description} onChange={(e) => set("description", e.target.value)} placeholder="Descripción corta..." className="h-8 text-xs" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Color del subtítulo</Label>
            <div className="flex flex-wrap items-center gap-2">
              {SUBTITLE_COLOR_PRESETS.map((p) =>
                p.preview === null ? (
                  <button
                    key={p.value}
                    type="button"
                    title={p.label}
                    onClick={() => set("subtitleColor", p.value)}
                    className={`h-7 rounded border px-2 text-[10px] font-medium transition-colors ${
                      (slide.subtitleColor ?? "primary") === p.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ) : (
                  <button
                    key={p.value}
                    type="button"
                    title={p.label}
                    onClick={() => set("subtitleColor", p.value)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      (slide.subtitleColor ?? "primary") === p.value ? "border-foreground scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: p.preview }}
                  />
                )
              )}
              <input
                type="color"
                value={
                  slide.subtitleColor && slide.subtitleColor !== "primary"
                    ? slide.subtitleColor
                    : "#22c55e"
                }
                onChange={(e) => set("subtitleColor", e.target.value)}
                className="h-6 w-6 cursor-pointer rounded-full border-2 border-border"
                title="Color personalizado"
              />
            </div>
          </div>

          {/* CTA buttons */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Botón principal — Texto</Label>
              <Input value={slide.ctaText} onChange={(e) => set("ctaText", e.target.value)} placeholder="Ver ahora" className="h-8 text-xs" />
            </div>
            <LinkPickerField
              label="Botón principal — Destino"
              value={slide.ctaHref}
              onChange={(v) => set("ctaHref", v)}
            />
            <div className="space-y-1">
              <Label className="text-xs">Botón secundario — Texto</Label>
              <Input value={slide.secondaryCtaText} onChange={(e) => set("secondaryCtaText", e.target.value)} placeholder="Ver Todo" className="h-8 text-xs" />
            </div>
            <LinkPickerField
              label="Botón secundario — Destino"
              value={slide.secondaryCtaHref}
              onChange={(v) => set("secondaryCtaHref", v)}
            />
          </div>

          <Separator />

          {/* Background settings — conditional by type */}

          {/* "image" — background image + overlay */}
          {slide.backgroundType === "image" && (
            <div className="space-y-3">
              <ImageUrlField
                label="URL de imagen de fondo"
                value={slide.bgImage}
                onChange={(v) => set("bgImage", v)}
                placeholder="https://images.unsplash.com/..."
              />
              <div className="space-y-1.5">
                <Label className="text-xs">Color del overlay</Label>
                <div className="flex flex-wrap gap-2">
                  {HERO_OVERLAY_COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      title={p.label}
                      onClick={() => set("overlayColor", p.hex)}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        slide.overlayColor === p.hex ? "border-foreground scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: p.hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={slide.overlayColor || "#000000"}
                    onChange={(e) => set("overlayColor", e.target.value)}
                    className="h-6 w-6 cursor-pointer rounded-full border-2 border-border"
                    title="Color personalizado"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Opacidad del overlay</Label>
                  <span className="text-xs font-medium tabular-nums">{slide.overlayOpacity ?? 45}%</span>
                </div>
                <Slider
                  min={0} max={100} step={5}
                  value={[slide.overlayOpacity ?? 45]}
                  onValueChange={([v]) => set("overlayOpacity", v)}
                />
              </div>
            </div>
          )}

          {/* "color" — solid background */}
          {slide.backgroundType === "color" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Color de fondo</Label>
              <div className="flex flex-wrap gap-2">
                {HERO_BG_COLOR_PRESETS.map((p) => (
                  <button
                    key={p.hex}
                    type="button"
                    title={p.label}
                    onClick={() => set("bgColor", p.hex)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                      slide.bgColor === p.hex ? "border-foreground scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: p.hex }}
                  />
                ))}
                <input
                  type="color"
                  value={slide.bgColor || "#1e3a5f"}
                  onChange={(e) => set("bgColor", e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded-full border-2 border-border"
                  title="Color personalizado"
                />
              </div>
            </div>
          )}

          {/* "split" — left color + right image */}
          {slide.backgroundType === "split" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Color del panel izquierdo (contenido)</Label>
                <div className="flex flex-wrap gap-2">
                  {HERO_BG_COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      title={p.label}
                      onClick={() => set("bgColor", p.hex)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                        slide.bgColor === p.hex ? "border-foreground scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: p.hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={slide.bgColor || "#1e3a5f"}
                    onChange={(e) => set("bgColor", e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded-full border-2 border-border"
                    title="Color personalizado"
                  />
                </div>
              </div>
              <ImageUrlField
                label="URL de imagen — panel derecho"
                value={slide.bgImage}
                onChange={(v) => set("bgImage", v)}
                placeholder="https://images.unsplash.com/..."
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Opacidad overlay imagen (panel derecho)</Label>
                  <span className="text-xs font-medium tabular-nums">{slide.splitOverlayOpacity ?? 0}%</span>
                </div>
                <Slider
                  min={0} max={80} step={5}
                  value={[slide.splitOverlayOpacity ?? 0]}
                  onValueChange={([v]) => set("splitOverlayOpacity", v)}
                />
              </div>
            </div>
          )}

          {/* Mini preview */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Vista previa aproximada</Label>
            <div className="relative h-24 overflow-hidden rounded-lg border" style={previewStyle()}>
              {slide.backgroundType === "image" && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: slide.overlayColor || "#000",
                    opacity: (slide.overlayOpacity ?? 45) / 100,
                  }}
                />
              )}
              {slide.backgroundType === "split" && slide.bgImage && (
                <div
                  className="absolute inset-y-0 right-0 w-[45%]"
                  style={{
                    backgroundImage: `url(${slide.bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                {slide.badge && (
                  <span className="mb-1 inline-block w-fit rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {slide.badge}
                  </span>
                )}
                <p
                  className="text-sm font-bold leading-tight"
                  style={{ color: slide.textColor === "dark" ? "#1f2937" : "#fff" }}
                >
                  {slide.title || "Título del slide"}
                </p>
                {slide.subtitle && (
                  <p className="text-xs font-bold" style={{ color: "var(--primary)" }}>
                    {slide.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ─── Mini Banner Editor ───────────────────────────────────────────────────────
function MiniBannerCard({
  banner,
  index,
  onChange,
}: {
  banner: MiniBannerConfig
  index: number
  onChange: (b: MiniBannerConfig) => void
}) {
  const set = <K extends keyof MiniBannerConfig>(k: K, v: MiniBannerConfig[K]) =>
    onChange({ ...banner, [k]: v })

  const previewBg = banner.bgColorHex === "primary" ? "var(--primary)" : banner.bgColorHex

  return (
    <Card className={`transition-opacity ${!banner.visible ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Banner {index + 1}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{banner.visible ? "Visible" : "Oculto"}</span>
            <Switch checked={banner.visible} onCheckedChange={(v) => set("visible", v)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Etiqueta (pequeña)</Label>
            <Input value={banner.label} onChange={(e) => set("label", e.target.value)} placeholder="OFERTA HOY" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Título (grande)</Label>
            <Input value={banner.title} onChange={(e) => set("title", e.target.value)} placeholder="50% OFF" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Subtítulo</Label>
            <Input value={banner.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="en Accesorios" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Texto del botón</Label>
            <Input value={banner.ctaText} onChange={(e) => set("ctaText", e.target.value)} placeholder="Ver ahora" className="h-8 text-xs" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Enlace</Label>
          <Input value={banner.href} onChange={(e) => set("href", e.target.value)} placeholder="/products" className="h-8 text-xs" />
        </div>

        {/* Color swatches */}
        <div className="space-y-1.5">
          <Label className="text-xs">Color de fondo</Label>
          <div className="flex flex-wrap gap-2">
            {MINI_BANNER_COLOR_PRESETS.map((preset) => {
              const isSelected = banner.bgColorHex === preset.hex
              const style = preset.hex === "primary"
                ? { backgroundColor: "var(--primary)" }
                : { backgroundColor: preset.hex }
              return (
                <button
                  key={preset.hex}
                  type="button"
                  title={preset.label}
                  onClick={() => set("bgColorHex", preset.hex)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    isSelected ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={style}
                />
              )
            })}
          </div>
        </div>

        {/* Image URL */}
        <ImageUrlField
          label="Imagen de fondo (opcional)"
          value={banner.image}
          onChange={(v) => set("image", v)}
          placeholder="https://... (dejar vacío para usar solo color)"
        />

        {/* Overlay opacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Opacidad del color sobre la imagen</Label>
            <span className="text-xs font-medium tabular-nums">{banner.overlayOpacity ?? 95}%</span>
          </div>
          <Slider
            min={0} max={100} step={5}
            value={[banner.overlayOpacity ?? 95]}
            onValueChange={([v]) => set("overlayOpacity", v)}
          />
          <p className="text-[11px] text-muted-foreground">
            100% = solo color | 0% = solo imagen | valores medios = mezcla
          </p>
        </div>

        {/* Mini preview */}
        <div className="space-y-1.5">
          <Label className="text-xs">Vista previa</Label>
          <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-lg px-4">
            {banner.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: previewBg,
                opacity: (banner.overlayOpacity ?? 95) / 100,
              }}
            />
            <div className="relative z-10 text-white">
              <p className="text-[10px] font-bold tracking-widest opacity-80">{banner.label || "ETIQUETA"}</p>
              <p className="text-lg font-black leading-tight">{banner.title || "Título"}</p>
              <p className="text-xs opacity-90">{banner.subtitle || "Subtítulo"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Service Feature Row ──────────────────────────────────────────────────────
function ServiceFeatureRow({
  feature,
  onChange,
}: {
  feature: ServiceFeatureConfig
  onChange: (f: ServiceFeatureConfig) => void
}) {
  const set = <K extends keyof ServiceFeatureConfig>(k: K, v: ServiceFeatureConfig[K]) =>
    onChange({ ...feature, [k]: v })

  const Icon = ICON_MAP[feature.icon] ?? Package
  const colorOpt = SERVICE_COLOR_OPTIONS.find((c) => c.key === feature.colorKey)

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 transition-opacity ${!feature.visible ? "opacity-50" : ""}`}>
      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

      <Switch
        checked={feature.visible}
        onCheckedChange={(v) => set("visible", v)}
        className="shrink-0"
      />

      {/* Icon preview */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: colorOpt ? `${colorOpt.preview}20` : undefined,
          color: colorOpt?.preview,
        }}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Label */}
      <Input
        value={feature.label}
        onChange={(e) => set("label", e.target.value)}
        placeholder="Nombre del servicio"
        className="h-8 flex-1 text-xs"
      />

      {/* Icon selector */}
      <Select value={feature.icon} onValueChange={(v) => set("icon", v)}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-48">
          {SERVICE_ICON_OPTIONS.map((iconName) => {
            const Ic = ICON_MAP[iconName] ?? Package
            return (
              <SelectItem key={iconName} value={iconName}>
                <span className="flex items-center gap-1.5">
                  <Ic className="h-3.5 w-3.5" />
                  {iconName}
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* Color selector */}
      <div className="flex gap-1">
        {SERVICE_COLOR_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            title={opt.label}
            onClick={() => set("colorKey", opt.key)}
            className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
              feature.colorKey === opt.key ? "border-foreground scale-110" : "border-transparent"
            }`}
            style={{ backgroundColor: opt.preview }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Flash Sale Editor ────────────────────────────────────────────────────────
interface SlimProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
}

const FLASH_IMG_PLACEHOLDER = "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=80&h=80&fit=crop"

function FlashSaleEditor({
  config,
  onChange,
}: {
  config: FlashSaleConfig
  onChange: (c: FlashSaleConfig) => void
}) {
  const set = <K extends keyof FlashSaleConfig>(k: K, v: FlashSaleConfig[K]) =>
    onChange({ ...config, [k]: v })

  const [products, setProducts] = useState<SlimProduct[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [onlySelected, setOnlySelected] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoadingProducts(true)
      try {
        const res = await fetch("/api/products")
        const json = await res.json()
        const list: SlimProduct[] = (json.products ?? []).map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          slug: p.slug as string,
          price: Number(p.price) || 0,
          images: (p.images as string[]) || [],
        }))
        // Sort alphabetically
        list.sort((a, b) => a.name.localeCompare(b.name))
        setProducts(list)
      } finally {
        setLoadingProducts(false)
      }
    }
    void load()
  }, [])

  const filtered = useMemo(() => {
    let list = products
    if (onlySelected) list = list.filter((p) => config.productIds.includes(p.id))
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    return list
  }, [products, productSearch, onlySelected, config.productIds])

  const selectedProducts = useMemo(
    () => products.filter((p) => config.productIds.includes(p.id)),
    [products, config.productIds]
  )

  const toggleProduct = (id: string) => {
    const current = config.productIds
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    set("productIds", next)
  }

  const toLocalInput = (iso: string) => {
    if (!iso) return ""
    try { return new Date(iso).toISOString().slice(0, 16) } catch { return "" }
  }

  const fromLocalInput = (local: string) => {
    if (!local) return ""
    return new Date(local).toISOString()
  }

  // How many will actually be shown on the site (respects maxProducts)
  const displayCount = Math.min(
    config.productIds.length > 0 ? config.productIds.length : 8,
    config.maxProducts || 8
  )

  return (
    <div className="space-y-5">
      {/* Visibility toggle */}
      <div className="flex items-center gap-3">
        <Switch checked={config.visible} onCheckedChange={(v) => set("visible", v)} />
        <span className="text-sm font-medium">{config.visible ? "Sección visible" : "Sección oculta"}</span>
        {!config.visible && (
          <Badge variant="outline" className="text-muted-foreground">La sección no se muestra en la tienda</Badge>
        )}
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Inicio programado <span className="text-muted-foreground text-xs">(opcional)</span></Label>
          <Input
            type="datetime-local"
            value={toLocalInput(config.scheduledStartDate)}
            onChange={(e) => set("scheduledStartDate", fromLocalInput(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            La sección aparece automáticamente a partir de esta fecha/hora. Vacío = visible ya.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Fin de la venta <span className="text-destructive text-xs">*</span></Label>
          <Input
            type="datetime-local"
            value={toLocalInput(config.endDate)}
            onChange={(e) => set("endDate", fromLocalInput(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            La sección se oculta automáticamente cuando el countdown llegue a cero.
            {!config.endDate && " Vacío = contador de 8h desde que el usuario carga la página."}
          </p>
        </div>
      </div>

      {/* Max products */}
      <div className="space-y-1.5">
        <Label>Máximo de productos en el carrusel</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={1}
            max={20}
            value={config.maxProducts}
            onChange={(e) => set("maxProducts", Math.max(1, parseInt(e.target.value) || 8))}
            className="w-28"
          />
          {config.productIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Se mostrarán <span className="font-semibold text-foreground">{displayCount}</span> de{" "}
              {config.productIds.length} productos seleccionados.
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* ── Selected products preview ── */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-destructive" />
              Actualmente en Venta Flash
              <Badge variant="secondary" className="ml-1 text-xs">
                {selectedProducts.length} producto{selectedProducts.length > 1 ? "s" : ""}
                {selectedProducts.length > (config.maxProducts || 8) && (
                  <span className="text-muted-foreground">
                    {" "}(se muestran {config.maxProducts || 8})
                  </span>
                )}
              </Badge>
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={() => set("productIds", [])}
            >
              Limpiar todo
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((p, i) => {
              const isOverLimit = i >= (config.maxProducts || 8)
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 rounded-full border pl-1 pr-2 py-0.5 text-xs transition-opacity ${
                    isOverLimit ? "opacity-40" : "bg-primary/5 border-primary/20"
                  }`}
                  title={isOverLimit ? "Supera el máximo, no se mostrará" : p.name}
                >
                  <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-muted">
                    <img
                      src={p.images?.[0] || FLASH_IMG_PLACEHOLDER}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="max-w-[120px] truncate">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Product picker ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>Seleccionar productos</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.productIds.length === 0
                ? "Sin selección — se usan los productos destacados automáticamente"
                : `${config.productIds.length} seleccionado${config.productIds.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <Button
            type="button"
            variant={onlySelected ? "default" : "outline"}
            size="sm"
            className="h-8 shrink-0 text-xs"
            onClick={() => setOnlySelected((v) => !v)}
            disabled={config.productIds.length === 0}
          >
            <Flame className="mr-1.5 h-3 w-3" />
            Solo seleccionados
          </Button>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-lg border">
          {loadingProducts ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando productos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {onlySelected ? "No hay productos seleccionados" : "No se encontraron productos"}
            </div>
          ) : (
            filtered.map((product) => {
              const isSelected = config.productIds.includes(product.id)
              const img = product.images?.[0] || FLASH_IMG_PLACEHOLDER
              return (
                <label
                  key={product.id}
                  className={`flex cursor-pointer items-center gap-3 border-b px-3 py-2 transition-colors last:border-0 hover:bg-muted/50 ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProduct(product.id)}
                    className="h-4 w-4 shrink-0 accent-primary"
                  />
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded border bg-white">
                    <img
                      src={img}
                      alt={product.name}
                      className="h-full w-full object-contain p-0.5"
                    />
                  </div>
                  <span className="flex-1 truncate text-sm font-medium">{product.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">${product.price.toFixed(2)}</span>
                </label>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Promo Banner Editor ──────────────────────────────────────────────────────
function PromoBannerCard({
  banner,
  index,
  onChange,
}: {
  banner: PromoBannerConfig
  index: number
  onChange: (b: PromoBannerConfig) => void
}) {
  const set = <K extends keyof PromoBannerConfig>(k: K, v: PromoBannerConfig[K]) =>
    onChange({ ...banner, [k]: v })

  return (
    <Card className={`transition-opacity ${!banner.visible ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Banner {index + 1}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{banner.visible ? "Visible" : "Oculto"}</span>
            <Switch checked={banner.visible} onCheckedChange={(v) => set("visible", v)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Etiqueta</Label>
            <Input value={banner.label} onChange={(e) => set("label", e.target.value)} placeholder="PROMOCIÓN ESPECIAL" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Título</Label>
            <Input value={banner.title} onChange={(e) => set("title", e.target.value)} placeholder="Hasta 50% OFF" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Subtítulo</Label>
            <Input value={banner.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="en Electrónica" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Texto del botón</Label>
            <Input value={banner.ctaText} onChange={(e) => set("ctaText", e.target.value)} placeholder="Ver ofertas" className="h-8 text-xs" />
          </div>
        </div>
        <LinkPickerField
          label="Destino del banner"
          value={banner.href}
          onChange={(v) => set("href", v)}
        />
        <ImageUrlField
          label="Imagen del banner"
          value={banner.image}
          onChange={(v) => set("image", v)}
          placeholder="https://..."
          folder="banners/promo"
        />

        {/* Overlay color */}
        <div className="space-y-1.5">
          <Label className="text-xs">Color del overlay</Label>
          <div className="flex flex-wrap gap-2">
            {PROMO_OVERLAY_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                title={preset.label}
                onClick={() => set("overlayHex", preset.hex)}
                className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  banner.overlayHex === preset.hex ? "border-foreground scale-110" : "border-border"
                }`}
                style={{ backgroundColor: preset.hex }}
              />
            ))}
            <input
              type="color"
              value={banner.overlayHex || "#000000"}
              onChange={(e) => set("overlayHex", e.target.value)}
              className="h-7 w-7 cursor-pointer rounded-full border-2 border-border"
              title="Color personalizado"
            />
          </div>
        </div>

        {/* Mini preview */}
        {banner.image && (
          <div
            className="relative flex h-20 items-end overflow-hidden rounded-lg p-3"
            style={{
              backgroundImage: `url(${banner.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 opacity-75" style={{ backgroundColor: banner.overlayHex }} />
            <div className="relative z-10 text-white">
              <p className="text-[9px] font-bold tracking-widest opacity-80">{banner.label}</p>
              <p className="text-sm font-black leading-tight">{banner.title}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type SaveState = "idle" | "saving" | "saved" | "error"

export default function AdminHomepagePage() {
  const { settings, refresh } = useStoreSettings()
  const [config, setConfig] = useState<HomepageConfig>(() => settings.homepageConfig)
  const [saveState, setSaveState] = useState<SaveState>("idle")

  useEffect(() => {
    setConfig(settings.homepageConfig)
  }, [settings.homepageConfig])

  const hasChanges = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(settings.homepageConfig),
    [config, settings.homepageConfig]
  )

  const handleSave = useCallback(async () => {
    setSaveState("saving")
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { ...settings, homepageConfig: config } }),
      })
      if (!res.ok) throw new Error("Error al guardar")
      await refresh()
      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 3000)
      void publishAppDataChangedClient({ entity: "settings", action: "updated", id: "default" })
    } catch {
      setSaveState("error")
    }
  }, [config, settings, refresh])

  // ── Hero slide helpers ────────────────────────────────────────────────────
  const updateHeroSlide = (index: number, slide: HeroSlideConfig) => {
    const next = [...config.heroSlides]
    next[index] = slide
    setConfig({ ...config, heroSlides: next })
  }

  const addHeroSlide = () => {
    setConfig({ ...config, heroSlides: [...config.heroSlides, emptyHeroSlide()] })
  }

  const removeHeroSlide = (index: number) => {
    const next = config.heroSlides.filter((_, i) => i !== index)
    setConfig({ ...config, heroSlides: next })
  }

  const moveHeroSlide = (index: number, dir: "up" | "down") => {
    const next = [...config.heroSlides]
    const swap = dir === "up" ? index - 1 : index + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setConfig({ ...config, heroSlides: next })
  }

  // ── Mini banner / service / promo helpers ─────────────────────────────────
  const updateMiniBanner = (index: number, banner: MiniBannerConfig) => {
    const next = [...config.miniBanners]
    next[index] = banner
    setConfig({ ...config, miniBanners: next })
  }

  const updateServiceFeature = (index: number, feature: ServiceFeatureConfig) => {
    const next = [...config.serviceFeatures]
    next[index] = feature
    setConfig({ ...config, serviceFeatures: next })
  }

  const updatePromoBanner = (index: number, banner: PromoBannerConfig) => {
    const next = [...config.promoBanners]
    next[index] = banner
    setConfig({ ...config, promoBanners: next })
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Personalización del Home</h1>
          <p className="text-muted-foreground">
            Controla qué se muestra en la página principal de tu tienda
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveState === "saved" && (
            <span className="text-sm text-green-600 font-medium">✓ Guardado correctamente</span>
          )}
          {saveState === "error" && (
            <span className="text-sm text-destructive">Error al guardar</span>
          )}
          {hasChanges && saveState === "idle" && (
            <span className="text-sm text-amber-600">● Cambios sin guardar</span>
          )}
          <Button onClick={handleSave} disabled={saveState === "saving" || !hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {saveState === "saving" ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="h-auto flex-wrap gap-1">
          <TabsTrigger value="hero" className="gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Hero Slides
          </TabsTrigger>
          <TabsTrigger value="minibanners" className="gap-1.5">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Mini Banners
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Strip de Servicios
          </TabsTrigger>
          <TabsTrigger value="flashsale" className="gap-1.5">
            <Flame className="h-3.5 w-3.5" />
            Venta Flash
          </TabsTrigger>
          <TabsTrigger value="promobanners" className="gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            Banners Promo
          </TabsTrigger>
        </TabsList>

        {/* ── Hero Slides ── */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Carrusel Hero
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Los slides del carrusel principal. Cada uno puede tener fondo de imagen,
                    color sólido o layout split (color izquierda + imagen derecha).
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHeroSlide}
                  disabled={config.heroSlides.length >= 6}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Añadir slide
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.heroSlides.map((slide, i) => (
                <HeroSlideCard
                  key={slide.id}
                  slide={slide}
                  index={i}
                  total={config.heroSlides.length}
                  onChange={(s) => updateHeroSlide(i, s)}
                  onRemove={() => removeHeroSlide(i)}
                  onMoveUp={() => moveHeroSlide(i, "up")}
                  onMoveDown={() => moveHeroSlide(i, "down")}
                />
              ))}
              {config.heroSlides.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
                  <SlidersHorizontal className="h-8 w-8 opacity-40" />
                  <p className="text-sm">No hay slides. Añade uno para empezar.</p>
                  <Button type="button" variant="outline" size="sm" onClick={addHeroSlide}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Añadir primer slide
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Mini Banners ── */}
        <TabsContent value="minibanners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5" />
                Mini Banners del Hero
              </CardTitle>
              <CardDescription>
                Las 2 tarjetas que aparecen a la derecha del carrusel principal en pantallas grandes.
                Puedes agregar una imagen de fondo y controlar la opacidad del color sobre ella.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-2">
                {config.miniBanners.map((banner, i) => (
                  <MiniBannerCard
                    key={banner.id}
                    banner={banner}
                    index={i}
                    onChange={(b) => updateMiniBanner(i, b)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Service Features ── */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Strip de Servicios
              </CardTitle>
              <CardDescription>
                La barra horizontal de íconos y etiquetas debajo del hero.
                Puedes cambiar el texto, el ícono, el color y ocultar los que no uses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="mb-3 flex items-center gap-6 px-3 text-xs font-medium text-muted-foreground">
                <span className="w-6" />
                <span className="w-10">Visible</span>
                <span className="w-8" />
                <span className="flex-1">Etiqueta</span>
                <span className="w-36">Ícono</span>
                <span className="w-52">Color</span>
              </div>
              {config.serviceFeatures.map((feature, i) => (
                <ServiceFeatureRow
                  key={feature.id}
                  feature={feature}
                  onChange={(f) => updateServiceFeature(i, f)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Flash Sale ── */}
        <TabsContent value="flashsale" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-destructive" />
                Venta Flash
              </CardTitle>
              <CardDescription>
                Sección con contador regresivo y carrusel de productos. Puedes programar cuándo
                aparece, cuándo termina, y elegir qué productos participan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlashSaleEditor
                config={config.flashSale}
                onChange={(c) => setConfig({ ...config, flashSale: c })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Promo Banners ── */}
        <TabsContent value="promobanners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Banners Promocionales
              </CardTitle>
              <CardDescription>
                Los 3 banners con imagen de fondo que aparecen después de la Venta Flash.
                Cambia el texto, el enlace, la imagen y el color del overlay.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-3">
                {config.promoBanners.map((banner, i) => (
                  <PromoBannerCard
                    key={banner.id}
                    banner={banner}
                    index={i}
                    onChange={(b) => updatePromoBanner(i, b)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating save bar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full border bg-background px-5 py-3 shadow-xl">
            <span className="text-sm font-medium text-amber-600">● Cambios sin guardar</span>
            <Button size="sm" onClick={handleSave} disabled={saveState === "saving"}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {saveState === "saving" ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

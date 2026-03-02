// ─── Service Feature Icon/Color options ───────────────────────────────────────
export const SERVICE_ICON_OPTIONS = [
  "Gift", "Tag", "Truck", "Star", "Coins", "CreditCard", "RotateCcw", "ShieldCheck",
  "Package", "Heart", "Percent", "Zap", "Award", "Clock", "Headphones", "ThumbsUp",
  "CheckCircle", "Bell", "ShoppingBag", "Sparkles", "Home", "MapPin", "BadgePercent",
] as const

export type ServiceIconKey = (typeof SERVICE_ICON_OPTIONS)[number]

export const SERVICE_COLOR_OPTIONS: { key: string; label: string; preview: string }[] = [
  { key: "orange", label: "Naranja",  preview: "#ea580c" },
  { key: "purple", label: "Morado",   preview: "#9333ea" },
  { key: "blue",   label: "Azul",     preview: "#2563eb" },
  { key: "yellow", label: "Amarillo", preview: "#ca8a04" },
  { key: "green",  label: "Verde",    preview: "#16a34a" },
  { key: "pink",   label: "Rosa",     preview: "#db2777" },
  { key: "teal",   label: "Teal",     preview: "#0d9488" },
  { key: "indigo", label: "Índigo",   preview: "#4338ca" },
  { key: "red",    label: "Rojo",     preview: "#dc2626" },
  { key: "amber",  label: "Ámbar",    preview: "#d97706" },
]

/** Static Tailwind class map — never computed dynamically (purge-safe) */
export const SERVICE_COLOR_CLASS_MAP: Record<string, string> = {
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  blue:   "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
  green:  "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
  pink:   "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
  teal:   "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
  red:    "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  amber:  "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
}

// ─── Mini banner color presets ────────────────────────────────────────────────
export const MINI_BANNER_COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: "Primario",    hex: "primary"  },
  { label: "Ámbar",       hex: "#F59E0B"  },
  { label: "Rojo",        hex: "#EF4444"  },
  { label: "Azul",        hex: "#3B82F6"  },
  { label: "Violeta",     hex: "#8B5CF6"  },
  { label: "Rosa",        hex: "#EC4899"  },
  { label: "Teal",        hex: "#14B8A6"  },
  { label: "Verde",       hex: "#10B981"  },
  { label: "Naranja",     hex: "#F97316"  },
  { label: "Gris Oscuro", hex: "#374151"  },
]

export const PROMO_OVERLAY_PRESETS: { label: string; hex: string }[] = [
  { label: "Azul",    hex: "#1e3a8a" },
  { label: "Verde",   hex: "#064e3b" },
  { label: "Rojo",    hex: "#7f1d1d" },
  { label: "Violeta", hex: "#2e1065" },
  { label: "Negro",   hex: "#111827" },
  { label: "Rosa",    hex: "#831843" },
  { label: "Teal",    hex: "#134e4a" },
  { label: "Naranja", hex: "#7c2d12" },
]

// ─── Hero background color presets ───────────────────────────────────────────
export const HERO_BG_COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: "Azul Marino",  hex: "#1e3a5f" },
  { label: "Noche",        hex: "#0f172a" },
  { label: "Grafito",      hex: "#1f2937" },
  { label: "Verde Oscuro", hex: "#064e3b" },
  { label: "Azul Real",    hex: "#1e3a8a" },
  { label: "Púrpura",      hex: "#2e1065" },
  { label: "Rojo Oscuro",  hex: "#7f1d1d" },
  { label: "Teal Oscuro",  hex: "#134e4a" },
  { label: "Naranja Osc.", hex: "#7c2d12" },
  { label: "Índigo",       hex: "#1e1b4b" },
  { label: "Rosa Oscuro",  hex: "#831843" },
  { label: "Negro Puro",   hex: "#111827" },
]

// ─── Hero overlay color presets ───────────────────────────────────────────────
export const HERO_OVERLAY_COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: "Negro",    hex: "#000000" },
  { label: "Azul",     hex: "#1e3a8a" },
  { label: "Verde",    hex: "#064e3b" },
  { label: "Rojo",     hex: "#7f1d1d" },
  { label: "Violeta",  hex: "#2e1065" },
  { label: "Naranja",  hex: "#7c2d12" },
]

// ─── Hero Slide ───────────────────────────────────────────────────────────────
/** "image"  = full background image with color overlay
 *  "color"  = solid color background, no image
 *  "split"  = left side solid color + content | right side image
 */
export type HeroBackgroundType = "image" | "color" | "split"
export type HeroTextColor = "white" | "dark"

export interface HeroSlideConfig {
  id: string
  visible: boolean
  // Content
  badge: string
  title: string
  titleColor: string    // hex color for title; "" = inherit from textColor
  subtitle: string      // displayed with primary color accent by default
  subtitleColor: string // hex or "primary"; "primary" = CSS var(--primary)
  description: string
  textColor: HeroTextColor
  // CTA buttons
  ctaText: string
  ctaHref: string       // /products?category=slug  OR  any URL
  secondaryCtaText: string
  secondaryCtaHref: string
  // Background
  backgroundType: HeroBackgroundType
  bgImage: string       // "image" = full bg; "split" = right side image
  bgColor: string       // "color" = full bg; "split" = left side color (hex)
  overlayColor: string  // hex color for overlay (used in "image" type)
  overlayOpacity: number // 0–100  (used in "image" and optionally "split" right)
  // Split-specific overlay on the image side
  splitOverlayOpacity: number // 0–100 for the image panel in split mode
}

// ─── Mini Banner ──────────────────────────────────────────────────────────────
export interface MiniBannerConfig {
  id: string
  visible: boolean
  label: string
  title: string
  subtitle: string
  ctaText: string
  href: string
  bgColorHex: string      // hex string or "primary"
  image: string           // optional background image URL
  overlayOpacity: number  // 0–100 (how opaque the color layer is over the image)
}

// ─── Other section types ──────────────────────────────────────────────────────
export interface ServiceFeatureConfig {
  id: string
  visible: boolean
  label: string
  icon: string
  colorKey: string
}

export interface FlashSaleConfig {
  visible: boolean
  endDate: string
  scheduledStartDate: string
  productIds: string[]
  maxProducts: number
}

export interface PromoBannerConfig {
  id: string
  visible: boolean
  label: string
  title: string
  subtitle: string
  ctaText: string
  href: string
  image: string
  overlayHex: string
}

export interface HomepageConfig {
  heroSlides: HeroSlideConfig[]
  miniBanners: MiniBannerConfig[]
  serviceFeatures: ServiceFeatureConfig[]
  flashSale: FlashSaleConfig
  promoBanners: PromoBannerConfig[]
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const defaultHeroSlides: HeroSlideConfig[] = [
  {
    id: "hero-1",
    visible: true,
    badge: "Nuevo Lanzamiento",
    title: "RTX Serie 40",
    titleColor: "",
    subtitle: "Potencia Máxima",
    subtitleColor: "primary",
    description: "Las tarjetas gráficas más potentes para gaming y creación de contenido",
    textColor: "white",
    ctaText: "Ver GPUs",
    ctaHref: "/products?category=componentes",
    secondaryCtaText: "Ver Todo",
    secondaryCtaHref: "/products",
    backgroundType: "image",
    bgImage: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&h=600&fit=crop",
    bgColor: "#1a1a2e",
    overlayColor: "#000000",
    overlayOpacity: 45,
    splitOverlayOpacity: 0,
  },
  {
    id: "hero-2",
    visible: true,
    badge: "Hasta 40% OFF",
    title: "Monitores Gaming",
    titleColor: "",
    subtitle: "240Hz QHD",
    subtitleColor: "primary",
    description: "La mejor experiencia visual con monitores de alta tasa de refresco",
    textColor: "white",
    ctaText: "Ver Ofertas",
    ctaHref: "/products?category=monitores",
    secondaryCtaText: "Ver Todo",
    secondaryCtaHref: "/products",
    backgroundType: "split",
    bgImage: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=600&fit=crop",
    bgColor: "#1e3a5f",
    overlayColor: "#000000",
    overlayOpacity: 0,
    splitOverlayOpacity: 15,
  },
  {
    id: "hero-3",
    visible: true,
    badge: "Bestseller",
    title: "Periféricos Pro",
    titleColor: "",
    subtitle: "Precisión Total",
    subtitleColor: "primary",
    description: "Teclados mecánicos y mouse gaming de las mejores marcas",
    textColor: "white",
    ctaText: "Explorar",
    ctaHref: "/products?category=teclados",
    secondaryCtaText: "Ver Todo",
    secondaryCtaHref: "/products",
    backgroundType: "image",
    bgImage: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&h=600&fit=crop",
    bgColor: "#0f172a",
    overlayColor: "#000000",
    overlayOpacity: 40,
    splitOverlayOpacity: 0,
  },
]

export const defaultMiniBanners: MiniBannerConfig[] = [
  {
    id: "mini-1",
    visible: true,
    label: "OFERTA HOY",
    title: "50% OFF",
    subtitle: "en Accesorios",
    ctaText: "Ver ahora",
    href: "/products",
    bgColorHex: "#F59E0B",
    image: "",
    overlayOpacity: 95,
  },
  {
    id: "mini-2",
    visible: true,
    label: "FLASH DEAL",
    title: "Envío Gratis",
    subtitle: "Pedidos +$200",
    ctaText: "Ver ahora",
    href: "/products",
    bgColorHex: "primary",
    image: "",
    overlayOpacity: 95,
  },
]

export const defaultServiceFeatures: ServiceFeatureConfig[] = [
  { id: "sf-1", visible: true, label: "Ofertas Diarias", icon: "Gift",        colorKey: "orange" },
  { id: "sf-2", visible: true, label: "Cupones",         icon: "Tag",         colorKey: "purple" },
  { id: "sf-3", visible: true, label: "Envío Gratis",    icon: "Truck",       colorKey: "blue"   },
  { id: "sf-4", visible: true, label: "Afiliación VIP",  icon: "Star",        colorKey: "yellow" },
  { id: "sf-5", visible: true, label: "Recompensas",     icon: "Coins",       colorKey: "green"  },
  { id: "sf-6", visible: true, label: "Pago Seguro",     icon: "CreditCard",  colorKey: "pink"   },
  { id: "sf-7", visible: true, label: "Devoluciones",    icon: "RotateCcw",   colorKey: "teal"   },
  { id: "sf-8", visible: true, label: "Garantía",        icon: "ShieldCheck", colorKey: "indigo" },
]

export const defaultFlashSale: FlashSaleConfig = {
  visible: true,
  endDate: "",
  scheduledStartDate: "",
  productIds: [],
  maxProducts: 8,
}

export const defaultPromoBanners: PromoBannerConfig[] = [
  {
    id: "promo-1", visible: true, label: "PROMOCIÓN ESPECIAL",
    title: "Hasta 50% OFF", subtitle: "en Electrónica", ctaText: "Ver ofertas", href: "/products",
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=300&fit=crop",
    overlayHex: "#1e3a8a",
  },
  {
    id: "promo-2", visible: true, label: "NUEVA COLECCIÓN",
    title: "Accesorios Pro", subtitle: "para tu setup", ctaText: "Explorar", href: "/products?category=accesorios",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=300&fit=crop",
    overlayHex: "#064e3b",
  },
  {
    id: "promo-3", visible: true, label: "FLASH DEAL",
    title: "30% OFF", subtitle: "Periféricos Gaming", ctaText: "Comprar ahora", href: "/products?category=gaming",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=300&fit=crop",
    overlayHex: "#7f1d1d",
  },
]

export const defaultHomepageConfig: HomepageConfig = {
  heroSlides: defaultHeroSlides,
  miniBanners: defaultMiniBanners,
  serviceFeatures: defaultServiceFeatures,
  flashSale: defaultFlashSale,
  promoBanners: defaultPromoBanners,
}

// ─── Normalizer ───────────────────────────────────────────────────────────────
export function normalizeHomepageConfig(raw: unknown): HomepageConfig {
  if (typeof raw !== "object" || raw === null) return { ...defaultHomepageConfig }
  const r = raw as Record<string, unknown>

  return {
    heroSlides:
      Array.isArray(r.heroSlides) && r.heroSlides.length > 0
        ? (r.heroSlides as HeroSlideConfig[]).map((s) => ({
            ...defaultHeroSlides[0],
            ...s,
            titleColor: s.titleColor ?? "",
            subtitleColor: s.subtitleColor ?? "primary",
            overlayOpacity: Number(s.overlayOpacity ?? 45),
            splitOverlayOpacity: Number(s.splitOverlayOpacity ?? 0),
          }))
        : defaultHeroSlides,
    miniBanners:
      Array.isArray(r.miniBanners) && r.miniBanners.length > 0
        ? (r.miniBanners as MiniBannerConfig[]).map((b) => ({
            ...b,
            image: b.image ?? "",
            overlayOpacity: b.overlayOpacity ?? 95,
          }))
        : defaultMiniBanners,
    serviceFeatures:
      Array.isArray(r.serviceFeatures) && r.serviceFeatures.length > 0
        ? (r.serviceFeatures as ServiceFeatureConfig[])
        : defaultServiceFeatures,
    flashSale:
      typeof r.flashSale === "object" && r.flashSale !== null
        ? { ...defaultFlashSale, ...(r.flashSale as FlashSaleConfig) }
        : defaultFlashSale,
    promoBanners:
      Array.isArray(r.promoBanners) && r.promoBanners.length > 0
        ? (r.promoBanners as PromoBannerConfig[])
        : defaultPromoBanners,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function hexToBgStyle(hex: string): React.CSSProperties {
  if (hex === "primary") return { backgroundColor: "var(--primary)" }
  return { backgroundColor: hex }
}

export function isFlashSaleActive(config: FlashSaleConfig): boolean {
  if (!config.visible) return false
  if (!config.endDate) return true
  const now = Date.now()
  const end = new Date(config.endDate).getTime()
  if (end <= now) return false
  if (config.scheduledStartDate) {
    const start = new Date(config.scheduledStartDate).getTime()
    if (now < start) return false
  }
  return true
}

/** Generate a unique ID for a new hero slide */
export function newSlideId(): string {
  return `hero-${Date.now()}`
}

export function emptyHeroSlide(): HeroSlideConfig {
  return {
    id: newSlideId(),
    visible: true,
    badge: "",
    title: "Nuevo Slide",
    titleColor: "",
    subtitle: "",
    subtitleColor: "primary",
    description: "",
    textColor: "white",
    ctaText: "Ver ahora",
    ctaHref: "/products",
    secondaryCtaText: "Ver Todo",
    secondaryCtaHref: "/products",
    backgroundType: "color",
    bgImage: "",
    bgColor: "#1e3a5f",
    overlayColor: "#000000",
    overlayOpacity: 45,
    splitOverlayOpacity: 0,
  }
}

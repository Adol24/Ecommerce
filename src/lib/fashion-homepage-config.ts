// ─── Fashion Hero ─────────────────────────────────────────────────────────────

export interface FashionHeroSlideConfig {
  id: string
  badge: string
  title: string       // line 1
  titleLine2: string  // line 2
  startingPrice: number
  ctaText: string
  ctaLink: string
  bgColor: string     // hex background color of the slide
  model1Url: string
  model2Url: string
}

export interface FashionHeroMiniBannerConfig {
  id: string
  imageUrl: string
  link: string
  alt: string
}

// ─── Category Bar ─────────────────────────────────────────────────────────────

export interface FashionCategoryItemConfig {
  id: string
  label: string
  imageUrl: string
  href: string
  badge?: number  // numeric badge, 0 = hidden
}

// ─── Collections ──────────────────────────────────────────────────────────────

export interface FashionCollectionCardConfig {
  id: string
  eyebrow: string
  title: string
  count: string     // e.g. "72 Prendas"
  imageUrl: string
  href: string
  accentColor: string  // hex
}

// ─── Flash Banner ─────────────────────────────────────────────────────────────

export interface FashionFlashBannerCategoryConfig {
  emoji: string
  label: string
  href: string
}

export interface FashionFlashBannerConfig {
  visible: boolean
  endDate: string   // ISO date string, empty = no countdown
  title: string
  subtitle: string
  imageUrl: string
  categories: FashionFlashBannerCategoryConfig[]
}

// ─── Video Section ────────────────────────────────────────────────────────────

export interface FashionVideoSectionConfig {
  visible: boolean
  thumbnailUrl: string
  videoUrl: string  // embed URL (e.g. YouTube embed)
  title: string
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export interface FashionNewsletterConfig {
  visible: boolean
  title: string
  subtitle: string
  backgroundImageUrl: string
}

// ─── Instagram ────────────────────────────────────────────────────────────────

export interface FashionInstagramPhotoConfig {
  id: string
  imageUrl: string
  link: string
}

export interface FashionInstagramConfig {
  username: string
  hashtag: string
  photos: FashionInstagramPhotoConfig[]
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface FashionBlogPostConfig {
  id: string
  slug: string
  tag: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  date: string
  author: string
  readTime: string
}

// ─── Root Config ──────────────────────────────────────────────────────────────

export interface FashionHomepageConfig {
  heroSlides: FashionHeroSlideConfig[]
  heroMiniBanners: FashionHeroMiniBannerConfig[]
  categoryBar: FashionCategoryItemConfig[]
  flashBanner: FashionFlashBannerConfig
  collections: FashionCollectionCardConfig[]
  videoSection: FashionVideoSectionConfig
  newsletter: FashionNewsletterConfig
  instagram: FashionInstagramConfig
  blogPosts: FashionBlogPostConfig[]
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const defaultFashionHeroSlides: FashionHeroSlideConfig[] = [
  {
    id: "fh-1",
    badge: "Perfecta Para Moda de Verano",
    title: "Casual y con Estilo",
    titleLine2: "Para Todas las Temporadas",
    startingPrice: 129,
    ctaText: "Comprar Ahora",
    ctaLink: "/productos",
    bgColor: "#fff5f6",
    model1Url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=800&fit=crop",
    model2Url: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=600&h=800&fit=crop",
  },
  {
    id: "fh-2",
    badge: "Nueva Colección 2026",
    title: "Estilo Urbano",
    titleLine2: "Colección Primavera",
    startingPrice: 299,
    ctaText: "Ver Colección",
    ctaLink: "/productos?genero=mujer",
    bgColor: "#fff8f0",
    model1Url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop",
    model2Url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
  },
]

export const defaultFashionHeroMiniBanners: FashionHeroMiniBannerConfig[] = [
  {
    id: "fmb-1",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&h=220&fit=crop",
    link: "/productos?genero=mujer",
    alt: "Colección Mujer",
  },
  {
    id: "fmb-2",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=220&fit=crop",
    link: "/productos?genero=hombre",
    alt: "Colección Hombre",
  },
  {
    id: "fmb-3",
    imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?w=500&h=220&fit=crop",
    link: "/productos?genero=nino",
    alt: "Colección Niños",
  },
]

export const defaultFashionCategoryBar: FashionCategoryItemConfig[] = [
  { id: "fc-1", label: "Hombres",   href: "/productos?genero=hombre",          imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=80&h=80&fit=crop", badge: 48 },
  { id: "fc-2", label: "Niños",     href: "/productos?genero=nino",            imageUrl: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=80&h=80&fit=crop", badge: 35 },
  { id: "fc-3", label: "Pantalones",href: "/productos?categoria=pantalones",   imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop", badge: 29 },
  { id: "fc-4", label: "Casual",    href: "/productos?genero=hombre&tipo=casual", imageUrl: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=80&h=80&fit=crop", badge: 22 },
  { id: "fc-5", label: "Mujeres",   href: "/productos?genero=mujer",           imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=80&h=80&fit=crop", badge: 72 },
  { id: "fc-6", label: "Jeans",     href: "/productos?tipo=jeans",             imageUrl: "https://images.unsplash.com/photo-1511105043137-7e01dc02a46e?w=80&h=80&fit=crop", badge: 44 },
  { id: "fc-7", label: "Suéteres",  href: "/productos?categoria=sueteres",     imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=80&h=80&fit=crop", badge: 22 },
  { id: "fc-8", label: "Zapatos",   href: "/productos?categoria=zapatos",      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop", badge: 41 },
]

export const defaultFashionCollections: FashionCollectionCardConfig[] = [
  {
    id: "col-1",
    eyebrow: "Nueva Colección",
    title: "COLECCIÓN MUJER",
    count: "72 Prendas",
    imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&h=900&fit=crop&crop=top",
    href: "/productos?genero=mujer",
    accentColor: "#e84562",
  },
  {
    id: "col-2",
    eyebrow: "Nueva Colección",
    title: "COLECCIÓN HOMBRE",
    count: "48 Prendas",
    imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=700&h=900&fit=crop&crop=top",
    href: "/productos?genero=hombre",
    accentColor: "#f5884a",
  },
  {
    id: "col-3",
    eyebrow: "Nueva Colección",
    title: "COLECCIÓN NIÑOS",
    count: "35 Prendas",
    imageUrl: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=700&h=900&fit=crop&crop=top",
    href: "/productos?genero=nino",
    accentColor: "#8b5cf6",
  },
]

export const defaultFashionFlashBanner: FashionFlashBannerConfig = {
  visible: true,
  endDate: "",
  title: "¡Obtén 30% de Descuento",
  subtitle: "en toda la colección!",
  imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=520&h=560&fit=crop&crop=top",
  categories: [
    { emoji: "👶", label: "Niños",   href: "/productos?genero=nino"   },
    { emoji: "👩", label: "Mujeres", href: "/productos?genero=mujer"  },
    { emoji: "👨", label: "Hombres", href: "/productos?genero=hombre" },
    { emoji: "⚡", label: "Unisex",  href: "/productos"               },
  ],
}

export const defaultFashionVideoSection: FashionVideoSectionConfig = {
  visible: true,
  thumbnailUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&h=525&fit=crop",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  title: "Mira Nuestra Colección",
}

export const defaultFashionNewsletter: FashionNewsletterConfig = {
  visible: true,
  title: "Suscríbete para Recibir Noticias",
  subtitle: "No te pierdas nuestras últimas novedades, ofertas exclusivas y lanzamientos de colección.",
  backgroundImageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=500&fit=crop",
}

export const defaultFashionInstagram: FashionInstagramConfig = {
  username: "@olarics.mx",
  hashtag: "#MiEstiloOlarics",
  photos: [
    { id: "ig-1", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200", link: "#" },
    { id: "ig-2", imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200", link: "#" },
    { id: "ig-3", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200", link: "#" },
    { id: "ig-4", imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200", link: "#" },
    { id: "ig-5", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200", link: "#" },
    { id: "ig-6", imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200", link: "#" },
  ],
}

export const defaultFashionBlogPosts: FashionBlogPostConfig[] = [
  {
    id: "bp-1",
    slug: "tendencias-primavera-2026",
    tag: "Tendencias",
    title: "Las 10 Tendencias de Moda para Primavera 2026",
    excerpt: "Descubre los colores, siluetas y estilos que dominarán esta temporada.",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
    date: "15 Feb 2026",
    author: "Valentina Ríos",
    readTime: "5 min",
  },
  {
    id: "bp-2",
    slug: "guia-tallas-ropa",
    tag: "Guías",
    title: "Guía Completa para Elegir tu Talla Correcta",
    excerpt: "Aprende a medirte correctamente y a interpretar las tablas de tallas.",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200",
    date: "10 Feb 2026",
    author: "Sofía Mendoza",
    readTime: "4 min",
  },
  {
    id: "bp-3",
    slug: "guia-cuidado-prendas",
    tag: "Cuidado",
    title: "Cómo Cuidar tus Prendas para que Duren más",
    excerpt: "Consejos de expertos para lavar, secar y almacenar tu ropa correctamente.",
    content: "",
    imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200",
    date: "5 Feb 2026",
    author: "Carlos Vega",
    readTime: "3 min",
  },
]

export const defaultFashionHomepageConfig: FashionHomepageConfig = {
  heroSlides: defaultFashionHeroSlides,
  heroMiniBanners: defaultFashionHeroMiniBanners,
  categoryBar: defaultFashionCategoryBar,
  flashBanner: defaultFashionFlashBanner,
  collections: defaultFashionCollections,
  videoSection: defaultFashionVideoSection,
  newsletter: defaultFashionNewsletter,
  instagram: defaultFashionInstagram,
  blogPosts: defaultFashionBlogPosts,
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}

export function normalizeFashionHomepageConfig(raw: unknown): FashionHomepageConfig {
  if (!isRecord(raw)) return { ...defaultFashionHomepageConfig }
  const r = raw as Record<string, unknown>

  return {
    heroSlides:
      Array.isArray(r.heroSlides) && r.heroSlides.length > 0
        ? (r.heroSlides as FashionHeroSlideConfig[]).map((s) => ({
            ...defaultFashionHeroSlides[0],
            ...s,
            startingPrice: Number(s.startingPrice ?? 0),
          }))
        : defaultFashionHeroSlides,

    heroMiniBanners:
      Array.isArray(r.heroMiniBanners) && r.heroMiniBanners.length > 0
        ? (r.heroMiniBanners as FashionHeroMiniBannerConfig[])
        : defaultFashionHeroMiniBanners,

    categoryBar:
      Array.isArray(r.categoryBar) && r.categoryBar.length > 0
        ? (r.categoryBar as FashionCategoryItemConfig[])
        : defaultFashionCategoryBar,

    flashBanner:
      isRecord(r.flashBanner)
        ? { ...defaultFashionFlashBanner, ...(r.flashBanner as unknown as FashionFlashBannerConfig) }
        : defaultFashionFlashBanner,

    collections:
      Array.isArray(r.collections) && r.collections.length > 0
        ? (r.collections as FashionCollectionCardConfig[])
        : defaultFashionCollections,

    videoSection:
      isRecord(r.videoSection)
        ? { ...defaultFashionVideoSection, ...(r.videoSection as unknown as FashionVideoSectionConfig) }
        : defaultFashionVideoSection,

    newsletter:
      isRecord(r.newsletter)
        ? { ...defaultFashionNewsletter, ...(r.newsletter as unknown as FashionNewsletterConfig) }
        : defaultFashionNewsletter,

    instagram:
      isRecord(r.instagram)
        ? {
            username: typeof (r.instagram as Record<string, unknown>).username === "string"
              ? (r.instagram as Record<string, unknown>).username as string
              : defaultFashionInstagram.username,
            hashtag: typeof (r.instagram as Record<string, unknown>).hashtag === "string"
              ? (r.instagram as Record<string, unknown>).hashtag as string
              : defaultFashionInstagram.hashtag,
            photos: Array.isArray((r.instagram as Record<string, unknown>).photos)
              ? ((r.instagram as Record<string, unknown>).photos as FashionInstagramPhotoConfig[])
              : defaultFashionInstagram.photos,
          }
        : defaultFashionInstagram,

    blogPosts:
      Array.isArray(r.blogPosts) && r.blogPosts.length > 0
        ? (r.blogPosts as FashionBlogPostConfig[])
        : defaultFashionBlogPosts,
  }
}

// ─── ID generators ────────────────────────────────────────────────────────────

export function newFashionSlideId() { return `fh-${Date.now()}` }
export function newFashionMiniBannerId() { return `fmb-${Date.now()}` }
export function newFashionCategoryId() { return `fc-${Date.now()}` }
export function newFashionCollectionId() { return `col-${Date.now()}` }
export function newFashionFlashCategoryId() { return `flcat-${Date.now()}` }
export function newFashionBlogPostId() { return `bp-${Date.now()}` }
export function newFashionInstagramPhotoId() { return `ig-${Date.now()}` }

// ─── Empty item factories ─────────────────────────────────────────────────────

export function emptyFashionSlide(): FashionHeroSlideConfig {
  return {
    id: newFashionSlideId(),
    badge: "Nueva Colección",
    title: "Título del Slide",
    titleLine2: "Segunda Línea",
    startingPrice: 0,
    ctaText: "Ver Ahora",
    ctaLink: "/productos",
    bgColor: "#fff5f6",
    model1Url: "",
    model2Url: "",
  }
}

export function emptyFashionBlogPost(): FashionBlogPostConfig {
  return {
    id: newFashionBlogPostId(),
    slug: `post-${Date.now()}`,
    tag: "Tendencias",
    title: "Nuevo Artículo",
    excerpt: "",
    content: "",
    imageUrl: "",
    date: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }),
    author: "",
    readTime: "3 min",
  }
}

export function emptyFashionInstagramPhoto(): FashionInstagramPhotoConfig {
  return { id: newFashionInstagramPhotoId(), imageUrl: "", link: "#" }
}

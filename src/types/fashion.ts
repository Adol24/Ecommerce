import type { Product, FilterState } from "@/types"

// ── Atributos específicos de ropa ────────────────────────────────────

export type ClothingGender = "hombre" | "mujer" | "niño" | "niña" | "unisex"

export type ClothingSize =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "3XL"
  | "2"
  | "4"
  | "6"
  | "8"
  | "10"
  | "12"
  | "14"
  | "Talla Única"

export type ClothingFit = "slim" | "regular" | "oversized" | "holgado"

export type ClothingSeason = "primavera" | "verano" | "otoño" | "invierno" | "todo el año"

export interface ClothingColor {
  name: string
  hex: string
  images?: string[]
}

export interface ClothingVariant {
  id: string
  productId: string
  size: ClothingSize
  color: string
  colorHex: string
  stock: number
  sku?: string
}

export interface FashionProduct extends Product {
  gender: ClothingGender
  sizes: ClothingSize[]
  colors: ClothingColor[]
  variants: ClothingVariant[]
  material?: string
  care?: string[]
  fit?: ClothingFit
  season?: ClothingSeason
  collectionTag?: string
}

// ── Filtros específicos de ropa ──────────────────────────────────────

export interface FashionFilterState extends FilterState {
  genders: ClothingGender[]
  sizes: ClothingSize[]
  colors: string[]
  fits: ClothingFit[]
  seasons: ClothingSeason[]
}

// ── Secciones de la homepage moda ───────────────────────────────────

export interface FashionHeroSlide {
  id: string
  badgeText: string
  title: string
  subtitle: string
  startingPrice?: number
  ctaText: string
  ctaLink: string
  secondaryCtaText?: string
  image: string
  bgColor: string
}

export interface FashionMiniSlotBanner {
  id: string
  image: string
  link: string
  alt: string
}

export interface FashionCollectionCard {
  id: string
  title: string
  count?: string
  image: string
  link: string
  overlayColor: string
}

export interface FashionReview {
  id: string
  author: string
  role: string
  rating: number
  text: string
  avatar?: string
}

export interface FashionBlogPost {
  id: string
  slug: string
  tag: string
  title: string
  excerpt: string
  image: string
  date: string
  content?: string
  author?: string
  readTime?: string
}

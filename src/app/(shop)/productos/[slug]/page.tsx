"use client"

import { use, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  Shield,
  Check,
  Share2,
} from "lucide-react"
import { fashionProducts } from "@/data/mock-fashion"
import { FashionSizeSelector } from "@/components/templates/fashion/products/FashionSizeSelector"
import { FashionColorSelector } from "@/components/templates/fashion/products/FashionColorSelector"
import { FashionProductCard } from "@/components/templates/fashion/products/FashionProductCard"
import { useCartStore } from "@/stores/cart-store"
import { useFavoritesStore } from "@/stores/favorites-store"
import { useAuth } from "@/hooks/useAuth"
import type { ClothingColor, ClothingSize } from "@/types/fashion"

const CATEGORY_LABELS: Record<string, string> = {
  hombres: "Hombre",
  mujeres: "Mujer",
  ninos: "Niños",
  pantalones: "Pantalones",
  playeras: "Playeras",
  sueteres: "Suéteres",
  zapatos: "Zapatos",
  accesorios: "Accesorios",
}

export default function ProductoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  const product = useMemo(
    () => fashionProducts.find((p) => p.slug === slug) ?? null,
    [slug]
  )

  const [selectedColor, setSelectedColor] = useState<ClothingColor | null>(
    product?.colors[0] ?? null
  )
  const [selectedSize, setSelectedSize] = useState<ClothingSize | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)

  const addItem = useCartStore((s) => s.addItem)
  const isFavorite = useFavoritesStore((s) => s.isFavorite)
  const addFavorite = useFavoritesStore((s) => s.addFavorite)
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite)
  const { user } = useAuth()

  /* Gallery images: use color images if available, else product images */
  const galleryImages = useMemo(() => {
    if (selectedColor?.images?.length) return selectedColor.images
    return product?.images ?? []
  }, [selectedColor, product])

  /* Stock for current selection */
  const currentVariant = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return null
    return (
      product.variants.find(
        (v) => v.color === selectedColor.name && v.size === selectedSize
      ) ?? null
    )
  }, [product, selectedColor, selectedSize])

  const currentStock = currentVariant?.stock ?? 0
  const isInFavorites = product ? isFavorite(product.id) : false

  /* Related products */
  const relatedProducts = useMemo(() => {
    if (!product) return []
    return fashionProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
  }, [product])

  function handleAddToCart() {
    if (!product) return
    addItem(product, qty)
  }

  function handleToggleFavorite() {
    if (!product) return
    const userId = user?.id ?? "guest"
    if (isInFavorites) {
      removeFavorite(userId, product.id)
    } else {
      addFavorite(userId, product)
    }
  }

  function handleColorChange(color: ClothingColor) {
    setSelectedColor(color)
    setSelectedSize(null)
    setActiveImage(0)
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
          style={{ background: "#fff0f3" }}
        >
          🔍
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Producto no encontrado
        </h1>
        <p className="text-gray-500 mb-6">
          El producto que buscas no existe o fue eliminado.
        </p>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "#e84562" }}
        >
          Ver todos los productos
        </Link>
      </div>
    )
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : null

  const categoryLabel =
    CATEGORY_LABELS[product.category] ?? product.category

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-6">
        {/* ── Breadcrumb desktop ── */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#e84562] transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link
            href="/productos"
            className="hover:text-[#e84562] transition-colors"
          >
            Productos
          </Link>
          <span>/</span>
          <Link
            href={`/productos?categoria=${product.category}`}
            className="hover:text-[#e84562] transition-colors"
          >
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium max-w-[220px] truncate">
            {product.name}
          </span>
        </nav>

        {/* ── Back button mobile ── */}
        <Link
          href="/productos"
          className="flex sm:hidden items-center gap-1 text-sm font-bold mb-5"
          style={{ color: "#e84562" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a productos
        </Link>

        {/* ── Main grid ── */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* ─── Gallery ─── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
              className="relative overflow-hidden rounded-2xl bg-gray-50"
              style={{ aspectRatio: "3/4" }}
            >
              {galleryImages[activeImage] && (
                <Image
                  src={galleryImages[activeImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              )}
              {/* Badges */}
              {product.isNew && (
                <span
                  className="absolute top-4 left-4 rounded px-2.5 py-1 text-[11px] font-black text-white uppercase tracking-wide"
                  style={{ background: "#e84562" }}
                >
                  Nuevo
                </span>
              )}
              {discount && (
                <span
                  className="absolute top-4 right-4 rounded px-2.5 py-1 text-[11px] font-black text-white"
                  style={{ background: "#f5884a" }}
                >
                  -{discount}%
                </span>
              )}
              {/* Share button */}
              <button
                className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md text-gray-500 hover:text-[#e84562] transition-colors"
                title="Compartir"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all"
                    style={{
                      borderColor: i === activeImage ? "#e84562" : "#e5e7eb",
                    }}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Product info ─── */}
          <div className="flex flex-col gap-5">
            {/* Tags / Brand */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.collectionTag && (
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-black text-white uppercase tracking-wide"
                  style={{ background: "#e84562" }}
                >
                  {product.collectionTag}
                </span>
              )}
              <Link
                href={`/productos?marca=${product.brand.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")}`}
                className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#e84562] transition-colors"
              >
                {product.brand}
              </Link>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-black text-gray-900 leading-tight md:text-3xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    style={{
                      fill:
                        i < Math.floor(product.rating) ? "#fbbf24" : "#e5e7eb",
                      color:
                        i < Math.floor(product.rating) ? "#fbbf24" : "#e5e7eb",
                    }}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">
                {product.rating}
              </span>
              <span className="text-sm text-gray-400">(124 reseñas)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-3xl font-black"
                style={{ color: "#e84562" }}
              >
                ${product.price.toLocaleString("es-MX")}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through font-medium">
                  ${product.originalPrice.toLocaleString("es-MX")}
                </span>
              )}
              {discount && (
                <span
                  className="rounded px-2 py-0.5 text-xs font-black text-white"
                  style={{ background: "#f5884a" }}
                >
                  -{discount}%
                </span>
              )}
            </div>

            <div style={{ borderTop: "1px solid #f0f0f0" }} />

            {/* Color selector */}
            <FashionColorSelector
              colors={product.colors}
              selectedColor={selectedColor?.name ?? null}
              onChange={handleColorChange}
            />

            {/* Size selector */}
            <FashionSizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              selectedColor={selectedColor?.name ?? null}
              variants={product.variants}
              onChange={setSelectedSize}
            />

            {/* Stock indicator */}
            {selectedSize && selectedColor && (
              <div className="flex items-center gap-1.5 text-xs font-medium">
                {currentStock === 0 ? (
                  <span className="text-red-500 flex items-center gap-1">
                    ✗ Sin stock en esta combinación
                  </span>
                ) : currentStock <= 5 ? (
                  <span
                    className="flex items-center gap-1"
                    style={{ color: "#f5884a" }}
                  >
                    ⚡ Solo quedan {currentStock} piezas
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Check className="h-3 w-3" /> En stock ({currentStock}{" "}
                    disponibles)
                  </span>
                )}
              </div>
            )}

            {/* Quantity + Add to cart + Wishlist */}
            <div className="flex gap-3 items-center">
              {/* Qty picker */}
              <div
                className="flex items-center overflow-hidden rounded-lg border"
                style={{ borderColor: "#e5e7eb" }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span
                  className="flex h-11 w-12 items-center justify-center border-x text-sm font-bold"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-11 w-11 items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "#e84562" }}
              >
                <ShoppingCart className="h-4 w-4" />
                Agregar al Carrito
              </button>

              {/* Wishlist */}
              <button
                onClick={handleToggleFavorite}
                className="flex h-11 w-11 items-center justify-center rounded-lg border-2 transition-all"
                style={{
                  borderColor: isInFavorites ? "#e84562" : "#e5e7eb",
                  color: isInFavorites ? "#e84562" : "#9ca3af",
                }}
              >
                <Heart
                  className="h-5 w-5"
                  style={{ fill: isInFavorites ? "#e84562" : "transparent" }}
                />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { Icon: Truck, label: "Envío Gratis", sub: "Pedidos +$999" },
                { Icon: RotateCcw, label: "Devolución", sub: "30 días" },
                { Icon: Shield, label: "Compra Segura", sub: "Protegida" },
              ].map(({ Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-xl py-3"
                  style={{ background: "#f9f9f9" }}
                >
                  <Icon className="h-5 w-5" style={{ color: "#e84562" }} />
                  <span className="text-[10px] font-bold text-gray-700">
                    {label}
                  </span>
                  <span className="text-[9px] text-gray-400">{sub}</span>
                </div>
              ))}
            </div>

            {/* Details section */}
            <div
              style={{ borderTop: "1px solid #f0f0f0" }}
              className="flex flex-col gap-4 pt-4"
            >
              {/* Description */}
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Descripción
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  {product.description}
                </p>
              </div>

              {/* Info chips */}
              <div className="flex flex-wrap gap-2">
                {product.gender && (
                  <span
                    className="rounded-full border px-3 py-1 text-xs text-gray-600"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <span className="font-semibold">Género:</span>{" "}
                    {product.gender.charAt(0).toUpperCase() +
                      product.gender.slice(1)}
                  </span>
                )}
                {product.fit && (
                  <span
                    className="rounded-full border px-3 py-1 text-xs text-gray-600"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <span className="font-semibold">Fit:</span>{" "}
                    {product.fit.charAt(0).toUpperCase() + product.fit.slice(1)}
                  </span>
                )}
                {product.season && (
                  <span
                    className="rounded-full border px-3 py-1 text-xs text-gray-600"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <span className="font-semibold">Temporada:</span>{" "}
                    {product.season.charAt(0).toUpperCase() +
                      product.season.slice(1)}
                  </span>
                )}
                {product.material && (
                  <span
                    className="rounded-full border px-3 py-1 text-xs text-gray-600"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <span className="font-semibold">Material:</span>{" "}
                    {product.material}
                  </span>
                )}
              </div>

              {/* Care instructions */}
              {product.care && product.care.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Instrucciones de Cuidado
                  </p>
                  <ul className="flex flex-col gap-1">
                    {product.care.map((instruction, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: "#e84562" }}
                        />
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pb-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p
                  className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "#e84562" }}
                >
                  También te puede gustar
                </p>
                <h2 className="text-xl font-black text-gray-900">
                  Productos Relacionados
                </h2>
              </div>
              <Link
                href={`/productos?categoria=${product.category}`}
                className="hidden items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-[#e84562] hover:text-[#e84562] sm:flex"
                style={{ borderColor: "#e5e7eb" }}
              >
                Ver más
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {relatedProducts.map((p) => (
                <FashionProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

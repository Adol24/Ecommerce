"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FashionProduct } from "@/types/fashion"
import { useCartStore } from "@/stores/cart-store"
import { useFavoritesStore } from "@/stores/favorites-store"
import { useAuth } from "@/hooks/useAuth"

interface Props {
  product: FashionProduct
  className?: string
}

export function FashionProductCard({ product, className }: Props) {
  const [hovered, setHovered] = useState(false)
  const addToCart = useCartStore((s) => s.addItem)
  const { items, addFavorite, removeFavorite } = useFavoritesStore()
  const { user, isAuthenticated } = useAuth()
  const isFav = items.some((item) => item.productId === product.id)

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  function handleCart(e: React.MouseEvent) {
    e.preventDefault()
    addToCart(product, 1)
  }

  async function handleFav(e: React.MouseEvent) {
    e.preventDefault()
    if (!isAuthenticated || !user) return
    if (isFav) await removeFavorite(user.id, product.id)
    else await addFavorite(user.id, product)
  }

  return (
    <Link href={`/productos/${product.slug}`} className={cn("group block", className)}>
      <div
        className="relative bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-lg"
        style={{ border: "1px solid #f0f0f0" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Imagen ── */}
        <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: "3/4" }}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badge NUEVO */}
          {product.isNew && (
            <span
              className="absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-bold text-white uppercase"
              style={{ background: "#e84562" }}
            >
              Nuevo
            </span>
          )}

          {/* Badge descuento */}
          {discount && (
            <span
              className="absolute left-2 text-[10px] font-bold text-white rounded px-1.5 py-0.5"
              style={{
                background: "#f5884a",
                top: product.isNew ? 28 : 8,
              }}
            >
              -{discount}%
            </span>
          )}

          {/* Botón favorito — top right */}
          <button
            onClick={handleFav}
            className={cn(
              "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-all duration-200",
              hovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}
          >
            <Heart
              className={cn("h-4 w-4", isFav ? "text-[#e84562] fill-[#e84562]" : "text-gray-500")}
            />
          </button>

          {/* Botón agregar al carrito — slide desde abajo */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 transition-transform duration-300",
              hovered ? "translate-y-0" : "translate-y-full"
            )}
          >
            <button
              onClick={handleCart}
              className="flex w-full items-center justify-center gap-2 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#e84562" }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Agregar al Carrito
            </button>
          </div>
        </div>

        {/* ── Info debajo de la imagen ── */}
        <div className="p-3">
          {/* Swatches de color */}
          {product.colors.length > 0 && (
            <div className="mb-2 flex items-center gap-1">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="inline-block h-3 w-3 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-gray-400 ml-0.5">+{product.colors.length - 4}</span>
              )}
            </div>
          )}

          {/* Precio */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "#e84562" }}>
              ${product.price.toLocaleString("es-MX")}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ${product.originalPrice.toLocaleString("es-MX")}
              </span>
            )}
          </div>

          {/* Nombre */}
          <p className="mb-1.5 text-xs font-medium text-gray-700 line-clamp-2 leading-snug">
            {product.name}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
            <span className="ml-1 text-[10px] text-gray-400">({Math.floor(product.rating * 10)})</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

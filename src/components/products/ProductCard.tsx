"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Product } from "@/types"
import { useCartStore } from "@/stores/cart-store"
import { useFavoritesStore } from "@/stores/favorites-store"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  className?: string
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=400&h=400&fit=crop"

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { user, isAuthenticated } = useAuth()
  const { items, addFavorite, removeFavorite } = useFavoritesStore()
  const [added, setAdded] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const isFavorite = items.some((item) => item.productId === product.id)

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const productImage = product.images?.[0] || PLACEHOLDER_IMAGE

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated || !user) return
    setIsToggling(true)
    if (isFavorite) {
      await removeFavorite(user.id, product.id)
    } else {
      await addFavorite(user.id, product)
    }
    setIsToggling(false)
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border/60 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      {/* Image area */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-white">
        {/* Badges — square, top-left */}
        <div className="absolute left-0 top-0 z-10 flex flex-col">
          {product.isNew && (
            <span className="bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
              Nuevo
            </span>
          )}
          {hasDiscount && (
            <span className="bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist - appears on hover */}
        <button
          className={cn(
            "absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all",
            isFavorite 
              ? "bg-destructive text-white opacity-100" 
              : "bg-white/90 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
          )}
          onClick={handleToggleFavorite}
          disabled={isToggling || !isAuthenticated}
          title={!isAuthenticated ? "Inicia sesion para agregar favoritos" : isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
        </button>

        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Quick add — slides up on hover (desktop), always visible on mobile */}
        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-0 opacity-100 transition-all duration-200 sm:translate-y-full sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <Button
            className="w-full rounded-none rounded-b-none text-xs sm:text-sm"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            variant={added ? "secondary" : "default"}
          >
            {added ? (
              <><Check className="mr-1.5 h-3.5 w-3.5" />Agregado</>
            ) : (
              <><ShoppingCart className="mr-1.5 h-3.5 w-3.5" />Agregar al carrito</>
            )}
          </Button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                )}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">({product.rating})</span>
        </div>

        {/* Price */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-primary sm:text-lg">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.originalPrice!.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <p className="mt-1 text-[11px]">
          {product.stock > 0 ? (
            <span className="text-green-600 dark:text-green-400">{product.stock} disponibles</span>
          ) : (
            <span className="text-destructive">Agotado</span>
          )}
        </p>
      </div>
    </div>
  )
}

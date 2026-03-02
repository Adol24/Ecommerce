"use client"

import { cn } from "@/lib/utils"
import type { ClothingSize, ClothingVariant } from "@/types/fashion"

interface Props {
  sizes: ClothingSize[]
  selectedSize: ClothingSize | null
  selectedColor: string | null
  variants: ClothingVariant[]
  onChange: (size: ClothingSize) => void
}

export function FashionSizeSelector({
  sizes,
  selectedSize,
  selectedColor,
  variants,
  onChange,
}: Props) {
  function getStock(size: ClothingSize) {
    if (!selectedColor) return variants.filter((v) => v.size === size).reduce((sum, v) => sum + v.stock, 0)
    const variant = variants.find((v) => v.size === size && v.color === selectedColor)
    return variant?.stock ?? 0
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          Talla:{" "}
          {selectedSize && (
            <span className="text-primary font-bold">{selectedSize}</span>
          )}
        </span>
        <a href="/tallas" className="text-xs text-primary hover:underline">
          Guía de tallas →
        </a>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const stock = getStock(size)
          const outOfStock = stock === 0
          const isSelected = selectedSize === size

          return (
            <button
              key={size}
              type="button"
              disabled={outOfStock}
              title={outOfStock ? "Agotado" : `Talla ${size} — ${stock} disponibles`}
              onClick={() => onChange(size)}
              className={cn(
                "relative min-w-[42px] h-9 px-2.5 rounded-md border text-sm font-medium transition-all",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : outOfStock
                  ? "border-border text-muted-foreground opacity-40 cursor-not-allowed line-through"
                  : "border-border hover:border-primary hover:text-primary"
              )}
            >
              {size}
              {!outOfStock && stock <= 3 && !isSelected && (
                <span className="absolute -top-2 -right-2 text-[9px] bg-secondary text-secondary-foreground rounded-full px-1 leading-tight font-bold">
                  {stock}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

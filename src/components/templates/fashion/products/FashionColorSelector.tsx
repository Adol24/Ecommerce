"use client"

import { cn } from "@/lib/utils"
import type { ClothingColor } from "@/types/fashion"

interface Props {
  colors: ClothingColor[]
  selectedColor: string | null
  onChange: (color: ClothingColor) => void
}

export function FashionColorSelector({ colors, selectedColor, onChange }: Props) {
  return (
    <div>
      <div className="mb-2">
        <span className="text-sm font-medium">
          Color:{" "}
          {selectedColor && (
            <span className="text-primary font-bold">{selectedColor}</span>
          )}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name
          return (
            <button
              key={color.name}
              type="button"
              title={color.name}
              onClick={() => onChange(color)}
              className={cn(
                "relative h-8 w-8 rounded-full transition-all border-2",
                isSelected
                  ? "border-primary scale-110 shadow-md"
                  : "border-transparent hover:scale-105 hover:border-muted-foreground"
              )}
              style={{ backgroundColor: color.hex }}
            >
              {/* Borde exterior al seleccionar */}
              {isSelected && (
                <span className="absolute inset-0 rounded-full ring-2 ring-primary ring-offset-2" />
              )}
              <span className="sr-only">{color.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

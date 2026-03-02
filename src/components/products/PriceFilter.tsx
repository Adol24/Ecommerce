"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { DEFAULT_PRODUCT_PRICE_MAX } from "@/lib/product-filters"

interface PriceFilterProps {
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  minPrice?: number
  maxPrice?: number
}

export function PriceFilter({
  priceRange,
  onPriceChange,
  minPrice = 0,
  maxPrice = DEFAULT_PRODUCT_PRICE_MAX,
}: PriceFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  // Local draft values for the text inputs so the user can type freely
  const [minDraft, setMinDraft] = useState(String(priceRange[0]))
  const [maxDraft, setMaxDraft] = useState(String(priceRange[1]))

  // Sync drafts when external priceRange changes (e.g., "Limpiar filtros")
  useEffect(() => {
    setMinDraft(String(priceRange[0]))
    setMaxDraft(String(priceRange[1]))
  }, [priceRange[0], priceRange[1]])

  const commitMin = () => {
    const value = Math.round(Number(minDraft))
    if (!isNaN(value) && value >= minPrice && value <= priceRange[1]) {
      onPriceChange([value, priceRange[1]])
    } else {
      setMinDraft(String(priceRange[0]))
    }
  }

  const commitMax = () => {
    const value = Math.round(Number(maxDraft))
    if (!isNaN(value) && value <= maxPrice && value >= priceRange[0]) {
      onPriceChange([priceRange[0], value])
    } else {
      setMaxDraft(String(priceRange[1]))
    }
  }

  const fmt = (n: number) => n.toLocaleString("es-MX")

  return (
    <div className="border-b pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 font-medium"
      >
        Precio
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Range display */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${fmt(priceRange[0])}</span>
            <span>${fmt(priceRange[1])}</span>
          </div>

          <Slider
            value={[priceRange[0], priceRange[1]]}
            onValueChange={([min, max]) => onPriceChange([min, max])}
            min={minPrice}
            max={maxPrice}
            step={100}
            className="w-full"
          />

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Mínimo</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={minDraft}
                  onChange={(e) => setMinDraft(e.target.value)}
                  onBlur={commitMin}
                  onKeyDown={(e) => e.key === "Enter" && commitMin()}
                  className="pl-6 h-9 text-sm"
                  min={minPrice}
                  max={priceRange[1]}
                />
              </div>
            </div>
            <span className="mt-4 text-muted-foreground">—</span>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Máximo</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={maxDraft}
                  onChange={(e) => setMaxDraft(e.target.value)}
                  onBlur={commitMax}
                  onKeyDown={(e) => e.key === "Enter" && commitMax()}
                  className="pl-6 h-9 text-sm"
                  min={priceRange[0]}
                  max={maxPrice}
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Rango: $0 — ${fmt(maxPrice)} MXN
          </p>
        </div>
      )}
    </div>
  )
}

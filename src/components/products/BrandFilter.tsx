"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProductsStore } from "@/stores/products-store"
import { useAppRealtimeRefresh } from "@/hooks/useAppRealtimeRefresh"

interface BrandFilterProps {
  selectedBrands: string[]
  onBrandsChange: (brands: string[]) => void
}

export function BrandFilter({ selectedBrands, onBrandsChange }: BrandFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { brands, fetchBrands } = useProductsStore()

  useEffect(() => {
    if (brands.length === 0) {
      fetchBrands()
    }
  }, [brands.length, fetchBrands])

  useAppRealtimeRefresh(["brands"], fetchBrands)

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBrandToggle = (brandSlug: string) => {
    if (selectedBrands.includes(brandSlug)) {
      onBrandsChange(selectedBrands.filter((b) => b !== brandSlug))
    } else {
      onBrandsChange([...selectedBrands, brandSlug])
    }
  }

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3 font-medium"
      >
        <span>Marca</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="pb-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>

          <div className="max-h-52 space-y-1 overflow-y-auto">
            {filteredBrands.map((brand) => (
              <label
                key={brand.id}
                htmlFor={`brand-${brand.id}`}
                className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.slug)}
                  onCheckedChange={() => handleBrandToggle(brand.slug)}
                />
                <span className={selectedBrands.includes(brand.slug) ? "font-medium" : ""}>
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

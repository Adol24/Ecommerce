"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandFilter } from "./BrandFilter"
import { PriceFilter } from "./PriceFilter"
import { CategoryFilter } from "./CategoryFilter"
import { DEFAULT_PRODUCT_PRICE_MAX } from "@/lib/product-filters"
import { FilterState } from "@/types"

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < DEFAULT_PRODUCT_PRICE_MAX

  const handleClearFilters = () => {
    onFiltersChange({
      brands: [],
      categories: [],
      priceRange: [0, DEFAULT_PRODUCT_PRICE_MAX],
      sortBy: filters.sortBy,
    })
  }

  return (
    <div className="space-y-0">
      {hasActiveFilters && (
        <div className="mb-3 flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-auto p-0 text-sm text-primary hover:text-primary/80"
          >
            Limpiar todo
            <X className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}

      <CategoryFilter
        selectedCategories={filters.categories}
        onCategoriesChange={(categories) =>
          onFiltersChange({ ...filters, categories })
        }
      />

      <BrandFilter
        selectedBrands={filters.brands}
        onBrandsChange={(brands) =>
          onFiltersChange({ ...filters, brands })
        }
      />

      <PriceFilter
        priceRange={filters.priceRange}
        onPriceChange={(priceRange) =>
          onFiltersChange({ ...filters, priceRange })
        }
      />
    </div>
  )
}

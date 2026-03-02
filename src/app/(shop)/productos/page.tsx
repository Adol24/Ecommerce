"use client"

import { useMemo, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { FashionProductGrid } from "@/components/templates/fashion/products/FashionProductGrid"
import { FashionFilterSidebar } from "@/components/templates/fashion/products/FashionFilterSidebar"
import { fashionProducts } from "@/data/mock-fashion"
import type { FashionFilterState } from "@/types/fashion"

const DEFAULT_FILTERS: FashionFilterState = {
  searchQuery: "",
  categories: [],
  brands: [],
  priceRange: [0, 5000],
  sortBy: "popular",
  genders: [],
  sizes: [],
  colors: [],
  fits: [],
  seasons: [],
}

export default function FashionProductsPage() {
  const [filters, setFilters] = useState<FashionFilterState>(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = [...fashionProducts]

    if (filters.genders.length > 0) {
      result = result.filter((p) => filters.genders.includes(p.gender))
    }
    if (filters.sizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)))
    }
    if (filters.colors.length > 0) {
      result = result.filter((p) => p.colors.some((c) => filters.colors.includes(c.name)))
    }
    if (filters.fits.length > 0) {
      result = result.filter((p) => p.fit && filters.fits.includes(p.fit))
    }
    if (filters.seasons.length > 0) {
      result = result.filter((p) => p.season && filters.seasons.includes(p.season))
    }
    if (filters.brands.length > 0) {
      result = result.filter((p) =>
        filters.brands.some((b) => p.brand.toLowerCase().replace(/[^a-z0-9]/g, "") === b.replace(/-/g, ""))
      )
    }
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }

    return result
  }, [filters])

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Productos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header + controles */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Todos los Productos</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} productos encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtros móvil */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4 overflow-y-auto">
              <h2 className="font-bold mb-4">Filtros</h2>
              <FashionFilterSidebar filters={filters} onChange={setFilters} />
            </SheetContent>
          </Sheet>

          {/* Ordenar */}
          <Select
            value={filters.sortBy}
            onValueChange={(v) => setFilters((f) => ({ ...f, sortBy: v as FashionFilterState["sortBy"] }))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Más Populares</SelectItem>
              <SelectItem value="newest">Más Nuevos</SelectItem>
              <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="rating">Mejor Calificados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Layout principal */}
      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <div className="hidden lg:block">
          <FashionFilterSidebar filters={filters} onChange={setFilters} />
        </div>

        {/* Grid de productos */}
        <div className="flex-1">
          <FashionProductGrid products={filtered} cols={4} />
        </div>
      </div>
    </div>
  )
}

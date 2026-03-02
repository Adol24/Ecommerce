"use client"

import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FashionFilterState, ClothingGender, ClothingSize, ClothingFit, ClothingSeason } from "@/types/fashion"
import { fashionBrands } from "@/data/mock-fashion"

interface Props {
  filters: FashionFilterState
  onChange: (filters: FashionFilterState) => void
}

const GENDERS: { value: ClothingGender; label: string }[] = [
  { value: "mujer", label: "Mujer" },
  { value: "hombre", label: "Hombre" },
  { value: "niña", label: "Niña" },
  { value: "niño", label: "Niño" },
  { value: "unisex", label: "Unisex" },
]

const ADULT_SIZES: ClothingSize[] = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
const KIDS_SIZES: ClothingSize[] = ["2", "4", "6", "8", "10", "12", "14"]

const FITS: { value: ClothingFit; label: string }[] = [
  { value: "slim", label: "Slim" },
  { value: "regular", label: "Regular" },
  { value: "oversized", label: "Oversized" },
  { value: "holgado", label: "Holgado" },
]

const SEASONS: { value: ClothingSeason; label: string }[] = [
  { value: "primavera", label: "Primavera" },
  { value: "verano", label: "Verano" },
  { value: "otoño", label: "Otoño" },
  { value: "invierno", label: "Invierno" },
  { value: "todo el año", label: "Todo el año" },
]

const COLOR_OPTIONS = [
  { name: "Negro", hex: "#111111" },
  { name: "Blanco", hex: "#f5f5f5" },
  { name: "Gris", hex: "#9ca3af" },
  { name: "Azul", hex: "#3b82f6" },
  { name: "Rojo", hex: "#ef4444" },
  { name: "Rosa", hex: "#f9a8d4" },
  { name: "Verde", hex: "#22c55e" },
  { name: "Café", hex: "#7c3f00" },
  { name: "Beige", hex: "#d4c5a9" },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{children}</h3>
}

function Divider() {
  return <div className="border-t my-4" />
}

export function FashionFilterSidebar({ filters, onChange }: Props) {
  function toggleGender(g: ClothingGender) {
    const next = filters.genders.includes(g)
      ? filters.genders.filter((x) => x !== g)
      : [...filters.genders, g]
    onChange({ ...filters, genders: next })
  }

  function toggleSize(s: ClothingSize) {
    const next = filters.sizes.includes(s)
      ? filters.sizes.filter((x) => x !== s)
      : [...filters.sizes, s]
    onChange({ ...filters, sizes: next })
  }

  function toggleColor(c: string) {
    const next = filters.colors.includes(c)
      ? filters.colors.filter((x) => x !== c)
      : [...filters.colors, c]
    onChange({ ...filters, colors: next })
  }

  function toggleFit(f: ClothingFit) {
    const next = filters.fits.includes(f)
      ? filters.fits.filter((x) => x !== f)
      : [...filters.fits, f]
    onChange({ ...filters, fits: next })
  }

  function toggleSeason(s: ClothingSeason) {
    const next = filters.seasons.includes(s)
      ? filters.seasons.filter((x) => x !== s)
      : [...filters.seasons, s]
    onChange({ ...filters, seasons: next })
  }

  function toggleBrand(b: string) {
    const next = filters.brands.includes(b)
      ? filters.brands.filter((x) => x !== b)
      : [...filters.brands, b]
    onChange({ ...filters, brands: next })
  }

  function clearAll() {
    onChange({
      ...filters,
      genders: [],
      sizes: [],
      colors: [],
      fits: [],
      seasons: [],
      brands: [],
      priceRange: [0, 5000],
    })
  }

  const hasActive =
    filters.genders.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.fits.length > 0 ||
    filters.seasons.length > 0 ||
    filters.brands.length > 0

  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-24 space-y-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base">Filtros</h2>
          {hasActive && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-primary h-7 px-2">
              Limpiar todo
            </Button>
          )}
        </div>

        {/* Género */}
        <SectionTitle>Género</SectionTitle>
        <div className="space-y-2">
          {GENDERS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.genders.includes(value)}
                onCheckedChange={() => toggleGender(value)}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>

        <Divider />

        {/* Talla */}
        <SectionTitle>Talla</SectionTitle>
        <div className="mb-2">
          <p className="text-[11px] text-muted-foreground mb-2">Adulto</p>
          <div className="flex flex-wrap gap-1.5">
            {ADULT_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={cn(
                  "h-8 min-w-[38px] px-2 rounded border text-xs font-medium transition-colors",
                  filters.sizes.includes(s)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mb-2 mt-3">Niños (edad)</p>
          <div className="flex flex-wrap gap-1.5">
            {KIDS_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={cn(
                  "h-8 min-w-[38px] px-2 rounded border text-xs font-medium transition-colors",
                  filters.sizes.includes(s)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Color */}
        <SectionTitle>Color</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => toggleColor(c.name)}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-all",
                filters.colors.includes(c.name)
                  ? "border-primary scale-110 ring-2 ring-primary ring-offset-1"
                  : "border-transparent hover:border-muted-foreground"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        <Divider />

        {/* Precio */}
        <SectionTitle>Precio</SectionTitle>
        <div className="px-1">
          <Slider
            min={0}
            max={5000}
            step={50}
            value={filters.priceRange}
            onValueChange={(v) => onChange({ ...filters, priceRange: v as [number, number] })}
            className="mb-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${filters.priceRange[0].toLocaleString("es-MX")}</span>
            <span>${filters.priceRange[1].toLocaleString("es-MX")}</span>
          </div>
        </div>

        <Divider />

        {/* Fit */}
        <SectionTitle>Corte / Fit</SectionTitle>
        <div className="space-y-2">
          {FITS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.fits.includes(value)}
                onCheckedChange={() => toggleFit(value)}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>

        <Divider />

        {/* Temporada */}
        <SectionTitle>Temporada</SectionTitle>
        <div className="space-y-2">
          {SEASONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.seasons.includes(value)}
                onCheckedChange={() => toggleSeason(value)}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>

        <Divider />

        {/* Marcas */}
        <SectionTitle>Marcas</SectionTitle>
        <div className="space-y-2">
          {fashionBrands.map((brand) => (
            <label key={brand.id} className="flex items-center justify-between gap-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={filters.brands.includes(brand.slug)}
                  onCheckedChange={() => toggleBrand(brand.slug)}
                />
                <span className="text-sm">{brand.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{brand.productCount}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}

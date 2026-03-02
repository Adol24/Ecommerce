"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useProductsStore } from "@/stores/products-store"
import { useAppRealtimeRefresh } from "@/hooks/useAppRealtimeRefresh"

interface CategoryFilterProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
}

export function CategoryFilter({
  selectedCategories,
  onCategoriesChange,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { categories, fetchCategories } = useProductsStore()

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [categories.length, fetchCategories])

  useAppRealtimeRefresh(["categories"], fetchCategories)

  const handleCategoryToggle = (categorySlug: string) => {
    if (selectedCategories.includes(categorySlug)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== categorySlug))
    } else {
      onCategoriesChange([...selectedCategories, categorySlug])
    }
  }

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3 font-medium"
      >
        <span>Categoría</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="pb-3 space-y-1">
          {categories.map((category) => (
            <label
              key={category.id}
              htmlFor={`category-${category.id}`}
              className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-2 text-sm transition-colors hover:bg-muted/50"
            >
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryToggle(category.slug)}
              />
              <span className={selectedCategories.includes(category.slug) ? "font-medium" : ""}>
                {category.name}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

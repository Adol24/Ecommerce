import { cn } from "@/lib/utils"
import { FashionProductCard } from "./FashionProductCard"
import type { FashionProduct } from "@/types/fashion"

interface Props {
  products: FashionProduct[]
  cols?: 2 | 3 | 4
  className?: string
}

export function FashionProductGrid({ products, cols = 4, className }: Props) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  }[cols]

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p className="text-4xl mb-3">🛍️</p>
        <p className="font-medium">No se encontraron productos</p>
        <p className="text-sm">Intenta ajustar los filtros</p>
      </div>
    )
  }

  return (
    <div className={cn(`grid gap-4 ${gridCols}`, className)}>
      {products.map((product) => (
        <FashionProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

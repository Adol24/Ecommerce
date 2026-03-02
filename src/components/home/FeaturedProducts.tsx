"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { ProductCard } from "@/components/products/ProductCard"
import { useProductsStore } from "@/stores/products-store"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Sparkles, Star } from "lucide-react"
import { useAppRealtimeRefresh } from "@/hooks/useAppRealtimeRefresh"

export function FeaturedProducts() {
  const { featuredProducts, products, fetchFeaturedProducts, fetchProducts } = useProductsStore()
  const [loading, setLoading] = useState(true)

  const loadProducts = useCallback(async () => {
    await Promise.all([fetchFeaturedProducts(), fetchProducts()])
  }, [fetchFeaturedProducts, fetchProducts])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      await loadProducts()
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [loadProducts])

  useAppRealtimeRefresh(["products"], loadProducts)

  const newProducts = useMemo(
    () => products.filter((p) => p.isNew).slice(0, 8),
    [products]
  )

  const topRated = useMemo(
    () =>
      [...products]
        .filter((p) => p.rating > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8),
    [products]
  )

  const skeletons = Array.from({ length: 8 }).map((_, i) => (
    <div key={i} className="space-y-3">
      <Skeleton className="aspect-square rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ))

  return (
    <section className="py-6 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">Productos Destacados</h2>
        </div>

        <Tabs defaultValue="featured">
          <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
            <TabsTrigger
              value="featured"
              className="flex-none items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Más Vendidos
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="flex-none items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Recién Llegados
            </TabsTrigger>
            <TabsTrigger
              value="rated"
              className="flex-none items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Star className="h-3.5 w-3.5" />
              Mejor Calificados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="animate-in fade-in-0 duration-200">
            {!loading && featuredProducts.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Aún no hay productos disponibles.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {loading ? skeletons : featuredProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="animate-in fade-in-0 duration-200">
            {!loading && newProducts.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No hay productos nuevos disponibles.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {loading ? skeletons : newProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rated" className="animate-in fade-in-0 duration-200">
            {!loading && topRated.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No hay productos disponibles.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {loading ? skeletons : topRated.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

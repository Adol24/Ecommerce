"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/products/ProductCard"
import { useAuth } from "@/hooks/useAuth"
import { useFavoritesStore } from "@/stores/favorites-store"

export default function FavoritesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { items, isLoading: favoritesLoading, loadFavorites } = useFavoritesStore()

  useEffect(() => {
    if (user?.id) {
      loadFavorites(user.id)
    }
  }, [user?.id, loadFavorites])

  if (authLoading || favoritesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold">Inicia sesion para ver tus favoritos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Guarda productos que te gusten para verlos luego
          </p>
          <Button asChild>
            <Link href="/login">Iniciar Sesion</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Mis Favoritos</h2>
        <p className="text-muted-foreground">
          Productos que has guardado
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No tienes favoritos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Guarda productos que te gusten para verlos luego
            </p>
            <Button asChild>
              <Link href="/products">Explorar Productos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "producto" : "productos"} guardados
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ProductCard key={item.id} product={item.product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

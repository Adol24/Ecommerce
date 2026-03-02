'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useFavoritesStore } from '@/stores/favorites-store'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const { loadFavorites, clearFavorites } = useFavoritesStore()

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadFavorites(user.id)
    } else {
      clearFavorites()
    }
  }, [isAuthenticated, user?.id, loadFavorites, clearFavorites])

  return <>{children}</>
}

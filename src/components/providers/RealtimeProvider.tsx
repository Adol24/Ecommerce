"use client"

import { useEffect } from "react"
import { useRealtime } from "@/hooks/useRealtime"
import { useCartStore } from "@/stores/cart-store"
import { useFavoritesStore } from "@/stores/favorites-store"
import { useUserStore } from "@/stores/user-store"

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtime()

  const { fetchAddresses } = useUserStore()
  const { loadFavorites } = useFavoritesStore()

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "basictech-cart") {
        useCartStore.getState()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return <>{children}</>
}

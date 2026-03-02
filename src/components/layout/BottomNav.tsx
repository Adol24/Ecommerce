"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react"
import { useState, useEffect } from "react"
import { useCartStore } from "@/stores/cart-store"
import { useFavoritesStore } from "@/stores/favorites-store"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/products", label: "Buscar", icon: Search },
  { href: "/cart", label: "Carrito", icon: ShoppingCart },
  { href: "/profile/favorites", label: "Favoritos", icon: Heart },
  { href: "/profile", label: "Cuenta", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { getItemCount } = useCartStore()
  const { items: favorites } = useFavoritesStore()
  const { isAuthenticated } = useAuth()

  const itemCount = getItemCount()
  const favoritesCount = favorites.length

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    return null
  }

  return (
    <>
      {/* Bottom Navigation */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-white border-t lg:hidden transition-transform duration-300",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.href === "/cart" && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-white">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                  {item.href === "/profile/favorites" && isAuthenticated && favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-white">
                      {favoritesCount > 9 ? "9+" : favoritesCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

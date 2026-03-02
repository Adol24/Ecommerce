"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Settings,
  Package,
  ChevronDown,
  Monitor,
  Keyboard,
  Cpu,
  Gamepad2,
  Headphones,
  HardDrive,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./ThemeToggle"
import { MobileNav } from "./MobileNav"
import { useCartStore } from "@/stores/cart-store"
import { useFavoritesStore } from "@/stores/favorites-store"
import { useAuth } from "@/hooks/useAuth"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"
import { SearchBar } from "./SearchBar"

const categoryLinks = [
  { label: "Todos", href: "/products", icon: LayoutGrid },
  { label: "Computadoras", href: "/products?category=computadoras", icon: Monitor },
  { label: "Teclados", href: "/products?category=teclados", icon: Keyboard },
  { label: "Componentes", href: "/products?category=componentes", icon: Cpu },
  { label: "Gaming", href: "/products?category=gaming", icon: Gamepad2 },
  { label: "Audífonos", href: "/products?category=audifonos", icon: Headphones },
  { label: "Almacenamiento", href: "/products?category=almacenamiento", icon: HardDrive },
]

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())
  const favoritesCount = useFavoritesStore((state) => state.items.length)
  const { user, isLoading, signOut, isAuthenticated } = useAuth()
  const { settings } = useStoreSettings()

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow ${
        scrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      {/* Main header row */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {settings.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logo}
                alt={settings.storeName}
                className="h-9 w-9 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-black text-primary-foreground">BT</span>
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-xl font-black tracking-tight">{settings.storeName}</span>
            </div>
          </Link>

          {/* Search bar — desktop */}
          <div className="hidden flex-1 max-w-xl md:flex">
            <SearchBar className="w-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <ThemeToggle />

            {/* Wishlist */}
            <Link href="/profile/favorites">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Heart className="h-4 w-4" />
                {mounted && isAuthenticated && favoritesCount > 0 && (
                  <Badge
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                    variant="destructive"
                  >
                    {favoritesCount > 99 ? "99+" : favoritesCount}
                  </Badge>
                )}
                <span className="sr-only">Favoritos</span>
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <ShoppingCart className="h-4 w-4" />
                {mounted && itemCount > 0 && (
                  <Badge
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                    variant="destructive"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </Badge>
                )}
                <span className="sr-only">Carrito</span>
              </Button>
            </Link>

            {/* User */}
            <div className="hidden items-center sm:flex">
                {mounted && !isLoading && isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-9 gap-1 px-2">
                        <User className="h-4 w-4" />
                        <span className="max-w-20 truncate text-sm">
                          {user.name?.split(" ")[0]}
                        </span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" /> Mi Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/orders" className="cursor-pointer">
                          <Package className="mr-2 h-4 w-4" /> Mis Pedidos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" /> Configuración
                        </Link>
                      </DropdownMenuItem>
                      {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">
                              <Settings className="mr-2 h-4 w-4" /> Panel Admin
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">Ingresar</Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm">Registrarse</Button>
                    </Link>
                  </div>
              )}
            </div>

            <MobileNav />
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-3 md:hidden">
          <SearchBar placeholder="Buscar productos..." className="w-full" />
        </div>
      </div>

      {/* Category nav bar — desktop only */}
      <div className="hidden border-t md:block">
        <div className="container mx-auto px-4">
          <nav className="flex h-9 items-center gap-1">
            {categoryLinks.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="flex items-center gap-1.5 rounded px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

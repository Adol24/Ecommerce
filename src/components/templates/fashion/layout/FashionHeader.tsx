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
  Search,
  Menu,
  ChevronDown,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCartStore } from "@/stores/cart-store"
import { useFavoritesStore } from "@/stores/favorites-store"
import { useAuth } from "@/hooks/useAuth"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { label: "Mujer", href: "/productos?genero=mujer" },
  { label: "Hombre", href: "/productos?genero=hombre" },
  { label: "Niños", href: "/productos?genero=nino" },
  { label: "Pantalones", href: "/productos?categoria=pantalones" },
  { label: "Playeras", href: "/productos?categoria=playeras" },
  { label: "Zapatos", href: "/productos?categoria=zapatos" },
  { label: "Accesorios", href: "/productos?categoria=accesorios" },
]

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Moda", href: "/productos" },
  { label: "Zapatos", href: "/productos?categoria=zapatos" },
  { label: "Pantalones", href: "/productos?categoria=pantalones" },
  { label: "Mujer", href: "/productos?genero=mujer" },
  { label: "Hombre", href: "/productos?genero=hombre" },
  { label: "Novedades", href: "/productos?nuevo=true", highlight: true },
  { label: "Blog", href: "/blog" },
]

export function FashionHeader() {
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [search, setSearch] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  const itemCount = useCartStore((s) => s.getItemCount())
  const { items } = useFavoritesStore()
  const favCount = items.length
  const { user, isLoading, signOut, isAuthenticated } = useAuth()
  const { settings } = useStoreSettings()

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) window.location.href = `/productos?q=${encodeURIComponent(search)}`
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white transition-shadow",
        scrolled && "shadow-[0_2px_16px_rgba(0,0,0,0.10)]"
      )}
    >
      {/* ── Fila principal ────────────────────────────── */}
      <div className="border-b border-gray-100">
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center gap-4 px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 mr-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-black"
              style={{ background: "linear-gradient(135deg,#e84562,#f5884a)" }}
            >
              {settings.storeName.substring(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:block text-[22px] font-black tracking-tight text-gray-900">
              {settings.storeName}
            </span>
          </Link>

          {/* Explorar Categoría — desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hidden md:flex h-10 items-center gap-2 shrink-0 rounded-md border-gray-200 text-sm font-medium"
              >
                <LayoutGrid className="h-4 w-4 text-[#e84562]" />
                Explorar Categoría
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              {CATEGORIES.map((c) => (
                <DropdownMenuItem key={c.href} asChild>
                  <Link href={c.href}>{c.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="flex flex-1 min-w-0">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="rounded-r-none h-10 border-r-0 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />
            <button
              type="submit"
              className="flex h-10 w-11 shrink-0 items-center justify-center rounded-r-md text-white transition-opacity hover:opacity-90"
              style={{ background: "#e84562" }}
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Íconos de acción */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Favoritos */}
            <Link href="/profile/favorites">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:text-[#e84562] transition-colors">
                <Heart className="h-5 w-5" />
                {mounted && isAuthenticated && favCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e84562] text-[9px] font-bold text-white">
                    {favCount > 9 ? "9+" : favCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Carrito */}
            <Link href="/cart">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:text-[#e84562] transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e84562] text-[9px] font-bold text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Usuario — desktop
                Los botones de login/registro siempre están en el DOM para evitar
                que un re-mount del componente deje una ventana donde no se pueden
                clickear. Solo ocultamos el contenido sensible (nombre/avatar) hasta
                que mounted=true para evitar mismatch de hidratación. */}
            <div className="hidden sm:block">
              {mounted && !isLoading && isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-gray-700 hover:text-[#e84562] transition-colors">
                      <User className="h-4.5 w-4.5" />
                      <span className="max-w-[72px] truncate">{user.name?.split(" ")[0]}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><User className="mr-2 h-4 w-4" />Mi Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/orders"><Package className="mr-2 h-4 w-4" />Mis Pedidos</Link>
                    </DropdownMenuItem>
                    {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin"><Settings className="mr-2 h-4 w-4" />Panel Admin</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-red-500 focus:text-red-500 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : !mounted || isLoading ? (
                /* Placeholder invisible mientras carga para evitar layout shift */
                <div className="h-10 w-[140px]" aria-hidden />
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <button className="text-sm font-medium text-gray-600 hover:text-[#e84562] transition-colors">
                      Ingresar
                    </button>
                  </Link>
                  <Link href="/register">
                    <button
                      className="rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: "#e84562" }}
                    >
                      Registrarse
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Menú móvil */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 md:hidden">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 p-4 border-b">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-black"
                      style={{ background: "linear-gradient(135deg,#e84562,#f5884a)" }}
                    >
                      {settings.storeName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold">{settings.storeName}</span>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-4 space-y-0.5">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50",
                          link.highlight ? "text-[#e84562] font-bold" : "text-gray-700"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="p-4 border-t space-y-2">
                    {/* Siempre renderizamos los botones; solo condicionamos qué se muestra */}
                    {mounted && !isLoading && isAuthenticated ? (
                      <Button variant="outline" className="w-full" onClick={() => { signOut(); setMobileOpen(false) }}>
                        <LogOut className="mr-2 h-4 w-4" />Cerrar Sesión
                      </Button>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full">Ingresar</Button>
                        </Link>
                        <Link href="/register" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full" style={{ background: "#e84562" }}>Registrarse</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ── Nav de categorías — desktop ────────────────── */}
      <div className="hidden md:block border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-10 max-w-[1280px] items-center gap-0 px-4 lg:px-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex h-full items-center px-4 text-[13px] font-medium transition-colors hover:text-[#e84562] border-b-2 border-transparent hover:border-[#e84562]",
                link.highlight ? "text-[#e84562] font-bold" : "text-gray-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

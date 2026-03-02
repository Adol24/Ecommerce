"use client"

import * as React from "react"
import Link from "next/link"
import {
  Menu, Monitor, Keyboard, Mouse, Headphones, HardDrive, Cpu,
  User, Heart, Package, LogOut, Settings, ArrowRight, ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"

const categories = [
  { name: "Computadoras", href: "/products?category=computadoras", icon: Monitor },
  { name: "Monitores",    href: "/products?category=monitores",    icon: Monitor },
  { name: "Teclados",     href: "/products?category=teclados",     icon: Keyboard },
  { name: "Mouse",        href: "/products?category=mouse",        icon: Mouse },
  { name: "Audífonos",    href: "/products?category=audifonos",    icon: Headphones },
  { name: "Almacenamiento", href: "/products?category=almacenamiento", icon: HardDrive },
  { name: "Componentes",  href: "/products?category=componentes",  icon: Cpu },
]

const accountLinks = [
  { href: "/profile",          icon: User,     label: "Mi Perfil" },
  { href: "/profile/orders",   icon: Package,  label: "Mis Pedidos" },
  { href: "/profile/favorites",icon: Heart,    label: "Favoritos" },
  { href: "/profile/settings", icon: Settings, label: "Configuración" },
]

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { user, isAuthenticated, signOut } = useAuth()

  const close = () => setOpen(false)

  const handleSignOut = async () => {
    close()
    await signOut()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Menú</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex w-[272px] flex-col overflow-hidden p-0">
        {/* ── Header ── */}
        <SheetHeader className="shrink-0 border-b px-4 py-3">
          <SheetTitle className="text-sm font-semibold">Menú</SheetTitle>
        </SheetHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Auth section ── */}
          {isAuthenticated && user ? (
            <>
              {/* User card */}
              <div className="flex items-center gap-3 bg-muted/40 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Account links */}
              <nav className="px-2 py-2">
                {accountLinks.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {label}
                  </Link>
                ))}

                <Separator className="my-1" />

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Cerrar Sesión
                </button>
              </nav>
            </>
          ) : (
            <div className="space-y-2 px-4 py-4">
              <Link href="/login" onClick={close}>
                <Button variant="outline" size="sm" className="w-full">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register" onClick={close}>
                <Button size="sm" className="w-full">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}

          <Separator />

          {/* ── Categories ── */}
          <div className="px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categorías
            </p>

            <div className="grid grid-cols-2 gap-0.5">
              {categories.map(({ name, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{name}</span>
                </Link>
              ))}
            </div>

            <Link
              href="/products"
              onClick={close}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
              Ver todos los productos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}

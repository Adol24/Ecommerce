"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Monitor, Keyboard, Mouse, Headphones, HardDrive, Cpu, User, Heart, Package, LogOut, Settings } from "lucide-react"
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
  { name: "Monitores", href: "/products?category=monitores", icon: Monitor },
  { name: "Teclados", href: "/products?category=teclados", icon: Keyboard },
  { name: "Mouse", href: "/products?category=mouse", icon: Mouse },
  { name: "Audifonos", href: "/products?category=audifonos", icon: Headphones },
  { name: "Almacenamiento", href: "/products?category=almacenamiento", icon: HardDrive },
  { name: "Componentes", href: "/products?category=componentes", icon: Cpu },
]

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { user, isAuthenticated, signOut } = useAuth()

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          {isAuthenticated && user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Authenticated links */}
              <div className="flex flex-col gap-1">
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </Link>
                <Link
                  href="/profile/orders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <Package className="h-4 w-4" />
                  Mis Pedidos
                </Link>
                <Link
                  href="/profile/favorites"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <Heart className="h-4 w-4" />
                  Favoritos
                </Link>
                <Link
                  href="/profile/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </Link>
              </div>

              <Separator />

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              {/* Guest actions */}
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Iniciar Sesión</Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">Registrarse</Button>
                </Link>
              </div>
            </>
          )}

          <Separator />

          {/* Categories */}
          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
              Categorias
            </p>
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </Link>
            ))}
          </div>

          <Separator />

          {/* All Products */}
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ver Todos los Productos
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Package, MapPin, Heart, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

const CORAL = "#e84562"

const navigation = [
  { name: "Mi Perfil",     href: "/profile",           icon: User     },
  { name: "Mis Pedidos",   href: "/profile/orders",    icon: Package  },
  { name: "Direcciones",   href: "/profile/addresses", icon: MapPin   },
  { name: "Favoritos",     href: "/profile/favorites", icon: Heart    },
  { name: "Configuracion", href: "/profile/settings",  icon: Settings },
]

export function FashionProfileSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const displayName = user?.name?.trim() || "Usuario"
  const displayEmail = user?.email || ""
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="space-y-6">
      {/* User Info */}
      <div className="flex items-center gap-4">
        {/* Avatar con gradiente coral */}
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center shrink-0 text-white text-lg font-black shadow-sm"
          style={{ background: `linear-gradient(135deg, ${CORAL} 0%, #f5884a 100%)` }}
        >
          {initials || "U"}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">{displayName}</h2>
          <p className="text-sm text-gray-500">{displayEmail}</p>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Navigation */}
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-white"
                  : "text-gray-600 hover:bg-rose-50"
              )}
              style={isActive ? { background: `linear-gradient(135deg, ${CORAL} 0%, #f5884a 100%)` } : {}}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="h-px bg-gray-100" />

      {/* Logout */}
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-rose-50 hover:text-[#e84562] transition-colors"
        onClick={() => void signOut()}
      >
        <LogOut className="h-4 w-4" />
        Cerrar Sesión
      </button>
    </aside>
  )
}

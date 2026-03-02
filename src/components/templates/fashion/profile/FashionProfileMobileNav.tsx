"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Package, MapPin, Heart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const CORAL = "#e84562"

const navigation = [
  { name: "Perfil",       href: "/profile",           icon: User     },
  { name: "Pedidos",      href: "/profile/orders",    icon: Package  },
  { name: "Direcciones",  href: "/profile/addresses", icon: MapPin   },
  { name: "Favoritos",    href: "/profile/favorites", icon: Heart    },
  { name: "Config",       href: "/profile/settings",  icon: Settings },
]

export function FashionProfileMobileNav() {
  const pathname = usePathname()

  return (
    <div className="w-full overflow-x-auto pb-2 lg:hidden scrollbar-none">
      <div className="flex gap-2 min-w-max">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "text-white"
                  : "bg-rose-50 text-gray-600 hover:text-[#e84562]"
              )}
              style={isActive ? { background: `linear-gradient(135deg, ${CORAL} 0%, #f5884a 100%)` } : {}}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

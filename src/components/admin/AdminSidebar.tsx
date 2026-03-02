"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Tag,
  Images,
  CreditCard,
  Users,
  Settings,
  Store,
  LayoutTemplate,
  ShoppingCart,
  BarChart3,
  Bell,
  TicketPercent,
  FileBarChart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard",     href: "/admin",           icon: LayoutDashboard },
  { name: "Pedidos",       href: "/admin/orders",    icon: ShoppingCart    },
  { name: "Inventario",    href: "/admin/inventory", icon: BarChart3      },
  { name: "Reportes",      href: "/admin/reports",   icon: FileBarChart   },
  { name: "Cupones",       href: "/admin/coupons",   icon: TicketPercent  },
  { name: "Notificaciones",href: "/admin/notifications",icon: Bell        },
  { name: "Banners",       href: "/admin/banners",   icon: Images          },
  { name: "Productos",     href: "/admin/products",  icon: Package         },
  { name: "Categorías",    href: "/admin/categories",icon: Tag             },
  { name: "Pagos",         href: "/admin/payments",  icon: CreditCard      },
  { name: "Usuarios",      href: "/admin/users",     icon: Users           },
  { name: "Homepage",      href: "/admin/homepage",  icon: LayoutTemplate  },
  { name: "Configuracion", href: "/admin/settings",  icon: Settings        },
]

interface AdminSidebarProps {
  isOpen: boolean
}

export function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "hidden border-r bg-card lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:transition-transform lg:duration-200",
        isOpen ? "lg:translate-x-0" : "lg:-translate-x-full lg:pointer-events-none"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">BT</span>
        </div>
        <span className="font-bold">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Back to Store */}
      <div className="border-t p-4">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/">
            <Store className="mr-2 h-4 w-4" />
            Volver a la Tienda
          </Link>
        </Button>
      </div>
    </aside>
  )
}

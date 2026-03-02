"use client"

import Link from "next/link"
import { Menu, Bell, Search, LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { AdminMobileNav } from "./AdminMobileNav"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"
import { useAuth } from "@/hooks/useAuth"
import { useAdminNotifications } from "@/hooks/useAdminNotifications"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AdminHeader({ isSidebarOpen, onToggleSidebar }: AdminHeaderProps) {
  const { settings } = useStoreSettings()
  const { user, signOut } = useAuth()
  const { unreadCount, isNew } = useAdminNotifications()

  const storeName = settings?.storeName ?? "Mi Tienda"
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD"

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile Menu */}
      <AdminMobileNav />

      {/* Desktop Sidebar Toggle */}
      <div className="hidden lg:block">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">
            {isSidebarOpen ? "Ocultar menu lateral" : "Mostrar menu lateral"}
          </span>
        </Button>
      </div>

      {/* Store name — solo desktop */}
      <div className="hidden items-center gap-2 lg:flex">
        <span className="text-sm font-semibold text-foreground">{storeName}</span>
        <Badge variant="secondary" className="text-[11px]">
          TechShop
        </Badge>
      </div>

      {/* Search */}
      <div className="hidden flex-1 md:flex md:max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full pl-8"
          />
        </div>
      </div>

      <div className="flex-1 md:flex-none" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notification Bell */}
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/admin/notifications">
            <Bell
              className={cn(
                "h-4 w-4 transition-transform",
                isNew && "animate-bounce text-primary"
              )}
            />
            {unreadCount > 0 && (
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white transition-colors",
                  isNew ? "bg-primary" : "bg-destructive"
                )}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name ?? "Admin"}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => void signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

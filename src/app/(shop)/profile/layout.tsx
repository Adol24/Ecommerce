"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ProfileSidebar } from "@/components/profile/ProfileSidebar"
import { ProfileMobileNav } from "@/components/profile/ProfileMobileNav"
import { useAuth } from "@/hooks/useAuth"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Mientras verifica auth o si no está autenticado, no renderiza nada
  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Mi Cuenta</h1>

      <ProfileMobileNav />

      <div className="flex gap-8">
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <ProfileSidebar />
          </div>
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}

"use client"

import { ProfileSidebar } from "@/components/profile/ProfileSidebar"
import { ProfileMobileNav } from "@/components/profile/ProfileMobileNav"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
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

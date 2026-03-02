"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

const SIDEBAR_STORAGE_KEY = "admin.sidebar.open"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (storedValue === "0") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSidebarOpen(false)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      isSidebarOpen ? "1" : "0"
    )
  }, [isHydrated, isSidebarOpen])

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div className={`${isHydrated && !isSidebarOpen ? "lg:pl-0" : "lg:pl-64"} transition-[padding] duration-200`}>
        <AdminHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

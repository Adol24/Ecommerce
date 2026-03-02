"use client"

import { useEffect } from "react"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"

import { TopBar } from "@/components/layout/TopBar"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

interface Props {
  children: React.ReactNode
}

export function TemplateShopWrapper({ children }: Props) {
  const { settings } = useStoreSettings()
  const template = settings.activeTemplate ?? "tech"

  useEffect(() => {
    document.body.setAttribute("data-template", template)
  }, [template])

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <TopBar />
      <Header />
      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  )
}

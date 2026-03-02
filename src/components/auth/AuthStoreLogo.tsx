"use client"

import Link from "next/link"
import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"

export function AuthStoreLogo() {
  const { settings } = useStoreSettings()

  return (
    <Link href="/" className="flex items-center gap-2 self-center font-medium">
      {settings.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.logo}
          alt={settings.storeName}
          className="size-7 rounded-md object-contain"
        />
      ) : (
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
          <span className="text-xs font-black">
            {settings.storeName?.charAt(0).toUpperCase() ?? "B"}
          </span>
        </div>
      )}
      <span>{settings.storeName}</span>
    </Link>
  )
}

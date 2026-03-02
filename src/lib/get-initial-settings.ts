import { unstable_noStore as noStore } from "next/cache"
import { insforge } from "@/lib/insforge"
import {
  defaultStoreSettings,
  normalizeStoreSettings,
  type StoreSettings,
  APP_SETTINGS_ROW_ID,
} from "@/lib/store-settings"

export async function getInitialStoreSettings(): Promise<StoreSettings> {
  // Opt out of Next.js static caching so settings are always fresh from DB.
  // Without this, Vercel serves the HTML generated at build time, causing
  // admin changes to appear only briefly (via realtime) then revert on reload.
  noStore()

  try {
    const { data, error } = await insforge.database
      .from("app_settings")
      .select("settings")
      .eq("id", APP_SETTINGS_ROW_ID)
      .single()

    if (error || !data) return { ...defaultStoreSettings }

    return normalizeStoreSettings((data as Record<string, unknown>).settings)
  } catch {
    return { ...defaultStoreSettings }
  }
}

import { insforge } from "@/lib/insforge"
import {
  defaultStoreSettings,
  normalizeStoreSettings,
  type StoreSettings,
  APP_SETTINGS_ROW_ID,
} from "@/lib/store-settings"

export async function getInitialStoreSettings(): Promise<StoreSettings> {
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

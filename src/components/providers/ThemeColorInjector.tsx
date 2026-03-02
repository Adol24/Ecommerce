"use client"

import { useStoreSettings } from "@/components/providers/StoreSettingsProvider"
import { buildThemeCss, getColorTheme } from "@/lib/color-themes"

export function ThemeColorInjector() {
  const { settings } = useStoreSettings()
  const theme = getColorTheme(settings.colorTheme)
  const css = buildThemeCss(theme)

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

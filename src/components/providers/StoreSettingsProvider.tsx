"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { useAppRealtimeRefresh } from "@/hooks/useAppRealtimeRefresh"
import { defaultStoreSettings, normalizeStoreSettings, type StoreSettings } from "@/lib/store-settings"

interface StoreSettingsContextValue {
  settings: StoreSettings
  loading: boolean
  error: string | null
  warning: string | null
  updatedAt: string | null
  refresh: () => Promise<void>
  applySettings: (settings: StoreSettings, updatedAt?: string | null) => void
}

const StoreSettingsContext = createContext<StoreSettingsContextValue | null>(null)

async function fetchStoreSettingsFromApi() {
  const response = await fetch("/api/settings", {
    method: "GET",
    cache: "no-store",
  })

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const errorMessage =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as Record<string, unknown>).error === "string"
        ? ((body as Record<string, unknown>).error as string)
        : "No se pudo cargar la configuracion"
    throw new Error(errorMessage)
  }

  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null

  return {
    settings: normalizeStoreSettings(record?.settings),
    updatedAt: typeof record?.updatedAt === "string" ? (record.updatedAt as string) : null,
    warning: typeof record?.warning === "string" ? (record.warning as string) : null,
  }
}

export function StoreSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode
  initialSettings?: StoreSettings
}) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings ?? defaultStoreSettings)
  const [loading, setLoading] = useState(!initialSettings)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  // Evita re-fetch en mount cuando el servidor ya proveyó initialSettings.
  // Esto previene el render extra que causa flash al cambiar de template.
  const didInitialFetch = useRef(!!initialSettings)

  const refresh = useCallback(async () => {
    try {
      const result = await fetchStoreSettingsFromApi()
      setSettings(result.settings)
      setUpdatedAt(result.updatedAt)
      setWarning(result.warning)
      setError(null)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "No se pudo cargar la configuracion")
    } finally {
      setLoading(false)
    }
  }, [])

  const applySettings = useCallback((nextSettings: StoreSettings, nextUpdatedAt: string | null = null) => {
    setSettings(nextSettings)
    setUpdatedAt(nextUpdatedAt)
    setError(null)
  }, [])

  useEffect(() => {
    // Si el servidor ya proveyó initialSettings, no hacemos fetch en el primer mount.
    // Los cambios posteriores llegan por realtime (useAppRealtimeRefresh abajo).
    if (didInitialFetch.current) return
    didInitialFetch.current = true
    void refresh()
  }, [refresh])

  useAppRealtimeRefresh(["settings"], async () => {
    await refresh()
  })

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        warning,
        updatedAt,
        refresh,
        applySettings,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  )
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext)
  if (!context) {
    throw new Error("useStoreSettings debe usarse dentro de StoreSettingsProvider")
  }
  return context
}

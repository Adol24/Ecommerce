"use client"

import { useEffect, useCallback } from "react"
import { insforge } from "@/lib/insforge"
import {
  APP_BROWSER_DATA_CHANGED_EVENT,
  type AppRealtimeEntity,
  type AppDataChangedPayload,
} from "@/lib/app-realtime"

type RealtimeCallback = (payload: AppDataChangedPayload) => void

const listeners = new Map<string, Set<RealtimeCallback>>()

function getListenersForEntity(entity: string): Set<RealtimeCallback> {
  if (!listeners.has(entity)) {
    listeners.set(entity, new Set())
  }
  return listeners.get(entity)!
}

export function subscribeToRealtime(entity: AppRealtimeEntity, callback: RealtimeCallback): () => void {
  const entityListeners = getListenersForEntity(entity)
  entityListeners.add(callback)

  return () => {
    entityListeners.delete(callback)
  }
}

export function notifyRealtimeSubscribers(payload: AppDataChangedPayload) {
  const entityListeners = getListenersForEntity(payload.entity)
  entityListeners.forEach((callback) => {
    try {
      callback(payload)
    } catch (error) {
      console.error("Error in realtime callback:", error)
    }
  })

  const allListeners = getListenersForEntity("*")
  allListeners.forEach((callback) => {
    try {
      callback(payload)
    } catch (error) {
      console.error("Error in realtime callback:", error)
    }
  })
}

export function useRealtimeSubscription(
  entity: AppRealtimeEntity,
  onChange: () => void
) {
  const handleCallback = useCallback(() => {
    onChange()
  }, [onChange])

  useEffect(() => {
    const unsubscribe = subscribeToRealtime(entity, handleCallback)
    return unsubscribe
  }, [entity, handleCallback])
}

export function useRealtime() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const dbRealtime = insforge.realtime

    const handleBrowserEvent = (event: Event) => {
      const customEvent = event as CustomEvent<AppDataChangedPayload>
      if (customEvent.detail) {
        notifyRealtimeSubscribers(customEvent.detail)
      }
    }

    window.addEventListener(APP_BROWSER_DATA_CHANGED_EVENT, handleBrowserEvent)

    const setupRealtime = async () => {
      try {
        await dbRealtime.connect()

        const broadcastResponse = await dbRealtime.subscribe("broadcast")
        if (!broadcastResponse.ok) {
          console.warn("Failed to subscribe to broadcast:", broadcastResponse.error?.message)
        }

        dbRealtime.on("app:data_changed", (payload: unknown) => {
          console.log("Realtime event received:", payload)
          const data = payload as Record<string, unknown>
          if (data?.entity && data?.action) {
            notifyRealtimeSubscribers({
              entity: data.entity as AppRealtimeEntity,
              action: data.action as "created" | "updated" | "deleted",
              id: data.id as string | undefined,
              at: (data.at as string) || new Date().toISOString(),
              source: data.source as "api" | "client" || "api",
            })
          }
        })

        dbRealtime.on("INSERT", (payload: unknown) => {
          const data = payload as { table?: string; record?: Record<string, unknown> }
          if (data?.table) {
            const entityMap: Record<string, AppRealtimeEntity> = {
              products: "products",
              categories: "categories",
              brands: "brands",
              banners: "banners",
              users: "users",
              user_profiles: "users",
              orders: "orders",
              order_items: "orders",
              app_settings: "settings",
            }
            const entity = entityMap[data.table] || data.table as AppRealtimeEntity
            notifyRealtimeSubscribers({
              entity,
              action: "created",
              id: data.record?.id as string | undefined,
              at: new Date().toISOString(),
              source: "api",
            })
          }
        })

        dbRealtime.on("UPDATE", (payload: unknown) => {
          const data = payload as { table?: string; old_record?: Record<string, unknown>; record?: Record<string, unknown> }
          if (data?.table) {
            const entityMap: Record<string, AppRealtimeEntity> = {
              products: "products",
              categories: "categories",
              brands: "brands",
              banners: "banners",
              users: "users",
              user_profiles: "users",
              orders: "orders",
              order_items: "orders",
              app_settings: "settings",
            }
            const entity = entityMap[data.table] || data.table as AppRealtimeEntity
            notifyRealtimeSubscribers({
              entity,
              action: "updated",
              id: (data.old_record?.id || data.record?.id) as string | undefined,
              at: new Date().toISOString(),
              source: "api",
            })
          }
        })

        dbRealtime.on("DELETE", (payload: unknown) => {
          const data = payload as { table?: string; old_record?: Record<string, unknown> }
          if (data?.table) {
            const entityMap: Record<string, AppRealtimeEntity> = {
              products: "products",
              categories: "categories",
              brands: "brands",
              banners: "banners",
              users: "users",
              user_profiles: "users",
              orders: "orders",
              order_items: "orders",
              app_settings: "settings",
            }
            const entity = entityMap[data.table] || data.table as AppRealtimeEntity
            notifyRealtimeSubscribers({
              entity,
              action: "deleted",
              id: data.old_record?.id as string | undefined,
              at: new Date().toISOString(),
              source: "api",
            })
          }
        })
      } catch (error) {
        console.error("Failed to setup realtime:", error)
      }
    }

    setupRealtime()

    return () => {
      window.removeEventListener(APP_BROWSER_DATA_CHANGED_EVENT, handleBrowserEvent)
      dbRealtime.disconnect()
    }
  }, [])
}

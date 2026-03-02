"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { insforge } from "@/lib/insforge"
import {
  APP_BROWSER_DATA_CHANGED_EVENT,
  APP_REALTIME_CHANNEL,
  APP_REALTIME_EVENT,
  extractAppDataChangedPayload,
  type AppRealtimeEntity,
} from "@/lib/app-realtime"
import { useProductsStore } from "@/stores/products-store"
import { useAdminStore } from "@/stores/admin-store"

const SYNC_DEBOUNCE_MS = 200
const ROUTER_REFRESH_DEBOUNCE_MS = 300
const RECONNECT_DELAY_MS = 3000

export function RealtimeSyncProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const queuedEntitiesRef = useRef<Set<AppRealtimeEntity>>(new Set())
  const syncTimerRef = useRef<number | null>(null)
  const refreshTimerRef = useRef<number | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true

    const flushSync = async () => {
      syncTimerRef.current = null
      if (!mounted) return

      const entities = Array.from(queuedEntitiesRef.current)
      queuedEntitiesRef.current.clear()

      if (entities.length === 0) return

      const productsStore = useProductsStore.getState()
      const adminStore = useAdminStore.getState()

      const shouldRefreshCatalog = entities.some((e) =>
        e === "products" || e === "categories" || e === "brands"
      )
      const shouldRefreshUsers = entities.includes("users")
      const shouldRefreshOrders = entities.includes("orders")
      const shouldRefreshDashboard = entities.some((e) =>
        e === "products" || e === "users" || e === "orders"
      )

      const jobs: Array<Promise<unknown>> = []

      if (shouldRefreshCatalog) {
        jobs.push(productsStore.fetchCategories())
        jobs.push(productsStore.fetchBrands())
        jobs.push(productsStore.fetchProducts())
        jobs.push(productsStore.fetchFeaturedProducts())
      }

      if (shouldRefreshUsers && adminStore.users.length > 0) {
        jobs.push(adminStore.fetchUsers())
      }

      if (shouldRefreshOrders && (adminStore.orders.length > 0 || adminStore.ordersTotal > 0)) {
        jobs.push(adminStore.fetchOrders())
      }

      if (shouldRefreshDashboard && adminStore.stats) {
        jobs.push(adminStore.fetchDashboard())
      }

      if (jobs.length > 0) {
        await Promise.allSettled(jobs)
      }
    }

    const scheduleSync = (entity: AppRealtimeEntity) => {
      queuedEntitiesRef.current.add(entity)
      if (syncTimerRef.current !== null) return
      syncTimerRef.current = window.setTimeout(() => {
        void flushSync()
      }, SYNC_DEBOUNCE_MS)
    }

    const scheduleRouterRefresh = () => {
      if (refreshTimerRef.current !== null) return
      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null
        router.refresh()
      }, ROUTER_REFRESH_DEBOUNCE_MS)
    }

    const handleRealtimeChange = (message: unknown) => {
      const payload = extractAppDataChangedPayload(message)
      if (!payload) return

      window.dispatchEvent(
        new CustomEvent(APP_BROWSER_DATA_CHANGED_EVENT, { detail: payload })
      )

      scheduleSync(payload.entity)
      scheduleRouterRefresh()
    }

    const handleRealtimeError = (error: unknown) => {
      console.error("[realtime] error:", error)
      // Intentar reconectar tras un error de conexión
      if (!mounted) return
      if (reconnectTimerRef.current !== null) return
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null
        if (mounted) void connectAndSubscribe()
      }, RECONNECT_DELAY_MS)
    }

    const connectAndSubscribe = async () => {
      try {
        await insforge.realtime.connect()
        const response = await insforge.realtime.subscribe(APP_REALTIME_CHANNEL)
        if (!response.ok) {
          console.error("[realtime] Suscripcion fallida:", response.error)
        }
      } catch (error) {
        console.error("[realtime] No se pudo conectar:", error)
        // Reintentar conexión
        if (mounted && reconnectTimerRef.current === null) {
          reconnectTimerRef.current = window.setTimeout(() => {
            reconnectTimerRef.current = null
            if (mounted) void connectAndSubscribe()
          }, RECONNECT_DELAY_MS)
        }
      }
    }

    insforge.realtime.on(APP_REALTIME_EVENT, handleRealtimeChange)
    insforge.realtime.on("error", handleRealtimeError)
    insforge.realtime.on("connect_error", handleRealtimeError)

    void connectAndSubscribe()

    return () => {
      mounted = false

      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current)
      }
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current)
      }
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current)
      }

      insforge.realtime.off(APP_REALTIME_EVENT, handleRealtimeChange)
      insforge.realtime.off("error", handleRealtimeError)
      insforge.realtime.off("connect_error", handleRealtimeError)
      insforge.realtime.unsubscribe(APP_REALTIME_CHANNEL)
    }
  }, [router])

  return <>{children}</>
}

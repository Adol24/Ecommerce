"use client"

import { useEffect, useRef } from "react"
import {
  APP_BROWSER_DATA_CHANGED_EVENT,
  type AppDataChangedPayload,
  type AppRealtimeEntity,
} from "@/lib/app-realtime"

export function useAppRealtimeRefresh(
  entities: AppRealtimeEntity[],
  onRefresh: () => void | Promise<void>
) {
  // Estabilizamos las referencias para evitar re-registros innecesarios del listener
  // cuando el componente re-renderiza (los arrays literales y funciones inline cambian
  // en cada render pero su contenido es el mismo).
  const entitiesRef = useRef<Set<AppRealtimeEntity>>(new Set(entities))
  const onRefreshRef = useRef(onRefresh)

  // Sincronizar refs sin re-montar el efecto
  useEffect(() => {
    entitiesRef.current = new Set(entities)
  })
  useEffect(() => {
    onRefreshRef.current = onRefresh
  })

  useEffect(() => {
    const handleChange = (event: Event) => {
      const customEvent = event as CustomEvent<AppDataChangedPayload>
      const payload = customEvent.detail
      if (!payload || !entitiesRef.current.has(payload.entity)) return
      void onRefreshRef.current()
    }

    window.addEventListener(APP_BROWSER_DATA_CHANGED_EVENT, handleChange)
    return () => {
      window.removeEventListener(APP_BROWSER_DATA_CHANGED_EVENT, handleChange)
    }
  }, []) // sin dependencias: el listener se registra una sola vez por componente montado
}


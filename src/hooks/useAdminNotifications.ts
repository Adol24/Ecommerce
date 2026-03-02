"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { insforge } from "@/lib/insforge"
import {
  APP_BROWSER_DATA_CHANGED_EVENT,
  type AppDataChangedPayload,
} from "@/lib/app-realtime"

/** Two-tone ascending "ding" using Web Audio API — no external file needed */
function playNotificationSound() {
  try {
    type AudioCtxCtor = typeof AudioContext
    const AudioCtx: AudioCtxCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: AudioCtxCtor }).webkitAudioContext
    const ctx = new AudioCtx()

    const play = (freq: number, startAt: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startAt)
      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(0.25, startAt + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)
      osc.start(startAt)
      osc.stop(startAt + duration)
    }

    const t = ctx.currentTime
    play(880, t, 0.3)
    play(1320, t + 0.18, 0.35)
  } catch {
    // audio not available (e.g., SSR or blocked)
  }
}

export function useAdminNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNew, setIsNew] = useState(false)
  const newTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await insforge.database
        .from("notifications")
        .select("id")
        .eq("is_read", false)
      setUnreadCount(data?.length ?? 0)
    } catch {
      // ignore
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // Real-time subscription
  useEffect(() => {
    const handleChange = (event: Event) => {
      const payload = (event as CustomEvent<AppDataChangedPayload>).detail
      if (!payload || payload.entity !== "notifications") return

      if (payload.action === "created") {
        playNotificationSound()
        setUnreadCount((c) => c + 1)
        setIsNew(true)
        if (newTimerRef.current) clearTimeout(newTimerRef.current)
        newTimerRef.current = setTimeout(() => setIsNew(false), 4000)
      } else {
        // updated (marked as read) or deleted — re-fetch accurate count
        fetchUnreadCount()
      }
    }

    window.addEventListener(APP_BROWSER_DATA_CHANGED_EVENT, handleChange)
    return () => {
      window.removeEventListener(APP_BROWSER_DATA_CHANGED_EVENT, handleChange)
      if (newTimerRef.current) clearTimeout(newTimerRef.current)
    }
  }, [fetchUnreadCount])

  return { unreadCount, isNew }
}

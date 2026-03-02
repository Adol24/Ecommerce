import { insforge } from "@/lib/insforge"
import {
  APP_BROWSER_DATA_CHANGED_EVENT,
  APP_REALTIME_CHANNEL,
  APP_REALTIME_EVENT,
  type AppDataChangedPayload,
} from "@/lib/app-realtime"

type PublishInput = Omit<AppDataChangedPayload, "at" | "source">

export async function publishAppDataChangedClient(payload: PublishInput): Promise<void> {
  const event: AppDataChangedPayload = {
    ...payload,
    at: new Date().toISOString(),
    source: "client",
  }

  // Immediate same-tab refresh even if websocket publish fails.
  window.dispatchEvent(new CustomEvent(APP_BROWSER_DATA_CHANGED_EVENT, { detail: event }))

  try {
    await insforge.realtime.connect()
    const response = await insforge.realtime.subscribe(APP_REALTIME_CHANNEL)
    if (!response.ok) {
      console.error("[realtime] No se pudo suscribir para publicar:", response.error)
      return
    }
    await insforge.realtime.publish(APP_REALTIME_CHANNEL, APP_REALTIME_EVENT, event)
  } catch (error) {
    console.error("[realtime] No se pudo publicar evento desde cliente:", error)
  }
}

import { createClient } from "@insforge/sdk"
import {
  APP_REALTIME_CHANNEL,
  APP_REALTIME_EVENT,
  type AppDataChangedPayload,
} from "@/lib/app-realtime"

type PublishInput = Omit<AppDataChangedPayload, "at" | "source">

export async function publishAppDataChangedServer(payload: PublishInput): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY

  if (!baseUrl || !anonKey) return

  const client = createClient({ baseUrl, anonKey })

  try {
    await client.realtime.connect()
    await client.realtime.publish(APP_REALTIME_CHANNEL, APP_REALTIME_EVENT, {
      ...payload,
      at: new Date().toISOString(),
      source: "api",
    } satisfies AppDataChangedPayload)
  } catch (error) {
    console.error("[realtime] No se pudo publicar evento desde API:", error)
  } finally {
    client.realtime.disconnect()
  }
}


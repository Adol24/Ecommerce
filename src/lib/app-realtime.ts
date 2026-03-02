export const APP_REALTIME_CHANNEL = "broadcast"
export const APP_REALTIME_EVENT = "app:data_changed"
export const APP_BROWSER_DATA_CHANGED_EVENT = "app:data-changed"

export type AppRealtimeEntity =
  | "products"
  | "categories"
  | "brands"
  | "banners"
  | "users"
  | "orders"
  | "settings"

export type AppRealtimeAction = "created" | "updated" | "deleted"

export interface AppDataChangedPayload {
  entity: AppRealtimeEntity
  action: AppRealtimeAction
  id?: string
  at: string
  source?: "api" | "client"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isEntity(value: unknown): value is AppRealtimeEntity {
  return ["products", "categories", "brands", "banners", "users", "orders", "settings"].includes(
    String(value)
  )
}

function isAction(value: unknown): value is AppRealtimeAction {
  return ["created", "updated", "deleted"].includes(String(value))
}

export function isAppDataChangedPayload(value: unknown): value is AppDataChangedPayload {
  if (!isRecord(value)) return false
  if (!isEntity(value.entity)) return false
  if (!isAction(value.action)) return false
  if (typeof value.at !== "string") return false
  if (value.id !== undefined && typeof value.id !== "string") return false
  if (value.source !== undefined && value.source !== "api" && value.source !== "client") return false
  return true
}

// InsForge SocketMessage is "meta + passthrough"; some integrations also wrap payload under `payload`.
export function extractAppDataChangedPayload(message: unknown): AppDataChangedPayload | null {
  if (!isRecord(message)) return null

  if (isAppDataChangedPayload(message)) {
    return message
  }

  const nested = isRecord(message.payload) ? message.payload : null
  if (nested && isAppDataChangedPayload(nested)) {
    return nested
  }

  return null
}

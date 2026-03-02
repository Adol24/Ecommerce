import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedServer } from "@/lib/realtime-publish-server"
import {
  APP_SETTINGS_ROW_ID,
  normalizeStoreSettings,
} from "@/lib/store-settings"

export const runtime = "nodejs"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("app_settings")
      .select("*")
      .eq("id", APP_SETTINGS_ROW_ID)
      .single()

    if (error || !data) {
      return NextResponse.json({
        settings: normalizeStoreSettings(null),
        updatedAt: null,
        source: "defaults",
      })
    }

    const row = data as Record<string, unknown>
    return NextResponse.json({
      settings: normalizeStoreSettings(row.settings),
      updatedAt: (row.updated_at as string | null | undefined) ?? null,
      source: "database",
    })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const payload =
      isRecord(body) && "settings" in body
        ? (body as Record<string, unknown>).settings
        : body

    const settings = normalizeStoreSettings(payload)

    const { data, error } = await insforge.database
      .from("app_settings")
      .upsert([{ id: APP_SETTINGS_ROW_ID, settings }], { onConflict: "id" })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await publishAppDataChangedServer({
      entity: "settings",
      action: "updated",
      id: APP_SETTINGS_ROW_ID,
    })

    const row = data as Record<string, unknown>
    return NextResponse.json({
      settings: normalizeStoreSettings(row.settings),
      updatedAt: (row.updated_at as string | null | undefined) ?? null,
      source: "database",
    })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedServer } from "@/lib/realtime-publish-server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("brands")
      .select("*")
      .order("name")

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.cookies.get("user_role")?.value
    if (userRole !== "ADMIN" && userRole !== "MODERATOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, logo } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Nombre y slug son requeridos" }, { status: 400 })
    }

    const { data, error } = await insforge.database
      .from("brands")
      .insert([{ name, slug, logo: logo || null }])
      .select()
      .single()

    if (error) {
      if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
        return NextResponse.json({ error: "Ya existe una marca con ese slug" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await publishAppDataChangedServer({
      entity: "brands",
      action: "created",
      id: String((data as Record<string, unknown>)?.id ?? ""),
    })

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

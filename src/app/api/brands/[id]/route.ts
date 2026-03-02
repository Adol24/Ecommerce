import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedServer } from "@/lib/realtime-publish-server"

export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userRole = request.cookies.get("user_role")?.value
    if (userRole !== "ADMIN" && userRole !== "MODERATOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, logo } = body

    if (!name || !slug) return NextResponse.json({ error: "Nombre y slug son requeridos" }, { status: 400 })

    const { data, error } = await insforge.database
      .from("brands")
      .update({ name, slug, logo: logo || null })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
        return NextResponse.json({ error: "Ya existe una marca con ese slug" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await publishAppDataChangedServer({ entity: "brands", action: "updated", id })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userRole = req.cookies.get("user_role")?.value
    if (userRole !== "ADMIN" && userRole !== "MODERATOR") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { error } = await insforge.database
      .from("brands")
      .delete()
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await publishAppDataChangedServer({ entity: "brands", action: "deleted", id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

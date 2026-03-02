import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedServer } from "@/lib/realtime-publish-server"

export const runtime = "nodejs"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { role, status, name, phone } = body

    const updates: Record<string, unknown> = {}
    if (role !== undefined) updates.role = role.toUpperCase()
    if (status !== undefined) updates.status = status.toUpperCase()
    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const { data, error } = await insforge.database
      .from("user_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await publishAppDataChangedServer({
      entity: "users",
      action: "updated",
      id,
    })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await insforge.database
      .from("user_profiles")
      .delete()
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await publishAppDataChangedServer({
      entity: "users",
      action: "deleted",
      id,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

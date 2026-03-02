import { NextRequest, NextResponse } from "next/server"
import { createRequestInsforgeClient, getAuthenticatedUserFromRequest } from "../_lib"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = getAuthenticatedUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { id } = await context.params
    const body = (await request.json()) as {
      label?: string
      name?: string
      phone?: string
      address?: string
      city?: string
      state?: string
      zipCode?: string
      isDefault?: boolean
    }

    const requiredFields = [
      ["label", body.label],
      ["name", body.name],
      ["phone", body.phone],
      ["address", body.address],
      ["city", body.city],
      ["state", body.state],
      ["zipCode", body.zipCode],
    ] as const

    const missing = requiredFields.find(([, value]) => !value || !String(value).trim())
    if (missing) {
      return NextResponse.json({ error: `Campo requerido: ${missing[0]}` }, { status: 400 })
    }

    const client = createRequestInsforgeClient(auth.accessToken)

    if (body.isDefault) {
      const { error: resetError } = await client.database
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", auth.userId)

      if (resetError) {
        return NextResponse.json({ error: resetError.message }, { status: 500 })
      }
    }

    const { data, error } = await client.database
      .from("addresses")
      .update({
        label: body.label!.trim(),
        name: body.name!.trim(),
        phone: body.phone!.trim(),
        address: body.address!.trim(),
        city: body.city!.trim(),
        state: body.state!.trim(),
        zip_code: body.zipCode!.trim(),
        is_default: Boolean(body.isDefault),
      })
      .eq("id", id)
      .eq("user_id", auth.userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = getAuthenticatedUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { id } = await context.params
    const client = createRequestInsforgeClient(auth.accessToken)

    const { error } = await client.database
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}


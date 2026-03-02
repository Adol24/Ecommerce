import { NextRequest, NextResponse } from "next/server"
import { createRequestInsforgeClient, getAuthenticatedUserFromRequest } from "./_lib"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthenticatedUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const client = createRequestInsforgeClient(auth.accessToken)
    const { data, error } = await client.database
      .from("addresses")
      .select("*")
      .eq("user_id", auth.userId)
      .order("is_default", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthenticatedUserFromRequest(request)
    if (!auth) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

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
      .insert([{
        user_id: auth.userId,
        label: body.label!.trim(),
        name: body.name!.trim(),
        phone: body.phone!.trim(),
        address: body.address!.trim(),
        city: body.city!.trim(),
        state: body.state!.trim(),
        zip_code: body.zipCode!.trim(),
        is_default: Boolean(body.isDefault),
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}


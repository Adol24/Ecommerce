import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@insforge/sdk"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedServer } from "@/lib/realtime-publish-server"

export const runtime = "nodejs"

function getRequestAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }

  return request.cookies.get("insforge_access_token")?.value ?? null
}

function createRequestInsforgeClient(accessToken?: string) {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    ...(accessToken ? { edgeFunctionToken: accessToken } : {}),
  })
}

type AuthUsersListResponse = {
  data?: Array<{
    id: string
    email: string
  }>
}

async function findCreatedAuthUserIdByEmail(accessToken: string, email: string): Promise<string | null> {
  const adminClient = createRequestInsforgeClient(accessToken)
  const http = adminClient.getHttpClient()
  const normalizedEmail = email.trim().toLowerCase()

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await http.get<AuthUsersListResponse>("/api/auth/users", {
        params: {
          search: email,
          limit: "10",
          offset: "0",
        },
      })

      const match = (response.data ?? []).find((user) => user.email.trim().toLowerCase() === normalizedEmail)
      if (match?.id) return match.id
    } catch {
      // Ignore transient errors and retry a couple of times right after sign up.
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }

  return null
}

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.cookies.get("user_role")?.value
    const isAdmin = userRole === "ADMIN" || userRole === "MODERATOR"
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const accessToken = getRequestAccessToken(request)
    if (!accessToken) {
      return NextResponse.json({ error: "Sesion expirada. Inicia sesion nuevamente" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, phone, role } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 })
    }

    // Crear usuario en el sistema de auth de InsForge
    // Use a per-request client to avoid mutating shared auth state in the server process.
    const authClient = createRequestInsforgeClient()
    const { data: authData, error: authError } = await authClient.auth.signUp({
      email,
      password,
      name,
    })

    if (authError) {
      if (authError.message?.toLowerCase().includes("already") || authError.message?.toLowerCase().includes("exist")) {
        return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message || "Error al crear usuario" }, { status: 500 })
    }

    const createdAuthUserId =
      authData?.user?.id ??
      await findCreatedAuthUserIdByEmail(accessToken, email)

    if (!createdAuthUserId) {
      return NextResponse.json({ error: "No se pudo obtener el ID del usuario creado" }, { status: 500 })
    }

    // Crear o actualizar el perfil con el rol deseado
    const adminClient = createRequestInsforgeClient(accessToken)
    const { data: profile, error: profileError } = await adminClient.database
      .from("user_profiles")
      .upsert([{
        auth_user_id: createdAuthUserId,
        email,
        name,
        phone: phone || null,
        role: role?.toUpperCase() || "CUSTOMER",
        status: "ACTIVE",
      }], { onConflict: "auth_user_id" })
      .select()
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    await publishAppDataChangedServer({
      entity: "users",
      action: "created",
      id: String((profile as Record<string, unknown>)?.id ?? ""),
    })

    return NextResponse.json(profile, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

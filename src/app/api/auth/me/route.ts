import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"

export const runtime = "nodejs"

// GET - obtiene el rol del usuario autenticado desde la DB y lo guarda en cookie
export async function GET(request: NextRequest) {
  // Leer token del header Authorization primero (Bearer <token>)
  const authHeader = request.headers.get("authorization")
  const accessToken =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!accessToken) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    // Parsear el JWT para obtener el user_id directamente
    const jwtParts = accessToken.split(".")
    if (jwtParts.length !== 3) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const jwtPayload = JSON.parse(
      Buffer.from(jwtParts[1], "base64").toString("utf-8")
    )

    const userId = jwtPayload.sub ?? jwtPayload.user_id ?? jwtPayload.id

    if (!userId) {
      return NextResponse.json({ error: "Token sin user_id" }, { status: 401 })
    }

    // Usar el cliente con anonKey (puede leer user_profiles sin restricción de RLS de usuario)
    const { data: profile, error: dbError } = await insforge.database
      .from("user_profiles")
      .select("role")
      .eq("auth_user_id", userId)
      .single()

    const role = !dbError && profile?.role ? profile.role : "CUSTOMER"

    const response = NextResponse.json({ role })

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }

    response.cookies.set("insforge_access_token", accessToken, cookieOpts)
    response.cookies.set("user_role", role, cookieOpts)

    return response
  } catch (err) {
    console.error("[/api/auth/me] unexpected error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// DELETE - limpia las cookies al cerrar sesión
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  const clear = { httpOnly: true, maxAge: 0, path: "/" }
  response.cookies.set("insforge_access_token", "", clear)
  response.cookies.set("user_role", "", clear)
  return response
}

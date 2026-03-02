import { createClient } from "@insforge/sdk"
import type { NextRequest } from "next/server"

export function getRequestAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }

  return request.cookies.get("insforge_access_token")?.value ?? null
}

export function createRequestInsforgeClient(accessToken?: string) {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    ...(accessToken ? { edgeFunctionToken: accessToken } : {}),
  })
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const json = Buffer.from(padded, "base64").toString("utf-8")
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getAuthenticatedUserFromRequest(request: NextRequest): { accessToken: string; userId: string } | null {
  const accessToken = getRequestAccessToken(request)
  if (!accessToken) return null

  const payload = decodeJwtPayload(accessToken)
  const userId = (payload?.sub ?? payload?.user_id ?? payload?.id) as string | undefined
  if (!userId) return null

  return { accessToken, userId }
}


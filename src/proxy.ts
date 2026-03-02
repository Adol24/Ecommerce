import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/profile", "/checkout"]
const adminRoutes = ["/admin"]
const guestRoutes = ["/login", "/register"]

function hasSession(request: NextRequest): boolean {
  const refreshToken = request.cookies.get("insforge_refresh_token")
  const accessToken = request.cookies.get("insforge_access_token")
  return !!(refreshToken || accessToken)
}

function getUserRoleFromCookie(request: NextRequest): string | null {
  const roleCookie = request.cookies.get("user_role")
  if (roleCookie?.value) return roleCookie.value

  const accessToken = request.cookies.get("insforge_access_token")
  if (!accessToken) return null

  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.value.split(".")[1], "base64").toString()
    )
    return payload.role || null
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request
  const isLoggedIn = hasSession(request)
  const userRole = getUserRoleFromCookie(request)

  const isProtectedRoute = protectedRoutes.some((r) =>
    nextUrl.pathname.startsWith(r)
  )
  const isAdminRoute = adminRoutes.some((r) => nextUrl.pathname.startsWith(r))
  const isGuestRoute = guestRoutes.some((r) => nextUrl.pathname.startsWith(r))

  // Rutas protegidas generales — requieren sesión
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set(
      "callbackUrl",
      `${nextUrl.pathname}${nextUrl.search}`
    )
    return NextResponse.redirect(loginUrl)
  }

  // /admin — requiere rol ADMIN o MODERATOR
  if (isAdminRoute) {
    const isAdmin = userRole === "ADMIN" || userRole === "MODERATOR"
    if (!isLoggedIn || !isAdmin) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }
  }

  // Rutas de invitado — bloquear si ya hay sesión confirmada
  const hasConfirmedRole = !!request.cookies.get("user_role")?.value
  if (isGuestRoute && isLoggedIn && hasConfirmedRole) {
    if (userRole === "ADMIN" || userRole === "MODERATOR") {
      return NextResponse.redirect(new URL("/admin", nextUrl))
    }
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

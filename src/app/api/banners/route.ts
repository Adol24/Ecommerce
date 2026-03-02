import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedServer } from "@/lib/realtime-publish-server"

export const runtime = "nodejs"

function parseOptionalDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeOptionalDateInput(value: unknown): { value: string | null; error?: string } {
  if (value === null || value === undefined || value === "") return { value: null }
  if (typeof value !== "string") return { value: null, error: "Fecha invalida" }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { value: null, error: "Fecha invalida" }
  return { value: date.toISOString() }
}

function isBannerLiveNow(banner: Record<string, unknown>, now: Date): boolean {
  const startAt = parseOptionalDate(banner.start_at)
  const endAt = parseOptionalDate(banner.end_at)
  if (startAt && startAt.getTime() > now.getTime()) return false
  if (endAt && endAt.getTime() < now.getTime()) return false
  return true
}

function mapBanner(banner: Record<string, unknown>) {
  return {
    id: banner.id,
    badge: (banner.badge as string) ?? "",
    title: (banner.title as string) ?? "",
    subtitle: (banner.subtitle as string) ?? "",
    description: (banner.description as string) ?? "",
    ctaText: (banner.cta_text as string) ?? "Ver ahora",
    ctaHref: (banner.cta_href as string) ?? "/products",
    secondaryCtaText: (banner.secondary_cta_text as string) ?? "Ver Todo",
    secondaryCtaHref: (banner.secondary_cta_href as string) ?? "/products",
    gradient: (banner.gradient as string) ?? "from-slate-900 via-slate-800 to-slate-900",
    imageUrl: (banner.image_url as string) ?? "",
    priority: Number(banner.priority) || 0,
    sortOrder: Number(banner.sort_order) || 0,
    isActive: (banner.is_active as boolean | null | undefined) ?? true,
    startAt: (banner.start_at as string | null | undefined) ?? null,
    endAt: (banner.end_at as string | null | undefined) ?? null,
    createdAt: banner.created_at,
    updatedAt: banner.updated_at,
  }
}

export async function GET(request: NextRequest) {
  try {
    const active = request.nextUrl.searchParams.get("active")
    const limitParam = request.nextUrl.searchParams.get("limit")
    const limit = limitParam ? Number(limitParam) : null

    let query = insforge.database
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (active === "true") {
      query = query.eq("is_active", true)
    }

    const shouldApplyDbLimit = active !== "true" && Number.isFinite(limit) && (limit as number) > 0
    if (shouldApplyDbLimit) {
      query = query.limit(limit as number)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let rows = (data ?? []) as Record<string, unknown>[]

    if (active === "true") {
      const now = new Date()
      rows = rows.filter((row) => isBannerLiveNow(row, now))
    }

    rows = rows.sort((a, b) => {
      const priorityDiff = (Number(b.priority) || 0) - (Number(a.priority) || 0)
      if (priorityDiff !== 0) return priorityDiff
      const sortDiff = (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
      if (sortDiff !== 0) return sortDiff
      const aCreated = new Date(String(a.created_at ?? 0)).getTime()
      const bCreated = new Date(String(b.created_at ?? 0)).getTime()
      return bCreated - aCreated
    })

    let mapped = rows.map((row) => mapBanner(row))
    if (Number.isFinite(limit) && (limit as number) > 0) {
      mapped = mapped.slice(0, limit as number)
    }

    return NextResponse.json(mapped)
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
    const {
      badge, title, subtitle, description, ctaText, ctaHref,
      secondaryCtaText, secondaryCtaHref, gradient, imageUrl,
      priority, sortOrder, isActive, startAt, endAt,
    } = body

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Titulo e imagen son requeridos" }, { status: 400 })
    }

    const normalizedStart = normalizeOptionalDateInput(startAt)
    const normalizedEnd = normalizeOptionalDateInput(endAt)
    if (normalizedStart.error) return NextResponse.json({ error: "Fecha de inicio invalida" }, { status: 400 })
    if (normalizedEnd.error) return NextResponse.json({ error: "Fecha de fin invalida" }, { status: 400 })
    if (normalizedStart.value && normalizedEnd.value) {
      if (new Date(normalizedEnd.value) < new Date(normalizedStart.value)) {
        return NextResponse.json({ error: "La fecha de fin no puede ser menor a la fecha de inicio" }, { status: 400 })
      }
    }

    const { data, error } = await insforge.database
      .from("banners")
      .insert([{
        badge: badge || null,
        title,
        subtitle: subtitle || null,
        description: description || null,
        cta_text: ctaText || "Ver ahora",
        cta_href: ctaHref || "/products",
        secondary_cta_text: secondaryCtaText || "Ver Todo",
        secondary_cta_href: secondaryCtaHref || "/products",
        gradient: gradient || "from-slate-900 via-slate-800 to-slate-900",
        image_url: imageUrl,
        priority: Number(priority) || 0,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive ?? true,
        start_at: normalizedStart.value,
        end_at: normalizedEnd.value,
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await publishAppDataChangedServer({
      entity: "banners",
      action: "created",
      id: String((data as Record<string, unknown>)?.id ?? ""),
    })

    return NextResponse.json(mapBanner(data as Record<string, unknown>), { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

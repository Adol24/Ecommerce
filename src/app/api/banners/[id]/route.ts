import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedServer } from "@/lib/realtime-publish-server"

export const runtime = "nodejs"

function normalizeOptionalDateInput(value: unknown): { value: string | null; error?: string } {
  if (value === null || value === undefined || value === "") return { value: null }
  if (typeof value !== "string") return { value: null, error: "Fecha invalida" }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { value: null, error: "Fecha invalida" }
  return { value: date.toISOString() }
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await insforge.database
      .from("banners")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return NextResponse.json({ error: "Banner no encontrado" }, { status: 404 })
    return NextResponse.json(mapBanner(data as Record<string, unknown>))
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    if (!title || !imageUrl) return NextResponse.json({ error: "Titulo e imagen son requeridos" }, { status: 400 })

    const normalizedStart = normalizeOptionalDateInput(startAt)
    const normalizedEnd = normalizeOptionalDateInput(endAt)
    if (normalizedStart.error) return NextResponse.json({ error: "Fecha de inicio invalida" }, { status: 400 })
    if (normalizedEnd.error) return NextResponse.json({ error: "Fecha de fin invalida" }, { status: 400 })
    if (normalizedStart.value && normalizedEnd.value) {
      if (new Date(normalizedEnd.value) < new Date(normalizedStart.value)) {
        return NextResponse.json({ error: "La fecha de fin no puede ser menor a la de inicio" }, { status: 400 })
      }
    }

    const { data, error } = await insforge.database
      .from("banners")
      .update({
        badge: badge || null, title,
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
      })
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await publishAppDataChangedServer({ entity: "banners", action: "updated", id })
    return NextResponse.json(mapBanner(data as Record<string, unknown>))
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
      .from("banners")
      .delete()
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await publishAppDataChangedServer({ entity: "banners", action: "deleted", id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

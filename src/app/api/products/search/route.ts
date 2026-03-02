import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? ""
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") ?? "6"), 10)

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const { data, error } = await insforge.database
      .from("products")
      .select("id, name, slug, price, images, category:categories(name,slug), brand:brands(name)")
      .ilike("name", `%${q}%`)
      .eq("is_active", true)
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const results = (data ?? []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      name: p.name as string,
      slug: p.slug as string,
      price: Number(p.price) || 0,
      image: ((p.images as string[]) ?? [])[0] ?? "",
      category: (p.category as Record<string, unknown>)?.name as string ?? "",
      brand: (p.brand as Record<string, unknown>)?.name as string ?? "",
    }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

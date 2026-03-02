import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedServer } from "@/lib/realtime-publish-server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("products")
      .select("*, category:categories(id,name,slug), brand:brands(id,name,slug)")
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const products = (data ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price) || 0,
      originalPrice: p.compare_price ? Number(p.compare_price) : undefined,
      cost: Number(p.cost) || 0,
      stock: Number(p.stock) || 0,
      images: (p.images as string[]) || [],
      isNew: p.is_new ?? false,
      isFeatured: p.is_featured ?? false,
      isActive: p.is_active ?? true,
      rating: Number(p.rating) || 0,
      categoryId: p.category_id,
      brandId: p.brand_id,
      category: (p.category as Record<string, unknown>)?.slug ?? "",
      categoryName: (p.category as Record<string, unknown>)?.name ?? "",
      brand: (p.brand as Record<string, unknown>)?.name ?? "",
      brandSlug: (p.brand as Record<string, unknown>)?.slug ?? "",
    }))

    return NextResponse.json({ products })
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
    const { name, slug, description, price, comparePrice, cost, stock, categoryId, brandId, images, isNew, isFeatured, rating } = body

    if (!name || !slug || !price || !categoryId || !brandId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const { data, error } = await insforge.database
      .from("products")
      .insert([{
        name,
        slug,
        description: description || "",
        price,
        compare_price: comparePrice || null,
        cost: cost || 0,
        stock: stock || 0,
        images: images || [],
        specs: {},
        is_new: isNew ?? false,
        is_featured: isFeatured ?? false,
        is_active: true,
        rating: typeof rating === "number" ? rating : 0,
        category_id: categoryId,
        brand_id: brandId,
      }])
      .select()
      .single()

    if (error) {
      if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
        return NextResponse.json({ error: "Ya existe un producto con ese slug" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await publishAppDataChangedServer({
      entity: "products",
      action: "created",
      id: String((data as Record<string, unknown>)?.id ?? ""),
    })

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

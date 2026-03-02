import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedServer } from "@/lib/realtime-publish-server"

export const runtime = "nodejs"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const lookupValue = decodeURIComponent(id)

    const baseSelect = "*, category:categories(id,name,slug), brand:brands(id,name,slug)"

    const byId = await insforge.database
      .from("products")
      .select(baseSelect)
      .eq("id", lookupValue)
      .single()

    let data = byId.data
    let error = byId.error

    if (error || !data) {
      const bySlug = await insforge.database
        .from("products")
        .select(baseSelect)
        .eq("slug", lookupValue)
        .single()
      data = bySlug.data
      error = bySlug.error
    }

    if (error || !data) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })

    const p = data as Record<string, unknown>
    return NextResponse.json({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price) || 0,
      originalPrice: p.compare_price ? Number(p.compare_price) : undefined,
      comparePrice: p.compare_price ? Number(p.compare_price) : undefined,
      cost: Number(p.cost) || 0,
      stock: Number(p.stock) || 0,
      images: (p.images as string[]) || [],
      specs: (p.specs as Record<string, string>) || {},
      isNew: p.is_new ?? false,
      isFeatured: p.is_featured ?? false,
      isActive: p.is_active ?? true,
      rating: Number(p.rating) || 0,
      categoryId: p.category_id,
      brandId: p.brand_id,
      category: (p.category as Record<string, unknown>)?.slug ?? "",
      brand: (p.brand as Record<string, unknown>)?.name ?? "",
    })
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
    const { name, slug, description, price, comparePrice, cost, stock, categoryId, brandId, images, isNew, isFeatured, isActive, rating } = body

    if (!name || !slug || !price || !categoryId || !brandId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const { data, error } = await insforge.database
      .from("products")
      .update({
        name, slug,
        description: description || "",
        price,
        compare_price: comparePrice || null,
        cost: cost || 0,
        stock: stock || 0,
        images: images || [],
        is_new: isNew ?? false,
        is_featured: isFeatured ?? false,
        is_active: isActive ?? true,
        rating: typeof rating === "number" ? rating : 0,
        category_id: categoryId,
        brand_id: brandId,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
        return NextResponse.json({ error: "Ya existe un producto con ese slug" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await publishAppDataChangedServer({ entity: "products", action: "updated", id })
    return NextResponse.json(data)
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
      .from("products")
      .delete()
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await publishAppDataChangedServer({ entity: "products", action: "deleted", id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

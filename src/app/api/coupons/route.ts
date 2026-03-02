import { NextRequest, NextResponse } from "next/server"
import { insforge } from "@/lib/insforge"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code) {
      return NextResponse.json({ error: "Código de cupón requerido" }, { status: 400 })
    }

    const { data: coupon, error } = await insforge.database
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: "Cupón no válido o expirado" }, { status: 400 })
    }

    const now = new Date()
    
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json({ error: "El cupón aún no está activo" }, { status: 400 })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json({ error: "El cupón ha expirado" }, { status: 400 })
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({ error: "El cupón ha alcanzado su límite de usos" }, { status: 400 })
    }

    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return NextResponse.json({ 
        error: `Monto mínimo de compra: $${coupon.min_order_amount}`,
        minAmount: coupon.min_order_amount
      }, { status: 400 })
    }

    let discount = 0
    if (coupon.discount_type === "percentage") {
      discount = (subtotal * coupon.discount_value) / 100
    } else {
      discount = coupon.discount_value
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discount: Math.min(discount, subtotal),
    })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: "Código requerido" }, { status: 400 })
    }

    const { data: coupon } = await insforge.database
      .from("coupons")
      .select("current_uses")
      .eq("code", code.toUpperCase())
      .single()

    if (!coupon) {
      return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 })
    }

    const { error } = await insforge.database
      .from("coupons")
      .update({ current_uses: (coupon.current_uses || 0) + 1 })
      .eq("code", code.toUpperCase())

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

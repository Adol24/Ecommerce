"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart, ArrowRight, Heart } from "lucide-react"
import { FashionCountdown } from "../shared/FashionCountdown"
import { saleFashionProducts, featuredFashionProducts } from "@/data/mock-fashion"
import { useCartStore } from "@/stores/cart-store"

const TRENDING_END = new Date(Date.now() + 10 * 60 * 60 * 1000 + 22 * 60 * 1000 + 43 * 1000)

export function FashionTrendingFlash() {
  const addToCart = useCartStore((s) => s.addItem)
  const products = [...saleFashionProducts, ...featuredFashionProducts].slice(0, 5)

  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
        {/* Encabezado con timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#e84562" }}>
              Top Ventas
            </p>
            <h2 className="text-2xl font-black text-gray-900 md:text-3xl">Venta Flash Tendencia</h2>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <FashionCountdown endDate={TRENDING_END} className="flex items-center gap-2" />
            <Link href="/productos?oferta=true">
              <button
                className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors hover:text-white hover:bg-[#e84562]"
                style={{ borderColor: "#e84562", color: "#e84562" }}
              >
                Ver toda la colección <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>
        </div>

        {/* Grid de 5 productos — el último con fondo rosa */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product, i) => {
            const isHighlighted = i === products.length - 1
            const discount =
              product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null

            return (
              <Link key={product.id} href={`/productos/${product.slug}`} className="group block">
                <div
                  className="relative overflow-hidden rounded-lg transition-shadow hover:shadow-md"
                  style={{
                    border: isHighlighted ? "2px solid #e84562" : "1px solid #f0f0f0",
                    background: isHighlighted ? "#fff0f3" : "#fff",
                  }}
                >
                  {/* Imagen */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width:640px) 50vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {discount && (
                      <span
                        className="absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
                        style={{ background: "#e84562" }}
                      >
                        -{discount}%
                      </span>
                    )}
                    {isHighlighted && (
                      <div className="absolute inset-0 bg-[#e84562]/10" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-2.5">
                    <p className="mb-1 text-xs font-bold" style={{ color: "#e84562" }}>
                      ${product.price.toLocaleString("es-MX")}
                      {product.originalPrice && (
                        <span className="ml-1 text-gray-400 line-through font-normal">
                          ${product.originalPrice.toLocaleString("es-MX")}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-700 font-medium line-clamp-2 leading-snug mb-1.5">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className="h-2.5 w-2.5"
                          style={{
                            fill: si < Math.floor(product.rating) ? "#fbbf24" : "#e5e7eb",
                            color: si < Math.floor(product.rating) ? "#fbbf24" : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Botón carrito en hover */}
                  <button
                    onClick={(e) => { e.preventDefault(); addToCart(product, 1) }}
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "#e84562" }}
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Agregar
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

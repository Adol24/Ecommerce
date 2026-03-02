"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FashionProductCard } from "../products/FashionProductCard"
import {
  featuredFashionProducts,
  bestSellerFashionProducts,
  newArrivalFashionProducts,
  saleFashionProducts,
} from "@/data/mock-fashion"
import { cn } from "@/lib/utils"

const TABS = [
  { value: "destacados", label: "Destacados", color: "#e84562", products: featuredFashionProducts },
  { value: "mas-vendidos", label: "Más Vendidos", color: "#f5884a", products: bestSellerFashionProducts },
  { value: "nuevos", label: "Mejor Calificados", color: "#10b981", products: newArrivalFashionProducts },
  { value: "ofertas", label: "En Oferta", color: "#8b5cf6", products: saleFashionProducts },
]

export function FashionTopSelling() {
  const [active, setActive] = useState("destacados")
  const activeTab = TABS.find((t) => t.value === active)!

  return (
    <section className="py-12" style={{ background: "#f9f9f9" }}>
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
        {/* Encabezado */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#e84562" }}>
              Más Vendidos
            </p>
            <h2 className="text-2xl font-black text-gray-900 md:text-3xl">
              Categorías Más Vendidas Esta Semana
            </h2>
          </div>
        </div>

        {/* Contenedor blanco con borde */}
        <div className="rounded-xl bg-white p-6" style={{ border: "1px solid #efefef" }}>
          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = active === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setActive(tab.value)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold transition-all border",
                    isActive ? "text-white shadow-md" : "bg-white text-gray-600 hover:text-gray-900"
                  )}
                  style={
                    isActive
                      ? { background: tab.color, borderColor: tab.color }
                      : { borderColor: "#e5e7eb" }
                  }
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Grid de productos — 2 filas */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {activeTab.products.slice(0, 10).map((p) => (
              <FashionProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

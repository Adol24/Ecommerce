"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  HardDrive,
  Cpu,
  Gamepad2,
  Package,
  Smartphone,
  Camera,
  Shirt,
  Home,
  Dumbbell,
  Sparkles,
  Baby,
  BookOpen,
} from "lucide-react"
import { useProductsStore } from "@/stores/products-store"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppRealtimeRefresh } from "@/hooks/useAppRealtimeRefresh"

// Colors and icons per category slug or fallback
const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  computadoras: { icon: Monitor, color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  monitores: { icon: Monitor, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400" },
  teclados: { icon: Keyboard, color: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400" },
  mouse: { icon: Mouse, color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
  audifonos: { icon: Headphones, color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
  componentes: { icon: Cpu, color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
  almacenamiento: { icon: HardDrive, color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  gaming: { icon: Gamepad2, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
  smartphones: { icon: Smartphone, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
  camaras: { icon: Camera, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
  moda: { icon: Shirt, color: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
  hogar: { icon: Home, color: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  deportes: { icon: Dumbbell, color: "bg-lime-100 text-lime-600 dark:bg-lime-950 dark:text-lime-400" },
  belleza: { icon: Sparkles, color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950 dark:text-fuchsia-400" },
  juguetes: { icon: Baby, color: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400" },
  libros: { icon: BookOpen, color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
}

const fallbackColor = "bg-muted text-muted-foreground"

export function CategoryGrid() {
  const { categories, fetchCategories } = useProductsStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useAppRealtimeRefresh(["categories"], fetchCategories)

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-lg font-bold sm:text-xl">Explorar Categorías</h2>
        <div
          className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-6 sm:overflow-visible sm:pb-0 lg:grid-cols-8 xl:grid-cols-10"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {categories.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex min-w-[70px] flex-col items-center gap-2 sm:min-w-0"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))
            : categories.map((category) => {
                const config = categoryConfig[category.slug] ?? { icon: Package, color: fallbackColor }
                const Icon = config.icon
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group flex min-w-[70px] flex-col items-center gap-2 sm:min-w-0"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${config.color}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-center text-[11px] font-medium leading-tight text-foreground/80 group-hover:text-primary">
                      {category.name}
                    </span>
                  </Link>
                )
              })}
        </div>
      </div>
    </section>
  )
}

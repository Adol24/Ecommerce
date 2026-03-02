"use client"

import * as React from "react"
import { Quote, Star } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

const testimonials = [
  {
    id: "1",
    name: "Carlos M.",
    city: "Monterrey",
    rating: 5,
    comment:
      "Excelente servicio. Mi laptop llego rapido, bien protegida y exactamente como la describian.",
  },
  {
    id: "2",
    name: "Andrea R.",
    city: "CDMX",
    rating: 5,
    comment:
      "Compre un monitor para trabajo y gaming. Muy buena atencion y el proceso de compra fue facil.",
  },
  {
    id: "3",
    name: "Luis P.",
    city: "Guadalajara",
    rating: 4,
    comment:
      "Buenos precios y envio puntual. Solo me gustaria ver mas opciones de filtros en algunos productos.",
  },
  {
    id: "4",
    name: "Fernanda T.",
    city: "Puebla",
    rating: 5,
    comment:
      "La tienda se ve profesional y el soporte respondio rapido cuando tuve dudas sobre compatibilidad.",
  },
  {
    id: "5",
    name: "Jorge S.",
    city: "Tijuana",
    rating: 5,
    comment:
      "Muy recomendable. Pedi perifericos y llegaron antes de lo esperado. Todo original y en perfecto estado.",
  },
]

export function BrandSection() {
  const plugin = React.useRef(Autoplay({ delay: 2500, stopOnInteraction: false }))
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "start", containScroll: false },
    [plugin.current]
  )

  const displayTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="border-t py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold sm:text-2xl">Comentarios de Clientes</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Opiniones reales de clientes que compraron en BasicTechShop
          </p>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {displayTestimonials.map((item, i) => (
              <div
                key={`${item.id}-${i}`}
                className="min-w-[280px] rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 sm:min-w-[340px] md:min-w-[380px]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={`${item.id}-star-${starIndex}`}
                        className={`h-4 w-4 ${starIndex < item.rating ? "fill-current" : "text-muted-foreground/40"}`}
                      />
                    ))}
                  </div>
                  <Quote className="h-4 w-4 text-primary/70" />
                </div>

                <p className="text-sm leading-6 text-foreground/90">
                  &ldquo;{item.comment}&rdquo;
                </p>

                <div className="mt-4 border-t pt-3">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

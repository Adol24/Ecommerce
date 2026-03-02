import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { FashionProductCard } from "../products/FashionProductCard"
import { featuredFashionProducts, newArrivalFashionProducts } from "@/data/mock-fashion"

interface PromoCardProps {
  title: string
  subtitle: string
  href: string
  image: string
}

function PromoCard({ title, subtitle, href, image }: PromoCardProps) {
  return (
    <div
      className="relative flex flex-col justify-end overflow-hidden rounded-lg h-full min-h-[280px]"
      style={{ background: "linear-gradient(135deg, #e84562 0%, #f5884a 100%)" }}
    >
      {/* Imagen del modelo — posicionada arriba a la derecha */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="260px"
          className="object-cover object-top opacity-40 mix-blend-multiply"
        />
      </div>
      {/* Overlay decorativo */}
      <div className="absolute top-3 right-3 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/10" />

      {/* Texto */}
      <div className="relative z-10 p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">
          {subtitle}
        </p>
        <h3 className="text-[15px] font-black text-white leading-tight mb-4">
          {title}
        </h3>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold transition-opacity hover:opacity-90"
          style={{ color: "#e84562" }}
        >
          Comprar Ahora <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

export function FashionFeaturedCollection() {
  const row1 = featuredFashionProducts.slice(0, 4)
  const row2 = newArrivalFashionProducts.slice(0, 4)

  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
        {/* Encabezado */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#e84562" }}>
              Colección Destacada
            </p>
            <h2 className="text-2xl font-black text-gray-900 md:text-3xl">Compra Cada Día</h2>
          </div>
          <Link
            href="/productos"
            className="flex items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#e84562] hover:text-[#e84562] transition-colors"
            style={{ borderColor: "#e84562" }}
          >
            Ver Colección <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Fila 1 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-4">
          <div className="hidden lg:block">
            <PromoCard
              title="Tendencia Solo Este Fin de Semana"
              subtitle="Oferta Especial"
              href="/productos?oferta=true"
              image="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=600&fit=crop"
            />
          </div>
          {row1.map((p) => (
            <FashionProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Fila 2 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="hidden lg:block">
            <PromoCard
              title="Estilo Cómodo Para el Día a Día"
              subtitle="Nuevos Básicos"
              href="/productos?coleccion=basicos"
              image="https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=600&fit=crop"
            />
          </div>
          {row2.map((p) => (
            <FashionProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

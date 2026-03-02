import { Star } from "lucide-react"
import { fashionReviews } from "@/data/mock-fashion"

export function FashionReviews() {
  return (
    <section className="py-12" style={{ background: "#f9f9f9" }}>
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
        {/* Encabezado */}
        <div className="mb-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#e84562" }}>
            Opinión de Clientes
          </p>
          <h2 className="text-2xl font-black text-gray-900 md:text-3xl">Reseñas de Productos</h2>
          <p className="mt-1.5 text-sm text-gray-400">Lo que dicen nuestros clientes sobre nuestros productos</p>
        </div>

        {/* Estrellas totales */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm font-semibold text-gray-600">4.8 / 5</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fashionReviews.map((review) => (
            <div
              key={review.id}
              className="relative rounded-xl bg-white p-5 flex flex-col gap-3"
              style={{ border: "1px solid #efefef" }}
            >
              {/* Comillas decorativas */}
              <div
                className="absolute right-4 bottom-4 text-5xl font-black leading-none select-none"
                style={{ color: "#fde8ec" }}
              >
                "
              </div>

              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5"
                    style={{
                      fill: i < review.rating ? "#fbbf24" : "#e5e7eb",
                      color: i < review.rating ? "#fbbf24" : "#e5e7eb",
                    }}
                  />
                ))}
              </div>

              {/* Texto */}
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-4 relative z-10">
                {review.text}
              </p>

              {/* Autor */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-50 mt-auto">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-black"
                  style={{ background: "linear-gradient(135deg,#e84562,#f5884a)" }}
                >
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 leading-tight">{review.author}</p>
                  <p className="text-[10px] text-gray-400">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, Tag } from "lucide-react"
import { fashionBlogPosts } from "@/data/mock-fashion"

export default function BlogPage() {
  const [featured, ...rest] = fashionBlogPosts

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero del blog ── */}
      <div
        className="py-12 text-center"
        style={{ background: "linear-gradient(135deg,#fff5f7 0%,#fff9f0 100%)" }}
      >
        <p
          className="mb-2 text-[11px] font-bold uppercase tracking-widest"
          style={{ color: "#e84562" }}
        >
          Nuestro Blog
        </p>
        <h1 className="text-3xl font-black text-gray-900 md:text-4xl">
          Tendencias y Estilo
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Descubre los últimos artículos sobre moda, tendencias y guías de estilo
        </p>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-12">
        {/* ── Post destacado ── */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-10 grid overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md sm:grid-cols-2 block"
          >
            {/* Imagen */}
            <div
              className="relative overflow-hidden bg-gray-100"
              style={{ minHeight: 280 }}
            >
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                sizes="(max-width:640px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="absolute left-4 top-4 rounded-full px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wide"
                style={{ background: "#e84562" }}
              >
                {featured.tag}
              </span>
            </div>
            {/* Info */}
            <div className="flex flex-col justify-center p-8">
              <span
                className="mb-3 inline-block rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wide text-white sm:hidden"
                style={{ background: "#e84562" }}
              >
                {featured.tag}
              </span>
              <p className="mb-3 flex items-center gap-3 text-xs text-gray-400">
                <span>{featured.date}</span>
                {featured.readTime && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {featured.readTime} de lectura
                    </span>
                  </>
                )}
              </p>
              <h2 className="mb-3 text-xl font-black text-gray-900 leading-snug group-hover:text-[#e84562] transition-colors md:text-2xl">
                {featured.title}
              </h2>
              <p className="mb-5 text-sm text-gray-500 leading-relaxed line-clamp-3">
                {featured.excerpt}
              </p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all"
                style={{ color: "#e84562" }}
              >
                Leer artículo completo <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        )}

        {/* ── Grid de posts ── */}
        {rest.length > 0 && (
          <>
            <h2 className="mb-6 text-lg font-black text-gray-900">
              Más artículos
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-xl border border-gray-100 transition-shadow hover:shadow-md"
                >
                  {/* Imagen */}
                  <div
                    className="relative overflow-hidden bg-gray-100"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width:640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wide"
                      style={{ background: "#e84562" }}
                    >
                      {post.tag}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <p className="mb-2 flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{post.date}</span>
                      {post.readTime && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        </>
                      )}
                    </p>
                    <h3 className="mb-2 text-sm font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-[#e84562] transition-colors">
                      {post.title}
                    </h3>
                    <p className="mb-4 text-xs text-gray-500 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all"
                      style={{ color: "#e84562" }}
                    >
                      Leer Más <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ── Tags / Categorías del blog ── */}
        <div className="mt-12 rounded-2xl p-8" style={{ background: "#f9f9f9" }}>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4" style={{ color: "#e84562" }} />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Explorar por tema
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Tendencias", "Guías", "Estilo", "Colecciones", "Cuidado", "Tallas", "Temporada"].map(
              (tag) => (
                <span
                  key={tag}
                  className="cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-[#e84562] hover:text-[#e84562]"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

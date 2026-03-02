"use client"

import { use, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, Clock, User } from "lucide-react"
import { fashionBlogPosts } from "@/data/mock-fashion"

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  const post = useMemo(
    () => fashionBlogPosts.find((p) => p.slug === slug) ?? null,
    [slug]
  )

  const related = useMemo(
    () => fashionBlogPosts.filter((p) => p.slug !== slug).slice(0, 2),
    [slug]
  )

  /* ── Not found ── */
  if (!post) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Artículo no encontrado
        </h1>
        <p className="text-gray-500 mb-6">
          El artículo que buscas no existe o fue eliminado.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "#e84562" }}
        >
          Ver todos los artículos
        </Link>
      </div>
    )
  }

  /* Render markdown-lite: **bold** → <strong>, blank lines → paragraphs */
  function renderContent(content: string) {
    return content.split("\n\n").map((block, i) => {
      const trimmed = block.trim()
      if (!trimmed) return null

      // Heading: **text**
      if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.slice(2, -2).includes("**")) {
        return (
          <h3
            key={i}
            className="mt-6 mb-2 text-base font-black text-gray-900"
          >
            {trimmed.slice(2, -2)}
          </h3>
        )
      }

      // Table (contains |)
      if (trimmed.includes("|")) {
        const rows = trimmed
          .split("\n")
          .filter((r) => r.trim() && !r.match(/^\|[-| ]+\|$/))
        return (
          <div key={i} className="my-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              {rows.map((row, ri) => {
                const cells = row
                  .split("|")
                  .map((c) => c.trim())
                  .filter(Boolean)
                return (
                  <tr
                    key={ri}
                    className={ri === 0 ? "bg-gray-50 font-bold" : "border-t border-gray-100"}
                  >
                    {cells.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 text-gray-700"
                        style={{ borderLeft: ci > 0 ? "1px solid #f0f0f0" : undefined }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </table>
          </div>
        )
      }

      // Regular paragraph — inline **bold** handling
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/)
      return (
        <p key={i} className="mb-1 text-sm leading-relaxed text-gray-600">
          {parts.map((part, pi) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={pi} className="font-bold text-gray-800">
                {part.slice(2, -2)}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      )
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero image ── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "21/9" }}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back button over image */}
        <Link
          href="/blog"
          className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-white transition-colors sm:left-8 sm:top-6"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Blog
        </Link>

        {/* Tag over image */}
        <span
          className="absolute bottom-6 left-4 rounded-full px-3 py-1 text-[10px] font-black text-white uppercase tracking-wide sm:left-8"
          style={{ background: "#e84562" }}
        >
          {post.tag}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-[760px] px-4 lg:px-6">
        {/* Meta */}
        <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {post.author ?? "Redacción Olarics"}
          </span>
          <span>{post.date}</span>
          {post.readTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} de lectura
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-4 mb-6 text-2xl font-black text-gray-900 leading-tight md:text-3xl">
          {post.title}
        </h1>

        {/* Divider */}
        <div
          className="mb-6 h-1 w-12 rounded-full"
          style={{ background: "#e84562" }}
        />

        {/* Excerpt as lead */}
        <p className="mb-6 text-base font-medium text-gray-700 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Body */}
        {post.content ? (
          <div className="prose-like">{renderContent(post.content)}</div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Contenido del artículo próximamente…
          </p>
        )}

        {/* ── Autor card ── */}
        <div
          className="mt-10 flex items-center gap-4 rounded-2xl p-5"
          style={{ background: "#f9f9f9" }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-black text-base"
            style={{ background: "linear-gradient(135deg,#e84562,#f5884a)" }}
          >
            {(post.author ?? "O").charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">
              {post.author ?? "Redacción Olarics"}
            </p>
            <p className="text-xs text-gray-400">
              Equipo editorial de Olarics Fashion Store
            </p>
          </div>
        </div>
      </div>

      {/* ── Related posts ── */}
      {related.length > 0 && (
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "#e84562" }}
              >
                Seguir leyendo
              </p>
              <h2 className="text-xl font-black text-gray-900">
                Otros artículos
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-[#e84562] hover:text-[#e84562] sm:flex"
              style={{ borderColor: "#e5e7eb" }}
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex gap-4 overflow-hidden rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-md"
              >
                <div
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span
                    className="mb-1 inline-block text-[10px] font-black uppercase tracking-wide"
                    style={{ color: "#e84562" }}
                  >
                    {p.tag}
                  </span>
                  <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-[#e84562] transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-[10px] text-gray-400">{p.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

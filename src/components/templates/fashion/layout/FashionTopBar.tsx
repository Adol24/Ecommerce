"use client"

const messages = [
  "OFERTA POR TIEMPO LIMITADO",
  "OFERTA POR TIEMPO LIMITADO",
  "OFERTA POR TIEMPO LIMITADO",
  "OFERTA POR TIEMPO LIMITADO",
  "OFERTA POR TIEMPO LIMITADO",
  "OFERTA POR TIEMPO LIMITADO",
  "OFERTA POR TIEMPO LIMITADO",
  "OFERTA POR TIEMPO LIMITADO",
]

export function FashionTopBar() {
  return (
    <div
      className="overflow-hidden py-2"
      style={{ background: "linear-gradient(90deg, #e84562 0%, #f5884a 100%)" }}
    >
      <div className="flex whitespace-nowrap animate-marquee">
        {messages.map((msg, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 text-white text-[11px] font-semibold uppercase tracking-widest shrink-0 px-6"
          >
            {msg}
            <span className="text-white/50 text-base leading-none">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}

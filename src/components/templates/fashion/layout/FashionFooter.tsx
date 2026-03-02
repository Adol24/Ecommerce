import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

const footerColumns = [
  {
    title: "Marcas",
    links: [
      { label: "Nike", href: "/productos?marca=nike" },
      { label: "Adidas", href: "/productos?marca=adidas" },
      { label: "Zara", href: "/productos?marca=zara" },
      { label: "H&M", href: "/productos?marca=hm" },
      { label: "Levi's", href: "/productos?marca=levis" },
      { label: "Tommy Hilfiger", href: "/productos?marca=tommy" },
    ],
  },
  {
    title: "Categorías",
    links: [
      { label: "Mujer", href: "/productos?genero=mujer" },
      { label: "Hombre", href: "/productos?genero=hombre" },
      { label: "Niños", href: "/productos?genero=nino" },
      { label: "Calzado", href: "/productos?categoria=zapatos" },
      { label: "Deportivo", href: "/productos?categoria=deportivo" },
      { label: "Formal", href: "/productos?categoria=formal" },
    ],
  },
  {
    title: "Accesorios",
    links: [
      { label: "Bolsas", href: "/productos?categoria=bolsas" },
      { label: "Cinturones", href: "/productos?categoria=cinturones" },
      { label: "Gorras", href: "/productos?categoria=gorras" },
      { label: "Lentes", href: "/productos?categoria=lentes" },
      { label: "Joyería", href: "/productos?categoria=joyeria" },
      { label: "Relojes", href: "/productos?categoria=relojes" },
    ],
  },
  {
    title: "Servicios",
    links: [
      { label: "Guía de Tallas", href: "/tallas" },
      { label: "Envíos y Entregas", href: "/envios" },
      { label: "Devoluciones", href: "/devoluciones" },
      { label: "Seguimiento de Pedido", href: "/profile/orders" },
      { label: "Sucursales", href: "/sucursales" },
      { label: "Tarjeta de Regalo", href: "/gift-card" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Preguntas Frecuentes", href: "/faq" },
      { label: "Contáctanos", href: "/contacto" },
      { label: "Chat en Vivo", href: "/chat" },
      { label: "Política de Privacidad", href: "/privacidad" },
      { label: "Términos de Uso", href: "/terminos" },
      { label: "Blog", href: "/blog" },
    ],
  },
]

const socials = [
  { Icon: Facebook, href: "#", label: "Facebook" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Twitter, href: "#", label: "Twitter" },
  { Icon: Youtube, href: "#", label: "YouTube" },
]

export function FashionFooter() {
  return (
    <footer style={{ background: "#1a1a2e", color: "#e0e0e0" }}>
      {/* ─── Columnas principales ─── */}
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {/* Logo + descripción + contacto (columna extra) */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white font-black text-base"
                style={{ background: "linear-gradient(135deg,#e84562,#f5884a)" }}
              >
                O
              </div>
              <span className="text-lg font-black text-white tracking-wide">Olarics</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>
              Tu tienda de moda favorita. Encuentra las mejores marcas y tendencias en un solo lugar.
            </p>
            {/* Contacto */}
            <div className="flex flex-col gap-2 text-xs" style={{ color: "#9ca3af" }}>
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: "#e84562" }} />
                800 801 8388
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "#e84562" }} />
                hola@olarics.mx
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "#e84562" }} />
                CDMX, México
              </span>
            </div>
            {/* Redes sociales */}
            <div className="flex items-center gap-2 pt-1">
              {socials.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  style={{ background: "#2a2a40", color: "#9ca3af" }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = "#e84562"
                    ;(e.currentTarget as HTMLAnchorElement).style.color = "#fff"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = "#2a2a40"
                    ;(e.currentTarget as HTMLAnchorElement).style.color = "#9ca3af"
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Columnas de links */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3
                className="mb-4 text-xs font-black uppercase tracking-widest"
                style={{ color: "#ffffff" }}
              >
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs transition-colors hover:text-white"
                      style={{ color: "#9ca3af" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── Descarga la app ─── */}
        <div
          className="mt-12 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: "#2a2a40" }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#e84562" }}>
              Aplicación Móvil
            </p>
            <p className="text-sm font-bold text-white mb-0.5">Descarga Nuestra App</p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Compra desde tu celular con ofertas exclusivas para usuarios de la app
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* App Store */}
            <Link
              href="#"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-white transition-opacity hover:opacity-80"
              style={{ background: "#111827", border: "1px solid #374151" }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white shrink-0">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div>
                <p className="text-[9px] leading-none" style={{ color: "#9ca3af" }}>Descargar en</p>
                <p className="text-xs font-bold leading-tight">App Store</p>
              </div>
            </Link>
            {/* Google Play */}
            <Link
              href="#"
              className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-white transition-opacity hover:opacity-80"
              style={{ background: "#111827", border: "1px solid #374151" }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white shrink-0">
                <path d="M3.18 23.76c.3.17.64.24.99.19l12.7-12.7L13.12 7.5 3.18 23.76zM20.96 10.24l-2.79-1.6-3.27 3.27 3.27 3.28 2.8-1.61c.8-.46.8-1.89-.01-2.34zM2.01 1.26C1.99 1.4 2 1.55 2 1.7v20.6l11.12-11.12L2.01 1.26zM16.17 3.01L3.18.24c-.35-.06-.69 0-.99.19l10.93 10.92 3.05-3.05-3.05-3.05z" />
              </svg>
              <div>
                <p className="text-[9px] leading-none" style={{ color: "#9ca3af" }}>Descargar en</p>
                <p className="text-xs font-bold leading-tight">Google Play</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Barra inferior ─── */}
      <div style={{ borderTop: "1px solid #2a2a40" }}>
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "#6b7280" }}>
          <span>© {new Date().getFullYear()} Olarics Fashion Store. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

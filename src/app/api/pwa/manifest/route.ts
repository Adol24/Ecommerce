import { NextResponse } from "next/server"
import { getInitialStoreSettings } from "@/lib/get-initial-settings"

export const runtime = "nodejs"

/** Inserts Cloudinary transformation directives before the version/public_id segment */
function cloudinaryResize(url: string, size: number): string {
  return url.replace(
    /\/upload\//,
    `/upload/w_${size},h_${size},c_pad,b_white,f_png/`
  )
}

export async function GET() {
  const settings = await getInitialStoreSettings()

  const storeName = settings.storeName || "BasicTechShop"
  const shortName = storeName.split(" ")[0] || "BasicTech"
  const logo = settings.logo || ""
  const isCloudinary = logo.includes("cloudinary.com")

  // Build icons array: logo-based when available, static fallback otherwise
  const icons = isCloudinary
    ? [
        { src: cloudinaryResize(logo, 192), sizes: "192x192", type: "image/png", purpose: "any" },
        { src: cloudinaryResize(logo, 512), sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ]
    : [
        { src: "/icon-72.png",  sizes: "72x72",   type: "image/png", purpose: "any maskable" },
        { src: "/icon-96.png",  sizes: "96x96",   type: "image/png", purpose: "any maskable" },
        { src: "/icon-128.png", sizes: "128x128", type: "image/png", purpose: "any maskable" },
        { src: "/icon-144.png", sizes: "144x144", type: "image/png", purpose: "any maskable" },
        { src: "/icon-152.png", sizes: "152x152", type: "image/png", purpose: "any maskable" },
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "/icon-384.png", sizes: "384x384", type: "image/png", purpose: "any maskable" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ]

  const manifest = {
    name: storeName,
    short_name: shortName,
    description: `${storeName} — Tu tienda en línea`,
    start_url: "/?utm_source=pwa",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    scope: "/",
    lang: "es-MX",
    categories: ["shopping", "electronics"],
    icons,
    shortcuts: [
      {
        name: "Buscar Productos",
        short_name: "Buscar",
        description: "Encuentra el producto que buscas",
        url: "/products?utm_source=pwa_shortcut",
        icons: [{ src: "/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Mis Pedidos",
        short_name: "Pedidos",
        description: "Ver historial de pedidos",
        url: "/profile/orders?utm_source=pwa_shortcut",
        icons: [{ src: "/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Mi Carrito",
        short_name: "Carrito",
        description: "Ver productos en el carrito",
        url: "/cart?utm_source=pwa_shortcut",
        icons: [{ src: "/icon-96.png", sizes: "96x96" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  }

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  })
}

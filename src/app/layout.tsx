import type { Metadata } from "next"
import { Geist, Geist_Mono, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { InsForgeProvider } from "@/components/providers/InsForgeProvider"
import { FavoritesProvider } from "@/components/providers/FavoritesProvider"
import { PWAProvider } from "@/components/providers/PWAProvider"
import { RealtimeProvider } from "@/components/providers/RealtimeProvider"
import { ToastContainer } from "@/components/ui/toast"
import { BottomNav } from "@/components/layout/BottomNav"
import { getInitialStoreSettings } from "@/lib/get-initial-settings"
import { buildThemeCss, getColorTheme } from "@/lib/color-themes"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "BasicTechShop - Tienda de Cómputo",
    template: "%s | BasicTechShop",
  },
  description: "Los mejores productos de cómputo: PCs, monitores, teclados, mouse y más. Envío a todo México.",
  keywords: ["tienda de cómputo", "computadora", "laptop", "monitor", "teclado", "gaming", " México"],
  authors: [{ name: "BasicTechShop" }],
  creator: "BasicTechShop",
  publisher: "BasicTechShop",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    locale: "es_MX",
    type: "website",
    siteName: "BasicTechShop",
    title: "BasicTechShop - Tienda de Cómputo",
    description: "Los mejores productos de cómputo: PCs, monitores, teclados, mouse y más.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "BasicTechShop - Tienda de Cómputo",
    description: "Los mejores productos de cómputo: PCs, monitores, teclados, mouse y más.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "content-language": "es-MX",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "BasicTechShop",
    "application-name": "BasicTechShop",
    "msapplication-TileColor": "#2563eb",
    "msapplication-config": "/browserconfig.xml",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BasicTechShop",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Load settings server-side to avoid flash of defaults on first render
  const initialSettings = await getInitialStoreSettings()
  const theme = getColorTheme(initialSettings.colorTheme)
  const themeCss = buildThemeCss(theme)

  return (
    <html lang="es-MX" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Language" content="es-MX" />
        {/* Inject theme CSS server-side to prevent color flash */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
        data-template={initialSettings.activeTemplate}
        suppressHydrationWarning
      >
        <PWAProvider>
          <InsForgeProvider initialSettings={initialSettings}>
            <FavoritesProvider>
              <RealtimeProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <BottomNav />
                <ToastContainer />
              </ThemeProvider>
              </RealtimeProvider>
            </FavoritesProvider>
          </InsForgeProvider>
        </PWAProvider>
      </body>
    </html>
  )
}

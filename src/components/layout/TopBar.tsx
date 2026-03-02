import { Truck, Phone, Facebook, Instagram, Twitter } from "lucide-react"
import Link from "next/link"

export function TopBar() {
  return (
    <div className="bg-foreground text-background dark:bg-muted dark:text-foreground">
      <div className="container mx-auto px-4">
        <div className="flex h-8 items-center justify-between text-xs">
          {/* Left */}
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">¡Envío gratis en pedidos mayores a</span>
            <span className="font-semibold">$200!</span>
          </div>

          {/* Center */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <Phone className="h-3 w-3" />
            <span>Atención al cliente: (123) 456-7890</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline opacity-70">Síguenos:</span>
            <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity">
              <Facebook className="h-3.5 w-3.5" />
            </Link>
            <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity">
              <Instagram className="h-3.5 w-3.5" />
            </Link>
            <Link href="#" className="opacity-70 hover:opacity-100 transition-opacity">
              <Twitter className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

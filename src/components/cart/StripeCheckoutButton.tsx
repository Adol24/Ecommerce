"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CreditCard, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import { useAuth } from "@/hooks/useAuth"

export function StripeCheckoutButton() {
  const [loading, setLoading] = useState(false)
  const items = useCartStore((state) => state.items)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/cart")
      return
    }

    setLoading(true)

    try {
      router.push("/checkout")
    } catch (error) {
      console.error("Error:", error)
      alert("Error al procesar. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const isLoading = loading || authLoading

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading || items.length === 0}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : !isAuthenticated ? (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Iniciar sesión para continuar
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Continuar al Checkout
        </>
      )}
    </Button>
  )
}

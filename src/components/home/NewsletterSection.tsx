"use client"

import { useState } from "react"
import { Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <section className="bg-primary py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Suscríbete y ahorra
          </h2>
          <p className="mt-2 text-white/80">
            Recibe las mejores ofertas y novedades directamente en tu correo. Sin spam, solo las mejores promociones.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-lg bg-white/20 px-6 py-4 text-white">
              <p className="font-semibold">¡Gracias por suscribirte!</p>
              <p className="text-sm text-white/80">Pronto recibirás nuestras mejores ofertas.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 border-0 bg-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/50"
              />
              <Button type="submit" className="bg-white text-primary hover:bg-white/90 shrink-0">
                <Send className="mr-2 h-4 w-4" />
                Suscribirse
              </Button>
            </form>
          )}

          <p className="mt-3 text-xs text-white/60">
            Al suscribirte aceptas recibir emails promocionales. Puedes cancelar en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  )
}

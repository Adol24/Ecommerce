"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BannerForm, type BannerFormInitialValues } from "@/components/admin/BannerForm"
import { insforge } from "@/lib/insforge"

export default function NewBannerPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const handleCreate = async (values: BannerFormInitialValues) => {
    setSaving(true)
    setServerError(null)
    try {
      const { error } = await insforge.database.from("banners").insert([{
        badge: values.badge || null,
        title: values.title,
        subtitle: values.subtitle || null,
        description: values.description || null,
        cta_text: values.ctaText,
        cta_href: values.ctaHref,
        secondary_cta_text: values.secondaryCtaText || null,
        secondary_cta_href: values.secondaryCtaHref || null,
        gradient: values.gradient,
        image_url: values.imageUrl,
        priority: values.priority,
        sort_order: values.sortOrder,
        is_active: values.isActive,
        start_at: values.startAt || null,
        end_at: values.endAt || null,
      }])

      if (error) {
        setServerError(error.message || "Error al crear banner")
        return
      }

      router.push("/admin/banners")
    } catch {
      setServerError("Error de conexion")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/banners">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Banner</h1>
          <p className="text-muted-foreground">Crea un banner para el hero principal</p>
        </div>
      </div>

      <BannerForm
        title="Datos del Banner"
        description="Configura texto, enlaces, imagen y estilo del banner"
        submitLabel="Crear Banner"
        saving={saving}
        serverError={serverError}
        onSubmit={handleCreate}
      />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BannerForm, type BannerFormInitialValues } from "@/components/admin/BannerForm"
import { insforge } from "@/lib/insforge"

export default function EditBannerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [initialValues, setInitialValues] = useState<BannerFormInitialValues | undefined>(undefined)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data, error } = await insforge.database
          .from("banners")
          .select("*")
          .eq("id", id)
          .single()

        if (error || !data) {
          setNotFound(true)
          return
        }

        setInitialValues({
          badge: (data.badge as string) || "",
          title: (data.title as string) || "",
          subtitle: (data.subtitle as string) || "",
          description: (data.description as string) || "",
          ctaText: (data.cta_text as string) || "Ver ahora",
          ctaHref: (data.cta_href as string) || "/products",
          secondaryCtaText: (data.secondary_cta_text as string) || "Ver Todo",
          secondaryCtaHref: (data.secondary_cta_href as string) || "/products",
          gradient: (data.gradient as string) || "from-slate-900 via-slate-800 to-slate-900",
          imageUrl: (data.image_url as string) || "",
          priority: (data.priority as number) || 0,
          sortOrder: (data.sort_order as number) || 0,
          startAt: (data.start_at as string) || "",
          endAt: (data.end_at as string) || "",
          isActive: (data.is_active as boolean) ?? true,
        })
      } catch {
        setServerError("Error de conexion")
      } finally {
        setLoading(false)
      }
    }

    void fetchBanner()
  }, [id])

  const handleSave = async (values: BannerFormInitialValues) => {
    setSaving(true)
    setServerError(null)
    try {
      const { error } = await insforge.database
        .from("banners")
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        setServerError(error.message || "Error al guardar cambios")
        return
      }

      router.push("/admin/banners")
    } catch {
      setServerError("Error de conexion")
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Banner no encontrado</p>
        <Button asChild variant="outline">
          <Link href="/admin/banners">Volver a banners</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!initialValues) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">
          {serverError || "No se pudo cargar el banner"}
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/banners">Volver a banners</Link>
        </Button>
      </div>
    )
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
          <h1 className="text-2xl font-bold">Editar Banner</h1>
          <p className="text-muted-foreground">Actualiza el contenido visual y textos del banner</p>
        </div>
      </div>

      <BannerForm
        title="Datos del Banner"
        description="Modifica textos, enlaces, imagen y estado del banner"
        submitLabel="Guardar Cambios"
        saving={saving}
        serverError={serverError}
        initialValues={initialValues}
        onSubmit={handleSave}
      />
    </div>
  )
}

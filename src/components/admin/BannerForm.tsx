"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2, Maximize2 } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/admin/ImageUpload"
import { cn } from "@/lib/utils"

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

function fromDateTimeLocalValue(value?: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

function getPreviewScheduleStatus({
  isActive,
  startAt,
  endAt,
}: {
  isActive?: boolean
  startAt?: string
  endAt?: string
}) {
  if (!isActive) {
    return { label: "INACTIVO", tone: "muted" as const }
  }

  const now = new Date()
  const start = startAt ? new Date(startAt) : null
  const end = endAt ? new Date(endAt) : null

  if (start && !Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) {
    return { label: "PROGRAMADO", tone: "warn" as const }
  }
  if (end && !Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) {
    return { label: "VENCIDO", tone: "muted" as const }
  }
  return { label: "VIGENTE", tone: "ok" as const }
}

interface BannerPreviewSnapshot {
  image: string
  badge: string
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaHref: string
  secondaryCtaText: string
  secondaryCtaHref: string
  gradient: string
  priority: number
  sortOrder: number
  scheduleStatus: { label: string; tone: "ok" | "warn" | "muted" }
  startAt?: string
  endAt?: string
}

function BannerPreviewPanel({
  snapshot,
  fullscreen = false,
}: {
  snapshot: BannerPreviewSnapshot
  fullscreen?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Prioridad: P{snapshot.priority}</Badge>
        <Badge variant="outline">Orden: {snapshot.sortOrder}</Badge>
        <Badge
          className={
            snapshot.scheduleStatus.tone === "ok"
              ? "bg-green-600"
              : snapshot.scheduleStatus.tone === "warn"
                ? "bg-amber-500 text-black hover:bg-amber-500"
                : ""
          }
          variant={snapshot.scheduleStatus.tone === "muted" ? "secondary" : "default"}
        >
          {snapshot.scheduleStatus.label}
        </Badge>
        {snapshot.startAt && (
          <Badge variant="outline" className="text-xs">
            Inicio: {new Date(snapshot.startAt).toLocaleString("es-MX")}
          </Badge>
        )}
        {snapshot.endAt && (
          <Badge variant="outline" className="text-xs">
            Fin: {new Date(snapshot.endAt).toLocaleString("es-MX")}
          </Badge>
        )}
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-gradient-to-br",
          snapshot.gradient,
          fullscreen && "min-h-[68vh]"
        )}
      >
        <div className="absolute inset-0 opacity-20">
          <Image
            src={snapshot.image}
            alt=""
            fill
            className="object-cover"
            sizes={fullscreen ? "95vw" : "(max-width: 768px) 100vw, 900px"}
          />
        </div>

        <div
          className={cn(
            "relative z-10 grid gap-6 p-5 sm:grid-cols-[1.1fr_0.9fr] sm:p-6",
            fullscreen && "min-h-[68vh] items-center p-6 md:p-10"
          )}
        >
          <div className="text-white">
            {snapshot.badge && (
              <span className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {snapshot.badge}
              </span>
            )}

            <h3 className={cn("text-2xl font-bold leading-tight sm:text-3xl", fullscreen && "md:text-5xl")}>
              {snapshot.title}
              {snapshot.subtitle && (
                <span className="block text-primary">{snapshot.subtitle}</span>
              )}
            </h3>

            {snapshot.description && (
              <p className={cn("mt-3 max-w-xl text-sm text-slate-300", fullscreen && "md:text-base")}>
                {snapshot.description}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button type="button" size={fullscreen ? "default" : "sm"} disabled>
                {snapshot.ctaText}
              </Button>
              <Button
                type="button"
                size={fullscreen ? "default" : "sm"}
                variant="outline"
                disabled
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                {snapshot.secondaryCtaText}
              </Button>
            </div>

            <div className={cn("mt-3 text-xs text-slate-300", fullscreen && "md:text-sm")}>
              <p>CTA principal: {snapshot.ctaHref}</p>
              <p>CTA secundario: {snapshot.secondaryCtaHref}</p>
            </div>
          </div>

          <div
            className={cn(
              "relative hidden min-h-44 overflow-hidden rounded-xl border border-white/10 bg-black/20 sm:block",
              fullscreen && "min-h-[320px] md:min-h-[440px]"
            )}
          >
            <Image
              src={snapshot.image}
              alt={snapshot.title}
              fill
              className="object-cover"
              sizes={fullscreen ? "(max-width: 1024px) 40vw, 520px" : "400px"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const bannerSchema = z.object({
  badge: z.string().optional(),
  title: z.string().min(1, "El titulo es requerido"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().min(1, "El texto del boton principal es requerido"),
  ctaHref: z.string().min(1, "El enlace del boton principal es requerido"),
  secondaryCtaText: z.string().min(1, "El texto del boton secundario es requerido"),
  secondaryCtaHref: z.string().min(1, "El enlace del boton secundario es requerido"),
  gradient: z.string().min(1, "El gradiente es requerido"),
  priority: z.number().int().min(0, "La prioridad debe ser mayor o igual a 0"),
  sortOrder: z.number().int().min(0, "El orden debe ser mayor o igual a 0"),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  isActive: z.boolean(),
}).superRefine((values, ctx) => {
  if (!values.startAt || !values.endAt) return
  const start = new Date(values.startAt)
  const end = new Date(values.endAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return
  if (end.getTime() < start.getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endAt"],
      message: "La fecha de fin no puede ser menor que la fecha de inicio",
    })
  }
})

export type BannerFormData = z.infer<typeof bannerSchema>

export interface BannerFormInitialValues extends BannerFormData {
  imageUrl: string
}

interface BannerFormProps {
  title: string
  description: string
  submitLabel: string
  cancelHref?: string
  initialValues?: Partial<BannerFormInitialValues>
  saving?: boolean
  loading?: boolean
  serverError?: string | null
  onSubmit: (values: BannerFormInitialValues) => Promise<void> | void
}

const defaultValues: BannerFormInitialValues = {
  badge: "",
  title: "",
  subtitle: "",
  description: "",
  ctaText: "Ver ahora",
  ctaHref: "/products",
  secondaryCtaText: "Ver Todo",
  secondaryCtaHref: "/products",
  gradient: "from-slate-900 via-slate-800 to-slate-900",
  imageUrl: "",
  priority: 0,
  sortOrder: 0,
  startAt: "",
  endAt: "",
  isActive: true,
}

export function BannerForm({
  title,
  description,
  submitLabel,
  cancelHref = "/admin/banners",
  initialValues,
  saving = false,
  loading = false,
  serverError,
  onSubmit,
}: BannerFormProps) {
  const [images, setImages] = useState<string[]>(
    initialValues?.imageUrl ? [initialValues.imageUrl] : []
  )
  const [showPreview, setShowPreview] = useState(true)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
      startAt: toDateTimeLocalValue(initialValues?.startAt),
      endAt: toDateTimeLocalValue(initialValues?.endAt),
    },
  })
  const isActive = useWatch({ control, name: "isActive" })
  const watchedBadge = useWatch({ control, name: "badge" })
  const watchedTitle = useWatch({ control, name: "title" })
  const watchedSubtitle = useWatch({ control, name: "subtitle" })
  const watchedDescription = useWatch({ control, name: "description" })
  const watchedCtaText = useWatch({ control, name: "ctaText" })
  const watchedCtaHref = useWatch({ control, name: "ctaHref" })
  const watchedSecondaryCtaText = useWatch({ control, name: "secondaryCtaText" })
  const watchedSecondaryCtaHref = useWatch({ control, name: "secondaryCtaHref" })
  const watchedGradient = useWatch({ control, name: "gradient" })
  const watchedPriority = useWatch({ control, name: "priority" })
  const watchedSortOrder = useWatch({ control, name: "sortOrder" })
  const watchedStartAt = useWatch({ control, name: "startAt" })
  const watchedEndAt = useWatch({ control, name: "endAt" })

  const previewImage =
    images[0] ||
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"

  const previewBadge = watchedBadge || ""
  const previewTitle = watchedTitle || "Titulo del banner"
  const previewSubtitle = watchedSubtitle || ""
  const previewDescription = watchedDescription || ""
  const previewCtaText = watchedCtaText || "Ver ahora"
  const previewCtaHref = watchedCtaHref || "/products"
  const previewSecondaryCtaText = watchedSecondaryCtaText || "Ver Todo"
  const previewSecondaryCtaHref = watchedSecondaryCtaHref || "/products"
  const previewGradient = watchedGradient || "from-slate-900 via-slate-800 to-slate-900"
  const previewPriority = Number(watchedPriority) || 0
  const previewSortOrder = Number(watchedSortOrder) || 0
  const scheduleStatus = getPreviewScheduleStatus({
    isActive,
    startAt: watchedStartAt,
    endAt: watchedEndAt,
  })
  const previewSnapshot: BannerPreviewSnapshot = {
    image: previewImage,
    badge: previewBadge,
    title: previewTitle,
    subtitle: previewSubtitle,
    description: previewDescription,
    ctaText: previewCtaText,
    ctaHref: previewCtaHref,
    secondaryCtaText: previewSecondaryCtaText,
    secondaryCtaHref: previewSecondaryCtaHref,
    gradient: previewGradient,
    priority: previewPriority,
    sortOrder: previewSortOrder,
    scheduleStatus,
    startAt: watchedStartAt || undefined,
    endAt: watchedEndAt || undefined,
  }

  const submitHandler = async (values: BannerFormData) => {
    if (images.length === 0) {
      alert("Debes subir una imagen para el banner")
      return
    }

    await onSubmit({
      ...values,
      startAt: fromDateTimeLocalValue(values.startAt),
      endAt: fromDateTimeLocalValue(values.endAt),
      imageUrl: images[0],
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
          {serverError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="badge">Badge</Label>
              <Input id="badge" placeholder="Nuevo Lanzamiento" {...register("badge")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Input
                id="priority"
                type="number"
                min={0}
                {...register("priority", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Mayor numero = aparece primero en el hero.
              </p>
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Orden</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                {...register("sortOrder", { valueAsNumber: true })}
              />
              {errors.sortOrder && (
                <p className="text-sm text-destructive">{errors.sortOrder.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startAt">
                Inicio de publicación <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input id="startAt" type="datetime-local" {...register("startAt")} />
              <p className="text-xs text-muted-foreground">
                Si se deja vacío, el banner puede mostrarse inmediatamente.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">
                Fin de publicación <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input id="endAt" type="datetime-local" {...register("endAt")} />
              <p className="text-xs text-muted-foreground">
                Si se deja vacío, el banner no expirará automáticamente.
              </p>
              {errors.endAt && (
                <p className="text-sm text-destructive">{errors.endAt.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo</Label>
              <Input id="title" placeholder="RTX Serie 40" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitulo</Label>
              <Input id="subtitle" placeholder="Potencia Maxima" {...register("subtitle")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Texto descriptivo del banner"
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Boton principal (texto)</Label>
              <Input id="ctaText" placeholder="Ver GPUs" {...register("ctaText")} />
              {errors.ctaText && <p className="text-sm text-destructive">{errors.ctaText.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaHref">Boton principal (enlace)</Label>
              <Input id="ctaHref" placeholder="/products?category=componentes" {...register("ctaHref")} />
              {errors.ctaHref && <p className="text-sm text-destructive">{errors.ctaHref.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="secondaryCtaText">Boton secundario (texto)</Label>
              <Input id="secondaryCtaText" placeholder="Ver Todo" {...register("secondaryCtaText")} />
              {errors.secondaryCtaText && (
                <p className="text-sm text-destructive">{errors.secondaryCtaText.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryCtaHref">Boton secundario (enlace)</Label>
              <Input id="secondaryCtaHref" placeholder="/products" {...register("secondaryCtaHref")} />
              {errors.secondaryCtaHref && (
                <p className="text-sm text-destructive">{errors.secondaryCtaHref.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradient">Gradiente (clases Tailwind)</Label>
            <Input
              id="gradient"
              placeholder="from-violet-900 via-purple-900 to-slate-900"
              {...register("gradient")}
            />
            <p className="text-xs text-muted-foreground">
              Ejemplo: <code>from-blue-900 via-cyan-900 to-slate-900</code>
            </p>
            {errors.gradient && <p className="text-sm text-destructive">{errors.gradient.message}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Banner activo</p>
                <p className="text-xs text-muted-foreground">
                  Si está desactivado no se mostrará en la tienda.
                </p>
              </div>
              <Switch
                checked={!!isActive}
                onCheckedChange={(checked) => setValue("isActive", !!checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagen del banner</Label>
            <ImageUpload
              value={images}
              onChange={(urls) => setImages(urls.slice(0, 1))}
              maxImages={1}
              folder="banners"
              disabled={saving}
            />
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Vista Previa</p>
                <p className="text-xs text-muted-foreground">
                  Simulación del banner en la tienda antes de guardar.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview((prev) => !prev)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Ocultar Preview
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Mostrar Preview
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewDialogOpen(true)}
                >
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Pantalla Completa
                </Button>
              </div>
            </div>

            {showPreview && (
              <BannerPreviewPanel snapshot={previewSnapshot} />
            )}
          </div>

          <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
            <DialogContent
              className="h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-none gap-0 overflow-hidden p-0 sm:max-w-none"
              showCloseButton
            >
              <div className="flex h-full flex-col">
                <DialogHeader className="border-b px-4 py-3 pr-12 text-left">
                  <DialogTitle>Preview en Pantalla Completa</DialogTitle>
                  <DialogDescription>
                    Revisa cómo se verá el banner en el hero antes de guardarlo.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-4 md:p-6">
                  <BannerPreviewPanel snapshot={previewSnapshot} fullscreen />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" asChild>
              <Link href={cancelHref}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

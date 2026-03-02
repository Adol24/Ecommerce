"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Loader2, Sparkles, Star, TrendingUp } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ImageUpload } from "@/components/admin/ImageUpload"
import { useProductsStore } from "@/stores/products-store"
import { cn } from "@/lib/utils"

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  price: z.number().min(0.01, "El precio debe ser mayor a 0"),
  comparePrice: z.number().optional(),
  cost: z.number().min(0).optional(),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  brandId: z.string().min(1, "La marca es requerida"),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  rating: z.number().min(0).max(5),
})

type ProductFormData = z.infer<typeof productSchema>

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { categories, brands, fetchCategories, fetchBrands } = useProductsStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { isNew: false, isFeatured: false, isActive: true, rating: 0, stock: 0 },
  })

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([fetchCategories(), fetchBrands()])
        const res = await fetch(`/api/products/${id}`)
        if (res.status === 404) { setNotFound(true); return }
        const product = await res.json()
        reset({
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          price: product.price,
          comparePrice: product.comparePrice,
          cost: product.cost || 0,
          stock: product.stock,
          categoryId: product.categoryId,
          brandId: product.brandId,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          rating: product.rating ?? 0,
        })
        setImages(product.images || [])
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, fetchCategories, fetchBrands, reset])

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      setServerError("Debes mantener al menos una imagen")
      return
    }
    setSaving(true)
    setServerError(null)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      })
      const json = await res.json()
      if (!res.ok) { setServerError(json.error || "Error al guardar"); return }
      router.push("/admin/products")
    } catch {
      setServerError("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const ratingValue = watch("rating") ?? 0
  const isFeatured = watch("isFeatured")
  const isNew = watch("isNew")

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">Producto no encontrado</p>
        <Button asChild variant="outline"><Link href="/admin/products">Volver</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Producto</h1>
          <p className="text-muted-foreground">Modifica los datos del producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{serverError}</div>
        )}

        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos principales del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Nombre del producto"
                  {...register("name", { onChange: (e) => setValue("slug", generateSlug(e.target.value)) })} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input id="slug" placeholder="nombre-del-producto" {...register("slug")} />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" rows={4} placeholder="Descripción del producto" {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={watch("categoryId")} onValueChange={(v) => setValue("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Marca</Label>
                <Select value={watch("brandId")} onValueChange={(v) => setValue("brandId", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.brandId && <p className="text-sm text-destructive">{errors.brandId.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price & Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Precio e Inventario</CardTitle>
            <CardDescription>Configura precio y disponibilidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Costo ($)</Label>
                <Input 
                  id="cost" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  {...register("cost", { valueAsNumber: true })} 
                />
                <p className="text-xs text-muted-foreground">Cuanto te cuesta</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio ($)</Label>
                <Input id="price" type="number" step="0.01" placeholder="0.00"
                  {...register("price", { valueAsNumber: true })} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Precio anterior (opcional)</Label>
                <Input id="comparePrice" type="number" step="0.01" placeholder="0.00"
                  {...register("comparePrice", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" placeholder="0"
                  {...register("stock", { valueAsNumber: true })} />
                {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
            <CardDescription>Imágenes del producto (máximo 5)</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload value={images} onChange={setImages} maxImages={5} />
          </CardContent>
        </Card>

        {/* Visibilidad en Inicio */}
        <Card>
          <CardHeader>
            <CardTitle>Visibilidad en la Página de Inicio</CardTitle>
            <CardDescription>
              Elige en qué secciones aparecerá este producto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Más Vendidos & Recién Llegados */}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setValue("isFeatured", !isFeatured)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                  isFeatured
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isFeatured
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Más Vendidos</p>
                  <p className="text-xs text-muted-foreground">Sección destacada de inicio</p>
                </div>
                {isFeatured && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setValue("isNew", !isNew)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                  isNew
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isNew
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Recién Llegados</p>
                  <p className="text-xs text-muted-foreground">Aparece marcado como nuevo</p>
                </div>
                {isNew && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            </div>

            {/* Mejor Calificados */}
            <div
              className={cn(
                "rounded-lg border-2 p-4 transition-colors",
                ratingValue > 0 ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    ratingValue > 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Star className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mejor Calificados</p>
                  <p className="text-xs text-muted-foreground">
                    {ratingValue > 0
                      ? `Aparecerá con calificación ${ratingValue.toFixed(1)}`
                      : "Rating 0 = no aparece en esta sección"}
                  </p>
                </div>
                {/* Star display */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(ratingValue)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                {ratingValue > 0 && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </div>
              <Slider
                min={0}
                max={5}
                step={0.5}
                value={[ratingValue]}
                onValueChange={([v]) => setValue("rating", v)}
              />
              <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                <span>Sin calificación</span>
                <span>{ratingValue > 0 ? `${ratingValue.toFixed(1)} / 5.0` : ""}</span>
              </div>
            </div>

            {/* isActive */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="isActive" checked={watch("isActive")}
                onCheckedChange={(c) => setValue("isActive", !!c)} />
              <Label htmlFor="isActive" className="font-normal">Producto activo (visible en tienda)</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}

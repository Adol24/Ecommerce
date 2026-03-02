"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  description: z.string().min(1, "La descripcion es requerida"),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  comparePrice: z.number().optional(),
  cost: z.number().min(0).optional(),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
  categoryId: z.string().min(1, "La categoria es requerida"),
  brandId: z.string().min(1, "La marca es requerida"),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  rating: z.number().min(0).max(5),
})

type ProductFormData = z.infer<typeof productSchema>

export default function NewProductPage() {
  const router = useRouter()
  const { categories, brands, fetchCategories, fetchBrands } = useProductsStore()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isNew: false,
      isFeatured: false,
      rating: 0,
      stock: 0,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchCategories(), fetchBrands()])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [fetchCategories, fetchBrands])

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      alert("Debes subir al menos una imagen")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          comparePrice: data.comparePrice || null,
          cost: data.cost || 0,
          stock: data.stock,
          images,
          isNew: data.isNew,
          isFeatured: data.isFeatured,
          rating: data.rating,
          categoryId: data.categoryId,
          brandId: data.brandId,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al crear el producto")
      router.push("/admin/products")
    } catch (error) {
      alert((error as Error).message || "Error al crear el producto")
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Producto</h1>
          <p className="text-muted-foreground">Agrega un nuevo producto al catalogo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Informacion Basica</CardTitle>
            <CardDescription>Datos principales del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre del producto"
                  {...register("name", {
                    onChange: (e) => setValue("slug", generateSlug(e.target.value)),
                  })}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input id="slug" placeholder="nombre-del-producto" {...register("slug")} />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                placeholder="Descripcion detallada del producto"
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select onValueChange={(value) => setValue("categoryId", value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar categoria" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Marca</Label>
                <Select onValueChange={(value) => setValue("brandId", value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar marca" /></SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brandId && (
                  <p className="text-sm text-destructive">{errors.brandId.message}</p>
                )}
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
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Precio anterior (opcional)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("comparePrice", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  {...register("stock", { valueAsNumber: true })}
                />
                {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Imagenes</CardTitle>
            <CardDescription>Sube las imagenes del producto (maximo 5)</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload value={images} onChange={setImages} maxImages={5} />
          </CardContent>
        </Card>

        {/* Visibilidad en Inicio */}
        <Card>
          <CardHeader>
            <CardTitle>Visibilidad en la Pagina de Inicio</CardTitle>
            <CardDescription>
              Elige en que secciones aparecera este producto
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
                  <p className="text-sm font-medium">Mas Vendidos</p>
                  <p className="text-xs text-muted-foreground">Seccion destacada de inicio</p>
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
                  <p className="text-sm font-medium">Recien Llegados</p>
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
                      ? `Aparecera con calificacion ${ratingValue.toFixed(1)}`
                      : "Rating 0 = no aparece en esta seccion"}
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
                <span>Sin calificacion</span>
                <span>{ratingValue > 0 ? `${ratingValue.toFixed(1)} / 5.0` : ""}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
            ) : (
              "Guardar Producto"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

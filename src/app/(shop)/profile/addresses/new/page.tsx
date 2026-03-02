"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, ChevronDown, Loader2, Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/stores/user-store"
import { useAuth } from "@/hooks/useAuth"

const addressSchema = z.object({
  label: z.string().min(1, "La etiqueta es requerida"),
  name: z.string().min(1, "El nombre es requerido"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos"),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  state: z.string().min(1, "El estado es requerido"),
  zipCode: z.string().min(1, "El código postal es requerido"),
  isDefault: z.boolean(),
})

type AddressFormData = z.infer<typeof addressSchema>

const MEXICAN_STATES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México",
  "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
  "Yucatán", "Zacatecas",
]

interface StateComboboxProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

function StateCombobox({ value, onChange, error }: StateComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = MEXICAN_STATES.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setSearch("")
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors",
          "hover:border-ring focus:outline-none focus:ring-1 focus:ring-ring",
          error ? "border-destructive" : "border-input",
          !value && "text-muted-foreground"
        )}
      >
        <span>{value || "Seleccionar estado"}</span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar estado..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                No se encontró el estado.
              </p>
            ) : (
              filtered.map((state) => (
                <button
                  key={state}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted",
                    value === state && "font-medium"
                  )}
                  onClick={() => {
                    onChange(state)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("h-3.5 w-3.5 shrink-0", value === state ? "opacity-100" : "opacity-0")}
                  />
                  {state}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NewAddressPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { createAddress } = useUserStore()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const requestedReturnTo = searchParams.get("returnTo")
  const returnTo =
    requestedReturnTo && requestedReturnTo.startsWith("/") ? requestedReturnTo : "/profile/addresses"

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      isDefault: false,
      state: "",
      name: "",
    },
  })

  // Auto-fill name when user data is available
  useEffect(() => {
    if (user?.name) {
      setValue("name", user.name)
    }
  }, [user, setValue])

  const onSubmit = async (data: AddressFormData) => {
    setSubmitError(null)
    setSaving(true)
    try {
      await createAddress(data)
      router.push(returnTo)
    } catch (error) {
      console.error("Error creating address:", error)
      setSubmitError(error instanceof Error ? error.message : "Error al guardar dirección")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={returnTo}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Nueva Dirección</h2>
          <p className="text-muted-foreground">
            Agrega una nueva dirección de envío
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Dirección</CardTitle>
          <CardDescription>
            Completa los datos de tu nueva dirección
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="label">Etiqueta</Label>
                <Input
                  id="label"
                  placeholder="Ej: Casa, Oficina"
                  {...register("label")}
                />
                {errors.label && (
                  <p className="text-sm text-destructive">{errors.label.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="5512345678"
                maxLength={10}
                inputMode="numeric"
                onKeyDown={(e) => {
                  const allowed = [
                    "Backspace", "Delete", "Tab", "Escape", "Enter",
                    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
                  ]
                  if (allowed.includes(e.key)) return
                  if (!/^\d$/.test(e.key)) e.preventDefault()
                }}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Av. Principal 123, Col. Centro"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Ciudad de México"
                  {...register("city")}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <input type="hidden" {...register("state")} />
                <StateCombobox
                  value={watch("state")}
                  onChange={(val) => setValue("state", val, { shouldDirty: true, shouldValidate: true })}
                  error={errors.state?.message}
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Código Postal</Label>
                <Input
                  id="zipCode"
                  placeholder="06600"
                  maxLength={5}
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    const allowed = [
                      "Backspace", "Delete", "Tab", "Escape", "Enter",
                      "ArrowLeft", "ArrowRight",
                    ]
                    if (allowed.includes(e.key)) return
                    if (!/^\d$/.test(e.key)) e.preventDefault()
                  }}
                  {...register("zipCode")}
                />
                {errors.zipCode && (
                  <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) =>
                  setValue("isDefault", !!checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <Label htmlFor="isDefault" className="font-normal">
                Establecer como dirección predeterminada
              </Label>
            </div>

            {submitError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href={returnTo}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Dirección"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewAddressPage() {
  return (
    <Suspense fallback={null}>
      <NewAddressPageContent />
    </Suspense>
  )
}

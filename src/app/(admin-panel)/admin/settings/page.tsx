"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Save, Check, Palette, ShoppingCart, Star, Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SETTINGS_STORAGE_KEY,
  defaultStoreSettings,
  normalizeStoreSettings,
  type StoreSettings as AdminSettings,
} from "@/lib/store-settings"
import { COLOR_THEMES, getColorTheme } from "@/lib/color-themes"
import { publishAppDataChangedClient } from "@/lib/realtime-publish-client"

type SaveState = "idle" | "saved" | "error" | "no_changes"

function loadInitialSettings(): AdminSettings {
  if (typeof window === "undefined") return defaultStoreSettings

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return defaultStoreSettings
    return normalizeStoreSettings(JSON.parse(raw))
  } catch {
    return defaultStoreSettings
  }
}

function getInitialSavedSnapshot(): string {
  const settings = loadInitialSettings()
  return JSON.stringify(settings)
}

function formatSavedTime(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString("es-MX")
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(loadInitialSettings)
  const [savedSnapshot, setSavedSnapshot] = useState<string>(getInitialSavedSnapshot)
  const [saving, setSaving] = useState(false)
  const [loadingRemote, setLoadingRemote] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadWarning, setLoadWarning] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const syncLocalCache = useCallback((nextSettings: AdminSettings) => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings))
  }, [])

  const applyLoadedSettings = useCallback((nextSettings: AdminSettings, updatedAt: string | null = null) => {
    setSettings(nextSettings)
    const serialized = JSON.stringify(nextSettings)
    setSavedSnapshot(serialized)
    syncLocalCache(nextSettings)
    setLastSavedAt(formatSavedTime(updatedAt))
  }, [syncLocalCache])

  const loadFromDatabase = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" })
      const json = await res.json() as Record<string, unknown>

      if (!res.ok) {
        throw new Error((json.error as string | undefined) || "No se pudo cargar la configuracion")
      }

      if (json.settings) {
        const nextSettings = normalizeStoreSettings(json.settings)
        const updatedAt = (json.updatedAt as string | null) ?? null
        applyLoadedSettings(nextSettings, updatedAt)
      }

      const warning = (json.warning as string | undefined) ?? null
      setLoadError(null)
      setLoadWarning(warning)
    } catch (error) {
      console.error("Error loading settings:", error)
      setLoadError(error instanceof Error ? error.message : "No se pudo cargar la configuracion")
    } finally {
      setLoadingRemote(false)
    }
  }, [applyLoadedSettings])

  const updateField = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    if (saveState !== "idle") {
      setSaveState("idle")
    }
  }

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true)
    try {
      const sigRes = await fetch(`/api/upload/signature?folder=store`)
      const sigJson = await sigRes.json() as Record<string, unknown>

      const fd = new FormData()
      fd.append("file", file)
      fd.append("signature", sigJson.signature as string)
      fd.append("timestamp", String(sigJson.timestamp))
      fd.append("api_key", sigJson.apiKey as string)
      fd.append("folder", sigJson.folder as string)

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigJson.cloudName as string}/image/upload`,
        { method: "POST", body: fd }
      )
      const cloudData = await cloudRes.json() as Record<string, unknown>
      if (cloudData.secure_url) {
        updateField("logo", cloudData.secure_url as string)
      }
    } catch (err) {
      console.error("Logo upload failed:", err)
    } finally {
      setLogoUploading(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  const hasChanges = useMemo(
    () => JSON.stringify(settings) !== savedSnapshot,
    [settings, savedSnapshot]
  )

  useEffect(() => {
    void loadFromDatabase()
  }, [loadFromDatabase])

  const handleSave = async () => {
    if (!hasChanges) {
      setSaveState("no_changes")
      return
    }

    setSaving(true)
    setSaveState("idle")

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })

      const json = await res.json() as Record<string, unknown>

      if (!res.ok) {
        throw new Error((json.error as string | undefined) || "No se pudo guardar la configuracion")
      }

      const serialized = JSON.stringify(settings)
      setSavedSnapshot(serialized)
      syncLocalCache(settings)
      setLoadError(null)
      setSaveState("saved")
      setLastSavedAt(new Date().toLocaleTimeString("es-MX"))
      void publishAppDataChangedClient({ entity: "settings", action: "updated", id: "default" })
    } catch (error) {
      console.error("Error saving settings:", error)
      setSaveState("error")
      setLoadError(error instanceof Error ? error.message : "No se pudo guardar la configuracion")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuracion</h1>
        <p className="text-muted-foreground">
          Administra la configuracion de tu tienda
        </p>
      </div>

      <div className="space-y-2">
        {loadingRemote && (
          <p className="text-sm text-muted-foreground">
            Cargando configuracion...
          </p>
        )}
        {loadWarning && (
          <p className="text-sm text-amber-600">
            {loadWarning}
          </p>
        )}
        {loadError && (
          <p className="text-sm text-destructive">
            {loadError}
          </p>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="store">Tienda</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informacion de la Tienda</CardTitle>
              <CardDescription>
                Configura la informacion basica de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nombre de la tienda</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => updateField("storeName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Email de contacto</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => updateField("storeEmail", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Telefono</Label>
                  <Input
                    id="storePhone"
                    value={settings.storePhone}
                    onChange={(e) => updateField("storePhone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Direccion</Label>
                  <Input
                    id="storeAddress"
                    value={settings.storeAddress}
                    onChange={(e) => updateField("storeAddress", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Descripcion</Label>
                <Input
                  id="storeDescription"
                  value={settings.storeDescription}
                  onChange={(e) => updateField("storeDescription", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo de la Tienda</CardTitle>
              <CardDescription>
                Sube el logo que aparecerá en el encabezado y pie de página de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {/* Preview */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted">
                  {settings.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.logo}
                      alt="Logo"
                      className="h-full w-full rounded-xl object-contain p-1"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    Formatos: JPG, PNG, SVG, WEBP. Recomendado: imagen cuadrada, mínimo 128×128px.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void handleLogoUpload(file)
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={logoUploading}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {logoUploading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</>
                      ) : (
                        <><Upload className="mr-2 h-4 w-4" />Subir logo</>
                      )}
                    </Button>
                    {settings.logo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateField("logo", "")}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Eliminar logo
                      </Button>
                    )}
                  </div>
                  {settings.logo && (
                    <p className="max-w-xs truncate text-xs text-muted-foreground">{settings.logo}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zona Horaria y Moneda</CardTitle>
              <CardDescription>
                Configura la zona horaria y moneda de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => updateField("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-mexico">America/Mexico_City (GMT-6)</SelectItem>
                      <SelectItem value="america-bogota">America/Bogota (GMT-5)</SelectItem>
                      <SelectItem value="america-lima">America/Lima (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => updateField("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mxn">Pesos mexicanos ($)</SelectItem>
                      <SelectItem value="usd">Dolares (USD)</SelectItem>
                      <SelectItem value="eur">Euros (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Principal
              </CardTitle>
              <CardDescription>
                Elige el color de marca de tu tienda. Se aplica en botones, badges, enlaces y elementos destacados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = settings.colorTheme === theme.id
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => updateField("colorTheme", theme.id)}
                      className={`group relative flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                        isSelected
                          ? "border-foreground shadow-md"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      {/* Color swatch */}
                      <div className="flex w-full items-center justify-between">
                        <div
                          className="h-10 w-10 rounded-full shadow-inner"
                          style={{ backgroundColor: theme.swatch }}
                        />
                        {isSelected && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <div>
                        <p className="font-semibold text-sm">{theme.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                      </div>

                      {/* Mini preview */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="rounded px-2 py-0.5 text-[11px] font-semibold text-white"
                          style={{ backgroundColor: theme.swatch }}
                        >
                          Botón
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${theme.swatch}20`,
                            color: theme.swatch,
                          }}
                        >
                          Badge
                        </span>
                      </div>

                      {/* Injected CSS preview — hidden style tag scoped to this button only */}
                    </button>
                  )
                })}
              </div>

              {/* Live preview */}
              <div className="mt-6 rounded-xl border bg-muted/30 p-5">
                <p className="mb-3 text-sm font-medium text-muted-foreground">Vista previa con el tema seleccionado:</p>
                {(() => {
                  const theme = getColorTheme(settings.colorTheme)
                  return (
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
                        style={{ backgroundColor: theme.swatch }}
                      >
                        <ShoppingCart className="mr-1.5 inline h-4 w-4" />
                        Agregar al carrito
                      </span>
                      <span
                        className="rounded-full px-3 py-1 text-sm font-bold text-white"
                        style={{ backgroundColor: theme.swatch }}
                      >
                        -30%
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: theme.swatch }}
                      >
                        $299.99
                      </span>
                      <span
                        className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                        style={{ borderColor: theme.swatch, color: theme.swatch }}
                      >
                        <Star className="h-3 w-3 fill-current" />
                        Más Vendidos
                      </span>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: theme.swatch }}
                      >
                        Nuevo
                      </span>
                    </div>
                  )
                })()}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Los cambios se aplican a toda la tienda al guardar. También se reflejan en el modo oscuro automáticamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuracion de Productos</CardTitle>
              <CardDescription>
                Configura como se muestran los productos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mostrar productos agotados</p>
                  <p className="text-sm text-muted-foreground">
                    Los productos sin stock se mostraran como agotados
                  </p>
                </div>
                <Switch
                  checked={settings.showOutOfStockProducts}
                  onCheckedChange={(checked) => updateField("showOutOfStockProducts", !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mostrar cantidad en stock</p>
                  <p className="text-sm text-muted-foreground">
                    Muestra cuantas unidades quedan disponibles
                  </p>
                </div>
                <Switch
                  checked={settings.showStockCount}
                  onCheckedChange={(checked) => updateField("showStockCount", !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir resenas de productos</p>
                  <p className="text-sm text-muted-foreground">
                    Los clientes pueden dejar resenas en productos
                  </p>
                </div>
                <Switch
                  checked={settings.allowProductReviews}
                  onCheckedChange={(checked) => updateField("allowProductReviews", !!checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Envio</CardTitle>
              <CardDescription>
                Configura las opciones de envio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="standardShippingCost">Costo de envio estandar</Label>
                  <Input
                    id="standardShippingCost"
                    type="number"
                    value={settings.standardShippingCost}
                    onChange={(e) => updateField("standardShippingCost", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Envio gratis desde ($)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => updateField("freeShippingThreshold", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones por Email</CardTitle>
              <CardDescription>
                Configura que notificaciones recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nuevos pedidos</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe un email cuando hay un nuevo pedido
                  </p>
                </div>
                <Switch
                  checked={settings.notifyNewOrders}
                  onCheckedChange={(checked) => updateField("notifyNewOrders", !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pagos fallidos</p>
                  <p className="text-sm text-muted-foreground">
                    Notificacion cuando un pago falla
                  </p>
                </div>
                <Switch
                  checked={settings.notifyFailedPayments}
                  onCheckedChange={(checked) => updateField("notifyFailedPayments", !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Stock bajo</p>
                  <p className="text-sm text-muted-foreground">
                    Alerta cuando un producto tiene poco stock
                  </p>
                </div>
                <Switch
                  checked={settings.notifyLowStock}
                  onCheckedChange={(checked) => updateField("notifyLowStock", !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nuevos usuarios</p>
                  <p className="text-sm text-muted-foreground">
                    Notificacion cuando se registra un nuevo usuario
                  </p>
                </div>
                <Switch
                  checked={settings.notifyNewUsers}
                  onCheckedChange={(checked) => updateField("notifyNewUsers", !!checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metodos de Pago</CardTitle>
              <CardDescription>
                Habilita o deshabilita metodos de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tarjetas de credito/debito</p>
                  <p className="text-sm text-muted-foreground">
                    Visa, Mastercard, American Express
                  </p>
                </div>
                <Switch
                  checked={settings.enableCardPayments}
                  onCheckedChange={(checked) => updateField("enableCardPayments", !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transferencia bancaria</p>
                  <p className="text-sm text-muted-foreground">
                    BCP, BBVA, Interbank, Scotiabank
                  </p>
                </div>
                <Switch
                  checked={settings.enableBankTransfer}
                  onCheckedChange={(checked) => updateField("enableBankTransfer", !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Billeteras digitales</p>
                  <p className="text-sm text-muted-foreground">
                    Yape, Plin, PayPal
                  </p>
                </div>
                <Switch
                  checked={settings.enableDigitalWallets}
                  onCheckedChange={(checked) => updateField("enableDigitalWallets", !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pago contra entrega</p>
                  <p className="text-sm text-muted-foreground">
                    El cliente paga al recibir el producto
                  </p>
                </div>
                <Switch
                  checked={settings.enableCashOnDelivery}
                  onCheckedChange={(checked) => updateField("enableCashOnDelivery", !!checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      <div className="flex flex-col items-end gap-2">
        {saveState === "saved" && (
          <p className="text-sm text-green-600">
            Cambios guardados correctamente
            {lastSavedAt ? ` (${lastSavedAt})` : ""}
          </p>
        )}
        {saveState === "error" && (
          <p className="text-sm text-destructive">
            No se pudieron guardar los cambios
          </p>
        )}
        {saveState === "no_changes" && (
          <p className="text-sm text-muted-foreground">
            No hay cambios pendientes por guardar
          </p>
        )}
        {saveState === "idle" && !hasChanges && (
          <p className="text-sm text-muted-foreground">
            Sin cambios pendientes
          </p>
        )}
        <Button type="button" onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  )
}

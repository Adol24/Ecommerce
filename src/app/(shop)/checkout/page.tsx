"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Check, Loader2, MapPin, CreditCard, ShoppingBag, Package, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useCartStore } from "@/stores/cart-store"
import { useUserStore } from "@/stores/user-store"
import { useToast } from "@/stores/toast-store"
import { insforge } from "@/lib/insforge"

const steps = [
  { id: 1, name: "Contacto" },
  { id: 2, name: "Envio" },
  { id: 3, name: "Pago" },
  { id: 4, name: "Confirmar" },
]

interface GuestData {
  email: string
  name: string
  phone: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { items, clearCart } = useCartStore()
  const { addresses, fetchAddresses } = useUserStore()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [storePhone, setStorePhone] = useState("")

  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const [guestData, setGuestData] = useState<GuestData>({
    email: "",
    name: "",
    phone: "",
  })
  const [isGuestMode, setIsGuestMode] = useState(!isAuthenticated)

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: true,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await insforge.database
        .from("app_settings")
        .select("settings")
        .single()
      if (data?.settings?.storePhone) {
        let phone = data.settings.storePhone.replace(/\D/g, "")
        if (!phone.startsWith("52") && !phone.startsWith("+52")) {
          phone = "52" + phone
        }
        setStorePhone(phone)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchAddresses()
      setIsGuestMode(false)
    }
  }, [user, isAuthenticated, fetchAddresses])

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(a => a.isDefault)
      setSelectedAddressId(defaultAddress?.id || addresses[0].id)
    }
  }, [addresses, selectedAddressId])

  const canContinueToStep2 = () => {
    if (isGuestMode) {
      return guestData.email && guestData.name && guestData.phone
    }
    return isAuthenticated
  }

  const canContinueToStep3 = () => {
    if (isGuestMode) {
      return newAddress.name && newAddress.phone && newAddress.address && newAddress.city && newAddress.state
    }
    return selectedAddressId
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
          <p className="text-muted-foreground">
            Agrega productos a tu carrito para continuar con el checkout
          </p>
          <Button asChild>
            <Link href="/products">Ver Productos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const selectedAddress = isGuestMode 
    ? newAddress 
    : addresses.find(a => a.id === selectedAddressId)

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discount = couponApplied ? couponApplied.discount : 0
  const subtotalAfterDiscount = subtotal - discount
  const shipping = subtotalAfterDiscount >= 200 ? 0 : 15
  const total = subtotalAfterDiscount + shipping

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    setCouponError("")
    
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        setCouponError(data.error)
        return
      }

      setCouponApplied({ code: data.code, discount: data.discount })
      toast.success("Cupón aplicado", `Descuento de $${data.discount.toFixed(2)}`)
    } catch {
      setCouponError("Error al aplicar el cupón")
    } finally {
      setApplyingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setCouponApplied(null)
    setCouponCode("")
    setCouponError("")
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress || items.length === 0) return

    setProcessing(true)

    try {
      const orderNum = `BT-${Date.now().toString(36).toUpperCase()}`

      const finalUserId = user?.id || guestData.email
      let finalAddressId = selectedAddressId

      if (isGuestMode && !isAuthenticated) {
        const { data: addressData, error: addressError } = await insforge.database
          .from("addresses")
          .insert([{
            user_id: finalUserId,
            name: newAddress.name,
            phone: newAddress.phone,
            address: newAddress.address,
            city: newAddress.city,
            state: newAddress.state,
            zip_code: newAddress.zipCode,
            is_default: true,
          }])
          .select()
          .single()

        if (addressError) throw addressError
        finalAddressId = addressData.id
      }

      const productIds = items.map(item => item.product.id)
      const { data: productsData } = await insforge.database
        .from("products")
        .select("id, cost")
        .in("id", productIds)

      const productsCostMap = new Map((productsData || []).map((p: Record<string, unknown>) => [p.id, Number(p.cost) || 0]))

      const { data: orderData, error: orderError } = await insforge.database
        .from("orders")
        .insert([{
          user_id: finalUserId,
          address_id: finalAddressId,
          order_number: orderNum,
          status: "PENDING",
          payment_status: paymentMethod === "cash" ? "PAID" : "PENDING",
          subtotal: subtotalAfterDiscount,
          shipping,
          total,
          payment_method: paymentMethod,
          notes: notes || null,
        }])
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        cost: productsCostMap.get(item.product.id) || 0,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await insforge.database
        .from("order_items")
        .insert(orderItems)

      if (itemsError) throw itemsError

      setOrderNumber(orderNum)
      setOrderComplete(true)
      clearCart()

      if (storePhone) {
        const productsList = items.map(item => 
          `- ${item.product.name} (x${item.quantity}): $${(item.product.price * item.quantity).toFixed(2)}`
        ).join("\n")

        const paymentMethodText = {
          card: "Tarjeta de Crédito/Débito",
          transfer: "Transferencia Bancaria",
          cash: "Pago contra entrega"
        }[paymentMethod] || paymentMethod

        const customerName = isGuestMode ? guestData.name : user?.name || "Cliente"

        const message = `*NUEVO PEDIDO - ${orderNum}*%0A%0A` +
          `*Cliente:* ${customerName}%0A` +
          `*Email:* ${isGuestMode ? guestData.email : user?.email || "N/A"}%0A` +
          `*Teléfono:* ${selectedAddress.phone}%0A` +
          `*Dirección:* ${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state}%0A%0A` +
          `*Productos:*%0A${productsList}%0A%0A` +
          `*Subtotal:* $${subtotalAfterDiscount.toFixed(2)}%0A` +
          (discount > 0 ? `*Descuento:* -${discount.toFixed(2)}%0A` : "") +
          `*Envío:* $${shipping.toFixed(2)}%0A` +
          `*Total:* $${total.toFixed(2)}%0A%0A` +
          `*Método de pago:* ${paymentMethodText}`

        const whatsappUrl = `https://wa.me/${storePhone}?text=${message}`
        window.open(whatsappUrl, "_blank")
      }

      toast.success("Pedido confirmado", `Número: ${orderNum}`)
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("Error", "Error al procesar el pedido. Intenta nuevamente.")
    } finally {
      setProcessing(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">¡Pedido Confirmado!</h1>
          <p className="text-muted-foreground text-center">
            Tu pedido ha sido procesado exitosamente
          </p>
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Número de pedido</p>
            <p className="text-xl font-bold">{orderNumber}</p>
          </div>
          {isGuestMode && (
            <p className="text-sm text-muted-foreground text-center">
              Te enviamos un correo de confirmación a <strong>{guestData.email}</strong>
            </p>
          )}
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/profile/orders">Ver Mis Pedidos</Link>
            </Button>
            <Button asChild>
              <Link href="/products">Seguir Comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="mb-8">
        <Button variant="ghost" asChild className="-ml-2 mb-4">
          <Link href="/cart">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver al Carrito
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`ml-2 hidden text-sm font-medium sm:block ${
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-12 sm:w-24 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            {/* Step 1: Contacto */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Información de Contacto</h2>
                  {!isAuthenticated && (
                    <Button 
                      variant="link" 
                      onClick={() => router.push("/login?callbackUrl=/checkout")}
                    >
                      ¿Ya tienes cuenta? Inicia sesión
                    </Button>
                  )}
                </div>

                {isGuestMode ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={guestData.email}
                        onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo *</Label>
                        <Input
                          id="name"
                          placeholder="Juan Pérez"
                          value={guestData.name}
                          onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                          id="phone"
                          placeholder="5523456789"
                          value={guestData.phone}
                          onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No necesitas crear una cuenta. Te enviaremos un correo de confirmación.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Envío */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Dirección de Envío</h2>
                
                {isGuestMode ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre para la dirección *</Label>
                      <Input
                        placeholder="Casa, Trabajo, etc."
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono de contacto *</Label>
                      <Input
                        placeholder="5523456789"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dirección *</Label>
                      <Input
                        placeholder="Calle, número, colonia"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Ciudad *</Label>
                        <Input
                          placeholder="Ciudad"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado *</Label>
                        <Input
                          placeholder="Estado"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CP</Label>
                        <Input
                          placeholder="12345"
                          value={newAddress.zipCode}
                          onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {addresses.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center">
                        <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground mb-4">No tienes direcciones guardadas</p>
                        <Button asChild>
                          <Link href="/profile/addresses/new?returnTo=/checkout">Agregar Dirección</Link>
                        </Button>
                      </div>
                    ) : (
                      <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`mb-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                              selectedAddressId === address.id
                                ? "border-primary bg-primary/5"
                                : "hover:border-muted-foreground/50"
                            }`}
                            onClick={() => setSelectedAddressId(address.id)}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value={address.id} className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{address.name}</p>
                                  {address.isDefault && (
                                    <Badge variant="secondary" className="text-xs">Predeterminada</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {address.phone}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {address.address}, {address.city}, {address.state} {address.zipCode}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </>
                )}

                <div>
                  <Label htmlFor="notes">Notas del pedido (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Instrucciones especiales para la entrega..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Pago */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Método de Pago</h2>
                
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div
                    className={`mb-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="card" />
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Tarjeta de Crédito/Débito</p>
                          <p className="text-sm text-muted-foreground">
                            Visa, Mastercard, American Express
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mb-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "transfer"
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setPaymentMethod("transfer")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="transfer" />
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Transferencia Bancaria</p>
                          <p className="text-sm text-muted-foreground">
                            Paga directamente a nuestra cuenta bancaria
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "cash"
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="cash" />
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Pago contra entrega</p>
                          <p className="text-sm text-muted-foreground">
                            Paga en efectivo al recibir tu pedido
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <p className="text-sm text-amber-800">
                      ⚠️ El pago con tarjeta requiere integración con Stripe. 
                      Esta funcionalidad estará disponible próximamente.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirmar */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Confirmar Pedido</h2>
                <p className="text-sm text-muted-foreground">
                  Por favor revisa los detalles de tu pedido antes de confirmar.
                </p>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-medium mb-2">Información de Contacto</h3>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {isGuestMode ? guestData.name : user?.name}
                    </p>
                    <p>{isGuestMode ? guestData.email : user?.email}</p>
                    <p>{selectedAddress?.phone}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-medium mb-2">Dirección de Envío</h3>
                  {selectedAddress ? (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{selectedAddress.name}</p>
                      <p>{selectedAddress.phone}</p>
                      <p>{selectedAddress.address}</p>
                      <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}</p>
                    </div>
                  ) : (
                    <p className="text-destructive">No hay dirección seleccionada</p>
                  )}
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-medium mb-2">Método de Pago</h3>
                  <p className="text-sm text-muted-foreground">
                    {paymentMethod === "card" && "Tarjeta de Crédito/Débito"}
                    {paymentMethod === "transfer" && "Transferencia Bancaria"}
                    {paymentMethod === "cash" && "Pago contra entrega"}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-medium mb-2">Productos ({items.length})</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                          {item.product.images[0] && (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          $ {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-6" />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(s => s - 1)}
                disabled={currentStep === 1}
              >
                Atrás
              </Button>
              {currentStep < 4 ? (
                <Button 
                  onClick={() => setCurrentStep(s => s + 1)}
                  disabled={
                    (currentStep === 1 && !canContinueToStep2()) ||
                    (currentStep === 2 && !canContinueToStep3())
                  }
                >
                  Continuar
                </Button>
              ) : (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handlePlaceOrder}
                  disabled={processing || !selectedAddressId}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Pedido"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Code */}
                {currentStep >= 2 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Código de cupón</Label>
                    {couponApplied ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-600">Aplicado</Badge>
                          <span className="text-sm font-mono">{couponApplied.code}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={removeCoupon} className="h-6 text-red-500">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Código"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          onClick={applyCoupon}
                          disabled={!couponCode.trim() || applyingCoupon}
                        >
                          {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                        </Button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-xs text-red-500">{couponError}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span>$ {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento</span>
                    <span>-$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>{shipping === 0 ? "Gratis" : `$ ${shipping.toFixed(2)}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600">🎉 Envío gratis en pedidos mayores a $ 200</p>
                )}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>$ {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

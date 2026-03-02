"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ShippingForm() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Informacion de Envio</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" placeholder="Juan" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" placeholder="Perez" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo Electronico</Label>
        <Input id="email" type="email" placeholder="juan@ejemplo.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefono</Label>
        <Input id="phone" type="tel" placeholder="+52 55 1234 5678" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Direccion</Label>
        <Input id="address" placeholder="Av. Principal 123" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" placeholder="Ciudad de México" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Select>
            <SelectTrigger id="state">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cdmx">Ciudad de México</SelectItem>
              <SelectItem value="jalisco">Jalisco</SelectItem>
              <SelectItem value="nuevo-leon">Nuevo León</SelectItem>
              <SelectItem value="puebla">Puebla</SelectItem>
              <SelectItem value="veracruz">Veracruz</SelectItem>
              <SelectItem value="guanajuato">Guanajuato</SelectItem>
              <SelectItem value="chihuahua">Chihuahua</SelectItem>
              <SelectItem value="sonora">Sonora</SelectItem>
              <SelectItem value="coahuila">Coahuila</SelectItem>
              <SelectItem value="tamaulipas">Tamaulipas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">Codigo Postal</Label>
          <Input id="zip" placeholder="06600" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas adicionales (opcional)</Label>
        <Input
          id="notes"
          placeholder="Instrucciones de entrega, referencias, etc."
        />
      </div>
    </div>
  )
}

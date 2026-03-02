"use client"

import { useEffect, useState } from "react"
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, Truck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAdminStore, type AdminOrder } from "@/stores/admin-store"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  PENDING: { label: "Pendiente", variant: "secondary", className: "bg-yellow-500" },
  PROCESSING: { label: "Procesando", variant: "default", className: "bg-blue-500" },
  SHIPPED: { label: "Enviado", variant: "default", className: "bg-purple-500" },
  DELIVERED: { label: "Entregado", variant: "default", className: "bg-green-500" },
  CANCELLED: { label: "Cancelado", variant: "destructive", className: "" },
}

const paymentMethodLabels: Record<string, string> = {
  card: "Tarjeta",
  transfer: "Transferencia",
  cash: "Contra entrega",
}

function OrdersSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function AdminOrdersPage() {
  const { orders, ordersTotal, loading, fetchOrders, updateOrderStatus, updatePaymentStatus } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (statusFilter !== "all") {
      fetchOrders({ status: statusFilter })
    } else {
      fetchOrders()
    }
  }, [statusFilter, fetchOrders])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const pendingOrders = orders.filter((o) => o.status === "PENDING").length
  const processingOrders = orders.filter((o) => o.status === "PROCESSING").length
  const shippedOrders = orders.filter((o) => o.status === "SHIPPED").length
  const totalRevenue = orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + o.total, 0)
  const pendingPayments = orders.filter((o) => o.paymentStatus === "PENDING" && o.status !== "CANCELLED").length

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    try {
      await updatePaymentStatus(orderId, newPaymentStatus)
    } catch (error) {
      console.error("Error updating payment status:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">
            Administra los pedidos de tu tienda
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ordersTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{pendingPayments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Procesando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{processingOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{shippedOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$ {totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pedidos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDING">Pendientes</SelectItem>
            <SelectItem value="PROCESSING">Procesando</SelectItem>
            <SelectItem value="SHIPPED">Enviados</SelectItem>
            <SelectItem value="DELIVERED">Entregados</SelectItem>
            <SelectItem value="CANCELLED">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading && orders.length === 0 ? (
        <OrdersSkeleton />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron pedidos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig["PENDING"]
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.itemCount} {order.itemCount === 1 ? "producto" : "productos"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{order.customer.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">$ {order.total.toFixed(2)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={order.paymentStatus} 
                            onValueChange={(value) => handlePaymentStatusChange(order.id, value)}
                            disabled={order.status === "CANCELLED"}
                          >
                            <SelectTrigger className="w-[130px] h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Por pagar</SelectItem>
                              <SelectItem value="PAID">Pagado</SelectItem>
                              <SelectItem value="FAILED">Fallido</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className={status.className}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedOrder(order); setDetailsOpen(true) }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {order.status === "PENDING" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "PROCESSING")}>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Marcar procesando
                                </DropdownMenuItem>
                              )}
                              {order.status === "PROCESSING" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "SHIPPED")}>
                                  <Truck className="mr-2 h-4 w-4" />
                                  Marcar enviado
                                </DropdownMenuItem>
                              )}
                              {order.status === "SHIPPED" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "DELIVERED")}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Marcar entregado
                                </DropdownMenuItem>
                              )}
                              {(order.status === "PENDING" || order.status === "PROCESSING") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleStatusChange(order.id, "CANCELLED")}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar pedido
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge variant={statusConfig[selectedOrder.status]?.variant} className={statusConfig[selectedOrder.status]?.className}>
                  {statusConfig[selectedOrder.status]?.label}
                </Badge>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-2">Información del Cliente</h4>
                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                  <p><strong>Nombre:</strong> {selectedOrder.customer.name}</p>
                  <p><strong>Teléfono:</strong> {selectedOrder.shippingAddress.name}</p>
                  <p><strong>Dirección:</strong> {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-semibold mb-2">Productos</h4>
                <div className="rounded-lg border">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-medium">$ {item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Totals */}
              <div>
                <h4 className="font-semibold mb-2">Pago</h4>
                <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método de pago:</span>
                    <span>{paymentMethodLabels[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>$ {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío:</span>
                    <span>{selectedOrder.shipping === 0 ? "Gratis" : `$ ${selectedOrder.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

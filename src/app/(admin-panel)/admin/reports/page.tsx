"use client"

import { useEffect, useState } from "react"
import { DollarSign, TrendingUp, ShoppingCart, Package, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { insforge } from "@/lib/insforge"

interface OrderItem {
  product_id: string
  name: string
  price: number
  cost: number
  quantity: number
  total: number
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  shipping: number
  total: number
  created_at: string
  items: OrderItem[]
}

interface ProductSales {
  productId: string
  name: string
  quantity: number
  revenue: number
  profit: number
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    averageOrder: 0,
  })
  const [topProducts, setTopProducts] = useState<ProductSales[]>([])
  const [dailySales, setDailySales] = useState<{ date: string; orders: number; revenue: number }[]>([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const daysAgo = parseInt(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      const { data: ordersData, error } = await insforge.database
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          payment_status,
          subtotal,
          shipping,
          total,
          created_at,
          items:order_items(*)
        `)
        .gte("created_at", startDate.toISOString())
        .in("status", ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"])
        .order("created_at", { ascending: false })

      if (error) throw error

      const orders = (ordersData || []) as unknown as Order[]
      setOrders(orders)

      const paidOrders = orders.filter(o => o.payment_status === "PAID")
      
      let totalRevenue = 0
      let totalCost = 0
      
      const productSalesMap = new Map<string, ProductSales>()

      paidOrders.forEach(order => {
        totalRevenue += Number(order.total) || 0
        
        const orderItems = (order.items || []) as unknown as OrderItem[]
        orderItems.forEach(item => {
          const itemCost = Number(item.cost) || 0
          const itemRevenue = Number(item.total) || 0
          const itemProfit = itemRevenue - (itemCost * (item.quantity || 1))
          totalCost += itemCost * (item.quantity || 1)

          const existing = productSalesMap.get(item.product_id)
          if (existing) {
            existing.quantity += item.quantity || 1
            existing.revenue += itemRevenue
            existing.profit += itemProfit
          } else {
            productSalesMap.set(item.product_id, {
              productId: item.product_id,
              name: item.name || "Producto",
              quantity: item.quantity || 1,
              revenue: itemRevenue,
              profit: itemProfit,
            })
          }
        })
      })

      const totalProfit = totalRevenue - totalCost

      setStats({
        totalOrders: paidOrders.length,
        totalRevenue,
        totalProfit,
        averageOrder: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
      })

      const topProductsArray = Array.from(productSalesMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
      setTopProducts(topProductsArray)

      const dailyMap = new Map<string, { orders: number; revenue: number }>()
      paidOrders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString("es-MX")
        const existing = dailyMap.get(date) || { orders: 0, revenue: 0 }
        existing.orders += 1
        existing.revenue += Number(order.total) || 0
        dailyMap.set(date, existing)
      })

      const dailyArray = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .reverse()
        .slice(-14)
      setDailySales(dailyArray)

    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period])

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`

  const maxDailyRevenue = Math.max(...dailySales.map(d => d.revenue), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">
            Estadísticas y análisis de ventas
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
            <SelectItem value="365">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos Pagados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">Ventas brutas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Ganancia Neta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalProfit)}</p>
            <p className="text-xs text-muted-foreground">Ingresos - Costos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ticket Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(stats.averageOrder)}</p>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            ) : dailySales.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">No hay datos en este período</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailySales.map((day, index) => (
                  <div key={day.date} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{day.date}</span>
                      <span className="font-medium">{formatCurrency(day.revenue)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(day.revenue / maxDailyRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            ) : topProducts.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">No hay productos vendidos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.quantity} unidades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.revenue)}</p>
                      <p className={`text-xs ${product.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {product.profit >= 0 ? "+" : ""}{formatCurrency(product.profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen de Ganancias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Ingresos Totales</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Costo de Productos</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalRevenue - stats.totalProfit)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Ganancia Neta</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalProfit)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

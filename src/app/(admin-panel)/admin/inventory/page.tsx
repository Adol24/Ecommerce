"use client"

import { useEffect, useState } from "react"
import { Search, AlertTriangle, Package, DollarSign, TrendingUp, Pencil, Check, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { insforge } from "@/lib/insforge"

interface InventoryProduct {
  id: string
  name: string
  slug: string
  price: number
  cost: number
  stock: number
  category: string
  brand: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [stockFilter, setStockFilter] = useState("all")
  const [lowStockThreshold, setLowStockThreshold] = useState(5)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCost, setEditCost] = useState("")
  const [editStock, setEditStock] = useState("")
  const [saving, setSaving] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await insforge.database
        .from("products")
        .select(`
          id,
          name,
          slug,
          price,
          cost,
          stock,
          category:categories(name),
          brand:brands(name)
        `)
        .eq("is_active", true)
        .order("stock", { ascending: true })

      if (error) throw error

      const formattedProducts: InventoryProduct[] = (data || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.name as string,
        slug: p.slug as string,
        price: Number(p.price) || 0,
        cost: Number(p.cost) || 0,
        stock: Number(p.stock) || 0,
        category: (p.category as Record<string, unknown>)?.name as string || "",
        brand: (p.brand as Record<string, unknown>)?.name as string || "",
      }))

      setProducts(formattedProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesStock = true
    if (stockFilter === "low") {
      matchesStock = product.stock > 0 && product.stock <= lowStockThreshold
    } else if (stockFilter === "out") {
      matchesStock = product.stock === 0
    } else if (stockFilter === "in") {
      matchesStock = product.stock > lowStockThreshold
    }
    
    return matchesSearch && matchesStock
  })

  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length
  const outOfStockProducts = products.filter(p => p.stock === 0).length
  
  const inventoryValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0)
  const retailValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  const potentialProfit = retailValue - inventoryValue

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Agotado", variant: "destructive" as const }
    if (stock <= lowStockThreshold) return { label: "Bajo", variant: "secondary" as const }
    return { label: "Normal", variant: "default" as const }
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`

  const startEditing = (product: InventoryProduct) => {
    setEditingId(product.id)
    setEditCost(product.cost.toString())
    setEditStock(product.stock.toString())
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditCost("")
    setEditStock("")
  }

  const saveEdit = async (productId: string) => {
    const newCost = parseFloat(editCost) || 0
    const newStock = parseInt(editStock) || 0

    setSaving(productId)
    try {
      const { error } = await insforge.database
        .from("products")
        .update({
          cost: newCost,
          stock: newStock,
        })
        .eq("id", productId)

      if (error) throw error

      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, cost: newCost, stock: newStock }
          : p
      ))
      cancelEditing()
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Error al guardar los cambios")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">
            Controla el stock y valor de tu inventario
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Umbral bajo stock:</span>
          <Input 
            type="number" 
            className="w-20 h-9"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            min={1}
            max={100}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalProducts}</p>
            <p className="text-xs text-muted-foreground">{totalStock} unidades en stock</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{lowStockProducts}</p>
            <p className="text-xs text-muted-foreground">Menores a {lowStockThreshold} unidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Agotados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
            <p className="text-xs text-muted-foreground">Sin unidades disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(inventoryValue)}</p>
            <p className="text-xs text-muted-foreground">Costo total del stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Ganancia Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(potentialProfit)}</p>
            <p className="text-xs text-muted-foreground">Venta - Costo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
            <SelectItem value="out">Agotados</SelectItem>
            <SelectItem value="in">En stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Ganancia</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead>Ganancia</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const profit = product.price - product.cost
                    const profitMargin = product.cost > 0 ? ((profit / product.cost) * 100) : 0
                    const stockStatus = getStockStatus(product.stock)
                    const isEditing = editingId === product.id
                    const isSaving = saving === product.id
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              className="h-8 w-24"
                              value={editCost}
                              onChange={(e) => setEditCost(e.target.value)}
                            />
                          ) : (
                            <span className="text-muted-foreground">{formatCurrency(product.cost)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(product.price)}</span>
                        </TableCell>
                        <TableCell>
                          <div className={profit > 0 ? "text-green-600" : "text-red-600"}>
                            <span className="font-medium">{formatCurrency(profit)}</span>
                            <span className="text-xs ml-1">({profitMargin.toFixed(1)}%)</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              className="h-8 w-20"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                            />
                          ) : (
                            <span className={`font-medium ${product.stock === 0 ? "text-red-600" : product.stock <= lowStockThreshold ? "text-yellow-600" : ""}`}>
                              {product.stock}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-600"
                                onClick={() => saveEdit(product.id)}
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-600"
                                onClick={cancelEditing}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => startEditing(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
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
    </div>
  )
}

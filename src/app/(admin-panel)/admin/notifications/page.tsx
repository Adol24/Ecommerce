"use client"

import { useEffect, useState, useCallback } from "react"
import { Bell, Check, CheckCheck, Trash2, Loader2 } from "lucide-react"
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
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedClient } from "@/lib/realtime-publish-client"
import { useAppRealtimeRefresh } from "@/hooks/useAppRealtimeRefresh"

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

const typeConfig: Record<string, { label: string; className: string }> = {
  new_order:        { label: "Nuevo Pedido",      className: "bg-blue-500 text-white" },
  stock_low:        { label: "Stock Bajo",         className: "bg-yellow-500 text-white" },
  payment_received: { label: "Pago Recibido",      className: "bg-green-500 text-white" },
  order_cancelled:  { label: "Pedido Cancelado",   className: "bg-destructive text-white" },
}

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Ahora mismo"
  if (minutes < 60) return `Hace ${minutes}min`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days}d`
  return d.toLocaleDateString("es-MX")
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await insforge.database
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Auto-refresh when realtime events arrive for "notifications" entity
  useAppRealtimeRefresh(["notifications"], fetchNotifications)

  const markAsRead = async (id: string) => {
    try {
      await insforge.database
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))

      // Publish so the bell count updates in real time
      await publishAppDataChangedClient({ entity: "notifications", action: "updated", id })
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const markAllAsRead = async () => {
    setMarkingAllRead(true)
    try {
      await insforge.database
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false)

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

      await publishAppDataChangedClient({ entity: "notifications", action: "updated" })
    } catch (error) {
      console.error("Error marking all as read:", error)
    } finally {
      setMarkingAllRead(false)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await insforge.database.from("notifications").delete().eq("id", id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      await publishAppDataChangedClient({ entity: "notifications", action: "deleted", id })
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const newOrders = notifications.filter((n) => n.type === "new_order").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            Historial de alertas y notificaciones del sistema
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} disabled={markingAllRead}>
            {markingAllRead ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Marcar todo como leído
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin Leer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nuevos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{newOrders}</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {loading ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-60" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">No hay notificaciones</h3>
            <p className="text-sm text-muted-foreground">
              Las notificaciones aparecerán aquí en tiempo real
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => {
                  const config = typeConfig[notification.type] ?? typeConfig["new_order"]
                  return (
                    <TableRow
                      key={notification.id}
                      className={!notification.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}
                    >
                      <TableCell>
                        <Badge className={config.className}>{config.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                          <span className="font-medium">{notification.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {notification.message || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!notification.is_read && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              title="Marcar como leído"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Eliminar"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

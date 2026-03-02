import { create } from "zustand"
import { insforge } from "@/lib/insforge"
import { publishAppDataChangedClient } from "@/lib/realtime-publish-client"

interface DashboardStats {
  totalProducts: number
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
}

interface OrdersByStatus {
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customer: string
  email: string
  total: number
  status: string
  createdAt: string
}

export interface AdminOrder {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
  }
  status: string
  paymentStatus: string
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  items: {
    name: string
    quantity: number
    price: number
    total: number
    image: string
  }[]
  itemCount: number
  createdAt: string
  updatedAt: string
}

interface AdminUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  status: string
  createdAt: string
  orders: number
  totalSpent: number
}

interface AdminState {
  stats: DashboardStats | null
  ordersByStatus: OrdersByStatus | null
  recentOrders: RecentOrder[]
  orders: AdminOrder[]
  ordersTotal: number
  users: AdminUser[]
  loading: boolean
  error: string | null

  fetchDashboard: () => Promise<void>
  fetchOrders: (params?: { status?: string; limit?: number; offset?: number }) => Promise<void>
  fetchUsers: (params?: { role?: string; status?: string }) => Promise<void>
  updateOrderStatus: (id: string, status: string) => Promise<void>
  updatePaymentStatus: (id: string, paymentStatus: string) => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  ordersByStatus: null,
  recentOrders: [],
  orders: [],
  ordersTotal: 0,
  users: [],
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null })
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        insforge.database.from("products").select("id", { count: "exact" }),
        insforge.database.from("orders").select("id, total, status, payment_status, created_at"),
        insforge.database.from("user_profiles").select("id", { count: "exact" }).eq("role", "CUSTOMER"),
      ])

      const totalProducts = productsRes.count || 0
      const totalCustomers = usersRes.count || 0
      const orders = ordersRes.data || []
      const totalOrders = orders.length
      
      const paidOrders = orders.filter((o) => o.payment_status === "PAID")
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

      const ordersByStatus: OrdersByStatus = {
        pending: orders.filter((o) => o.status === "PENDING").length,
        processing: orders.filter((o) => o.status === "PROCESSING").length,
        shipped: orders.filter((o) => o.status === "SHIPPED").length,
        delivered: orders.filter((o) => o.status === "DELIVERED").length,
        cancelled: orders.filter((o) => o.status === "CANCELLED").length,
      }

      const recentOrders: RecentOrder[] = paidOrders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((o) => ({
          id: o.id as string,
          orderNumber: o.id as string,
          customer: "Cliente",
          email: "",
          total: Number(o.total) || 0,
          status: o.status as string,
          createdAt: o.created_at as string,
        }))

      set({
        stats: { totalProducts, totalCustomers, totalOrders, totalRevenue },
        ordersByStatus,
        recentOrders,
        loading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchOrders: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      let query = insforge.database
        .from("orders")
        .select(`
          *,
          items:order_items(*),
          address:addresses(*)
        `)
        .order("created_at", { ascending: false })

      if (params.status) {
        query = query.eq("status", params.status.toUpperCase())
      }
      if (params.limit) {
        query = query.limit(params.limit)
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) throw new Error(error.message)

      const orders: AdminOrder[] = (data || []).map((order) => {
        const o = order as Record<string, unknown>
        const addr = o.address as Record<string, unknown> | null
        const items = (o.items as Record<string, unknown>[]) || []

        return {
          id: o.id as string,
          orderNumber: o.order_number as string,
          customer: {
            name: (addr?.name as string) || "Cliente",
            email: "",
          },
          status: o.status as string,
          paymentStatus: (o.payment_status as string) || "PENDING",
          subtotal: Number(o.subtotal) || 0,
          shipping: Number(o.shipping) || 0,
          total: Number(o.total) || 0,
          paymentMethod: o.payment_method as string,
          shippingAddress: {
            name: (addr?.name as string) || "",
            address: (addr?.address as string) || "",
            city: (addr?.city as string) || "",
            state: (addr?.state as string) || "",
            zipCode: (addr?.zip_code as string) || "",
          },
          items: items.map((item) => ({
            name: item.name as string,
            quantity: item.quantity as number,
            price: Number(item.price) || 0,
            total: Number(item.total) || 0,
            image: "",
          })),
          itemCount: items.length,
          createdAt: o.created_at as string,
          updatedAt: o.updated_at as string,
        }
      })

      set({
        orders,
        ordersTotal: count || orders.length,
        loading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchUsers: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      let query = insforge.database
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (params.role) {
        query = query.eq("role", params.role)
      }
      if (params.status) {
        query = query.eq("status", params.status)
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)

      const users: AdminUser[] = (data || []).map((user) => {
        const u = user as Record<string, unknown>
        return {
          id: u.id as string,
          name: u.name as string,
          email: u.email as string,
          avatar: u.avatar as string | undefined,
          role: u.role as string,
          status: u.status as string,
          createdAt: u.created_at as string,
          orders: 0,
          totalSpent: 0,
        }
      })

      set({ users, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ loading: true, error: null })
    try {
      const { error } = await insforge.database
        .from("orders")
        .update({ status: status.toUpperCase() })
        .eq("id", id)

      if (error) throw new Error(error.message)

      await publishAppDataChangedClient({
        entity: "orders",
        action: "updated",
        id,
      })

      await get().fetchOrders()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    set({ loading: true, error: null })
    try {
      const { error } = await insforge.database
        .from("orders")
        .update({ payment_status: paymentStatus.toUpperCase() })
        .eq("id", id)

      if (error) throw new Error(error.message)

      await publishAppDataChangedClient({
        entity: "orders",
        action: "updated",
        id,
      })

      await get().fetchOrders()
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },
}))

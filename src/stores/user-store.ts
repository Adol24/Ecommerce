import { create } from "zustand"
import { insforge } from "@/lib/insforge"
import type { Address, Order, OrderItem } from "@/types"

interface AddressInput {
  label: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  isDefault?: boolean
}

interface UserState {
  addresses: Address[]
  orders: Order[]
  loading: boolean
  error: string | null

  fetchAddresses: () => Promise<void>
  fetchOrders: () => Promise<void>
  createAddress: (data: AddressInput) => Promise<Address>
  updateAddress: (id: string, data: AddressInput) => Promise<Address>
  deleteAddress: (id: string) => Promise<void>
}

function transformAddressFromDB(item: Record<string, unknown>): Address {
  return {
    id: item.id as string,
    userId: item.user_id as string,
    label: item.label as string,
    name: item.name as string,
    phone: item.phone as string,
    address: item.address as string,
    city: item.city as string,
    state: item.state as string,
    zipCode: item.zip_code as string,
    isDefault: item.is_default as boolean,
  }
}

function transformOrderFromDB(item: Record<string, unknown>): Order {
  return {
    id: item.id as string,
    userId: item.user_id as string,
    addressId: item.address_id as string,
    orderNumber: item.order_number as string,
    status: (item.status as Order["status"]) || "PENDING",
    subtotal: Number(item.subtotal) || 0,
    shipping: Number(item.shipping) || 0,
    total: Number(item.total) || 0,
    paymentMethod: item.payment_method as string,
    notes: item.notes as string | undefined,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
  }
}

async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  try {
    const json = (await response.json()) as { error?: string }
    return new Error(json.error || fallbackMessage)
  } catch {
    return new Error(fallbackMessage)
  }
}

export const useUserStore = create<UserState>((set) => ({
  addresses: [],
  orders: [],
  loading: false,
  error: null,

  fetchAddresses: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/addresses")
      if (response.status === 401) {
        set({ addresses: [], loading: false })
        return
      }
      if (!response.ok) {
        throw await parseApiError(response, "Error al obtener direcciones")
      }

      const data = (await response.json()) as Record<string, unknown>[]
      const addresses = (data || []).map(transformAddressFromDB)
      set({ addresses, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const { data: sessionData } = await insforge.auth.getCurrentSession()
      if (!sessionData?.session?.user?.id) {
        set({ orders: [], loading: false })
        return
      }

      const { data, error } = await insforge.database
        .from("orders")
        .select(`
          *,
          items:order_items(*),
          address:addresses(*)
        `)
        .eq("user_id", sessionData.session.user.id)
        .order("created_at", { ascending: false })

      if (error) throw new Error(error.message)

      const orders = (data || []).map((order) => ({
        ...transformOrderFromDB(order),
        items: ((order as Record<string, unknown>).items as Record<string, unknown>[])?.map((item): OrderItem => ({
          id: item.id as string,
          orderId: item.order_id as string,
          productId: item.product_id as string,
          name: item.name as string,
          price: Number(item.price) || 0,
          quantity: item.quantity as number,
          total: Number(item.total) || 0,
        })) || [],
      }))

      set({ orders, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createAddress: async (inputData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      })

      if (!response.ok) {
        throw await parseApiError(response, "Error al guardar direccion")
      }

      const data = (await response.json()) as Record<string, unknown>
      const address = transformAddressFromDB(data)
      set((state) => ({
        addresses: inputData.isDefault
          ? [address, ...state.addresses.map((a) => ({ ...a, isDefault: false }))]
          : [...state.addresses, address],
        loading: false,
      }))

      return address
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateAddress: async (id, inputData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      })

      if (!response.ok) {
        throw await parseApiError(response, "Error al actualizar direccion")
      }

      const data = (await response.json()) as Record<string, unknown>
      const address = transformAddressFromDB(data)
      set((state) => ({
        addresses: state.addresses.map((a) =>
          a.id === id
            ? address
            : inputData.isDefault
              ? { ...a, isDefault: false }
              : a
        ),
        loading: false,
      }))

      return address
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  deleteAddress: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw await parseApiError(response, "Error al eliminar direccion")
      }

      set((state) => ({
        addresses: state.addresses.filter((a) => a.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },
}))

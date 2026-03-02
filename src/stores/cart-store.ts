import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product, CartItem } from "@/types"

const CART_EXPIRATION_HOURS = 24

interface CartState {
  items: CartItem[]
  lastUpdated: number

  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Computed helpers
  getSubtotal: () => number
  getItemCount: () => number
  isExpired: () => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastUpdated: Date.now(),

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              lastUpdated: Date.now(),
            }
          }

          return {
            items: [...state.items, { product, quantity }],
            lastUpdated: Date.now(),
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
          lastUpdated: Date.now(),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
          lastUpdated: Date.now(),
        }))
      },

      clearCart: () => {
        set({ items: [], lastUpdated: Date.now() })
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      isExpired: () => {
        const { lastUpdated } = get()
        const hoursPassed = (Date.now() - lastUpdated) / (1000 * 60 * 60)
        return hoursPassed > CART_EXPIRATION_HOURS
      },
    }),
    {
      name: "basictech-cart",
      onRehydrateStorage: () => (state) => {
        if (state?.isExpired()) {
          state.clearCart()
        }
      },
    }
  )
)

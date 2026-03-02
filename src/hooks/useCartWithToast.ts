import { useCallback } from "react"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/stores/toast-store"
import type { Product } from "@/types"

export function useCartWithToast() {
  const { addItem, removeItem, updateQuantity, clearCart, items } = useCartStore()
  const { toast } = useToast()

  const handleAddItem = useCallback(
    (product: Product, quantity?: number) => {
      addItem(product, quantity)
      toast.success(
        "Agregado al carrito",
        `${product.name.substring(0, 30)}${product.name.length > 30 ? "..." : ""}`
      )
    },
    [addItem, toast]
  )

  const handleRemoveItem = useCallback(
    (productId: string) => {
      const item = items.find((i) => i.product.id === productId)
      removeItem(productId)
      toast.info("Eliminado del carrito", item?.product.name)
    },
    [removeItem, items, toast]
  )

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      updateQuantity(productId, quantity)
    },
    [updateQuantity]
  )

  const handleClearCart = useCallback(() => {
    clearCart()
    toast.info("Carrito vaciado")
  }, [clearCart, toast])

  return {
    items,
    addItem: handleAddItem,
    removeItem: handleRemoveItem,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    getSubtotal: useCartStore.getState().getSubtotal,
    getItemCount: useCartStore.getState().getItemCount,
  }
}

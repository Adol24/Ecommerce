import { create } from 'zustand'
import { insforge } from '@/lib/insforge'
import type { Product } from '@/types'

interface FavoriteItem {
  id: string
  productId: string
  product: Product
  createdAt: string
}

interface FavoritesState {
  items: FavoriteItem[]
  isLoading: boolean

  loadFavorites: (userId: string) => Promise<void>
  addFavorite: (userId: string, product: Product) => Promise<void>
  removeFavorite: (userId: string, productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  isLoading: false,

  loadFavorites: async (userId: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await insforge.database
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
          products!favorites_product_id_fkey (
            id,
            name,
            slug,
            description,
            price,
            compare_price,
            stock,
            images,
            specs,
            is_new,
            is_featured,
            is_active,
            category_id,
            brand_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading favorites:', error)
        set({ items: [], isLoading: false })
        return
      }

      const items: FavoriteItem[] = (data || []).map((fav: Record<string, unknown>) => {
        const product = fav.products as Record<string, unknown>
        return {
          id: fav.id as string,
          productId: fav.product_id as string,
          createdAt: fav.created_at as string,
          product: {
            id: product?.id as string,
            name: product?.name as string,
            slug: product?.slug as string,
            description: product?.description as string,
            price: Number(product?.price) || 0,
            originalPrice: product?.compare_price ? Number(product?.compare_price) : undefined,
            stock: Number(product?.stock) || 0,
            images: (product?.images as string[]) || [],
            specs: (product?.specs as Record<string, string>) || {},
            isNew: product?.is_new as boolean,
            isFeatured: product?.is_featured as boolean,
            isActive: product?.is_active as boolean,
            categoryId: product?.category_id as string,
            brandId: product?.brand_id as string,
            category: '',
            categoryName: '',
            brand: '',
            brandSlug: '',
            rating: 4.5,
          },
        }
      })

      set({ items, isLoading: false })
    } catch (err) {
      console.error('Error loading favorites:', err)
      set({ items: [], isLoading: false })
    }
  },

  addFavorite: async (userId: string, product: Product) => {
    try {
      const { data, error } = await insforge.database
        .from('favorites')
        .insert([{
          user_id: userId,
          product_id: product.id,
        }])
        .select('id, created_at')
        .single()

      if (error) {
        if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
          return
        }
        console.error('Error adding favorite:', error)
        return
      }

      const newItem: FavoriteItem = {
        id: data.id,
        productId: product.id,
        product,
        createdAt: data.created_at,
      }

      set((state) => ({
        items: [newItem, ...state.items],
      }))
    } catch (err) {
      console.error('Error adding favorite:', err)
    }
  },

  removeFavorite: async (userId: string, productId: string) => {
    try {
      const { error } = await insforge.database
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)

      if (error) {
        console.error('Error removing favorite:', error)
        return
      }

      set((state) => ({
        items: state.items.filter((item) => item.productId !== productId),
      }))
    } catch (err) {
      console.error('Error removing favorite:', err)
    }
  },

  isFavorite: (productId: string) => {
    return get().items.some((item) => item.productId === productId)
  },

  clearFavorites: () => {
    set({ items: [] })
  },
}))

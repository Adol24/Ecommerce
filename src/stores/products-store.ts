import { create } from "zustand"
import { insforge } from "@/lib/insforge"
import { DEFAULT_PRODUCT_PRICE_MAX } from "@/lib/product-filters"
import type { Product, Category, Brand, FilterState } from "@/types"

interface ProductsState {
  products: Product[]
  categories: Category[]
  brands: Brand[]
  featuredProducts: Product[]
  filters: FilterState
  loading: boolean
  error: string | null

  fetchProducts: (filters?: Partial<FilterState>) => Promise<void>
  fetchFeaturedProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchBrands: () => Promise<void>
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
}

const defaultFilters: FilterState = {
  categories: [],
  brands: [],
  priceRange: [0, DEFAULT_PRODUCT_PRICE_MAX],
  sortBy: "newest",
}

function transformProductFromDB(item: Record<string, unknown>): Product {
  return {
    id: item.id as string,
    name: item.name as string,
    slug: item.slug as string,
    brand: (item.brand as Record<string, unknown>)?.name as string || "",
    brandId: item.brand_id as string,
    category: (item.category as Record<string, unknown>)?.slug as string || "",
    categoryId: item.category_id as string,
    price: Number(item.price) || 0,
    originalPrice: item.compare_price ? Number(item.compare_price) : undefined,
    images: (item.images as string[]) || [],
    description: (item.description as string) || "",
    specs: (item.specs as Record<string, string>) || {},
    stock: (item.stock as number) || 0,
    isNew: item.is_new as boolean || false,
    isFeatured: item.is_featured as boolean || false,
    isActive: (item.is_active as boolean | null | undefined) ?? true,
    rating: Number(item.rating) || 0,
  }
}

function transformCategoryFromDB(item: Record<string, unknown>): Category {
  return {
    id: item.id as string,
    name: item.name as string,
    slug: item.slug as string,
    icon: (item.icon as string) || "Package",
    productCount: 0,
  }
}

function transformBrandFromDB(item: Record<string, unknown>): Brand {
  return {
    id: item.id as string,
    name: item.name as string,
    slug: item.slug as string,
    logo: item.logo as string | undefined,
    productCount: 0,
  }
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [],
  brands: [],
  featuredProducts: [],
  filters: defaultFilters,
  loading: false,
  error: null,

  fetchProducts: async (filterOverrides) => {
    set({ loading: true, error: null })
    try {
      const filters = { ...get().filters, ...filterOverrides }
      
      let query = insforge.database
        .from("products")
        .select("*, category:categories(*), brand:brands(*)")

      if (filters.searchQuery?.trim()) {
        query = query.ilike("name", `%${filters.searchQuery.trim()}%`)
      }

      if (filters.categories.length === 1) {
        const category = get().categories.find(c => c.slug === filters.categories[0])
        if (category) {
          query = query.eq("category_id", category.id)
        }
      }

      if (filters.brands.length === 1) {
        const brand = get().brands.find(b => b.slug === filters.brands[0])
        if (brand) {
          query = query.eq("brand_id", brand.id)
        }
      }

      if (filters.priceRange[0] > 0) {
        query = query.gte("price", filters.priceRange[0])
      }
      if (filters.priceRange[1] < DEFAULT_PRODUCT_PRICE_MAX) {
        query = query.lte("price", filters.priceRange[1])
      }

      switch (filters.sortBy) {
        case "price-asc":
          query = query.order("price", { ascending: true })
          break
        case "price-desc":
          query = query.order("price", { ascending: false })
          break
        case "newest":
          query = query.order("created_at", { ascending: false })
          break
        case "popular":
          query = query.order("stock", { ascending: false })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)

      const products = (data || [])
        .map(transformProductFromDB)
        .filter((product) => product.isActive !== false)
      set({ products, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchFeaturedProducts: async () => {
    try {
      const { data, error } = await insforge.database
        .from("products")
        .select("*, category:categories(*), brand:brands(*)")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8)

      if (error) throw new Error(error.message)

      let featuredProducts = (data || [])
        .map(transformProductFromDB)
        .filter((product) => product.isActive !== false)

      // Fallback: if no featured products exist yet, show latest active products.
      if (featuredProducts.length === 0) {
        const fallback = await insforge.database
          .from("products")
          .select("*, category:categories(*), brand:brands(*)")
          .order("created_at", { ascending: false })
          .limit(8)

        if (fallback.error) throw new Error(fallback.error.message)

        featuredProducts = (fallback.data || [])
          .map(transformProductFromDB)
          .filter((product) => product.isActive !== false)
      }

      set({ featuredProducts })
    } catch (error) {
      console.error("Error fetching featured products:", error)
    }
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await insforge.database
        .from("categories")
        .select("*")
        .order("name")

      if (error) throw new Error(error.message)

      const categories = (data || []).map(transformCategoryFromDB)
      set({ categories })
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  },

  fetchBrands: async () => {
    try {
      const { data, error } = await insforge.database
        .from("brands")
        .select("*")
        .order("name")

      if (error) throw new Error(error.message)

      const brands = (data || []).map(transformBrandFromDB)
      set({ brands })
    } catch (error) {
      console.error("Error fetching brands:", error)
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  resetFilters: () => {
    set({ filters: defaultFilters })
  },
}))

export interface Product {
  id: string
  name: string
  slug: string
  brand: string
  brandId?: string
  category: string
  categoryId?: string
  price: number
  originalPrice?: number
  comparePrice?: number
  images: string[]
  description: string
  specs: Record<string, string>
  stock: number
  isNew: boolean
  isFeatured: boolean
  isActive?: boolean
  rating: number
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Address {
  id: string
  userId: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  price: number
  quantity: number
  total: number
  image?: string
}

export interface Order {
  id: string
  userId: string
  addressId: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  notes?: string
  items?: OrderItem[]
  address?: Address
  createdAt?: string
  updatedAt?: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: 'ADMIN' | 'MODERATOR' | 'CUSTOMER'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface FilterState {
  searchQuery?: string
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating'
}

export type OrderStatus = Order['status']
export type UserRole = UserProfile['role']
export type UserStatus = UserProfile['status']

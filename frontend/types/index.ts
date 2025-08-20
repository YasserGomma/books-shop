export interface User {
  id: string
  email: string
  name: string
  image?: string
}

export interface Book {
  id: string
  title: string
  description: string
  price: number
  thumbnail: string
  author: string
  authorId: string
  category: BookCategory
  createdAt: string
  updatedAt: string
}

export type BookCategory = 'Technology' | 'Science' | 'History' | 'Fantasy' | 'Biography'

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: 'title' | 'price' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  category?: BookCategory
  minPrice?: number
  maxPrice?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface Session {
  user: User
  expires: string
}
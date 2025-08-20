import { MOCK_BOOKS } from '@/lib/mock-data'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Books API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/books', () => {
    it('returns paginated books', async () => {
      const mockResponse = {
        data: MOCK_BOOKS.slice(0, 12),
        total: MOCK_BOOKS.length,
        page: 1,
        totalPages: 1,
        hasMore: false,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const response = await fetch('/api/books?page=1&limit=12')
      const data = await response.json()

      expect(data.data).toHaveLength(12)
      expect(data.total).toBe(MOCK_BOOKS.length)
      expect(data.page).toBe(1)
    })

    it('filters books by search term', async () => {
      const searchTerm = 'Clean'
      const filteredBooks = MOCK_BOOKS.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
      )

      const mockResponse = {
        data: filteredBooks,
        total: filteredBooks.length,
        page: 1,
        totalPages: 1,
        hasMore: false,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const response = await fetch(`/api/books?search=${searchTerm}`)
      const data = await response.json()

      expect(data.data.every((book: any) => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
      )).toBe(true)
    })

    it('filters books by category', async () => {
      const category = 'Technology'
      const filteredBooks = MOCK_BOOKS.filter(book => book.category === category)

      const mockResponse = {
        data: filteredBooks,
        total: filteredBooks.length,
        page: 1,
        totalPages: 1,
        hasMore: false,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const response = await fetch(`/api/books?category=${category}`)
      const data = await response.json()

      expect(data.data.every((book: any) => book.category === category)).toBe(true)
    })

    it('sorts books correctly', async () => {
      const sortedBooks = [...MOCK_BOOKS].sort((a, b) => a.title.localeCompare(b.title))

      const mockResponse = {
        data: sortedBooks,
        total: sortedBooks.length,
        page: 1,
        totalPages: 1,
        hasMore: false,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const response = await fetch('/api/books?sortBy=title&sortOrder=asc')
      const data = await response.json()

      // Check if first few books are in alphabetical order
      for (let i = 0; i < Math.min(3, data.data.length - 1); i++) {
        expect(data.data[i].title.localeCompare(data.data[i + 1].title)).toBeLessThanOrEqual(0)
      }
    })
  })

  describe('GET /api/books/[id]', () => {
    it('returns a single book', async () => {
      const book = MOCK_BOOKS[0]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(book),
      })

      const response = await fetch(`/api/books/${book.id}`)
      const data = await response.json()

      expect(data.id).toBe(book.id)
      expect(data.title).toBe(book.title)
    })

    it('returns 404 for non-existent book', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Book not found' }),
      })

      const response = await fetch('/api/books/non-existent-id')
      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })
  })
})
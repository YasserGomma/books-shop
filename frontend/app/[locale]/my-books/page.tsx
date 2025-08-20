'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { BookCard } from '@/features/books/components/book-card'
import { BookFilters } from '@/features/books/components/book-filters'
import { BookForm, BookFormData } from '@/features/books/components/book-form'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { Loader2, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { PaginatedResponse, Book } from '@/types'

async function fetchMyBooks(params: URLSearchParams): Promise<PaginatedResponse<Book>> {
  const response = await fetch(`/api/my-books?${params}`)
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    throw new Error('Failed to fetch books')
  }
  return response.json()
}

async function createBook(data: BookFormData): Promise<Book> {
  const response = await fetch('/api/my-books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create book')
  return response.json()
}

async function updateBook(id: string, data: BookFormData): Promise<Book> {
  const response = await fetch(`/api/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update book')
  return response.json()
}

async function deleteBook(id: string): Promise<void> {
  const response = await fetch(`/api/books/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete book')
}

export default function MyBooksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(999999)
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '12',
    search,
    sortBy,
    sortOrder,
    ...(category && { category }),
    minPrice: minPrice.toString(),
    maxPrice: maxPrice.toString(),
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-books', queryParams.toString()],
    queryFn: () => fetchMyBooks(queryParams),
  })

  const createMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-books'] })
      setShowCreateModal(false)
      addToast({
        title: 'Success',
        description: 'Book created successfully',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Error',
        description: 'Failed to create book',
        variant: 'error',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BookFormData }) => updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-books'] })
      setEditingBook(null)
      addToast({
        title: 'Success',
        description: 'Book updated successfully',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Error',
        description: 'Failed to update book',
        variant: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-books'] })
      setDeletingBook(null)
      addToast({
        title: 'Success',
        description: 'Book deleted successfully',
        variant: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Error',
        description: 'Failed to delete book',
        variant: 'error',
      })
    },
  })

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder as 'asc' | 'desc')
    setPage(1)
  }

  const handleCreateSubmit = async (data: BookFormData) => {
    await createMutation.mutateAsync(data)
  }

  const handleEditSubmit = async (data: BookFormData) => {
    if (editingBook) {
      await updateMutation.mutateAsync({ id: editingBook.id, data })
    }
  }

  const handleDeleteConfirm = async () => {
    if (deletingBook) {
      await deleteMutation.mutateAsync(deletingBook.id)
    }
  }

  if (error?.message === 'Unauthorized') {
    router.push(`/${locale}/login`)
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Books</h1>
          <p className="text-muted-foreground">
            Manage your personal book collection
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Book
        </Button>
      </div>

      <BookFilters
        onSearchChange={setSearch}
        onSortChange={handleSortChange}
        onCategoryChange={setCategory}
        onPriceRangeChange={(min, max) => {
          setMinPrice(min)
          setMaxPrice(max)
          setPage(1)
        }}
      />

      {error && error.message !== 'Unauthorized' && (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load books. Please try again.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven&apos;t created any books yet</p>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Book
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {data?.data.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                locale={locale}
                canEdit
                onEdit={setEditingBook}
                onDelete={setDeletingBook}
              />
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Book"
        description="Add a new book to your collection"
        className="max-w-2xl"
      >
        <BookForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal
        open={!!editingBook}
        onClose={() => setEditingBook(null)}
        title="Edit Book"
        description="Update your book details"
        className="max-w-2xl"
      >
        {editingBook && (
          <BookForm
            initialData={{
              title: editingBook.title,
              description: editingBook.description,
              price: editingBook.price,
              thumbnail: editingBook.thumbnail,
              category: editingBook.category,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingBook(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      <Modal
        open={!!deletingBook}
        onClose={() => setDeletingBook(null)}
        title="Delete Book"
        description={`Are you sure you want to delete "${deletingBook?.title}"? This action cannot be undone.`}
      >
        <div className="flex gap-4">
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeletingBook(null)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}
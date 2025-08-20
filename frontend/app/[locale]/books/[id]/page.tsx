'use client'

import { use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { BookForm, BookFormData } from '@/features/books/components/book-form'
import { useToast } from '@/components/ui/toast'
import { ArrowLeft, Edit, Trash, Loader2 } from 'lucide-react'
import { Book } from '@/types'
import { useState } from 'react'

async function fetchBook(id: string): Promise<Book> {
  const response = await fetch(`/api/books/${id}`)
  if (!response.ok) throw new Error('Failed to fetch book')
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

export default function BookDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', id],
    queryFn: () => fetchBook(id),
  })

  const updateMutation = useMutation({
    mutationFn: (data: BookFormData) => updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', id] })
      queryClient.invalidateQueries({ queryKey: ['my-books'] })
      setShowEditModal(false)
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
    mutationFn: () => deleteBook(id),
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Book deleted successfully',
        variant: 'success',
      })
      router.push(`/${locale}/my-books`)
    },
    onError: () => {
      addToast({
        title: 'Error',
        description: 'Failed to delete book',
        variant: 'error',
      })
    },
  })

  const canEdit = book?.id.startsWith('user-')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Book not found</p>
          <Button onClick={() => router.push(`/${locale}/books`)}>
            Back to Books
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          <Image
            src={book.thumbnail}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary">${book.price}</span>
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                {book.category}
              </span>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{book.description}</p>
          </Card>

          {canEdit && (
            <div className="flex gap-4">
              <Button
                onClick={() => setShowEditModal(true)}
                className="flex-1 gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Book
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 gap-2"
              >
                <Trash className="h-4 w-4" />
                Delete Book
              </Button>
            </div>
          )}

          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Added on {new Date(book.createdAt).toLocaleDateString()}
            </p>
            {book.updatedAt !== book.createdAt && (
              <p className="text-sm text-muted-foreground">
                Last updated on {new Date(book.updatedAt).toLocaleDateString()}
              </p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Book"
        description="Update your book details"
        className="max-w-2xl"
      >
        <BookForm
          initialData={{
            title: book.title,
            description: book.description,
            price: book.price,
            thumbnail: book.thumbnail,
            category: book.category,
          }}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data)
          }}
          onCancel={() => setShowEditModal(false)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Book"
        description={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
      >
        <div className="flex gap-4">
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}
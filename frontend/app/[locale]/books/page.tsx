'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { BookCard } from '@/features/books/components/book-card'
import { BookFilters } from '@/features/books/components/book-filters'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { PaginatedResponse, Book } from '@/types'

async function fetchBooks(params: URLSearchParams): Promise<PaginatedResponse<Book>> {
  const response = await fetch(`/api/books?${params}`)
  if (!response.ok) throw new Error('Failed to fetch books')
  return response.json()
}

export default function BooksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params)
  const t = useTranslations('books')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(999999)

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
    queryKey: ['books', queryParams.toString()],
    queryFn: () => fetchBooks(queryParams),
  })

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder as 'asc' | 'desc')
    setPage(1)
  }

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch)
    setPage(1)
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setPage(1)
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    setMinPrice(min)
    setMaxPrice(max)
    setPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <BookFilters
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onCategoryChange={handleCategoryChange}
        onPriceRangeChange={handlePriceRangeChange}
      />

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{t('error')}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t('loading')}</span>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noBooks')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 mt-8">
            {data?.data.map((book) => (
              <BookCard key={book.id} book={book} locale={locale} />
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
    </div>
  )
}
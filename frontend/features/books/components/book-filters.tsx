'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search, Filter, X } from 'lucide-react'
import { BookCategory } from '@/types'

interface BookFiltersProps {
  onSearchChange: (search: string) => void
  onSortChange: (sortBy: string, sortOrder: string) => void
  onCategoryChange: (category: string) => void
  onPriceRangeChange: (min: number, max: number) => void
}

export function BookFilters({
  onSearchChange,
  onSortChange,
  onCategoryChange,
  onPriceRangeChange,
}: BookFiltersProps) {
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const t = useTranslations('books')
  const tCategories = useTranslations('categories')

  const categories: BookCategory[] = ['Technology', 'Science', 'History', 'Fantasy', 'Biography']

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-')
    onSortChange(sortBy, sortOrder)
  }

  const handlePriceRangeSubmit = () => {
    const min = minPrice ? parseFloat(minPrice) : 0
    const max = maxPrice ? parseFloat(maxPrice) : 999999
    onPriceRangeChange(min, max)
  }

  const clearFilters = () => {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    onSearchChange('')
    onCategoryChange('')
    onPriceRangeChange(0, 999999)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <select 
          defaultValue="title-asc" 
          onChange={(e) => handleSortChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="title-asc">{t('sortAsc')}</option>
          <option value="title-desc">{t('sortDesc')}</option>
          <option value="price-asc">{t('priceLowHigh')}</option>
          <option value="price-desc">{t('priceHighLow')}</option>
          <option value="createdAt-desc">{t('newestFirst')}</option>
          <option value="createdAt-asc">{t('oldestFirst')}</option>
        </select>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('filters')}
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t('filters')}</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              {t('clear')}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('category')}</Label>
              <select
                defaultValue=""
                onChange={(e) => onCategoryChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{tCategories('all')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {tCategories(category)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>{t('minPrice')}</Label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={handlePriceRangeSubmit}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('maxPrice')}</Label>
              <Input
                type="number"
                placeholder="999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={handlePriceRangeSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
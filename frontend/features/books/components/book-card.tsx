'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Trash } from 'lucide-react'
import { Book } from '@/types'

interface BookCardProps {
  book: Book
  locale: string
  onEdit?: (book: Book) => void
  onDelete?: (book: Book) => void
  canEdit?: boolean
}

export function BookCard({ book, locale, onEdit, onDelete, canEdit = false }: BookCardProps) {
  return (
    <Link href={`/${locale}/books/${book.id}`} className="block">
      <Card className="group relative overflow-hidden card-hover border-0 shadow-sm bg-card/50 backdrop-blur-sm cursor-pointer">
        {canEdit && (
          <div 
            className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 glass-effect rounded-full"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect">
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e?.preventDefault()
                    onEdit?.(book)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e?.preventDefault()
                    onDelete?.(book)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted rounded-t-lg">
        <Image
          src={book.thumbnail}
          alt={book.title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="p-5">
        <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 font-medium">{book.author}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold gradient-text">${book.price}</span>
          <span className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
            {book.category}
          </span>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}
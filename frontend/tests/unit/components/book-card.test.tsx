import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookCard } from '@/features/books/components/book-card'
import { Book } from '@/types'

const mockBook: Book = {
  id: '1',
  title: 'Test Book',
  description: 'A test book description',
  price: 29.99,
  thumbnail: 'https://example.com/image.jpg',
  author: 'Test Author',
  authorId: 'author1',
  category: 'Technology',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, sizes, className, priority, ...props }: any) => (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      data-fill={fill ? 'true' : 'false'}
      data-sizes={sizes}
      data-priority={priority ? 'true' : 'false'}
      {...props} 
    />
  ),
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('BookCard Component', () => {
  it('renders book information correctly', () => {
    render(<BookCard book={mockBook} locale="en" />)
    
    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByAltText('Test Book')).toBeInTheDocument()
  })

  it('shows edit and delete options when canEdit is true', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    
    render(
      <BookCard
        book={mockBook}
        locale="en"
        canEdit
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
    
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onEdit when edit is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    
    render(
      <BookCard
        book={mockBook}
        locale="en"
        canEdit
        onEdit={onEdit}
      />
    )
    
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    const editButton = screen.getByText('Edit')
    await user.click(editButton)
    
    expect(onEdit).toHaveBeenCalledWith(mockBook)
  })

  it('calls onDelete when delete is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    
    render(
      <BookCard
        book={mockBook}
        locale="en"
        canEdit
        onDelete={onDelete}
      />
    )
    
    const menuButton = screen.getByRole('button')
    await user.click(menuButton)
    
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)
    
    expect(onDelete).toHaveBeenCalledWith(mockBook)
  })

  it('contains link to book details page', () => {
    render(<BookCard book={mockBook} locale="en" />)
    
    const viewLink = screen.getByRole('link')
    expect(viewLink).toHaveAttribute('href', '/en/books/1')
  })
})
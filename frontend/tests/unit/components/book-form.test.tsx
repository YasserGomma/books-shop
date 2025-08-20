import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookForm } from '@/features/books/components/book-form'

describe('BookForm Component', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<BookForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/thumbnail url/i)).toBeInTheDocument()
  })

  it('renders with initial data when provided', () => {
    const initialData = {
      title: 'Test Book',
      description: 'Test Description',
      price: 29.99,
      thumbnail: 'https://example.com/image.jpg',
      category: 'Technology' as const,
    }
    
    render(<BookForm {...defaultProps} initialData={initialData} />)
    
    expect(screen.getByDisplayValue('Test Book')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('29.99')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://example.com/image.jpg')).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<BookForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /create book/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })
  })

  it('prevents submission with invalid URL', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BookForm {...defaultProps} onSubmit={onSubmit} />)
    
    // Fill required fields first
    await user.type(screen.getByLabelText(/title/i), 'Test Book')
    await user.type(screen.getByLabelText(/description/i), 'A test book description that is long enough')
    await user.type(screen.getByLabelText(/price/i), '29.99')
    
    // Add invalid URL
    const thumbnailInput = screen.getByLabelText(/thumbnail url/i)
    await user.type(thumbnailInput, 'invalid-url')
    
    const submitButton = screen.getByRole('button', { name: /create book/i })
    await user.click(submitButton)
    
    // Form should not submit with invalid data
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  it('calls onSubmit with form data when form is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    
    render(<BookForm {...defaultProps} onSubmit={onSubmit} />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Book')
    await user.type(screen.getByLabelText(/description/i), 'A test book description that is long enough')
    await user.type(screen.getByLabelText(/price/i), '29.99')
    await user.type(screen.getByLabelText(/thumbnail url/i), 'https://example.com/image.jpg')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Technology')
    
    const submitButton = screen.getByRole('button', { name: /create book/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Book',
          description: 'A test book description that is long enough',
          price: 29.99,
          thumbnail: 'https://example.com/image.jpg',
          category: 'Technology',
        }),
        expect.anything() // Allow additional parameters like event
      )
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    
    render(<BookForm {...defaultProps} onCancel={onCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('disables form when loading', () => {
    render(<BookForm {...defaultProps} isLoading />)
    
    expect(screen.getByLabelText(/title/i)).toBeDisabled()
    expect(screen.getByLabelText(/description/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('shows update text when initial data is provided', () => {
    const initialData = {
      title: 'Test Book',
      description: 'Test Description',
      price: 29.99,
      thumbnail: 'https://example.com/image.jpg',
      category: 'Technology' as const,
    }
    
    render(<BookForm {...defaultProps} initialData={initialData} />)
    
    expect(screen.getByRole('button', { name: /update book/i })).toBeInTheDocument()
  })
})
import { NextRequest, NextResponse } from 'next/server'
import { userBooks, updateUserBook, deleteUserBook } from '@/lib/mock-data'
import { auth } from '@/lib/auth'

const BACKEND_URL = 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Extract locale from the request
  const referer = request.headers.get('referer') || ''
  const locale = referer.includes('/ar/') ? 'ar' : 'en'
  
  console.log(`Fetching single book ${id} for locale: ${locale}`)
  
  try {
    // Construct backend URL for single book
    const backendUrl = `${BACKEND_URL}/api/books/localized/${id}?lang=${locale}`
    
    console.log(`Proxying single book request to backend: ${backendUrl}`)
    
    // Make request to backend
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale === 'ar' ? 'ar,en;q=0.9' : 'en,ar;q=0.9',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 })
      }
      console.error('Backend request failed:', response.status, response.statusText)
      throw new Error(`Backend request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Return the book data directly from backend
    const book = data.data || data
    
    console.log(`Successfully fetched book "${book.title}" from backend in locale: ${data.locale || locale}`)
    
    return NextResponse.json(book)
    
  } catch (error) {
    console.error('Error proxying single book to backend:', error)
    
    // Fallback: check if it's a user book (for backward compatibility)
    const userBook = userBooks.find(b => b.id === id)
    if (userBook) {
      console.log(`Found user book ${id}, returning from local data`)
      return NextResponse.json(userBook)
    }
    
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  
  try {
    // Extract locale from the request
    const referer = request.headers.get('referer') || ''
    const locale = referer.includes('/ar/') ? 'ar' : 'en'
    
    // Get a default category ID (Technology category)
    const defaultCategoryId = 'd93f61a3-37f9-462d-b102-7d478305f74c' // Technology category
    
    // Prepare update data with proper validation (standard schema, not multilingual)
    const updateData = {
      title: body.title,
      description: body.description,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      categoryId: body.categoryId || defaultCategoryId,
      thumbnail: body.thumbnail,
      tags: body.tags || [],
    }
    
    // Construct backend URL for updating a book
    const backendUrl = `${BACKEND_URL}/api/books/my/${id}`
    
    console.log(`Proxying update book request to backend: ${backendUrl}`)
    console.log(`Update data:`, updateData)
    
    // Make request to backend
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale === 'ar' ? 'ar,en;q=0.9' : 'en,ar;q=0.9',
        'Authorization': `Bearer mock-token-for-admin`, // Temporary mock token
      },
      body: JSON.stringify(updateData),
    })
    
    if (!response.ok) {
      console.error('Backend update book request failed:', response.status, response.statusText)
      
      if (response.status === 403) {
        return NextResponse.json({ error: 'You can only edit your own books' }, { status: 403 })
      }
      if (response.status === 404) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 })
      }
      
      throw new Error(`Backend request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log(`Successfully updated book "${data.data?.title || id}" in backend`)
    
    return NextResponse.json(data.data || data)
    
  } catch (error) {
    console.error('Error updating book in backend:', error)
    
    // Fallback: try to update mock data for backward compatibility
    const userBook = userBooks.find(b => b.id === id)
    if (userBook) {
      const updated = updateUserBook(id, body)
      if (updated) {
        console.log(`Updated book ${id} in local mock data as fallback`)
        return NextResponse.json(updated)
      }
    }
    
    return NextResponse.json({
      error: 'Failed to update book',
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  
  try {
    // Extract locale from the request
    const referer = request.headers.get('referer') || ''
    const locale = referer.includes('/ar/') ? 'ar' : 'en'
    
    // Construct backend URL for deleting a book
    const backendUrl = `${BACKEND_URL}/api/books/my/${id}`
    
    console.log(`Proxying delete book request to backend: ${backendUrl}`)
    
    // Make request to backend
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale === 'ar' ? 'ar,en;q=0.9' : 'en,ar;q=0.9',
        'Authorization': `Bearer mock-token-for-admin`, // Temporary mock token
      },
    })
    
    if (!response.ok) {
      console.error('Backend delete book request failed:', response.status, response.statusText)
      
      if (response.status === 403) {
        return NextResponse.json({ error: 'You can only delete your own books' }, { status: 403 })
      }
      if (response.status === 404) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 })
      }
      
      throw new Error(`Backend request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log(`Successfully deleted book ${id} from backend`)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error deleting book in backend:', error)
    
    // Fallback: try to delete from mock data for backward compatibility
    const userBook = userBooks.find(b => b.id === id)
    if (userBook) {
      const deleted = deleteUserBook(id)
      if (deleted) {
        console.log(`Deleted book ${id} from local mock data as fallback`)
        return NextResponse.json({ success: true })
      }
    }
    
    return NextResponse.json({
      error: 'Failed to delete book',
    }, { status: 500 })
  }
}
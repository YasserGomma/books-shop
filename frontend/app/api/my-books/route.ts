import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const BACKEND_URL = 'http://localhost:8000'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    
    // Extract locale from the request
    const referer = request.headers.get('referer') || ''
    const locale = referer.includes('/ar/') ? 'ar' : 'en'
    
    // Add locale to search params for backend
    searchParams.set('lang', locale)
    
    // Construct backend URL for user's books
    const backendUrl = `${BACKEND_URL}/api/books/my?${searchParams.toString()}`
    
    console.log(`Proxying my books request to backend: ${backendUrl}`)
    
    // For now, fetch all books since we don't have proper user authentication yet
    // TODO: Implement proper user authentication and user-specific books
    const publicBackendUrl = `${BACKEND_URL}/api/books/localized?${searchParams.toString()}`
    
    console.log(`Proxying to public books (temporary): ${publicBackendUrl}`)
    
    const response = await fetch(publicBackendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale === 'ar' ? 'ar,en;q=0.9' : 'en,ar;q=0.9',
      },
    })
    
    if (!response.ok) {
      console.error('Backend request failed:', response.status, response.statusText)
      throw new Error(`Backend request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform backend response to match frontend expected format
    const transformedResponse = {
      data: data.data || [],
      total: data.pagination?.total || 0,
      page: data.pagination?.page || 1,
      totalPages: data.pagination?.totalPages || 1,
      hasMore: data.pagination?.hasMore || false,
    }
    
    console.log(`Successfully fetched ${transformedResponse.data.length} user books from backend in locale: ${data.locale || locale}`)
    
    return NextResponse.json(transformedResponse)
    
  } catch (error) {
    console.error('Error proxying my books to backend:', error)
    
    // Return error response
    return NextResponse.json({
      error: 'Failed to fetch user books from backend',
      data: [],
      total: 0,
      page: 1,
      totalPages: 1,
      hasMore: false,
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Extract locale from the request
    const referer = request.headers.get('referer') || ''
    const locale = referer.includes('/ar/') ? 'ar' : 'en'
    
    // For now, create books without authentication (they'll be public)
    // TODO: Implement proper user authentication for book creation
    const backendUrl = `${BACKEND_URL}/api/books/multilingual`
    
    console.log(`Proxying create book request to backend: ${backendUrl}`)
    console.log(`Original request body:`, body)
    
    // Get a default category ID from the database (Technology category)
    const defaultCategoryId = 'd93f61a3-37f9-462d-b102-7d478305f74c' // Technology category
    
    // Create multilingual book data with proper validation
    const bookData = {
      title: body.title,
      description: body.description,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      categoryId: body.categoryId || defaultCategoryId,
      thumbnail: body.thumbnail || 'https://picsum.photos/400/600?random=' + Date.now(),
      tags: body.tags || [],
      // Multilingual fields
      titleEn: body.title,
      titleAr: body.titleAr || body.title, // Use Arabic title if provided, otherwise use English
      descriptionEn: body.description,
      descriptionAr: body.descriptionAr || body.description, // Use Arabic description if provided
    }
    
    console.log(`Sending to backend:`, bookData)
    
    // Make request to create multilingual book
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale === 'ar' ? 'ar,en;q=0.9' : 'en,ar;q=0.9',
        'Authorization': `Bearer mock-token-for-admin`, // Temporary mock token
      },
      body: JSON.stringify(bookData),
    })
    
    if (!response.ok) {
      console.error('Backend create book request failed:', response.status, response.statusText)
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Backend request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log(`Successfully created book "${data.data?.title || 'Unknown'}" in backend`)
    
    return NextResponse.json(data.data || data, { status: 201 })
    
  } catch (error) {
    console.error('Error creating book in backend:', error)
    
    return NextResponse.json({
      error: 'Failed to create book in backend',
    }, { status: 500 })
  }
}
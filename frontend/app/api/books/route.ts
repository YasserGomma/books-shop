import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Extract locale from the request URL path
    const referer = request.headers.get('referer') || ''
    const locale = referer.includes('/ar/') ? 'ar' : 'en'
    
    // Add locale to search params for backend
    searchParams.set('lang', locale)
    
    // Construct backend URL
    const backendUrl = `${BACKEND_URL}/api/books/localized?${searchParams.toString()}`
    
    console.log(`Proxying books request to backend: ${backendUrl}`)
    
    // Make request to backend
    const response = await fetch(backendUrl, {
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
    
    console.log(`Successfully fetched ${transformedResponse.data.length} books from backend in locale: ${data.locale || locale}`)
    
    return NextResponse.json(transformedResponse)
    
  } catch (error) {
    console.error('Error proxying to backend:', error)
    
    // Return error response
    return NextResponse.json({
      error: 'Failed to fetch books from backend',
      data: [],
      total: 0,
      page: 1,
      totalPages: 1,
      hasMore: false,
    }, { status: 500 })
  }
}
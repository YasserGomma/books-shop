import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const BACKEND_URL = 'http://localhost:8000'
// Use the admin user ID from our seeded data for now
const ADMIN_USER_ID = '40faae6a-bddf-49a3-a8dc-9defdb39309c'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch user data from backend
    const backendUrl = `${BACKEND_URL}/api/users/${ADMIN_USER_ID}`
    
    console.log(`Fetching user profile from backend: ${backendUrl}`)
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error('Backend user fetch failed:', response.status, response.statusText)
      // Fallback to session data
      return NextResponse.json(session.user)
    }
    
    const data = await response.json()
    const backendUser = data.data
    
    // Map backend user to frontend user format
    const user = {
      id: backendUser.id,
      name: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
      email: backendUser.email,
      image: session.user?.image, // Keep the mock image from session
    }
    
    console.log(`Successfully fetched user profile from backend: ${user.email}`)
    
    return NextResponse.json(user)
    
  } catch (error) {
    console.error('Error fetching user profile from backend:', error)
    // Fallback to session data
    return NextResponse.json(session.user)
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, email } = body

  try {
    // Parse name into firstName and lastName
    const nameParts = name?.split(' ') || []
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    // Update user in backend
    const backendUrl = `${BACKEND_URL}/api/users/${ADMIN_USER_ID}`
    
    console.log(`Updating user profile in backend: ${backendUrl}`)
    console.log(`Update data:`, { firstName, lastName, email })
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
      }),
    })
    
    if (!response.ok) {
      console.error('Backend user update failed:', response.status, response.statusText)
      throw new Error(`Backend request failed: ${response.status}`)
    }
    
    const data = await response.json()
    const updatedBackendUser = data.data
    
    // Map backend user to frontend user format
    const updatedUser = {
      id: updatedBackendUser.id,
      name: `${updatedBackendUser.firstName} ${updatedBackendUser.lastName}`.trim(),
      email: updatedBackendUser.email,
      image: session.user?.image, // Keep the mock image from session
    }
    
    console.log(`Successfully updated user profile in backend: ${updatedUser.email}`)
    
    return NextResponse.json(updatedUser)
    
  } catch (error) {
    console.error('Error updating user profile in backend:', error)
    
    // Fallback: return updated session data (not persisted)
    const updatedUser = {
      ...session.user,
      name: name || session.user?.name,
      email: email || session.user?.email,
    }
    
    return NextResponse.json(updatedUser)
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

// Ensure ADMIN_CODE is set, fallback for dev safety if needed, 
// though typically you want to fail hard if not set in prod.
const ADMIN_CODE = process.env.ADMIN_CODE || 'admin123' 

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 })
    }

    if (code !== ADMIN_CODE) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
    }

    // Create session with admin role
    await createSession('admin')

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

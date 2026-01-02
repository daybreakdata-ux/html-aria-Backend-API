import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const userId = parseInt(session.user.id)
    const sql = getSql()

    // Get all chats for the user
    const chats = await sql`
      SELECT
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        c.last_message_at,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_time
      FROM chats c
      LEFT JOIN messages m ON c.id = m.chat_id
      WHERE c.user_id = ${userId}
      GROUP BY c.id, c.title, c.created_at, c.updated_at, c.last_message_at
      ORDER BY c.last_message_at DESC, c.created_at DESC
    `

    return NextResponse.json({ chats })

  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

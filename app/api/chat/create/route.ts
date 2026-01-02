import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSql, generateChatId } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const { title } = await request.json()

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Generate chat ID
    const chatId = await generateChatId(userId)

    const sql = getSql()
    // Create chat
    const result = await sql`
      INSERT INTO chats (id, user_id, title)
      VALUES (${chatId}, ${userId}, ${title})
      RETURNING id, title, created_at, updated_at, last_message_at
    `

    const chat = result[0]

    return NextResponse.json({
      success: true,
      chat: {
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        last_message_at: chat.last_message_at,
        message_count: 0,
        last_message_time: null,
      }
    })

  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

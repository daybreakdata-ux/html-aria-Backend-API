import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSql } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    const sql = getSql()
    // Verify the chat belongs to the user
    const chatCheck = await sql`
      SELECT id FROM chats WHERE id = ${chatId} AND user_id = ${userId}
    `

    if (chatCheck.length === 0) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the chat (messages will be deleted automatically due to CASCADE)
    await sql`
      DELETE FROM chats WHERE id = ${chatId} AND user_id = ${userId}
    `

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete all chats for the user
    await db.execute({
      sql: 'DELETE FROM messages WHERE chat_id IN (SELECT id FROM chats WHERE user_id = ?)',
      args: [session.user.id]
    })

    await db.execute({
      sql: 'DELETE FROM chats WHERE user_id = ?',
      args: [session.user.id]
    })

    return NextResponse.json({
      success: true,
      message: 'All chat history cleared successfully'
    })

  } catch (error) {
    console.error('Error clearing chat history:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    )
  }
}

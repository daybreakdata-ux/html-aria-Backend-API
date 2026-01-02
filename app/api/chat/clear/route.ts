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
    const sql = getSql()

    // Delete all chats for the user (messages will be deleted automatically due to CASCADE)
    await sql`
      DELETE FROM chats WHERE user_id = ${userId}
    `

    return NextResponse.json({ success: true, message: 'All chat history cleared' })

  } catch (error) {
    console.error('Error clearing chat history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

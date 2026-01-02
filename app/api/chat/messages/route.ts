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

    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    const sql = getSql()
    // Verify chat belongs to user
    const chatCheck = await sql`
      SELECT id, title FROM chats WHERE id = ${chatId} AND user_id = ${userId}
    `

    if (chatCheck.length === 0) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Get messages for the chat
    const messages = await sql`
      SELECT
        id,
        role,
        content,
        web_search_results,
        download_url,
        download_filename,
        created_at
      FROM messages
      WHERE chat_id = ${chatId} AND user_id = ${userId}
      ORDER BY created_at ASC
    `

    // Transform messages to match frontend format
    const formattedMessages = messages.map(msg => ({
      id: msg.id.toString(),
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      webSearchResults: msg.web_search_results,
      downloadUrl: msg.download_url,
      downloadFilename: msg.download_filename,
    }))

    return NextResponse.json({
      chat: {
        id: chatId,
        title: chatCheck[0].title,
        messages: formattedMessages,
      }
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

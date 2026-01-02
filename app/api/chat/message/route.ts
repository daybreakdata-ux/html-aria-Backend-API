import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSql } from '@/lib/db'
import { performWebSearch } from '@/app/actions/web-search'

interface WebSearchResult {
  title: string
  url: string
  snippet: string
}

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
    const body = await request.json()
    const {
      chatId,
      message,
      mode,
      contextLength = 15,
      apiKey,
      model,
      systemPrompt,
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      uploadedFile
    } = body

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Chat ID and message are required' },
        { status: 400 }
      )
    }

    const sql = getSql()
    // Verify chat belongs to user
    const chatCheck = await sql`
      SELECT id FROM chats WHERE id = ${chatId} AND user_id = ${userId}
    `

    if (chatCheck.length === 0) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Save user message to database
    const userMessageResult = await sql`
      INSERT INTO messages (chat_id, user_id, role, content)
      VALUES (${chatId}, ${userId}, 'user', ${message})
      RETURNING id, created_at
    `

    const userMessageId = userMessageResult[0].id
    const userMessageTimestamp = userMessageResult[0].created_at

    // Get chat history for context
    const chatHistory = await sql`
      SELECT role, content, web_search_results, created_at
      FROM messages
      WHERE chat_id = ${chatId}
      ORDER BY created_at DESC
      LIMIT ${contextLength}
    `

    // Reverse to get chronological order
    chatHistory.reverse()

    // Check if message needs real-time info
    const needsRealTimeInfo = /\b(current|latest|recent|today|now|2024|2025|news|weather|price|stock|update)\b/i.test(message)

    let webSearchResults: WebSearchResult[] = []
    let searchContext = ""

    if (needsRealTimeInfo) {
      try {
        webSearchResults = await performWebSearch(message)

        if (webSearchResults.length > 0) {
          searchContext = `\n\n[Web Search Results for: "${message}"]\n${webSearchResults
            .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}\n   Source: ${r.url}`)
            .join('\n\n')}\n\n[End of Search Results]\n\nPlease provide a comprehensive answer based on the above search results and your knowledge.`
        }
      } catch (error) {
        console.error('Web search error:', error)
        // Continue without search results
      }
    }

    // Build messages array for AI API
    const messages = []

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }

    // Add chat history
    for (const msg of chatHistory) {
      messages.push({
        role: msg.role === 'error' ? 'assistant' : msg.role,
        content: msg.content,
      })
    }

    // Add current message with search context and file content
    let currentMessageContent = message

    if (searchContext) {
      currentMessageContent += searchContext
    }

    if (uploadedFile) {
      currentMessageContent += `\n\n[Uploaded file: ${uploadedFile.name}]:\n${uploadedFile.content}`
    }

    messages.push({
      role: 'user',
      content: currentMessageContent,
    })

    console.log('Sending messages to AI API:', messages.length, 'messages')

    // Make API call to OpenRouter
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey || process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        messages,
        temperature: temperature || 0.7,
        max_tokens: maxTokens || 2000,
        top_p: topP || 1,
        frequency_penalty: frequencyPenalty || 0,
        presence_penalty: presencePenalty || 0,
      }),
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error("AI API Error:", apiResponse.status, errorText)

      // Save error message to database
      await sql`
        INSERT INTO messages (chat_id, user_id, role, content)
        VALUES (${chatId}, ${userId}, 'error', ${`Failed to get AI response: ${errorText}`})
      `

      return NextResponse.json(
        { error: `AI API returned ${apiResponse.status}: ${errorText}` },
        { status: 500 }
      )
    }

    const aiData = await apiResponse.json()

    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error("Invalid AI API response structure:", aiData)

      await sql`
        INSERT INTO messages (chat_id, user_id, role, content)
        VALUES (${chatId}, ${userId}, 'error', ${'Invalid response structure from AI API'})
      `

      return NextResponse.json(
        { error: 'Invalid response structure from AI API' },
        { status: 500 }
      )
    }

    const assistantContent = aiData.choices[0].message.content || "No response received"

    // Save assistant message to database
    const assistantMessageResult = await sql`
      INSERT INTO messages (chat_id, user_id, role, content, web_search_results)
      VALUES (${chatId}, ${userId}, 'assistant', ${assistantContent}, ${webSearchResults.length > 0 ? JSON.stringify(webSearchResults) : null})
      RETURNING id, created_at
    `

    const assistantMessageId = assistantMessageResult[0].id
    const assistantMessageTimestamp = assistantMessageResult[0].created_at

    // Update chat title if it's the first message
    const messageCount = await sql`
      SELECT COUNT(*) as count FROM messages WHERE chat_id = ${chatId}
    `

    if (messageCount[0].count === 2) { // User message + assistant message = first exchange
      const newTitle = message.length > 50 ? message.substring(0, 50) + '...' : message
      await sql`
        UPDATE chats SET title = ${newTitle} WHERE id = ${chatId}
      `
    }

    return NextResponse.json({
      success: true,
      userMessage: {
        id: userMessageId,
        role: 'user',
        content: message,
        timestamp: userMessageTimestamp,
      },
      assistantMessage: {
        id: assistantMessageId,
        role: 'assistant',
        content: assistantContent,
        timestamp: assistantMessageTimestamp,
        webSearchResults: webSearchResults.length > 0 ? webSearchResults : undefined,
      },
    })

  } catch (error) {
    console.error('Message API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { neon } from '@neondatabase/serverless'

let sql: any = null

export function getSql() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      // Return a mock sql function that throws when called
      sql = new Proxy({}, {
        get() {
          return async () => {
            throw new Error('Database not configured. Please set DATABASE_URL environment variable.')
          }
        }
      }) as any
    } else {
      sql = neon(process.env.DATABASE_URL)
    }
  }
  return sql
}

export { sql }

// Helper function to generate chat ID for a user
export async function generateChatId(userId: number): Promise<string> {
  const result = await getSql()`
    SELECT generate_chat_id(${userId}) as chat_id
  `
  return result[0].chat_id
}

// Database types for TypeScript
export interface User {
  id: number
  email: string
  password_hash: string
  name: string | null
  created_at: Date
  updated_at: Date
  last_login: Date | null
}

export interface Chat {
  id: string
  user_id: number
  title: string
  created_at: Date
  updated_at: Date
  last_message_at: Date
}

export interface Message {
  id: number
  chat_id: string
  user_id: number
  role: 'user' | 'assistant' | 'system' | 'error'
  content: string
  web_search_results: any | null
  download_url: string | null
  download_filename: string | null
  created_at: Date
}

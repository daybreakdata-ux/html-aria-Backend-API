import NextAuth from 'next-auth'
import { getServerSession } from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getSql } from './db'

function createNextAuthConfig() {
  return {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // If database is not configured, don't allow authentication
        if (!process.env.DATABASE_URL) {
          console.error('Database not configured')
          return null
        }

        try {
          const sql = getSql()
          const users = await sql`
            SELECT id, email, password_hash, name, created_at, last_login
            FROM users
            WHERE email = ${credentials.email}
          `

          if (users.length === 0) {
            return null
          }

          const user = users[0]
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isPasswordValid) {
            return null
          }

          // Update last login
          await sql`
            UPDATE users
            SET last_login = NOW()
            WHERE id = ${user.id}
          `

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            created_at: user.created_at,
            last_login: user.last_login,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.created_at = user.created_at
        token.last_login = user.last_login
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.created_at = token.created_at as Date
        session.user.last_login = token.last_login as Date
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}

}

export { createNextAuthConfig }

// For server-side usage in API routes
export async function auth() {
  return await getServerSession(createNextAuthConfig())
}

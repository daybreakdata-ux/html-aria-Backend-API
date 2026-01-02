import NextAuth from 'next-auth'
import { createNextAuthConfig } from '@/lib/auth'

const handler = NextAuth(createNextAuthConfig())

export { handler as GET, handler as POST }

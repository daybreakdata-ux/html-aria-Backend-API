# Vercel Environment Variables Setup

## Quick Setup

1. Go to your Vercel project dashboard: https://vercel.com/your-project/settings/environment-variables

2. Add the following environment variables:

### Required Variables

- **DATABASE_URL**: Your Neon PostgreSQL connection string
- **NEXTAUTH_SECRET**: A secure random string (generate with: `openssl rand -base64 32`)
- **NEXTAUTH_URL**: Your Vercel deployment URL (usually auto-set, format: `https://your-app.vercel.app`)
- **BLOB_READ_WRITE_TOKEN**: Get from [Vercel Blob Store](https://vercel.com/dashboard/stores)
- **OPENROUTER_API_KEY**: OpenRouter API key (server-side only, not user-configurable)

### Optional Variables

- **AUTH_NEON_ID**: Neon Auth ID (if using Neon Auth)
- **AUTH_NEON_SECRET**: Neon Auth Secret (if using Neon Auth)
- **AUTH_NEON_ISSUER**: Neon Auth Issuer URL (if using Neon Auth)
- **SERPAPI_KEY**: For web search functionality

## Environment Variable Values

See `vercel-env.txt` for the current values from your `.env.local` file.

## Important Notes

- **NEXTAUTH_URL**: Update this to your actual Vercel deployment URL after first deployment
- **NEXTAUTH_SECRET**: Use the same secret as your local development for consistency
- **OPENROUTER_API_KEY**: Get from [OpenRouter](https://openrouter.ai) - this is now server-side only and cannot be changed by users
- Set variables for **Production**, **Preview**, and **Development** environments as needed
- Never commit `.env` files to Git (they're already in `.gitignore`)

## After Setting Variables

1. Redeploy your application in Vercel
2. Verify the deployment works correctly
3. Test authentication and database connections


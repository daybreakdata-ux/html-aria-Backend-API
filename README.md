# ARIA - AI Assistant with Real-Time Intelligence & File Downloads

A personal assistant chatbot application powered by OpenRouter AI with real-time web search capabilities and automatic file download generation.

## Features

- 🤖 **AI-Powered Chat** - Powered by advanced language models via OpenRouter
- 🌐 **Real-Time Web Search** - Automatically searches the web for current information
- 📥 **Automatic Downloads** - Every AI response is automatically converted to a downloadable markdown file
- 💾 **File Management** - Backend API for uploading, listing, and managing generated files
- 🎨 **Beautiful UI** - Modern, responsive interface with dark mode support
- 💬 **Persistent Chat History** - Database-backed conversation storage across sessions
- 🔐 **User Authentication** - Secure user accounts with Neon database
- ⚙️ **Customizable Settings** - Configure AI model, temperature, context length, and more
- 👥 **Multi-User Support** - Each user has their own isolated chat history

## New Features (Backend API Integration)

### Download Functionality
- **Automatic File Generation**: Every AI response is automatically uploaded and converted to a downloadable markdown file
- **One-Click Downloads**: Download button appears on every assistant message
- **Download Badge**: Visual indicator shows when a download is ready
- **Manual Downloads**: Click the download button on any message to generate/download again

### Backend API Endpoints
- `POST /api/chatbot/upload` - Upload single or multiple markdown files (creates ZIP for multiple files)
- `GET /api/chatbot/list` - List all uploaded files
- `DELETE /api/chatbot/delete` - Delete files by URL

## Setup

### Prerequisites
- Node.js 18+ and pnpm
- Vercel account (for Blob storage)
- Neon database account (for user data and chat storage)
- OpenRouter API key
- (Optional) SerpAPI key for web search

### Installation

1. Clone the repository:
```bash
git clone https://github.com/daybreakdata-ux/html-aria.git
cd html-aria
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

4. Set up Neon database:
   - Create a new project at [neon.tech](https://neon.tech)
   - Get your database connection string
   - Run the SQL schema from `lib/db-schema.sql` in your database

5. Configure environment variables in `.env.local`:
```env
# Database: Get from Neon dashboard
DATABASE_URL="postgresql://username:password@hostname:5432/database"

# NextAuth.js: Generate a secure random string
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Required: Get from https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Optional: For web search functionality
SERPAPI_KEY=your_serpapi_key_here

# Required: OpenRouter API key (server-side only, not user-configurable)
OPENROUTER_API_KEY="sk-or-v1-..."
```

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### First-Time Setup

1. Click "Get Started" on the splash screen
2. Create an account or sign in
3. Grant permissions for microphone/location if desired
4. Go to Settings (⚙️ icon)
5. (Optional) Configure model preferences and other settings

**Note:** The OpenRouter API key is configured server-side by the administrator and cannot be changed by users.

## Usage

### Starting a Conversation
- Click the "+" button to start a new chat
- Type your message and press Enter (or click Send)
- AI will automatically search the web if your query needs real-time information

### Downloading Responses
- **Automatic**: Every AI response includes a download link automatically
- **Manual**: Click the "Download" button on any message
- Downloads are saved as markdown (.md) files
- Files are stored in Vercel Blob storage with public access

### Managing Conversations
- Switch between chats using the sidebar
- All conversations are saved to your account database
- Chat history persists across devices and sessions
- Delete chats using the sidebar menu

## Technology Stack

- **Framework**: Next.js 16
- **UI**: React 19, Tailwind CSS, Radix UI
- **Authentication**: NextAuth.js
- **Database**: Neon (PostgreSQL)
- **AI**: OpenRouter API
- **Web Search**: SerpAPI
- **Storage**: Vercel Blob
- **File Processing**: fflate (ZIP compression)
- **Markdown**: react-markdown with remark-gfm

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set up production database:
   - Create a Neon project for production
   - Run the schema from `lib/db-schema.sql`
   - Get the production database URL

4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `BLOB_READ_WRITE_TOKEN`
   - `SERPAPI_KEY` (optional)
   - `OPENROUTER_API_KEY` (optional)
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## API Documentation

### Authentication Endpoints

#### Register User
```typescript
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

#### NextAuth.js
```
GET/POST /api/auth/[...nextauth]
```
Standard NextAuth.js endpoints for sign in/out.

### Chat Management Endpoints

#### List User Chats
```typescript
GET /api/chat/list
Authorization: Required (NextAuth session)
```

#### Create New Chat
```typescript
POST /api/chat/create
Authorization: Required
Content-Type: application/json

{
  "title": "New Chat"
}
```

#### Delete Chat
```typescript
DELETE /api/chat/delete
Authorization: Required
Content-Type: application/json

{
  "chatId": "user_id-chat_sequence"
}
```

#### Get Chat Messages
```typescript
GET /api/chat/messages?chatId=user_id-chat_sequence
Authorization: Required
```

#### Send Message
```typescript
POST /api/chat/message
Authorization: Required
Content-Type: application/json

{
  "chatId": "user_id-chat_sequence",
  "message": "Hello AI",
  "mode": "default",
  "contextLength": 15,
  "apiKey": "sk-or-v1-...",
  "model": "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "systemPrompt": "You are a helpful assistant",
  "temperature": 0.7,
  "maxTokens": 2000,
  "topP": 1,
  "frequencyPenalty": 0,
  "presencePenalty": 0,
  "uploadedFile": { "name": "file.txt", "content": "file content" }
}
```

### File Management Endpoints

#### Upload Files
```typescript
POST /api/chatbot/upload
Content-Type: application/json

// Single file
{
  "content": "# Your markdown content",
  "filename": "example.md"
}

// Multiple files (creates ZIP)
{
  "files": [
    { "content": "# File 1", "filename": "file1.md" },
    { "content": "# File 2", "filename": "file2.md" }
  ]
}
```

#### List Files
```typescript
GET /api/chatbot/list
```

#### Delete File
```typescript
DELETE /api/chatbot/delete
Content-Type: application/json

{
  "url": "https://blob.vercel-storage.com/..."
}
```

### Legacy Upload Endpoint
```typescript
POST /api/chatbot/upload
Content-Type: application/json

// Single file
{
  "content": "# Your markdown content",
  "filename": "example.md"
}

// Multiple files (creates ZIP)
{
  "files": [
    { "content": "# File 1", "filename": "file1.md" },
    { "content": "# File 2", "filename": "file2.md" }
  ]
}
```

### Response
```json
{
  "success": true,
  "type": "single" | "zip",
  "url": "https://...",
  "downloadUrl": "https://...",
  "filename": "...",
  "size": 1234
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

Developed by Daybreak Data
- Backend API: [Aria-zip-backend](https://github.com/daybreakdata-ux/Aria-zip-backend)
- Frontend: html-aria

## Support

For issues or questions, please open an issue on GitHub.

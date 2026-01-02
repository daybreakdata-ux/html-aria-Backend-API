# Backend API Integration Guide

## Overview
This document describes the integration of the Aria-zip-backend API into the main ARIA chatbot application. The integration enables automatic file downloads for all AI responses.

## What Was Integrated

### 1. Backend API Routes
Three API endpoints were copied from the backend repository:

- **`/api/chatbot/upload`** - Handles file uploads
  - Single file: Uploads markdown file to Vercel Blob storage
  - Multiple files: Creates a ZIP archive and uploads it
  
- **`/api/chatbot/list`** - Lists all uploaded files
  - Returns array of file metadata (URL, filename, size, upload date)
  
- **`/api/chatbot/delete`** - Deletes files from storage
  - Accepts file URL and removes from Vercel Blob

### 2. Dependencies Added
```json
{
  "@vercel/blob": "2.0.0",  // Vercel Blob storage SDK
  "fflate": "0.8.2"          // Fast compression library for ZIP files
}
```

### 3. Frontend Features

#### Automatic Download Generation
Every AI response is automatically:
1. Uploaded to Vercel Blob storage as a markdown file
2. Given a unique timestamped filename
3. Made available for download with a direct link

#### UI Enhancements
- **Download Badge**: Shows when a file is ready to download
- **Download Button**: One-click download on every assistant message
- **Visual Indicators**: Download icon and filename display
- **Manual Download**: Click download button to regenerate/re-download

#### Modified Files
- `app/chat/page.tsx`:
  - Added `Download` icon import
  - Extended `Message` interface with `downloadUrl` and `downloadFilename`
  - Added `downloadMessage()` function for manual downloads
  - Modified `sendMessage()` to auto-generate downloads
  - Added download UI components and badges

## How It Works

### Flow Diagram
```
User sends message
    ↓
AI generates response
    ↓
Response content is automatically sent to /api/chatbot/upload
    ↓
File is uploaded to Vercel Blob storage
    ↓
Download URL is attached to message
    ↓
User sees download badge with one-click download
```

### Code Example: Auto-Upload Logic
```typescript
// After AI generates response
const assistantContent = data.choices?.[0]?.message?.content

// Automatically generate download
const uploadResponse = await fetch("/api/chatbot/upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: assistantContent,
    filename: `aria-response-${Date.now()}.md`,
  }),
})

if (uploadResponse.ok) {
  const uploadData = await uploadResponse.json()
  assistantMessage.downloadUrl = uploadData.downloadUrl
  assistantMessage.downloadFilename = uploadData.filename
}
```

## Environment Setup

### Required Environment Variables

Create `.env.local` in the project root:

```env
# Required for file uploads
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Optional for web search
SERPAPI_KEY=your_serpapi_key_here
```

### Getting Vercel Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Blob
3. Create a new Blob store (if you don't have one)
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add it to your `.env.local` file

## API Usage Examples

### Upload Single File
```typescript
const response = await fetch('/api/chatbot/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '# My Document\n\nContent here...',
    filename: 'document.md'
  })
});

const data = await response.json();
// {
//   success: true,
//   type: "single",
//   url: "https://...",
//   downloadUrl: "https://...",
//   filename: "document.md",
//   size: 1234
// }
```

### Upload Multiple Files (ZIP)
```typescript
const response = await fetch('/api/chatbot/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    files: [
      { content: '# File 1', filename: 'file1.md' },
      { content: '# File 2', filename: 'file2.md' },
      { content: '# File 3', filename: 'file3.md' }
    ]
  })
});

const data = await response.json();
// {
//   success: true,
//   type: "zip",
//   url: "https://...",
//   downloadUrl: "https://...",
//   filename: "chatbot-files-2026-01-01T12-00-00.zip",
//   size: 4567,
//   fileCount: 3
// }
```

### List All Files
```typescript
const response = await fetch('/api/chatbot/list');
const data = await response.json();
// {
//   files: [
//     {
//       url: "https://...",
//       downloadUrl: "https://...",
//       filename: "aria-response-1234567890.md",
//       size: 1234,
//       uploadedAt: "2026-01-01T12:00:00.000Z"
//     }
//   ]
// }
```

### Delete File
```typescript
const response = await fetch('/api/chatbot/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://blob.vercel-storage.com/...'
  })
});
```

## UI Components

### Download Badge
Shows automatically when a download is available:
```tsx
<div className="flex items-center gap-2 p-2 bg-[#208299]/10 rounded-lg">
  <Download className="w-4 h-4 text-[#208299]" />
  <div className="flex-1">
    <div className="text-xs font-semibold">Download Ready</div>
    <div className="text-xs text-muted-foreground">{filename}</div>
  </div>
  <Button onClick={() => window.open(downloadUrl, "_blank")}>
    Download
  </Button>
</div>
```

### Download Button
Appears on hover for each assistant message:
```tsx
<Button
  size="sm"
  variant="ghost"
  onClick={() => downloadMessage(content, id)}
>
  <Download className="w-3 h-3 mr-1" />
  {downloadUrl ? "Download Again" : "Download"}
</Button>
```

## Testing

### Manual Testing Steps

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Open http://localhost:3000

3. Complete the initial setup (permissions, API key)

4. Send a message to the AI

5. Verify:
   - ✅ Download badge appears after response
   - ✅ Download button is visible on hover
   - ✅ Clicking download opens the file in a new tab
   - ✅ File is a markdown (.md) file with the response content

### API Testing with cURL

Test upload endpoint:
```bash
curl -X POST http://localhost:3000/api/chatbot/upload \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Test File\n\nThis is a test.",
    "filename": "test.md"
  }'
```

Test list endpoint:
```bash
curl http://localhost:3000/api/chatbot/list
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub

2. Import repository in Vercel

3. Add environment variables:
   - `BLOB_READ_WRITE_TOKEN` (required)
   - `SERPAPI_KEY` (optional)

4. Deploy!

### Important Notes

- Vercel Blob storage is automatically provisioned for your project
- Files are stored with public access (anyone with the URL can download)
- File URLs are permanent until manually deleted
- No file size limits enforced at app level (Vercel has storage limits)

## Troubleshooting

### Common Issues

**Issue**: "Upload failed" error
- **Solution**: Check that `BLOB_READ_WRITE_TOKEN` is set correctly in `.env.local`

**Issue**: Downloads not appearing
- **Solution**: Check browser console for errors, verify API route is accessible

**Issue**: "No such file or directory" in API routes
- **Solution**: Ensure all API route files are in `app/api/chatbot/` directory

**Issue**: TypeScript errors
- **Solution**: Run `pnpm install` to ensure all dependencies are installed

### Debug Mode

Enable verbose logging:
```typescript
// In app/chat/page.tsx
console.log("Upload response:", uploadData)
console.log("Download URL:", downloadUrl)
```

## Future Enhancements

Potential improvements:
- [ ] Batch download multiple responses as ZIP
- [ ] Download history/management page
- [ ] Custom filename templates
- [ ] File type selection (PDF, HTML, TXT)
- [ ] Automatic cleanup of old files
- [ ] Download statistics and analytics
- [ ] Share download links
- [ ] Private/password-protected downloads

## Support

For issues or questions:
- Open an issue on GitHub
- Check Vercel Blob documentation: https://vercel.com/docs/storage/vercel-blob
- Review API route implementations in `app/api/chatbot/`

## Credits

- Backend API: [Aria-zip-backend](https://github.com/daybreakdata-ux/Aria-zip-backend)
- Vercel Blob: https://vercel.com/storage/blob
- fflate: https://github.com/101arrowz/fflate

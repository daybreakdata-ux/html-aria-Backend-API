import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { zip } from "fflate"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Single file: { content, filename }
    // Multiple files: { files: [{ content, filename }, ...] }
    const isBatch = Array.isArray(body.files)

    if (isBatch) {
      // Handle multiple files - create ZIP
      const files = body.files

      if (!files || files.length === 0) {
        return NextResponse.json({ error: "No files provided" }, { status: 400 })
      }

      // Validate all files have content and filename
      for (const file of files) {
        if (!file.content || !file.filename) {
          return NextResponse.json({ error: "Each file must have content and filename" }, { status: 400 })
        }
      }

      // Create ZIP file using fflate
      const zipData: Record<string, Uint8Array> = {}

      for (const file of files) {
        const mdFilename = file.filename.endsWith(".md") ? file.filename : `${file.filename}.md`
        // Convert content string to Uint8Array
        const encoder = new TextEncoder()
        zipData[mdFilename] = encoder.encode(file.content)
      }

      // Compress files into ZIP
      const zippedData = await new Promise<Uint8Array>((resolve, reject) => {
        zip(zipData, { level: 6 }, (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      })

      // Generate ZIP filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const zipFilename = `chatbot-files-${timestamp}.zip`

      // Upload ZIP to Vercel Blob
      const blob = await put(zipFilename, zippedData, {
        access: "public",
        contentType: "application/zip",
      })

      return NextResponse.json({
        success: true,
        type: "zip",
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        filename: zipFilename,
        size: blob.size,
        fileCount: files.length,
      })
    } else {
      // Handle single file (original behavior)
      const { content, filename } = body

      if (!content) {
        return NextResponse.json({ error: "No content provided" }, { status: 400 })
      }

      if (!filename) {
        return NextResponse.json({ error: "No filename provided" }, { status: 400 })
      }

      // Ensure filename has .md extension
      const mdFilename = filename.endsWith(".md") ? filename : `${filename}.md`

      // Convert content string to Blob
      const file = new Blob([content], { type: "text/markdown" })

      // Upload to Vercel Blob with public access
      const blob = await put(mdFilename, file, {
        access: "public",
        contentType: "text/markdown",
      })

      return NextResponse.json({
        success: true,
        type: "single",
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        filename: mdFilename,
        size: blob.size,
      })
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

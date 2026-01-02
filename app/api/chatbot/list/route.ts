import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    // Filter only markdown files
    const markdownFiles = blobs
      .filter((blob) => blob.pathname.endsWith(".md"))
      .map((blob) => ({
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        filename: blob.pathname.split("/").pop() || "unknown",
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      }))

    return NextResponse.json({ files: markdownFiles })
  } catch (error) {
    console.error("Error listing files:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}

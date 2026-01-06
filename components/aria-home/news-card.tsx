"use client"

import { Card } from "@/components/ui/card"
import { Clock, Edit2, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface NewsCardProps {
  article: {
    id: string
    title: string
    excerpt: string
    imageUrl: string
    source: string
    publishedAt: string
    url: string
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isEditable?: boolean
}

export function NewsCard({ article, onEdit, onDelete, isEditable = false }: NewsCardProps) {
  const handleClick = () => {
    if (!isEditable) {
      window.open(article.url, "_blank", "noopener,noreferrer")
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Card
      className={`overflow-hidden transition-all ${!isEditable ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" : ""}`}
      onClick={handleClick}
    >
      <div className="relative h-32 w-full bg-muted">
        <Image
          src={article.imageUrl || "/placeholder.svg"}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 320px"
        />
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium truncate">{article.source}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          </div>

          {isEditable && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(article.id)
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(article.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-sm leading-tight text-balance line-clamp-2">{article.title}</h3>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.excerpt}</p>
      </div>
    </Card>
  )
}

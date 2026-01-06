"use client"

import { useEffect, useState } from "react"
import { NewsCard } from "@/components/aria-home/news-card"
import { Loader2, Plus, Edit3, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface NewsArticle {
  id: string
  title: string
  excerpt: string
  imageUrl: string
  source: string
  publishedAt: string
  url: string
}

export function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    imageUrl: "",
    source: "",
    url: "",
  })

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const preferences = localStorage.getItem("userPreferences")
      const parsedPreferences = preferences ? JSON.parse(preferences) : {}
      const category = parsedPreferences.newsCategory || "general"
      const location = parsedPreferences.location || ""

      const response = await fetch(`/api/news?category=${category}&location=${encodeURIComponent(location)}`)
      const data = await response.json()
      setArticles(data.articles || [])

      if (parsedPreferences.enableOfflineMode) {
        localStorage.setItem("cachedArticles", JSON.stringify(data.articles))
      }
    } catch (error) {
      console.error("Failed to fetch news:", error)

      const cached = localStorage.getItem("cachedArticles")
      if (cached) {
        setArticles(JSON.parse(cached))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddWidget = () => {
    setEditingArticle(null)
    setFormData({
      title: "",
      excerpt: "",
      imageUrl: "",
      source: "",
      url: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditWidget = (id: string) => {
    const article = articles.find((a) => a.id === id)
    if (article) {
      setEditingArticle(article)
      setFormData({
        title: article.title,
        excerpt: article.excerpt,
        imageUrl: article.imageUrl,
        source: article.source,
        url: article.url,
      })
      setIsDialogOpen(true)
    }
  }

  const handleDeleteWidget = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id))
    localStorage.setItem("cachedArticles", JSON.stringify(articles.filter((a) => a.id !== id)))
  }

  const handleSaveWidget = () => {
    if (editingArticle) {
      // Edit existing
      const updated = articles.map((a) =>
        a.id === editingArticle.id
          ? {
              ...a,
              ...formData,
            }
          : a,
      )
      setArticles(updated)
      localStorage.setItem("cachedArticles", JSON.stringify(updated))
    } else {
      // Add new
      const newArticle: NewsArticle = {
        id: Date.now().toString(),
        ...formData,
        publishedAt: new Date().toISOString(),
      }
      const updated = [newArticle, ...articles]
      setArticles(updated)
      localStorage.setItem("cachedArticles", JSON.stringify(updated))
    }
    setIsDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">For You</h2>
        <div className="flex gap-2">
          <Button variant={isEditMode ? "default" : "outline"} size="sm" onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? <Check className="h-4 w-4 mr-1" /> : <Edit3 className="h-4 w-4 mr-1" />}
            {isEditMode ? "Done" : "Edit"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddWidget}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {articles.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No articles available at the moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              isEditable={isEditMode}
              onEdit={handleEditWidget}
              onDelete={handleDeleteWidget}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Edit Widget" : "Add Widget"}</DialogTitle>
            <DialogDescription>
              {editingArticle ? "Update the details of your news widget." : "Add a new news widget to your feed."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Enter excerpt"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Enter source"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Article URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="Enter article URL"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWidget}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

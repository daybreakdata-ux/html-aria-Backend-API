"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, X, Navigation, Phone, Globe, Star } from "lucide-react"

interface Place {
  title: string
  address?: string
  latitude?: number
  longitude?: number
  rating?: number
  ratingCount?: number
  category?: string
  phoneNumber?: string
  website?: string
}

interface SearchResultProps {
  result: {
    query: string
    response: string
    places?: Place[]
    usage?: any
    timestamp?: string
    error?: string
  }
  onClose: () => void
}

export function SearchResult({ result, onClose }: SearchResultProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Handle error state
  if (result.error) {
    return (
      <Card className="p-4 animate-in fade-in slide-in-from-top-2 duration-300 border-destructive">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-destructive">Error</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-destructive">{result.error}</p>
      </Card>
    )
  }

  return (
    <Card className="p-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg">Answer</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                />
              ),
              h1: ({ node, ...props }) => (
                <h1 {...props} className="text-2xl font-bold mt-4 mb-2" />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="text-xl font-semibold mt-3 mb-2" />
              ),
              h3: ({ node, ...props }) => (
                <h3 {...props} className="text-lg font-semibold mt-2 mb-1" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc list-inside space-y-1 my-2" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal list-inside space-y-1 my-2" />
              ),
              li: ({ node, ...props }) => (
                <li {...props} className="ml-4" />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="mb-2 leading-relaxed" />
              ),
              code: ({ node, inline, ...props }: any) =>
                inline ? (
                  <code {...props} className="bg-muted px-1 py-0.5 rounded text-sm font-mono" />
                ) : (
                  <code {...props} className="block bg-muted p-2 rounded my-2 text-sm font-mono overflow-x-auto" />
                ),
              blockquote: ({ node, ...props }) => (
                <blockquote {...props} className="border-l-4 border-border pl-4 italic my-2" />
              ),
            }}
          >
            {result.response}
          </ReactMarkdown>
        </div>

        {result.places && result.places.length > 0 && (
          <div className="space-y-3 mt-4">
            <p className="text-sm font-semibold text-foreground">Locations</p>
            {result.places.slice(0, 3).map((place, idx) => (
              <Card key={idx} className="p-4 space-y-3">
                {/* Header with title and rating */}
                <div>
                  <h3 className="font-semibold text-lg">{place.title}</h3>
                  {place.rating && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{place.rating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      {place.ratingCount && (
                        <span className="text-sm text-muted-foreground">
                          ({place.ratingCount.toLocaleString()} reviews)
                        </span>
                      )}
                    </div>
                  )}
                  {place.category && (
                    <p className="text-sm text-muted-foreground mt-1">{place.category}</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {place.website && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(place.website, '_blank')}
                      className="gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const destination = place.address || place.title
                      const encodedDestination = encodeURIComponent(destination)
                      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`
                      window.open(mapsUrl, '_blank')
                    }}
                    className="gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Directions
                  </Button>
                  {place.phoneNumber && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${place.phoneNumber}`, '_self')}
                      className="gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  )}
                </div>

                {/* Address */}
                {place.address && (
                  <div className="text-sm">
                    <span className="font-medium">Address: </span>
                    <span className="text-muted-foreground">{place.address}</span>
                  </div>
                )}

                {/* Phone number displayed */}
                {place.phoneNumber && (
                  <div className="text-sm">
                    <span className="font-medium">Phone: </span>
                    <a 
                      href={`tel:${place.phoneNumber}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {place.phoneNumber}
                    </a>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {isExpanded && result.usage && (
          <div className="pt-3 border-t border-border animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-sm font-medium mb-2">Usage Information:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Prompt Tokens: {result.usage.promptTokens || result.usage.prompt || "N/A"}</p>
              <p>Completion Tokens: {result.usage.completionTokens || result.usage.completion || "N/A"}</p>
              <p>Total Tokens: {result.usage.totalTokens || result.usage.total || "N/A"}</p>
            </div>
          </div>
        )}

        <Button variant="ghost" className="w-full" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Show Details <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

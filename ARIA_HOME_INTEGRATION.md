# Aria-Home Integration Guide

## Overview
The Aria-home application has been successfully integrated into this project as the main homepage. After the splash screen, users will see a personalized feed interface with search, news, weather, and quick access buttons. The Chat button navigates users to the chat interface.

## What Was Integrated

### 1. Components from Aria-home
The following components were copied from the Aria-home repository to `components/aria-home/`:

- **`app-header.tsx`** - Main application header with theme toggle and settings link
- **`search-bar.tsx`** - AI-powered search interface
- **`search-result.tsx`** - Displays search results with markdown formatting
- **`feature-buttons.tsx`** - Quick access buttons for Chat, Deep Research, Calendar, and Photos
- **`weather-widget.tsx`** - Real-time weather information based on user location
- **`news-feed.tsx`** - Personalized news feed with category filtering
- **`news-card.tsx`** - Individual news article display cards
- **`install-prompt.tsx`** - PWA installation prompt
- **`empty.tsx`** - Empty state component
- **`loading.tsx`** - Loading state component

### 2. API Routes Added
Four new API endpoints were integrated:

- **`/api/search`** - AI-powered web search using OpenRouter and Serper
  - POST endpoint that accepts a search query and optional location
  - Returns AI-generated response with sources and places (if applicable)
  - Requires: `OPENROUTER_API_KEY` and `SERPER_API_KEY`

- **`/api/weather`** - Weather information service
  - GET endpoint with location parameter
  - Provides current weather data and forecast
  - Uses browser geolocation if no location specified

- **`/api/news`** - News feed service
  - GET endpoint with category and location parameters
  - Fetches top headlines from News API
  - Requires: `NEWS_API_KEY`

- **`/api/geocode`** - Reverse geocoding service
  - GET endpoint with lat/lon parameters
  - Converts coordinates to city names
  - Used for automatic location detection

### 3. Dependencies Added
```json
{
  "ai": "^5.0.118",                        // Vercel AI SDK
  "@openrouter/ai-sdk-provider": "^1.5.4", // OpenRouter AI provider
  "react-markdown": "^9.1.0",              // Already installed
  "remark-gfm": "^4.0.1"                   // Already installed
}
```

### 4. Assets Added
The following assets were copied to the `public/` folder:
- `logo.svg` - ARIA logo for the header
- `icon-*.png` - App icons for PWA
- `placeholder-*.{jpg,svg,png}` - Placeholder images
- `news-collage.png` - News feed imagery

### 5. Page Structure Changes

#### Homepage Flow
1. **Splash Screen** (2 seconds) - Spinning ARIA logo with animated gradient
2. **Aria-home Interface** - Main feed with:
   - Header with logo, theme toggle, and settings
   - Search bar for AI-powered web search
   - Feature buttons (Chat, Deep Research, Calendar, Photos)
   - Weather widget with location-based data
   - News feed with personalized articles
   - PWA install prompt (when applicable)

#### Navigation
- **`/`** - Homepage (splash → Aria-home feed)
- **`/chat`** - Chat interface (accessible via Chat button)
- **`/home`** - Original landing page (preserved for reference)
- **`/settings`** - Settings page (existing)
- **`/auth/signin`** - Sign in page (existing)
- **`/auth/signup`** - Sign up page (existing)

### 6. Feature Button Integration
The Chat button in the FeatureButtons component now includes navigation:

```tsx
const router = useRouter()

const handleChatClick = () => {
  router.push("/chat")
}
```

This allows users to seamlessly transition from the homepage to the chat interface.

## Required Environment Variables

Add these to your `.env.local` file or Vercel project settings:

```bash
# AI Search (Required)
OPENROUTER_API_KEY=your_openrouter_api_key_here
SERPER_API_KEY=your_serper_api_key_here

# News Feed (Required)
NEWS_API_KEY=your_news_api_key_here

# Existing variables (keep these)
DATABASE_URL=your_database_url
GOOGLE_API_KEY=your_google_api_key
# ... other existing variables
```

### Getting API Keys

1. **OpenRouter API Key**
   - Visit [openrouter.ai/keys](https://openrouter.ai/keys)
   - Sign up and generate a new API key
   - Used for AI-powered search responses

2. **Serper API Key**
   - Visit [serper.dev](https://serper.dev/)
   - Sign up for a free account (2,500 free searches)
   - Get your API key from the dashboard
   - Used for web search results

3. **News API Key**
   - Visit [newsapi.org](https://newsapi.org/)
   - Sign up for a free developer account
   - Get your API key
   - Used for fetching news headlines

## Features

### AI-Powered Search
- Natural language search queries
- Contextual AI responses using GPT-4
- Web search results integration via Serper
- Source citations and links
- Place/business search with ratings and contact info
- Map integration for directions

### Weather Widget
- Automatic location detection via geolocation
- Current weather conditions
- Temperature, humidity, wind speed
- 3-day forecast
- Manual location override in settings

### News Feed
- Personalized news based on location
- Category filtering (general, technology, business, etc.)
- Article previews with images
- Time-based sorting
- Source attribution
- External link to full articles

### Feature Buttons
- **Chat** - Navigate to AI chat interface
- **Deep Research** - Coming soon
- **Calendar** - Coming soon
- **Photos** - Coming soon

### PWA Features
- Install prompt for mobile/desktop
- Offline support (partial)
- App icons and manifest
- Responsive design
- Theme toggle (dark/light mode)

## User Flow

1. **First Visit**
   - See splash screen (2 seconds)
   - Automatic location permission request
   - Homepage displays with personalized content

2. **Homepage Interaction**
   - Search for information using the search bar
   - View AI-generated responses with sources
   - Check current weather and forecast
   - Browse personalized news articles
   - Click feature buttons for quick access

3. **Navigate to Chat**
   - Click the Chat button in feature buttons
   - Seamlessly transition to chat interface
   - Start conversing with ARIA

4. **Settings**
   - Click settings icon in header
   - Customize location preferences
   - Toggle geolocation
   - Select news categories
   - Configure app preferences

## Implementation Details

### Location Detection
The homepage automatically requests location permission and:
1. Gets latitude/longitude from browser
2. Reverse geocodes to city name via `/api/geocode`
3. Stores location in localStorage
4. Updates weather widget and news feed

### Theme Management
Theme is managed via localStorage and applied on component mount:
```typescript
const [isDark, setIsDark] = useState(false)

useEffect(() => {
  const isDarkMode = document.documentElement.classList.contains("dark")
  setIsDark(isDarkMode)
}, [])
```

### Search Integration
Search queries are processed through:
1. Frontend: User enters query in SearchBar
2. Backend: `/api/search` endpoint
3. AI Processing: OpenRouter generates contextual response
4. Web Results: Serper provides search results
5. Frontend: Display formatted results with markdown

## Development

### Running Locally
```bash
# Install dependencies (if not already done)
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

### Testing the Integration
1. ✅ Splash screen displays for 2 seconds
2. ✅ Homepage loads with all components
3. ✅ Search functionality works with AI responses
4. ✅ Weather widget shows location-based data
5. ✅ News feed displays articles
6. ✅ Chat button navigates to `/chat`
7. ✅ Settings page is accessible
8. ✅ Theme toggle works
9. ✅ PWA install prompt appears (on supported browsers)

## Known Limitations

1. **API Rate Limits**
   - OpenRouter: Depends on your plan
   - Serper: 2,500 free searches/month
   - News API: 100 requests/day on free tier

2. **Feature Buttons**
   - Only Chat button is functional
   - Deep Research, Calendar, and Photos are placeholders

3. **Offline Mode**
   - Limited offline functionality
   - Search requires internet connection
   - Cached news/weather data may be stale

4. **Browser Compatibility**
   - PWA features require modern browsers
   - Geolocation requires HTTPS in production

## Future Enhancements

- [ ] Implement Deep Research feature
- [ ] Add Calendar integration
- [ ] Add Photos/Image search
- [ ] Enhanced offline support
- [ ] User authentication integration for personalized feed
- [ ] Bookmark/save articles functionality
- [ ] Share functionality for search results
- [ ] Voice search integration
- [ ] Multi-language support
- [ ] Advanced news filtering options

## Troubleshooting

### Search Not Working
- Check `OPENROUTER_API_KEY` is set correctly
- Check `SERPER_API_KEY` is set correctly
- Verify API keys are active and have credits
- Check browser console for errors

### Weather Not Loading
- Allow location permission in browser
- Check `/api/weather` endpoint is accessible
- Verify network requests in browser dev tools

### News Feed Empty
- Check `NEWS_API_KEY` is set correctly
- Verify API key is active (free tier has limits)
- Check browser console for API errors
- Try different news categories

### Chat Button Not Working
- Check `/chat` route exists
- Verify Next.js router is properly initialized
- Check browser console for navigation errors

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Review API key documentation and limits
4. Check [GitHub Issues](https://github.com/daybreakdata-ux/html-aria-Backend-API/issues)

---

**Integration Date**: January 6, 2026
**Aria-home Repository**: [daybreakdata-ux/Aria-home](https://github.com/daybreakdata-ux/Aria-home)
**Status**: ✅ Successfully Integrated

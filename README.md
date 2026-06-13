# Canvas Scribe Articles

A modern multi-article canvas viewer that allows you to load, organize, and annotate multiple web articles side-by-side on an infinite canvas.

## Features 

- **Multi-Article Canvas**: Load multiple articles simultaneously and arrange them freely on a canvas
- **Smooth Dragging**: Move articles around with precise mouse tracking
- **Flexible Resizing**: Resize articles from edges and corners to find the perfect layout
- **Canvas Navigation**: 
  - Pan around the canvas with the Pan tool
  - Zoom in/out with Ctrl+Scroll (or Cmd+Scroll on Mac)
- **Sidebar Toggle**: Quickly hide/show the left sidebar to focus on reading space
- **Content Fetching**: Automatically extracts and displays article content from web URLs
- **Local Persistence**: Your work is automatically saved to browser storage
- **Tools**:
  - **Move Tool**: Drag articles around the canvas
  - **Pan Tool**: Navigate the canvas with grab-and-drag
  - **Highlight Tool**: Mark important text (ready for future highlights UI)
  - **Note Tool**: Add sticky notes for annotations (ready for future implementation)
  - **Select Tool**: For future interactive features
- **Professional UI**: Modern gradient design with smooth animations and visual feedback
- **Smart Content Extraction**: Uses multiple content selectors to find main article content

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Sonner** for toast notifications
- **Lucide Icons** for beautiful icons

## Getting Started

### Prerequisites
- Node.js 16+ and npm installed

### Installation & Development

```bash
# 1. Navigate to the project directory
cd canvas-scribe-articles

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build

# Preview the production build
npm run preview
```

## Usage Guide

1. **Adding Articles**:
   - Click "Add Article" in the sidebar
   - Enter a valid URL (e.g., https://example.com)
   - The article content will load automatically

2. **Organizing Articles**:
   - Switch to "Move" tool
   - Click and drag article headers to reposition them
   - Drag from the right edge or bottom-right corner to resize

3. **Navigating**:
   - Switch to "Pan" tool and drag to navigate the canvas
   - Use Ctrl+Scroll (or Cmd+Scroll) to zoom in/out
   - Use the top-left toggle button to collapse or open the sidebar
   - The zoom level is displayed in the bottom-right corner

4. **Managing Articles**:
   - Click the minimize button (−) to collapse an article
   - Click the X button to remove an article from the canvas
   - Click the open link button in the sidebar to view the original article

## Architecture

```
src/
├── components/
│   ├── ArticleCard.tsx      - Individual article component with drag/resize
│   ├── CanvasWorkspace.tsx  - Main canvas with zoom/pan controls
│   ├── Sidebar.tsx          - Article management sidebar
│   ├── Toolbar.tsx          - Tool selection toolbar
│   └── ui/                  - shadcn/ui components
├── pages/
│   ├── Index.tsx            - Main application page
│   └── NotFound.tsx         - 404 page
├── lib/
│   ├── storage.ts           - localStorage persistence utility
│   ├── content-fetcher.ts   - Article content fetching with CORS proxy
│   └── utils.ts             - Utility functions
├── types/
│   └── index.ts             - TypeScript interfaces
└── App.tsx                  - Root component with routing
```

## Component Details

### ArticleCard
- Handles dragging with proper mouse offset tracking
- Supports both horizontal and corner resizing
- Shows loading state during content fetch
- Displays error messages if fetch fails

### CanvasWorkspace  
- Infinite zoomable canvas with grid background
- Pan support with smooth tracking
- Mouse-centered zoom calculation
- Zoom indicator display

### Sidebar
- Article list with quick access links
- URL validation before adding articles
- Visual feedback for loading state
- Delete functionality with toast notifications

### Toolbar
- Tool selection with visual feedback
- Helpful tips and shortcuts display
- Gradient styling for active tool

## State Management

Articles are stored both in React state and localStorage:

```typescript
interface Article {
  id: string;
  url: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimized: boolean;
  isLoading: boolean;
  error?: string;
  highlights: Highlight[];
  notes: Note[];
}
```

## Data Persistence

All articles and their positions are automatically saved to browser localStorage under the key `canvas-scribe-articles`. Your work persists across browser sessions.

## CORS Handling

The application uses multiple CORS proxies for maximum compatibility:
- Primary: corsproxy.io
- Fallback: api.allorigins.win

Content is automatically sanitized to remove scripts and dangerous attributes.

## Future Enhancements

- [ ] Highlight preservation and search
- [ ] Sticky notes with rich text editing
- [ ] Canvas export (PNG/PDF)
- [ ] Undo/Redo functionality
- [ ] Article collections/workspaces
- [ ] Text search across all articles
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Article tagging and filtering

## Troubleshooting

**Articles not loading?**
- Check that the URL is valid and publicly accessible
- Some sites may have strict CORS policies - try with a different URL
- Check browser console for error messages

**Performance issues with many articles?**
- Try reducing the zoom level
- Minimize articles you're not actively viewing
- The grid helps with positioning - align articles to improve performance

**Data not persisting?**
- Check browser console for storage errors
- Ensure localStorage is enabled in browser settings
- Try clearing browser cache if experiencing issues

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

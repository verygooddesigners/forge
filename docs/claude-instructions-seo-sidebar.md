# Instructions for Claude: Build SEO Optimization Right Sidebar

## Task
Build a comprehensive SEO optimization sidebar component for RotoWrite that matches the reference screenshot exactly. Replace the current SEO Assistant tab content in the RightSidebar component.

## Reference Screenshot Analysis

The sidebar contains these sections (top to bottom):

### 1. Navigation Tabs
- Three tabs: **GUIDELINES** (selected/purple), **OUTLINE**, **BRIEF**
- Use Shadcn Tabs component
- Active tab highlighted in primary purple/violet color

### 2. Content Score Section
- Heading: "Content Score" with info icon
- **Large semi-circular gauge** showing score (e.g., "82/100")
  - Segmented: Red (0-40), Orange (40-70), Green (70-100)
  - Needle pointing to current score
- Below gauge: **Avg 83** (with up/down arrow) and **Top 87** (with up arrow)
- **Details dropdown** below statistics

### 3. Action Buttons
- **Auto-Optimize** button: Dark blue/primary color, sparkle icon (✨), full width
- **Insert internal links** button: Light gray/secondary, link icon (🔗), full width

### 4. Content Structure Section
- Header: "Content Structure" with **Adjust** button (settings icon) on right
- Four metrics displayed:
  - **WORDS:** Current "2,267" ↑ | Target "3,043-3,499"
  - **HEADINGS:** Current "34" ✓ | Target "27-40" (green checkmark)
  - **PARAGRAPHS:** Current "65" ↑ | Target "at least 85"
  - **IMAGES:** Current "5" ↑ | Target "12-20"
- Each metric shows: current count, status indicator (↑/✓/↓), target range
- Color coding: Green (in range), Yellow/Orange (close), Red (far from target)

### 5. Terms Section
- Header: "Terms" with **Adjust** button (settings icon) on right
- **Search bar** with magnifying glass icon, placeholder "Search"
- **Category tags:** "#Content - 14", "#Market - 12" (with dropdown arrows)
- **Filter tabs:** "All 80" (selected/purple), "Headings 5", "NLP 65"
- **Terms list:** Each term shows:
  - Term name (e.g., "content marketing metrics")
  - Usage count vs target: "7/8-15"
  - Color-coded background: Green (optimal), Yellow/Orange (slightly off), Red (over/under)
  - Arrow indicator: ↑ (over), ↓ (under), ✓ (optimal)

### 6. Floating Help Button
- Dark circular button, bottom right corner
- White question mark icon
- Fixed position

## Implementation Requirements

### Component Structure
- **New file:** `components/dashboard/SEOOptimizationSidebar.tsx`
- **Props:**
  ```typescript
  {
    projectId: string | null;
    content: any; // TipTap JSON content from editor
    project: Project | null;
    onContentUpdate?: (content: any) => void;
  }
  ```

### Key Features

1. **Real-time Updates**
   - Listen to editor content changes
   - Debounce analysis (2-second delay)
   - Recalculate score, metrics, and terms on content change
   - When no content exists, show 0 score (greyed out gauge)

2. **Content Analysis**
   - Extract from TipTap editor content:
     - Word count
     - Heading count (H2 + H3)
     - Paragraph count
     - Image count
   - Extract terms/keywords using NLP
   - Track term frequency

3. **SEO Score Calculation**
   - Use existing `lib/seo.ts` functions
   - Call `/api/seo/analyze` endpoint
   - Factors: keyword density, heading structure, content length, term usage, images
   - Score range: 0-100
   - Display "Avg" (average of all projects) and "Top" (best score)

4. **Auto-Optimize**
   - Analyze content for optimization opportunities
   - Suggest edits: add keywords, adjust headings, add paragraphs/images, optimize terms
   - Apply suggestions to editor (with user confirmation)

5. **Internal Links**
   - Analyze content for link opportunities
   - Suggest relevant internal links based on keywords and topics
   - Insert links into editor

### Styling

- **Colors:** Use RotoWrite primary purple/violet (`hsl(var(--primary))`)
- **Custom colors:** Green/Yellow/Red shades that match purple theme (not standard colors)
- **Font:** Inter, weight 400 (body), 600-800 (headings)
- **Dividing lines:** 1px, soft purple, padding above/below
- **Spacing:** Generous padding throughout
- **Layout:** 320px width (w-80), scrollable content

### Integration

1. Replace SEO Assistant tab content in `components/dashboard/RightSidebar.tsx`
2. Pass content from EditorPanel (may need to lift state or use context)
3. Enhance `/api/seo/analyze` endpoint to return all required data
4. Create `/api/seo/auto-optimize` endpoint
5. Create `/api/seo/internal-links` endpoint

### Data Flow

```
EditorPanel (content) 
  → SEOOptimizationSidebar (receives content)
    → Analyzes content (word count, headings, terms)
    → Calls /api/seo/analyze
    → Updates score, metrics, terms display
    → Real-time updates on content change
```

### Edge Cases

- No content: Show 0 score, greyed out gauge, empty metrics
- No project: Show placeholder message
- Loading states: Show spinners/skeletons
- API errors: Show error messages gracefully

## Deliverables

1. **SEOOptimizationSidebar.tsx** - Main component with all sections
2. **Gauge component** - Semi-circular score gauge (SVG or library)
3. **API endpoint enhancements** - Update `/api/seo/analyze`, create new endpoints
4. **Integration** - Update RightSidebar to use new component
5. **Styling** - Match screenshot exactly with RotoWrite design system

## Testing

- Content score updates in real-time
- All metrics calculate correctly
- Terms list updates correctly
- Search and filters work
- Auto-optimize and internal links buttons function
- Handles edge cases (no content, loading, errors)

## Notes

- Match screenshot design exactly
- Use existing Shadcn UI components and Tailwind CSS
- Follow RotoWrite code patterns and conventions
- Ensure good performance (debounce, memoization)
- Make accessible (keyboard nav, ARIA labels)


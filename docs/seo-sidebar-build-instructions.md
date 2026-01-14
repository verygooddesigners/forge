# SEO Optimization Right Sidebar - Build Instructions

## Overview
Build a comprehensive SEO optimization sidebar for RotoWrite that matches the reference screenshot exactly. This sidebar will replace or enhance the current SEO Assistant tab in the RightSidebar component.

## Component Structure

### Location
- **File:** `components/dashboard/SEOOptimizationSidebar.tsx` (new component)
- **Integration:** Replace the SEO Assistant tab content in `components/dashboard/RightSidebar.tsx`

---

## 1. Navigation Tabs (Top Section)

### Requirements
- Three horizontal tabs at the top: **GUIDELINES**, **OUTLINE**, **BRIEF**
- Default selected tab: **GUIDELINES** (highlighted in purple/violet)
- Use Shadcn Tabs component
- Tab styling: Purple/violet highlight for active tab, matching RotoWrite's primary color scheme

### Implementation Notes
- Use `Tabs`, `TabsList`, `TabsTrigger` from `@/components/ui/tabs`
- Active tab should use primary color (`text-primary` or `bg-primary`)
- Tab text should be uppercase: "GUIDELINES", "OUTLINE", "BRIEF"

---

## 2. Content Score Section

### Visual Design
- **Heading:** "Content Score" with an information icon (ℹ️) next to it
- **Large Semi-Circular Gauge:**
  - Shows score as "82/100" (or current score)
  - Segmented colors: Red (0-40), Orange (40-70), Green (70-100)
  - Needle/pointer indicating current score position
  - Gauge should be visually prominent (large size)

### Statistics Below Gauge
- **Avg 83** with up/down arrow icon (showing average score)
- **Top 87** with up arrow icon (showing top score)
- These should be displayed horizontally, side by side

### Details Dropdown
- A "Details" dropdown menu below the statistics
- Should expand to show detailed breakdown of score calculation

### Implementation Notes
- Create a custom gauge component using SVG or a library like `recharts`
- Score should be reactive and update in real-time as content changes
- When no content exists, gauge should be greyed out and show 0
- Use Inter font, weight 400 for body text, weight 600-800 for headings

---

## 3. Action Buttons Section

### Buttons Required
1. **Auto-Optimize Button**
   - Dark blue/primary color background
   - Sparkle icon (✨) on the left
   - Text: "Auto-Optimize"
   - Full width or prominent placement

2. **Insert Internal Links Button**
   - Light gray/secondary color background
   - Link icon (🔗) on the left
   - Text: "Insert internal links"
   - Full width or prominent placement

### Implementation Notes
- Use `Button` component from Shadcn UI
- Primary button variant for Auto-Optimize
- Secondary/outline variant for Insert Internal Links
- Icons from `lucide-react`: `Sparkles` and `Link`

---

## 4. Content Structure Section

### Section Header
- **Title:** "Content Structure"
- **Adjust Button:** On the right side with filter/settings icon (⚙️)
- Button should open a modal/sheet to adjust target ranges

### Metrics Table
Display four key metrics in a tabular/card format:

#### WORDS
- **Current:** "2,267" (with upward arrow indicating below target)
- **Target Range:** "3,043-3,499"
- **Status Indicator:** Up arrow (↑) when below, checkmark (✓) when in range, down arrow (↓) when above

#### HEADINGS
- **Current:** "34" (with green checkmark indicating in range)
- **Target Range:** "27-40"
- **Status Indicator:** Same as above

#### PARAGRAPHS
- **Current:** "65" (with upward arrow indicating below target)
- **Target:** "at least 85"
- **Status Indicator:** Same as above

#### IMAGES
- **Current:** "5" (with upward arrow indicating below target)
- **Target Range:** "12-20"
- **Status Indicator:** Same as above

### Visual Design
- Each metric should be clearly separated
- Use color coding: Green for in-range, Yellow/Orange for close, Red for far from target
- Numbers should be formatted with commas for readability
- Status indicators should be visually clear (icons or colored backgrounds)

### Implementation Notes
- Extract metrics from TipTap editor content
- Real-time updates as user edits content
- Calculate: word count, heading count (H2+H3), paragraph count, image count
- Compare against target ranges (stored in project or brief data)

---

## 5. Terms Section

### Section Header
- **Title:** "Terms"
- **Adjust Button:** On the right side with filter/settings icon (⚙️)
- Button should open a modal/sheet to adjust term targets

### Search Bar
- Search input with magnifying glass icon (🔍)
- Placeholder text: "Search"
- Should filter the terms list in real-time

### Category Tags
- Display tags like "#Content - 14" and "#Market - 12"
- Tags should be clickable/filterable
- Dropdown arrow next to tags to expand/collapse category

### Filter Tabs
Three horizontal filter tabs:
- **All 80** (selected, highlighted in purple) - Shows all terms
- **Headings 5** - Shows only terms in headings
- **NLP 65** - Shows NLP-extracted terms

### Terms List
Each term displays:
- **Term name** (e.g., "content marketing metrics")
- **Current usage count / Target range** (e.g., "7/8-15")
- **Color-coded background:**
  - Green: Optimal usage (within target range)
  - Yellow/Orange: Slightly under or at lower end of target
  - Red: Over-usage (above target range) or significantly under
- **Arrow indicator:** Up arrow (↑) for over-usage, down arrow (↓) for under-usage

### Example Terms Display
```
┌─────────────────────────────────────┐
│ content marketing metrics           │
│ 7/8-15                              │
│ [Yellow/Orange background]          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ content marketing strategy          │
│ 5/2-4                               │
│ [Red background, ↓ arrow]           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ content marketing success           │
│ 2/2-4                               │
│ [Green background, ✓]               │
└─────────────────────────────────────┘
```

### Implementation Notes
- Terms should be extracted from content using NLP/keyword analysis
- Track term frequency in content
- Compare against target ranges (from SEO analysis or brief)
- Real-time updates as content changes
- Terms should be clickable to highlight in editor

---

## 6. Floating Help Button

### Design
- Dark circular button in bottom right corner
- White question mark icon (❓)
- Fixed position (floating)
- Should open help documentation or tooltips

---

## Technical Requirements

### Data Sources
1. **Content Analysis:**
   - Extract content from TipTap editor (via props or context)
   - Parse HTML/JSON to count words, headings, paragraphs, images
   - Extract terms and keywords

2. **SEO Analysis:**
   - Use existing `lib/seo.ts` functions
   - Call `/api/seo/analyze` endpoint for comprehensive analysis
   - Store target ranges in project or brief data

3. **Real-time Updates:**
   - Listen to editor content changes
   - Debounce updates (2-second delay)
   - Recalculate metrics and scores on content change

### API Endpoints Needed
1. **GET/POST `/api/seo/analyze`** - Comprehensive SEO analysis
   - Input: Content (HTML/JSON), primary keyword, secondary keywords, brief requirements
   - Output: Score, metrics, term analysis, suggestions

2. **POST `/api/seo/auto-optimize`** - Auto-optimize content
   - Input: Current content, project data
   - Output: Optimized content suggestions or edits

3. **POST `/api/seo/internal-links`** - Generate internal link suggestions
   - Input: Current content, project keywords
   - Output: Internal link suggestions

### Component Props
```typescript
interface SEOOptimizationSidebarProps {
  projectId: string | null;
  content: any; // TipTap JSON content
  project: Project | null;
  onContentUpdate?: (content: any) => void; // Callback for auto-optimize
}
```

### State Management
- Use React hooks (`useState`, `useEffect`)
- Store: current score, metrics, terms, loading states
- Debounce content analysis to avoid performance issues

---

## Styling Guidelines

### Colors
- **Primary Purple/Violet:** Use RotoWrite's primary color (`hsl(var(--primary))`)
- **Green (Good):** Custom shade matching purple theme (not standard green)
- **Yellow/Orange (Warning):** Custom shade matching purple theme
- **Red (Bad):** Custom shade matching purple theme
- **Dividing Lines:** 1px, soft purple color with padding above/below

### Typography
- **Font:** Inter (already configured)
- **Body:** Weight 400
- **H1:** Weight 800
- **H2-H3:** Weight 600
- **Small text:** Weight 400, smaller size

### Spacing
- Generous padding throughout for clean look
- Consistent gap between sections (gap-3 or gap-4)
- Padding above/below dividing lines

### Layout
- Sidebar width: 320px (w-80) - matches current RightSidebar
- Scrollable content area
- Fixed header with tabs
- Sticky action buttons if needed

---

## Integration Steps

1. **Create New Component**
   - Create `components/dashboard/SEOOptimizationSidebar.tsx`
   - Implement all sections described above

2. **Update RightSidebar**
   - Replace SEO Assistant tab content with new component
   - Pass necessary props (projectId, content, project)
   - Keep NewsEngine tab as-is

3. **Connect to Editor**
   - Get content from EditorPanel via props or context
   - Set up real-time content change listeners
   - Update metrics and scores on content change

4. **Create API Endpoints**
   - Enhance `/api/seo/analyze` to return all required data
   - Create `/api/seo/auto-optimize` endpoint
   - Create `/api/seo/internal-links` endpoint

5. **Add Database Fields** (if needed)
   - Store target ranges for content structure
   - Store term targets and categories
   - Store historical scores (for "Avg" and "Top" calculations)

---

## Functionality Details

### Content Score Calculation
- Base score: 0-100
- Factors:
  - Keyword density (primary + secondary)
  - Heading structure (H1, H2, H3 counts)
  - Content length (word count)
  - Term usage (matching target ranges)
  - Image count
  - Paragraph structure
- Update in real-time as content changes

### Auto-Optimize Feature
- Analyze current content
- Identify optimization opportunities
- Suggest edits:
  - Add missing keywords
  - Adjust heading structure
  - Add paragraphs/images
  - Optimize term usage
- Apply suggestions to editor (with user confirmation)

### Internal Links Feature
- Analyze content for link opportunities
- Suggest relevant internal links based on:
  - Keywords
  - Related projects/content
  - Topic relevance
- Insert links into editor at appropriate locations

### Terms Extraction
- Use NLP/keyword extraction from content
- Categorize terms (Content, Market, etc.)
- Track frequency
- Compare against target ranges
- Highlight terms in editor when clicked

---

## Testing Checklist

- [ ] Content Score updates in real-time as content changes
- [ ] Gauge displays correctly for all score ranges (0-100)
- [ ] Content Structure metrics calculate correctly
- [ ] Terms list updates when content changes
- [ ] Search filters terms correctly
- [ ] Filter tabs (All/Headings/NLP) work correctly
- [ ] Auto-Optimize button triggers optimization
- [ ] Insert Internal Links button works
- [ ] Adjust buttons open configuration modals
- [ ] All sections display correctly when no content exists
- [ ] Responsive design works on different screen sizes
- [ ] Performance is acceptable (debouncing works)

---

## Notes

- Match the screenshot design as closely as possible
- Use existing RotoWrite design system (Shadcn UI, Tailwind CSS)
- Follow existing code patterns and conventions
- Ensure accessibility (keyboard navigation, ARIA labels)
- Optimize for performance (debounce, memoization)
- Handle edge cases (no content, no project, loading states)




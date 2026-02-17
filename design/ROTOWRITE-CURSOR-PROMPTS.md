# Forge Redesign - Cursor Prompts

Copy and paste these prompts into Cursor to implement the redesign. Work through them in order.

---

## PROMPT 1: Setup Design System

```
I'm redesigning the Forge UI with a new dark "Editorial Command Center" theme. 

First, set up the design system foundation:

1. Add these Google Fonts to the project:
   - DM Sans (weights: 400, 500, 600, 700)
   - Space Mono (weights: 400, 700)

2. Create or update the global CSS/Tailwind config with these design tokens:

COLORS:
- Backgrounds (dark to light): #0a0a0b, #111113, #18181b, #1f1f23, #27272a
- Text: #fafafa (primary), #a1a1aa (secondary), #71717a (tertiary), #52525b (muted)
- Primary Accent (Forge Purple): #7C49E3, hover: #9166e8, muted: rgba(124, 73, 227, 0.15)
- Success: #22c55e, muted: rgba(34, 197, 94, 0.15)
- Warning: #eab308, muted: rgba(234, 179, 8, 0.15)  
- Error: #ef4444, muted: rgba(239, 68, 68, 0.15)
- Borders: rgba(255,255,255,0.06), rgba(255,255,255,0.1), rgba(255,255,255,0.15)

TYPOGRAPHY:
- Sans: 'DM Sans' for all UI text
- Mono: 'Space Mono' for numbers, data, code

Remove any existing light theme or old purple color scheme. This is a dark-only interface.
```

---

## PROMPT 2: Build App Shell & Sidebar

```
Now rebuild the main app layout shell with a fixed sidebar navigation.

STRUCTURE:
- Fixed sidebar on left (260px wide)
- Main content area that scrolls independently
- Sticky top bar (65px tall)

SIDEBAR SPECS:
- Background: #111113
- Right border: 1px solid rgba(255,255,255,0.06)

- Logo section at top (24px padding):
  - Logo mark: 36x36px square, rounded 8px, gradient from #7C49E3 to #5b2dcf, white "RW" text in Space Mono
  - Logo text: "Forge" in DM Sans 20px bold, "Write" portion colored #7C49E3

- Navigation sections with labels:
  - Labels: 10px uppercase, letter-spacing 1px, color #71717a
  - Nav items: 14px medium weight, 12px padding, 8px border-radius
  - Hover state: background #27272a
  - Active state: background rgba(124, 73, 227, 0.15), text color #7C49E3
  - Icons: 20px, Heroicons outline style

- Nav structure:
  WORKSPACE: Dashboard, Projects (with count badge), SmartBriefs
  AI TOOLS: Writer Factory, NFL Odds Extractor, NewsEngine  
  SYSTEM: Admin

- User card at bottom:
  - Border-top separator
  - Avatar (36px, gradient background), name, role badge
  - Hover state on the whole card

TOP BAR:
- Background: #111113
- Bottom border: 1px solid rgba(255,255,255,0.06)
- Left: page title or back button + title
- Right: action buttons
```

---

## PROMPT 3: Create Core UI Components

```
Create reusable UI components with these specs:

BUTTONS:
- Base: 13px font, 600 weight, 10px 18px padding, 8px radius, 0.15s transition
- Primary: bg #7C49E3, white text, hover: #9166e8 + translateY(-1px) + purple glow shadow
- Secondary: bg rgba(124,73,227,0.15), text #7C49E3, border rgba(124,73,227,0.3)
- Ghost: transparent bg, #a1a1aa text, border rgba(255,255,255,0.1), hover: bg #27272a
- Small variant: 12px font, 8px 14px padding

CARDS:
- Background: #18181b
- Border: 1px solid rgba(255,255,255,0.06)
- Border-radius: 12px
- Padding: 24px
- Hover: bg #1f1f23, border rgba(255,255,255,0.15), translateY(-2px)

FORM INPUTS:
- Background: #18181b
- Border: 1px solid rgba(255,255,255,0.1)
- Border-radius: 8px
- Padding: 12px 16px
- Focus: border #7C49E3, bg #1f1f23, box-shadow 0 0 0 3px rgba(124,73,227,0.15)
- Placeholder color: #52525b

BADGES:
- 10px uppercase, 600 weight, 0.5px letter-spacing, 4px 10px padding, 4px radius
- Primary (draft): bg rgba(124,73,227,0.15), text #7C49E3
- Success (published): bg rgba(34,197,94,0.15), text #22c55e
- Warning: bg rgba(234,179,8,0.15), text #eab308
- Neutral: bg #27272a, text #a1a1aa

PROGRESS BAR:
- Track: #27272a, 8px height, 4px radius
- Fill: gradient from #7C49E3 to #9166e8
- Success fill: gradient from #22c55e to #16a34a
```

---

## PROMPT 4: Rebuild Dashboard

```
Rebuild the Dashboard page with these sections:

1. WELCOME SECTION
- Greeting: "Good afternoon, [User Name]" - 28px bold
- Subtitle: context about drafts/articles ready - 15px, #a1a1aa

2. STATS ROW (4-column grid, 16px gap)
- Cards showing: Articles This Week, Words Generated, Avg SEO Score, Active SmartBriefs
- Each card: label (12px uppercase #71717a), value (28px bold Space Mono), change indicator if applicable
- SEO score value should be colored #7C49E3

3. QUICK ACTIONS (3-column grid, 16px gap)
- Cards for: Create New Article, Build SmartBrief, Extract NFL Odds
- Each card has:
  - Icon container (44px, 10px radius, colored background matching function)
  - Title (16px semibold)
  - Description (13px #71717a)
  - Hover: top 2px accent line appears (use ::before pseudo-element)

4. RECENT PROJECTS
- Section header: "Recent Projects" with "View all →" link on right
- 2-column grid of project cards
- Each card shows:
  - Title (15px semibold)
  - Status badge (Draft=purple, Published=green)
  - Meta row: date, word count, SEO score
  - Keywords as small mono tags
  
5. AI STATUS INDICATOR (bottom)
- Subtle card with: pulsing green dot + "7 AI Agents online and ready"
- Pulse animation: opacity 1→0.5→1 over 2 seconds
```

---

## PROMPT 5: Rebuild Projects View

```
Rebuild the Projects page:

FILTERS BAR (horizontal, 16px gap):
- Search input with magnifying glass icon (max-width 400px)
- Filter tabs in pill container: All | Drafts | Published
  - Container: #18181b background, 4px padding, 8px radius
  - Active tab: #1f1f23 background
- Sort dropdown: "Newest first" with chevron icon

SUMMARY STATS (horizontal row with dividers):
- Total Projects (number)
- Drafts count (colored #7C49E3)
- Published count (colored #22c55e)  
- Total Words
- Use 1px vertical dividers between stats

PROJECTS GRID (3 columns, 20px gap):
- Cards with all the same specs as dashboard project cards
- Add colored top border on hover:
  - Draft cards: 3px #7C49E3 top border
  - Published cards: 3px #22c55e top border
- Add writer model badge at bottom of each card:
  - Small avatar + "Blake Weishaar model" text
```

---

## PROMPT 6: Rebuild SmartBriefs Landing

```
Rebuild the SmartBriefs landing page:

HERO SECTION:
- Large card with subtle gradient background (#18181b to #1f1f23)
- Add radial gradient glow effect in top-right (purple, very subtle)
- Content:
  - Small badge: "AI-Powered Templates" with lightning icon
  - Title: "Build Once, Generate Infinitely" (32px bold)
  - Description paragraph (16px #a1a1aa)
  - Two buttons: "Create Your First Brief" (primary), "Learn More" (ghost)

INFO CARDS (3-column grid):
- Three cards explaining the concept:
  1. "Define Structure" - amber/gold icon
  2. "Configure AI" - purple icon  
  3. "Reuse Forever" - green icon
- Each has: icon in colored container, title, description

YOUR SMARTBRIEFS SECTION:
- Header: "Your SmartBriefs" with count
- 2-column grid of brief cards
- Each card:
  - Title + category badge (top right)
  - Description (13px #71717a)
  - Meta row at bottom with border-top: projects count, updated date
  - "Shared" badge if applicable (purple, with users icon)
```

---

## PROMPT 7: Rebuild Create SmartBrief Form

```
Rebuild the Create SmartBrief page with a two-column layout:

LEFT COLUMN (~65% width):

1. Basic Info Section:
   - Section title + description
   - Row with: Name input, Category dropdown

2. Scaffold Editor:
   - Card container with toolbar at top
   - Toolbar: undo/redo, H1/H2/H3 buttons, bold/italic, list buttons
   - Toolbar buttons: 32px square, hover state
   - Content area: min-height 300px, contenteditable or rich text editor
   - Placeholder content showing example structure

RIGHT COLUMN (~35% width, #111113 background):

1. Panel header: purple icon + "AI Configuration"

2. Instructions card:
   - Label with "Required" badge
   - Textarea for AI instructions (min-height 100px)

3. Training Stories section:
   - List of URL inputs (mono font)
   - Each with remove button
   - "Add another URL" button (dashed border)
   - "Analyze Example URLs" button (purple secondary style)

4. Share toggle:
   - "Share with team" label + description
   - Toggle switch (44px wide, purple when active)

TOP BAR:
- Back button: "← SmartBriefs"  
- Title: "Create New SmartBrief"
- Actions: "Save Draft" (ghost), "Create SmartBrief" (primary with checkmark icon)
```

---

## PROMPT 8: Rebuild Writer Factory

```
Rebuild the Writer Factory page with a two-column layout:

LEFT COLUMN (320px fixed width, #111113 background):

1. Search input at top

2. Scrollable list of writer model cards:
   - Avatar (42px, gradient if trained, gray #27272a if not)
   - Name (14px semibold)
   - Status badge: "Trained" (green), "X% Trained" (yellow), "Untrained" (gray)
   - Story count: "X / 25 stories" in mono
   - Active state: #18181b background with border

3. "Add Writer Model" button at bottom (dashed border style)

RIGHT COLUMN (fluid width):

1. Writer Profile Header:
   - Large avatar (80px)
   - Name (24px bold)
   - Stats row: Trained %, Stories count, Projects using count

2. Training Progress Card:
   - Progress bar with label
   - "X / 25 stories" indicator
   - Helper text below

3. Training Stories Section:
   - Header with "Add Story" button
   - 2-column grid of story cards
   - Each card: title, source (mono), green status dot
   - Last card slot: "Add training story" with dashed border

4. Voice Analysis Card:
   - Purple AI icon + "Voice Analysis" header
   - "Detected writing patterns and style traits" subtitle
   - Flex-wrap container of trait tags
   - Some tags highlighted (purple background/border)
```

---

## PROMPT 9: Rebuild NFL Odds Extractor

```
Rebuild the NFL Odds Extractor page (single column, max-width 1000px, centered):

1. HERO (centered):
   - Icon: 64px, green background (#22c55e muted), image icon
   - Title: "Extract & Generate" (28px bold)
   - Description paragraph

2. CONFIGURATION CARD:
   - Step badge: "1" in purple circle + "Configure Extraction"
   - Form row: Week Number dropdown, Season Year input
   - Custom Headline input (with "optional" note)

3. UPLOAD CARD:
   - Step badge: "2" + "Upload Screenshots"
   - Two-column grid of upload zones:
     - Dashed border (2px), 12px radius, 32px padding
     - Icon, title, description, "Choose file" button
     - Hover: purple border, purple-muted background
     - Has-file state: solid green border, checkmark icon, filename display
   - "Extract & Generate Article" button below (large, green, centered)

4. HOW IT WORKS CARD:
   - Title with AI/lightbulb icon
   - 4-column grid of steps:
     - Each: numbered circle (colored border), title, description
     - Colors: 1=amber, 2=purple, 3=green, 4=amber

5. RECENT EXTRACTIONS:
   - List of recent extraction items
   - Each row: Week number (mono, purple), title, meta, "Completed" badge
```

---

## PROMPT 10: Rebuild Admin Dashboard

```
Rebuild the Admin Dashboard:

TAB BAR:
- Pill-style tabs: User Management | API Keys | AI Agents | Settings
- Container: #18181b, 4px padding, 10px radius
- Tab: 13px medium, 10px 20px padding
- Active: #1f1f23 background

USER MANAGEMENT TAB (default):

Section card with:
- Header: title, description, "Create User" primary button
- Table with columns: User, Status, Role, Created, Actions

Table specs:
- Header row: #1f1f23 background, 11px uppercase labels
- Data rows: 16px padding, bottom border, hover background
- User cell: avatar + email + name stacked
- Status: colored dot + label (active=green, pending=yellow)
- Role: badge (admin=purple, strategist=neutral gray)
- Created: mono font date
- Actions: icon buttons for edit and delete
- Delete button: red on hover

AI AGENTS TAB (when clicked):
- 2-column grid of agent cards
- Each card:
  - Number badge (purple) + name + status dot (green)
  - Description (12px #71717a)
  - Meta: model name, max tokens (mono font)
  - Selected state: purple border and muted background

- Config panel below (when agent selected):
  - Header with agent name
  - System Instructions textarea (tall, mono font)
  - Temperature slider (0.0 to 1.0)
  - Max Tokens input
  - Save/Reset buttons
```

---

## PROMPT 11: Final Polish

```
Apply final polish across all pages:

1. TRANSITIONS:
   - All interactive elements: transition 0.15s ease
   - Cards: transition 0.2s ease
   - Ensure hover states feel responsive

2. LOADING STATES:
   - Add skeleton loaders for cards and tables
   - Use pulsing animation on #1f1f23 backgrounds

3. EMPTY STATES:
   - When no projects: centered message with icon, title, description, CTA button
   - When no SmartBriefs: similar pattern
   - Use muted colors and 64px icons

4. FOCUS STATES:
   - All inputs: purple border + purple glow shadow on focus
   - Buttons: visible focus ring for accessibility

5. CONSISTENCY CHECK:
   - Verify all old purple is replaced with #7C49E3
   - Verify all backgrounds use the correct layer (#0a0a0b → #27272a)
   - Verify Space Mono is used for all numbers and data values
   - Verify DM Sans is used for all other text

6. Remove any remaining light theme styles or white backgrounds.
```

---

## Tips for Using These Prompts

1. **Work sequentially** - Each prompt builds on the previous one

2. **One prompt at a time** - Let Cursor complete each task before moving to the next

3. **Reference the mockups** - Keep the HTML mockup files open as visual references

4. **Test as you go** - Check each screen in the browser before moving on

5. **Adjust as needed** - If something doesn't look right, describe the specific issue to Cursor

6. **Keep the style guide handy** - Reference `rotowrite-style-guide.html` for the purple color in context

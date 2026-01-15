# RotoWrite UI Redesign - Cursor Implementation Guide

This document provides complete specifications for rebuilding the RotoWrite UI with the new "Editorial Command Center" design system. Follow these guidelines to implement a consistent, professional dark theme across all screens.

---

## Table of Contents

1. [Design System Tokens](#design-system-tokens)
2. [Typography](#typography)
3. [Core Components](#core-components)
4. [Layout Structure](#layout-structure)
5. [Screen-by-Screen Implementation](#screen-by-screen-implementation)
6. [Icons](#icons)
7. [Animations & Transitions](#animations--transitions)

---

## Design System Tokens

### Color Palette

Add these CSS custom properties to your global styles (or Tailwind config):

```css
:root {
  /* Background Layers (darkest to lightest) */
  --bg-deepest: #0a0a0b;    /* Page background */
  --bg-deep: #111113;       /* Sidebar, top bar */
  --bg-surface: #18181b;    /* Cards, panels */
  --bg-elevated: #1f1f23;   /* Hover states, elevated cards */
  --bg-hover: #27272a;      /* Interactive hover */

  /* Text Hierarchy */
  --text-primary: #fafafa;    /* Headings, important text */
  --text-secondary: #a1a1aa;  /* Body text, descriptions */
  --text-tertiary: #71717a;   /* Labels, hints */
  --text-muted: #52525b;      /* Disabled, placeholder */

  /* Primary Accent - RotoWrite Purple */
  --accent-primary: #7C49E3;
  --accent-hover: #9166e8;
  --accent-muted: rgba(124, 73, 227, 0.15);
  --accent-glow: rgba(124, 73, 227, 0.4);
  --accent-dark: #5b2dcf;
  --accent-light: #a78bfa;

  /* Status Colors */
  --success: #22c55e;
  --success-muted: rgba(34, 197, 94, 0.15);
  --warning: #eab308;
  --warning-muted: rgba(234, 179, 8, 0.15);
  --error: #ef4444;
  --error-muted: rgba(239, 68, 68, 0.15);

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(255, 255, 255, 0.15);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 4px 16px var(--accent-glow);

  /* Layout */
  --sidebar-width: 260px;
  --topbar-height: 65px;
}
```

### Tailwind Config Extension

If using Tailwind, extend your config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          deepest: '#0a0a0b',
          deep: '#111113',
          surface: '#18181b',
          elevated: '#1f1f23',
          hover: '#27272a',
        },
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          tertiary: '#71717a',
          muted: '#52525b',
        },
        accent: {
          primary: '#7C49E3',
          hover: '#9166e8',
          muted: 'rgba(124, 73, 227, 0.15)',
          dark: '#5b2dcf',
          light: '#a78bfa',
        },
        success: {
          DEFAULT: '#22c55e',
          muted: 'rgba(34, 197, 94, 0.15)',
        },
        warning: {
          DEFAULT: '#eab308',
          muted: 'rgba(234, 179, 8, 0.15)',
        },
        error: {
          DEFAULT: '#ef4444',
          muted: 'rgba(239, 68, 68, 0.15)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          default: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.15)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
}
```

---

## Typography

### Font Setup

Import fonts in your HTML head or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Font | Size | Weight | Letter Spacing | Color |
|---------|------|------|--------|----------------|-------|
| H1 | DM Sans | 32px | 700 | -0.5px | text-primary |
| H2 | DM Sans | 24px | 700 | -0.3px | text-primary |
| H3 | DM Sans | 18px | 600 | 0 | text-primary |
| H4 | DM Sans | 16px | 600 | 0 | text-primary |
| Body | DM Sans | 15px | 400 | 0 | text-secondary |
| Body Small | DM Sans | 13px | 400 | 0 | text-tertiary |
| Label | DM Sans | 13px | 500 | 0 | text-secondary |
| Caption | DM Sans | 12px | 400 | 0 | text-tertiary |
| Nav Label | DM Sans | 10px | 600 | 1px | text-tertiary |
| Mono | Space Mono | 13px | 400 | 0 | varies |
| Mono Small | Space Mono | 11px | 400 | 0 | varies |

### Usage Guidelines

- **DM Sans**: All UI text, headings, buttons, labels
- **Space Mono**: Numbers, data values, code, technical info, badges with counts
- Use `text-transform: uppercase` + `letter-spacing: 0.5-1px` for small labels and nav sections

---

## Core Components

### Buttons

```css
/* Base Button */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

/* Primary - Purple filled */
.btn-primary {
  background: var(--accent-primary);
  color: white;
}
.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px var(--accent-glow);
}

/* Secondary - Purple outline/muted */
.btn-secondary {
  background: var(--accent-muted);
  color: var(--accent-primary);
  border: 1px solid rgba(124, 73, 227, 0.3);
}
.btn-secondary:hover {
  background: rgba(124, 73, 227, 0.25);
}

/* Ghost - Transparent with border */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

/* Success */
.btn-success {
  background: var(--success);
  color: white;
}

/* Danger */
.btn-danger {
  background: var(--error-muted);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Small variant */
.btn-sm {
  padding: 8px 14px;
  font-size: 12px;
}
```

### Cards

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}

.card:hover {
  background: var(--bg-elevated);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

/* Card with accent top border */
.card-accent {
  border-top: 3px solid var(--accent-primary);
}
```

### Form Inputs

```css
.form-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: var(--font-sans);
  transition: all 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--bg-elevated);
  box-shadow: 0 0 0 3px var(--accent-muted);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
```

### Status Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 4px;
}

.badge-primary {
  background: var(--accent-muted);
  color: var(--accent-primary);
}

.badge-success {
  background: var(--success-muted);
  color: var(--success);
}

.badge-warning {
  background: var(--warning-muted);
  color: var(--warning);
}

.badge-error {
  background: var(--error-muted);
  color: var(--error);
}

.badge-neutral {
  background: var(--bg-hover);
  color: var(--text-secondary);
}
```

### Progress Bar

```css
.progress-bar {
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-hover));
  transition: width 0.3s ease;
}

.progress-fill-success {
  background: linear-gradient(90deg, var(--success), #16a34a);
}
```

---

## Layout Structure

### App Shell

```html
<div class="app-shell">
  <aside class="sidebar">
    <!-- Sidebar content -->
  </aside>
  <main class="main-content">
    <header class="top-bar">
      <!-- Top bar content -->
    </header>
    <div class="page-content">
      <!-- Page-specific content -->
    </div>
  </main>
</div>
```

```css
.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: var(--bg-deep);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.main-content {
  margin-left: 260px;
  flex: 1;
  min-height: 100vh;
  background: var(--bg-deepest);
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-deep);
  position: sticky;
  top: 0;
  z-index: 50;
  height: 65px;
}

.page-content {
  padding: 32px;
  max-width: 1400px;
}
```

### Sidebar Structure

```html
<aside class="sidebar">
  <!-- Logo -->
  <div class="sidebar-header">
    <div class="logo">
      <div class="logo-mark">RW</div>
      <div class="logo-text">Roto<span>Write</span></div>
    </div>
  </div>
  
  <!-- Navigation -->
  <nav class="nav-section">
    <div class="nav-label">Workspace</div>
    <a class="nav-item active" href="#">
      <svg class="nav-icon">...</svg>
      Dashboard
    </a>
    <a class="nav-item" href="#">
      <svg class="nav-icon">...</svg>
      Projects
      <span class="nav-badge">12</span>
    </a>
    <!-- More nav items -->
    
    <div class="nav-label">AI Tools</div>
    <!-- AI Tools nav items -->
    
    <div class="nav-label">System</div>
    <!-- System nav items -->
  </nav>
  
  <!-- User Footer -->
  <div class="sidebar-footer">
    <div class="user-card">
      <div class="user-avatar">JB</div>
      <div class="user-info">
        <div class="user-name">Jeremy Botter</div>
        <div class="user-role">Admin</div>
      </div>
    </div>
  </div>
</aside>
```

```css
.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-dark));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 14px;
  color: white;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo-text span {
  color: var(--accent-primary);
}

.nav-section {
  padding: 16px 12px;
  flex: 1;
  overflow-y: auto;
}

.nav-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-tertiary);
  padding: 8px 12px;
  margin-bottom: 4px;
  margin-top: 24px;
}

.nav-label:first-child {
  margin-top: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  margin-bottom: 2px;
  cursor: pointer;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-muted);
  color: var(--accent-primary);
}

.nav-icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}

.nav-item:hover .nav-icon,
.nav-item.active .nav-icon {
  opacity: 1;
}

.nav-badge {
  margin-left: auto;
  background: var(--accent-muted);
  color: var(--accent-primary);
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
  font-family: var(--font-mono);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-subtle);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.user-card:hover {
  background: var(--bg-hover);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: white;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
}

.user-role {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

## Screen-by-Screen Implementation

### 1. Dashboard

**Layout:** Single column with sections stacked vertically

**Sections (top to bottom):**

1. **Welcome Header**
   - Greeting with user name: "Good afternoon, Jeremy"
   - Subtitle with context: "You have 3 drafts in progress..."
   
2. **Stats Row**
   - 4-column grid
   - Cards showing: Articles This Week, Words Generated, Avg SEO Score, Active SmartBriefs
   - Use `font-mono` for numbers
   - Include subtle change indicators (e.g., "↑ 20% from last week")

3. **Quick Actions**
   - 3-column grid
   - Cards for: Create New Article, Build SmartBrief, Extract NFL Odds
   - Each card has: icon (in colored container), title, description
   - Hover effect: top border accent line appears

4. **Recent Projects**
   - Section header with "View all" link
   - 2-column grid of project cards
   - Each card shows: title, status badge, meta (date, word count, SEO score), keywords

5. **AI Status Indicator**
   - Bottom of page
   - Shows: pulsing green dot, "7 AI Agents online and ready"

---

### 2. Projects View

**Layout:** Full-width content area

**Components:**

1. **Filters Bar**
   - Search input with icon (max-width: 400px)
   - Filter tabs: All | Drafts | Published
   - Sort dropdown: "Newest first"

2. **Summary Stats**
   - Horizontal row showing: Total Projects, Drafts count, Published count, Total Words
   - Separated by vertical dividers
   - Numbers use accent color for drafts, success color for published

3. **Projects Grid**
   - 3-column grid
   - Cards with hover effect and colored top border (purple for drafts, green for published)
   - Each card contains:
     - Title + status badge
     - Meta row: date, word count, SEO score
     - Keywords as small tags
     - Writer model badge at bottom

---

### 3. SmartBriefs Landing

**Layout:** Single column, centered content

**Components:**

1. **Hero Section**
   - Large card with gradient background and radial accent glow
   - Badge: "AI-Powered Templates"
   - Title: "Build Once, Generate Infinitely"
   - Description paragraph
   - CTA buttons: "Create Your First Brief" (primary), "Learn More" (ghost)

2. **Info Cards**
   - 3-column grid
   - Cards explaining: Define Structure, Configure AI, Reuse Forever
   - Each has colored icon, title, description

3. **Your SmartBriefs**
   - Section header with count
   - 2-column grid of brief cards
   - Each card: title, category badge, description, meta (projects count, updated date), shared badge if applicable

---

### 4. Create SmartBrief

**Layout:** Two-column (main form left ~65%, config panel right ~35%)

**Left Column - Form:**

1. **Basic Info Section**
   - Name input
   - Category dropdown

2. **Scaffold Editor**
   - Rich text editor with toolbar
   - Toolbar buttons: undo/redo, H1/H2/H3, bold/italic, bullet list, numbered list
   - Content area with placeholder structure
   - Min-height: 300px

**Right Column - AI Configuration:**

1. **Panel Header**
   - Purple icon + "AI Configuration" title

2. **Instructions Card**
   - Textarea for AI instructions
   - "Required" badge

3. **Training Stories**
   - List of URL inputs
   - Add URL button (dashed border)
   - "Analyze Example URLs" button (purple secondary style)

4. **Share Toggle**
   - "Share with team" with toggle switch

**Top Bar:**
- Back button: "← SmartBriefs"
- Page title: "Create New SmartBrief"
- Actions: "Save Draft" (ghost), "Create SmartBrief" (primary)

---

### 5. Writer Factory

**Layout:** Two-column (models list left ~320px fixed, training panel right fluid)

**Left Column - Models Panel:**

1. **Search Input**

2. **Models List**
   - Scrollable list of writer model cards
   - Each shows: avatar (colored if trained, gray if not), name, status badge, story count
   - Active state: background + border highlight

3. **Add Model Button**
   - Dashed border, full width

**Right Column - Training Panel:**

1. **Writer Profile Header**
   - Large avatar, name, stats row (trained %, stories, projects using)

2. **Training Progress**
   - Progress bar with label and percentage
   - Helper text below

3. **Training Stories Grid**
   - 2-column grid of story cards
   - Each shows: title, source, status dot
   - "Add story" card with dashed border

4. **Voice Analysis**
   - Card with AI icon
   - Grid of trait tags (some highlighted in purple)

---

### 6. NFL Odds Extractor

**Layout:** Single column, centered (max-width: 1000px)

**Components:**

1. **Hero**
   - Centered icon (green background)
   - Title: "Extract & Generate"
   - Description

2. **Configuration Card**
   - Step indicator: "1 - Configure Extraction"
   - Form row: Week Number dropdown, Season Year input
   - Custom Headline input (optional)

3. **Upload Card**
   - Step indicator: "2 - Upload Screenshots"
   - 2-column grid of upload zones
   - Each zone: icon, title, description, file input button
   - "has-file" state: green border, checkmark icon, filename display
   - Generate button: large, green, centered below uploads

4. **How It Works**
   - Card with 4-column grid
   - Steps: Upload Images → Visual AI Extracts → Data Structured → Article Generated
   - Each step: number badge (colored), title, description

5. **Recent Extractions**
   - List of recent extraction cards
   - Each shows: week number (mono, purple), title, meta, status badge

---

### 7. Admin Dashboard

**Layout:** Single column with tabbed sections

**Components:**

1. **Tabs Bar**
   - Pill-style tabs: User Management | API Keys | AI Agents | Settings
   - Active tab has elevated background

2. **User Management Section (default tab)**
   - Section card with header (title, description, "Create User" button)
   - Table with columns: User (avatar + email + name), Status, Role, Created, Actions
   - Status: dot + label (active=green, pending=yellow, inactive=gray)
   - Role: badge (admin=purple, strategist=neutral)
   - Actions: edit button, delete button (danger on hover)

3. **AI Agents Tab (when selected)**
   - 2-column grid of agent cards
   - Each card: number badge, name, status dot, description, meta (model, tokens)
   - Selected card: purple border and background
   - Config panel below: textarea for system instructions, sliders for temperature/tokens, save/reset buttons

---

## Icons

Use Heroicons (outline style) for consistency. Key icons needed:

- **Navigation:** home, document, template, pencil, chart-bar, newspaper, cog
- **Actions:** plus, search, chevron-left, chevron-down, x, check, trash, external-link
- **Content:** calendar, document-text, trending-up, lightning-bolt, upload, image
- **Status:** users, share, eye

Icon sizes:
- Nav icons: 20x20
- Button icons: 16x16
- Feature icons: 24x24
- Large display: 32x32 or 48x48

---

## Animations & Transitions

### Standard Transitions

```css
/* Default transition for interactive elements */
transition: all 0.15s ease;

/* Card hover transitions */
transition: all 0.2s ease;

/* Progress bar fill */
transition: width 0.3s ease;
```

### Hover Effects

- **Buttons:** translateY(-1px) + box-shadow glow
- **Cards:** translateY(-2px) + border-color change + background lighten
- **Nav items:** background color change

### Animations

```css
/* Pulsing dot for AI status */
@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); 
  }
  50% { 
    opacity: 0.8; 
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); 
  }
}

.ai-dot {
  animation: pulse 2s infinite;
}
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Set up CSS custom properties / Tailwind config
- [ ] Import Google Fonts (DM Sans, Space Mono)
- [ ] Create base component styles (buttons, inputs, badges, cards)
- [ ] Build app shell layout (sidebar, top bar, main content area)

### Phase 2: Core Screens
- [ ] Dashboard
- [ ] Projects view
- [ ] SmartBriefs landing
- [ ] Create SmartBrief form

### Phase 3: AI Tools
- [ ] Writer Factory
- [ ] NFL Odds Extractor

### Phase 4: Admin
- [ ] Admin Dashboard with all tabs
- [ ] User management table
- [ ] AI agent configuration

### Phase 5: Polish
- [ ] Hover states and transitions
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Responsive adjustments (if needed)

---

## Notes for Cursor

1. **Replace ALL existing purple (#whatever the old purple was) with #7C49E3**

2. **The design is intentionally dark** - don't add any light mode variant unless specifically requested

3. **Typography matters** - ensure DM Sans and Space Mono are loading properly and used consistently

4. **Spacing is generous** - padding of 24px-32px on cards and sections is intentional

5. **Status colors remain unchanged** - green for success/published, yellow for warning/pending, red for error/danger

6. **The sidebar is fixed position** - main content scrolls, sidebar stays put

7. **Cards have subtle borders** - don't remove them, they provide necessary separation on dark backgrounds

8. **Hover states are important** - they provide feedback that elements are interactive

---

## Reference Files

The HTML mockup files demonstrate the complete implementation of each screen. Use them as visual references:

1. `rotowrite-mockup-1.html` - Dashboard
2. `rotowrite-mockup-2-projects.html` - Projects View
3. `rotowrite-mockup-3-smartbriefs.html` - SmartBriefs Landing
4. `rotowrite-mockup-4-create-smartbrief.html` - Create SmartBrief
5. `rotowrite-mockup-5-writer-factory.html` - Writer Factory
6. `rotowrite-mockup-6-odds-extractor.html` - NFL Odds Extractor
7. `rotowrite-mockup-7-admin.html` - Admin Dashboard
8. `rotowrite-style-guide.html` - Complete style reference with purple accent

**Note:** The mockups use the amber/gold accent color. Replace with #7C49E3 (RotoWrite Purple) during implementation as shown in the style guide.

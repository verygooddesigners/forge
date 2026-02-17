# Forge - UI Redesign Brief for Figma Make

**Project:** Forge (formerly RotoWrite)  
**Repository:** https://github.com/verygooddesigners/forge  
**Live Site:** https://gdcforce.vercel.app  
**Date:** February 17, 2026

---

## 📋 Project Overview

Forge is an AI-powered content creation platform designed for sports betting and gaming content creators. It features RAG-based writer models, SmartBrief templates, SEO optimization, and a multi-agent AI system.

**Target Users:**
- Content Strategists (primary users)
- Administrators (system management)
- Writers (content creation)

**Current Tech Stack:**
- Framework: Next.js 16 (App Router)
- UI: Shadcn UI + Tailwind CSS
- Fonts: DM Sans (primary), Space Mono (mono)
- Theme: Violet/Purple accent colors
- Editor: TipTap (rich text)

---

## 🎯 Design Goals

### What We Want

1. **Modern, Professional Look**
   - Clean, sophisticated interface
   - Better visual hierarchy
   - More polished, production-ready feel

2. **Improved User Experience**
   - Clearer navigation
   - Better information architecture
   - Reduced cognitive load
   - Smoother workflows

3. **Enhanced Visual Design**
   - More engaging color palette (can evolve beyond purple)
   - Better use of whitespace
   - Improved typography
   - Consistent design language

4. **Better Component Organization**
   - Clearer separation of concerns
   - More intuitive layouts
   - Better use of screen real estate

### What We Want to Keep

1. **Core Functionality**
   - All existing features must remain
   - Workflow logic stays the same
   - Technical architecture unchanged

2. **Technical Constraints**
   - Must work with Next.js 16
   - Must use Tailwind CSS
   - Must work with Shadcn UI components
   - Must support TipTap editor

3. **Key Interactions**
   - Modal-based workflows (can be improved but concept stays)
   - Sidebar navigation
   - Panel-based dashboard layout

---

## 🏗️ Current Application Structure

### Main Pages (22 total)

**Core Application:**
- `/` - Landing page
- `/login` - Authentication
- `/dashboard` - Main workspace (most important)
- `/profile` - User profile
- `/settings` - User settings
- `/admin` - Admin dashboard

**Feature Pages:**
- `/writer-factory` - Train AI writer models
- `/smartbriefs` - Content templates
- `/projects` - Project management
- `/nfl-odds` - Odds extraction tool
- `/tools` - Tools marketplace
- `/system-architecture` - System visualization

**Documentation/Guides:**
- `/guide` - User guide hub
- `/guide/overview` - Platform overview
- `/guide/ai-team` - AI agents guide
- `/guide/time-savings` - ROI calculator
- `/smartbrief-guide` - SmartBrief creation guide
- `/style-guide` - Design system reference

### Key Components (77 total)

**Dashboard Components (11):**
- `DashboardLayout.tsx` - Main layout wrapper
- `DashboardHome.tsx` - Dashboard home view
- `LeftSidebar.tsx` - Navigation sidebar
- `RightSidebar.tsx` - Context sidebar
- `EditorPanel.tsx` - Content editor
- `WriterFactoryPanel.tsx` - Writer model panel
- `SmartBriefPanel.tsx` - Brief templates panel
- `ProjectsPanel.tsx` - Projects list panel
- `SEOOptimizationSidebar.tsx` - SEO tools
- `NFLOddsPanel.tsx` - Odds extractor
- `NewsCard.tsx` - News item display

**Modals (13):**
- `InitialDashboardModal.tsx` - Welcome modal
- `ProjectCreationModal.tsx` - New project
- `ProjectListModal.tsx` - Project browser
- `WriterFactoryModal.tsx` - Writer training
- `BriefBuilderModal.tsx` - Brief editor
- `SmartBriefListModal.tsx` - Brief browser
- `SmartBriefGuideModal.tsx` - Brief help
- `NFLOddsExtractorModal.tsx` - Odds tool
- `ResearchResultsModal.tsx` - News results
- `ResearchCard.tsx` - News item
- `ExportModal.tsx` - Content export
- `FeedbackModal.tsx` - User feedback
- `UserGuideModal.tsx` - Help system

**Admin Components (11):**
- `AdminDashboard.tsx` - Admin home
- `AdminPageClient.tsx` - Admin wrapper
- `UserManagement.tsx` - User admin
- `APIKeyManagement.tsx` - API keys
- `AgentTuner.tsx` - AI agent config
- `AITuner.tsx` - AI settings
- `AIHelperAdmin.tsx` - AI assistant admin
- `ToolsAdmin.tsx` - Tools management
- `TrustedSourcesAdmin.tsx` - Source management
- `CursorRemotePanel.tsx` - Remote access
- `SSOConfigStatus.tsx` - SSO status

**Editor Components (2):**
- `TipTapEditor.tsx` - Rich text editor
- `EditorToolbar.tsx` - Editor controls

**UI Components (24 Shadcn components):**
- Standard Shadcn UI library (button, card, dialog, etc.)

---

## 🎨 Current Design System

### Colors

**Primary (Violet/Purple):**
```css
--color-primary: #8b5cf6 (violet-500)
--color-primary-hover: #7c3aed (violet-600)
```

**Background Layers:**
```css
--color-bg-deepest: #ffffff (light) / #0a0a0a (dark)
--color-bg-deep: #fafafa (light) / #141414 (dark)
--color-bg-surface: #f5f5f5 (light) / #1a1a1a (dark)
--color-bg-elevated: #ffffff (light) / #262626 (dark)
```

**Text Hierarchy:**
```css
--color-text-primary: #1a1a1a (light) / #fafafa (dark)
--color-text-secondary: #525252 (light) / #d4d4d4 (dark)
--color-text-tertiary: #737373 (light) / #a3a3a3 (dark)
```

**Semantic Colors:**
```css
--color-success: #22c55e (green-500)
--color-warning: #f59e0b (amber-500)
--color-error: #ef4444 (red-500)
--color-info: #3b82f6 (blue-500)
```

### Typography

**Font Families:**
- Primary: DM Sans (400, 500, 600, 700)
- Monospace: Space Mono (400, 700)

**Font Sizes:**
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)

### Spacing

**Standard Scale:**
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 12: 3rem (48px)

### Border Radius

- sm: 0.375rem (6px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)
- xl: 1rem (16px)

---

## 🔄 Key User Flows

### 1. Content Creation Flow (Primary)

```
Dashboard → Create Project → Select Writer Model → Choose SmartBrief → 
Generate Content → Edit in TipTap → SEO Optimization → Export → Publish
```

**Key Screens:**
1. Dashboard home
2. Project creation modal
3. Writer model selection
4. SmartBrief selection
5. Editor panel with SEO sidebar
6. Export modal

### 2. Writer Model Training Flow

```
Dashboard → Writer Factory → Upload Articles → Train Model → 
Test Generation → Save Model
```

**Key Screens:**
1. Writer Factory panel
2. Article upload interface
3. Training progress
4. Test generation
5. Model management

### 3. SmartBrief Creation Flow

```
Dashboard → SmartBriefs → Create New → Define Structure → 
Add AI Instructions → Add Example URLs → Save Template
```

**Key Screens:**
1. SmartBrief list
2. Brief builder (2-tab interface)
3. Template preview
4. Brief management

### 4. Admin Management Flow

```
Admin Dashboard → User Management / API Keys / Agent Tuner → 
Make Changes → Save
```

**Key Screens:**
1. Admin dashboard
2. User management table
3. API key management
4. Agent tuner interface

---

## 📱 Screen Priorities

### Must Redesign (High Priority)

1. **Dashboard** (`/dashboard`)
   - Most used screen
   - Complex layout with multiple panels
   - Needs better organization

2. **Editor Panel** (`EditorPanel.tsx`)
   - Core content creation interface
   - TipTap editor integration
   - SEO sidebar integration

3. **Project Creation Modal** (`ProjectCreationModal.tsx`)
   - First step in content creation
   - Needs clearer flow

4. **Writer Factory** (`WriterFactoryPanel.tsx`)
   - Complex training interface
   - Needs better UX

5. **SmartBrief Builder** (`BriefBuilderModal.tsx`)
   - 2-tab interface
   - Needs clearer structure

### Should Redesign (Medium Priority)

6. **Admin Dashboard** (`AdminDashboard.tsx`)
7. **User Management** (`UserManagement.tsx`)
8. **Agent Tuner** (`AgentTuner.tsx`)
9. **SEO Sidebar** (`SEOOptimizationSidebar.tsx`)
10. **Project List** (`ProjectsPanel.tsx`)

### Nice to Redesign (Lower Priority)

11. Landing page (`/`)
12. Login page (`/login`)
13. Settings page (`/settings`)
14. Profile page (`/profile`)

---

## 🎯 Specific Design Challenges

### Challenge 1: Dashboard Complexity

**Current State:**
- 3-column layout (left sidebar, center panel, right sidebar)
- Multiple panels that can be swapped in center
- Can feel cluttered

**Design Goal:**
- Clearer visual hierarchy
- Better panel transitions
- More intuitive navigation
- Reduce visual noise

### Challenge 2: Modal Overload

**Current State:**
- Many features use modals
- Some modals are complex (multi-step)
- Can feel disconnected from main flow

**Design Goal:**
- Consider alternatives to modals where appropriate
- Improve modal design and transitions
- Better modal sizing and responsiveness

### Challenge 3: Information Density

**Current State:**
- Lots of information on screen
- Dense tables and lists
- Can be overwhelming

**Design Goal:**
- Better use of whitespace
- Clearer information hierarchy
- Progressive disclosure
- Better data visualization

### Challenge 4: Editor Integration

**Current State:**
- TipTap editor in center panel
- SEO sidebar on right
- Toolbar at top
- Can feel cramped

**Design Goal:**
- More spacious editor
- Better toolbar design
- Clearer SEO integration
- Distraction-free writing mode?

---

## 🚫 Technical Constraints

### Must Keep

1. **Next.js 16 App Router**
   - File-based routing
   - Server/Client components
   - Current route structure

2. **Tailwind CSS**
   - Utility-first styling
   - Can modify theme/config

3. **Shadcn UI Components**
   - Can customize but must use base components
   - Dialog, Button, Card, etc.

4. **TipTap Editor**
   - Rich text editing core
   - Can style but not replace

5. **Supabase Integration**
   - Database queries
   - Auth flows
   - RLS policies

### Can Change

1. **Color Palette**
   - Not tied to purple/violet
   - Open to new brand colors

2. **Layout Structure**
   - Can reorganize panels
   - Can change navigation
   - Can modify grid/flex layouts

3. **Component Hierarchy**
   - Can restructure components
   - Can create new abstractions
   - Can simplify complex components

4. **Typography**
   - Can change fonts
   - Can adjust sizes/weights
   - Can improve hierarchy

---

## 📊 Component Inventory

### By Category

**Layout Components (5):**
- DashboardLayout
- LeftSidebar
- RightSidebar
- AppSidebar
- AdminPageWrapper

**Content Components (15):**
- EditorPanel
- TipTapEditor
- EditorToolbar
- WriterFactoryPanel
- SmartBriefPanel
- ProjectsPanel
- NFLOddsPanel
- SEOOptimizationSidebar
- NewsCard
- ResearchCard
- ToolCard
- UserGuideModal
- SmartBriefGuideModal
- ArchitectureVisualization
- WorkflowSelector

**Form/Input Components (13 modals):**
- ProjectCreationModal
- BriefBuilderModal
- WriterFactoryModal
- NFLOddsExtractorModal
- ExportModal
- FeedbackModal
- InitialDashboardModal
- ProjectListModal
- SmartBriefListModal
- ResearchResultsModal
- (Plus standard form inputs)

**Admin Components (11):**
- AdminDashboard
- UserManagement
- APIKeyManagement
- AgentTuner
- AITuner
- AIHelperAdmin
- ToolsAdmin
- TrustedSourcesAdmin
- CursorRemotePanel
- SSOConfigStatus
- AdminPageClient

**UI Primitives (24 Shadcn):**
- Button, Card, Dialog, Input, Select, etc.

---

## 🎨 Design Inspiration & References

### Style References

**Preferred Aesthetics:**
- Modern SaaS applications
- Clean, professional
- Data-rich but not overwhelming
- Sophisticated color usage
- Excellent typography

**Example Apps (for inspiration):**
- Linear (project management)
- Notion (editor experience)
- Vercel Dashboard (clean admin)
- Stripe Dashboard (data visualization)
- Figma (tool-heavy interface)

### What to Avoid

- Overly playful/casual
- Too minimal (needs to be functional)
- Outdated web 2.0 aesthetics
- Cluttered dashboards
- Poor contrast/accessibility

---

## 📐 Deliverables Requested

### Phase 1: Core Screens (High Priority)

1. **Dashboard Home**
   - Main layout
   - Navigation
   - Panel system

2. **Editor View**
   - Content editor
   - SEO sidebar
   - Toolbar

3. **Project Creation**
   - Modal or page
   - Form design
   - Flow

4. **Writer Factory**
   - Training interface
   - Model management

5. **SmartBrief Builder**
   - 2-tab interface
   - Template editor

### Phase 2: Admin & Secondary (Medium Priority)

6. Admin Dashboard
7. User Management
8. Agent Tuner
9. Settings Page
10. Profile Page

### Phase 3: Marketing & Auth (Lower Priority)

11. Landing Page
12. Login Page
13. Style Guide

---

## 📝 Design System Requirements

Please provide:

1. **Color Palette**
   - Primary, secondary, accent colors
   - Background layers
   - Text hierarchy
   - Semantic colors (success, error, warning, info)
   - Dark mode variants

2. **Typography**
   - Font families
   - Font sizes scale
   - Font weights
   - Line heights
   - Letter spacing

3. **Spacing System**
   - Spacing scale
   - Layout grid
   - Component padding/margins

4. **Components**
   - Button variants
   - Input styles
   - Card designs
   - Modal patterns
   - Navigation elements
   - Data tables
   - Form layouts

5. **Iconography**
   - Icon style (currently using Lucide)
   - Icon sizes
   - Usage guidelines

---

## 🔗 Resources

**Repository:**
https://github.com/verygooddesigners/forge

**Live Site:**
https://gdcforce.vercel.app

**Key Files to Review:**
- `app/globals.css` - Current theme
- `app/dashboard/page.tsx` - Main dashboard
- `components/dashboard/DashboardLayout.tsx` - Layout structure
- `components/dashboard/EditorPanel.tsx` - Editor
- `lib/architecture-data.ts` - App structure data

**Documentation:**
- `README.md` - Project overview
- `COMPONENT_INVENTORY.md` - Detailed component list
- `USER_FLOWS.md` - User journey maps
- `DESIGN_SYSTEM.md` - Current design tokens

---

## ✅ Success Criteria

A successful redesign will:

1. **Improve Visual Design**
   - More polished, professional appearance
   - Better use of color and typography
   - Consistent design language

2. **Enhance Usability**
   - Clearer navigation
   - Better information hierarchy
   - Reduced cognitive load
   - Smoother workflows

3. **Maintain Functionality**
   - All features remain accessible
   - Technical constraints respected
   - Performance not degraded

4. **Be Implementable**
   - Works with Next.js + Tailwind
   - Uses Shadcn UI components
   - Can be built by developers

---

## 📞 Questions for Designer

Before starting, please consider:

1. **Color Direction**: Should we keep purple/violet or explore new brand colors?
2. **Layout Approach**: Sidebar navigation or top nav? Keep 3-column layout?
3. **Modal Strategy**: Keep modals or move to pages for complex flows?
4. **Editor Focus**: Should editor be full-screen capable or always in panel?
5. **Admin Design**: Same design language as main app or distinct admin theme?

---

**Ready to begin!** Please explore the repository and create mockups for the high-priority screens listed above.

**Contact:** Available for questions and feedback throughout the design process.

---

**Last Updated:** February 17, 2026  
**Version:** 1.0

# Instructions for Figma Make - Forge UI Redesign

**Project:** Forge  
**Repository:** https://github.com/verygooddesigners/forge  
**Live Site:** https://gdcforce.vercel.app  
**Date:** February 17, 2026

---

## 📋 Quick Summary

Forge is an AI-powered content creation platform for sports betting content. We need a complete UI redesign that's modern, professional, and improves the user experience while maintaining all existing functionality.

---

## 🎯 Your Mission

**Redesign the user interface of Forge** to be:
1. More modern and professional
2. Easier to use and navigate
3. Visually appealing with better hierarchy
4. Consistent across all screens

**What stays the same:**
- All features and functionality
- Technical stack (Next.js, Tailwind, Shadcn UI)
- Core workflows and user journeys

---

## 📚 Documentation Provided

We've created comprehensive documentation for you:

### 1. **FIGMA_DESIGN_BRIEF.md** (Main Document)
**Read this first!**

Contains:
- Project overview
- Design goals
- Current design system (colors, fonts, spacing)
- Application structure (22 pages, 77 components)
- Key user flows
- Specific design challenges
- Technical constraints
- Deliverables requested

### 2. **COMPONENT_INVENTORY.md**
**Complete component catalog**

Contains:
- All 77 components listed and categorized
- Component purposes and priorities
- Component relationships and hierarchy
- Redesign priority matrix
- Complexity ratings

### 3. **USER_FLOWS.md**
**How users interact with the app**

Contains:
- User personas
- Primary flow: Content creation (most important)
- Secondary flow: Writer model training
- Tertiary flow: SmartBrief creation
- Admin flows
- User journey maps
- Common patterns

---

## 🚀 How to Get Started

### Step 1: Explore the Codebase (15 minutes)

1. **Visit the repository:**
   ```
   https://github.com/verygooddesigners/forge
   ```

2. **Key files to review:**
   - `app/globals.css` - Current theme and colors
   - `app/dashboard/page.tsx` - Main dashboard
   - `components/dashboard/DashboardLayout.tsx` - Layout structure
   - `components/dashboard/EditorPanel.tsx` - Content editor
   - `README.md` - Project overview

3. **Optional: Visit live site:**
   ```
   https://gdcforce.vercel.app
   ```
   (May require login - focus on repository instead)

---

### Step 2: Read Documentation (30 minutes)

1. **Read FIGMA_DESIGN_BRIEF.md** (main document)
   - Understand project goals
   - Review current design system
   - Note technical constraints

2. **Skim COMPONENT_INVENTORY.md**
   - See what components exist
   - Understand priorities
   - Note complexity levels

3. **Skim USER_FLOWS.md**
   - Understand how users work
   - Focus on primary flow (content creation)
   - Note pain points

---

### Step 3: Start Designing (Your expertise!)

#### Phase 1: Core Screens (High Priority)

Design these first:

1. **Dashboard Home** (`/dashboard`)
   - Main layout with 3-column design
   - Navigation sidebar
   - Center panel (swappable)
   - Right sidebar (contextual)
   - **File:** `components/dashboard/DashboardLayout.tsx`

2. **Editor View** (within dashboard)
   - Content editor (TipTap)
   - Editor toolbar
   - SEO sidebar integration
   - **File:** `components/dashboard/EditorPanel.tsx`

3. **Project Creation** (modal or page)
   - Create new project flow
   - Select writer model
   - Choose SmartBrief
   - Set keywords
   - **File:** `components/modals/ProjectCreationModal.tsx`

4. **Writer Factory** (within dashboard)
   - Upload training articles
   - Train AI models
   - Test generation
   - **File:** `components/dashboard/WriterFactoryPanel.tsx`

5. **SmartBrief Builder** (modal)
   - 2-tab interface
   - Template editor
   - AI configuration
   - **File:** `components/modals/BriefBuilderModal.tsx`

#### Phase 2: Admin & Secondary (Medium Priority)

6. Admin Dashboard
7. User Management
8. Agent Tuner
9. Settings Page
10. Profile Page

#### Phase 3: Marketing & Auth (Lower Priority)

11. Landing Page
12. Login Page
13. Style Guide

---

## 🎨 Design Deliverables

### For Each Screen, Please Provide:

1. **Desktop Design** (1440px width minimum)
   - Light mode
   - Dark mode (if time permits)

2. **Component Variants**
   - Different states (hover, active, disabled)
   - Loading states
   - Error states
   - Empty states

3. **Responsive Design** (if time permits)
   - Tablet (768px)
   - Mobile (375px)

4. **Design System**
   - Color palette
   - Typography scale
   - Spacing system
   - Component library

---

## 🎯 Specific Design Challenges to Solve

### Challenge 1: Dashboard Complexity
**Current:** 3-column layout feels cluttered  
**Goal:** Clearer hierarchy, better panel transitions

### Challenge 2: Modal Overload
**Current:** Many features use modals, can feel disconnected  
**Goal:** Consider alternatives, improve modal design

### Challenge 3: Information Density
**Current:** Lots of info on screen, can be overwhelming  
**Goal:** Better whitespace, clearer hierarchy

### Challenge 4: Editor Integration
**Current:** Editor feels cramped with toolbar and SEO sidebar  
**Goal:** More spacious, distraction-free option

---

## 🚫 Technical Constraints (Must Follow)

### Must Keep:
- ✅ Next.js 16 (file-based routing)
- ✅ Tailwind CSS (utility-first styling)
- ✅ Shadcn UI components (can customize)
- ✅ TipTap editor (can style, not replace)
- ✅ All existing features

### Can Change:
- ✅ Color palette (not tied to purple)
- ✅ Layout structure
- ✅ Component hierarchy
- ✅ Typography
- ✅ Navigation patterns

---

## 💡 Design Inspiration

**Style References:**
- Linear (clean project management)
- Notion (editor experience)
- Vercel Dashboard (admin interface)
- Stripe Dashboard (data visualization)
- Figma (tool-heavy interface)

**What to Avoid:**
- Overly playful/casual
- Too minimal (needs to be functional)
- Cluttered dashboards
- Poor contrast

---

## 📊 Current Design System

### Colors (Can Change)

**Primary:**
- Violet-500: `#8b5cf6`
- Violet-600: `#7c3aed`

**Backgrounds:**
- Light: `#ffffff`, `#fafafa`, `#f5f5f5`
- Dark: `#0a0a0a`, `#141414`, `#1a1a1a`

**Text:**
- Primary: `#1a1a1a` (light) / `#fafafa` (dark)
- Secondary: `#525252` (light) / `#d4d4d4` (dark)

### Typography (Can Change)

**Fonts:**
- Primary: DM Sans (400, 500, 600, 700)
- Mono: Space Mono (400, 700)

**Sizes:**
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px

### Spacing

**Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px

---

## ❓ Questions to Consider

Before you start, think about:

1. **Color Direction**: Keep purple or explore new brand colors?
2. **Layout Approach**: Keep 3-column or try something new?
3. **Modal Strategy**: Keep modals or move complex flows to pages?
4. **Editor Focus**: Should editor support full-screen/distraction-free mode?
5. **Admin Design**: Same design language or distinct admin theme?

---

## 📞 Feedback & Iteration

We're available for:
- Questions about functionality
- Clarification on user flows
- Technical feasibility checks
- Design reviews and feedback

---

## 🎯 Success Criteria

Your redesign will be successful if it:

1. ✅ **Looks More Professional** - Modern, polished, production-ready
2. ✅ **Improves Usability** - Clearer navigation, better hierarchy
3. ✅ **Maintains Functionality** - All features accessible
4. ✅ **Is Implementable** - Works with our tech stack
5. ✅ **Delights Users** - Enjoyable to use daily

---

## 🚀 Ready to Start!

1. Clone or explore the repository
2. Read the design brief
3. Start with Dashboard and Editor (highest priority)
4. Share early concepts for feedback
5. Iterate based on feedback
6. Deliver final designs

---

## 📁 File Organization

All documentation is in the repository root:

```
/Forge/
├── FIGMA_DESIGN_BRIEF.md          ← Main document
├── COMPONENT_INVENTORY.md         ← All components
├── USER_FLOWS.md                  ← User journeys
├── FIGMA_MAKE_INSTRUCTIONS.md     ← This file
├── README.md                      ← Project overview
└── app/globals.css                ← Current theme
```

---

## 🎨 Figma Tips

**Recommended Figma Setup:**

1. **Create Pages:**
   - Page 1: Design System
   - Page 2: Core Screens (Dashboard, Editor)
   - Page 3: Modals & Forms
   - Page 4: Admin Screens
   - Page 5: Components Library

2. **Use Auto Layout:**
   - Makes responsive design easier
   - Matches Tailwind's flexbox approach

3. **Create Components:**
   - Button variants
   - Input fields
   - Cards
   - Modals
   - Navigation elements

4. **Use Variants:**
   - Light/Dark mode
   - Different states
   - Responsive sizes

---

## 🎯 Priority Order

**Week 1: Core Screens**
1. Dashboard Layout
2. Editor Panel
3. Project Creation
4. Design System

**Week 2: Features**
5. Writer Factory
6. SmartBrief Builder
7. Admin Dashboard

**Week 3: Polish**
8. Responsive design
9. Dark mode
10. Micro-interactions

---

## ✅ Checklist Before Starting

- [ ] Explored GitHub repository
- [ ] Read FIGMA_DESIGN_BRIEF.md
- [ ] Skimmed COMPONENT_INVENTORY.md
- [ ] Skimmed USER_FLOWS.md
- [ ] Understand technical constraints
- [ ] Ready to design!

---

## 🎉 Let's Create Something Amazing!

We're excited to see your vision for Forge. Focus on making it:
- **Modern** - Contemporary design language
- **Professional** - Production-ready polish
- **Usable** - Intuitive and efficient
- **Delightful** - Enjoyable daily experience

**Questions?** We're here to help!

---

**Last Updated:** February 17, 2026  
**Repository:** https://github.com/verygooddesigners/forge  
**Live Site:** https://gdcforce.vercel.app

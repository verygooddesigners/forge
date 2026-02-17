# Forge - Complete Component Inventory

**Repository:** https://github.com/verygooddesigners/forge  
**Date:** February 17, 2026

---

## 📊 Component Statistics

- **Total Components:** 77
- **Pages:** 22
- **Dashboard Components:** 11
- **Modals:** 13
- **Admin Components:** 11
- **UI Primitives:** 24
- **Other:** 16

---

## 🏠 Pages (22)

### Core Application Pages

| Path | File | Purpose | Priority |
|------|------|---------|----------|
| `/` | `app/page.tsx` | Landing page | Low |
| `/login` | `app/login/page.tsx` | Authentication | Medium |
| `/dashboard` | `app/dashboard/page.tsx` | Main workspace | **HIGH** |
| `/profile` | `app/profile/page.tsx` | User profile | Medium |
| `/settings` | `app/settings/page.tsx` | User settings | Medium |
| `/admin` | `app/admin/page.tsx` | Admin dashboard | High |
| `/reset-password` | `app/reset-password/page.tsx` | Password reset | Low |

### Feature Pages

| Path | File | Purpose | Priority |
|------|------|---------|----------|
| `/writer-factory` | `app/writer-factory/page.tsx` | Train AI models | **HIGH** |
| `/smartbriefs` | `app/smartbriefs/page.tsx` | Content templates | **HIGH** |
| `/projects` | `app/projects/page.tsx` | Project management | High |
| `/nfl-odds` | `app/nfl-odds/page.tsx` | Odds extraction | Medium |
| `/tools` | `app/tools/page.tsx` | Tools marketplace | Medium |
| `/tools/[slug]` | `app/tools/[slug]/page.tsx` | Tool detail | Medium |
| `/tools/submit` | `app/tools/submit/page.tsx` | Submit tool | Low |
| `/tools/docs` | `app/tools/docs/page.tsx` | Tools docs | Low |

### Documentation Pages

| Path | File | Purpose | Priority |
|------|------|---------|----------|
| `/guide` | `app/guide/page.tsx` | User guide hub | Medium |
| `/guide/overview` | `app/guide/overview/page.tsx` | Platform overview | Medium |
| `/guide/ai-team` | `app/guide/ai-team/page.tsx` | AI agents guide | Medium |
| `/guide/time-savings` | `app/guide/time-savings/page.tsx` | ROI calculator | Low |
| `/smartbrief-guide` | `app/smartbrief-guide/page.tsx` | SmartBrief help | Medium |
| `/style-guide` | `app/style-guide/page.tsx` | Design system | Low |
| `/system-architecture` | `app/system-architecture/page.tsx` | System viz | Low |

---

## 🎛️ Dashboard Components (11)

### Layout Components

**`DashboardLayout.tsx`** - **Priority: HIGH**
- Main dashboard wrapper
- 3-column layout (left sidebar, center panel, right sidebar)
- Handles panel switching
- Responsive behavior
- **Location:** `components/dashboard/`

**`DashboardHome.tsx`** - **Priority: HIGH**
- Dashboard home/welcome view
- Quick actions
- Recent projects
- Getting started guide
- **Location:** `components/dashboard/`

**`LeftSidebar.tsx`** - **Priority: HIGH**
- Main navigation sidebar
- Logo and branding
- Navigation menu
- User profile dropdown
- **Location:** `components/dashboard/`

**`RightSidebar.tsx`** - **Priority: HIGH**
- Contextual sidebar
- SEO tools
- News/research
- Project info
- **Location:** `components/dashboard/`

### Content Panels

**`EditorPanel.tsx`** - **Priority: HIGH**
- Main content editor panel
- TipTap editor integration
- Word count, character count
- Auto-save indicator
- **Location:** `components/dashboard/`

**`WriterFactoryPanel.tsx`** - **Priority: HIGH**
- Writer model training interface
- Upload articles
- Train models
- Test generation
- Model management
- **Location:** `components/dashboard/`

**`SmartBriefPanel.tsx`** - **Priority: HIGH**
- SmartBrief template browser
- Create new briefs
- Edit existing briefs
- Brief preview
- **Location:** `components/dashboard/`

**`ProjectsPanel.tsx`** - **Priority: HIGH**
- Project list view
- Create new project
- Project cards
- Filter/search
- **Location:** `components/dashboard/`

**`NFLOddsPanel.tsx`** - **Priority: MEDIUM**
- NFL odds extractor interface
- Screenshot upload
- Data extraction
- Article generation
- **Location:** `components/dashboard/`

**`SEOOptimizationSidebar.tsx`** - **Priority: HIGH**
- SEO scoring
- Keyword tracking
- Real-time analysis
- Optimization suggestions
- **Location:** `components/dashboard/`

**`NewsCard.tsx`** - **Priority: MEDIUM**
- Individual news item display
- Used in research results
- Thumbnail, title, summary
- Source attribution
- **Location:** `components/dashboard/`

---

## 🪟 Modal Components (13)

### Project & Content Modals

**`ProjectCreationModal.tsx`** - **Priority: HIGH**
- Create new project flow
- Select writer model
- Choose SmartBrief
- Set keywords
- Multi-step form
- **Location:** `components/modals/`

**`ProjectListModal.tsx`** - **Priority: MEDIUM**
- Browse all projects
- Filter and search
- Project cards
- Quick actions
- **Location:** `components/modals/`

**`ExportModal.tsx`** - **Priority: HIGH**
- Export content
- CMS-ready formatting
- Safety warnings
- Copy/download options
- **Location:** `components/modals/`

### Writer Factory Modals

**`WriterFactoryModal.tsx`** - **Priority: HIGH**
- Alternative to panel view
- Writer model training
- Article upload
- Training progress
- **Location:** `components/modals/`

### SmartBrief Modals

**`BriefBuilderModal.tsx`** - **Priority: HIGH**
- Create/edit SmartBriefs
- 2-tab interface:
  - Tab 1: Content template
  - Tab 2: AI configuration
- Template editor
- Example URLs
- **Location:** `components/modals/`

**`SmartBriefListModal.tsx`** - **Priority: MEDIUM**
- Browse SmartBriefs
- Filter by category
- Quick preview
- Select for project
- **Location:** `components/modals/`

**`SmartBriefGuideModal.tsx`** - **Priority: LOW**
- Help/tutorial for SmartBriefs
- Step-by-step guide
- Best practices
- Examples
- **Location:** `components/modals/`

### Research & Tools Modals

**`ResearchResultsModal.tsx`** - **Priority: MEDIUM**
- Display news search results
- Tavily API integration
- Article cards
- Add to project
- **Location:** `components/modals/`

**`ResearchCard.tsx`** - **Priority: MEDIUM**
- Individual research result
- Used in ResearchResultsModal
- Article preview
- Actions (add, view)
- **Location:** `components/modals/`

**`NFLOddsExtractorModal.tsx`** - **Priority: MEDIUM**
- NFL odds extraction tool
- Screenshot upload
- AI processing
- Data review
- Article generation
- **Location:** `components/modals/`

### System Modals

**`InitialDashboardModal.tsx`** - **Priority: MEDIUM**
- Welcome modal for new users
- Quick start guide
- Feature overview
- Dismiss/don't show again
- **Location:** `components/modals/`

**`UserGuideModal.tsx`** - **Priority: LOW**
- In-app help system
- Feature documentation
- Searchable guide
- **Location:** `components/modals/`

**`FeedbackModal.tsx`** - **Priority: LOW**
- User feedback form
- Bug reports
- Feature requests
- **Location:** `components/modals/`

---

## 👨‍💼 Admin Components (11)

### Main Admin Views

**`AdminDashboard.tsx`** - **Priority: HIGH**
- Admin home page
- Stats overview
- Quick actions
- System health
- **Location:** `components/admin/`

**`AdminPageClient.tsx`** - **Priority: MEDIUM**
- Admin page wrapper
- Handles admin auth
- Layout container
- **Location:** `components/admin/`

**`AdminPageWrapper.tsx`** - **Priority: MEDIUM**
- Another admin wrapper
- Tab navigation
- Permission checks
- **Location:** `components/admin/`

### User & Access Management

**`UserManagement.tsx`** - **Priority: HIGH**
- User administration
- User table
- Create/edit users
- Assign roles
- Activate/deactivate
- **Location:** `components/admin/`

**`APIKeyManagement.tsx`** - **Priority: HIGH**
- Manage API keys
- Add/edit/delete keys
- Encrypted storage
- Key rotation
- **Location:** `components/admin/`

**`SSOConfigStatus.tsx`** - **Priority: LOW**
- SSO configuration status
- Microsoft SSO setup
- Connection testing
- **Location:** `components/admin/`

### AI Configuration

**`AgentTuner.tsx`** - **Priority: HIGH**
- Configure AI agents
- 8 specialized agents
- System prompts
- Temperature, tokens
- Guardrails
- **Location:** `components/admin/`

**`AITuner.tsx`** - **Priority: HIGH**
- Global AI settings
- Model selection
- Default parameters
- **Location:** `components/admin/`

**`AIHelperAdmin.tsx`** - **Priority: MEDIUM**
- AI assistant configuration
- Helper widget settings
- **Location:** `components/admin/`

### Tools & Sources

**`ToolsAdmin.tsx`** - **Priority: MEDIUM**
- Tools marketplace admin
- Approve/reject tools
- Tool management
- **Location:** `components/admin/`

**`TrustedSourcesAdmin.tsx`** - **Priority: MEDIUM**
- Manage trusted news sources
- Add/remove sources
- Source validation
- **Location:** `components/admin/`

**`CursorRemotePanel.tsx`** - **Priority: LOW**
- Cursor remote access
- Development tools
- **Location:** `components/admin/`

---

## ✏️ Editor Components (2)

**`TipTapEditor.tsx`** - **Priority: HIGH**
- Rich text editor
- TipTap integration
- Content editing
- Formatting tools
- **Location:** `components/editor/`
- **Note:** Core component, cannot be replaced

**`EditorToolbar.tsx`** - **Priority: HIGH**
- Editor toolbar
- Formatting buttons
- Undo/redo
- Heading levels
- Bold, italic, etc.
- **Location:** `components/editor/`

---

## 🏗️ Architecture Components (7)

**`ArchitectureVisualization.tsx`** - **Priority: LOW**
- System architecture diagram
- ReactFlow integration
- Interactive nodes
- Workflow visualization
- **Location:** `components/architecture/`

**`CustomNode.tsx`** - **Priority: LOW**
- Custom node for ReactFlow
- Node styling
- **Location:** `components/architecture/`

**`DetailPanel.tsx`** - **Priority: LOW**
- Node detail sidebar
- Component info
- **Location:** `components/architecture/`

**`LayerToggle.tsx`** - **Priority: LOW**
- Toggle architecture layers
- Filter view
- **Location:** `components/architecture/`

**`Legend.tsx`** - **Priority: LOW**
- Diagram legend
- Node types
- **Location:** `components/architecture/`

**`SearchBar.tsx`** - **Priority: LOW**
- Search nodes
- Filter diagram
- **Location:** `components/architecture/`

**`WorkflowSelector.tsx`** - **Priority: LOW**
- Select workflow view
- Different diagrams
- **Location:** `components/architecture/`

---

## 🛠️ Tools Components (2)

**`ToolCard.tsx`** - **Priority: MEDIUM**
- Tool marketplace card
- Tool info display
- Install/manage buttons
- **Location:** `components/tools/`

**`ToolPermissionBadge.tsx`** - **Priority: LOW**
- Permission level badge
- Visual indicator
- **Location:** `components/tools/`

---

## 👤 User Components (2)

**`ProfilePageClient.tsx`** - **Priority: MEDIUM**
- User profile page
- Edit profile info
- Avatar upload
- **Location:** `components/profile/`

**`SettingsPageClient.tsx`** - **Priority: MEDIUM**
- User settings page
- Preferences
- Notifications
- **Location:** `components/settings/`

---

## 🎨 UI Primitive Components (24)

All from Shadcn UI library:

**Location:** `components/ui/`

### Buttons & Actions
- `button.tsx` - Button component
- `dropdown-menu.tsx` - Dropdown menus

### Forms & Inputs
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line text
- `select.tsx` - Select dropdown
- `checkbox.tsx` - Checkbox
- `radio-group.tsx` - Radio buttons
- `switch.tsx` - Toggle switch
- `slider.tsx` - Range slider
- `form.tsx` - Form wrapper
- `label.tsx` - Form labels
- `inline-edit.tsx` - Inline editing

### Layout & Containers
- `card.tsx` - Card container
- `dialog.tsx` - Modal dialog
- `sheet.tsx` - Slide-out panel
- `tabs.tsx` - Tab navigation
- `separator.tsx` - Divider line
- `sidebar.tsx` - Sidebar component

### Feedback & Display
- `alert.tsx` - Alert messages
- `badge.tsx` - Status badges
- `tooltip.tsx` - Tooltips
- `skeleton.tsx` - Loading skeleton
- `avatar.tsx` - User avatars

### Data Display
- `table.tsx` - Data tables

---

## 🔧 Utility Components (3)

**`AppSidebar.tsx`** - **Priority: HIGH**
- App-wide sidebar
- Navigation
- **Location:** `components/layout/`

**`AIHelperWidget.tsx`** - **Priority: MEDIUM**
- Floating AI assistant
- Context-aware help
- **Location:** `components/ai/`

**`PasswordResetHandler.tsx`** - **Priority: LOW**
- Password reset flow
- Email verification
- **Location:** `components/`

**`MicrosoftSignInButton.tsx`** - **Priority: LOW**
- Microsoft SSO button
- OAuth integration
- **Location:** `components/auth/`

---

## 📋 Component Relationships

### Dashboard Hierarchy

```
DashboardLayout
├── LeftSidebar
│   └── Navigation menu
├── Center Panel (swappable)
│   ├── DashboardHome (default)
│   ├── EditorPanel
│   ├── WriterFactoryPanel
│   ├── SmartBriefPanel
│   ├── ProjectsPanel
│   └── NFLOddsPanel
└── RightSidebar (contextual)
    ├── SEOOptimizationSidebar
    ├── NewsCard (multiple)
    └── Project info
```

### Modal Triggers

```
Dashboard Actions → Modals
├── "New Project" → ProjectCreationModal
├── "Browse Projects" → ProjectListModal
├── "Train Writer" → WriterFactoryModal
├── "Create Brief" → BriefBuilderModal
├── "Browse Briefs" → SmartBriefListModal
├── "Find News" → ResearchResultsModal
├── "Extract Odds" → NFLOddsExtractorModal
└── "Export" → ExportModal
```

### Admin Hierarchy

```
AdminDashboard
├── AdminPageWrapper
│   ├── UserManagement
│   ├── APIKeyManagement
│   ├── AgentTuner
│   ├── AITuner
│   ├── ToolsAdmin
│   └── TrustedSourcesAdmin
```

---

## 🎯 Redesign Priority Matrix

### Must Redesign (Critical Path)

1. **DashboardLayout** - Core structure
2. **EditorPanel** - Main workspace
3. **ProjectCreationModal** - Entry point
4. **WriterFactoryPanel** - Key feature
5. **BriefBuilderModal** - Key feature
6. **SEOOptimizationSidebar** - Always visible

### Should Redesign (High Impact)

7. **LeftSidebar** - Navigation
8. **ProjectsPanel** - Project management
9. **SmartBriefPanel** - Template browser
10. **AdminDashboard** - Admin home
11. **UserManagement** - Admin function
12. **AgentTuner** - Admin function

### Could Redesign (Medium Impact)

13. **RightSidebar** - Contextual info
14. **DashboardHome** - Welcome screen
15. **NFLOddsPanel** - Feature tool
16. **ToolCard** - Marketplace
17. **ProfilePageClient** - User profile
18. **SettingsPageClient** - User settings

### Optional Redesign (Lower Impact)

19. Landing page
20. Login page
21. Documentation pages
22. Architecture visualization
23. Modals (feedback, guide, etc.)

---

## 📊 Component Complexity

### High Complexity (Need Careful Design)

- **DashboardLayout** - Multi-panel system
- **EditorPanel** - Editor + toolbar + SEO
- **BriefBuilderModal** - 2-tab interface
- **WriterFactoryPanel** - Training flow
- **AgentTuner** - 8 agents configuration
- **UserManagement** - Table + CRUD
- **ProjectCreationModal** - Multi-step form

### Medium Complexity

- **SmartBriefPanel** - List + preview
- **ProjectsPanel** - Cards + filters
- **SEOOptimizationSidebar** - Real-time scoring
- **NFLOddsPanel** - Upload + processing
- **AdminDashboard** - Stats + actions
- **APIKeyManagement** - Secure CRUD

### Low Complexity

- **NewsCard** - Simple display
- **ToolCard** - Simple display
- **LeftSidebar** - Navigation list
- **DashboardHome** - Welcome screen
- Most UI primitives

---

## 🔗 Component Dependencies

### External Libraries

- **TipTap** - EditorPanel, TipTapEditor
- **ReactFlow** - ArchitectureVisualization
- **Shadcn UI** - All UI primitives
- **Lucide Icons** - Throughout app
- **Framer Motion** - Animations (optional)

### Internal Dependencies

- **Supabase** - All data components
- **Auth Context** - Protected components
- **Theme Context** - All styled components

---

## 📝 Notes for Designers

1. **Start with Dashboard** - It's the core of the app
2. **Focus on Editor** - Most time spent here
3. **Simplify Modals** - Currently complex
4. **Improve Tables** - Admin uses many tables
5. **Consider Mobile** - Currently desktop-focused
6. **Dark Mode** - Must support both themes

---

**Last Updated:** February 17, 2026  
**Total Components:** 77  
**Repository:** https://github.com/verygooddesigners/forge

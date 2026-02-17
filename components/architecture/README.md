# Forge System Architecture Visualization

An interactive, visual representation of the entire Forge system architecture.

## Access

Visit: **`http://localhost:5309/system-architecture`** (development)  
Production: **`https://forge.vercel.app/system-architecture`**

**🌐 Public Access:** This page is intentionally public and does not require authentication. Anyone can view the Forge system architecture visualization without logging in.

## Features

### 🎨 Interactive Canvas
- **Pan & Zoom** - Navigate the full architecture
- **Clickable Nodes** - Click any component for detailed information
- **Mini Map** - Bird's-eye view navigation
- **Background Grid** - Violet-themed design matching Forge

### 📊 Layer Management
- **Frontend Layer** (Purple) - UI components and pages
- **API Layer** (Blue) - Next.js API routes
- **AI Agents** (Green) - 7 specialized AI agents
- **Database** (Amber) - PostgreSQL tables
- **External Services** (Gray) - Third-party integrations

Toggle any layer on/off to focus on specific aspects of the system.

### 🔄 Workflow Visualization
Select predefined workflows to highlight the data flow:

1. **Article Generation** - Complete content creation flow
2. **Writer Model Training** - AI model training process
3. **NFL Odds Extraction** - Screenshot to article workflow
4. **SEO Optimization** - Real-time SEO analysis
5. **Research & Fact Verification** - News search and fact checking

When a workflow is selected, relevant nodes and edges are highlighted in color while others are dimmed.

### 🔍 Search
Real-time component search by:
- Component name
- Description
- Features

### 📱 Detail Panels
Click any node to see:
- Full description
- Key features
- Technology stack
- Code file locations

## Components Visualized

### Frontend (8 components)
- Dashboard
- Content Editor
- SmartBrief Builder
- Writer Factory
- NFL Odds Extractor
- Research Center
- Admin Panel
- AI Helper Bot

### API Layer (9 endpoints)
- `/api/generate` - Content generation
- `/api/research/*` - News search & fact verification
- `/api/seo/*` - SEO analysis & optimization
- `/api/writer-models/train` - Model training
- `/api/briefs/analyze-urls` - SmartBrief URL analysis
- `/api/nfl-odds/extract` - Visual data extraction
- `/api/assistant/chat` - AI Helper Bot
- `/api/admin/*` - Admin management
- `/api/auth/*` - Authentication

### AI Agents (8 agents)
1. Content Generation Agent
2. Writer Training Agent
3. SEO Optimization Agent
4. Quality Assurance Agent
5. Persona & Tone Agent
6. Creative Features Agent
7. Visual Extraction Agent
8. Fact Verification Agent

### Database (9 tables)
- users
- projects
- writer_models
- training_content (with pgvector)
- briefs
- api_keys
- ai_settings
- trusted_sources
- ai_helper_entries

### External Services (6 services)
- Anthropic Claude (Sonnet 4)
- OpenAI (Embeddings & GPT-4o Vision)
- Tavily AI (News search)
- LanguageTool (Grammar checking)
- Microsoft Azure AD (SSO)
- Supabase Auth

## Technology Stack

- **React Flow** - Node-based visualization
- **Framer Motion** - Animations
- **Next.js 14** - Framework
- **React 19** - UI library
- **Shadcn UI** - Component library
- **TailwindCSS** - Styling
- **Lucide Icons** - Icons

## Use Cases

### For Development
- Understand system architecture
- Identify integration points
- Plan new features
- Debug data flows

### For Onboarding
- Quick system overview
- Learn component relationships
- Understand tech stack

### For Presentations
- Stakeholder demos
- Technical documentation
- System design reviews
- Architecture discussions

## Customization

Edit `lib/architecture-data.ts` to:
- Add new components
- Update descriptions
- Modify workflows
- Change positions
- Add new connections

## Files

```
app/system-architecture/
  page.tsx                          # Route page

components/architecture/
  ArchitectureVisualization.tsx     # Main canvas component
  CustomNode.tsx                    # Node rendering
  DetailPanel.tsx                   # Component details sidebar
  LayerToggle.tsx                   # Layer visibility controls
  WorkflowSelector.tsx              # Workflow highlighting
  SearchBar.tsx                     # Component search
  Legend.tsx                        # Color legend

lib/
  architecture-data.ts              # All system data (nodes, edges, workflows)
```

## Tips

- **Zoom out** to see the full system overview
- **Zoom in** to focus on specific areas
- **Click workflows** to understand data flows
- **Toggle layers** to reduce complexity
- **Search** to quickly find components
- **Click nodes** for detailed documentation

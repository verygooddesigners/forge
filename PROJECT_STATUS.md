# Forge - Project Status

**Last Updated:** February 26, 2026
**Version:** v1.10.10
**Production:** https://gdcforge.vercel.app
**Repository:** https://github.com/verygooddesigners/forge  
**Local Dev:** http://localhost:5309  
**Spark Project ID:** 7bf75473-0a06-469c-9fd2-2229efff76e0

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Shadcn UI, Inter font |
| Editor | TipTap 3.10 |
| Database | Supabase (PostgreSQL, Auth, RLS) |
| AI | Claude API (Anthropic) |
| News | Tavily AI Search API |
| Deployment | Vercel |

---

## Features

### Shipped
- **Writer Engine** - RAG-based AI writer training (style analysis, up to 25 samples)
- **SmartBrief Builder** - AI-powered content templates with URL analysis
- **Multi-Agent System** - 8 specialized AI agents with admin Agent Tuner
- **Project Workflow** - Multi-step wizard (Details > Writer Model > Brief)
- **Content Generation** - Streaming AI output with auto-save
- **NewsEngine** - Tavily-powered relevant news search
- **SEO Assistant** - Real-time scoring, live keyword tracking, dynamic targets
- **Export System** - HTML/text with CMS safety warnings
- **Admin Panel** - User management, API keys, agent configuration
- **Auth** - Supabase Auth with password reset, RLS policies, role-based access
- **Content Analytics** - Interactive dashboard with charts, date filtering, team stats, save/share filters, multi-format export (CSV, Excel, PDF, HTML)

### In Progress
- AI-powered secondary keyword suggestions (Project Creation)
- URL extraction debugging in Writer Factory
- Research Story workflow testing
- Fact Checking agent tuning panel in Admin
- Tools/plugins marketplace infrastructure

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLAUDE_API_KEY=
TAVILY_API_KEY=
NEXT_PUBLIC_APP_URL=
BETA_SIGNUP_TOKEN=
```

---

## Database Tables

`users` | `writer_models` | `training_content` | `categories` | `briefs` | `projects` | `api_keys` | `ai_settings` | `agent_configs`

---

## Known Issues

None currently tracked.

---

## Change Log

### February 18, 2026
- Cleaned up codebase documentation (removed ~40 redundant files)
- Consolidated to single PROJECT_STATUS.md

### February 17, 2026
- Renamed from RotoWrite to Forge
- Created GitHub repo (verygooddesigners/forge)
- Deployed to Vercel (gdcforce.vercel.app)
- Set up Spark project integration
- Created Figma design brief documentation

### January 2026
- Multi-Agent System (8 agents with guardrails and Agent Tuner)
- Export Modal with CMS safety warnings
- Real-time keyword tracking in SEO sidebar
- Dynamic SEO targets based on word count
- SmartBrief AI configuration with URL analysis

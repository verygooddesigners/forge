# RotoWrite

AI-powered content creation platform with RAG-based writer models, brief builder, and SEO optimization.

## 🚀 Features

### Core Features
- **Writer Engine (RAG)**: Train AI models on specific writer styles using vector embeddings
- **Brief Builder**: Create reusable SEO content templates with TipTap editor
- **NewsEngine**: Find relevant news with Tavily AI search
- **SEO Assistant**: Real-time scoring and AI-powered optimization suggestions
- **Project Management**: Complete workflow from creation to publication
- **Admin Dashboard**: User management, API keys, and AI configuration

### Technical Highlights
- **RAG Implementation**: pgvector + OpenAI embeddings for style matching
- **Streaming AI**: Real-time content generation with Grok API
- **Auto-save**: Debounced content persistence
- **Role-based Access**: Admin and Strategist permissions
- **Beautiful UI**: Violet-themed design with Shadcn UI

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **UI/UX**: Shadcn UI, Tailwind CSS, Inter font
- **Editor**: TipTap (rich text editing)
- **Database**: Supabase PostgreSQL + pgvector
- **Auth**: Supabase Auth with RLS
- **AI**: Grok API (Claude-ready architecture)
- **News**: Tavily API
- **Embeddings**: OpenAI text-embedding-3-small
- **Deployment**: Vercel

## 📚 Documentation

- **[Getting Started Guide](GETTING_STARTED.md)** - Complete setup walkthrough
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Supabase Setup](supabase/SETUP.md)** - Database configuration

## 🏃 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment:**
```bash
# Copy and configure environment variables
# See GETTING_STARTED.md for API key details
```

3. **Configure Supabase:**
```bash
# Follow supabase/SETUP.md to:
# - Create project
# - Run migrations
# - Enable pgvector
# - Create admin user
```

4. **Run development server:**
```bash
npm run dev
```

5. **Open app:**
```bash
http://localhost:5309
```

## 🎯 User Workflows

### For Strategists
1. **Create Writer Model** → Train with your articles
2. **Build Briefs** → Structure your content templates  
3. **Start Project** → Choose model + brief + keywords
4. **Generate Content** → AI writes in your style
5. **Optimize** → Use SEO Assistant to improve
6. **Publish** → Export polished content

### For Admins
- Manage all writer models
- Create and assign user accounts
- Configure API keys
- Set AI master instructions
- Monitor system usage

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes (generation, news, SEO)
│   ├── dashboard/        # Main application
│   ├── admin/            # Admin panel
│   └── login/            # Authentication
├── components/
│   ├── dashboard/        # Dashboard components
│   ├── editor/           # TipTap editor
│   ├── modals/           # Feature modals
│   ├── admin/            # Admin components
│   └── ui/               # Shadcn components
├── lib/
│   ├── supabase/         # Database clients
│   ├── ai.ts             # AI integration
│   ├── rag.ts            # RAG implementation
│   ├── seo.ts            # SEO analysis
│   └── embeddings.ts     # Vector embeddings
├── supabase/
│   └── migrations/       # Database schema
└── types/                # TypeScript definitions
```

## 🔑 Environment Variables

Required variables (see `.env.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services  
GROK_API_KEY=
OPENAI_API_KEY=

# News
TAVILY_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:5309
```

## 🎨 Design System

- **Theme**: Violet/Purple primary colors
- **Typography**: Inter font family
- **Components**: Shadcn UI with Tailwind
- **Layout**: Floating panels with rounded corners
- **Spacing**: 10px browser padding

## 🚢 Deployment

Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/verygooddesigners/rotowrite)

Or follow the [Deployment Guide](DEPLOYMENT.md) for manual setup.

## 📊 Database Schema

Key tables:
- `users` - User profiles and roles
- `writer_models` - AI writer configurations
- `training_content` - RAG training data with vectors
- `briefs` - Content templates
- `projects` - Active content projects
- `categories` - Organization taxonomies
- `api_keys` - Encrypted service credentials
- `ai_settings` - Global AI configuration

## 🔒 Security

- Row Level Security (RLS) on all tables
- Encrypted API key storage
- Role-based access control
- Secure authentication with Supabase
- HTTPS-only in production

## 🎯 Performance

- Auto-save with debouncing (2s delay)
- Vector search optimized with ivfflat indexes
- Streaming AI responses
- Cached news results
- Efficient database queries

## 🛠 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📈 Future Enhancements

Ready for:
- Claude API integration (architecture prepared)
- Additional AI providers
- Advanced analytics
- Content versioning
- Team collaboration features
- Export to CMS platforms

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Private - All Rights Reserved

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [TipTap](https://tiptap.dev/)
- [Tavily](https://tavily.com/)
- [Grok AI](https://x.ai/)

---

**RotoWrite** - AI-Powered Content Creation Platform  
Version v1.01.01 | Built with ❤️ for RotoWire

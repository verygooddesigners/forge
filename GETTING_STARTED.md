# Getting Started with RotoWrite

Welcome to RotoWrite! This guide will help you get up and running quickly.

## Quick Start

### 1. Initial Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 2. Supabase Setup

Follow the detailed guide in `supabase/SETUP.md`:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database migrations
3. Enable pgvector extension
4. Create your first admin user

### 3. Get API Keys

You'll need:

- **Grok API Key**: For AI content generation
  - Visit [x.ai](https://x.ai) to get your key
  
- **OpenAI API Key**: For text embeddings
  - Visit [platform.openai.com](https://platform.openai.com)
  
- **Tavily API Key**: For news search
  - Visit [tavily.com](https://tavily.com)

Add these to your `.env.local` file.

### 4. Run the Application

```bash
npm run dev
```

Visit [http://localhost:5309](http://localhost:5309)

## First Steps

### 1. Log In

Use the admin credentials you created in Supabase.

### 2. Create a Writer Model

1. Click "Writer Factory" in the left sidebar
2. Create a new writer model
3. Add training content by pasting example articles
4. The AI will analyze the style automatically

### 3. Create a Brief

1. Click "Briefs" in the left sidebar
2. Create a new brief
3. Use the TipTap editor to structure your content template
4. Set it as shared if other strategists should use it

### 4. Create Your First Project

1. Click "Projects" or the "New Project" button
2. Follow the multi-step wizard:
   - Enter headline and keywords
   - Set target word count
   - Choose a writer model
   - Select a brief
3. Start writing!

## Key Features

### Writer Engine (RAG)

The Writer Engine uses Retrieval-Augmented Generation to emulate specific writing styles:

- **Training**: Paste example articles to teach the model
- **Style Analysis**: AI analyzes tone, voice, and vocabulary
- **Content Generation**: AI retrieves similar examples and generates matching content

### NewsEngine

Find recent, relevant news for your content:

- Powered by Tavily AI search
- Filters for trustworthy sources
- Shows relevance scores
- Limited to past 3 weeks

### SEO Assistant

Real-time SEO optimization:

- Live SEO score calculation
- Keyword density analysis
- Heading structure validation
- AI-powered improvement suggestions

### Brief Builder

Create reusable content templates:

- Use TipTap editor for structure
- Organize with categories
- Share with team or keep private
- Applied automatically during generation

## User Roles

### Admin

Full access to:
- All writer models
- User management
- API key configuration
- AI master instructions
- All briefs and projects

### Strategist

Access to:
- Their own writer model
- Shared briefs (+ create own)
- Their own projects
- All generation features

## Tips & Best Practices

### Writer Models

- Add at least 5-10 training pieces for best results
- Use complete, published articles
- Include variety in topics but consistent style
- Update regularly with new content

### Briefs

- Use clear heading hierarchy (H1, H2, H3)
- Include keyword placement guidelines
- Specify required sections
- Keep it as a template, not full content

### Content Generation

- Be specific with headlines and keywords
- Set realistic word count targets
- Review and edit AI-generated content
- Use SEO Assistant for optimization

### Projects

- Auto-save keeps your work safe
- Word count updates in real-time
- SEO score helps track quality
- News integration provides context

## Keyboard Shortcuts

### Editor

- `Cmd/Ctrl + B`: Bold
- `Cmd/Ctrl + I`: Italic
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + Shift + Z`: Redo

## Common Workflows

### Writing a New Article

1. Create project with headline + keywords
2. Check NewsEngine for recent context
3. Generate initial draft with AI
4. Review and edit in TipTap editor
5. Check SEO score and apply suggestions
6. Content auto-saves continuously

### Training a Writer Model

1. Open Writer Factory
2. Select your model
3. Switch to "Train Model" tab
4. Paste complete article
5. AI analyzes and saves
6. Repeat with more examples

### Creating a Content Template

1. Open Brief Builder
2. Create new brief
3. Structure your template
4. Add categories and share settings
5. Save for future use

## Troubleshooting

### Can't log in
- Check email/password
- Verify user exists in Supabase
- Check Supabase connection

### Writer model not available
- Ensure model is created
- Check if you have access (admin or owner)
- Verify model has training content

### Content generation fails
- Check Grok API key
- Verify API quota
- Ensure writer model has training data

### NewsEngine shows no results
- Check Tavily API key
- Try different keywords
- Verify internet connection

## Next Steps

- Explore the [Deployment Guide](DEPLOYMENT.md)
- Review [Supabase Setup](supabase/SETUP.md)
- Check out example briefs and models
- Invite your team members

## Need Help?

- Check logs in browser console
- Review Supabase dashboard
- Verify environment variables
- Test individual features

Happy writing with RotoWrite! 🚀



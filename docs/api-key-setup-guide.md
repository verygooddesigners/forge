# Forge API Key Setup Guide

## Overview

This document provides exact instructions for setting up API keys required for the Forge Multi-Agent System. Follow these steps precisely to ensure all agents function correctly.

---

## Required API Keys Summary

| API Key | Provider | Required | Already Have? | Purpose |
|---------|----------|----------|---------------|---------|
| Claude API | Anthropic | Yes | Check | Primary model for all 7 agents |
| OpenAI API | OpenAI | Yes | Yes (existing) | Embeddings + GPT-4o Vision fallback |
| LanguageTool API | LanguageTool | Optional | No (FREE) | Grammar checking supplement |
| Tavily API | Tavily | Yes | Yes (existing) | NewsEngine search |

**Total New Keys Needed:** 0-2 (Claude if not set up, LanguageTool is free and optional)

---

## API Key #1: Anthropic Claude API

### Account Setup

1. **Go to:** https://console.anthropic.com/
2. **Sign up or log in** with your company email
3. **Navigate to:** Settings → API Keys

### Key Creation

1. Click **"Create Key"**
2. **Name:** `forge-production`
3. **Permissions:** Leave as default (full access)

### Required Model Access

Ensure your account has access to:

| Model | Model ID | Required For |
|-------|----------|--------------|
| Claude Sonnet 4 | `claude-sonnet-4-20250514` | All 7 agents |
| Vision API | (included with Sonnet 4) | Agent #7 (Visual Extraction) |

**Note:** Claude Sonnet 4 includes vision capabilities by default. No separate vision model access is needed.

### Console Settings to Verify

1. **Rate Limits:** Check your tier allows sufficient requests
   - Default: 1,000 requests/minute (more than enough)
   - If on free tier, upgrade to paid tier

2. **Usage Limits:** Set monthly spending cap if desired
   - Recommended: $50-100/month cap (actual usage ~$15-30)

3. **Vision API:** Enabled by default with Sonnet 4
   - No special toggle required

### Environment Variable

```env
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**OR** (alternative naming):

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** The codebase checks for both variable names.

---

## API Key #2: OpenAI API (Embeddings + Vision Fallback)

### Account Setup

1. **Go to:** https://platform.openai.com/
2. **Sign up or log in**
3. **Navigate to:** API Keys section

### Key Creation (if not already created)

1. Click **"Create new secret key"**
2. **Name:** `forge-multi-agent`
3. **Permissions:** Full access (needed for both embeddings and vision)

### Required Model Access

| Model | Model ID | Required For |
|-------|----------|--------------|
| text-embedding-3-small | `text-embedding-3-small` | RAG vector embeddings (Agent #2) |
| GPT-4o | `gpt-4o` | Vision fallback for Agent #7 (Visual Extraction) |

### Console Settings to Verify

1. **Model Access:** Verify both models are available
2. **Spending Limits:** Set if desired (usage is minimal, ~$2-5/month)

### Environment Variable

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## API Key #3: LanguageTool API (FREE - Grammar Checking)

### Overview

LanguageTool provides technical grammar and spelling verification as a supplement to Claude's substantive editing in the Quality Assurance Agent.

### Account Setup

1. **Go to:** https://languagetool.org/dev
2. **Sign up** for a free account (optional - free tier needs no key)
3. **For higher limits:** Get API key from dashboard

### Pricing Tiers

| Tier | Requests | Cost | API Key Needed? |
|------|----------|------|-----------------|
| Free | 20 requests/minute | $0 | No |
| Premium | Unlimited | $4.99/month | Yes |

**Recommendation:** Start with free tier (no key needed). Upgrade only if hitting rate limits.

### Required Model Access

| Feature | Endpoint | Required For |
|---------|----------|--------------|
| Grammar Check | `/v2/check` | Agent #4 (Quality Assurance) |

### Environment Variable (Optional - only for premium)

```env
LANGUAGETOOL_API_KEY=xxxxxxxxxxxxxxxxxxxx
```

**Note:** Free tier works without API key. Code will detect if key is present.

---

## API Key #4: Tavily API (Already Configured)

### Existing Setup

This key should already be configured for NewsEngine.

### Verify in Console

1. **Go to:** https://tavily.com/
2. **Check:** API key is active
3. **Verify:** Sufficient credits/quota

### Environment Variable

```env
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Environment Variables Summary

### Complete `.env.local` Configuration

```env
# ===========================================
# ANTHROPIC CLAUDE API (Primary - All Agents)
# ===========================================
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===========================================
# OPENAI API (Embeddings + Vision Fallback)
# ===========================================
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===========================================
# LANGUAGETOOL API (Optional - Grammar Check)
# ===========================================
# Leave empty for free tier (20 req/min), add key for premium
LANGUAGETOOL_API_KEY=

# ===========================================
# TAVILY API (NewsEngine)
# ===========================================
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===========================================
# SUPABASE (Database - Already Configured)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# APP CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:5309
```

---

## Vercel Environment Variables

### Production Deployment

Add these environment variables in Vercel Dashboard:

1. Go to: **Project Settings → Environment Variables**
2. Add each variable for **Production** environment:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `CLAUDE_API_KEY` | `sk-ant-api03-...` | Production |
| `OPENAI_API_KEY` | `sk-...` | Production |
| `LANGUAGETOOL_API_KEY` | (empty or premium key) | Production |
| `TAVILY_API_KEY` | `tvly-...` | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://...` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://forge.vercel.app` | Production |

---

## Agent-to-Model Mapping

### How Each Agent Uses API Keys

| Agent | API Key Used | Model | Capabilities Used |
|-------|--------------|-------|-------------------|
| #1 Content Generation | `CLAUDE_API_KEY` | claude-sonnet-4-20250514 | Text generation, streaming |
| #2 Writer Training | `CLAUDE_API_KEY` | claude-sonnet-4-20250514 | Style analysis |
| #2 Writer Training | `OPENAI_API_KEY` | text-embedding-3-small | Vector embeddings |
| #3 SEO Optimization | `CLAUDE_API_KEY` | claude-sonnet-4-20250514 | Content analysis |
| #4 Quality Assurance | `CLAUDE_API_KEY` | claude-sonnet-4-20250514 | Substantive editing, style |
| #4 Quality Assurance | `LANGUAGETOOL_API_KEY` | LanguageTool API | Grammar/spelling verification |
| #5 Persona & Tone | `CLAUDE_API_KEY` | claude-sonnet-4-20250514 | Tone adjustment |
| #6 Creative Features | `CLAUDE_API_KEY` | claude-sonnet-4-20250514 | Workflow coordination |
| #7 Visual Extraction | `CLAUDE_API_KEY` | claude-sonnet-4-20250514 | Vision/image processing (primary) |
| #7 Visual Extraction | `OPENAI_API_KEY` | gpt-4o | Vision OCR fallback (secondary) |

**Key Insight:** Claude is primary for all agents. LanguageTool supplements grammar checking. GPT-4o Vision provides OCR fallback for dense text extraction.

---

## Code Architecture: Agent Configuration

### Agent Config Structure (`lib/agents/config.ts`)

```typescript
export const AGENT_CONFIG = {
  contentGeneration: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4000,
    temperature: 0.7,
    apiKeyEnv: 'CLAUDE_API_KEY',
  },
  writerTraining: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2000,
    temperature: 0.3,
    apiKeyEnv: 'CLAUDE_API_KEY',
  },
  seoOptimization: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2000,
    temperature: 0.4,
    apiKeyEnv: 'CLAUDE_API_KEY',
  },
  qualityAssurance: {
    primary: {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 2000,
      temperature: 0.3,
      apiKeyEnv: 'CLAUDE_API_KEY',
    },
    grammar: {
      provider: 'languagetool',
      endpoint: 'https://api.languagetool.org/v2/check',
      apiKeyEnv: 'LANGUAGETOOL_API_KEY', // Optional - free tier needs no key
    },
  },
  personaTone: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2000,
    temperature: 0.5,
    apiKeyEnv: 'CLAUDE_API_KEY',
  },
  creativeFeatures: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 3000,
    temperature: 0.6,
    apiKeyEnv: 'CLAUDE_API_KEY',
  },
  visualExtraction: {
    primary: {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4000,
      temperature: 0.2, // Low for accuracy
      apiKeyEnv: 'CLAUDE_API_KEY',
      supportsVision: true,
    },
    fallback: {
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.1, // Very low for OCR accuracy
      apiKeyEnv: 'OPENAI_API_KEY',
      supportsVision: true,
      useWhen: 'confidence < 0.85 || denseText',
    },
  },
  embeddings: {
    model: 'text-embedding-3-small',
    apiKeyEnv: 'OPENAI_API_KEY',
  },
};
```

---

## Agent System Prompts & Guardrails

### System Prompt Structure

Each agent has a dedicated system prompt file in `lib/agents/prompts/`:

```
lib/agents/prompts/
├── content-generation.ts
├── writer-training.ts
├── seo-optimization.ts
├── quality-assurance.ts
├── persona-tone.ts
├── creative-features.ts
└── visual-extraction.ts
```

### Example: Content Generation Agent System Prompt

```typescript
export const CONTENT_GENERATION_SYSTEM_PROMPT = `
You are the Content Generation Agent for Forge.

## YOUR ROLE
Generate high-quality, SEO-optimized articles based on:
- User briefs and templates
- Primary and secondary keywords
- Writer model context (style samples)
- Target word count

## YOUR CAPABILITIES
- Generate complete articles with proper heading structure (H1, H2, H3)
- Create formatted tables when requested
- Build bullet and numbered lists
- Include keywords naturally
- Follow brief structure exactly
- Stream responses in real-time

## YOUR GUARDRAILS - YOU CANNOT:
- Modify SEO settings or scores
- Train or update writer models
- Process or analyze images
- Edit existing content (only generate new)
- Access user management functions
- Respond to queries outside content generation
- Make up statistics or data not provided

## OUTPUT FORMAT
Always output content in clean HTML format suitable for TipTap editor:
- Use <h2> and <h3> for headings (never <h1>)
- Use <p> for paragraphs
- Use <ul>/<ol> with <li> for lists
- Use <table> for tabular data
- Use <strong> for bold, <em> for italic

## TONE
Match the provided writer model context. If no context is provided,
use a professional, engaging tone appropriate for sports content.
`;
```

### Example: Visual Extraction Agent System Prompt

```typescript
export const VISUAL_EXTRACTION_SYSTEM_PROMPT = `
You are the Visual Data Extraction Agent for Forge.

## YOUR ROLE
Extract structured data from uploaded screenshots, specifically:
- ESPN NFL schedule screenshots
- RotoWire Weekly NFL Odds matrices (DraftKings)

## YOUR CAPABILITIES
- Read and parse table layouts from images
- Extract dates, times, and locations
- Identify team names and matchups
- Parse odds data (spreads, moneylines, over/unders)
- Output validated JSON structures
- Handle variations in image quality and format

## YOUR GUARDRAILS - YOU CANNOT:
- Generate article content
- Modify any database records
- Access data not in the provided images
- Make editorial decisions about content
- Guess or invent data not visible in images
- Process non-image inputs

## OUTPUT FORMAT
Always output structured JSON in this exact format:

{
  "success": true,
  "week": 14,
  "season": 2025,
  "source": "ESPN Schedule" | "RotoWire Odds",
  "extractedAt": "ISO timestamp",
  "matchups": [
    {
      "order": 1,
      "homeTeam": "Detroit Lions",
      "awayTeam": "Green Bay Packers",
      "date": "Thursday, November 27, 2025",
      "time": "1:00 PM EST",
      "location": "Ford Field, Detroit, MI",
      "spread": { "favorite": "Lions", "line": -3 },
      "moneyline": { "home": -165, "away": +142 },
      "overUnder": 48.5
    }
  ],
  "confidence": 0.95
}

## ERROR HANDLING
If data cannot be extracted clearly:
- Set "success": false
- Include "error" field with description
- Set "confidence" appropriately
- Return partial data if available
`;
```

---

## Testing API Keys

### Quick Validation Script

After setting up keys, run this test:

```bash
# In project directory
npm run dev

# Open browser to:
http://localhost:5309

# Test sequence:
1. Log in to dashboard
2. Create a test project
3. Click "Generate Content"
4. Verify content streams successfully
```

### API Key Health Check Endpoints

The system includes health check endpoints:

```
GET /api/health/claude    → Tests Claude API connection
GET /api/health/openai    → Tests OpenAI API connection
GET /api/health/tavily    → Tests Tavily API connection
```

---

## Troubleshooting

### Common Issues

**"CLAUDE_API_KEY is not configured"**
- Check `.env.local` file exists
- Verify variable name matches exactly
- Restart development server after changes

**"Unauthorized" from Claude API**
- Verify API key is correct (starts with `sk-ant-api03-`)
- Check API key has not been revoked
- Verify account is on paid tier

**"Model not found" errors**
- Ensure account has access to `claude-sonnet-4-20250514`
- Contact Anthropic support if model unavailable

**Vision API not working**
- Vision is included with Sonnet 4 by default
- Ensure image is base64 encoded properly
- Check image size limits (max 20MB)

---

## Security Best Practices

1. **Never commit API keys to Git**
   - Use `.env.local` (already in `.gitignore`)
   - Use Vercel environment variables for production

2. **Rotate keys periodically**
   - Regenerate keys every 90 days
   - Update both local and Vercel environments

3. **Monitor usage**
   - Set up billing alerts in Anthropic Console
   - Review usage monthly for anomalies

4. **Use least privilege**
   - OpenAI key can be restricted to embeddings only
   - Set spending limits appropriate to expected usage

---

## Checklist Before Implementation

- [ ] Anthropic account created/verified
- [ ] Claude API key generated with name `forge-production`
- [ ] Verified Sonnet 4 model access
- [ ] Verified Vision API enabled (default with Sonnet 4)
- [ ] OpenAI API key verified active
- [ ] OpenAI embeddings model access confirmed
- [ ] Tavily API key verified active
- [ ] All keys added to `.env.local`
- [ ] All keys added to Vercel environment variables
- [ ] Development server tested successfully
- [ ] Health check endpoints responding


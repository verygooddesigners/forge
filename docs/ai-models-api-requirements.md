# RotoWrite Multi-Agent System: AI Models & API Requirements

## Overview

RotoWrite is transitioning from a single-AI-model architecture to a specialized multi-agent system. Each agent uses the optimal AI model for its specific function, improving quality, performance, and cost efficiency.

## Required API Keys & Services

### 1. Content Generation Agent

**Primary Model:** Claude Sonnet 4 (Anthropic)

- **API:** Anthropic API
- **Key Needed:** `CLAUDE_API_KEY` or `ANTHROPIC_API_KEY`
- **Purpose:** Generate high-quality articles with proper structure, tables, headers, and SEO optimization
- **Why This Model:** Superior creative writing, excellent structured content formatting, best-in-class reasoning
- **Usage:** Every content generation request, NFL odds article building
- **Cost:** ~$3 per 1M input tokens, ~$15 per 1M output tokens

### 2. Writer Model & Training Agent

**Primary Model:** Claude Sonnet 4 (Anthropic)

- **API:** Anthropic API
- **Key Needed:** Already covered by Claude key above
- **Purpose:** Analyze writing samples, extract style characteristics, manage RAG-based writer models
- **Why This Model:** Excellent at identifying tone, voice, vocabulary patterns, and stylistic nuances
- **Usage:** When users upload training content to Writer Factory
- **Cost:** Included in Claude API usage

**Secondary Model (Optional):** OpenAI GPT-4o

- **API:** OpenAI API
- **Key Needed:** `OPENAI_API_KEY`
- **Purpose:** Embeddings generation for RAG vector search
- **Model:** `text-embedding-3-small`
- **Usage:** Converting training content to vector embeddings for similarity search
- **Cost:** ~$0.02 per 1M tokens

### 3. SEO Optimization Agent

**Primary Model:** Claude Sonnet 4 (Anthropic)

- **API:** Anthropic API
- **Key Needed:** Already covered by Claude key above
- **Purpose:** Analyze content for SEO, generate keyword suggestions, provide optimization recommendations
- **Why This Model:** Strong analytical capabilities, excellent at understanding search intent and keyword relationships
- **Usage:** SEO Package analysis, Auto-Optimize feature, SEO suggestions
- **Cost:** Included in Claude API usage

### 4. Content Quality Assurance/Editing Agent

**Primary Model:** Claude Sonnet 4 (Anthropic)

- **API:** Anthropic API
- **Key Needed:** Already covered by Claude key above
- **Purpose:** Review grammar, readability, tone consistency, fact-check content structure
- **Why This Model:** Excellent editing capabilities, catches nuanced errors, maintains voice
- **Usage:** Optional quality checks before publishing
- **Cost:** Included in Claude API usage

### 5. Persona & Tone Customization Agent

**Primary Model:** Claude Sonnet 4 (Anthropic)

- **API:** Anthropic API
- **Key Needed:** Already covered by Claude key above
- **Purpose:** Adapt content to specific voices, tones, and personas
- **Why This Model:** Industry-leading tone control and style adaptation
- **Usage:** When applying writer model styles to generated content
- **Cost:** Included in Claude API usage

### 6. Creative Feature Agents (Smart Odds Capture Orchestration)

**Primary Model:** Claude Sonnet 4 (Anthropic)

- **API:** Anthropic API
- **Key Needed:** Already covered by Claude key above
- **Purpose:** Coordinate between Visual Data Extraction and Content Generation for NFL odds articles
- **Why This Model:** Excellent at multi-step workflows and data transformation
- **Usage:** Smart Odds Capture workflow coordination
- **Cost:** Included in Claude API usage

### 7. Visual Data Extraction Agent

**Primary Model:** Claude Sonnet 4 with Vision API (Anthropic)

- **API:** Anthropic API (Vision-enabled)
- **Key Needed:** Already covered by Claude key above
- **Purpose:** Process screenshots to extract structured data (dates, odds, matchups, spreads, locations)
- **Why This Model:** Superior layout comprehension, accurate table reading, reliable data extraction from complex images
- **Usage:** Processing ESPN schedules and RotoWire odds screenshots for Smart Odds Capture
- **Cost:** ~$3 per 1M input tokens + image processing costs (~$0.48 per image)

**Fallback Model (Optional):** GPT-4o with Vision (OpenAI)

- **API:** OpenAI API
- **Key Needed:** `OPENAI_API_KEY` (if needed for validation/fallback)
- **Purpose:** Secondary verification of extracted data if needed
- **Usage:** Backup validation only
- **Cost:** ~$2.50 per 1M input tokens + image costs

---

## Summary of Required API Keys

### Essential (Must Have)

1. **Anthropic Claude API** - `CLAUDE_API_KEY` or `ANTHROPIC_API_KEY`
   - Powers 7 out of 7 agents
   - Single key for all core functionality
   - Estimated monthly cost: $10-$50 depending on usage (extremely cost-effective)

### Currently Used (Already Have)

1. **OpenAI API** - `OPENAI_API_KEY`
   - Currently used for embeddings (`text-embedding-3-small`)
   - Can continue this usage or migrate to Claude embeddings
   - Estimated monthly cost: $0.50-$2 for embeddings only

### Optional Enhancements

1. **Tavily API** - `TAVILY_API_KEY` (Already configured)
   - Powers NewsEngine feature
   - No changes needed

---

## Migration Path

### Current State

- Using Claude API exclusively for all AI tasks
- Single monolithic AI integration

### After Multi-Agent Transition

- Continue using Claude API (same key)
- Agents specialize but use the same underlying API
- No new vendor relationships required
- No new API keys required for core functionality
- Optional: Keep OpenAI for embeddings (already in use)

### Cost Impact

- **No significant cost increase**
- Better efficiency per agent may actually reduce costs
- More predictable usage patterns with specialized agents
- Ability to optimize per-agent to reduce unnecessary API calls

---

## Security & Compliance

- All API keys stored as encrypted environment variables in Vercel
- Never committed to code or version control
- Accessed only through secure server-side functions
- Row-level security on all database operations
- API keys rotatable without code changes
- Compliant with SOC 2 and GDPR standards (Anthropic is compliant)

---

## IT Department Action Items

### Pre-Implementation

1. **Verify existing Claude API key has Vision API access enabled**
   - Log into Anthropic Console
   - Confirm Claude Sonnet 4 model access
   - Confirm Vision API is enabled for image processing

2. **Confirm OpenAI API key is active** (for embeddings)
   - Verify `text-embedding-3-small` access
   - Check current usage/limits

3. **Review cost limits/budgets** on Anthropic dashboard
   - Set usage alerts if desired
   - Configure rate limits if needed

4. **Set up monitoring** for API usage and costs
   - Enable usage tracking in Anthropic Console
   - Set up cost alerts

### Implementation Benefits

- **No new vendor approvals needed** - using existing Anthropic relationship
- **Consolidated billing** - single provider for all AI features
- **Reduced complexity** - fewer API integrations to manage
- **Better performance** - specialized agents optimized for specific tasks
- **Cost efficiency** - pay only for what's used, optimize per agent

---

## Estimated Monthly Costs (Based on Actual Usage)

### Cost Per Article Breakdown

**Standard Article Generation:**

- Input tokens: ~5,000 tokens (brief + writer examples + prompts)
- Output tokens: ~2,000 tokens (800-word article)
- **Cost per article: $0.045** (4.5 cents)

**Smart Odds Capture (weekly):**

- Image processing: 2 screenshots × $0.48 = $0.96
- Content generation: ~$0.05
- **Cost per week: ~$1.00**

### Monthly Cost Estimates

#### Low Usage (10 articles/week = 40/month)

- Claude API (articles): 40 × $0.045 = $1.80
- Claude API (Smart Odds): 4 × $1.00 = $4.00
- OpenAI Embeddings: ~$0.50

**Total: $6-$7/month**

#### Medium Usage (50 articles/week = 200/month)

- Claude API (articles): 200 × $0.045 = $9.00
- Claude API (Smart Odds): 4 × $1.00 = $4.00
- OpenAI Embeddings: ~$1.00

**Total: $14-$15/month**

#### High Usage (100 articles/week = 400/month)

- Claude API (articles): 400 × $0.045 = $18.00
- Claude API (Smart Odds): 4 × $1.00 = $4.00
- OpenAI Embeddings: ~$2.00

**Total: $24-$25/month**

### Cost Impact Summary

- **Extraordinarily cheap:** Even high usage is under $30/month
- **Smart Odds Capture feature:** Adds only ~$4-5/month (1 article per week)
- **No significant budget impact:** Current costs likely similar or lower
- **Scalable:** Linear cost scaling with predictable pricing

---

## Risk Mitigation

### Technical Risks

- **Mitigation:** Comprehensive testing before production deployment
- **Rollback Plan:** Feature flag system allows instant rollback to single-model system

### Vendor Lock-in

- **Mitigation:** Agent abstraction layer allows swapping models without rewriting application code
- **Flexibility:** Can switch individual agents to different providers if needed

### Cost Overruns

- **Mitigation:** Usage monitoring, rate limiting, and cost alerts
- **Control:** Per-agent optimization reduces unnecessary API calls

---

## Timeline

### Phase 1 (Multi-Agent Transition)

2-3 weeks total:

- Week 1: Infrastructure and agent implementation
- Week 2: Migration and integration
- Week 3: Testing and validation

### Phase 2 (Smart Odds Capture)

1-2 weeks total:

- Week 1: Visual extraction and workflow
- Week 2: Export system and testing

### Total Implementation Time

3-5 weeks to full deployment

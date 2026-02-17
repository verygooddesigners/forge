# Forge - API Keys Request Document

**Date:** February 11, 2026  
**Prepared By:** Jeremy Botter  
**Project:** Forge - AI-Powered Content Management System

---

## Executive Summary

Forge requires API access to several third-party services to provide its AI-powered content generation, research, and optimization features. This document outlines all required API keys, their purposes, and estimated costs.

---

## Critical API Keys (Required for Core Functionality)

### 1. Anthropic Claude API Key

**Environment Variable:** `CLAUDE_API_KEY`

**Service Provider:** Anthropic  
**Website:** https://console.anthropic.com/

**Purpose:**
- Powers all 8 AI agents in the system
- Content generation with custom writer voices
- Style analysis and training
- SEO optimization
- Fact verification
- Visual data extraction (Claude Vision)
- Persona and tone adaptation
- Quality assurance

**Usage Level:** High - Primary AI engine for all content operations

**Estimated Cost:** Variable based on usage
- Claude Sonnet 4: ~$3 per million input tokens, ~$15 per million output tokens
- Typical article generation: $0.10-0.50 per article
- Estimated monthly: $200-1000+ depending on volume

**Priority:** 🔴 **CRITICAL** - System cannot function without this

---

### 2. Supabase API Keys (3 Keys Required)

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**Service Provider:** Supabase  
**Website:** https://supabase.com/

**Purpose:**
- PostgreSQL database (all data storage)
- User authentication and session management
- Row-level security
- Real-time subscriptions
- File storage

**Database Tables:**
- User accounts and profiles
- Content projects
- Writer models and training data
- SmartBrief templates
- Research data and trusted sources
- AI configuration settings
- API key management

**Usage Level:** High - Core infrastructure

**Estimated Cost:**
- Free tier: Up to 500MB database, 2GB bandwidth
- Pro tier: $25/month (recommended for production)
- Scales with database size and bandwidth

**Priority:** 🔴 **CRITICAL** - All data and authentication depends on this

---

## Important API Keys (Required for Key Features)

### 3. OpenAI API Key

**Environment Variable:** `OPENAI_API_KEY`

**Service Provider:** OpenAI  
**Website:** https://platform.openai.com/

**Purpose:**
- Text embeddings (text-embedding-3-small, 1536 dimensions)
  - Used for Writer Factory RAG (Retrieval-Augmented Generation)
  - Enables custom writer voice matching
- GPT-4o Vision (fallback for visual extraction)
  - NFL Odds Extractor screenshot processing

**Usage Level:** Medium - Used for Writer Factory training and visual fallback

**Estimated Cost:**
- Embeddings: ~$0.02 per million tokens (very cheap)
- GPT-4o Vision: ~$2.50-$10 per million tokens
- Estimated monthly: $50-200 depending on training volume

**Priority:** 🟡 **IMPORTANT** - Required for Writer Factory and visual extraction features

---

### 4. Tavily API Key

**Environment Variable:** `TAVILY_API_KEY`

**Service Provider:** Tavily AI  
**Website:** https://tavily.com/

**Purpose:**
- Real-time news search for Research Center
- Fact verification across multiple sources
- Source credibility analysis
- Research brief generation

**Usage Level:** Medium - Used for research and fact-checking features

**Estimated Cost:**
- Pricing varies by plan
- Estimated monthly: $50-150 depending on search volume

**Priority:** 🟡 **IMPORTANT** - Required for Research Center functionality

---

## Optional API Keys (Enhanced Features)

### 5. LanguageTool API Key

**Environment Variable:** `LANGUAGETOOL_API_KEY`

**Service Provider:** LanguageTool  
**Website:** https://languagetool.org/

**Purpose:**
- Grammar checking (Quality Assurance Agent)
- Spell checking
- Style suggestions
- Writing quality validation

**Usage Level:** Low-Medium - Used for quality assurance

**Estimated Cost:**
- Free tier: Works without API key (basic checking)
- Premium: ~$20-60/month (enhanced checking)

**Priority:** 🟢 **OPTIONAL** - Free tier sufficient initially, can upgrade later

---

## Configuration Variables (Not External APIs)

### 6. Beta Signup Token

**Environment Variable:** `BETA_SIGNUP_TOKEN`

**Type:** Internal secret token (company-generated)

**Purpose:**
- Controls access to signup page during beta phase
- Prevents unauthorized registrations
- Invite-only user onboarding

**Example Value:** `beta-rotowrite-2026` (any secure string)

**Cost:** Free - internally generated

**Priority:** 🔵 **CONFIGURATION** - Create when launching beta

---

### 7. Application URL

**Environment Variable:** `NEXT_PUBLIC_APP_URL`

**Type:** Configuration (company domain)

**Purpose:**
- Email verification links
- OAuth callback URLs
- Redirect handling
- Absolute URL generation

**Example Value:** `https://rotowrite.yourdomain.com`

**Cost:** Free - company domain

**Priority:** 🔵 **CONFIGURATION** - Set during deployment

---

### 8. Cursor Remote Agent Token (Development Only)

**Environment Variable:** `CURSOR_REMOTE_AGENT_TOKEN`

**Type:** Internal secret token (optional development tool)

**Purpose:**
- Remote Cursor AI agent development feature
- Development workflow optimization

**Cost:** Free - optional development tool

**Priority:** 🔵 **OPTIONAL** - Development convenience only

---

## Total Estimated Monthly Costs

### Minimum Configuration (Critical Only):
- Anthropic Claude: $200-1000/month
- Supabase Pro: $25/month
- **Subtotal: $225-1025/month**

### Recommended Configuration (Critical + Important):
- Anthropic Claude: $200-1000/month
- Supabase Pro: $25/month
- OpenAI: $50-200/month
- Tavily: $50-150/month
- **Subtotal: $325-1375/month**

### Full Configuration (All Services):
- Anthropic Claude: $200-1000/month
- Supabase Pro: $25/month
- OpenAI: $50-200/month
- Tavily: $50-150/month
- LanguageTool Premium: $20-60/month
- **Total: $345-1435/month**

*Note: Costs scale with usage. Higher volumes will increase costs proportionally.*

---

## Implementation Timeline

### Phase 1: Critical Setup (Week 1)
1. ✅ Anthropic Claude API Key
2. ✅ Supabase Keys (3)
3. ✅ Beta Signup Token (internal)
4. ✅ App URL Configuration

**Result:** Core system operational with content generation

### Phase 2: Feature Enhancement (Week 2)
5. ✅ OpenAI API Key
6. ✅ Tavily API Key

**Result:** Writer Factory and Research Center fully functional

### Phase 3: Quality Enhancement (Optional)
7. ⚪ LanguageTool API Key (can start with free tier)

**Result:** Enhanced grammar and quality checking

---

## Security Considerations

### API Key Storage:
- All keys stored in `.env.local` (development)
- Environment variables in production (Vercel/hosting platform)
- Never committed to version control
- Encrypted in Supabase for admin-managed keys

### Access Control:
- Service Role Key: Admin access only
- Anon Key: Public (safe for client-side)
- All other keys: Server-side only

### Key Rotation:
- Recommend quarterly rotation for security
- Document rotation procedures
- Test after rotation before full deployment

---

## Request Summary

**Immediate Action Required:**

Please provision the following API keys for the Forge production environment:

1. ✅ **Anthropic Claude API Key** (Critical)
2. ✅ **Supabase Account + 3 Keys** (Critical)
3. ✅ **OpenAI API Key** (Important)
4. ✅ **Tavily API Key** (Important)

**Optional/Later:**
5. ⚪ LanguageTool API Key (can use free tier initially)

**Estimated Monthly Budget:** $325-1375 depending on usage volume

---

## Contact Information

**Project Lead:** Jeremy Botter  
**Email:** jeremy.botter@gdcgroup.com  
**Project Repository:** [Internal Git Repository]

For questions about specific API requirements or cost optimization strategies, please contact the project lead.

---

**Document Version:** 1.0  
**Last Updated:** February 11, 2026

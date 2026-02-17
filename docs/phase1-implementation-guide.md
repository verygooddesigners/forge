# Forge Phase 1: Multi-Agent System Implementation Guide

## Overview

This document contains everything needed to implement the Multi-Agent System transition for Forge. Use this guide to start implementation in a new chat session.

**Goal:** Transition from single-AI-model architecture to a 7-agent system with specialized roles, guardrails, and an admin tuner interface.

**Important Rules:**
- Create a feature branch for all work
- Do not push to Vercel or GitHub unless explicitly instructed
- Ask questions one at a time if clarification is needed

---

## Phase 1 Scope

### What We're Building

1. **Agent Infrastructure** - 7 specialized AI agents with dedicated prompts and guardrails
2. **Agent Configuration System** - Database-backed config for each agent
3. **Admin Agent Tuner** - Tab-based UI for editing agent settings (super-admin only)
4. **API Route Updates** - Refactor existing routes to use agent system
5. **Multi-Model Support** - Claude primary + LanguageTool + GPT-4o Vision fallback

### What We're NOT Building (Phase 2)

- NFL Odds Extractor feature
- Export modal
- Image upload system
- Visual Data Extraction workflows

---

## Agent Definitions

### Agent #1: Content Generation Agent

**Purpose:** Generate articles based on briefs, keywords, and writer models

**Default Settings:**
- Model: `claude-sonnet-4-20250514`
- Temperature: `0.7`
- Max Tokens: `4000`

**Guardrails (CANNOT):**
- Modify SEO settings
- Train or update writer models
- Process images
- Edit existing content
- Access user management

**Capabilities (CAN):**
- Generate new content from prompts
- Follow brief structures
- Apply writer model context
- Format with headings, tables, lists
- Stream responses in real-time

---

### Agent #2: Writer Training Agent

**Purpose:** Analyze and train writer models from sample content

**Default Settings:**
- Model: `claude-sonnet-4-20250514` (analysis)
- Model: `text-embedding-3-small` (embeddings via OpenAI)
- Temperature: `0.3`
- Max Tokens: `2000`

**Guardrails (CANNOT):**
- Generate articles
- Modify SEO settings
- Process images
- Access other users' models

**Capabilities (CAN):**
- Analyze writing style from samples
- Extract tone, voice, vocabulary patterns
- Generate embeddings for RAG
- Update writer model metadata

---

### Agent #3: SEO Optimization Agent

**Purpose:** Analyze and optimize content for search engines

**Default Settings:**
- Model: `claude-sonnet-4-20250514`
- Temperature: `0.4`
- Max Tokens: `2000`

**Guardrails (CANNOT):**
- Generate new content
- Train writer models
- Process images
- Modify article structure beyond SEO

**Capabilities (CAN):**
- Calculate SEO scores
- Analyze keyword density
- Suggest heading structures
- Recommend internal links
- Generate keyword suggestions

---

### Agent #4: Quality Assurance Agent

**Purpose:** Review content for grammar, readability, and coherence

**Default Settings:**
- Model: `claude-sonnet-4-20250514` (substantive editing)
- Secondary: LanguageTool API (grammar/spelling)
- Temperature: `0.3`
- Max Tokens: `2000`

**Guardrails (CANNOT):**
- Generate new content
- Modify SEO settings
- Train writer models
- Make changes without approval

**Capabilities (CAN):**
- Check grammar and spelling (via LanguageTool)
- Assess readability scores
- Flag inconsistencies
- Suggest corrections
- Verify fact structure

**Special Config:**
- `useLanguageTool`: boolean (default: true)
- `languageToolStrictness`: 'casual' | 'standard' | 'formal' (default: 'standard')

---

### Agent #5: Persona & Tone Agent

**Purpose:** Adapt content to specific voices and tones

**Default Settings:**
- Model: `claude-sonnet-4-20250514`
- Temperature: `0.5`
- Max Tokens: `2000`

**Guardrails (CANNOT):**
- Generate new content from scratch
- Modify SEO settings
- Train new writer models
- Change content structure

**Capabilities (CAN):**
- Adjust tone of existing content
- Match voice to writer model
- Ensure style consistency
- Refine language choices

---

### Agent #6: Creative Features Agent

**Purpose:** Orchestrate specialized workflows

**Default Settings:**
- Model: `claude-sonnet-4-20250514`
- Temperature: `0.6`
- Max Tokens: `3000`

**Guardrails (CANNOT):**
- Directly modify database
- Bypass other agents
- Skip extraction validation
- Access admin functions

**Capabilities (CAN):**
- Coordinate multi-agent workflows
- Transform structured data
- Route to appropriate agents
- Manage workflow state

---

### Agent #7: Visual Data Extraction Agent

**Purpose:** Extract structured data from images (Phase 2 feature, but infrastructure built now)

**Default Settings:**
- Model: `claude-sonnet-4-20250514` (primary)
- Fallback: `gpt-4o` (OpenAI Vision)
- Temperature: `0.2`
- Max Tokens: `4000`

**Guardrails (CANNOT):**
- Generate content
- Modify database directly
- Access non-image data
- Make editorial decisions

**Capabilities (CAN):**
- Process screenshots
- Extract text from images
- Parse tables and structures
- Output validated JSON

**Special Config:**
- `enableFallback`: boolean (default: true)
- `confidenceThreshold`: number (default: 0.85)
- `fallbackTrigger`: 'lowConfidence' | 'denseText' | 'both' (default: 'both')

---

## File Structure to Create

```
lib/
├── agents/
│   ├── index.ts                    # Agent exports and coordinator
│   ├── types.ts                    # TypeScript interfaces
│   ├── config.ts                   # Default configurations
│   ├── prompts/
│   │   ├── content-generation.ts   # Agent #1 system prompt
│   │   ├── writer-training.ts      # Agent #2 system prompt
│   │   ├── seo-optimization.ts     # Agent #3 system prompt
│   │   ├── quality-assurance.ts    # Agent #4 system prompt
│   │   ├── persona-tone.ts         # Agent #5 system prompt
│   │   ├── creative-features.ts    # Agent #6 system prompt
│   │   └── visual-extraction.ts    # Agent #7 system prompt
│   ├── content-generation.ts       # Agent #1 implementation
│   ├── writer-training.ts          # Agent #2 implementation
│   ├── seo-optimization.ts         # Agent #3 implementation
│   ├── quality-assurance.ts        # Agent #4 implementation
│   ├── persona-tone.ts             # Agent #5 implementation
│   ├── creative-features.ts        # Agent #6 implementation
│   └── visual-extraction.ts        # Agent #7 implementation
├── languagetool.ts                 # LanguageTool API integration

components/
├── admin/
│   └── AgentTuner.tsx              # New: Agent configuration UI

app/
├── api/
│   └── admin/
│       └── agents/
│           ├── route.ts            # GET/PUT agent configs
│           └── [agentKey]/
│               └── route.ts        # Individual agent config

supabase/
├── migrations/
│   └── 00005_agent_configs.sql     # New table for agent configs
```

---

## Database Migration

### New Table: `agent_configs`

```sql
-- Migration: 00005_agent_configs.sql

CREATE TABLE public.agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4000,
  model TEXT DEFAULT 'claude-sonnet-4-20250514',
  enabled BOOLEAN DEFAULT true,
  guardrails JSONB DEFAULT '[]'::jsonb,
  special_config JSONB DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default agent configs
INSERT INTO public.agent_configs (agent_key, display_name, description, system_prompt, temperature, max_tokens, guardrails) VALUES
('content_generation', 'Content Generation', 'Generates articles based on briefs and keywords', '[SYSTEM_PROMPT_HERE]', 0.7, 4000, '["cannot_modify_seo", "cannot_train_models", "cannot_process_images"]'),
('writer_training', 'Writer Training', 'Analyzes writing samples and trains writer models', '[SYSTEM_PROMPT_HERE]', 0.3, 2000, '["cannot_generate_articles", "cannot_modify_seo", "cannot_process_images"]'),
('seo_optimization', 'SEO Optimization', 'Analyzes and optimizes content for search engines', '[SYSTEM_PROMPT_HERE]', 0.4, 2000, '["cannot_generate_content", "cannot_train_models", "cannot_process_images"]'),
('quality_assurance', 'Quality Assurance', 'Reviews content for grammar and readability', '[SYSTEM_PROMPT_HERE]', 0.3, 2000, '["cannot_generate_content", "cannot_modify_seo", "cannot_train_models"]'),
('persona_tone', 'Persona & Tone', 'Adapts content to specific voices and tones', '[SYSTEM_PROMPT_HERE]', 0.5, 2000, '["cannot_generate_from_scratch", "cannot_modify_seo", "cannot_train_models"]'),
('creative_features', 'Creative Features', 'Orchestrates specialized workflows', '[SYSTEM_PROMPT_HERE]', 0.6, 3000, '["cannot_modify_database", "cannot_bypass_agents", "cannot_access_admin"]'),
('visual_extraction', 'Visual Extraction', 'Extracts structured data from images', '[SYSTEM_PROMPT_HERE]', 0.2, 4000, '["cannot_generate_content", "cannot_modify_database", "cannot_make_editorial_decisions"]');

-- Add RLS policy (super admin only can edit)
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage agent configs" ON public.agent_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.email = 'jeremy.botter@gmail.com'
    )
  );

CREATE POLICY "All authenticated users can read agent configs" ON public.agent_configs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_agent_configs_updated_at
  BEFORE UPDATE ON public.agent_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Admin Agent Tuner UI

### Design: Tab-Based Interface

Location: `/app/admin/page.tsx` (add new tab to existing admin dashboard)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ AI Agent Configuration                                       │
├─────────────────────────────────────────────────────────────┤
│ [Content] [Writer] [SEO] [QA] [Persona] [Creative] [Visual] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Agent: Content Generation                       [Enabled ✓] │
│                                                              │
│  System Instructions:                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ (Large textarea with agent's system prompt)          │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Temperature:        [====●=====] 0.7                       │
│  Max Tokens:         [========●=] 4000                      │
│  Model:              [Claude Sonnet 4 ▼] (locked)           │
│                                                              │
│  Guardrails:                                                │
│  ☑ Cannot modify SEO settings                               │
│  ☑ Cannot train writer models                               │
│  ☑ Cannot process images                                    │
│                                                              │
│                              [Reset to Default] [Save]       │
└─────────────────────────────────────────────────────────────┘
```

**Access Control:**
- Only super admin (jeremy.botter@gmail.com) can see/edit this section
- Hide the "AI Agent Configuration" tab for other admins
- RLS policy enforces this at database level

**Features:**
- Tab for each agent (7 tabs)
- Large textarea for system prompt
- Temperature slider (0.0 - 1.0)
- Max tokens slider (500 - 8000)
- Model dropdown (locked to supported models)
- Enable/disable toggle
- Guardrails checkboxes
- "Reset to Default" button
- "Save" button with success toast

**Special Agent UI:**

Agent #4 (Quality Assurance) - Extra settings:
- Toggle: "Use LanguageTool for grammar checking"
- Dropdown: LanguageTool strictness (Casual / Standard / Formal)

Agent #7 (Visual Extraction) - Extra settings:
- Toggle: "Enable GPT-4o fallback"
- Slider: Confidence threshold (0.5 - 1.0)
- Dropdown: Fallback trigger (Low confidence / Dense text / Both)

---

## TypeScript Types

### `lib/agents/types.ts`

```typescript
export type AgentKey = 
  | 'content_generation'
  | 'writer_training'
  | 'seo_optimization'
  | 'quality_assurance'
  | 'persona_tone'
  | 'creative_features'
  | 'visual_extraction';

export interface AgentConfig {
  id: string;
  agentKey: AgentKey;
  displayName: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
  enabled: boolean;
  guardrails: string[];
  specialConfig: Record<string, any>;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | AgentMessageContent[];
}

export interface AgentMessageContent {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

export interface AgentResponse {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    agentKey?: AgentKey;
  };
}

export interface QualityAssuranceSpecialConfig {
  useLanguageTool: boolean;
  languageToolStrictness: 'casual' | 'standard' | 'formal';
}

export interface VisualExtractionSpecialConfig {
  enableFallback: boolean;
  confidenceThreshold: number;
  fallbackTrigger: 'lowConfidence' | 'denseText' | 'both';
}
```

---

## API Keys Required

| Key | Environment Variable | Provider | Purpose |
|-----|---------------------|----------|---------|
| Claude API | `CLAUDE_API_KEY` | Anthropic | Primary model for all agents |
| OpenAI API | `OPENAI_API_KEY` | OpenAI | Embeddings + GPT-4o Vision fallback |
| LanguageTool | `LANGUAGETOOL_API_KEY` | LanguageTool | Grammar checking (optional, free tier works without key) |
| Tavily | `TAVILY_API_KEY` | Tavily | NewsEngine (existing) |

---

## Implementation Order

### Step 1: Create Feature Branch
```bash
git checkout -b feature/multi-agent-system
```

### Step 2: Database Migration
- Create `supabase/migrations/00005_agent_configs.sql`
- Run migration locally
- Seed default agent configurations

### Step 3: Agent Infrastructure
1. Create `lib/agents/types.ts`
2. Create `lib/agents/config.ts` (default configs)
3. Create `lib/agents/prompts/` directory with all 7 prompt files
4. Create `lib/agents/index.ts` (coordinator)

### Step 4: Agent Implementations
1. Create each agent file in `lib/agents/`
2. Implement `lib/languagetool.ts` for Agent #4
3. Add GPT-4o Vision fallback logic for Agent #7

### Step 5: API Routes
1. Create `/api/admin/agents/route.ts` (list all configs)
2. Create `/api/admin/agents/[agentKey]/route.ts` (CRUD individual config)
3. Add super-admin check middleware

### Step 6: Admin UI
1. Create `components/admin/AgentTuner.tsx`
2. Add "AI Agents" tab to admin dashboard
3. Implement tab interface with all settings
4. Add save/reset functionality
5. Hide from non-super-admins

### Step 7: Refactor Existing Routes
1. Update `/api/generate/route.ts` to use Content Generation Agent
2. Update `/api/writer-models/train/route.ts` to use Writer Training Agent
3. Update all SEO routes to use SEO Optimization Agent
4. Test all existing functionality still works

### Step 8: Testing
1. Test each agent individually
2. Test agent coordination
3. Test admin UI save/load
4. Test reset to defaults
5. Verify non-super-admins can't access agent tuner

---

## Default System Prompts

### Content Generation Agent
```
You are the Content Generation Agent for Forge.

## YOUR ROLE
Generate high-quality, SEO-optimized articles based on:
- User briefs and templates
- Primary and secondary keywords
- Writer model context (style samples)
- Target word count

## YOUR CAPABILITIES
- Generate complete articles with proper heading structure (H2, H3)
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
- Make up statistics or data not provided

## OUTPUT FORMAT
Output content in clean HTML suitable for TipTap editor:
- Use <h2> and <h3> for headings (never <h1>)
- Use <p> for paragraphs
- Use <ul>/<ol> with <li> for lists
- Use <table> for tabular data
- Use <strong> for bold, <em> for italic
```

(Full prompts for all 7 agents should be created during implementation based on the guardrails and capabilities defined above)

---

## Testing Checklist

### Agent Infrastructure
- [ ] All 7 agent files created and export correctly
- [ ] Agent configs load from database
- [ ] Fallback to default configs if database empty
- [ ] Temperature and max tokens respected

### Admin UI
- [ ] Tab interface renders all 7 agents
- [ ] System prompt textarea saves correctly
- [ ] Sliders update values in real-time
- [ ] Enable/disable toggle works
- [ ] Guardrails checkboxes save correctly
- [ ] Special config (QA, Visual) sections appear only for those agents
- [ ] Reset to Default restores original values
- [ ] Save button shows success toast
- [ ] Only super-admin can access (others see nothing)

### Existing Features
- [ ] Content generation still works
- [ ] Writer model training still works
- [ ] SEO analysis still works
- [ ] Auto-optimize still works
- [ ] News search still works
- [ ] All dashboard features functional

---

## Notes for Implementation

1. **Super Admin Check:** Use email `jeremy.botter@gmail.com` for super-admin verification
2. **Feature Branch:** All work on `feature/multi-agent-system` branch
3. **No Deploys:** Do not push to Vercel/GitHub until explicitly instructed
4. **Questions:** Ask one at a time if clarification needed
5. **Backward Compatibility:** All existing features must continue working

---

## Related Documentation

- `docs/multi-model-transition.md` - Agent architecture overview
- `docs/api-key-setup-guide.md` - API key configuration
- `docs/ai-models-api-requirements.md` - Model costs and requirements
- `docs/nfl-odds-extractor-feature.md` - Phase 2 feature (not in this phase)
- `docs/max-feature-user-story.md` - NFL Odds user story (Phase 2)

---

## Quick Start Command

When starting a new chat, say:

> "I want to implement Phase 1 of the Forge multi-agent system. Please read `docs/phase1-implementation-guide.md` for the complete implementation guide, then start by creating the feature branch."


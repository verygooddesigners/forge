# TASKS

## Active Tasks

[DONE] 1. Fix Writer Model Training: Cannot add new training stories to any models - getting "Error: Failed to Add Training Story" error
[DONE] 2. Fix Writer Factory badge display bug: When clicking Blake Weishaar's model (2/25 stories), all models show 2/25. Clicking different model makes them all show 0/25
[PENDING] 3. Add URL-based training story extraction: Allow pasting URL to a story and have AI extract the text instead of copy/paste (UI added, extraction logic needs debugging)
[DONE] 4. Add Suggested Keywords section to SEO Wizard with color-coded labels (green=important, orange=good idea, red=avoid)
[DONE] 5. Optimize SEO Wizard heading targets based on word count (e.g., 470 word story shouldn't require 5-18 headings)

---

## Architectural Refinements (Future Improvements)

### 1. Add Prompt Versioning in Database
- Create `prompt_templates` table in Supabase
- Store prompts with versioning (v1, v2, etc.)
- Add UI in Admin panel to edit/test prompts
- Allow A/B testing different prompt versions
- Benefits: Non-technical users can improve prompts, test variations without code deploys

### 2. Consider Model Context Protocol (MCP)
- Research Anthropic's MCP for production readiness
- If available, explore letting Claude directly access training data
- Potential integration with Supabase for direct data access
- Benefits: Could eliminate RAG layer, more direct AI-data integration

### Notes on Architecture
- Current architecture is sound for current scale
- Keep monolithic Next.js structure (no microservices needed yet)
- Only consider microservices if: hitting scale issues, team growth, multi-tenant needs, or specific language requirements
- Use Claude Console/Workbench for prompt testing and experimentation, but keep implementation in Next.js

---

## Archive

### SmartBrief AI Configuration & URL Analysis (Completed Jan 2026)
On the Brief Builder, when creating a new brief, we need to add a new text input box that will be used like an AI prompt. The user building the brief will be able to write out, in detail, what kind of story the brief is, what the tone is, what kind of information should be contained in the content generated for that type of brief. And there should also be a box where the user can paste multiple URLS linking to that type of story.

**Implementation:**
- Added AI Configuration tab to Brief Builder
- AI Instructions textarea for describing brief context
- Example URLs textarea (one per line)
- Analyze Example URLs button powered by Content Generation Agent
- AI analyzes structure, tone, key info types, formatting, SEO patterns
- Analysis stored in seo_config JSONB field
- Guides AI team during content generation

### Project List Modal (Completed Jan 2026)
When I click Open Project on the Dashboard, it brings up the New Project modal. It should bring up a modal listing all saved projects, allowing me to click one to open it.

**Implementation:**
- Created ProjectListModal component
- Shows all user projects in searchable grid layout
- Search by headline, keyword, or topic
- Displays word count and last updated date
- Separated New Project and Open Project actions
- Fixed button handlers in DashboardLayout and EditorPanel

### Bug Fixes (Completed Jan 2026)
- Add pop-up modal window that appears during Export process that warns the user that they cannot just copy and paste the generated text directly into the Rotowire CMS and publish it. They have to read it and fact check it.
- On the initial modal window that appears, text is still going outside of the card/buttons
- Word count is not being passed from setup into the SEO Wizard
- When a suggested keyword is used in the Editor, the card for that suggested keyword is not updated with the number of times the keyword is used

### Extract Prompts to Configuration (Completed Jan 2026)
- Create `lib/prompts.ts` to store all prompt templates
- Move hardcoded prompts from functions into centralized config
- Updated `lib/ai.ts` and `lib/rag.ts` to use prompt config
- Benefits: Easier to update prompts without digging through code

### Create Dedicated SEO Module (Completed Jan 2026)
- Build `lib/seo-engine.ts` as a comprehensive SEO class
- Consolidate all SEO logic: analysis, suggestions, auto-optimize, competitor analysis
- Replace scattered SEO functions with unified SEO engine
- Update all API routes to use SEO Engine
- Maintain backward compatibility with `lib/seo.ts` re-exports
- Benefits: Better organization, easier testing, more maintainable

**New SEO Engine Features:**
- Real-time keyword tracking (primary, secondary, suggested)
- Comprehensive content metrics extraction
- AI-powered suggestions with proper prompts
- Auto-optimization capabilities
- Internal linking suggestions
- Competitor analysis support
- TipTap to HTML conversion built-in

### NFL Odds Extractor Phase 2 (Completed Jan 2026)
- Created API route using Visual Extraction Agent
- Built image upload modal for ESPN schedule and RotoWire odds
- Integrated with dashboard navigation
- Auto-generates structured articles with matchup tables
- Creates projects with extracted content
- Benefits: Saves 25+ minutes per week, eliminates transcription errors

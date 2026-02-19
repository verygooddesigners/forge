# Tasks to Complete

Generated from Spark on 2/18/2026, 8:00:54 PM

Project: Forge
Status: in_development
Tech Stack: ai: Grok API (Claude-ready), ui: Shadcn UI, auth: Supabase Auth, editor: TipTap, styling: Tailwind CSS, database: Supabase PostgreSQL + pgvector, language: TypeScript, framework: Next.js 16, workspace: GDC, deployment: Vercel

---

## Incomplete Tasks (9 total)

### 1. Make research cards fully clickable to select

**Priority:** medium
**Status:** to_do
**Feature Area:** Research
**Created:** 2/17/2026
**ID:** 787d7718-5f15-4650-a743-3eda3306c8ff

On the Research Results screen, need to be able to click anywhere on a card to select it. Currently only the checkbox is clickable. The selected cards are the ones that are used as research for the article.

---

### 2. Remove the NFL Odds Extractor link from the Tools menu

**Priority:** medium
**Status:** to_do
**Feature Area:** Menu
**Created:** 2/18/2026
**ID:** 4f371084-8cb9-458b-a412-2015270efe5d

Remove the NFL Odds Extractor link from the Tools menu, and move the Writer Factory link up underneath the SmartBriefs link.

---

### 3. User Profile Editing

**Priority:** medium
**Status:** to_do
**Feature Area:** General
**Created:** 2/18/2026
**ID:** b0c3d15f-229c-42e3-8046-4749adf2458d

Right now, nothing happens when you click on the bottom left element where it says your user name. 

What should happen: 

A small pop-up menu should extend upwards with these links:

- Profile
- Settings

The Dark/Light mode toggle switch needs to be in there, too. 

Create that menu, and then create the Profile and Settings screens as well. 

# PROFILE SCREEN

- Should display the user information, including a photo. 
- Includes an Edit button so the user can edit their profile.
- Profile fields include: Full Name, Email Address, Job Title, Photo

# SETTINGS

The only thing in settings right now should be a link for the user to train their writer model - and only THEIR writer model.

---

### 4. Add Edit/Delete icons to All Projects screen

**Priority:** medium
**Status:** to_do
**Feature Area:** UI
**Created:** 2/18/2026
**ID:** bfb31574-a982-4ea8-9e9f-675269fb06a2

Add Edit/Delete icons to All Projects screen so that they can quickly be opened or edited.

---

### 5. Update SmartBrief User Guide

**Priority:** low
**Status:** to_do
**Feature Area:** Documentation
**Created:** 2/18/2026
**ID:** 80e8f315-4dcb-4812-82f2-741388a7b667

Update the SmartBrief User Guide to include all new features build, including Twigs.

---

### 6. Debug URL extraction in Writer Factory

**Priority:** high
**Status:** to_do
**Feature Area:** Writer Factory
**Created:** 2/17/2026
**ID:** 43c9c672-8739-42e7-beab-f1cbfbc036de

UI is complete for URL extraction in Writer Factory, but the extraction logic needs fixing. Users should be able to paste URLs to articles and have the content extracted for training.

---

### 7. Test Research Story workflow end-to-end

**Priority:** high
**Status:** to_do
**Feature Area:** Research
**Created:** 2/17/2026
**ID:** bda09eb6-d156-49b1-801f-13b11fff64a6

Comprehensive testing of the Research Story feature workflow from start to finish. Verify all steps work correctly: research, fact verification, content generation, and export.

---

### 8. Create SmartBriefs Twigs System

**Priority:** high
**Status:** to_do
**Feature Area:** Twigs
**Created:** 2/17/2026
**ID:** 474215e3-173b-4e09-b433-9c217c1d10f0

Create a system of code twigs. Use the following twigs.

SPORTSBOOK AND BRAND
{sportsbook.name}           → DraftKings
{sportsbook.short_name}     → DK
{sportsbook.url}            → draftkings.com
{sportsbook.promo_url}      → draftkings.com/r/promo
{sportsbook.app_name}       → DraftKings Sportsbook App
{sportsbook.parent_company} → DraftKings Inc.

GEOGRAPHY
{state.name}                → Michigan
{state.initials}            → MI
{state.city}                → Detroit
{state.region}              → Midwest
{state.legalization_date}   → January 22, 2021
{state.regulatory_body}     → Michigan Gaming Control Board
{state.regulator_abbr}      → MGCB

OFFER/PROMOTION
{offer.type}                → Bet $5, Get $150
{offer.amount}              → $150
{offer.min_deposit}         → $5
{offer.min_bet}             → $5
{offer.bonus_type}          → Bonus Bets
{offer.expiry_days}         → 7
{offer.promo_code}          → FORGEBET
{offer.terms_url}           → draftkings.com/terms
{offer.odds_requirement}    → -500 or better

SPORTS AND GAMES
{sport.name}                → NFL
{sport.season}              → 2025-26
{sport.season_phase}        → Playoffs
{team.name}                 → Detroit Lions
{team.short_name}           → Lions
{team.city}                 → Detroit
{team.mascot}               → Lions
{team.record}               → 14-3
{team.opponent}             → Green Bay Packers
{player.name}               → Jared Goff
{player.position}           → QB
{player.team}               → Detroit Lions
{game.date}                 → Sunday, February 22
{game.time}                 → 4:30 PM ET
{game.venue}                → Ford Field
{game.spread}               → Lions -3.5
{game.total}                → 47.5
{game.moneyline}            → -175

DATE AND TIME
{date.today}                → February 18, 2026
{date.today_short}          → Feb. 18, 2026
{date.month}                → February
{date.month_short}          → Feb.
{date.year}                 → 2026
{date.day_of_week}          → Wednesday
{date.quarter}              → Q1

AUTHOR/PUBLICATION
{author.name}               → Jeremy Botter
{author.byline}             → By Jeremy Botter
{author.title}              → Senior Writer
{publication.name}          → Forge
{publication.url}           → forgecontent.com
{publication.tagline}       → Your tagline here

CONTENT METADATA
{content.title}             → Best DraftKings Michigan Promo Code
{content.type}              → Review
{content.word_count}        → 1,200
{content.reading_time}      → 5 min read
{content.target_keyword}    → DraftKings Michigan promo code
{content.secondary_keyword} → DraftKings bonus bets
{content.slug}              → draftkings-michigan-promo-code
{content.meta_description}  → [auto-generated from SmartBrief]
{content.tone}              → Conversational

SEO/RATINGS
{rating.overall}            → 4.8/5
{rating.score}              → 4.8
{rating.stars}              → ★★★★★
{ranking.position}          → #1
{ranking.category}          → Best Michigan Sportsbooks

These can be used inside both the Editor and SmartBrief creation. 

When content is generated, the twigs are replaced with the information collected during the setup wizard and information related to the story subject. 

## Add a Twig Inserter button into the SmartBrief Editor toolbar and the Content Editor toolbar. Click it, and a sub-menu opens up with all twigs, divided by category as listed above. A search box is at the top of that sub-menu, and the twigs are filtered as the user searches in that box.

---

### 9. Make the Open SmartBriefs modal much larger

**Priority:** high
**Status:** to_do
**Feature Area:** UI, SmartBriefs
**Created:** 2/18/2026
**ID:** b57c1611-482e-4ea5-b353-45bd1ce143be

The Open SmartBriefs modal should be large enough to display all Smartbrief cards and their content without cutting anything off.

---


## Instructions for Claude Code

**CRITICAL**: After completing each task, you MUST call the MCP tool **mcp__spark__spark_update_task** to mark it done in Spark.

### How to Mark Tasks Complete

After finishing a task, call the MCP tool **mcp__spark__spark_update_task** with these parameters:
- task_id: the task ID from above
- updates: {"status": "done"}

For example, to mark task #1 as done, call mcp__spark__spark_update_task with:
- task_id: "787d7718-5f15-4650-a743-3eda3306c8ff"
- updates: {"status": "done"}

This is an MCP tool call — invoke it directly, do NOT just write it in a comment or code block. The Spark UI polls and updates automatically.

Work through all tasks systematically. Mark each one done as you complete it.

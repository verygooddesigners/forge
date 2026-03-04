# Forge AI Helper — Platform Knowledge Base

This document is the primary knowledge source for the Forge AI Helper Bot. It covers what Forge is, all major features, user roles, the AI agent system, and how to use the platform.

---

## What Is Forge?

Forge is an AI-powered content creation platform built specifically for sports betting and gaming content production at GDC Group / RotoWire. It combines specialized writer modeling, SEO optimization, and intelligent workflow management into one purpose-built application. The goal is to let content strategists produce high-quality, SEO-optimized articles that maintain authentic writer voice — in minutes instead of hours.

Forge is currently in **Beta**. Users access it at https://forge.gdcgroup.com.

---

## The Three Core Pillars

Every piece of content in Forge is shaped by three things working together:

1. **Writer Model** — A personal AI model trained on your own articles. It ensures generated content sounds like you, not a generic AI.
2. **SmartBrief** — A reusable content template that defines structure, required sections, formatting rules, and tone guidance.
3. **SEO Package** — A set of SEO data attached to each project: headline, primary keyword, secondary keywords, and topic. This drives keyword optimization throughout the workflow.

---

## Key Features

### Writer Factory
The Writer Factory is where you train your personal AI writer model. You paste in samples of your own writing — past articles, blog posts, anything in your voice — and the AI analyzes tone, vocabulary, sentence structure, and stylistic patterns. These are stored as vector embeddings. When generating new content, the system retrieves your most relevant writing samples and instructs the AI to match your specific voice. The more training content you add, the more accurate your writer model becomes.

**How to use it:**
- Navigate to Writer Factory in the sidebar
- Click "Add Training Content"
- Paste in an article you've written (or upload it)
- Add a title and click Train
- Repeat with multiple articles for best results
- Your writer model is then available when creating projects

### SmartBrief Builder
SmartBriefs are intelligent content templates. Unlike a simple outline, a SmartBrief can include AI-powered context: you write detailed instructions about the content type, paste URLs to example articles, and the AI analyzes those examples to understand structure, formatting patterns, and style. This learned context is stored with the brief and used during content generation.

**How to use it:**
- Navigate to SmartBriefs in the sidebar
- Click "New Brief"
- Give it a name and write your instructions
- Optionally add example article URLs — the AI will analyze them
- Save the brief
- Select it when creating a new project

### Creating a Project
A project is one article or piece of content. Creating a project sets up your SEO Package and content workspace.

**Steps:**
1. Click "New Project" from the dashboard or Projects page
2. Enter the headline (article title)
3. Add your primary keyword and any secondary keywords
4. Optionally add a topic/angle
5. Select your Writer Model
6. Select a SmartBrief template
7. Click Create

Once created, you land in the project editor where you can run the NewsEngine, generate content, and edit.

### NewsEngine
The NewsEngine (powered by Tavily AI) automatically discovers relevant, recent news articles based on your project's keywords and topic. It surfaces sources you can use for research without any manual searching.

**How to use it:** Inside a project, click "Find News" or the NewsEngine button. It runs a search based on your SEO Package keywords and returns recent relevant articles with summaries.

### Content Generation
Once your project is set up with a writer model and brief, you can generate a full article draft with one click. The Content Generation Agent uses your SEO Package, SmartBrief structure, writer model context, and any news sources you've selected to produce a complete article.

**Steps:**
1. Inside a project, click "Generate Content" or "Generate Article"
2. The AI streams the article in real time into the editor
3. Review and edit as needed

### The TipTap Editor
All editing happens in Forge's rich text editor (built on TipTap). It supports headings, bold, italic, lists, tables, and more. The SEO Wizard panel runs alongside the editor, updating in real time as you type.

### SEO Wizard
The SEO Wizard is a real-time sidebar panel that analyzes your content for SEO quality as you write. It shows:
- Keyword density for primary and secondary keywords
- Readability score
- Heading structure analysis
- Word count
- Content length guidance
- Actionable suggestions to improve ranking potential

Clicking a keyword suggestion in the SEO Wizard automatically adds it to your SEO Package.

### SEO Assistant (Auto-Optimize)
The SEO Assistant can analyze your full article and suggest improvements to keyword placement, heading structure, and content depth. It's separate from the real-time SEO Wizard — it's a one-click deep analysis.

### Exporting Content
When your article is ready, Forge exports it in CMS-ready formats. The export system includes safety warnings for common formatting issues that could cause problems when pasting into a CMS.

**How to export:** Click the Export button in the top-right of the project editor. Select your preferred format and copy.

### Research Pipeline & Fact Verification
The Research Orchestrator Agent coordinates multi-step research tasks. It can gather information from multiple sources and pass it to the Fact Verification Agent, which cross-checks claims in your content. This is accessible from within the project editor.

---

## The 8-Agent AI System

Forge uses 8 specialized AI agents. Each agent has a specific role and guardrails — it can only do its job, nothing else. Admins can tune each agent's behavior in the Admin Panel.

| # | Agent | Role |
|---|-------|------|
| 1 | **Content Generation Agent** | Writes articles from briefs, keywords, and writer models. Streams output in real time. |
| 2 | **Writer Training Agent** | Analyzes writing samples and generates vector embeddings for RAG. Runs at temperature 0.3 for precision. |
| 3 | **SEO Optimization Agent** | Calculates SEO scores, analyzes keyword density, suggests headings and internal links. |
| 4 | **Quality Assurance Agent** | Checks grammar and spelling (via LanguageTool), assesses readability, flags inconsistencies. |
| 5 | **Persona & Tone Agent** | Adjusts tone and style of existing content to match a writer model or target voice. |
| 6 | **Creative Features Agent** (Research Orchestrator) | Coordinates multi-agent workflows, orchestrates research pipelines, routes tasks. |
| 7 | **Visual Data Extraction Agent** | Extracts structured data from screenshots and images. Uses Claude Vision primary, GPT-4o Vision as fallback. |
| 8 | **AI Helper Bot** (this bot) | Answers user questions about Forge, helps troubleshoot, and explains features. |

Agent settings (system prompt, temperature, max tokens, enabled/disabled) can be configured in **Admin → AI Agents**.

---

## User Roles & Permissions

### Super Administrator
- Only one person holds this role: jeremy.botter@gdcgroup.com
- Full access to everything, including Master AI tuning controls
- Can install and deploy Forge Tools (plugins)
- Controls the plugin marketplace

### Administrator
- Can access the full Admin Panel for their department only
- Each department is siloed — changes don't affect other departments
- Can manage: Users, AI Tuner, AI Helper Bot configuration, AI Agents, Trusted Sources

### Manager
- Department leaders
- Has elevated permissions within their department
- Can access Admin features scoped to their team

### Editor
- Team leaders within a department
- Can configure AI Agents and AI Helper Bot Q&A for their team
- Can manage users within their scope

### Content Creator
- Primary users of Forge for content production
- Can create, edit, and delete their own Projects
- Can train their own Writer Model
- Can use authorized Tools

### Developer (Add-on)
- An add-on role that can be enabled for any user by an Admin
- Allows uploading new Tools (plugins) to the marketplace
- Access to Developer documentation
- Off by default

---

## Admin Panel

The Admin Panel is accessible from the sidebar for users with Admin or above permissions. Key sections:

- **User Management** — Add/remove users, assign roles, manage accounts
- **AI Tuner** — Configure the AI Helper Bot: system prompt, temperature, model, max tokens, web search on/off
- **AI Helper Bot Configuration** — Manage the Q&A knowledge base entries that the bot uses for answers
- **AI Agents** — Configure each of the 8 agents: system prompts, temperature, guardrails
- **Trusted Sources** — Manage approved source domains for the NewsEngine

---

## Bug Tracker

The Bug Tracker is accessible from the sidebar under `/bugs` or via the Bug Report button in the Beta Toolbar at the top of every page.

- **Report a Bug**: Click "Bug Report" in the Beta Toolbar (top right) to open the bug report modal. Fill in a summary, describe the issue, and optionally attach a screenshot.
- **View the Tracker**: Click the bug icon (purple square) in the Beta Toolbar, or go to `/bugs` in the sidebar. This shows all active bug reports.
- Each bug has a detail view with description, severity, status, screenshot, admin notes, and comments.
- Users can add comments to any bug.
- Admins can change bug status (New, Under Review, In Progress, Completed, Won't Fix), add internal notes, archive, or delete bugs.
- Bugs also have shareable URLs (e.g. `/bugs/[id]`).

---

## Beta Toolbar

The Beta Toolbar appears at the top right of every page while Forge is in Beta. It shows:
- Current version number (e.g. BETA v1.11.11)
- Last updated date
- **Suggest/Feedback** button — submit feature ideas or general feedback
- **Bug Report** button — open the bug submission modal
- **Bug Tracker icon** — navigate to the full bug tracker at `/bugs`
- **Beta Notes** icon (scroll) — view the current beta release notes (if available)
- Collapse/expand toggle

---

## Common Questions

**How do I get started?**
First, create a Writer Model by going to Writer Factory and adding training content. Then create a SmartBrief that defines your article structure. Finally, create a Project with your headline and keywords, select your writer model and brief, and generate content.

**Why does my generated content not sound like me?**
Your Writer Model needs more training data. Add more examples of your writing in the Writer Factory. Aim for at least 5-10 varied articles for best results.

**How do I improve my SEO score?**
Open the SEO Wizard panel while editing your article. It shows real-time suggestions. Click keyword suggestions to add them to your SEO Package. Use the suggested heading structure. Make sure your primary keyword appears in the headline, first paragraph, and at least 2-3 times in the body.

**Can I use Forge for topics outside sports betting?**
Forge is specifically built for sports betting and gaming content for GDC Group / RotoWire. The AI agents and SmartBrief templates are optimized for this type of content. It can technically produce other content types but it's not the intended use case.

**How do I report a bug?**
Click the "Bug Report" button in the Beta Toolbar at the top right of any page. Fill in the title, describe what went wrong, and optionally attach a screenshot.

**How do I export my article to the CMS?**
Click the Export button in the top right of the project editor. The export system provides CMS-ready formatted content and safety warnings for common formatting issues.

**What's the difference between the SEO Wizard and the SEO Assistant?**
The SEO Wizard is the real-time sidebar panel that updates as you type — it tracks keyword density and structure live. The SEO Assistant (Auto-Optimize) is a one-click deep analysis that makes broader suggestions about the whole article.

**Who can configure the AI agents?**
Admins and Editors can configure AI agents for their department. Super Admins can configure everything globally. Navigate to Admin → AI Agents.

**What models does Forge use?**
Forge primarily uses Claude Sonnet 4 (Anthropic) for content generation and analysis. OpenAI's text-embedding-3-small is used for vector embeddings in the Writer Factory. GPT-4o Vision is available as a fallback for the Visual Data Extraction Agent. The NewsEngine uses Tavily AI for web search.

**Why is my content generation slow?**
Content generation involves multiple steps: loading your writer model context, running the SEO Package, and streaming the full article. Larger articles naturally take longer. If it seems unusually slow, try refreshing and retrying.

**How do I add someone to my team?**
Go to Admin → User Management. Click "Invite User" and enter their email. Assign them a role (Content Creator, Editor, etc.) and they'll receive an invitation email.

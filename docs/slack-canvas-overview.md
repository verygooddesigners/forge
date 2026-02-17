# Forge: AI-Powered Content Creation Platform

## Overview

Forge is an AI-powered content creation platform that combines your unique writing style with advanced SEO optimization. The system trains on your existing content to capture your voice, then uses that model along with SEO best practices to generate articles that sound authentically like you while ranking well in search engines. It's designed specifically for content creators who need to scale their output without sacrificing quality or authenticity.

## The Three-Pillar System

**Writer Factory** - Train AI models on your writing samples to replicate your unique voice, tone, and style. The more content you train with (up to 25 articles), the better the AI becomes at matching your authentic writing style. Each writer model is private to you and can be used across unlimited projects.

**SEO Package** - A dynamic bundle containing your headline, primary keyword, secondary keywords, and topic that guides content generation. The package is enhanced by AI analysis that suggests related keywords and LSI terms based on current search trends. Keywords selected from suggestions are automatically added to your SEO Package in real-time.

**Brief Builder** - Create reusable content templates that define structure, required sections, and formatting guidelines. Briefs ensure consistency across all your content while meeting specific editorial requirements. You can create unlimited briefs and share them across your team.

## Core Features

**Content Generation** - Click one button to generate complete articles combining your Writer Model, SEO Package, and Brief. The AI streams content into the editor in real-time, allowing you to see the article being written. Generated content is automatically saved and includes proper heading structure, keyword placement, and your authentic voice.

**SEO Wizard** - Real-time SEO analysis appears in the right sidebar, providing instant feedback as you write. Track your SEO score (0-100), content structure metrics (words, headings, paragraphs, images), and keyword usage with color-coded status indicators. The wizard updates automatically with a 2-second delay to optimize performance without lag.

**NewsEngine** - Automatically searches for relevant news articles related to your headline and keywords from the past 3 weeks. Powered by Tavily AI Search, it displays articles with relevance scores to help you stay current on your topic. Refresh anytime to get the latest news for context and research.

**Real-Time Editing** - Built on TipTap rich text editor with full Markdown support and formatting tools. Content auto-saves every 2 seconds, so you never lose work. Word count and last-saved timestamp display in the editor toolbar for complete transparency.

## Advanced SEO Engine

**Real-Time Keyword Tracking** - The SEO Engine tracks all keywords (primary, secondary, suggested) as you write and shows optimal/under/over status for each. Ideal density ranges are calculated automatically based on your target word count. All metrics update live as your content changes.

**AI-Powered Suggestions** - Request specific, actionable SEO recommendations powered by Claude AI analysis. Instead of generic advice, get precise suggestions like "Add your primary keyword to the H2 in paragraph 3." Suggestions consider your current score, content structure, and SEO Package requirements.

**Auto-Optimization** - Let AI rewrite portions of your content to implement SEO suggestions while preserving your style. The system uses the same Writer Model that generated your content to maintain consistency. Review and approve changes before they're applied to your article.

**Internal Linking** - The Engine analyzes your content against your other projects to suggest relevant internal links. It identifies ideal anchor text, explains why each link adds value, and shows exactly where to place links. All suggestions consider topic relevance and keyword relationships.

## Team Collaboration

**User Roles** - Admins have full access to all features, user management, and API configuration. Strategists can create writer models, briefs, and projects within their own workspace. Role-based access ensures proper content security and workflow separation.

**Shared Briefs** - Create briefs and mark them as "shared" to make them available across your entire team. Shared briefs ensure brand consistency and editorial standards across all content creators. Private briefs remain visible only to their creator.

**Project Management** - All projects are organized in a searchable list with filtering options. See headline, keywords, word count target, and associated writer model at a glance. Open any project to continue editing where you left off.

## Technical Architecture

**AI Provider** - Built exclusively on Claude API (Anthropic) using Sonnet 4 model for superior reasoning and content quality. No OpenAI dependency means faster response times and more consistent results. Streaming responses provide real-time content generation with immediate visual feedback.

**SEO Engine** - Centralized system that powers all optimization features with both traditional SEO metrics and AI analysis. Converts TipTap JSON to HTML for accurate analysis of content structure and keywords. Comprehensive metrics include heading distribution, paragraph structure, and image placement.

**RAG System** - Retrieval Augmented Generation finds your most relevant training examples for each project. Claude analyzes the style characteristics (tone, voice, vocabulary, sentence structure) of your samples. The top examples are included in the generation prompt to ensure stylistic consistency.

**Database** - PostgreSQL via Supabase with Row Level Security (RLS) for data protection. Tables include users, writer_models, training_content, briefs, projects, and AI settings. All writes and reads are secured by user authentication tokens.

## Deployment & Stack

**Frontend** - Next.js 14 App Router, React 19, TypeScript, Tailwind CSS 4, Shadcn UI components. TipTap 3.10.7 for rich text editing with custom extensions and plugins. Deployed to Vercel with automatic deployments from GitHub main branch.

**Backend** - Supabase for authentication, database, and storage with service role for admin operations. API routes handle content generation, SEO analysis, writer training, and news search. Environment variables stored securely in Vercel for production deployment.

**Security** - Row Level Security policies ensure users only access their own data. Admin role bypasses RLS for user management and system configuration. API keys and service credentials stored as encrypted environment variables, never in code.

## Getting Started

**Registration** - Admins create new user accounts with email and password. Users receive login credentials and can access the dashboard immediately. Password reset functionality available via email link for account recovery.

**First Project Workflow** - Create a Writer Model and train it with 3-5 articles to start (up to 25 for best results). Build a Brief template defining your article structure and requirements. Create a new project with headline, keywords, topic, and word count, then select your Writer Model and Brief to generate content.

**Optimization Workflow** - After generating initial content, click "Analyze SEO Package" to get AI-powered keyword suggestions. Select relevant keywords from the suggestions to add them to your SEO Package. Click "Auto-Optimize" to implement SEO improvements while preserving your writing style.

---

**Live Site:** https://forge.vercel.app  
**GitHub:** https://github.com/verygooddesigners/forge  
**Development Port:** localhost:5309



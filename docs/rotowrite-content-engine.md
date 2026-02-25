# Forge Content Engine: Multi-Agent, Writer Modeling, SmartBriefs

## Purpose

Forge is an AI-powered content creation platform built for producing high-quality, SEO-ready articles for Forge.com. It combines a multi-agent AI system, personalized writer modeling, and SmartBrief templates to generate content that matches brand standards and individual writer voice, while dramatically reducing the time required from writers and editors.

## How the Multi-Agent System Creates Content

Forge does not rely on a single, generic AI model. Instead, it uses a team of specialized agents, each focused on a specific part of the content workflow. This separation improves quality, speed, and reliability.

- **Content Generation Agent** builds the full draft from a brief, keywords, and source inputs.
- **Writer Training Agent** learns each writer's style so drafts sound authentic, not generic.
- **SEO Optimization Agent** enforces keyword coverage and on-page best practices.
- **Quality Assurance Agent** checks grammar, clarity, and consistency.
- **Persona & Tone Agent** ensures the article matches the intended voice and audience.
- **Research Orchestrator Agent** runs the research pipeline when a project is created: Tavily search, relevance evaluation, fact verification, and keyword suggestions.
- **Visual Data Extraction Agent** converts screenshots or visual data into usable content blocks.
- **Fact Verification Agent** cross-references factual claims across multiple sources before publication.

Each agent is tuned for its job and constrained from doing unrelated tasks. This results in consistent, repeatable output that is production-ready for Forge.com. Agents run on Claude Sonnet 4 and are fully configurable by administrators via the Admin Dashboard.

## Writer Modeling: Authentic Voice at Scale

Forge’s Writer Engine is a RAG-based system that models individual writers by analyzing their existing articles. It learns tone, vocabulary, pacing, and structural patterns, then uses those examples to guide the Content Generation Agent. The result: articles that read like the credited writer actually wrote them, which keeps Forge.com content consistent with established voices and audience expectations.

## SmartBriefs: Intelligent Templates That Guide the Draft

SmartBriefs are not simple outlines. They are AI-enhanced templates that include:

- Structure and section requirements
- Tone and style instructions
- Source URLs or example articles for pattern learning
- SEO and formatting constraints

When a SmartBrief is selected, the system extracts patterns from real examples and encodes them as reusable guidance. This lets Forge produce consistent articles that match proven formats on Forge.com, while still adapting to new topics and data.

### SmartBrief AutoBuilder

The AutoBuilder feature accelerates template creation: paste the URL of any publicly accessible article and the AI reverse-engineers a complete SmartBrief scaffold — including name, description, AI instructions, and section structure. This eliminates manual template setup for recurring content types.

## End-to-End Content Flow for Forge.com

1. A strategist selects a SmartBrief and a personal writer model.
2. The NewsEngine gathers current sources and relevant context.
3. The Content Generation Agent drafts the article in the writer’s voice.
4. SEO, QA, and Tone agents refine the draft in parallel.
5. The editor reviews and finalizes the article for publication.

## Time Savings for Writers and Editors

Forge compresses a multi-hour writing and editing process into a streamlined workflow that takes minutes. It removes or automates the most time-consuming tasks:

- Research and outlining are automated through SmartBriefs and source analysis.
- Drafting is accelerated by the Content Generation Agent with writer-accurate voice.
- SEO optimization is built-in, reducing back-and-forth edits.
- Grammar and consistency checks happen automatically before review.

This means writers can produce more content in less time, and editors spend far less time on structural fixes, tone corrections, and SEO cleanup. The net result is faster publishing cycles, higher output capacity, and consistent quality across Forge.com.

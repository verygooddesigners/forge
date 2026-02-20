# CLAUDE CODE: START TASK IMMEDIATELY

You are now working on this task. Begin implementation immediately without waiting for user input.

---

# Task: Errors on Role Editor screen

**Status:** to_do
**Priority:** high
**Feature Area:** Role Editor
**Task ID:** 6f3e637c-fc9d-4161-8a2d-4d241f9ba2ae
**Project:** Forge

## Description

When I go to the Roles Editor screen, there's an immediate error message saying "Failed to Load Roles." 

Then, when I tried to create a role, I got this error:

"Could not find the table 'public.roles' in the schema cache"

Please fix both of these issues.

## Tech Stack
{
  "ai": "Grok API (Claude-ready)",
  "ui": "Shadcn UI",
  "auth": "Supabase Auth",
  "editor": "TipTap",
  "styling": "Tailwind CSS",
  "database": "Supabase PostgreSQL + pgvector",
  "language": "TypeScript",
  "framework": "Next.js 16",
  "workspace": "GDC",
  "deployment": "Vercel"
}

---

## Your Instructions

**START WORKING NOW.** Complete this task by:

1. Reading relevant files from this codebase
2. Understanding the current implementation
3. Writing/updating code to complete the task
4. Testing your changes logically
5. **CRITICAL**: When done, mark the task complete (see below)

**Important:**
- This is a high priority task
- Write production-quality code
- Follow the project's existing patterns
- Be thorough and test your logic

### Mark Task Complete (REQUIRED)

When you finish this task, you **MUST** call the Spark MCP tool so the task card moves to Done in Spark.

The MCP tool is named **mcp__spark__spark_update_task**. Call it with these parameters:
- task_id: "6f3e637c-fc9d-4161-8a2d-4d241f9ba2ae"
- updates: {"status": "done"}

This is an MCP tool call — invoke the tool directly, do NOT just write it in a comment or code block.
The Spark UI polls every few seconds and the task card will move to Done automatically.

**BEGIN IMPLEMENTATION NOW.**

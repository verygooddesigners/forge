# CLAUDE CODE: START TASK IMMEDIATELY

You are now working on this task. Begin implementation immediately without waiting for user input.

---

# Task: Change user role system

**Status:** to_do
**Priority:** critical
**Feature Area:** Authentication
**Task ID:** cbd40b31-ccdf-409a-96ec-9ca57e8a321b
**Project:** Forge

## Description

Right now each user has 

- Email
- Full Name
- Account Status
- Role

Both Account Status and Role seem to be for setting permissions. 

We need to change Account Status so that it displays: 

- Waiting for Email Confirmation (you can reword this)
- Confirmed (after the user has clicked the confirmation link in their registration email) 

Roles should be:

- Super Admin
- Admin
- Manager
- Team Leader
- Content Creator

Please develop permissions and rights for each of these roles - what they can access, what they cannot, etc. For example, anyone can create Smart Briefs. Team Leader can change the Master Instructions in the AI panel. But only the Manager should be able to tune the individual AI agents.

Before you build anything, help me brainstorm and develop these roles. 

ALSO These roles and permissions will overwrite any other permissions system we have in place, and will become the main permissions system.

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
- This is a critical priority task
- Write production-quality code
- Follow the project's existing patterns
- Be thorough and test your logic

### Mark Task Complete (REQUIRED)

When you finish this task, you **MUST** call the Spark MCP tool so the task card moves to Done in Spark.

The MCP tool is named **mcp__spark__spark_update_task**. Call it with these parameters:
- task_id: "cbd40b31-ccdf-409a-96ec-9ca57e8a321b"
- updates: {"status": "done"}

This is an MCP tool call — invoke the tool directly, do NOT just write it in a comment or code block.
The Spark UI polls every few seconds and the task card will move to Done automatically.

**BEGIN IMPLEMENTATION NOW.**

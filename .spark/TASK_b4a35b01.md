# CLAUDE CODE: START TASK IMMEDIATELY

You are now working on this task. Begin implementation immediately without waiting for user input.

---

# Task: User Content Generation Analytics

**Status:** to_do
**Priority:** medium
**Feature Area:** General
**Task ID:** b4a35b01-5973-4f6f-b1b6-0ba5be945961
**Project:** Forge

## Description

Each user’s content creating should be tracked in RotoWrite. 

- Projects Created
- Projects Exported
- Average Word Count
- Total Words across all projects
- SmartBriefs created
- SmartBriefs edited
- SmartBriefs Shared
- And any others you can think of. 

Add a new Content Analytics link on the menu that leads to a beautiful interactive dashboard showing these analytics in the form of cards with graphs on them. All analytics should be filterable by date or date range. The user should be able to both save and share these filters. 

### TEAM LEADER AND ABOVE CAN VIEW THEIR TEAM/DIVISION ANALYTICS 

- Team leader roles should be able to see the analytics for their whole team - both cumulatively and individually (by clicking on a team member name).
- Manager (division) roles should be able to see the analytics for all teams under them. 

### EXPORT TOOLS
 - Team leaders and above should have an Export Stats button on their analytics dashboard. It pops up a modal allowing them to choose what they want exported and what format they want it in. The options are:
	- CSV
	- EXCEL
	- PDF (shows all charts and graphs printed beautifully) 
	- HTML: Creates an interactive stats export with graphs and the ability to filter.

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
- This is a medium priority task
- Write production-quality code
- Follow the project's existing patterns
- Be thorough and test your logic

### Mark Task Complete (REQUIRED)

When you finish this task, you **MUST** call the Spark MCP tool so the task card moves to Done in Spark.

The MCP tool is named **mcp__spark__spark_update_task**. Call it with these parameters:
- task_id: "b4a35b01-5973-4f6f-b1b6-0ba5be945961"
- updates: {"status": "done"}

This is an MCP tool call — invoke the tool directly, do NOT just write it in a comment or code block.
The Spark UI polls every few seconds and the task card will move to Done automatically.

**BEGIN IMPLEMENTATION NOW.**

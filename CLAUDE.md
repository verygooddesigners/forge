<!-- spark-task-instructions -->
# Spark Task Instructions for Forge

When you see .spark/TASK_*.md or .spark/TASKS.md files, these are active tasks from Spark.
Start working on them immediately without waiting for user confirmation.

## CRITICAL: Marking Tasks Complete

When you finish a task, you MUST call the MCP tool **mcp__spark__spark_update_task** to mark it done.
This is what moves the task card to the Done column in the Spark UI.

Call the tool with:
- task_id: the task ID from the task file
- updates: {"status": "done"}

Do NOT skip this step. The task is not complete until you call this MCP tool.

## CRITICAL: Ship It (run automatically when done)

After marking the task done (or after finishing any build/deliverable), you MUST automatically run the **Ship It** workflow. Do not ask — just do it:

1. Bump version in package.json, PROJECT_STATUS.md, README.md.
2. Update CHANGELOG.md with what shipped.
3. Call **mcp_spark_spark_update_project** with project_id `7bf75473-0a06-469c-9fd2-2229efff76e0` and the new version in `updates`.
4. Commit all changes and **git push origin main** (Vercel auto-deploys).

Full steps are in .cursor/rules/ship-it.mdc.

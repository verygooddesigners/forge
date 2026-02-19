# SHIP IT

When I run this command, you will run the **Ship It** workflow so that the current work is pushed to GitHub, Vercel auto-deploys, and the Forge project in Spark is updated.

Do the following in order:

1. **Mark the Spark task complete** (if the work was for a task in `.spark/TASK_*.md`): call `mcp_spark_spark_update_task` with that task’s ID and `updates: {"status": "done"}`.

2. **Bump the version** using Semantic Versioning (PATCH for fixes, MINOR for features). Update:
   - `package.json` (version field)
   - `PROJECT_STATUS.md` (Version line)
   - `README.md` (version at bottom)

3. **Update CHANGELOG.md**: add a new entry at the top for this version with a short summary of what shipped.

4. **Update Spark**: call `mcp_spark_spark_update_project` with project_id `7bf75473-0a06-469c-9fd2-2229efff76e0` and `updates: { "version": "X.XX.XX" }` (the new version). Include the latest changelog summary in the updates if the API supports it.

5. **Commit and push**: stage all relevant changes, commit with a message like `vX.XX.XX: <short description>`, then `git push origin main`.

After the push, Vercel will auto-deploy. Confirm to me when the workflow is complete.

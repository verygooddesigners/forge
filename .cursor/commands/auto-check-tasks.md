# AUTO-CHECK TASKS

## Automatic Task Detection

At the start of each conversation, automatically check `tasks.md` for pending work:

1. **Read** the Active Tasks section of `tasks.md`
2. **Look for** any tasks with `[PENDING]` status
3. **If found**, notify the user:
   - "I see there are [X] pending tasks in tasks.md. Would you like me to work on them?"
   - List the pending tasks briefly
4. **If user says yes or "do tasks"**, proceed with task processing
5. **If user has other requests**, prioritize their current request first

## Behavior Rules

- **Non-intrusive**: Only mention pending tasks once at conversation start
- **User choice**: Always let user decide whether to process tasks now or later
- **Flexible**: User can say "do tasks" at any time to trigger processing
- **Smart context**: If user's current request relates to a pending task, mention the connection

## Example Interaction

```
User: Hey, can you help me with something?

AI: Sure! I notice there are 3 pending tasks in tasks.md:
  1. Fix Writer Model Training error
  2. Fix Writer Factory badge display bug
  3. Add URL-based training story extraction

Would you like me to work on those, or would you prefer to handle something else first?

User: Let's do the tasks.

AI: [Processes tasks sequentially with status updates]
```

## Integration with "do tasks" Command

This auto-check is complementary to the explicit "do tasks" command:
- **Auto-check**: Passive notification at conversation start
- **"do tasks"**: Explicit command to immediately process all pending tasks
- Both use the same task processing logic defined in `do tasks.md`

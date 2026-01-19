# Simple Task Management System - User Guide

## Overview

Your new task management system is designed to be simple and friction-free. Just add numbered tasks, and I'll handle the status tracking automatically.

## How It Works

### Adding Tasks

Simply type numbered tasks in the **Active Tasks** section of `tasks.md`:

```markdown
## Active Tasks

[PENDING] 1. Fix the login button styling
[PENDING] 2. Add validation to the contact form
[PENDING] 3. Update the homepage hero image
```

**That's it!** No need to format checkboxes, move tasks around, or manage sections manually.

### Task Statuses

I'll automatically update task statuses as I work:

- `[PENDING]` - New task, waiting to be started
- `[IN PROGRESS]` - Currently working on this task
- `[DONE]` - Completed successfully
- `[BLOCKED]` - Can't complete (I'll explain why)

### Starting Work on Tasks

You have two options:

#### Option 1: Automatic Detection (Recommended)
When you start a new conversation, I'll automatically check for pending tasks and ask if you'd like me to work on them:

```
AI: I see there are 3 pending tasks in tasks.md:
  1. Fix Writer Model Training error
  2. Fix Writer Factory badge display bug
  3. Add URL-based training story extraction

Would you like me to work on those, or would you prefer to handle something else first?
```

#### Option 2: Explicit Command
Just say **"do tasks"** at any time, and I'll immediately start processing all pending tasks.

### Task Processing

When processing tasks, I will:

1. **Analyze** - Review all pending tasks and prioritize them
2. **Reorder** - Arrange tasks in the most logical order (dependencies, complexity, impact)
3. **Execute** - Work through tasks sequentially
4. **Update** - Change status from `[PENDING]` → `[IN PROGRESS]` → `[DONE]`
5. **Report** - Keep you informed of progress

## File Structure

Your `tasks.md` is organized into three sections:

### 1. Active Tasks
Current work items - this is where you add new tasks

### 2. Architectural Refinements
Long-term improvements and future considerations (unchanged format)

### 3. Archive
Completed tasks moved here for reference

## Example Workflow

**Day 1 - Monday morning:**
```markdown
## Active Tasks

[PENDING] 1. Fix the SEO wizard keyword display
[PENDING] 2. Update writer model training flow
```

**You:** "Hey, can you help?"

**Me:** "I see 2 pending tasks. Want me to work on them?"

**You:** "Yes, do the tasks"

**Me:** *Updates tasks.md automatically*
```markdown
## Active Tasks

[IN PROGRESS] 1. Fix the SEO wizard keyword display
[PENDING] 2. Update writer model training flow
```

**After completing task 1:**
```markdown
## Active Tasks

[DONE] 1. Fix the SEO wizard keyword display
[IN PROGRESS] 2. Update writer model training flow
```

**After completing task 2:**
```markdown
## Active Tasks

[DONE] 1. Fix the SEO wizard keyword display
[DONE] 2. Update writer model training flow
```

**Day 5 - Friday cleanup:**

**You:** "Archive completed tasks"

**Me:** *Moves DONE tasks to Archive section with completion dates*

## Tips

### Keep Tasks Focused
Good: `Fix Writer Model Training: Cannot add new training stories`
Bad: `Fix everything in the writer section`

### One Task = One Thing
If a task has multiple parts, consider breaking it into separate numbered tasks.

### Priority Matters
List tasks in rough order of importance. I'll still analyze and reorder, but your order gives me context.

### Be Specific
Include error messages, specific components, or expected behavior when relevant.

## Commands

| Command | What It Does |
|---------|--------------|
| `do tasks` | Process all pending tasks immediately |
| `archive tasks` | Move completed tasks to Archive section |

## Benefits

✅ **Zero overhead** - Just type tasks, I handle the rest
✅ **Clear visibility** - See status at a glance
✅ **Automatic** - I check for tasks and keep them updated
✅ **Flexible** - Work on tasks when you want, not when I demand it
✅ **Simple** - No complex formatting or manual moving required

## Migration from Old System

Your existing tasks have been converted:
- Old `[]` checkboxes → `[PENDING]` status
- Old completed section → Archive section
- Architectural refinements preserved as-is

## Questions?

Just ask! The system is designed to be intuitive and get out of your way so you can focus on building great features.

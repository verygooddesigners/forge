# NEW TASK MANAGEMENT SYSTEM INSTRUCTIONS

We are going to change the way we handle task management.

There is a new folder called `task-manager/`. This is the home of the task manager.

---

## FILE STRUCTURE OVERVIEW

### INBOX.MD
**Purpose:** Entry point for all new tasks and bugs  
**Who manages:** You (human) add items here  
**Format:** Raw task/bug descriptions with priority levels

### PLANNER.MD  
**Purpose:** Active work queue tracking status and progress  
**Who manages:** AI moves items from Inbox here and updates status  
**Format:** Organized by status groups with task IDs and priorities

### COMPLETED.MD
**Purpose:** Archive of finished work  
**Who manages:** AI moves completed items here with notes  
**Format:** Task/bug descriptions with completion metadata

---

## WORKFLOW

```
1. You add new items → INBOX.MD
2. AI ingests and assigns IDs → PLANNER.MD (PENDING section)
3. AI starts work → PLANNER.MD (IN PROGRESS section)
4. AI completes work → COMPLETED.MD (with notes and timestamp)
```

---

## INBOX.MD FORMAT

### TASKS
When you have a new task to assign, add it to Inbox using this format:

```
* Task description goes here [PRIORITY LEVEL]
```

**Priority Levels:** `*` (lowest) to `*****` (highest)
- `*` - Nice to have, low priority
- `**` - Minor improvement
- `***` - Standard priority
- `****` - Important, should be done soon
- `*****` - Critical, highest priority

**Examples:**
```
* Add tooltip to the export button [**]
* Implement real-time collaboration feature [*****]
* Refactor user authentication module [***]
```

### BUGS
When you add a bug, use this format:

```
! Bug description goes here
```

**Note:** Bugs do NOT have priority levels. All bugs are treated as high priority by default.

**Examples:**
```
! Research Results cards not clickable on mobile
! Export modal warning text overflows container
! Word count not passed from setup to SEO Wizard
```

---

## PLANNER.MD FORMAT

### STATUS GROUPS
Planner is organized into three status sections:

1. **PENDING** - Tasks/bugs waiting to be started
2. **IN PROGRESS** - Currently being worked on (usually just 1-2 items)
3. **BLOCKED** - Waiting on external input or dependencies

### TASK ID SYSTEM
When AI moves items from Inbox to Planner, it assigns sequential task IDs:
- Format: `#1`, `#2`, `#3`, etc.
- IDs are unique and sequential across all tasks/bugs
- Once assigned, IDs never change

### FORMAT IN PLANNER

**Tasks:**
```
#ID - Task description [PRIORITY]
```

**Bugs:**
```
#ID - ! Bug description
```

### SORTING RULES
Within each status group:
1. Bugs appear first (treated as `*****` priority)
2. Tasks sorted by priority: `*****` → `****` → `***` → `**` → `*`
3. Same priority items sorted by ID (oldest first)

**Example Planner Structure:**
```
## PENDING

#3 - ! Fix export modal overflow issue
#5 - ! Research cards not clickable on mobile
#1 - Implement real-time collaboration feature [*****]
#4 - Refactor user authentication module [***]
#2 - Add tooltip to export button [**]

## IN PROGRESS

#6 - Add AI keyword suggestion button [****]

## BLOCKED

#7 - Deploy to production [***] - Waiting for API keys
```

---

## COMPLETED.MD FORMAT

When AI completes a task or bug, it moves to Completed with this format:

```
#ID - Task/Bug description - [Brief completion notes] - [TIMESTAMP]
```

**Completion Notes Should Include:**
- What was done (brief summary)
- Key files changed (if relevant)
- Any important context for future reference

**Examples:**
```
#6 - Add AI keyword suggestion button [****] - Added "Suggest Keywords" button to Secondary Keywords screen. Uses Content Generation Agent to analyze H1 and primary keyword. Updates SecondaryKeywordsStep.tsx component. - [2026-01-19 14:30]

#3 - ! Fix export modal overflow issue - Fixed text overflow in ExportModal.tsx by adding proper word-wrap and max-width constraints. Tested on mobile viewports. - [2026-01-19 15:45]
```

---

## AI WORKFLOW INSTRUCTIONS

### When You See New Items in Inbox:

1. **Ingest:** Read all items from Inbox
2. **Assign IDs:** Give each item a sequential task ID
3. **Move to Planner:** Add to PENDING section in Planner
4. **Sort:** Place bugs first, then by priority level
5. **Clear Inbox:** Remove items from Inbox after moving them

### When Starting Work:

1. **Select Task:** Choose highest priority item from PENDING
2. **Update Status:** Move to IN PROGRESS section in Planner
3. **Work:** Complete the task/bug fix
4. **Test:** Verify changes work as expected

### When Completing Work:

1. **Document:** Add brief notes about what was done
2. **Timestamp:** Add current date and time
3. **Move to Completed:** Add to appropriate section in Completed.md
4. **Remove from Planner:** Remove item from IN PROGRESS

### When Blocked:

1. **Move to BLOCKED:** Move item from IN PROGRESS to BLOCKED
2. **Add Context:** Note what you're waiting for
3. **Pick Next:** Select next highest priority PENDING item

---

## PRIORITY GUIDELINES

Use these guidelines when working with priorities:

- ***** (CRITICAL): Security issues, data loss prevention, app crashes, blocking production
- **** (HIGH): Major features, significant bugs, important UX improvements
- *** (MEDIUM): Standard features, moderate bugs, routine improvements
- ** (LOW): Minor enhancements, small bugs, polish
- * (MINIMAL): Nice-to-haves, future considerations, very minor tweaks

**Remember:** All bugs are treated as high priority by default (equivalent to *****).

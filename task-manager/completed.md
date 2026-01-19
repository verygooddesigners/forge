# COMPLETED

This document holds all completed tasks and bugs.

When work is finished, items are moved here from Planner with completion notes and timestamps.

---

## COMPLETED TASKS

#5 - Add a new field to Projects - File Name. The File Name will display as a headline at the top of the card, replacing the H1 on the card display. Clicking the File Name opens inline editor allowing you to change the file name. You can either press a small green checkbox icon or simply hit enter to save the new File Name. [*****] - Created database migration 00011_add_file_name_to_projects.sql to add file_name column to projects table. Created reusable InlineEdit component (components/ui/inline-edit.tsx) with Enter key and checkbox save functionality. Updated ProjectsPanel, DashboardHome, and ProjectListModal to display file_name as headline with inline editing. All project cards now show file_name (defaults to headline if not set) and allow inline editing with visual feedback. - [2026-01-19 16:44]

---

## COMPLETED BUGS

#1 - ! The icons on the collapsed left sidebar are tiny. They should be at least 25px x 25px - Updated all sidebar navigation icons (Home, FileText, BookOpen, Wrench, TrendingUp, Shield) to use explicit 25px x 25px size when sidebar is collapsed. Changed from w-7 h-7 (28px) to w-[25px] h-[25px] for consistency. - [2026-01-19 16:17]

#2 - ! The square RW icon is not centered horizontally on the collapsed sidebar. It should resize and stay centered whether the sidebar is collapsed or full - Fixed RW logo container to center properly when collapsed. Changed padding from p-6 to conditional p-3 when collapsed, changed flex justify-between to justify-center when collapsed, removed gap-3 when collapsed, and made logo size responsive (w-8 h-8 when collapsed, w-9 h-9 when expanded). - [2026-01-19 16:17]

#3 - ! on the SmartBrief Creation Guide, there are two X (close) icons when there should be one - Removed duplicate close button by setting showCloseButton={false} on DialogContent component. The DialogHeader already has a close button, so the default DialogContent close button was causing duplication. - [2026-01-19 16:17]

#4 - ! on the Create New SmartBrief screen, the Example box under "AI Configuration Use these instructions to convey anything else the AI should know before generating content." has a dark background and dark text. - Fixed contrast issue by changing Example box background from bg-[#3a3a44] to bg-bg-elevated and border from border-[#4a4a54] to border-border-default. This ensures proper contrast with text-text-primary and text-text-secondary classes. - [2026-01-19 16:17]

---

## NOTES ON COMPLETION FORMAT

Format: `#ID - Task/Bug description - [Brief completion notes] - [TIMESTAMP]`

**Completion notes should include:**
- What was done (brief summary)
- Key files changed (if relevant)
- Any important context for future reference

**Timestamp format:** `[YYYY-MM-DD HH:MM]`

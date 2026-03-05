# Forge UI Naming Conventions

Standardized names for regions and components of the Forge UI. Use these consistently in code comments, PRs, bug reports, and design discussions.

---

## Layout Regions

- **Dashboard** — The whole white floating card (with rounded corners) that contains the entire application UI. Sits against the gradient background created by the root layout's `p-6` padding.

- **MainMenu** — The left-most column. Contains the Forge wordmark/logo, navigation links, and the UserPanel at the bottom. Rendered by `AppSidebar`.

- **UserPanel** — The bottom section of the MainMenu showing the logged-in user's avatar, display name, and the profile/settings popover trigger. Fixed at the bottom of the MainMenu regardless of scroll position.

- **RightPanel** — The panel to the right of the MainMenu. Fills the remaining horizontal space. Contains the PageHeader, ContentArea, and (in list/detail layouts) the DetailPanel.

- **BetaToolbar** — The small toolbar in the upper-right corner of the Dashboard used for beta-specific actions (screenshot capture, feedback, etc.). Rendered by `BetaToolbar`.

---

## Content Regions

- **PageHeader** — The title bar at the top of a ContentArea. Typically contains a page title, subtitle/count, and primary action button(s) (e.g., "Report a Bug", "Create New"). Always `flex-shrink-0` so it never scrolls away.

- **ContentArea** — The main scrollable working region inside the RightPanel. This is where lists, editors, forms, and primary page content live.

- **FilterBar** — The search input + filter dropdowns row that sits at the top of a list inside the ContentArea. Allows narrowing the visible items by keyword, status, severity, etc.

- **DetailPanel** — The right-side detail view in any list/detail (email-app style) layout. Always visible at `flex-1` width. Shows an EmptyState when nothing is selected, and full detail content when an item is selected. Used in Bug Tracker; pattern to reuse elsewhere.

---

## UI States & Overlays

- **EmptyState** — The placeholder UI shown inside a ContentArea or DetailPanel when there is no content to display (no results, nothing selected, etc.). Typically centered with an icon, a headline, and a short description.

- **ModalOverlay** — The full-screen semi-transparent backdrop rendered behind any `<Dialog>` or modal component.

---

## Notes

- **MainMenu vs. RightPanel** are the two top-level columns. Everything visible to the user lives in one or the other.
- **ContentArea vs. DetailPanel** — in single-column pages, everything is ContentArea. In list/detail pages (like Bug Tracker), the list is ContentArea and the selected-item view is DetailPanel.
- Component file locations: `AppSidebar` → MainMenu + UserPanel; `BetaToolbar` → BetaToolbar; page-level components → RightPanel contents.

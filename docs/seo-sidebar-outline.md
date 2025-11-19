# SEO Optimization Sidebar - Feature Outline

## Visual Structure & Features

- At the top of the SEO Optimization sidebar are three navigation tabs: **GUIDELINES** (default selected, highlighted in purple), **OUTLINE**, and **BRIEF**.

- Below the tabs is the **Content Score** section, which displays a large semi-circular gauge showing the current SEO score (e.g., "82/100") with color-coded segments: red (0-40), orange (40-70), and green (70-100).

- Under the gauge, statistics show **Avg 83** (with up/down arrow) and **Top 87** (with up arrow), representing the average score across all projects and the top score achieved.

- A **Details** dropdown below the statistics expands to show a detailed breakdown of how the score is calculated.

- Two action buttons are displayed prominently:
  - **Auto-Optimize** button (dark blue/primary color with sparkle icon) automatically analyzes and suggests content optimizations.
  - **Insert internal links** button (light gray/secondary color with link icon) suggests and inserts relevant internal links into the content.

- The **Content Structure** section displays four key metrics in a table format:
  - **WORDS:** Shows current word count (e.g., "2,267") with an arrow indicator and target range (e.g., "3,043-3,499").
  - **HEADINGS:** Shows current heading count (e.g., "34") with a green checkmark when in range, and target range (e.g., "27-40").
  - **PARAGRAPHS:** Shows current paragraph count (e.g., "65") with an arrow indicator and minimum target (e.g., "at least 85").
  - **IMAGES:** Shows current image count (e.g., "5") with an arrow indicator and target range (e.g., "12-20").
  - Each metric uses color coding: green (in range), yellow/orange (close to target), red (far from target).
  - An **Adjust** button (with settings icon) on the right allows users to modify target ranges.

- The **Terms** section provides keyword and phrase analysis:
  - A search bar with magnifying glass icon filters terms in real-time.
  - Category tags (e.g., "#Content - 14", "#Market - 12") display term counts per category, with dropdown arrows to expand/collapse.
  - Three filter tabs allow viewing: **All 80** (all terms, default selected), **Headings 5** (terms in headings only), and **NLP 65** (NLP-extracted terms only).
  - A scrollable list displays each term with:
    - Term name (e.g., "content marketing metrics")
    - Current usage count vs. target range (e.g., "7/8-15")
    - Color-coded background: green (optimal usage), yellow/orange (slightly off target), red (over-usage or significantly under)
    - Arrow indicators: ↑ (over-usage), ↓ (under-usage), ✓ (optimal)
  - An **Adjust** button (with settings icon) on the right allows users to modify term targets and categories.

- A floating **Help** button (dark circular button with white question mark icon) is positioned in the bottom right corner, providing access to documentation and tooltips.

- All metrics, scores, and term analysis update in real-time as the user edits content in the TipTap editor, with a 2-second debounce to optimize performance.

- When no content exists in the editor, the Content Score gauge displays 0 and is greyed out, and all metrics show empty or zero states.


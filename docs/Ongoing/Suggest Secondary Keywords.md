# SUGGEST SECONDARY KEYWORDS

## Location

On the Create New Project screen (`app/projects/new/NewProjectPageClient.tsx`), directly below the Secondary Keywords input field and its tag list.

## Trigger

A small text link that says "Suggest Keywords" with a sparkle icon. When clicked, it expands a callout box below.

## UI Behavior

1. **Loading state:** When clicked, the "Suggest Keywords" link text changes to "Suggesting..." with a spinner. The callout box expands with a subtle skeleton or pulsing animation while the API call is in flight.

2. **Callout box:** Once results arrive, a rounded callout box expands below the Secondary Keywords field. The box should:
   - Have a lightly-tinted background (use `bg-accent-primary/5` or similar from the design system)
   - Have a thin border (`border-border-subtle`)
   - Include a small header line: "Suggested Keywords" in text-xs semibold
   - Display the keywords as clickable badge/label elements, arranged in a wrapping flex row with small gaps

3. **Keyword labels in the callout:**
   - Default state: accent-colored badge (similar to the existing badge component) indicating the keyword is available to add
   - Clicked/used state: the keyword is added to the Secondary Keywords tag list above, and the badge in the callout changes to a muted gray with reduced opacity to show it has already been added. Clicking a grayed-out keyword does nothing.
   - If the user manually removes a keyword from the tag list that was previously suggested, the corresponding badge in the callout should return to its clickable accent-colored state.

4. **Persistence:** The callout stays open until the user navigates away or clicks a small "x" dismiss button in the top-right corner of the callout. If the user changes the H1, Primary Keyword, Project Name, or Project Description after suggestions have been generated, show a small "Refresh" link inside the callout so they can re-run the suggestion with updated context.

## API Endpoint

Use the existing endpoint: `POST /api/project-creation/suggest-keywords` (`app/api/project-creation/suggest-keywords/route.ts`).

### What to Change in the API

The current endpoint only sends `headline` and `primaryKeyword` to the SEO agent. Update it to also accept and forward:

- `projectName` — the project title; gives the agent context about the broader campaign or content initiative
- `projectDescription` — the project description; provides goal/audience/angle context that shapes which keywords are strategically relevant vs. generic
- `existingKeywords` — any secondary keywords the user has already added, so the agent avoids duplicates and suggests complementary terms instead

### Updated Request Body

```json
{
  "headline": "The Complete Guide to Project Management for Remote Teams",
  "primaryKeyword": "project management software",
  "projectName": "Q4 SaaS Landing Page Campaign",
  "projectDescription": "Targeting mid-market SaaS buyers evaluating PM tools. Goal is trial signups.",
  "existingKeywords": ["remote work tools", "team collaboration"]
}
```

## AI Agent Instructions

Update the prompt sent to `generateKeywordSuggestions` in `lib/agents/seo-optimization.ts` to produce higher-quality, more contextually relevant keywords. The current prompt is generic. Replace it with a richer prompt that instructs the SEO agent to:

1. **Analyze search intent.** Determine whether the content is informational, transactional, navigational, or commercial-investigation. Tailor keyword suggestions to match that intent.

2. **Consider the full project context.** Use the project name and description to understand the audience, goal, and angle — not just the topic. A project targeting "mid-market SaaS buyers" should produce different keywords than one targeting "enterprise CIOs," even if the H1 is identical.

3. **Generate three tiers of keywords:**
   - **Close semantic variations** (5-6): synonyms and rephrasing of the primary keyword that a searcher might also use (e.g., "project management tool" for "project management software")
   - **Supporting topic keywords** (5-6): related concepts that a comprehensive article on this topic should cover to demonstrate topical authority (e.g., "task delegation," "Gantt chart," "sprint planning")
   - **Long-tail phrases** (4-5): specific 3-5 word phrases with lower competition but high relevance that will help the content rank for niche queries (e.g., "best project management app for remote teams")

4. **Avoid duplicating the primary keyword or any existing secondary keywords.** The agent receives these explicitly — it must not suggest them again.

5. **Prioritize keywords that serve double duty** — useful for SEO ranking AND useful for the Content Generation agent to produce better, more detailed writing. Keywords like "onboarding workflow" aren't just SEO signals; they prompt the writer to include a section on onboarding, which makes the article more thorough.

6. **Return 15-17 keywords total** across all three tiers. The JSON response format stays the same:

```json
{
  "secondary": ["close variation 1", "close variation 2", "supporting topic 1", "supporting topic 2"],
  "longTail": ["long tail phrase 1", "long tail phrase 2"]
}
```

## Implementation Checklist

- [ ] Add "Suggest Keywords" text link + sparkle icon below the secondary keywords input in `NewProjectPageClient.tsx`
- [ ] Add state for: `suggestedKeywords`, `suggestionsLoading`, `showSuggestions`, `usedSuggestions`
- [ ] On click: call the API with all five fields (headline, primaryKeyword, projectName, projectDescription, existingKeywords)
- [ ] Render the callout box with clickable keyword badges; track which ones have been used
- [ ] Sync used state with the actual secondary keywords list (if a keyword is removed from tags, un-gray it in the callout)
- [ ] Update `app/api/project-creation/suggest-keywords/route.ts` to accept and forward the new fields
- [ ] Update `generateKeywordSuggestions` in `lib/agents/seo-optimization.ts` with the richer prompt described above
- [ ] Add "Refresh" link to the callout when input fields change after suggestions were generated
- [ ] Add dismiss "x" button to the callout

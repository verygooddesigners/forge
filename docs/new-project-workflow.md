# How the New Project Workflow Works

This document walks through every step of what happens when someone creates a new project in Forge, from the moment they press the button to the moment they have a finished article ready for review. It covers what the user sees, what Forge does behind the scenes, and how every piece fits together.

---

## Starting a New Project

When a user clicks **Create New Project**, they are taken to the project creation form. This form asks for the basic information Forge needs to get started:

- **Headline** — The working title for the article (e.g., "2026 NFL Draft: Top 10 Quarterback Prospects")
- **Primary Keyword** — The main search term the article should rank for (e.g., "NFL Draft quarterback prospects")
- **Secondary Keywords** — Additional search terms that support the primary keyword
- **Topic** — The general subject area (e.g., NFL, NBA, Sports Betting)
- **Additional Details** — Any extra context or instructions the user wants to provide

### Choosing a Writer Model

The form also includes a **Writer Model** dropdown. A writer model is a custom AI profile trained on a specific person's writing — it knows that person's tone, vocabulary, sentence style, and habits so that the AI-generated content sounds like them rather than sounding generic.

The dropdown is organized into two groups:

- **"Your Model"** — The user's own personal writer model, trained on articles they've written
- **"RotoWire Models"** — Shared models that an admin has marked as company-wide options (called "house models"), available to everyone

The form automatically pre-selects the user's **default writer model**, which is assigned by an admin in the Admin Dashboard. If the user wants to use a different model for this particular project, they can change it in the dropdown, but in most cases the default will be the right choice.

### Choosing a SmartBrief

The user also selects a **SmartBrief** — a reusable template that tells the AI how to structure and format the article. Think of it like a recipe card: it defines what sections should appear, what tone to use, how long the article should be, and what patterns to follow. SmartBriefs are created ahead of time and can be reused across many projects.

### What Happens When You Press "Create"

When the user clicks the **Create** button, two things happen immediately:

1. **The project is saved** — Forge creates a record for this project in the database with all the information from the form.
2. **The Research Hub opens** — Instead of going straight to a blank writing screen, the user is taken to a new full-screen view called the **Research Hub**. This is where Forge's automated research process runs.

---

## The Research Hub

The Research Hub is a live activity screen that shows the user what Forge is doing behind the scenes as it researches their topic. It looks like a status feed — lines of text appear one by one as each step completes, similar to watching a progress log. The user doesn't need to do anything during this phase; they just watch as Forge works.

At the top of the screen, the project name and headline are displayed so the user knows which project is being researched.

### What the Research Process Does

Behind the scenes, a system called the **Research Orchestrator** is running. Think of it as a project manager that coordinates several specialized tools to gather, verify, and organize information. Here is exactly what happens, step by step:

#### Step 1: Search for Relevant Stories

The Research Orchestrator sends the project's headline, keywords, and topic to a news search engine (powered by Tavily AI). This search looks for recent, relevant articles and stories from across the internet that relate to the project's subject matter. It prioritizes trusted sources that have been pre-approved by the RotoWire team.

The activity feed shows something like: *"Searching for stories about NFL Draft quarterback prospects..."*

#### Step 2: Evaluate the Results

The search results are passed to a **Quality Evaluator** that reviews each story and asks: Is this actually relevant to the topic? Is it recent enough to be useful? Does it come from a credible source? Stories that don't meet the bar are filtered out.

The activity feed shows something like: *"Evaluating 12 stories for relevance and quality..."*

#### Step 3: Verify the Facts

The surviving stories are sent to a **Fact Verification** check. This step looks at the key claims in each story and cross-references them to see if the information is consistent and accurate. Each story gets a verification status:

- **Verified** — The key facts check out and are supported by other sources
- **Unresolved Conflict** — Some facts in the story conflict with other sources, so the user should be cautious

The activity feed shows something like: *"Verifying facts across 8 qualified stories..."*

#### Step 4: Follow Up on Conflicts (If Needed)

If the Fact Verification step finds conflicting information — for example, two stories disagree about a player's draft status — the Research Orchestrator automatically runs a **follow-up search** specifically targeting those disputed claims. It searches for additional sources to try to resolve the conflict.

This follow-up loop can happen up to four times. Each time, the system checks: Are there still unresolved disputes? If yes, it searches again with more specific queries. If no, it moves on.

The activity feed shows something like: *"Conflicting information found about draft combine results. Running follow-up search..."*

#### Step 5: Corroborate Key Claims

On the second pass through the research loop, the system also runs a **proactive corroboration** step. This means it takes the most important claims from the research and independently searches for them to make sure they are backed up by multiple sources — even if no conflicts were flagged. This is an extra layer of accuracy checking.

The activity feed shows something like: *"Independently verifying 5 key claims..."*

#### Step 6: Discover Keywords

Once the research stories are finalized, the system passes everything to the **SEO Agent** (the part of Forge that handles search engine optimization). The SEO Agent analyzes the research material and generates a list of **suggested keywords** — search terms that would be smart to include in the article to help it rank higher in Google.

Each suggested keyword is given an importance rating:

- **High** — Strongly recommended; closely tied to the topic and likely to boost search rankings
- **Medium** — Useful to include if it fits naturally
- **Low** — Nice to have but not critical

The activity feed shows something like: *"Generating keyword suggestions based on research..."*

#### Step 7: Save Everything and Move On

When all steps are complete, the Research Orchestrator saves everything it found:

- The list of researched stories with their sources, summaries, and verification statuses
- The suggested keywords with their importance ratings
- A complete log of every step that was taken (the activity feed content)

The activity feed shows something like: *"Research complete. 7 verified stories and 15 keyword suggestions ready."*

### What the User Sees During Research

Throughout this process, the user sees a **stage indicator** at the top of the Research Hub that shows which phase the system is currently in:

**Searching → Evaluating → Verifying → Discovering Keywords → Complete**

This is not a percentage-based progress bar — it is a series of labeled stages so the user knows roughly where things stand without needing exact numbers.

### Automatic Transition to the Editor

When research finishes, the Research Hub automatically closes and the user is taken to the **Editor Screen** — the main workspace where they will review the research, select what to use, and generate their article.

---

## The Editor Screen

The Editor Screen is where the actual article writing happens. It has three main areas:

1. **The Editor** (center) — A rich text editor where the article content appears and can be edited
2. **The Right Sidebar** — Displays the research results and SEO tools
3. **The Toolbar** (top) — Contains buttons for actions and settings

At this point, the editor is empty — no content has been generated yet. The user's first job is to review the research that Forge gathered and decide what to use.

### The Right Sidebar: Research Section

The right sidebar now shows a **Research** section at the top. This replaces what used to be a display of the writer model and SmartBrief selection (those settings have moved elsewhere — more on that below).

The Research section contains **story cards** — one card for each story that the Research Orchestrator found and kept. Each story card shows:

- **Title** — The headline of the source article (clickable — opens the original article in a new tab so the user can read the full thing)
- **Source** — Where the story came from (e.g., ESPN, The Athletic, RotoWire)
- **Synopsis** — A short summary of what the story covers and why it's relevant
- **Verification Badge** — A small label showing either "Verified" (facts checked out) or "Unresolved Conflict" (some facts are disputed)
- **Checkmark Toggle** — A checkbox that lets the user select or deselect this story for use in content generation

The top 3 to 5 stories are **pre-selected by default** based on which ones the Research Orchestrator ranked as most relevant and well-verified. The user can change these selections — checking additional stories they want to include or unchecking ones they don't.

If a user selects a story that hasn't been fully verified yet, Forge will automatically run a quick fact-check on it at that moment.

### The Right Sidebar: SEO and Keywords Section

Below the Research section, the sidebar shows the **SEO** tools. Before any content is generated, this section looks different from its post-generation state:

**Before content is generated:**

- The keyword suggestions from the research phase are displayed as **colored pills** (small rounded labels):
  - **Green pills** = High importance keywords
  - **Amber/yellow pills** = Medium importance keywords
  - **Gray pills** = Low importance keywords
- Each pill also has a small text label ("High", "Med", or "Low") so that color alone isn't the only way to tell importance
- Clicking a keyword pill **selects it** — this tells Forge to specifically target that keyword when generating content
- The content score meter, content structure section, and detailed term analysis are hidden at this stage because there is no content to analyze yet

**After content is generated:**

- The content score meter appears, showing how well-optimized the article is
- The content structure section appears, analyzing headings, paragraphs, and formatting
- The keyword pills remain visible, but now they also show whether each keyword actually appears in the generated content
- The "Auto-Optimize" button has been removed entirely from this view

The **Outline tab** has also been removed from the SEO sidebar. The sidebar now has two tabs instead of three: the main SEO analysis tab and the Brief tab (which shows the SmartBrief content).

### The Toolbar: Project Settings

At the top of the editor, the toolbar now includes a **Project Settings** button (with a gear/settings icon) placed next to the existing Twigs button. Clicking it opens a settings panel where the user can view and change:

- **Writer Model** — Switch to a different writer model if needed (same grouped dropdown as the creation form)
- **SmartBrief** — Switch to a different SmartBrief template
- **Project Name, Description, and Keywords** — Edit the basic project information

These settings used to be displayed in the right sidebar, but have been moved here to keep the sidebar focused on research and SEO.

### The Generation Context Strip

A new **context strip** appears near the toolbar area. This is a slim bar that shows the user a summary of everything that will be fed into the AI when they generate content:

- **N selected stories** — How many research stories are checked
- **N selected keywords** — How many keyword pills are selected
- **SmartBrief: [name]** — Which template is being used
- **Writer Model: [name]** — Which writing style the AI will mimic

This strip is collapsible so it doesn't take up space when the user doesn't need to see it. The **Generate Content** button lives here — it has been moved from the main toolbar to this context strip so that everything related to generation is in one place.

---

## Generating Content

When the user is satisfied with their research selections and keyword choices, they click the **Generate Content** button on the context strip. Here's what Forge sends to the AI:

1. **The selected research stories** — Full content and verified facts from every story the user checked in the sidebar
2. **The selected keywords** — Every keyword pill the user clicked, which the AI will naturally weave into the article
3. **The SmartBrief** — The structural template that tells the AI how to format and organize the article
4. **The Writer Model** — The style profile that tells the AI how to sound like a specific person
5. **The project details** — Headline, topic, and any additional instructions

The AI then generates a complete article draft that:

- Incorporates facts and information from the selected research
- Targets the chosen keywords for search engine optimization
- Follows the structure and formatting rules from the SmartBrief
- Sounds like the person whose writer model was selected

The generated content appears in the editor, streaming in as it is written (the user can see it being typed out in real time). Once generation is complete, the SEO sidebar switches to its post-generation view — showing the content score, structural analysis, and keyword presence indicators.

The user can then edit the article freely using the editor, checking the SEO feedback as they work and making adjustments until they are happy with the final result.

### Internal Links

The editor toolbar includes an **Insert Internal Links** button. When clicked, this opens a window that:

1. Analyzes the article content
2. Finds relevant pages on the RotoWire website that could be linked to
3. Displays each suggested link with:
   - The page title
   - The URL
   - A suggestion for where in the article the link would fit best
   - A copy button so the user can quickly grab the URL

This helps ensure that every article includes links back to other RotoWire content, which is important for both reader experience and search rankings.

---

## Admin Features

### Assigning Default Writer Models

In the Admin Dashboard, under User Management, admins can now assign a **default writer model** to each user. This is the model that will be automatically selected when that user creates a new project.

To set it:

1. Go to **Admin Dashboard → User Management**
2. Click **Edit** on a user
3. In the edit dialog, find the new **Default Writer Model** dropdown
4. Select the appropriate model
5. Save

### Managing House Models

Admins can mark certain writer models as **house models**. House models are shared company-wide models that appear in every user's writer model dropdown under the "RotoWire Models" section. This is useful for generic brand voice models or team-wide style profiles that aren't tied to a specific individual.

---

## Summary: The Complete Journey

Here is the full journey from start to finish in one view:

1. **User clicks Create New Project** and fills out the form (headline, keywords, topic, writer model, SmartBrief)
2. **User clicks Create** — project is saved and the Research Hub opens
3. **Research Hub runs automatically** — Forge searches for stories, evaluates quality, verifies facts, resolves conflicts, and discovers keywords
4. **Research Hub completes** — the user is automatically taken to the Editor Screen
5. **User reviews research** — story cards in the sidebar let them select which stories to use, keyword pills let them choose which keywords to target
6. **User clicks Generate Content** — the AI writes a full article draft using the selected research, keywords, SmartBrief, and writer model
7. **User edits the article** — the SEO sidebar provides real-time optimization feedback as they refine the content
8. **User adds internal links** — the Internal Links tool suggests relevant RotoWire pages to link to
9. **Article is ready** — export and publish through the normal workflow

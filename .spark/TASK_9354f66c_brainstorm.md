# Forge Tools Infrastructure - Brainstorm

> **Task:** Brainstorm features and functions for the Forge Tools (plugins) system
> **Date:** 2026-02-17
> **Status:** Brainstorm (not building yet)

---

## What Already Exists (MVP Foundation)

Before brainstorming what's next, here's what's already built:

| Area | Status | Details |
|------|--------|---------|
| Database schema | Done | `tools`, `user_installed_tools`, `tool_permissions`, `tool_data` tables with RLS |
| API routes | Done | CRUD, install/uninstall/toggle, pending review endpoints |
| Marketplace UI | Done | Browse tools, search, tool cards with install buttons |
| Tool submission | Done | GitHub URL submission form |
| Admin review panel | Done | Approve/reject pending tools in Admin Dashboard |
| Permission system | Done | 12 permissions with risk levels (low/medium/high) |
| Tool registry | Skeleton | In-memory Map, manual integration only |
| Developer docs | Done | Getting started guide, manifest format, permissions reference |
| Sidebar integration | Done | Installed tools appear as nav items with Lucide icons |
| Data isolation | Done | Per-tool, per-user key-value storage via `tool_data` table |

**Key gap:** Tools are registered manually after approval. There's no actual runtime loading from GitHub repos - the `entrypoint` and `api_routes` in the manifest are documented but not functional yet.

---

## Architecture Decisions to Make

### 1. Tool Execution Model

How do tools actually run inside Forge? Three options:

**Option A: Bundled Integration (Current direction)**
- Tools are React components bundled into Forge at build time
- Admin approves → developer's code gets merged/imported into Forge
- Pros: Full access to Forge internals, best performance, consistent UX
- Cons: Requires rebuild/redeploy for each new tool, security risk (untrusted code in main bundle)

**Option B: iframe Sandboxing**
- Tools run in sandboxed iframes, hosted separately (e.g., on their own Vercel deployment)
- Communication via `postMessage` API with a Forge SDK
- Pros: Complete security isolation, tools can use any framework, no rebuild needed
- Cons: More complex UX integration, latency for cross-frame communication, harder to match Forge's design system

**Option C: Hybrid (Recommended)**
- **First-party tools** (built by Forge team/trusted developers): Bundled integration with full access
- **Third-party tools**: iframe sandboxed with a Forge SDK for API access
- The admin review process determines which tier a tool gets
- Pros: Best of both worlds, security where needed, performance for trusted tools
- Cons: More complex to build and maintain

### 2. Tool Distribution Model

How do tools get from a developer's repo to running in Forge?

**Option A: GitHub-Based (Current)**
- Developer submits GitHub URL → admin reviews → manual integration
- Simple but doesn't scale

**Option B: NPM Package Registry**
- Tools are published as npm packages (e.g., `@forge-tools/seo-analyzer-pro`)
- Forge installs them at build time or runtime via dynamic imports
- Pros: Standard tooling, versioning for free, dependency management
- Cons: More complex for non-JS developers

**Option C: Forge Tool Registry (Recommended)**
- Forge hosts its own tool registry (like a mini npm)
- Tools are uploaded as bundles (built artifacts, not source code)
- Admin approval gates what enters the registry
- Users install from the marketplace; Forge loads the bundle at runtime
- Pros: Full control, no external dependency, can enforce standards
- Cons: More infrastructure to build

---

## Feature Brainstorm: Core Platform

### Tool SDK (forge-sdk)

A JavaScript/TypeScript SDK that tool developers import to interact with Forge:

```typescript
import { ForgeSDK } from '@forge/sdk';

const forge = ForgeSDK.init({
  toolId: 'my-tool',
  permissions: ['projects.read', 'ai.generate']
});

// Access Forge data (permission-gated)
const projects = await forge.projects.list();
const brief = await forge.briefs.get(briefId);

// Use Forge AI
const content = await forge.ai.generate({
  prompt: 'Write an intro paragraph about...',
  writerModel: modelId,
});

// Persist tool-specific data
await forge.data.set('user_prefs', { theme: 'dark' });
const prefs = await forge.data.get('user_prefs');

// Access current user context
const user = forge.context.user;
const currentProject = forge.context.activeProject;

// Subscribe to Forge events
forge.events.on('project.created', (project) => { ... });
forge.events.on('content.generated', (content) => { ... });

// Navigate within Forge
forge.navigation.openProject(projectId);
forge.navigation.showNotification('Analysis complete!');
```

### Tool Lifecycle Hooks

Tools can hook into Forge events to add functionality without a full UI:

```json
{
  "hooks": {
    "onProjectCreate": "src/hooks/on-project-create.ts",
    "onContentGenerate": "src/hooks/on-content-generate.ts",
    "onSEOAnalyze": "src/hooks/on-seo-analyze.ts",
    "onPublish": "src/hooks/on-publish.ts",
    "onBriefCreate": "src/hooks/on-brief-create.ts"
  }
}
```

This lets tools be more than just pages - they can augment existing workflows. For example:
- A "Plagiarism Checker" tool that runs automatically after content generation
- A "Style Enforcer" tool that validates content against brand guidelines on save
- A "Social Snippet Generator" that auto-creates social posts when an article is published

### Tool UI Extension Points

Beyond the sidebar, tools should be able to inject UI into specific locations:

| Extension Point | Description | Example |
|----------------|-------------|---------|
| `sidebar.page` | Full page in the sidebar (current) | Analytics dashboard |
| `editor.toolbar` | Button(s) in the TipTap editor toolbar | "Insert Data Table" button |
| `editor.sidebar` | Panel in the right sidebar alongside SEO | "Readability Score" panel |
| `project.panel` | Tab in the projects panel | "AI Suggestions" tab |
| `dashboard.widget` | Card on the dashboard home | "Today's Stats" widget |
| `context.menu` | Right-click context menu in editor | "Translate Selection" option |
| `modal.action` | Triggered via command palette or shortcut | "Quick Fact Check" modal |
| `settings.page` | Tool settings page under Settings | Tool configuration |

### Tool Configuration Schema

Tools should be able to declare a settings schema that Forge renders automatically:

```json
{
  "settings": {
    "schema": [
      {
        "key": "api_key",
        "type": "secret",
        "label": "API Key",
        "description": "Your service API key",
        "required": true
      },
      {
        "key": "auto_analyze",
        "type": "boolean",
        "label": "Auto-analyze on save",
        "default": true
      },
      {
        "key": "language",
        "type": "select",
        "label": "Default Language",
        "options": ["English", "Spanish", "French"],
        "default": "English"
      }
    ]
  }
}
```

---

## Feature Brainstorm: Marketplace

### Categories & Tags

Add categorization to help users discover tools:

**Categories:**
- Content Creation (AI generators, templates, formatters)
- SEO & Analytics (analyzers, keyword tools, rank trackers)
- Research & Data (news aggregators, fact checkers, data scrapers)
- Publishing & Export (CMS integrations, social media, email)
- Workflow & Productivity (task management, collaboration, automation)
- Design & Media (image tools, formatting, layout)
- Integrations (third-party service connectors)
- Developer Tools (debugging, testing, API tools)

**Database changes needed:**
```sql
ALTER TABLE tools ADD COLUMN category TEXT;
ALTER TABLE tools ADD COLUMN tags TEXT[] DEFAULT '{}';
```

### Ratings & Reviews

Let users rate and review tools:

```sql
CREATE TABLE tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);
```

Display: Star rating, review count, and text reviews on tool profile pages. Average rating shown on marketplace cards.

### Featured & Curated Collections

- **Featured Tools**: Admin-curated spotlight on the marketplace homepage
- **Staff Picks**: Tools the Forge team personally recommends
- **New This Week**: Recently approved tools
- **Most Popular**: Sorted by install count
- **Trending**: Based on install velocity (installs in last 7 days)
- **Collections**: Curated groups like "Essential SEO Bundle", "Beginner's Toolkit"

### Tool Badges

Visual trust indicators on tool cards:

| Badge | Meaning |
|-------|---------|
| Verified | Code reviewed and vetted by Forge team |
| Official | Built by the Forge team |
| Popular | 100+ installs |
| New | Published in last 30 days |
| Trusted Developer | Developer has 3+ approved tools |

### Changelogs & Update Notifications

- Tool developers publish version notes with each update
- Users see a notification badge when installed tools have updates
- Update log visible on the tool profile page
- Admin can review updates before they go live (optional for verified developers)

---

## Feature Brainstorm: Admin Dashboard

### Enhanced Review Workflow

Beyond simple approve/reject, the admin needs:

1. **Code Review Panel**: View the tool's GitHub repo directly in the admin dashboard (embed GitHub file viewer or fetch README/manifest)
2. **Automated Security Scan**: When a tool is submitted, automatically check for:
   - Suspicious network requests in the code
   - Use of `eval()` or other dangerous patterns
   - Dependencies with known vulnerabilities
   - Excessive permission requests relative to what the code actually does
3. **Review Checklist**: Standardized checklist for reviewers:
   - [ ] Manifest is valid and complete
   - [ ] Permissions requested are reasonable for functionality
   - [ ] No security concerns in code review
   - [ ] UI follows Forge design patterns
   - [ ] Tool actually works (functional test)
   - [ ] README/documentation is adequate
4. **Review Notes**: Admin can leave internal notes during review (not visible to submitter)
5. **Request Changes**: Instead of reject, ask the developer to make specific changes
6. **Conditional Approval**: Approve with conditions (e.g., "approved for first-party only" or "approved with reduced permissions")

### Tool Analytics Dashboard

The Super Admin should see:

- **Install analytics**: Total installs, installs per tool, install/uninstall trends over time
- **Usage analytics**: How often each tool is opened/used, active users per tool
- **Permission usage**: Which permissions are most commonly requested
- **Submission pipeline**: Tools pending, approved, rejected over time
- **Performance metrics**: If tools report errors or slow performance
- **User feedback summary**: Aggregate ratings and common complaints

### Tool Management

Admin panel for managing the full tool ecosystem:

- **All Tools view**: Not just pending, but all tools with filters (status, category, author)
- **Disable/Archive**: Temporarily disable a tool without deleting it
- **Force Uninstall**: Remove a tool from all users if a security issue is found
- **Feature/Promote**: Mark tools as featured from the admin panel
- **Developer Management**: View all developers who've submitted tools, their track record
- **Permission Management**: Add/edit/remove available permissions from the admin UI

---

## Feature Brainstorm: Developer Experience

### CLI Tool (forge-cli)

```bash
# Scaffold a new tool
forge-cli create my-tool

# Run locally with hot reload (embedded in Forge dev environment)
forge-cli dev

# Validate manifest and permissions
forge-cli validate

# Build for production
forge-cli build

# Submit for review (opens in Forge UI)
forge-cli submit
```

### Local Development Environment

Developers need to test tools locally against a real Forge instance:

- **Dev mode flag**: `FORGE_DEV_TOOLS=true` in env enables loading tools from local filesystem
- **Hot reload**: Tool code changes reflect immediately in the Forge UI
- **Mock data**: SDK provides mock projects/briefs/user data for testing without real data
- **Permission simulator**: Test what happens when permissions are granted vs. denied

### Tool Template Repository

GitHub template repo (`forge-tool-template`) with:

- Pre-configured TypeScript + React setup
- Forge SDK pre-installed
- Example manifest
- Example component with all extension points demonstrated
- Testing utilities
- CI/CD workflow for building and validating

### Developer Portal Features

Enhanced version of the current `/tools/docs` page:

- **Interactive API Explorer**: Test SDK methods against sandbox data
- **Manifest Generator**: Wizard that generates `tool-manifest.json`
- **Permission Calculator**: Select what your tool does, get recommended permissions
- **UI Component Gallery**: Forge design system components available to tools
- **Example Gallery**: Real-world examples of different tool types
- **Changelog**: What's new in the Tools platform itself

---

## Feature Brainstorm: Security & Sandboxing

### Permission Granularity

Expand beyond the current 12 permissions:

**New permissions to consider:**
- `ai.generate.stream` - Stream AI content (vs. batch)
- `ai.analyze` - Use AI for analysis without generation
- `editor.read` - Read current editor content
- `editor.write` - Modify current editor content
- `editor.toolbar` - Add buttons to the editor toolbar
- `settings.read` - Read Forge app settings
- `notifications.send` - Send notifications to the user
- `external.fetch` - Make requests to external URLs (critical for security)
- `tools.communicate` - Communicate with other installed tools
- `storage.files` - Upload/manage files (vs. just key-value data)
- `webhooks.register` - Register for event webhooks

### Rate Limiting

Prevent tools from abusing Forge APIs:

- Per-tool API rate limits (e.g., 100 requests/minute for AI generation)
- Configurable by admin per tool or per permission level
- Dashboard shows tools approaching limits
- Throttling with user-friendly error messages in the SDK

### Content Security Policy

For iframe-sandboxed tools:

- Strict CSP headers preventing access to Forge's cookie/session
- Allowlist of external domains the tool can communicate with (declared in manifest)
- All Forge API access goes through the SDK (which uses `postMessage` with origin validation)

### Audit Logging

Track what tools do for security:

```sql
CREATE TABLE tool_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Admin can review: "Tool X read 47 projects for User Y in the last hour" - unusual activity flagging.

---

## Feature Brainstorm: Advanced Capabilities

### Tool-to-Tool Communication

Tools should be able to declare "provides" and "requires" interfaces:

```json
{
  "provides": {
    "seo-data": {
      "description": "Provides SEO analysis data",
      "schema": { "score": "number", "suggestions": "string[]" }
    }
  },
  "requires": {
    "content-data": {
      "from": "any",
      "description": "Needs access to content analysis"
    }
  }
}
```

This enables a composable ecosystem where, for example, an "SEO Dashboard" tool can consume data from a "Keyword Analyzer" tool.

### Webhook System

Tools can register for real-time events:

```typescript
forge.webhooks.register({
  event: 'project.published',
  url: 'https://my-service.com/webhook',
  secret: 'webhook-secret-123',
});
```

Events: `project.created`, `project.updated`, `project.published`, `brief.created`, `content.generated`, `seo.analyzed`, `user.login`, `tool.installed`, `tool.uninstalled`

### AI Agent Extension

Tools could extend Forge's AI agent system:

```json
{
  "agents": [
    {
      "name": "Brand Voice Analyzer",
      "description": "Analyzes content against brand voice guidelines",
      "system_prompt": "You are a brand voice expert...",
      "triggers": ["content.generated", "manual"]
    }
  ]
}
```

This would allow tools to add new AI agents that participate in Forge's content pipeline.

### Shared Component Library

Provide Forge UI components to tool developers so their tools look native:

```typescript
import { ForgeCard, ForgeBadge, ForgeChart } from '@forge/ui';
```

Components would automatically match Forge's theme, dark mode, design tokens, etc.

---

## Tool Ideas (First-Party / Examples)

These would serve as reference implementations and useful features:

| Tool Name | Description | Permissions |
|-----------|-------------|-------------|
| **Competitor Analyzer** | Analyze competitor articles for a given keyword | `ai.generate`, `seo.analyze`, `news.search` |
| **Content Calendar** | Visual calendar for planning and scheduling content | `projects.read`, `projects.write`, `briefs.read` |
| **Plagiarism Checker** | Scan content against web sources for originality | `projects.read`, `ai.analyze` |
| **Social Snippets** | Auto-generate social media posts from articles | `projects.read`, `ai.generate` |
| **Translation Hub** | Translate content to multiple languages | `projects.read`, `projects.write`, `ai.generate` |
| **Image Generator** | Generate article images using AI | `projects.read`, `ai.generate` |
| **Analytics Dashboard** | Track content performance metrics | `projects.read`, `data.export` |
| **Bulk Exporter** | Export multiple articles in various formats | `projects.read`, `data.export` |
| **Style Guide Enforcer** | Validate content against custom style rules | `projects.read`, `editor.read` |
| **Headline A/B Tester** | Generate and test multiple headline options | `projects.read`, `projects.write`, `ai.generate` |
| **Content Repurposer** | Transform articles into different formats (listicle, Q&A, summary) | `projects.read`, `ai.generate` |
| **Internal Linking AI** | Suggest internal links between your articles | `projects.read`, `seo.analyze` |

---

## Implementation Priority (Suggested Phases)

### Phase 1: Foundation (Complete the MVP)
- [ ] Make the existing tool registry actually load and render tool components
- [ ] Build the Forge SDK (basic version with data access + storage)
- [ ] Create one first-party example tool to prove the architecture
- [ ] Add categories and tags to the tools table and marketplace UI
- [ ] Enhance admin review with code preview and review checklist

### Phase 2: Developer Experience
- [ ] Tool template repository on GitHub
- [ ] CLI scaffolding tool
- [ ] Local development mode
- [ ] Enhanced developer documentation with interactive examples
- [ ] Manifest generator wizard

### Phase 3: Marketplace Growth
- [ ] Ratings and reviews system
- [ ] Featured/curated collections
- [ ] Tool badges (Verified, Official, Popular)
- [ ] Changelogs and update notifications
- [ ] Tool analytics dashboard for admins

### Phase 4: Advanced Platform
- [ ] iframe sandboxing for third-party tools
- [ ] UI extension points beyond sidebar (toolbar, panels, widgets)
- [ ] Tool lifecycle hooks (events system)
- [ ] Tool-to-tool communication
- [ ] Rate limiting and audit logging
- [ ] Webhook system

### Phase 5: Ecosystem
- [ ] AI agent extensions
- [ ] Shared component library
- [ ] Developer portal with API explorer
- [ ] Monetization support (paid tools)
- [ ] Tool versioning with rollback support
- [ ] Automated security scanning pipeline

---

## Open Questions for Discussion

1. **Who are the tool developers?** Internal team only, or open to external developers? This significantly affects security requirements.
2. **Build vs. runtime loading?** Do we rebuild and redeploy Forge each time a tool is approved, or load tools dynamically at runtime?
3. **Tool hosting:** Do tool developers host their own backend services, or does Forge provide serverless functions?
4. **Monetization:** Will there ever be paid tools? If so, how does billing work?
5. **Versioning strategy:** When a tool is updated, do all users get the update automatically, or do they opt in?
6. **Mobile/responsive:** Do tools need to work on mobile, or is Forge desktop-only?
7. **Offline capability:** Should tools work when the user is offline?
8. **Multi-tenant considerations:** If Forge serves multiple organizations, are tools scoped per-org or global?

---

*This brainstorm is a living document. Next step: Review and prioritize with the team, then move to implementation planning.*

# RotoWrite Tools/Plugins Marketplace System

A WordPress-style plugin ecosystem for RotoWrite that enables developers to create, submit, and publish custom tools that extend the platform's functionality.

## Overview

The RotoWrite Tools system allows developers (including those using AI coding assistants) to build full-stack plugins that integrate seamlessly with RotoWrite. Tools are submitted via GitHub repositories, reviewed by admins, and published to a marketplace where users can discover and install them.

## Architecture

```
Developer → GitHub Repo → Submission Form → Admin Review → Marketplace → User Installation → Sidebar Integration
```

## Key Features

### For Developers
- **Full-stack tools**: Build React UI components + API routes + database storage
- **Permission system**: Request specific permissions (read/write projects, use AI, etc.)
- **Isolated data storage**: Each tool gets its own data space per user
- **GitHub-based submission**: Submit tools via public GitHub repositories
- **Comprehensive docs**: Complete developer documentation with examples

### For Users
- **Marketplace**: Browse and search available tools
- **One-click install**: Install tools with a single click
- **Sidebar integration**: Installed tools appear as individual sidebar menu items
- **Permission transparency**: See exactly what permissions each tool requires

### For Admins
- **Review dashboard**: Approve or reject tool submissions
- **Permission control**: Review requested permissions before approval
- **Tool management**: Archive or remove tools as needed

## Database Schema

### Tables Created

1. **tools** - Registry of all tools (approved and pending)
2. **user_installed_tools** - Tracks which users have installed which tools
3. **tool_permissions** - Permission definitions
4. **tool_data** - Isolated data storage for each tool per user

See `supabase/migrations/00012_tools_system.sql` for complete schema.

## File Structure

```
app/
├── tools/
│   ├── page.tsx                    # Marketplace
│   ├── [slug]/page.tsx             # Tool profile
│   ├── submit/page.tsx             # Submission form
│   └── docs/page.tsx               # Developer docs
├── api/
│   └── tools/
│       ├── route.ts                # List/submit tools
│       ├── [toolId]/
│       │   ├── install/route.ts    # Install tool
│       │   ├── uninstall/route.ts  # Uninstall tool
│       │   └── toggle/route.ts     # Enable/disable
│       ├── my-tools/route.ts       # User's tools
│       └── pending/route.ts        # Admin review

components/
├── tools/
│   ├── ToolCard.tsx                # Marketplace card
│   ├── ToolPermissionBadge.tsx     # Permission display
│   └── ...
└── admin/
    └── ToolsAdmin.tsx              # Admin approval dashboard

lib/
├── tools/
│   ├── registry.ts                 # Tool loading system
│   └── permissions.ts              # Permission checking
└── types/
    └── tools.ts                    # TypeScript definitions

tools/
└── example-tool/                   # Example tool template
    ├── manifest.json
    └── README.md
```

## Tool Manifest Format

Every tool must include a `tool-manifest.json` file:

```json
{
  "name": "My Tool",
  "slug": "my-tool",
  "version": "1.0.0",
  "description": {
    "short": "Brief description",
    "long": "Full description..."
  },
  "author": "Your Name",
  "permissions": [
    "projects.read",
    "seo.analyze"
  ],
  "sidebar": {
    "label": "My Tool",
    "icon": "Package",
    "order": 100
  },
  "entrypoint": "src/index.tsx"
}
```

## Available Permissions

| Permission | Description | Risk Level |
|------------|-------------|------------|
| `projects.read` | View user's projects | LOW |
| `projects.write` | Create/modify projects | HIGH |
| `briefs.read` | View SmartBriefs | LOW |
| `briefs.write` | Create/modify SmartBriefs | MEDIUM |
| `writer_models.read` | View writer models | LOW |
| `seo.analyze` | Use SEO engine | LOW |
| `ai.generate` | Use AI generation | MEDIUM |
| `news.search` | Use NewsEngine | LOW |

## Development Workflow

### 1. Create Your Tool

```bash
mkdir rotowrite-my-tool
cd rotowrite-my-tool
git init

# Create manifest
cat > tool-manifest.json << EOF
{
  "name": "My Tool",
  "slug": "my-tool",
  ...
}
EOF
```

### 2. Build Your Tool

- Create React components using RotoWrite's design system
- Add API routes if needed
- Request only necessary permissions
- Test thoroughly

### 3. Submit for Review

1. Push to GitHub (public repository)
2. Visit `/tools/submit` in RotoWrite
3. Enter your GitHub repository URL
4. Wait for admin approval

### 4. After Approval

- Tool appears in marketplace
- Users can install it
- Tool appears in their sidebar

## API Routes

### Public Routes

- `GET /api/tools` - List approved tools
- `GET /api/tools/[toolId]` - Get tool details
- `POST /api/tools/[toolId]/install` - Install tool
- `POST /api/tools/[toolId]/uninstall` - Uninstall tool
- `GET /api/tools/my-tools` - Get user's installed tools

### Admin Routes

- `GET /api/tools/pending` - List pending submissions
- `PUT /api/tools/[toolId]` - Approve/reject tool
- `DELETE /api/tools/[toolId]` - Delete tool

## Security

1. **Code Review Required**: All tools manually reviewed before approval
2. **Permission Scoping**: Tools only access data they're granted
3. **RLS Enforcement**: Database policies prevent unauthorized access
4. **API Isolation**: Tool API routes namespaced under `/api/tools/[slug]/`
5. **Data Isolation**: Tool data scoped to tool_id + user_id

## UI Integration

### Marketplace
- Grid layout with search/filter
- Tool cards show name, description, install count
- One-click install

### Tool Profile
- Full description
- Permission list with explanations
- Install/uninstall buttons
- GitHub link

### Sidebar
- Installed tools appear as menu items
- Custom icon and label per tool
- Ordered by `sidebar_order` field
- "Browse Tools..." link at bottom

### Admin Dashboard
- New "Tools" tab
- List of pending submissions
- Approve/reject buttons
- View GitHub repo
- See requested permissions

## Future Enhancements

- Tool ratings/reviews
- Usage analytics for developers
- Paid tools (marketplace revenue)
- Tool categories/tags
- Version management (updates)
- Webhooks for tool events
- Sandbox environment for testing
- Automated manifest validation from GitHub

## Migration

Run the migration to set up the database:

```sql
-- In Supabase SQL Editor
-- Run: supabase/migrations/00012_tools_system.sql
```

## Testing

1. **As Developer**:
   - Submit a test tool
   - Verify submission appears in admin panel

2. **As Admin**:
   - Review and approve tool
   - Verify tool appears in marketplace

3. **As User**:
   - Browse marketplace
   - Install tool
   - Verify tool appears in sidebar
   - Test tool functionality
   - Uninstall tool

## Support

For questions or issues:
- Check `/tools/docs` for developer documentation
- Review example tool in `tools/example-tool/`
- Contact admin team

---

**Built with**: Next.js 14, React 19, TypeScript, Supabase, Shadcn UI

**Version**: 1.0.0

**Last Updated**: January 2026

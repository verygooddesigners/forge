'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BookOpen, Code, Package, Shield, Database, Zap } from 'lucide-react';
import Link from 'next/link';

export function ToolsDocsClient() {
  return (
    <div className="min-h-screen bg-bg-primary p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-primary">
              RotoWrite Tools Developer Documentation
            </h1>
            <p className="text-text-secondary mt-2">
              Build powerful plugins to extend RotoWrite's functionality
            </p>
          </div>
          <Link href="/tools">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 hover:border-violet-500 transition-colors cursor-pointer">
            <BookOpen className="w-8 h-8 text-violet-500 mb-2" />
            <h3 className="font-semibold text-text-primary">Getting Started</h3>
            <p className="text-sm text-text-secondary mt-1">
              Learn the basics
            </p>
          </Card>
          <Card className="p-4 hover:border-violet-500 transition-colors cursor-pointer">
            <Code className="w-8 h-8 text-violet-500 mb-2" />
            <h3 className="font-semibold text-text-primary">API Reference</h3>
            <p className="text-sm text-text-secondary mt-1">
              Complete API docs
            </p>
          </Card>
          <Card className="p-4 hover:border-violet-500 transition-colors cursor-pointer">
            <Package className="w-8 h-8 text-violet-500 mb-2" />
            <h3 className="font-semibold text-text-primary">Examples</h3>
            <p className="text-sm text-text-secondary mt-1">
              Sample tools
            </p>
          </Card>
        </div>

        {/* Main Documentation */}
        <Card className="p-8 prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Getting Started
          </h2>
          
          <p className="text-text-secondary">
            RotoWrite Tools are plugins that extend the functionality of RotoWrite. 
            They can add new features, integrate with external services, or provide custom workflows.
          </p>

          <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">
            What You Can Build
          </h3>
          
          <ul className="text-text-secondary space-y-2">
            <li>Custom content generators with specialized AI prompts</li>
            <li>Integrations with external APIs and services</li>
            <li>Data visualization and analytics dashboards</li>
            <li>Workflow automation tools</li>
            <li>Custom SEO analyzers and optimizers</li>
            <li>Content formatters and exporters</li>
          </ul>

          <Separator className="my-8" />

          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Tool Structure
          </h2>

          <p className="text-text-secondary mb-4">
            Every RotoWrite Tool must include a <code className="bg-bg-elevated px-2 py-1 rounded">tool-manifest.json</code> file 
            in the root of your GitHub repository.
          </p>

          <h3 className="text-xl font-semibold text-text-primary mt-6 mb-4">
            Manifest Format
          </h3>

          <pre className="bg-bg-elevated p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "name": "SEO Analyzer Pro",
  "slug": "seo-analyzer-pro",
  "version": "1.0.0",
  "description": {
    "short": "Advanced SEO analysis with competitor insights",
    "long": "A comprehensive SEO analysis tool that provides..."
  },
  "author": "Your Name",
  "permissions": [
    "projects.read",
    "projects.write",
    "seo.analyze"
  ],
  "sidebar": {
    "label": "SEO Pro",
    "icon": "BarChart3",
    "order": 100
  },
  "entrypoint": "src/index.tsx",
  "api_routes": [
    {
      "path": "/api/tools/seo-analyzer-pro/analyze",
      "handler": "src/api/analyze.ts"
    }
  ]
}`}
          </pre>

          <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">
            Manifest Fields
          </h3>

          <div className="space-y-4 text-text-secondary">
            <div>
              <strong className="text-text-primary">name</strong> (required) - Display name of your tool
            </div>
            <div>
              <strong className="text-text-primary">slug</strong> (required) - URL-safe identifier (lowercase, hyphens only)
            </div>
            <div>
              <strong className="text-text-primary">version</strong> (required) - Semantic version (e.g., "1.0.0")
            </div>
            <div>
              <strong className="text-text-primary">description.short</strong> (required) - Brief description for marketplace cards
            </div>
            <div>
              <strong className="text-text-primary">description.long</strong> (required) - Full description for tool profile page
            </div>
            <div>
              <strong className="text-text-primary">permissions</strong> (required) - Array of permission keys your tool needs
            </div>
            <div>
              <strong className="text-text-primary">sidebar.label</strong> (required) - Text shown in sidebar menu
            </div>
            <div>
              <strong className="text-text-primary">sidebar.icon</strong> (required) - Lucide icon name
            </div>
            <div>
              <strong className="text-text-primary">sidebar.order</strong> (required) - Display order (lower numbers appear first)
            </div>
          </div>

          <Separator className="my-8" />

          <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-violet-500" />
            Permission System
          </h2>

          <p className="text-text-secondary mb-4">
            Tools must request permissions to access RotoWrite data and features. 
            Users will see what permissions your tool requires before installing.
          </p>

          <h3 className="text-xl font-semibold text-text-primary mt-6 mb-4">
            Available Permissions
          </h3>

          <div className="space-y-3 text-sm">
            <div className="bg-bg-elevated p-3 rounded-lg">
              <code className="text-green-500">projects.read</code>
              <p className="text-text-secondary mt-1">View user's projects and their content</p>
              <span className="text-xs text-text-tertiary">Risk: LOW</span>
            </div>
            <div className="bg-bg-elevated p-3 rounded-lg">
              <code className="text-yellow-500">projects.write</code>
              <p className="text-text-secondary mt-1">Create and modify user's projects</p>
              <span className="text-xs text-text-tertiary">Risk: HIGH</span>
            </div>
            <div className="bg-bg-elevated p-3 rounded-lg">
              <code className="text-green-500">briefs.read</code>
              <p className="text-text-secondary mt-1">View user's SmartBriefs</p>
              <span className="text-xs text-text-tertiary">Risk: LOW</span>
            </div>
            <div className="bg-bg-elevated p-3 rounded-lg">
              <code className="text-yellow-500">briefs.write</code>
              <p className="text-text-secondary mt-1">Create and modify user's SmartBriefs</p>
              <span className="text-xs text-text-tertiary">Risk: MEDIUM</span>
            </div>
            <div className="bg-bg-elevated p-3 rounded-lg">
              <code className="text-green-500">seo.analyze</code>
              <p className="text-text-secondary mt-1">Use the SEO analysis engine</p>
              <span className="text-xs text-text-tertiary">Risk: LOW</span>
            </div>
            <div className="bg-bg-elevated p-3 rounded-lg">
              <code className="text-yellow-500">ai.generate</code>
              <p className="text-text-secondary mt-1">Use AI content generation features</p>
              <span className="text-xs text-text-tertiary">Risk: MEDIUM</span>
            </div>
            <div className="bg-bg-elevated p-3 rounded-lg">
              <code className="text-green-500">news.search</code>
              <p className="text-text-secondary mt-1">Search for news articles using NewsEngine</p>
              <span className="text-xs text-text-tertiary">Risk: LOW</span>
            </div>
          </div>

          <Separator className="my-8" />

          <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-violet-500" />
            Data Storage
          </h2>

          <p className="text-text-secondary mb-4">
            Each tool has access to isolated data storage scoped to the tool and user. 
            This allows you to persist settings, cache data, or store user preferences.
          </p>

          <h3 className="text-xl font-semibold text-text-primary mt-6 mb-4">
            Using Tool Data
          </h3>

          <pre className="bg-bg-elevated p-4 rounded-lg overflow-x-auto text-sm">
{`// Save data
await fetch('/api/tools/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool_id: 'your-tool-id',
    key: 'user_preferences',
    value: { theme: 'dark', notifications: true }
  })
});

// Retrieve data
const response = await fetch(
  '/api/tools/data?tool_id=your-tool-id&key=user_preferences'
);
const data = await response.json();`}
          </pre>

          <Separator className="my-8" />

          <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-500" />
            Development Workflow
          </h2>

          <h3 className="text-xl font-semibold text-text-primary mt-6 mb-4">
            Step 1: Create Your Repository
          </h3>

          <pre className="bg-bg-elevated p-4 rounded-lg overflow-x-auto text-sm">
{`# Create a new repository
mkdir rotowrite-my-tool
cd rotowrite-my-tool
git init

# Create manifest
cat > tool-manifest.json << EOF
{
  "name": "My Tool",
  "slug": "my-tool",
  "version": "1.0.0",
  ...
}
EOF`}
          </pre>

          <h3 className="text-xl font-semibold text-text-primary mt-6 mb-4">
            Step 2: Build Your Tool
          </h3>

          <p className="text-text-secondary mb-4">
            Create your tool's UI components and API routes. Tools are built with React and Next.js.
          </p>

          <h3 className="text-xl font-semibold text-text-primary mt-6 mb-4">
            Step 3: Test Locally
          </h3>

          <p className="text-text-secondary mb-4">
            Test your tool thoroughly before submission. Make sure all permissions work correctly.
          </p>

          <h3 className="text-xl font-semibold text-text-primary mt-6 mb-4">
            Step 4: Submit for Review
          </h3>

          <p className="text-text-secondary mb-4">
            Push your code to GitHub and submit your tool through the RotoWrite Tools Marketplace.
          </p>

          <Link href="/tools/submit">
            <Button className="mt-4">
              Submit Your Tool
            </Button>
          </Link>

          <Separator className="my-8" />

          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Best Practices
          </h2>

          <ul className="text-text-secondary space-y-2">
            <li>✓ Request only the permissions you actually need</li>
            <li>✓ Provide clear, detailed descriptions of what your tool does</li>
            <li>✓ Include error handling and loading states</li>
            <li>✓ Follow RotoWrite's design system and UI patterns</li>
            <li>✓ Test with different user roles and permissions</li>
            <li>✓ Document your code and include a README</li>
            <li>✓ Use semantic versioning for updates</li>
            <li>✓ Keep your dependencies up to date</li>
          </ul>

          <Separator className="my-8" />

          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Need Help?
          </h2>

          <p className="text-text-secondary mb-4">
            If you have questions or need assistance building your tool:
          </p>

          <ul className="text-text-secondary space-y-2">
            <li>• Check the example tools in the marketplace</li>
            <li>• Review the RotoWrite codebase for patterns</li>
            <li>• Contact the admin team for guidance</li>
          </ul>

          <div className="mt-8 p-6 bg-violet-500/10 border border-violet-500/20 rounded-lg">
            <h3 className="font-semibold text-text-primary mb-2">
              Ready to build?
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Start creating your RotoWrite Tool today and share it with the team!
            </p>
            <Link href="/tools/submit">
              <Button>
                Submit a Tool
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

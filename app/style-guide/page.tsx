'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, Check, Home, FileText, BookOpen, Sparkles,
  Plus, TrendingUp, Calendar, BarChart3, CheckCircle2,
  AlertCircle, Loader2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function StyleGuidePage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const ColorSwatch = ({ name, hex, className }: { name: string; hex: string; className: string }) => (
    <div 
      className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden cursor-pointer hover:border-border-hover transition-all"
      onClick={() => copyToClipboard(hex, name)}
    >
      <div className={`h-24 ${className}`} />
      <div className="p-4">
        <div className="text-[13px] font-semibold text-text-primary mb-1 flex items-center justify-between">
          {name}
          {copiedColor === name ? (
            <Check className="w-3 h-3 text-success" />
          ) : (
            <Copy className="w-3 h-3 text-text-tertiary" />
          )}
        </div>
        <div className="text-xs font-mono text-text-tertiary">{hex}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-deepest">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-bg-deep border-b border-border-subtle px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-dark flex items-center justify-center font-mono font-bold text-sm text-white">
              F
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Forge Style Guide
            </h1>
          </div>
          <p className="text-text-secondary text-[15px]">
            Design system reference with Forge Purple (#7C49E3) as the primary accent
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-8 space-y-16">
        {/* Colors Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Primary Accent Color
          </h2>
          <div className="grid grid-cols-5 gap-4 mb-12">
            <ColorSwatch name="Primary" hex="#7C49E3" className="bg-[#7C49E3]" />
            <ColorSwatch name="Hover" hex="#9166E8" className="bg-[#9166e8]" />
            <ColorSwatch name="Muted" hex="rgba(124,73,227,0.15)" className="bg-[rgba(124,73,227,0.15)]" />
            <ColorSwatch name="Dark" hex="#5B2DCF" className="bg-[#5b2dcf]" />
            <ColorSwatch name="Light" hex="#A78BFA" className="bg-[#a78bfa]" />
          </div>

          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Status Colors
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-12">
            <ColorSwatch name="Success" hex="#22C55E" className="bg-[#22c55e]" />
            <ColorSwatch name="Warning" hex="#EAB308" className="bg-[#eab308]" />
            <ColorSwatch name="Error" hex="#EF4444" className="bg-[#ef4444]" />
          </div>

          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Background Layers (Lightened for Better Readability)
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { name: 'Deepest', hex: '#1A1A1F', className: 'bg-bg-deepest' },
              { name: 'Deep', hex: '#222227', className: 'bg-bg-deep' },
              { name: 'Surface', hex: '#2A2A30', className: 'bg-bg-surface' },
              { name: 'Elevated', hex: '#32323A', className: 'bg-bg-elevated' },
              { name: 'Hover', hex: '#3A3A44', className: 'bg-bg-hover' },
            ].map((bg) => (
              <div 
                key={bg.name}
                className={`${bg.className} border border-border-default rounded-xl p-6 text-center cursor-pointer hover:border-border-hover transition-all`}
                onClick={() => copyToClipboard(bg.hex, bg.name)}
              >
                <div className="text-[12px] font-medium text-text-primary mb-1">{bg.name}</div>
                <div className="text-[11px] font-mono text-text-tertiary">{bg.hex}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Typography
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-text-muted">H1 — DM Sans Bold 32px</div>
              <h1 className="text-[32px] font-bold tracking-tight">Welcome to Forge</h1>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-text-muted">H2 — DM Sans Bold 24px</div>
              <h2 className="text-2xl font-bold tracking-tight">Create AI-Powered Content</h2>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-text-muted">H3 — DM Sans Semibold 18px</div>
              <h3 className="text-lg font-semibold">SmartBriefs & Writer Models</h3>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-text-muted">Body — DM Sans Regular 15px</div>
              <p className="text-[15px] text-text-secondary leading-relaxed">
                Forge combines Writer Models, SEO Packages, and SmartBriefs to create content that ranks well while maintaining your authentic voice.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-text-muted">Small — DM Sans 13px</div>
              <p className="text-[13px] text-text-tertiary">
                Updated Nov 18, 2025 • 1,240 words • SEO Score 94
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-text-muted">Mono — Space Mono 13px</div>
              <p className="text-[13px] font-mono text-accent-primary">
                claude-sonnet-4-20250514 | 4,000 tokens
              </p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Buttons
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Plus className="w-4 h-4" />
              Primary Button
            </Button>
            <Button variant="secondary">
              <Sparkles className="w-4 h-4" />
              Secondary Button
            </Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small Button</Button>
            <Button size="lg">Large Button</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Status Badges
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">
              <CheckCircle2 className="w-3 h-3" />
              Published
            </Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="ai">
              <Sparkles className="w-3 h-3" />
              AI Configured
            </Badge>
          </div>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Form Elements
          </h2>
          <div className="grid grid-cols-2 gap-6 max-w-3xl">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-text-secondary">Default Input</label>
              <Input placeholder="Enter text..." />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-text-secondary">With Value</label>
              <Input value="Sample content" readOnly />
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Cards
          </h2>
          <div className="grid grid-cols-3 gap-5">
            <Card className="p-6 hover:translate-y-0">
              <h3 className="text-base font-semibold text-text-primary mb-2">Standard Card</h3>
              <p className="text-[13px] text-text-tertiary leading-relaxed mb-4">
                A basic card with hover state. The purple accent appears in badges and interactive elements.
              </p>
              <div className="flex items-center gap-3">
                <Badge>Draft</Badge>
                <span className="text-xs text-text-muted">Nov 18, 2025</span>
              </div>
            </Card>

            <Card className="p-6 hover:translate-y-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-transparent" />
              <h3 className="text-base font-semibold text-text-primary mb-2">Accent Border Card</h3>
              <p className="text-[13px] text-text-tertiary leading-relaxed mb-4">
                Card with a purple top border accent to indicate selection or importance.
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="success">Active</Badge>
                <span className="text-xs text-text-muted">Today</span>
              </div>
            </Card>

            <Card className="p-6 hover:translate-y-0">
              <h3 className="text-base font-semibold text-text-primary mb-2">Project Card</h3>
              <p className="text-[13px] text-text-tertiary leading-relaxed mb-4">
                Example of how project cards will look with the purple accent system.
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="success">Published</Badge>
                <span className="text-xs font-mono text-text-muted">640 words</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Quick Action Cards
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-6 cursor-pointer relative overflow-hidden group hover:translate-y-0">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-[10px] bg-accent-muted flex items-center justify-center text-accent-primary mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">Create New Article</h3>
              <p className="text-[13px] text-text-tertiary leading-relaxed">
                Start from scratch or use a SmartBrief template
              </p>
            </Card>

            <Card className="p-6 cursor-pointer relative overflow-hidden group hover:translate-y-0">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ai-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-[10px] bg-ai-muted flex items-center justify-center text-ai-accent mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">Build SmartBrief</h3>
              <p className="text-[13px] text-text-tertiary leading-relaxed">
                Create reusable AI-powered content templates
              </p>
            </Card>

            <Card className="p-6 cursor-pointer relative overflow-hidden group hover:translate-y-0">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-success to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-[10px] bg-success-muted flex items-center justify-center text-success mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">Extract NFL Odds</h3>
              <p className="text-[13px] text-text-tertiary leading-relaxed">
                Upload screenshots to auto-generate betting content
              </p>
            </Card>
          </div>
        </section>

        {/* Navigation */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Navigation
          </h2>
          <div className="bg-bg-deep border border-border-subtle rounded-xl p-5 w-[280px]">
            <button className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all mb-1">
              <Home className="w-5 h-5 opacity-70" />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium bg-accent-muted text-accent-primary transition-all mb-1">
              <FileText className="w-5 h-5 opacity-100" />
              Projects
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all">
              <BookOpen className="w-5 h-5 opacity-70" />
              SmartBriefs
            </button>
          </div>
        </section>

        {/* Progress Bars */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Progress Indicators
          </h2>
          <div className="space-y-6 max-w-xl">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-text-secondary">Training Progress</span>
                <span className="font-mono font-semibold text-accent-primary">68%</span>
              </div>
              <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-primary to-accent-hover rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-text-secondary">Fully Trained</span>
                <span className="font-mono font-semibold text-success">100%</span>
              </div>
              <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-success to-[#16a34a] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* AI Indicator */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            AI Status Indicator
          </h2>
          <div className="flex items-center gap-2 px-4 py-3 bg-bg-surface border border-border-subtle rounded-lg w-fit">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
            <span className="text-[13px] text-text-secondary">
              <strong className="text-text-primary font-semibold">7 AI Agents</strong> online and ready — All systems operational
            </span>
          </div>
        </section>

        {/* Interactive States */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-6">
            Loading & Status States
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
              <span className="text-text-secondary">Loading...</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-text-secondary">Success</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-error" />
              <span className="text-text-secondary">Error</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-ai-accent" />
              <span className="text-text-secondary">AI Processing</span>
            </div>
          </div>
        </section>

        {/* Copy Helper */}
        <section className="border-t border-border-subtle pt-8">
          <div className="text-center">
            <p className="text-sm text-text-tertiary">
              💡 Click any color swatch to copy the hex code to clipboard
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

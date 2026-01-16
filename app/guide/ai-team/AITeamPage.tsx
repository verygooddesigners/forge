'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Cpu,
  Sparkles,
  Shield,
  DollarSign,
  Settings,
  CheckCircle2,
  Server,
  Key,
  Database,
  Workflow,
  AlertTriangle,
  ChevronRight,
  Sliders,
  Users,
  ShieldCheck,
  Clock,
  Calculator,
} from 'lucide-react';
import AgentDiagram from './AgentDiagram';

interface TOCItem {
  id: string;
  title: string;
  children?: { id: string; title: string }[];
}

const tableOfContents: TOCItem[] = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'meet-the-agents', title: 'Meet the Agents' },
  {
    id: 'cost-analysis',
    title: 'Cost Analysis',
    children: [
      { id: 'per-operation-costs', title: 'Per-Operation Costs' },
      { id: 'monthly-estimates', title: 'Monthly Estimates' },
    ],
  },
  {
    id: 'agent-collaboration',
    title: 'Agent Collaboration',
    children: [
      { id: 'workflow-overview', title: 'Workflow Overview' },
      { id: 'agent-guardrails', title: 'Agent Guardrails' },
    ],
  },
  {
    id: 'agent-tuning',
    title: 'Agent Tuning & Configuration',
  },
  {
    id: 'technical-specifications',
    title: 'Technical Specifications',
    children: [
      { id: 'api-requirements', title: 'API Requirements' },
      { id: 'model-configuration', title: 'Model Configuration' },
      { id: 'environment-variables', title: 'Environment Variables' },
    ],
  },
  { id: 'data-flow', title: 'Data Flow Architecture' },
  {
    id: 'security-compliance',
    title: 'Security & Compliance',
    children: [
      { id: 'gdc-data-isolation', title: 'GDC Data Isolation' },
      { id: 'microsoft-sso', title: 'Microsoft SSO Integration' },
      { id: 'data-protection', title: 'Data Protection' },
      { id: 'compliance-standards', title: 'Compliance Standards' },
    ],
  },
  {
    id: 'it-implementation',
    title: 'IT Implementation Guide',
    children: [
      { id: 'pre-implementation', title: 'Pre-Implementation Checklist' },
      { id: 'implementation-benefits', title: 'Implementation Benefits' },
    ],
  },
];

export default function AITeamPage() {
  const [activeSection, setActiveSection] = useState('introduction');

  // Track scroll position and update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.flatMap((item) => [
        item.id,
        ...(item.children?.map((child) => child.id) || []),
      ]);

      for (const sectionId of sections.reverse()) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-bg-deepest">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-deep/80 backdrop-blur-md border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/guide"
              className="flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to User Guide</span>
            </Link>
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-accent-primary" />
              <span className="font-semibold text-text-primary">AI Team Architecture</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
          {/* Sticky Table of Contents - Desktop */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4">
                On This Page
              </h3>
              {tableOfContents.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === item.id
                        ? 'bg-accent-muted text-accent-primary font-medium'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`}
                  >
                    {item.title}
                  </button>
                  {item.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => scrollToSection(child.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors ${
                            activeSection === child.id
                              ? 'text-accent-primary font-medium'
                              : 'text-text-tertiary hover:text-text-secondary'
                          }`}
                        >
                          {child.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* Mobile TOC */}
          <div className="lg:hidden mb-8">
            <details className="bg-bg-surface rounded-lg border border-border-default overflow-hidden">
              <summary className="px-4 py-3 cursor-pointer font-medium text-text-primary hover:bg-bg-hover">
                Table of Contents
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {tableOfContents.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="w-full text-left py-1 text-sm text-text-secondary hover:text-accent-primary"
                    >
                      {item.title}
                    </button>
                    {item.children && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => scrollToSection(child.id)}
                            className="w-full text-left py-1 text-xs text-text-tertiary hover:text-accent-primary"
                          >
                            {child.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Main Content */}
          <main className="space-y-16">
            {/* Introduction */}
            <section id="introduction">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-text-primary mb-4">
                  AI Team Architecture
                </h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                  Technical documentation for RotoWrite&apos;s multi-agent AI system
                </p>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-text-secondary">
                  RotoWrite is powered by a sophisticated{' '}
                  <strong>Multi-Agent AI System</strong> – a team of 7 specialized AI agents
                  that work together to produce high-quality, SEO-optimized content in your
                  unique voice. Each agent has a specific role and expertise, making the whole
                  system more powerful than any single AI could be.
                </p>
              </div>

              <div className="bg-accent-muted border border-accent-primary rounded-xl p-8 my-8">
                <h3 className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                  <Cpu className="h-6 w-6 text-accent-primary" />
                  <span className="text-text-primary">The 7-Agent Orchestra</span>
                </h3>
                <p className="text-center text-text-secondary mb-0">
                  Just like a symphony orchestra has different sections working in harmony,
                  RotoWrite&apos;s agents each play their part to create content that ranks and
                  resonates.
                </p>
              </div>

              <div className="bg-[rgba(59,130,246,0.15)] border border-[#3b82f6] rounded-lg p-6">
                <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Architecture Overview
                </h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  RotoWrite uses a specialized multi-agent architecture where each agent is
                  optimized for its specific task. All agents share a common infrastructure layer
                  that handles API communication, configuration management, and guardrails
                  enforcement. This modular approach allows for independent optimization and
                  scaling of individual agents without affecting the overall system.
                </p>
              </div>
            </section>

            {/* Meet the Agents */}
            <section id="meet-the-agents">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent-primary" />
                Meet the Agents
              </h2>

              <div className="space-y-6">
                {/* Agent 1 */}
                <div className="border-l-4 border-accent-primary pl-6 py-4 bg-accent-muted rounded-r-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-accent-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                    <h4 className="font-bold text-lg text-text-primary">
                      Content Generation Agent
                    </h4>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-3">
                    The primary writer of your team. This agent takes your brief, keywords, and
                    writer model context to generate complete articles with proper structure,
                    headings, tables, and lists.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-accent-muted border border-accent-primary text-accent-primary rounded text-xs font-medium">
                      Article Generation
                    </span>
                    <span className="px-2 py-1 bg-accent-muted border border-accent-primary text-accent-primary rounded text-xs font-medium">
                      Streaming Output
                    </span>
                    <span className="px-2 py-1 bg-accent-muted border border-accent-primary text-accent-primary rounded text-xs font-medium">
                      SEO Integration
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary font-mono bg-bg-hover px-3 py-2 rounded">
                    Model: claude-sonnet-4-20250514 | Temperature: 0.7 | Max Tokens: 4000
                  </div>
                </div>

                {/* Agent 2 */}
                <div className="border-l-4 border-[#3b82f6] pl-6 py-4 bg-[rgba(59,130,246,0.15)] rounded-r-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[rgba(59,130,246,0.15)]0 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                    <h4 className="font-bold text-lg text-text-primary">Writer Training Agent</h4>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-3">
                    Your voice analyst. When you add content to the Writer Factory, this agent
                    analyzes your writing samples to extract tone, vocabulary patterns, sentence
                    structure, and stylistic elements that make your writing unique.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-[rgba(59,130,246,0.2)] border border-[#3b82f6] text-[#60a5fa] rounded text-xs font-medium">
                      Style Analysis
                    </span>
                    <span className="px-2 py-1 bg-[rgba(59,130,246,0.2)] border border-[#3b82f6] text-[#60a5fa] rounded text-xs font-medium">
                      Voice Extraction
                    </span>
                    <span className="px-2 py-1 bg-[rgba(59,130,246,0.2)] border border-[#3b82f6] text-[#60a5fa] rounded text-xs font-medium">
                      Pattern Recognition
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary font-mono bg-bg-hover px-3 py-2 rounded">
                    Model: claude-sonnet-4-20250514 | Temperature: 0.3 | Max Tokens: 2000 |
                    Embeddings: text-embedding-3-small
                  </div>
                </div>

                {/* Agent 3 */}
                <div className="border-l-4 border-success pl-6 py-4 bg-success-muted rounded-r-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-success-muted0 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      3
                    </div>
                    <h4 className="font-bold text-lg text-text-primary">SEO Optimization Agent</h4>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-3">
                    Your search engine strategist. This agent analyzes your content for keyword
                    density, heading structure, and SEO best practices. It calculates your SEO
                    score and provides specific recommendations for improvement.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-success-muted border border-success text-success rounded text-xs font-medium">
                      Keyword Analysis
                    </span>
                    <span className="px-2 py-1 bg-success-muted border border-success text-success rounded text-xs font-medium">
                      SEO Scoring
                    </span>
                    <span className="px-2 py-1 bg-success-muted border border-success text-success rounded text-xs font-medium">
                      Optimization Tips
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary font-mono bg-bg-hover px-3 py-2 rounded">
                    Model: claude-sonnet-4-20250514 | Temperature: 0.4 | Max Tokens: 2000 |
                    Optimal Density: 3%
                  </div>
                </div>

                {/* Agent 4 */}
                <div className="border-l-4 border-warning pl-6 py-4 bg-warning-muted rounded-r-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      4
                    </div>
                    <h4 className="font-bold text-lg text-text-primary">
                      Quality Assurance Agent
                    </h4>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-3">
                    Your editor and proofreader. Powered by both AI and LanguageTool, this agent
                    checks grammar, spelling, readability, and consistency. It ensures your
                    content is polished and professional before publishing.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-warning-muted border border-warning text-warning rounded text-xs font-medium">
                      Grammar Check
                    </span>
                    <span className="px-2 py-1 bg-warning-muted border border-warning text-warning rounded text-xs font-medium">
                      Readability Score
                    </span>
                    <span className="px-2 py-1 bg-warning-muted border border-warning text-warning rounded text-xs font-medium">
                      Consistency Review
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary font-mono bg-bg-hover px-3 py-2 rounded">
                    Model: claude-sonnet-4-20250514 | Temperature: 0.3 | Max Tokens: 2000 |
                    LanguageTool: Standard
                  </div>
                </div>

                {/* Agent 5 */}
                <div className="border-l-4 border-[#ec4899] pl-6 py-4 bg-[rgba(236,72,153,0.15)] rounded-r-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      5
                    </div>
                    <h4 className="font-bold text-lg text-text-primary">Persona & Tone Agent</h4>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-3">
                    Your voice coach. If content needs tone adjustment – perhaps it&apos;s too
                    formal when you write casually, or vice versa – this agent refines the
                    language to match your writer model&apos;s personality while preserving SEO
                    keywords.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-[rgba(236,72,153,0.2)] border border-[#ec4899] text-[#f9a8d4] rounded text-xs font-medium">
                      Tone Matching
                    </span>
                    <span className="px-2 py-1 bg-[rgba(236,72,153,0.2)] border border-[#ec4899] text-[#f9a8d4] rounded text-xs font-medium">
                      Voice Adaptation
                    </span>
                    <span className="px-2 py-1 bg-[rgba(236,72,153,0.2)] border border-[#ec4899] text-[#f9a8d4] rounded text-xs font-medium">
                      Style Consistency
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary font-mono bg-bg-hover px-3 py-2 rounded">
                    Model: claude-sonnet-4-20250514 | Temperature: 0.5 | Max Tokens: 2000
                  </div>
                </div>

                {/* Agent 6 */}
                <div className="border-l-4 border-ai-accent pl-6 py-4 bg-ai-muted rounded-r-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      6
                    </div>
                    <h4 className="font-bold text-lg text-text-primary">
                      Creative Features Agent
                    </h4>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-3">
                    Your workflow coordinator. When complex tasks require multiple agents
                    working together, this agent orchestrates the process – routing tasks to the
                    right specialists and combining their outputs into cohesive results.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-ai-muted border border-ai-accent text-ai-accent rounded text-xs font-medium">
                      Workflow Management
                    </span>
                    <span className="px-2 py-1 bg-ai-muted border border-ai-accent text-ai-accent rounded text-xs font-medium">
                      Multi-Agent Tasks
                    </span>
                    <span className="px-2 py-1 bg-ai-muted border border-ai-accent text-ai-accent rounded text-xs font-medium">
                      Data Transform
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary font-mono bg-bg-hover px-3 py-2 rounded">
                    Model: claude-sonnet-4-20250514 | Temperature: 0.6 | Max Tokens: 3000
                  </div>
                </div>

                {/* Agent 7 */}
                <div className="border-l-4 border-[#06b6d4] pl-6 py-4 bg-[rgba(6,182,212,0.15)] rounded-r-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      7
                    </div>
                    <h4 className="font-bold text-lg text-text-primary">Visual Extraction Agent</h4>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-3">
                    Your data reader. This agent can extract structured data from images –
                    screenshots of sports statistics, tables, or any visual content. It turns
                    images into usable data that other agents can work with.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-[rgba(6,182,212,0.2)] border border-[#06b6d4] text-[#67e8f9] rounded text-xs font-medium">
                      Image Analysis
                    </span>
                    <span className="px-2 py-1 bg-[rgba(6,182,212,0.2)] border border-[#06b6d4] text-[#67e8f9] rounded text-xs font-medium">
                      Data Extraction
                    </span>
                    <span className="px-2 py-1 bg-[rgba(6,182,212,0.2)] border border-[#06b6d4] text-[#67e8f9] rounded text-xs font-medium">
                      Table Parsing
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary font-mono bg-bg-hover px-3 py-2 rounded">
                    Model: claude-sonnet-4-20250514 (Vision) | Temperature: 0.2 | Max Tokens:
                    4000 | Confidence: 85%
                  </div>
                </div>
              </div>
            </section>

            {/* Cost Analysis - Moved up */}
            <section id="cost-analysis">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-accent-primary" />
                Cost Analysis
              </h2>

              <div id="per-operation-costs" className="mb-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Per-Operation Costs
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-bg-surface border border-border-default rounded-lg p-4">
                    <h5 className="font-semibold text-text-primary mb-3">
                      Standard Article Generation
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Input tokens:</span>
                        <span className="font-mono">~5,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Output tokens:</span>
                        <span className="font-mono">~2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Typical length:</span>
                        <span className="font-mono">800 words</span>
                      </div>
                      <div className="pt-2 border-t border-border-subtle flex justify-between font-semibold">
                        <span>Cost per article:</span>
                        <span className="text-success">$0.045 (4.5¢)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg-surface border border-border-default rounded-lg p-4">
                    <h5 className="font-semibold text-text-primary mb-3">
                      Smart Odds Capture (Weekly)
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Image processing:</span>
                        <span className="font-mono">2 × $0.48</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Content generation:</span>
                        <span className="font-mono">~$0.05</span>
                      </div>
                      <div className="pt-2 border-t border-border-subtle flex justify-between font-semibold">
                        <span>Cost per week:</span>
                        <span className="text-success">~$1.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="monthly-estimates" className="mb-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Monthly Estimates</h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-border-default rounded-lg overflow-hidden">
                    <thead className="bg-bg-elevated">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary border-b">
                          Usage Level
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary border-b">
                          Articles/Month
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary border-b">
                          Claude API
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary border-b">
                          OpenAI
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary border-b">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-4 font-medium">Low</td>
                        <td className="py-3 px-4">40</td>
                        <td className="py-3 px-4">$1.80 + $4.00 (Smart Odds)</td>
                        <td className="py-3 px-4">~$0.50</td>
                        <td className="py-3 px-4 font-semibold text-success">$6-7/mo</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Medium</td>
                        <td className="py-3 px-4">200</td>
                        <td className="py-3 px-4">$9.00 + $4.00 (Smart Odds)</td>
                        <td className="py-3 px-4">~$1.00</td>
                        <td className="py-3 px-4 font-semibold text-success">$14-15/mo</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">High</td>
                        <td className="py-3 px-4">400</td>
                        <td className="py-3 px-4">$18.00 + $4.00 (Smart Odds)</td>
                        <td className="py-3 px-4">~$2.00</td>
                        <td className="py-3 px-4 font-semibold text-success">$24-25/mo</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-success-muted border border-success rounded-lg p-4">
                  <h5 className="font-semibold text-text-primary mb-2">Cost Summary</h5>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>
                      • <strong>Extraordinarily cost-effective:</strong> Even high usage is
                      under $30/month
                    </li>
                    <li>
                      • <strong>Predictable pricing:</strong> Linear cost scaling with usage
                    </li>
                    <li>
                      • <strong>No minimum commitment:</strong> Pay only for what you use
                    </li>
                    <li>
                      • <strong>Single vendor:</strong> Consolidated billing through Anthropic
                    </li>
                  </ul>
                </div>

                {/* Time Savings Calculator CTA */}
                <Link
                  href="/guide/time-savings"
                  className="mt-6 block bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <Calculator className="h-6 w-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-lg">Calculate Your Time Savings</h5>
                        <p className="text-violet-100 text-sm">
                          See how much time your team could save with RotoWrite&apos;s AI agents
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-violet-200" />
                  </div>
                </Link>
              </div>
            </section>

            {/* Agent Collaboration */}
            <section id="agent-collaboration">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Workflow className="h-6 w-6 text-accent-primary" />
                Agent Collaboration
              </h2>

              <p className="text-text-secondary leading-relaxed mb-8">
                When you create content in RotoWrite, multiple agents collaborate behind the
                scenes. The diagram below shows how data flows between agents during a typical
                content generation workflow.
              </p>

              <AgentDiagram />

              <div id="workflow-overview" className="mt-12">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Workflow Overview</h3>

                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-border-default rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[rgba(59,130,246,0.15)]0 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h5 className="font-semibold">Writer Training Analyzes Your Voice</h5>
                        <p className="text-sm text-text-secondary">
                          When you add samples to Writer Factory, Agent #2 extracts your unique
                          writing patterns and stores them as embeddings for retrieval.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-success-muted0 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h5 className="font-semibold">SEO Agent Prepares Keyword Strategy</h5>
                        <p className="text-sm text-text-secondary">
                          When you analyze your SEO Package, Agent #3 generates keyword
                          suggestions, density targets, and optimization priorities.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-accent-muted0 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h5 className="font-semibold">Content Agent Creates Your Article</h5>
                        <p className="text-sm text-text-secondary">
                          Agent #1 combines your brief, keywords, and writer model context to
                          generate content via streaming output.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <h5 className="font-semibold">Persona Agent Fine-Tunes Voice</h5>
                        <p className="text-sm text-text-secondary">
                          Agent #5 ensures the content matches your authentic voice and tone,
                          making adjustments while preserving SEO keywords.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        5
                      </div>
                      <div>
                        <h5 className="font-semibold">QA Agent Reviews Quality</h5>
                        <p className="text-sm text-text-secondary">
                          Agent #4 checks grammar, readability, and consistency using both AI
                          analysis and LanguageTool integration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="agent-guardrails" className="mt-12">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Agent Guardrails</h3>

                <p className="text-text-secondary leading-relaxed mb-6">
                  Each agent has built-in <strong>guardrails</strong> that define what it can
                  and cannot do. This ensures agents stay focused on their specialties and
                  don&apos;t overstep their roles:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-success bg-success-muted rounded-lg p-4">
                    <h5 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      Agents CAN:
                    </h5>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• Perform their specialized tasks</li>
                      <li>• Access relevant data for their role</li>
                      <li>• Provide recommendations within their expertise</li>
                      <li>• Collaborate with other agents through defined channels</li>
                    </ul>
                  </div>

                  <div className="border border-error bg-error-muted rounded-lg p-4">
                    <h5 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-error" />
                      Agents CANNOT:
                    </h5>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• Perform tasks outside their specialty</li>
                      <li>• Modify database records directly</li>
                      <li>• Access other users&apos; data</li>
                      <li>• Make changes without proper validation</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-default">
                        <th className="text-left py-3 px-4 font-semibold text-text-primary">
                          Agent
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary">
                          Guardrails
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-4 font-medium">Content Generation</td>
                        <td className="py-3 px-4 text-text-secondary">
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_modify_seo
                          </code>
                          ,{' '}
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_train_models
                          </code>
                          ,{' '}
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_process_images
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Writer Training</td>
                        <td className="py-3 px-4 text-text-secondary">
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_generate_articles
                          </code>
                          ,{' '}
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_access_other_users_models
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">SEO Optimization</td>
                        <td className="py-3 px-4 text-text-secondary">
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_generate_content
                          </code>
                          ,{' '}
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_modify_structure
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Quality Assurance</td>
                        <td className="py-3 px-4 text-text-secondary">
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_auto_modify
                          </code>
                          ,{' '}
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_generate_content
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Persona & Tone</td>
                        <td className="py-3 px-4 text-text-secondary">
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_generate_from_scratch
                          </code>
                          ,{' '}
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_change_structure
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Creative Features</td>
                        <td className="py-3 px-4 text-text-secondary">
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_bypass_agents
                          </code>
                          ,{' '}
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_skip_validation
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Visual Extraction</td>
                        <td className="py-3 px-4 text-text-secondary">
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_make_editorial_decisions
                          </code>
                          ,{' '}
                          <code className="text-xs bg-bg-hover px-1 rounded">
                            cannot_modify_database
                          </code>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Agent Tuning & Configuration - NEW SECTION */}
            <section id="agent-tuning">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Sliders className="h-6 w-6 text-accent-primary" />
                Agent Tuning & Configuration
              </h2>

              <p className="text-text-secondary leading-relaxed mb-6">
                Each AI agent can be fine-tuned through the Admin Dashboard to optimize
                performance for specific use cases. The configuration interface allows
                administrators to adjust system prompts, model parameters, and guardrails for
                each agent independently.
              </p>

              <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-lg mb-8">
                <div className="bg-bg-elevated px-4 py-3 border-b border-border-default">
                  <h4 className="font-semibold text-text-primary flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Admin Dashboard: AI Agent Configuration
                  </h4>
                </div>
                <div className="p-4">
                  <Image
                    src="/images/guide/admin-agent-config.png"
                    alt="RotoWrite Admin Dashboard showing AI Agent Configuration interface with system instructions, temperature slider, max tokens, model selection, and guardrails for the Content Generation agent"
                    width={1200}
                    height={800}
                    className="rounded-lg border border-border-default w-full"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-bg-surface border border-border-default rounded-lg p-5">
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-accent-primary" />
                    Configurable Parameters
                  </h4>
                  <ul className="text-sm text-text-secondary space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>System Instructions</strong> – Custom prompts that define agent
                        behavior, role, capabilities, and output format
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Temperature</strong> – Controls creativity vs. consistency
                        (0.0-1.0 scale)
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Max Tokens</strong> – Maximum response length for the agent
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Model Selection</strong> – Choose from available Claude models
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Guardrails</strong> – Toggle safety constraints on/off
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-bg-surface border border-border-default rounded-lg p-5">
                  <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-accent-primary" />
                    Per-Agent Customization
                  </h4>
                  <p className="text-sm text-text-secondary mb-4">
                    Each of the 7 agents has its own configuration tab, allowing independent
                    tuning:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-accent-muted text-accent-primary rounded-full text-xs font-medium">
                      Content
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Writer
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      SEO
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      QA
                    </span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                      Persona
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      Creative
                    </span>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                      Visual
                    </span>
                  </div>
                  <p className="text-sm text-text-tertiary mt-4">
                    Changes can be saved or reset to defaults at any time. All configurations
                    are stored in the database and applied in real-time.
                  </p>
                </div>
              </div>
            </section>

            {/* Technical Specifications */}
            <section id="technical-specifications">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Settings className="h-6 w-6 text-accent-primary" />
                Technical Specifications
              </h2>

              <div id="api-requirements" className="mb-12">
                <h3 className="text-xl font-semibold text-text-primary mb-4">API Requirements</h3>

                <div className="space-y-6">
                  {/* Anthropic API */}
                  <div className="border border-accent-primary rounded-lg overflow-hidden">
                    <div className="bg-accent-muted px-4 py-3 border-b border-accent-primary">
                      <h4 className="font-semibold text-violet-900 flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Anthropic Claude API (Primary)
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-text-tertiary">Provider:</span>
                          <span className="ml-2 font-medium">Anthropic</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Model:</span>
                          <span className="ml-2 font-mono text-xs bg-bg-hover px-2 py-0.5 rounded">
                            claude-sonnet-4-20250514
                          </span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Agents Powered:</span>
                          <span className="ml-2 font-medium">7 of 7</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">API Version:</span>
                          <span className="ml-2 font-mono text-xs">2023-06-01</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border-subtle">
                        <p className="text-sm text-text-secondary">
                          <strong>Capabilities:</strong> Text generation, vision/image
                          processing, streaming responses, structured output
                        </p>
                      </div>
                      <div className="bg-accent-muted rounded p-3 text-sm">
                        <strong>Cost:</strong> ~$3/1M input tokens, ~$15/1M output tokens |
                        Images: ~$0.48/image
                      </div>
                    </div>
                  </div>

                  {/* OpenAI API */}
                  <div className="border border-[#3b82f6] rounded-lg overflow-hidden">
                    <div className="bg-[rgba(59,130,246,0.15)] px-4 py-3 border-b border-[#3b82f6]">
                      <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        OpenAI API (Embeddings)
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-text-tertiary">Provider:</span>
                          <span className="ml-2 font-medium">OpenAI</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Model:</span>
                          <span className="ml-2 font-mono text-xs bg-bg-hover px-2 py-0.5 rounded">
                            text-embedding-3-small
                          </span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Purpose:</span>
                          <span className="ml-2 font-medium">
                            Vector embeddings for RAG
                          </span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Usage:</span>
                          <span className="ml-2">Writer model training</span>
                        </div>
                      </div>
                      <div className="bg-[rgba(59,130,246,0.15)] rounded p-3 text-sm">
                        <strong>Cost:</strong> ~$0.02/1M tokens (extremely low cost)
                      </div>
                    </div>
                  </div>

                  {/* Tavily API */}
                  <div className="border border-success rounded-lg overflow-hidden">
                    <div className="bg-success-muted px-4 py-3 border-b border-success">
                      <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Tavily API (News Search)
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-text-tertiary">Provider:</span>
                          <span className="ml-2 font-medium">Tavily</span>
                        </div>
                        <div>
                          <span className="text-text-tertiary">Purpose:</span>
                          <span className="ml-2 font-medium">NewsEngine feature</span>
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary">
                        Powers real-time news search for content research and topic discovery.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="model-configuration" className="mb-12">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Model Configuration
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-border-default rounded-lg overflow-hidden">
                    <thead className="bg-bg-elevated">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary border-b">
                          Agent
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary border-b">
                          Temperature
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary border-b">
                          Max Tokens
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-text-primary border-b">
                          Special Config
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-4 font-medium">Content Generation</td>
                        <td className="py-3 px-4 font-mono">0.7</td>
                        <td className="py-3 px-4 font-mono">4,000</td>
                        <td className="py-3 px-4 text-text-secondary">Streaming enabled</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Writer Training</td>
                        <td className="py-3 px-4 font-mono">0.3</td>
                        <td className="py-3 px-4 font-mono">2,000</td>
                        <td className="py-3 px-4 text-text-secondary">
                          Embeddings: text-embedding-3-small
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">SEO Optimization</td>
                        <td className="py-3 px-4 font-mono">0.4</td>
                        <td className="py-3 px-4 font-mono">2,000</td>
                        <td className="py-3 px-4 text-text-secondary">
                          Optimal density: 3%, Min length: 500
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Quality Assurance</td>
                        <td className="py-3 px-4 font-mono">0.3</td>
                        <td className="py-3 px-4 font-mono">2,000</td>
                        <td className="py-3 px-4 text-text-secondary">
                          LanguageTool: standard, Min readability: 60
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Persona & Tone</td>
                        <td className="py-3 px-4 font-mono">0.5</td>
                        <td className="py-3 px-4 font-mono">2,000</td>
                        <td className="py-3 px-4 text-text-secondary">—</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Creative Features</td>
                        <td className="py-3 px-4 font-mono">0.6</td>
                        <td className="py-3 px-4 font-mono">3,000</td>
                        <td className="py-3 px-4 text-text-secondary">—</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Visual Extraction</td>
                        <td className="py-3 px-4 font-mono">0.2</td>
                        <td className="py-3 px-4 font-mono">4,000</td>
                        <td className="py-3 px-4 text-text-secondary">
                          Confidence: 85%, Fallback enabled
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-sm text-text-secondary">
                  <strong>Note:</strong> Temperature values range from 0.0 (deterministic) to
                  1.0 (creative). Lower values are used for analytical tasks (QA, Visual
                  Extraction), higher values for creative tasks (Content Generation).
                </p>
              </div>

              <div id="environment-variables" className="mb-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Environment Variables
                </h3>

                <div className="bg-bg-deepest rounded-lg p-6 overflow-x-auto">
                  <pre className="text-sm text-text-primary">
                    <code>{`# Required - Powers all 7 agents
CLAUDE_API_KEY=sk-ant-api03-...
# Alternative name (either works)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Required - Writer model embeddings
OPENAI_API_KEY=sk-...

# Optional - News search feature
TAVILY_API_KEY=tvly-...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...`}</code>
                  </pre>
                </div>

                <div className="mt-4 bg-warning-muted border border-warning rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    <strong>Security Note:</strong> All API keys are stored as encrypted
                    environment variables in Vercel and are never committed to version control.
                    Keys are accessed only through secure server-side functions.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Flow Architecture */}
            <section id="data-flow">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Database className="h-6 w-6 text-accent-primary" />
                Data Flow Architecture
              </h2>

              <div className="space-y-6">
                <div className="bg-bg-surface border border-border-default rounded-lg p-6">
                  <h4 className="font-semibold text-text-primary mb-4">
                    Request/Response Flow
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-bg-hover rounded-full flex items-center justify-center font-bold text-text-secondary flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h5 className="font-medium">Client Request</h5>
                        <p className="text-sm text-text-secondary">
                          User action triggers API route (e.g.,{' '}
                          <code className="bg-bg-hover px-1 rounded">/api/generate</code>)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-bg-hover rounded-full flex items-center justify-center font-bold text-text-secondary flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h5 className="font-medium">Agent Selection</h5>
                        <p className="text-sm text-text-secondary">
                          System determines which agent(s) to invoke based on request type
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-bg-hover rounded-full flex items-center justify-center font-bold text-text-secondary flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h5 className="font-medium">Config Loading</h5>
                        <p className="text-sm text-text-secondary">
                          <code className="bg-bg-hover px-1 rounded">loadAgentConfig()</code>{' '}
                          retrieves agent settings from database (fallback to defaults)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-bg-hover rounded-full flex items-center justify-center font-bold text-text-secondary flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h5 className="font-medium">API Call</h5>
                        <p className="text-sm text-text-secondary">
                          <code className="bg-bg-hover px-1 rounded">callClaude()</code> or{' '}
                          <code className="bg-bg-hover px-1 rounded">streamClaude()</code>{' '}
                          sends request to Anthropic API
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-bg-hover rounded-full flex items-center justify-center font-bold text-text-secondary flex-shrink-0">
                        5
                      </div>
                      <div>
                        <h5 className="font-medium">Response Processing</h5>
                        <p className="text-sm text-text-secondary">
                          Agent-specific handlers process response (e.g., SEO scoring, quality
                          metrics)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-accent-muted0 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
                        6
                      </div>
                      <div>
                        <h5 className="font-medium">Client Response</h5>
                        <p className="text-sm text-text-secondary">
                          Structured response returned to client with content and metadata
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-bg-surface border border-border-default rounded-lg p-4">
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-green-500" />
                      Synchronous Operations
                    </h5>
                    <ul className="text-sm text-text-secondary space-y-2">
                      <li>• SEO analysis</li>
                      <li>• Quality checks</li>
                      <li>• Writer style analysis</li>
                      <li>• Tone adaptation</li>
                    </ul>
                  </div>
                  <div className="bg-bg-surface border border-border-default rounded-lg p-4">
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                      Streaming Operations
                    </h5>
                    <ul className="text-sm text-text-secondary space-y-2">
                      <li>• Content generation</li>
                      <li>• Long-form article writing</li>
                      <li>• Real-time output display</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Security & Compliance - Updated with GDC Data Isolation */}
            <section id="security-compliance">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-accent-primary" />
                Security & Compliance
              </h2>

              {/* GDC Data Isolation - MAJOR HIGHLIGHT */}
              <div id="gdc-data-isolation" className="mb-8">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-8 text-white shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">
                        Zero GDC Internal Data Usage
                      </h3>
                      <p className="text-lg text-emerald-50 leading-relaxed mb-4">
                        RotoWrite operates completely independently from GDC&apos;s internal
                        systems and data. The application uses <strong>no GDC internal data</strong> whatsoever.
                      </p>
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <ul className="space-y-2 text-emerald-50">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                            <span>No access to internal GDC databases or systems</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                            <span>No proprietary company data processed or stored</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                            <span>All AI processing uses external, third-party APIs only</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                            <span>Content created by users is owned entirely by users</span>
                          </li>
                        </ul>
                      </div>
                      <p className="mt-4 text-emerald-100 text-sm">
                        <strong>Only exception:</strong> Microsoft SSO integration (coming soon) for
                        seamless authentication with @gdcgroup.com accounts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Microsoft SSO Section - NEW */}
              <div id="microsoft-sso" className="mb-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Microsoft SSO Integration
                </h3>

                <div className="bg-[rgba(59,130,246,0.15)] border-2 border-[#3b82f6] rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-[rgba(59,130,246,0.15)]0 rounded-lg p-3">
                      <svg
                        viewBox="0 0 23 23"
                        className="h-8 w-8"
                        fill="white"
                      >
                        <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-text-primary text-lg">Coming Soon</h4>
                        <span className="px-2 py-0.5 bg-[rgba(59,130,246,0.2)] border border-[#3b82f6] text-[#60a5fa] rounded-full text-xs font-medium">
                          In Development
                        </span>
                      </div>
                      <p className="text-text-secondary leading-relaxed mb-4">
                        Microsoft Single Sign-On (SSO) integration is being developed to allow
                        GDC team members to authenticate using their existing corporate
                        credentials.
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-[#3b82f6]">
                        <h5 className="font-semibold text-text-primary mb-2">
                          What This Means for GDC Users
                        </h5>
                        <ul className="text-sm text-text-secondary space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Sign in with your <strong>@gdcgroup.com</strong> email address
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>No separate password to remember</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Leverages existing Microsoft Entra ID (Azure AD) authentication
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Enterprise-grade security with MFA support
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="data-protection" className="mb-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Data Protection</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-bg-surface border border-border-default rounded-lg p-4">
                    <h5 className="font-semibold text-text-primary mb-3">API Key Security</h5>
                    <ul className="text-sm text-text-secondary space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Encrypted environment variables in Vercel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Never committed to version control</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Server-side only access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Rotatable without code changes</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-bg-surface border border-border-default rounded-lg p-4">
                    <h5 className="font-semibold text-text-primary mb-3">Database Security</h5>
                    <ul className="text-sm text-text-secondary space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Row-level security (RLS) on all tables</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>User data isolation by auth context</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Encrypted connections (TLS)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Automated backups</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div id="compliance-standards" className="mb-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Compliance Standards
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-accent-muted border border-accent-primary rounded-lg p-4 text-center">
                    <h5 className="font-bold text-violet-900 mb-2">SOC 2</h5>
                    <p className="text-sm text-accent-primary">
                      Anthropic maintains SOC 2 Type II compliance
                    </p>
                  </div>
                  <div className="bg-[rgba(59,130,246,0.15)] border border-[#3b82f6] rounded-lg p-4 text-center">
                    <h5 className="font-bold text-text-primary mb-2">GDPR</h5>
                    <p className="text-sm text-blue-700">
                      Data processing compliant with EU regulations
                    </p>
                  </div>
                  <div className="bg-success-muted border border-success rounded-lg p-4 text-center">
                    <h5 className="font-bold text-text-primary mb-2">CCPA</h5>
                    <p className="text-sm text-green-700">
                      California Consumer Privacy Act compliant
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-bg-elevated border border-border-default rounded-lg p-4">
                  <h5 className="font-semibold text-text-primary mb-2">Data Handling</h5>
                  <p className="text-sm text-text-secondary">
                    Content processed through the API is not used to train Anthropic&apos;s
                    models. All data is processed in accordance with Anthropic&apos;s
                    enterprise data handling policies. User content remains the property of the
                    user.
                  </p>
                </div>
              </div>
            </section>

            {/* IT Implementation Guide */}
            <section id="it-implementation">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Settings className="h-6 w-6 text-accent-primary" />
                IT Implementation Guide
              </h2>

              <div id="pre-implementation" className="mb-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Pre-Implementation Checklist
                </h3>

                <div className="bg-bg-surface border border-border-default rounded-lg divide-y divide-slate-100">
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-6 h-6 border-2 border-violet-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-500 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h5 className="font-medium">Verify Claude API Access</h5>
                      <p className="text-sm text-text-secondary mt-1">
                        Log into Anthropic Console → Confirm Claude Sonnet 4 model access →
                        Verify Vision API is enabled for image processing
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-6 h-6 border-2 border-violet-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-500 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h5 className="font-medium">Confirm OpenAI API Key</h5>
                      <p className="text-sm text-text-secondary mt-1">
                        Verify{' '}
                        <code className="bg-bg-hover px-1 rounded">
                          text-embedding-3-small
                        </code>{' '}
                        access → Check current usage/limits
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-6 h-6 border-2 border-violet-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-500 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h5 className="font-medium">Review Cost Limits</h5>
                      <p className="text-sm text-text-secondary mt-1">
                        Set usage alerts on Anthropic dashboard → Configure rate limits if
                        needed → Review monthly budget allocation
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-6 h-6 border-2 border-violet-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-500 text-xs font-bold">4</span>
                    </div>
                    <div>
                      <h5 className="font-medium">Set Up Monitoring</h5>
                      <p className="text-sm text-text-secondary mt-1">
                        Enable usage tracking in Anthropic Console → Set up cost alerts →
                        Configure logging as needed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div id="implementation-benefits" className="mb-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Implementation Benefits
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-success-muted border border-success rounded-lg p-4">
                    <h5 className="font-semibold text-text-primary mb-2">
                      No New Vendor Approvals
                    </h5>
                    <p className="text-sm text-text-secondary">
                      Using existing Anthropic relationship. No new contracts or vendor
                      onboarding required.
                    </p>
                  </div>
                  <div className="bg-success-muted border border-success rounded-lg p-4">
                    <h5 className="font-semibold text-text-primary mb-2">Consolidated Billing</h5>
                    <p className="text-sm text-text-secondary">
                      Single provider for all AI features. Simplified accounting and budget
                      tracking.
                    </p>
                  </div>
                  <div className="bg-success-muted border border-success rounded-lg p-4">
                    <h5 className="font-semibold text-text-primary mb-2">Reduced Complexity</h5>
                    <p className="text-sm text-text-secondary">
                      Fewer API integrations to manage. Unified error handling and monitoring.
                    </p>
                  </div>
                  <div className="bg-success-muted border border-success rounded-lg p-4">
                    <h5 className="font-semibold text-text-primary mb-2">Better Performance</h5>
                    <p className="text-sm text-text-secondary">
                      Specialized agents optimized for specific tasks. More consistent output
                      quality.
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-warning-muted border border-warning rounded-lg p-4">
                  <h5 className="font-semibold text-amber-900 mb-2">Risk Mitigation</h5>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>
                      • <strong>Rollback Plan:</strong> Feature flag system allows instant
                      rollback to single-model system
                    </li>
                    <li>
                      • <strong>Vendor Flexibility:</strong> Agent abstraction layer allows
                      swapping models without rewriting code
                    </li>
                    <li>
                      • <strong>Cost Control:</strong> Per-agent monitoring and rate limiting
                      prevents runaway costs
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-12 border-t border-border-default">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  href="/guide"
                  className="flex items-center gap-2 text-accent-primary hover:text-accent-primary font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to User Guide
                </Link>
                <p className="text-sm text-text-tertiary">
                  RotoWrite AI Team Architecture Documentation
                </p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

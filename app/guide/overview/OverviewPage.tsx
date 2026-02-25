'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Users,
  Trophy,
  CheckCircle2,
  FileText,
  Target,
  Workflow,
  ChevronRight,
} from 'lucide-react';

interface TOCItem {
  id: string;
  title: string;
}

const tableOfContents: TOCItem[] = [
  { id: 'what-it-is', title: 'What It Is' },
  { id: 'what-makes-it-special', title: 'What Makes It Special' },
  { id: 'complete-workflow', title: 'The Complete Workflow' },
  { id: 'technical-excellence', title: 'Technical Excellence' },
  { id: 'who-its-for', title: 'Who It\'s For' },
];

export default function OverviewPage() {
  const [activeSection, setActiveSection] = useState('what-it-is');

  // Track scroll position and update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map((item) => item.id);

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
              <Sparkles className="h-5 w-5 text-accent-primary" />
              <span className="font-semibold text-text-primary">App Overview</span>
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
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                    activeSection === item.id
                      ? 'bg-accent-muted text-accent-primary font-medium'
                      : 'text-text-secondary hover:text-accent-primary hover:bg-bg-elevated'
                  }`}
                >
                  {activeSection === item.id && (
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className={activeSection !== item.id ? 'ml-5' : ''}>
                    {item.title}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            <article className="prose prose-invert max-w-none">
              {/* Hero Section */}
              <div className="mb-12">
                <h1 className="text-4xl font-bold text-text-primary mb-4 flex items-center gap-3">
                  <Sparkles className="h-10 w-10 text-accent-primary" />
                  Forge: Application Overview
                </h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                  AI-powered content creation platform designed specifically for sports betting and gaming content production
                </p>
              </div>

              {/* What It Is */}
              <section id="what-it-is" className="mb-16 scroll-mt-24">
                <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                  <FileText className="h-7 w-7 text-accent-primary" />
                  What It Is
                </h2>
                <div className="bg-bg-surface rounded-xl p-8 shadow-sm border border-border-default">
                  <p className="text-lg leading-relaxed text-text-secondary">
                    Forge is an AI-powered content creation platform designed specifically for sports betting and gaming content production at RotoWire. Unlike generic AI writing tools, Forge combines specialized writer modeling, SEO optimization, and intelligent content workflow management into a single, purpose-built application. The platform enables content strategists to produce high-quality, SEO-optimized articles that maintain authentic writer voice and style while dramatically accelerating the content creation process.
                  </p>
                </div>
              </section>

              {/* What Makes It Special */}
              <section id="what-makes-it-special" className="mb-16 scroll-mt-24">
                <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                  <Trophy className="h-7 w-7 text-accent-primary" />
                  What Makes It Special
                </h2>
                
                <div className="space-y-6">
                  {/* Writer Engine Card */}
                  <div className="bg-accent-muted rounded-xl p-8 border border-accent-primary">
                    <div className="flex items-start gap-4">
                      <div className="bg-bg-surface rounded-lg p-3 shadow-sm">
                        <Sparkles className="h-6 w-6 text-accent-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-primary mb-3">
                          Innovative Writer Engine
                        </h3>
                        <p className="text-text-secondary leading-relaxed mb-4">
                          The platform's standout feature is its innovative <strong>Writer Engine</strong>—a RAG-based (Retrieval-Augmented Generation) AI system that learns and replicates individual writer styles with remarkable precision. Instead of producing generic AI content, Forge trains custom AI models on actual articles written by real strategists, analyzing tone, vocabulary, sentence structure, and stylistic patterns.
                        </p>
                        <p className="text-text-secondary leading-relaxed">
                          When generating new content, the system retrieves relevant training examples and instructs Claude AI to match the specific writer's voice, producing articles that are virtually indistinguishable from human-written content. This solves the persistent problem of AI-generated content feeling robotic or off-brand—each piece sounds exactly like it came from the credited writer.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Features Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-bg-surface rounded-xl p-6 shadow-sm border border-border-default">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="h-5 w-5 text-accent-primary" />
                        <h4 className="font-semibold text-lg text-text-primary">Brief Builder</h4>
                      </div>
                      <p className="text-text-secondary leading-relaxed">
                        Provides a structured scaffold system similar to SurferSEO, allowing strategists to create reusable content templates that ensure SEO best practices and consistent formatting across articles.
                      </p>
                    </div>

                    <div className="bg-bg-surface rounded-xl p-6 shadow-sm border border-border-default">
                      <div className="flex items-center gap-3 mb-4">
                        <Zap className="h-5 w-5 text-accent-primary" />
                        <h4 className="font-semibold text-lg text-text-primary">NewsEngine</h4>
                      </div>
                      <p className="text-text-secondary leading-relaxed">
                        Powered by Tavily AI, automatically discovers relevant, recent news stories based on project keywords, eliminating hours of manual research work.
                      </p>
                    </div>

                    <div className="bg-bg-surface rounded-xl p-6 shadow-sm border border-border-default">
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="h-5 w-5 text-accent-primary" />
                        <h4 className="font-semibold text-lg text-text-primary">SEO Assistant</h4>
                      </div>
                      <p className="text-text-secondary leading-relaxed">
                        Provides instant optimization feedback, keyword density tracking, and AI-powered improvement suggestions, ensuring every article is primed for search rankings.
                      </p>
                    </div>

                    <div className="bg-bg-surface rounded-xl p-6 shadow-sm border border-border-default">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-accent-primary" />
                        <h4 className="font-semibold text-lg text-text-primary">Real-time Analysis</h4>
                      </div>
                      <p className="text-text-secondary leading-relaxed">
                        Get immediate feedback on content quality, SEO performance, and style consistency as you write and edit.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Complete Workflow */}
              <section id="complete-workflow" className="mb-16 scroll-mt-24">
                <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                  <Workflow className="h-7 w-7 text-accent-primary" />
                  The Complete Workflow
                </h2>
                
                <div className="bg-bg-surface rounded-xl p-8 shadow-sm border border-border-default">
                  <p className="text-lg text-text-secondary leading-relaxed mb-6">
                    Forge transforms content production from a multi-hour manual process into a streamlined, AI-assisted workflow:
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-violet-100 text-accent-primary rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">Create Project</h4>
                        <p className="text-text-secondary leading-relaxed">
                          Begin by creating a project with a headline, target keywords, and optional topic.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-violet-100 text-accent-primary rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">Select Writer Model & Brief</h4>
                        <p className="text-text-secondary leading-relaxed">
                          Choose your personal writer model (pre-trained with your own articles) and select a relevant brief template that defines the article structure.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-violet-100 text-accent-primary rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">Automatic Research</h4>
                        <p className="text-text-secondary leading-relaxed">
                          The NewsEngine automatically gathers current, relevant news sources related to your topic.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-violet-100 text-accent-primary rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">AI Generation</h4>
                        <p className="text-text-secondary leading-relaxed">
                          The AI generates a full draft in your authentic voice, incorporating SEO best practices from the selected brief.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-violet-100 text-accent-primary rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                        5
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">Edit & Optimize</h4>
                        <p className="text-text-secondary leading-relaxed">
                          Edit the content using a rich TipTap editor, with the SEO Assistant providing real-time optimization feedback.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-accent-muted rounded-lg p-6 border border-accent-primary">
                    <p className="text-violet-900 font-semibold mb-2">Result:</p>
                    <p className="text-text-secondary leading-relaxed">
                      The entire process—from concept to polished, SEO-optimized article—takes <strong>minutes instead of hours</strong>, while maintaining the quality and authenticity that readers expect.
                    </p>
                  </div>
                </div>
              </section>

              {/* Technical Excellence */}
              <section id="technical-excellence" className="mb-16 scroll-mt-24">
                <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                  <Zap className="h-7 w-7 text-accent-primary" />
                  Technical Excellence
                </h2>
                
                <div className="bg-bg-surface rounded-xl p-8 shadow-sm border border-border-default">
                  <p className="text-lg text-text-secondary leading-relaxed mb-6">
                    Built on a modern tech stack featuring Next.js 16, React 19, Supabase PostgreSQL, and Claude AI (Anthropic's Sonnet 4 model), Forge delivers enterprise-grade performance with sophisticated security features.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Multi-Agent Architecture
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed ml-6">
                        Specialized AI agents handle content generation, style analysis, SEO optimization, and quality assurance—each optimized for its specific task.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Enterprise Security
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed ml-6">
                        Row-level database security and role-based access control ensure data protection and privacy.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Intelligent Auto-save
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed ml-6">
                        Never lose your work with debounced content persistence and real-time sync.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Cost Efficient
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed ml-6">
                        Monthly AI costs typically under $30 even for high-volume usage, making it extremely cost-effective.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Streaming Responses
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed ml-6">
                        Real-time AI content generation with streaming responses for immediate feedback.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-text-primary flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Beautiful UI
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed ml-6">
                        Intuitive interface built with Shadcn UI components and a modern violet design theme.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Who It's For */}
              <section id="who-its-for" className="mb-16 scroll-mt-24">
                <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                  <Users className="h-7 w-7 text-accent-primary" />
                  Who It's For
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-accent-muted rounded-xl p-8 border border-accent-primary">
                    <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent-primary" />
                      Strategists
                    </h3>
                    <p className="text-text-secondary leading-relaxed mb-4">
                      Content strategists who create and manage their own content projects, train their personal writer models, and produce articles. Strategists benefit from:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="text-text-secondary flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Personal writer models trained on their own writing style</span>
                      </li>
                      <li className="text-text-secondary flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Accelerated content creation workflow</span>
                      </li>
                      <li className="text-text-secondary flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Real-time SEO optimization assistance</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border border-border-default">
                    <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-text-secondary" />
                      Admins
                    </h3>
                    <p className="text-text-secondary leading-relaxed mb-4">
                      Administrators who oversee the entire system, manage user accounts, configure AI settings, and maintain writer models and brief templates. Admins have:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="text-text-secondary flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Full access to all writer models and briefs</span>
                      </li>
                      <li className="text-text-secondary flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>User account management capabilities</span>
                      </li>
                      <li className="text-text-secondary flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>AI configuration and tuning controls</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-bg-surface rounded-xl p-8 shadow-sm border border-border-default">
                    <h4 className="font-semibold text-text-primary mb-3">Perfect For:</h4>
                    <p className="text-text-secondary leading-relaxed">
                      The platform is specifically tailored for <strong>sports betting content</strong>—particularly for articles like team analysis, odds comparisons, gambling law guides, and playoff predictions—making it an indispensable tool for the GDC (Gaming and Digital Content) team's mission to rank highly in Google's AI search results while maintaining authentic, engaging content quality.
                    </p>
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="mt-16">
                <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">Ready to Get Started?</h3>
                  <p className="text-violet-100 mb-6 leading-relaxed">
                    Explore the complete user guide to learn how to create your first project, train your writer model, and start producing high-quality content in minutes.
                  </p>
                  <Link
                    href="/guide"
                    className="inline-flex items-center gap-2 bg-bg-surface text-accent-primary px-6 py-3 rounded-lg font-semibold hover:bg-accent-muted transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                    View Complete User Guide
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Sparkles, FileText, Target, Zap, Download, Home, ArrowLeft, Cpu, Bot, Menu, X, ChevronRight, Clock, Calculator, ExternalLink } from 'lucide-react';

export default function UserGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('getting-started');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when section changes
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const tableOfContents = [
    { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
    { id: 'ai-architecture', title: 'AI Architecture', icon: Cpu },
    { id: 'registration', title: 'Account Registration', icon: FileText },
    { id: 'writer-factory', title: 'Writer Factory', icon: Sparkles },
    { id: 'brief-builder', title: 'SmartBrief Builder', icon: FileText },
    { id: 'creating-projects', title: 'Creating Projects', icon: Target },
    { id: 'nfl-odds-extractor', title: 'NFL Odds Extractor', icon: Target },
    { id: 'seo-package', title: 'Understanding SEO Package', icon: Target },
    { id: 'seo-wizard', title: 'SEO Wizard Tools', icon: Zap },
    { id: 'content-generation', title: 'Content Generation', icon: Sparkles },
    { id: 'editing', title: 'Editing & Real-time Analysis', icon: FileText },
    { id: 'exporting', title: 'Exporting Content', icon: Download },
    { id: 'walkthrough', title: 'Complete Walkthrough', icon: BookOpen },
  ];

  const guideContent: Record<string, { title: string; content: React.JSX.Element }> = {
    'getting-started': {
      title: 'Getting Started with RotoWrite',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            Welcome to RotoWrite! This guide will help you master the art of creating AI-powered, 
            SEO-optimized content that maintains your unique voice and style.
          </p>

          <div className="bg-accent-muted border-l-4 border-accent-primary p-6 rounded-r-lg">
            <h3 className="text-lg font-semibold mb-3 text-accent-primary">What Makes RotoWrite Different?</h3>
            <p className="leading-relaxed text-text-secondary">
              RotoWrite combines three powerful elements to create content that's both SEO-optimized 
              and authentically written in your voice: <strong className="text-text-primary">Writer Models</strong>, <strong className="text-text-primary">SEO Packages</strong>, 
              and <strong className="text-text-primary">SmartBriefs</strong>. This unique combination ensures your content ranks well while 
              maintaining your personal style.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Core Features Overview</h3>
          
          <div className="grid gap-4">
            <div className="border border-border-default rounded-lg p-5 bg-bg-elevated hover:border-border-hover transition-all">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-primary" />
                <span className="text-text-primary">Writer Factory</span>
              </h4>
              <p className="text-text-secondary leading-relaxed">
                Train AI models on your writing samples to capture your unique voice, tone, and style. 
                The more content you train with, the better the AI becomes at emulating your writing.
              </p>
            </div>

            <div className="border border-border-default rounded-lg p-5 bg-bg-elevated hover:border-border-hover transition-all">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent-primary" />
                <span className="text-text-primary">Brief Builder</span>
              </h4>
              <p className="text-text-secondary leading-relaxed">
                Create reusable content templates that define structure, required sections, and formatting. 
                SmartBriefs ensure consistency across all your content while meeting specific requirements.
              </p>
            </div>

            <div className="border border-border-default rounded-lg p-5 bg-bg-elevated hover:border-border-hover transition-all">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent-primary" />
                <span className="text-text-primary">SEO Wizard</span>
              </h4>
              <p className="text-text-secondary leading-relaxed">
                Real-time SEO analysis provides instant feedback on content optimization. Track keyword usage, 
                content structure, and get actionable suggestions to improve your search rankings.
              </p>
            </div>

            <div className="border border-border-default rounded-lg p-5 bg-bg-elevated hover:border-border-hover transition-all">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-accent-primary" />
                <span className="text-text-primary">SEO Package</span>
              </h4>
              <p className="text-text-secondary leading-relaxed">
                A comprehensive collection of SEO data (headline, keywords, topic) that guides content generation. 
                The package is dynamically updated as you select suggested keywords from the SEO Wizard.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">How It All Works Together</h3>
          
          <p className="leading-relaxed mb-4">
            When you create content in RotoWrite, the AI combines:
          </p>

          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li className="leading-relaxed">
              <strong>Your Writer Model</strong> – Ensures the content sounds like you wrote it
            </li>
            <li className="leading-relaxed">
              <strong>Your SEO Package</strong> – Incorporates keywords and topics for search optimization
            </li>
            <li className="leading-relaxed">
              <strong>Your Brief Template</strong> – Follows the exact structure and format you've defined
            </li>
          </ol>

          <p className="leading-relaxed mt-4">
            The result is content that ranks well in search engines while maintaining your authentic voice 
            and following your exact content structure requirements.
          </p>
        </div>
      ),
    },

    'ai-architecture': {
      title: 'AI Architecture: The Multi-Agent System',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            RotoWrite is powered by a sophisticated <strong>Multi-Agent AI System</strong> – a team of 7 specialized 
            AI agents that work together to produce high-quality, SEO-optimized content in your unique voice. 
            Each agent has a specific role and expertise, making the whole system more powerful than any single AI could be.
          </p>

          <div className="bg-accent-muted border border-accent-primary rounded-lg p-8 my-8">
            <h3 className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2">
              <Cpu className="h-6 w-6 text-accent-primary" />
              <span className="text-text-primary">The 7-Agent Orchestra</span>
            </h3>
            <p className="text-center text-text-secondary mb-6">
              Just like a symphony orchestra has different sections working in harmony, 
              RotoWrite's agents each play their part to create content that ranks and resonates.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Meet the Agents</h3>

          <div className="space-y-6">
            {/* Agent 1 */}
            <div className="border-l-4 border-accent-primary pl-6 py-4 bg-accent-muted rounded-r-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-accent-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h4 className="font-bold text-lg text-text-primary">Content Generation Agent</h4>
              </div>
              <p className="text-text-secondary leading-relaxed mb-3">
                The primary writer of your team. This agent takes your brief, keywords, and writer model context 
                to generate complete articles with proper structure, headings, tables, and lists.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-accent-muted border border-accent-primary text-accent-primary rounded text-xs font-medium">Article Generation</span>
                <span className="px-2 py-1 bg-accent-muted border border-accent-primary text-accent-primary rounded text-xs font-medium">Streaming Output</span>
                <span className="px-2 py-1 bg-accent-muted border border-accent-primary text-accent-primary rounded text-xs font-medium">SEO Integration</span>
              </div>
            </div>

            {/* Agent 2 */}
            <div className="border-l-4 border-[#3b82f6] pl-6 py-4 bg-[rgba(59,130,246,0.15)] rounded-r-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#3b82f6] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h4 className="font-bold text-lg text-text-primary">Writer Training Agent</h4>
              </div>
              <p className="text-text-secondary leading-relaxed mb-3">
                Your voice analyst. When you add content to the Writer Factory, this agent analyzes your writing 
                samples to extract tone, vocabulary patterns, sentence structure, and stylistic elements that make 
                your writing unique.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-[rgba(59,130,246,0.2)] border border-[#3b82f6] text-[#60a5fa] rounded text-xs font-medium">Style Analysis</span>
                <span className="px-2 py-1 bg-[rgba(59,130,246,0.2)] border border-[#3b82f6] text-[#60a5fa] rounded text-xs font-medium">Voice Extraction</span>
                <span className="px-2 py-1 bg-[rgba(59,130,246,0.2)] border border-[#3b82f6] text-[#60a5fa] rounded text-xs font-medium">Pattern Recognition</span>
              </div>
            </div>

            {/* Agent 3 */}
            <div className="border-l-4 border-success pl-6 py-4 bg-success-muted rounded-r-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-success text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h4 className="font-bold text-lg text-text-primary">SEO Optimization Agent</h4>
              </div>
              <p className="text-text-secondary leading-relaxed mb-3">
                Your search engine strategist. This agent analyzes your content for keyword density, heading 
                structure, and SEO best practices. It calculates your SEO score and provides specific 
                recommendations for improvement.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-success-muted border border-success text-success rounded text-xs font-medium">Keyword Analysis</span>
                <span className="px-2 py-1 bg-success-muted border border-success text-success rounded text-xs font-medium">SEO Scoring</span>
                <span className="px-2 py-1 bg-success-muted border border-success text-success rounded text-xs font-medium">Optimization Tips</span>
              </div>
            </div>

            {/* Agent 4 */}
            <div className="border-l-4 border-warning pl-6 py-4 bg-warning-muted rounded-r-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-warning text-bg-deepest rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <h4 className="font-bold text-lg text-text-primary">Quality Assurance Agent</h4>
              </div>
              <p className="text-text-secondary leading-relaxed mb-3">
                Your editor and proofreader. Powered by both AI and LanguageTool, this agent checks grammar, 
                spelling, readability, and consistency. It ensures your content is polished and professional 
                before publishing.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-warning-muted border border-warning text-warning rounded text-xs font-medium">Grammar Check</span>
                <span className="px-2 py-1 bg-warning-muted border border-warning text-warning rounded text-xs font-medium">Readability Score</span>
                <span className="px-2 py-1 bg-warning-muted border border-warning text-warning rounded text-xs font-medium">Consistency Review</span>
              </div>
            </div>

            {/* Agent 5 */}
            <div className="border-l-4 border-[#ec4899] pl-6 py-4 bg-[rgba(236,72,153,0.15)] rounded-r-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#ec4899] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <h4 className="font-bold text-lg text-text-primary">Persona & Tone Agent</h4>
              </div>
              <p className="text-text-secondary leading-relaxed mb-3">
                Your voice coach. If content needs tone adjustment – perhaps it's too formal when you write 
                casually, or vice versa – this agent refines the language to match your writer model's 
                personality while preserving SEO keywords.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-[rgba(236,72,153,0.2)] border border-[#ec4899] text-[#f9a8d4] rounded text-xs font-medium">Tone Matching</span>
                <span className="px-2 py-1 bg-[rgba(236,72,153,0.2)] border border-[#ec4899] text-[#f9a8d4] rounded text-xs font-medium">Voice Adaptation</span>
                <span className="px-2 py-1 bg-[rgba(236,72,153,0.2)] border border-[#ec4899] text-[#f9a8d4] rounded text-xs font-medium">Style Consistency</span>
              </div>
            </div>

            {/* Agent 6 */}
            <div className="border-l-4 border-ai-accent pl-6 py-4 bg-ai-muted rounded-r-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-ai-accent text-white rounded-full flex items-center justify-center font-bold text-lg">
                  6
                </div>
                <h4 className="font-bold text-lg text-text-primary">Creative Features Agent</h4>
              </div>
              <p className="text-text-secondary leading-relaxed mb-3">
                Your workflow coordinator. When complex tasks require multiple agents working together, 
                this agent orchestrates the process – routing tasks to the right specialists and combining 
                their outputs into cohesive results.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-ai-muted border border-ai-accent text-ai-accent rounded text-xs font-medium">Workflow Management</span>
                <span className="px-2 py-1 bg-ai-muted border border-ai-accent text-ai-accent rounded text-xs font-medium">Multi-Agent Tasks</span>
                <span className="px-2 py-1 bg-ai-muted border border-ai-accent text-ai-accent rounded text-xs font-medium">Data Transform</span>
              </div>
            </div>

            {/* Agent 7 */}
            <div className="border-l-4 border-[#06b6d4] pl-6 py-4 bg-[rgba(6,182,212,0.15)] rounded-r-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#06b6d4] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  7
                </div>
                <h4 className="font-bold text-lg text-text-primary">Visual Extraction Agent</h4>
              </div>
              <p className="text-text-secondary leading-relaxed mb-3">
                Your data reader. This agent can extract structured data from images – screenshots of sports 
                statistics, tables, or any visual content. It turns images into usable data that other agents 
                can work with.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-[rgba(6,182,212,0.2)] border border-[#06b6d4] text-[#67e8f9] rounded text-xs font-medium">Image Analysis</span>
                <span className="px-2 py-1 bg-[rgba(6,182,212,0.2)] border border-[#06b6d4] text-[#67e8f9] rounded text-xs font-medium">Data Extraction</span>
                <span className="px-2 py-1 bg-[rgba(6,182,212,0.2)] border border-[#06b6d4] text-[#67e8f9] rounded text-xs font-medium">Table Parsing</span>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-12 mb-4 text-text-primary">How Agents Work Together</h3>

          <p className="leading-relaxed mb-6 text-text-secondary">
            When you create content in RotoWrite, multiple agents collaborate behind the scenes:
          </p>

          <div className="bg-bg-elevated border border-border-default rounded-lg p-6 my-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#3b82f6] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h5 className="font-semibold text-text-primary">Writer Training Analyzes Your Voice</h5>
                  <p className="text-sm text-text-secondary">
                    When you add samples to Writer Factory, Agent #2 extracts your unique writing patterns
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h5 className="font-semibold text-text-primary">SEO Agent Prepares Keyword Strategy</h5>
                  <p className="text-sm text-text-secondary">
                    When you analyze your SEO Package, Agent #3 generates keyword suggestions and targets
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h5 className="font-semibold text-text-primary">Content Agent Creates Your Article</h5>
                  <p className="text-sm text-text-secondary">
                    Agent #1 combines your brief, keywords, and writer model to generate content
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#ec4899] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h5 className="font-semibold text-text-primary">Persona Agent Fine-Tunes Voice</h5>
                  <p className="text-sm text-text-secondary">
                    Agent #5 ensures the content matches your authentic voice and tone
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-warning text-bg-deepest rounded-full flex items-center justify-center text-sm font-bold">
                  5
                </div>
                <div>
                  <h5 className="font-semibold text-text-primary">QA Agent Reviews Quality</h5>
                  <p className="text-sm text-text-secondary">
                    Agent #4 checks grammar, readability, and consistency before final output
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-text-primary">Agent Guardrails</h3>

          <p className="leading-relaxed mb-4 text-text-secondary">
            Each agent has built-in <strong className="text-text-primary">guardrails</strong> that define what it can and cannot do. 
            This ensures agents stay focused on their specialties and don't overstep their roles:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-success bg-success-muted rounded-lg p-4">
              <h5 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                <span className="text-success">✓</span> Agents CAN:
              </h5>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Perform their specialized tasks</li>
                <li>• Access relevant data for their role</li>
                <li>• Provide recommendations within their expertise</li>
                <li>• Collaborate with other agents through defined channels</li>
              </ul>
            </div>

            <div className="border border-error bg-error-muted rounded-lg p-4">
              <h5 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                <span className="text-error">✗</span> Agents CANNOT:
              </h5>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Perform tasks outside their specialty</li>
                <li>• Modify database records directly</li>
                <li>• Access other users' data</li>
                <li>• Make changes without proper validation</li>
              </ul>
            </div>
          </div>

          <div className="bg-accent-muted border-l-4 border-accent-primary p-6 rounded-r-lg mt-8">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-primary" />
              <span className="text-text-primary">Why Multi-Agent Matters</span>
            </h4>
            <p className="leading-relaxed text-sm mb-3 text-text-secondary">
              Traditional AI systems use a single model for everything, which can lead to inconsistent results. 
              RotoWrite's multi-agent approach means:
            </p>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-1">✓</span>
                <span className="text-text-secondary"><strong className="text-text-primary">Specialized expertise</strong> – Each agent excels at its specific task</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-1">✓</span>
                <span className="text-text-secondary"><strong className="text-text-primary">Better quality</strong> – Multiple review passes catch more issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-1">✓</span>
                <span className="text-text-secondary"><strong className="text-text-primary">Consistent voice</strong> – Dedicated agents maintain your authentic style</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-1">✓</span>
                <span className="text-text-secondary"><strong className="text-text-primary">Scalable power</strong> – Complex tasks are broken down and handled efficiently</span>
              </li>
            </ul>
          </div>

          <div className="bg-warning-muted border-l-4 border-warning p-5 rounded-r-lg mt-6">
            <p className="text-sm font-medium text-text-primary mb-2">🔧 For Administrators</p>
            <p className="text-sm text-text-secondary">
              Super administrators can fine-tune each agent's behavior through the <strong className="text-text-primary">AI Agents</strong> tab 
              in the Admin Dashboard. Adjust system prompts, temperature settings, and other parameters to 
              optimize agent performance for your specific needs.
            </p>
          </div>

          {/* Explore More Links */}
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/guide/time-savings"
              className="group flex items-center gap-4 p-5 bg-success-muted border-2 border-success rounded-xl hover:border-success hover:shadow-md transition-all"
            >
              <div className="bg-success rounded-lg p-3 group-hover:bg-success/90 transition-colors">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-text-primary group-hover:text-success">
                  Time Savings Calculator
                </h5>
                <p className="text-sm text-text-secondary">
                  See how much time your team could save
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-success group-hover:text-success" />
            </Link>

            <Link
              href="/guide/ai-team"
              className="group flex items-center gap-4 p-5 bg-accent-muted border-2 border-accent-primary rounded-xl hover:border-accent-hover hover:shadow-md transition-all"
            >
              <div className="bg-accent-primary rounded-lg p-3 group-hover:bg-accent-hover transition-colors">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-text-primary group-hover:text-accent-primary">
                  Full AI Team Documentation
                </h5>
                <p className="text-sm text-text-secondary">
                  Technical specs, costs & security details
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-accent-primary group-hover:text-accent-hover" />
            </Link>
          </div>
        </div>
      ),
    },

    'registration': {
      title: 'Account Registration & Verification',
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Creating Your Account</h3>
          
          <p className="leading-relaxed">
            To get started with RotoWrite, you'll need to register for an account and have it verified 
            by an administrator.
          </p>

          <h4 className="font-semibold text-lg mt-6 mb-3">Step 1: Register</h4>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li className="leading-relaxed">Visit the login page and click the <strong>Register</strong> tab</li>
            <li className="leading-relaxed">Enter your full name</li>
            <li className="leading-relaxed">Provide your email address</li>
            <li className="leading-relaxed">Create a secure password</li>
            <li className="leading-relaxed">Click <strong>Register</strong></li>
          </ol>

          <div className="bg-[rgba(59,130,246,0.15)] border-l-4 border-[#3b82f6] p-5 rounded-r-lg my-6">
            <p className="text-sm font-medium text-text-primary mb-2">📧 Check Your Email</p>
            <p className="text-sm text-text-secondary">
              You'll receive an email verification link. Click it to confirm your email address.
            </p>
          </div>

          <h4 className="font-semibold text-lg mt-6 mb-3">Step 2: Account Approval</h4>
          <p className="leading-relaxed mb-4">
            After email verification, your account will have a <strong>pending</strong> status. An administrator 
            must approve your account and assign you a role:
          </p>

          <div className="grid gap-3">
            <div className="border-l-4 border-accent-primary pl-4 py-2">
              <strong className="text-accent-primary">Strategist</strong>
              <p className="text-sm text-muted-foreground">Create and manage your own content, writer models, and briefs</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <strong className="text-blue-700">Editor</strong>
              <p className="text-sm text-muted-foreground">Create and edit content, access shared resources</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <strong className="text-purple-700">Admin</strong>
              <p className="text-sm text-muted-foreground">Full access including user management and system settings</p>
            </div>
          </div>

          <div className="bg-success-muted border-l-4 border-success p-5 rounded-r-lg my-6">
            <p className="text-sm font-medium text-text-primary mb-2">✅ Account Approved</p>
            <p className="text-sm text-text-secondary">
              Once approved, you'll receive another email with your login link. You can then access the full application.
            </p>
          </div>
        </div>
      ),
    },

    'writer-factory': {
      title: 'Writer Factory: Training AI Models',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            The Writer Factory is where you train AI models to write in specific voices and styles. 
            Each model learns from sample content, capturing tone, vocabulary, and writing patterns.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">Creating a Writer Model</h3>
          
          <ol className="list-decimal list-inside space-y-4 ml-4">
            <li className="leading-relaxed">
              <strong>Open the Writer Factory</strong> from the dashboard or initial modal
            </li>
            <li className="leading-relaxed">
              <strong>Click the plus icon</strong> to create a new model (Admin only)
            </li>
            <li className="leading-relaxed">
              <strong>Name your model</strong> (e.g., "Jeremy Botter" or "Sports Analysis Voice")
            </li>
            <li className="leading-relaxed">
              <strong>Click Create</strong> – your new model appears in the sidebar
            </li>
          </ol>

          <h3 className="text-xl font-semibold mt-8 mb-4">Training Your Model</h3>

          <p className="leading-relaxed mb-4">
            Training requires adding <strong>25 complete articles or content pieces</strong> to reach 100% training. 
            The more diverse and representative your samples, the better the model performs.
          </p>

          <div className="bg-accent-muted border border-border-default rounded-lg p-6 my-6">
            <h4 className="font-semibold mb-3">Training Best Practices</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="leading-relaxed">Use complete, published articles (not drafts or fragments)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="leading-relaxed">Include variety – different topics, lengths, and formats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="leading-relaxed">Ensure consistent authorship (all by the same writer)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="leading-relaxed">Aim for 500+ words per sample for better analysis</span>
              </li>
            </ul>
          </div>

          <h4 className="font-semibold text-lg mt-6 mb-3">Adding Training Content</h4>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li className="leading-relaxed">Select a model from the sidebar</li>
            <li className="leading-relaxed">Paste a complete article into the training content area</li>
            <li className="leading-relaxed">Click <strong>Add Training Content</strong></li>
            <li className="leading-relaxed">The AI analyzes the style, tone, and voice automatically</li>
            <li className="leading-relaxed">Training percentage updates immediately</li>
          </ol>

          <div className="bg-warning-muted border-l-4 border-warning p-5 rounded-r-lg my-6">
            <p className="text-sm font-medium text-text-primary mb-2">⚡ Training Progress</p>
            <p className="text-sm text-text-secondary mb-2">
              Each article adds 4% to your training progress (1 of 25 stories).
            </p>
            <p className="text-sm text-text-secondary">
              Models can be used at any training level, but 100% training produces the best results.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Understanding Writer Models</h3>

          <p className="leading-relaxed">
            When you generate content, the AI references your writer model to:
          </p>

          <ul className="space-y-2 mt-4 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="leading-relaxed">Match your vocabulary and word choice patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="leading-relaxed">Replicate your sentence structure and pacing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="leading-relaxed">Maintain your tone (formal, casual, technical, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="leading-relaxed">Apply your writing style to new topics</span>
            </li>
          </ul>
        </div>
      ),
    },

    'brief-builder': {
      title: 'SmartBrief Builder: AI-Powered Content Templates',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            SmartBriefs are AI-powered, reusable content templates that define the structure, sections, and requirements 
            for your content. They ensure consistency and help the AI generate content that follows your 
            exact specifications.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">SmartBrief Builder: Two Powerful Tabs</h3>

          <p className="leading-relaxed mb-4">
            SmartBriefs now have two tabs that work together to create intelligent, adaptive content templates:
          </p>

          <div className="grid gap-4 mb-6">
            <div className="border border-border-default rounded-lg p-5">
              <h4 className="font-semibold text-lg mb-2">📄 Content Template Tab</h4>
              <p className="text-muted-foreground leading-relaxed">
                Use the TipTap editor to define your content structure with headings, lists, and formatting. 
                This is the scaffold the AI follows when generating articles.
              </p>
            </div>
            
            <div className="border border-border-default rounded-lg p-5 bg-accent-muted">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                🤖 AI Configuration Tab (NEW!)
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Teach the AI what this SmartBrief is about by providing instructions and example URLs. 
                The AI analyzes real articles to understand tone, style, formatting, and content patterns.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Creating a SmartBrief</h3>
          
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li className="leading-relaxed">Open the <strong>SmartBrief Builder</strong> from the dashboard</li>
            <li className="leading-relaxed">Click <strong>New SmartBrief</strong></li>
            <li className="leading-relaxed">Name your SmartBrief (e.g., "NFL Team Analysis Template")</li>
            <li className="leading-relaxed">Select or create a category</li>
            <li className="leading-relaxed"><strong>Content Template Tab:</strong> Define your content structure using the editor</li>
            <li className="leading-relaxed"><strong>AI Configuration Tab:</strong> Add instructions and example URLs (see below)</li>
            <li className="leading-relaxed">Toggle <strong>Share with other strategists</strong> if applicable</li>
            <li className="leading-relaxed">Click <strong>Create</strong> to save</li>
          </ol>

          <h3 className="text-xl font-semibold mt-8 mb-4">Using AI Configuration (Game Changer!)</h3>

          <div className="bg-success-muted border-l-4 border-success p-5 rounded-r-lg mb-6">
            <p className="text-sm font-medium text-text-primary mb-2">🚀 Why This Matters</p>
            <p className="text-sm text-text-secondary">
              Instead of the AI guessing what you want, it learns from real examples. This dramatically 
              improves content quality, accuracy, and brand consistency.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 1: Write AI Instructions</h4>
              <p className="text-muted-foreground leading-relaxed mb-2">
                In the <strong>AI Instructions</strong> field, describe:
              </p>
              <ul className="space-y-1 ml-4 text-sm">
                <li>• What type of story this SmartBrief produces</li>
                <li>• The tone and writing style (casual, authoritative, analytical, etc.)</li>
                <li>• Key information that should always be included</li>
                <li>• Any special formatting requirements</li>
              </ul>
              <div className="bg-bg-hover p-3 rounded mt-3 text-sm font-mono">
                Example: "NFL Picks: Single Game stories are focused on a single upcoming NFL game. 
                They should include odds analysis, betting insights, and predictions with a conversational 
                but authoritative tone. Always include point spreads, moneylines, and over/under analysis."
              </div>
            </div>

            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 2: Add Example URLs</h4>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Paste URLs to similar articles (one per line). The AI will visit these URLs and learn from them.
              </p>
              <div className="bg-bg-hover p-3 rounded mt-3 text-sm font-mono">
                https://www.rotowire.com/football/article/nfl-picks-texans-vs-steelers-102538<br/>
                https://www.rotowire.com/football/article/nfl-picks-ravens-vs-chiefs-103422<br/>
                https://www.rotowire.com/football/article/nfl-picks-bills-vs-49ers-101234
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: Include 2-3 high-quality examples for best results (max 3 URLs analyzed)
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 3: Analyze Example URLs</h4>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Click <strong>Analyze Example URLs</strong>. The AI will:
              </p>
              <ul className="space-y-1 ml-4 text-sm">
                <li>✓ Fetch content from each URL</li>
                <li>✓ Extract content structure and organization patterns</li>
                <li>✓ Identify tone and writing style</li>
                <li>✓ Note key information types consistently included</li>
                <li>✓ Detect formatting conventions (tables, lists, heading levels)</li>
                <li>✓ Analyze SEO patterns and keyword usage</li>
                <li>✓ Determine typical length and depth</li>
              </ul>
              <p className="text-xs text-amber-700 mt-2">
                ⏱️ Analysis takes 10-30 seconds depending on URL content size
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 4: Review Analysis</h4>
              <p className="text-muted-foreground leading-relaxed">
                The AI displays a comprehensive analysis showing patterns it extracted. This analysis is 
                saved with your SmartBrief and used every time you generate content with this template.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Structuring Your Brief</h3>

          <p className="leading-relaxed mb-4">
            Use headings, lists, and formatting to create a template. The AI will follow this structure 
            exactly when generating content.
          </p>

          <div className="bg-bg-hover border border-border-default rounded-lg p-5 font-mono text-sm my-6">
            <div className="space-y-2">
              <div className="font-bold text-lg">## Introduction</div>
              <div className="ml-4 text-muted-foreground">Brief overview of the topic</div>
              <div className="font-bold text-lg mt-4">## Main Analysis</div>
              <div className="ml-4 text-muted-foreground">### Key Points</div>
              <div className="ml-8 text-muted-foreground">- Point 1</div>
              <div className="ml-8 text-muted-foreground">- Point 2</div>
              <div className="ml-8 text-muted-foreground">- Point 3</div>
              <div className="font-bold text-lg mt-4">## Conclusion</div>
              <div className="ml-4 text-muted-foreground">Summary and takeaways</div>
            </div>
          </div>

          <div className="bg-accent-muted border border-border-default rounded-lg p-6 my-6">
            <h4 className="font-semibold mb-3">Brief Best Practices</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="leading-relaxed">Use H2 and H3 headings to define main sections and subsections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="leading-relaxed">Include specific section requirements (word counts, key points)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="leading-relaxed">Add formatting guidelines (bullet lists, numbered lists)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="leading-relaxed">Create category-specific templates for different content types</span>
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Using SmartBriefs in Projects</h3>

          <p className="leading-relaxed">
            When creating a new project, you'll select a brief template. The AI uses this template to:
          </p>

          <ul className="space-y-2 mt-4 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="leading-relaxed">Generate content with the exact heading structure you specified</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="leading-relaxed">Follow the number of H2s and H3s defined in your template</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="leading-relaxed">Include required sections in the correct order</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="leading-relaxed">Maintain consistent formatting across all content pieces</span>
            </li>
          </ul>

          <div className="bg-[rgba(59,130,246,0.15)] border-l-4 border-[#3b82f6] p-5 rounded-r-lg mt-6">
            <p className="text-sm font-medium text-text-primary mb-2">💡 Pro Tip</p>
            <p className="text-sm text-text-secondary">
              Create multiple brief templates for different content types (team analysis, player profiles, 
              game previews, etc.) to maintain consistency across your content library.
            </p>
          </div>
        </div>
      ),
    },

    'creating-projects': {
      title: 'Creating Projects: Step-by-Step',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            Projects are where you create individual content pieces. Each project combines your SEO 
            requirements, writer model, and brief template to generate optimized content in your voice.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">The 9-Step Project Creation Process</h3>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 1: Project Name</h4>
              <p className="text-muted-foreground leading-relaxed">
                Give your project a descriptive name for easy identification 
                (e.g., "Ravens Playoff Analysis 2024")
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 2: Headline (H1)</h4>
              <p className="text-muted-foreground leading-relaxed">
                Your main headline that will appear at the top of your content. This becomes part of your 
                SEO Package and should include your primary keyword when possible.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 3: Primary Keyword</h4>
              <p className="text-muted-foreground leading-relaxed">
                The main search term you want to rank for (e.g., "Baltimore Ravens playoffs"). 
                This keyword will be prioritized in your content.
              </p>
            </div>

            {/* Step 4 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 4: Secondary Keywords</h4>
              <p className="text-muted-foreground leading-relaxed">
                Additional keywords separated by commas (e.g., "AFC North, NFL playoffs, playoff seeding"). 
                These support your primary keyword and provide additional ranking opportunities.
              </p>
            </div>

            {/* Step 5 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 5: Additional Details</h4>
              <p className="text-muted-foreground leading-relaxed">
                Any extra context, angle, or specific requirements for the content. This helps the AI 
                understand your content goals and approach.
              </p>
            </div>

            {/* Step 6 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 6: Writer Model</h4>
              <p className="text-muted-foreground leading-relaxed">
                Select which writer model to use. If you have a personal model, it's auto-selected. 
                The percentage next to each model shows training progress.
              </p>
            </div>

            {/* Step 7 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 7: Brief Template</h4>
              <p className="text-muted-foreground leading-relaxed">
                Choose a brief that defines your content structure. You can create a new brief on-the-fly 
                using the plus icon.
              </p>
            </div>

            {/* Step 8 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 8: Word Count Target</h4>
              <p className="text-muted-foreground leading-relaxed">
                Set your target word count (e.g., 800, 1500, 3000). This guides content generation 
                and is tracked in the SEO Wizard.
              </p>
            </div>

            {/* Step 9 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 9: Confirmation</h4>
              <p className="text-muted-foreground leading-relaxed">
                Review all your project details. You can go back to any step to make changes before 
                clicking <strong>Start Project</strong>.
              </p>
            </div>
          </div>

          <div className="bg-success-muted border-l-4 border-success p-5 rounded-r-lg mt-8">
            <p className="text-sm font-medium text-text-primary mb-2">✅ Project Created!</p>
            <p className="text-sm text-text-secondary">
              Once you click Start Project, your dashboard loads with all project information displayed 
              in the left sidebar and the editor ready in the center.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Editing Project Details</h3>

          <p className="leading-relaxed">
            After creating a project, you can edit any field directly from the left sidebar:
          </p>

          <ol className="list-decimal list-inside space-y-2 ml-4 mt-4">
            <li className="leading-relaxed">Click the edit icon next to any field</li>
            <li className="leading-relaxed">Make your changes</li>
            <li className="leading-relaxed">Click save (✓) or cancel (×)</li>
            <li className="leading-relaxed">Changes are saved to your project immediately</li>
          </ol>
        </div>
      ),
    },

    'nfl-odds-extractor': {
      title: 'NFL Odds Extractor',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            The NFL Odds Extractor is a powerful automation tool that transforms weekly NFL schedule and odds 
            data from screenshots into fully-formatted articles. This feature saves 25+ minutes per week and 
            eliminates transcription errors.
          </p>

          <div className="bg-success-muted border-l-4 border-success p-5 rounded-r-lg">
            <p className="text-sm font-medium text-text-primary mb-2">⏱️ Time Savings</p>
            <p className="text-sm text-text-secondary">
              <strong>Manual Process:</strong> 30+ minutes per week<br />
              <strong>With NFL Odds Extractor:</strong> 3-5 minutes per week<br />
              <strong>Annual Savings:</strong> ~21.5 hours (52 weeks)
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">How It Works</h3>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 1: Access the Feature</h4>
              <p className="text-muted-foreground leading-relaxed">
                Click <strong>NFL Odds Extractor</strong> in the dashboard sidebar (look for the trending up icon).
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 2: Upload Screenshots</h4>
              <p className="text-muted-foreground leading-relaxed">
                Upload two screenshots:
              </p>
              <ul className="mt-2 space-y-1 ml-4">
                <li>• <strong>ESPN Schedule:</strong> Screenshot of NFL weekly schedule with dates, times, locations</li>
                <li>• <strong>RotoWire Odds:</strong> Screenshot of DraftKings odds matrix with spreads, moneylines, over/under</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 3: Configure Week Details</h4>
              <p className="text-muted-foreground leading-relaxed">
                Enter the week number (1-18) and season year. Optionally add a custom headline, or let the 
                system auto-generate one.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 4: Extract & Generate</h4>
              <p className="text-muted-foreground leading-relaxed">
                Click <strong>Extract & Generate</strong>. The Visual Extraction Agent processes both images, 
                extracts all data (teams, dates, odds, locations), and generates a complete article with 
                structured tables.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6 py-2">
              <h4 className="font-semibold text-lg mb-2">Step 5: Edit & Publish</h4>
              <p className="text-muted-foreground leading-relaxed">
                The generated article opens in the editor with all matchup tables populated. Add your 
                predictions and analysis, then export when ready.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">What Gets Generated</h3>

          <div className="space-y-3">
            <div className="border border-border-default rounded-lg p-4">
              <h4 className="font-semibold mb-2">Matchup List</h4>
              <p className="text-sm text-muted-foreground">
                A simple list of all matchups (e.g., "Lions vs Packers") for copying into your tracking spreadsheet.
              </p>
            </div>

            <div className="border border-border-default rounded-lg p-4">
              <h4 className="font-semibold mb-2">Individual Matchup Sections</h4>
              <p className="text-sm text-muted-foreground">
                For each game, generates an H2 heading, odds table (7 rows with matchup, spread, moneyline, 
                over/under, date, location, last verified), prediction section (blank), and picks section 
                with placeholders.
              </p>
            </div>

            <div className="border border-border-default rounded-lg p-4">
              <h4 className="font-semibold mb-2">Opening Odds Summary Table</h4>
              <p className="text-sm text-muted-foreground">
                A comprehensive table showing all matchups with opening spreads for tracking line movement.
              </p>
            </div>
          </div>

          <div className="bg-[rgba(59,130,246,0.15)] border-l-4 border-[#3b82f6] p-5 rounded-r-lg mt-6">
            <p className="text-sm font-medium text-text-primary mb-2">💡 Pro Tips</p>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• Take screenshots at the same size/zoom level each week for consistency</li>
              <li>• Ensure text in screenshots is clear and readable</li>
              <li>• The AI handles various screenshot qualities, but clearer is better</li>
              <li>• Replace all "X" placeholders in picks sections with your predictions</li>
              <li>• Use the standard editor features to add analysis to prediction sections</li>
            </ul>
          </div>
        </div>
      ),
    },

    'seo-package': {
      title: 'Understanding the SEO Package',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            The SEO Package is a comprehensive bundle of all SEO-related data for your project. 
            It's dynamically built and updated as you work, serving as the foundation for search-optimized 
            content generation.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">What's in the SEO Package?</h3>

          <div className="bg-accent-muted border border-border-default rounded-lg p-6 my-6">
            <h4 className="font-semibold mb-4 text-lg">Package Components</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-primary mb-1">H1/Title/Headline</h5>
                <p className="text-sm text-muted-foreground">Your main headline from project creation</p>
              </div>

              <div>
                <h5 className="font-semibold text-primary mb-1">Primary Keyword</h5>
                <p className="text-sm text-muted-foreground">The main search term you're targeting</p>
              </div>

              <div>
                <h5 className="font-semibold text-primary mb-1">Secondary Keywords</h5>
                <p className="text-sm text-muted-foreground">Supporting keywords for additional ranking opportunities</p>
              </div>

              <div>
                <h5 className="font-semibold text-primary mb-1">Topic/Additional Context</h5>
                <p className="text-sm text-muted-foreground">Extra details about your content angle and approach</p>
              </div>

              <div>
                <h5 className="font-semibold text-primary mb-1">Selected Keywords (Dynamic)</h5>
                <p className="text-sm text-muted-foreground">Keywords you select from SEO Wizard suggestions are added in real-time</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">How the SEO Package Works</h3>

          <p className="leading-relaxed mb-4">
            The SEO Package evolves through your content creation workflow:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Initial Creation</h4>
                <p className="text-muted-foreground leading-relaxed">
                  When you create a project, the SEO Package is built from your headline, keywords, and topic.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Analysis Phase</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Click "Analyze SEO Package" in the SEO Wizard. The AI analyzes your package and generates 
                  keyword suggestions based on search trends and competitor analysis.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Keyword Selection</h4>
                <p className="text-muted-foreground leading-relaxed">
                  As you click suggested keywords in the Terms section, they're immediately added to your 
                  SEO Package. Deselecting removes them.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Content Generation</h4>
                <p className="text-muted-foreground leading-relaxed">
                  When you click "Create Content," the AI uses the complete SEO Package (including selected 
                  keywords) along with your Writer Model and Brief to generate optimized content.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent-muted border-l-4 border-primary p-5 rounded-r-lg mt-8">
            <h4 className="font-semibold mb-3">Why the SEO Package Matters</h4>
            <p className="leading-relaxed text-sm">
              The SEO Package ensures that your content is optimized for search engines from the start. 
              By combining your target keywords with AI analysis and Writer Model training, RotoWrite creates 
              content that ranks well while still sounding natural and authentic to your voice.
            </p>
          </div>
        </div>
      ),
    },

    'seo-wizard': {
      title: 'SEO Wizard: Real-Time Optimization',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            The SEO Wizard is your real-time optimization assistant, providing instant feedback and actionable 
            suggestions as you write. It tracks content structure, keyword usage, and overall SEO performance.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">SEO Wizard Interface</h3>

          <div className="space-y-6">
            {/* Content Score */}
            <div className="border border-border-default rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Content Score (0-100)
              </h4>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A semi-circular gauge displays your overall SEO score with color-coded segments:
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="font-bold text-red-600">0-40</div>
                  <div className="text-xs text-muted-foreground">Needs Work</div>
                </div>
                <div className="text-center p-3 bg-warning-muted rounded">
                  <div className="font-bold text-orange-600">40-70</div>
                  <div className="text-xs text-muted-foreground">Good</div>
                </div>
                <div className="text-center p-3 bg-success-muted rounded">
                  <div className="font-bold text-green-600">70-100</div>
                  <div className="text-xs text-muted-foreground">Excellent</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Below the gauge, you'll see <strong>Avg</strong> (your average score across all projects) 
                and <strong>Top</strong> (your highest score achieved).
              </p>
            </div>

            {/* Content Structure */}
            <div className="border border-border-default rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Content Structure Metrics
              </h4>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Four key metrics are tracked in real-time:
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-bg-elevated rounded">
                  <div>
                    <div className="font-semibold text-sm">WORDS</div>
                    <div className="text-xs text-muted-foreground">Current vs Target Range</div>
                  </div>
                  <div className="text-sm">e.g., 2,267 / 3,043-3,499</div>
                </div>

                <div className="flex justify-between items-center p-3 bg-bg-elevated rounded">
                  <div>
                    <div className="font-semibold text-sm">HEADINGS</div>
                    <div className="text-xs text-muted-foreground">H2 + H3 count</div>
                  </div>
                  <div className="text-sm">e.g., 34 / 27-40</div>
                </div>

                <div className="flex justify-between items-center p-3 bg-bg-elevated rounded">
                  <div>
                    <div className="font-semibold text-sm">PARAGRAPHS</div>
                    <div className="text-xs text-muted-foreground">Minimum target</div>
                  </div>
                  <div className="text-sm">e.g., 65 / at least 85</div>
                </div>

                <div className="flex justify-between items-center p-3 bg-bg-elevated rounded">
                  <div>
                    <div className="font-semibold text-sm">IMAGES</div>
                    <div className="text-xs text-muted-foreground">Recommended range</div>
                  </div>
                  <div className="text-sm">e.g., 5 / 12-20</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm font-medium mb-2">Status Indicators:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-muted-foreground">In optimal range</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600">↑</span>
                    <span className="text-muted-foreground">Below target (add more)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">↓</span>
                    <span className="text-muted-foreground">Above target (reduce)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Analysis */}
            <div className="border border-border-default rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Terms & Keyword Analysis
              </h4>
              
              <p className="text-muted-foreground leading-relaxed mb-4">
                Track keyword usage with precision:
              </p>

              <div className="space-y-4">
                <div>
                  <div className="font-semibold mb-2">Search & Filter</div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use the search bar to find specific terms. Filter by:
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-accent-muted text-accent-primary rounded text-sm font-medium">All</span>
                    <span className="px-3 py-1 bg-bg-hover text-text-secondary rounded text-sm">Headings Only</span>
                    <span className="px-3 py-1 bg-bg-hover text-text-secondary rounded text-sm">NLP Extracted</span>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">Category Tags</div>
                  <p className="text-sm text-muted-foreground">
                    Terms are organized by category (e.g., #Content, #Market) with counts showing 
                    how many terms are in each category.
                  </p>
                </div>

                <div>
                  <div className="font-semibold mb-2">Usage Tracking</div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Each term shows:
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li className="text-muted-foreground">• Current usage count</li>
                    <li className="text-muted-foreground">• Target range (e.g., 8-15)</li>
                    <li className="text-muted-foreground">• Color-coded status (green=optimal, yellow=close, red=off target)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border border-border-default rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-3">Optimization Tools</h4>
              
              <div className="space-y-4">
                <div>
                  <div className="font-semibold mb-1 text-primary">Auto-Optimize</div>
                  <p className="text-sm text-muted-foreground">
                    AI analyzes your content and suggests specific optimizations: add keywords, 
                    adjust headings, add paragraphs/images, and optimize term usage.
                  </p>
                </div>

                <div>
                  <div className="font-semibold mb-1 text-primary">Insert Internal Links</div>
                  <p className="text-sm text-muted-foreground">
                    Analyzes your content for internal link opportunities and suggests relevant links 
                    based on keywords and topic relevance.
                  </p>
                </div>

                <div>
                  <div className="font-semibold mb-1 text-primary">Analyze SEO Package</div>
                  <p className="text-sm text-muted-foreground">
                    Appears before first content generation. Analyzes your project's SEO Package and 
                    populates the wizard with keyword suggestions and target ranges.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-warning-muted border-l-4 border-warning p-5 rounded-r-lg mt-6">
            <p className="text-sm font-medium text-text-primary mb-2">⚡ Real-Time Updates</p>
            <p className="text-sm text-text-secondary">
              All metrics update automatically as you edit, with a 2-second delay to optimize performance. 
              This means you get instant feedback without lag while typing.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-12 mb-4">The SEO Engine: Under the Hood</h3>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Powered by Advanced AI Analysis
            </h4>
            <p className="leading-relaxed text-sm">
              RotoWrite now features a centralized <strong>SEO Engine</strong> that powers all optimization features. 
              This sophisticated system combines traditional SEO metrics with AI-powered analysis from Claude to provide 
              comprehensive, intelligent content optimization.
            </p>
          </div>

          <div className="space-y-5">
            <div className="border-l-4 border-violet-400 pl-5">
              <h4 className="font-semibold mb-2">Real-Time Keyword Tracking</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The SEO Engine tracks all keywords (primary, secondary, and suggested) in real-time as you write. 
                It calculates ideal density ranges based on your target word count and shows status indicators 
                (optimal/under/over) for each keyword, updating live as your content changes.
              </p>
            </div>

            <div className="border-l-4 border-violet-400 pl-5">
              <h4 className="font-semibold mb-2">AI-Powered Suggestions</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you request SEO suggestions, the Engine uses Claude to analyze your content against your 
                SEO Package and current score. It provides 5-7 specific, actionable recommendations like 
                "Add your primary keyword to the H2 in paragraph 3" rather than generic advice.
              </p>
            </div>

            <div className="border-l-4 border-violet-400 pl-5">
              <h4 className="font-semibold mb-2">Auto-Optimization</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Auto-Optimize feature uses AI to actually rewrite portions of your content to implement 
                SEO suggestions. It preserves your writing style and tone while improving keyword placement, 
                heading structure, and overall optimization—all powered by the same Writer Model that generated your content.
              </p>
            </div>

            <div className="border-l-4 border-violet-400 pl-5">
              <h4 className="font-semibold mb-2">Internal Linking Intelligence</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Engine analyzes your content and compares it against your other projects to suggest relevant 
                internal links. It identifies the best anchor text, explains why each link adds value, and shows 
                exactly where to place links for maximum SEO benefit.
              </p>
            </div>

            <div className="border-l-4 border-violet-400 pl-5">
              <h4 className="font-semibold mb-2">Content Metrics Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Beyond just word counts, the SEO Engine extracts comprehensive metrics: heading distribution 
                (H1/H2/H3), paragraph count, image count, and content structure. These metrics are compared 
                against ideal ranges calculated for your specific content length and topic.
              </p>
            </div>

            <div className="border-l-4 border-violet-400 pl-5">
              <h4 className="font-semibold mb-2">Competitor Analysis (Coming Soon)</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The SEO Engine includes built-in competitor analysis capabilities. It can compare your content 
                against top-ranking competitors to identify content gaps, keyword opportunities, and structural 
                differences that could improve your rankings.
              </p>
            </div>
          </div>

          <div className="bg-success-muted border-l-4 border-success p-5 rounded-r-lg mt-8">
            <h4 className="font-semibold mb-2 text-text-primary">🎯 Always Getting Smarter</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              The SEO Engine is designed to evolve with the latest SEO best practices and AI capabilities. 
              As search algorithms change and new optimization techniques emerge, the Engine can be updated 
              without changing how you use RotoWrite—your workflow stays the same while the intelligence behind 
              it gets better.
            </p>
          </div>
        </div>
      ),
    },

    'content-generation': {
      title: 'Content Generation: How It All Works',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            Content generation in RotoWrite is where the magic happens – combining your Writer Model, 
            SEO Package, and Brief to create optimized content that sounds authentically like you.
          </p>

          <div className="bg-accent-muted border-2 border-primary rounded-lg p-8 my-8">
            <h3 className="text-xl font-bold mb-6 text-center">The Content Generation Formula</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Writer Model</div>
                  <div className="text-sm text-muted-foreground">Ensures authentic voice and style</div>
                </div>
              </div>

              <div className="text-center text-2xl font-bold text-primary">+</div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">SEO Package</div>
                  <div className="text-sm text-muted-foreground">Keywords and topics for optimization</div>
                </div>
              </div>

              <div className="text-center text-2xl font-bold text-primary">+</div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Brief Template</div>
                  <div className="text-sm text-muted-foreground">Defines structure and requirements</div>
                </div>
              </div>

              <div className="text-center text-2xl font-bold text-primary">=</div>

              <div className="bg-bg-surface rounded-lg p-4 border-2 border-primary text-center">
                <div className="font-bold text-lg">SEO-Optimized Content</div>
                <div className="text-sm text-muted-foreground">In Your Authentic Voice</div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Step-by-Step Generation Process</h3>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-accent-muted0 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-2">Analyze SEO Package (First Time Only)</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Click <strong>"Analyze SEO Package"</strong> in the SEO Wizard. The AI examines your 
                  headline, keywords, and topic, then generates keyword suggestions based on:
                </p>
                <ul className="text-sm space-y-1 mt-2 ml-4">
                  <li className="text-muted-foreground">• Current search trends</li>
                  <li className="text-muted-foreground">• Competitor analysis</li>
                  <li className="text-muted-foreground">• NLP keyword extraction</li>
                  <li className="text-muted-foreground">• Your brief requirements</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-accent-muted0 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-2">Select Keywords</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Review the suggested keywords in the Terms section. Click to select relevant keywords 
                  – they're immediately added to your SEO Package. The package updates in real-time as 
                  you select and deselect keywords.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-accent-muted0 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-2">Generate Content</h4>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  Click <strong>"Create Content"</strong> (below the SEO Meter). The AI begins generating:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li className="text-muted-foreground">• Loads your Writer Model's training data</li>
                  <li className="text-muted-foreground">• Analyzes your Brief structure</li>
                  <li className="text-muted-foreground">• Incorporates all SEO Package keywords</li>
                  <li className="text-muted-foreground">• Generates content matching your voice and structure</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-accent-muted0 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-2">Content Streams In</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Watch as content appears in your editor in real-time. The AI follows your Brief's 
                  exact structure – if your Brief has 4 H2s and 6 H3s, the generated content will too.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-accent-muted0 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h4 className="font-semibold mb-2">SEO Meter Activates</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Once content exists, the SEO Meter springs to life with your initial score. All Content 
                  Structure metrics populate with real data. The Terms section shows actual keyword usage 
                  vs targets.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-accent-muted0 text-white rounded-full flex items-center justify-center font-bold">
                6
              </div>
              <div>
                <h4 className="font-semibold mb-2">Auto-Save</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Content automatically saves to your project. You'll see the save status in the editor's 
                  status bar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent-muted border-l-4 border-primary p-6 rounded-r-lg mt-8">
            <h4 className="font-semibold mb-3">Why This Approach Works</h4>
            <p className="text-sm leading-relaxed mb-2">
              Traditional AI content often sounds generic and doesn't follow specific structures. RotoWrite 
              solves this by:
            </p>
            <ul className="text-sm space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Training on YOUR writing specifically, not generic content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Following YOUR exact Brief structure every time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Incorporating YOUR selected keywords naturally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Maintaining consistency across all content pieces</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    'editing': {
      title: 'Editing & Real-Time SEO Analysis',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            After generating content, RotoWrite's real-time SEO analysis guides your editing process. 
            Every change you make is instantly reflected in the SEO Wizard metrics.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">The Editor</h3>

          <p className="leading-relaxed mb-4">
            RotoWrite uses TipTap, a powerful rich text editor that supports:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border-default rounded-lg p-4">
              <h4 className="font-semibold mb-2">Text Formatting</h4>
              <ul className="text-sm space-y-1">
                <li className="text-muted-foreground">• Bold, italic, underline</li>
                <li className="text-muted-foreground">• Headings (H1, H2, H3)</li>
                <li className="text-muted-foreground">• Bullet and numbered lists</li>
                <li className="text-muted-foreground">• Blockquotes</li>
              </ul>
            </div>

            <div className="border border-border-default rounded-lg p-4">
              <h4 className="font-semibold mb-2">Content Management</h4>
              <ul className="text-sm space-y-1">
                <li className="text-muted-foreground">• Undo/redo</li>
                <li className="text-muted-foreground">• Auto-save (every 2 seconds)</li>
                <li className="text-muted-foreground">• Word count tracking</li>
                <li className="text-muted-foreground">• Copy/paste support</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Real-Time SEO Feedback</h3>

          <p className="leading-relaxed mb-4">
            As you edit, the SEO Wizard updates automatically with a 2-second delay:
          </p>

          <div className="space-y-4">
            <div className="bg-success-muted border-l-4 border-success p-4 rounded-r-lg">
              <h4 className="font-semibold text-text-primary mb-2">Adding Content</h4>
              <p className="text-sm text-text-secondary">
                When you add paragraphs, headings, or keywords, watch metrics improve in real-time. 
                Green checkmarks appear when you hit target ranges.
              </p>
            </div>

            <div className="bg-warning-muted border-l-4 border-orange-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Removing Content</h4>
              <p className="text-sm text-orange-800">
                If you delete content, metrics update immediately. Orange arrows indicate when you've 
                dropped below targets.
              </p>
            </div>

            <div className="bg-[rgba(59,130,246,0.15)] border-l-4 border-[#3b82f6] p-4 rounded-r-lg">
              <h4 className="font-semibold text-text-primary mb-2">Keyword Optimization</h4>
              <p className="text-sm text-text-secondary">
                The Terms section shows exactly how many times each keyword appears vs the target. 
                Add or remove keywords to stay in the optimal range.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Using Auto-Optimize</h3>

          <div className="border-2 border-primary rounded-lg p-6">
            <h4 className="font-semibold mb-3 text-lg">How Auto-Optimize Works</h4>
            
            <ol className="space-y-3 list-decimal list-inside">
              <li className="leading-relaxed">
                <strong>Click Auto-Optimize</strong> button in the SEO Wizard
              </li>
              <li className="leading-relaxed">
                <strong>AI analyzes</strong> your current content against best practices
              </li>
              <li className="leading-relaxed">
                <strong>Receives suggestions</strong> for specific improvements:
                <ul className="ml-8 mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Where to add missing keywords</li>
                  <li>• Suggestions for additional headings</li>
                  <li>• Recommendations for paragraph breaks</li>
                  <li>• Image placement suggestions</li>
                </ul>
              </li>
              <li className="leading-relaxed">
                <strong>Apply or ignore</strong> each suggestion individually
              </li>
            </ol>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Best Editing Practices</h3>

          <div className="bg-accent-muted border border-border-default rounded-lg p-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">1.</span>
                <div>
                  <strong>Check your SEO score first</strong>
                  <p className="text-sm text-muted-foreground">See what needs the most improvement</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">2.</span>
                <div>
                  <strong>Focus on red and orange metrics</strong>
                  <p className="text-sm text-muted-foreground">These are furthest from target ranges</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">3.</span>
                <div>
                  <strong>Add keywords naturally</strong>
                  <p className="text-sm text-muted-foreground">Don't force keywords – maintain readability</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">4.</span>
                <div>
                  <strong>Watch the Content Score</strong>
                  <p className="text-sm text-muted-foreground">Aim for 70+ for optimal SEO performance</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-1">5.</span>
                <div>
                  <strong>Use Auto-Optimize for ideas</strong>
                  <p className="text-sm text-muted-foreground">Let AI suggest improvements you might have missed</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-warning-muted border-l-4 border-warning p-5 rounded-r-lg mt-6">
            <p className="text-sm font-medium text-text-primary mb-2">💡 Pro Tip</p>
            <p className="text-sm text-text-secondary">
              Don't obsess over achieving 100% on every metric. A score of 75-85 with natural, readable 
              content performs better than forcing 100% optimization that makes content sound robotic.
            </p>
          </div>
        </div>
      ),
    },

    'exporting': {
      title: 'Exporting Content',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            Once you're satisfied with your content, use the Export button in the editor toolbar to download 
            or copy your article. The export system includes critical safety warnings to prevent publishing 
            AI-generated content without proper review.
          </p>

          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
            <p className="text-sm font-medium text-red-900 mb-2">⚠️ CRITICAL: Review Before Publishing</p>
            <p className="text-sm text-red-800">
              <strong>Never copy and paste AI-generated content directly into the RotoWire CMS without review!</strong> All content 
              must be fact-checked, edited, and verified for accuracy. AI can produce errors, outdated information, 
              or incorrect data that requires human verification.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">How to Export</h3>

          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li className="leading-relaxed">Complete and finalize your content</li>
            <li className="leading-relaxed">Click the <strong>Export</strong> button in the editor toolbar (top right)</li>
            <li className="leading-relaxed">Read and acknowledge the CMS warning</li>
            <li className="leading-relaxed">Select your export format (HTML or Plain Text)</li>
            <li className="leading-relaxed">Click <strong>Copy</strong> to copy to clipboard or <strong>Download</strong> to save as file</li>
          </ol>

          <h3 className="text-xl font-semibold mt-8 mb-4">Export Formats</h3>

          <div className="grid gap-4">
            <div className="border border-border-default rounded-lg p-5">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                HTML Format
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Exports with all formatting as HTML tags (bold, italic, headings, lists, tables). Best for 
                pasting into CMSs like RotoWire, WordPress, or any HTML-compatible editor.
              </p>
            </div>

            <div className="border border-border-default rounded-lg p-5">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Plain Text
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Exports without any formatting – just the raw text. Useful for email, simple systems, or 
                when you need to reformat content elsewhere.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Export Safety Feature</h3>

          <p className="leading-relaxed mb-4">
            The Export Modal includes a mandatory acknowledgement checkbox that you must check before 
            exporting. This ensures you understand that:
          </p>

          <ul className="space-y-2 ml-4">
            <li className="leading-relaxed">✓ AI-generated content requires human review</li>
            <li className="leading-relaxed">✓ You will fact-check all information before publishing</li>
            <li className="leading-relaxed">✓ You will edit and verify content accuracy</li>
            <li className="leading-relaxed">✓ You understand AI can produce errors or outdated data</li>
          </ul>

          <div className="bg-[rgba(59,130,246,0.15)] border-l-4 border-[#3b82f6] p-5 rounded-r-lg mt-6">
            <p className="text-sm font-medium text-text-primary mb-2">💡 Export Best Practices</p>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• Always run SEO Wizard before exporting to maximize ranking potential</li>
              <li>• Use Auto-Optimize for last-minute improvements</li>
              <li>• Verify all statistics, dates, and factual claims</li>
              <li>• Check that all placeholder text (like "X" in predictions) is replaced</li>
              <li>• Use HTML format for RotoWire CMS to preserve tables and formatting</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Saving Projects</h3>

          <p className="leading-relaxed mb-4">
            Your work is automatically saved every 2 seconds while editing. To save a project state:
          </p>

          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li className="leading-relaxed">Click the <strong>Save Project</strong> button</li>
            <li className="leading-relaxed">Name your save file (e.g., "Draft v2" or "Final - Pre-Edit")</li>
            <li className="leading-relaxed">The entire current state is saved – content, settings, everything</li>
            <li className="leading-relaxed">Access saved states from <strong>Open Project</strong> in the initial modal</li>
          </ol>

          <p className="text-sm text-muted-foreground mt-4 italic">
            Note: Auto-save continuously protects your work. Named saves are for creating specific 
            milestones or versions you might want to return to later.
          </p>
        </div>
      ),
    },

    'walkthrough': {
      title: 'Complete Walkthrough: Creating Your First Content',
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed font-semibold text-primary">
            Follow this step-by-step walkthrough to create your first piece of optimized content in RotoWrite.
          </p>

          <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg p-6 my-8">
            <h3 className="text-2xl font-bold mb-2">Let's Create Content!</h3>
            <p className="text-accent-light">
              This walkthrough assumes you've registered, been approved, and are logged into RotoWrite.
            </p>
          </div>

          {/* Phase 1 */}
          <div className="border-l-4 border-accent-primary pl-6 py-4 bg-accent-muted/50">
            <h3 className="text-xl font-bold mb-3 text-violet-900">Phase 1: Train Your Writer Model</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="font-bold text-accent-primary">1.</div>
                <p className="leading-relaxed">Click <strong>Writer Factory</strong> from the initial dashboard modal</p>
              </div>
              
              <div className="flex gap-3">
                <div className="font-bold text-accent-primary">2.</div>
                <div>
                  <p className="leading-relaxed">Create a new model named after yourself (or the voice you're training)</p>
                  <p className="text-sm text-muted-foreground mt-1">Admin users can create models for themselves or others</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-accent-primary">3.</div>
                <div>
                  <p className="leading-relaxed">Add 5-10 complete articles to get started (aim for 25 eventually)</p>
                  <p className="text-sm text-muted-foreground mt-1">Copy/paste each article, then click "Add Training Content"</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-accent-primary">4.</div>
                <p className="leading-relaxed">Watch your training percentage increase with each article</p>
              </div>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50/50 mt-6">
            <h3 className="text-xl font-bold mb-3 text-text-primary">Phase 2: Create a Brief Template</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="font-bold text-blue-600">1.</div>
                <p className="leading-relaxed">Open <strong>SmartBrief Builder</strong> from the dashboard</p>
              </div>
              
              <div className="flex gap-3">
                <div className="font-bold text-blue-600">2.</div>
                <p className="leading-relaxed">Click <strong>New Brief</strong> and name it descriptively</p>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-blue-600">3.</div>
                <div>
                  <p className="leading-relaxed">Create your content structure using headings:</p>
                  <div className="mt-2 bg-bg-surface rounded p-3 text-sm font-mono">
                    <div>## Introduction</div>
                    <div>## Main Section</div>
                    <div>### Subsection A</div>
                    <div>### Subsection B</div>
                    <div>## Analysis</div>
                    <div>### Key Points</div>
                    <div>## Conclusion</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-blue-600">4.</div>
                <p className="leading-relaxed">Save your brief – it's now ready to use</p>
              </div>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="border-l-4 border-green-500 pl-6 py-4 bg-success-muted/50 mt-6">
            <h3 className="text-xl font-bold mb-3 text-text-primary">Phase 3: Create Your First Project</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="font-bold text-green-600">1.</div>
                <p className="leading-relaxed">Click <strong>New Project</strong> from the dashboard</p>
              </div>
              
              <div className="flex gap-3">
                <div className="font-bold text-green-600">2.</div>
                <div>
                  <p className="leading-relaxed mb-2">Fill out the 9-step wizard:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li className="text-muted-foreground">• Name: "My First Content Piece"</li>
                    <li className="text-muted-foreground">• Headline: "How to Master Content Creation in 2024"</li>
                    <li className="text-muted-foreground">• Primary Keyword: "content creation tips"</li>
                    <li className="text-muted-foreground">• Secondary Keywords: "SEO writing, content strategy"</li>
                    <li className="text-muted-foreground">• Details: "Focus on practical, actionable advice"</li>
                    <li className="text-muted-foreground">• Select your Writer Model</li>
                    <li className="text-muted-foreground">• Select your Brief</li>
                    <li className="text-muted-foreground">• Word Count: 1500</li>
                    <li className="text-muted-foreground">• Review and confirm</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-green-600">3.</div>
                <p className="leading-relaxed">Click <strong>Start Project</strong></p>
              </div>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="border-l-4 border-orange-500 pl-6 py-4 bg-warning-muted/50 mt-6">
            <h3 className="text-xl font-bold mb-3 text-orange-900">Phase 4: Analyze & Generate</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="font-bold text-orange-600">1.</div>
                <div>
                  <p className="leading-relaxed">Look at the right sidebar – find the SEO Wizard</p>
                  <p className="text-sm text-muted-foreground mt-1">You'll see your Writer Model and Brief at the top</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="font-bold text-orange-600">2.</div>
                <p className="leading-relaxed">Click <strong>"Analyze SEO Package"</strong></p>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-orange-600">3.</div>
                <div>
                  <p className="leading-relaxed">Watch the wizard populate with keyword suggestions</p>
                  <p className="text-sm text-muted-foreground mt-1">The Terms section fills with suggested keywords and target ranges</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-orange-600">4.</div>
                <div>
                  <p className="leading-relaxed">Click keywords in the Terms section to select them</p>
                  <p className="text-sm text-muted-foreground mt-1">Selected keywords are added to your SEO Package automatically</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-orange-600">5.</div>
                <div>
                  <p className="leading-relaxed">Once you're happy with your keyword selection, click <strong>"Create Content"</strong></p>
                  <p className="text-sm text-muted-foreground mt-1">The button appears below the SEO Meter (currently grayed out)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 5 */}
          <div className="border-l-4 border-purple-500 pl-6 py-4 bg-purple-50/50 mt-6">
            <h3 className="text-xl font-bold mb-3 text-purple-900">Phase 5: Watch the Magic Happen</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="font-bold text-purple-600">1.</div>
                <div>
                  <p className="leading-relaxed">Content streams into your editor in real-time</p>
                  <p className="text-sm text-muted-foreground mt-1">The AI follows your Brief's exact structure while using your Writer Model's voice</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="font-bold text-purple-600">2.</div>
                <div>
                  <p className="leading-relaxed">The SEO Meter activates and shows your initial score</p>
                  <p className="text-sm text-muted-foreground mt-1">All metrics (Words, Headings, Paragraphs, Images) populate with real data</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-purple-600">3.</div>
                <div>
                  <p className="leading-relaxed">The Terms section shows actual keyword usage</p>
                  <p className="text-sm text-muted-foreground mt-1">Green = optimal usage, Orange = close, Red = needs adjustment</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-purple-600">4.</div>
                <p className="leading-relaxed">Content automatically saves</p>
              </div>
            </div>
          </div>

          {/* Phase 6 */}
          <div className="border-l-4 border-[#ec4899] pl-6 py-4 bg-[rgba(236,72,153,0.15)] mt-6">
            <h3 className="text-xl font-bold mb-3 text-text-primary">Phase 6: Edit & Optimize</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="font-bold text-[#ec4899]">1.</div>
                <p className="leading-relaxed">Read through your generated content</p>
              </div>
              
              <div className="flex gap-3">
                <div className="font-bold text-[#ec4899]">2.</div>
                <div>
                  <p className="leading-relaxed">Check your SEO Score – aim for 70+</p>
                  <p className="text-sm text-muted-foreground mt-1">The gauge is color-coded: Red (0-40), Orange (40-70), Green (70-100)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-[#ec4899]">3.</div>
                <div>
                  <p className="leading-relaxed">Look at orange and red metrics in Content Structure</p>
                  <p className="text-sm text-muted-foreground mt-1">These are furthest from target – focus your editing here</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-[#ec4899]">4.</div>
                <div>
                  <p className="leading-relaxed">Make edits and watch metrics update in real-time</p>
                  <p className="text-sm text-muted-foreground mt-1">There's a 2-second delay to prevent lag while typing</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-[#ec4899]">5.</div>
                <div>
                  <p className="leading-relaxed">Use <strong>Auto-Optimize</strong> for AI suggestions</p>
                  <p className="text-sm text-muted-foreground mt-1">Get specific recommendations on where to add keywords, headings, or paragraphs</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-[#ec4899]">6.</div>
                <p className="leading-relaxed">Continue editing until you reach your target score</p>
              </div>
            </div>
          </div>

          {/* Phase 7 */}
          <div className="border-l-4 border-ai-accent pl-6 py-4 bg-ai-muted mt-6">
            <h3 className="text-xl font-bold mb-3 text-text-primary">Phase 7: Export & Publish</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="font-bold text-ai-accent">1.</div>
                <p className="leading-relaxed">When you're satisfied with your content, find the export icon</p>
              </div>
              
              <div className="flex gap-3">
                <div className="font-bold text-ai-accent">2.</div>
                <p className="leading-relaxed">Choose your export format (Rich Text, Word, Plain Text, or Markdown)</p>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-ai-accent">3.</div>
                <p className="leading-relaxed">Download and publish to your platform</p>
              </div>

              <div className="flex gap-3">
                <div className="font-bold text-ai-accent">4.</div>
                <div>
                  <p className="leading-relaxed">Optionally, save a named version of your project</p>
                  <p className="text-sm text-muted-foreground mt-1">Great for keeping "Final Draft" or "Pre-Edit" versions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Congratulations */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-8 mt-8">
            <h3 className="text-2xl font-bold mb-3">🎉 Congratulations!</h3>
            <p className="text-green-50 text-lg">
              You've created your first piece of SEO-optimized content that maintains your authentic voice. 
              The more you use RotoWrite, the better your Writer Models become, and the faster your workflow gets.
            </p>
            <p className="text-green-100 mt-4">
              Now create more content, experiment with different briefs, and watch your productivity soar!
            </p>
          </div>
        </div>
      ),
    },
  };

  const filteredContent = tableOfContents.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-deepest">
      {/* Header */}
      <header className="bg-bg-deep border-b border-border-default sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-bg-hover transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-text-primary" />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-accent-primary" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-text-primary">RotoWrite User Guide</h1>
              <p className="text-xs sm:text-sm text-text-secondary hidden sm:block">Everything you need to master RotoWrite</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" size="sm" className="sm:hidden p-2">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="hidden sm:flex">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button size="sm" className="sm:hidden p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-bg-deep shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border-default bg-accent-muted">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent-primary" />
              <span className="font-semibold text-text-primary">Contents</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-text-primary" />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="px-4 py-3 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Mobile TOC */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {filteredContent.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionSelect(item.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-lg text-sm transition-all flex items-center gap-3 ${
                      selectedSection === item.id
                        ? 'bg-accent-primary text-bg-deepest shadow-md font-semibold'
                        : 'hover:bg-bg-hover text-text-secondary active:bg-bg-elevated'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="leading-tight">{item.title}</span>
                    <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                  </button>
                );
              })}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No results found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        <div className="bg-bg-surface rounded-lg border border-border-default overflow-hidden lg:flex" style={{ minHeight: 'calc(100vh - 120px)' }}>
          
          {/* Desktop Sidebar - Hidden on Mobile */}
          <div className="hidden lg:flex lg:w-80 border-r border-border-default flex-col bg-bg-deep">
            {/* Sticky Search Bar */}
            <div className="sticky top-0 bg-bg-surface border-b border-border-subtle px-4 py-3 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Scrollable TOC */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1.5">
                {filteredContent.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSection(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3 ${
                        selectedSection === item.id
                          ? 'bg-accent-primary text-bg-deepest shadow-md font-semibold'
                          : 'hover:bg-bg-hover text-text-secondary'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="leading-tight">{item.title}</span>
                    </button>
                  );
                })}
              </div>

              {filteredContent.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No results found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Guide Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Mobile Section Indicator */}
            <div className="lg:hidden sticky top-0 bg-bg-deep/95 backdrop-blur-sm border-b border-border-subtle px-4 py-3 z-10">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span className="font-medium text-text-primary">{tableOfContents.find(i => i.id === selectedSection)?.title}</span>
                <ChevronRight className="h-4 w-4 rotate-90" />
              </button>
            </div>

            <div className="px-4 sm:px-8 lg:px-12 py-6 sm:py-10 max-w-5xl mx-auto">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-text-primary border-b-2 border-accent-primary pb-4">
                {guideContent[selectedSection]?.title}
              </h1>
              
              {/* Content */}
            <div className="prose prose-invert prose-sm sm:prose-lg max-w-none 
                prose-headings:scroll-mt-20
                prose-h3:text-lg prose-h3:sm:text-xl
                prose-p:text-sm prose-p:sm:text-base
                prose-li:text-sm prose-li:sm:text-base
              ">
                {guideContent[selectedSection]?.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

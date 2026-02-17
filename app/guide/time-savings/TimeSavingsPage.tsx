'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Users,
  Calculator,
  TrendingDown,
  Sparkles,
  Zap,
  BarChart3,
} from 'lucide-react';
import SavingsCalculator from './SavingsCalculator';
import SavingsResults from './SavingsResults';

interface TOCItem {
  id: string;
  title: string;
}

const tableOfContents: TOCItem[] = [
  { id: 'hero', title: 'Overview' },
  { id: 'quick-stats', title: 'Quick Stats' },
  { id: 'calculator', title: 'Calculator' },
  { id: 'results', title: 'Your Results' },
  { id: 'breakdown', title: 'Time Breakdown' },
];

export interface CalculatorInputs {
  teamSize: number;
  newArticles: number;
  newTime: number;
  updateArticles: number;
  updateTime: number;
  complexArticles: number;
  complexTime: number;
}

export interface CalculatorResults {
  currentWeeklyHours: number;
  newWeeklyHours: number;
  weeklySaved: number;
  monthlySaved: number;
  annualSaved: number;
  perPersonWeekly: number;
  fteEquivalent: number;
  breakdown: {
    type: string;
    currentTime: number;
    newTime: number;
    saved: number;
    reduction: string;
  }[];
}

export default function TimeSavingsPage() {
  const [activeSection, setActiveSection] = useState('hero');
  const [inputs, setInputs] = useState<CalculatorInputs>({
    teamSize: 6,
    newArticles: 20,
    newTime: 60,
    updateArticles: 30,
    updateTime: 10,
    complexArticles: 5,
    complexTime: 120,
  });
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Track scroll position and update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map((item) => item.id);

      for (const sectionId of [...sections].reverse()) {
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

  const calculateSavings = () => {
    // Time savings assumptions
    const NEW_REDUCTION = 0.42; // 58% reduction → multiply by 0.42
    const UPDATE_REDUCTION = 0.40; // 60% reduction → multiply by 0.40
    const COMPLEX_REDUCTION = 0.17; // 83% reduction → multiply by 0.17

    // Current time calculations (weekly, in minutes)
    const currentNewTime = inputs.newArticles * inputs.newTime;
    const currentUpdateTime = inputs.updateArticles * inputs.updateTime;
    const currentComplexTime = inputs.complexArticles * inputs.complexTime;
    const currentTotalMinutes = currentNewTime + currentUpdateTime + currentComplexTime;

    // Time with Forge (weekly, in minutes)
    const newNewTime = inputs.newArticles * (inputs.newTime * NEW_REDUCTION);
    const newUpdateTime = inputs.updateArticles * (inputs.updateTime * UPDATE_REDUCTION);
    const newComplexTime = inputs.complexArticles * (inputs.complexTime * COMPLEX_REDUCTION);
    const newTotalMinutes = newNewTime + newUpdateTime + newComplexTime;

    // Convert to hours
    const currentWeeklyHours = currentTotalMinutes / 60;
    const newWeeklyHours = newTotalMinutes / 60;
    const weeklySaved = currentWeeklyHours - newWeeklyHours;
    const monthlySaved = weeklySaved * 4.33;
    const annualSaved = weeklySaved * 52;
    const perPersonWeekly = weeklySaved / inputs.teamSize;
    const fteEquivalent = weeklySaved / 40;

    // Breakdown by content type
    const breakdown = [
      {
        type: 'New Articles',
        currentTime: currentNewTime / 60,
        newTime: newNewTime / 60,
        saved: (currentNewTime - newNewTime) / 60,
        reduction: '58%',
      },
      {
        type: 'Update Articles',
        currentTime: currentUpdateTime / 60,
        newTime: newUpdateTime / 60,
        saved: (currentUpdateTime - newUpdateTime) / 60,
        reduction: '60%',
      },
      {
        type: 'Complex Articles',
        currentTime: currentComplexTime / 60,
        newTime: newComplexTime / 60,
        saved: (currentComplexTime - newComplexTime) / 60,
        reduction: '83%',
      },
    ];

    setResults({
      currentWeeklyHours,
      newWeeklyHours,
      weeklySaved,
      monthlySaved,
      annualSaved,
      perPersonWeekly,
      fteEquivalent,
      breakdown,
    });
    setHasCalculated(true);

    // Scroll to results after a brief delay
    setTimeout(() => {
      scrollToSection('results');
    }, 100);
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
              <Clock className="h-5 w-5 text-accent-primary" />
              <span className="font-semibold text-text-primary">Time Savings Calculator</span>
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
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === item.id
                      ? 'bg-accent-muted text-accent-primary font-medium'
                      : 'text-text-secondary hover:bg-slate-100 hover:text-text-primary'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile TOC */}
          <div className="lg:hidden mb-8">
            <details className="bg-bg-surface rounded-lg border border-border-default overflow-hidden">
              <summary className="px-4 py-3 cursor-pointer font-medium text-text-secondary hover:bg-bg-elevated">
                Table of Contents
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full text-left py-1 text-sm text-text-secondary hover:text-accent-primary"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Main Content */}
          <main className="space-y-16">
            {/* Hero Section */}
            <section id="hero">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-text-primary mb-4">
                  How Much Time Could Your Team Save?
                </h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                  Calculate the real impact of AI-powered content creation on your workflow
                </p>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed">
                  Forge&apos;s multi-agent AI system dramatically reduces the time needed to
                  create high-quality, SEO-optimized content. Use this calculator to see exactly how
                  much time your team could reclaim each week, month, and year.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-bg-surface border border-border-default rounded-xl p-5 flex items-start gap-4">
                  <div className="bg-accent-muted rounded-lg p-2.5">
                    <TrendingDown className="h-5 w-5 text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">58% Faster</h3>
                    <p className="text-sm text-text-secondary">New article creation</p>
                  </div>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-xl p-5 flex items-start gap-4">
                  <div className="bg-success-muted rounded-lg p-2.5">
                    <Zap className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">60% Faster</h3>
                    <p className="text-sm text-text-secondary">Article updates & rewrites</p>
                  </div>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-xl p-5 flex items-start gap-4">
                  <div className="bg-warning-muted rounded-lg p-2.5">
                    <Sparkles className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">83% Faster</h3>
                    <p className="text-sm text-text-secondary">Complex data-driven content</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Stats Section */}
            <section id="quick-stats">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-accent-primary" />
                Real Results
              </h2>

              <div className="bg-accent-muted border border-accent-primary rounded-xl p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      A 6-person content team saved:
                    </h3>
                    <p className="text-text-secondary">
                      Based on typical usage of 20 new articles, 30 updates, and 5 complex
                      data-driven pieces per week.
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent-primary">~75</div>
                      <div className="text-sm text-text-secondary font-medium">hours/week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent-primary">60%</div>
                      <div className="text-sm text-text-secondary font-medium">time reduction</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-[rgba(59,130,246,0.15)] border border-[#3b82f6] rounded-lg p-6">
                <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  What This Means
                </h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  That&apos;s nearly <strong>2 full-time equivalent (FTE) positions</strong> worth
                  of time freed up every week. Your team can reinvest this time into strategy,
                  research, audience engagement, or simply take on more projects without adding
                  headcount.
                </p>
              </div>
            </section>

            {/* Calculator Section */}
            <section id="calculator">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Calculator className="h-6 w-6 text-accent-primary" />
                Calculate Your Savings
              </h2>

              <p className="text-text-secondary leading-relaxed mb-8">
                Enter your team&apos;s current content production details to see personalized time
                savings projections.
              </p>

              <SavingsCalculator
                inputs={inputs}
                setInputs={setInputs}
                onCalculate={calculateSavings}
              />
            </section>

            {/* Results Section */}
            <section id="results">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Clock className="h-6 w-6 text-accent-primary" />
                Your Results
              </h2>

              {hasCalculated && results ? (
                <SavingsResults results={results} inputs={inputs} />
              ) : (
                <div className="bg-bg-elevated border border-border-default rounded-xl p-12 text-center">
                  <Calculator className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-secondary mb-2">
                    No results yet
                  </h3>
                  <p className="text-text-tertiary">
                    Fill out the calculator above and click &quot;Calculate Savings&quot; to see
                    your personalized time savings.
                  </p>
                </div>
              )}
            </section>

            {/* Breakdown Section */}
            <section id="breakdown">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-accent-primary" />
                Time Breakdown by Content Type
              </h2>

              {hasCalculated && results ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-border-default rounded-lg overflow-hidden">
                    <thead className="bg-bg-elevated">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-text-secondary border-b">
                          Content Type
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-text-secondary border-b">
                          Current Time (hrs/week)
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-text-secondary border-b">
                          With Forge
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-text-secondary border-b">
                          Time Saved
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-text-secondary border-b">
                          Reduction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {results.breakdown.map((row) => (
                        <tr key={row.type}>
                          <td className="py-3 px-4 font-medium">{row.type}</td>
                          <td className="py-3 px-4 text-right font-mono">
                            {row.currentTime.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {row.newTime.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-success font-semibold">
                            {row.saved.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-1 bg-success-muted text-success rounded text-xs font-medium">
                              {row.reduction}
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-accent-muted font-semibold">
                        <td className="py-3 px-4">Total</td>
                        <td className="py-3 px-4 text-right font-mono">
                          {results.currentWeeklyHours.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {results.newWeeklyHours.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-success">
                          {results.weeklySaved.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-1 bg-violet-200 text-accent-primary rounded text-xs font-medium">
                            {((results.weeklySaved / results.currentWeeklyHours) * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-bg-elevated border border-border-default rounded-xl p-8 text-center">
                  <p className="text-text-tertiary">
                    Calculate your savings above to see the breakdown by content type.
                  </p>
                </div>
              )}

              <div className="mt-8 bg-warning-muted border border-warning rounded-lg p-4">
                <h5 className="font-semibold text-text-primary mb-2">About These Estimates</h5>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>
                    • <strong>New Articles (58% reduction):</strong> Standard content generation
                    with SEO optimization and voice matching
                  </li>
                  <li>
                    • <strong>Update Articles (60% reduction):</strong> Refreshing existing content
                    with new data, updating dates, and revisions
                  </li>
                  <li>
                    • <strong>Complex Articles (83% reduction):</strong> Data-heavy content using
                    Smart Odds Capture and visual extraction
                  </li>
                </ul>
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
                <p className="text-sm text-text-tertiary">Forge Time Savings Calculator</p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}



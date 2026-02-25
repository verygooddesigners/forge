'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const sections = [
  { id: 'what-is', title: 'What is a SmartBrief?' },
  { id: 'two-tab-system', title: 'Two-Tab System' },
  { id: 'auto-builder', title: 'AutoBuilder' },
  { id: 'tab-1-structure', title: 'Tab 1: Content Template' },
  { id: 'tab-2-ai-config', title: 'Tab 2: AI Configuration' },
  { id: 'step-by-step', title: 'Step-by-Step Creation' },
  { id: 'ai-instructions', title: 'Writing AI Instructions' },
  { id: 'example-urls', title: 'Using Example URLs' },
  { id: 'examples', title: 'Template Examples' },
  { id: 'best-practices', title: 'Best Practices' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
];

export default function SmartBriefGuideClient() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('what-is');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Set page title
    document.title = 'SmartBrief Creation Guide | Forge';
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn how to create effective SmartBriefs with our comprehensive guide covering structure, AI configuration, examples, and best practices.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn how to create effective SmartBriefs with our comprehensive guide covering structure, AI configuration, examples, and best practices.';
      document.head.appendChild(meta);
    }
  }, []);

  if (!mounted) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`guide-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deepest">
      {/* Header */}
      <header className="border-b border-border-default bg-bg-surface sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-accent-primary" />
              <h1 className="text-2xl font-bold text-text-primary">SmartBrief Creation Guide</h1>
            </div>
            <Button asChild>
              <a href="/">Back to Forge</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Table of Contents - Sticky Sidebar */}
        <aside className="w-64 border-r border-border-default bg-bg-surface p-6 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto hidden lg:block">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-accent-muted text-accent-primary font-medium'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-8 py-12 max-w-4xl">
            <div className="space-y-12">
              
              {/* Section: What is a SmartBrief */}
              <section id="guide-what-is">
                <h2 className="text-2xl font-bold text-text-primary mb-4">What is a SmartBrief?</h2>
                <div className="space-y-4 text-text-secondary">
                  <p className="leading-relaxed">
                    A <strong>SmartBrief</strong> is an AI-powered content template that defines structure, style, context, 
                    and provides real examples for the AI to learn from. SmartBriefs ensure consistency across all your content 
                    while allowing the AI to adapt to different topics.
                  </p>
                  <div className="bg-accent-muted border-l-4 border-accent-primary p-4 rounded-r-lg">
                    <h3 className="font-semibold text-text-primary mb-2">A SmartBrief Defines:</h3>
                    <ul className="space-y-2">
                      <li>📐 <strong>Structure:</strong> Heading hierarchy and required sections</li>
                      <li>🎨 <strong>Style:</strong> Tone, voice, and formatting preferences</li>
                      <li>📝 <strong>Context:</strong> What information should be included</li>
                      <li>📚 <strong>Examples:</strong> Real-world articles the AI learns from</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section: Two-Tab System */}
              <section id="guide-two-tab-system">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Two-Tab System</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tab 1: Content Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-text-secondary">
                        The <strong>scaffold</strong> - Define structure and sections using the TipTap editor. 
                        Use headings, lists, and placeholders to show the AI what your content should look like.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tab 2: AI Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-text-secondary">
                        The <strong>intelligence</strong> - Teach the AI about your content type using detailed 
                        instructions and example URLs that it analyzes to learn your patterns.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Section: AutoBuilder */}
              <section id="guide-auto-builder">
                <h2 className="text-2xl font-bold text-text-primary mb-4">AutoBuilder: Create from a URL</h2>
                <div className="space-y-4 text-text-secondary">
                  <p className="leading-relaxed">
                    Instead of building a SmartBrief from scratch, use the <strong>AutoBuilder</strong> to generate 
                    a complete template from a single article URL. Paste a link to any representative article and 
                    the AI analyzes it to produce a ready-to-use SmartBrief in seconds.
                  </p>

                  <div className="bg-accent-muted border-l-4 border-accent-primary p-4 rounded-r-lg">
                    <h3 className="font-semibold text-text-primary mb-2">AutoBuilder Generates:</h3>
                    <ul className="space-y-2">
                      <li>📝 <strong>Name:</strong> A descriptive template name based on the article type</li>
                      <li>📋 <strong>Description:</strong> One-sentence summary shown in the brief browser</li>
                      <li>🤖 <strong>AI Instructions:</strong> Detailed tone, style, and content guidance extracted from the source</li>
                      <li>📐 <strong>Scaffold:</strong> A structured content outline mirroring the article's section hierarchy</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">How to Use AutoBuilder</h3>

                  <div className="space-y-3">
                    <div className="border-l-4 border-accent-primary pl-6 py-2">
                      <h4 className="font-semibold text-text-primary mb-1">Step 1: Open AutoBuilder</h4>
                      <p className="text-sm">Click <strong>New SmartBrief</strong>, then select the <strong>AutoBuilder</strong> option</p>
                    </div>
                    <div className="border-l-4 border-accent-primary pl-6 py-2">
                      <h4 className="font-semibold text-text-primary mb-1">Step 2: Paste a URL</h4>
                      <p className="text-sm">Enter the URL of a publicly accessible article that represents the content type you want to template</p>
                    </div>
                    <div className="border-l-4 border-accent-primary pl-6 py-2">
                      <h4 className="font-semibold text-text-primary mb-1">Step 3: Review the Result</h4>
                      <p className="text-sm">The AI populates all SmartBrief fields automatically — review and edit anything before saving</p>
                    </div>
                    <div className="border-l-4 border-accent-primary pl-6 py-2">
                      <h4 className="font-semibold text-text-primary mb-1">Step 4: Refine & Save</h4>
                      <p className="text-sm">Add additional example URLs in the AI Configuration tab, then save your new SmartBrief</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Best Source URLs</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✅ Use your best published articles for templates that match your standards</li>
                      <li>✅ Pages must be publicly accessible (no paywalls)</li>
                      <li>✅ One URL is enough — you can add more example URLs afterward</li>
                      <li>❌ Avoid pages that require JavaScript to render (the AI reads HTML directly)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section: Tab 1 - Content Template */}
              <section id="guide-tab-1-structure">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Tab 1: Content Template (The Scaffold)</h2>
                <div className="space-y-4 text-text-secondary">
                  <p className="leading-relaxed">
                    This is where you define the exact structure the AI should follow when generating content.
                  </p>
                  
                  <div className="bg-bg-elevated border border-border-default rounded-lg p-6">
                    <h3 className="font-semibold text-text-primary mb-3">Example Game Preview Template:</h3>
                    <pre className="text-xs bg-bg-deep p-4 rounded overflow-x-auto">
{`## [Game Title]: [Team A] vs [Team B]

[Opening paragraph establishing why this game matters]

## Team Analysis

### [Home Team Name]
- Current Record: [X-Y]
- Last 5 Games: [performance summary]
- Key Players: [names and stats]

### [Away Team Name]
- Current Record: [X-Y]  
- Last 5 Games: [performance summary]
- Key Players: [names and stats]

## Betting Analysis
| Market | Line | Analysis |
|--------|------|----------|
| Spread | [X.X] | [reasoning] |
| Total | [XX.X] | [reasoning] |

## Prediction
[Final prediction with confidence level]`}
                    </pre>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip: Use Descriptive Placeholders</h4>
                    <p className="text-sm text-blue-800">
                      Instead of "[content here]", write "[Analyze offensive rating, pace of play, and recent 
                      lineup changes. Compare to league average.]" - This tells the AI exactly what to write about.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section: Tab 2 - AI Configuration */}
              <section id="guide-tab-2-ai-config">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Tab 2: AI Configuration (The Intelligence)</h2>
                <div className="space-y-6 text-text-secondary">
                  <p className="leading-relaxed">
                    This is where you teach the AI about your content type. It has two parts:
                  </p>

                  {/* AI Instructions */}
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">AI Configuration Instructions</h3>
                    <p className="leading-relaxed mb-4">
                      A detailed prompt explaining what kind of content this brief represents, what tone to use, 
                      what information to include/avoid, and any special requirements.
                    </p>
                    
                    <div className="bg-bg-elevated border border-border-default rounded-lg p-6">
                      <h4 className="font-semibold mb-3">What to Include:</h4>
                      <ul className="space-y-3 text-sm">
                        <li>
                          <strong className="text-text-primary">Content Type:</strong> 
                          <span className="text-xs block mt-1 ml-4">"This is a game preview article for NBA betting analysis"</span>
                        </li>
                        <li>
                          <strong className="text-text-primary">Tone & Voice:</strong>
                          <span className="text-xs block mt-1 ml-4">"Professional but accessible. Conversational without being casual. Data-driven analysis."</span>
                        </li>
                        <li>
                          <strong className="text-text-primary">Target Audience:</strong>
                          <span className="text-xs block mt-1 ml-4">"NBA fans who bet recreationally. Mix of hardcore fans and casual bettors."</span>
                        </li>
                        <li>
                          <strong className="text-text-primary">Required Information:</strong>
                          <span className="text-xs block mt-1 ml-4">"Current records, recent form, injury reports, betting lines, ATS records, prediction with reasoning"</span>
                        </li>
                        <li>
                          <strong className="text-text-primary">What to Avoid:</strong>
                          <span className="text-xs block mt-1 ml-4">"Generic analysis, outdated stats, vague predictions, content filler"</span>
                        </li>
                        <li>
                          <strong className="text-text-primary">Length Guidelines:</strong>
                          <span className="text-xs block mt-1 ml-4">"Total: 1200-1500 words. Introduction: 150-200 words. Each team: 300-400 words."</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Example URLs */}
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">Example URLs for Analysis</h3>
                    <p className="leading-relaxed mb-4">
                      Provide 1-3 URLs to articles that perfectly represent your desired format. The AI analyzes 
                      these to learn your patterns.
                    </p>
                    
                    <div className="bg-bg-elevated border border-border-default rounded-lg p-6">
                      <h4 className="font-semibold mb-3">How to Choose Examples:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>✅ Use your best published work</li>
                        <li>✅ Choose recent articles (current style)</li>
                        <li>✅ Ensure all examples follow similar structure</li>
                        <li>✅ Pick articles you're proud of</li>
                        <li>✅ Make sure URLs are publicly accessible</li>
                        <li>❌ Don't use drafts or unfinished work</li>
                        <li>❌ Avoid paywalled content</li>
                        <li>❌ Don't mix different content types</li>
                      </ul>
                    </div>

                    <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-900 mb-2">📍 Click "Analyze Example URLs"</h4>
                      <p className="text-sm text-green-800">
                        After adding URLs, click the button to trigger AI analysis. The AI will extract patterns 
                        from your examples and store them with the brief. This analysis guides content generation.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: Step by Step */}
              <section id="guide-step-by-step">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Step-by-Step Creation</h2>
                <div className="space-y-6">
                  <div className="border-l-4 border-accent-primary pl-6 py-2">
                    <h3 className="font-semibold text-lg mb-2">Step 1: Name Your SmartBrief</h3>
                    <p className="text-sm text-text-secondary">
                      Use descriptive names: "NBA Game Preview", "NFL Player Profile", "Weekly Odds Roundup"
                    </p>
                  </div>

                  <div className="border-l-4 border-accent-primary pl-6 py-2">
                    <h3 className="font-semibold text-lg mb-2">Step 2: Build Structure (Tab 1)</h3>
                    <p className="text-sm text-text-secondary mb-2">
                      Create your content scaffold with headings, sections, and descriptive placeholders
                    </p>
                    <ul className="text-xs space-y-1 ml-4 text-text-tertiary">
                      <li>• Use ## for H2 headings, ### for H3</li>
                      <li>• Add tables if needed</li>
                      <li>• Use [brackets] for placeholder guidance</li>
                      <li>• Be specific about what goes in each section</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-accent-primary pl-6 py-2">
                    <h3 className="font-semibold text-lg mb-2">Step 3: Write AI Instructions (Tab 2)</h3>
                    <p className="text-sm text-text-secondary mb-2">
                      Detailed instructions about content type, tone, audience, requirements, and guidelines
                    </p>
                    <ul className="text-xs space-y-1 ml-4 text-text-tertiary">
                      <li>• Describe the content type and purpose</li>
                      <li>• Specify tone and voice</li>
                      <li>• List required information</li>
                      <li>• Explain what to avoid</li>
                      <li>• Set length guidelines</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-accent-primary pl-6 py-2">
                    <h3 className="font-semibold text-lg mb-2">Step 4: Add Example URLs (Tab 2)</h3>
                    <p className="text-sm text-text-secondary mb-2">
                      Paste 1-3 URLs to published articles (one per line), then click "Analyze Example URLs"
                    </p>
                  </div>

                  <div className="border-l-4 border-accent-primary pl-6 py-2">
                    <h3 className="font-semibold text-lg mb-2">Step 5: Configure Settings</h3>
                    <p className="text-sm text-text-secondary">
                      Set share settings (Shared/Private), add categories, then click Save
                    </p>
                  </div>

                  <div className="border-l-4 border-accent-primary pl-6 py-2">
                    <h3 className="font-semibold text-lg mb-2">Step 6: Test It</h3>
                    <p className="text-sm text-text-secondary">
                      Create a project using your new SmartBrief and generate content to see how it performs
                    </p>
                  </div>
                </div>
              </section>

              {/* Section: AI Instructions */}
              <section id="guide-ai-instructions">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Writing Effective AI Instructions</h2>
                <div className="space-y-4">
                  <div className="bg-bg-elevated border border-border-default rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Complete Example:</h3>
                    <pre className="text-xs bg-bg-deep p-4 rounded overflow-x-auto whitespace-pre-wrap">
{`CONTENT TYPE: NBA Game Preview for betting analysis

TONE: Professional sports analysis with betting insights. 
Engaging, confident voice that balances entertainment with 
data-driven analysis.

TARGET AUDIENCE: Sports bettors - mix of hardcore NBA fans 
and casual bettors looking for an edge.

REQUIRED INFORMATION:
✓ Both teams' last 5-10 games form
✓ Key player stats and injury status
✓ Current betting lines (spread, total, moneyline)
✓ ATS records and trends
✓ Specific betting recommendations with reasoning

STRUCTURE REQUIREMENTS:
- Compelling intro establishing game stakes (150-200 words)
- Equal length team sections (300-400 words each)
- Betting analysis with table (400-500 words)
- Clear prediction with confidence level
- 2-3 "Best Bets" with specific reasoning

AVOID:
✗ Generic analysis
✗ Outdated statistics
✗ Predictions without data backing
✗ Filler content

LENGTH: 1200-1500 words total`}
                    </pre>
                  </div>
                </div>
              </section>

              {/* Section: Example URLs */}
              <section id="guide-example-urls">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Using Example URLs</h2>
                <div className="space-y-4 text-text-secondary">
                  <p className="leading-relaxed">
                    Example URLs are powerful because the AI learns from actual execution, not just instructions.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">What AI Learns</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-1">
                        <div>• Structure patterns</div>
                        <div>• Tone indicators</div>
                        <div>• Information density</div>
                        <div>• Heading hierarchy</div>
                        <div>• SEO patterns</div>
                        <div>• Typical length</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">How to Format</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-1">
                        <div>• One URL per line</div>
                        <div>• 1-3 URLs recommended</div>
                        <div>• Full URLs required</div>
                        <div>• Publicly accessible only</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">After Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-1">
                        <div>• Review analysis results</div>
                        <div>• Verify patterns match intent</div>
                        <div>• Replace URLs if needed</div>
                        <div>• Re-analyze after changes</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Section: Examples */}
              <section id="guide-examples">
                <h2 className="text-2xl font-bold text-text-primary mb-4">SmartBrief Templates</h2>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Game Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-text-secondary">
                      <strong>Structure:</strong> Introduction → Team Analysis → Matchups → Betting Insights → Prediction
                      <br /><strong>Tone:</strong> Professional analysis with betting focus
                      <br /><strong>Length:</strong> 1200-1500 words
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Player Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-text-secondary">
                      <strong>Structure:</strong> Stats → Career Highlights → Current Season → Fantasy Value
                      <br /><strong>Tone:</strong> Informative and engaging
                      <br /><strong>Length:</strong> 800-1000 words
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Injury Report Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-text-secondary">
                      <strong>Structure:</strong> Injury Details → Team Impact → Betting Implications
                      <br /><strong>Tone:</strong> Factual with strategic insights
                      <br /><strong>Length:</strong> 600-800 words
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Section: Best Practices */}
              <section id="guide-best-practices">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Best Practices</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">✅ DO:</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Be specific in instructions</li>
                      <li>• Use 2-3 example URLs</li>
                      <li>• Keep structure consistent</li>
                      <li>• Update regularly</li>
                      <li>• Test and refine</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-3">❌ DON'T:</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Make templates too rigid</li>
                      <li>• Use outdated examples</li>
                      <li>• Provide conflicting examples</li>
                      <li>• Forget AI Configuration tab</li>
                      <li>• Create one brief for everything</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section: Troubleshooting */}
              <section id="guide-troubleshooting">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Troubleshooting</h2>
                <div className="space-y-4">
                  <div className="border border-border-default rounded-lg p-4">
                    <h3 className="font-semibold text-text-primary mb-2">AI isn't following structure</h3>
                    <p className="text-sm text-text-secondary">
                      ✓ Check if headings are clear and hierarchical<br />
                      ✓ Make sure example URLs follow same structure<br />
                      ✓ Add more specific guidance in AI Instructions
                    </p>
                  </div>

                  <div className="border border-border-default rounded-lg p-4">
                    <h3 className="font-semibold text-text-primary mb-2">Content is too generic</h3>
                    <p className="text-sm text-text-secondary">
                      ✓ Add more detail to AI Instructions<br />
                      ✓ Provide more specific examples<br />
                      ✓ Use detailed placeholders with requirements
                    </p>
                  </div>

                  <div className="border border-border-default rounded-lg p-4">
                    <h3 className="font-semibold text-text-primary mb-2">Tone doesn't match</h3>
                    <p className="text-sm text-text-secondary">
                      ✓ Be more explicit in tone description<br />
                      ✓ Verify example URLs reflect desired tone<br />
                      ✓ Train Writer Model separately for voice control
                    </p>
                  </div>

                  <div className="border border-border-default rounded-lg p-4">
                    <h3 className="font-semibold text-text-primary mb-2">Example URL analysis failed</h3>
                    <p className="text-sm text-text-secondary">
                      ✓ Verify URL is publicly accessible<br />
                      ✓ Check if content is behind paywall<br />
                      ✓ Try different URLs<br />
                      ✓ Use manual instructions if URL analysis doesn't work
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-default bg-bg-surface py-8 mt-12">
        <div className="container mx-auto px-6 text-center text-text-secondary text-sm">
          <p>© 2026 Forge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

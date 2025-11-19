'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserGuideModal({ open, onOpenChange }: UserGuideModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('getting-started');

  const tableOfContents = [
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'creating-projects', title: 'Creating Projects' },
    { id: 'writer-models', title: 'Writer Models' },
    { id: 'brief-builder', title: 'Brief Builder' },
    { id: 'seo-optimization', title: 'SEO Optimization' },
    { id: 'content-generation', title: 'Content Generation' },
    { id: 'exporting', title: 'Exporting Content' },
  ];

  const guideContent: Record<string, { title: string; content: string }> = {
    'getting-started': {
      title: 'Getting Started with RotoWrite',
      content: `
        Welcome to RotoWrite! This guide will help you get started with creating AI-powered, SEO-optimized content.
        
        ## Overview
        RotoWrite combines AI writing capabilities with SEO optimization tools to help you create high-quality content efficiently.
        
        ## Key Features
        - **AI Writer Models**: Train custom AI models that emulate specific writing styles
        - **Brief Builder**: Create reusable content templates
        - **SEO Wizard**: Real-time SEO analysis and optimization
        - **Content Generation**: AI-powered content creation following your briefs
      `,
    },
    'creating-projects': {
      title: 'Creating Projects',
      content: `
        ## Creating a New Project
        1. Click "New Project" from the dashboard
        2. Enter your project details step by step:
           - Project name
           - Headline (H1)
           - Primary keyword
           - Secondary keywords
           - Additional details
           - Select a writer model
           - Choose a brief template
           - Set target word count
        3. Review and confirm your project settings
        4. Click "Start Project" to begin
        
        ## Opening Existing Projects
        - Click on any recent project from the dashboard
        - Or use "Open Project" to browse all your projects
      `,
    },
    'writer-models': {
      title: 'Working with Writer Models',
      content: `
        ## What are Writer Models?
        Writer models are AI models trained on specific writing styles, tones, and voices.
        
        ## Training a Model
        1. Open the Writer Factory
        2. Create a new model or select an existing one
        3. Add training content (articles, blog posts, etc.)
        4. The AI analyzes the style, tone, and voice
        5. Train the model with 25 pieces for 100% completion
        
        ## Using Writer Models
        When creating a project, select your trained model to generate content in that specific style.
      `,
    },
    'brief-builder': {
      title: 'Brief Builder',
      content: `
        ## What is a Brief?
        Briefs are content templates that define the structure and requirements for your content.
        
        ## Creating a Brief
        1. Open the Brief Builder
        2. Create a new brief
        3. Define your content structure using the editor
        4. Add headings, required sections, and formatting
        5. Save and share with your team if needed
        
        ## Using Briefs
        Briefs ensure your generated content follows a consistent structure and meets your requirements.
      `,
    },
    'seo-optimization': {
      title: 'SEO Optimization',
      content: `
        ## SEO Wizard
        The SEO Wizard provides real-time analysis and optimization suggestions.
        
        ## Features
        - **Content Score**: 0-100 score based on SEO best practices
        - **Content Structure**: Track words, headings, paragraphs, and images
        - **Terms Analysis**: Monitor keyword usage and density
        - **Auto-Optimize**: AI-powered optimization suggestions
        - **Internal Links**: Suggestions for relevant internal links
        
        ## Best Practices
        - Keep content score above 70 for optimal SEO
        - Use primary and secondary keywords naturally
        - Follow target ranges for content structure metrics
      `,
    },
    'content-generation': {
      title: 'Content Generation',
      content: `
        ## Generating Content
        1. Create or open a project
        2. Analyze your SEO package (first time only)
        3. Select keywords from suggestions
        4. Click "Create Content"
        5. AI generates content following your brief and writer model
        
        ## Editing Generated Content
        - Edit content directly in the editor
        - SEO score updates in real-time
        - Add or modify sections as needed
      `,
    },
    'exporting': {
      title: 'Exporting Content',
      content: `
        ## Export Options
        RotoWrite supports multiple export formats:
        - **Rich Text**: Formatted text with styling
        - **Microsoft Word**: .docx format
        - **Plain Text**: Unformatted text
        - **Markdown**: Markdown format
        
        ## How to Export
        1. Complete your content
        2. Click the export icon in the right sidebar
        3. Choose your desired format
        4. Download your content
      `,
    },
  };

  const filteredContent = tableOfContents.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <div className="flex h-[80vh]">
          {/* Left Sidebar - Table of Contents */}
          <div className="w-64 border-r p-4 space-y-3">
            <DialogHeader>
              <DialogTitle className="text-lg">User Guide</DialogTitle>
            </DialogHeader>
            
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>

            <div className="h-[calc(80vh-120px)] overflow-y-auto">
              <div className="space-y-1">
                {filteredContent.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedSection === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Guide Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <h2 className="text-2xl font-semibold mb-4">
                {guideContent[selectedSection]?.title}
              </h2>
              <div className="whitespace-pre-line text-foreground">
                {guideContent[selectedSection]?.content}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


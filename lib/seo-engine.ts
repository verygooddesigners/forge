/**
 * SEO Engine - Centralized SEO analysis and optimization
 * 
 * This module consolidates all SEO-related logic including:
 * - Content analysis (keyword density, structure, readability)
 * - Real-time keyword tracking
 * - SEO score calculation
 * - AI-powered optimization suggestions
 * - Auto-optimization
 * - Competitor analysis
 * - Internal linking suggestions
 */

import { generateContent } from './ai';
import { 
  buildSEOAnalysisPrompt, 
  buildAutoOptimizePrompt,
  buildInternalLinkingPrompt,
  buildCompetitorAnalysisPrompt 
} from './prompts';

// ==================== TYPES ====================

export interface SEOAnalysis {
  score: number;
  keyword_density: number;
  heading_structure: {
    h1_count: number;
    h2_count: number;
    h3_count: number;
  };
  suggestions: string[];
  metrics?: ContentMetrics;
}

export interface ContentMetrics {
  words: number;
  headings: number;
  paragraphs: number;
  images: number;
  readability_score?: number;
}

export interface TermData {
  term: string;
  count: number;
  status: 'optimal' | 'under' | 'over';
  category: string;
  targetMin?: number;
  targetMax?: number;
}

export interface KeywordTracking {
  primary: TermData;
  secondary: TermData[];
  suggested: TermData[];
}

export interface SEOPackage {
  headline: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  topic?: string;
  wordCount?: number;
}

// ==================== SEO ENGINE CLASS ====================

export class SEOEngine {
  private content: string;
  private htmlContent: string;
  private seoPackage: SEOPackage;

  constructor(content: string, seoPackage: SEOPackage) {
    this.content = content;
    this.htmlContent = this.tipTapToHtml(content);
    this.seoPackage = seoPackage;
  }

  // ==================== CONTENT CONVERSION ====================

  /**
   * Convert TipTap JSON to HTML for analysis
   */
  private tipTapToHtml(tipTapContent: any): string {
    if (typeof tipTapContent === 'string') {
      try {
        tipTapContent = JSON.parse(tipTapContent);
      } catch {
        return tipTapContent;
      }
    }

    if (!tipTapContent?.content) return '';

    const processNode = (node: any): string => {
      if (node.type === 'text') {
        let text = node.text || '';
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            if (mark.type === 'bold') text = `<strong>${text}</strong>`;
            if (mark.type === 'italic') text = `<em>${text}</em>`;
            if (mark.type === 'link') text = `<a href="${mark.attrs?.href}">${text}</a>`;
          });
        }
        return text;
      }

      const content = node.content?.map(processNode).join('') || '';

      switch (node.type) {
        case 'heading':
          const level = node.attrs?.level || 1;
          return `<h${level}>${content}</h${level}>`;
        case 'paragraph':
          return `<p>${content}</p>`;
        case 'bulletList':
          return `<ul>${content}</ul>`;
        case 'orderedList':
          return `<ol>${content}</ol>`;
        case 'listItem':
          return `<li>${content}</li>`;
        case 'image':
          return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ''}" />`;
        case 'blockquote':
          return `<blockquote>${content}</blockquote>`;
        case 'codeBlock':
          return `<pre><code>${content}</code></pre>`;
        case 'hardBreak':
          return '<br>';
        default:
          return content;
      }
    };

    return tipTapContent.content.map(processNode).join('');
  }

  /**
   * Extract plain text from HTML
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // ==================== METRICS EXTRACTION ====================

  /**
   * Extract content metrics
   */
  public extractMetrics(): ContentMetrics {
    const plainText = this.stripHtml(this.htmlContent);
    const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
    
    const h1Count = (this.htmlContent.match(/<h1/gi) || []).length;
    const h2Count = (this.htmlContent.match(/<h2/gi) || []).length;
    const h3Count = (this.htmlContent.match(/<h3/gi) || []).length;
    const headings = h1Count + h2Count + h3Count;
    
    const paragraphs = (this.htmlContent.match(/<p/gi) || []).length;
    const images = (this.htmlContent.match(/<img/gi) || []).length;

    return {
      words,
      headings,
      paragraphs,
      images,
    };
  }

  // ==================== KEYWORD ANALYSIS ====================

  /**
   * Calculate keyword density
   */
  private calculateKeywordDensity(keyword: string): number {
    const plainText = this.stripHtml(this.htmlContent);
    const lowerText = plainText.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const words = lowerText.split(/\s+/);
    const keywordWords = lowerKeyword.split(/\s+/);
    
    let count = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const phrase = words.slice(i, i + keywordWords.length).join(' ');
      if (phrase === lowerKeyword) {
        count++;
      }
    }
    
    return words.length > 0 ? (count / words.length) * 100 : 0;
  }

  /**
   * Count keyword occurrences
   */
  private countKeywordOccurrences(keyword: string): number {
    const plainText = this.stripHtml(this.htmlContent);
    const lowerText = plainText.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const words = lowerText.split(/\s+/);
    const keywordWords = lowerKeyword.split(/\s+/);
    
    let count = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const phrase = words.slice(i, i + keywordWords.length).join(' ');
      if (phrase === lowerKeyword) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Track all keywords (primary, secondary, suggested)
   */
  public trackKeywords(suggestedKeywords: string[] = []): KeywordTracking {
    const metrics = this.extractMetrics();
    const wordCount = metrics.words;

    // Calculate ideal densities (0.5% - 2.5%)
    const calculateIdealRange = (totalWords: number) => ({
      min: Math.max(1, Math.floor((totalWords * 0.005))),
      max: Math.ceil((totalWords * 0.025))
    });

    const idealRange = calculateIdealRange(wordCount);

    // Track primary keyword
    const primaryCount = this.countKeywordOccurrences(this.seoPackage.primaryKeyword);
    const primaryStatus = 
      primaryCount < idealRange.min ? 'under' : 
      primaryCount > idealRange.max ? 'over' : 
      'optimal';

    const primary: TermData = {
      term: this.seoPackage.primaryKeyword,
      count: primaryCount,
      status: primaryStatus,
      category: 'primary',
      targetMin: idealRange.min,
      targetMax: idealRange.max,
    };

    // Track secondary keywords (slightly lower targets)
    const secondaryRange = {
      min: Math.max(1, Math.floor(idealRange.min * 0.6)),
      max: Math.ceil(idealRange.max * 0.8)
    };

    const secondary: TermData[] = this.seoPackage.secondaryKeywords.map(keyword => {
      const count = this.countKeywordOccurrences(keyword);
      const status = 
        count < secondaryRange.min ? 'under' : 
        count > secondaryRange.max ? 'over' : 
        'optimal';

      return {
        term: keyword,
        count,
        status,
        category: 'secondary',
        targetMin: secondaryRange.min,
        targetMax: secondaryRange.max,
      };
    });

    // Track suggested keywords
    const suggested: TermData[] = suggestedKeywords.map(keyword => {
      const count = this.countKeywordOccurrences(keyword);
      const status = count > 0 ? 'optimal' : 'under';

      return {
        term: keyword,
        count,
        status,
        category: 'suggested',
        targetMin: 1,
        targetMax: secondaryRange.max,
      };
    });

    return { primary, secondary, suggested };
  }

  // ==================== SEO SCORE CALCULATION ====================

  /**
   * Calculate comprehensive SEO score
   */
  public calculateSEOScore(): SEOAnalysis {
    const plainText = this.stripHtml(this.htmlContent);
    const metrics = this.extractMetrics();
    const h1Count = (this.htmlContent.match(/<h1/gi) || []).length;
    const h2Count = (this.htmlContent.match(/<h2/gi) || []).length;
    const h3Count = (this.htmlContent.match(/<h3/gi) || []).length;
    
    const suggestions: string[] = [];
    let score = 50; // Base score

    // Check H1 count
    if (h1Count === 0) {
      suggestions.push('Add an H1 heading with your primary keyword');
      score -= 10;
    } else if (h1Count > 1) {
      suggestions.push('Use only one H1 heading per page');
      score -= 5;
    } else {
      score += 10;
    }

    // Check H2 count
    if (h2Count < 2) {
      suggestions.push('Add more H2 subheadings to structure your content');
      score -= 5;
    } else {
      score += 10;
    }

    // Check keyword density
    const keywordDensity = this.calculateKeywordDensity(this.seoPackage.primaryKeyword);
    if (keywordDensity < 0.5) {
      suggestions.push(`Increase usage of primary keyword "${this.seoPackage.primaryKeyword}" (current density: ${keywordDensity.toFixed(2)}%)`);
      score -= 10;
    } else if (keywordDensity > 3) {
      suggestions.push(`Reduce keyword stuffing of "${this.seoPackage.primaryKeyword}" (current density: ${keywordDensity.toFixed(2)}%)`);
      score -= 15;
    } else {
      score += 15;
    }

    // Check secondary keywords
    const secondaryKeywordsUsed = this.seoPackage.secondaryKeywords.filter(kw =>
      plainText.toLowerCase().includes(kw.toLowerCase())
    );
    if (secondaryKeywordsUsed.length < this.seoPackage.secondaryKeywords.length) {
      suggestions.push('Include all secondary keywords naturally in your content');
      score -= 5;
    } else {
      score += 10;
    }

    // Check content length
    const wordCount = metrics.words;
    const targetWordCount = this.seoPackage.wordCount || 800;
    
    if (wordCount < 300) {
      suggestions.push('Content is too short. Aim for at least 300 words for better SEO');
      score -= 15;
    } else if (wordCount < targetWordCount * 0.8) {
      suggestions.push(`Content is below target word count (${wordCount}/${targetWordCount} words)`);
      score -= 5;
    } else if (wordCount >= targetWordCount * 0.9 && wordCount <= targetWordCount * 1.2) {
      score += 10;
    } else if (wordCount >= targetWordCount * 0.8) {
      score += 5;
    }

    // Check for images
    if (metrics.images === 0 && wordCount > 500) {
      suggestions.push('Consider adding images to improve engagement');
      score -= 3;
    }

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      keyword_density: keywordDensity,
      heading_structure: {
        h1_count: h1Count,
        h2_count: h2Count,
        h3_count: h3Count,
      },
      suggestions,
      metrics,
    };
  }

  // ==================== AI-POWERED FEATURES ====================

  /**
   * Generate AI-powered SEO suggestions
   */
  public async generateAISuggestions(): Promise<string[]> {
    const analysis = this.calculateSEOScore();
    
    const prompt = buildSEOAnalysisPrompt(
      this.stripHtml(this.htmlContent),
      this.seoPackage.primaryKeyword,
      this.seoPackage.secondaryKeywords,
      analysis.score,
      analysis.suggestions
    );

    try {
      const response = await generateContent([
        { role: 'system', content: 'You are an SEO expert providing actionable optimization suggestions.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.7 });

      // Parse JSON response
      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions : analysis.suggestions;
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return analysis.suggestions;
    }
  }

  /**
   * Auto-optimize content with AI
   */
  public async autoOptimize(suggestions: string[]): Promise<string> {
    const prompt = buildAutoOptimizePrompt(
      this.stripHtml(this.htmlContent),
      this.seoPackage.primaryKeyword,
      this.seoPackage.secondaryKeywords,
      suggestions
    );

    try {
      const optimizedContent = await generateContent([
        { role: 'system', content: 'You are an SEO content optimizer.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.5, maxTokens: 8000 });

      return optimizedContent;
    } catch (error) {
      console.error('Error auto-optimizing content:', error);
      throw new Error('Failed to optimize content');
    }
  }

  /**
   * Suggest internal links
   */
  public async suggestInternalLinks(
    availableArticles: Array<{ title: string; url: string; topic: string }>
  ): Promise<Array<{ anchor_text: string; target_article: string; reason: string }>> {
    const prompt = buildInternalLinkingPrompt(
      this.stripHtml(this.htmlContent),
      this.seoPackage.primaryKeyword,
      availableArticles
    );

    try {
      const response = await generateContent([
        { role: 'system', content: 'You are an SEO specialist focused on internal linking.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.6 });

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating internal link suggestions:', error);
      return [];
    }
  }

  /**
   * Analyze against competitors
   */
  public async analyzeCompetitors(
    competitorContents: Array<{ url: string; title: string; content: string }>
  ): Promise<any> {
    const prompt = buildCompetitorAnalysisPrompt(
      this.seoPackage.primaryKeyword,
      this.stripHtml(this.htmlContent),
      competitorContents
    );

    try {
      const response = await generateContent([
        { role: 'system', content: 'You are an SEO analyst specializing in competitor analysis.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.5 });

      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing competitors:', error);
      return {
        gaps: [],
        opportunities: [],
        keyword_insights: {},
        structure_notes: '',
        recommendations: []
      };
    }
  }
}

// ==================== CONVENIENCE FUNCTIONS ====================

/**
 * Quick SEO analysis (backward compatible with existing code)
 */
export function analyzeSEO(
  content: string,
  primaryKeyword: string,
  secondaryKeywords: string[] = [],
  wordCount?: number
): SEOAnalysis {
  const engine = new SEOEngine(content, {
    headline: '',
    primaryKeyword,
    secondaryKeywords,
    wordCount,
  });
  
  return engine.calculateSEOScore();
}

/**
 * Generate SEO suggestions (backward compatible)
 */
export async function generateSEOSuggestions(
  content: string,
  primaryKeyword: string,
  secondaryKeywords: string[]
): Promise<string[]> {
  const engine = new SEOEngine(content, {
    headline: '',
    primaryKeyword,
    secondaryKeywords,
  });
  
  return engine.generateAISuggestions();
}

export default SEOEngine;


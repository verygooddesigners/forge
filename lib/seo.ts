import { SEOAnalysis } from '@/types';

/**
 * Calculate keyword density in text
 */
function calculateKeywordDensity(text: string, keyword: string): number {
  const lowerText = text.toLowerCase();
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
  
  return (count / words.length) * 100;
}

/**
 * Analyze heading structure in HTML content
 */
function analyzeHeadingStructure(html: string) {
  const h1Count = (html.match(/<h1/gi) || []).length;
  const h2Count = (html.match(/<h2/gi) || []).length;
  const h3Count = (html.match(/<h3/gi) || []).length;

  return {
    h1_count: h1Count,
    h2_count: h2Count,
    h3_count: h3Count,
  };
}

/**
 * Extract plain text from HTML
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Analyze content for SEO score
 */
export function analyzeSEO(
  html: string,
  primaryKeyword: string,
  secondaryKeywords: string[] = [],
  briefRequirements?: any
): SEOAnalysis {
  const plainText = stripHtml(html);
  const headingStructure = analyzeHeadingStructure(html);
  const keywordDensity = calculateKeywordDensity(plainText, primaryKeyword);
  
  const suggestions: string[] = [];
  let score = 50; // Base score

  // Check H1 count
  if (headingStructure.h1_count === 0) {
    suggestions.push('Add an H1 heading with your primary keyword');
    score -= 10;
  } else if (headingStructure.h1_count > 1) {
    suggestions.push('Use only one H1 heading per page');
    score -= 5;
  } else {
    score += 10;
  }

  // Check H2 count
  if (headingStructure.h2_count < 2) {
    suggestions.push('Add more H2 subheadings to structure your content');
    score -= 5;
  } else {
    score += 10;
  }

  // Check keyword density
  if (keywordDensity < 0.5) {
    suggestions.push(`Increase usage of primary keyword "${primaryKeyword}" (current density: ${keywordDensity.toFixed(2)}%)`);
    score -= 10;
  } else if (keywordDensity > 3) {
    suggestions.push(`Reduce keyword stuffing of "${primaryKeyword}" (current density: ${keywordDensity.toFixed(2)}%)`);
    score -= 15;
  } else {
    score += 15;
  }

  // Check secondary keywords
  const secondaryKeywordsUsed = secondaryKeywords.filter(kw =>
    plainText.toLowerCase().includes(kw.toLowerCase())
  );
  if (secondaryKeywordsUsed.length < secondaryKeywords.length) {
    suggestions.push('Include all secondary keywords naturally in your content');
    score -= 5;
  } else {
    score += 10;
  }

  // Check content length
  const wordCount = plainText.split(/\s+/).length;
  if (wordCount < 300) {
    suggestions.push('Content is too short. Aim for at least 300 words for better SEO');
    score -= 15;
  } else if (wordCount >= 800) {
    score += 10;
  } else if (wordCount >= 500) {
    score += 5;
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    keyword_density: keywordDensity,
    heading_structure: headingStructure,
    suggestions,
  };
}

/**
 * Generate AI-powered SEO suggestions
 */
export async function generateSEOSuggestions(
  content: string,
  primaryKeyword: string,
  secondaryKeywords: string[]
): Promise<string[]> {
  // This will be implemented with AI in the API route
  // For now, return the basic analysis suggestions
  const analysis = analyzeSEO(content, primaryKeyword, secondaryKeywords);
  return analysis.suggestions;
}



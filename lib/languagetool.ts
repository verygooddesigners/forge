/**
 * LanguageTool API integration for grammar and spell checking
 * Used by Quality Assurance Agent
 */

export interface LanguageToolMatch {
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  replacements: string[];
  rule: {
    id: string;
    description: string;
    category: {
      id: string;
      name: string;
    };
  };
  type: {
    typeName: string;
  };
  context: {
    text: string;
    offset: number;
    length: number;
  };
}

export interface LanguageToolResult {
  matches: LanguageToolMatch[];
  language: {
    name: string;
    code: string;
  };
}

export type LanguageToolStrictness = 'casual' | 'standard' | 'formal';

/**
 * Check grammar using LanguageTool API
 * Free tier: 20 requests/minute, can use without API key
 * Premium: Get API key from https://languagetool.org/
 */
export async function checkGrammar(
  text: string,
  strictness: LanguageToolStrictness = 'standard'
): Promise<LanguageToolResult> {
  const apiKey = process.env.LANGUAGETOOL_API_KEY;
  
  // Use premium endpoint if API key available, otherwise free
  const endpoint = apiKey
    ? 'https://api.languagetoolplus.com/v2/check'
    : 'https://api.languagetool.org/v2/check';
  
  // Map strictness to LanguageTool level
  const levelMap: Record<LanguageToolStrictness, string> = {
    casual: 'picky',
    standard: 'default',
    formal: 'picky',
  };
  
  const formData = new URLSearchParams();
  formData.append('text', text);
  formData.append('language', 'en-US');
  formData.append('level', levelMap[strictness]);
  
  // Add premium-specific options if available
  if (apiKey) {
    formData.append('enabledOnly', 'false');
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`LanguageTool API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      matches: data.matches || [],
      language: data.language || { name: 'English (US)', code: 'en-US' },
    };
  } catch (error) {
    console.error('LanguageTool API error:', error);
    // Return empty result on error
    return {
      matches: [],
      language: { name: 'English (US)', code: 'en-US' },
    };
  }
}

/**
 * Filter matches by category
 */
export function filterByCategory(
  result: LanguageToolResult,
  categories: string[]
): LanguageToolMatch[] {
  return result.matches.filter(match =>
    categories.includes(match.rule.category.id)
  );
}

/**
 * Get only critical errors (typos, grammar)
 */
export function getCriticalErrors(result: LanguageToolResult): LanguageToolMatch[] {
  const criticalCategories = [
    'TYPOS',
    'GRAMMAR',
    'CONFUSED_WORDS',
    'PUNCTUATION',
  ];
  
  return result.matches.filter(match =>
    criticalCategories.some(cat => match.rule.category.id.includes(cat))
  );
}

/**
 * Get style suggestions (not errors)
 */
export function getStyleSuggestions(result: LanguageToolResult): LanguageToolMatch[] {
  const styleCategories = [
    'STYLE',
    'REDUNDANCY',
    'WORDINESS',
  ];
  
  return result.matches.filter(match =>
    styleCategories.some(cat => match.rule.category.id.includes(cat))
  );
}

/**
 * Format matches for display
 */
export function formatMatches(matches: LanguageToolMatch[]): string {
  if (matches.length === 0) {
    return 'No issues found.';
  }
  
  return matches
    .map((match, index) => {
      const replacement = match.replacements.length > 0
        ? ` → Suggestion: "${match.replacements[0]}"`
        : '';
      
      return `${index + 1}. ${match.message}${replacement}\n   Context: "${match.context.text}"`;
    })
    .join('\n\n');
}


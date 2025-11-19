/**
 * Legacy SEO module - Re-exports from SEO Engine
 * 
 * This file maintains backward compatibility with existing code
 * while delegating to the new centralized SEO Engine.
 */

import { 
  analyzeSEO as analyze,
  generateSEOSuggestions as generateSuggestions,
  SEOEngine,
  type SEOAnalysis,
  type ContentMetrics,
  type TermData,
  type KeywordTracking,
  type SEOPackage,
} from './seo-engine';

// Re-export for backward compatibility
export { 
  analyze as analyzeSEO,
  generateSuggestions as generateSEOSuggestions,
  SEOEngine,
  SEOAnalysis,
  ContentMetrics,
  TermData,
  KeywordTracking,
  SEOPackage,
};



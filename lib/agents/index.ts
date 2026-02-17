/**
 * Forge Multi-Agent System
 * Central exports for all agents and utilities
 */

// Types
export * from './types';
export * from './config';

// Base utilities
export { loadAgentConfig, callClaude, streamClaude } from './base';

// Agent #1: Content Generation
export {
  generateContent,
  generateContentStream,
  type ContentGenerationRequest,
} from './content-generation';

// Agent #2: Writer Training
export {
  analyzeWritingStyle,
  generateWriterEmbeddings,
  type WriterTrainingRequest,
  type WriterStyleAnalysis,
} from './writer-training';

// Agent #3: SEO Optimization
export {
  analyzeSEO,
  generateKeywordSuggestions,
  type SEOAnalysisRequest,
  type SEOScore,
  type SEOAnalysisResult,
} from './seo-optimization';

// Agent #4: Quality Assurance
export {
  checkQuality,
  type QualityCheckRequest,
  type QualityCheckResult,
} from './quality-assurance';

// Agent #5: Persona & Tone
export {
  adaptTone,
  analyzeToneMismatch,
  type ToneAdaptationRequest,
} from './persona-tone';

// Agent #6: Creative Features
export {
  orchestrateWorkflow,
  transformData,
  type WorkflowRequest,
  type WorkflowStep,
} from './creative-features';

// Agent #7: Visual Extraction
export {
  extractFromImage,
  type VisualExtractionRequest,
  type VisualExtractionResult,
} from './visual-extraction';

// LanguageTool integration
export {
  checkGrammar,
  filterByCategory,
  getCriticalErrors,
  getStyleSuggestions,
  formatMatches,
  type LanguageToolMatch,
  type LanguageToolResult,
  type LanguageToolStrictness,
} from '../languagetool';


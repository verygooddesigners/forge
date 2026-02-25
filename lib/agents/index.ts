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
  evaluateResearchRelevance,
  type QualityCheckRequest,
  type QualityCheckResult,
  type EvaluateResearchRelevanceInput,
} from './quality-assurance';

// Agent #5: Persona & Tone
export {
  adaptTone,
  analyzeToneMismatch,
  type ToneAdaptationRequest,
} from './persona-tone';

// Agent #6: Research Orchestrator
export {
  runResearchPipeline,
  type ResearchPipelineInput,
  type ResearchPipelineProgressEvent,
} from './research-orchestrator';

// Agent #7: Visual Extraction
export {
  extractFromImage,
  type VisualExtractionRequest,
  type VisualExtractionResult,
} from './visual-extraction';

// Agent #8: Fact Verification
export { verifyFacts } from './fact-verification';

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


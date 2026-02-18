export type AgentKey = 
  | 'content_generation'
  | 'writer_training'
  | 'seo_optimization'
  | 'quality_assurance'
  | 'persona_tone'
  | 'creative_features'
  | 'visual_extraction'
  | 'fact_verification';

export interface AgentConfig {
  id: string;
  agentKey: AgentKey;
  displayName: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
  enabled: boolean;
  guardrails: string[];
  specialConfig: Record<string, any>;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | AgentMessageContent[];
}

export interface AgentMessageContent {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

export interface AgentResponse {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    agentKey?: AgentKey;
  };
}

export interface QualityAssuranceSpecialConfig {
  useLanguageTool: boolean;
  languageToolStrictness: 'casual' | 'standard' | 'formal';
  minReadabilityScore?: number;
}

export interface VisualExtractionSpecialConfig {
  enableFallback: boolean;
  confidenceThreshold: number;
  fallbackTrigger: 'lowConfidence' | 'denseText' | 'both';
}

export interface WriterTrainingSpecialConfig {
  useEmbeddings: boolean;
  embeddingModel: string;
}

export interface SEOOptimizationSpecialConfig {
  optimalKeywordDensity: number;
  minContentLength: number;
}

export interface FactVerificationSpecialConfig {
  minSourcesForHighConfidence: number;
  minSourcesForMediumConfidence: number;
  requireMultipleSourcesForVerification: boolean;
}


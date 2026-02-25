import { AgentConfig, AgentKey } from './types';

/**
 * Default agent configurations
 * These are used as fallbacks if database config is not available
 */
export const DEFAULT_AGENT_CONFIGS: Record<AgentKey, Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'>> = {
  content_generation: {
    agentKey: 'content_generation',
    displayName: 'Content Generation',
    description: 'Generates articles based on briefs and keywords',
    systemPrompt: '', // Will be loaded from prompts file
    temperature: 0.7,
    maxTokens: 4000,
    model: 'claude-sonnet-4-20250514',
    enabled: true,
    guardrails: [
      'cannot_modify_seo',
      'cannot_train_models',
      'cannot_process_images',
      'cannot_edit_existing',
      'cannot_access_user_management'
    ],
    specialConfig: {}
  },
  writer_training: {
    agentKey: 'writer_training',
    displayName: 'Writer Training',
    description: 'Analyzes writing samples and trains writer models',
    systemPrompt: '',
    temperature: 0.3,
    maxTokens: 2000,
    model: 'claude-sonnet-4-20250514',
    enabled: true,
    guardrails: [
      'cannot_generate_articles',
      'cannot_modify_seo',
      'cannot_process_images',
      'cannot_access_other_users_models'
    ],
    specialConfig: {
      useEmbeddings: true,
      embeddingModel: 'text-embedding-3-small'
    }
  },
  seo_optimization: {
    agentKey: 'seo_optimization',
    displayName: 'SEO Optimization',
    description: 'Analyzes and optimizes content for search engines',
    systemPrompt: '',
    temperature: 0.4,
    maxTokens: 2000,
    model: 'claude-sonnet-4-20250514',
    enabled: true,
    guardrails: [
      'cannot_generate_content',
      'cannot_train_models',
      'cannot_process_images',
      'cannot_modify_structure'
    ],
    specialConfig: {
      optimalKeywordDensity: 0.03,
      minContentLength: 500
    }
  },
  quality_assurance: {
    agentKey: 'quality_assurance',
    displayName: 'Quality Assurance',
    description: 'Reviews content for grammar and readability',
    systemPrompt: '',
    temperature: 0.3,
    maxTokens: 2000,
    model: 'claude-sonnet-4-20250514',
    enabled: true,
    guardrails: [
      'cannot_generate_content',
      'cannot_modify_seo',
      'cannot_train_models',
      'cannot_auto_modify'
    ],
    specialConfig: {
      useLanguageTool: true,
      languageToolStrictness: 'standard',
      minReadabilityScore: 60
    }
  },
  persona_tone: {
    agentKey: 'persona_tone',
    displayName: 'Persona & Tone',
    description: 'Adapts content to specific voices and tones',
    systemPrompt: '',
    temperature: 0.5,
    maxTokens: 2000,
    model: 'claude-sonnet-4-20250514',
    enabled: true,
    guardrails: [
      'cannot_generate_from_scratch',
      'cannot_modify_seo',
      'cannot_train_models',
      'cannot_change_structure'
    ],
    specialConfig: {}
  },
  research_orchestrator: {
    agentKey: 'research_orchestrator',
    displayName: 'Research Orchestrator',
    description: 'Orchestrates research pipeline with adaptive follow-up',
    systemPrompt: '',
    temperature: 0.3,
    maxTokens: 4000,
    model: 'claude-sonnet-4-20250514',
    enabled: true,
    guardrails: [
      'cannot_generate_articles',
      'cannot_modify_user_data',
      'cannot_skip_verification'
    ],
    specialConfig: { maxLoops: 4 }
  },
  visual_extraction: {
    agentKey: 'visual_extraction',
    displayName: 'Visual Extraction',
    description: 'Extracts structured data from images',
    systemPrompt: '',
    temperature: 0.2,
    maxTokens: 4000,
    model: 'claude-sonnet-4-20250514',
    enabled: true,
    guardrails: [
      'cannot_generate_content',
      'cannot_modify_database',
      'cannot_access_non_image_data',
      'cannot_make_editorial_decisions'
    ],
    specialConfig: {
      enableFallback: true,
      confidenceThreshold: 0.85,
      fallbackTrigger: 'both'
    }
  },
  fact_verification: {
    agentKey: 'fact_verification',
    displayName: 'Fact Verification',
    description: 'Verifies facts across multiple sources',
    systemPrompt: '',
    temperature: 0.2,
    maxTokens: 3000,
    model: 'claude-sonnet-4-20250514',
    enabled: true,
    guardrails: [
      'cannot_generate_content',
      'cannot_modify_database',
      'cannot_train_models',
      'cannot_make_editorial_decisions',
      'cannot_access_user_management'
    ],
    specialConfig: {
      minSourcesForHighConfidence: 3,
      minSourcesForMediumConfidence: 2,
      requireMultipleSourcesForVerification: true
    }
  }
};

/**
 * Get default configuration for a specific agent
 */
export function getDefaultAgentConfig(agentKey: AgentKey): Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'> {
  return DEFAULT_AGENT_CONFIGS[agentKey];
}

/**
 * Get all agent keys
 */
export function getAllAgentKeys(): AgentKey[] {
  return Object.keys(DEFAULT_AGENT_CONFIGS) as AgentKey[];
}

/**
 * Validate agent key
 */
export function isValidAgentKey(key: string): key is AgentKey {
  return key in DEFAULT_AGENT_CONFIGS;
}


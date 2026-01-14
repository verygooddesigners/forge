import { loadAgentConfig, callClaude } from './base';
import { AgentMessage, AgentResponse } from './types';

export interface WorkflowRequest {
  workflowType: string;
  input: any;
  context?: Record<string, any>;
}

export interface WorkflowStep {
  agent: string;
  action: string;
  input: any;
}

/**
 * Creative Features Agent
 * Orchestrates specialized workflows combining multiple agents
 */
export async function orchestrateWorkflow(
  request: WorkflowRequest
): Promise<AgentResponse> {
  const config = await loadAgentConfig('creative_features');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'Creative Features Agent is currently disabled',
    };
  }
  
  let userMessage = `Please orchestrate the following workflow:\n\n`;
  userMessage += `WORKFLOW TYPE: ${request.workflowType}\n`;
  userMessage += `INPUT DATA:\n${JSON.stringify(request.input, null, 2)}\n`;
  
  if (request.context) {
    userMessage += `\nCONTEXT:\n${JSON.stringify(request.context, null, 2)}\n`;
  }
  
  userMessage += `\nPlease provide a structured workflow plan in JSON format:
{
  "steps": [
    {
      "agent": "agent_name",
      "action": "action_to_perform",
      "input": "required_input"
    }
  ],
  "expectedOutput": "description of final output"
}`;
  
  const messages: AgentMessage[] = [
    {
      role: 'system',
      content: config.systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];
  
  return callClaude(messages, config);
}

/**
 * Transform structured data into content
 */
export async function transformData(
  data: any,
  targetFormat: string,
  instructions?: string
): Promise<AgentResponse> {
  const config = await loadAgentConfig('creative_features');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'Creative Features Agent is currently disabled',
    };
  }
  
  let userMessage = `Please transform the following structured data:\n\n`;
  userMessage += `DATA:\n${JSON.stringify(data, null, 2)}\n\n`;
  userMessage += `TARGET FORMAT: ${targetFormat}\n`;
  
  if (instructions) {
    userMessage += `\nADDITIONAL INSTRUCTIONS:\n${instructions}\n`;
  }
  
  const messages: AgentMessage[] = [
    {
      role: 'system',
      content: config.systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];
  
  return callClaude(messages, config);
}


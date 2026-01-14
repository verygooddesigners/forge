import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { AgentConfig } from '@/lib/agents/types';

/**
 * GET /api/admin/agents
 * List all agent configurations
 * Access: Super admin only (jeremy.botter@gmail.com)
 */
export async function GET(request: NextRequest) {
  try {
    // Check super admin access
    const user = await getCurrentUser();
    const isSuperAdmin = user?.email === 'jeremy.botter@gmail.com' || user?.email === 'jeremy.botter@gdcgroup.com';
    if (!user || !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Super admin access required.' },
        { status: 403 }
      );
    }
    
    const supabase = await createClient();
    
    const { data: configs, error } = await supabase
      .from('agent_configs')
      .select('*')
      .order('agent_key');
    
    if (error) {
      throw error;
    }
    
    // Transform database format to AgentConfig
    const agentConfigs: AgentConfig[] = configs.map(config => ({
      id: config.id,
      agentKey: config.agent_key,
      displayName: config.display_name,
      description: config.description || '',
      systemPrompt: config.system_prompt,
      temperature: Number(config.temperature),
      maxTokens: config.max_tokens,
      model: config.model,
      enabled: config.enabled,
      guardrails: Array.isArray(config.guardrails) ? config.guardrails : [],
      specialConfig: config.special_config || {},
      updatedBy: config.updated_by,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    }));
    
    return NextResponse.json({ agents: agentConfigs });
  } catch (error) {
    console.error('Error fetching agent configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent configurations' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/agents
 * Bulk update multiple agent configurations
 * Access: Super admin only
 */
export async function PUT(request: NextRequest) {
  try {
    // Check super admin access
    const user = await getCurrentUser();
    const isSuperAdmin = user?.email === 'jeremy.botter@gmail.com' || user?.email === 'jeremy.botter@gdcgroup.com';
    if (!user || !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Super admin access required.' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { agents } = body;
    
    if (!Array.isArray(agents)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected agents array.' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    const results = [];
    
    for (const agent of agents) {
      const { data, error } = await supabase
        .from('agent_configs')
        .update({
          display_name: agent.displayName,
          description: agent.description,
          system_prompt: agent.systemPrompt,
          temperature: agent.temperature,
          max_tokens: agent.maxTokens,
          model: agent.model,
          enabled: agent.enabled,
          guardrails: agent.guardrails,
          special_config: agent.specialConfig,
          updated_by: user.id,
        })
        .eq('agent_key', agent.agentKey)
        .select()
        .single();
      
      if (error) {
        results.push({ agentKey: agent.agentKey, success: false, error: error.message });
      } else {
        results.push({ agentKey: agent.agentKey, success: true, data });
      }
    }
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error updating agent configs:', error);
    return NextResponse.json(
      { error: 'Failed to update agent configurations' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { AgentConfig, AgentKey } from '@/lib/agents/types';
import { isValidAgentKey } from '@/lib/agents/config';

interface RouteParams {
  params: Promise<{
    agentKey: string;
  }>;
}

/**
 * GET /api/admin/agents/[agentKey]
 * Get specific agent configuration
 * Access: Super admin only
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { agentKey } = await params;
    
    // Check super admin access (only jeremy.botter@gdcgroup.com)
    const user = await getCurrentUser();
    const isSuperAdmin = user?.email === 'jeremy.botter@gdcgroup.com';
    
    if (!user || !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Super admin access required.' },
        { status: 403 }
      );
    }
    
    if (!isValidAgentKey(agentKey)) {
      return NextResponse.json(
        { error: 'Invalid agent key' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    const { data: config, error } = await supabase
      .from('agent_configs')
      .select('*')
      .eq('agent_key', agentKey)
      .single();
    
    if (error || !config) {
      return NextResponse.json(
        { error: 'Agent configuration not found' },
        { status: 404 }
      );
    }
    
    // Transform to AgentConfig
    const agentConfig: AgentConfig = {
      id: config.id,
      agentKey: config.agent_key as AgentKey,
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
    };
    
    return NextResponse.json({ agent: agentConfig });
  } catch (error) {
    console.error('Error fetching agent config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/agents/[agentKey]
 * Update specific agent configuration
 * Access: Super admin only
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { agentKey } = await params;
    
    console.log('[AGENT_UPDATE] Request received for agent:', agentKey);
    
    // Check super admin access (only jeremy.botter@gdcgroup.com)
    const user = await getCurrentUser();
    console.log('[AGENT_UPDATE] User:', user?.email, 'Role:', user?.role);
    
    const isSuperAdmin = user?.email === 'jeremy.botter@gdcgroup.com';
    
    if (!user || !isSuperAdmin) {
      console.error('[AGENT_UPDATE] Unauthorized access attempt by:', user?.email);
      return NextResponse.json(
        { error: 'Unauthorized. Super admin access required.' },
        { status: 403 }
      );
    }
    
    if (!isValidAgentKey(agentKey)) {
      return NextResponse.json(
        { error: 'Invalid agent key' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const supabase = await createClient();
    
    console.log('[AGENT_UPDATE] Updating agent config in database');
    
    const { data, error } = await supabase
      .from('agent_configs')
      .update({
        display_name: body.displayName,
        description: body.description,
        system_prompt: body.systemPrompt,
        temperature: body.temperature,
        max_tokens: body.maxTokens,
        model: body.model,
        enabled: body.enabled,
        guardrails: body.guardrails,
        special_config: body.specialConfig,
        updated_by: user.id,
      })
      .eq('agent_key', agentKey)
      .select()
      .single();
    
    if (error) {
      console.error('[AGENT_UPDATE] Database error:', error);
      throw error;
    }
    
    console.log('[AGENT_UPDATE] Successfully updated agent');
    
    // Transform response
    const agentConfig: AgentConfig = {
      id: data.id,
      agentKey: data.agent_key as AgentKey,
      displayName: data.display_name,
      description: data.description || '',
      systemPrompt: data.system_prompt,
      temperature: Number(data.temperature),
      maxTokens: data.max_tokens,
      model: data.model,
      enabled: data.enabled,
      guardrails: Array.isArray(data.guardrails) ? data.guardrails : [],
      specialConfig: data.special_config || {},
      updatedBy: data.updated_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    
    return NextResponse.json({ agent: agentConfig });
  } catch (error: any) {
    console.error('[AGENT_UPDATE] Error updating agent config:', error);
    const errorMessage = error?.message || 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update agent configuration', details: errorMessage },
      { status: 500 }
    );
  }
}



import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { AgentKey } from '@/lib/agents/types';
import { isValidAgentKey, getDefaultAgentConfig } from '@/lib/agents/config';

interface RouteParams {
  params: Promise<{
    agentKey: string;
  }>;
}

/**
 * POST /api/admin/agents/[agentKey]/reset
 * Reset agent to default configuration
 * Access: Super admin only
 */
export async function POST(
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
    
    // Get default config
    const defaultConfig = getDefaultAgentConfig(agentKey as AgentKey);
    
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('agent_configs')
      .update({
        system_prompt: defaultConfig.systemPrompt,
        temperature: defaultConfig.temperature,
        max_tokens: defaultConfig.maxTokens,
        model: defaultConfig.model,
        enabled: defaultConfig.enabled,
        guardrails: defaultConfig.guardrails,
        special_config: defaultConfig.specialConfig,
        updated_by: user.id,
      })
      .eq('agent_key', agentKey)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Agent ${agentKey} reset to default configuration`,
      agent: data 
    });
  } catch (error) {
    console.error('Error resetting agent config:', error);
    return NextResponse.json(
      { error: 'Failed to reset agent configuration' },
      { status: 500 }
    );
  }
}


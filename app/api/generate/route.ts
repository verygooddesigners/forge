import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findSimilarTrainingContent, buildContextFromExamples, buildContentGenerationPrompt } from '@/lib/rag';
import { generateContentStream, ContentGenerationRequest } from '@/lib/agents';
import { hasMinimumRole } from '@/lib/auth-config';
import type { UserRole } from '@/types';

/**
 * Convert TipTap JSON to plain text
 */
function convertTipTapToText(doc: any): string {
  if (!doc || !doc.content) return '';

  const extractText = (node: any): string => {
    if (node.type === 'text') {
      return node.text || '';
    }
    
    if (node.content && Array.isArray(node.content)) {
      const text = node.content.map(extractText).join('');
      
      // Add formatting based on node type
      if (node.type === 'heading') {
        const level = node.attrs?.level || 1;
        const prefix = '#'.repeat(level) + ' ';
        return prefix + text + '\n\n';
      }
      
      if (node.type === 'paragraph') {
        return text + '\n\n';
      }
      
      return text;
    }
    
    return '';
  };

  return doc.content.map(extractText).join('').trim();
}

export async function POST(request: NextRequest) {
  try {
    const {
      projectId,
      headline,
      primaryKeyword,
      secondaryKeywords,
      wordCount,
      writerModelId,
      briefContent,
    } = await request.json();

    // Validate required fields
    if (!headline || !primaryKeyword || !writerModelId) {
      console.error('[GENERATE] Missing required fields:', { headline: !!headline, primaryKeyword: !!primaryKeyword, writerModelId: !!writerModelId });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: headline, primaryKeyword, or writerModelId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[GENERATE] User not authenticated');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Verify project ownership if projectId provided
    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();
      if (!project) {
        return new Response(
          JSON.stringify({ error: 'Project not found or access denied' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify writer model access (ownership or admin+)
    if (writerModelId) {
      const { data: model, error: modelError } = await supabase
        .from('writer_models')
        .select('id, strategist_id, created_by')
        .eq('id', writerModelId)
        .single();

      if (modelError || !model) {
        return new Response(
          JSON.stringify({ error: 'Writer model not found or access denied' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role as UserRole | undefined;
      const isAdminOrAbove = hasMinimumRole(role, 'admin');
      const ownsModel = model.strategist_id === user.id || model.created_by === user.id;

      if (!isAdminOrAbove && !ownsModel) {
        return new Response(
          JSON.stringify({ error: 'Writer model not found or access denied' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get AI master instructions (optional - don't fail if missing)
    let masterInstructions = '';
    try {
      const { data: aiSettings, error: settingsError } = await supabase
        .from('ai_settings')
        .select('setting_value')
        .eq('setting_key', 'master_instructions')
        .single();

      if (settingsError) {
        console.warn('[GENERATE] ai_settings query failed (non-fatal):', settingsError.message);
      } else {
        masterInstructions = aiSettings?.setting_value || '';
      }
    } catch (settingsErr) {
      console.warn('[GENERATE] ai_settings table might not exist (non-fatal):', settingsErr);
    }

    // Use RAG to find similar training content
    const queryText = `${headline} ${primaryKeyword} ${secondaryKeywords?.join(' ') || ''}`;
    let similarContent = [];
    let writerContext = '';
    
    try {
      similarContent = await findSimilarTrainingContent(
        writerModelId,
        queryText,
        3 // Get top 3 examples
      );

      // Build context from examples
      writerContext = buildContextFromExamples(similarContent);
      
      if (similarContent.length === 0) {
        console.warn('[GENERATE] No training content found for this writer model');
        writerContext = 'No specific training examples available. Write in a professional, engaging style.';
      }
    } catch (ragError: any) {
      console.error('[GENERATE] Error fetching training content:', ragError.message);
      writerContext = 'No specific training examples available. Write in a professional, engaging style.';
    }

    // Convert brief content from TipTap JSON to plain text
    let briefText = 'Write a well-structured article with clear headings and paragraphs.';
    if (briefContent) {
      try {
        // Parse if it's a string
        const briefJson = typeof briefContent === 'string' ? JSON.parse(briefContent) : briefContent;
        
        // Convert TipTap JSON to plain text
        if (briefJson && briefJson.content) {
          briefText = convertTipTapToText(briefJson);
        } else {
          briefText = briefContent;
        }
      } catch (e: any) {
        console.warn('[GENERATE] Brief parsing error (using default):', e.message);
        briefText = 'Write a well-structured article with clear headings and paragraphs.';
      }
    }

    // Build the brief with all context
    let fullBrief = briefText;
    if (masterInstructions) {
      fullBrief = `${masterInstructions}\n\n${briefText}`;
    }

    // Use Content Generation Agent
    const agentRequest: ContentGenerationRequest = {
      brief: fullBrief,
      primaryKeywords: [primaryKeyword],
      secondaryKeywords: secondaryKeywords || [],
      writerModelContext: writerContext,
      targetWordCount: wordCount || 800,
      additionalInstructions: `Write an article with the headline: "${headline}"`,
    };

    // Generate content with streaming using agent
    let stream: ReadableStream;
    try {
      stream = await generateContentStream(agentRequest);
    } catch (aiError: any) {
      console.error('[GENERATE] Content Generation Agent error:', aiError.message);
      return new Response(
        JSON.stringify({ error: `AI Generation failed: ${aiError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert Claude's stream to SSE format
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  continue;
                }

                try {
                  const json = JSON.parse(data);
                  
                  // Claude streaming format: content_block.delta.text or delta.text
                  const content = json.content_block?.delta?.text || 
                                 json.delta?.text || 
                                 (json.type === 'content_block_delta' && json.delta?.text) ||
                                 '';
                  
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }

                  // Handle stop event
                  if (json.type === 'message_stop') {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              } else if (line.startsWith('event: ')) {
                // Handle Claude events
                const event = line.slice(7).trim();
                if (event === 'message_stop') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[GENERATE] Fatal error in generate route:', error);
    console.error('[GENERATE] Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message || 'Unknown error',
        type: error.constructor.name 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}



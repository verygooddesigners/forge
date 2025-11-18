import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findSimilarTrainingContent, buildContextFromExamples, buildContentGenerationPrompt } from '@/lib/rag';
import { streamContent } from '@/lib/ai';

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
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get AI master instructions
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('setting_value')
      .eq('setting_key', 'master_instructions')
      .single();

    const masterInstructions = aiSettings?.setting_value || '';

    // Use RAG to find similar training content
    const queryText = `${headline} ${primaryKeyword} ${secondaryKeywords?.join(' ') || ''}`;
    const similarContent = await findSimilarTrainingContent(
      writerModelId,
      queryText,
      3 // Get top 3 examples
    );

    // Build context from examples
    const writerContext = buildContextFromExamples(similarContent);

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
      } catch (e) {
        // If parsing fails, use as-is
        briefText = typeof briefContent === 'string' ? briefContent : JSON.stringify(briefContent);
      }
    }

    // Build the prompt
    const prompt = buildContentGenerationPrompt(
      headline,
      primaryKeyword,
      secondaryKeywords || [],
      wordCount || 800,
      briefText,
      writerContext,
      masterInstructions
    );

    // Generate content with streaming
    const stream = await streamContent([
      {
        role: 'system',
        content: 'You are an expert content writer specialized in SEO-optimized articles.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

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
  } catch (error) {
    console.error('Error in generate route:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}



import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runResearchPipeline } from '@/lib/agents/research-orchestrator';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  try {
    const body = await request.json();
    const {
      projectId,
      headline,
      primaryKeyword,
      secondaryKeywords,
      topic,
      additionalDetails,
    } = body;

    if (!projectId || !headline || !primaryKeyword) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: projectId, headline, primaryKeyword' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: existing } = await supabase
      .from('project_research')
      .select('id')
      .eq('project_id', projectId)
      .single();

    let researchId: string;
    if (existing) {
      researchId = existing.id;
      await supabase
        .from('project_research')
        .update({ status: 'running', updated_at: new Date().toISOString() })
        .eq('id', researchId);
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('project_research')
        .insert({
          project_id: projectId,
          status: 'running',
          stories: [],
          suggested_keywords: [],
          selected_story_ids: [],
          selected_keywords: [],
          orchestrator_log: [],
          loops_completed: 0,
        })
        .select('id')
        .single();
      if (insertError || !inserted) {
        return new Response(
          JSON.stringify({ error: 'Failed to create project_research record' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      researchId = inserted.id;
    }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };
        try {
          const result = await runResearchPipeline(
            supabase,
            {
              projectId,
              headline,
              primaryKeyword,
              secondaryKeywords: secondaryKeywords || [],
              topic: topic || '',
              additionalDetails: additionalDetails || '',
            },
            (event) => {
              send({ type: 'progress', message: event.message, timestamp: event.timestamp });
            }
          );

          const selected_story_ids = result.stories.filter((s) => s.is_selected).map((s) => s.id);

          await supabase
            .from('project_research')
            .update({
              stories: result.stories,
              suggested_keywords: result.suggested_keywords,
              selected_story_ids,
              selected_keywords: [],
              orchestrator_log: result.orchestrator_log,
              loops_completed: result.loops_completed,
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', researchId);

          const researchBrief = {
            articles: result.research_brief.articles,
            verified_facts: result.research_brief.verified_facts,
            disputed_facts: result.research_brief.disputed_facts,
            user_feedback: [],
            fact_check_complete: result.research_brief.fact_check_complete,
            research_timestamp: result.research_brief.research_timestamp,
            confidence_score: result.research_brief.confidence_score,
          };
          await supabase
            .from('projects')
            .update({
              research_brief: researchBrief,
              updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);

          send({ type: 'done', researchId });
        } catch (err: any) {
          console.error('[research/pipeline]', err);
          await supabase
            .from('project_research')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', researchId);
          send({ type: 'error', error: err?.message || 'Research pipeline failed' });
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[research/pipeline]', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

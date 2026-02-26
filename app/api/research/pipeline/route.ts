import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runResearchPipeline } from '@/lib/agents/research-orchestrator';
import { debugLog } from '@/lib/debug-log';

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

    debugLog('ResearchPipeline', 'POST', { projectId, headline: headline?.slice(0, 40), primaryKeyword });

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
      debugLog('ResearchPipeline', '403 Project not found or access denied', projectId);
      return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    debugLog('ResearchPipeline', 'Auth OK', projectId);

    const { data: existing } = await supabase
      .from('project_research')
      .select('id')
      .eq('project_id', projectId)
      .single();

    let researchId: string;
    if (existing) {
      researchId = existing.id;
      debugLog('ResearchPipeline', 'Using existing project_research', researchId);
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
        debugLog('ResearchPipeline', 'Failed to create project_research', insertError?.message);
        return new Response(
          JSON.stringify({ error: 'Failed to create project_research record' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      researchId = inserted.id;
      debugLog('ResearchPipeline', 'Created project_research', researchId);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };
        try {
          debugLog('ResearchPipeline', 'Pipeline started', projectId);
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
              if (event.type === 'error') {
                send({ type: 'error', error: event.message });
              } else {
                send({ type: 'progress', message: event.message, stage: event.type, timestamp: event.timestamp });
              }
            }
          );

          const storyCount = result.stories.length;
          debugLog('ResearchPipeline', 'Pipeline done', {
            projectId,
            stories: storyCount,
            keywords: result.suggested_keywords.length,
            loops: result.loops_completed,
          });
          send({ type: 'progress', message: `Saving ${storyCount} stories…`, stage: 'complete', timestamp: new Date().toISOString() });

          const selected_story_ids = result.stories.filter((s) => s.is_selected).map((s) => s.id);
          const storiesPayload = JSON.parse(JSON.stringify(result.stories)) as typeof result.stories;

          const { error: updateError } = await supabase
            .from('project_research')
            .update({
              stories: storiesPayload,
              suggested_keywords: result.suggested_keywords,
              selected_story_ids,
              selected_keywords: [],
              orchestrator_log: result.orchestrator_log,
              loops_completed: result.loops_completed,
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', researchId);

          if (updateError) {
            debugLog('ResearchPipeline', 'project_research update failed', updateError.message);
            await supabase
              .from('project_research')
              .update({ status: 'failed', updated_at: new Date().toISOString() })
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
              .update({ research_brief: researchBrief, updated_at: new Date().toISOString() })
              .eq('id', projectId);
            send({ type: 'done', researchId });
            send({ type: 'progress', message: 'Stories saved to project (research table update failed).', stage: 'complete', timestamp: new Date().toISOString() });
            return;
          }

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
          debugLog('ResearchPipeline', 'Pipeline error', err?.message ?? err);
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
    debugLog('ResearchPipeline', 'POST error', error?.message ?? error);
    console.error('[research/pipeline]', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

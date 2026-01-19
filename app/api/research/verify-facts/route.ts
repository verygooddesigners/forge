import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyFacts } from '@/lib/agents/fact-verification';
import { ResearchArticle, ArticleFeedback, ResearchBrief } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { projectId, articles, userFeedback } = await request.json();

    if (!projectId || !articles) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get project details
    const { data: project } = await supabase
      .from('projects')
      .select('headline, topic, primary_keyword')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Call Fact Verification Agent
    console.log(`[FACT_VERIFY] Starting verification for project ${projectId} with ${articles.length} articles`);
    
    const verificationResult = await verifyFacts({
      articles: articles as ResearchArticle[],
      topic: project.headline || project.topic || '',
      context: project.primary_keyword,
    });

    console.log(`[FACT_VERIFY] Completed: ${verificationResult.verified_facts.length} verified, ${verificationResult.disputed_facts.length} disputed`);

    // Build research brief
    const researchBrief: ResearchBrief = {
      articles: articles as ResearchArticle[],
      verified_facts: verificationResult.verified_facts,
      disputed_facts: verificationResult.disputed_facts,
      user_feedback: (userFeedback || []) as ArticleFeedback[],
      fact_check_complete: true,
      fact_check_timestamp: new Date().toISOString(),
      research_timestamp: new Date().toISOString(),
      confidence_score: verificationResult.confidence_score,
    };

    // Store research brief in project metadata
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        research_brief: researchBrief,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project with research brief:', updateError);
      return NextResponse.json(
        { error: 'Failed to save research brief' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      verified_facts: verificationResult.verified_facts,
      disputed_facts: verificationResult.disputed_facts,
      confidence_score: verificationResult.confidence_score,
      research_brief: researchBrief,
    });
  } catch (error: any) {
    console.error('[FACT_VERIFY] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify facts', details: error.message },
      { status: 500 }
    );
  }
}

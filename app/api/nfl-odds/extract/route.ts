import { NextRequest, NextResponse } from 'next/server';
import { extractFromImage } from '@/lib/agents/visual-extraction';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scheduleImage, oddsImage, weekNumber, seasonYear, headline } = await request.json();

    if (!scheduleImage || !oddsImage || !weekNumber || !seasonYear) {
      return NextResponse.json(
        { error: 'Missing required fields: scheduleImage, oddsImage, weekNumber, seasonYear' },
        { status: 400 }
      );
    }

    // Parse base64 image data
    const scheduleImageData = scheduleImage.split(',')[1]; // Remove data:image/...;base64, prefix
    const scheduleImageType = scheduleImage.split(';')[0].split(':')[1]; // Extract mime type

    // Extract schedule data from ESPN screenshot
    const scheduleResult = await extractFromImage({
      imageData: scheduleImageData,
      imageType: scheduleImageType,
      extractionType: 'structured',
      expectedFields: ['awayTeam', 'homeTeam', 'date', 'time', 'location'],
    });

    if (!scheduleResult.success || !scheduleResult.content) {
      return NextResponse.json(
        { error: 'Failed to extract schedule data', details: scheduleResult.error },
        { status: 500 }
      );
    }

    // Parse the JSON content from the agent response
    let scheduleData;
    try {
      const parsed = JSON.parse(scheduleResult.content);
      scheduleData = parsed.data || parsed; // Handle both wrapped and direct data
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to parse schedule data', details: 'Invalid JSON response' },
        { status: 500 }
      );
    }

    // Parse odds image data
    const oddsImageData = oddsImage.split(',')[1];
    const oddsImageType = oddsImage.split(';')[0].split(':')[1];

    // Extract odds data from RotoWire screenshot
    const oddsResult = await extractFromImage({
      imageData: oddsImageData,
      imageType: oddsImageType,
      extractionType: 'table',
      expectedFields: ['matchup', 'pointSpread', 'moneylineAway', 'moneylineHome', 'overUnder'],
    });

    if (!oddsResult.success || !oddsResult.content) {
      return NextResponse.json(
        { error: 'Failed to extract odds data', details: oddsResult.error },
        { status: 500 }
      );
    }

    // Parse the JSON content from the agent response
    let oddsData;
    try {
      const parsed = JSON.parse(oddsResult.content);
      oddsData = parsed.data || parsed;
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to parse odds data', details: 'Invalid JSON response' },
        { status: 500 }
      );
    }

    // Merge schedule and odds data
    const scheduleGames = scheduleData as any[];
    const oddsGames = oddsData as any[];

    const mergedGames = scheduleGames.map((game: any) => {
      // Find matching odds for this game
      const matchingOdds = oddsGames.find((odds: any) => {
        const oddsMatchup = odds.matchup.toLowerCase();
        const awayTeam = game.awayTeam.split(' ').pop().toLowerCase(); // Get last word (team name)
        const homeTeam = game.homeTeam.split(' ').pop().toLowerCase();
        
        return oddsMatchup.includes(awayTeam) && oddsMatchup.includes(homeTeam);
      });

      return {
        ...game,
        ...(matchingOdds || {}),
      };
    });

    // Generate article content
    const articleHeadline = headline || `NFL Week ${weekNumber} Odds, Picks, and Predictions (${seasonYear} Season)`;
    
    const articleContent = await generateArticleContent(mergedGames, weekNumber, seasonYear, articleHeadline);

    return NextResponse.json({
      success: true,
      data: {
        games: mergedGames,
        articleContent,
        headline: articleHeadline,
        weekNumber,
        seasonYear,
        gamesCount: mergedGames.length,
      },
    });
  } catch (error: any) {
    console.error('[NFL Odds Extract] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function generateArticleContent(games: any[], weekNumber: number, seasonYear: number, headline: string) {
  // Generate matchup list for Google Sheets
  const matchupList = games.map(g => `${g.awayTeam} vs ${g.homeTeam}`).join('\n');

  // Build article structure
  let article = `<h1>${headline}</h1>\n\n`;
  
  article += `<p><strong>Quick Matchup List (for tracking):</strong></p>\n`;
  article += `<pre>${matchupList}</pre>\n\n`;

  // Generate content for each matchup
  for (const game of games) {
    const awayShort = game.awayTeam.split(' ').pop();
    const homeShort = game.homeTeam.split(' ').pop();
    
    // Matchup heading
    article += `<h2>${awayShort} vs ${homeShort} Odds</h2>\n\n`;
    
    // Odds table
    article += `<figure class="table"><table>\n`;
    article += `  <tbody>\n`;
    article += `    <tr><td><strong>Matchup</strong></td><td>${game.awayTeam} vs. ${game.homeTeam}</td></tr>\n`;
    article += `    <tr><td><strong>Point Spread</strong></td><td>${game.pointSpread || 'TBD'}</td></tr>\n`;
    article += `    <tr><td><strong>Moneyline</strong></td><td>${game.moneylineAway || 'TBD'}</td></tr>\n`;
    article += `    <tr><td><strong>Over/Under</strong></td><td>${game.overUnder || 'TBD'}</td></tr>\n`;
    article += `    <tr><td><strong>Date</strong></td><td>${game.date} – ${game.time}</td></tr>\n`;
    article += `    <tr><td><strong>Location</strong></td><td>${game.location}</td></tr>\n`;
    article += `    <tr><td><strong>Info Last Verified</strong></td><td>${new Date().toLocaleDateString()}</td></tr>\n`;
    article += `  </tbody>\n`;
    article += `</table></figure>\n\n`;

    // Prediction section (blank for user to fill)
    article += `<h3>${awayShort} vs ${homeShort} Prediction</h3>\n\n`;
    article += `<p>[Add your prediction and analysis here]</p>\n\n`;

    // Picks section with placeholders
    article += `<h3>${awayShort} vs ${homeShort} Picks</h3>\n\n`;
    article += `<ul>\n`;
    article += `  <li><strong>Final Score:</strong> ${game.awayTeam}: X | ${game.homeTeam}: X</li>\n`;
    article += `  <li><strong>Point Spread:</strong> XXX -X</li>\n`;
    article += `  <li><strong>Over/Under:</strong> XX XX</li>\n`;
    article += `</ul>\n\n`;
  }

  // Opening odds summary table
  article += `<h2>NFL Week ${weekNumber} Opening Odds</h2>\n\n`;
  article += `<figure class="table"><table>\n`;
  article += `  <thead>\n`;
  article += `    <tr><th>Matchup</th><th>Opening Spread</th></tr>\n`;
  article += `  </thead>\n`;
  article += `  <tbody>\n`;
  
  for (const game of games) {
    const awayShort = game.awayTeam.split(' ').pop();
    const homeShort = game.homeTeam.split(' ').pop();
    article += `    <tr><td>${awayShort} vs ${homeShort}</td><td>${game.pointSpread || 'TBD'}</td></tr>\n`;
  }
  
  article += `  </tbody>\n`;
  article += `</table></figure>\n`;

  return article;
}

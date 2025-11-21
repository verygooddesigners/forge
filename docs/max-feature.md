# NFL Weekly Predictions Page Builder - Project Summary

## The Problem

Your colleague spends **30+ minutes every week** building NFL predictions content for RotoWire by:

- Taking screenshots of ESPN schedule and betting odds
- Prompting ChatGPT 6+ separate times (step-by-step because doing it all at once “messes things up”)
- Copy-pasting each output through Google Sheets first (because direct paste puts everything in one row)
- Finally pasting into RotoWire CMS
- Repeating this process for 17+ weeks of NFL season

## The Solution

Build a web app that takes **2 screenshot uploads** → generates **5 formatted outputs** → ready to copy-paste with **zero reformatting needed**.

### What It Does

**Input**: 2 screenshots

1. ESPN schedule (teams, dates, times, venues)
1. Betting odds (spreads, moneylines, over/unders)

**Output**: 5 perfectly formatted sections

1. **Matchup Tracking List**
	Packers vs Lions
	Bears vs Vikings
	Eagles vs Cowboys
1. **CMS Headers** (actual H2/H3 headers, not text)
	## Packers vs Lions Odds
	### Packers vs Lions Prediction
	### Packers vs Lions Picks
	[repeat for each matchup]
1. **Game Details Table** (the problematic one that currently breaks)
	Green Bay Packers vs. Detroit Lions
	Lions -3
	Packers +142 | Lions -170
	48.5
	Thursday, November 27, 2025 – 1 p.m. EST
	Ford Field, Detroit, MI
	{{last verified}}
1. **Opening Odds Table**
	Lions -3
	Vikings -7
	Cowboys +3
1. **Prediction Placeholders**
	• Final Score: Green Bay Packers: X | Detroit Lions: X
	• Point Spread: Packers -X
	• Over/Under: X XX

## Critical Requirements

### 1. Order Preservation (Mentioned 5+ times)

**Every single output must maintain the exact same matchup sequence**. This is absolutely critical.

### 2. Table Formatting (The Big Pain Point)

Current issue: When pasting from ChatGPT, table data goes into a single row instead of multiple rows. He has to paste into Google Sheets first to fix it.

**Solution needed**: Pre-format outputs so they paste correctly into:

- Google Sheets
- RotoWire CMS
- Both with proper row/column structure

### 3. Speed & Simplicity

- From screenshots → usable content in **under 2 minutes**
- No multi-step prompting
- No formatting fixes needed
- Just upload → generate → copy → paste

## Development Phases

### Phase 1: MVP (Recommended Start)

**Timeline**: 2-3 weeks | **Effort**: 40-60 hours

Features:

- Upload 2 screenshots
- Generate all 5 outputs
- Copy-to-clipboard for each section
- Basic error handling

**Value**: Immediate replacement for tedious manual process. Can use for remaining NFL season (Week 14+).

### Phase 2: Enhanced UX

**Timeline**: 1-2 weeks | **Effort**: 20-30 hours

Features:

- Preview/edit before copying
- Better formatting controls
- Bulk copy all outputs at once
- Download as file option

### Phase 3: Auto-Fetch Data

**Timeline**: 2-4 weeks | **Effort**: 30-50 hours

Features:

- Week selector dropdown
- Auto-fetch from ESPN/odds APIs
- No screenshots needed
- Scheduled generation option

### Phase 4: CMS Integration

**Timeline**: 2-3 weeks | **Effort**: 30-40 hours

Features:

- Direct RotoWire CMS connection
- One-click publish
- Template management

## Tech Stack

**Frontend**: React + Tailwind CSS  
**AI Processing**: Claude API (Sonnet 4.5) with Vision for screenshot OCR  
**Hosting**: Vercel/Netlify + serverless functions

## ROI

**Time Investment**: 40-60 hours for MVP  
**Time Saved**: ~25 minutes/week × 17+ weeks = **7+ hours per season**  
**Plus**: Eliminates frustration, reduces errors, works for future seasons

## Success Metrics

- Reduce weekly task from 30+ minutes to under 2 minutes
- 100% matchup order consistency across all outputs
- Zero formatting fixes needed after paste
- Successfully process 95%+ of screenshot uploads

## Next Steps

1. **Clarification Call**: Confirm exact screenshot sources and CMS paste behavior
1. **Sample Review**: Get Week 13 completed page as reference
1. **MVP Development**: Build Phase 1 for immediate use
1. **Iterate**: Enhance based on real-world usage feedback

## Timeline

If started now:

- **Week 1-3**: Build MVP
- **Week 4**: Testing with real data
- **Week 5+**: Deploy and use for remaining NFL season
- Post-season: Add enhancements (Phases 2-4)

---- 

**Bottom Line**: Transform a tedious 30-minute weekly task into a 2-minute automated process with a focused MVP that can be built in 2-3 weeks and enhanced iteratively based on real usage.
# NFL Odds Extractor Feature

## Executive Summary

The NFL Odds Extractor is an AI-powered automation tool that transforms weekly NFL schedule and odds data from screenshots into fully-formatted, SEO-optimized articles ready for publication. This feature eliminates 30 minutes of manual labor per week while ensuring consistent formatting, accuracy, and professional presentation.

## Business Value

### Time Savings

- **Manual Process:** 30+ minutes per week
- **Automated Process:** 3-5 minutes per week
- **Weekly Savings:** ~25 minutes
- **Annual Savings:** ~21.5 hours (52 weeks)
- **ROI:** Allows content strategist to produce additional articles or focus on higher-value analysis

### Quality Improvements

- Eliminates human transcription errors in odds data
- Ensures consistent formatting week-to-week
- Maintains SEO-optimized structure automatically
- Professional table formatting with zero effort

### Consistency Benefits

- Identical article structure improves reader experience
- Predictable layout aids SEO performance
- Uniform formatting simplifies CMS workflow
- Reduces QA time for editors

---

## Feature Overview

### Target User

**Max** - Content Strategist responsible for weekly NFL odds articles targeting specific game weeks. He needs to create articles with detailed matchup tables, odds information, and predictions while maintaining strict formatting requirements for the RotoWire CMS.

### Current Pain Points

1. **Manual data entry** from ESPN schedules and RotoWire odds matrices
2. **Repetitive table building** for each matchup (7 rows × 2 columns)
3. **Formatting consistency** challenges across weeks
4. **Time-consuming** process taking 30+ minutes weekly
5. **Copy-paste errors** when transcribing odds and dates
6. **CMS formatting** requires manual HTML structure

---

## User Workflow

### Step 1: Access NFL Odds Extractor

Max clicks **"NFL Odds Extractor"** in the RotoWrite dashboard sidebar, opening a specialized project creation modal.

### Step 2: Upload Screenshots

**ESPN NFL Schedule Screenshot:**

Max uploads screenshot(s) of the ESPN NFL weekly schedule containing:

- Game dates and kickoff times
- Stadium locations (city, state)
- Matchup order for the week
- Any additional scheduling notes

**RotoWire Weekly Odds Screenshots:**

Max uploads screenshot(s) from RotoWire's Weekly NFL Odds matrix (DraftKings Sportsbook data) containing:

- Point spreads with favored teams
- Moneyline odds for both teams
- Over/under point totals
- Current line information

### Step 3: Configure Week Details

Max enters:

- **Week Number:** 14
- **Season Year:** 2025
- **Article Headline:** (optional, auto-generated if blank)

### Step 4: Extract Data

Max clicks **"Extract Data"** button.

**Behind the scenes:**

- Visual Data Extraction Agent (Claude Vision API) processes both screenshot sets
- AI reads tables, identifies matchups, parses odds data
- System validates data consistency and completeness
- Structured JSON is generated with all game information

**Progress shown to Max:**

- Processing indicator with status
- "Analyzing ESPN schedule..."
- "Extracting odds data..."
- "Found 14 matchups for Week 14"

### Step 5: Review & Confirm

Max sees a preview of extracted matchups:

```text
Week 14 - 2025 NFL Season (14 games)

✓ Lions vs Packers - Thu, Nov 27, 1:00 PM EST
✓ Cowboys vs Giants - Thu, Nov 27, 4:30 PM EST
✓ Ravens vs Steelers - Sun, Nov 30, 1:00 PM EST
... (all matchups listed)
```

Max can:

- Review matchup list for accuracy
- Edit any incorrect data
- Remove/add matchups manually
- Click **"Generate Article"**

### Step 6: Automated Article Generation

The Content Generation Agent builds the complete article structure:

#### Initial Matchup List (for Google Sheets)

```text
Lions vs Packers
Cowboys vs Giants
Ravens vs Steelers
etc.
```

**Purpose:** Max copies this to his tracking spreadsheet for seasonal game outcome records.

#### Article Content Structure

**For Each Matchup, the system creates:**

**H2 Header:** `Packers vs Lions Odds`

**Odds Information Table (auto-populated):**

| Field | Value |
|-------|-------|
| Matchup | Green Bay Packers vs. Detroit Lions |
| Point Spread | Lions -3 |
| Moneyline | Packers +142 |
| Over/Under | 48.5 |
| Date | Thursday, November 27, 2025 – 1 p.m. EST |
| Location | Ford Field, Detroit, MI |
| Info Last Verified | {{last verified}} |

**H3 Header:** `Packers vs Lions Prediction`

- Section left intentionally blank
- Max can write analysis manually or use AI to generate

**H3 Header:** `Packers vs Lions Picks`

Bullet points with placeholders:

- Final Score: Green Bay Packers: X | Detroit Lions: X
- Point Spread: XXX -X
- Over/Under: XX XX

Max updates "X" placeholders with his predictions.

#### Final Section: Opening Odds Summary

**H2 Header:** `NFL Week 14 Opening Odds`

Two-column table tracking line movement:

| Matchup | Opening Spread |
|---------|----------------|
| Packers vs Lions | Lions -3 |
| Cowboys vs Giants | Cowboys -6.5 |
| Ravens vs Steelers | Ravens -2.5 |

**Purpose:** Readers can see how betting lines have moved since opening.

### Step 7: Edit & Refine

Max uses the standard RotoWrite editor to:

- Add prediction content for each matchup
- Fill in pick placeholders with his analysis
- Use the "Generate Content" button for any sections
- Run SEO Wizard for optimization
- Add internal links
- Make any final adjustments

**Key Point:** Content stays in TipTap editor format (fully editable) throughout this process.

### Step 8: Export for RotoWire CMS

When ready to publish, Max clicks the **"Export"** button (top right of editor toolbar).

**Export Modal appears with options:**

1. **Copy for RotoWire CMS** ⭐ (Primary option)
   - Converts TipTap content to CKEditor-compatible HTML
   - Formats tables with `<figure class="table">` wrapper
   - Uses proper `<h2>`, `<h3>`, `<ul>`, `<li>` tags
   - Automatically copies to clipboard
   - Ready to paste directly into RotoWire CMS with zero manual formatting

2. **Export to Markdown**
   - Clean markdown format
   - Downloads as `.md` file

3. **Export to HTML**
   - Standard HTML5 format
   - Downloads as `.html` file

4. **Export to Plain Text**
   - All formatting stripped
   - Downloads as `.txt` file

5. **Export to DOCX**
   - Microsoft Word format
   - Downloads as `.docx` file

Max selects **"Copy for RotoWire CMS"**, content is automatically copied, then he pastes directly into the RotoWire CMS Article Content editor.

### Step 9: Publish in CMS

Max pastes content into RotoWire CMS:

- All tables render perfectly
- Headers maintain proper hierarchy
- Lists format correctly
- No manual adjustments needed
- Publishes immediately

---

## Technical Features

### AI-Powered Data Extraction

**Visual Data Extraction Agent** uses Claude Sonnet 4 Vision API to:

- Read complex table layouts from screenshots
- Identify team names, dates, locations, odds
- Handle variations in screenshot quality and formatting
- Extract data with 95%+ accuracy
- Validate extracted data for consistency

**Supported Screenshot Sources:**

- ESPN NFL Schedule pages
- RotoWire Weekly NFL Odds matrix
- DraftKings Sportsbook odds displays

### Intelligent Content Generation

**Content Generation Agent** creates:

- Properly structured HTML/TipTap content
- SEO-optimized heading hierarchy
- Formatted tables with consistent styling
- Placeholder sections for manual input
- Summary tables for opening odds

### Format Conversion System

**Export engine** supports multiple output formats:

- **RotoWire CMS Format:** CKEditor-compatible HTML with specific class structures
- **Markdown:** Clean, portable markdown
- **HTML:** Standard HTML5 markup
- **Plain Text:** Stripped content for other uses
- **DOCX:** Microsoft Word format for offline editing

### Seamless Integration

- Uses existing RotoWrite editor (TipTap)
- Compatible with all current features (SEO Wizard, Auto-Optimize, NewsEngine)
- Saves to standard RotoWrite projects
- Full editing capabilities maintained
- Works with existing writer models

---

## User Benefits

### For Max (Content Strategist)

- **Saves 30 minutes per week** on repetitive data entry
- **Zero transcription errors** in odds and dates
- **Consistent formatting** every single week
- **Copy-paste ready** for RotoWire CMS
- **More time for analysis** and prediction writing

### For Editors/QA Team

- **Predictable structure** simplifies review process
- **Fewer formatting issues** to fix
- **Consistent quality** across all weekly articles
- **Faster approval** due to reduced errors

### For RotoWire Business

- **Faster publication** of time-sensitive odds content
- **Improved SEO** through consistent structure
- **Reduced labor costs** on routine content
- **Scalable process** for additional sports/leagues
- **Professional presentation** enhances brand reputation

---

## Example Output

### Generated Article Structure

```html
<h2>Packers vs Lions Odds</h2>

<figure class="table">
  <table>
    <tbody>
      <tr>
        <td><strong>Matchup</strong></td>
        <td>Green Bay Packers vs. Detroit Lions</td>
      </tr>
      <tr>
        <td><strong>Point Spread</strong></td>
        <td>Lions -3</td>
      </tr>
      <tr>
        <td><strong>Moneyline</strong></td>
        <td>Packers +142</td>
      </tr>
      <tr>
        <td><strong>Over/Under</strong></td>
        <td>48.5</td>
      </tr>
      <tr>
        <td><strong>Date</strong></td>
        <td>Thursday, November 27, 2025 – 1 p.m. EST</td>
      </tr>
      <tr>
        <td><strong>Location</strong></td>
        <td>Ford Field, Detroit, MI</td>
      </tr>
      <tr>
        <td><strong>Info Last Verified</strong></td>
        <td>{{last verified}}</td>
      </tr>
    </tbody>
  </table>
</figure>

<h3>Packers vs Lions Prediction</h3>
<p>[Max writes prediction here or uses AI]</p>

<h3>Packers vs Lions Picks</h3>
<ul>
  <li>Final Score: Green Bay Packers: X | Detroit Lions: X</li>
  <li>Point Spread: XXX -X</li>
  <li>Over/Under: XX XX</li>
</ul>

[Repeated for all matchups...]

<h2>NFL Week 14 Opening Odds</h2>

<figure class="table">
  <table>
    <tbody>
      <tr>
        <td>Packers vs Lions</td>
        <td>Lions -3</td>
      </tr>
      <tr>
        <td>Cowboys vs Giants</td>
        <td>Cowboys -6.5</td>
      </tr>
      [All matchups...]
    </tbody>
  </table>
</figure>
```

---

## Future Enhancements (Post-Launch)

### Additional Sports

- **NBA Odds Extractor** - Daily game odds and player props
- **MLB Odds Extractor** - Series odds and game lines
- **NHL Odds Extractor** - Puck line and totals
- **College Football Odds** - Weekend slate extraction

### Advanced Features

- **Automatic Updates:** Re-scan screenshots if odds change
- **Multi-Sportsbook Comparison:** Extract from multiple sportsbooks simultaneously
- **Historical Tracking:** Compare current lines to historical data
- **API Integration:** Direct data pull from odds providers (if available)
- **Prediction AI:** Auto-generate prediction content based on stats

### Workflow Improvements

- **Batch Processing:** Process multiple weeks at once
- **Templates:** Save custom table structures
- **Scheduling:** Auto-generate articles on a schedule
- **Version Control:** Track odds changes over time

---

## Implementation Timeline

### Phase 1: Multi-Agent System (3 weeks)

- Build agent infrastructure
- Migrate existing features
- Test and validate

### Phase 2: NFL Odds Extractor (2 weeks)

- Image upload system
- Visual extraction integration
- Content generation logic
- Export modal and formats
- End-to-end testing

### Total Timeline

5 weeks to production

---

## Success Metrics

### Efficiency Metrics

- Time per article: 30 min → 5 min (83% reduction)
- Transcription errors: 5-10 per article → 0 per article
- Formatting issues: 3-5 per article → 0 per article

### Quality Metrics

- SEO score consistency: ±15 points → ±5 points
- CMS paste success rate: 70% → 100%
- Reader engagement: Track post-launch

### Business Metrics

- Articles per week: Current baseline → +20% capacity
- Cost per article: Reduced by labor savings
- Publication speed: Faster time-to-publish for time-sensitive content

---

## Conclusion

The NFL Odds Extractor transforms a tedious, error-prone manual process into a streamlined, automated workflow. By leveraging AI vision and content generation, RotoWrite delivers consistent, high-quality odds articles ready for publication in a fraction of the time.

**Key Deliverable:** Max can upload screenshots, click a few buttons, and have publication-ready content in the RotoWire CMS within minutes—maintaining full editorial control while eliminating repetitive data entry.

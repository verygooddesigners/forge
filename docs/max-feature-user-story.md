# Max Feature User Story

Max arrives at the **Forge** platform, ready to create new content that targets weekly NFL odds.

## Upload Phase

### ESPN Schedule Screenshot

Max uploads a screenshot of the ESPN schedule for the NFL week that he's targeting. The screenshot contains information that he will use to build out tables for each matchup highlighted in the article:

- The date & time of the game
- The location of the game
- The order each matchup is presented in

### RotoWire Odds Screenshots

He then uploads the second batch of screenshots. These are taken from **RotoWire's Weekly NFL Odds** matrix. All odds included in the screenshots are taken from **DraftKings Sportsbook**. The screenshot contains information that he will use to build out tables for each matchup highlighted in the article:

- The point spread & favorite to win the matchup
- Both team's moneyline odds
- The over/under point total

## Initial Processing

Once that information has been uploaded to the platform, the tool spits out each matchup of the given week, formatted as follows:

```text
Packers vs Lions
etc.
```

It's important that everything that follows stays in the same order for formatting and uniformity purposes.

This step is meant to be copy/pasted into a separate Google sheet, where Max tracks the outcomes of every game this season.

## Article Generation

Once that step has finished, the **Forge** tool begins building out the article directly into the **CMS**. It begins by creating the appropriate headers for each matchup. For example:

- `H2: Packers vs Lions Odds`
- `H3: Packers vs Lions Prediction`
- `H3: Packers vs Lions Picks`

## Table Formatting

Under the Team vs Team Odds `H2`, the tool creates a seven-row, two-column table. Using the information uploaded at the beginning of this process (the weekly ESPN Schedule & weekly Odds), the tool creates the following table for each matchup. For example:

```text
Matchup: Green Bay Packers vs. Detroit Lions
Point Spread: Lions -3
Moneyline: Packers +142
Over/Under: 48.5
Date: Thursday, November 27, 2025 – 1 p.m. EST
Location: Ford Field, Detroit, MI
Info Last Verified: {{last verified}}
```

This process is repeated for each matchup that occurs in the given week. The first six rows in the second column will all change depending on the information pulled from the screenshots. The entire left column stays the same week-to-week. Both columns in the seventh row also stay the same each week.

## Prediction & Picks Sections

### Prediction Section

The tool leaves the section under the Team vs Team Prediction header blank. This gives Max the choice to write the blurb himself each week, or use AI to write the section for him.

### Picks Section

Under the Team vs Team Picks header, the tool creates the following bullet points for each matchup:

- Final Score: Green Bay Packers: X | Detroit Lions: X
- Point Spread: XXX -X
- Over/Under: XX XX

X's are included as placeholders. Max will update those X's as needed once he has finalized his thoughts on the games each week.

## Opening Odds Section

Once the bulk of the article has been completed, there's just one step left. The tool will create another `H2`:

```text
H2: NFL Week X Opening Odds
```

The "X" will be adjusted depending on what week is being targeted. So for Week 14, it would read:

```text
H2: NFL Week 14 Opening Odds
```

Using the information pulled at the beginning of the process, the tool creates a two-column table. The amount of rows will change from Week to Week depending on how many games are on the schedule in a given week.

The left column of this table is just the matchups of the week, which were pulled at the start of this process. The right column contains the point spread, highlighting just the team who is favored. For example:

```text
Packers vs Lions | Lions -3
```

This table tracks where the odds opened each week, so readers can see how the lines have moved.

## Summary

Once this step has been completed, the tool has done its job. Max can touch up the rest of the article as needed. This process saves about 30 minutes of manual labor each week and helps create an **SEO-optimized** format with minimal timesink for Max.

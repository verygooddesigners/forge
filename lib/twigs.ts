// Twigs - template variables for SmartBriefs and Content Editor
// These are replaced with actual values during content generation

export interface Twig {
  key: string;       // e.g. "sportsbook.name"
  label: string;     // e.g. "Sportsbook Name"
  example: string;   // e.g. "DraftKings"
  category: string;  // e.g. "Sportsbook & Brand"
}

export interface TwigCategory {
  name: string;
  twigs: Twig[];
}

export const TWIG_CATEGORIES: TwigCategory[] = [
  {
    name: 'Sportsbook & Brand',
    twigs: [
      { key: 'sportsbook.name', label: 'Sportsbook Name', example: 'DraftKings', category: 'Sportsbook & Brand' },
      { key: 'sportsbook.short_name', label: 'Short Name', example: 'DK', category: 'Sportsbook & Brand' },
      { key: 'sportsbook.url', label: 'URL', example: 'draftkings.com', category: 'Sportsbook & Brand' },
      { key: 'sportsbook.promo_url', label: 'Promo URL', example: 'draftkings.com/r/promo', category: 'Sportsbook & Brand' },
      { key: 'sportsbook.app_name', label: 'App Name', example: 'DraftKings Sportsbook App', category: 'Sportsbook & Brand' },
      { key: 'sportsbook.parent_company', label: 'Parent Company', example: 'DraftKings Inc.', category: 'Sportsbook & Brand' },
    ],
  },
  {
    name: 'Geography',
    twigs: [
      { key: 'state.name', label: 'State Name', example: 'Michigan', category: 'Geography' },
      { key: 'state.initials', label: 'State Initials', example: 'MI', category: 'Geography' },
      { key: 'state.city', label: 'City', example: 'Detroit', category: 'Geography' },
      { key: 'state.region', label: 'Region', example: 'Midwest', category: 'Geography' },
      { key: 'state.legalization_date', label: 'Legalization Date', example: 'January 22, 2021', category: 'Geography' },
      { key: 'state.regulatory_body', label: 'Regulatory Body', example: 'Michigan Gaming Control Board', category: 'Geography' },
      { key: 'state.regulator_abbr', label: 'Regulator Abbreviation', example: 'MGCB', category: 'Geography' },
    ],
  },
  {
    name: 'Offer/Promotion',
    twigs: [
      { key: 'offer.type', label: 'Offer Type', example: 'Bet $5, Get $150', category: 'Offer/Promotion' },
      { key: 'offer.amount', label: 'Offer Amount', example: '$150', category: 'Offer/Promotion' },
      { key: 'offer.min_deposit', label: 'Min Deposit', example: '$5', category: 'Offer/Promotion' },
      { key: 'offer.min_bet', label: 'Min Bet', example: '$5', category: 'Offer/Promotion' },
      { key: 'offer.bonus_type', label: 'Bonus Type', example: 'Bonus Bets', category: 'Offer/Promotion' },
      { key: 'offer.expiry_days', label: 'Expiry Days', example: '7', category: 'Offer/Promotion' },
      { key: 'offer.promo_code', label: 'Promo Code', example: 'FORGEBET', category: 'Offer/Promotion' },
      { key: 'offer.terms_url', label: 'Terms URL', example: 'draftkings.com/terms', category: 'Offer/Promotion' },
      { key: 'offer.odds_requirement', label: 'Odds Requirement', example: '-500 or better', category: 'Offer/Promotion' },
    ],
  },
  {
    name: 'Sports & Games',
    twigs: [
      { key: 'sport.name', label: 'Sport Name', example: 'NFL', category: 'Sports & Games' },
      { key: 'sport.season', label: 'Season', example: '2025-26', category: 'Sports & Games' },
      { key: 'sport.season_phase', label: 'Season Phase', example: 'Playoffs', category: 'Sports & Games' },
      { key: 'team.name', label: 'Team Name', example: 'Detroit Lions', category: 'Sports & Games' },
      { key: 'team.short_name', label: 'Team Short Name', example: 'Lions', category: 'Sports & Games' },
      { key: 'team.city', label: 'Team City', example: 'Detroit', category: 'Sports & Games' },
      { key: 'team.mascot', label: 'Mascot', example: 'Lions', category: 'Sports & Games' },
      { key: 'team.record', label: 'Team Record', example: '14-3', category: 'Sports & Games' },
      { key: 'team.opponent', label: 'Opponent', example: 'Green Bay Packers', category: 'Sports & Games' },
      { key: 'player.name', label: 'Player Name', example: 'Jared Goff', category: 'Sports & Games' },
      { key: 'player.position', label: 'Player Position', example: 'QB', category: 'Sports & Games' },
      { key: 'player.team', label: 'Player Team', example: 'Detroit Lions', category: 'Sports & Games' },
      { key: 'game.date', label: 'Game Date', example: 'Sunday, February 22', category: 'Sports & Games' },
      { key: 'game.time', label: 'Game Time', example: '4:30 PM ET', category: 'Sports & Games' },
      { key: 'game.venue', label: 'Game Venue', example: 'Ford Field', category: 'Sports & Games' },
      { key: 'game.spread', label: 'Game Spread', example: 'Lions -3.5', category: 'Sports & Games' },
      { key: 'game.total', label: 'Game Total', example: '47.5', category: 'Sports & Games' },
      { key: 'game.moneyline', label: 'Moneyline', example: '-175', category: 'Sports & Games' },
    ],
  },
  {
    name: 'Date & Time',
    twigs: [
      { key: 'date.today', label: 'Today', example: 'February 18, 2026', category: 'Date & Time' },
      { key: 'date.today_short', label: 'Today (Short)', example: 'Feb. 18, 2026', category: 'Date & Time' },
      { key: 'date.month', label: 'Month', example: 'February', category: 'Date & Time' },
      { key: 'date.month_short', label: 'Month (Short)', example: 'Feb.', category: 'Date & Time' },
      { key: 'date.year', label: 'Year', example: '2026', category: 'Date & Time' },
      { key: 'date.day_of_week', label: 'Day of Week', example: 'Wednesday', category: 'Date & Time' },
      { key: 'date.quarter', label: 'Quarter', example: 'Q1', category: 'Date & Time' },
    ],
  },
  {
    name: 'Author/Publication',
    twigs: [
      { key: 'author.name', label: 'Author Name', example: 'Jeremy Botter', category: 'Author/Publication' },
      { key: 'author.byline', label: 'Byline', example: 'By Jeremy Botter', category: 'Author/Publication' },
      { key: 'author.title', label: 'Author Title', example: 'Senior Writer', category: 'Author/Publication' },
      { key: 'publication.name', label: 'Publication Name', example: 'Forge', category: 'Author/Publication' },
      { key: 'publication.url', label: 'Publication URL', example: 'forgecontent.com', category: 'Author/Publication' },
      { key: 'publication.tagline', label: 'Tagline', example: 'Your tagline here', category: 'Author/Publication' },
    ],
  },
  {
    name: 'Content Metadata',
    twigs: [
      { key: 'content.title', label: 'Content Title', example: 'Best DraftKings Michigan Promo Code', category: 'Content Metadata' },
      { key: 'content.type', label: 'Content Type', example: 'Review', category: 'Content Metadata' },
      { key: 'content.word_count', label: 'Word Count', example: '1,200', category: 'Content Metadata' },
      { key: 'content.reading_time', label: 'Reading Time', example: '5 min read', category: 'Content Metadata' },
      { key: 'content.target_keyword', label: 'Target Keyword', example: 'DraftKings Michigan promo code', category: 'Content Metadata' },
      { key: 'content.secondary_keyword', label: 'Secondary Keyword', example: 'DraftKings bonus bets', category: 'Content Metadata' },
      { key: 'content.slug', label: 'Slug', example: 'draftkings-michigan-promo-code', category: 'Content Metadata' },
      { key: 'content.meta_description', label: 'Meta Description', example: '[auto-generated]', category: 'Content Metadata' },
      { key: 'content.tone', label: 'Tone', example: 'Conversational', category: 'Content Metadata' },
    ],
  },
  {
    name: 'SEO/Ratings',
    twigs: [
      { key: 'rating.overall', label: 'Overall Rating', example: '4.8/5', category: 'SEO/Ratings' },
      { key: 'rating.score', label: 'Rating Score', example: '4.8', category: 'SEO/Ratings' },
      { key: 'rating.stars', label: 'Star Rating', example: '\u2605\u2605\u2605\u2605\u2605', category: 'SEO/Ratings' },
      { key: 'ranking.position', label: 'Ranking Position', example: '#1', category: 'SEO/Ratings' },
      { key: 'ranking.category', label: 'Ranking Category', example: 'Best Michigan Sportsbooks', category: 'SEO/Ratings' },
    ],
  },
];

// Flat list of all twigs for easy searching
export const ALL_TWIGS: Twig[] = TWIG_CATEGORIES.flatMap(cat => cat.twigs);

/**
 * Format a twig key as its template syntax: {key}
 */
export function formatTwig(key: string): string {
  return `{${key}}`;
}

/**
 * Replace all twigs in text with their values from a data map
 */
export function replaceTwigs(text: string, data: Record<string, string>): string {
  let result = text;
  for (const twig of ALL_TWIGS) {
    const placeholder = formatTwig(twig.key);
    if (result.includes(placeholder) && data[twig.key]) {
      result = result.replaceAll(placeholder, data[twig.key]);
    }
  }
  return result;
}

/**
 * Auto-fill date twigs with current date values
 */
export function getDateTwigValues(): Record<string, string> {
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsShort = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const quarter = Math.ceil((now.getMonth() + 1) / 3);

  return {
    'date.today': `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
    'date.today_short': `${monthsShort[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
    'date.month': months[now.getMonth()],
    'date.month_short': monthsShort[now.getMonth()],
    'date.year': String(now.getFullYear()),
    'date.day_of_week': days[now.getDay()],
    'date.quarter': `Q${quarter}`,
  };
}

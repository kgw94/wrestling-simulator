import { Promotion, WeeklyShow, DayOfWeek, BroadcastTier } from '../types';

/**
 * Default preset templates to quickly add new weekly shows under settings.
 */
export type ShowTemplateCategory = 'All' | 'Flagship' | 'B-Show' | 'Digital' | 'Hardcore' | 'Divisional';

export interface WeeklyShowTemplate {
  nameTemplate: (promoShort: string) => string;
  category: 'Flagship' | 'B-Show' | 'Digital' | 'Hardcore' | 'Divisional';
  dayOfWeek: DayOfWeek;
  tvNetwork: string;
  durationMinutes: number;
  broadcastTier: BroadcastTier;
  productionCostWeekly: number;
  minNetworkRating: number;
  description: string;
}

export const WEEKLY_SHOW_TEMPLATES: WeeklyShowTemplate[] = [
  // Flagships
  {
    nameTemplate: (s) => `${s} Prime-Time Clash`,
    category: 'Flagship',
    dayOfWeek: 'Monday',
    tvNetwork: 'National Prime Network HD',
    durationMinutes: 120,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 80000,
    minNetworkRating: 68,
    description: 'A marquee 2-hour Monday blockbuster designed to wage direct prime-time ratings war against rival promotions.'
  },
  {
    nameTemplate: (s) => `${s} Friday Night Fight Night Live`,
    category: 'Flagship',
    dayOfWeek: 'Friday',
    tvNetwork: 'Fox Atlantic Sports',
    durationMinutes: 120,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 75000,
    minNetworkRating: 66,
    description: 'Electrifying end-of-week live extravaganza featuring premier main-event storylines, championship defenses, and celebrity guest appearances.'
  },
  {
    nameTemplate: (s) => `${s} Wednesday Night War`,
    category: 'Flagship',
    dayOfWeek: 'Wednesday',
    tvNetwork: 'TNT Sports Worldwide',
    durationMinutes: 120,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 70000,
    minNetworkRating: 64,
    description: 'Midweek live supercard anchored around faction gang warfare, bloody rivalries, and hot cold-open confrontations.'
  },
  {
    nameTemplate: (s) => `${s} Saturday Night Supercard`,
    category: 'Flagship',
    dayOfWeek: 'Saturday',
    tvNetwork: 'National Broadcast Network (OTA)',
    durationMinutes: 120,
    broadcastTier: 'Free-To-Air TV',
    productionCostWeekly: 65000,
    minNetworkRating: 62,
    description: 'Prime-time terrestrial television special capturing mainstream casual sports viewers with high-spectacle attractions.'
  },

  // B-Shows & Workrate
  {
    nameTemplate: (s) => `${s} Velocity (B-Show)`,
    category: 'B-Show',
    dayOfWeek: 'Saturday',
    tvNetwork: 'USA Sports Cable',
    durationMinutes: 60,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 28000,
    minNetworkRating: 58,
    description: 'A 1-hour fast-paced showcase designed for rising stars, midcard rivalries, and workrate clinic matches.'
  },
  {
    nameTemplate: (s) => `${s} Voltage & High-Flying`,
    category: 'B-Show',
    dayOfWeek: 'Tuesday',
    tvNetwork: 'Spike Action Network',
    durationMinutes: 60,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 25000,
    minNetworkRating: 56,
    description: 'Dedicated spotlight for cruiserweights, luchadores, and high-octane tag team spectacles.'
  },
  {
    nameTemplate: (s) => `${s} Sunday Morning Slam`,
    category: 'B-Show',
    dayOfWeek: 'Sunday',
    tvNetwork: 'Global Syndication Network',
    durationMinutes: 60,
    broadcastTier: 'Free-To-Air TV',
    productionCostWeekly: 18000,
    minNetworkRating: 50,
    description: 'Family-friendly weekend syndicated review recapping top angles with exclusive competitive midcard showcase bouts.'
  },
  {
    nameTemplate: (s) => `${s} Studio 6:05 PM Classic`,
    category: 'B-Show',
    dayOfWeek: 'Saturday',
    tvNetwork: 'Heritage Sports Network',
    durationMinutes: 60,
    broadcastTier: 'Free-To-Air TV',
    productionCostWeekly: 20000,
    minNetworkRating: 54,
    description: 'Traditional studio arena wrestling in the iconic 6:05 PM Saturday slot featuring old-school podium interviews and stiff grappling.'
  },

  // Digital & Streaming
  {
    nameTemplate: (s) => `${s} Global Digital Stream`,
    category: 'Digital',
    dayOfWeek: 'Wednesday',
    tvNetwork: 'YouTube Exclusive & OTT Stream',
    durationMinutes: 60,
    broadcastTier: 'Online Streaming',
    productionCostWeekly: 14000,
    minNetworkRating: 48,
    description: 'Streamed globally on YouTube and digital apps to expand overseas fanbase and showcase young talent.'
  },
  {
    nameTemplate: (s) => `${s} Dark: Tapings & Prospects`,
    category: 'Digital',
    dayOfWeek: 'Monday',
    tvNetwork: 'YouTube Official Channel',
    durationMinutes: 45,
    broadcastTier: 'Online Streaming',
    productionCostWeekly: 10000,
    minNetworkRating: 45,
    description: 'Fast-paced digital dark match showcase taped before television broadcasts, building win/loss momentum for rising prospects.'
  },
  {
    nameTemplate: (s) => `${s} Developmental Future Stars`,
    category: 'Digital',
    dayOfWeek: 'Friday',
    tvNetwork: 'Dojo Streaming Pass',
    durationMinutes: 60,
    broadcastTier: 'Online Streaming',
    productionCostWeekly: 12000,
    minNetworkRating: 46,
    description: 'Dedicated pipeline showcase highlighting training academy graduates and developmental talent on their journey to the main roster.'
  },

  // Late Night & Hardcore
  {
    nameTemplate: (s) => `${s} After Hours: Underground`,
    category: 'Hardcore',
    dayOfWeek: 'Thursday',
    tvNetwork: 'Midnight Cable TV-MA',
    durationMinutes: 60,
    broadcastTier: 'Late Night Underground',
    productionCostWeekly: 22000,
    minNetworkRating: 52,
    description: 'Gritty, no-disqualification late-night brawling with uncensored promos and hardcore stipulations.'
  },
  {
    nameTemplate: (s) => `${s} Midnight Carnage Hardcore`,
    category: 'Hardcore',
    dayOfWeek: 'Saturday',
    tvNetwork: 'Dark Zone Cable Late Night',
    durationMinutes: 60,
    broadcastTier: 'Late Night Underground',
    productionCostWeekly: 24000,
    minNetworkRating: 54,
    description: 'Barbed wire, steel chairs, and tables! Raw, unhinged hardcore warfare where grudges are settled bloodily after the censors go home.'
  },

  // Divisional Spotlights
  {
    nameTemplate: (s) => `${s} Empress: Women's Grand Prix`,
    category: 'Divisional',
    dayOfWeek: 'Thursday',
    tvNetwork: 'Prism Entertainment HD',
    durationMinutes: 60,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 26000,
    minNetworkRating: 58,
    description: 'Premier all-women showcase highlighting world-class female athletes, women\'s tag combinations, and hard-hitting championship rivalries.'
  },
  {
    nameTemplate: (s) => `${s} Super-J Aerial Hour`,
    category: 'Divisional',
    dayOfWeek: 'Tuesday',
    tvNetwork: 'Velocity Sports HD',
    durationMinutes: 60,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 24000,
    minNetworkRating: 57,
    description: 'High-octane showcase dedicated to cruiserweights, lucha libre aerialists, and rapid-fire technical submission artists.'
  }
];

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

/**
 * Generates a creative randomized weekly show concept based on the promotion.
 */
export function generateRandomWeeklyShow(promotion: Promotion): Partial<WeeklyShow> {
  const short = promotion.shortName || promotion.name;
  const prefixes = [
    'Night of Thunder', 'Collision', 'Rampage', 'Overdrive', 'Anarchy', 
    'Ignition', 'Showdown', 'Battleground', 'Retribution', 'Unleashed',
    'Main Event', 'Shockwave', 'Apex', 'Crucible', 'Vortex'
  ];
  const networks = [
    'USA Sports Network', 'Atlantic Prime Cable', 'TNT Action HD', 
    'Fox Prime Sports', 'Spike TV Worldwide', 'Global Syndication', 
    'YouTube Premiere & OTT', 'Midnight Action TV-MA'
  ];
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomDay = days[Math.floor(Math.random() * days.length)];
  const randomNetwork = networks[Math.floor(Math.random() * networks.length)];

  return {
    name: `${short} ${randomPrefix}`,
    dayOfWeek: randomDay,
    tvNetwork: randomNetwork,
    durationMinutes: Math.random() > 0.5 ? 120 : 60,
    broadcastTier: randomNetwork.includes('Midnight') 
      ? 'Late Night Underground' 
      : randomNetwork.includes('YouTube') 
      ? 'Online Streaming' 
      : 'Cable Prime-Time',
    productionCostWeekly: Math.round(20000 + Math.random() * 45000),
    minNetworkRating: Math.round(50 + Math.random() * 18),
    isPrimary: false,
    description: `A dynamic weekly broadcast featuring ${promotion.style} action, fierce personal rivalries, and championship stakes.`
  };
}

/**
 * Returns all weekly shows for a promotion, guaranteeing at least 1 primary flagship show.
 */
export function getPromotionWeeklyShows(promotion: Promotion): WeeklyShow[] {
  if (promotion.weeklyShows && promotion.weeklyShows.length > 0) {
    return promotion.weeklyShows;
  }

  // Derive initial show from promotion defaults
  let derivedDay: DayOfWeek = 'Friday';
  if (/monday/i.test(promotion.weeklyTVShow)) derivedDay = 'Monday';
  else if (/tuesday/i.test(promotion.weeklyTVShow)) derivedDay = 'Tuesday';
  else if (/wednesday/i.test(promotion.weeklyTVShow)) derivedDay = 'Wednesday';
  else if (/thursday/i.test(promotion.weeklyTVShow)) derivedDay = 'Thursday';
  else if (/friday/i.test(promotion.weeklyTVShow)) derivedDay = 'Friday';
  else if (/saturday/i.test(promotion.weeklyTVShow)) derivedDay = 'Saturday';
  else if (/sunday/i.test(promotion.weeklyTVShow)) derivedDay = 'Sunday';

  const defaultShow: WeeklyShow = {
    id: `show-primary-${promotion.id || 'default'}`,
    name: promotion.weeklyTVShow || `${promotion.shortName} Weekly Showcase`,
    dayOfWeek: derivedDay,
    tvNetwork: promotion.tvNetwork || 'Prime Broadcast Network',
    durationMinutes: 120,
    isPrimary: true,
    productionCostWeekly: promotion.productionCostWeekly || 50000,
    minNetworkRating: promotion.minNetworkRating || 60,
    broadcastTier: 'Cable Prime-Time',
    description: 'The flagship weekly television program and marquee broadcast anchor of the promotion.'
  };

  return [defaultShow];
}

/**
 * Gets the current active weekly show for booking and show cards.
 */
export function getActiveWeeklyShow(promotion: Promotion): WeeklyShow {
  const shows = getPromotionWeeklyShows(promotion);
  if (promotion.activeWeeklyShowId) {
    const found = shows.find(s => s.id === promotion.activeWeeklyShowId);
    if (found) return found;
  }
  const primary = shows.find(s => s.isPrimary);
  return primary || shows[0];
}

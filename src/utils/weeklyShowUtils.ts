import { Promotion, WeeklyShow, DayOfWeek, BroadcastTier } from '../types';

/**
 * Default preset templates to quickly add new weekly shows under settings.
 */
export interface WeeklyShowTemplate {
  nameTemplate: (promoShort: string) => string;
  dayOfWeek: DayOfWeek;
  tvNetwork: string;
  durationMinutes: number;
  broadcastTier: BroadcastTier;
  productionCostWeekly: number;
  minNetworkRating: number;
  description: string;
}

export const WEEKLY_SHOW_TEMPLATES: WeeklyShowTemplate[] = [
  {
    nameTemplate: (s) => `${s} Velocity (B-Show)`,
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
    dayOfWeek: 'Tuesday',
    tvNetwork: 'Spike Action Network',
    durationMinutes: 60,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 25000,
    minNetworkRating: 56,
    description: 'Dedicated spotlight for cruiserweights, luchadores, and high-octane tag team spectacles.'
  },
  {
    nameTemplate: (s) => `${s} After Hours: Underground`,
    dayOfWeek: 'Thursday',
    tvNetwork: 'Midnight Cable TV-MA',
    durationMinutes: 60,
    broadcastTier: 'Late Night Underground',
    productionCostWeekly: 22000,
    minNetworkRating: 52,
    description: 'Gritty, no-disqualification late-night brawling with uncensored promos and hardcore stipulations.'
  },
  {
    nameTemplate: (s) => `${s} Global Digital Stream`,
    dayOfWeek: 'Wednesday',
    tvNetwork: 'YouTube Exclusive & OTT Stream',
    durationMinutes: 60,
    broadcastTier: 'Online Streaming',
    productionCostWeekly: 14000,
    minNetworkRating: 48,
    description: 'Streamed globally on YouTube and digital apps to expand overseas fanbase and showcase young talent.'
  },
  {
    nameTemplate: (s) => `${s} Prime-Time Clash`,
    dayOfWeek: 'Monday',
    tvNetwork: 'National Prime Network HD',
    durationMinutes: 120,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 80000,
    minNetworkRating: 68,
    description: 'A flagship 2-hour Monday blockbuster to wage direct ratings war against rival promotions.'
  }
];

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

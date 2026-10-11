import { 
  Promotion, 
  TelevisionNetworkDeal, 
  AvailableNetworkOffer, 
  AdRevenueTier, 
  NetworkDemand 
} from '../types';

export const AD_REVENUE_TIERS_CONFIG: Record<AdRevenueTier, {
  name: string;
  tagline: string;
  multiplier: number;
  ratingModifier: number;
  minPrestigeRequired: number;
  requiresPG: boolean;
  description: string;
  badgeClass: string;
}> = {
  'Low Commercial Load': {
    name: 'Low Commercial Load',
    tagline: 'Fan-First Broadcast Pacing',
    multiplier: 0.65,
    ratingModifier: 3,
    minPrestigeRequired: 0,
    requiresPG: false,
    description: 'Fewer commercial interruptions allow match psychology and long-form drama to breathe. Grants a +3 bonus to weekly show ratings, at the cost of 35% reduced ad revenue.',
    badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
  },
  'Standard Ad Load': {
    name: 'Standard Ad Load',
    tagline: 'Balanced Broadcast Industry Standard',
    multiplier: 1.0,
    ratingModifier: 0,
    minPrestigeRequired: 0,
    requiresPG: false,
    description: 'Traditional television advertising cadence with regular 3-minute commercial pods between segments. Balanced monetization with neutral (0) rating impact.',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700'
  },
  'Heavy Commercial Blitz': {
    name: 'Heavy Commercial Blitz',
    tagline: 'Aggressive Revenue Extraction',
    multiplier: 1.5,
    ratingModifier: -5,
    minPrestigeRequired: 0,
    requiresPG: false,
    description: 'Relentless commercial cuts, picture-in-picture commercial squeezes, and sponsor banners. Yields huge advertising income (+50%), but frustrates viewers (-5 show rating penalty).',
    badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-800'
  },
  'High-Roller Luxury Sponsors': {
    name: 'High-Roller Luxury Sponsors',
    tagline: 'Blue-Chip Corporate Prestige',
    multiplier: 1.35,
    ratingModifier: 1,
    minPrestigeRequired: 75,
    requiresPG: true,
    description: 'Premium international sponsors (luxury automotive, Swiss timepieces, fintech giants). Delivers +35% ad revenue and +1 rating boost. Requires 75+ Prestige and strictly forbids extreme blood/hardcore matches.',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-800'
  }
};

export const AVAILABLE_NETWORKS: AvailableNetworkOffer[] = [
  {
    id: 'global-sports-net',
    name: 'Global Sports Net (GSN)',
    tier: 'National Prime Cable',
    logoColor: 'text-sky-400',
    badgeClass: 'bg-sky-950/80 text-sky-400 border-sky-800',
    baseWeeklyRightsFee: 140000,
    minPrestigeRequired: 65,
    minRatingTarget: 68,
    preferredSlot: 'Friday Night Primetime (8:00 PM EST)',
    suggestedContractWeeks: [12, 24, 36, 52],
    demands: [
      {
        id: 'gsn-demand-main-event',
        type: 'main_event_quality',
        title: 'Prime-Time Main Event Standard',
        description: 'Deliver a thrilling Main Event segment with an evaluation score of 75 or higher.',
        targetValue: 75,
        ratingBonus: 4,
        ratingPenalty: 5,
        satisfactionImpact: 3
      },
      {
        id: 'gsn-demand-veteran',
        type: 'veteran_marquee',
        title: 'Marquee Superstar Spotlight',
        description: 'Book at least one established star with Overness of 80+ in the Main Event or Upper Midcard.',
        targetValue: 80,
        ratingBonus: 3,
        ratingPenalty: 3,
        satisfactionImpact: 2
      }
    ],
    flavorText: 'The flagship national sports cable network. Demands star power and compelling main events to dominate Friday night ratings.'
  },
  {
    id: 'titan-broadcast-network',
    name: 'Titan National Broadcast (TNB)',
    tier: 'Major Broadcast Television',
    logoColor: 'text-emerald-400',
    badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
    baseWeeklyRightsFee: 235000,
    minPrestigeRequired: 82,
    minRatingTarget: 76,
    preferredSlot: 'Monday Night Primetime (8:00 PM EST)',
    suggestedContractWeeks: [24, 36, 52],
    demands: [
      {
        id: 'tnb-demand-ratings-purity',
        type: 'main_event_quality',
        title: 'Broadcast Network Rating Standard',
        description: 'Score at least 80 in the Main Event to anchor national prime-time viewership.',
        targetValue: 80,
        ratingBonus: 5,
        ratingPenalty: 7,
        satisfactionImpact: 4
      },
      {
        id: 'tnb-demand-family',
        type: 'family_friendly',
        title: 'Strict Network PG Standards',
        description: 'Strictly prohibit Hardcore, First Blood, or Unsanctioned matches to protect high-paying family advertisers.',
        ratingBonus: 3,
        ratingPenalty: 6,
        satisfactionImpact: 5
      }
    ],
    flavorText: 'One of the nation’s big four broadcast television networks. Pays gargantuan rights fees but maintains zero tolerance for rating dips or unscripted vulgarity.'
  },
  {
    id: 'streamwave-prime',
    name: 'StreamWave Prime Worldwide',
    tier: 'Global Streaming Titan',
    logoColor: 'text-violet-400',
    badgeClass: 'bg-violet-950/80 text-violet-400 border-violet-800',
    baseWeeklyRightsFee: 180000,
    minPrestigeRequired: 74,
    minRatingTarget: 72,
    preferredSlot: 'Wednesday Global Live Stream (8:00 PM EST)',
    suggestedContractWeeks: [16, 24, 48],
    demands: [
      {
        id: 'stream-demand-youth',
        type: 'youth_movement',
        title: 'Next-Gen Youth Showcase',
        description: 'Feature at least two athletes aged 28 or younger on the broadcast card to captivate younger demographics.',
        targetValue: 2,
        ratingBonus: 4,
        ratingPenalty: 4,
        satisfactionImpact: 3
      },
      {
        id: 'stream-demand-tag',
        type: 'tag_team_focus',
        title: 'Dynamic Tag Team Division Feature',
        description: 'Book at least one high-octane Tag Team or 6-Man Tag match on every episode.',
        ratingBonus: 3,
        ratingPenalty: 3,
        satisfactionImpact: 2
      }
    ],
    flavorText: 'A digital streaming colossus streaming to 140+ countries. Demands fast-paced athletic action, modern production, and youth focus.'
  },
  {
    id: 'combat-anarchy-cable',
    name: 'Combat & Anarchy Channel (CAC)',
    tier: 'Cult Hardcore Cable',
    logoColor: 'text-rose-400',
    badgeClass: 'bg-rose-950/80 text-rose-400 border-rose-800',
    baseWeeklyRightsFee: 65000,
    minPrestigeRequired: 40,
    minRatingTarget: 58,
    preferredSlot: 'Saturday Night Midnight Anarchy (11:00 PM)',
    suggestedContractWeeks: [12, 24, 36],
    demands: [
      {
        id: 'cac-demand-gimmick',
        type: 'gimmick_carnage',
        title: 'High-Risk Gimmickry Mandate',
        description: 'Book at least one Hardcore, Steel Cage, TLC, Ladder, or Street Fight match per broadcast.',
        ratingBonus: 5,
        ratingPenalty: 4,
        satisfactionImpact: 4
      },
      {
        id: 'cac-demand-main-event',
        type: 'main_event_quality',
        title: 'Bloody War Main Event',
        description: 'Achieve at least 65 score in the Main Event through relentless feud payoff.',
        targetValue: 65,
        ratingBonus: 3,
        ratingPenalty: 3,
        satisfactionImpact: 2
      }
    ],
    flavorText: 'A rebellious late-night cable haven for uncensored violence, barbed wire spectacles, and blood feuds that mainstream networks fear.'
  },
  {
    id: 'neo-tokyo-sports',
    name: 'Neo-Tokyo Satellite Sports (NTS)',
    tier: 'Regional Sports Cable',
    logoColor: 'text-red-400',
    badgeClass: 'bg-red-950/80 text-red-400 border-red-800',
    baseWeeklyRightsFee: 115000,
    minPrestigeRequired: 62,
    minRatingTarget: 70,
    preferredSlot: 'Sunday Prime Puroresu (7:00 PM JST)',
    suggestedContractWeeks: [16, 24, 52],
    demands: [
      {
        id: 'nts-demand-workrate',
        type: 'main_event_quality',
        title: 'Strong-Style Workrate Purity',
        description: 'Main event match score must hit 78+ through decisive technical wrestling and athletic intensity.',
        targetValue: 78,
        ratingBonus: 4,
        ratingPenalty: 5,
        satisfactionImpact: 3
      },
      {
        id: 'nts-demand-tag',
        type: 'tag_team_focus',
        title: 'Traditional Tag Team Warfare',
        description: 'Feature at least one Tag Team bout to preserve tag division legacy.',
        ratingBonus: 3,
        ratingPenalty: 3,
        satisfactionImpact: 2
      }
    ],
    flavorText: 'Prestigious pan-Asian satellite sports network celebrating legitimate combat athleticism, physical storytelling, and honor.'
  },
  {
    id: 'united-syndication-alliance',
    name: 'United Syndication Alliance (USA-Sync)',
    tier: 'Regional Sports Cable',
    logoColor: 'text-amber-400',
    badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-800',
    baseWeeklyRightsFee: 48000,
    minPrestigeRequired: 30,
    minRatingTarget: 52,
    preferredSlot: 'Weekend Afternoon Syndication (1:00 PM)',
    suggestedContractWeeks: [12, 24, 36],
    demands: [
      {
        id: 'usa-demand-women',
        type: 'women_division',
        title: 'Women’s Division Spotlight',
        description: 'Book at least one match or angle featuring the female roster on every episode.',
        ratingBonus: 3,
        ratingPenalty: 2,
        satisfactionImpact: 2
      }
    ],
    flavorText: 'A massive confederation of 85 regional TV stations. Low rating barrier and steady weekly checks make it the perfect intermediate stepping stone.'
  },
  {
    id: 'metro-public-access',
    name: 'Metro Public Access TV',
    tier: 'Local / Public Access',
    logoColor: 'text-zinc-400',
    badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    baseWeeklyRightsFee: 18000,
    minPrestigeRequired: 10,
    minRatingTarget: 42,
    preferredSlot: 'Tuesday Late Night (11:30 PM)',
    suggestedContractWeeks: [12, 24],
    demands: [
      {
        id: 'metro-demand-youth',
        type: 'youth_movement',
        title: 'Local Rookie Showcase',
        description: 'Book at least 1 wrestler aged 28 or under on the show.',
        targetValue: 1,
        ratingBonus: 2,
        ratingPenalty: 2,
        satisfactionImpact: 2
      }
    ],
    flavorText: 'Local municipal cable channel with virtually no oversight. Tiny rights fees, but zero executive interference while building an indie brand.'
  }
];

export function getDefaultTelevisionDeal(promotion: Promotion): TelevisionNetworkDeal {
  if (promotion.tvDeal) {
    return promotion.tvDeal;
  }

  if (promotion.id === 'apw') {
    const offer = AVAILABLE_NETWORKS[0]; // Global Sports Net
    return {
      networkId: offer.id,
      networkName: offer.name,
      tier: offer.tier,
      broadcastSlot: offer.preferredSlot,
      weeklyRightsFee: 145000,
      contractWeeksTotal: 24,
      contractWeeksRemaining: 20,
      minRatingTarget: 68,
      penaltyPerRatingMiss: 3500,
      adRevenueTier: 'Standard Ad Load',
      networkDemands: offer.demands.map(d => ({ ...d })),
      demandsComplianceHistory: [
        {
          week: 1,
          demandsMet: 2,
          demandsTotal: 2,
          ratingDeltaApplied: 7,
          executiveNote: 'GSN executives were thrilled with the explosive main event ratings and strong demo share.'
        }
      ],
      negotiationStatus: 'Active'
    };
  }

  if (promotion.id === 'vu') {
    const offer = AVAILABLE_NETWORKS[3]; // Combat & Anarchy Channel
    return {
      networkId: offer.id,
      networkName: offer.name,
      tier: offer.tier,
      broadcastSlot: offer.preferredSlot,
      weeklyRightsFee: 62000,
      contractWeeksTotal: 24,
      contractWeeksRemaining: 18,
      minRatingTarget: 60,
      penaltyPerRatingMiss: 2000,
      adRevenueTier: 'Heavy Commercial Blitz',
      networkDemands: offer.demands.map(d => ({ ...d })),
      demandsComplianceHistory: [
        {
          week: 1,
          demandsMet: 2,
          demandsTotal: 2,
          ratingDeltaApplied: 8,
          executiveNote: 'CAC programmers praised the brutal cage bloodbath; cult late-night buzz is surging.'
        }
      ],
      negotiationStatus: 'Active'
    };
  }

  if (promotion.id === 'sspw') {
    const offer = AVAILABLE_NETWORKS[4]; // Neo-Tokyo Satellite Sports
    return {
      networkId: offer.id,
      networkName: offer.name,
      tier: offer.tier,
      broadcastSlot: offer.preferredSlot,
      weeklyRightsFee: 118000,
      contractWeeksTotal: 24,
      contractWeeksRemaining: 22,
      minRatingTarget: 70,
      penaltyPerRatingMiss: 3000,
      adRevenueTier: 'Low Commercial Load',
      networkDemands: offer.demands.map(d => ({ ...d })),
      demandsComplianceHistory: [
        {
          week: 1,
          demandsMet: 2,
          demandsTotal: 2,
          ratingDeltaApplied: 7,
          executiveNote: 'NTS executives commended the crisp technical wrestling and unblemished broadcast pacing.'
        }
      ],
      negotiationStatus: 'Active'
    };
  }

  // Generic fallback based on promotion prestige
  const matchedOffer = AVAILABLE_NETWORKS.find(n => promotion.prestige >= n.minPrestigeRequired) || AVAILABLE_NETWORKS[AVAILABLE_NETWORKS.length - 1];
  return {
    networkId: matchedOffer.id,
    networkName: matchedOffer.name,
    tier: matchedOffer.tier,
    broadcastSlot: matchedOffer.preferredSlot,
    weeklyRightsFee: matchedOffer.baseWeeklyRightsFee,
    contractWeeksTotal: 24,
    contractWeeksRemaining: 24,
    minRatingTarget: matchedOffer.minRatingTarget,
    penaltyPerRatingMiss: 2500,
    adRevenueTier: 'Standard Ad Load',
    networkDemands: matchedOffer.demands.map(d => ({ ...d })),
    demandsComplianceHistory: [],
    negotiationStatus: 'Active'
  };
}

export interface NegotiationResult {
  status: 'accepted' | 'counter' | 'rejected';
  rightsFeeAgreed: number;
  minRatingAgreed: number;
  contractWeeksAgreed: number;
  feedback: string;
}

export function evaluateContractNegotiation(
  network: AvailableNetworkOffer,
  proposedRightsFee: number,
  proposedWeeks: number,
  proposedRatingTarget: number,
  promotion: Promotion,
  recentAverageRating: number
): NegotiationResult {
  const prestigeGap = promotion.prestige - network.minPrestigeRequired;

  // If promotion does not have enough prestige for this tier
  if (prestigeGap < -5) {
    return {
      status: 'rejected',
      rightsFeeAgreed: 0,
      minRatingAgreed: 0,
      contractWeeksAgreed: 0,
      feedback: `The network vice presidents politely declined the meeting. ${network.name} requires a minimum company prestige of ${network.minPrestigeRequired}/100 (your current prestige is ${promotion.prestige}/100). Build up your regional reputation before pitching this broadcaster.`
    };
  }

  // Calculate fee ratio
  const feeRatio = proposedRightsFee / network.baseWeeklyRightsFee;
  const ratingCommitmentScore = proposedRatingTarget - network.minRatingTarget;
  const performanceTrackRecord = recentAverageRating - network.minRatingTarget;

  // Check acceptance thresholds
  let acceptanceScore = 50;
  acceptanceScore += prestigeGap * 1.5;
  acceptanceScore += ratingCommitmentScore * 3;
  acceptanceScore += performanceTrackRecord * 2;
  acceptanceScore -= (feeRatio - 1.0) * 80;

  if (proposedWeeks >= 36) {
    acceptanceScore -= 5; // networks are more cautious on long-term commitments
  }

  if (acceptanceScore >= 60) {
    return {
      status: 'accepted',
      rightsFeeAgreed: proposedRightsFee,
      minRatingAgreed: proposedRatingTarget,
      contractWeeksAgreed: proposedWeeks,
      feedback: `EXECUTIVE HANDSHAKE: The boardroom accepted your proposal in full! ${network.name} executives are thrilled to lock in a ${proposedWeeks}-week broadcast deal at $${proposedRightsFee.toLocaleString()}/week with a ${proposedRatingTarget} rating threshold.`
    };
  }

  if (acceptanceScore >= 30) {
    // Counter offer
    const counterFee = Math.round(Math.min(proposedRightsFee, network.baseWeeklyRightsFee * (1 + Math.max(-0.2, prestigeGap * 0.01))) / 1000) * 1000;
    const counterTarget = Math.max(network.minRatingTarget, proposedRatingTarget);
    return {
      status: 'counter',
      rightsFeeAgreed: counterFee,
      minRatingAgreed: counterTarget,
      contractWeeksAgreed: Math.min(24, proposedWeeks),
      feedback: `COUNTER-OFFER: Network suits find your initial ask too steep, but value your broadcast upside. They have countered with $${counterFee.toLocaleString()}/week for ${Math.min(24, proposedWeeks)} weeks, holding you strictly to a ${counterTarget} rating benchmark.`
    };
  }

  return {
    status: 'rejected',
    rightsFeeAgreed: 0,
    minRatingAgreed: 0,
    contractWeeksAgreed: 0,
    feedback: `PROPOSAL REJECTED: Network brass walked away from the bargaining table. Your demanded fee of $${proposedRightsFee.toLocaleString()}/week is too disconnected from current market realities given your ratings track record (${recentAverageRating.toFixed(1)} vs ${network.minRatingTarget} target).`
  };
}

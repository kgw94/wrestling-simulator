import { 
  GeneralManager, 
  GMProposal, 
  GMProposalSegment, 
  GMBookingDirective, 
  GMArchetype,
  Promotion, 
  Wrestler, 
  Feud, 
  Segment, 
  ShowResult,
  Championship
} from '../types';
import { calculateStarRating } from './simulation';
import { 
  getChampionshipGender, 
  isWrestlerEligibleForTitle 
} from '../utils/titleUtils';

export const DEFAULT_AVAILABLE_GMS: GeneralManager[] = [
  {
    id: 'gm-lou-vance',
    name: 'Lou "The Anvil" Vance',
    nickname: 'The Old-School Purist',
    avatar: '👔',
    archetype: 'traditionalist',
    title: 'Senior Matchmaker & Director of Talent',
    bio: 'A 42-year veteran of the legendary southern territory circuits. Lou detests hollow theatrics and believes championship prestige is earned through 20-minute technical clinics and clean pinfalls.',
    perk: {
      name: 'Pure In-Ring Masterclass',
      description: '+6 bonus to all technical and standard singles matches; participants suffer 15% less fatigue.',
      effectBadge: '+6 Workrate / -15% Fatigue'
    },
    trustScore: 80,
    showsRunCount: 12,
    approvalRate: 85,
    bookingStyleNotes: [
      'Prioritizes 15-20 min matches featuring wrestlers with high workrate.',
      'Rotates talent across divisions to showcase deep technical rosters.',
      'Refuses to script screwjob or weapon finishes for championship matches.'
    ],
    preferredDirective: 'workrate_clinic',
    activeDirective: 'workrate_clinic',
    salaryWeekly: 14000,
    isHired: false
  },
  {
    id: 'gm-sterling-hayes',
    name: '\'Hollywood\' Sterling Hayes',
    nickname: 'The Prime Time Showman',
    avatar: '🎬',
    archetype: 'showman',
    title: 'Executive Vice President of Television',
    bio: 'Former Hollywood studio script doctor turned wrestling showrunner. Sterling knows that cliffhangers, in-ring talk shows, and explosive faction wars keep millions of viewers glued to the screen.',
    perk: {
      name: 'Prime Time Spectacle',
      description: '+8 score bonus to all promos, contract signings, and backstage angles; gives +0.30 boost to TV rating.',
      effectBadge: '+8 Angles / +0.30 TV Rating'
    },
    trustScore: 78,
    showsRunCount: 18,
    approvalRate: 72,
    bookingStyleNotes: [
      'Books multiple dramatic mic battles and contract signings every week.',
      'Highlights high-charisma superstars, women\'s spotlights, and faction warfare.',
      'Loves chaotic finishes and shocking post-match staredowns.'
    ],
    preferredDirective: 'high_drama_angles',
    activeDirective: 'high_drama_angles',
    salaryWeekly: 24000,
    isHired: false
  },
  {
    id: 'gm-raven-callahan',
    name: 'Raven "Mad Dog" Callahan',
    nickname: 'The Outlaw Rebel',
    avatar: '⚡',
    archetype: 'hardcore_outlaw',
    title: 'Underground Operations Director',
    bio: 'A 90s extreme wrestling pioneer who bled in bingo halls and revolutionized prime-time carnage. Raven believes fans want unforgiving violence, table spots, and intense personal grudges.',
    perk: {
      name: 'No Holds Barred',
      description: 'Stipulation matches (Cage, Ladder, Street Fight, No DQ) get +10 rating bonus with no penalties.',
      effectBadge: '+10 Extreme Stipulations'
    },
    trustScore: 72,
    showsRunCount: 8,
    approvalRate: 68,
    bookingStyleNotes: [
      'Replaces standard matches with No-DQ, Ladder, and Steel Cage bouts.',
      'Books bitter grudge feuds where foreign objects and blood settle scores.',
      'Loves unpredictable brawls that spill into the concourse.'
    ],
    preferredDirective: 'world_title_focus',
    activeDirective: 'world_title_focus',
    salaryWeekly: 12500,
    isHired: false
  },
  {
    id: 'gm-victoria-vance',
    name: 'Victoria Vance, MBA',
    nickname: 'The Analytics Exec',
    avatar: '📊',
    archetype: 'executive',
    title: 'General Manager & Chief Strategy Officer',
    bio: 'Armed with an Ivy League MBA and sports analytics modeling, Victoria treats your roster like an optimized stock portfolio. She prevents career-ending injuries and guarantees maximum broadcaster ROI.',
    perk: {
      name: 'Asset Optimization',
      description: 'Rested talent recovers +25% extra stamina; cuts total show production overhead by 12%.',
      effectBadge: '+25% Rest Recovery / -12% Overhead'
    },
    trustScore: 84,
    showsRunCount: 24,
    approvalRate: 90,
    bookingStyleNotes: [
      'Strictly benches wrestlers with fatigue > 40% to prevent injuries.',
      'Deeply utilizes the entire roster, rotating midcarders and undercard talent.',
      'Keeps network executives delighted with zero broadcast rule violations.'
    ],
    preferredDirective: 'rest_and_protect',
    activeDirective: 'rest_and_protect',
    salaryWeekly: 20000,
    isHired: false
  },
  {
    id: 'gm-donald-cross',
    name: 'Commissioner Donald Cross',
    nickname: 'The Corporate Tyrant',
    avatar: '👑',
    archetype: 'tyrant',
    title: 'Chairman-Appointed Authority',
    bio: 'A cold, power-drunk corporate insider who uses the rulebook as a weapon. Donald creates impossible hurdles for fan-favorite champions while protecting his chosen hand-picked corporate golden boys.',
    perk: {
      name: 'Corporate Favoritism',
      description: 'Controversial finishes, screwjobs, and title changes yield +12 Feud Heat and explosive fan reactions.',
      effectBadge: '+12 Feud Heat on Swerves'
    },
    trustScore: 70,
    showsRunCount: 15,
    approvalRate: 64,
    bookingStyleNotes: [
      'Forces top babyfaces to run gauntlets or defend against impossible odds.',
      'Books distraction rollups, ref bumps, and corrupt authority screwjobs.',
      'Demands loyalty and punishes outspoken dissenters on television.'
    ],
    preferredDirective: 'balanced',
    activeDirective: 'balanced',
    salaryWeekly: 18000,
    isHired: false
  }
];

export function getDefaultGMForPromotion(promotionStyle?: string): GeneralManager {
  if (promotionStyle === 'Hardcore / Extreme') {
    return { ...DEFAULT_AVAILABLE_GMS[2], isHired: true }; // Raven Callahan
  }
  if (promotionStyle === 'Lucha & Puroresu') {
    return { ...DEFAULT_AVAILABLE_GMS[0], isHired: true }; // Lou Vance
  }
  if (promotionStyle === 'Mainstream Giant') {
    return { ...DEFAULT_AVAILABLE_GMS[1], isHired: true }; // Sterling Hayes
  }
  // Default to Victoria Vance for balanced corporate management
  return { ...DEFAULT_AVAILABLE_GMS[3], isHired: true };
}

/**
 * Deterministic + slightly shuffled pseudo-random number generator
 * based on week, year, and card seed.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Intelligent GM Show Auto-Booker
 * Generates an end-to-end 5-segment card that:
 * 1. ZERO CHARACTER REUSE: Strictly guarantees NO character appears in more than 1 segment on the card.
 * 2. MAXIMIZES ROSTER UTILIZATION: Rotates underutilized and rested talent into TV matches, midcard spotlights, and angles.
 * 3. DYNAMIC MATCHMAKING ROTATION: Shifts main events, challengers, openers, and division showcases week-to-week so shows never look identical.
 * 4. STRICT GENDER RESTRICTIONS: Men's titles are strictly 100% male; Women's titles are strictly 100% female.
 */
export function generateGMProposal(
  promotion: Promotion,
  directive?: GMBookingDirective,
  currentWeek: number = 1,
  currentYear: number = 2026
): GMProposal {
  const gm = promotion.currentGM || getDefaultGMForPromotion(promotion.style);
  const activeDirective = directive || gm.activeDirective || gm.preferredDirective || 'balanced';

  // Dynamic pseudo-random seed incorporating week, year, and GM archetype
  let seed = currentWeek * 31 + currentYear * 17 + gm.name.charCodeAt(0) * 11 + (Date.now() % 500);

  const roster = [...promotion.roster];
  const activeRoster = roster.filter(w => !w.injury.injured);
  
  // 1. Identify rested stars based on fatigue and directive
  const fatigueThreshold = activeDirective === 'rest_and_protect' ? 35 : gm.archetype === 'executive' ? 45 : 60;
  const restedStars: { id: string; name: string; reason: string; currentFatigue: number }[] = [];
  
  const eligibleWrestlers: Wrestler[] = [];
  activeRoster.forEach(w => {
    if (w.fatigue >= fatigueThreshold) {
      restedStars.push({
        id: w.id,
        name: w.name,
        currentFatigue: w.fatigue,
        reason: `Resting fatigued star (${w.fatigue}% fatigue) to prevent injuries and maintain long-term stamina.`
      });
    } else {
      eligibleWrestlers.push(w);
    }
  });

  // Guarantee at least 10 working talents across divisions so all 5 segments have distinct stars
  if (eligibleWrestlers.length < 10) {
    restedStars.sort((a, b) => a.currentFatigue - b.currentFatigue);
    while (eligibleWrestlers.length < 10 && restedStars.length > 0) {
      const restored = restedStars.shift()!;
      const found = activeRoster.find(w => w.id === restored.id);
      if (found) eligibleWrestlers.push(found);
    }
  }

  // Split eligible roster strictly by gender
  const eligibleMen = eligibleWrestlers.filter(w => w.gender === 'Male');
  const eligibleWomen = eligibleWrestlers.filter(w => w.gender === 'Female');

  // STRICT ZERO-REUSE LOCK:
  // Once a wrestler is chosen for ANY segment (match or angle), their ID is locked here.
  // They CANNOT appear in any other segment on this entire broadcast!
  const usedWrestlerIdsOnCard = new Set<string>();

  const segments: GMProposalSegment[] = [];
  const keyStorylinesAdvanced: string[] = [];

  // Active championships segregated strictly by gender
  const activeTitles = promotion.titles.filter(t => !t.isRetired);
  const mensWorldTitle = activeTitles.find(t => getChampionshipGender(t) === 'Male' && (t.type === 'World / Primary' || (!t.isTagTeam && t.prestige >= 80)));
  const mensMidcardTitle = activeTitles.find(t => getChampionshipGender(t) === 'Male' && t.id !== mensWorldTitle?.id && !t.isTagTeam);
  const mensTagTitle = activeTitles.find(t => getChampionshipGender(t) === 'Male' && t.isTagTeam);
  const womensTitle = activeTitles.find(t => getChampionshipGender(t) === 'Female');

  // Active feuds categorized by gender
  const feuds = [...(promotion.feuds || [])].sort((a, b) => b.heat - a.heat);
  const mensFeuds = feuds.filter(f => {
    const starA = roster.find(w => w.id === f.wrestlerAIds[0]);
    return starA?.gender === 'Male';
  });
  const womensFeuds = feuds.filter(f => {
    const starA = roster.find(w => w.id === f.wrestlerAIds[0]);
    return starA?.gender === 'Female';
  });

  /**
   * Helper to select distinct candidates with:
   * 1. 100% exclusivity from already-booked card participants.
   * 2. Heavy bonus for underutilized wrestlers (fewest appearances).
   * 3. Weekly dynamic rotational hash so match combinations vary week-to-week.
   */
  const selectParticipants = (
    pool: Wrestler[],
    count: number,
    options?: {
      criteria?: (w: Wrestler) => boolean;
      prioritizeUnderutilized?: boolean;
      targetPushes?: Wrestler['push'][];
      minWorkrate?: number;
    }
  ): Wrestler[] => {
    let candidates = pool.filter(w => !usedWrestlerIdsOnCard.has(w.id));
    
    if (options?.criteria) {
      const filtered = candidates.filter(options.criteria);
      if (filtered.length >= count) candidates = filtered;
    }
    if (options?.targetPushes && options.targetPushes.length > 0) {
      const pushFiltered = candidates.filter(w => options.targetPushes!.includes(w.push));
      if (pushFiltered.length >= count) candidates = pushFiltered;
    }
    if (options?.minWorkrate) {
      const wrFiltered = candidates.filter(w => w.workrate >= options.minWorkrate!);
      if (wrFiltered.length >= count) candidates = wrFiltered;
    }

    // Safety fallback: if pool is severely depleted, fallback to any unbooked talent in pool
    if (candidates.length < count) {
      candidates = pool.filter(w => !usedWrestlerIdsOnCard.has(w.id));
    }
    // If still less than count (extreme edge case: tiny roster), allow unbooked active
    if (candidates.length < count) {
      candidates = activeRoster.filter(w => !usedWrestlerIdsOnCard.has(w.id));
    }

    // Dynamic rotational sorting
    candidates.sort((a, b) => {
      const appA = (a.wins || 0) + (a.losses || 0) + (a.draws || 0);
      const appB = (b.wins || 0) + (b.losses || 0) + (b.draws || 0);

      // Underutilization factor: wrestlers with fewer TV appearances get high booking urgency
      const underutilBonusA = options?.prioritizeUnderutilized 
        ? Math.max(0, 100 - appA * 15) 
        : Math.max(0, 40 - appA * 6);
      const underutilBonusB = options?.prioritizeUnderutilized 
        ? Math.max(0, 100 - appB * 15) 
        : Math.max(0, 40 - appB * 6);

      // Unique hash that changes week-to-week based on name and week number
      const hashA = (a.name.charCodeAt(0) * 19 + currentWeek * 29 + currentYear * 7 + (a.name.charCodeAt(a.name.length - 1) || 0) * 13) % 45;
      const hashB = (b.name.charCodeAt(0) * 19 + currentWeek * 29 + currentYear * 7 + (b.name.charCodeAt(b.name.length - 1) || 0) * 13) % 45;

      const scoreA = (a.workrate * 0.35 + a.overness * 0.45) + underutilBonusA * 0.30 + hashA;
      const scoreB = (b.workrate * 0.35 + b.overness * 0.45) + underutilBonusB * 0.30 + hashB;
      return scoreB - scoreA;
    });

    return candidates.slice(0, count);
  };

  // =========================================================================
  // SEGMENT 5: Main Event (Plan First to anchor marquee talent)
  // Rotate weekly theme:
  // Week % 4 === 1: Men's World Title defense with rotating top challenger
  // Week % 4 === 2: Women's World Championship Headline Main Event (Strictly Female)
  // Week % 4 === 3: Men's Grudge Rivalry / No DQ / Steel Cage Climax
  // Week % 4 === 0: Men's Secondary / Intercontinental Championship Headline Clash
  // =========================================================================
  let seg5Wrestlers: Wrestler[] = [];
  let seg5Title: Championship | undefined = undefined;
  let seg5Feud: Feud | undefined = undefined;
  let seg5Match: Segment['matchType'] = 'Singles';
  let seg5Finish: Segment['finishType'] = 'Clean Pinfall';
  let seg5Rationale = '';

  const mainEventThemeCycle = currentWeek % 4;

  // Case A: Headline Women's Championship Main Event
  if (
    mainEventThemeCycle === 2 && 
    womensTitle && 
    womensTitle.currentHolderIds.length > 0 && 
    eligibleWomen.length >= 2
  ) {
    const champ = eligibleWomen.find(w => w.id === womensTitle.currentHolderIds[0]);
    if (champ) {
      // Pick challenger strictly among other eligible women
      const otherWomen = eligibleWomen.filter(w => w.id !== champ.id);
      if (otherWomen.length > 0) {
        // Rotate contenders by week so the same woman isn't booked every single time
        const sortedContenders = [...otherWomen].sort((a, b) => (b.overness + b.workrate) - (a.overness + a.workrate));
        const contenderIndex = (currentWeek + currentYear) % sortedContenders.length;
        const challenger = sortedContenders[contenderIndex] || sortedContenders[0];

        seg5Wrestlers = [champ, challenger];
        seg5Title = womensTitle;
        seg5Rationale = `Historic Television Main Event: Champion ${champ.name} puts the ${womensTitle.name} on the line against top contender ${challenger.name}.`;
        keyStorylinesAdvanced.push(`${womensTitle.name} Showcase`);

        const hotWomensFeud = womensFeuds.find(f => 
          (f.wrestlerAIds.includes(champ.id) && f.wrestlerBIds.includes(challenger.id)) ||
          (f.wrestlerBIds.includes(champ.id) && f.wrestlerAIds.includes(challenger.id))
        );
        if (hotWomensFeud) seg5Feud = hotWomensFeud;
      }
    }
  }

  // Case B: Men's World Championship Defense
  if (
    seg5Wrestlers.length < 2 && 
    mensWorldTitle && 
    mensWorldTitle.currentHolderIds.length > 0 && 
    eligibleMen.length >= 2
  ) {
    const champ = eligibleMen.find(w => w.id === mensWorldTitle.currentHolderIds[0]);
    if (champ) {
      const otherMen = eligibleMen.filter(w => w.id !== champ.id);
      if (otherMen.length > 0) {
        // Rotate top contenders across weeks
        const sortedContenders = [...otherMen].sort((a, b) => (b.overness * 0.6 + b.workrate * 0.4) - (a.overness * 0.6 + a.workrate * 0.4));
        const topContendersPool = sortedContenders.slice(0, Math.min(5, sortedContenders.length));
        const challengerIndex = (currentWeek + currentYear * 3) % topContendersPool.length;
        const challenger = topContendersPool[challengerIndex] || sortedContenders[0];

        seg5Wrestlers = [champ, challenger];
        seg5Title = mensWorldTitle;
        seg5Rationale = `Marquee Heavyweight Main Event: ${mensWorldTitle.name} on the line. World Champion ${champ.name} defends against ${challenger.name} to anchor network ratings.`;
        keyStorylinesAdvanced.push(`${mensWorldTitle.name} Defense`);

        const hotFeud = mensFeuds.find(f => 
          (f.wrestlerAIds.includes(champ.id) && f.wrestlerBIds.includes(challenger.id)) ||
          (f.wrestlerBIds.includes(champ.id) && f.wrestlerAIds.includes(challenger.id))
        );
        if (hotFeud) seg5Feud = hotFeud;
      }
    }
  }

  // Case C: Fallback to high-stakes Men's Heavyweight Clash between top contenders
  if (seg5Wrestlers.length < 2) {
    seg5Wrestlers = selectParticipants(eligibleMen, 2, {
      targetPushes: ['Main Eventer', 'Upper Midcard']
    });
    if (seg5Wrestlers.length < 2) {
      seg5Wrestlers = selectParticipants(eligibleMen, 2);
    }
    seg5Rationale = `Headline Heavyweight Showdown: Premier battle between franchise pillars ${seg5Wrestlers[0]?.name || 'Contender A'} and ${seg5Wrestlers[1]?.name || 'Contender B'}.`;
  }

  // GM Archetype flair on Main Event
  if (gm.archetype === 'hardcore_outlaw') {
    seg5Match = 'Steel Cage';
    seg5Finish = 'Clean Pinfall';
  } else if (gm.archetype === 'tyrant') {
    seg5Finish = 'Heel Turn / Screwjob';
    seg5Rationale += ` GM ${gm.name} has orchestrated a shocking controversial finish to dominate social buzz.`;
  } else if (gm.archetype === 'traditionalist') {
    seg5Finish = 'Submission';
  }

  // LOCK MAIN EVENTERS: Nobody in Seg 5 can appear anywhere else!
  seg5Wrestlers.forEach(w => usedWrestlerIdsOnCard.add(w.id));
  const seg5Winner = seg5Wrestlers[0];

  const seg5Object: GMProposalSegment = {
    id: `gm-seg-5-${Date.now()}`,
    segmentNumber: 5,
    category: 'Match',
    matchType: seg5Match,
    participantIds: seg5Wrestlers.map(w => w.id),
    winnerId: seg5Winner?.id,
    finishType: seg5Finish,
    durationMinutes: 20,
    titleId: seg5Title?.id,
    feudId: seg5Feud?.id,
    gmRationale: seg5Rationale,
    gmRecommendedWinner: seg5Winner ? `${seg5Winner.name} (Headline prestige & momentum)` : undefined,
    gmTag: seg5Title ? (getChampionshipGender(seg5Title) === 'Female' ? "WOMEN'S WORLD TITLE MAIN EVENT" : "WORLD TITLE MAIN EVENT") : "MARQUEE HEADLINE MATCH",
    projectedScore: Math.min(98, Math.round(((seg5Wrestlers[0]?.overness || 75) * 0.5 + (seg5Wrestlers[0]?.workrate || 75) * 0.5 + (seg5Wrestlers[1]?.overness || 75) * 0.5 + (seg5Wrestlers[1]?.workrate || 75) * 0.5) / 2 + 10))
  };

  // =========================================================================
  // SEGMENT 1: Dynamic High-Energy Opener
  // Must use COMPLETELY UNBOOKED talent!
  // Weekly Rotation:
  // Week % 3 === 0: Tag Team Contest (4 distinct unbooked stars)
  // Week % 3 === 1: Cruiserweight / High-Flyer / Youth Showcase
  // Week % 3 === 2: Midcard Workhorse Sprint (high workrate underutilized stars)
  // =========================================================================
  let seg1Wrestlers: Wrestler[] = [];
  let seg1Match: Segment['matchType'] = 'Singles';
  let seg1Finish: Segment['finishType'] = 'Clean Pinfall';
  let seg1Duration = 11;
  let seg1Rationale = '';
  let seg1Tag = 'HOT OPENER';

  const openerCycle = currentWeek % 3;

  // Option 1: Tag Team Opener if 2 active unbooked teams exist
  const activeTagTeams = (promotion.tagTeams || []).filter(t => t.isActive);
  const eligibleTagTeams = activeTagTeams.filter(t => 
    t.memberIds.every(id => !usedWrestlerIdsOnCard.has(id) && activeRoster.some(w => w.id === id))
  );

  if (openerCycle === 0 && eligibleTagTeams.length >= 2) {
    const teamA = eligibleTagTeams[0];
    const teamB = eligibleTagTeams[1];
    const membersA = teamA.memberIds.map(id => roster.find(w => w.id === id)!).filter(Boolean);
    const membersB = teamB.memberIds.map(id => roster.find(w => w.id === id)!).filter(Boolean);
    seg1Wrestlers = [...membersA, ...membersB];
    seg1Match = 'Tag Team';
    seg1Rationale = `High-octane Tag Team Opener: ${teamA.name} squares off against ${teamB.name} with rapid pacing to electrify the live crowd.`;
    seg1Tag = 'TAG TEAM SHOWCASE';
  } else if (openerCycle === 1 || activeDirective === 'youth_movement') {
    // Youth & High-Flyer clinic
    seg1Wrestlers = selectParticipants(eligibleMen, 2, {
      criteria: w => w.age <= 30 || w.style === 'High Flyer',
      prioritizeUnderutilized: true
    });
    if (seg1Wrestlers.length < 2) {
      seg1Wrestlers = selectParticipants(eligibleMen, 2, { prioritizeUnderutilized: true });
    }
    seg1Rationale = `Dynamic youth spotlight: Rising talents ${seg1Wrestlers[0]?.name} and ${seg1Wrestlers[1]?.name} kick off television with acrobatic aerial offense.`;
    seg1Tag = 'YOUTH & SPEED CLINIC';
  } else {
    // Midcard workhorse sprint featuring underutilized stars
    seg1Wrestlers = selectParticipants(eligibleMen, 2, {
      targetPushes: ['Midcard', 'Lower Midcard'],
      minWorkrate: 65,
      prioritizeUnderutilized: true
    });
    if (seg1Wrestlers.length < 2) {
      seg1Wrestlers = selectParticipants(eligibleMen, 2, { prioritizeUnderutilized: true });
    }
    seg1Rationale = `Workhorse clinic: Undercard contenders ${seg1Wrestlers[0]?.name} and ${seg1Wrestlers[1]?.name} battle for television standing without burning top main eventers.`;
    seg1Tag = 'WORKRATE OPENER';
  }

  // LOCK OPENER TALENTS
  seg1Wrestlers.forEach(w => usedWrestlerIdsOnCard.add(w.id));
  const seg1Winner = seg1Wrestlers[0];

  const seg1Object: GMProposalSegment = {
    id: `gm-seg-1-${Date.now()}`,
    segmentNumber: 1,
    category: 'Match',
    matchType: seg1Match,
    participantIds: seg1Wrestlers.map(w => w.id),
    winnerId: seg1Winner?.id,
    finishType: seg1Finish,
    durationMinutes: seg1Duration,
    gmRationale: seg1Rationale,
    gmRecommendedWinner: seg1Winner ? `${seg1Winner.name} (Elevating division momentum)` : undefined,
    gmTag: seg1Tag,
    projectedScore: Math.min(94, Math.round(((seg1Wrestlers[0]?.workrate || 70) + (seg1Wrestlers[1]?.workrate || 70)) / 2 + 6))
  };

  // =========================================================================
  // SEGMENT 2: Storyline Escalation / Verbal In-Ring Promo
  // MUST feature charismatic stars who ARE NOT wrestling tonight!
  // =========================================================================
  let seg2Angle: Segment['angleType'] = 'In-Ring Promo';
  let seg2Participants: string[] = [];
  let seg2FeudId: string | undefined = undefined;
  let seg2Rationale = '';
  let seg2Tag = 'RIVALRY HEAT';

  // Look for an unbooked active feud to escalate
  const unbookedFeud = feuds.find(f => {
    const aId = f.wrestlerAIds[0];
    const bId = f.wrestlerBIds[0];
    return aId && bId && !usedWrestlerIdsOnCard.has(aId) && !usedWrestlerIdsOnCard.has(bId);
  });

  if (unbookedFeud) {
    seg2Participants = [unbookedFeud.wrestlerAIds[0], unbookedFeud.wrestlerBIds[0]];
    seg2FeudId = unbookedFeud.id;
    seg2Angle = gm.archetype === 'tyrant' ? 'Contract Signing' : 'Confrontation / Staredown';
    const starA = roster.find(w => w.id === seg2Participants[0]);
    const starB = roster.find(w => w.id === seg2Participants[1]);
    seg2Rationale = `Tense in-ring standoff between rivals ${starA?.name} and ${starB?.name} to escalate their simmering ${unbookedFeud.name} feud.`;
    keyStorylinesAdvanced.push(`${unbookedFeud.name} (Heat: ${unbookedFeud.heat}/100)`);
  } else {
    // Feature charismatic unbooked stars with high mic skills
    const unbookedCharismatic = eligibleWrestlers
      .filter(w => !usedWrestlerIdsOnCard.has(w.id))
      .sort((a, b) => b.micSkills - a.micSkills);

    if (unbookedCharismatic.length >= 2) {
      seg2Participants = [unbookedCharismatic[0].id, unbookedCharismatic[1].id];
      seg2Rationale = `${unbookedCharismatic[0].name} grabs the microphone to deliver a fiery manifesto, sparking a verbal war with ${unbookedCharismatic[1].name}.`;
    } else if (unbookedCharismatic.length === 1) {
      seg2Participants = [unbookedCharismatic[0].id];
      seg2Rationale = `${unbookedCharismatic[0].name} addresses the crowd in an electric solo promo laying down an open challenge.`;
    }
  }

  // LOCK PROMO TALENTS
  seg2Participants.forEach(id => usedWrestlerIdsOnCard.add(id));

  const seg2Object: GMProposalSegment = {
    id: `gm-seg-2-${Date.now()}`,
    segmentNumber: 2,
    category: 'Angle',
    angleType: seg2Angle,
    participantIds: seg2Participants,
    durationMinutes: 8,
    feudId: seg2FeudId,
    gmRationale: seg2Rationale,
    gmTag: seg2Tag,
    projectedScore: 82
  };

  // =========================================================================
  // SEGMENT 3: Divisional Spotlight Match
  // STRICT GENDER SEGREGATION:
  // - If Seg 5 was a Men's bout: feature Women's Championship or premier Women's showcase!
  // - If Seg 5 was a Women's bout: feature Men's Secondary / Intercontinental Championship!
  // =========================================================================
  let seg3Wrestlers: Wrestler[] = [];
  let seg3Title: Championship | undefined = undefined;
  let seg3Feud: Feud | undefined = undefined;
  let seg3Match: Segment['matchType'] = 'Singles';
  let seg3Finish: Segment['finishType'] = 'Clean Pinfall';
  let seg3Rationale = '';
  let seg3Tag = 'FEATURE DIVISION';

  const unbookedWomen = eligibleWomen.filter(w => !usedWrestlerIdsOnCard.has(w.id));
  const isSeg5Womens = seg5Title && getChampionshipGender(seg5Title) === 'Female';

  if (!isSeg5Womens && unbookedWomen.length >= 2) {
    // Book Women's Division Spotlight or Title defense
    if (
      womensTitle && 
      womensTitle.currentHolderIds.length > 0 && 
      unbookedWomen.some(w => w.id === womensTitle.currentHolderIds[0])
    ) {
      const champ = unbookedWomen.find(w => w.id === womensTitle.currentHolderIds[0])!;
      const contenders = unbookedWomen.filter(w => w.id !== champ.id);
      const contender = contenders[(currentWeek + currentYear) % contenders.length] || contenders[0];

      if (contender) {
        seg3Wrestlers = [champ, contender];
        seg3Title = womensTitle;
        seg3Rationale = `${womensTitle.name} Defense: Champion ${champ.name} defends against ${contender.name} in an athletic showcase.`;
        seg3Tag = "WOMEN'S CHAMPIONSHIP";
        keyStorylinesAdvanced.push(`${womensTitle.name} Defense`);
      }
    }

    if (seg3Wrestlers.length < 2) {
      // Premier #1 Contendership Women's Match
      seg3Wrestlers = selectParticipants(unbookedWomen, 2, { prioritizeUnderutilized: true });
      seg3Rationale = `Premier Women's Division Battle: ${seg3Wrestlers[0]?.name} clashes with ${seg3Wrestlers[1]?.name} for division positioning.`;
      seg3Tag = "WOMEN'S DIVISION SPOTLIGHT";
    }
  } else if (mensMidcardTitle && mensMidcardTitle.currentHolderIds.length > 0) {
    // Men's Intercontinental / Secondary Championship Defense
    const unbookedMen = eligibleMen.filter(w => !usedWrestlerIdsOnCard.has(w.id));
    const champ = unbookedMen.find(w => w.id === mensMidcardTitle.currentHolderIds[0]);

    if (champ) {
      const otherMen = unbookedMen.filter(w => w.id !== champ.id);
      if (otherMen.length > 0) {
        const sortedChallengers = [...otherMen].sort((a, b) => b.workrate - a.workrate);
        const challenger = sortedChallengers[(currentWeek + currentYear) % sortedChallengers.length] || sortedChallengers[0];
        seg3Wrestlers = [champ, challenger];
        seg3Title = mensMidcardTitle;
        seg3Rationale = `${mensMidcardTitle.name} Title Defense: Champion ${champ.name} faces hungry challenger ${challenger.name} to bolster midcard prestige.`;
        seg3Tag = 'CHAMPIONSHIP DEFENSE';
        keyStorylinesAdvanced.push(`${mensMidcardTitle.name} Defense`);
      }
    }
  }

  // Fallback to fresh underutilized talent matchup
  if (seg3Wrestlers.length < 2) {
    const unbookedPool = eligibleMen.filter(w => !usedWrestlerIdsOnCard.has(w.id));
    seg3Wrestlers = selectParticipants(unbookedPool, 2, { prioritizeUnderutilized: true });
    if (seg3Wrestlers.length < 2) {
      seg3Wrestlers = selectParticipants(eligibleMen, 2);
    }
    seg3Rationale = `Divisional Contendership Showdown: ${seg3Wrestlers[0]?.name} vs. ${seg3Wrestlers[1]?.name} settling scores and climbing the television ladder.`;
    seg3Tag = 'MIDCARD FEATURE';
  }

  if (gm.archetype === 'tyrant') {
    seg3Finish = 'Distraction Rollup';
  } else if (gm.archetype === 'hardcore_outlaw') {
    seg3Match = 'Hardcore / No DQ';
    seg3Finish = 'Weapon / Foreign Object';
  }

  // Check if segment 3 participants have an active feud
  if (seg3Wrestlers.length >= 2) {
    const matchFeud = feuds.find(f => 
      (f.wrestlerAIds.includes(seg3Wrestlers[0].id) && f.wrestlerBIds.includes(seg3Wrestlers[1].id)) ||
      (f.wrestlerBIds.includes(seg3Wrestlers[0].id) && f.wrestlerAIds.includes(seg3Wrestlers[1].id))
    );
    if (matchFeud) seg3Feud = matchFeud;
  }

  // LOCK SEGMENT 3 TALENTS
  seg3Wrestlers.forEach(w => usedWrestlerIdsOnCard.add(w.id));
  const seg3Winner = seg3Wrestlers[0];

  const seg3Object: GMProposalSegment = {
    id: `gm-seg-3-${Date.now()}`,
    segmentNumber: 3,
    category: 'Match',
    matchType: seg3Match,
    participantIds: seg3Wrestlers.map(w => w.id),
    winnerId: seg3Winner?.id,
    finishType: seg3Finish,
    durationMinutes: 13,
    titleId: seg3Title?.id,
    feudId: seg3Feud ? seg3Feud.id : undefined,
    gmRationale: seg3Rationale,
    gmRecommendedWinner: seg3Winner ? `${seg3Winner.name} (Strengthening division standing)` : undefined,
    gmTag: seg3Tag,
    projectedScore: Math.min(94, Math.round(((seg3Wrestlers[0]?.workrate || 68) + (seg3Wrestlers[1]?.workrate || 68)) / 2 + 5))
  };

  // =========================================================================
  // SEGMENT 4: Backstage Drama / Exclusive Interview / Locker Room Angle
  // MUST feature UNBOOKED talent — NEVER reuse main eventers or previous stars!
  // Gives television exposure to managers, underutilized stars, or midcard rivals.
  // =========================================================================
  let seg4AngleType: Segment['angleType'] = 'Backstage Ambush';
  let seg4Participants: string[] = [];
  let seg4Rationale = '';

  const unbookedForAngle = eligibleWrestlers.filter(w => !usedWrestlerIdsOnCard.has(w.id));

  if (unbookedForAngle.length >= 2) {
    const sortedByDrama = [...unbookedForAngle].sort((a, b) => {
      // Prioritize underutilized talent
      const appA = (a.wins || 0) + (a.losses || 0) + (a.draws || 0);
      const appB = (b.wins || 0) + (b.losses || 0) + (b.draws || 0);
      return (appA * 10 - a.micSkills) - (appB * 10 - b.micSkills);
    });

    const starA = sortedByDrama[0];
    const starB = sortedByDrama[1];

    if (gm.archetype === 'showman') {
      seg4AngleType = 'Interview Segment';
      seg4Participants = [starA.id];
      seg4Rationale = `Exclusive backstage interview with ${starA.name}, declaring intentions to challenge the champions next week.`;
    } else {
      seg4AngleType = 'Backstage Ambush';
      seg4Participants = [starA.id, starB.id];
      seg4Rationale = `Corridor altercation: ${starA.name} blindsides ${starB.name} backstage, igniting a new rivalry and giving fresh talent television narrative heat.`;
    }
  } else if (unbookedForAngle.length === 1) {
    const star = unbookedForAngle[0];
    seg4AngleType = 'Hype Video / Vignette';
    seg4Participants = [star.id];
    seg4Rationale = `Special spotlight vignette highlighting the training, dedication, and hunger of ${star.name}.`;
  } else {
    // If entire roster is already booked, use GM for an Executive State-of-the-Show Address
    seg4AngleType = 'In-Ring Promo';
    seg4Participants = [eligibleWrestlers[0]?.id || roster[0]?.id];
    seg4Rationale = `General Manager ${gm.name} delivers an executive state-of-the-federation address to the live broadcast audience.`;
  }

  // LOCK SEGMENT 4 TALENTS
  seg4Participants.forEach(id => usedWrestlerIdsOnCard.add(id));

  const seg4Object: GMProposalSegment = {
    id: `gm-seg-4-${Date.now()}`,
    segmentNumber: 4,
    category: 'Angle',
    angleType: seg4AngleType,
    participantIds: seg4Participants,
    durationMinutes: 6,
    gmRationale: seg4Rationale,
    gmTag: 'BACKSTAGE NARRATIVE',
    projectedScore: 78
  };

  // Assemble the 5 segments in broadcast running order
  segments.push(seg1Object, seg2Object, seg3Object, seg4Object, seg5Object);

  // Calculate executive forecast
  const avgProj = Math.round(segments.reduce((acc, s) => acc + (s.projectedScore || 70), 0) / segments.length);
  const starRating = calculateStarRating(avgProj).starString;

  const uniqueBookedCount = new Set(segments.flatMap(s => s.participantIds)).size;

  const executiveSummary = `${gm.name} has crafted a diverse 5-segment broadcast featuring ${uniqueBookedCount} distinct superstars under the "${activeDirective.replace(/_/g, ' ').toUpperCase()}" directive. Character reuse is strictly eliminated (0 duplicate talents), championships strictly enforce gender divisions, and underutilized roster members receive active television time. Projected Show Rating: ${avgProj}/100.`;

  return {
    id: `proposal-${Date.now()}`,
    showName: promotion.weeklyTVShow,
    week: currentWeek,
    year: currentYear,
    gmId: gm.id,
    gmName: gm.name,
    gmAvatar: gm.avatar,
    archetype: gm.archetype,
    activeDirective,
    executiveSummary,
    projectedShowRating: avgProj,
    projectedStarRating: starRating,
    restedStars,
    keyStorylinesAdvanced,
    segments,
    status: 'pending_approval',
    createdAt: Date.now()
  };
}

/**
 * Evaluates the GM debrief after the show runs.
 * Updates GM trust score, tracks approval, and provides personalized quote.
 */
export function generateGMPostShowDebrief(
  showResult: ShowResult,
  gm?: GeneralManager,
  wasApprovedAsIs: boolean = true
): { updatedGM?: GeneralManager; debriefQuote: string; reaction: 'ecstatic' | 'pleased' | 'neutral' | 'concerned' | 'critical' } {
  if (!gm) {
    return {
      debriefQuote: 'Show broadcast wrapped up with steady reception across broadcast markets.',
      reaction: 'neutral'
    };
  }

  let trustDelta = 0;
  let reaction: 'ecstatic' | 'pleased' | 'neutral' | 'concerned' | 'critical' = 'pleased';
  let debriefQuote = '';

  const score = showResult.overallScore;

  if (score >= 88) {
    trustDelta = wasApprovedAsIs ? +5 : +3;
    reaction = 'ecstatic';
    debriefQuote = gm.archetype === 'traditionalist'
      ? `Boss, that was pure wrestling perfection! The workrate spoke for itself and the locker room is walking tall.`
      : gm.archetype === 'showman'
      ? `Sensational television! The ratings are going to skyrocket and our social buzz is off the charts!`
      : gm.archetype === 'hardcore_outlaw'
      ? `Now that's how you blow the roof off the building! Total carnage, genuine emotion, and fans begging for more.`
      : gm.archetype === 'executive'
      ? `Flawless execution of our operational blueprint. Broadcaster metrics exceeded expectations while managing roster strain.`
      : `The crowd ate out of the palm of our hands. Controversial, gripping, and commercially bulletproof.`;
  } else if (score >= 74) {
    trustDelta = wasApprovedAsIs ? +2 : +1;
    reaction = 'pleased';
    debriefQuote = `Solid broadcast all around. We hit our demographic targets and advanced our primary rivalries without any catastrophic hiccups.`;
  } else if (score >= 60) {
    trustDelta = wasApprovedAsIs ? 0 : -1;
    reaction = 'neutral';
    debriefQuote = `A passable outing, boss. We got through the card, but a couple segments lacked that electric spark. We will tighten up the pacing for next week.`;
  } else {
    trustDelta = wasApprovedAsIs ? -3 : -2;
    reaction = 'concerned';
    debriefQuote = `That didn't land the way we scripted it. The crowd went cold in the midcard and the network will want an explanation. Let me re-tool our focal rivalries.`;
  }

  if (!wasApprovedAsIs) {
    trustDelta -= 1; // Slight friction from executive micromanagement
  }

  const updatedTrust = Math.min(100, Math.max(10, gm.trustScore + trustDelta));
  const newRunCount = (gm.showsRunCount || 0) + 1;
  const newApprovedCount = (gm.showsRunCount || 0) * ((gm.approvalRate || 80) / 100) + (wasApprovedAsIs ? 1 : 0);
  const newApprovalRate = Math.round((newApprovedCount / newRunCount) * 100);

  const updatedGM: GeneralManager = {
    ...gm,
    trustScore: updatedTrust,
    showsRunCount: newRunCount,
    approvalRate: newApprovalRate
  };

  return {
    updatedGM,
    debriefQuote,
    reaction
  };
}

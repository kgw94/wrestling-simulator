import { 
  Promotion, 
  Wrestler, 
  TagTeam, 
  Faction, 
  Feud, 
  Championship, 
  Segment, 
  MatchType, 
  FinishType,
  PushLevel
} from '../types';
import { calculateStarRating } from './simulation';
import { getChampionshipGender, isWrestlerEligibleForTitle } from '../utils/titleUtils';

// ==========================================
// 1. TAG TEAM AUTO-SUGGESTION SYSTEM
// ==========================================

export type TagTeamArchetype = 
  | 'Power & Velocity'
  | 'Technical Masters'
  | 'Aero Kings'
  | 'Wrecking Brawlers'
  | 'Sports Entertainment'
  | 'Odd-Couple Dynamic'
  | 'Next-Gen Upstarts'
  | 'Veteran & Protege';

export interface TagTeamSuggestion {
  id: string;
  name: string;
  member1: Wrestler;
  member2: Wrestler;
  member1Id: string;
  member2Id: string;
  chemistry: number;
  finisher: string;
  archetype: TagTeamArchetype;
  archetypeBadge: string;
  rationale: string;
  alignmentSynergy: 'Face Allies' | 'Heel Allies' | 'Odd-Couple Face & Heel';
  combinedOverness: number;
  combinedWorkrate: number;
}

// Generate creative tag team names based on style & personalities
function generateTagTeamName(w1: Wrestler, w2: Wrestler, archetype: TagTeamArchetype, promoStyle: string): string {
  const name1Clean = w1.name.split(' ')[0] || w1.name;
  const name2Clean = w2.name.split(' ')[0] || w2.name;

  if (archetype === 'Power & Velocity') {
    const powerGuy = w1.style === 'Powerhouse' ? w1 : w2;
    const speedGuy = w1.style === 'Powerhouse' ? w2 : w1;
    const names = [
      `The Iron Velocity`,
      `Thunder & Lightning`,
      `The Colossus Connection`,
      `Heavy Impact`,
      `Power & Flight`,
      `Apex Velocity`,
      `${powerGuy.name.split(' ').pop()} & ${speedGuy.name.split(' ').pop()}`
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  if (archetype === 'Technical Masters') {
    const names = [
      `The Submission Syndicate`,
      `The Mat Technicians`,
      `Pure Protocol`,
      `The Catch Wrestling Order`,
      `The Technical Standard`,
      `Precision & Submission`,
      `The Mat Masters`
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  if (archetype === 'Aero Kings') {
    const names = [
      `The Sky Kings`,
      `Velocity Express`,
      `Aerial Assault Unit`,
      `The High Voltage Express`,
      `Zero Gravity Collective`,
      `The Flight Brothers`,
      `Aero Syndicate`
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  if (archetype === 'Wrecking Brawlers') {
    const names = [
      `The Concrete Cartel`,
      `The Wrecking Crew`,
      `Heavy Artillery`,
      `The Street Syndicate`,
      `Brutal Enforcement`,
      `Iron Fist Coalition`,
      `The Bruiser Brigade`
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  if (archetype === 'Odd-Couple Dynamic') {
    const face = w1.alignment === 'Face' ? w1 : w2;
    const heel = w1.alignment === 'Face' ? w2 : w1;
    const names = [
      `The Unlikely Alliance`,
      `Fire & Ice Connection`,
      `Tension & Glory`,
      `The Strange Bedfellows`,
      `Chaos & Order`,
      `${face.name.split(' ')[0]} & ${heel.name.split(' ')[0]}`
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  if (archetype === 'Veteran & Protege') {
    const vet = w1.age > w2.age ? w1 : w2;
    const names = [
      `The Legacy Protocol`,
      `Master & Apprentice`,
      `The Heritage Foundation`,
      `Generational Force`,
      `Old School & New Blood`
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  if (archetype === 'Next-Gen Upstarts') {
    const names = [
      `The Young Guns`,
      `Generation Apex`,
      `The Future Foundation`,
      `New Era Vanguard`,
      `The Rising Syndicate`
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  // Sports Entertainment default
  const names = [
    `The Prime Time Players`,
    `The Golden Syndicate`,
    `Showtime Express`,
    `The Megastars`,
    `The A-List Connection`,
    `The Glamour Syndicate`
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// Generate creative double-team finishers
function generateTagFinisher(archetype: TagTeamArchetype): string {
  switch (archetype) {
    case 'Power & Velocity':
      return ['Doomsday Superkick', 'Powerbomb / Flying Neckbreaker combo', 'Skyline Spinebuster', 'High-Low Clothesline'][Math.floor(Math.random() * 4)];
    case 'Technical Masters':
      return ['Double Texas Cloverleaf', 'Crossface / Ankle Lock Symbiosis', 'Stereo German Suplexes', 'Assisted Kimura Lock'][Math.floor(Math.random() * 4)];
    case 'Aero Kings':
      return ['Stereo 450 Splashes', 'Double Spanish Fly', 'Total Elevation Dropkick', 'Skyline Hurricanrana'][Math.floor(Math.random() * 4)];
    case 'Wrecking Brawlers':
      return ['Decapitation Lariat', 'Spike Piledriver', 'Double Chokeslam', 'Concrete Buster'][Math.floor(Math.random() * 4)];
    case 'Odd-Couple Dynamic':
      return ['Reluctant Assisted Pin', 'Double Superkick with eye-roll', 'Coordinated Misdirection Finisher', 'The Disgruntled Slam'][Math.floor(Math.random() * 4)];
    case 'Veteran & Protege':
      return ['Passing of the Torch Lariat', 'Teacher-Student Suplex Combination', 'Classic Boston Crab & Elbow Drop'][Math.floor(Math.random() * 3)];
    case 'Next-Gen Upstarts':
      return ['Shatter Machine', 'Total Oblivion', 'The New Era Driver', 'Assisted Cutter'][Math.floor(Math.random() * 4)];
    default:
      return ['Doomsday Device', 'Double DDT', 'The Finale', 'Magic Killer'][Math.floor(Math.random() * 4)];
  }
}

/**
 * Suggests smart, highly-compatible tag team pairings from the roster
 */
export function suggestTagTeams(
  promotion: Promotion,
  options?: {
    max?: number;
    filter?: 'all' | 'unassigned_only' | 'same_gender' | 'odd_couple' | 'face_only' | 'heel_only';
  }
): TagTeamSuggestion[] {
  const roster = promotion.roster.filter(w => !w.injury.injured && !w.isRetired);
  const existingTeams = promotion.tagTeams || [];
  const assignedIds = new Set(existingTeams.flatMap(t => t.memberIds));

  let pool = roster;
  if (options?.filter === 'unassigned_only') {
    pool = pool.filter(w => !assignedIds.has(w.id));
  }

  const suggestions: TagTeamSuggestion[] = [];
  const maxResults = options?.max || 12;

  // Compare every unique pair of wrestlers
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const w1 = pool[i];
      const w2 = pool[j];

      // Tag teams should ideally share the same gender for standard tag divisions
      if (w1.gender !== w2.gender && options?.filter !== 'all') {
        continue;
      }

      // Check filters
      if (options?.filter === 'face_only' && (w1.alignment !== 'Face' || w2.alignment !== 'Face')) continue;
      if (options?.filter === 'heel_only' && (w1.alignment !== 'Heel' || w2.alignment !== 'Heel')) continue;
      if (options?.filter === 'odd_couple' && w1.alignment === w2.alignment) continue;

      let chemistry = 70;
      let archetype: TagTeamArchetype = 'Sports Entertainment';
      let rationale = '';

      // Determine archetype & calculate chemistry bonus
      const isOddCouple = w1.alignment !== w2.alignment;
      const isPowerSpeed = (w1.style === 'Powerhouse' && (w2.style === 'High Flyer' || w2.style === 'Technician')) ||
                           (w2.style === 'Powerhouse' && (w1.style === 'High Flyer' || w1.style === 'Technician'));
      const isBothTech = w1.style === 'Technician' && w2.style === 'Technician';
      const isBothFlyer = w1.style === 'High Flyer' && w2.style === 'High Flyer';
      const isBrawlers = (w1.style === 'Brawler' || w1.style === 'Hardcore') && (w2.style === 'Brawler' || w2.style === 'Hardcore');
      const isVetProtege = (Math.abs(w1.age - w2.age) >= 8) && (w1.age > 34 || w2.age > 34) && (w1.age < 29 || w2.age < 29);
      const isYoungGuns = w1.age <= 28 && w2.age <= 28;

      if (isPowerSpeed) {
        archetype = 'Power & Velocity';
        chemistry += 14;
        rationale = `Classic powerhouse & speedster balance gives incredible versatility against any opponent style.`;
      } else if (isBothTech) {
        archetype = 'Technical Masters';
        chemistry += 15;
        rationale = `Twin mat technicians who can dismantle opponents with surgical limb targeting and chain grappling.`;
      } else if (isBothFlyer) {
        archetype = 'Aero Kings';
        chemistry += 16;
        rationale = `High-flying tandem capable of breathtaking double-team aerial maneuvers that bring fans to their feet.`;
      } else if (isBrawlers) {
        archetype = 'Wrecking Brawlers';
        chemistry += 13;
        rationale = `Unforgiving heavy hitters with intense ring physicality, perfect for grueling grudge matches.`;
      } else if (isVetProtege) {
        archetype = 'Veteran & Protege';
        chemistry += 11;
        rationale = `Veteran ring savvy guides explosive young talent, creating a classic mentorship storyline on TV.`;
      } else if (isOddCouple) {
        archetype = 'Odd-Couple Dynamic';
        chemistry += 10;
        rationale = `Contrasting moralities create combustible chemistry and must-see backstage banter on weekly TV.`;
      } else if (isYoungGuns) {
        archetype = 'Next-Gen Upstarts';
        chemistry += 12;
        rationale = `Hungry young athletes with endless stamina looking to prove themselves against the veteran guard.`;
      } else {
        archetype = 'Sports Entertainment';
        chemistry += 8;
        rationale = `Charismatic duo with high TV presence capable of entertaining the crowd both on the mic and in the ring.`;
      }

      // Bonus for high workrates
      const avgWorkrate = (w1.workrate + w2.workrate) / 2;
      if (avgWorkrate >= 80) chemistry += 6;
      else if (avgWorkrate >= 70) chemistry += 3;

      // Bonus for high morale
      if (w1.morale >= 85 && w2.morale >= 85) chemistry += 3;

      // Deduct slightly if fatigue is already high
      if (w1.fatigue > 40 || w2.fatigue > 40) chemistry -= 4;

      chemistry = Math.max(65, Math.min(98, chemistry));

      const alignmentSynergy = isOddCouple
        ? 'Odd-Couple Face & Heel'
        : w1.alignment === 'Face'
        ? 'Face Allies'
        : 'Heel Allies';

      const name = generateTagTeamName(w1, w2, archetype, promotion.style);
      const finisher = generateTagFinisher(archetype);

      suggestions.push({
        id: `sug-team-${w1.id}-${w2.id}`,
        name,
        member1: w1,
        member2: w2,
        member1Id: w1.id,
        member2Id: w2.id,
        chemistry,
        finisher,
        archetype,
        archetypeBadge: archetype,
        rationale,
        alignmentSynergy,
        combinedOverness: Math.round((w1.overness + w2.overness) / 2),
        combinedWorkrate: Math.round(avgWorkrate)
      });
    }
  }

  // Sort by highest chemistry, then combined overness
  return suggestions
    .sort((a, b) => (b.chemistry * 1.5 + b.combinedOverness) - (a.chemistry * 1.5 + a.combinedOverness))
    .slice(0, maxResults);
}


// ==========================================
// 2. STABLE & FACTION AUTO-SUGGESTION SYSTEM
// ==========================================

export type FactionArchetype = 
  | 'Championship Syndicate'
  | 'Counter-Culture Outlaws'
  | 'Pure Ring Order'
  | 'Cruiser Vanguard'
  | 'Dark Ministry'
  | 'Youth Rebellion';

export interface StableSuggestion {
  id: string;
  name: string;
  leader: Wrestler;
  enforcer: Wrestler;
  members: Wrestler[];
  memberIds: string[];
  influence: number;
  archetype: FactionArchetype;
  description: string;
  rationale: string;
  combinedOverness: number;
}

export function suggestStables(
  promotion: Promotion,
  options?: { max?: number; excludeExistingFactions?: boolean }
): StableSuggestion[] {
  const roster = promotion.roster.filter(w => !w.injury.injured && !w.isRetired);
  const existingFactions = promotion.factions || [];
  const assignedIds = new Set(existingFactions.flatMap(f => f.memberIds));

  let pool = roster;
  if (options?.excludeExistingFactions) {
    pool = pool.filter(w => !assignedIds.has(w.id));
  }

  if (pool.length < 3) return [];

  const suggestions: StableSuggestion[] = [];

  // 1. Dominant Championship Syndicate (Heel or Face)
  // Needs: 1 Main Event leader, 1 Powerhouse Enforcer, 1-2 upper midcard / midcard workhorses
  const potentialLeaders = pool.filter(w => w.push === 'Main Eventer' || (w.push === 'Upper Midcard' && w.overness >= 75));
  const potentialEnforcers = pool.filter(w => w.style === 'Powerhouse' || w.style === 'Brawler' || w.style === 'Hardcore');

  if (potentialLeaders.length > 0 && potentialEnforcers.length > 0) {
    const leader = potentialLeaders.slice().sort((a, b) => (b.overness + b.micSkills) - (a.overness + a.micSkills))[0];
    const enforcer = potentialEnforcers.filter(w => w.id !== leader.id).sort((a, b) => b.workrate - a.workrate)[0];

    if (enforcer) {
      // Find 1-2 tag team or workhorse members
      const others = pool
        .filter(w => w.id !== leader.id && w.id !== enforcer.id && w.gender === leader.gender)
        .sort((a, b) => b.workrate - a.workrate)
        .slice(0, 2);

      if (others.length >= 1) {
        const allMembers = [leader, enforcer, ...others];
        const avgOverness = Math.round(allMembers.reduce((sum, m) => sum + m.overness, 0) / allMembers.length);
        const nameCandidates = [
          `The Apex Syndicate`,
          `The Sovereign Order`,
          `Dynasty of Champions`,
          `The Crown & Iron Coalition`,
          `The Sovereign League`
        ];
        const name = nameCandidates[Math.floor(Math.random() * nameCandidates.length)];

        suggestions.push({
          id: `stable-syndicate-${leader.id}`,
          name,
          leader,
          enforcer,
          members: allMembers,
          memberIds: allMembers.map(m => m.id),
          influence: Math.min(96, Math.max(80, avgOverness + 5)),
          archetype: 'Championship Syndicate',
          description: `An elite alliance anchored by ${leader.name} and enforced by the brute strength of ${enforcer.name}. United by one ambition: controlling every belt in the promotion.`,
          rationale: `Positions ${leader.name} as an untouchable champion flanked by an intimidating enforcer, providing weekly multi-man main event angles.`,
          combinedOverness: avgOverness
        });
      }
    }
  }

  // 2. Counter-Culture Outlaws / Rebel Alliance
  const brawlersAndHardcore = pool.filter(w => w.style === 'Hardcore' || w.style === 'Brawler' || w.alignment === 'Heel');
  if (brawlersAndHardcore.length >= 3) {
    const sorted = brawlersAndHardcore.slice().sort((a, b) => (b.overness + b.workrate) - (a.overness + a.workrate));
    const leader = sorted[0];
    const enforcer = sorted[1];
    const rest = sorted.slice(2, 4);

    const allMembers = [leader, enforcer, ...rest];
    const avgOverness = Math.round(allMembers.reduce((sum, m) => sum + m.overness, 0) / allMembers.length);

    suggestions.push({
      id: `stable-outlaws-${leader.id}`,
      name: `The Concrete Outlaws`,
      leader,
      enforcer,
      members: allMembers,
      memberIds: allMembers.map(m => m.id),
      influence: Math.min(94, Math.max(76, avgOverness + 4)),
      archetype: 'Counter-Culture Outlaws',
      description: `A ruthless wolfpack of brawlers and rulebreakers who reject executive authority and settle matters with steel chairs and locker room ambushes.`,
      rationale: `Creates an anti-establishment force ideal for chaotic brawl segments, No-DQ matches, and invasion storylines.`,
      combinedOverness: avgOverness
    });
  }

  // 3. Pure Ring Order (Technical Purists)
  const technicians = pool.filter(w => w.style === 'Technician' || w.workrate >= 76);
  if (technicians.length >= 3) {
    const sortedTech = technicians.slice().sort((a, b) => b.workrate - a.workrate);
    const leader = sortedTech[0];
    const enforcer = sortedTech[1];
    const others = sortedTech.slice(2, 4);

    const allMembers = [leader, enforcer, ...others];
    const avgOverness = Math.round(allMembers.reduce((sum, m) => sum + m.overness, 0) / allMembers.length);

    suggestions.push({
      id: `stable-pure-${leader.id}`,
      name: `The Mat Standard Coalition`,
      leader,
      enforcer,
      members: allMembers,
      memberIds: allMembers.map(m => m.id),
      influence: Math.min(92, Math.max(75, Math.round(leader.workrate * 0.95))),
      archetype: 'Pure Ring Order',
      description: `Wrestling purists dedicated to traditional discipline and catch wrestling excellence, seeking to purge sports entertainment theatrics from the ring.`,
      rationale: `Instantly elevates match quality ratings across the card; perfect for 20-minute classic workrate clinics.`,
      combinedOverness: avgOverness
    });
  }

  // 4. Cruiser / Aerial Vanguard
  const highFlyers = pool.filter(w => w.style === 'High Flyer' || (w.style === 'Entertainer' && w.workrate >= 72));
  if (highFlyers.length >= 3) {
    const sortedFlyers = highFlyers.slice().sort((a, b) => (b.workrate + b.overness) - (a.workrate + a.overness));
    const leader = sortedFlyers[0];
    const enforcer = sortedFlyers[1];
    const others = sortedFlyers.slice(2, 4);

    const allMembers = [leader, enforcer, ...others];
    const avgOverness = Math.round(allMembers.reduce((sum, m) => sum + m.overness, 0) / allMembers.length);

    suggestions.push({
      id: `stable-velocity-${leader.id}`,
      name: `The Velocity Syndicate`,
      leader,
      enforcer,
      members: allMembers,
      memberIds: allMembers.map(m => m.id),
      influence: Math.min(90, Math.max(74, avgOverness + 3)),
      archetype: 'Cruiser Vanguard',
      description: `High-octane aerial daredevils united for mutual protection against division giants, dominating opening and midcard bouts with breathtaking pace.`,
      rationale: `Guarantees explosive hot openers on television shows and delivers high crowd excitement ratings.`,
      combinedOverness: avgOverness
    });
  }

  // 5. Youth Rebellion / Generation Next
  const youngsters = pool.filter(w => w.age <= 30 && !w.isRetired);
  if (youngsters.length >= 3) {
    const sortedYouth = youngsters.slice().sort((a, b) => (b.workrate + b.overness) - (a.workrate + a.overness));
    const leader = sortedYouth[0];
    const enforcer = sortedYouth[1];
    const others = sortedYouth.slice(2, 4);

    const allMembers = [leader, enforcer, ...others];
    const avgOverness = Math.round(allMembers.reduce((sum, m) => sum + m.overness, 0) / allMembers.length);

    suggestions.push({
      id: `stable-youth-${leader.id}`,
      name: `The New Era Order`,
      leader,
      enforcer,
      members: allMembers,
      memberIds: allMembers.map(m => m.id),
      influence: Math.min(90, Math.max(72, avgOverness + 4)),
      archetype: 'Youth Rebellion',
      description: `Hungry young lions determined to forcibly retire the aging main eventers and take over the company by any means necessary.`,
      rationale: `Creates long-term booking momentum by establishing future main event stars through high-stakes veteran feuds.`,
      combinedOverness: avgOverness
    });
  }

  return suggestions.slice(0, options?.max || 4);
}


// ==========================================
// 3. MATCH AUTO-SUGGESTION SYSTEM
// ==========================================

export type MatchSuggestionCategory = 
  | 'Feud Climax' 
  | 'Championship' 
  | 'Tag Team War' 
  | 'Faction Battle' 
  | 'Workrate Clinic' 
  | 'David vs Goliath' 
  | 'Cruiser Sprint' 
  | 'Battle Royal Spectacle';

export interface MatchSuggestion {
  id: string;
  title: string;
  category: MatchSuggestionCategory;
  categoryBadge: string;
  matchType: MatchType;
  customMatchRuleId?: string;
  participantIds: string[];
  participants: Wrestler[];
  winnerId: string;
  winnerName: string;
  finishType: FinishType;
  durationMinutes: number;
  titleId?: string;
  titleName?: string;
  feudId?: string;
  feudName?: string;
  projectedScore: number;
  projectedStars: string;
  rationale: string;
  segment: Segment;
}

/**
 * Auto-suggests exciting, high-drawing, and logically sound matches for tonight's card
 */
export function suggestMatches(
  promotion: Promotion,
  currentCard: Segment[],
  options?: {
    ppvMode?: boolean;
    maxSuggestions?: number;
  }
): MatchSuggestion[] {
  const roster = promotion.roster.filter(w => !w.injury.injured && !w.isRetired);
  const titles = promotion.titles.filter(t => !t.isRetired);
  const feuds = promotion.feuds || [];
  const tagTeams = (promotion.tagTeams || []).filter(t => t.isActive);
  const factions = promotion.factions || [];
  const bookedIds = new Set(currentCard.flatMap(s => s.participantIds));

  const suggestions: MatchSuggestion[] = [];
  const isPPV = Boolean(options?.ppvMode);

  // Helper to test if participants are already heavily booked
  const areAvailable = (ids: string[]) => {
    return ids.every(id => {
      const timesBooked = currentCard.filter(s => s.participantIds.includes(id)).length;
      return timesBooked < 2; // At most once
    });
  };

  // Helper to project score
  const projectScore = (participants: Wrestler[], matchType: MatchType, hasFeud: boolean, isTitle: boolean): number => {
    if (participants.length === 0) return 50;
    const avgOverness = participants.reduce((s, w) => s + w.overness, 0) / participants.length;
    const avgWorkrate = participants.reduce((s, w) => s + w.workrate, 0) / participants.length;
    let base = (avgOverness * 0.55) + (avgWorkrate * 0.45);
    if (hasFeud) base += 8;
    if (isTitle) base += 5;
    if (isPPV) base += 4;
    return Math.min(99, Math.max(45, Math.round(base)));
  };

  // 1. FEUD CLIMAX / GRUDGE MATCH SUGGESTIONS
  const activeFeuds = feuds.slice().sort((a, b) => b.heat - a.heat);
  for (const feud of activeFeuds) {
    const sideA = feud.wrestlerAIds.map(id => roster.find(w => w.id === id)).filter((w): w is Wrestler => Boolean(w && !w.injury.injured));
    const sideB = feud.wrestlerBIds.map(id => roster.find(w => w.id === id)).filter((w): w is Wrestler => Boolean(w && !w.injury.injured));

    if (sideA.length > 0 && sideB.length > 0) {
      const wA = sideA[0];
      const wB = sideB[0];
      const participantIds = [wA.id, wB.id];

      if (areAvailable(participantIds)) {
        // High heat matches warrant stipulations
        let matchType: MatchType = 'Singles';
        let finishType: FinishType = 'Clean Pinfall';
        let duration = isPPV ? 20 : 15;

        if (feud.heat >= 80) {
          matchType = isPPV ? 'Hell in a Cell' : 'Steel Cage';
          finishType = feud.heat > 90 ? 'Heel Turn / Screwjob' : 'Clean Pinfall';
          duration = 22;
        } else if (feud.heat >= 65) {
          matchType = 'Hardcore / No DQ';
          finishType = 'Weapon / Foreign Object';
          duration = 16;
        }

        const winner = wA.overness >= wB.overness ? wA : wB;
        const score = projectScore([wA, wB], matchType, true, false);
        const { starString } = calculateStarRating(score);

        suggestions.push({
          id: `sug-feud-${feud.id}`,
          title: `Bitter Grudge War: ${wA.name} vs ${wB.name}`,
          category: 'Feud Climax',
          categoryBadge: '🔥 Grudge Rivalry',
          matchType,
          participantIds,
          participants: [wA, wB],
          winnerId: winner.id,
          winnerName: winner.name,
          finishType,
          durationMinutes: duration,
          feudId: feud.id,
          feudName: feud.name,
          projectedScore: score,
          projectedStars: starString,
          rationale: `White-hot rivalry '${feud.name}' (${feud.heat}/100 Heat). Booking this stipulation bout pays off weeks of heated television promos.`,
          segment: {
            id: `seg-sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            segmentNumber: currentCard.length + 1,
            category: 'Match',
            matchType,
            participantIds,
            winnerId: winner.id,
            finishType,
            durationMinutes: duration,
            feudId: feud.id,
            notes: `Grudge match settling the score in '${feud.name}' rivalry.`
          }
        });
      }
    }
  }

  // 2. CHAMPIONSHIP DEFENSE SUGGESTIONS
  for (const title of titles) {
    if (title.currentHolderIds.length === 0) continue;
    const championId = title.currentHolderIds[0];
    const champion = roster.find(w => w.id === championId);
    if (!champion) continue;

    // Tag team title?
    if (title.isTagTeam) {
      if (title.currentHolderIds.length === 2 && tagTeams.length >= 2) {
        const champTeam = tagTeams.find(t => 
          t.memberIds.includes(title.currentHolderIds[0]) && 
          t.memberIds.includes(title.currentHolderIds[1])
        );
        const challengerTeam = tagTeams.find(t => 
          t.id !== champTeam?.id && 
          areAvailable(t.memberIds)
        );

        if (champTeam && challengerTeam) {
          const participantIds = [...champTeam.memberIds, ...challengerTeam.memberIds];
          const participants = participantIds.map(id => roster.find(w => w.id === id)).filter((w): w is Wrestler => Boolean(w));
          const score = projectScore(participants, 'Tag Team', false, true);
          const { starString } = calculateStarRating(score);

          suggestions.push({
            id: `sug-title-${title.id}`,
            title: `${title.name} Tag Warfare: ${champTeam.name} vs ${challengerTeam.name}`,
            category: 'Championship',
            categoryBadge: '🏆 Tag Title Defense',
            matchType: 'Tag Team',
            participantIds,
            participants,
            winnerId: champTeam.memberIds[0],
            winnerName: champTeam.name,
            finishType: 'Clean Pinfall',
            durationMinutes: isPPV ? 18 : 14,
            titleId: title.id,
            titleName: title.name,
            projectedScore: score,
            projectedStars: starString,
            rationale: `Defends the prestigious ${title.name} in a high-tempo tandem clash between ${champTeam.name} and top contenders ${challengerTeam.name}.`,
            segment: {
              id: `seg-sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              segmentNumber: currentCard.length + 1,
              category: 'Match',
              matchType: 'Tag Team',
              participantIds,
              winnerId: champTeam.memberIds[0],
              finishType: 'Clean Pinfall',
              durationMinutes: isPPV ? 18 : 14,
              titleId: title.id,
              notes: `Championship bout for the ${title.name}.`
            }
          });
        }
      }
      continue;
    }

    // Singles title defense
    const eligibleChallengers = roster.filter(w => 
      w.id !== champion.id && 
      isWrestlerEligibleForTitle(title, w) && 
      areAvailable([w.id, champion.id]) &&
      w.alignment !== champion.alignment // Classic Face vs Heel
    ).sort((a, b) => (b.overness + b.workrate) - (a.overness + a.workrate));

    const challenger = eligibleChallengers[0] || roster.find(w => w.id !== champion.id && isWrestlerEligibleForTitle(title, w));

    if (challenger && areAvailable([champion.id, challenger.id])) {
      const participantIds = [champion.id, challenger.id];
      const matchType: MatchType = isPPV && champion.overness >= 85 ? 'Steel Cage' : 'Singles';
      const finishType: FinishType = challenger.alignment === 'Heel' ? 'Distraction Rollup' : 'Clean Pinfall';
      const score = projectScore([champion, challenger], matchType, false, true);
      const { starString } = calculateStarRating(score);

      suggestions.push({
        id: `sug-title-${title.id}`,
        title: `${title.name}: ${champion.name} (c) vs ${challenger.name}`,
        category: 'Championship',
        categoryBadge: '🏆 Championship Match',
        matchType,
        participantIds,
        participants: [champion, challenger],
        winnerId: champion.id,
        winnerName: `${champion.name} (Retains)`,
        finishType,
        durationMinutes: isPPV ? 20 : 15,
        titleId: title.id,
        titleName: title.name,
        projectedScore: score,
        projectedStars: starString,
        rationale: `Sanctioned title defense featuring ${champion.name} putting the ${title.name} on the line against #1 ranked contender ${challenger.name}.`,
        segment: {
          id: `seg-sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          segmentNumber: currentCard.length + 1,
          category: 'Match',
          matchType,
          participantIds,
          winnerId: champion.id,
          finishType,
          durationMinutes: isPPV ? 20 : 15,
          titleId: title.id,
          notes: `Championship match for the ${title.name}.`
        }
      });
    }
  }

  // 3. 5-STAR WORKRATE CLINIC (Pure In-Ring Masterpiece)
  const highWorkrateWrestlers = roster
    .filter(w => w.workrate >= 75 && areAvailable([w.id]))
    .sort((a, b) => b.workrate - a.workrate);

  if (highWorkrateWrestlers.length >= 2) {
    const w1 = highWorkrateWrestlers[0];
    const w2 = highWorkrateWrestlers[1];
    const participantIds = [w1.id, w2.id];
    const matchType: MatchType = 'Submission Match';
    const score = projectScore([w1, w2], matchType, false, false) + 4;
    const { starString } = calculateStarRating(score);

    suggestions.push({
      id: `sug-workrate-${w1.id}-${w2.id}`,
      title: `Pure In-Ring Masterclass: ${w1.name} vs ${w2.name}`,
      category: 'Workrate Clinic',
      categoryBadge: '⭐ 5-Star Contender',
      matchType,
      participantIds,
      participants: [w1, w2],
      winnerId: w1.id,
      winnerName: w1.name,
      finishType: 'Submission',
      durationMinutes: 18,
      projectedScore: score,
      projectedStars: starString,
      rationale: `Pairing two of the company's supreme mat technicians (${w1.workrate} & ${w2.workrate} Workrate) guarantees exceptional ring quality and high praise from critical viewers.`,
      segment: {
        id: `seg-sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        segmentNumber: currentCard.length + 1,
        category: 'Match',
        matchType,
        participantIds,
        winnerId: w1.id,
        finishType: 'Submission',
        durationMinutes: 18,
        notes: `Technical exhibition showcasing pure wrestling mastery.`
      }
    });
  }

  // 4. CLASH OF STYLES: DAVID VS GOLIATH (High Flyer vs Powerhouse)
  const powerhouses = roster.filter(w => w.style === 'Powerhouse' && areAvailable([w.id]));
  const flyers = roster.filter(w => w.style === 'High Flyer' && areAvailable([w.id]));

  if (powerhouses.length > 0 && flyers.length > 0) {
    const big = powerhouses.sort((a, b) => b.overness - a.overness)[0];
    const small = flyers.sort((a, b) => b.overness - a.overness)[0];
    const participantIds = [big.id, small.id];
    const score = projectScore([big, small], 'Singles', false, false);
    const { starString } = calculateStarRating(score);

    suggestions.push({
      id: `sug-styles-${big.id}-${small.id}`,
      title: `David vs. Goliath: ${big.name} vs ${small.name}`,
      category: 'David vs Goliath',
      categoryBadge: '⚡ Clash of Styles',
      matchType: 'Singles',
      participantIds,
      participants: [big, small],
      winnerId: big.id,
      winnerName: big.name,
      finishType: 'Clean Pinfall',
      durationMinutes: 12,
      projectedScore: score,
      projectedStars: starString,
      rationale: `Classic power vs. aerial dynamic. The sheer power of ${big.name} against the heart and speed of ${small.name} always captivates mainstream audiences.`,
      segment: {
        id: `seg-sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        segmentNumber: currentCard.length + 1,
        category: 'Match',
        matchType: 'Singles',
        participantIds,
        winnerId: big.id,
        finishType: 'Clean Pinfall',
        durationMinutes: 12,
        notes: `David vs Goliath showcase match.`
      }
    });
  }

  // 5. FACTION WARFARE / 6-MAN TAG
  if (factions.length >= 2) {
    const f1 = factions[0];
    const f2 = factions[1];
    const m1 = f1.memberIds.slice(0, 3).map(id => roster.find(w => w.id === id)).filter((w): w is Wrestler => Boolean(w && areAvailable([w.id])));
    const m2 = f2.memberIds.slice(0, 3).map(id => roster.find(w => w.id === id)).filter((w): w is Wrestler => Boolean(w && areAvailable([w.id])));

    if (m1.length === 3 && m2.length === 3) {
      const participantIds = [...m1.map(w => w.id), ...m2.map(w => w.id)];
      const participants = [...m1, ...m2];
      const score = projectScore(participants, '6-Man Tag', true, false);
      const { starString } = calculateStarRating(score);

      suggestions.push({
        id: `sug-faction-${f1.id}-${f2.id}`,
        title: `Faction Gang Warfare: ${f1.name} vs ${f2.name}`,
        category: 'Faction Battle',
        categoryBadge: '🛡️ Stable Warfare',
        matchType: '6-Man Tag',
        participantIds,
        participants,
        winnerId: m1[0].id,
        winnerName: `${f1.name} Trio`,
        finishType: 'Heel Turn / Screwjob',
        durationMinutes: 16,
        projectedScore: score,
        projectedStars: starString,
        rationale: `High-stakes multi-man stable collision between ${f1.name} and ${f2.name} to establish territorial dominance over the roster.`,
        segment: {
          id: `seg-sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          segmentNumber: currentCard.length + 1,
          category: 'Match',
          matchType: '6-Man Tag',
          participantIds,
          winnerId: m1[0].id,
          finishType: 'Heel Turn / Screwjob',
          durationMinutes: 16,
          notes: `6-Man Tag between ${f1.name} and ${f2.name}.`
        }
      });
    }
  }

  // 6. TAG TEAM RIVALRY CLASH
  if (tagTeams.length >= 2) {
    const t1 = tagTeams[0];
    const t2 = tagTeams[1];
    if (areAvailable([...t1.memberIds, ...t2.memberIds])) {
      const participantIds = [...t1.memberIds, ...t2.memberIds];
      const participants = participantIds.map(id => roster.find(w => w.id === id)).filter((w): w is Wrestler => Boolean(w));
      const score = projectScore(participants, 'Tag Team', false, false);
      const { starString } = calculateStarRating(score);

      suggestions.push({
        id: `sug-tag-war-${t1.id}-${t2.id}`,
        title: `Tandem Showcase: ${t1.name} vs ${t2.name}`,
        category: 'Tag Team War',
        categoryBadge: '🤝 Tag Division',
        matchType: 'Tag Team',
        participantIds,
        participants,
        winnerId: t1.memberIds[0],
        winnerName: t1.name,
        finishType: 'Clean Pinfall',
        durationMinutes: 14,
        projectedScore: score,
        projectedStars: starString,
        rationale: `High-synergy tag team match featuring coordinated double-team maneuvers and division ranking stakes.`,
        segment: {
          id: `seg-sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          segmentNumber: currentCard.length + 1,
          category: 'Match',
          matchType: 'Tag Team',
          participantIds,
          winnerId: t1.memberIds[0],
          finishType: 'Clean Pinfall',
          durationMinutes: 14,
          notes: `Tag team division clash between ${t1.name} and ${t2.name}.`
        }
      });
    }
  }

  // 7. HIGH-OCTANE OPENER (Cruiser / Entertainer Sprint)
  const energeticWrestlers = roster.filter(w => (w.style === 'High Flyer' || w.style === 'Entertainer') && areAvailable([w.id]));
  if (energeticWrestlers.length >= 2) {
    const w1 = energeticWrestlers[0];
    const w2 = energeticWrestlers[1];
    const participantIds = [w1.id, w2.id];
    const score = projectScore([w1, w2], 'Singles', false, false);
    const { starString } = calculateStarRating(score);

    suggestions.push({
      id: `sug-opener-${w1.id}-${w2.id}`,
      title: `High-Energy Show Opener: ${w1.name} vs ${w2.name}`,
      category: 'Cruiser Sprint',
      categoryBadge: '🚀 Hot Show Opener',
      matchType: 'Singles',
      participantIds,
      participants: [w1, w2],
      winnerId: w1.id,
      winnerName: w1.name,
      finishType: 'Clean Pinfall',
      durationMinutes: 10,
      projectedScore: score,
      projectedStars: starString,
      rationale: `Fast-paced 10-minute sprint designed to immediately heat up the crowd and establish high energy for the rest of the broadcast.`,
      segment: {
        id: `seg-sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        segmentNumber: currentCard.length + 1,
        category: 'Match',
        matchType: 'Singles',
        participantIds,
        winnerId: w1.id,
        finishType: 'Clean Pinfall',
        durationMinutes: 10,
        notes: `High-speed opening match to ignite the arena.`
      }
    });
  }

  // Deduplicate and return sorted by highest projected score
  const uniqueSuggestions = Array.from(new Map(suggestions.map(s => [s.id, s])).values());
  return uniqueSuggestions
    .sort((a, b) => b.projectedScore - a.projectedScore)
    .slice(0, options?.maxSuggestions || 8);
}

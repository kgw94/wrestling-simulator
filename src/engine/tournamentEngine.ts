import { 
  Tournament, 
  TournamentMatch, 
  RoundRobinStanding, 
  TournamentType, 
  TournamentRewardType, 
  Wrestler, 
  Promotion, 
  FinishType,
  NewsItem
} from '../types';

export interface TournamentTemplate {
  id: string;
  name: string;
  tagline: string;
  type: TournamentType;
  gender: 'Male' | 'Female' | 'Open';
  bracketSize: 8 | 16;
  rewardType: TournamentRewardType;
  trophyName: string;
  trophyIcon: string;
  description: string;
}

export const TOURNAMENT_PRESETS: TournamentTemplate[] = [
  {
    id: 'kotr',
    name: 'King of the Ring',
    tagline: 'The historic single-elimination tournament to crown wrestling royalty',
    type: 'single_elimination',
    gender: 'Male',
    bracketSize: 8,
    rewardType: 'title_shot',
    trophyName: 'Royal Crown & Gold Scepter',
    trophyIcon: '👑',
    description: 'Eight elite gladiators battle through three grueling rounds. The winner receives the legendary crown and a guaranteed World Championship title shot.'
  },
  {
    id: 'qotr',
    name: 'Queen of the Ring',
    tagline: 'The prestigious tournament crowning the monarch of the women’s division',
    type: 'single_elimination',
    gender: 'Female',
    bracketSize: 8,
    rewardType: 'title_shot',
    trophyName: 'Queen’s Tiara & Regal Scepter',
    trophyIcon: '👑',
    description: 'The pinnacle showcase of women’s wrestling. Eight top female athletes compete for the crown and a guaranteed Women’s World Championship match.'
  },
  {
    id: 'g1_climax',
    name: 'Grand Prix Climax',
    tagline: 'The ultimate round-robin test of endurance, technique, and fighting spirit',
    type: 'round_robin',
    gender: 'Open',
    bracketSize: 8,
    rewardType: 'title_shot',
    trophyName: 'Grand Prix Golden Sword & Trophy',
    trophyIcon: '⚔️',
    description: 'Split into Block A and Block B. Every wrestler fights all opponents in their block (2 pts win, 1 pt draw). Block A winner faces Block B winner in the Tokyo Supercard Finals!'
  },
  {
    id: 'dusty_classic',
    name: 'Dusty Tag Team Classic',
    tagline: 'Honoring tag team tradition with an 8-team single elimination cup',
    type: 'single_elimination',
    gender: 'Open',
    bracketSize: 8,
    rewardType: 'title_shot',
    trophyName: 'Dusty Memorial Tag Team Cup',
    trophyIcon: '🏆',
    description: 'Eight cohesive teams battle in tournament combat. Winners hoist the iconic trophy and secure a shot at the World Tag Team Championship.'
  },
  {
    id: 'rising_star',
    name: 'Rising Star Cup',
    tagline: 'Showcasing tomorrow’s superstars and future main eventers',
    type: 'single_elimination',
    gender: 'Open',
    bracketSize: 8,
    rewardType: 'crown_title',
    trophyName: 'Rising Star Platinum Plaque',
    trophyIcon: '🌟',
    description: 'Reserved for hungry midcarders and rising talent looking to break out and claim vacant championship gold or a guaranteed push.'
  },
  {
    id: 'gold_rush',
    name: 'Gold Rush Invitational',
    tagline: 'High-stakes 16-superstar gauntlet for the biggest purse in pro wrestling',
    type: 'single_elimination',
    gender: 'Open',
    bracketSize: 16,
    rewardType: 'prestige_trophy',
    trophyName: 'Gold Rush Challenge Chalice',
    trophyIcon: '🪙',
    description: 'A massive 16-wrestler single-elimination tournament testing the depth of the entire roster. The winner earns immense Hall of Fame prestige and bonus momentum.'
  }
];

/**
 * Creates a Single Elimination Tournament (8 or 16 participants)
 */
export function createSingleEliminationTournament(params: {
  name: string;
  tagline: string;
  gender: 'Male' | 'Female' | 'Open';
  bracketSize: 8 | 16;
  rewardType: TournamentRewardType;
  rewardTitleId?: string;
  targetPPVId?: string;
  trophyName: string;
  trophyIcon: string;
  participants: Wrestler[];
  currentWeek: number;
  currentYear: number;
}): Tournament {
  const {
    name,
    tagline,
    gender,
    bracketSize,
    rewardType,
    rewardTitleId,
    targetPPVId,
    trophyName,
    trophyIcon,
    participants,
    currentWeek,
    currentYear
  } = params;

  const count = bracketSize;
  const participantIds = participants.slice(0, count).map(p => p.id);

  const matches: TournamentMatch[] = [];
  const tournamentId = `tourn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (count === 8) {
    // 8 Participants:
    // Round 1: Quarter-Finals (Matches 1..4)
    // Round 2: Semi-Finals (Matches 5, 6)
    // Round 3: Finals (Match 7)
    const qfIds = [
      `${tournamentId}-m1`,
      `${tournamentId}-m2`,
      `${tournamentId}-m3`,
      `${tournamentId}-m4`
    ];
    const sfIds = [
      `${tournamentId}-m5`,
      `${tournamentId}-m6`
    ];
    const finalsId = `${tournamentId}-m7`;

    // Quarter-Finals
    for (let i = 0; i < 4; i++) {
      const w1 = participantIds[i * 2];
      const w2 = participantIds[i * 2 + 1];
      const nextId = i < 2 ? sfIds[0] : sfIds[1];
      const nextSlot = (i % 2 === 0 ? 1 : 2) as 1 | 2;

      matches.push({
        id: qfIds[i],
        round: 1,
        roundName: 'Quarter-Finals',
        matchIndex: i,
        wrestler1Id: w1,
        wrestler2Id: w2,
        completed: false,
        nextMatchId: nextId,
        nextMatchSlot: nextSlot
      });
    }

    // Semi-Finals
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: sfIds[i],
        round: 2,
        roundName: 'Semi-Finals',
        matchIndex: i,
        completed: false,
        nextMatchId: finalsId,
        nextMatchSlot: (i === 0 ? 1 : 2) as 1 | 2
      });
    }

    // Finals
    matches.push({
      id: finalsId,
      round: 3,
      roundName: 'Grand Final',
      matchIndex: 0,
      completed: false
    });
  } else {
    // 16 Participants:
    // Round 1: Round of 16 (8 matches)
    // Round 2: Quarter-Finals (4 matches)
    // Round 3: Semi-Finals (2 matches)
    // Round 4: Finals (1 match)
    const r16Ids = Array.from({ length: 8 }, (_, i) => `${tournamentId}-r16-m${i + 1}`);
    const qfIds = Array.from({ length: 4 }, (_, i) => `${tournamentId}-qf-m${i + 1}`);
    const sfIds = Array.from({ length: 2 }, (_, i) => `${tournamentId}-sf-m${i + 1}`);
    const finalsId = `${tournamentId}-finals`;

    // Round 1
    for (let i = 0; i < 8; i++) {
      const nextId = qfIds[Math.floor(i / 2)];
      const nextSlot = (i % 2 === 0 ? 1 : 2) as 1 | 2;
      matches.push({
        id: r16Ids[i],
        round: 1,
        roundName: 'Round of 16',
        matchIndex: i,
        wrestler1Id: participantIds[i * 2],
        wrestler2Id: participantIds[i * 2 + 1],
        completed: false,
        nextMatchId: nextId,
        nextMatchSlot: nextSlot
      });
    }

    // Quarter-Finals
    for (let i = 0; i < 4; i++) {
      const nextId = sfIds[Math.floor(i / 2)];
      const nextSlot = (i % 2 === 0 ? 1 : 2) as 1 | 2;
      matches.push({
        id: qfIds[i],
        round: 2,
        roundName: 'Quarter-Finals',
        matchIndex: i,
        completed: false,
        nextMatchId: nextId,
        nextMatchSlot: nextSlot
      });
    }

    // Semi-Finals
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: sfIds[i],
        round: 3,
        roundName: 'Semi-Finals',
        matchIndex: i,
        completed: false,
        nextMatchId: finalsId,
        nextMatchSlot: (i === 0 ? 1 : 2) as 1 | 2
      });
    }

    // Finals
    matches.push({
      id: finalsId,
      round: 4,
      roundName: 'Grand Final',
      matchIndex: 0,
      completed: false
    });
  }

  return {
    id: tournamentId,
    name,
    tagline,
    type: 'single_elimination',
    gender,
    bracketSize,
    status: 'active',
    rewardType,
    rewardTitleId,
    targetPPVId,
    participantIds,
    matches,
    createdWeek: currentWeek,
    createdYear: currentYear,
    trophyName,
    trophyIcon
  };
}

/**
 * Creates a Round Robin Tournament (Block A & Block B, e.g. 8 or 10 wrestlers)
 */
export function createRoundRobinTournament(params: {
  name: string;
  tagline: string;
  gender: 'Male' | 'Female' | 'Open';
  rewardType: TournamentRewardType;
  rewardTitleId?: string;
  targetPPVId?: string;
  trophyName: string;
  trophyIcon: string;
  participants: Wrestler[];
  currentWeek: number;
  currentYear: number;
}): Tournament {
  const {
    name,
    tagline,
    gender,
    rewardType,
    rewardTitleId,
    targetPPVId,
    trophyName,
    trophyIcon,
    participants,
    currentWeek,
    currentYear
  } = params;

  // Split participants evenly into Block A and Block B (min 6, max 10, default 8)
  const count = participants.length >= 8 ? 8 : 6;
  const half = count / 2;
  const blockAParticipants = participants.slice(0, half);
  const blockBParticipants = participants.slice(half, count);

  const participantIds = [...blockAParticipants, ...blockBParticipants].map(p => p.id);
  const tournamentId = `tourn-rr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const standings: RoundRobinStanding[] = [
    ...blockAParticipants.map(p => ({
      wrestlerId: p.id,
      block: 'A' as const,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0
    })),
    ...blockBParticipants.map(p => ({
      wrestlerId: p.id,
      block: 'B' as const,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0
    }))
  ];

  const matches: TournamentMatch[] = [];

  // Helper to generate round-robin matches for a block
  const generateBlockMatches = (blockWrestlers: Wrestler[], blockName: 'A' | 'B') => {
    let matchIdx = 0;
    for (let i = 0; i < blockWrestlers.length; i++) {
      for (let j = i + 1; j < blockWrestlers.length; j++) {
        matches.push({
          id: `${tournamentId}-blk${blockName}-m${matchIdx + 1}`,
          round: 1,
          roundName: `Block ${blockName} Match`,
          matchIndex: matchIdx++,
          block: blockName,
          wrestler1Id: blockWrestlers[i].id,
          wrestler2Id: blockWrestlers[j].id,
          completed: false
        });
      }
    }
  };

  generateBlockMatches(blockAParticipants, 'A');
  generateBlockMatches(blockBParticipants, 'B');

  // The Grand Finals match: Winner of Block A vs Winner of Block B
  const finalsMatchId = `${tournamentId}-finals`;
  matches.push({
    id: finalsMatchId,
    round: 2,
    roundName: 'Tournament Championship Final',
    matchIndex: 0,
    completed: false
  });

  return {
    id: tournamentId,
    name,
    tagline,
    type: 'round_robin',
    gender,
    bracketSize: 8,
    status: 'active',
    rewardType,
    rewardTitleId,
    targetPPVId,
    participantIds,
    matches,
    standings,
    createdWeek: currentWeek,
    createdYear: currentYear,
    trophyName,
    trophyIcon
  };
}

/**
 * Resolves a tournament match with winner/loser or draw, updates standings, and advances bracket
 */
export function resolveTournamentMatch(
  tournament: Tournament,
  matchId: string,
  winnerId: string | undefined,
  loserId: string | undefined,
  isDraw: boolean,
  ratingStars: string,
  ratingScore: number,
  finishType: FinishType,
  recap: string,
  week: number,
  year: number
): Tournament {
  const updatedMatches = tournament.matches.map(m => {
    if (m.id !== matchId) return m;
    return {
      ...m,
      completed: true,
      completedWeek: week,
      completedYear: year,
      winnerId: isDraw ? undefined : winnerId,
      loserId: isDraw ? undefined : loserId,
      isDraw,
      ratingStars,
      ratingScore,
      finishType,
      recap
    };
  });

  const currentMatch = updatedMatches.find(m => m.id === matchId);
  if (!currentMatch) return tournament;

  if (tournament.type === 'single_elimination') {
    // If it has a next match target, advance the winner
    if (currentMatch.nextMatchId && winnerId) {
      const nextId = currentMatch.nextMatchId;
      const nextSlot = currentMatch.nextMatchSlot || 1;

      for (let i = 0; i < updatedMatches.length; i++) {
        if (updatedMatches[i].id === nextId) {
          if (nextSlot === 1) {
            updatedMatches[i] = { ...updatedMatches[i], wrestler1Id: winnerId };
          } else {
            updatedMatches[i] = { ...updatedMatches[i], wrestler2Id: winnerId };
          }
          break;
        }
      }
    }

    // Check if the match was the final
    const isFinalsMatch = currentMatch.roundName.includes('Final');
    let status = tournament.status;
    let winner = tournament.winnerId;
    let runnerUp = tournament.runnerUpId;
    let compWeek = tournament.completedWeek;
    let compYear = tournament.completedYear;

    if (isFinalsMatch && winnerId) {
      status = 'completed';
      winner = winnerId;
      runnerUp = loserId;
      compWeek = week;
      compYear = year;
    }

    return {
      ...tournament,
      matches: updatedMatches,
      status,
      winnerId: winner,
      runnerUpId: runnerUp,
      completedWeek: compWeek,
      completedYear: compYear
    };
  } else {
    // Round Robin:
    // Update Standings
    let updatedStandings = (tournament.standings || []).map(s => ({ ...s }));

    if (currentMatch.block && currentMatch.wrestler1Id && currentMatch.wrestler2Id) {
      const w1 = currentMatch.wrestler1Id;
      const w2 = currentMatch.wrestler2Id;

      updatedStandings = updatedStandings.map(s => {
        if (s.wrestlerId === w1) {
          return {
            ...s,
            matchesPlayed: s.matchesPlayed + 1,
            wins: s.wins + (winnerId === w1 ? 1 : 0),
            losses: s.losses + (loserId === w1 ? 1 : 0),
            draws: s.draws + (isDraw ? 1 : 0),
            points: s.points + (winnerId === w1 ? 2 : isDraw ? 1 : 0)
          };
        }
        if (s.wrestlerId === w2) {
          return {
            ...s,
            matchesPlayed: s.matchesPlayed + 1,
            wins: s.wins + (winnerId === w2 ? 1 : 0),
            losses: s.losses + (loserId === w2 ? 1 : 0),
            draws: s.draws + (isDraw ? 1 : 0),
            points: s.points + (winnerId === w2 ? 2 : isDraw ? 1 : 0)
          };
        }
        return s;
      });

      // Check if all Block A and Block B matches are finished
      const blockMatches = updatedMatches.filter(m => m.block === 'A' || m.block === 'B');
      const allBlockMatchesDone = blockMatches.every(m => m.completed);

      if (allBlockMatchesDone) {
        // Find Block A top seed
        const blockAStandings = updatedStandings
          .filter(s => s.block === 'A')
          .sort((a, b) => b.points - a.points || b.wins - a.wins);

        // Find Block B top seed
        const blockBStandings = updatedStandings
          .filter(s => s.block === 'B')
          .sort((a, b) => b.points - a.points || b.wins - a.wins);

        const blockAWinner = blockAStandings[0]?.wrestlerId;
        const blockBWinner = blockBStandings[0]?.wrestlerId;

        // Place into Finals match
        const finalsMatchIdx = updatedMatches.findIndex(m => m.roundName.includes('Final'));
        if (finalsMatchIdx !== -1 && blockAWinner && blockBWinner) {
          updatedMatches[finalsMatchIdx] = {
            ...updatedMatches[finalsMatchIdx],
            wrestler1Id: blockAWinner,
            wrestler2Id: blockBWinner
          };
        }
      }
    }

    // Check if Finals match is completed
    const finalsMatch = updatedMatches.find(m => m.roundName.includes('Final'));
    let status = tournament.status;
    let winner = tournament.winnerId;
    let runnerUp = tournament.runnerUpId;
    let compWeek = tournament.completedWeek;
    let compYear = tournament.completedYear;

    if (finalsMatch && finalsMatch.completed && finalsMatch.winnerId) {
      status = 'completed';
      winner = finalsMatch.winnerId;
      runnerUp = finalsMatch.loserId;
      compWeek = week;
      compYear = year;
    }

    return {
      ...tournament,
      matches: updatedMatches,
      standings: updatedStandings,
      status,
      winnerId: winner,
      runnerUpId: runnerUp,
      completedWeek: compWeek,
      completedYear: compYear
    };
  }
}

/**
 * Fast deterministic local simulator for a tournament match
 * Consumes 0 AI quota! Computes realistic star rating, workrate, momentum, and recap.
 */
export function simulateTournamentMatchOutcome(
  w1: Wrestler,
  w2: Wrestler,
  roundName: string
): {
  winnerId: string;
  loserId: string;
  isDraw: boolean;
  ratingStars: string;
  ratingScore: number;
  finishType: FinishType;
  recap: string;
} {
  // Calculate power scores
  const score1 = (w1.overness * 0.5) + (w1.workrate * 0.4) + ((w1.stamina - w1.fatigue) * 0.1) + (Math.random() * 20);
  const score2 = (w2.overness * 0.5) + (w2.workrate * 0.4) + ((w2.stamina - w2.fatigue) * 0.1) + (Math.random() * 20);

  // Tiny chance of draw (e.g. 30-min time limit draw) only in Round Robin block matches
  const isDraw = Math.abs(score1 - score2) < 0.5 && roundName.includes('Block') && Math.random() < 0.08;

  let winner = w1;
  let loser = w2;

  if (!isDraw) {
    if (score2 > score1) {
      winner = w2;
      loser = w1;
    }
  }

  // Workrate and quality calculation
  const avgWorkrate = (w1.workrate + w2.workrate) / 2;
  const avgOverness = (w1.overness + w2.overness) / 2;
  const baseMatchScore = Math.round((avgWorkrate * 0.55) + (avgOverness * 0.45));
  const excitementBonus = Math.floor(Math.random() * 10) + 2;
  const matchScore = Math.min(100, Math.max(50, baseMatchScore + excitementBonus));

  // Determine star rating string
  let stars = '★★★';
  if (matchScore >= 95) stars = '★★★★★ Classic';
  else if (matchScore >= 90) stars = '★★★★3/4 Showstealer';
  else if (matchScore >= 85) stars = '★★★★1/2 Masterpiece';
  else if (matchScore >= 80) stars = '★★★★ Excellent';
  else if (matchScore >= 75) stars = '★★★1/2 Great';
  else if (matchScore >= 70) stars = '★★★ Good';
  else if (matchScore >= 60) stars = '★★1/2 Solid';
  else stars = '★★ Subpar';

  // Finish type
  const finishes: FinishType[] = [
    'Clean Pinfall',
    'Submission',
    'Distraction Rollup',
    'Weapon / Foreign Object'
  ];
  const finishType = finishes[Math.floor(Math.random() * finishes.length)];

  // Descriptive narrative recap
  let recap = '';
  if (isDraw) {
    recap = `${w1.name} and ${w2.name} fought through a relentless, back-and-forth contest until the time limit bell rang! Both walk away with 1 tournament point.`;
  } else {
    const victoryMoves = [
      'executed a thunderous finishing maneuver',
      'locked in an inescapable submission hold',
      'hit an emphatic top-rope counter',
      'capitalized on a brutal reversal',
      'sealed the victory with signature offense'
    ];
    const chosenMove = victoryMoves[Math.floor(Math.random() * victoryMoves.length)];
    recap = `${winner.name} ${chosenMove} to defeat ${loser.name} via ${finishType} in this dramatic ${roundName} encounter.`;
  }

  return {
    winnerId: winner.id,
    loserId: loser.id,
    isDraw,
    ratingStars: stars,
    ratingScore: matchScore,
    finishType,
    recap
  };
}

/**
 * Handles crowning the tournament champion:
 * - Increases winner overness & morale
 * - Gives runner-up respect boost
 * - Awards title if crown_title
 * - Generates major celebratory News headline
 */
export function applyTournamentCompletionEffects(
  tournament: Tournament,
  promotion: Promotion,
  currentWeek: number,
  currentYear: number
): {
  updatedPromotion: Promotion;
  newsItem: NewsItem;
} {
  const winner = promotion.roster.find(w => w.id === tournament.winnerId);
  const runnerUp = promotion.roster.find(w => w.id === tournament.runnerUpId);

  const updatedRoster = promotion.roster.map(w => {
    if (w.id === tournament.winnerId) {
      return {
        ...w,
        overness: Math.min(100, w.overness + 12),
        morale: Math.min(100, w.morale + 15),
        wins: w.wins + 1,
        peakOverness: Math.max(w.peakOverness || w.overness, w.overness + 12)
      };
    }
    if (w.id === tournament.runnerUpId) {
      return {
        ...w,
        overness: Math.min(100, w.overness + 4),
        morale: Math.min(100, w.morale + 5)
      };
    }
    return w;
  });

  let updatedTitles = [...promotion.titles];

  // If tournament reward is crown_title, award the title
  if (tournament.rewardType === 'crown_title' && tournament.rewardTitleId && winner) {
    updatedTitles = updatedTitles.map(t => {
      if (t.id === tournament.rewardTitleId) {
        return {
          ...t,
          currentHolderIds: [winner.id],
          defenses: 0,
          history: [
            {
              id: `rh-${Date.now()}`,
              reignNumber: (t.history?.length || 0) + 1,
              holderNames: winner.name,
              holderIds: [winner.id],
              wonWeek: currentWeek,
              wonYear: currentYear,
              defenses: 0,
              eventWonAt: `${tournament.name} Finals`,
              notes: `Won tournament championship final to claim the title!`,
              isCurrent: true
            },
            ...(t.history || []).map(h => ({ ...h, isCurrent: false }))
          ]
        };
      }
      return t;
    });
  }

  // Update promotion prestige and fanbase
  const newPrestige = Math.min(100, promotion.prestige + 2);
  const newFanbase = promotion.fanbase + 1500;

  // Archive tournament
  const currentTournaments = (promotion.tournaments || []).filter(t => t.id !== tournament.id);
  const completedTournament = {
    ...tournament,
    status: 'completed' as const,
    completedWeek: currentWeek,
    completedYear: currentYear
  };

  const updatedCompleted = [
    completedTournament,
    ...(promotion.completedTournaments || [])
  ];

  const newsItem: NewsItem = {
    id: `news-tourn-${Date.now()}`,
    week: currentWeek,
    category: 'Promotion',
    headline: `🏆 ${winner ? winner.name : 'Unknown'} hoists the ${tournament.trophyName}!`,
    details: `${winner ? winner.name : 'The champion'} has emerged victorious in the ${tournament.name}, conquering ${runnerUp ? runnerUp.name : 'all challengers'} in the tournament finals to cement a legacy of greatness!`,
    importance: 'High'
  };

  const updatedPromotion: Promotion = {
    ...promotion,
    roster: updatedRoster,
    titles: updatedTitles,
    prestige: newPrestige,
    fanbase: newFanbase,
    tournaments: currentTournaments,
    completedTournaments: updatedCompleted
  };

  return {
    updatedPromotion,
    newsItem
  };
}

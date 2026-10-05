import { 
  Championship, 
  Promotion, 
  Wrestler, 
  TagTeam, 
  NewsItem, 
  FinishType 
} from '../types';
import { 
  filterEligibleWrestlersForTitle, 
  calculateTitleContenderRankings,
  getChampionshipGender
} from './titleUtils';

export interface VacancyContender {
  id: string;
  name: string;
  isTagTeam: boolean;
  wrestlers: Wrestler[];
  tagTeam?: TagTeam;
  overness: number;
  workrate: number;
  avatarUrl?: string;
  seed: number;
  momentum?: string;
}

export interface TournamentRoundMatchResult {
  matchId: string;
  roundName: string;
  contender1: VacancyContender;
  contender2: VacancyContender;
  winner: VacancyContender;
  loser: VacancyContender;
  ratingStars: string;
  ratingScore: number;
  finishType: FinishType;
  recap: string;
}

export interface AutomatedTournamentResult {
  tournamentName: string;
  bracketSize: 4 | 8 | 16;
  isTagTeam: boolean;
  participants: VacancyContender[];
  roundResults: {
    roundName: string;
    matches: TournamentRoundMatchResult[];
  }[];
  winner: VacancyContender;
  runnerUp: VacancyContender;
  semiFinalists: VacancyContender[];
  averageMatchScore: number;
  tournamentMVP: VacancyContender;
}

export interface BattleRoyalElimination {
  order: number;
  eliminatedContender: VacancyContender;
  eliminatedBy: VacancyContender;
  eliminationMethod: string;
  timeInMatchMinutes: number;
}

export interface BattleRoyalResult {
  eventName: string;
  isTagTeam: boolean;
  participantCount: number;
  participants: VacancyContender[];
  eliminations: BattleRoyalElimination[];
  finalFour: VacancyContender[];
  runnerUp: VacancyContender;
  winner: VacancyContender;
  mostEliminationsContender: VacancyContender;
  mostEliminationsCount: number;
  ironManContender: VacancyContender;
  matchScore: number;
  ratingStars: string;
  finishDramaRecap: string;
}

/**
 * Checks whether a championship is designed for tag teams.
 */
export function isTagChampionship(title: Championship): boolean {
  return Boolean(
    title.isTagTeam ||
    title.type === 'Tag Team' ||
    title.division === 'Tag Team' ||
    (title.name && /(tag\s*team|tag\s*championship|world\s*tag|tag\s*belts|tag\s*titles|duo|twins|tandem|pairs)/i.test(title.name)) ||
    (title.history && title.history.some(h => (h.holderIds && h.holderIds.length >= 2) || (h.holderNames && (h.holderNames.includes('&') || h.holderNames.includes(' and ')))))
  );
}

/**
 * Gathers and seeds eligible contenders for a title vacancy tournament or battle royal.
 */
export function getEligibleContendersForVacancy(
  title: Championship,
  promotion: Promotion,
  maxCount: number = 16
): VacancyContender[] {
  const isTag = isTagChampionship(title);
  const currentHolders = title.currentHolderIds || [];

  if (isTag) {
    // 1. Tag Teams
    const activeTeams = (promotion.tagTeams || []).filter(tt => {
      if (tt.isActive === false) return false;
      const isHolder = tt.memberIds.some(id => currentHolders.includes(id));
      if (isHolder) return false;

      const members = tt.memberIds
        .map(id => promotion.roster.find(w => w.id === id))
        .filter((w): w is Wrestler => Boolean(w && !w.isRetired && !w.injury?.injured));
      return members.length >= 2;
    });

    const titleGender = getChampionshipGender(title);
    const genderMatchingTeams = activeTeams.filter(tt => {
      if (titleGender === 'Open') return true;
      const members = tt.memberIds
        .map(id => promotion.roster.find(w => w.id === id))
        .filter((w): w is Wrestler => Boolean(w));
      return members.every(m => m.gender === titleGender);
    });

    const eligibleTeams = genderMatchingTeams.length > 0 ? genderMatchingTeams : activeTeams;
    const teamContenders: VacancyContender[] = eligibleTeams.map((team, idx) => {
      const members = team.memberIds
        .map(id => promotion.roster.find(w => w.id === id))
        .filter((w): w is Wrestler => Boolean(w))
        .slice(0, 2);

      const avgOver = Math.round(members.reduce((acc, m) => acc + m.overness, 0) / (members.length || 1));
      const avgWork = Math.round(members.reduce((acc, m) => acc + m.workrate, 0) / (members.length || 1));

      return {
        id: team.id,
        name: team.name || members.map(m => m.name).join(' & '),
        isTagTeam: true,
        wrestlers: members,
        tagTeam: team,
        overness: avgOver,
        workrate: avgWork,
        seed: idx + 1,
        momentum: (team.wins || 0) > (team.losses || 0) ? 'Hot' : 'Steady'
      };
    });

    // If we don't have enough tag teams, create dynamic pairs from eligible roster
    if (teamContenders.length < maxCount) {
      const eligibleWrestlers = filterEligibleWrestlersForTitle(title, promotion.roster)
        .filter(w => !w.isRetired && !w.injury?.injured && !teamContenders.some(tc => tc.wrestlers.some(tw => tw.id === w.id)))
        .sort((a, b) => (b.overness + b.workrate) - (a.overness + a.workrate));

      for (let i = 0; i < eligibleWrestlers.length - 1 && teamContenders.length < maxCount; i += 2) {
        const w1 = eligibleWrestlers[i];
        const w2 = eligibleWrestlers[i + 1];
        teamContenders.push({
          id: `pair-${w1.id}-${w2.id}`,
          name: `${w1.name.split(' ')[0]} & ${w2.name.split(' ')[0]}`,
          isTagTeam: true,
          wrestlers: [w1, w2],
          overness: Math.round((w1.overness + w2.overness) / 2),
          workrate: Math.round((w1.workrate + w2.workrate) / 2),
          seed: teamContenders.length + 1,
          momentum: 'Steady'
        });
      }
    }

    return teamContenders.slice(0, maxCount);
  }

  // 2. Singles Championship Contenders
  const rankings = calculateTitleContenderRankings(
    title,
    promotion.roster,
    promotion.tagTeams,
    maxCount * 2
  );

  const contendersFromRankings: VacancyContender[] = rankings
    .filter(r => r.wrestler && !r.wrestler.isRetired && !r.wrestler.injury?.injured)
    .map((r, idx) => ({
      id: r.wrestler!.id,
      name: r.wrestler!.name,
      isTagTeam: false,
      wrestlers: [r.wrestler!],
      overness: r.wrestler!.overness,
      workrate: r.wrestler!.workrate,
      seed: idx + 1,
      momentum: r.momentum
    }));

  if (contendersFromRankings.length >= 8) {
    return contendersFromRankings.slice(0, maxCount);
  }

  // Fallback to all eligible uninjured roster members
  const eligibleRoster = filterEligibleWrestlersForTitle(title, promotion.roster)
    .filter(w => !w.isRetired && !w.injury?.injured && !contendersFromRankings.some(c => c.id === w.id))
    .sort((a, b) => (b.overness + b.workrate) - (a.overness + a.workrate));

  const fallbackContenders: VacancyContender[] = eligibleRoster.map((w, idx) => ({
    id: w.id,
    name: w.name,
    isTagTeam: false,
    wrestlers: [w],
    overness: w.overness,
    workrate: w.workrate,
    seed: contendersFromRankings.length + idx + 1,
    momentum: 'Steady'
  }));

  const all = [...contendersFromRankings, ...fallbackContenders];
  return all.slice(0, maxCount);
}

/**
 * Simulates a single match between two contenders.
 */
function simulateContenderMatchOutcome(
  c1: VacancyContender,
  c2: VacancyContender,
  roundName: string
): {
  winner: VacancyContender;
  loser: VacancyContender;
  ratingStars: string;
  ratingScore: number;
  finishType: FinishType;
  recap: string;
} {
  const score1 = (c1.overness * 0.52) + (c1.workrate * 0.40) + (Math.random() * 22);
  const score2 = (c2.overness * 0.52) + (c2.workrate * 0.40) + (Math.random() * 22);

  const winner = score1 >= score2 ? c1 : c2;
  const loser = score1 >= score2 ? c2 : c1;

  const avgWorkrate = (c1.workrate + c2.workrate) / 2;
  const avgOverness = (c1.overness + c2.overness) / 2;
  const baseScore = Math.round((avgWorkrate * 0.55) + (avgOverness * 0.45));
  const excitementBonus = Math.floor(Math.random() * 10) + 3;
  const ratingScore = Math.min(100, Math.max(55, baseScore + excitementBonus));

  let ratingStars = '★★★';
  if (ratingScore >= 95) starsRating: ratingStars = '★★★★★ Classic';
  else if (ratingScore >= 90) ratingStars = '★★★★3/4 Showstealer';
  else if (ratingScore >= 85) ratingStars = '★★★★1/2 Masterpiece';
  else if (ratingScore >= 80) ratingStars = '★★★★ Excellent';
  else if (ratingScore >= 75) ratingStars = '★★★1/2 Great';
  else if (ratingScore >= 70) ratingStars = '★★★ Good';
  else if (ratingScore >= 60) ratingStars = '★★1/2 Solid';

  const finishTypes: FinishType[] = [
    'Clean Pinfall', 
    'Submission', 
    'Distraction Rollup', 
    'Weapon / Foreign Object'
  ];

  const finishType = finishTypes[Math.floor(Math.random() * finishTypes.length)];

  const recaps = c1.isTagTeam
    ? [
        `${winner.name} coordinated a flawless tandem combo to pin ${loser.name} in an exhilarating tag team clinic!`,
        `${winner.name} isolated their opponent with crisp ring-cutting tactics and delivered their team finisher for the 3-count over ${loser.name}.`,
        `In an electrifying tag encounter, ${winner.name} broke up a pinfall attempt and scored the dramatic decider against ${loser.name}.`,
        `${winner.name} capitalized on a high-stakes miscommunication to roll up ${loser.name} and advance in the bracket!`
      ]
    : [
        `${winner.name} countered a desperate offensive burst, hit their trademark finisher, and pinned ${loser.name} in a pulse-pounding bout!`,
        `${winner.name} trapped ${loser.name} in the center of the ring with a devastating submission, forcing an immediate tap out!`,
        `After an intense back-and-forth exchange, ${winner.name} caught ${loser.name} off guard with a quick rollup reversal for the victory!`,
        `${winner.name} weathered a relentless assault from ${loser.name} before landing an emphatic knockout maneuver to seal the victory!`
      ];

  const recap = recaps[Math.floor(Math.random() * recaps.length)];

  return {
    winner,
    loser,
    ratingStars,
    ratingScore,
    finishType,
    recap
  };
}

/**
 * Simulates an automated single-elimination tournament to crown a vacant championship.
 */
export function simulateAutomatedTournamentForTitle(
  title: Championship,
  promotion: Promotion,
  bracketSize: 4 | 8 | 16 = 8
): AutomatedTournamentResult {
  const isTag = isTagChampionship(title);
  let candidates = getEligibleContendersForVacancy(title, promotion, bracketSize);

  // If insufficient, adjust bracket size to 4
  let actualBracketSize = bracketSize;
  if (candidates.length < 8) {
    actualBracketSize = 4;
  }
  if (candidates.length < actualBracketSize) {
    actualBracketSize = 4;
  }

  const participants = candidates.slice(0, actualBracketSize);
  const tournamentName = `${title.shortName || title.name} Championship Gold Rush Tournament`;
  const rounds: { roundName: string; matches: TournamentRoundMatchResult[] }[] = [];

  let currentRoundParticipants = [...participants];
  let roundNum = 1;
  const semiFinalists: VacancyContender[] = [];
  let runnerUp: VacancyContender = participants[1] || participants[0];
  const winCounts = new Map<string, number>();

  while (currentRoundParticipants.length > 1) {
    const count = currentRoundParticipants.length;
    let roundName = `Round ${roundNum}`;
    if (count === 2) roundName = 'Championship Grand Final';
    else if (count === 4) roundName = 'Semi-Finals';
    else if (count === 8) roundName = 'Quarter-Finals';
    else if (count === 16) roundName = 'Round of 16';

    const roundMatches: TournamentRoundMatchResult[] = [];
    const nextRoundWinners: VacancyContender[] = [];

    for (let i = 0; i < currentRoundParticipants.length; i += 2) {
      const c1 = currentRoundParticipants[i];
      const c2 = currentRoundParticipants[i + 1];

      if (count === 4) {
        if (!semiFinalists.some(s => s.id === c1.id)) semiFinalists.push(c1);
        if (!semiFinalists.some(s => s.id === c2.id)) semiFinalists.push(c2);
      }

      const matchOutcome = simulateContenderMatchOutcome(c1, c2, roundName);
      if (count === 2) {
        runnerUp = matchOutcome.loser;
      }

      winCounts.set(matchOutcome.winner.id, (winCounts.get(matchOutcome.winner.id) || 0) + 1);

      roundMatches.push({
        matchId: `vacant-tourn-${roundNum}-${i / 2}`,
        roundName,
        contender1: c1,
        contender2: c2,
        winner: matchOutcome.winner,
        loser: matchOutcome.loser,
        ratingStars: matchOutcome.ratingStars,
        ratingScore: matchOutcome.ratingScore,
        finishType: matchOutcome.finishType,
        recap: matchOutcome.recap
      });

      nextRoundWinners.push(matchOutcome.winner);
    }

    rounds.push({ roundName, matches: roundMatches });
    currentRoundParticipants = nextRoundWinners;
    roundNum++;
  }

  const winner = currentRoundParticipants[0];

  const allMatches = rounds.flatMap(r => r.matches);
  const avgScore = Math.round(
    allMatches.reduce((acc, m) => acc + m.ratingScore, 0) / (allMatches.length || 1)
  );

  let tournamentMVP = winner;
  let maxWins = 0;
  winCounts.forEach((count, id) => {
    if (count > maxWins) {
      maxWins = count;
      const c = participants.find(p => p.id === id);
      if (c) tournamentMVP = c;
    }
  });

  return {
    tournamentName,
    bracketSize: actualBracketSize,
    isTagTeam: isTag,
    participants,
    roundResults: rounds,
    winner,
    runnerUp,
    semiFinalists,
    averageMatchScore: avgScore,
    tournamentMVP
  };
}

/**
 * Simulates a full Over-The-Top-Rope Battle Royal to crown a vacant championship.
 */
export function simulateBattleRoyalForTitle(
  title: Championship,
  promotion: Promotion,
  participantCount: number = 15
): BattleRoyalResult {
  const isTag = isTagChampionship(title);
  const eligible = getEligibleContendersForVacancy(title, promotion, participantCount);
  let participants = [...eligible];

  if (participants.length < 6) {
    participantCount = Math.max(4, participants.length);
  }

  const eventName = `${title.shortName || title.name} Vacant Title Over-The-Top-Rope Battle Royal`;

  const eliminationMethods = [
    'clotheslined violently over the top rope onto the floor',
    'hurled over the turnbuckle with a vicious backdrop',
    'dumped out following a lightning enzuigiri kick on the ring apron',
    'eliminated after a dramatic fist fight on the apron',
    'tossed over the ropes by a relentless double-team offensive',
    'back body dropped hard down to the arena floor',
    'pulled over the top rope during a desperate struggle',
    'catapulted over the ropes after a spear attempt missed the mark'
  ];

  const eliminations: BattleRoyalElimination[] = [];
  const eliminationTally = new Map<string, number>();

  let remaining = [...participants];
  let timeTracker = 3;

  while (remaining.length > 1) {
    const candidateIdx = Math.floor(Math.random() * remaining.length);
    const eliminated = remaining[candidateIdx];

    const possibleEliminators = remaining.filter(c => c.id !== eliminated.id);
    const eliminator = possibleEliminators.sort((a, b) => {
      const scoreA = a.overness + a.workrate + (Math.random() * 30);
      const scoreB = b.overness + b.workrate + (Math.random() * 30);
      return scoreB - scoreA;
    })[0] || possibleEliminators[0];

    const method = eliminationMethods[Math.floor(Math.random() * eliminationMethods.length)];
    timeTracker += Math.floor(Math.random() * 3) + 1;

    eliminations.push({
      order: eliminations.length + 1,
      eliminatedContender: eliminated,
      eliminatedBy: eliminator,
      eliminationMethod: method,
      timeInMatchMinutes: timeTracker
    });

    eliminationTally.set(eliminator.id, (eliminationTally.get(eliminator.id) || 0) + 1);
    remaining = remaining.filter(c => c.id !== eliminated.id);
  }

  const winner = remaining[0];
  const lastElimination = eliminations[eliminations.length - 1];
  const runnerUp = lastElimination ? lastElimination.eliminatedContender : participants[1];

  const finalFourEliminated = eliminations.slice(-3).map(e => e.eliminatedContender);
  const finalFour = [winner, ...finalFourEliminated];

  let mostElimsContender = winner;
  let mostElimsCount = 0;
  eliminationTally.forEach((count, id) => {
    if (count > mostElimsCount) {
      mostElimsCount = count;
      const found = participants.find(p => p.id === id);
      if (found) mostElimsContender = found;
    }
  });

  const ironManContender = winner;

  const avgWorkrate = participants.reduce((acc, p) => acc + p.workrate, 0) / (participants.length || 1);
  const avgOverness = participants.reduce((acc, p) => acc + p.overness, 0) / (participants.length || 1);
  const baseScore = Math.round(avgWorkrate * 0.5 + avgOverness * 0.4 + 12);
  const matchScore = Math.min(100, Math.max(65, baseScore + Math.floor(Math.random() * 8)));

  let ratingStars = '★★★1/2';
  if (matchScore >= 90) ratingStars = '★★★★1/2 Showstealer';
  else if (matchScore >= 85) ratingStars = '★★★★ Masterpiece';
  else if (matchScore >= 80) ratingStars = '★★★3/4 Great';
  else if (matchScore >= 75) ratingStars = '★★★1/2 Good';

  const finishDramaRecap = `In an electric final showdown, ${winner.name} and ${runnerUp.name} teetered on the apron with the vacant ${title.name} suspended above the ring. ${winner.name} countered a running clothesline, skinned the cat back into the ring, and hoisted ${runnerUp.name} over the top rope down to the floor to become the NEW champion!`;

  return {
    eventName,
    isTagTeam: isTag,
    participantCount: participants.length,
    participants,
    eliminations,
    finalFour,
    runnerUp,
    winner,
    mostEliminationsContender: mostElimsContender,
    mostEliminationsCount: mostElimsCount,
    ironManContender,
    matchScore,
    ratingStars,
    finishDramaRecap
  };
}

/**
 * Applies the result of a title vacancy crowning event (Tournament or Battle Royal)
 * to the promotion state:
 * - Updates championship currentHolderIds and defenses
 * - Appends historic crowning reign to title.history
 * - Boosts winner overness & morale
 * - Generates major official NewsItem
 */
export function applyVacancyCrowningResult(
  title: Championship,
  winner: VacancyContender,
  runnerUp: VacancyContender,
  eventType: 'tournament' | 'battle_royal',
  eventDetails: {
    eventName: string;
    notes: string;
    reignRating: string;
    matchScore: number;
    participantsCount: number;
  },
  promotion: Promotion,
  currentWeek: number = 1,
  currentYear: number = 1
): {
  updatedPromotion: Promotion;
  newsItem: NewsItem;
} {
  const reignId = `reign-${Date.now()}`;
  const reignNumber = (title.history?.length || 0) + 1;
  const winnerWrestlerIds = winner.wrestlers.map(w => w.id);

  const newReign = {
    id: reignId,
    reignNumber,
    holderNames: winner.name,
    holderIds: winnerWrestlerIds,
    wonWeek: currentWeek,
    wonYear: currentYear,
    defenses: 0,
    eventWonAt: eventDetails.eventName,
    notes: eventDetails.notes,
    reignRating: eventDetails.reignRating,
    isCurrent: true
  };

  const updatedTitles = promotion.titles.map(t => {
    if (t.id === title.id) {
      // Conclude old reign if active
      const history = [...t.history];
      if (history.length > 0 && history[0].isCurrent !== false && !history[0].lostWeek) {
        history[0] = {
          ...history[0],
          lostWeek: currentWeek,
          lostYear: currentYear,
          isCurrent: false,
          notes: (history[0].notes ? history[0].notes + ' • ' : '') + 'Vacated before crowning tournament'
        };
      }
      return {
        ...t,
        currentHolderIds: winnerWrestlerIds,
        defenses: 0,
        history: [newReign, ...history]
      };
    }
    return t;
  });

  const runnerUpIds = runnerUp.wrestlers.map(w => w.id);

  // Boost winner & runner-up
  const updatedRoster = promotion.roster.map(w => {
    if (winnerWrestlerIds.includes(w.id)) {
      return {
        ...w,
        championshipIds: Array.from(new Set([...w.championshipIds, title.id])),
        overness: Math.min(100, w.overness + 6),
        morale: Math.min(100, w.morale + 12),
        wins: (w.wins || 0) + (eventType === 'tournament' ? 3 : 1)
      };
    }
    if (runnerUpIds.includes(w.id)) {
      return {
        ...w,
        overness: Math.min(100, w.overness + 2),
        morale: Math.min(100, w.morale + 4),
        losses: (w.losses || 0) + 1
      };
    }
    return w;
  });

  // News item
  const newsHeadline = eventType === 'tournament'
    ? `🏆 NEW CHAMPION: ${winner.name} Wins Tournament to Capture Vacant ${title.name}!`
    : `👑 NEW CHAMPION: ${winner.name} Outlasts ${eventDetails.participantsCount} Entrants in Battle Royal for ${title.name}!`;

  const newsStory = eventType === 'tournament'
    ? `${promotion.name} has officially crowned a new champion! Following the vacancy of the ${title.name}, ${winner.name} fought through an elite tournament field, culminating in a dramatic final victory over ${runnerUp.name} (${eventDetails.reignRating}) to hoist the gold.`
    : `A chaotic ${eventDetails.participantsCount}-superstar Battle Royal concluded with ${winner.name} last eliminating ${runnerUp.name} to capture the vacant ${title.name} in an unforgettable spectacle (${eventDetails.reignRating})!`;

  const newsItem: NewsItem = {
    id: `news-vacant-crown-${Date.now()}`,
    week: currentWeek,
    category: 'Promotion',
    importance: 'High',
    headline: newsHeadline,
    details: newsStory
  };

  return {
    updatedPromotion: {
      ...promotion,
      titles: updatedTitles,
      roster: updatedRoster
    },
    newsItem
  };
}

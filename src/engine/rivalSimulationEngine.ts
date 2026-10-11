import { 
  Promotion, 
  ShowResult, 
  RatingsWarState, 
  RivalPromotion, 
  RivalWeeklyBattleResult, 
  NewsItem 
} from '../types';
import { getDefaultRatingsWarState } from '../data/rivalPromotionsDefaults';

export function simulateWeeklyRatingsWar(
  promotion: Promotion,
  playerShowResult: ShowResult,
  currentWeek: number,
  currentYear: number
): {
  updatedRatingsWar: RatingsWarState;
  battleResult: RivalWeeklyBattleResult;
  warNews: NewsItem[];
  networkSatisfactionDelta: number;
  bonusRightsCash: number;
} {
  const currentState = promotion.ratingsWar || getDefaultRatingsWarState(promotion);
  const rivals = currentState.rivalPromotions.map(r => ({ ...r }));
  const warNews: NewsItem[] = [];

  // 1. Simulate each rival promotion's weekly card
  const simulatedRivalShows: RivalWeeklyBattleResult['rivals'] = [];

  rivals.forEach(rival => {
    // Score variance based on prestige and head booker style (-6 to +7 pts)
    const baseScore = Math.min(92, Math.max(70, Math.round(rival.prestige * 0.95)));
    const variance = Math.floor(Math.random() * 14) - 6;
    const rivalScore = Math.max(68, Math.min(95, baseScore + variance));

    // Rating is proportional to score and fanbase (e.g. 2.6 - 3.9)
    const ratingVariance = (rivalScore - 75) * 0.025;
    const baseRating = rival.averageWeeklyRating;
    const rivalRating = Number((Math.max(1.8, Math.min(4.8, baseRating + ratingVariance + (Math.random() * 0.15 - 0.07)))).toFixed(2));
    const rivalViewers = Math.round(rivalRating * 1020000);

    // Pick main event participants from key stars
    const starA = rival.keyStars[0] || 'Top Contender';
    const starB = rival.keyStars[1] || 'Challenger';
    const stipulation = Math.random() < 0.35 ? 'No DQ Street Fight' : Math.random() < 0.2 ? 'Steel Cage Match' : 'Singles Showdown';
    const mainEvent = `${starA} def. ${starB} in a ${stipulation}`;

    // Update rival's history
    rival.ratingsHistory.unshift({
      week: currentWeek,
      year: currentYear,
      rating: rivalRating,
      viewers: rivalViewers,
      showScore: rivalScore
    });
    if (rival.ratingsHistory.length > 12) rival.ratingsHistory.pop();

    const headlinesPool = [
      `${rival.name} drew strong demographics for their ${mainEvent}.`,
      `${rival.name} shook up the card with high drama on ${rival.networkName}.`,
      `${rival.name} broadcast delivered intense action, rating ${rivalRating}.`,
      `${rival.name} promoted a heated face-off in their weekly main event.`
    ];
    const headline = headlinesPool[Math.floor(Math.random() * headlinesPool.length)];

    simulatedRivalShows.push({
      rivalId: rival.id,
      rivalName: rival.name,
      rivalShowName: rival.weeklyShowName,
      rating: rivalRating,
      viewers: rivalViewers,
      score: rivalScore,
      mainEvent,
      headline
    });
  });

  // 2. Head-to-Head Comparison with Primary Rival (or top competing show)
  const primaryRival = simulatedRivalShows[0];
  const playerViewersNum = Math.round((playerShowResult.tvRating || 3.0) * 1000000);
  const isPlayerWinner = playerViewersNum >= primaryRival.viewers;
  const marginViewers = playerViewersNum - primaryRival.viewers;

  const winnerName = isPlayerWinner ? promotion.name : primaryRival.rivalName;

  let narrativeRecap = '';
  let networkSatisfactionDelta = 0;
  let bonusRightsCash = 0;

  if (isPlayerWinner) {
    if (marginViewers > 200000) {
      narrativeRecap = `★ DECISIVE RATINGS VICTORY! ${promotion.name} routed ${primaryRival.rivalName} by +${Math.round(marginViewers / 1000)}k viewers (${playerShowResult.tvRating} vs ${primaryRival.rating}). Broadcasters are celebrating your demographic dominance!`;
      networkSatisfactionDelta = 3;
    } else {
      narrativeRecap = `✓ EDGED OUT COMPETITION! ${promotion.name} took the week with a +${Math.round(marginViewers / 1000)}k viewer margin against ${primaryRival.rivalName} in a closely contested television war.`;
      networkSatisfactionDelta = 1;
    }
  } else {
    const deficit = Math.abs(marginViewers);
    if (deficit > 200000) {
      narrativeRecap = `⚠ RATINGS BLOW: ${primaryRival.rivalName} conquered the broadcast war by +${Math.round(deficit / 1000)}k viewers (${primaryRival.rating} vs ${playerShowResult.tvRating}). Network brass sent a stern memo warning against stale booking.`;
      networkSatisfactionDelta = -3;
    } else {
      narrativeRecap = `⚔ NARROW DEFEAT: ${primaryRival.rivalName} edged ahead by ${Math.round(deficit / 1000)}k viewers this week. Next week's card needs high-octane star power to reclaim the lead!`;
      networkSatisfactionDelta = -1;
    }
  }

  // 3. Update Streaks and Records
  let playerWins = currentState.playerWins + (isPlayerWinner ? 1 : 0);
  let rivalWins = currentState.rivalWins + (!isPlayerWinner ? 1 : 0);
  let currentStreak = isPlayerWinner 
    ? (currentState.currentStreak > 0 ? currentState.currentStreak + 1 : 1)
    : (currentState.currentStreak < 0 ? currentState.currentStreak - 1 : -1);

  // Bonus TV rights money for a hot 3+ win streak!
  if (currentStreak >= 3 && isPlayerWinner) {
    bonusRightsCash = 50000;
    warNews.push({
      id: `war-bonus-${Date.now()}`,
      week: currentWeek,
      category: 'Industry',
      importance: 'High',
      headline: `Network Rewards ${promotion.name} with Ratings War Bonus!`,
      details: `${promotion.tvNetwork} awarded a $50,000 performance bonus to ${promotion.name} after securing ${currentStreak} consecutive head-to-head television victories!`
    });
  }

  // Market share calculation
  const totalAudience = playerViewersNum + simulatedRivalShows.reduce((acc, r) => acc + r.viewers, 0);
  const playerSharePct = Number(((playerViewersNum / totalAudience) * 100).toFixed(1));

  let warMoraleStatus: RatingsWarState['warMoraleStatus'] = 'Fierce Deadlock';
  if (currentStreak >= 3) warMoraleStatus = 'Dominating the Airwaves';
  else if (currentStreak >= 1) warMoraleStatus = 'Narrow Edge';
  else if (currentStreak <= -3) warMoraleStatus = 'Crisis: Losing Ratings Battle';
  else if (currentStreak <= -1) warMoraleStatus = 'Under Fire from Competitors';

  const battleResult: RivalWeeklyBattleResult = {
    week: currentWeek,
    year: currentYear,
    playerShowName: promotion.weeklyTVShow,
    playerRating: playerShowResult.tvRating,
    playerViewers: playerViewersNum,
    playerScore: playerShowResult.overallScore,
    rivals: simulatedRivalShows,
    winnerName,
    isPlayerWinner,
    marginViewers,
    narrativeRecap
  };

  const updatedBattles = [battleResult, ...(currentState.weeklyBattles || [])].slice(0, 20);

  // Dirt sheet news item
  warNews.push({
    id: `war-battle-news-${Date.now()}`,
    week: currentWeek,
    category: 'Rival',
    importance: isPlayerWinner ? 'Medium' : 'High',
    headline: isPlayerWinner
      ? `Ratings Battle: ${promotion.name} Defeats ${primaryRival.rivalName} (${playerShowResult.tvRating} to ${primaryRival.rating})`
      : `Ratings Battle: ${primaryRival.rivalName} Tops ${promotion.name} in Weekly War`,
    details: narrativeRecap
  });

  const updatedRatingsWar: RatingsWarState = {
    rivalPromotions: rivals,
    weeklyBattles: updatedBattles,
    playerWins,
    rivalWins,
    ties: currentState.ties,
    currentStreak,
    marketSharePercentage: playerSharePct,
    warMoraleStatus
  };

  return {
    updatedRatingsWar,
    battleResult,
    warNews,
    networkSatisfactionDelta,
    bonusRightsCash
  };
}

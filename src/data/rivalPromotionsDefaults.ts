import { Promotion, RivalPromotion, RatingsWarState, RivalWeeklyBattleResult } from '../types';

export function getDefaultRivalPromotions(playerPromotion: Promotion): RivalPromotion[] {
  const isAPW = playerPromotion.id === 'apw';
  const isVU = playerPromotion.id === 'vu';
  const isSSPW = playerPromotion.id === 'sspw';

  const rivals: RivalPromotion[] = [];

  if (isAPW) {
    // Player is APW -> Rivals are EWR, VU, and SSPW
    rivals.push({
      id: 'rival-ewr',
      name: 'Empire Wrestling Revolution',
      shortName: 'EWR',
      primaryColor: '#ef4444',
      weeklyShowName: 'EWR Monday Warfare',
      networkName: 'Prime Cable USA',
      networkTimeSlot: 'Monday 8:00 PM EST',
      headBooker: 'Eric "The Outlaw" Bischoff',
      style: 'Crash TV & High Drama',
      prestige: 85,
      fanbase: 105000,
      averageWeeklyRating: 3.32,
      keyStars: ['Damian "The Prophet" Cross', 'Vance Hunter', 'Maddox Steele', 'Aria Sterling'],
      champions: [
        { titleName: 'EWR World Heavyweight', holderName: 'Damian Cross' },
        { titleName: 'EWR Television', holderName: 'Maddox Steele' },
        { titleName: 'EWR World Tag Team', holderName: 'The Outlaw Syndicate' }
      ],
      currentTopFeud: 'Damian Cross vs. Vance Hunter (Heat: 88/100)',
      ratingsHistory: [
        { week: 51, year: 2025, rating: 3.28, viewers: 3150000, showScore: 82 },
        { week: 52, year: 2025, rating: 3.35, viewers: 3240000, showScore: 84 }
      ],
      isPrimaryRival: true
    });

    rivals.push({
      id: 'rival-vu',
      name: 'Violence Unlimited',
      shortName: 'VU',
      primaryColor: '#84cc16',
      weeklyShowName: 'VU Friday Carnage',
      networkName: 'Extreme Sports TV',
      networkTimeSlot: 'Friday 9:00 PM EST',
      headBooker: 'Tommy "Hardcore" Hazard',
      style: 'Hardcore / Extreme Outlaw',
      prestige: 81,
      fanbase: 82000,
      averageWeeklyRating: 2.78,
      keyStars: ['Butcher Brody', 'Sinister Kane', 'Raven Black', 'Jaxson Payne'],
      champions: [
        { titleName: 'VU Anarchy World', holderName: 'Butcher Brody' },
        { titleName: 'VU Barbed Wire Title', holderName: 'Raven Black' }
      ],
      currentTopFeud: 'Butcher Brody vs. Tommy Hazard (Heat: 82/100)',
      ratingsHistory: [
        { week: 51, year: 2025, rating: 2.72, viewers: 2600000, showScore: 79 },
        { week: 52, year: 2025, rating: 2.81, viewers: 2720000, showScore: 81 }
      ],
      isPrimaryRival: false
    });

    rivals.push({
      id: 'rival-sspw',
      name: 'Supreme Strong-Style Puroresu',
      shortName: 'SSPW',
      primaryColor: '#06b6d4',
      weeklyShowName: 'SSPW King of Budo',
      networkName: 'Tokyo Star Sat-TV',
      networkTimeSlot: 'Saturday 8:00 PM JST',
      headBooker: 'Master Kenjiro Sato',
      style: 'Lucha & Strong Style Puroresu',
      prestige: 89,
      fanbase: 95000,
      averageWeeklyRating: 3.15,
      keyStars: ['Kazuma Dragon', 'Hiroshi Takahashi', 'The Golden Phoenix', 'Kaito Storm'],
      champions: [
        { titleName: 'SSPW Openweight Crown', holderName: 'Kazuma Dragon' },
        { titleName: 'SSPW Junior Heavies', holderName: 'The Golden Phoenix' }
      ],
      currentTopFeud: 'Kazuma Dragon vs. Hiroshi Takahashi (Heat: 91/100)',
      ratingsHistory: [
        { week: 51, year: 2025, rating: 3.10, viewers: 2980000, showScore: 88 },
        { week: 52, year: 2025, rating: 3.18, viewers: 3080000, showScore: 89 }
      ],
      isPrimaryRival: false
    });
  } else if (isVU) {
    // Player is VU -> Rivals are APW, EWR, and SSPW
    rivals.push({
      id: 'rival-apw',
      name: 'Apex Pro Wrestling',
      shortName: 'APW',
      primaryColor: '#f59e0b',
      weeklyShowName: 'APW Friday Night Apex',
      networkName: 'Global Sports Net',
      networkTimeSlot: 'Friday 8:00 PM EST',
      headBooker: 'Jack Sterling',
      style: 'Mainstream Giant Spectacle',
      prestige: 88,
      fanbase: 120000,
      averageWeeklyRating: 3.48,
      keyStars: ['Thunder Vance', 'Damian Graves', 'Rex Stryker', 'Lord Alistair Sterling'],
      champions: [
        { titleName: 'APW World Heavyweight', holderName: 'Thunder Vance' },
        { titleName: 'APW Intercontinental', holderName: 'Rex Stryker' }
      ],
      currentTopFeud: 'Thunder Vance vs. Damian Graves (Heat: 92/100)',
      ratingsHistory: [
        { week: 51, year: 2025, rating: 3.45, viewers: 3400000, showScore: 86 },
        { week: 52, year: 2025, rating: 3.52, viewers: 3510000, showScore: 88 }
      ],
      isPrimaryRival: true
    });

    rivals.push({
      id: 'rival-ewr',
      name: 'Empire Wrestling Revolution',
      shortName: 'EWR',
      primaryColor: '#ef4444',
      weeklyShowName: 'EWR Monday Warfare',
      networkName: 'Prime Cable USA',
      networkTimeSlot: 'Monday 8:00 PM EST',
      headBooker: 'Eric Bischoff',
      style: 'Crash TV & Sports Entertainment',
      prestige: 85,
      fanbase: 105000,
      averageWeeklyRating: 3.30,
      keyStars: ['Damian Cross', 'Vance Hunter', 'Maddox Steele'],
      champions: [
        { titleName: 'EWR World Heavyweight', holderName: 'Damian Cross' }
      ],
      currentTopFeud: 'Damian Cross vs. Vance Hunter (Heat: 87/100)',
      ratingsHistory: [
        { week: 51, year: 2025, rating: 3.25, viewers: 3120000, showScore: 82 },
        { week: 52, year: 2025, rating: 3.32, viewers: 3200000, showScore: 84 }
      ],
      isPrimaryRival: false
    });
  } else {
    // Player is SSPW or Custom -> Rivals are APW, EWR, VU
    rivals.push({
      id: 'rival-apw',
      name: 'Apex Pro Wrestling',
      shortName: 'APW',
      primaryColor: '#f59e0b',
      weeklyShowName: 'APW Friday Night Apex',
      networkName: 'Global Sports Net',
      networkTimeSlot: 'Friday 8:00 PM EST',
      headBooker: 'Jack Sterling',
      style: 'Mainstream Giant Spectacle',
      prestige: 88,
      fanbase: 120000,
      averageWeeklyRating: 3.48,
      keyStars: ['Thunder Vance', 'Damian Graves', 'Rex Stryker', 'Lord Alistair Sterling'],
      champions: [
        { titleName: 'APW World Heavyweight', holderName: 'Thunder Vance' },
        { titleName: 'APW Intercontinental', holderName: 'Rex Stryker' }
      ],
      currentTopFeud: 'Thunder Vance vs. Damian Graves (Heat: 92/100)',
      ratingsHistory: [
        { week: 51, year: 2025, rating: 3.45, viewers: 3400000, showScore: 86 },
        { week: 52, year: 2025, rating: 3.52, viewers: 3510000, showScore: 88 }
      ],
      isPrimaryRival: true
    });

    rivals.push({
      id: 'rival-ewr',
      name: 'Empire Wrestling Revolution',
      shortName: 'EWR',
      primaryColor: '#ef4444',
      weeklyShowName: 'EWR Monday Warfare',
      networkName: 'Prime Cable USA',
      networkTimeSlot: 'Monday 8:00 PM EST',
      headBooker: 'Eric Bischoff',
      style: 'Crash TV & High Drama',
      prestige: 84,
      fanbase: 100000,
      averageWeeklyRating: 3.25,
      keyStars: ['Damian Cross', 'Vance Hunter', 'Aria Sterling'],
      champions: [
        { titleName: 'EWR World Heavyweight', holderName: 'Damian Cross' }
      ],
      currentTopFeud: 'Damian Cross vs. Vance Hunter (Heat: 85/100)',
      ratingsHistory: [
        { week: 51, year: 2025, rating: 3.20, viewers: 3080000, showScore: 81 },
        { week: 52, year: 2025, rating: 3.27, viewers: 3150000, showScore: 83 }
      ],
      isPrimaryRival: false
    });
  }

  return rivals;
}

export function getDefaultRatingsWarState(playerPromotion: Promotion): RatingsWarState {
  const rivals = getDefaultRivalPromotions(playerPromotion);
  
  // Seed initial head-to-head battle for context
  const initialBattle: RivalWeeklyBattleResult = {
    week: 52,
    year: 2025,
    playerShowName: playerPromotion.weeklyTVShow,
    playerRating: 3.42,
    playerViewers: 3380000,
    playerScore: 84,
    rivals: rivals.map(r => ({
      rivalId: r.id,
      rivalName: r.name,
      rivalShowName: r.weeklyShowName,
      rating: r.averageWeeklyRating,
      viewers: Math.round(r.averageWeeklyRating * 980000),
      score: 83,
      mainEvent: `${r.keyStars[0]} vs. ${r.keyStars[1]} (Main Event Showdown)`,
      headline: `${r.name} broadcast their season finale with a dramatic championship clash!`
    })),
    winnerName: playerPromotion.name,
    isPlayerWinner: true,
    marginViewers: 140000,
    narrativeRecap: `${playerPromotion.name} edged out ${rivals[0].name} by 140,000 viewers in the Year-End Television Ratings Battle!`
  };

  return {
    rivalPromotions: rivals,
    weeklyBattles: [initialBattle],
    playerWins: 1,
    rivalWins: 0,
    ties: 0,
    currentStreak: 1,
    marketSharePercentage: 53.5,
    warMoraleStatus: 'Dominating the Airwaves'
  };
}

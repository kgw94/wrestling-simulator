import { Championship, Wrestler, NewsItem, TagTeam } from '../types';

/**
 * Determines the strict gender category for a championship.
 * Championships are unique for each gender:
 * - 'Male': Only male competitors may hold or compete for this title.
 * - 'Female': Only female competitors may hold or compete for this title.
 * - 'Open': Available to any gender (e.g. 24/7 or specific unsanctioned titles).
 */
export function getChampionshipGender(title: Partial<Championship>): 'Male' | 'Female' | 'Open' {
  if (title.gender) {
    return title.gender;
  }
  
  // Infer from division or type
  if (
    title.division === 'Women' || 
    title.type === "Women's" ||
    (title.name && (
      title.name.toLowerCase().includes("women") ||
      title.name.toLowerCase().includes("woman") ||
      title.name.toLowerCase().includes("goddess") ||
      title.name.toLowerCase().includes("knockout") ||
      title.name.toLowerCase().includes("diva") ||
      title.name.toLowerCase().includes("queen") ||
      title.name.toLowerCase().includes("vixen") ||
      title.name.toLowerCase().includes("ladies") ||
      title.name.toLowerCase().includes("female")
    ))
  ) {
    return 'Female';
  }

  // Pure openweight tertiary/hardcore if explicitly stated
  if (
    title.division === 'Openweight' && 
    title.type === 'Hardcore / 24/7' &&
    title.name && title.name.toLowerCase().includes('24/7')
  ) {
    return 'Open';
  }

  // Default standard championships to Male (Men's division)
  return 'Male';
}

/**
 * Checks whether an individual wrestler is eligible to compete for or hold a championship.
 */
export function isWrestlerEligibleForTitle(title: Championship, wrestler: Wrestler): boolean {
  const titleGender = getChampionshipGender(title);
  if (titleGender === 'Open') return true;
  return wrestler.gender === titleGender;
}

/**
 * Validates a list of match participants against a championship's gender restriction.
 * Rejects any match where male wrestlers challenge for a women's title,
 * or female wrestlers challenge for a men's title.
 */
export function validateMatchTitleGender(
  title: Championship, 
  participants: Wrestler[]
): { isValid: boolean; errorReason?: string; titleGender: 'Male' | 'Female' | 'Open' } {
  const titleGender = getChampionshipGender(title);

  if (titleGender === 'Open') {
    return { isValid: true, titleGender };
  }

  const invalidParticipants = participants.filter(w => w.gender !== titleGender);

  if (invalidParticipants.length > 0) {
    const invalidNames = invalidParticipants.map(w => w.name).join(', ');
    const requiredStr = titleGender === 'Female' ? "Women's" : "Men's";
    const conflictStr = titleGender === 'Female' ? "male" : "female";
    return {
      isValid: false,
      titleGender,
      errorReason: `Gender Rule Violation: "${title.name}" is a ${requiredStr} championship. Competitor(s) ${invalidNames} (${conflictStr}) cannot compete for this title.`
    };
  }

  return { isValid: true, titleGender };
}

/**
 * Returns UI badge styling and text for a championship's gender category.
 */
export function getChampionshipGenderBadge(title: Championship): { label: string; icon: string; className: string } {
  const gender = getChampionshipGender(title);
  if (gender === 'Female') {
    return {
      label: "Women's Title",
      icon: "👩",
      className: "bg-pink-500/20 text-pink-300 border-pink-500/40"
    };
  }
  if (gender === 'Male') {
    return {
      label: "Men's Title",
      icon: "👨",
      className: "bg-blue-500/20 text-blue-300 border-blue-500/40"
    };
  }
  return {
    label: "Open / Any",
    icon: "🌐",
    className: "bg-purple-500/20 text-purple-300 border-purple-500/40"
  };
}

/**
 * Filters a roster of wrestlers to only include those eligible for a championship
 * based on strict gender exclusivity.
 */
export function filterEligibleWrestlersForTitle(title: Partial<Championship>, roster: Wrestler[]): Wrestler[] {
  const gender = getChampionshipGender(title);
  if (gender === 'Open') return roster;
  return roster.filter(w => w.gender === gender);
}

export interface TitleVacancyOptions {
  injuryThresholdWeeks?: number; // Defaults to 4 (i.e. more than 4 weeks: > 4)
  promotionName?: string;
  currentYear?: number;
  retiredRoster?: Wrestler[];
}

export interface AutomaticTitleVacancyResult {
  updatedTitles: Championship[];
  updatedRoster: Wrestler[];
  newNews: NewsItem[];
  vacatedTitlesCount: number;
  vacatedRecords: {
    titleId: string;
    titleName: string;
    reason: 'injury' | 'retirement';
    formerHolderNames: string;
    injuryName?: string;
    weeksRemaining?: number;
    headline: string;
  }[];
}

/**
 * Handles automatic title vacancy if a champion becomes injured for more than 4 weeks or retires,
 * and adds an official news update notification about the vacated championship.
 * 
 * Rules:
 * 1. Checks every championship in the promotion.
 * 2. If any current holder is injured for more than 4 weeks (weeksRemaining > 4), or has retired (isRetired === true),
 *    the championship is immediately stripped and declared vacant.
 * 3. The current title reign in history is cleanly concluded with lostWeek, lostYear, isCurrent: false, and vacancy notes.
 * 4. Defenses are reset to 0, currentHolderIds emptied, and title ID cleared from the champions' championshipIds.
 * 5. Generates a high-importance news update notification with full context.
 */
export function handleAutomaticTitleVacancy(
  titles: Championship[],
  roster: Wrestler[],
  currentWeek: number,
  options?: TitleVacancyOptions
): AutomaticTitleVacancyResult {
  const threshold = options?.injuryThresholdWeeks ?? 4;
  const currentYear = options?.currentYear ?? 2026;
  const promotionName = options?.promotionName || 'The promotion';

  const updatedTitles: Championship[] = titles.map(t => ({
    ...t,
    currentHolderIds: [...(t.currentHolderIds || [])],
    history: (t.history || []).map(h => ({ ...h }))
  }));

  const updatedRoster: Wrestler[] = roster.map(w => ({
    ...w,
    championshipIds: [...(w.championshipIds || [])]
  }));

  const newNews: NewsItem[] = [];
  const vacatedRecords: AutomaticTitleVacancyResult['vacatedRecords'] = [];

  updatedTitles.forEach(title => {
    if (!title.currentHolderIds || title.currentHolderIds.length === 0) {
      return;
    }

    const allWrestlers = [...updatedRoster, ...(options?.retiredRoster || [])];
    const currentHolders = title.currentHolderIds
      .map(id => allWrestlers.find(w => w.id === id))
      .filter((w): w is Wrestler => Boolean(w));

    // Check for retirement or severe injury (> 4 weeks)
    const retiredHolder = currentHolders.find(w => w.isRetired);
    const severelyInjuredHolder = currentHolders.find(
      w => w.injury?.injured && typeof w.injury.weeksRemaining === 'number' && w.injury.weeksRemaining > threshold
    );

    if (retiredHolder || severelyInjuredHolder) {
      const isRetirement = Boolean(retiredHolder);
      const triggerWrestler = retiredHolder || severelyInjuredHolder!;
      const formerHolderNames = currentHolders.length > 0 
        ? currentHolders.map(h => h.name).join(' & ') 
        : 'Reigning Champions';

      let reasonNote = '';
      let headline = '';
      let details = '';

      if (isRetirement) {
        reasonNote = `Vacated upon superstar retirement (${triggerWrestler.name} retired at age ${triggerWrestler.age})`;
        headline = `🏆 TITLE VACATED: ${title.name} Declared Vacant as ${triggerWrestler.name} Retires!`;
        details = `With ${triggerWrestler.name} formally announcing their retirement from active competition at age ${triggerWrestler.age}, ${promotionName} has officially declared the ${title.name} vacant. Management celebrates their historic championship reign as plans begin to crown a successor!`;
      } else {
        const injName = triggerWrestler.injury?.name || 'Severe Injury';
        const weeksOut = triggerWrestler.injury?.weeksRemaining || (threshold + 1);
        reasonNote = `Vacated due to severe injury (${triggerWrestler.name} sidelined with ${injName} for ${weeksOut} weeks)`;
        headline = `🚨 TITLE STRIPPED: ${title.name} Vacated Due to ${triggerWrestler.name}'s Severe Injury!`;
        details = `Under the official championship bylaws, ${promotionName} has officially declared the ${title.name} vacant. Reigning champion ${triggerWrestler.name} has been sidelined with a confirmed ${injName} for ${weeksOut} weeks (exceeding the 4-week defense window) and is unable to defend the title. An upcoming title match or tournament will crown the next champion!`;
      }

      // Conclude current reign in championship history
      if (title.history && title.history.length > 0) {
        const currentReign = title.history[0];
        if (!currentReign.lostWeek || currentReign.isCurrent !== false) {
          title.history[0] = {
            ...currentReign,
            lostWeek: currentWeek,
            lostYear: currentYear,
            isCurrent: false,
            notes: currentReign.notes ? `${currentReign.notes} • ${reasonNote}` : reasonNote
          };
        }
      }

      // Strip title and reset defenses
      title.currentHolderIds = [];
      title.defenses = 0;

      // Remove title from former holders on the roster
      updatedRoster.forEach(w => {
        if (w.championshipIds.includes(title.id)) {
          w.championshipIds = w.championshipIds.filter(id => id !== title.id);
        }
      });

      const newsItem: NewsItem = {
        id: `news-title-vacate-${Date.now()}-${title.id}-${Math.random().toString(36).substring(2, 6)}`,
        week: currentWeek,
        category: isRetirement ? 'Promotion' : 'Injury',
        importance: 'High',
        headline,
        details
      };

      newNews.push(newsItem);
      vacatedRecords.push({
        titleId: title.id,
        titleName: title.name,
        reason: isRetirement ? 'retirement' : 'injury',
        formerHolderNames,
        injuryName: triggerWrestler.injury?.name,
        weeksRemaining: triggerWrestler.injury?.weeksRemaining,
        headline
      });
    }
  });

  return {
    updatedTitles,
    updatedRoster,
    newNews,
    vacatedTitlesCount: vacatedRecords.length,
    vacatedRecords
  };
}

/**
 * Handles automatic title vacancy for a specific champion when they sustain a severe injury (> 4 weeks) or retire.
 */
export function handleAutomaticTitleVacancyForWrestler(
  wrestler: Wrestler,
  titles: Championship[],
  roster: Wrestler[],
  currentWeek: number,
  reason: 'injury' | 'retirement',
  options?: TitleVacancyOptions
): AutomaticTitleVacancyResult {
  const clonedRoster = roster.map(w => {
    if (w.id === wrestler.id) {
      return {
        ...w,
        isRetired: reason === 'retirement' ? true : w.isRetired,
        injury: reason === 'injury' 
          ? (w.injury?.injured ? w.injury : { injured: true, name: wrestler.injury?.name || 'Severe Injury', weeksRemaining: wrestler.injury?.weeksRemaining || 6 }) 
          : w.injury
      };
    }
    return w;
  });

  return handleAutomaticTitleVacancy(titles, clonedRoster, currentWeek, options);
}

export interface RankedContender {
  rank: number;
  wrestler?: Wrestler;
  tagTeam?: TagTeam;
  isTagTeam: boolean;
  name: string;
  nickname?: string;
  gender?: 'Male' | 'Female';
  style?: string;
  push?: string;
  alignment?: 'Face' | 'Heel';
  overness: number;
  workrate: number;
  winStreak: number;
  recentForm: ('W' | 'L' | 'D')[];
  performanceRating: number; // 0-100 score based on match execution, workrate, & morale
  contenderScore: number; // 0-100+ composite ranking score
  momentum: 'Surging' | 'Hot' | 'Steady' | 'Cooling' | 'Struggling';
  recordDisplay: string;
  winPercentage: number;
  breakdown: {
    streakPoints: number;
    performancePoints: number;
    winRatePoints: number;
    starPowerPoints: number;
  };
  statusBadge: string;
  recommendation: string;
  isInjured: boolean;
  injuryNotice?: string;
}

/**
 * Calculates current contender rankings for a championship based on recent win streaks and performance.
 */
export function calculateTitleContenderRankings(
  title: Championship,
  roster: Wrestler[],
  tagTeams?: TagTeam[],
  limit: number = 10
): RankedContender[] {
  const isTag = Boolean(title.isTagTeam || title.division === 'Tag Team');
  const currentHolders = title.currentHolderIds || [];

  if (isTag) {
    const teams = tagTeams || [];
    const validTeams = teams.filter(team => {
      // Exclude if team holds the title
      const isHolder = team.memberIds.some(id => currentHolders.includes(id));
      if (isHolder) return false;
      return true;
    });

    const rankedTeams = validTeams.map(team => {
      const members = team.memberIds
        .map(id => roster.find(w => w.id === id))
        .filter((w): w is Wrestler => Boolean(w && !w.isRetired));

      const isInjured = members.some(m => m.injury?.injured);
      const teamWins = team.wins || 0;
      const teamLosses = team.losses || 0;
      const totalTeamMatches = teamWins + teamLosses;
      const teamWinRate = totalTeamMatches > 0 ? (teamWins / totalTeamMatches) : 0.5;

      // Combined member win streaks and recent form
      const avgStreak = members.length > 0
        ? Math.round(members.reduce((acc, m) => {
            const mStreak = typeof m.winStreak === 'number' 
              ? m.winStreak 
              : (m.wins > m.losses ? Math.min(m.wins, Math.max(1, Math.floor((m.wins - m.losses) / 2))) : 0);
            return acc + mStreak;
          }, 0) / members.length)
        : Math.min(teamWins, 3);

      const recentForm: ('W' | 'L' | 'D')[] = [];
      for (let i = 0; i < 5; i++) {
        if (i < avgStreak) recentForm.push('W');
        else recentForm.push(i % 2 === 0 ? 'W' : 'L');
      }

      const avgWorkrate = members.length > 0
        ? Math.round(members.reduce((acc, m) => acc + m.workrate, 0) / members.length)
        : 70;
      const avgOverness = members.length > 0
        ? Math.round(members.reduce((acc, m) => acc + m.overness, 0) / members.length)
        : 65;

      const performanceRating = Math.min(100, Math.max(25, Math.round(avgWorkrate * 0.7 + avgOverness * 0.3)));

      const streakPoints = Math.min(30, avgStreak * 6);
      const performancePoints = Math.round(performanceRating * 0.35);
      const winRatePoints = Math.round(teamWinRate * 20);
      const starPowerPoints = Math.round(avgOverness * 0.15);
      const injuryPenalty = isInjured ? 25 : 0;

      const contenderScore = Math.max(5, Math.round(streakPoints + performancePoints + winRatePoints + starPowerPoints - injuryPenalty));

      let momentum: RankedContender['momentum'] = 'Steady';
      if (avgStreak >= 4 && performanceRating >= 75) momentum = 'Surging';
      else if (avgStreak >= 2) momentum = 'Hot';
      else if (avgStreak === 0 && teamLosses > teamWins) momentum = 'Cooling';

      return {
        rank: 1,
        tagTeam: team,
        isTagTeam: true,
        name: team.name,
        nickname: members.map(m => m.name).join(' & '),
        overness: avgOverness,
        workrate: avgWorkrate,
        winStreak: avgStreak,
        recentForm,
        performanceRating,
        contenderScore,
        momentum,
        recordDisplay: `${teamWins}W - ${teamLosses}L`,
        winPercentage: Math.round(teamWinRate * 100),
        breakdown: { streakPoints, performancePoints, winRatePoints, starPowerPoints },
        statusBadge: 'Contender Duo',
        recommendation: avgStreak >= 3 ? 'Riding hot tag win streak toward title opportunity.' : 'Consistent tag contenders in division hunt.',
        isInjured,
        injuryNotice: isInjured ? 'Partner currently sidelined with injury' : undefined
      };
    });

    rankedTeams.sort((a, b) => b.contenderScore - a.contenderScore);
    return rankedTeams.slice(0, limit).map((team, idx) => ({
      ...team,
      rank: idx + 1,
      statusBadge: idx === 0 ? '#1 Contender' : idx <= 2 ? 'Top Contender' : 'Ranked Challenger'
    }));
  }

  // Singles Championship Contender Ranking
  const eligibleWrestlers = filterEligibleWrestlersForTitle(title, roster).filter(w => {
    // Cannot be current holder
    if (currentHolders.includes(w.id)) return false;
    // Cannot be retired
    if (w.isRetired) return false;
    return true;
  });

  const scoredContenders = eligibleWrestlers.map(w => {
    const wins = w.wins || 0;
    const losses = w.losses || 0;
    const totalMatches = wins + losses + (w.draws || 0);
    const winRate = totalMatches > 0 ? (wins / totalMatches) : 0.5;

    // 1. Win Streak computation
    let winStreak = typeof w.winStreak === 'number' ? w.winStreak : 0;
    if (w.winStreak === undefined) {
      if (wins > 0 && losses === 0) {
        winStreak = Math.min(wins, 6);
      } else if (wins > losses) {
        winStreak = Math.min(wins, Math.max(1, Math.floor((wins - losses) / 2)));
      } else {
        winStreak = 0;
      }
    }

    // 2. Recent Form computation
    let recentForm: ('W' | 'L' | 'D')[] = w.recentForm && w.recentForm.length > 0
      ? [...w.recentForm]
      : [];
    if (recentForm.length === 0) {
      for (let i = 0; i < 5; i++) {
        if (i < winStreak) {
          recentForm.push('W');
        } else {
          recentForm.push(i % 2 === 0 ? 'W' : 'L');
        }
      }
    }

    // 3. Performance Rating (0-100)
    const fatiguePenalty = Math.max(0, (w.fatigue || 0) - 40) * 0.25;
    const moraleBonus = ((w.morale || 70) - 50) * 0.15;
    const basePerf = typeof w.recentPerformance === 'number'
      ? w.recentPerformance
      : (w.workrate * 0.65 + w.overness * 0.25 + w.micSkills * 0.10);
    const performanceRating = Math.min(100, Math.max(20, Math.round(basePerf + moraleBonus - fatiguePenalty)));

    // 4. Style & Division Synergy Bonus (e.g. High Flyer for Cruiserweight, Hardcore for Hardcore)
    let divisionBonus = 0;
    if (title.type === 'Cruiserweight / High-Flyer' || title.division === 'Cruiserweight') {
      if (w.style === 'High Flyer' || w.style === 'Technician') divisionBonus += 6;
    }
    if (title.type === 'Hardcore / 24/7') {
      if (w.style === 'Hardcore' || w.style === 'Brawler') divisionBonus += 6;
    }

    // 5. Component Point Breakdowns
    const streakPoints = Math.min(30, winStreak * 6);
    const performancePoints = Math.round(performanceRating * 0.35);
    const winRatePoints = Math.round(winRate * 20);
    const starPowerPoints = Math.round((w.overness || 50) * 0.15);
    const isInjured = Boolean(w.injury?.injured);
    const injuryPenalty = isInjured ? 25 : 0;

    const contenderScore = Math.max(
      5, 
      Math.round(streakPoints + performancePoints + winRatePoints + starPowerPoints + divisionBonus - injuryPenalty)
    );

    // 6. Momentum Classification
    let momentum: RankedContender['momentum'] = 'Steady';
    if (winStreak >= 4 && performanceRating >= 80) momentum = 'Surging';
    else if (winStreak >= 2 || (winStreak >= 1 && performanceRating >= 78)) momentum = 'Hot';
    else if (winStreak === 0 && losses > wins) momentum = 'Cooling';
    else if (winStreak === 0 && losses >= wins + 3) momentum = 'Struggling';

    // 7. Status & Booker Recommendation
    let recommendation = '';
    if (winStreak >= 4) {
      recommendation = `Riding an electric ${winStreak}-match win streak with ${performanceRating} performance rating. Fully earned championship consideration.`;
    } else if (performanceRating >= 85) {
      recommendation = `World-class in-ring mechanic logging ${performanceRating} workrate classics. Ready for marquee high-stakes challenge.`;
    } else if (winRate >= 0.7) {
      recommendation = `Dominant ${Math.round(winRate * 100)}% career winning percentage makes them an automatic top-tier threat.`;
    } else {
      recommendation = `Ascending the divisional ladder with steady TV appearances and solid fundamental match pacing.`;
    }

    return {
      rank: 1,
      wrestler: w,
      isTagTeam: false,
      name: w.name,
      nickname: w.nickname,
      gender: w.gender,
      style: w.style,
      push: w.push,
      alignment: w.alignment,
      overness: w.overness,
      workrate: w.workrate,
      winStreak,
      recentForm,
      performanceRating,
      contenderScore,
      momentum,
      recordDisplay: `${wins}W - ${losses}L${w.draws ? ` - ${w.draws}D` : ''}`,
      winPercentage: Math.round(winRate * 100),
      breakdown: { streakPoints, performancePoints, winRatePoints, starPowerPoints },
      statusBadge: 'Contender',
      recommendation,
      isInjured,
      injuryNotice: isInjured ? `Sidelined with ${w.injury.name || 'Injury'} (${w.injury.weeksRemaining || 1}wks remaining)` : undefined
    };
  });

  scoredContenders.sort((a, b) => b.contenderScore - a.contenderScore);

  return scoredContenders.slice(0, limit).map((c, idx) => {
    let statusBadge = '#1 Contender';
    if (idx === 0) statusBadge = '#1 Contender (Mandatory)';
    else if (idx === 1) statusBadge = '#2 Contender';
    else if (idx === 2) statusBadge = '#3 Contender';
    else if (idx <= 4) statusBadge = 'Top 5 Contender';
    else statusBadge = `Ranked #${idx + 1}`;

    return {
      ...c,
      rank: idx + 1,
      statusBadge
    };
  });
}


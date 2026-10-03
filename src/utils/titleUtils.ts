import { Championship, Wrestler, NewsItem } from '../types';

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

    const currentHolders = title.currentHolderIds
      .map(id => updatedRoster.find(w => w.id === id))
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

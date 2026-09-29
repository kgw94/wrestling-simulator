import { Championship, Wrestler } from '../types';

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

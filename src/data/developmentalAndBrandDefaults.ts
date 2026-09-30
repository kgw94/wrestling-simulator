import { 
  Promotion, 
  Wrestler, 
  DevelopmentalTerritory, 
  BrandSplitSettings, 
  Brand, 
  DraftPick,
  ExcursionDestination,
  DevelopmentalFocus
} from '../types';

export const EXCURSION_DESTINATIONS: {
  destination: ExcursionDestination;
  country: string;
  flag: string;
  primaryBonus: 'workrate' | 'micSkills' | 'stamina' | 'overness';
  description: string;
}[] = [
  {
    destination: 'Japan (Strong Style Dojo)',
    country: 'Japan',
    flag: '🇯🇵',
    primaryBonus: 'workrate',
    description: 'Intense physical regimen focusing on stiff striking, mat grappling, fighting spirit, and psychology.'
  },
  {
    destination: 'Mexico (CMLL/AAA Lucha Libre)',
    country: 'Mexico',
    flag: '🇲🇽',
    primaryBonus: 'stamina',
    description: 'High-flying aerial acrobatics, top-rope transitions, rollups, and dramatic mask psychology.'
  },
  {
    destination: 'UK / Europe (Technical Catch)',
    country: 'United Kingdom',
    flag: '🇬🇧',
    primaryBonus: 'workrate',
    description: 'Traditional European catch wrestling, joint locks, submission counters, and fundamental mat clinic prowess.'
  },
  {
    destination: 'US Hardcore Underground',
    country: 'United States',
    flag: '🇺🇸',
    primaryBonus: 'micSkills',
    description: 'Raw, gritty outlaw brawling, foreign objects, crowd energy, and building unhinged charismatic edge.'
  }
];

export const DEVELOPMENTAL_COACHES = [
  {
    id: 'coach-sterling',
    name: '“The Sovereign” Jack Sterling',
    perk: 'Legendary Ring General: +2 Workrate & +1 Overness per training cycle',
    styleBonus: 'workrate'
  },
  {
    id: 'coach-sato',
    name: 'Master Kenjiro Sato',
    perk: 'Dojo Strict Discipline: +2 Workrate & +2 Stamina, 50% faster injury recovery',
    styleBonus: 'workrate'
  },
  {
    id: 'coach-kowalski',
    name: '“Mad Dog” Frank Kowalski',
    perk: 'Brawling Hardship: +2 Stamina & +2 Toughness, reduced injury risk',
    styleBonus: 'stamina'
  },
  {
    id: 'coach-dorado',
    name: 'El Místico Dorado',
    perk: 'Aerial Maestro: +3 Stamina & +2 High-Flying Workrate for under-26 talent',
    styleBonus: 'stamina'
  },
  {
    id: 'coach-steele',
    name: 'Victoria “Iron Empress” Steele',
    perk: 'Championship Mindset: +2 Mic Skills & +2 Morale across all trainees',
    styleBonus: 'micSkills'
  }
];

export function getDefaultDevelopmentalTerritory(promotion: Promotion): DevelopmentalTerritory {
  const isJapan = promotion.style === 'Lucha & Puroresu';
  const name = isJapan 
    ? `${promotion.shortName} Young Lion Dojo`
    : `${promotion.shortName} NextGen Performance Center`;
  
  const location = isJapan ? 'Tokyo, Japan' : 'Orlando, Florida';

  // Seed with 2 younger / opener talent if available, or generate green prospects
  const potentialTrainees = promotion.roster.filter(
    w => w.push === 'Jobber' || w.push === 'Opener' || w.age <= 25
  );

  const traineeIds = potentialTrainees.length >= 2 
    ? potentialTrainees.slice(0, 3).map(w => w.id)
    : [];

  return {
    id: `dev-${promotion.id}`,
    name,
    shortName: isJapan ? 'DOJO' : 'NEXTGEN',
    brandColor: '#f59e0b',
    location,
    headCoachId: 'coach-sterling',
    headCoachName: '“The Sovereign” Jack Sterling',
    headCoachPerk: 'Legendary Ring General: +2 Workrate & +1 Overness per training cycle',
    focusArea: 'balanced',
    weeklyBudgetCost: 8500,
    reputation: 78,
    traineeIds,
    excursions: [],
    graduatesCount: 0,
    historyLogs: [
      {
        id: `dev-log-init-${Date.now()}`,
        week: 1,
        year: 2026,
        wrestlerName: 'Promotion Board',
        type: 'scout',
        headline: `${name} Officially Commissioned`,
        details: `Established world-class developmental facility in ${location} with Head Coach Jack Sterling to cultivate the future stars of ${promotion.name}.`
      }
    ]
  };
}

const ROOKIE_NAMES_FIRST = [
  'Kaito', 'Jaxson', 'Dante', 'Declan', 'Hiroshi', 'Leon', 'Malik', 'Cruz', 
  'Ren', 'Brody', 'Tyson', 'Matteo', 'Sierra', 'Elena', 'Kendra', 'Aria'
];

const ROOKIE_NAMES_LAST = [
  'Blackwood', 'Sterling Jr.', 'Vaughn', 'Storm', 'Takahashi', 'Reyes', 'Colt', 
  'Mercer', 'Nakamoto', 'Wilder', 'Cross', 'Valdez', 'Knight', 'Novak'
];

const ROOKIE_NICKNAMES = [
  'The Prodigy', 'The Blue Chip Prospect', 'The Next Big Thing', 'Young Lion', 
  'The High-Octane Kid', 'Pure Athleticism', 'The Submission Prodigy', 'The Golden Novice'
];

export function generateScoutedProspect(promotion: Promotion): Wrestler {
  const isFemale = Math.random() < 0.25;
  const firstName = ROOKIE_NAMES_FIRST[Math.floor(Math.random() * ROOKIE_NAMES_FIRST.length)];
  const lastName = ROOKIE_NAMES_LAST[Math.floor(Math.random() * ROOKIE_NAMES_LAST.length)];
  const nickname = ROOKIE_NICKNAMES[Math.floor(Math.random() * ROOKIE_NICKNAMES.length)];
  const styles: Wrestler['style'][] = ['Technician', 'High Flyer', 'Brawler', 'Powerhouse', 'Entertainer'];
  const pickedStyle = styles[Math.floor(Math.random() * styles.length)];
  const age = Math.floor(Math.random() * 4) + 19; // 19 - 22 years old

  const id = `prospect-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    name: `${firstName} ${lastName}`,
    nickname,
    age,
    gender: isFemale ? 'Female' : 'Male',
    style: pickedStyle,
    alignment: Math.random() > 0.5 ? 'Face' : 'Heel',
    push: 'Jobber',
    overness: Math.floor(Math.random() * 15) + 30, // 30 - 44
    workrate: Math.floor(Math.random() * 20) + 55, // 55 - 74
    micSkills: Math.floor(Math.random() * 20) + 45, // 45 - 64
    stamina: Math.floor(Math.random() * 15) + 65, // 65 - 79
    morale: 95,
    fatigue: 0,
    injury: { injured: false },
    salary: 2500, // cheap rookie deal
    contractWeeks: 52,
    wins: 0,
    losses: 0,
    draws: 0,
    championshipIds: [],
    isDevelopmental: true,
    developmentalWeeks: 0,
    retirementAge: age + 24,
    careerInjuriesCount: 0,
    injuryHistory: []
  };
}

export function getDefaultBrandSplit(promotion: Promotion): BrandSplitSettings {
  const titles = [...promotion.titles];
  const halfTitles = Math.ceil(titles.length / 2);
  const brand1TitleIds = titles.slice(0, halfTitles).map(t => t.id);
  const brand2TitleIds = titles.slice(halfTitles).map(t => t.id);

  // Divide roster evenly
  const roster = [...promotion.roster];
  const halfRoster = Math.ceil(roster.length / 2);
  const brand1RosterIds = roster.slice(0, halfRoster).map(w => w.id);
  const brand2RosterIds = roster.slice(halfRoster).map(w => w.id);

  const brandRed: Brand = {
    id: 'brand_red',
    name: `${promotion.shortName} Flagship Raw`,
    shortName: 'RAW',
    color: '#ef4444',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    borderClass: 'border-red-500/50',
    weeklyShowName: `${promotion.shortName} Monday Night Raw`,
    tvNetwork: 'USA Network (Prime Time)',
    exclusiveTitleIds: brand1TitleIds,
    rosterIds: brand1RosterIds,
    averageRating: 80,
    ratingsHistory: [78, 81, 79, 82],
    weeklyShowWins: 2
  };

  const brandBlue: Brand = {
    id: 'brand_blue',
    name: `${promotion.shortName} SmackDown Warfare`,
    shortName: 'SD',
    color: '#3b82f6',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderClass: 'border-blue-500/50',
    weeklyShowName: `${promotion.shortName} Friday Night SmackDown`,
    tvNetwork: 'FOX Sports (Prime Time)',
    exclusiveTitleIds: brand2TitleIds,
    rosterIds: brand2RosterIds,
    averageRating: 81,
    ratingsHistory: [80, 79, 83, 81],
    weeklyShowWins: 2
  };

  return {
    isEnabled: false,
    brands: [brandRed, brandBlue],
    draftHistory: [],
    supremacyLeaderBrandId: undefined
  };
}

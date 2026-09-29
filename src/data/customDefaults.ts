import { 
  PPVEvent, 
  CustomMatchRule, 
  TagTeam, 
  Faction, 
  LockerRoomIncident, 
  WrestlerGimmick,
  Championship,
  ChampionshipType,
  TitleDivision,
  BeltStrapColor,
  BeltPlateStyle,
  StorylineArchetype,
  StorylineArc,
  CreativeNote,
  MatchType,
  AngleType,
  FinishType,
  Wrestler,
  HallOfFameInductee,
  HallOfFameCategory,
  HallOfFameScorecard
} from '../types';

export interface ChampionshipTemplate {
  name: string;
  shortName: string;
  type: ChampionshipType;
  division: TitleDivision;
  gender: 'Male' | 'Female' | 'Open';
  prestige: number;
  isTagTeam: boolean;
  strapColor: BeltStrapColor;
  plateStyle: BeltPlateStyle;
  minWorkrateBonus: number;
  description: string;
}

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    name: 'World Heavyweight Championship',
    shortName: 'WHC',
    type: 'World / Primary',
    division: 'Heavyweight',
    gender: 'Male',
    prestige: 95,
    isTagTeam: false,
    strapColor: 'Classic Black',
    plateStyle: 'Big Gold Classic',
    minWorkrateBonus: 6,
    description: 'The premier championship in pro wrestling. Carried by industry icons in legendary main events.'
  },
  {
    name: 'Intercontinental Championship',
    shortName: 'IC',
    type: 'Secondary / Midcard',
    division: 'Openweight',
    gender: 'Male',
    prestige: 82,
    isTagTeam: false,
    strapColor: 'Pure White',
    plateStyle: 'Winged Globe',
    minWorkrateBonus: 4,
    description: 'The workhorse title of the promotion, contested in high-octane in-ring clinics.'
  },
  {
    name: 'World Tag Team Championship',
    shortName: 'TAG',
    type: 'Tag Team',
    division: 'Tag Team',
    gender: 'Male',
    prestige: 84,
    isTagTeam: true,
    strapColor: 'Classic Black',
    plateStyle: 'Crown & Regal Lions',
    minWorkrateBonus: 3,
    description: 'Twin championship belts contested by cohesive two-man alliances and stable duos.'
  },
  {
    name: 'World Women\'s Championship',
    shortName: 'W-WORLD',
    type: 'Women\'s',
    division: 'Women',
    gender: 'Female',
    prestige: 88,
    isTagTeam: false,
    strapColor: 'Pure White',
    plateStyle: 'Eagle Crest',
    minWorkrateBonus: 5,
    description: 'The pinnacle prize in the women\'s division, defended in marquee high-profile matches.'
  },
  {
    name: 'National Television Championship',
    shortName: 'TV',
    type: 'Tertiary / TV',
    division: 'Openweight',
    gender: 'Male',
    prestige: 72,
    isTagTeam: false,
    strapColor: 'Crimson Red',
    plateStyle: 'Vintage Oval Heavyweight',
    minWorkrateBonus: 2,
    description: 'Strict 15-minute TV time limit title, defended weekly to hook viewers on television.'
  },
  {
    name: 'Cruiserweight / High-Flyer Crown',
    shortName: 'CW',
    type: 'Cruiserweight / High-Flyer',
    division: 'Cruiserweight',
    gender: 'Male',
    prestige: 78,
    isTagTeam: false,
    strapColor: 'Toxic Purple',
    plateStyle: 'Modern Geometric Diamond',
    minWorkrateBonus: 5,
    description: 'Fast-paced, high-flying acrobatic spectacle title reserved for light heavyweights under 220 lbs.'
  },
  {
    name: 'Hardcore 24/7 Anarchy Belt',
    shortName: 'HARDCORE',
    type: 'Hardcore / 24/7',
    division: 'Openweight',
    gender: 'Open',
    prestige: 64,
    isTagTeam: false,
    strapColor: 'Midnight Blue',
    plateStyle: 'Skull & Barbed Wire',
    minWorkrateBonus: 3,
    description: 'Contested under Falls Count Anywhere / No Disqualification rules 24 hours a day, 7 days a week.'
  },
  {
    name: 'Heritage Pure Wrestling Trophy',
    shortName: 'PURE',
    type: 'Heritage / Custom',
    division: 'Openweight',
    gender: 'Male',
    prestige: 86,
    isTagTeam: false,
    strapColor: 'Championship Gold',
    plateStyle: 'Eagle Crest',
    minWorkrateBonus: 7,
    description: 'Strict mat-wrestling rules with limited rope breaks and 20-count out of ring rules.'
  }
];

export const DEFAULT_PPV_CALENDAR: PPVEvent[] = [
  {
    id: 'ppv-1',
    name: 'Royal Rampage',
    weekNumber: 4,
    theme: '30-Man Gauntlet Spectacle & Rumble',
    venue: 'Madison Square Garden (New York)',
    venueCapacity: 20500,
    ticketPrice: 95,
    isSupercard: false,
    prestigeBonus: 10,
    buyrateMultiplier: 1.4
  },
  {
    id: 'ppv-2',
    name: 'No Escape',
    weekNumber: 8,
    theme: 'Brutal Steel Structure & Chamber Wars',
    venue: 'United Center (Chicago)',
    venueCapacity: 22000,
    ticketPrice: 90,
    isSupercard: false,
    prestigeBonus: 8,
    buyrateMultiplier: 1.3
  },
  {
    id: 'ppv-3',
    name: 'WRESTLEFEST: The Grand Spectacle',
    weekNumber: 12,
    theme: 'Flagship Annual Supercard of the Immortals',
    venue: 'MetLife Stadium (East Rutherford)',
    venueCapacity: 75000,
    ticketPrice: 150,
    isSupercard: true,
    prestigeBonus: 25,
    buyrateMultiplier: 2.8
  },
  {
    id: 'ppv-4',
    name: 'Spring Retribution',
    weekNumber: 16,
    theme: 'Post-Supercard Grudge Matches & Rematches',
    venue: 'TD Garden (Boston)',
    venueCapacity: 19500,
    ticketPrice: 85,
    isSupercard: false,
    prestigeBonus: 6,
    buyrateMultiplier: 1.2
  },
  {
    id: 'ppv-5',
    name: 'Hardcore Heaven',
    weekNumber: 20,
    theme: 'Extreme Rules, Tables, Ladders & Street Fights',
    venue: 'Hammerstein Ballroom (Manhattan)',
    venueCapacity: 16000,
    ticketPrice: 95,
    isSupercard: false,
    prestigeBonus: 10,
    buyrateMultiplier: 1.4
  },
  {
    id: 'ppv-6',
    name: 'Midsummer Mayhem',
    weekNumber: 24,
    theme: 'Cross-Promotional International Showcase',
    venue: 'Tokyo Dome (Tokyo)',
    venueCapacity: 52000,
    ticketPrice: 120,
    isSupercard: true,
    prestigeBonus: 18,
    buyrateMultiplier: 2.0
  },
  {
    id: 'ppv-7',
    name: 'Battleground Zero',
    weekNumber: 28,
    theme: 'Rivalry Deciders & Submission Bouts',
    venue: 'Wells Fargo Center (Philadelphia)',
    venueCapacity: 20500,
    ticketPrice: 85,
    isSupercard: false,
    prestigeBonus: 7,
    buyrateMultiplier: 1.25
  },
  {
    id: 'ppv-8',
    name: 'SUMMER CARNAGE',
    weekNumber: 32,
    theme: 'The Biggest Party of the Summer Mega-Event',
    venue: 'Allegiant Stadium (Las Vegas)',
    venueCapacity: 65000,
    ticketPrice: 140,
    isSupercard: true,
    prestigeBonus: 22,
    buyrateMultiplier: 2.4
  },
  {
    id: 'ppv-9',
    name: 'Night of Champions',
    weekNumber: 36,
    theme: 'Every Single Title On The Line In One Night',
    venue: 'Scotiabank Arena (Toronto)',
    venueCapacity: 19800,
    ticketPrice: 90,
    isSupercard: false,
    prestigeBonus: 12,
    buyrateMultiplier: 1.5
  },
  {
    id: 'ppv-10',
    name: 'Halloween Havoc',
    weekNumber: 40,
    theme: 'Spooky Stipulations, Cages & Coffin Matches',
    venue: 'Little Caesars Arena (Detroit)',
    venueCapacity: 20000,
    ticketPrice: 90,
    isSupercard: false,
    prestigeBonus: 8,
    buyrateMultiplier: 1.3
  },
  {
    id: 'ppv-11',
    name: 'Survivor Warfare',
    weekNumber: 44,
    theme: '5-on-5 Classic Elimination Faction Wars',
    venue: 'Allstate Arena (Rosemont)',
    venueCapacity: 18500,
    ticketPrice: 95,
    isSupercard: false,
    prestigeBonus: 12,
    buyrateMultiplier: 1.45
  },
  {
    id: 'ppv-12',
    name: 'Starrcade New Year Gala',
    weekNumber: 52,
    theme: 'Year-End Blowoff & Ultimate Golden Supercard',
    venue: 'SoFi Stadium (Los Angeles)',
    venueCapacity: 70000,
    ticketPrice: 155,
    isSupercard: true,
    prestigeBonus: 24,
    buyrateMultiplier: 2.6
  }
];

export const DEFAULT_CUSTOM_MATCH_RULES: CustomMatchRule[] = [
  {
    id: 'match-rule-hiac',
    name: 'Hell in a Cell',
    description: 'Enclosed 20ft steel structure. No DQ, pinfall or submission inside the cage.',
    minParticipants: 2,
    maxParticipants: 6,
    dangerLevel: 'Extremely Brutal',
    workrateMultiplier: 1.15,
    spectacleBonus: 14,
    injuryRiskBonus: 12,
    isElimination: false,
    isTitleEligible: true
  },
  {
    id: 'match-rule-tlc',
    name: 'TLC (Tables, Ladders & Chairs)',
    description: 'High-risk car-crash spectacle. High flyers excel, massive pop for weapon spots.',
    minParticipants: 2,
    maxParticipants: 8,
    dangerLevel: 'Dangerous',
    workrateMultiplier: 1.25,
    spectacleBonus: 15,
    injuryRiskBonus: 15,
    isElimination: false,
    isTitleEligible: true
  },
  {
    id: 'match-rule-lms',
    name: 'Last Man Standing',
    description: 'Brutal war of attrition. Winner is the last wrestler able to answer the 10-count.',
    minParticipants: 2,
    maxParticipants: 2,
    dangerLevel: 'Dangerous',
    workrateMultiplier: 1.1,
    spectacleBonus: 10,
    injuryRiskBonus: 8,
    isElimination: false,
    isTitleEligible: true
  },
  {
    id: 'match-rule-fca',
    name: 'Falls Count Anywhere',
    description: 'Action spills into the crowd, concession stands, and parking lots. Pinfalls valid anywhere.',
    minParticipants: 2,
    maxParticipants: 4,
    dangerLevel: 'Moderate',
    workrateMultiplier: 1.05,
    spectacleBonus: 8,
    injuryRiskBonus: 5,
    isElimination: false,
    isTitleEligible: true
  },
  {
    id: 'match-rule-battle-royal',
    name: 'Over-The-Top-Rope Battle Royal',
    description: 'Massive roster melee. Elimination occurs when thrown over top rope to the floor.',
    minParticipants: 4,
    maxParticipants: 30,
    dangerLevel: 'Moderate',
    workrateMultiplier: 0.9,
    spectacleBonus: 12,
    injuryRiskBonus: 4,
    isElimination: true,
    isTitleEligible: false
  },
  {
    id: 'match-rule-6man',
    name: '6-Man Tag Team Showcase',
    description: 'High-paced 3v3 trios warfare between rival factions or top stars.',
    minParticipants: 6,
    maxParticipants: 6,
    dangerLevel: 'Moderate',
    workrateMultiplier: 1.15,
    spectacleBonus: 9,
    injuryRiskBonus: 4,
    isElimination: false,
    isTitleEligible: true
  },
  {
    id: 'match-rule-chamber',
    name: 'Elimination Chamber',
    description: 'Six gladiators inside the chain-link dome with 4 glass pods. Surviving champion takes all.',
    minParticipants: 6,
    maxParticipants: 6,
    dangerLevel: 'Extremely Brutal',
    workrateMultiplier: 1.2,
    spectacleBonus: 18,
    injuryRiskBonus: 14,
    isElimination: true,
    isTitleEligible: true
  },
  {
    id: 'match-rule-ironman60',
    name: '60-Minute Iron Man Classic',
    description: 'The ultimate test of in-ring stamina and psychology. Most falls after 1 hour wins.',
    minParticipants: 2,
    maxParticipants: 2,
    dangerLevel: 'Safe',
    workrateMultiplier: 1.35,
    spectacleBonus: 12,
    injuryRiskBonus: 2,
    isElimination: false,
    isTitleEligible: true
  }
];

export const GIMMICK_TEMPLATES: {
  name: string;
  category: string;
  description: string;
  suggestedStyles: string[];
  suggestedAlignments: ('Face' | 'Heel')[];
}[] = [
  {
    name: 'The Franchise Superstar',
    category: 'Main Event',
    description: 'The face of the company; clean-cut, inspiring hero or corporate golden boy.',
    suggestedStyles: ['Entertainer', 'Powerhouse'],
    suggestedAlignments: ['Face', 'Heel']
  },
  {
    name: 'Ruthless Mercenary',
    category: 'Badass',
    description: 'Cold-blooded hitman who fights for the highest bidder with zero remorse.',
    suggestedStyles: ['Brawler', 'Hardcore'],
    suggestedAlignments: ['Heel', 'Face']
  },
  {
    name: 'Cult Leader & Prophet',
    category: 'Supernatural / Mystic',
    description: 'Charismatic zealot delivering hypnotic sermons and brainwashing followers.',
    suggestedStyles: ['Entertainer', 'Brawler'],
    suggestedAlignments: ['Heel']
  },
  {
    name: 'Underdog Fighting Champion',
    category: 'Babyface',
    description: 'Hard-working hero with iron willpower who fights from underneath against giants.',
    suggestedStyles: ['High Flyer', 'Technician'],
    suggestedAlignments: ['Face']
  },
  {
    name: 'Billion-Dollar Aristocrat',
    category: 'Entertainer',
    description: 'Obnoxiously wealthy elite looking down with disgust at everyday fans.',
    suggestedStyles: ['Entertainer', 'Technician'],
    suggestedAlignments: ['Heel']
  },
  {
    name: 'Monster Destroyer',
    category: 'Goliath',
    description: 'Unstoppable beast who plows through opponents and laughs at heavy pain.',
    suggestedStyles: ['Powerhouse'],
    suggestedAlignments: ['Heel']
  },
  {
    name: 'Masked Luchador Superhero',
    category: 'High-Flying',
    description: 'Colorful masked aerial sensation idolized by younger fans.',
    suggestedStyles: ['High Flyer'],
    suggestedAlignments: ['Face']
  },
  {
    name: 'Submission Machine Purist',
    category: 'Technical',
    description: 'No nonsense, catches limbs and snaps joints in clinics of mat excellence.',
    suggestedStyles: ['Technician'],
    suggestedAlignments: ['Face', 'Heel']
  },
  {
    name: 'Deranged Lunatic',
    category: 'Extreme',
    description: 'Wild unpredictable maniac who enjoys hurting himself as much as his foes.',
    suggestedStyles: ['Hardcore', 'Brawler'],
    suggestedAlignments: ['Face', 'Heel']
  },
  {
    name: 'Anti-Hero Rebel',
    category: 'Edgy',
    description: 'Rude, leather-jacketed rogue who defies authority and drinks beer in the ring.',
    suggestedStyles: ['Brawler'],
    suggestedAlignments: ['Face']
  },
  {
    name: 'Hollywood A-Lister',
    category: 'Egotist',
    description: 'Arrogant celebrity actor who thinks the wrestling ring is beneath them.',
    suggestedStyles: ['Entertainer'],
    suggestedAlignments: ['Heel']
  },
  {
    name: 'Cyberpunk Anarchist',
    category: 'Modern',
    description: 'Tech-savvy disruptor bringing neon fury and anti-establishment edge.',
    suggestedStyles: ['High Flyer', 'Hardcore'],
    suggestedAlignments: ['Face', 'Heel']
  },
  {
    name: 'Martial Arts Master',
    category: 'Striker',
    description: 'Black-belt practitioner delivering stiff kicks, spinning strikes and sweeps.',
    suggestedStyles: ['Technician', 'Brawler'],
    suggestedAlignments: ['Face', 'Heel']
  },
  {
    name: 'Comedy Fan Favorite',
    category: 'Comedy',
    description: 'Goofy antics and beloved crowd participation that wins over even casual fans.',
    suggestedStyles: ['Entertainer', 'High Flyer'],
    suggestedAlignments: ['Face']
  },
  {
    name: 'Suited Corporate Enforcer',
    category: 'Corporate',
    description: 'Stern enforcer in dress slacks doing dirty work for corporate management.',
    suggestedStyles: ['Powerhouse', 'Brawler'],
    suggestedAlignments: ['Heel']
  }
];

export const SAMPLE_INCIDENTS_POOL = [
  {
    title: 'Ego Clash Over Main Event Finish',
    description: 'Two top stars got into an intense shouting match backstage over who should take the clean pinfall tonight.',
    incidentType: 'Ego Clash' as const,
    severity: 'Moderate' as const,
    options: [
      {
        id: 'opt-1',
        text: 'Enforce booker authority: Command the planned winner and threaten a fine.',
        consequenceText: 'Enforced discipline! Top stars grumbled, but hierarchy was respected. (+2 Locker Room Order)',
        moraleDelta: -2,
        budgetCost: 0,
        overnessDelta: 0
      },
      {
        id: 'opt-2',
        text: 'Offer a DQ/Distraction finish to protect both stars’ egos.',
        consequenceText: 'Protected both stars! Morale held steady, though booker compromised artistic vision.',
        moraleDelta: +3,
        budgetCost: 0,
        overnessDelta: 0
      },
      {
        id: 'opt-3',
        text: 'Promise the loser a championship shot at the next PPV.',
        consequenceText: 'High stakes compromise! Loser accepted eagerly with boosted spirits.',
        moraleDelta: +6,
        budgetCost: 5000,
        overnessDelta: +1
      }
    ]
  },
  {
    title: 'Star Late for Television Call Time',
    description: 'A key midcarder strolled into the building only 45 minutes before live broadcast due to traffic.',
    incidentType: 'Late for Show' as const,
    severity: 'Minor' as const,
    options: [
      {
        id: 'opt-1',
        text: 'Issue a strict $2,500 fine and reprimand in front of the locker room.',
        consequenceText: 'Strict fine levied. Locker room takes note that tardiness will not be tolerated.',
        moraleDelta: -3,
        budgetCost: -2500,
        overnessDelta: 0
      },
      {
        id: 'opt-2',
        text: 'Give a private warning behind closed doors.',
        consequenceText: 'Private talk handled calmly. The wrestler apologized and promised never again.',
        moraleDelta: +1,
        budgetCost: 0,
        overnessDelta: 0
      }
    ]
  },
  {
    title: 'Locker Room Catering Brawl',
    description: 'Tempers boiled over in the catering room with punches thrown and a table overturned!',
    incidentType: 'Backstage Fight' as const,
    severity: 'Crisis' as const,
    options: [
      {
        id: 'opt-1',
        text: 'Immediately suspend both wrestlers for 2 weeks with unpaid fines.',
        consequenceText: 'Swift suspensions sent shockwaves through the locker room! Cleaned up the culture.',
        moraleDelta: -5,
        budgetCost: -5000,
        overnessDelta: 0
      },
      {
        id: 'opt-2',
        text: 'Turn the real-life backstage bad blood into an on-screen blood feud!',
        consequenceText: 'Capitalized on the controversy! Dirt-sheets blew up and fan intrigue surged.',
        moraleDelta: +2,
        budgetCost: 0,
        overnessDelta: +3
      }
    ]
  },
  {
    title: 'Veteran Takes Young Rookie Under Wing',
    description: 'A respected veteran spent hours before the show coaching younger talent on in-ring ring psychology.',
    incidentType: 'Mentor Bond' as const,
    severity: 'Minor' as const,
    options: [
      {
        id: 'opt-1',
        text: 'Praise both in the pre-show locker room meeting and award a $2,000 leadership bonus.',
        consequenceText: 'Locker room warmly applauded the veteran leadership. Chemistry improved across the board!',
        moraleDelta: +6,
        budgetCost: 2000,
        overnessDelta: +1
      },
      {
        id: 'opt-2',
        text: 'Book them in a showcase mentor-and-student tag team match.',
        consequenceText: 'The crowd loved the natural dynamic! A new alliance has been forged.',
        moraleDelta: +8,
        budgetCost: 0,
        overnessDelta: +2
      }
    ]
  },
  {
    title: 'Charity Hospital Visit Generates Viral Goodwill',
    description: 'A babyface star spent their free morning visiting a local children’s hospital, generating massive positive PR.',
    incidentType: 'Charity Hero' as const,
    severity: 'Minor' as const,
    options: [
      {
        id: 'opt-1',
        text: 'Highlight the goodwill piece on the weekly broadcast and social channels.',
        consequenceText: 'Tremendous viewer reception! Network executives praised the positive brand exposure.',
        moraleDelta: +5,
        budgetCost: 1000,
        overnessDelta: +3,
        networkDelta: +3
      }
    ]
  }
];

export interface ArchetypeBlueprint {
  archetype: StorylineArchetype;
  name: string;
  tagline: string;
  description: string;
  suggestedDurationWeeks: number;
  recommendedCategory: 'World Title' | 'Grudge Feud' | 'Tag Division' | 'Midcard Ascension';
  milestones: {
    title: string;
    category: 'Match' | 'Angle';
    segmentType: MatchType | AngleType;
    description: string;
    suggestedFinish?: FinishType;
  }[];
}

export const STORYLINE_ARCHETYPES_CATALOG: ArchetypeBlueprint[] = [
  {
    archetype: 'Underdog Title Chase',
    name: 'The Underdog\'s Mountain Climb',
    tagline: 'A beloved fan-favorite fights through insurmountable odds to reach destiny.',
    description: 'Classic Daniel Bryan / Mick Foley arc: The champion denies the challenger a fair shot, forcing them through gauntlets, contract sabotage, and beatdowns until the explosive PPV payoff.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'World Title',
    milestones: [
      {
        title: 'The Challenge & The Snub',
        category: 'Angle',
        segmentType: 'Confrontation / Staredown',
        description: 'Protagonist challenges the arrogant champion. Champion mocks them and refuses, setting a grueling test.'
      },
      {
        title: 'The Unfair Gauntlet Match',
        category: 'Match',
        segmentType: 'Singles',
        description: 'Protagonist must defeat the champion’s handpicked enforcer to earn their official title shot.',
        suggestedFinish: 'Clean Pinfall'
      },
      {
        title: 'Heel Ambush & Contract Signature',
        category: 'Angle',
        segmentType: 'Contract Signing',
        description: 'Contract signing turns into a violent table crash assault! Protagonist is left bloodied but signs the contract.'
      },
      {
        title: 'The Championship Climax',
        category: 'Match',
        segmentType: 'Singles',
        description: 'The monumental PPV title showdown. The protagonist overcomes outside interference for the emotional climax.',
        suggestedFinish: 'Submission'
      }
    ]
  },
  {
    archetype: 'Monster Reign of Terror',
    name: 'The Unstoppable Monster\'s Reign of Terror',
    tagline: 'A dominant, unstoppable force crushes all challengers in their wake.',
    description: 'Brock Lesnar / Vader / Undertaker style: The monster champion leaves a trail of broken bodies. A valiant hero steps up to protect the locker room.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'World Title',
    milestones: [
      {
        title: 'Destruction of a Locker Room Favorite',
        category: 'Match',
        segmentType: 'Singles',
        description: 'The Monster annihilates a respected midcarder in a dominant squash match and refuses to break the hold.',
        suggestedFinish: 'Last Man Standing 10-Count'
      },
      {
        title: 'The Hero Makes The Save',
        category: 'Angle',
        segmentType: 'Confrontation / Staredown',
        description: 'The Monster attacks backstage. The Protagonist charges in with a steel chair to drive the beast away!'
      },
      {
        title: 'Intense In-Ring Faceoff & Brawl',
        category: 'Angle',
        segmentType: 'In-Ring Promo',
        description: 'Security is powerless to stop the two powerhouses from tearing down the ring barricades in a brawl.'
      },
      {
        title: 'No-Holds-Barred Heavyweight War',
        category: 'Match',
        segmentType: 'Hardcore / No DQ',
        description: 'A brutal collision of titans with foreign objects, broken tables, and unbelievable resilience.',
        suggestedFinish: 'Clean Pinfall'
      }
    ]
  },
  {
    archetype: 'Heartbreaking Tag Betrayal',
    name: 'Brotherhood Broken: The Betrayal',
    tagline: 'Lifelong partners crumble from jealousy into bloodthirsty rivals.',
    description: 'The Rockers / Festival of Friendship arc: Subtle tension brews between beloved tag partners until one violently turns with a devastating chair shot.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'Grudge Feud',
    milestones: [
      {
        title: 'Miscommunication in the Ring',
        category: 'Match',
        segmentType: 'Tag Team',
        description: 'Accidental friendly fire costs the duo a crucial match. Staredown and tense shove before hugging it out.',
        suggestedFinish: 'Distraction Rollup'
      },
      {
        title: 'The Shocking Betrayal',
        category: 'Angle',
        segmentType: 'Backstage Ambush',
        description: 'Antagonist snaps! Brutal blindsided chair shot to the back, smashing the partner into the concrete.'
      },
      {
        title: 'Heel Manifesto Promo',
        category: 'Angle',
        segmentType: 'In-Ring Promo',
        description: 'Antagonist explains why they had to sever the dead weight, declaring themselves the true superstar of the team.'
      },
      {
        title: 'Grudge Match: Steel Cage Blowoff',
        category: 'Match',
        segmentType: 'Steel Cage',
        description: 'Locked inside 15 feet of steel! Nowhere to run for the traitor as pure retribution takes center stage.',
        suggestedFinish: 'Clean Pinfall'
      }
    ]
  },
  {
    archetype: 'Corrupt Authority Resistance',
    name: 'Rebel vs. The Machine (Authority)',
    tagline: 'An anti-hero defies corporate executives and corrupt referees.',
    description: 'Stone Cold vs. Mr. McMahon / Daniel Bryan vs. The Authority: Corporate leadership wants a marketable poster-boy, but the rebel refuses to conform.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'Grudge Feud',
    milestones: [
      {
        title: 'Corporate Decree & Defiance',
        category: 'Angle',
        segmentType: 'In-Ring Promo',
        description: 'Suit executives demand an apology. Protagonist delivers an emphatic insult and clears the security detail!'
      },
      {
        title: 'Handicap Match Trap',
        category: 'Match',
        segmentType: 'Tag Team',
        description: 'Authority books protagonist in a grueling 2-on-1 handicap match with heavily biased officiating.',
        suggestedFinish: 'Disqualification (DQ)'
      },
      {
        title: 'Hijacking the Broadcast',
        category: 'Angle',
        segmentType: 'In-Ring Promo',
        description: 'Protagonist invades the production truck or production stage, airing embarrassing footage of the corrupt boss.'
      },
      {
        title: 'Sanctioned Street Fight',
        category: 'Match',
        segmentType: 'Falls Count Anywhere',
        description: 'Authority\'s top corporate enforcer battles the rebel in a chaotic, crowd-brawling brawl where anything goes.',
        suggestedFinish: 'Clean Pinfall'
      }
    ]
  },
  {
    archetype: 'Unlikely Odd-Couple Champions',
    name: 'The Unlikely Odd-Couple Tag Alliance',
    tagline: 'Two sworn enemies are forced to team up and accidentally capture gold.',
    description: 'Booker T & Goldust / Team Hell No / Rock \'n\' Sock: Completely contrasting personalities bicker endlessly but develop unmatched in-ring synergy.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'Tag Division',
    milestones: [
      {
        title: 'Forced Alliance in Backstage Catering',
        category: 'Angle',
        segmentType: 'Interview Segment',
        description: 'General Manager informs both rivals they must team tonight or be heavily fined. Hilarious mutual disgust.'
      },
      {
        title: 'Improbable Contendership Victory',
        category: 'Match',
        segmentType: 'Tag Team',
        description: 'Despite bickering on the ring apron, their chaotic offense confuses their opponents to secure a win.',
        suggestedFinish: 'Clean Pinfall'
      },
      {
        title: 'Comedic Bonding Vignette',
        category: 'Angle',
        segmentType: 'Hype Video / Vignette',
        description: 'Duo attends an awkward anger management class or public dinner, surprisingly finding mutual respect.'
      },
      {
        title: 'Championship Gold on the Line',
        category: 'Match',
        segmentType: 'Tag Team',
        description: 'The odd-couple challenges the reigning tag champions in a thrilling, synchronized championship bout.',
        suggestedFinish: 'Clean Pinfall'
      }
    ]
  },
  {
    archetype: 'Legend\'s Last Stand',
    name: 'The Legend\'s Last Stand (Career on the Line)',
    tagline: 'An aging icon risks retirement to prove they still have greatness left.',
    description: 'Ric Flair WrestleMania 24 / Shawn Michaels: An arrogant young gun claims the veteran is washed up and demands they step aside or be put down for good.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'Grudge Feud',
    milestones: [
      {
        title: 'The Young Gun Disrespects the Icon',
        category: 'Angle',
        segmentType: 'In-Ring Promo',
        description: 'Young arrogant heel slaps the legend and calls them a relic of the past who should retire immediately.'
      },
      {
        title: 'One More Run: Career on the Line Stipulation',
        category: 'Angle',
        segmentType: 'Confrontation / Staredown',
        description: 'Legend accepts the challenge under one condition: if they lose at the PPV, their career is over forever.'
      },
      {
        title: 'Emotional Training Camp Montage',
        category: 'Angle',
        segmentType: 'Hype Video / Vignette',
        description: 'Intense cinematic vignette showcasing the legend\'s storied history, scars, and grueling conditioning.'
      },
      {
        title: 'Career vs. Respect PPV Classic',
        category: 'Match',
        segmentType: 'Iron Man (30 Min)',
        description: 'An emotional 30-minute masterpiece of in-ring storytelling, drama, near-falls, and ring psychology.',
        suggestedFinish: 'Submission'
      }
    ]
  },
  {
    archetype: 'Faction Gang Warfare',
    name: 'Faction Gang Warfare: Turf War',
    tagline: 'Two rival stables battle for complete broadcast territory supremacy.',
    description: 'Four Horsemen vs. nWo / Bloodline vs. Judgment Day: A coordinated group of wrestlers systematically attacks the territory.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'Grudge Feud',
    milestones: [
      {
        title: 'Mass Gang Attack & Ring Takeover',
        category: 'Angle',
        segmentType: 'Faction War / Gang Attack',
        description: 'Antagonist stable swarms the ring after a match, dismantling everyone in sight and spray-painting the canvas.'
      },
      {
        title: 'Retaliatory Backstage Ambush',
        category: 'Angle',
        segmentType: 'Backstage Ambush',
        description: 'Protagonists ambush members in the locker room, evening the psychological odds.'
      },
      {
        title: 'Preview 6-Man Tag Clatter',
        category: 'Match',
        segmentType: '6-Man Tag',
        description: 'High-energy 6-man battle showcasing each member\'s specialty maneuvers.',
        suggestedFinish: 'Disqualification (DQ)'
      },
      {
        title: 'WarGames / Elimination Chamber Blowoff',
        category: 'Match',
        segmentType: 'Elimination Chamber',
        description: 'The ultimate faction war inside the cage structure to crown the undisputed dominant faction.',
        suggestedFinish: 'Clean Pinfall'
      }
    ]
  },
  {
    archetype: 'Mask vs. Hair Grudge Feud',
    name: 'Ultimate Pride: Mask vs. Hair / Ultimate Grudge',
    tagline: 'When respect is gone, the only thing left to wager is personal honor.',
    description: 'Lucha Libre tradition meets bitter animosity: The heel attempts to rip off the mask or mock the heritage of the opponent.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'Grudge Feud',
    milestones: [
      {
        title: 'The Desecration & Mask Rip',
        category: 'Angle',
        segmentType: 'Confrontation / Staredown',
        description: 'Heel tears at the babyface\'s mask/heritage, committing the ultimate wrestling taboo before fleeing.'
      },
      {
        title: 'Street Fight Retribution',
        category: 'Match',
        segmentType: 'Falls Count Anywhere',
        description: 'Furious babyface chases the heel into the concession stands and parking lot in a wild brawl.',
        suggestedFinish: 'Countout'
      },
      {
        title: 'The Barber\'s Chair Contract Signing',
        category: 'Angle',
        segmentType: 'Contract Signing',
        description: 'Clippers and scissors brought into the ring. Both stars officially wager their mask or hair.'
      },
      {
        title: 'Mask vs. Hair Climactic Match',
        category: 'Match',
        segmentType: 'Ladder Match',
        description: 'A death-defying ladder match where the loser must immediately face public humiliation in the ring.',
        suggestedFinish: 'Clean Pinfall'
      }
    ]
  },
  {
    archetype: 'Contract in the Bank Cash-In',
    name: 'The Paranoia of the Golden Contract',
    tagline: 'A greedy opportunist stalks the champion with a guaranteed title match in hand.',
    description: 'Money in the Bank style: The briefcase/contract holder lurks around every corner, tormenting the exhausted champion.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'World Title',
    milestones: [
      {
        title: 'The Stalking from the Entrance Ramp',
        category: 'Angle',
        segmentType: 'Confrontation / Staredown',
        description: 'Champion survives a brutal defense only for the contract holder to slowly walk out and tap their watch.'
      },
      {
        title: 'Interference & False Alarm Cash-In',
        category: 'Angle',
        segmentType: 'Backstage Ambush',
        description: 'Contract holder brings a referee down the ramp during a match, mentally shattering the champion\'s focus.'
      },
      {
        title: 'Tense In-Ring Debate & Warning',
        category: 'Angle',
        segmentType: 'In-Ring Promo',
        description: 'The champion dares them to cash in right now like a real competitor. The opportunist smiles and declines.'
      },
      {
        title: 'The Scheduled Marquee Showdown',
        category: 'Match',
        segmentType: 'TLC (Tables Ladders Chairs)',
        description: 'The contract is finally cashed in advance for a high-risk TLC spectacle under the brightest lights.',
        suggestedFinish: 'Clean Pinfall'
      }
    ]
  },
  {
    archetype: 'Mystery Attacker / Conspiracy',
    name: 'Whodunit? The Backstage Mystery Attacker',
    tagline: 'A superstar is found unconscious backstage. The locker room turns into paranoia.',
    description: 'Stone Cold hit-and-run style: Who drove the car? Clues are investigated week to week until the shocking mastermind is unmasked.',
    suggestedDurationWeeks: 4,
    recommendedCategory: 'Grudge Feud',
    milestones: [
      {
        title: 'The Crime Scene in the Garage',
        category: 'Angle',
        segmentType: 'Hype Video / Vignette',
        description: 'Cell phone footage shows the top star laid out next to a black sedan. Paramedics rush the scene.'
      },
      {
        title: 'Interrogating the Prime Suspects',
        category: 'Angle',
        segmentType: 'Interview Segment',
        description: 'Locker room members accuse each other; alibis are tested as backstage paranoia runs rampant.'
      },
      {
        title: 'The Return & The Accusation',
        category: 'Angle',
        segmentType: 'In-Ring Promo',
        description: 'The injured star returns to a thunderous ovation and calls out the person they believe orchestrated it.'
      },
      {
        title: 'The Reveal & Retribution Match',
        category: 'Match',
        segmentType: 'Hell in a Cell',
        description: 'The true mastermind is exposed in the ring and locked inside Hell in a Cell with no escape!',
        suggestedFinish: 'Clean Pinfall'
      }
    ]
  }
];

export interface PromoPitchTemplate {
  id: string;
  title: string;
  category: AngleType;
  tone: 'High Drama / Personal' | 'Violent & Chaotic' | 'Comedic & Entertaining' | 'Athletic / Respectful';
  premise: string;
  scriptOutline: {
    setup: string;
    climax: string;
    cliffhanger: string;
  };
  producerNotes: string;
  projectedHeat: number;
}

export const PROMO_PITCH_PRESETS: PromoPitchTemplate[] = [
  {
    id: 'pitch-pipebomb',
    title: 'The Uncensored Mic Manifesto',
    category: 'In-Ring Promo',
    tone: 'High Drama / Personal',
    premise: 'Superstar sits cross-legged on the entrance ramp and breaks the fourth wall, calling out management favoritism.',
    scriptOutline: {
      setup: 'Wrestler interrupts the broadcast audio and grabs a live microphone as the director threatens to cut feed.',
      climax: 'Spits truth-bombs about unearned title pushes, political maneuvering, and how the fans deserve real champions.',
      cliffhanger: 'The microphone is abruptly cut off as the arena erupts into thunderous chants!'
    },
    producerNotes: 'Do not play entrance music upon exit. Let the silence and organic crowd reaction breathe.',
    projectedHeat: 85
  },
  {
    id: 'pitch-contract-brawl',
    title: 'Sanctioned Contract Signing Table Destruction',
    category: 'Contract Signing',
    tone: 'Violent & Chaotic',
    premise: 'The standard formal desk and leather chairs contract signing erupts into an inevitable high-impact table crash.',
    scriptOutline: {
      setup: 'General Manager presides over the signing with security ringside to guarantee peace.',
      climax: 'Tense trash talk turns physical; one competitor tosses the table into security and powerbombs their rival through wood!',
      cliffhanger: 'The assailant stands on the turnbuckle brandishing the ink-signed contract over the broken victim.'
    },
    producerNotes: 'Reinforce the table legs with pre-scored balsa wood for maximum safety and audio crack.',
    projectedHeat: 80
  },
  {
    id: 'pitch-parking-lot',
    title: 'Parking Lot Rental Car Hood Beatdown',
    category: 'Backstage Ambush',
    tone: 'Violent & Chaotic',
    premise: 'A sneak attack catches a superstar unawares as they unpack luggage outside the arena.',
    scriptOutline: {
      setup: 'Camera crew spots the star arriving in the VIP parking bay with their gear bag.',
      climax: 'Antagonist sprints from behind an SUV with a tire iron! Smashes the star onto the car hood and windshield.',
      cliffhanger: 'Car alarm blares continuously while backstage agents and medics rush into the frame screaming for ice.'
    },
    producerNotes: 'Use handheld shaky-cam cinematography to sell the raw, impromptu reality.',
    projectedHeat: 75
  },
  {
    id: 'pitch-staredown-ref',
    title: 'Nose-to-Nose Staredown with Heavyweight Security',
    category: 'Confrontation / Staredown',
    tone: 'Athletic / Respectful',
    premise: 'Two alpha champions stand inches apart in center ring without throwing a single punch.',
    scriptOutline: {
      setup: 'Both competitors march to the ring accompanied by a wall of twenty security personnel forming a human divide.',
      climax: 'They step around security and lean forehead-to-forehead, trading quiet, chilling promises of pain.',
      cliffhanger: 'Neither man blinks as the referee team physically pries them apart while the crowd screams for a brawl.'
    },
    producerNotes: 'Spotlights dimmed on the crowd; tight 35mm lens focused strictly on their facial expressions.',
    projectedHeat: 88
  },
  {
    id: 'pitch-vip-lounge',
    title: 'VIP Talk Show Set Vandalism & Wine Splash',
    category: 'Interview Segment',
    tone: 'Comedic & Entertaining',
    premise: 'An egotistical talk show segment featuring Persian rugs and fake plants gets completely trashed.',
    scriptOutline: {
      setup: 'Host welcomes the guest while pouring expensive sparkling wine into gold chalices.',
      climax: 'Guest insults the host’s fashion and pours wine straight into the host’s designer sunglasses before throwing them into a sofa!',
      cliffhanger: 'The guest puts their feet up on the glass coffee table and takes a sip from the bottle as security watches in horror.'
    },
    producerNotes: 'Keep the banter witty and fast-paced. Ensure props are lightweight breakables.',
    projectedHeat: 72
  },
  {
    id: 'pitch-stolen-belt',
    title: 'The Grand Larceny: Championship Belt Stolen',
    category: 'Backstage Ambush',
    tone: 'High Drama / Personal',
    premise: 'A challenger knocks out the champion and steals the physical belt, declaring themselves the "Real World Champion".',
    scriptOutline: {
      setup: 'Champion finishes a promo in gorilla position and heads back toward the locker room.',
      climax: 'Attacker cracks them with a fire extinguisher from behind and unhooks the title belt from their waist!',
      cliffhanger: 'Attacker poses outside the building hoisting the belt above their head and drives away in a cab.'
    },
    producerNotes: 'Will ignite immediate weekly chase storylines until the belt is recovered.',
    projectedHeat: 82
  },
  {
    id: 'pitch-open-challenge',
    title: 'The Impromptu Open Challenge Shock Return',
    category: 'In-Ring Promo',
    tone: 'Athletic / Respectful',
    premise: 'Champion issues an open invitation for anyone in the back to step up right now.',
    scriptOutline: {
      setup: 'Champion boasts that no one on the roster has the guts to challenge them tonight.',
      climax: 'A surprise countdown hits the titantron and an unexpected star’s theme music blasts through the arena!',
      cliffhanger: 'The roof blows off the building as the challenger sprints down the ramp ready to fight!'
    },
    producerNotes: 'Strict secret behind gorilla; do not list the surprise challenger on the public call sheet.',
    projectedHeat: 90
  },
  {
    id: 'pitch-cryptic-vignette',
    title: 'The Cryptic Titantron Prophecy',
    category: 'Hype Video / Vignette',
    tone: 'High Drama / Personal',
    premise: 'Static glitches on the arena screens followed by haunting symbolism warning the locker room of reckoning.',
    scriptOutline: {
      setup: 'House lights in the arena flicker and turn blood-red as an eerie broadcast interrupt tone chimes.',
      climax: 'A shadowy figure speaks in riddles, holding burning photographs of current champions.',
      cliffhanger: 'A specific date or countdown appears on screen before the broadcast abruptly returns to commentary.'
    },
    producerNotes: 'Keep identity shrouded in silhouette to build maximum online speculation.',
    projectedHeat: 78
  },
  {
    id: 'pitch-faction-swarms',
    title: 'Five-on-One Gang Guillotine Beatdown',
    category: 'Faction War / Gang Attack',
    tone: 'Violent & Chaotic',
    premise: 'A dominant stable surrounds an isolated hero and systematically puts them out of commission.',
    scriptOutline: {
      setup: 'The lone babyface is speaking to an interviewer when lights drop and the faction encircles.',
      climax: 'They beat the hero down with numbers, wrap a steel chair around their ankle, and stomp on it from the second rope!',
      cliffhanger: 'The stable stands shoulder-to-shoulder flashing their gang sign as the hero screams in agony.'
    },
    producerNotes: 'Sells the absolute malice and dominance of the heel faction; establishes sympathetic revenge quest.',
    projectedHeat: 84
  }
];

export const DEFAULT_CREATIVE_NOTES: CreativeNote[] = [
  {
    id: 'note-1',
    title: 'Build World Heavyweight Championship to Summer Supercard',
    category: 'PPV Main Event',
    body: 'Keep the World Title protected. Target an undefeated 12-week build leading into the main event. Protect the challenger\'s finisher so the first kickout creates massive drama.',
    isPinned: true,
    isResolved: false,
    createdWeek: 1,
    createdYear: 2026
  },
  {
    id: 'note-2',
    title: 'Midcard Television Title TV Tournament',
    category: 'TV Cliffhanger',
    body: 'Run an 8-man workrate tournament across consecutive weeks of TV to boost ratings in the second hour. Winner gets crowned with the new prestige belt.',
    isPinned: false,
    isResolved: false,
    createdWeek: 1,
    createdYear: 2026
  },
  {
    id: 'note-3',
    title: 'Slow-Burn Heel Turn for Beloved Fan Favorite',
    category: 'Push & Derail',
    body: 'Begin seeding subtle frustration: refusing to shake hands after close losses, walking away during tag partner tags. Trigger the full turn at the next PPV.',
    isPinned: true,
    isResolved: false,
    createdWeek: 1,
    createdYear: 2026
  },
  {
    id: 'note-4',
    title: 'Repackage Underutilized Cruiserweight into Masked Luchador',
    category: 'Call-Up & Repackaging',
    body: 'Gimmick lab testing showed S-tier potential if given high-flying presentation, neon pyro, and traditional heritage mask. Plan 3-week vignette countdown.',
    isPinned: false,
    isResolved: false,
    createdWeek: 1,
    createdYear: 2026
  }
];

export interface WritersRoomAgent {
  name: string;
  role: string;
  avatarIcon: string;
  philosophy: string;
  advice: string;
  bookingTip: string;
}

export const WRITERS_ROOM_AGENTS: WritersRoomAgent[] = [
  {
    name: '“Cowboy” Jack Callahan',
    role: 'Old-School Road Agent & Hall of Famer',
    avatarIcon: '🤠',
    philosophy: 'Gritty Territory Psychology & Belts That Mean Something',
    advice: '“Don’t give the fans the whole farm on free television, brother! Make ‘em pay to see the champion get beat inside a steel cage. Protect your finishers!”',
    bookingTip: 'Keep rivalries simmering for at least 4 to 6 weeks before blowing them off on pay-per-view.'
  },
  {
    name: 'Marcus Vance',
    role: 'Television Network Executive Liaison',
    avatarIcon: '📺',
    philosophy: 'Ratings Quarter-Hours, Commercial Cliffhangers & Demographics',
    advice: '“The suits upstairs care about quarterly retention. Put your hottest angle right before the second commercial break, and give viewers a reason to tune in next week.”',
    bookingTip: 'Always book at least one high-stakes promo or brawl angle with over 80+ charisma talent.'
  },
  {
    name: 'Hiroshi “The Sensei” Tanaka',
    role: 'International Match Producer & Workrate Purist',
    avatarIcon: '🥋',
    philosophy: 'Pure Athleticism, In-Ring Storytelling & Clean Finishes',
    advice: '“Gimmicks can get a pop, but 25 minutes of pure athletic drama makes legends. Let technicians wrestle without excessive screwy finishes.”',
    bookingTip: 'Pair high-workrate wrestlers in 15+ minute matches to elevate card star ratings above 4.0 stars.'
  },
  {
    name: 'Chloe Sinclair',
    role: 'Head of Creative & Character Development',
    avatarIcon: '🎭',
    philosophy: 'Soap Opera Melodrama, Dramatic Betrayals & Viral Moments',
    advice: '“Wrestling is emotional theater in combat boots! Fans remember the tears when two best friends turn on each other more than a wristlock.”',
    bookingTip: 'Use contract signings and backstage ambushes to spike feud heat into White Hot territory.'
  }
];

export function generateDefaultStorylines(
  promotion: {
    roster: { id: string; name: string; alignment: string; push: string }[];
    feuds: { id: string; name: string; wrestlerAIds: string[]; wrestlerBIds: string[]; heat: number }[];
    titles: { id: string; name: string; currentHolderIds: string[] }[];
    ppvSchedule?: PPVEvent[];
  },
  currentWeek: number = 1,
  currentYear: number = 2026
): StorylineArc[] {
  const result: StorylineArc[] = [];
  const nextPPV = (promotion.ppvSchedule && promotion.ppvSchedule.length > 0)
    ? promotion.ppvSchedule.find(p => p.weekNumber >= currentWeek) || promotion.ppvSchedule[0]
    : undefined;
  const ppvName = nextPPV ? nextPPV.name : 'Genesis Supercard';

  // 1. World Title or Top Feud Chase
  const topTitle = promotion.titles[0];
  const championId = topTitle?.currentHolderIds[0];
  const champion = promotion.roster.find(w => w.id === championId);

  // Find a top face challenger if champion is heel, or heel challenger if champion is face
  const challenger = promotion.roster.find(w => 
    w.id !== championId && 
    (champion ? w.alignment !== champion.alignment : true) &&
    (w.push === 'Main Eventer' || w.push === 'Upper Midcard')
  ) || promotion.roster.find(w => w.id !== championId);

  const underdogTemplate = STORYLINE_ARCHETYPES_CATALOG.find(a => a.archetype === 'Underdog Title Chase')!;

  if (champion && challenger) {
    const isChallengerFace = challenger.alignment === 'Face';
    const protagonistId = isChallengerFace ? challenger.id : champion.id;
    const antagonistId = isChallengerFace ? champion.id : challenger.id;

    result.push({
      id: `arc-title-${Date.now()}-1`,
      title: `${challenger.name} vs. ${champion.name}: The Road to Gold`,
      archetype: 'Underdog Title Chase',
      protagonistIds: [protagonistId],
      antagonistIds: [antagonistId],
      targetPPVName: ppvName,
      targetTitleId: topTitle?.id,
      heat: 82,
      momentum: 'Boiling Hot',
      status: 'Active On TV',
      startWeek: currentWeek,
      startYear: currentYear,
      plannedWeeksDuration: 4,
      currentMilestoneIndex: 0,
      milestones: underdogTemplate.milestones.map((m, idx) => ({
        id: `m-title-1-${idx}`,
        stepNumber: idx + 1,
        title: m.title,
        category: m.category,
        segmentType: m.segmentType,
        description: m.description,
        suggestedFinish: m.suggestedFinish,
        isCompleted: false,
        targetWeekOffset: idx + 1
      })),
      notes: `Targeting climax at ${ppvName} for the ${topTitle?.name || 'World Championship'}.`
    });
  }

  // 2. Grudge Feud or Monster Terror
  const topFeud = promotion.feuds[0];
  if (topFeud && topFeud.wrestlerAIds.length > 0 && topFeud.wrestlerBIds.length > 0) {
    const fA = promotion.roster.find(w => w.id === topFeud.wrestlerAIds[0]);
    const fB = promotion.roster.find(w => w.id === topFeud.wrestlerBIds[0]);

    if (fA && fB && (!champion || (fA.id !== champion.id && fB.id !== champion.id))) {
      const betrayalTemplate = STORYLINE_ARCHETYPES_CATALOG.find(a => a.archetype === 'Heartbreaking Tag Betrayal')!;
      result.push({
        id: `arc-feud-${Date.now()}-2`,
        title: `${topFeud.name}: Bitter Grudge War`,
        archetype: 'Heartbreaking Tag Betrayal',
        protagonistIds: [fA.id],
        antagonistIds: [fB.id],
        feudId: topFeud.id,
        targetPPVName: ppvName,
        heat: topFeud.heat || 78,
        momentum: 'Boiling Hot',
        status: 'Active On TV',
        startWeek: currentWeek,
        startYear: currentYear,
        plannedWeeksDuration: 4,
        currentMilestoneIndex: 0,
        milestones: betrayalTemplate.milestones.map((m, idx) => ({
          id: `m-feud-2-${idx}`,
          stepNumber: idx + 1,
          title: m.title,
          category: m.category,
          segmentType: m.segmentType,
          description: m.description,
          suggestedFinish: m.suggestedFinish,
          isCompleted: false,
          targetWeekOffset: idx + 1
        })),
        notes: `Grudge animosity tracking directly into the blowoff cage match at ${ppvName}.`
      });
    }
  }

  // 3. Authority or Legend Stand
  const veteran = promotion.roster.find(w => !result.some(r => r.protagonistIds.includes(w.id) || r.antagonistIds.includes(w.id)));
  const youngGun = promotion.roster.find(w => w.id !== veteran?.id && !result.some(r => r.protagonistIds.includes(w.id) || r.antagonistIds.includes(w.id)));

  if (veteran && youngGun) {
    const legendTemplate = STORYLINE_ARCHETYPES_CATALOG.find(a => a.archetype === 'Legend\'s Last Stand')!;
    result.push({
      id: `arc-legend-${Date.now()}-3`,
      title: `${veteran.name} vs. ${youngGun.name}: Generational Clash`,
      archetype: 'Legend\'s Last Stand',
      protagonistIds: [veteran.id],
      antagonistIds: [youngGun.id],
      targetPPVName: ppvName,
      heat: 70,
      momentum: 'Simmering',
      status: 'Active On TV',
      startWeek: currentWeek,
      startYear: currentYear,
      plannedWeeksDuration: 4,
      currentMilestoneIndex: 0,
      milestones: legendTemplate.milestones.map((m, idx) => ({
        id: `m-legend-3-${idx}`,
        stepNumber: idx + 1,
        title: m.title,
        category: m.category,
        segmentType: m.segmentType,
        description: m.description,
        suggestedFinish: m.suggestedFinish,
        isCompleted: false,
        targetWeekOffset: idx + 1
      })),
      notes: 'Classic clash of pride and eras leading to a 30-minute clinic.'
    });
  }

  return result;
}

/**
 * Calculates Hall of Fame induction criteria based on:
 * 1. Career Wins & Win Percentage (30% weight)
 * 2. Championship Reigns & Defenses (40% weight)
 * 3. Overall Longevity in the Simulator (30% weight)
 */
export function calculateHallOfFameScorecard(
  wrestler: Wrestler,
  promotionTitles: Championship[] = []
): HallOfFameScorecard {
  const wins = wrestler.wins || 0;
  const losses = wrestler.losses || 0;
  const draws = wrestler.draws || 0;
  const totalMatches = wins + losses + draws;

  // 1. Career Wins (30%)
  const winRate = totalMatches > 0 ? wins / totalMatches : 0;
  const volumeProgress = Math.min(100, Math.round((wins / 25) * 100));
  const qualityProgress = Math.min(100, Math.round(winRate * 125));
  const winsScore = Math.min(100, Math.round(volumeProgress * 0.65 + qualityProgress * 0.35));

  // 2. Championship Reigns & Heritage (40%)
  // Search title histories + current championshipIds
  let totalReignsCount = wrestler.championshipIds ? wrestler.championshipIds.length : 0;
  let totalDefensesCount = 0;
  const titlesWonNames = new Set<string>();

  promotionTitles.forEach(title => {
    if (wrestler.championshipIds?.includes(title.id)) {
      titlesWonNames.add(title.name);
      totalDefensesCount += title.defenses || 0;
    }
    title.history.forEach(h => {
      const matchByName = h.holderNames?.toLowerCase().includes(wrestler.name.toLowerCase());
      const matchById = h.holderIds?.includes(wrestler.id);
      if (matchByName || matchById) {
        totalReignsCount += 1;
        totalDefensesCount += h.defenses || 0;
        titlesWonNames.add(title.name);
      }
    });
  });

  // Base score from number of reigns
  let reignPoints = 0;
  if (totalReignsCount >= 5) reignPoints = 100;
  else if (totalReignsCount >= 3) reignPoints = 85;
  else if (totalReignsCount >= 2) reignPoints = 70;
  else if (totalReignsCount === 1) reignPoints = 50;

  // Bonus for defenses
  const defensesBonus = Math.min(20, Math.round(totalDefensesCount * 2.5));
  const championshipsScore = Math.min(100, Math.max(0, reignPoints + defensesBonus));

  // 3. Overall Longevity in the Simulator (30%)
  const longevityWeeks = wrestler.careerWeeksInSimulator || Math.max(
    totalMatches * 3,
    (wrestler.age - 20) * 12
  );

  let ageFactor = 20;
  if (wrestler.age >= 42) ageFactor = 100;
  else if (wrestler.age >= 38) ageFactor = 85;
  else if (wrestler.age >= 35) ageFactor = 70;
  else if (wrestler.age >= 31) ageFactor = 50;
  else if (wrestler.age >= 27) ageFactor = 35;

  const matchesFactor = Math.min(100, Math.round((totalMatches / 30) * 100));
  const longevityScore = Math.min(100, Math.round(ageFactor * 0.55 + matchesFactor * 0.45));

  // Overall Score (0-100)
  const overallScore = Math.min(
    100,
    Math.round(winsScore * 0.30 + championshipsScore * 0.40 + longevityScore * 0.30)
  );

  // Targets & Qualification
  const minWinsTarget = 10;
  const minTitlesTarget = 1;
  const minLongevityTarget = 25; // 25 weeks or age 35+

  const winsMet = wins >= minWinsTarget;
  const championshipsMet = totalReignsCount >= minTitlesTarget;
  const longevityMet = wrestler.age >= 35 || longevityWeeks >= minLongevityTarget || totalMatches >= 15;

  let eligibilityTier: HallOfFameScorecard['eligibilityTier'] = 'Not Yet Eligible';
  if (overallScore >= 75 && winsMet && championshipsMet) {
    eligibilityTier = 'First-Ballot Lock';
  } else if (overallScore >= 55 && (winsMet || championshipsMet)) {
    eligibilityTier = 'Strong Candidate';
  } else if (overallScore >= 40) {
    eligibilityTier = 'Borderline Candidate';
  }

  return {
    winsScore,
    championshipsScore,
    longevityScore,
    overallScore,
    eligibilityTier,
    qualificationBreakdown: {
      winsMet,
      championshipsMet,
      longevityMet,
      minWinsTarget,
      minTitlesTarget,
      minLongevityTarget
    }
  };
}

export const DEFAULT_HALL_OF_FAME_INDUCTEES: HallOfFameInductee[] = [
  {
    id: 'hof-jack-sterling',
    wrestlerId: 'legend-sterling',
    name: '“The Sovereign” Jack Sterling',
    nickname: 'The Crown Jewel of Professional Wrestling',
    inductionYear: 2024,
    inductionWeek: 16,
    classTitle: 'Class of 2024',
    category: 'Headliner',
    speechQuote: '“I gave every ligament, every breath, and every drop of sweat to this squared circle. The crown was heavy, but the kingdom was glorious. To the fans: you were my reign.”',
    inductorName: 'Thunder Vance',
    biographySummary: 'The undisputed founding pillar of the promotion. 7-time World Heavyweight Champion whose iconic 420-day reign defined an entire generation of televised wrestling.',
    careerStats: {
      totalWins: 52,
      totalLosses: 8,
      totalDraws: 2,
      winPercentage: 0.84,
      careerTitles: ['World Heavyweight Championship', 'World Tag Team Championship'],
      totalTitleReigns: 8,
      careerTitleDefenses: 28,
      peakOverness: 98,
      careerLongevityWeeks: 312,
      finalAge: 46
    },
    scorecard: {
      winsScore: 98,
      championshipsScore: 100,
      longevityScore: 95,
      overallScore: 98,
      eligibilityTier: 'First-Ballot Lock',
      qualificationBreakdown: {
        winsMet: true,
        championshipsMet: true,
        longevityMet: true,
        minWinsTarget: 10,
        minTitlesTarget: 1,
        minLongevityTarget: 25
      }
    }
  },
  {
    id: 'hof-vance-brody',
    wrestlerId: 'legend-brody',
    name: 'Vance “The War Machine” Brody',
    nickname: 'The Human Battering Ram',
    inductionYear: 2025,
    inductionWeek: 14,
    classTitle: 'Class of 2025',
    category: 'Living Legend',
    speechQuote: '“When that opening bell sounded, there were no backstage politics. Just two warriors, raw iron, and respect carved in broken rings. Never back down from a war.”',
    inductorName: 'Rex Stryker',
    biographySummary: 'Feared powerbrawler who headlined sellout stadiums across two decades. Known for brutal steel cage wars and the legendary 60-minute draw against Sterling in 2018.',
    careerStats: {
      totalWins: 44,
      totalLosses: 12,
      totalDraws: 3,
      winPercentage: 0.75,
      careerTitles: ['World Heavyweight Championship', 'Intercontinental Championship'],
      totalTitleReigns: 5,
      careerTitleDefenses: 16,
      peakOverness: 93,
      careerLongevityWeeks: 260,
      finalAge: 43
    },
    scorecard: {
      winsScore: 90,
      championshipsScore: 88,
      longevityScore: 88,
      overallScore: 89,
      eligibilityTier: 'First-Ballot Lock',
      qualificationBreakdown: {
        winsMet: true,
        championshipsMet: true,
        longevityMet: true,
        minWinsTarget: 10,
        minTitlesTarget: 1,
        minLongevityTarget: 25
      }
    }
  },
  {
    id: 'hof-mistico-dorado',
    wrestlerId: 'legend-dorado',
    name: 'El Místico Dorado',
    nickname: 'The Golden Comet of Mexico',
    inductionYear: 2025,
    inductionWeek: 14,
    classTitle: 'Class of 2025',
    category: 'Pioneer',
    speechQuote: '“This sacred mask carries three generations of blood and dignity. To dive from the turnbuckle into the heavens is every luchador’s destiny. ¡Viva la Lucha Libre!”',
    inductorName: 'Rey Fénix Jr.',
    biographySummary: 'High-flying trailblazer who revolutionized cruiserweight wrestling and introduced authentic Lucha Libre drama to prime-time television.',
    careerStats: {
      totalWins: 38,
      totalLosses: 14,
      totalDraws: 1,
      winPercentage: 0.72,
      careerTitles: ['Cruiserweight Championship', 'World Tag Team Championship'],
      totalTitleReigns: 4,
      careerTitleDefenses: 14,
      peakOverness: 89,
      careerLongevityWeeks: 240,
      finalAge: 41
    },
    scorecard: {
      winsScore: 84,
      championshipsScore: 82,
      longevityScore: 85,
      overallScore: 84,
      eligibilityTier: 'First-Ballot Lock',
      qualificationBreakdown: {
        winsMet: true,
        championshipsMet: true,
        longevityMet: true,
        minWinsTarget: 10,
        minTitlesTarget: 1,
        minLongevityTarget: 25
      }
    }
  },
  {
    id: 'hof-victoria-steele',
    wrestlerId: 'legend-steele',
    name: 'Victoria “The Iron Empress” Steele',
    nickname: 'The Blueprint of Dominance',
    inductionYear: 2026,
    inductionWeek: 12,
    classTitle: 'Class of 2026',
    category: 'Trailblazer',
    speechQuote: '“They said women couldn’t main-event 60,000-seat stadiums. We shattered the glass ceiling, sold out the arenas, and made them bow down to the iron crown.”',
    inductorName: 'Sasha Cross',
    biographySummary: 'Groundbreaking champion who headlined the first-ever women’s stadium supercard. Known for technical mastery, regal entrance choreography, and an undefeated 18-month reign.',
    careerStats: {
      totalWins: 41,
      totalLosses: 6,
      totalDraws: 1,
      winPercentage: 0.85,
      careerTitles: ['World Women’s Championship', 'Women’s Tag Team Championship'],
      totalTitleReigns: 6,
      careerTitleDefenses: 22,
      peakOverness: 94,
      careerLongevityWeeks: 220,
      finalAge: 39
    },
    scorecard: {
      winsScore: 92,
      championshipsScore: 95,
      longevityScore: 86,
      overallScore: 91,
      eligibilityTier: 'First-Ballot Lock',
      qualificationBreakdown: {
        winsMet: true,
        championshipsMet: true,
        longevityMet: true,
        minWinsTarget: 10,
        minTitlesTarget: 1,
        minLongevityTarget: 25
      }
    }
  }
];

export const DEFAULT_RETIRED_WRESTLERS: Wrestler[] = [
  {
    id: 'ret-frank-kowalski',
    name: '“Mad Dog” Frank Kowalski',
    nickname: 'The Steel City Brawler',
    age: 46,
    gender: 'Male',
    style: 'Brawler',
    alignment: 'Face',
    push: 'Upper Midcard',
    overness: 82,
    workrate: 70,
    micSkills: 80,
    stamina: 55,
    morale: 88,
    fatigue: 0,
    injury: { injured: false },
    salary: 0,
    contractWeeks: 0,
    wins: 29,
    losses: 14,
    draws: 2,
    championshipIds: ['apw-tag'],
    retirementAge: 46,
    careerInjuriesCount: 4,
    injuryHistory: ['Cervical Disc Herniation', 'Separated Shoulder', 'Broken Jaw'],
    hofNominationPending: true,
    isRetired: true,
    retiredWeek: 48,
    retiredYear: 2025,
    retirementReason: 'Culminating 25-Year Farewell Tour & Chronic Neck Fatigue',
    careerWeeksInSimulator: 280,
    peakOverness: 88
  },
  {
    id: 'ret-bobby-valentine',
    name: '“Pretty Boy” Bobby Valentine',
    nickname: 'The Mat Perfectionist',
    age: 43,
    gender: 'Male',
    style: 'Technician',
    alignment: 'Heel',
    push: 'Midcard',
    overness: 76,
    workrate: 85,
    micSkills: 82,
    stamina: 60,
    morale: 85,
    fatigue: 0,
    injury: { injured: false },
    salary: 0,
    contractWeeks: 0,
    wins: 26,
    losses: 18,
    draws: 1,
    championshipIds: ['apw-tv'],
    retirementAge: 43,
    careerInjuriesCount: 3,
    injuryHistory: ['Torn Meniscus', 'Concussion Protocol', 'Sprained Ankle'],
    hofNominationPending: false,
    isRetired: true,
    retiredWeek: 32,
    retiredYear: 2025,
    retirementReason: 'Career vs Respect Blowoff Cage Match',
    careerWeeksInSimulator: 240,
    peakOverness: 82
  },
  {
    id: 'ret-kenjiro-sato',
    name: 'Master Kenjiro Sato',
    nickname: 'The Dragon of Tokyo',
    age: 49,
    gender: 'Male',
    style: 'Technician',
    alignment: 'Face',
    push: 'Main Eventer',
    overness: 87,
    workrate: 84,
    micSkills: 75,
    stamina: 58,
    morale: 92,
    fatigue: 0,
    injury: { injured: false },
    salary: 0,
    contractWeeks: 0,
    wins: 34,
    losses: 11,
    draws: 3,
    championshipIds: ['apw-world'],
    retirementAge: 49,
    careerInjuriesCount: 5,
    injuryHistory: ['Fractured Clavicle', 'Torn Bicep', 'Hyper-extended Knee'],
    hofNominationPending: true,
    isRetired: true,
    retiredWeek: 12,
    retiredYear: 2026,
    retirementReason: 'Passing the Torch to the Next Generation',
    careerWeeksInSimulator: 320,
    peakOverness: 91
  }
];




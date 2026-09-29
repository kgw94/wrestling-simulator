export type Alignment = 'Face' | 'Heel';

export type WrestlerStyle = 
  | 'Technician' 
  | 'Brawler' 
  | 'High Flyer' 
  | 'Powerhouse' 
  | 'Hardcore' 
  | 'Entertainer';

export type PushLevel = 
  | 'Main Eventer' 
  | 'Upper Midcard' 
  | 'Midcard' 
  | 'Lower Midcard' 
  | 'Opener' 
  | 'Jobber';

export type GimmickGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface WrestlerGimmick {
  name: string;
  category: string;
  description: string;
  grade: GimmickGrade;
  repackagesCount: number;
}

export interface Wrestler {
  id: string;
  name: string;
  nickname: string;
  age: number;
  gender: 'Male' | 'Female';
  style: WrestlerStyle;
  alignment: Alignment;
  push: PushLevel;
  overness: number; // 0-100
  workrate: number; // 0-100 (in-ring skill)
  micSkills: number; // 0-100 (charisma/promo)
  stamina: number; // 0-100
  morale: number; // 0-100
  fatigue: number; // 0-100
  injury: {
    injured: boolean;
    name?: string;
    weeksRemaining?: number;
  };
  salary: number; // monthly or per-week cost
  contractWeeks: number;
  wins: number;
  losses: number;
  draws: number;
  championshipIds: string[];
  gimmick?: WrestlerGimmick;
  // Retirement and Hall of Fame tracking
  retirementAge?: number; // Target natural retirement age (e.g. 38-48)
  careerInjuriesCount?: number; // Cumulative career injuries suffered
  injuryHistory?: string[]; // Brief notes or titles of past injuries
  retirementRisk?: 'Low' | 'Moderate' | 'High' | 'Imminent';
  hofNominationPending?: boolean; // Flagged for immediate Hall of Fame induction opportunity
  isRetired?: boolean;
  retiredWeek?: number;
  retiredYear?: number;
  retirementReason?: string;
  careerWeeksInSimulator?: number;
  peakOverness?: number;
  hallOfFameInducted?: boolean;
  hallOfFameYear?: number;
}

export type MatchType = 
  | 'Singles'
  | 'Tag Team'
  | 'Triple Threat'
  | 'Fatal 4-Way'
  | 'Hardcore / No DQ'
  | 'Steel Cage'
  | 'Ladder Match'
  | 'Submission Match'
  | 'Iron Man (30 Min)'
  | 'Hell in a Cell'
  | 'TLC (Tables Ladders Chairs)'
  | 'Last Man Standing'
  | 'Falls Count Anywhere'
  | 'Battle Royal / Royal Rumble'
  | '6-Man Tag'
  | 'Elimination Chamber'
  | 'Custom Match';

export type AngleType = 
  | 'In-Ring Promo'
  | 'Backstage Ambush'
  | 'Contract Signing'
  | 'Confrontation / Staredown'
  | 'Interview Segment'
  | 'Hype Video / Vignette'
  | 'Faction War / Gang Attack';

export type FinishType = 
  | 'Clean Pinfall'
  | 'Submission'
  | 'Disqualification (DQ)'
  | 'Countout'
  | 'Distraction Rollup'
  | 'Weapon / Foreign Object'
  | 'Heel Turn / Screwjob'
  | 'Over The Top Rope'
  | 'Last Man Standing 10-Count';

export interface CustomMatchRule {
  id: string;
  name: string;
  description: string;
  minParticipants: number;
  maxParticipants: number;
  dangerLevel: 'Safe' | 'Moderate' | 'Dangerous' | 'Extremely Brutal';
  workrateMultiplier: number; // e.g. 0.8 - 1.5
  spectacleBonus: number; // 0 - 20 pts added to rating
  injuryRiskBonus: number; // 0 - 25%
  isElimination?: boolean;
  isTitleEligible: boolean;
}

export interface TagTeam {
  id: string;
  name: string;
  memberIds: string[];
  chemistry: number; // 0-100
  wins: number;
  losses: number;
  finisher?: string;
  isActive: boolean;
}

export interface Faction {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  influence: number; // 0-100
  description: string;
}

export interface PPVEvent {
  id: string;
  name: string;
  weekNumber: number; // 1-52
  theme: string;
  venue: string;
  venueCapacity: number;
  ticketPrice: number;
  isSupercard: boolean;
  prestigeBonus: number; // 0-25 bonus score
  buyrateMultiplier: number; // 1.0 - 3.5x
}

export interface IncidentOption {
  id: string;
  text: string;
  consequenceText: string;
  moraleDelta: number;
  budgetCost: number;
  overnessDelta?: number;
  networkDelta?: number;
}

export interface LockerRoomIncident {
  id: string;
  week: number;
  title: string;
  description: string;
  involvedWrestlerIds: string[];
  severity: 'Minor' | 'Moderate' | 'Crisis';
  resolved: boolean;
  options: IncidentOption[];
  chosenOptionId?: string;
}

export interface Segment {
  id: string;
  segmentNumber: number;
  category: 'Match' | 'Angle';
  matchType?: MatchType;
  customMatchRuleId?: string;
  angleType?: AngleType;
  participantIds: string[];
  winnerId?: string; // for matches
  finishType?: FinishType;
  durationMinutes: number;
  titleId?: string; // if title is on the line
  feudId?: string; // associated feud
  notes?: string;
  gmRationale?: string;
  gmRecommendedWinner?: string;
  gmTag?: string;
  genderWarning?: string;
}

export interface SegmentEvaluation {
  segment: Segment;
  score: number; // 0 - 100
  stars: number; // 0.0 - 5.0
  starString: string; // e.g. "***1/2"
  breakdown: {
    workratePart?: number;
    overnessPart: number;
    micPart?: number;
    feudBonus: number;
    staminaFatiguePenalty: number;
    durationMismatchPenalty: number;
    overusePenalty: number;
    finishPenalty: number;
  };
  recap: string;
  notes: string[];
}

export interface ShowResult {
  week: number;
  year: number;
  showName: string;
  isPPV?: boolean;
  ppvEvent?: PPVEvent;
  overallScore: number;
  starRating: string;
  tvRating: number; // e.g., 3.42
  viewers: string; // e.g., "4.1M"
  attendance: number;
  gateRevenue: number;
  ppvBuys?: number;
  ppvRevenue?: number;
  segmentEvaluations: SegmentEvaluation[];
  topSegmentScore: number;
  mainEventScore: number;
  networkFeedback: string;
  gmFeedback?: {
    gmName: string;
    gmAvatar: string;
    quote: string;
    reaction: 'ecstatic' | 'pleased' | 'neutral' | 'concerned' | 'critical';
    ratingScore: number;
  };
}

export type ChampionshipType = 
  | 'World / Primary' 
  | 'Secondary / Midcard' 
  | 'Tertiary / TV' 
  | 'Tag Team' 
  | 'Women\'s' 
  | 'Cruiserweight / High-Flyer' 
  | 'Hardcore / 24/7' 
  | 'Heritage / Custom';

export type TitleDivision = 'Openweight' | 'Heavyweight' | 'Cruiserweight' | 'Women' | 'Tag Team';

export type BeltStrapColor = 
  | 'Classic Black' 
  | 'Pure White' 
  | 'Crimson Red' 
  | 'Midnight Blue' 
  | 'Toxic Purple' 
  | 'Championship Gold' 
  | 'Emerald Green';

export type BeltPlateStyle = 
  | 'Big Gold Classic' 
  | 'Eagle Crest' 
  | 'Winged Globe' 
  | 'Crown & Regal Lions' 
  | 'Skull & Barbed Wire' 
  | 'Modern Geometric Diamond' 
  | 'Vintage Oval Heavyweight';

export interface ChampionshipHistoryEntry {
  id?: string;
  reignNumber?: number;
  holderNames: string;
  holderIds?: string[];
  wonWeek: number;
  wonYear?: number;
  lostWeek?: number;
  lostYear?: number;
  defenses: number;
  eventWonAt?: string;
  notes?: string;
  reignRating?: string;
  isCurrent?: boolean;
}

export interface Championship {
  id: string;
  name: string;
  shortName?: string;
  type?: ChampionshipType;
  division?: TitleDivision;
  gender?: 'Male' | 'Female' | 'Open';
  prestige: number; // 0-100
  currentHolderIds: string[]; // 1 wrestler for singles, 2 for tag
  defenses: number;
  isTagTeam?: boolean;
  isRetired?: boolean;
  retiredWeek?: number;
  retiredYear?: number;
  strapColor?: BeltStrapColor;
  plateStyle?: BeltPlateStyle;
  description?: string;
  minWorkrateBonus?: number; // 0-10 bonus pts for high stakes
  history: ChampionshipHistoryEntry[];
}

export interface Feud {
  id: string;
  name: string;
  wrestlerAIds: string[];
  wrestlerBIds: string[];
  heat: number; // 0-100
  startedWeek: number;
  momentum: 'Cooling Down' | 'Simmering' | 'Boiling Hot' | 'White Hot';
  description: string;
}

export type StorylineArchetype = 
  | 'Underdog Title Chase'
  | 'Monster Reign of Terror'
  | 'Heartbreaking Tag Betrayal'
  | 'Corrupt Authority Resistance'
  | 'Unlikely Odd-Couple Champions'
  | 'Legend\'s Last Stand'
  | 'Faction Gang Warfare'
  | 'Mask vs. Hair Grudge Feud'
  | 'Contract in the Bank Cash-In'
  | 'Mystery Attacker / Conspiracy'
  | 'Custom Narrative';

export interface StorylineMilestone {
  id: string;
  stepNumber: number;
  title: string;
  category: 'Match' | 'Angle';
  segmentType: MatchType | AngleType;
  description: string;
  suggestedFinish?: FinishType;
  isCompleted: boolean;
  completedWeek?: number;
  targetWeekOffset?: number; // 1, 2, 3, 4 (PPV Climax)
}

export interface StorylineArc {
  id: string;
  title: string;
  archetype: StorylineArchetype;
  protagonistIds: string[];
  antagonistIds: string[];
  targetPPVName?: string;
  targetTitleId?: string;
  feudId?: string;
  heat: number; // 0-100
  momentum: 'Cooling Down' | 'Simmering' | 'Boiling Hot' | 'White Hot';
  status: 'Drafting' | 'Active On TV' | 'Climax Ready' | 'Concluded';
  startWeek: number;
  startYear: number;
  plannedWeeksDuration: number;
  currentMilestoneIndex: number;
  milestones: StorylineMilestone[];
  notes?: string;
}

export interface CreativeNote {
  id: string;
  title: string;
  category: 'TV Cliffhanger' | 'PPV Main Event' | 'Call-Up & Repackaging' | 'Gimmick & Faction' | 'Push & Derail';
  body: string;
  taggedWrestlerIds?: string[];
  isPinned?: boolean;
  isResolved?: boolean;
  createdWeek: number;
  createdYear: number;
}

export type CreativePhilosophy = 
  | 'Crash TV & Shock Value'
  | 'Workrate & Pure In-Ring Athleticism'
  | 'Sports Entertainment Spectacle'
  | 'Gritty Old-School Southern Territory';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Promotion {
  id: string;
  name: string;
  shortName: string;
  style: 'Mainstream Giant' | 'Hardcore / Extreme' | 'Lucha & Puroresu' | 'Custom Hybrid';
  description: string;
  budget: number;
  weeklyTVShow: string;
  tvNetwork: string;
  networkSatisfaction: number; // 0-100
  minNetworkRating: number; // threshold required by broadcaster
  productionTier: 'Low Indie' | 'Standard Broadcast' | 'High-End HD' | 'Global Stadium Tier';
  productionCostWeekly: number;
  prestige: number; // 0-100
  roster: Wrestler[];
  titles: Championship[];
  feuds: Feud[];
  fanbase: number; // determines attendance & merchandise
  ppvSchedule?: PPVEvent[];
  tagTeams?: TagTeam[];
  factions?: Faction[];
  customMatchRules?: CustomMatchRule[];
  activeIncidents?: LockerRoomIncident[];
  resolvedIncidents?: LockerRoomIncident[];
  lockerRoomRule?: 'Strict Discipline' | 'Balanced Professionalism' | 'Creative Freedom' | 'Wild West';
  storylineArcs?: StorylineArc[];
  creativeNotes?: CreativeNote[];
  creativePhilosophy?: CreativePhilosophy;
  hallOfFame?: HallOfFameInductee[];
  retiredRoster?: Wrestler[];
  themeSettings?: ThemeSettings;
  currentGM?: GeneralManager;
  availableGMs?: GeneralManager[];
  pendingGMProposal?: GMProposal;
  gmHistory?: {
    week: number;
    year: number;
    gmName: string;
    rating: number;
    wasApprovedAsIs: boolean;
    headline: string;
  }[];
}

export type GMArchetype = 
  | 'traditionalist' 
  | 'showman' 
  | 'hardcore_outlaw' 
  | 'executive' 
  | 'tyrant';

export type GMBookingDirective = 
  | 'balanced' 
  | 'world_title_focus' 
  | 'rest_and_protect' 
  | 'youth_movement' 
  | 'high_drama_angles' 
  | 'workrate_clinic';

export interface GMPerk {
  name: string;
  description: string;
  effectBadge: string;
}

export interface GeneralManager {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  archetype: GMArchetype;
  title: string;
  bio: string;
  perk: GMPerk;
  trustScore: number; // 0-100
  showsRunCount: number;
  approvalRate: number; // 0-100%
  bookingStyleNotes: string[];
  preferredDirective: GMBookingDirective;
  activeDirective?: GMBookingDirective;
  salaryWeekly: number;
  isHired: boolean;
}

export interface GMProposalSegment extends Segment {
  gmRationale?: string;
  gmRecommendedWinner?: string;
  gmTag?: string;
  projectedScore?: number;
}

export interface GMProposal {
  id: string;
  showName: string;
  week: number;
  year: number;
  gmId: string;
  gmName: string;
  gmAvatar: string;
  archetype: GMArchetype;
  activeDirective: GMBookingDirective;
  executiveSummary: string;
  projectedShowRating: number;
  projectedStarRating: string;
  restedStars: { id: string; name: string; reason: string; currentFatigue: number }[];
  keyStorylinesAdvanced: string[];
  segments: GMProposalSegment[];
  status: 'pending_approval' | 'approved' | 'modified' | 'rejected';
  createdAt: number;
}

export type ThemePresetId = 
  | 'attitude_gold'
  | 'monday_night_raw'
  | 'smackdown_sapphire'
  | 'strong_style_emerald'
  | 'lucha_neon_purple'
  | 'vintage_territory'
  | 'clean_slate_light';

export type AccentColor = 
  | 'gold'
  | 'red'
  | 'blue'
  | 'purple'
  | 'emerald'
  | 'pink'
  | 'orange'
  | 'lime';

export type BackgroundStyle = 
  | 'obsidian'
  | 'oled'
  | 'midnight'
  | 'clean_light';

export interface ThemeSettings {
  preset: ThemePresetId;
  accentColor: AccentColor;
  backgroundStyle: BackgroundStyle;
  enableGlowEffects?: boolean;
}

export type HallOfFameCategory = 
  | 'Headliner' 
  | 'Living Legend' 
  | 'Icon' 
  | 'Warrior' 
  | 'Trailblazer' 
  | 'Pioneer';

export interface HallOfFameScorecard {
  winsScore: number; // 0-100
  championshipsScore: number; // 0-100
  longevityScore: number; // 0-100
  overallScore: number; // 0-100
  eligibilityTier: 'First-Ballot Lock' | 'Strong Candidate' | 'Borderline Candidate' | 'Not Yet Eligible';
  qualificationBreakdown: {
    winsMet: boolean;
    championshipsMet: boolean;
    longevityMet: boolean;
    minWinsTarget: number;
    minTitlesTarget: number;
    minLongevityTarget: number;
  };
}

export interface HallOfFameInductee {
  id: string;
  wrestlerId: string;
  name: string;
  nickname: string;
  inductionYear: number;
  inductionWeek: number;
  classTitle: string; // e.g. "Class of 2026"
  category: HallOfFameCategory;
  speechQuote: string;
  inductorName: string;
  biographySummary?: string;
  careerStats: {
    totalWins: number;
    totalLosses: number;
    totalDraws: number;
    winPercentage: number;
    careerTitles: string[];
    totalTitleReigns: number;
    careerTitleDefenses: number;
    peakOverness: number;
    careerLongevityWeeks: number;
    finalAge: number;
  };
  scorecard: HallOfFameScorecard;
}

export interface FinancialReport {
  week: number;
  tvRevenue: number;
  ticketSales: number;
  merchSales: number;
  ppvSales?: number;
  wrestlerPayroll: number;
  productionCost: number;
  arenaCost: number;
  medicalCost: number;
  netProfit: number;
  endingBalance: number;
}

export interface NewsItem {
  id: string;
  week: number;
  category: 'Promotion' | 'Rival' | 'Wrestler' | 'Injury' | 'Industry' | 'PPV';
  headline: string;
  details: string;
  importance: 'Low' | 'Medium' | 'High';
}

export type GameView = 
  | 'menu' 
  | 'book_show' 
  | 'roster' 
  | 'titles_feuds' 
  | 'finances_tv' 
  | 'news' 
  | 'show_result'
  | 'ppv_calendar'
  | 'gimmick_lab'
  | 'tag_factions'
  | 'locker_room'
  | 'sandbox_customizer'
  | 'writers_hub'
  | 'hall_of_fame'
  | 'gm_office'
  | 'settings';

export interface GameState {
  hasStarted: boolean;
  difficulty: Difficulty;
  currentWeek: number;
  currentYear: number;
  promotion: Promotion;
  freeAgents: Wrestler[];
  currentShowCard: Segment[];
  showHistory: ShowResult[];
  financialHistory: FinancialReport[];
  newsArchive: NewsItem[];
  averageShowRating: number;
  topFeudHeat: number;
  currentView: GameView;
  latestShowResult?: ShowResult;
  themeSettings?: ThemeSettings;
}

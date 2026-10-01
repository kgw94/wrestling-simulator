import { 
  Promotion, 
  Wrestler, 
  ForbiddenDoorPartner, 
  ForbiddenDoorState, 
  ForbiddenDoorSupercard,
  AllianceTier 
} from '../types';
import { PRESET_PROMOTIONS } from './promotions';

// Specialized foreign promotions beyond the 3 core domestic feds
const EXTRA_GLOBAL_PROMOTIONS: ForbiddenDoorPartner[] = [
  {
    id: 'lla',
    name: 'Lucha Libre Azteca',
    shortName: 'LLA',
    country: 'Mexico',
    region: 'Mexico',
    style: 'High-Flying Lucha & Traditional Masks',
    prestige: 80,
    description: 'The sacred cathedral of Mexican Lucha Libre. Legendary colorful masks, generational family dynasties, lightning-quick top-rope dives, and dramatic hair vs. mask spectacles.',
    logoEmoji: '🇲🇽',
    themeColor: 'from-emerald-900 to-red-950 border-emerald-500/50',
    tier: 'Talent Exchange',
    relationshipScore: 78,
    weeklyDues: 2500,
    coPromotedShowsCount: 1,
    titles: [
      {
        id: 'lla-campeonato',
        name: 'LLA Campeonato Mundial Completo',
        shortName: 'LLA Mundial',
        type: 'World / Primary',
        division: 'Openweight',
        gender: 'Male',
        prestige: 86,
        currentHolderIds: ['lla-1'],
        defenses: 6,
        strapColor: 'Emerald Green',
        plateStyle: 'Eagle Crest',
        minWorkrateBonus: 6,
        description: 'The sacred world heavyweight crown of Mexican lucha libre.',
        history: [
          { id: 'rh-lla-1', reignNumber: 2, holderNames: 'Rey Sagrado Jr.', wonWeek: 10, wonYear: 1, defenses: 6, isCurrent: true, reignRating: '★★★★★ Masterpiece' }
        ]
      },
      {
        id: 'lla-duplas',
        name: 'LLA Campeonato de Parejas (Tag)',
        shortName: 'LLA Parejas',
        type: 'Tag Team',
        division: 'Tag Team',
        gender: 'Open',
        prestige: 78,
        isTagTeam: true,
        currentHolderIds: ['lla-3', 'lla-4'],
        defenses: 4,
        strapColor: 'Crimson Red',
        plateStyle: 'Modern Geometric Diamond',
        history: [
          { id: 'rh-lla-t1', reignNumber: 1, holderNames: 'Los Aerodinamicos (Volador Dorado & Meteoro Kid)', wonWeek: 18, wonYear: 1, defenses: 4, isCurrent: true }
        ]
      }
    ],
    roster: [
      {
        id: 'lla-1',
        name: 'Rey Sagrado Jr.',
        nickname: 'The Aztec God of Sky',
        age: 31,
        gender: 'Male',
        style: 'High Flyer',
        alignment: 'Face',
        push: 'Main Eventer',
        overness: 84,
        workrate: 91,
        micSkills: 72,
        stamina: 93,
        morale: 95,
        fatigue: 12,
        injury: { injured: false },
        salary: 4500,
        contractWeeks: 40,
        wins: 28,
        losses: 4,
        draws: 0,
        championshipIds: ['lla-campeonato'],
        isGuestStar: true,
        guestHomePromotionId: 'lla',
        guestHomePromotionName: 'Lucha Libre Azteca'
      },
      {
        id: 'lla-2',
        name: 'El Diablo Negro',
        nickname: 'The Midnight Assassin',
        age: 34,
        gender: 'Male',
        style: 'Technician',
        alignment: 'Heel',
        push: 'Main Eventer',
        overness: 82,
        workrate: 88,
        micSkills: 80,
        stamina: 89,
        morale: 90,
        fatigue: 15,
        injury: { injured: false },
        salary: 4200,
        contractWeeks: 36,
        wins: 24,
        losses: 7,
        draws: 1,
        championshipIds: [],
        isGuestStar: true,
        guestHomePromotionId: 'lla',
        guestHomePromotionName: 'Lucha Libre Azteca'
      },
      {
        id: 'lla-3',
        name: 'Volador Dorado',
        nickname: 'The Golden Falcon',
        age: 27,
        gender: 'Male',
        style: 'High Flyer',
        alignment: 'Face',
        push: 'Upper Midcard',
        overness: 76,
        workrate: 89,
        micSkills: 68,
        stamina: 94,
        morale: 92,
        fatigue: 10,
        injury: { injured: false },
        salary: 3100,
        contractWeeks: 48,
        wins: 19,
        losses: 5,
        draws: 0,
        championshipIds: ['lla-duplas'],
        isGuestStar: true,
        guestHomePromotionId: 'lla',
        guestHomePromotionName: 'Lucha Libre Azteca'
      },
      {
        id: 'lla-4',
        name: 'Meteoro Kid',
        nickname: 'The Comet',
        age: 24,
        gender: 'Male',
        style: 'High Flyer',
        alignment: 'Face',
        push: 'Upper Midcard',
        overness: 74,
        workrate: 90,
        micSkills: 64,
        stamina: 95,
        morale: 94,
        fatigue: 8,
        injury: { injured: false },
        salary: 2800,
        contractWeeks: 50,
        wins: 18,
        losses: 6,
        draws: 0,
        championshipIds: ['lla-duplas'],
        isGuestStar: true,
        guestHomePromotionId: 'lla',
        guestHomePromotionName: 'Lucha Libre Azteca'
      },
      {
        id: 'lla-5',
        name: 'Princesa Jaguar',
        nickname: 'The Jungle Empress',
        age: 26,
        gender: 'Female',
        style: 'High Flyer',
        alignment: 'Face',
        push: 'Main Eventer',
        overness: 80,
        workrate: 87,
        micSkills: 75,
        stamina: 88,
        morale: 93,
        fatigue: 14,
        injury: { injured: false },
        salary: 3500,
        contractWeeks: 38,
        wins: 22,
        losses: 4,
        draws: 0,
        championshipIds: [],
        isGuestStar: true,
        guestHomePromotionId: 'lla',
        guestHomePromotionName: 'Lucha Libre Azteca'
      }
    ]
  },
  {
    id: 'ecs',
    name: 'European Catch Syndicate',
    shortName: 'ECS',
    country: 'United Kingdom / Germany',
    region: 'Europe',
    style: 'Catch-as-Catch-Can & Heavyweight Brawling',
    prestige: 77,
    description: 'Tough, no-nonsense European tournament circuit. Gritted-teeth mat grappling, grueling 45-minute submission rounds, chest-caving European uppercuts, and smoky packed dancehalls.',
    logoEmoji: '🇬🇧',
    themeColor: 'from-blue-900 to-indigo-950 border-blue-500/50',
    tier: 'Strategic Alliance',
    relationshipScore: 72,
    weeklyDues: 3000,
    coPromotedShowsCount: 0,
    titles: [
      {
        id: 'ecs-undisputed',
        name: 'ECS Undisputed European Heavyweight Title',
        shortName: 'ECS Euro',
        type: 'World / Primary',
        division: 'Heavyweight',
        gender: 'Male',
        prestige: 82,
        currentHolderIds: ['ecs-1'],
        defenses: 8,
        strapColor: 'Midnight Blue',
        plateStyle: 'Big Gold Classic',
        minWorkrateBonus: 7,
        description: 'The heavyweight championship of European catch wrestling.',
        history: [
          { id: 'rh-ecs-1', reignNumber: 1, holderNames: 'Walter Von Steiner', wonWeek: 6, wonYear: 1, defenses: 8, isCurrent: true, reignRating: '★★★★3/4' }
        ]
      }
    ],
    roster: [
      {
        id: 'ecs-1',
        name: 'Walter Von Steiner',
        nickname: 'The Prussian Ring General',
        age: 36,
        gender: 'Male',
        style: 'Powerhouse',
        alignment: 'Heel',
        push: 'Main Eventer',
        overness: 83,
        workrate: 93,
        micSkills: 78,
        stamina: 90,
        morale: 91,
        fatigue: 16,
        injury: { injured: false },
        salary: 4800,
        contractWeeks: 32,
        wins: 30,
        losses: 3,
        draws: 2,
        championshipIds: ['ecs-undisputed'],
        isGuestStar: true,
        guestHomePromotionId: 'ecs',
        guestHomePromotionName: 'European Catch Syndicate'
      },
      {
        id: 'ecs-2',
        name: 'Nigel "The Bastard" Cross',
        nickname: 'The Manchester Surgeon',
        age: 33,
        gender: 'Male',
        style: 'Technician',
        alignment: 'Heel',
        push: 'Upper Midcard',
        overness: 79,
        workrate: 92,
        micSkills: 86,
        stamina: 87,
        morale: 88,
        fatigue: 14,
        injury: { injured: false },
        salary: 3900,
        contractWeeks: 34,
        wins: 21,
        losses: 8,
        draws: 1,
        championshipIds: [],
        isGuestStar: true,
        guestHomePromotionId: 'ecs',
        guestHomePromotionName: 'European Catch Syndicate'
      },
      {
        id: 'ecs-3',
        name: 'Connor "Bruiser" O\'Malley',
        nickname: 'The Dublin Sledgehammer',
        age: 29,
        gender: 'Male',
        style: 'Brawler',
        alignment: 'Face',
        push: 'Upper Midcard',
        overness: 77,
        workrate: 84,
        micSkills: 82,
        stamina: 89,
        morale: 92,
        fatigue: 11,
        injury: { injured: false },
        salary: 3300,
        contractWeeks: 42,
        wins: 20,
        losses: 6,
        draws: 0,
        championshipIds: [],
        isGuestStar: true,
        guestHomePromotionId: 'ecs',
        guestHomePromotionName: 'European Catch Syndicate'
      }
    ]
  },
  {
    id: 'tjb',
    name: 'Tokyo Joshi Blossom',
    shortName: 'TJB',
    country: 'Japan',
    region: 'Japan',
    style: 'High-Velocity Joshi Puroresu',
    prestige: 83,
    description: 'The world premier all-women Japanese Joshi wrestling powerhouse. Famed for breathtaking workrate, blisteringly stiff kicks, poetic emotional storylines, and historic Korakuen Hall sellouts.',
    logoEmoji: '🌸',
    themeColor: 'from-pink-900 to-rose-950 border-pink-500/50',
    tier: 'Strategic Alliance',
    relationshipScore: 82,
    weeklyDues: 3200,
    coPromotedShowsCount: 1,
    titles: [
      {
        id: 'tjb-world',
        name: 'TJB World Starlight Championship',
        shortName: 'TJB Starlight',
        type: 'World / Primary',
        division: 'Women',
        gender: 'Female',
        prestige: 88,
        currentHolderIds: ['tjb-1'],
        defenses: 7,
        strapColor: 'Pure White',
        plateStyle: 'Crown & Regal Lions',
        minWorkrateBonus: 7,
        description: 'The undisputed sacred crown of international Joshi puroresu.',
        history: [
          { id: 'rh-tjb-1', reignNumber: 2, holderNames: 'Mayu Sakura', wonWeek: 8, wonYear: 1, defenses: 7, isCurrent: true, reignRating: '★★★★★ Classic' }
        ]
      }
    ],
    roster: [
      {
        id: 'tjb-1',
        name: 'Mayu Sakura',
        nickname: 'The Starlight Empress',
        age: 28,
        gender: 'Female',
        style: 'High Flyer',
        alignment: 'Face',
        push: 'Main Eventer',
        overness: 86,
        workrate: 95,
        micSkills: 80,
        stamina: 96,
        morale: 96,
        fatigue: 10,
        injury: { injured: false },
        salary: 4900,
        contractWeeks: 45,
        wins: 33,
        losses: 3,
        draws: 1,
        championshipIds: ['tjb-world'],
        isGuestStar: true,
        guestHomePromotionId: 'tjb',
        guestHomePromotionName: 'Tokyo Joshi Blossom'
      },
      {
        id: 'tjb-2',
        name: 'Hana "Red Blade" Takahashi',
        nickname: 'The Crimson Lotus',
        age: 27,
        gender: 'Female',
        style: 'Brawler',
        alignment: 'Heel',
        push: 'Main Eventer',
        overness: 83,
        workrate: 92,
        micSkills: 85,
        stamina: 91,
        morale: 92,
        fatigue: 13,
        injury: { injured: false },
        salary: 4300,
        contractWeeks: 38,
        wins: 26,
        losses: 5,
        draws: 0,
        championshipIds: [],
        isGuestStar: true,
        guestHomePromotionId: 'tjb',
        guestHomePromotionName: 'Tokyo Joshi Blossom'
      },
      {
        id: 'tjb-3',
        name: 'Yuka "Speed Demon" Sato',
        nickname: 'The Tokyo Sky Bullet',
        age: 23,
        gender: 'Female',
        style: 'High Flyer',
        alignment: 'Face',
        push: 'Upper Midcard',
        overness: 78,
        workrate: 93,
        micSkills: 72,
        stamina: 94,
        morale: 95,
        fatigue: 9,
        injury: { injured: false },
        salary: 3200,
        contractWeeks: 50,
        wins: 21,
        losses: 6,
        draws: 0,
        championshipIds: [],
        isGuestStar: true,
        guestHomePromotionId: 'tjb',
        guestHomePromotionName: 'Tokyo Joshi Blossom'
      }
    ]
  }
];

export function getDefaultForbiddenDoorState(playerPromo: Promotion): ForbiddenDoorState {
  // Convert other preset promotions (e.g. APW, VU, SSPW) into partner federations if not player's promo
  const partners: ForbiddenDoorPartner[] = [];

  for (const preset of PRESET_PROMOTIONS) {
    if (preset.id !== playerPromo.id) {
      const region = preset.id === 'sspw' ? 'Japan' : 'North America';
      const country = preset.id === 'sspw' ? 'Japan' : 'United States';
      const logoEmoji = preset.id === 'sspw' ? '🎌' : preset.id === 'vu' ? '🩸' : '⚡';
      const themeColor = preset.id === 'sspw' 
        ? 'from-red-950 to-zinc-950 border-red-500/50' 
        : preset.id === 'vu' 
        ? 'from-purple-950 to-zinc-950 border-purple-500/50' 
        : 'from-amber-950 to-zinc-950 border-amber-500/50';

      // Mark roster members as guest talent
      const taggedRoster = (preset.roster || []).map(w => ({
        ...w,
        isGuestStar: true,
        guestHomePromotionId: preset.id,
        guestHomePromotionName: preset.name
      }));

      partners.push({
        id: preset.id,
        name: preset.name,
        shortName: preset.shortName,
        country,
        region: region as any,
        style: preset.style,
        prestige: preset.prestige || 75,
        description: preset.description,
        logoEmoji,
        themeColor,
        tier: preset.id === 'sspw' ? 'The Forbidden Door' : 'Talent Exchange',
        relationshipScore: preset.id === 'sspw' ? 85 : preset.id === 'vu' ? 60 : 75,
        weeklyDues: 3500,
        coPromotedShowsCount: 1,
        titles: preset.titles || [],
        roster: taggedRoster
      });
    }
  }

  // Add the extra global promotions (Mexico, Europe, Joshi)
  for (const extra of EXTRA_GLOBAL_PROMOTIONS) {
    partners.push(extra);
  }

  // Initial co-promoted supercard schedule: Week 24 & Week 48
  const defaultSupercards: ForbiddenDoorSupercard[] = [
    {
      id: 'fd-sc-1',
      name: `${playerPromo.shortName} x SSPW: The Forbidden Door I`,
      partnerId: partners.find(p => p.id === 'sspw')?.id || partners[0]?.id || 'sspw',
      partnerName: partners.find(p => p.id === 'sspw')?.name || partners[0]?.name || 'Shin-Sekai Pro Wrestling',
      scheduledWeek: 24,
      scheduledYear: 2026,
      venue: 'Tokyo Dome (Super Stadium)',
      venueCapacity: 55000,
      ticketPrice: 85,
      theme: 'International Supremacy & Dream Match Spectacle',
      stipulationType: 'Bragging Rights Interpromotional Cup',
      isCompleted: false
    }
  ];

  return {
    partners,
    supercards: defaultSupercards,
    loanedRoster: [],
    borrowedRoster: [],
    interpromotionalCupHolder: undefined,
    trophiesWon: 0,
    totalPrestigeGained: 0
  };
}

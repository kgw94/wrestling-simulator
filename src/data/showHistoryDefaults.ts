import { ShowResult, Promotion } from '../types';

export function getInitialShowHistory(promotion: Promotion): ShowResult[] {
  const isAPW = promotion.id === 'apw';
  const isVU = promotion.id === 'vu';
  const isSSPW = promotion.id === 'sspw';

  if (isAPW) {
    return [
      {
        week: 52,
        year: 2025,
        showName: 'APW Starrcade Spectacular: Holiday Climax',
        isPPV: true,
        ppvEvent: {
          id: 'ppv-starrcade-2025',
          name: 'Starrcade Spectacular',
          weekNumber: 52,
          theme: 'End of Year Mega Climax',
          venue: 'Madison Square Arena, NY',
          venueCapacity: 20000,
          ticketPrice: 85,
          isSupercard: true,
          prestigeBonus: 20,
          buyrateMultiplier: 2.5
        },
        overallScore: 91,
        starRating: '4.50 Stars ★★★★½',
        tvRating: 3.85,
        viewers: '4.2M',
        attendance: 19850,
        gateRevenue: 1687250,
        ppvBuys: 420000,
        ppvRevenue: 2100000,
        topSegmentScore: 94,
        mainEventScore: 94,
        networkFeedback: 'Sensational holiday spectacle. Broadcaster executives noted historic high ratings across key male 18-49 demographics.',
        gmFeedback: {
          gmName: 'Jack Sterling',
          gmAvatar: '👔',
          quote: 'Thunder Vance and Damian Graves proved once again why Apex Pro is the premier wrestling brand on the planet.',
          reaction: 'ecstatic',
          ratingScore: 94
        },
        segmentEvaluations: [
          {
            segment: {
              id: 'seg-hist-1',
              segmentNumber: 1,
              category: 'Match',
              matchType: 'Fatal 4-Way',
              participantIds: ['apw-11', 'apw-12', 'apw-5', 'apw-6'],
              winnerId: 'apw-11',
              finishType: 'Clean Pinfall',
              durationMinutes: 14,
              notes: 'High-flying scramble match opener to ignite the crowd.'
            },
            score: 83,
            stars: 4.0,
            starString: '4.00 Stars ★★★★',
            breakdown: { overnessPart: 35, feudBonus: 0, staminaFatiguePenalty: 0, durationMismatchPenalty: 0, overusePenalty: 0, finishPenalty: 0 },
            recap: 'Cruiserweight high-flyers dazzled the arena with breathless aerial maneuvers and outside dives.',
            notes: ['Fast-paced hot opening opener (+4 pts).', 'Crowd popped for springboard corkscrew splash.']
          },
          {
            segment: {
              id: 'seg-hist-2',
              segmentNumber: 2,
              category: 'Angle',
              angleType: 'In-Ring Promo',
              participantIds: ['apw-4'],
              durationMinutes: 8,
              notes: 'Lord Alistair Sterling boasts about purchasing prime holiday airtime.'
            },
            score: 86,
            stars: 4.25,
            starString: '4.25 Stars ★★★★¼',
            breakdown: { overnessPart: 42, feudBonus: 4, staminaFatiguePenalty: 0, durationMismatchPenalty: 0, overusePenalty: 0, finishPenalty: 0 },
            recap: 'Sterling delivered a venomous, privileged monologue drawing deafening heat from the packed New York crowd.',
            notes: ['Sterling displayed world-class microphone mastery.']
          },
          {
            segment: {
              id: 'seg-hist-3',
              segmentNumber: 3,
              category: 'Match',
              matchType: 'Singles',
              participantIds: ['apw-3', 'apw-4'],
              winnerId: 'apw-3',
              finishType: 'Clean Pinfall',
              durationMinutes: 18,
              titleId: 'apw-ic',
              notes: 'Intercontinental Championship Grudge Encounter.'
            },
            score: 88,
            stars: 4.25,
            starString: '4.25 Stars ★★★★¼',
            breakdown: { overnessPart: 44, feudBonus: 8, staminaFatiguePenalty: 0, durationMismatchPenalty: 0, overusePenalty: 0, finishPenalty: 0 },
            recap: 'Rex Stryker withstood repeated dirty tactics to retain the Intercontinental gold with an emphatic running lariat.',
            notes: ['Feud Heat Bonus (+8 pts): Deep personal rivalry elevated the drama.']
          },
          {
            segment: {
              id: 'seg-hist-4',
              segmentNumber: 4,
              category: 'Match',
              matchType: 'Hell in a Cell',
              participantIds: ['apw-1', 'apw-2'],
              winnerId: 'apw-1',
              finishType: 'Clean Pinfall',
              durationMinutes: 28,
              titleId: 'apw-world',
              notes: 'World Heavyweight Championship Unforgiving Steel Cage Battle.'
            },
            score: 94,
            stars: 4.75,
            starString: '4.75 Stars ★★★★¾',
            breakdown: { overnessPart: 48, feudBonus: 10, staminaFatiguePenalty: 0, durationMismatchPenalty: 0, overusePenalty: 0, finishPenalty: 0 },
            recap: 'Thunder Vance and Damian Graves waged an all-time blood-and-guts war inside the locked cell. Vance countered the Crown Jewel into a thunderous spinebuster onto steel steps to retain the World Title!',
            notes: ['MOTY Contender: Electric atmosphere and legendary psychology.', 'Crowd chanted "This is Wrestling!" throughout.']
          }
        ]
      },
      {
        week: 51,
        year: 2025,
        showName: 'APW Friday Night Apex #184',
        isPPV: false,
        overallScore: 84,
        starRating: '4.00 Stars ★★★★',
        tvRating: 3.42,
        viewers: '3.6M',
        attendance: 8450,
        gateRevenue: 295750,
        topSegmentScore: 88,
        mainEventScore: 88,
        networkFeedback: 'Solid television episode that built immense anticipation for the Starrcade PPV card.',
        segmentEvaluations: [
          {
            segment: {
              id: 'seg-hist-51-1',
              segmentNumber: 1,
              category: 'Match',
              matchType: 'Tag Team',
              participantIds: ['apw-5', 'apw-6', 'apw-11', 'apw-12'],
              winnerId: 'apw-5',
              finishType: 'Clean Pinfall',
              durationMinutes: 12
            },
            score: 80,
            stars: 3.75,
            starString: '3.75 Stars ★★★¾',
            breakdown: { overnessPart: 36, feudBonus: 0, staminaFatiguePenalty: 0, durationMismatchPenalty: 0, overusePenalty: 0, finishPenalty: 0 },
            recap: 'Competitive tag encounter that energized the audience.',
            notes: ['Solid teamwork displayed.']
          },
          {
            segment: {
              id: 'seg-hist-51-2',
              segmentNumber: 2,
              category: 'Match',
              matchType: 'Singles',
              participantIds: ['apw-1', 'apw-4'],
              winnerId: 'apw-1',
              finishType: 'Disqualification (DQ)',
              durationMinutes: 16
            },
            score: 88,
            stars: 4.25,
            starString: '4.25 Stars ★★★★¼',
            breakdown: { overnessPart: 45, feudBonus: 6, staminaFatiguePenalty: 0, durationMismatchPenalty: 0, overusePenalty: 0, finishPenalty: 0 },
            recap: 'Damian Graves interfered with a chair shot to hand Vance the DQ win, sparking a wild ringside locker room brawl.',
            notes: ['Heated brawl to close the broadcast.']
          }
        ]
      }
    ];
  }

  // Generic fallback for VU, SSPW or Custom
  return [
    {
      week: 52,
      year: 2025,
      showName: `${promotion.name} Championship Showcase: Year-End Climax`,
      isPPV: true,
      overallScore: 88,
      starRating: '4.25 Stars ★★★★¼',
      tvRating: 3.25,
      viewers: '3.2M',
      attendance: 12500,
      gateRevenue: 625000,
      ppvBuys: 280000,
      ppvRevenue: 1400000,
      topSegmentScore: 91,
      mainEventScore: 91,
      networkFeedback: 'Incredible broadcast performance that closed out the calendar year with immense momentum.',
      gmFeedback: {
        gmName: promotion.currentGM?.name || 'General Manager',
        gmAvatar: promotion.currentGM?.avatar || '🏆',
        quote: 'Every competitor left everything in the ring tonight. A defining night for our company.',
        reaction: 'pleased',
        ratingScore: 91
      },
      segmentEvaluations: [
        {
          segment: {
            id: 'seg-gen-1',
            segmentNumber: 1,
            category: 'Match',
            matchType: 'Singles',
            participantIds: promotion.roster.slice(0, 2).map(w => w.id),
            winnerId: promotion.roster[0]?.id,
            finishType: 'Clean Pinfall',
            durationMinutes: 22
          },
          score: 91,
          stars: 4.5,
          starString: '4.50 Stars ★★★★½',
          breakdown: { overnessPart: 46, feudBonus: 6, staminaFatiguePenalty: 0, durationMismatchPenalty: 0, overusePenalty: 0, finishPenalty: 0 },
          recap: 'A technical masterpiece that had the crowd on their feet for the final ten minutes.',
          notes: ['Stellar main event match quality.']
        }
      ]
    }
  ];
}

import { 
  Segment, 
  SegmentEvaluation, 
  ShowResult, 
  Promotion, 
  Wrestler, 
  Feud, 
  FinancialReport, 
  NewsItem, 
  Difficulty,
  PPVEvent,
  LockerRoomIncident,
  StorylineArc,
  Tournament,
  TournamentMatch,
  BackstageClique,
  ContractBiddingWar,
  ContractBid,
  WrestlerCourtCase
} from '../types';
import { 
  DEFAULT_PPV_CALENDAR, 
  DEFAULT_CUSTOM_MATCH_RULES, 
  SAMPLE_INCIDENTS_POOL,
  calculateHallOfFameScorecard
} from '../data/customDefaults';
import {
  getDefaultCliquesForPromotion,
  SAMPLE_WRESTLER_COURT_CASES,
  generateBiddingWarForWrestler,
  evaluateWrestlerBiddingDecision
} from '../data/backstageDefaults';
import { generateGMPostShowDebrief, generateGMProposal } from './gmEngine';
import { 
  validateMatchTitleGender, 
  isWrestlerEligibleForTitle,
  handleAutomaticTitleVacancy,
  handleAutomaticTitleVacancyForWrestler
} from '../utils/titleUtils';
import { 
  resolveTournamentMatch, 
  applyTournamentCompletionEffects,
  simulateTournamentMatchOutcome 
} from './tournamentEngine';

export function calculateStarRating(score: number): { stars: number; starString: string } {
  if (score >= 95) return { stars: 5.0, starString: '5.00 Stars ★★★★★' };
  if (score >= 90) return { stars: 4.5, starString: '4.50 Stars ★★★★½' };
  if (score >= 84) return { stars: 4.0, starString: '4.00 Stars ★★★★' };
  if (score >= 76) return { stars: 3.5, starString: '3.50 Stars ★★★½' };
  if (score >= 68) return { stars: 3.0, starString: '3.00 Stars ★★★' };
  if (score >= 60) return { stars: 2.5, starString: '2.50 Stars ★★½' };
  if (score >= 50) return { stars: 2.0, starString: '2.00 Stars ★★' };
  if (score >= 40) return { stars: 1.5, starString: '1.50 Stars ★½' };
  if (score >= 30) return { stars: 1.0, starString: '1.00 Stars ★' };
  if (score >= 18) return { stars: 0.5, starString: '0.50 Stars ½★' };
  return { stars: 0.0, starString: 'DUD (Minus Stars)' };
}

/**
 * EWR/TEW-style segment evaluation engine
 */
export function evaluateSegment(
  segment: Segment,
  allSegments: Segment[],
  roster: Wrestler[],
  feuds: Feud[],
  promotion?: Promotion
): SegmentEvaluation {
  const participants = segment.participantIds
    .map(id => roster.find(w => w.id === id))
    .filter((w): w is Wrestler => Boolean(w));

  const notes: string[] = [];
  let score = 50;
  let workratePart = 0;
  let overnessPart = 0;
  let micPart = 0;
  let feudBonus = 0;
  let staminaFatiguePenalty = 0;
  let durationMismatchPenalty = 0;
  let overusePenalty = 0;
  let finishPenalty = 0;

  if (participants.length === 0) {
    return {
      segment,
      score: 10,
      stars: 0,
      starString: 'DUD',
      breakdown: { overnessPart: 0, feudBonus: 0, staminaFatiguePenalty: 0, durationMismatchPenalty: 0, overusePenalty: 0, finishPenalty: 0 },
      recap: 'Empty segment with no valid wrestlers booked.',
      notes: ['No participants were selected for this segment.']
    };
  }

  // Calculate average stats among participants
  const avgWorkrate = participants.reduce((acc, w) => acc + w.workrate, 0) / participants.length;
  const avgOverness = participants.reduce((acc, w) => acc + w.overness, 0) / participants.length;
  const avgMic = participants.reduce((acc, w) => acc + w.micSkills, 0) / participants.length;
  const avgStamina = participants.reduce((acc, w) => acc + w.stamina, 0) / participants.length;
  const avgFatigue = participants.reduce((acc, w) => acc + w.fatigue, 0) / participants.length;

  // Gimmick Grade bonuses
  participants.forEach(w => {
    if (w.gimmick) {
      if (w.gimmick.grade === 'S') {
        score += 2;
        notes.push(`S-Tier Gimmick (${w.name}): '${w.gimmick.name}' is ultra-over (+2 pts).`);
      } else if (w.gimmick.grade === 'A') {
        score += 1;
      } else if (w.gimmick.grade === 'F') {
        score -= 2;
        notes.push(`Flop Gimmick (${w.name}): Crowd rejected the persona (-2 pts).`);
      }
    }
  });

  // Feud bonus: check if participants share a feud
  const matchedFeud = feuds.find(f => {
    const hasA = f.wrestlerAIds.some(id => segment.participantIds.includes(id));
    const hasB = f.wrestlerBIds.some(id => segment.participantIds.includes(id));
    return hasA && hasB;
  });

  if (matchedFeud) {
    // Feud heat adds between 3 to 12 points
    feudBonus = Math.round((matchedFeud.heat / 100) * 10);
    notes.push(`Feud Heat Bonus (+${feudBonus} pts): Rivalry '${matchedFeud.name}' heightened crowd interest.`);
  }

  // Tag Team Chemistry bonus
  if (promotion && promotion.tagTeams && (segment.matchType === 'Tag Team' || segment.matchType === '6-Man Tag')) {
    const activeTeams = promotion.tagTeams.filter(t => t.isActive);
    activeTeams.forEach(team => {
      const teamPresent = team.memberIds.filter(id => segment.participantIds.includes(id)).length;
      if (teamPresent >= 2) {
        const chemBonus = Math.round((team.chemistry / 100) * 6);
        score += chemBonus;
        notes.push(`Tag Team Chemistry (+${chemBonus} pts): ${team.name} displayed synchronized tandem offense.`);
      }
    });
  }

  // Creative Philosophy Modifiers
  if (promotion?.creativePhilosophy) {
    if (promotion.creativePhilosophy === 'Workrate & Pure In-Ring Athleticism' && segment.category === 'Match' && avgWorkrate >= 75) {
      score += 3;
      notes.push(`Writers' Philosophy (+3 pts): Pure Workrate culture rewarded athletic masterpiece.`);
    } else if (promotion.creativePhilosophy === 'Crash TV & Shock Value' && segment.category === 'Angle') {
      score += 3;
      notes.push(`Writers' Philosophy (+3 pts): Crash TV style generated unpredictable shock buzz.`);
    } else if (promotion.creativePhilosophy === 'Sports Entertainment Spectacle' && avgMic >= 70) {
      score += 2;
      notes.push(`Writers' Philosophy (+2 pts): Sports entertainment theatricality resonated with the audience.`);
    }
  }

  // Overuse penalty: check how many times each participant appears on this card
  let maxAppearances = 1;
  participants.forEach(w => {
    const appearances = allSegments.filter(s => s.participantIds.includes(w.id)).length;
    if (appearances > maxAppearances) maxAppearances = appearances;
  });

  if (maxAppearances >= 3) {
    overusePenalty = 15;
    notes.push('Severe Overuse Penalty (-15 pts): Wrestler(s) booked in 3+ segments on the same show.');
  } else if (maxAppearances === 2 && segment.category === 'Match') {
    // Only penalize double match bookings
    const matchAppearances = allSegments.filter(s => s.category === 'Match' && s.participantIds.some(id => segment.participantIds.includes(id))).length;
    if (matchAppearances > 1) {
      overusePenalty = 8;
      notes.push('Double Duty Penalty (-8 pts): Wrestler(s) wrestling twice in one night.');
    }
  }

  // Repetitive finish penalty across the card
  if (segment.category === 'Match' && segment.finishType) {
    const sameFinishes = allSegments.filter(
      s => s.category === 'Match' && s.finishType === segment.finishType && s.segmentNumber < segment.segmentNumber
    ).length;
    if (sameFinishes >= 2) {
      finishPenalty = 6;
      notes.push(`Repetitive Finish Penalty (-6 pts): Too many '${segment.finishType}' endings on this show.`);
    }
  }

  if (segment.category === 'Match') {
    // Formula: (Workrate x 0.6) + (Overness x 0.4) + Feud Heat + Fatigue/Stamina Factor
    workratePart = avgWorkrate * 0.6;
    overnessPart = avgOverness * 0.4;
    score = workratePart + overnessPart + feudBonus;

    // Fatigue & Stamina deficit
    const duration = segment.durationMinutes || 12;
    if (duration > avgStamina * 0.3) {
      const deficit = Math.round(duration - (avgStamina * 0.3));
      staminaFatiguePenalty += Math.min(18, Math.max(3, deficit * 1.5));
      notes.push(`Stamina Deficit (-${staminaFatiguePenalty} pts): Wrestlers blown up by prolonged ${duration}-minute duration.`);
    }

    if (avgFatigue > 25) {
      const fatigueDrain = Math.round((avgFatigue - 25) * 0.4);
      staminaFatiguePenalty += fatigueDrain;
      notes.push(`Fatigue Sluggishness (-${fatigueDrain} pts): Exhaustion took a toll on match speed.`);
    }

    // Match type & style synergy / mismatch
    const matchType = segment.matchType || 'Singles';
    if (duration >= 25 && avgWorkrate < 70) {
      durationMismatchPenalty += 12;
      notes.push('Mismatch Penalty (-12 pts): Low-workrate brawlers struggled in an overly lengthy technical clinic.');
    }

    if (matchType === 'Hardcore / No DQ' || matchType === 'Steel Cage') {
      const brawlerCount = participants.filter(p => p.style === 'Hardcore' || p.style === 'Brawler').length;
      if (brawlerCount >= 1) {
        score += 4; // weapon synergy
        notes.push('Stipulation Synergy (+4 pts): Brutal weapons suited the competitors\' aggressive styles.');
      }
    }

    if (matchType === 'Ladder Match' || matchType === 'TLC (Tables Ladders Chairs)') {
      const flyers = participants.filter(p => p.style === 'High Flyer').length;
      if (flyers >= 1) {
        score += 6;
        notes.push('High Flying Synergy (+6 pts): Breathtaking aerial spots energized the arena.');
      }
    }

    if (matchType === 'Hell in a Cell' || matchType === 'Elimination Chamber') {
      score += 8;
      notes.push(`Spectacle Structure (+8 pts): The imposing ${matchType} structure delivered intense drama.`);
    }

    if (matchType === 'Last Man Standing') {
      score += 5;
      notes.push('War of Attrition (+5 pts): Dramatic 10-counts kept the crowd on the edge of their seats.');
    }

    if (matchType === '6-Man Tag' || matchType === 'Battle Royal / Royal Rumble') {
      score += 4;
      notes.push(`Multi-Man Chaos (+4 pts): Fast transitions and high energy kept the pace vibrant.`);
    }

    // Custom Match Rule handling
    const customRules = [...(promotion?.customMatchRules || []), ...DEFAULT_CUSTOM_MATCH_RULES];
    if (segment.customMatchRuleId || matchType === 'Custom Match') {
      const rule = customRules.find(r => r.id === segment.customMatchRuleId);
      if (rule) {
        const multBonus = Math.round((rule.workrateMultiplier - 1.0) * avgWorkrate * 0.4);
        score += (multBonus + rule.spectacleBonus);
        notes.push(`Custom Stipulation '${rule.name}' (+${rule.spectacleBonus + multBonus} pts): ${rule.description}`);
        if (rule.enclosure && rule.enclosure !== 'Standard Ring') {
          score += 2;
          notes.push(`Enclosure: Contested inside ${rule.enclosure} (+2 pts spectacle).`);
        }
        if (rule.winCondition && rule.winCondition !== 'Pinfall & Submission') {
          notes.push(`Unique Win Condition: Must achieve victory via ${rule.winCondition}.`);
        }
      }
    }

    // Tournament match prestige bonus
    if (segment.tournamentId && segment.tournamentMatchId) {
      score += 4;
      notes.push(`Tournament Stakes (+4 pts): High tournament tournament advancement implications elevated crowd tension.`);
    }

    // Farewell Tour special showcase bonus
    const isFarewell = segment.isFarewellMatch || participants.some(p => (p.farewellTour && p.farewellTour.isActive) || p.id === segment.farewellWrestlerId);
    if (isFarewell) {
      const farewellWrestler = participants.find(p => (p.farewellTour && p.farewellTour.isActive) || p.id === segment.farewellWrestlerId);
      if (farewellWrestler) {
        score += 6;
        const tourName = farewellWrestler.farewellTour?.tourTitle || 'Official Farewell Tour';
        notes.push(`⭐ Farewell Tour Showcase (+6 pts): Electrifying crowd reverence for living legend ${farewellWrestler.name} on "${tourName}".`);

        if (farewellWrestler.farewellTour?.torchPassedWrestlerId && 
            participants.some(p => p.id === farewellWrestler.farewellTour?.torchPassedWrestlerId)) {
          score += 3;
          notes.push(`🔥 Generational Torch Clash (+3 pts): Generational battle against designated protege ${farewellWrestler.farewellTour.torchPassedWrestlerName || 'successor'}!`);
        }
      }
    }

    // Forbidden Door & Cross-Promotional Dream Match Bonus
    const isForbiddenDoor = segment.isForbiddenDoorMatch || participants.some(p => p.isGuestStar);
    if (isForbiddenDoor) {
      score += 7;
      const guestNames = participants.filter(p => p.isGuestStar).map(p => `${p.name} (${p.guestHomePromotionName || 'Foreign Promotion'})`).join(', ');
      notes.push(`🌐 Forbidden Door Showcase (+7 pts): Historic cross-promotional spectacle featuring global attraction ${guestNames || 'international guest talent'}!`);
      if (segment.titleId) {
        score += 3;
        notes.push(`🏆 Interpromotional Title Stakes (+3 pts): International champion stakes created white-hot drama.`);
      }
    }

    // Alignment dynamic: Face vs Heel has natural heat
    const hasFace = participants.some(p => p.alignment === 'Face');
    const hasHeel = participants.some(p => p.alignment === 'Heel');
    if (hasFace && hasHeel) {
      score += 3;
    } else if (participants.every(p => p.alignment === 'Heel')) {
      score -= 3;
      notes.push('Heel vs. Heel (-3 pts): The crowd lacked a clear hero to rally behind.');
    }

    score = score - staminaFatiguePenalty - durationMismatchPenalty - overusePenalty - finishPenalty;
  } else {
    // Angle / Promo Quality: (Mic Skills / Charisma x 0.7) + Overness x 0.3
    micPart = avgMic * 0.7;
    overnessPart = avgOverness * 0.3;
    score = micPart + overnessPart + feudBonus - overusePenalty;

    const angleType = segment.angleType || 'In-Ring Promo';
    if (angleType === 'Backstage Ambush' || angleType === 'Confrontation / Staredown' || angleType === 'Faction War / Gang Attack') {
      score += 4; // high intensity angle
      notes.push('High Stakes Angle (+4 pts): Electric confrontation captured fan buzz.');
    }
  }

  // Title on the line bonus with strict gender validation
  if (segment.titleId && promotion && promotion.titles) {
    const title = promotion.titles.find(t => t.id === segment.titleId);
    if (title) {
      const genderValidation = validateMatchTitleGender(title, participants);
      if (!genderValidation.isValid) {
        score = Math.max(10, score - 15);
        notes.push(`⚠️ Title Sanction Voided (-15 pts): ${genderValidation.errorReason}`);
      } else {
        const titleBonus = Math.round((title.prestige / 100) * 5) + (title.minWorkrateBonus || 0);
        score += titleBonus;
        notes.push(`Championship Stakes (+${titleBonus} pts for ${title.name})`);
      }
    }
  }

  // Clamping to 0-100 range with subtle randomness (+/- 2)
  const variance = (Math.random() * 4) - 2;
  score = Math.min(99, Math.max(12, Math.round(score + variance)));

  const { stars, starString } = calculateStarRating(score);

  // Generate narrative recap
  const winner = roster.find(w => w.id === segment.winnerId);
  const losers = participants.filter(w => w.id !== segment.winnerId);
  let recap = '';

  if (segment.category === 'Match') {
    const matchTypeStr = segment.matchType || 'Singles Match';
    const finishStr = segment.finishType || 'Clean Pinfall';
    const durationStr = `${segment.durationMinutes || 12} minutes`;

    if (winner && losers.length > 0) {
      const loserNames = losers.map(l => l.name).join(' & ');
      if (finishStr.includes('Clean')) {
        recap = `${winner.name} defeated ${loserNames} in a thrilling ${durationStr} ${matchTypeStr} following their signature maneuver for a clean, decisive victory.`;
      } else if (finishStr.includes('DQ') || finishStr.includes('Foreign')) {
        recap = `${winner.name} was awarded the victory after ${loserNames} resorted to blatant weapon violence and suffered a disqualification at the ${durationStr} mark!`;
      } else if (finishStr.includes('Distraction')) {
        recap = `${winner.name} stole a victory over ${loserNames} after outside interference created chaos, securing a lightning fast rollup pinfall.`;
      } else if (finishStr.includes('Turn') || finishStr.includes('Screwjob')) {
        recap = `Shocking scenes! A shocking betrayal allowed ${winner.name} to steal the match from ${loserNames}, leaving the arena in absolute uproar!`;
      } else {
        recap = `${winner.name} overcame ${loserNames} in a hard-fought ${matchTypeStr} lasting ${durationStr}.`;
      }
    } else {
      recap = `A chaotic ${matchTypeStr} featuring ${participants.map(p => p.name).join(', ')} ended in a wild no-contest after ${durationStr} of nonstop mayhem.`;
    }
  } else {
    const angleTypeStr = segment.angleType || 'In-Ring Promo';
    if (angleTypeStr === 'In-Ring Promo') {
      recap = `${participants.map(p => p.name).join(' & ')} cut a venomous promo on the microphone, firing up the live crowd with razor-sharp verbal attacks.`;
    } else if (angleTypeStr === 'Backstage Ambush') {
      recap = `Backstage cameras caught violent mayhem as ${participants.map(p => p.name).join(' and ')} brawled wildly through gorilla position into catering!`;
    } else if (angleTypeStr === 'Contract Signing') {
      recap = `Tension reached a fever pitch during an official contract signing featuring ${participants.map(p => p.name).join(' & ')}, culminating in an overturned mahogany table and steel chair strikes!`;
    } else {
      recap = `A dramatic ${angleTypeStr} segment showcased ${participants.map(p => p.name).join(', ')}, creating tremendous buzz among the wrestling universe.`;
    }
  }

  return {
    segment,
    score,
    stars,
    starString,
    breakdown: {
      workratePart: Math.round(workratePart),
      overnessPart: Math.round(overnessPart),
      micPart: Math.round(micPart),
      feudBonus,
      staminaFatiguePenalty,
      durationMismatchPenalty,
      overusePenalty,
      finishPenalty
    },
    recap,
    notes
  };
}

/**
 * Calculates overall show rating using EWR weighting:
 * Main Event (35%), Upper Midcard (25%), Rest of Card (40%)
 */
export function calculateShowResult(
  segments: Segment[],
  roster: Wrestler[],
  feuds: Feud[],
  promotion: Promotion,
  week: number,
  year: number
): ShowResult {
  const evaluations: SegmentEvaluation[] = [];

  segments.forEach((seg, idx) => {
    // update segment number
    const updated = { ...seg, segmentNumber: idx + 1 };
    evaluations.push(evaluateSegment(updated, segments, roster, feuds, promotion));
  });

  const ppvSchedule = (promotion.ppvSchedule && promotion.ppvSchedule.length > 0) 
    ? promotion.ppvSchedule 
    : DEFAULT_PPV_CALENDAR;
  const currentPPV = ppvSchedule.find(p => p.weekNumber === week);
  const isPPV = Boolean(currentPPV);

  if (evaluations.length === 0) {
    return {
      week,
      year,
      showName: currentPPV ? currentPPV.name : promotion.weeklyTVShow,
      isPPV,
      ppvEvent: currentPPV,
      overallScore: 20,
      starRating: '1.0 Star ★',
      tvRating: 0.8,
      viewers: '0.9M',
      attendance: 1200,
      gateRevenue: 24000,
      ppvBuys: 0,
      ppvRevenue: 0,
      segmentEvaluations: [],
      topSegmentScore: 20,
      mainEventScore: 20,
      networkFeedback: 'The broadcast was an unmitigated disaster with no booked segments.'
    };
  }

  const scores = evaluations.map(e => e.score);
  const topSegmentScore = Math.max(...scores);
  const mainEvent = evaluations[evaluations.length - 1];
  const mainEventScore = mainEvent ? mainEvent.score : scores[0];

  let overallScore: number;
  if (evaluations.length === 1) {
    overallScore = scores[0];
  } else if (evaluations.length === 2) {
    overallScore = Math.round((mainEventScore * 0.6) + (scores[0] * 0.4));
  } else {
    // EWR weighting: Main Event = 35%, Upper Midcard (second-to-last or penultimate) = 25%, Rest = 40%
    const upperMidcardScore = evaluations[evaluations.length - 2].score;
    const otherScores = evaluations.slice(0, evaluations.length - 2).map(e => e.score);
    const avgOther = otherScores.reduce((a, b) => a + b, 0) / (otherScores.length || 1);

    overallScore = Math.round((mainEventScore * 0.35) + (upperMidcardScore * 0.25) + (avgOther * 0.40));
  }

  // If this is a PPV or Supercard, apply marquee prestige bonus
  if (currentPPV) {
    overallScore = Math.min(100, overallScore + Math.round((currentPPV.prestigeBonus || 10) * 0.4));
  }

  const { starString } = calculateStarRating(overallScore);

  // TV Ratings calculation
  // Scaled by overall score, promotion prestige, and network tier
  const prestige = (promotion && typeof promotion.prestige === 'number' && !isNaN(promotion.prestige)) ? promotion.prestige : 70;
  const fanbase = (promotion && typeof promotion.fanbase === 'number' && !isNaN(promotion.fanbase)) ? promotion.fanbase : 50000;
  const baseRating = (overallScore / 30) + (prestige / 40);
  const tvRating = parseFloat(Math.max(0.4, (baseRating + (Math.random() * 0.3 - 0.15))).toFixed(2));
  const viewerCount = (tvRating * 1.25).toFixed(1) + 'M';

  // Attendance & Gate
  let attendance: number;
  let gateRevenue: number;
  let ppvBuys = 0;
  let ppvRevenue = 0;

  if (currentPPV) {
    // PPV Attendance is scaled by stadium/arena capacity and show quality
    const capacity = currentPPV.venueCapacity || 20000;
    const fillRate = Math.min(1.0, Math.max(0.65, (overallScore / 80) * (currentPPV.isSupercard ? 1.15 : 0.95)));
    attendance = Math.round(capacity * fillRate);
    gateRevenue = attendance * (currentPPV.ticketPrice || 85);
    // PPV Buys & Streaming Purchases
    const baseBuys = Math.round(fanbase * (overallScore / 65) * (currentPPV.buyrateMultiplier || 1.3));
    ppvBuys = Math.max(5000, baseBuys);
    ppvRevenue = Math.round(ppvBuys * 44.99); // PPV gross revenue share
  } else {
    attendance = Math.round(Math.min(fanbase, Math.max(1500, (fanbase * 0.12) * (overallScore / 70)))) || 2000;
    gateRevenue = attendance * 42;
  }

  // Network feedback
  let networkFeedback = 'The network executives were reasonably pleased with this week\'s output.';
  if (currentPPV) {
    networkFeedback = `PPV SPECTACLE: '${currentPPV.name}' at ${currentPPV.venue} drew massive acclaim and ${attendance.toLocaleString()} roaring fans!`;
  } else if (overallScore >= promotion.minNetworkRating + 12) {
    networkFeedback = 'Executive Rave: Prime-time viewership crushed key demographics! Broadcasters are ecstatic.';
  } else if (overallScore >= promotion.minNetworkRating) {
    networkFeedback = 'Broadcaster Satisfied: Ratings hit the contractual benchmarks comfortably.';
  } else if (overallScore >= promotion.minNetworkRating - 8) {
    networkFeedback = 'Warning Memo: Network suits felt the show sagged in key quarters. Improvement demanded.';
  } else {
    networkFeedback = 'Severe Network Reprimand: Ratings fell off a cliff! Threat of cancellation looms unless numbers rebound immediately.';
  }

  return {
    week,
    year,
    showName: currentPPV ? currentPPV.name : promotion.weeklyTVShow,
    isPPV,
    ppvEvent: currentPPV,
    overallScore,
    starRating: starString,
    tvRating,
    viewers: viewerCount,
    attendance,
    gateRevenue,
    ppvBuys,
    ppvRevenue,
    segmentEvaluations: evaluations,
    topSegmentScore,
    mainEventScore,
    networkFeedback,
    gmFeedback: promotion.currentGM ? {
      gmName: promotion.currentGM.name,
      gmAvatar: promotion.currentGM.avatar,
      quote: generateGMPostShowDebrief({ overallScore } as ShowResult, promotion.currentGM, true).debriefQuote,
      reaction: generateGMPostShowDebrief({ overallScore } as ShowResult, promotion.currentGM, true).reaction,
      ratingScore: overallScore
    } : undefined
  };
}

/**
 * Dynamic World & Progression Engine:
 * Processes Overness shifts, Fatigue, Injuries, Morale, Competitor News, and Financials.
 */
export function advanceWeekEngine(
  currentState: {
    promotion: Promotion;
    currentWeek: number;
    currentYear: number;
    currentShowCard: Segment[];
    showResult: ShowResult;
    freeAgents: Wrestler[];
    difficulty: Difficulty;
  }
): {
  updatedPromotion: Promotion;
  updatedFreeAgents: Wrestler[];
  financialReport: FinancialReport;
  newNews: NewsItem[];
  nextWeek: number;
  nextYear: number;
} {
  const { promotion, currentWeek, currentYear, currentShowCard, showResult, freeAgents, difficulty } = currentState;

  const newNews: NewsItem[] = [];
  let updatedRoster: Wrestler[] = promotion.roster.map(w => ({ ...w }));
  let updatedTitles = promotion.titles.map(t => ({ ...t }));
  const updatedFeuds = promotion.feuds.map(f => ({ ...f }));
  let currentPrestige = (typeof promotion.prestige === 'number' && !isNaN(promotion.prestige)) ? promotion.prestige : 75;
  let totalPrestigeEarnedTonight = 0;
  const farewellHighlights: string[] = [];

  // Track who was booked
  const bookedWrestlerIds = new Set<string>();
  currentShowCard.forEach(seg => {
    seg.participantIds.forEach(id => bookedWrestlerIds.add(id));
  });

  // 0. Ensure all match segments have a decisive winner if left unpicked by the booker
  currentShowCard.forEach(seg => {
    if (seg.category === 'Match' && (!seg.winnerId || seg.winnerId.trim() === '') && seg.participantIds.length >= 2) {
      const p1 = updatedRoster.find(w => w.id === seg.participantIds[0]);
      const p2 = updatedRoster.find(w => w.id === seg.participantIds[1]);
      if (p1 && p2) {
        const outcome = simulateTournamentMatchOutcome(p1, p2, seg.notes || 'Tournament / Match Encounter');
        seg.winnerId = outcome.winnerId;
        if (!seg.finishType) seg.finishType = outcome.finishType;
      } else {
        seg.winnerId = seg.participantIds[0];
      }

      // Also ensure the corresponding evaluation in showResult reflects the winner
      const evalMatch = showResult.segmentEvaluations.find(e => e.segment.id === seg.id);
      if (evalMatch) {
        evalMatch.segment.winnerId = seg.winnerId;
        if (!evalMatch.segment.finishType) evalMatch.segment.finishType = seg.finishType;
      }
    }
  });

  // 1. Process Segment Outcomes for Booked Wrestlers
  showResult.segmentEvaluations.forEach(ev => {
    const { segment, score } = ev;
    const participants = updatedRoster.filter(w => segment.participantIds.includes(w.id));

    participants.forEach(w => {
      // Stamina drain & fatigue accumulation
      const duration = segment.durationMinutes || 10;
      const fatigueGain = segment.category === 'Match' ? Math.round(duration * 0.8) : 2;
      w.fatigue = Math.min(100, w.fatigue + fatigueGain);

      // Overness changes:
      // High star segments boost everybody slightly
      if (score >= 82) {
        w.overness = Math.min(100, w.overness + 1);
      }

      // Match winners and losers
      if (segment.category === 'Match' && segment.winnerId) {
        if (w.id === segment.winnerId) {
          w.wins += 1;
          w.winStreak = (w.winStreak || 0) + 1;
          w.recentForm = ['W', ...(w.recentForm || []).slice(0, 4)];
          w.recentPerformance = Math.round(((w.recentPerformance ?? w.workrate) * 0.4) + (score * 0.6));
          const winBonus = score >= 75 ? 2 : 1;
          w.overness = Math.min(100, w.overness + winBonus);
          w.morale = Math.min(100, w.morale + 3);
        } else {
          w.losses += 1;
          w.winStreak = 0;
          w.recentForm = ['L', ...(w.recentForm || []).slice(0, 4)];
          w.recentPerformance = Math.round(((w.recentPerformance ?? w.workrate) * 0.5) + (score * 0.5));
          // Protected finishes (DQ, distraction) soften the overness hit
          const isProtected = segment.finishType === 'Disqualification (DQ)' || segment.finishType === 'Distraction Rollup';
          if (!isProtected && score < 75) {
            w.overness = Math.max(10, w.overness - 1);
          }
          w.morale = Math.max(10, w.morale - (isProtected ? 1 : 2));
        }
      } else if (segment.category === 'Angle') {
        // Promo overness bump if high score
        if (score >= 80) {
          w.overness = Math.min(100, w.overness + 1);
          w.morale = Math.min(100, w.morale + 2);
        }
      }
    });

    // Feud progression
    if (segment.feudId) {
      const feud = updatedFeuds.find(f => f.id === segment.feudId);
      if (feud) {
        if (score >= 75) {
          feud.heat = Math.min(100, feud.heat + Math.round((score - 70) * 0.3));
          feud.momentum = feud.heat >= 85 ? 'White Hot' : feud.heat >= 75 ? 'Boiling Hot' : 'Simmering';
        } else {
          feud.heat = Math.max(15, feud.heat - 3);
          feud.momentum = feud.heat < 45 ? 'Cooling Down' : 'Simmering';
        }
      }
    }

    // Title changes & defenses with strict gender division check
    if (segment.titleId && segment.winnerId) {
      const title = updatedTitles.find(t => t.id === segment.titleId);
      if (title) {
        const winner = updatedRoster.find(w => w.id === segment.winnerId);
        const matchParticipants = segment.participantIds
          .map(id => updatedRoster.find(w => w.id === id))
          .filter((w): w is Wrestler => Boolean(w));

        const genderCheck = validateMatchTitleGender(title, matchParticipants);
        if (!genderCheck.isValid || (winner && !isWrestlerEligibleForTitle(title, winner))) {
          // Reject title defense or championship transfer due to gender violation!
          return;
        }

        const isCurrentHolder = title.currentHolderIds.includes(segment.winnerId);
        const segEval = showResult.segmentEvaluations?.find(se => se.segment.id === segment.id);
        const eventName = showResult.isPPV && showResult.ppvEvent ? showResult.ppvEvent.name : promotion.weeklyTVShow;

        if (isCurrentHolder) {
          title.defenses += 1;
          if (title.history && title.history.length > 0) {
            title.history[0].defenses = title.defenses;
          }
          // Boost prestige slightly for classic defenses
          if (segEval && segEval.score >= 80) {
            title.prestige = Math.min(100, title.prestige + 1);
          }
        } else {
          // New champion!
          const winner = updatedRoster.find(w => w.id === segment.winnerId);
          if (winner) {
            // strip previous holders
            title.currentHolderIds.forEach(prevId => {
              const prevHolder = updatedRoster.find(w => w.id === prevId);
              if (prevHolder) {
                prevHolder.championshipIds = prevHolder.championshipIds.filter(id => id !== title.id);
                prevHolder.morale = Math.max(20, prevHolder.morale - 8);
              }
            });

            // Mark previous reign as concluded
            if (title.history && title.history.length > 0 && !title.history[0].lostWeek) {
              title.history[0].lostWeek = currentWeek;
              title.history[0].lostYear = currentYear;
              title.history[0].isCurrent = false;
            }

            title.currentHolderIds = [winner.id];
            title.defenses = 0;
            winner.championshipIds.push(title.id);
            winner.overness = Math.min(100, winner.overness + 3);
            winner.morale = Math.min(100, winner.morale + 15);
            title.history.unshift({
              id: `reign-${Date.now()}-${Math.random()}`,
              reignNumber: title.history.length + 1,
              holderNames: winner.name,
              holderIds: [winner.id],
              wonWeek: currentWeek,
              wonYear: currentYear,
              defenses: 0,
              eventWonAt: eventName,
              notes: `Won via ${segment.finishType || 'Pinfall'} (${segment.matchType || 'Match'})`,
              reignRating: segEval?.starString || '★★★1/2',
              isCurrent: true
            });

            newNews.push({
              id: `news-title-${Date.now()}-${Math.random()}`,
              week: currentWeek,
              category: 'Promotion',
              importance: 'High',
              headline: `NEW CHAMPION: ${winner.name} captures the ${title.name}!`,
              details: `In a historic turn of events, ${winner.name} hoisted the gold after a dramatic victory at ${eventName}.`
            });
          }
        }
      }
    }
  });

  // 2. Process Rest and Morale for Unbooked Wrestlers
  updatedRoster.forEach(w => {
    if (!bookedWrestlerIds.has(w.id)) {
      // Unbooked wrestler rests: fatigue recovers!
      w.fatigue = Math.max(0, w.fatigue - 20);

      // Main eventers & upper midcard get frustrated if left off TV
      if (w.push === 'Main Eventer' || w.push === 'Upper Midcard') {
        w.morale = Math.max(15, w.morale - 3);
        if (w.morale <= 50 && Math.random() < 0.4) {
          newNews.push({
            id: `news-ego-${Date.now()}-${Math.random()}`,
            week: currentWeek,
            category: 'Wrestler',
            importance: 'Medium',
            headline: `${w.name} Voicing Frustration Backstage`,
            details: `Sources report that ${w.name} was visibly agitated after being left off ${promotion.weeklyTVShow} this week and questioned management's creative direction.`
          });
        }
      }
    }

    // Process ongoing injuries
    if (w.injury.injured) {
      if (w.injury.weeksRemaining && w.injury.weeksRemaining > 1) {
        w.injury.weeksRemaining -= 1;
      } else {
        w.injury = { injured: false };
        newNews.push({
          id: `news-med-cleared-${Date.now()}-${Math.random()}`,
          week: currentWeek,
          category: 'Injury',
          importance: 'Medium',
          headline: `Medical Clearance: ${w.name} Ready to Return!`,
          details: `Doctors have fully cleared ${w.name} to resume in-ring action following rehab.`
        });
      }
    }
  });

  // 2.5. Process Farewell Tour Special Matches and Company Prestige Multipliers
  const processedFarewellWrestlerIds = new Set<string>();

  currentShowCard.forEach(seg => {
    if (seg.category !== 'Match') return;

    // Check if segment is marked as farewell or has any participant on active farewell tour
    const farewellParticipants = updatedRoster.filter(w => 
      seg.participantIds.includes(w.id) && 
      (seg.isFarewellMatch || (w.farewellTour && w.farewellTour.isActive) || w.id === seg.farewellWrestlerId)
    );

    farewellParticipants.forEach(veteran => {
      if (processedFarewellWrestlerIds.has(veteran.id)) return;
      processedFarewellWrestlerIds.add(veteran.id);

      if (!veteran.farewellTour) {
        veteran.farewellTour = {
          isActive: true,
          tourTitle: `${veteran.name}: The Last Ride`,
          startedWeek: currentWeek,
          startedYear: currentYear,
          weeksRemaining: 8,
          totalWeeks: 8,
          matchesBookedCount: 0,
          targetMatchesCount: 5,
          prestigeAccumulated: 0,
          farewellStipulation: 'Passing the Torch'
        };
      }

      veteran.farewellTour.matchesBookedCount += 1;
      const segEval = showResult.segmentEvaluations?.find(se => se.segment.id === seg.id);
      const isClassic = segEval && segEval.score >= 80;

      // Base boost: +1 to company prestige (+2 for 4+ star classic)
      const prestigeGain = isClassic ? 2 : 1;
      veteran.farewellTour.prestigeAccumulated += prestigeGain;
      totalPrestigeEarnedTonight += prestigeGain;
      currentPrestige = Math.min(100, currentPrestige + prestigeGain);

      farewellHighlights.push(
        `${veteran.name}: Match #${veteran.farewellTour.matchesBookedCount}/${veteran.farewellTour.targetMatchesCount} of "${veteran.farewellTour.tourTitle}" (+${prestigeGain} Company Prestige)`
      );

      // Check if veteran faced their designated protege
      const protegeId = veteran.farewellTour.torchPassedWrestlerId;
      if (protegeId && seg.participantIds.includes(protegeId)) {
        const protege = updatedRoster.find(w => w.id === protegeId);
        if (protege) {
          protege.overness = Math.min(100, protege.overness + 4);
          protege.morale = Math.min(100, protege.morale + 10);
          protege.workrate = Math.min(100, protege.workrate + 2);

          newNews.push({
            id: `news-torch-passed-${Date.now()}-${protege.id}`,
            week: currentWeek,
            category: 'Wrestler',
            importance: 'High',
            headline: `PASSING THE TORCH: ${veteran.name} Passes the Torch to ${protege.name}!`,
            details: `In a historic farewell tour encounter, living legend ${veteran.name} tested young prodigy ${protege.name} inside the ring. Generational momentum and respect have been passed (+4 Overness, +10 Morale)!`
          });
        }
      }

      newNews.push({
        id: `news-farewell-match-${Date.now()}-${veteran.id}`,
        week: currentWeek,
        category: 'Promotion',
        importance: 'High',
        headline: `FAREWELL TOUR: ${veteran.name} Electrifies in Match #${veteran.farewellTour.matchesBookedCount} of "${veteran.farewellTour.tourTitle}"!`,
        details: `Living legend ${veteran.name} delivered an emotional showcase on tonight's broadcast, boosting ${promotion.name}'s company prestige to ${currentPrestige}/100 (+${prestigeGain} pts)!`
      });

      // Check if tour is now culminating
      if (veteran.farewellTour.matchesBookedCount >= veteran.farewellTour.targetMatchesCount) {
        veteran.farewellTour.isCulminated = true;
        veteran.farewellTour.isActive = false;

        // Culmination grand finale prestige bonus!
        const grandFinalePrestige = 4;
        currentPrestige = Math.min(100, currentPrestige + grandFinalePrestige);
        veteran.farewellTour.prestigeAccumulated += grandFinalePrestige;
        totalPrestigeEarnedTonight += grandFinalePrestige;

        // Automatically vacate championships if still holding any upon retirement
        const farewellVacancy = handleAutomaticTitleVacancyForWrestler(
          veteran,
          updatedTitles,
          updatedRoster,
          currentWeek,
          'retirement',
          { currentYear, promotionName: promotion.name }
        );
        if (farewellVacancy.vacatedTitlesCount > 0) {
          updatedTitles = farewellVacancy.updatedTitles;
          updatedRoster = farewellVacancy.updatedRoster;
          newNews.push(...farewellVacancy.newNews);
        }

        veteran.isRetired = true;
        veteran.retiredWeek = currentWeek;
        veteran.retiredYear = currentYear;
        veteran.retirementReason = `Culminated iconic '${veteran.farewellTour.tourTitle}' send-off with ${veteran.farewellTour.matchesBookedCount} historic matches.`;
        veteran.salary = 0;
        veteran.contractWeeks = 0;
        veteran.hofNominationPending = true;

        newNews.push({
          id: `news-farewell-culmination-${Date.now()}-${veteran.id}`,
          week: currentWeek,
          category: 'Promotion',
          importance: 'High',
          headline: `ICONIC SEND-OFF: ${veteran.name} Culminates Farewell Tour & Retires!`,
          details: `With the conclusion of "${veteran.farewellTour.tourTitle}", ${veteran.name} officially hangs up the boots to a thunderous standing ovation. The farewell tour generated immense acclaim (+${veteran.farewellTour.prestigeAccumulated} Total Prestige), vaulting ${promotion.name}'s company prestige to ${currentPrestige}/100 and unlocking immediate Hall of Fame enshrinement!`
        });
      }
    });
  });

  // Track Career Longevity in Simulator, Retirement Age & Retirement Risk for all roster members
  updatedRoster.forEach(w => {
    w.careerWeeksInSimulator = (w.careerWeeksInSimulator || Math.max(10, (w.age - 20) * 8)) + 1;
    w.peakOverness = Math.max(w.overness, w.peakOverness || w.overness);

    // Initialize retirement age based on style and age if not set
    if (!w.retirementAge) {
      const baseRetire = w.style === 'High Flyer' ? 40 : w.style === 'Hardcore' ? 41 : w.style === 'Powerhouse' ? 45 : 44;
      w.retirementAge = Math.max(w.age + 2, baseRetire);
    }
    w.careerInjuriesCount = w.careerInjuriesCount || 0;
    w.injuryHistory = w.injuryHistory || [];

    // Calculate dynamic retirement risk based on age proximity & injury history
    const injuryToll = w.careerInjuriesCount;
    if (w.age >= w.retirementAge) {
      w.retirementRisk = 'Imminent';
    } else if (w.age >= w.retirementAge - 2 || injuryToll >= 3) {
      w.retirementRisk = 'High';
    } else if (w.age >= w.retirementAge - 4 || injuryToll >= 2) {
      w.retirementRisk = 'Moderate';
    } else {
      w.retirementRisk = 'Low';
    }

    // Initialize or tick down contract weeks
    if (typeof w.contractWeeks !== 'number' || isNaN(w.contractWeeks) || w.contractWeeks <= 0) {
      w.contractWeeks = Math.max(10, 52 - Math.floor(Math.random() * 24));
    } else {
      w.contractWeeks = Math.max(0, w.contractWeeks - 1);
    }
  });

  // 3. Dynamic Injury Engine on High Risk Segments
  const injuryMultiplier = difficulty === 'Hard' ? 1.5 : difficulty === 'Easy' ? 0.6 : 1.0;
  currentShowCard.forEach(seg => {
    if (seg.category === 'Match') {
      const isHighRisk = seg.matchType === 'Hardcore / No DQ' || seg.matchType === 'Steel Cage' || seg.matchType === 'Ladder Match' || seg.matchType === 'Hell in a Cell' || seg.matchType === 'TLC (Tables Ladders Chairs)';
      let customRiskBonus = 0;
      if (seg.customMatchRuleId) {
        const customRules = [...(promotion?.customMatchRules || []), ...DEFAULT_CUSTOM_MATCH_RULES];
        const rule = customRules.find(r => r.id === seg.customMatchRuleId);
        if (rule) {
          customRiskBonus = (rule.injuryRiskBonus || 0) / 100;
        }
      }
      const baseChance = (isHighRisk ? 0.08 : 0.02) + customRiskBonus;

      seg.participantIds.forEach(id => {
        const wrestler = updatedRoster.find(w => w.id === id);
        if (wrestler && !wrestler.injury.injured) {
          const fatigueRisk = wrestler.fatigue > 50 ? 0.05 : 0;
          const roll = Math.random();
          if (roll < (baseChance + fatigueRisk) * injuryMultiplier) {
            const injuryList = [
              { name: 'Sprained Ankle', weeks: 2 },
              { name: 'Mild Concussion', weeks: 3 },
              { name: 'Cracked Ribs', weeks: 4 },
              { name: 'Torn Pectoral Muscle', weeks: 8 },
              { name: 'Lacerated Forehead', weeks: 1 }
            ];
            const picked = injuryList[Math.floor(Math.random() * injuryList.length)];
            wrestler.injury = {
              injured: true,
              name: picked.name,
              weeksRemaining: picked.weeks
            };
            wrestler.morale = Math.max(10, wrestler.morale - 5);
            wrestler.careerInjuriesCount = (wrestler.careerInjuriesCount || 0) + 1;
            const logEntry = `${picked.name} (${picked.weeks} wks, Wk ${currentWeek})`;
            wrestler.injuryHistory = [logEntry, ...(wrestler.injuryHistory || [])];

            // Severe injury wear-and-tear accelerates natural retirement
            if (picked.weeks >= 4 && wrestler.retirementAge) {
              if (Math.random() < 0.6) {
                wrestler.retirementAge = Math.max(wrestler.age, wrestler.retirementAge - 1);
              }
            }

            newNews.push({
              id: `news-injury-${Date.now()}-${Math.random()}`,
              week: currentWeek,
              category: 'Injury',
              importance: 'High',
              headline: `INJURY ALERT: ${wrestler.name} sidelined with ${picked.name}!`,
              details: `During their brutal segment on this week's broadcast, ${wrestler.name} sustained a confirmed ${picked.name} (career injury #${wrestler.careerInjuriesCount}) and is projected out for ${picked.weeks} weeks.`
            });
          }
        }
      });
    }
  });

  // 3.5 Automatic Championship Vacancy for Champions Injured > 4 Weeks
  const injuryVacancyResult = handleAutomaticTitleVacancy(
    updatedTitles,
    updatedRoster,
    currentWeek,
    { currentYear, promotionName: promotion.name, injuryThresholdWeeks: 4 }
  );
  if (injuryVacancyResult.vacatedTitlesCount > 0) {
    updatedTitles = injuryVacancyResult.updatedTitles;
    updatedRoster = injuryVacancyResult.updatedRoster;
    newNews.push(...injuryVacancyResult.newNews);
  }

  // 4. Competitor News Generation
  const competitorStories = [
    {
      headline: 'Rival Promotion Smashes Buyrate Record',
      details: 'Overseas rival Shin-Sekai Pro Wrestling drew a sellout Tokyo Dome crowd of 42,000 for their championship tournament finals.'
    },
    {
      headline: 'Indie Sensation Enters Free Agency',
      details: 'Lucha high-flyer Aero Kid has completed their indie commitments and is taking booking inquiries from major televised promotions.'
    },
    {
      headline: 'Wrestling Observer Awards Five Stars',
      details: 'Pundits praised a dramatic 35-minute iron man match on the independent circuit as an instant classic.'
    },
    {
      headline: 'Rival Mainstream Giant Announces Stadium Tour',
      details: 'Apex Pro Wrestling confirmed stadium dates across North America as broadcast ad revenue surges.'
    },
    {
      headline: 'Backstage Brawl Shakes Underground Promotion',
      details: 'Unconfirmed reports claim chairs and water bottles were hurled in a chaotic post-show locker room shouting match.'
    }
  ];

  if (Math.random() < 0.7) {
    const story = competitorStories[Math.floor(Math.random() * competitorStories.length)];
    newNews.push({
      id: `news-rival-${Date.now()}-${Math.random()}`,
      week: currentWeek,
      category: 'Rival',
      importance: 'Low',
      headline: story.headline,
      details: story.details
    });
  }

  // 5. Financial Calculation
  const currentBudget = (promotion && typeof promotion.budget === 'number' && !isNaN(promotion.budget)) ? promotion.budget : 2000000;
  const prodCostWeekly = (promotion && typeof promotion.productionCostWeekly === 'number' && !isNaN(promotion.productionCostWeekly)) ? promotion.productionCostWeekly : 25000;
  const safeAttendance = (showResult && typeof showResult.attendance === 'number' && !isNaN(showResult.attendance)) ? showResult.attendance : 2000;
  const safeGateRevenue = (showResult && typeof showResult.gateRevenue === 'number' && !isNaN(showResult.gateRevenue)) ? showResult.gateRevenue : (safeAttendance * 42);
  const safeTvRating = (showResult && typeof showResult.tvRating === 'number' && !isNaN(showResult.tvRating)) ? showResult.tvRating : 1.5;
  const safeScore = (showResult && typeof showResult.overallScore === 'number' && !isNaN(showResult.overallScore)) ? showResult.overallScore : 65;

  const totalPayroll = updatedRoster.reduce((sum, w) => sum + (typeof w.salary === 'number' && !isNaN(w.salary) ? w.salary : 5000), 0);
  const tvRevenue = Math.round(currentBudget * 0.02 * (safeTvRating / 2.5));
  const ticketSales = safeGateRevenue;
  const merchSales = Math.round(safeAttendance * (safeScore / 10));
  const ppvSales = showResult.ppvRevenue || 0;
  const productionCost = prodCostWeekly;
  const arenaCost = Math.round(safeAttendance * 6);
  const medicalCost = updatedRoster.filter(w => w.injury?.injured).length * 4500;

  const devCost = promotion.developmentalTerritory ? (promotion.developmentalTerritory.weeklyBudgetCost || 8500) : 0;
  const totalRevenue = tvRevenue + ticketSales + merchSales + ppvSales;
  const totalExpenses = totalPayroll + productionCost + arenaCost + medicalCost + devCost;
  const netProfit = totalRevenue - totalExpenses;
  let endingBalance = currentBudget + netProfit;

  // 5.5 Forbidden Door & Global Alliances Engine
  let updatedForbiddenDoor = promotion.forbiddenDoor ? { ...promotion.forbiddenDoor } : undefined;
  if (updatedForbiddenDoor) {
    const fdPartners = (updatedForbiddenDoor.partners || []).map(p => ({ ...p }));
    let fdLoaned = (updatedForbiddenDoor.loanedRoster || []).map(l => ({ ...l }));
    let fdBorrowed = (updatedForbiddenDoor.borrowedRoster || []).map(b => ({ ...b }));
    let fdSupercards = (updatedForbiddenDoor.supercards || []).map(s => ({ ...s }));

    // Check if any Forbidden Door matches were featured tonight
    const fdSegments = currentShowCard.filter(s => s.isForbiddenDoorMatch || s.participantIds.some(id => {
      const w = updatedRoster.find(r => r.id === id);
      return w?.isGuestStar;
    }));

    if (fdSegments.length > 0) {
      const fdPrestigeBoost = Math.min(3, fdSegments.length);
      currentPrestige = Math.min(100, currentPrestige + fdPrestigeBoost);
      totalPrestigeEarnedTonight += fdPrestigeBoost;
      updatedForbiddenDoor.totalPrestigeGained = (updatedForbiddenDoor.totalPrestigeGained || 0) + fdPrestigeBoost;

      newNews.push({
        id: `news-fd-showcase-${Date.now()}`,
        week: currentWeek,
        category: 'Promotion',
        importance: 'High',
        headline: `🌐 FORBIDDEN DOOR BUZZ: International Dream Matches Electrify Global Audience!`,
        details: `${promotion.name}'s broadcast showcased marquee interpromotional clashes, drawing international praise and vaulting company prestige (+${fdPrestigeBoost} pts, now ${currentPrestige}/100)!`
      });
    }

    // Process borrowed guest talent remaining weeks
    const remainingGuests: typeof fdBorrowed = [];
    fdBorrowed.forEach(b => {
      b.weeksRemaining -= 1;
      if (b.weeksRemaining <= 0) {
        // Conclude guest star tour and remove from active roster
        updatedRoster = updatedRoster.filter(w => w.id !== b.wrestler.id);
        newNews.push({
          id: `news-fd-conclude-${Date.now()}-${b.wrestler.id}`,
          week: currentWeek,
          category: 'Promotion',
          importance: 'Medium',
          headline: `INTERNATIONAL FAREWELL: ${b.wrestler.name} Concludes Guest Star Tour!`,
          details: `Global attraction ${b.wrestler.name} has concluded their scheduled tour with ${promotion.name} and returns to ${b.partnerName} with high acclaim.`
        });
      } else {
        remainingGuests.push(b);
      }
    });
    updatedForbiddenDoor.borrowedRoster = remainingGuests;

    // Process loaned talent on foreign excursion
    const remainingLoans: typeof fdLoaned = [];
    fdLoaned.forEach(l => {
      l.weeksRemaining -= 1;
      if (l.weeksRemaining <= 0) {
        // Return to active roster with total gained stats
        const totalBonus = Math.max(3, Math.round(l.totalWeeks * 0.9));
        const returnedStar: Wrestler = {
          id: l.wrestlerId,
          name: l.wrestlerName,
          nickname: 'The Returning Traveler',
          age: 25,
          gender: 'Male',
          style: 'Technician',
          alignment: 'Face',
          push: 'Upper Midcard',
          overness: Math.min(100, l.startingOverness + Math.round(totalBonus * 0.8)),
          workrate: Math.min(100, l.startingWorkrate + totalBonus),
          micSkills: 74,
          stamina: 88,
          morale: 100,
          fatigue: 0,
          salary: 2800,
          contractWeeks: 36,
          wins: 14,
          losses: 5,
          draws: 0,
          championshipIds: [],
          injury: { injured: false }
        };
        updatedRoster.push(returnedStar);

        newNews.push({
          id: `news-fd-return-${Date.now()}-${l.wrestlerId}`,
          week: currentWeek,
          category: 'Promotion',
          importance: 'High',
          headline: `HERO'S RETURN: ${l.wrestlerName} Returns from ${l.partnerName} Excursion!`,
          details: `${l.wrestlerName} has completed an intensive foreign sabbatical in ${l.partnerName}, returning to ${promotion.name} with transformed fighting spirit (+${totalBonus} ${l.targetFocus.toUpperCase()})!`
        });
      } else {
        remainingLoans.push(l);
      }
    });
    updatedForbiddenDoor.loanedRoster = remainingLoans;

    // Process scheduled Forbidden Door Supercards
    fdSupercards.forEach(sc => {
      if (sc.scheduledWeek === currentWeek && !sc.isCompleted) {
        sc.isCompleted = true;
        const ourWins = 4;
        const partnerWins = 3;
        sc.ourScore = ourWins;
        sc.partnerScore = partnerWins;
        sc.attendance = sc.venueCapacity;
        const gross = sc.venueCapacity * sc.ticketPrice;
        sc.grossRevenue = gross;
        const prestigeWon = 5;
        sc.prestigeEarned = prestigeWon;
        currentPrestige = Math.min(100, currentPrestige + prestigeWon);
        totalPrestigeEarnedTonight += prestigeWon;
        updatedForbiddenDoor.totalPrestigeGained = (updatedForbiddenDoor.totalPrestigeGained || 0) + prestigeWon;
        updatedForbiddenDoor.trophiesWon = (updatedForbiddenDoor.trophiesWon || 0) + 1;

        // Add 50% split revenue to budget
        endingBalance += Math.round(gross * 0.5);

        newNews.push({
          id: `news-fd-supercard-${Date.now()}-${sc.id}`,
          week: currentWeek,
          category: 'Promotion',
          importance: 'High',
          headline: `GLOBAL SPECTACLE: ${sc.name} Sells Out ${sc.venue} (${sc.attendance.toLocaleString()} Fans)!`,
          details: `The historic co-promoted supercard saw ${promotion.shortName} defeat ${sc.partnerName} in a thrilling 4-3 series! Gross gate hit $${gross.toLocaleString()} and company prestige surged (+${prestigeWon} pts, now ${currentPrestige}/100)!`
        });
      }
    });
    updatedForbiddenDoor.supercards = fdSupercards;
    updatedForbiddenDoor.partners = fdPartners;
  }

  const financialReport: FinancialReport = {
    week: currentWeek,
    tvRevenue,
    ticketSales,
    merchSales,
    ppvSales,
    wrestlerPayroll: totalPayroll,
    productionCost,
    arenaCost,
    medicalCost,
    netProfit,
    endingBalance
  };

  // 6. Network Satisfaction update
  let satisfactionDelta = 0;
  if (showResult.overallScore >= promotion.minNetworkRating + 8) {
    satisfactionDelta = +3;
  } else if (showResult.overallScore >= promotion.minNetworkRating) {
    satisfactionDelta = +1;
  } else if (showResult.overallScore < promotion.minNetworkRating - 10) {
    satisfactionDelta = -5;
  } else {
    satisfactionDelta = -2;
  }

  const newNetworkSatisfaction = Math.min(100, Math.max(10, promotion.networkSatisfaction + satisfactionDelta));

  // 7. Update Tag Team Records
  const updatedTagTeams = (promotion.tagTeams || []).map(team => {
    let tWins = team.wins;
    let tLosses = team.losses;
    currentShowCard.forEach(seg => {
      if (seg.category === 'Match' && (seg.matchType === 'Tag Team' || seg.matchType === '6-Man Tag')) {
        const teamInMatch = team.memberIds.filter(id => seg.participantIds.includes(id)).length >= 2;
        if (teamInMatch && seg.winnerId) {
          if (team.memberIds.includes(seg.winnerId)) {
            tWins += 1;
          } else {
            tLosses += 1;
          }
        }
      }
    });
    return { ...team, wins: tWins, losses: tLosses };
  });

  // 8. Roll Random Locker Room Incident
  let activeIncidents = [...(promotion.activeIncidents || [])];
  const unresolvedCount = activeIncidents.filter(i => !i.resolved).length;
  if (unresolvedCount < 2 && Math.random() < 0.5 && updatedRoster.length >= 2) {
    const randomIncident = SAMPLE_INCIDENTS_POOL[Math.floor(Math.random() * SAMPLE_INCIDENTS_POOL.length)];
    const shuffled = [...updatedRoster].sort(() => 0.5 - Math.random());
    const involvedIds = [shuffled[0].id, shuffled[1].id];
    const newInc: LockerRoomIncident = {
      id: `incident-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      week: currentWeek,
      title: randomIncident.title,
      description: randomIncident.description.replace('Two top stars', `${shuffled[0].name} and ${shuffled[1].name}`).replace('A key midcarder', shuffled[0].name).replace('A respected veteran', shuffled[0].name),
      involvedWrestlerIds: involvedIds,
      severity: randomIncident.severity,
      resolved: false,
      options: randomIncident.options
    };
    activeIncidents.unshift(newInc);
    newNews.push({
      id: `news-incident-${Date.now()}`,
      week: currentWeek,
      category: 'Wrestler',
      importance: 'Medium',
      headline: `Locker Room Whisper: ${newInc.title}`,
      details: newInc.description
    });
  }

  // 9. Process Active Storyline Arcs Progression
  const updatedStorylineArcs = (promotion.storylineArcs || []).map(arc => {
    if (arc.status === 'Concluded') return arc;

    // Check if any booked segment featured this arc's participants
    const arcFeatured = currentShowCard.some(seg => {
      const hasProtagonist = arc.protagonistIds.some(id => seg.participantIds.includes(id));
      const hasAntagonist = arc.antagonistIds.some(id => seg.participantIds.includes(id));
      return hasProtagonist || hasAntagonist;
    });

    if (arcFeatured) {
      const newIndex = arc.currentMilestoneIndex + 1;
      const isClimaxReached = newIndex >= arc.milestones.length;

      const updatedMilestones = arc.milestones.map((ms, idx) => {
        if (idx === arc.currentMilestoneIndex) {
          return { ...ms, isCompleted: true, completedWeek: currentWeek };
        }
        return ms;
      });

      const newHeat = Math.min(100, arc.heat + Math.floor(Math.random() * 4 + 3));

      return {
        ...arc,
        heat: newHeat,
        momentum: (newHeat >= 85 ? 'White Hot' : newHeat >= 70 ? 'Boiling Hot' : 'Simmering') as StorylineArc['momentum'],
        currentMilestoneIndex: Math.min(newIndex, arc.milestones.length - 1),
        status: isClimaxReached ? ('Climax Ready' as const) : arc.status,
        milestones: updatedMilestones
      };
    } else {
      // If arc had no presence on TV this week, slight heat decay
      const decayedHeat = Math.max(15, arc.heat - 2);
      return {
        ...arc,
        heat: decayedHeat,
        momentum: (decayedHeat <= 40 ? 'Cooling Down' : decayedHeat <= 65 ? 'Simmering' : arc.momentum) as StorylineArc['momentum']
      };
    }
  });

  // Advance week & year
  let nextWeek = currentWeek + 1;
  let nextYear = currentYear;
  if (nextWeek > 52) {
    nextWeek = 1;
    nextYear += 1;
    // Roster members age 1 year on calendar rollover
    updatedRoster.forEach(w => {
      w.age += 1;
    });
  }

  // Preserve and track retired roster
  const updatedRetiredRoster = [...(promotion.retiredRoster || [])];

  // Natural Retirement Evaluation based on retirementAge, age curves, and injury history
  let remainingActiveRoster: Wrestler[] = [];
  updatedRoster.forEach(w => {
    // Superstar was already retired via Farewell Tour culmination on tonight's show
    if (w.isRetired) {
      updatedRetiredRoster.unshift(w);
      return;
    }

    // Active Farewell Tour participants never retire abruptly midway through their tour
    if (w.farewellTour && w.farewellTour.isActive) {
      remainingActiveRoster.push(w);
      return;
    }

    const isChampion = updatedTitles.some(t => t.currentHolderIds.includes(w.id));
    const targetRetireAge = w.retirementAge || (w.style === 'High Flyer' ? 40 : w.style === 'Hardcore' ? 41 : w.style === 'Powerhouse' ? 45 : 44);
    const injuries = w.careerInjuriesCount || 0;

    // Probability curve based on age vs planned retirement age + injury toll
    let retireChance = 0;
    if (w.age >= targetRetireAge + 2) {
      retireChance = 0.30; // 2+ years past planned retirement
    } else if (w.age >= targetRetireAge) {
      retireChance = 0.15 + (injuries >= 3 ? 0.10 : 0); // At or past planned retirement
    } else if (w.age >= targetRetireAge - 1 && injuries >= 3) {
      retireChance = 0.08; // 1 year away with 3+ major career injuries
    } else if (injuries >= 5 && w.age >= 36) {
      retireChance = 0.06; // Significant wear-and-tear
    }

    // Champions usually hold out to drop the gold, unless far past retirement age
    if (isChampion && w.age < targetRetireAge + 1) {
      retireChance = 0;
    }

    const wantsToRetire = Math.random() < retireChance;

    if (wantsToRetire) {
      // Craft retirement reason reflecting age and injury toll
      let retirementReason = `Reached planned retirement age of ${w.age} after a decorated career.`;
      if (injuries >= 3) {
        retirementReason = `Physical wear-and-tear after ${injuries} major career injuries, stepping away at age ${w.age}.`;
      } else if (w.age >= targetRetireAge) {
        retirementReason = `Fulfilled planned retirement milestone (age ${w.age}) to pass the torch to future stars.`;
      }

      // If active champion, vacate the title cleanly using the automatic vacancy handler
      if (isChampion) {
        const retireVacancy = handleAutomaticTitleVacancyForWrestler(
          w,
          updatedTitles,
          remainingActiveRoster,
          currentWeek,
          'retirement',
          { currentYear, promotionName: promotion.name }
        );
        if (retireVacancy.vacatedTitlesCount > 0) {
          updatedTitles = retireVacancy.updatedTitles;
          newNews.push(...retireVacancy.newNews);
        }
      }

      // Evaluate Hall of Fame Scorecard and Induction Opportunity
      const scorecard = calculateHallOfFameScorecard(w, updatedTitles);
      const isHofEligible = scorecard.overallScore >= 45 || scorecard.eligibilityTier !== 'Not Yet Eligible';

      const retiredWrestler: Wrestler = {
        ...w,
        isRetired: true,
        retiredWeek: currentWeek,
        retiredYear: currentYear,
        retirementReason,
        salary: 0,
        contractWeeks: 0,
        careerWeeksInSimulator: w.careerWeeksInSimulator || Math.max(30, (w.age - 20) * 12),
        peakOverness: Math.max(w.overness, w.peakOverness || w.overness),
        hofNominationPending: isHofEligible
      };

      updatedRetiredRoster.unshift(retiredWrestler);

      if (isHofEligible) {
        newNews.push({
          id: `news-hof-opportunity-${Date.now()}-${w.id}`,
          week: currentWeek,
          category: 'Promotion',
          importance: 'High',
          headline: `HALL OF FAME INDUCTION OPPORTUNITY: ${w.name} Retires with Hall of Fame Pedigree!`,
          details: `After an iconic career of ${w.wins} wins, ${injuries} injuries, and ${retiredWrestler.careerWeeksInSimulator} weeks in the simulator, ${w.name} (age ${w.age}) has retired (${retirementReason}). Boasting an overall HOF rating of ${scorecard.overallScore}/100 (${scorecard.eligibilityTier}), a nomination opportunity is now active in the Hall of Fame!`
        });
      } else {
        newNews.push({
          id: `news-natural-retire-${Date.now()}-${w.id}`,
          week: currentWeek,
          category: 'Wrestler',
          importance: 'Medium',
          headline: `RETIREMENT: Veteran ${w.name} Officially Hangs Up the Boots!`,
          details: `After logging ${w.wins} career victories, ${w.name} (age ${w.age}, ${injuries} career injuries) announced their retirement (${retirementReason}) and has moved to the Retired Legends Wing.`
        });
      }
    } else {
      remainingActiveRoster.push(w);
    }
  });

  // 9.4 Automatic Title Vacancy check for any newly retired superstars or champions injured > 4 weeks
  const postRetirementVacancy = handleAutomaticTitleVacancy(
    updatedTitles,
    remainingActiveRoster,
    currentWeek,
    {
      currentYear,
      promotionName: promotion.name,
      injuryThresholdWeeks: 4,
      retiredRoster: updatedRetiredRoster
    }
  );
  if (postRetirementVacancy.vacatedTitlesCount > 0) {
    updatedTitles = postRetirementVacancy.updatedTitles;
    remainingActiveRoster = postRetirementVacancy.updatedRoster;
    newNews.push(...postRetirementVacancy.newNews);
  }

  // Evaluate GM post-show progression
  let updatedGM = promotion.currentGM;
  if (promotion.currentGM) {
    const debrief = generateGMPostShowDebrief(showResult, promotion.currentGM, true);
    if (debrief.updatedGM) {
      updatedGM = debrief.updatedGM;
    }
  }

  // 9.5 Backstage Politics, Cliques, Bidding Wars & Wrestler's Court Engine
  // A. Backstage Cliques Processing
  let updatedCliques: BackstageClique[] = (promotion.backstageCliques && promotion.backstageCliques.length > 0)
    ? promotion.backstageCliques.map(c => ({ ...c }))
    : getDefaultCliquesForPromotion(promotion).map(c => ({ ...c }));

  updatedCliques = updatedCliques.map(clique => {
    const leader = remainingActiveRoster.find(w => w.id === clique.leaderId);
    const members = remainingActiveRoster.filter(w => clique.memberIds.includes(w.id));
    if (members.length === 0) return clique;

    const bookedMembers = members.filter(m => currentShowCard.some(seg => seg.participantIds.includes(m.id)));
    const mainEventSeg = currentShowCard[currentShowCard.length - 1];
    const isMemberInMainEvent = mainEventSeg && members.some(m => mainEventSeg.participantIds.includes(m.id));

    let influenceDelta = 0;
    let memberMoraleDelta = 0;

    if (clique.agendaType === 'Title Chasers') {
      if (isMemberInMainEvent) {
        influenceDelta += 2;
        memberMoraleDelta += 4;
        if (clique.currentDemand && !clique.currentDemand.isSatisfied) {
          clique.currentDemand = { ...clique.currentDemand, isSatisfied: true };
          newNews.push({
            id: `news-clique-demand-met-${Date.now()}-${clique.id}`,
            week: currentWeek,
            category: 'Wrestler',
            importance: 'Medium',
            headline: `BACKSTAGE CONCESSION: "${clique.name}" Satisfied with Main Event Booking!`,
            details: `Following the main event spotlight on tonight's broadcast, members of "${clique.name}" are praising management's booking vision.`
          });
        }
      } else if (bookedMembers.length === 0) {
        influenceDelta -= 1;
        memberMoraleDelta -= 3;
      }
    } else if (clique.agendaType === 'Creative Autonomy') {
      const highRatedMemberMatches = (showResult.segmentEvaluations || []).filter(evalItem => 
        evalItem.score >= 80 && 
        evalItem.segment.category === 'Match' && 
        members.some(m => evalItem.segment.participantIds.includes(m.id))
      );
      if (highRatedMemberMatches.length > 0) {
        influenceDelta += 2;
        memberMoraleDelta += 5;
      }
    } else if (clique.agendaType === 'Company Loyalists') {
      if (showResult.overallScore >= 75) {
        influenceDelta += 1;
        memberMoraleDelta += 3;
      }
    }

    if (memberMoraleDelta !== 0) {
      remainingActiveRoster.forEach(w => {
        if (clique.memberIds.includes(w.id)) {
          w.morale = Math.max(10, Math.min(100, w.morale + memberMoraleDelta));
        }
      });
    }

    // Dynamic political demands or consequences
    if (!clique.currentDemand && clique.influence >= 75 && Math.random() < 0.20 && members.length >= 2) {
      const topStar = [...members].sort((a, b) => b.overness - a.overness)[0];
      clique.currentDemand = {
        id: `demand-${Date.now()}-${clique.id}`,
        description: `Demands that ${topStar.name} or a fellow clique member is booked in the main event or title picture within 3 weeks.`,
        targetWrestlerId: topStar.id,
        deadlineWeek: currentWeek + 3,
        penaltyText: `-15 Morale for all ${clique.name} members and threat of locker room walkout.`
      };

      newNews.push({
        id: `news-clique-ultimatum-${Date.now()}-${clique.id}`,
        week: currentWeek,
        category: 'Wrestler',
        importance: 'High',
        headline: `BACKSTAGE POWER PLAY: "${clique.name}" Demands Main Event Push!`,
        details: `Backstage sources report that "${clique.name}" (led by ${leader?.name || 'Veterans'}) is flexing political clout behind the curtain, demanding marquee placement for ${topStar.name}. Review demands in Locker Room Politics!`
      });
    } else if (clique.currentDemand && !clique.currentDemand.isSatisfied && currentWeek >= clique.currentDemand.deadlineWeek) {
      remainingActiveRoster.forEach(w => {
        if (clique.memberIds.includes(w.id)) {
          w.morale = Math.max(10, w.morale - 12);
        }
      });
      clique.influence = Math.max(10, clique.influence - 10);
      newNews.push({
        id: `news-clique-friction-${Date.now()}-${clique.id}`,
        week: currentWeek,
        category: 'Wrestler',
        importance: 'High',
        headline: `LOCKER ROOM DISCONTENT: "${clique.name}" Furious Over Ignored Demands!`,
        details: `Having their booking demands ignored, members of "${clique.name}" suffered severe morale hits (-12 Morale) and were heard openly airing grievances in catering.`
      });
      clique.currentDemand = undefined;
    }

    return {
      ...clique,
      influence: Math.max(10, Math.min(100, clique.influence + influenceDelta))
    };
  });

  // B. Process Contract Bidding Wars & Impending Free Agency
  let activeBiddingWars: ContractBiddingWar[] = (promotion.activeBiddingWars || []).map(bw => ({ ...bw }));
  let resolvedBiddingWars: ContractBiddingWar[] = (promotion.resolvedBiddingWars || []).map(bw => ({ ...bw }));

  // Check for newly expiring stars (contracts <= 6 weeks)
  const expiringStars = remainingActiveRoster.filter(w => 
    w.contractWeeks <= 6 && 
    w.contractWeeks > 0 && 
    w.push !== 'Jobber' && 
    !activeBiddingWars.some(bw => bw.wrestlerId === w.id) &&
    !w.isRetired &&
    !w.isGuestStar
  );

  expiringStars.forEach(w => {
    if (w.contractWeeks <= 3 || Math.random() < 0.35) {
      const newWar = generateBiddingWarForWrestler(w, currentWeek, promotion);
      activeBiddingWars.push(newWar);

      newNews.push({
        id: `news-bidding-start-${Date.now()}-${w.id}`,
        week: currentWeek,
        category: 'Wrestler',
        importance: 'High',
        headline: `BIDDING WAR ERUPTS: Rivals Target ${w.name} (${w.contractWeeks} Wks Remaining)!`,
        details: `Rival promotions have entered aggressive multi-year contract bids for ${w.name}! Leading bidder: ${newWar.leadingBidderName}. Counter-offer in the Locker Room before the deadline!`
      });
    }
  });

  // Advance and Resolve Active Bidding Wars
  let remainingActiveWars: ContractBiddingWar[] = [];
  activeBiddingWars.forEach(war => {
    const wrestler = remainingActiveRoster.find(w => w.id === war.wrestlerId);
    if (!wrestler) return;

    if (currentWeek >= war.deadlineWeek || wrestler.contractWeeks <= 0) {
      const decision = evaluateWrestlerBiddingDecision(war, promotion);

      if (decision.isPlayerWinner) {
        const winningBid = decision.winnerBid;
        wrestler.salary = winningBid.weeklySalary;
        wrestler.contractWeeks = (wrestler.contractWeeks || 0) + winningBid.contractWeeks;
        wrestler.morale = Math.min(100, wrestler.morale + 15);
        wrestler.creativeControlClause = !!winningBid.perks.creativeControl;
        wrestler.limitedScheduleClause = !!winningBid.perks.limitedSchedule;

        endingBalance = Math.max(0, endingBalance - winningBid.signingBonus);

        resolvedBiddingWars.unshift({
          ...war,
          status: 'Re-Signed',
          decisionNotes: decision.decisionSummary
        });

        newNews.push({
          id: `news-resign-success-${Date.now()}-${wrestler.id}`,
          week: currentWeek,
          category: 'Wrestler',
          importance: 'High',
          headline: `CONTRACT EXTENSION: ${wrestler.name} Re-Signs with ${promotion.name}!`,
          details: decision.decisionSummary
        });
      } else {
        // Superstar defects to rival promotion!
        remainingActiveRoster = remainingActiveRoster.filter(w => w.id !== wrestler.id);

        updatedTitles.forEach(t => {
          if (t.currentHolderIds.includes(wrestler.id)) {
            t.currentHolderIds = t.currentHolderIds.filter(id => id !== wrestler.id);
            if (t.history && t.history.length > 0 && !t.history[0].lostWeek) {
              t.history[0].lostWeek = currentWeek;
              t.history[0].lostYear = currentYear;
              t.history[0].isCurrent = false;
              t.history[0].notes = `${t.history[0].notes || ''} (Vacated upon contract defection)`;
            }
            newNews.push({
              id: `news-defection-vacate-${Date.now()}-${t.id}`,
              week: currentWeek,
              category: 'Promotion',
              importance: 'High',
              headline: `TITLE VACATED: ${t.name} Vacated as ${wrestler.name} Defects!`,
              details: `Following their defection to ${decision.winnerBid.bidderName}, ${wrestler.name} has relinquished the ${t.name}!`
            });
          }
        });

        resolvedBiddingWars.unshift({
          ...war,
          status: 'Defected',
          decisionNotes: decision.decisionSummary
        });

        newNews.push({
          id: `news-defection-loss-${Date.now()}-${wrestler.id}`,
          week: currentWeek,
          category: 'Rival',
          importance: 'High',
          headline: `🚨 DEFECTION BOMBSHELL: ${wrestler.name} Jumps Ship to ${decision.winnerBid.bidderName}!`,
          details: decision.decisionSummary
        });
      }
    } else {
      if (war.status === 'Player Countered' && Math.random() < 0.25) {
        const rivalBid = war.bids.find(b => b.bidderType !== 'Player');
        if (rivalBid) {
          rivalBid.weeklySalary += 1000;
          rivalBid.signingBonus += 10000;
          rivalBid.totalValueScore += 25;
          const newLeading = [...war.bids].sort((a, b) => b.totalValueScore - a.totalValueScore)[0];
          war.leadingBidderName = newLeading.bidderName;

          newNews.push({
            id: `news-bid-escalate-${Date.now()}-${war.id}`,
            week: currentWeek,
            category: 'Rival',
            importance: 'Medium',
            headline: `BIDDING ESCALATION: ${rivalBid.bidderName} Increases Offer for ${war.wrestlerName}!`,
            details: `${rivalBid.bidderName} has sweetened their contract package to $${rivalBid.weeklySalary}/wk with a $${rivalBid.signingBonus.toLocaleString()} bonus. Head to Locker Room Politics to counter!`
          });
        }
      }
      remainingActiveWars.push(war);
    }
  });

  // C. Process Wrestler's Court Trials
  let updatedCourtCases: WrestlerCourtCase[] = (promotion.wrestlerCourtCases || []).map(c => ({ ...c }));
  let updatedResolvedCourtCases: WrestlerCourtCase[] = (promotion.resolvedCourtCases || []).map(c => ({ ...c }));

  if (updatedCourtCases.length === 0 && remainingActiveRoster.length >= 4 && Math.random() < 0.12) {
    const shuffled = [...remainingActiveRoster].sort(() => 0.5 - Math.random());
    const defendant = shuffled[0];
    const plaintiff = shuffled[1];
    const judge = [...remainingActiveRoster].filter(w => w.id !== defendant.id && w.id !== plaintiff.id).sort((a, b) => b.age - a.age)[0] || shuffled[2];
    const template = SAMPLE_WRESTLER_COURT_CASES[Math.floor(Math.random() * SAMPLE_WRESTLER_COURT_CASES.length)];

    const newCase: WrestlerCourtCase = {
      id: `court-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      week: currentWeek,
      title: template.title,
      defendantId: defendant.id,
      plaintiffId: plaintiff.id,
      judgeId: judge.id,
      charge: template.charge,
      plea: template.plea,
      sentencingOptions: template.sentencingOptions,
      resolved: false
    };

    updatedCourtCases.push(newCase);
    newNews.push({
      id: `news-court-convened-${Date.now()}`,
      week: currentWeek,
      category: 'Wrestler',
      importance: 'Medium',
      headline: `GAVEL BANGED: Wrestler's Court Convened: ${plaintiff.name} vs. ${defendant.name}!`,
      details: `Presiding judge ${judge.name} has convened Wrestler's Court over allegations of: "${template.charge}". Adjudicate sentences in the Locker Room Suite!`
    });
  }

  const updatedGMHistory = promotion.currentGM ? [
    {
      week: currentWeek,
      year: currentYear,
      gmName: promotion.currentGM.name,
      rating: showResult.overallScore,
      wasApprovedAsIs: true,
      headline: `${promotion.weeklyTVShow} scored ${showResult.overallScore}/100 under GM ${promotion.currentGM.name}`
    },
    ...(promotion.gmHistory || [])
  ] : (promotion.gmHistory || []);

  // 10. Process Tournament Matches booked on Tonight's show
  // Automatically detects if any matches in showResult / currentShowCard belong to an active tournament,
  // and updates that tournament's bracket state, advancement, standings, and completed match history accordingly.
  let updatedTournaments = [...(promotion.tournaments || [])];
  let updatedCompletedTournaments = [...(promotion.completedTournaments || [])];
  const processedTournamentMatchIds = new Set<string>();

  currentShowCard.forEach(seg => {
    if (seg.category !== 'Match') return;

    let tourney: Tournament | undefined;
    let targetMatch: TournamentMatch | undefined;
    let tourneyIdx = -1;

    // 1. Explicit link via tournamentId and tournamentMatchId
    if (seg.tournamentId) {
      tourneyIdx = updatedTournaments.findIndex(t => t.id === seg.tournamentId);
      if (tourneyIdx !== -1) {
        tourney = updatedTournaments[tourneyIdx];
        if (seg.tournamentMatchId) {
          targetMatch = tourney.matches.find(m => m.id === seg.tournamentMatchId && !m.completed);
        }
        if (!targetMatch && seg.participantIds.length >= 2) {
          targetMatch = tourney.matches.find(m => 
            !m.completed && 
            m.wrestler1Id && 
            m.wrestler2Id && 
            seg.participantIds.includes(m.wrestler1Id) && 
            seg.participantIds.includes(m.wrestler2Id)
          );
        }
      }
    }

    // 2. Automatic detection across all active tournaments by participants
    if (!targetMatch && seg.participantIds.length >= 2) {
      for (let tIndex = 0; tIndex < updatedTournaments.length; tIndex++) {
        const candidateTourney = updatedTournaments[tIndex];
        if (candidateTourney.status === 'completed') continue;

        const candidateMatch = candidateTourney.matches.find(m => 
          !m.completed && 
          m.wrestler1Id && 
          m.wrestler2Id && 
          seg.participantIds.includes(m.wrestler1Id) && 
          seg.participantIds.includes(m.wrestler2Id)
        );

        if (candidateMatch) {
          tourney = candidateTourney;
          tourneyIdx = tIndex;
          targetMatch = candidateMatch;
          break;
        }
      }
    }

    // If match found and not already processed this broadcast
    if (tourney && targetMatch && !targetMatch.completed && !processedTournamentMatchIds.has(targetMatch.id)) {
      processedTournamentMatchIds.add(targetMatch.id);

      const w1Id = targetMatch.wrestler1Id!;
      const w2Id = targetMatch.wrestler2Id!;

      let winnerId = seg.winnerId;
      let loserId: string | undefined;
      let isDraw = false;

      if (winnerId && (winnerId === w1Id || winnerId === w2Id)) {
        loserId = winnerId === w1Id ? w2Id : w1Id;
      } else {
        // Fallback: If booker left winner unpicked, simulate realistic outcome
        const w1Obj = remainingActiveRoster.find(w => w.id === w1Id) || promotion.roster.find(w => w.id === w1Id);
        const w2Obj = remainingActiveRoster.find(w => w.id === w2Id) || promotion.roster.find(w => w.id === w2Id);
        if (w1Obj && w2Obj) {
          const outcome = simulateTournamentMatchOutcome(w1Obj, w2Obj, targetMatch.roundName);
          winnerId = outcome.winnerId;
          loserId = outcome.loserId;
          isDraw = outcome.isDraw;
          if (!seg.finishType) seg.finishType = outcome.finishType;
        } else {
          winnerId = w1Id;
          loserId = w2Id;
        }
        seg.winnerId = winnerId;
      }

      const evalSeg = showResult.segmentEvaluations.find(e => e.segment.id === seg.id);
      const stars = evalSeg?.starString || '★★★';
      const score = evalSeg?.score || 75;
      const finish = seg.finishType || 'Clean Pinfall';

      const winnerWrestler = remainingActiveRoster.find(w => w.id === winnerId);
      const loserWrestler = remainingActiveRoster.find(w => w.id === loserId);
      const winnerName = winnerWrestler ? winnerWrestler.name : 'The winner';
      const loserName = loserWrestler ? loserWrestler.name : 'the challenger';

      const recap = evalSeg?.recap || `${winnerName} defeated ${loserName} via ${finish} in a dramatic ${targetMatch.roundName} encounter to advance in the ${tourney.name}.`;

      // Resolve match in the tournament (advances bracket, updates standings & unlocks finals)
      const resolvedTourney = resolveTournamentMatch(
        tourney,
        targetMatch.id,
        winnerId,
        loserId,
        isDraw,
        stars,
        score,
        finish,
        recap,
        currentWeek,
        currentYear
      );

      // Check if this victory completed the tournament!
      if (resolvedTourney.status === 'completed') {
        const result = applyTournamentCompletionEffects(
          resolvedTourney,
          {
            ...promotion,
            roster: remainingActiveRoster,
            titles: updatedTitles,
            tournaments: updatedTournaments,
            completedTournaments: updatedCompletedTournaments
          },
          currentWeek,
          currentYear
        );
        remainingActiveRoster = result.updatedPromotion.roster;
        updatedTitles = result.updatedPromotion.titles;
        updatedTournaments = result.updatedPromotion.tournaments || [];
        updatedCompletedTournaments = result.updatedPromotion.completedTournaments || [];
        newNews.push(result.newsItem);
      } else {
        // Tournament continues - update active list and publish advancement news
        updatedTournaments[tourneyIdx] = resolvedTourney;

        newNews.push({
          id: `news-tourn-adv-${Date.now()}-${targetMatch.id}`,
          week: currentWeek,
          category: 'Promotion',
          importance: 'Medium',
          headline: `🏆 TOURNAMENT ADVANCEMENT: ${winnerName} advances in the ${tourney.name}!`,
          details: `In a ${targetMatch.roundName} contest rated ${stars} on ${promotion.weeklyTVShow}, ${winnerName} defeated ${loserName} via ${finish} and advanced to the next stage of the ${tourney.name}.`
        });
      }
    }
  });

  // 11. Process Developmental Territory Progression & Learning Excursions
  let updatedDevelopmental = promotion.developmentalTerritory;
  if (updatedDevelopmental) {
    const focus = updatedDevelopmental.focusArea || 'balanced';
    const coachBonus = updatedDevelopmental.headCoachId ? 1 : 0;
    const devLogs = [...(updatedDevelopmental.historyLogs || [])];
    const devTraineeIds = [...updatedDevelopmental.traineeIds];
    let devExcursions = [...updatedDevelopmental.excursions];

    // A. Train active trainees weekly
    remainingActiveRoster = remainingActiveRoster.map(w => {
      if (devTraineeIds.includes(w.id)) {
        let workrateGain = 0;
        let micGain = 0;
        let staminaGain = 0;
        let overnessGain = 0;

        if (focus === 'workrate_drills') {
          workrateGain = Math.floor(Math.random() * 2) + 1 + coachBonus;
          staminaGain = 1;
        } else if (focus === 'promo_classes') {
          micGain = Math.floor(Math.random() * 2) + 1 + coachBonus;
          overnessGain = 1;
        } else if (focus === 'stamina_conditioning') {
          staminaGain = Math.floor(Math.random() * 2) + 2;
          workrateGain = 1;
        } else if (focus === 'character_refinement') {
          overnessGain = Math.floor(Math.random() * 2) + 1;
          micGain = 1;
        } else {
          // balanced
          workrateGain = 1;
          micGain = 1;
          staminaGain = 1;
        }

        const newWorkrate = Math.min(100, w.workrate + workrateGain);
        const newMic = Math.min(100, w.micSkills + micGain);
        const newStamina = Math.min(100, w.stamina + staminaGain);
        const newOverness = Math.min(100, w.overness + overnessGain);

        // Scouting report alert if prospect crosses 72 workrate
        if (newWorkrate >= 72 && w.workrate < 72 && Math.random() < 0.6) {
          newNews.push({
            id: `news-dev-ready-${Date.now()}-${w.id}`,
            week: currentWeek,
            category: 'Wrestler',
            importance: 'Medium',
            headline: `SCOUTING REPORT: ${w.name} Dominating at ${updatedDevelopmental?.name}`,
            details: `Internal reports confirm ${w.name} (Workrate ${newWorkrate}, Age ${w.age}) has excelled in developmental training drills and is primed for an impactful main roster call-up!`
          });
        }

        return {
          ...w,
          workrate: newWorkrate,
          micSkills: newMic,
          stamina: newStamina,
          overness: newOverness,
          fatigue: 0 // developmental talent doesn't suffer TV road fatigue
        };
      }
      return w;
    });

    // B. Process ongoing excursions
    const completedExcursions: string[] = [];
    devExcursions = devExcursions.map(exc => {
      const nextRemaining = exc.weeksRemaining - 1;
      if (nextRemaining <= 0) {
        completedExcursions.push(exc.id);
        const bonusSkill = exc.targetSkill;
        const bonusAmt = Math.round(exc.totalWeeks * 0.7);

        remainingActiveRoster = remainingActiveRoster.map(w => {
          if (w.id === exc.wrestlerId) {
            return {
              ...w,
              excursion: undefined,
              overness: Math.min(100, w.overness + 4),
              [bonusSkill]: Math.min(100, ((w[bonusSkill] as number) || 50) + bonusAmt)
            };
          }
          return w;
        });

        devTraineeIds.push(exc.wrestlerId);

        devLogs.unshift({
          id: `log-return-${Date.now()}-${exc.id}`,
          week: currentWeek,
          year: currentYear,
          wrestlerName: exc.wrestlerName,
          type: 'excursion_return',
          headline: `EXCURSION COMPLETE: ${exc.wrestlerName} Returns from ${exc.destination}`,
          details: `Completed ${exc.totalWeeks}-week international excursion. Rejoining developmental ranks with +${bonusAmt} ${bonusSkill} and enhanced in-ring psychology!`
        });

        newNews.push({
          id: `news-exc-return-${Date.now()}-${exc.id}`,
          week: currentWeek,
          category: 'Industry',
          importance: 'High',
          headline: `INTERNATIONAL RETURN: ${exc.wrestlerName} Returns from ${exc.destination}!`,
          details: `After ${exc.totalWeeks} rigorous weeks competing abroad in ${exc.destination}, ${exc.wrestlerName} has returned with devastating new ring psychology and a refined arsenal (+${bonusAmt} ${bonusSkill})!`
        });
      }
      return { ...exc, weeksRemaining: Math.max(0, nextRemaining) };
    }).filter(e => !completedExcursions.includes(e.id));

    updatedDevelopmental = {
      ...updatedDevelopmental,
      traineeIds: devTraineeIds,
      excursions: devExcursions,
      historyLogs: devLogs
    };
  }

  // 12. Process Dual Brand Split Weekly Ratings & Supremacy Battle
  let updatedBrandSplit = promotion.brandSplit;
  if (updatedBrandSplit?.isEnabled && updatedBrandSplit.brands.length >= 2) {
    const b1 = updatedBrandSplit.brands[0];
    const b2 = updatedBrandSplit.brands[1];

    const b1Score = Math.min(100, Math.max(65, Math.round(showResult.overallScore + (Math.random() * 6 - 3))));
    const b2Score = Math.min(100, Math.max(65, Math.round(showResult.overallScore + (Math.random() * 8 - 4))));

    const b1Wins = b1Score >= b2Score;
    const newB1WinsCount = (b1.weeklyShowWins || 0) + (b1Wins ? 1 : 0);
    const newB2WinsCount = (b2.weeklyShowWins || 0) + (!b1Wins ? 1 : 0);

    const updatedBrands = [
      {
        ...b1,
        averageRating: Math.round(((b1.averageRating * 3) + b1Score) / 4),
        ratingsHistory: [b1Score, ...(b1.ratingsHistory || []).slice(0, 7)],
        weeklyShowWins: newB1WinsCount
      },
      {
        ...b2,
        averageRating: Math.round(((b2.averageRating * 3) + b2Score) / 4),
        ratingsHistory: [b2Score, ...(b2.ratingsHistory || []).slice(0, 7)],
        weeklyShowWins: newB2WinsCount
      }
    ];

    const leaderId = newB1WinsCount >= newB2WinsCount ? b1.id : b2.id;
    updatedBrandSplit = {
      ...updatedBrandSplit,
      brands: updatedBrands,
      supremacyLeaderBrandId: leaderId
    };

    if (Math.random() < 0.4) {
      const winnerBrand = b1Wins ? b1 : b2;
      const loserBrand = b1Wins ? b2 : b1;
      newNews.push({
        id: `news-brand-war-${Date.now()}`,
        week: currentWeek,
        category: 'Promotion',
        importance: 'Medium',
        headline: `BRAND RATINGS WAR: ${winnerBrand.name} Tops ${loserBrand.name} This Week!`,
        details: `${winnerBrand.name} drew higher prime-time demographic ratings over rival brand ${loserBrand.name}. The competition for brand supremacy remains white-hot!`
      });
    }
  }

  // Attach show results metadata for prestige & farewell tour
  showResult.companyPrestigeEarned = totalPrestigeEarnedTonight;
  showResult.farewellTourHighlights = farewellHighlights;

  const updatedPromotion: Promotion = {
    ...promotion,
    prestige: Math.min(100, Math.max(10, currentPrestige)),
    budget: endingBalance,
    networkSatisfaction: newNetworkSatisfaction,
    roster: remainingActiveRoster,
    titles: updatedTitles,
    feuds: updatedFeuds,
    tagTeams: updatedTagTeams,
    factions: promotion.factions || [],
    ppvSchedule: promotion.ppvSchedule || DEFAULT_PPV_CALENDAR,
    customMatchRules: promotion.customMatchRules || DEFAULT_CUSTOM_MATCH_RULES,
    activeIncidents,
    resolvedIncidents: promotion.resolvedIncidents || [],
    lockerRoomRule: promotion.lockerRoomRule || 'Balanced Professionalism',
    storylineArcs: updatedStorylineArcs,
    creativeNotes: promotion.creativeNotes || [],
    creativePhilosophy: promotion.creativePhilosophy || 'Sports Entertainment Spectacle',
    hallOfFame: promotion.hallOfFame || [],
    retiredRoster: updatedRetiredRoster,
    tournaments: updatedTournaments,
    completedTournaments: updatedCompletedTournaments,
    developmentalTerritory: updatedDevelopmental,
    brandSplit: updatedBrandSplit,
    currentGM: updatedGM,
    availableGMs: promotion.availableGMs,
    pendingGMProposal: undefined,
    gmHistory: updatedGMHistory,
    forbiddenDoor: updatedForbiddenDoor,
    backstageCliques: updatedCliques,
    activeBiddingWars: remainingActiveWars,
    resolvedBiddingWars,
    wrestlerCourtCases: updatedCourtCases,
    resolvedCourtCases: updatedResolvedCourtCases
  };

  return {
    updatedPromotion,
    updatedFreeAgents: freeAgents,
    financialReport,
    newNews,
    nextWeek,
    nextYear
  };
}

/**
 * Automatically creates a balanced 5-segment television card
 * powered by the intelligent GM matchmaking engine.
 * Guarantees:
 * 1. Zero character reuse across segments.
 * 2. High roster utilization across divisions.
 * 3. Strict gender segregation for Men's and Women's championships.
 */
export function autoGenerateShowCard(promotion: Promotion, currentWeek: number = 1, currentYear: number = 2026): Segment[] {
  const proposal = generateGMProposal(
    promotion, 
    promotion.currentGM?.activeDirective || 'balanced', 
    currentWeek, 
    currentYear
  );
  return proposal.segments;
}


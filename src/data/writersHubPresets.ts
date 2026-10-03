import { 
  FinishType, 
  MatchType, 
  AngleType, 
  Wrestler, 
  CreativePhilosophy,
  Segment,
  Promotion
} from '../types';

export interface PlotTwistDefinition {
  id: string;
  name: string;
  category: 'Betrayal' | 'Interference' | 'Stipulation' | 'Authority' | 'Contract' | 'Injury' | 'Invasion';
  heatBonus: number;
  icon: string;
  tagline: string;
  description: string;
  milestoneTitle: string;
  milestoneCategory: 'Match' | 'Angle';
  milestoneSegmentType: MatchType | AngleType;
  suggestedFinish?: FinishType;
  crowdPop: 'Deafening Pop' | 'Nuclear Heat' | 'Shocked Silence' | 'Chants of Holy Shit';
}

export const PLOT_TWIST_CATALOG: PlotTwistDefinition[] = [
  {
    id: 'pt-betrayal',
    name: 'Shocking Turncoat / Steel Chair Betrayal',
    category: 'Betrayal',
    heatBonus: 15,
    icon: '⚡',
    tagline: 'A beloved ally or tag team partner delivers a vicious backstab.',
    description: 'Just as the hero is celebrating or on the verge of victory, their closest confidant swings a steel chair into their spine, joining forces with the rival in a seismic double-cross.',
    milestoneTitle: 'The Steel Chair Betrayal & Rupture',
    milestoneCategory: 'Angle',
    milestoneSegmentType: 'Faction War / Gang Attack',
    crowdPop: 'Nuclear Heat'
  },
  {
    id: 'pt-mystery-attacker',
    name: 'Masked Assailant / Backstage Ambush',
    category: 'Interference',
    heatBonus: 12,
    icon: '🎭',
    tagline: 'A hooded assailant wrecks the locker room and leaves a chilling message.',
    description: 'A shadowy figure brutally assaults the superstar in the parking lot or locker room, leaving behind cryptic symbols and sending the locker room into paranoia.',
    milestoneTitle: 'Whodunit? Backstage Carnage & Cryptic Threat',
    milestoneCategory: 'Angle',
    milestoneSegmentType: 'Backstage Ambush',
    crowdPop: 'Shocked Silence'
  },
  {
    id: 'pt-hell-in-a-cell',
    name: 'Authority Mandate: Hell in a Cell / Steel Cage Escalation',
    category: 'Stipulation',
    heatBonus: 14,
    icon: '⛓️',
    tagline: 'Bad blood boils over; the GM locks both warriors inside a steel structure.',
    description: 'After multiple pull-apart brawls tear the arena apart, the General Manager decrees that this blood feud can only be settled inside 15 feet of unforgiving steel.',
    milestoneTitle: 'Locked Inside Steel: The Unforgiving War',
    milestoneCategory: 'Match',
    milestoneSegmentType: 'Steel Cage',
    suggestedFinish: 'Clean Pinfall',
    crowdPop: 'Chants of Holy Shit'
  },
  {
    id: 'pt-screwjob',
    name: 'Corrupt Official / Fast-Count Screwjob',
    category: 'Authority',
    heatBonus: 16,
    icon: '⚖️',
    tagline: 'A referee on the take fast-counts the challenger out of their destiny.',
    description: 'The hero had the match won, but the handpicked referee dropped a blindingly fast 3-count while ignoring the champion’s foot clearly draped over the bottom rope.',
    milestoneTitle: 'Robbery Under the Lights: The Corrupt 3-Count',
    milestoneCategory: 'Match',
    milestoneSegmentType: 'Singles',
    suggestedFinish: 'Heel Turn / Screwjob',
    crowdPop: 'Nuclear Heat'
  },
  {
    id: 'pt-contract-hijack',
    name: 'Guaranteed Contract Cash-In / Hijack Threat',
    category: 'Contract',
    heatBonus: 11,
    icon: '📜',
    tagline: 'A predatory third party lurks with a guaranteed title contract in hand.',
    description: 'During a grueling face-to-face confrontation, the contract-holder walks to the stage with briefcase aloft, taunting that they will pick the bones of whichever star survives.',
    milestoneTitle: 'The Shadow of the Contract: Looming Disaster',
    milestoneCategory: 'Angle',
    milestoneSegmentType: 'In-Ring Promo',
    crowdPop: 'Deafening Pop'
  },
  {
    id: 'pt-ambulance-return',
    name: 'Ambulance Evacuation & The Vengeful Return',
    category: 'Injury',
    heatBonus: 14,
    icon: '🚑',
    tagline: 'Wrestler hauled out on a stretcher, only to crash the arena for revenge.',
    description: 'Hospitalized weeks ago in a savage beatdown, the injured warrior emerges from an ambulance with taped ribs and a sledgehammer to exact righteous retribution.',
    milestoneTitle: 'The Sirens Wail: Defiant Vengeance Return',
    milestoneCategory: 'Angle',
    milestoneSegmentType: 'Backstage Ambush',
    crowdPop: 'Deafening Pop'
  },
  {
    id: 'pt-forbidden-invader',
    name: 'Forbidden Door Interpromotional Hitman',
    category: 'Invasion',
    heatBonus: 13,
    icon: '🌐',
    tagline: 'An international foreign champion arrives to claim domestic gold.',
    description: 'A decorated champion from an overseas partner promotion jumps the guardrail, destroying the hero and raising their own championship high above their fallen body.',
    milestoneTitle: 'International Intruder: Cross-Promotional War',
    milestoneCategory: 'Angle',
    milestoneSegmentType: 'Confrontation / Staredown',
    crowdPop: 'Chants of Holy Shit'
  },
  {
    id: 'pt-double-turn',
    name: 'The Masterclass Double Turn',
    category: 'Betrayal',
    heatBonus: 18,
    icon: '🔄',
    tagline: 'The heel earns heroic respect while the desperate face cheats to win.',
    description: 'In an epic psychological clash reminiscent of Hart vs Austin, the champion resorts to vile tactics to cling to glory, while the defiant bloody challenger gains the unconditional love of the fans.',
    milestoneTitle: 'The Great Inversion: Blood, Pride & Double Turn',
    milestoneCategory: 'Match',
    milestoneSegmentType: 'Hardcore / No DQ',
    suggestedFinish: 'Submission',
    crowdPop: 'Chants of Holy Shit'
  }
];

// ----------------------------------------------------
// SCRIPT DOCTOR & PROMO DIALOGUE GENERATOR
// ----------------------------------------------------
export interface ScriptDoctorTreatment {
  title: string;
  tagline: string;
  protagonistOpeningBeat: string;
  antagonistCounterBeat: string;
  physicalActionBeat: string;
  crowdReactionBeat: string;
  directorNote: string;
  estimatedHeat: number;
}

export function generateScriptDoctorTreatment(
  pitchTitle: string,
  talentA: Wrestler,
  talentB?: Wrestler,
  philosophy: CreativePhilosophy = 'Sports Entertainment Spectacle'
): ScriptDoctorTreatment {
  const isFaceA = talentA.alignment === 'Face';
  const nameA = talentA.name;
  const nameB = talentB ? talentB.name : 'The Roster';
  const styleA = talentA.style;

  let protBeat = `"${nameA} strides to the center of the canvas under the spotlight, mic clutched tight. 'For weeks you hid in the shadows, talking about legacy and destiny. But tonight, look at these fans! They don't buy your corporate arrogance!'`;
  let antBeat = talentB
    ? `"${nameB} smirks coldly from the ramp, mic resting on their chin. 'You're passionate, ${nameA.split(' ')[0]}, I'll give you that. But passion doesn't pay the medical bills when I tear you apart in that ring!'`
    : `"${nameA} paces the ring apron, daring anyone in the back to step through the curtain and test their mettle."`;

  let actionBeat = talentB
    ? `Both competitors go nose-to-nose in the center ring! Tension reaches a fever pitch as security guards and officials rush the ring to separate them before fists can fly.`
    : `${nameA} spikes the microphone onto the canvas, pointing squarely up at the championship banner as pyro erupts from the staging trusses.`;

  let crowdBeat = isFaceA
    ? `The arena erupts in thunderous chants of "${nameA.split(' ')[0]}! ${nameA.split(' ')[0]}!" while flashbulbs strobe across the arena bowl.`
    : `A wave of vitriolic boos crashes down from the rafters as ${nameA} flashes an arrogant grin and holds their ears.`;

  let directorNote = `Keep the camera on a tight waist-up shot to emphasize the facial intensity. Let the silence breathe for 5 seconds between lines.`;

  // Philosophy tweaks
  if (philosophy === 'Workrate & Pure In-Ring Athleticism') {
    protBeat = `"${nameA} focuses strictly on the sport: 'I don't care about drama or merchandise sales. Between those ropes, I will out-wrestle, out-grapple, and make you tap out!'`;
    directorNote = `Emphasize athletic pedigree, ring mat sounds, and technical wrestling history. No slapstick.`;
  } else if (philosophy === 'Crash TV & Shock Value') {
    actionBeat = `Chaos breaks out! ${talentB ? nameB : 'A surprise attacker'} blindsides ${nameA} with a heavy ring bell! Officials are shoved aside, tables are splintered, and the show goes off the air in pandemonium!`;
    crowdBeat = `Deafening sirens wail as emergency medics sprint down the aisle with a backboard.`;
    directorNote = `Fast handheld shaky-cam. Quick cuts to screaming fans. High velocity energy.`;
  }

  const avgMic = talentB ? (talentA.micSkills + talentB.micSkills) / 2 : talentA.micSkills;
  const avgOver = talentB ? (talentA.overness + talentB.overness) / 2 : talentA.overness;
  const estimatedHeat = Math.min(98, Math.round((avgMic * 0.6) + (avgOver * 0.4)));

  return {
    title: `${pitchTitle} — Official TV Script Outline`,
    tagline: `${talentA.name} ${talentB ? `vs. ${talentB.name}` : 'Solo Spotlight'}`,
    protagonistOpeningBeat: protBeat,
    antagonistCounterBeat: antBeat,
    physicalActionBeat: actionBeat,
    crowdReactionBeat: crowdBeat,
    directorNote,
    estimatedHeat
  };
}

// ----------------------------------------------------
// TV SHOW RUNDOWN & EPISODE PACING DOCTOR
// ----------------------------------------------------
export interface ShowFlowAudit {
  score: number; // 0-100
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';
  totalMinutesBooked: number;
  targetMinutes: number;
  matchCount: number;
  angleCount: number;
  matchRatio: number; // percentage
  angleRatio: number; // percentage
  pacingNotes: {
    type: 'success' | 'warning' | 'tip';
    message: string;
  }[];
  isColdOpenPresent: boolean;
  isMainEventHot: boolean;
  hasTitleDefense: boolean;
  fatiguedBookedCount: number;
}

export function auditShowRundown(
  showCard: Segment[],
  promotion: Promotion,
  targetDurationMinutes: number = 90
): ShowFlowAudit {
  let score = 70;
  const pacingNotes: ShowFlowAudit['pacingNotes'] = [];

  const totalMinutesBooked = showCard.reduce((sum, s) => sum + (s.durationMinutes || 10), 0);
  const matchCount = showCard.filter(s => s.category === 'Match').length;
  const angleCount = showCard.filter(s => s.category === 'Angle').length;
  const totalSegs = showCard.length;

  const matchRatio = totalSegs > 0 ? Math.round((matchCount / totalSegs) * 100) : 0;
  const angleRatio = totalSegs > 0 ? Math.round((angleCount / totalSegs) * 100) : 0;

  // Duration Check
  const durationDiff = Math.abs(totalMinutesBooked - targetDurationMinutes);
  if (durationDiff <= 10 && totalMinutesBooked > 0) {
    score += 10;
    pacingNotes.push({
      type: 'success',
      message: `Show duration (${totalMinutesBooked} mins) hits TV network time slot cleanly (${targetDurationMinutes} min target).`
    });
  } else if (totalMinutesBooked < targetDurationMinutes - 20) {
    score -= 12;
    pacingNotes.push({
      type: 'warning',
      message: `Show is under-booked by ${targetDurationMinutes - totalMinutesBooked} minutes. TV broadcast will have dead air or rerun fillers.`
    });
  } else if (totalMinutesBooked > targetDurationMinutes + 15) {
    score -= 10;
    pacingNotes.push({
      type: 'warning',
      message: `Show exceeds time slot by ${totalMinutesBooked - targetDurationMinutes} mins. Network will cut off the main event finish!`
    });
  }

  // Cold Open / Segment 1 check
  const seg1 = showCard[0];
  let isColdOpenPresent = false;
  if (seg1) {
    if (seg1.category === 'Angle' || (seg1.category === 'Match' && seg1.durationMinutes <= 15)) {
      isColdOpenPresent = true;
      score += 6;
      pacingNotes.push({
        type: 'success',
        message: 'Strong opening hook: Show opens with high energy to capture viewers flipping channels.'
      });
    }
  } else {
    pacingNotes.push({
      type: 'tip',
      message: 'Card is empty. Add a cold open promo or high-octane cruiserweight opener.'
    });
  }

  // Main Event Check
  const mainEvent = showCard[showCard.length - 1];
  let isMainEventHot = false;
  if (mainEvent) {
    if (mainEvent.category === 'Match') {
      const participants = promotion.roster.filter(w => mainEvent.participantIds.includes(w.id));
      const hasMainEventer = participants.some(w => w.push === 'Main Eventer' || w.overness >= 78);
      if (hasMainEventer) {
        isMainEventHot = true;
        score += 8;
        pacingNotes.push({
          type: 'success',
          message: 'Marquee Main Event: Features top-tier star power to keep ratings high for the final quarter-hour.'
        });
      } else {
        score -= 5;
        pacingNotes.push({
          type: 'warning',
          message: 'Main event lacks headline star power. Midcarders closing the show may drop viewer ratings.'
        });
      }
    } else {
      pacingNotes.push({
        type: 'tip',
        message: 'Show concludes on an angle. This works for major cliffhangers, but wrestling fans prefer a marquee match finish.'
      });
    }
  }

  // Match / Angle Variety Check
  if (totalSegs >= 4) {
    if (matchRatio >= 45 && matchRatio <= 75) {
      score += 8;
      pacingNotes.push({
        type: 'success',
        message: `Balanced television flow: ${matchRatio}% in-ring wrestling balanced with ${angleRatio}% promos and drama.`
      });
    } else if (matchRatio > 85) {
      score -= 6;
      pacingNotes.push({
        type: 'warning',
        message: 'Too match-heavy. Without promo segments, feuds will fail to build narrative heat.'
      });
    } else if (matchRatio < 35) {
      score -= 8;
      pacingNotes.push({
        type: 'warning',
        message: 'Too talk-heavy. Crowd will become restless without sufficient athletic action.'
      });
    }
  }

  // Title defense check
  const hasTitleDefense = showCard.some(s => s.titleId);
  if (hasTitleDefense) {
    score += 5;
    pacingNotes.push({
      type: 'success',
      message: 'Championship gold at stake: Adds authentic marquee stakes to tonight’s broadcast.'
    });
  }

  // Consecutive segments of same type check
  for (let i = 0; i < showCard.length - 2; i++) {
    if (
      showCard[i].category === 'Angle' &&
      showCard[i + 1].category === 'Angle' &&
      showCard[i + 2].category === 'Angle'
    ) {
      score -= 8;
      pacingNotes.push({
        type: 'warning',
        message: `Triple-promo stack detected at segments #${i + 1}-${i + 3}. Break them up with a match to preserve arena crowd energy.`
      });
      break;
    }
  }

  // Fatigue audit
  const bookedWrestlerIds = new Set<string>();
  showCard.forEach(s => s.participantIds.forEach(id => bookedWrestlerIds.add(id)));
  const fatiguedBooked = promotion.roster.filter(w => bookedWrestlerIds.has(w.id) && w.fatigue >= 45);
  if (fatiguedBooked.length > 0) {
    score -= (fatiguedBooked.length * 3);
    pacingNotes.push({
      type: 'warning',
      message: `${fatiguedBooked.length} booked superstar(s) have high fatigue (>45). High risk of match botches or injury!`
    });
  }

  // Final grade calculation
  score = Math.max(25, Math.min(100, score));
  let grade: ShowFlowAudit['grade'] = 'C';
  if (score >= 95) grade = 'A+';
  else if (score >= 90) grade = 'A';
  else if (score >= 85) grade = 'A-';
  else if (score >= 80) grade = 'B+';
  else if (score >= 75) grade = 'B';
  else if (score >= 70) grade = 'B-';
  else if (score >= 65) grade = 'C+';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  return {
    score,
    grade,
    totalMinutesBooked,
    targetMinutes: targetDurationMinutes,
    matchCount,
    angleCount,
    matchRatio,
    angleRatio,
    pacingNotes,
    isColdOpenPresent,
    isMainEventHot,
    hasTitleDefense,
    fatiguedBookedCount: fatiguedBooked.length
  };
}

// ----------------------------------------------------
// AUTO-FORMAT BALANCED SHOW GENERATOR
// ----------------------------------------------------
export function generateBalancedShowCard(
  promotion: Promotion,
  targetDuration: number = 90
): Segment[] {
  const card: Segment[] = [];
  const roster = [...promotion.roster].filter(w => !w.injury?.injured && w.fatigue < 45);
  
  if (roster.length < 6) {
    return card;
  }

  const mainEventers = roster.filter(w => w.push === 'Main Eventer' || w.push === 'Upper Midcard');
  const midcarders = roster.filter(w => w.push === 'Midcard' || w.push === 'Lower Midcard');
  const cruisersOrFlyers = roster.filter(w => w.style === 'High Flyer' || w.style === 'Technician');
  
  const usedIds = new Set<string>();

  // 1. Cold Open / Hot In-Ring Promo
  const topPromoTalent = [...roster].sort((a, b) => b.micSkills - a.micSkills)[0];
  const promoRival = [...roster].filter(w => w.id !== topPromoTalent.id && w.alignment !== topPromoTalent.alignment)[0];
  if (topPromoTalent) {
    usedIds.add(topPromoTalent.id);
    const pIds = [topPromoTalent.id];
    if (promoRival) {
      usedIds.add(promoRival.id);
      pIds.push(promoRival.id);
    }
    card.push({
      id: `seg-auto-${Date.now()}-1`,
      segmentNumber: 1,
      category: 'Angle',
      angleType: 'In-Ring Promo',
      participantIds: pIds,
      durationMinutes: 8,
      notes: `[Auto-Rundown Cold Open]: Heated confrontation setting the stakes for tonight's broadcast.`
    });
  }

  // 2. High-Paced Opener Match (Cruiserweight / Fast Action)
  const openerA = cruisersOrFlyers.find(w => !usedIds.has(w.id)) || midcarders.find(w => !usedIds.has(w.id)) || roster[0];
  usedIds.add(openerA.id);
  const openerB = roster.find(w => !usedIds.has(w.id) && w.gender === openerA.gender) || roster[1];
  usedIds.add(openerB.id);

  card.push({
    id: `seg-auto-${Date.now()}-2`,
    segmentNumber: 2,
    category: 'Match',
    matchType: 'Singles',
    participantIds: [openerA.id, openerB.id],
    winnerId: openerA.id,
    finishType: 'Clean Pinfall',
    durationMinutes: 14,
    notes: `[Auto-Rundown Opener]: High-workrate contest designed to electrify the live arena crowd.`
  });

  // 3. Backstage Interview / Sneak Attack Angle
  const angleFace = roster.find(w => !usedIds.has(w.id) && w.alignment === 'Face') || roster[2];
  usedIds.add(angleFace.id);
  const angleHeel = roster.find(w => !usedIds.has(w.id) && w.alignment === 'Heel') || roster[3];
  usedIds.add(angleHeel.id);

  card.push({
    id: `seg-auto-${Date.now()}-3`,
    segmentNumber: 3,
    category: 'Angle',
    angleType: 'Interview Segment',
    participantIds: [angleFace.id, angleHeel.id],
    durationMinutes: 6,
    notes: `[Auto-Rundown Angle]: Heated locker room dispute leading into upcoming pay-per-view rivalry.`
  });

  // 4. Midcard Title / Contender Match
  const midA = roster.find(w => !usedIds.has(w.id)) || roster[0];
  usedIds.add(midA.id);
  const midB = roster.find(w => !usedIds.has(w.id) && w.gender === midA.gender) || roster[1];
  usedIds.add(midB.id);

  card.push({
    id: `seg-auto-${Date.now()}-4`,
    segmentNumber: 4,
    category: 'Match',
    matchType: 'Singles',
    participantIds: [midA.id, midB.id],
    winnerId: midA.id,
    finishType: 'Clean Pinfall',
    durationMinutes: 15,
    notes: `[Auto-Rundown Midcard Clash]: Hard-hitting battle for ranking positioning on the card.`
  });

  // 5. Video Package / Hype Vignette
  card.push({
    id: `seg-auto-${Date.now()}-5`,
    segmentNumber: 5,
    category: 'Angle',
    angleType: 'Hype Video / Vignette',
    participantIds: [midA.id],
    durationMinutes: 4,
    notes: `[Auto-Rundown Hype Package]: Cinematic video package showcasing championship lineage and feud stakes.`
  });

  // 6. Marquee Main Event (Top Stars / Title)
  const remainingStars = mainEventers.filter(w => !usedIds.has(w.id));
  const mainA = remainingStars[0] || mainEventers[0] || roster[0];
  const mainB = remainingStars.find(w => w.id !== mainA.id && w.gender === mainA.gender) ||
    roster.find(w => w.id !== mainA.id && w.gender === mainA.gender) || roster[1];

  const primaryTitle = promotion.titles.find(t => !t.isRetired && t.currentHolderIds.includes(mainA.id));

  card.push({
    id: `seg-auto-${Date.now()}-6`,
    segmentNumber: 6,
    category: 'Match',
    matchType: 'Singles',
    participantIds: [mainA.id, mainB.id],
    winnerId: mainA.id,
    finishType: 'Clean Pinfall',
    durationMinutes: 22,
    titleId: primaryTitle?.id,
    notes: `[Auto-Rundown Marquee Main Event]: Heavyweight showcase featuring top overness stars.`
  });

  return card;
}

// ----------------------------------------------------
// IN-RING STYLE CLASH & PSYCHOLOGY MATRIX
// ----------------------------------------------------
export interface StyleClashResult {
  headline: string;
  paceBonus: string;
  crowdPsychology: string;
  recommendedDuration: number;
  bestGimmickMatch: string;
}

export function evaluateStyleClash(styleA: string, styleB: string): StyleClashResult {
  const pair = [styleA, styleB].sort().join(' vs ');

  switch (pair) {
    case 'High Flyer vs Technician':
      return {
        headline: '🌟 High-Velocity Technical Classic',
        paceBonus: '+8% Workrate & Aerial Dynamic',
        crowdPsychology: 'Crisp counter-wrestling transitioning into breathless top-rope dives. The purist’s dream match.',
        recommendedDuration: 18,
        bestGimmickMatch: 'Ladder Match or 2-out-of-3 Falls'
      };
    case 'Brawler vs Hardcore':
      return {
        headline: '🩸 Stiff Bruising War of Attrition',
        paceBonus: '+10% Realism & Blood Feud Intensity',
        crowdPsychology: 'Heavy knuckle punches, ringside barricade bumps, and weapons. Keep the pace frantic and brutal.',
        recommendedDuration: 15,
        bestGimmickMatch: 'No Holds Barred / Street Fight'
      };
    case 'Powerhouse vs Technician':
      return {
        headline: '⚔️ David vs. Goliath Dynamic',
        paceBonus: '+6% Storytelling Psychology',
        crowdPsychology: 'The technician methodically targets the limbs while the powerhouse delivers devastating slams and ragdoll throws.',
        recommendedDuration: 16,
        bestGimmickMatch: 'Steel Cage or Submission Match'
      };
    case 'Brawler vs Powerhouse':
      return {
        headline: '💥 Clash of the Titans Heavyweight Brawl',
        paceBonus: '+5% Impact & Spectacle',
        crowdPsychology: 'Meaty men slapping meat! Stiff lariats, powerbombs, and power tests that test the ring ringposts.',
        recommendedDuration: 14,
        bestGimmickMatch: 'Last Man Standing Match'
      };
    case 'Entertainer vs Entertainer':
      return {
        headline: '🎭 Charisma & Megastar Showdown',
        paceBonus: '+10% Crowd Reaction & Pop',
        crowdPsychology: 'Classic Rock vs Austin theatrics. Signature taunts, theatrical false finishes, and total arena connection.',
        recommendedDuration: 20,
        bestGimmickMatch: 'Standard Singles or No DQ'
      };
    default:
      return {
        headline: '⚡ Athletic Competitive Showcase',
        paceBonus: '+4% All-Around Balance',
        crowdPsychology: 'Solid standard match psychology. Focus on building to a dramatic false-finish flurry.',
        recommendedDuration: 16,
        bestGimmickMatch: 'Singles with 30-min Time Limit'
      };
  }
}

import React, { useState } from 'react';
import { 
  Promotion, 
  Wrestler, 
  Segment, 
  StorylineArc, 
  StorylineMilestone, 
  CreativeNote, 
  CreativePhilosophy,
  StorylineArchetype,
  MatchType,
  AngleType,
  FinishType,
  GameView,
  Feud
} from '../types';
import { 
  STORYLINE_ARCHETYPES_CATALOG, 
  PROMO_PITCH_PRESETS, 
  DEFAULT_CREATIVE_NOTES, 
  WRITERS_ROOM_AGENTS,
  generateDefaultStorylines
} from '../data/customDefaults';
import { 
  PLOT_TWIST_CATALOG, 
  PlotTwistDefinition,
  generateScriptDoctorTreatment,
  ScriptDoctorTreatment,
  auditShowRundown,
  generateBalancedShowCard,
  evaluateStyleClash
} from '../data/writersHubPresets';
import { evaluateSegment } from '../engine/simulation';
import { 
  BookOpen, 
  PenTool, 
  Flame, 
  Sparkles, 
  Tv, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Lightbulb, 
  Users, 
  Shuffle, 
  Swords, 
  Pin, 
  Check, 
  Calendar,
  AlertCircle,
  HelpCircle,
  FileText,
  Sliders,
  Send,
  Zap,
  Activity,
  Link as LinkIcon,
  RotateCcw,
  Clock,
  TrendingUp,
  AlertTriangle,
  Copy,
  Wand2
} from 'lucide-react';

interface WritersHubViewProps {
  promotion: Promotion;
  currentWeek?: number;
  currentYear?: number;
  currentShowCard: Segment[];
  onUpdatePromotion: (newPromo: Promotion) => void;
  onUpdateShowCard: (newCard: Segment[]) => void;
  onNavigate: (view: GameView) => void;
  onBackToMenu: () => void;
}

type WritersTab = 'storylines' | 'pitches' | 'synergy_lab' | 'rundown_doctor' | 'notebook' | 'committee';

export const WritersHubView: React.FC<WritersHubViewProps> = ({
  promotion,
  currentWeek = 1,
  currentYear = 2026,
  currentShowCard,
  onUpdatePromotion,
  onUpdateShowCard,
  onNavigate,
  onBackToMenu
}) => {
  const [activeTab, setActiveTab] = useState<WritersTab>('storylines');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active On TV' | 'Drafting' | 'Climax Ready' | 'Concluded'>('All');
  
  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Ensure storylines & notes exist
  const storylines: StorylineArc[] = promotion.storylineArcs && promotion.storylineArcs.length > 0
    ? promotion.storylineArcs
    : generateDefaultStorylines(promotion, currentWeek, currentYear);

  const creativeNotes: CreativeNote[] = promotion.creativeNotes && promotion.creativeNotes.length > 0
    ? promotion.creativeNotes
    : DEFAULT_CREATIVE_NOTES;

  const currentPhilosophy: CreativePhilosophy = promotion.creativePhilosophy || 'Sports Entertainment Spectacle';

  // ----------------------------------------------------
  // STORYLINE CREATION & PLOT TWIST MODAL STATE
  // ----------------------------------------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newArcTitle, setNewArcTitle] = useState('');
  const [newArcArchetype, setNewArcArchetype] = useState<StorylineArchetype>('Underdog Title Chase');
  const [archetypeFilterCategory, setArchetypeFilterCategory] = useState<string>('All');
  const [newArcStartingHeat, setNewArcStartingHeat] = useState<number>(75);
  const [newProtagonistId, setNewProtagonistId] = useState<string>(promotion.roster[0]?.id || '');
  const [newAntagonistId, setNewAntagonistId] = useState<string>(promotion.roster[1]?.id || '');
  const [newTargetTitleId, setNewTargetTitleId] = useState<string>('');
  const [newTargetPPV, setNewTargetPPV] = useState<string>(
    promotion.ppvSchedule?.[0]?.name || 'Genesis Supercard'
  );

  const handleSuggestStorylineTitle = () => {
    const tpl = STORYLINE_ARCHETYPES_CATALOG.find(a => a.archetype === newArcArchetype);
    const prot = promotion.roster.find(w => w.id === newProtagonistId)?.name.split(' ')[0] || 'Hero';
    const ant = promotion.roster.find(w => w.id === newAntagonistId)?.name.split(' ')[0] || 'Rival';
    
    const suggestions: Record<string, string[]> = {
      'Underdog Title Chase': [`The Mountain Climb: ${prot}'s Quest`, `Against All Odds: ${prot} vs ${ant}`, `${prot}'s Impossible Dream`],
      'Monster Reign of Terror': [`Reign of Carnage: ${ant}'s Wrath`, `Slaying the Beast: ${prot}'s Stand`, `${ant}'s Reign of Destruction`],
      'Heartbreaking Tag Betrayal': [`Brotherhood Shattered: ${prot} vs ${ant}`, `The Steel Chair Double-Cross`, `No More Mercy`],
      'Corrupt Authority Resistance': [`Defying the Machine: ${prot} Unchained`, `The Corporate Mandate`, `Locker Room Revolt`],
      'Unlikely Odd-Couple Champions': [`Mismatched Gold: The Alliance`, `Strange Bedfellows`, `Odd Couple Championship Run`],
      'Legend\'s Last Stand': [`One More Run: ${prot}'s Farewell`, `Career on the Line`, `The Final Ride`],
      'Faction Gang Warfare': [`Turf War: Blood in the Ring`, `War for Territory Supremacy`, `Gang Warfare Escalation`],
      'Mask vs. Hair Grudge Feud': [`Ultimate Pride: Mask vs Hair`, `Honor Over Everything`, `The Desecration & Retribution`],
      'Contract in the Bank Cash-In': [`The Shadow of the Contract`, `Paranoia & The Golden Briefcase`, `Cash-In Imminent`],
      'Mystery Attacker / Conspiracy': [`Whodunit? The Conspiracy`, `The Backstage Hitman`, `Unmasking the Mastermind`],
      'Forbidden Door Foreign Invader': [`The Foreign Invasion: ${ant} Arrives`, `Cross-Promotional Superfight`, `Defending Company Honor`],
      'Teacher vs. Prodigy Student': [`Student Surpasses Master`, `${ant}'s Revolt: The Bitter Protégé`, `Passing of the Torch`],
      'Cult Leader Indoctrination': [`The Cult of Shadows`, `${ant}'s Flock: Sins of the Mind`, `Exorcism in the Darkness`],
      'Loser Leaves Town Exile': [`Loser Leaves Town: The Banishment`, `One Must Go: ${prot} vs ${ant}`, `Career Termination Match`],
      'Respect Through Blood Iron Man': [`30-Minute Marathon: Pure Wrestling`, `Respect Through Blood`, `The Purist's Dream Match`],
      'Hostile Corporate Buyout': [`Corporate Takeover: Hostile Buyout`, `Originals vs The Suits`, `War for Company Control`],
      'Fall from Grace Redemption': [`Road to Redemption: ${prot}'s Fire`, `Rock Bottom & The Ascent`, `The Long Walk Back`],
      'Unstoppable Streak vs. The World': [`The Unbroken Streak`, `Who Can Slay ${ant}?`, `The 1 in the Record`],
      'Bitter Love Triangle Melodrama': [`Love, Lies & Betrayal`, `Battle for the Spotlight`, `Heartbreak in the Squared Circle`],
      'Hardcore Escalation Bloodbath': [`No Rules: The Barbed Wire War`, `Blood, Tables & Retribution`, `Carnage & Ruin`],
      'Giant Slayer David vs. Goliath': [`The Giant Slayer: ${prot} vs ${ant}`, `Toppling the Colossus`, `David Takes Down Goliath`],
      'Undisputed Title Unification': [`Winner Takes All: Unification`, `Two Belts, One True Champion`, `The Undisputed Crown`],
      'Cruiserweight Aerial Revolution': [`The Aerial Revolution`, `Gravity Defied: ${prot} vs ${ant}`, `Speed, Flight & Main Event Respect`],
      'Open Cash Bounty Hitman': [`The $100,000 Bounty on ${prot}`, `The Mercenary Contract`, `Bounty Hunters Everywhere`]
    };

    const pool = suggestions[newArcArchetype] || [`${tpl?.name || newArcArchetype}: ${prot} vs ${ant}`];
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setNewArcTitle(chosen);
  };

  // Plot Twist Modal
  const [showTwistModal, setShowTwistModal] = useState(false);
  const [selectedArcForTwist, setSelectedArcForTwist] = useState<StorylineArc | null>(null);
  const [selectedTwistId, setSelectedTwistId] = useState<string>(PLOT_TWIST_CATALOG[0].id);

  // Custom Milestone Modal
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [selectedArcForMilestone, setSelectedArcForMilestone] = useState<StorylineArc | null>(null);
  const [customMsTitle, setCustomMsTitle] = useState('');
  const [customMsCategory, setCustomMsCategory] = useState<'Match' | 'Angle'>('Angle');
  const [customMsType, setCustomMsType] = useState<string>('In-Ring Promo');
  const [customMsDesc, setCustomMsDesc] = useState('');
  const [customMsFinish, setCustomMsFinish] = useState<FinishType>('Clean Pinfall');

  // ----------------------------------------------------
  // PROMO PITCH GENERATOR & SCRIPT DOCTOR STATE
  // ----------------------------------------------------
  const [selectedPitchId, setSelectedPitchId] = useState<string>(PROMO_PITCH_PRESETS[0].id);
  const [pitchWrestlerA, setPitchWrestlerA] = useState<string>(promotion.roster[0]?.id || '');
  const [pitchWrestlerB, setPitchWrestlerB] = useState<string>(promotion.roster[1]?.id || '');
  const [pitchDuration, setPitchDuration] = useState<number>(8);
  const [customPitchNotes, setCustomPitchNotes] = useState<string>('');
  const [scriptTreatment, setScriptTreatment] = useState<ScriptDoctorTreatment | null>(null);

  // ----------------------------------------------------
  // SYNERGY / DREAM MATCH LAB STATE
  // ----------------------------------------------------
  const [labMatchFormat, setLabMatchFormat] = useState<'Singles' | 'Triple Threat' | 'Fatal 4-Way' | 'Tag Team'>('Singles');
  const [labWrestlerA, setLabWrestlerA] = useState<string>(promotion.roster[0]?.id || '');
  const [labWrestlerB, setLabWrestlerB] = useState<string>(promotion.roster[1]?.id || '');
  const [labWrestlerC, setLabWrestlerC] = useState<string>(promotion.roster[2]?.id || '');
  const [labWrestlerD, setLabWrestlerD] = useState<string>(promotion.roster[3]?.id || '');
  const [labMatchType, setLabMatchType] = useState<MatchType>('Singles');
  const [labFinishType, setLabFinishType] = useState<FinishType>('Clean Pinfall');
  const [labDuration, setLabDuration] = useState<number>(18);
  const [labTitleId, setLabTitleId] = useState<string>('');

  // ----------------------------------------------------
  // TV SHOW RUNDOWN DOCTOR STATE
  // ----------------------------------------------------
  const [targetShowDuration, setTargetShowDuration] = useState<number>(90);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ----------------------------------------------------
  // GIMMICK REPACKAGING LAB STATE
  // ----------------------------------------------------
  const [repackageTalentId, setRepackageTalentId] = useState<string>(promotion.roster[0]?.id || '');
  const [repackageCategory, setRepackageCategory] = useState<string>('Cult Leader / Occultist');
  const [repackageAlignment, setRepackageAlignment] = useState<'Face' | 'Heel'>('Heel');

  // ----------------------------------------------------
  // CREATIVE NOTEBOOK STATE
  // ----------------------------------------------------
  const [noteCategoryFilter, setNoteCategoryFilter] = useState<string>('All');
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<CreativeNote['category']>('TV Cliffhanger');
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newNoteWrestlerId, setNewNoteWrestlerId] = useState('');

  // ----------------------------------------------------
  // ACTIONS: PHILOSOPHY UPDATE
  // ----------------------------------------------------
  const handleUpdatePhilosophy = (phil: CreativePhilosophy) => {
    onUpdatePromotion({
      ...promotion,
      creativePhilosophy: phil,
      storylineArcs: storylines,
      creativeNotes: creativeNotes
    });
    showToast(`Creative Philosophy shifted to: "${phil}"`);
  };

  // ----------------------------------------------------
  // ACTIONS: STORYLINES
  // ----------------------------------------------------
  const handleSaveNewStoryline = () => {
    if (!newArcTitle.trim()) {
      showToast('Please enter a storyline title.');
      return;
    }
    if (!newProtagonistId || !newAntagonistId) {
      showToast('Please select both a protagonist and antagonist.');
      return;
    }

    const template = STORYLINE_ARCHETYPES_CATALOG.find(a => a.archetype === newArcArchetype);
    const milestones: StorylineMilestone[] = (template?.milestones || []).map((m, idx) => ({
      id: `ms-${Date.now()}-${idx}`,
      stepNumber: idx + 1,
      title: m.title,
      category: m.category,
      segmentType: m.segmentType,
      description: m.description,
      suggestedFinish: m.suggestedFinish,
      isCompleted: false,
      targetWeekOffset: idx + 1
    }));

    const startingMomentum = newArcStartingHeat >= 90 ? 'White Hot' : newArcStartingHeat >= 75 ? 'Boiling Hot' : 'Simmering';
    const newArc: StorylineArc = {
      id: `arc-${Date.now()}`,
      title: newArcTitle.trim(),
      archetype: newArcArchetype,
      protagonistIds: [newProtagonistId],
      antagonistIds: [newAntagonistId],
      targetPPVName: newTargetPPV,
      targetTitleId: newTargetTitleId || undefined,
      heat: newArcStartingHeat,
      momentum: startingMomentum,
      status: 'Active On TV',
      startWeek: currentWeek,
      startYear: currentYear,
      plannedWeeksDuration: template?.suggestedDurationWeeks || 4,
      currentMilestoneIndex: 0,
      milestones,
      notes: `Built using "${template?.name || newArcArchetype}" archetype.`
    };

    const updatedArcs = [newArc, ...storylines];
    onUpdatePromotion({
      ...promotion,
      storylineArcs: updatedArcs,
      creativeNotes: creativeNotes
    });
    setShowCreateModal(false);
    setNewArcTitle('');
    showToast(`Storyline "${newArc.title}" launched into active TV!`);
  };

  const handleAdvanceMilestone = (arcId: string) => {
    const updated = storylines.map(arc => {
      if (arc.id !== arcId) return arc;
      const nextIdx = arc.currentMilestoneIndex + 1;
      const updatedMs = arc.milestones.map((m, idx) => {
        if (idx === arc.currentMilestoneIndex) {
          return { ...m, isCompleted: true, completedWeek: currentWeek };
        }
        return m;
      });
      const isDone = nextIdx >= arc.milestones.length;
      return {
        ...arc,
        currentMilestoneIndex: Math.min(nextIdx, arc.milestones.length - 1),
        status: isDone ? ('Climax Ready' as const) : arc.status,
        heat: Math.min(100, arc.heat + 5),
        milestones: updatedMs
      };
    });

    onUpdatePromotion({
      ...promotion,
      storylineArcs: updated,
      creativeNotes: creativeNotes
    });
    showToast('Advanced chapter milestone!');
  };

  const handleConcludeArc = (arcId: string) => {
    const updated = storylines.map(arc => {
      if (arc.id !== arcId) return arc;
      return {
        ...arc,
        status: 'Concluded' as const
      };
    });
    onUpdatePromotion({
      ...promotion,
      storylineArcs: updated,
      creativeNotes: creativeNotes
    });
    showToast('Storyline marked as Concluded and archived.');
  };

  const handleDeleteArc = (arcId: string) => {
    const updated = storylines.filter(arc => arc.id !== arcId);
    onUpdatePromotion({
      ...promotion,
      storylineArcs: updated,
      creativeNotes: creativeNotes
    });
    showToast('Storyline deleted from writers\' room.');
  };

  // ----------------------------------------------------
  // ACTIONS: PLOT TWISTS & NARRATIVE SYNC
  // ----------------------------------------------------
  const handleOpenTwistModal = (arc: StorylineArc) => {
    setSelectedArcForTwist(arc);
    setSelectedTwistId(PLOT_TWIST_CATALOG[0].id);
    setShowTwistModal(true);
  };

  const handleExecutePlotTwist = () => {
    if (!selectedArcForTwist) return;
    const twist = PLOT_TWIST_CATALOG.find(t => t.id === selectedTwistId) || PLOT_TWIST_CATALOG[0];

    const newMilestone: StorylineMilestone = {
      id: `ms-twist-${Date.now()}`,
      stepNumber: selectedArcForTwist.milestones.length + 1,
      title: `⚡ [PLOT TWIST]: ${twist.milestoneTitle}`,
      category: twist.milestoneCategory,
      segmentType: twist.milestoneSegmentType,
      description: `${twist.description} (Audience Reaction: ${twist.crowdPop})`,
      suggestedFinish: twist.suggestedFinish || 'Clean Pinfall',
      isCompleted: false,
      targetWeekOffset: selectedArcForTwist.milestones.length + 1
    };

    // Boost heat and set momentum
    const updatedArcs = storylines.map(arc => {
      if (arc.id !== selectedArcForTwist.id) return arc;
      const boostedHeat = Math.min(100, arc.heat + twist.heatBonus);
      const appliedTwists = [...(arc.plotTwists || []), twist.name];
      // Insert right after current milestone or append
      const insertIdx = arc.currentMilestoneIndex + 1;
      const newMilestones = [...arc.milestones];
      newMilestones.splice(insertIdx, 0, newMilestone);
      // Re-number
      const renumbered = newMilestones.map((m, idx) => ({ ...m, stepNumber: idx + 1 }));

      return {
        ...arc,
        heat: boostedHeat,
        momentum: 'White Hot' as const,
        plotTwists: appliedTwists,
        twistsAppliedCount: (arc.twistsAppliedCount || 0) + 1,
        milestones: renumbered
      };
    });

    // Also boost linked feud heat if present!
    let updatedFeuds = [...promotion.feuds];
    if (selectedArcForTwist.feudId) {
      updatedFeuds = updatedFeuds.map(f => {
        if (f.id === selectedArcForTwist.feudId) {
          return {
            ...f,
            heat: Math.min(100, f.heat + twist.heatBonus),
            momentum: 'White Hot' as const
          };
        }
        return f;
      });
    }

    onUpdatePromotion({
      ...promotion,
      feuds: updatedFeuds,
      storylineArcs: updatedArcs,
      creativeNotes: creativeNotes
    });

    setShowTwistModal(false);
    showToast(`⚡ Plot Twist "${twist.name}" injected! Feud heat surged (+${twist.heatBonus} pts)!`);
  };

  const handleAutoCreateFeudForArc = (arc: StorylineArc) => {
    // Check if matching feud already exists
    const existing = promotion.feuds.find(f => 
      (f.wrestlerAIds.some(id => arc.protagonistIds.includes(id)) && f.wrestlerBIds.some(id => arc.antagonistIds.includes(id))) ||
      (f.wrestlerBIds.some(id => arc.protagonistIds.includes(id)) && f.wrestlerAIds.some(id => arc.antagonistIds.includes(id)))
    );

    if (existing) {
      const updatedArcs = storylines.map(a => a.id === arc.id ? { ...a, feudId: existing.id } : a);
      onUpdatePromotion({ ...promotion, storylineArcs: updatedArcs });
      showToast(`Linked to existing feud: "${existing.name}"!`);
      return;
    }

    // Create brand new Feud in promotion.feuds
    const newFeud: Feud = {
      id: `feud-arc-${Date.now()}`,
      name: arc.title,
      wrestlerAIds: arc.protagonistIds,
      wrestlerBIds: arc.antagonistIds,
      heat: arc.heat,
      startedWeek: currentWeek,
      momentum: arc.momentum,
      description: arc.notes || `Born from television storyline arc: ${arc.title}.`
    };

    const updatedArcs = storylines.map(a => a.id === arc.id ? { ...a, feudId: newFeud.id } : a);
    onUpdatePromotion({
      ...promotion,
      feuds: [newFeud, ...promotion.feuds],
      storylineArcs: updatedArcs
    });
    showToast(`Created official booking rivalry "${newFeud.name}" in Titles & Feuds engine!`);
  };

  // Custom milestone handlers
  const handleOpenAddMilestoneModal = (arc: StorylineArc) => {
    setSelectedArcForMilestone(arc);
    setCustomMsTitle('');
    setCustomMsCategory('Angle');
    setCustomMsType('In-Ring Promo');
    setCustomMsDesc('');
    setCustomMsFinish('Clean Pinfall');
    setShowAddMilestoneModal(true);
  };

  const handleAddCustomMilestone = () => {
    if (!selectedArcForMilestone || !customMsTitle.trim()) {
      showToast('Please enter a milestone title.');
      return;
    }

    const newMs: StorylineMilestone = {
      id: `ms-custom-${Date.now()}`,
      stepNumber: selectedArcForMilestone.milestones.length + 1,
      title: customMsTitle.trim(),
      category: customMsCategory,
      segmentType: (customMsType as any) || (customMsCategory === 'Match' ? 'Singles' : 'In-Ring Promo'),
      description: customMsDesc.trim() || 'Custom booking milestone chapter.',
      suggestedFinish: customMsCategory === 'Match' ? customMsFinish : undefined,
      isCompleted: false,
      targetWeekOffset: selectedArcForMilestone.milestones.length + 1
    };

    const updatedArcs = storylines.map(arc => {
      if (arc.id !== selectedArcForMilestone.id) return arc;
      return {
        ...arc,
        milestones: [...arc.milestones, newMs]
      };
    });

    onUpdatePromotion({
      ...promotion,
      storylineArcs: updatedArcs,
      creativeNotes: creativeNotes
    });

    setShowAddMilestoneModal(false);
    showToast(`Added custom chapter "${newMs.title}" to roadmap!`);
  };

  // SCRIPT DOCTOR GENERATOR
  const handleGenerateScriptTreatment = () => {
    const pA = promotion.roster.find(w => w.id === pitchWrestlerA);
    const pB = promotion.roster.find(w => w.id === pitchWrestlerB);
    if (!pA) {
      showToast('Select a primary talent.');
      return;
    }
    const treatment = generateScriptDoctorTreatment(
      activePitchTemplate.title,
      pA,
      pB,
      currentPhilosophy
    );
    setScriptTreatment(treatment);
    const scriptNotes = `[${treatment.title}]\n• Opening: ${treatment.protagonistOpeningBeat}\n• Counter: ${treatment.antagonistCounterBeat}\n• Physical Beat: ${treatment.physicalActionBeat}\n• Crowd Cue: ${treatment.crowdReactionBeat}\n• Note: ${treatment.directorNote}`;
    setCustomPitchNotes(scriptNotes);
    showToast(`Generated Script Treatment for "${pA.name}"!`);
  };

  // TV SHOW RUNDOWN DOCTOR ACTIONS
  const showAudit = auditShowRundown(currentShowCard, promotion, targetShowDuration);

  const handleAutoFormatShowCard = () => {
    const formatted = generateBalancedShowCard(promotion, targetShowDuration);
    if (formatted.length === 0) {
      showToast('Not enough healthy uninjured talent to auto-format.');
      return;
    }
    onUpdateShowCard(formatted);
    showToast(`Auto-formatted a balanced ${targetShowDuration}-min TV episode (${formatted.length} segments)!`);
  };

  const handleAutoFillRemainingShow = () => {
    const remainingTime = Math.max(10, targetShowDuration - showAudit.totalMinutesBooked);
    const roster = promotion.roster.filter(w => !w.injury?.injured && w.fatigue < 40);
    if (roster.length < 2) {
      showToast('Not enough available wrestlers to fill card.');
      return;
    }

    const nextSegNum = currentShowCard.length + 1;
    const bookedIds = new Set<string>();
    currentShowCard.forEach(s => s.participantIds.forEach(id => bookedIds.add(id)));
    const unbooked = roster.filter(w => !bookedIds.has(w.id));
    const starA = unbooked[0] || roster[0];
    const starB = unbooked.find(w => w.id !== starA.id && w.gender === starA.gender) || roster.find(w => w.id !== starA.id) || roster[1];

    const fillerMatch: Segment = {
      id: `seg-fill-${Date.now()}`,
      segmentNumber: nextSegNum,
      category: 'Match',
      matchType: 'Singles',
      participantIds: [starA.id, starB.id],
      winnerId: starA.id,
      finishType: 'Clean Pinfall',
      durationMinutes: Math.min(20, remainingTime),
      notes: `[Rundown Doctor Fill-in]: Competitive showcase match rounding out the broadcast.`
    };

    onUpdateShowCard([...currentShowCard, fillerMatch]);
    showToast(`Added showcase match to reach network broadcast runtime!`);
  };

  const handleClearShowCard = () => {
    onUpdateShowCard([]);
    setShowClearConfirm(false);
    showToast('Show card cleared for a fresh broadcast slate.');
  };

  // REPACKAGING HANDLER
  const handleApplyRepackage = () => {
    const talent = promotion.roster.find(w => w.id === repackageTalentId);
    if (!talent) return;

    const updatedRoster = promotion.roster.map(w => {
      if (w.id !== repackageTalentId) return w;
      return {
        ...w,
        alignment: repackageAlignment,
        morale: Math.min(100, w.morale + 10),
        gimmick: {
          name: `${repackageCategory} Persona`,
          category: repackageCategory,
          description: `Repackaged in the creative suite as a ${repackageAlignment.toLowerCase()} ${repackageCategory}.`,
          grade: 'A' as const,
          repackagesCount: (w.gimmick?.repackagesCount || 0) + 1
        }
      };
    });

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster
    });
    showToast(`Superstar "${talent.name}" successfully repackaged as a ${repackageAlignment} ${repackageCategory}!`);
  };

  // SEND NEXT CHAPTER TO SHOW CARD
  const handlePushMilestoneToShowCard = (arc: StorylineArc) => {
    const currentMs = arc.milestones[arc.currentMilestoneIndex];
    if (!currentMs) {
      showToast('No active milestone remaining for this arc.');
      return;
    }

    const participants = Array.from(new Set([...arc.protagonistIds, ...arc.antagonistIds]));
    const nextSegNum = currentShowCard.length + 1;

    let newSegment: Segment;
    if (currentMs.category === 'Match') {
      newSegment = {
        id: `seg-arc-${Date.now()}`,
        segmentNumber: nextSegNum,
        category: 'Match',
        matchType: (currentMs.segmentType as MatchType) || 'Singles',
        participantIds: participants,
        winnerId: arc.protagonistIds[0],
        finishType: currentMs.suggestedFinish || 'Clean Pinfall',
        durationMinutes: 16,
        titleId: arc.targetTitleId,
        feudId: arc.feudId,
        notes: `[Storyline: ${arc.title} - Step ${currentMs.stepNumber}]: ${currentMs.description}`
      };
    } else {
      newSegment = {
        id: `seg-arc-${Date.now()}`,
        segmentNumber: nextSegNum,
        category: 'Angle',
        angleType: (currentMs.segmentType as AngleType) || 'In-Ring Promo',
        participantIds: participants,
        durationMinutes: 8,
        titleId: arc.targetTitleId,
        feudId: arc.feudId,
        notes: `[Storyline: ${arc.title} - Step ${currentMs.stepNumber}]: ${currentMs.description}`
      };
    }

    onUpdateShowCard([...currentShowCard, newSegment]);
    showToast(`Chapter "${currentMs.title}" pushed to Show Card (#${nextSegNum})!`);
  };

  // ----------------------------------------------------
  // ACTIONS: PROMO PITCH
  // ----------------------------------------------------
  const activePitchTemplate = PROMO_PITCH_PRESETS.find(p => p.id === selectedPitchId) || PROMO_PITCH_PRESETS[0];

  const handlePushPitchToShowCard = () => {
    const pA = promotion.roster.find(w => w.id === pitchWrestlerA);
    const pB = promotion.roster.find(w => w.id === pitchWrestlerB);

    if (!pA) {
      showToast('Select at least one talent for this angle.');
      return;
    }

    const participants = pB && pB.id !== pA.id ? [pA.id, pB.id] : [pA.id];
    const nextSegNum = currentShowCard.length + 1;

    const notesSummary = customPitchNotes.trim()
      ? customPitchNotes.trim()
      : `[${activePitchTemplate.title}]: ${activePitchTemplate.premise} | Climax: ${activePitchTemplate.scriptOutline.climax}`;

    const newSegment: Segment = {
      id: `seg-pitch-${Date.now()}`,
      segmentNumber: nextSegNum,
      category: 'Angle',
      angleType: activePitchTemplate.category,
      participantIds: participants,
      durationMinutes: pitchDuration,
      notes: notesSummary
    };

    onUpdateShowCard([...currentShowCard, newSegment]);
    showToast(`Pitch "${activePitchTemplate.title}" added to tonight's show card (#${nextSegNum})!`);
  };

  const handleRandomizePitchPairing = () => {
    if (promotion.roster.length < 2) return;
    const shuffled = [...promotion.roster].sort(() => 0.5 - Math.random());
    setPitchWrestlerA(shuffled[0].id);
    setPitchWrestlerB(shuffled[1].id);
    const randomPitch = PROMO_PITCH_PRESETS[Math.floor(Math.random() * PROMO_PITCH_PRESETS.length)];
    setSelectedPitchId(randomPitch.id);
    showToast(`Creative pairing randomized: ${shuffled[0].name} & ${shuffled[1].name}!`);
  };

  // ----------------------------------------------------
  // ACTIONS: MATCH SYNERGY LAB
  // ----------------------------------------------------
  const labParticipants = promotion.roster.filter(w => w.id === labWrestlerA || w.id === labWrestlerB);
  
  // Calculate simulated test evaluation
  const simulatedSegment: Segment = {
    id: 'sim-lab-seg',
    segmentNumber: 1,
    category: 'Match',
    matchType: labMatchType,
    participantIds: [labWrestlerA, labWrestlerB].filter(Boolean),
    winnerId: labWrestlerA,
    finishType: labFinishType,
    durationMinutes: labDuration,
    titleId: labTitleId || undefined
  };

  const simulatedEval = evaluateSegment(
    simulatedSegment,
    [simulatedSegment],
    promotion.roster,
    promotion.feuds,
    promotion
  );

  const handlePushLabMatchToShowCard = () => {
    if (labWrestlerA === labWrestlerB) {
      showToast('Select two different wrestlers for the match.');
      return;
    }
    const nextSegNum = currentShowCard.length + 1;
    const newSeg: Segment = {
      id: `seg-lab-${Date.now()}`,
      segmentNumber: nextSegNum,
      category: 'Match',
      matchType: labMatchType,
      participantIds: [labWrestlerA, labWrestlerB],
      winnerId: labWrestlerA,
      finishType: labFinishType,
      durationMinutes: labDuration,
      titleId: labTitleId || undefined,
      notes: `[Writers' Lab Dream Match]: High-chemistry matchup targeting ~${simulatedEval.stars.toFixed(2)} stars.`
    };

    onUpdateShowCard([...currentShowCard, newSeg]);
    showToast(`Match added to tonight's show card (#${nextSegNum})!`);
  };

  // ----------------------------------------------------
  // ACTIONS: CREATIVE NOTEBOOK
  // ----------------------------------------------------
  const handleSaveNewNote = () => {
    if (!newNoteTitle.trim() || !newNoteBody.trim()) {
      showToast('Please provide a title and note body.');
      return;
    }
    const note: CreativeNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      category: newNoteCategory,
      body: newNoteBody.trim(),
      taggedWrestlerIds: newNoteWrestlerId ? [newNoteWrestlerId] : [],
      isPinned: false,
      isResolved: false,
      createdWeek: currentWeek,
      createdYear: currentYear
    };
    const updated = [note, ...creativeNotes];
    onUpdatePromotion({
      ...promotion,
      creativeNotes: updated,
      storylineArcs: storylines
    });
    setShowAddNoteModal(false);
    setNewNoteTitle('');
    setNewNoteBody('');
    setNewNoteWrestlerId('');
    showToast('New booking memo saved to notebook!');
  };

  const handleTogglePinNote = (noteId: string) => {
    const updated = creativeNotes.map(n => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n);
    onUpdatePromotion({ ...promotion, creativeNotes: updated, storylineArcs: storylines });
  };

  const handleToggleResolveNote = (noteId: string) => {
    const updated = creativeNotes.map(n => n.id === noteId ? { ...n, isResolved: !n.isResolved } : n);
    onUpdatePromotion({ ...promotion, creativeNotes: updated, storylineArcs: storylines });
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = creativeNotes.filter(n => n.id !== noteId);
    onUpdatePromotion({ ...promotion, creativeNotes: updated, storylineArcs: storylines });
    showToast('Note deleted.');
  };

  // Filtered lists
  const filteredStorylines = storylines.filter(arc => {
    if (statusFilter === 'All') return true;
    return arc.status === statusFilter;
  });

  const filteredNotes = creativeNotes.filter(n => {
    if (noteCategoryFilter === 'All') return true;
    return n.category === noteCategoryFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner Navigation & Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <PenTool className="w-3.5 h-3.5" />
              <span>Head Booker Creative Suite • Week {currentWeek}, {currentYear}</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
              <span>Writers’ Room & Creative Hub</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Design episodic multi-week television arcs, pitch promo treatments and brawl angles, test dream match chemistry, and organize booking bibles. Send creative plans straight to your live show card with one click.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('book_show')}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Tv className="w-4 h-4" />
              <span>View Tonight's Card ({currentShowCard.length})</span>
            </button>
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>

        {/* Philosophy & Fast Stats Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-amber-400" /> Creative Philosophy
            </span>
            <select
              value={currentPhilosophy}
              onChange={e => handleUpdatePhilosophy(e.target.value as CreativePhilosophy)}
              aria-label="Creative Philosophy"
              className="mt-1 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500 font-sans"
            >
              <option value="Sports Entertainment Spectacle">Sports Entertainment Spectacle (+Promo Heat)</option>
              <option value="Workrate & Pure In-Ring Athleticism">Workrate & In-Ring Athletics (+Match Stars)</option>
              <option value="Crash TV & Shock Value">Crash TV & Shock Value (+Unpredictability)</option>
              <option value="Gritty Old-School Southern Territory">Gritty Old-School Territory (+Feud Longevity)</option>
            </select>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[11px] text-zinc-400">Active Storylines</span>
            <span className="text-base font-bold text-amber-400 mt-0.5">
              {storylines.filter(s => s.status === 'Active On TV').length} Active Arcs
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[11px] text-zinc-400">Tonight's Show Card</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5">
              {currentShowCard.length} Booked Segments
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[11px] text-zinc-400">Booking Memos</span>
            <span className="text-base font-bold text-sky-400 mt-0.5">
              {creativeNotes.filter(n => !n.isResolved).length} Pending Notes
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Tab Navigation Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('storylines')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'storylines'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Storylines & Arcs ({storylines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pitches')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'pitches'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Promo & Angle Pitch Board</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('synergy_lab')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'synergy_lab'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Dream Match Synergy Lab</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rundown_doctor')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'rundown_doctor'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>TV Rundown & Pacing Doctor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notebook')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'notebook'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Booking Bible & Notes ({creativeNotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('committee')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'committee'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Writers’ Committee Advice</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: STORYLINE ARCS & EPISODIC TV PLANNER */}
      {/* ============================================================ */}
      {activeTab === 'storylines' && (
        <div className="space-y-4">
          {/* Subheader and Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              <span className="text-zinc-500 uppercase mr-1">Status:</span>
              {(['All', 'Active On TV', 'Climax Ready', 'Drafting', 'Concluded'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                    statusFilter === st
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Forge New Storyline Arc</span>
            </button>
          </div>

          {/* Storyline Cards Grid */}
          {filteredStorylines.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-500 font-mono text-xs">
              No storylines found matching status "{statusFilter}". Click "Forge New Storyline Arc" to launch a new narrative.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredStorylines.map(arc => {
                const protagonist = promotion.roster.find(w => arc.protagonistIds.includes(w.id));
                const antagonist = promotion.roster.find(w => arc.antagonistIds.includes(w.id));
                const currentMilestone = arc.milestones[arc.currentMilestoneIndex];
                const targetTitle = promotion.titles.find(t => t.id === arc.targetTitleId);

                return (
                  <div 
                    key={arc.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm hover:border-zinc-700 transition"
                  >
                    {/* Header Row: Title, Archetype, Status */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
                          <span className="text-amber-400 font-bold">{arc.archetype}</span>
                          <span>•</span>
                          <span>Started Week {arc.startWeek}, {arc.startYear}</span>
                          {targetTitle && (
                            <>
                              <span>•</span>
                              <span className="text-amber-300 font-medium">🏆 {targetTitle.name}</span>
                            </>
                          )}
                          {arc.targetPPVName && (
                            <>
                              <span>•</span>
                              <span className="text-zinc-300">PPV Target: {arc.targetPPVName}</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white font-mono">{arc.title}</h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Heat & Momentum */}
                        <div className="flex items-center gap-2 text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded border border-zinc-800">
                          <Flame className={`w-4 h-4 ${arc.heat >= 80 ? 'text-orange-500' : 'text-amber-400'}`} />
                          <span className="text-zinc-300">Heat: <strong className="text-amber-400">{arc.heat}/100</strong></span>
                          <span className="text-zinc-500">|</span>
                          <span className="text-zinc-400">{arc.momentum}</span>
                        </div>

                        {/* Status Label */}
                        <div className="text-xs font-mono px-2.5 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-200">
                          {arc.status}
                        </div>
                      </div>
                    </div>

                    {/* Cast Showcase */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-zinc-800/70 text-xs font-mono">
                      {/* Protagonist */}
                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Protagonist / Hero</div>
                          <div className="text-sm font-bold text-sky-400 mt-0.5">
                            {protagonist ? protagonist.name : 'Unknown Wrestler'}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {protagonist?.alignment} • {protagonist?.push} • Overness: {protagonist?.overness}/100
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded bg-sky-950 text-sky-300 border border-sky-800 flex items-center justify-center font-bold">
                          FACE
                        </div>
                      </div>

                      {/* Antagonist */}
                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-zinc-500 uppercase tracking-wider">Antagonist / Rival</div>
                          <div className="text-sm font-bold text-rose-400 mt-0.5">
                            {antagonist ? antagonist.name : 'Unknown Wrestler'}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {antagonist?.alignment} • {antagonist?.push} • Overness: {antagonist?.overness}/100
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center justify-center font-bold">
                          HEEL
                        </div>
                      </div>
                    </div>

                    {/* Episodic Stepper Progress */}
                    <div className="py-4">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                        <span>Episodic Road to Climax:</span>
                        <span>
                          Step {arc.currentMilestoneIndex + 1} of {arc.milestones.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {arc.milestones.map((ms, idx) => {
                          const isCurrent = idx === arc.currentMilestoneIndex;
                          const isPassed = idx < arc.currentMilestoneIndex || ms.isCompleted;

                          return (
                            <div
                              key={ms.id}
                              className={`p-2.5 rounded-lg border text-xs font-mono transition ${
                                isCurrent
                                  ? 'bg-amber-500/10 border-amber-500/60 text-amber-200'
                                  : isPassed
                                  ? 'bg-zinc-950 border-emerald-800/60 text-zinc-400'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                                <span>Part {ms.stepNumber}</span>
                                {isPassed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : isCurrent ? (
                                  <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-400 font-bold">ACTIVE</span>
                                ) : null}
                              </div>
                              <div className={`font-semibold truncate ${isCurrent ? 'text-amber-300' : isPassed ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                {ms.title}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-1">
                                {ms.category} • {ms.segmentType}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Milestone Card & Booking Action */}
                    {currentMilestone && arc.status !== 'Concluded' && (
                      <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/40 mt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>NEXT CHAPTER ON TV: Step {currentMilestone.stepNumber} - {currentMilestone.title}</span>
                            </div>
                            <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-2xl">
                              {currentMilestone.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 mt-2">
                              <span>Segment: <strong className="text-zinc-200">{currentMilestone.category} ({currentMilestone.segmentType})</strong></span>
                              {currentMilestone.suggestedFinish && (
                                <>
                                  <span>•</span>
                                  <span>Suggested Finish: <strong className="text-zinc-200">{currentMilestone.suggestedFinish}</strong></span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePushMilestoneToShowCard(arc)}
                              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                              title="Instantly generate and push this chapter into tonight's TV show card"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Push to Tonight's Card</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAdvanceMilestone(arc.id)}
                              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center justify-center gap-1 transition"
                              title="Mark this chapter complete without booking"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Done</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Plot Twists & Feud Linkage Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-zinc-800/80 text-xs font-mono">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Plot Twist Action */}
                        {arc.status !== 'Concluded' && (
                          <button
                            type="button"
                            onClick={() => handleOpenTwistModal(arc)}
                            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                            title="Inject an authentic narrative plot twist (Betrayal, Attack, Screwjob, Steel Cage, Return)"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Inject Plot Twist</span>
                            {(arc.twistsAppliedCount || 0) > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[10px] font-bold">
                                {arc.twistsAppliedCount}
                              </span>
                            )}
                          </button>
                        )}

                        {/* Add Milestone Step */}
                        {arc.status !== 'Concluded' && (
                          <button
                            type="button"
                            onClick={() => handleOpenAddMilestoneModal(arc)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 transition"
                            title="Add a custom milestone step to this arc roadmap"
                          >
                            <Plus className="w-3 h-3 text-zinc-400" />
                            <span>Add Step</span>
                          </button>
                        )}

                        {/* Feud Synchronization Badge / Button */}
                        {arc.feudId ? (
                          (() => {
                            const linkedFeud = promotion.feuds.find(f => f.id === arc.feudId);
                            return linkedFeud ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs">
                                <LinkIcon className="w-3 h-3 text-emerald-400" />
                                <span>Feud: <strong>{linkedFeud.name}</strong> ({linkedFeud.heat} Heat)</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAutoCreateFeudForArc(arc)}
                                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1 transition"
                              >
                                <Swords className="w-3 h-3 text-amber-400" />
                                <span>Sync Feud</span>
                              </button>
                            );
                          })()
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAutoCreateFeudForArc(arc)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 transition"
                            title="Auto-register this rivalry into the Titles & Feuds engine"
                          >
                            <Swords className="w-3 h-3 text-amber-400" />
                            <span>+ Form Rivalry in Feuds</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {arc.status !== 'Concluded' ? (
                          <button
                            type="button"
                            onClick={() => handleConcludeArc(arc.id)}
                            className="text-zinc-400 hover:text-amber-400 transition"
                          >
                            Conclude Arc
                          </button>
                        ) : (
                          <span className="text-zinc-500 italic">Concluded</span>
                        )}
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteArc(arc.id)}
                          className="text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Applied Twists Tags */}
                    {arc.plotTwists && arc.plotTwists.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-zinc-900 text-[11px] font-mono text-amber-300/80">
                        <span className="text-zinc-500">Twists History:</span>
                        {arc.plotTwists.map((tw, tidx) => (
                          <span key={tidx} className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">
                            ⚡ {tw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PROMO & ANGLE PITCH BOARD */}
      {/* ============================================================ */}
      {activeTab === 'pitches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Preset Pitch Catalog */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono">Writers' Angle Presets</h3>
              <button
                type="button"
                onClick={handleRandomizePitchPairing}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Randomize</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {PROMO_PITCH_PRESETS.map(pitch => {
                const isSelected = pitch.id === selectedPitchId;
                return (
                  <button
                    key={pitch.id}
                    type="button"
                    onClick={() => setSelectedPitchId(pitch.id)}
                    className={`w-full text-left p-3 rounded-lg border transition flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={isSelected ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
                        {pitch.category}
                      </span>
                      <span className="text-zinc-500">{pitch.tone}</span>
                    </div>
                    <div className="font-bold text-xs font-mono text-white">{pitch.title}</div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {pitch.premise}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Treatment Pitch Room */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Creative Pitch Treatment & Producer Breakdown</span>
                </div>
                <h2 className="text-xl font-bold text-white font-mono">
                  {activePitchTemplate.title}
                </h2>
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 mt-1">
                  <span>Type: <strong className="text-zinc-200">{activePitchTemplate.category}</strong></span>
                  <span>•</span>
                  <span>Tone: <strong className="text-zinc-200">{activePitchTemplate.tone}</strong></span>
                  <span>•</span>
                  <span>Projected Heat: <strong className="text-amber-400">+{activePitchTemplate.projectedHeat}</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePushPitchToShowCard}
                className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition shadow shadow-amber-500/10 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Book Pitch to Show Card</span>
              </button>
            </div>

            {/* Casting Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono">
              <div>
                <label className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                  Primary Star (Lead Mic / Victim)
                </label>
                <select
                  value={pitchWrestlerA}
                  onChange={e => setPitchWrestlerA(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-sans"
                >
                  {promotion.roster.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.alignment}, Mic: {w.micSkills})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                  Secondary Star (Interrupter / Attacker)
                </label>
                <select
                  value={pitchWrestlerB}
                  onChange={e => setPitchWrestlerB(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-sans"
                >
                  <option value="">-- None (Solo Segment) --</option>
                  {promotion.roster.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.alignment}, Mic: {w.micSkills})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                  Segment Duration
                </label>
                <select
                  value={pitchDuration}
                  onChange={e => setPitchDuration(parseInt(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-sans"
                >
                  <option value={5}>5 Minutes (Quick Ambush)</option>
                  <option value={8}>8 Minutes (Standard Promo)</option>
                  <option value={12}>12 Minutes (Main Event Contract Signing)</option>
                  <option value={15}>15 Minutes (Epic Monologue / Town Hall)</option>
                </select>
              </div>
            </div>

            {/* Script Treatment Breakdown */}
            <div className="space-y-3 font-sans text-xs">
              <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800">
                <span className="font-mono font-bold text-amber-400 uppercase text-[11px] block mb-1">
                  Act I: Opening Setup
                </span>
                <p className="text-zinc-300 leading-relaxed">
                  {activePitchTemplate.scriptOutline.setup}
                </p>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800">
                <span className="font-mono font-bold text-amber-400 uppercase text-[11px] block mb-1">
                  Act II: Dramatic Conflict / Climax
                </span>
                <p className="text-zinc-300 leading-relaxed">
                  {activePitchTemplate.scriptOutline.climax}
                </p>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800">
                <span className="font-mono font-bold text-amber-400 uppercase text-[11px] block mb-1">
                  Act III: Cliffhanger Payoff
                </span>
                <p className="text-zinc-300 leading-relaxed">
                  {activePitchTemplate.scriptOutline.cliffhanger}
                </p>
              </div>
            </div>

            {/* Script Doctor Generator */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-amber-500/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-mono font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Live Script Doctor & In-Character Promo Beats</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Generate authentic episodic television dialogue beats, fire quotes, crowd cues, and camera blocking tailored to tonight's cast.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateScriptTreatment}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition shadow shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Script Beats</span>
                </button>
              </div>

              {scriptTreatment && (
                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-zinc-800">
                    <span className="text-amber-400 font-bold">{scriptTreatment.tagline}</span>
                    <span className="text-zinc-400">Predicted Heat: <strong className="text-emerald-400">{scriptTreatment.estimatedHeat}/100</strong></span>
                  </div>
                  <div className="text-zinc-300 font-sans leading-relaxed">
                    <strong className="font-mono text-sky-400 text-[11px] block">🎙️ Lead Mic Opening:</strong>
                    {scriptTreatment.protagonistOpeningBeat}
                  </div>
                  {scriptTreatment.antagonistCounterBeat && (
                    <div className="text-zinc-300 font-sans leading-relaxed pt-1">
                      <strong className="font-mono text-rose-400 text-[11px] block">🗣️ Rival Counter-Strike:</strong>
                      {scriptTreatment.antagonistCounterBeat}
                    </div>
                  )}
                  <div className="text-zinc-300 font-sans leading-relaxed pt-1">
                    <strong className="font-mono text-amber-300 text-[11px] block">💥 Physical Action / Staging:</strong>
                    {scriptTreatment.physicalActionBeat}
                  </div>
                  <div className="text-zinc-400 font-sans text-[11px] pt-1">
                    <strong className="font-mono text-zinc-300 text-[10px] block">🏟️ Arena Crowd Cue:</strong>
                    {scriptTreatment.crowdReactionBeat}
                  </div>
                </div>
              )}
            </div>

            {/* Producer's Notes & Camera Framing */}
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono">
              <span className="text-zinc-400 font-bold block mb-1">
                🎥 Director & Producer Execution Notes:
              </span>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                {activePitchTemplate.producerNotes}
              </p>
            </div>

            {/* Custom Notes / Overrides */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-zinc-400 block">
                  Head Booker Custom Script Notes (Appended to Show Card):
                </label>
                {scriptTreatment && (
                  <button
                    type="button"
                    onClick={() => {
                      const scriptNotes = `[${scriptTreatment.title}]\n• Opening: ${scriptTreatment.protagonistOpeningBeat}\n• Counter: ${scriptTreatment.antagonistCounterBeat}\n• Action: ${scriptTreatment.physicalActionBeat}\n• Crowd: ${scriptTreatment.crowdReactionBeat}`;
                      setCustomPitchNotes(scriptNotes);
                      showToast('Copied script treatment into notes!');
                    }}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Re-paste Script</span>
                  </button>
                )}
              </div>
              <textarea
                value={customPitchNotes}
                onChange={e => setCustomPitchNotes(e.target.value)}
                placeholder="Add custom dialogue cues, table spots, security names, or broadcast stipulations..."
                className="w-full h-24 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: DREAM MATCH SYNERGY LAB */}
      {/* ============================================================ */}
      {activeTab === 'synergy_lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>Match Simulation Controls</span>
            </h3>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Wrestler A (Winner)</label>
              <select
                value={labWrestlerA}
                onChange={e => setLabWrestlerA(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                {promotion.roster.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.style}, Wk: {w.workrate}, Over: {w.overness})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Wrestler B (Opponent)</label>
              <select
                value={labWrestlerB}
                onChange={e => setLabWrestlerB(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                {promotion.roster.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.style}, Wk: {w.workrate}, Over: {w.overness})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Match Type</label>
              <select
                value={labMatchType}
                onChange={e => setLabMatchType(e.target.value as MatchType)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                <option value="Singles">Singles Match</option>
                <option value="Steel Cage">Steel Cage Match</option>
                <option value="Ladder Match">Ladder Match</option>
                <option value="Iron Man (30 Min)">Iron Man (30 Min)</option>
                <option value="Hardcore / No DQ">Hardcore / No DQ</option>
                <option value="Submission Match">Submission Match</option>
                <option value="Hell in a Cell">Hell in a Cell</option>
                <option value="Last Man Standing">Last Man Standing</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Finish Type</label>
              <select
                value={labFinishType}
                onChange={e => setLabFinishType(e.target.value as FinishType)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                <option value="Clean Pinfall">Clean Pinfall</option>
                <option value="Submission">Submission</option>
                <option value="Distraction Rollup">Distraction Rollup</option>
                <option value="Disqualification (DQ)">Disqualification (DQ)</option>
                <option value="Weapon / Foreign Object">Weapon / Foreign Object</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Duration: {labDuration} Minutes</label>
              <input
                type="range"
                min={5}
                max={40}
                value={labDuration}
                onChange={e => setLabDuration(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Title on the Line (Optional)</label>
              <select
                value={labTitleId}
                onChange={e => setLabTitleId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                <option value="">-- No Championship at Stake --</option>
                {promotion.titles.filter(t => !t.isRetired).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Prestige: {t.prestige})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handlePushLabMatchToShowCard}
              disabled={labWrestlerA === labWrestlerB}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <Send className="w-4 h-4" />
              <span>Send Match to Show Card</span>
            </button>
          </div>

          {/* Live Chemistry & Star Rating Prediction */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-0.5">
                  Pre-Broadcast Chemistry & Evaluation Engine
                </div>
                <h2 className="text-xl font-bold text-white font-mono">
                  Synergy & Star Rating Forecast
                </h2>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono text-zinc-400 uppercase">Estimated Rating</div>
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  {simulatedEval.stars.toFixed(2)} ★
                </div>
                <div className="text-[11px] font-mono text-zinc-400">{simulatedEval.score}/100 Score</div>
              </div>
            </div>

            {/* Participants Card */}
            <div className="grid grid-cols-2 gap-4">
              {labParticipants.map(w => (
                <div key={w.id} className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 text-xs font-mono">
                  <div className="text-base font-bold text-white">{w.name}</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    {w.style} • {w.alignment} • {w.push}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-800 text-center">
                    <div>
                      <div className="text-[10px] text-zinc-500">WORKRATE</div>
                      <div className="font-bold text-amber-300">{w.workrate}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">OVERNESS</div>
                      <div className="font-bold text-sky-300">{w.overness}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">STAMINA</div>
                      <div className="font-bold text-emerald-300">{w.stamina}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Engine Breakdown */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 text-xs font-mono">
              <div className="text-zinc-300 font-bold uppercase text-[11px]">
                Algorithm Scoring Drivers & Penalties
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Workrate Part</div>
                  <div className="text-sm font-bold text-amber-400">
                    +{simulatedEval.breakdown.workratePart || 0} pts
                  </div>
                </div>
                <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Overness Part</div>
                  <div className="text-sm font-bold text-sky-400">
                    +{simulatedEval.breakdown.overnessPart || 0} pts
                  </div>
                </div>
                <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Feud Heat Bonus</div>
                  <div className="text-sm font-bold text-orange-400">
                    +{simulatedEval.breakdown.feudBonus || 0} pts
                  </div>
                </div>
                <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Fatigue Risk</div>
                  <div className="text-sm font-bold text-rose-400">
                    -{simulatedEval.breakdown.staminaFatiguePenalty || 0} pts
                  </div>
                </div>
                <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Duration Match</div>
                  <div className="text-sm font-bold text-zinc-300">
                    {simulatedEval.breakdown.durationMismatchPenalty > 0 ? `-${simulatedEval.breakdown.durationMismatchPenalty} pts` : 'Optimal'}
                  </div>
                </div>
                <div className="bg-zinc-900 p-2.5 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">Finish Penalty</div>
                  <div className="text-sm font-bold text-zinc-300">
                    {simulatedEval.breakdown.finishPenalty > 0 ? `-${simulatedEval.breakdown.finishPenalty} pts` : 'Clean'}
                  </div>
                </div>
              </div>

              {/* Simulation Notes */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="text-zinc-400 text-[11px] mb-1">Simulated Booker Feedback:</div>
                <ul className="space-y-1 text-zinc-300 text-xs font-sans">
                  {simulatedEval.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 shrink-0">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: TV SHOW FORMAT & RUNDOWN DOCTOR */}
      {/* ============================================================ */}
      {activeTab === 'rundown_doctor' && (
        <div className="space-y-6">
          {/* Header Controls & Runtime Target */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Episodic Television Formatting & Pacing Engine</span>
                </div>
                <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                  <span>TV Show Format & Rundown Doctor</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
                  Real-time broadcast diagnostics: audits tonight's card for pacing, star power, title defenses, and audience fatigue. Use one-click formatting to automatically construct a balanced broadcast.
                </p>
              </div>

              {/* Target Broadcast Runtime */}
              <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800 font-mono text-xs">
                <span className="text-zinc-400">TV Time Slot:</span>
                {[60, 90, 120].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTargetShowDuration(mins)}
                    className={`px-2.5 py-1 rounded text-xs transition ${
                      targetShowDuration === mins
                        ? 'bg-amber-500 text-black font-bold shadow'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Live TV Flow Grade & Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1 font-mono text-xs">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Broadcast Flow Grade</div>
                  <div className={`text-2xl font-bold mt-1 ${
                    showAudit.score >= 85 ? 'text-emerald-400' : showAudit.score >= 70 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {showAudit.grade} ({showAudit.score}/100)
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-lg text-amber-400">
                  {showAudit.grade[0]}
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Booked Broadcast Runtime</div>
                <div className="text-xl font-bold text-white mt-1">
                  {showAudit.totalMinutesBooked} / {targetShowDuration} <span className="text-xs text-zinc-400">mins</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      showAudit.totalMinutesBooked > targetShowDuration + 15
                        ? 'bg-rose-500'
                        : showAudit.totalMinutesBooked < targetShowDuration - 20
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (showAudit.totalMinutesBooked / targetShowDuration) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Match vs. Promo Ratio</div>
                <div className="text-sm font-bold text-white mt-1">
                  <span className="text-amber-400">{showAudit.matchCount} Matches ({showAudit.matchRatio}%)</span>
                  {' • '}
                  <span className="text-sky-400">{showAudit.angleCount} Promos ({showAudit.angleRatio}%)</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 mt-2 flex overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${showAudit.matchRatio}%` }} />
                  <div className="bg-sky-400 h-full" style={{ width: `${showAudit.angleRatio}%` }} />
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Card Status</div>
                <div className="text-base font-bold text-white mt-1">
                  {currentShowCard.length === 0 ? 'Card Empty' : `${currentShowCard.length} Segments Set`}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {showAudit.hasTitleDefense ? '🏆 Title on line' : 'No title booked'}
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFormatShowCard}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition shadow shadow-amber-500/10"
                  title="Generate a fully balanced, episodic television episode from scratch"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>✨ Auto-Format Balanced TV Episode</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoFillRemainingShow}
                  disabled={showAudit.totalMinutesBooked >= targetShowDuration}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-mono text-xs flex items-center gap-1.5 transition"
                  title="Add logical matches/angles to hit the TV runtime target"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Fill Remaining Time</span>
                </button>

                {currentShowCard.length > 0 && (
                  showClearConfirm ? (
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <button
                        type="button"
                        onClick={handleClearShowCard}
                        className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition"
                      >
                        Confirm Clear Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3 py-2 rounded-lg bg-zinc-800/80 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-300 font-mono text-xs flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Card</span>
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('book_show')}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold flex items-center gap-2 transition"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Go to Live Show Matchmaker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Diagnostic Inspection Checklist */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h4 className="font-mono font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Head Writer Pacing & Television Flow Diagnostics</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {showAudit.pacingNotes.map((note, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 font-sans ${
                    note.type === 'success'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                      : note.type === 'warning'
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  }`}
                >
                  {note.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : note.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{note.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rundown Schedule Card List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h4 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                Tonight's Episodic Rundown ({currentShowCard.length} Segments)
              </h4>
              <span className="text-xs font-mono text-zinc-500">
                Total Runtime: {showAudit.totalMinutesBooked} Minutes
              </span>
            </div>

            {currentShowCard.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs bg-zinc-950 rounded-lg border border-zinc-800">
                Card is empty. Click "✨ Auto-Format Balanced TV Episode" above to generate a full television episode automatically, or book individual angles from the Pitch Board!
              </div>
            ) : (
              <div className="space-y-2">
                {currentShowCard.map((seg, idx) => {
                  const participants = promotion.roster.filter(w => seg.participantIds.includes(w.id));
                  const isMainEvent = idx === currentShowCard.length - 1;
                  const isOpener = idx === 0;

                  return (
                    <div
                      key={seg.id}
                      className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                          #{seg.segmentNumber || idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              seg.category === 'Match' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            }`}>
                              {seg.category === 'Match' ? seg.matchType : seg.angleType}
                            </span>
                            {isOpener && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                                OPENER
                              </span>
                            )}
                            {isMainEvent && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">
                                MAIN EVENT
                              </span>
                            )}
                            {seg.titleId && (
                              <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px]">
                                🏆 TITLE DEFENSE
                              </span>
                            )}
                          </div>
                          <div className="text-white font-bold mt-1">
                            {participants.map(p => p.name).join(' vs. ') || 'Unassigned Talent'}
                          </div>
                          {seg.notes && (
                            <p className="text-[11px] text-zinc-400 font-sans mt-0.5 line-clamp-1">
                              {seg.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{seg.durationMinutes} mins</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = currentShowCard.filter((_, i) => i !== idx);
                            // renumber
                            const renumbered = updated.map((s, i) => ({ ...s, segmentNumber: i + 1 }));
                            onUpdateShowCard(renumbered);
                            showToast(`Removed segment #${idx + 1}`);
                          }}
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition"
                          title="Remove segment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: HEAD WRITER'S CREATIVE NOTEBOOK */}
      {/* ============================================================ */}
      {activeTab === 'notebook' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              <span className="text-zinc-500 uppercase mr-1">Category:</span>
              {(['All', 'TV Cliffhanger', 'PPV Main Event', 'Call-Up & Repackaging', 'Gimmick & Faction', 'Push & Derail'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNoteCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                    noteCategoryFilter === cat
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddNoteModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Booking Memo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map(note => {
              const taggedWrestler = note.taggedWrestlerIds?.[0]
                ? promotion.roster.find(w => w.id === note.taggedWrestlerIds?.[0])
                : undefined;

              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                    note.isPinned
                      ? 'bg-zinc-900 border-amber-500/60 shadow-sm shadow-amber-500/5'
                      : note.isResolved
                      ? 'bg-zinc-900/40 border-zinc-800 opacity-60'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold">{note.category}</span>
                        <span>•</span>
                        <span>Week {note.createdWeek}, {note.createdYear}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePinNote(note.id)}
                          className={`p-1 rounded hover:bg-zinc-800 transition ${note.isPinned ? 'text-amber-400' : 'text-zinc-500'}`}
                          title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleResolveNote(note.id)}
                          className={`p-1 rounded hover:bg-zinc-800 transition ${note.isResolved ? 'text-emerald-400' : 'text-zinc-500'}`}
                          title={note.isResolved ? 'Mark active' : 'Mark executed / resolved'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition"
                          title="Delete memo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className={`text-base font-bold font-mono mb-2 ${note.isResolved ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {note.title}
                    </h4>

                    <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-line">
                      {note.body}
                    </p>
                  </div>

                  {taggedWrestler && (
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400 flex items-center justify-between">
                      <span>Assigned Superstar:</span>
                      <strong className="text-amber-300">{taggedWrestler.name}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: CREATIVE COMMITTEE & WRITERS' ROOM */}
      {/* ============================================================ */}
      {activeTab === 'committee' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white font-mono mb-1">
              Creative Committee & Advisory Board
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
              Meet your backstage brain trust. These four booking agents and executives analyze your weekly cards, feud pacing, and character development, giving you authentic guidance to maximize ratings and avoid burnout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WRITERS_ROOM_AGENTS.map((agent, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-2xl">
                    {agent.avatarIcon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white font-mono text-base">{agent.name}</h4>
                    <div className="text-xs font-mono text-amber-400">{agent.role}</div>
                  </div>
                </div>

                <div className="text-xs font-mono bg-zinc-950 p-2.5 rounded border border-zinc-800 text-zinc-300">
                  <span className="text-zinc-500 uppercase text-[10px] block">Philosophy:</span>
                  {agent.philosophy}
                </div>

                <blockquote className="text-xs italic text-zinc-300 font-sans leading-relaxed border-l-2 border-amber-500/60 pl-3 py-0.5">
                  {agent.advice}
                </blockquote>

                <div className="text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-500">Pro Tip:</span>
                  <span className="text-zinc-200">{agent.bookingTip}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Roster Balance Creative Audit */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono">
              Roster Creative Audit & Locker Room Balance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">Faces vs Heels</div>
                <div className="text-base font-bold text-white mt-1">
                  <span className="text-sky-400">{promotion.roster.filter(w => w.alignment === 'Face').length} Faces</span>
                  {' / '}
                  <span className="text-rose-400">{promotion.roster.filter(w => w.alignment === 'Heel').length} Heels</span>
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">Active Main Eventers</div>
                <div className="text-base font-bold text-amber-400 mt-1">
                  {promotion.roster.filter(w => w.push === 'Main Eventer').length} Superstars
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">High Fatigue Stars (&gt;40)</div>
                <div className="text-base font-bold text-rose-400 mt-1">
                  {promotion.roster.filter(w => w.fatigue >= 40).length} Need Rest
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="text-zinc-500 text-[10px]">Active Rivalries</div>
                <div className="text-base font-bold text-emerald-400 mt-1">
                  {promotion.feuds.length} Feuds Simmering
                </div>
              </div>
            </div>
          </div>

          {/* Gimmick Repackaging & Creative Revitalization Lab */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Creative Repackaging & Gimmick Revitalization Lab</span>
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Is a superstar's momentum stalling? The creative committee can pitch a total aesthetic overhaul, alignment turn, and fresh gimmick persona with boosted morale (+10).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                  Talent to Repackage
                </label>
                <select
                  value={repackageTalentId}
                  onChange={e => setRepackageTalentId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-2 font-sans focus:outline-none focus:border-amber-500"
                >
                  {promotion.roster.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.alignment}, Overness: {w.overness}, Morale: {w.morale})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                  Target Alignment Turn
                </label>
                <select
                  value={repackageAlignment}
                  onChange={e => setRepackageAlignment(e.target.value as 'Face' | 'Heel')}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-2 font-sans focus:outline-none focus:border-amber-500"
                >
                  <option value="Face">Babyface (Fan Hero / Respected Warrior)</option>
                  <option value="Heel">Heel (Arrogant Villain / Ruthless Enforcer)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-1">
                  New Persona & Character Motif
                </label>
                <select
                  value={repackageCategory}
                  onChange={e => setRepackageCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-2 font-sans focus:outline-none focus:border-amber-500"
                >
                  <option value="Dark Cult Leader / Occultist">Dark Cult Leader / Occultist</option>
                  <option value="Corporate Handpicked Champion">Corporate Handpicked Champion</option>
                  <option value="Unhinged Hardcore Lunatic">Unhinged Hardcore Lunatic</option>
                  <option value="Pure Submission Grappling Purist">Pure Submission Grappling Purist</option>
                  <option value="Hollywood Celebrity / Arrogant Megastar">Hollywood Celebrity / Arrogant Megastar</option>
                  <option value="Masked High-Flying Avenger">Masked High-Flying Avenger</option>
                  <option value="Old-School Bruiser / Blue-Collar Brawler">Old-School Bruiser / Blue-Collar Brawler</option>
                  <option value="Rockstar / Glamour Entertainer">Rockstar / Glamour Entertainer</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs font-mono text-zinc-400">
                Projected Success Rating: <strong className="text-emerald-400 font-bold">Grade A (High Crowd Intrigue)</strong>
              </div>
              <button
                type="button"
                onClick={handleApplyRepackage}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Execute Creative Repackage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: FORGE NEW STORYLINE ARC */}
      {/* ============================================================ */}
      {showCreateModal && (() => {
        const filteredArchetypes = archetypeFilterCategory === 'All'
          ? STORYLINE_ARCHETYPES_CATALOG
          : STORYLINE_ARCHETYPES_CATALOG.filter(c => c.recommendedCategory === archetypeFilterCategory);

        const currentBlueprint = STORYLINE_ARCHETYPES_CATALOG.find(c => c.archetype === newArcArchetype) || STORYLINE_ARCHETYPES_CATALOG[0];

        return (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 font-mono">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">
                    Forge New Storyline Arc
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    {STORYLINE_ARCHETYPES_CATALOG.length} Archetypes Available
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-500 hover:text-white font-mono text-sm p-1 rounded hover:bg-zinc-800 transition"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Archetype Category Filter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="font-bold uppercase tracking-wider text-zinc-300">1. Select Narrative Category</span>
                  <span className="text-[11px] text-zinc-500">Filter blueprints by feud style</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
                  {(['All', 'World Title', 'Grudge Feud', 'Tag Division', 'Midcard Ascension'] as const).map(cat => {
                    const count = cat === 'All'
                      ? STORYLINE_ARCHETYPES_CATALOG.length
                      : STORYLINE_ARCHETYPES_CATALOG.filter(c => c.recommendedCategory === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setArchetypeFilterCategory(cat);
                          const firstInCat = cat === 'All' 
                            ? STORYLINE_ARCHETYPES_CATALOG[0]
                            : STORYLINE_ARCHETYPES_CATALOG.find(c => c.recommendedCategory === cat);
                          if (firstInCat) setNewArcArchetype(firstInCat.archetype);
                        }}
                        className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                          archetypeFilterCategory === cat
                            ? 'bg-amber-500 text-black font-bold shadow'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Narrative Archetype Dropdown */}
              <div>
                <label className="text-xs font-mono text-zinc-300 font-bold block mb-1">
                  2. Narrative Storyline Archetype ({filteredArchetypes.length} options)
                </label>
                <select
                  value={newArcArchetype}
                  onChange={e => setNewArcArchetype(e.target.value as StorylineArchetype)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                >
                  {filteredArchetypes.map(cat => (
                    <option key={cat.archetype} value={cat.archetype}>
                      {cat.name} — [{cat.recommendedCategory}] ({cat.suggestedDurationWeeks} Weeks)
                    </option>
                  ))}
                </select>
              </div>

              {/* Narrative Blueprint Preview Card */}
              {currentBlueprint && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-white font-mono">{currentBlueprint.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                        {currentBlueprint.recommendedCategory}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {currentBlueprint.suggestedDurationWeeks} Weeks Arc
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-amber-300/90 font-sans italic leading-snug">
                    "{currentBlueprint.tagline}"
                  </p>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    {currentBlueprint.description}
                  </p>

                  {/* 4-Step Milestone Roadmap Preview */}
                  <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider">
                      Episodic TV Milestones Roadmap (4 Weeks)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentBlueprint.milestones.map((m, idx) => (
                        <div key={idx} className="p-2 rounded bg-zinc-900/90 border border-zinc-800/80 flex flex-col justify-between text-[11px]">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-amber-400 font-bold">
                                Step {idx + 1}
                              </span>
                              <span className="font-mono text-[9px] text-zinc-400">
                                {m.category === 'Match' ? '⚔️ ' : '🎤 '}{m.segmentType}
                              </span>
                            </div>
                            <div className="font-bold text-white font-mono text-[11px] truncate">
                              {m.title}
                            </div>
                            <p className="text-[10px] text-zinc-400 font-sans line-clamp-2 mt-0.5 leading-snug">
                              {m.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Storyline Title & Auto-Suggest */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-zinc-300 font-bold">
                    3. Storyline Title <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestStorylineTitle}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono hover:underline"
                    title="Generate a custom headline based on archetype and rivals"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>🎲 Suggest Title</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newArcTitle}
                  onChange={e => setNewArcTitle(e.target.value)}
                  placeholder="e.g. The Mountain Climb, Student Surpasses Master..."
                  className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Step 4: Protagonist and Antagonist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-zinc-300 font-bold block mb-1">
                    Protagonist / Hero / Face <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={newProtagonistId}
                    onChange={e => setNewProtagonistId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
                  >
                    {promotion.roster.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} [{w.alignment}] — {w.push} ({w.overness} Over)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-300 font-bold block mb-1">
                    Antagonist / Rival / Heel <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={newAntagonistId}
                    onChange={e => setNewAntagonistId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
                  >
                    {promotion.roster.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} [{w.alignment}] — {w.push} ({w.overness} Over)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 5: Climax PPV & Championship Stake */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-zinc-300 font-bold block mb-1">
                    Target Climax Pay-Per-View
                  </label>
                  <select
                    value={newTargetPPV}
                    onChange={e => setNewTargetPPV(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
                  >
                    {(promotion.ppvSchedule || []).map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name} (Wk {p.weekNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-300 font-bold block mb-1">
                    Championship at Stake
                  </label>
                  <select
                    value={newTargetTitleId}
                    onChange={e => setNewTargetTitleId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Non-Title Feud --</option>
                    {promotion.titles.filter(t => !t.isRetired).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 6: Starting Narrative Heat */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    Starting TV Heat Level: {newArcStartingHeat}/100
                  </span>
                  <span className="text-[11px] text-zinc-400 font-sans">
                    Initial buzz and television intrigue when the narrative launches
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  {[65, 75, 85, 95].map(heatVal => (
                    <button
                      key={heatVal}
                      type="button"
                      onClick={() => setNewArcStartingHeat(heatVal)}
                      className={`px-2.5 py-1 rounded transition text-[11px] font-bold ${
                        newArcStartingHeat === heatVal
                          ? 'bg-amber-500 text-black shadow'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {heatVal}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewStoryline}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition shadow flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Launch Arc Into Production</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================ */}
      {/* MODAL: ADD BOOKING NOTE */}
      {/* ============================================================ */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>New Booking Memo</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddNoteModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Memo Title</label>
              <input
                type="text"
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                placeholder="e.g. Plan Summer PPV Main Event, Push Rookie..."
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Category</label>
                <select
                  value={newNoteCategory}
                  onChange={e => setNewNoteCategory(e.target.value as CreativeNote['category'])}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  <option value="TV Cliffhanger">TV Cliffhanger</option>
                  <option value="PPV Main Event">PPV Main Event</option>
                  <option value="Call-Up & Repackaging">Call-Up & Repackaging</option>
                  <option value="Gimmick & Faction">Gimmick & Faction</option>
                  <option value="Push & Derail">Push & Derail</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Assigned Wrestler (Optional)</label>
                <select
                  value={newNoteWrestlerId}
                  onChange={e => setNewNoteWrestlerId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- No Talent Assigned --</option>
                  {promotion.roster.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Memo Details</label>
              <textarea
                value={newNoteBody}
                onChange={e => setNewNoteBody(e.target.value)}
                placeholder="Write specific creative notes, turn details, finish protections, or tournament brackets..."
                className="w-full h-28 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddNoteModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewNote}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition shadow"
              >
                Save Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: INJECT DRAMATIC PLOT TWIST */}
      {/* ============================================================ */}
      {showTwistModal && selectedArcForTwist && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Inject Narrative Plot Twist</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Storyline Arc: <strong className="text-amber-300 font-mono">{selectedArcForTwist.title}</strong> ({selectedArcForTwist.heat}/100 Heat)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTwistModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                Select Dramatic Plot Twist Blueprint:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {PLOT_TWIST_CATALOG.map(tw => {
                  const isSelected = tw.id === selectedTwistId;
                  return (
                    <button
                      key={tw.id}
                      type="button"
                      onClick={() => setSelectedTwistId(tw.id)}
                      className={`text-left p-3 rounded-lg border transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="flex items-center gap-1.5 font-bold">
                            <span>{tw.icon}</span>
                            <span className={isSelected ? 'text-amber-400' : 'text-zinc-300'}>{tw.name}</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-2">
                          {tw.tagline}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono pt-2 mt-2 border-t border-zinc-900 text-zinc-400">
                        <span className="text-amber-400 font-bold">+{tw.heatBonus} Heat</span>
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">{tw.crowdPop}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Twist Preview Details */}
            {(() => {
              const activeTwist = PLOT_TWIST_CATALOG.find(t => t.id === selectedTwistId) || PLOT_TWIST_CATALOG[0];
              return (
                <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-400 font-bold uppercase">{activeTwist.name}</span>
                    <span className="text-emerald-400">Momentum: White Hot</span>
                  </div>
                  <p className="text-zinc-300 font-sans leading-relaxed">
                    {activeTwist.description}
                  </p>
                  <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-900 flex items-center justify-between">
                    <span>Generated Step: <strong className="text-zinc-200">{activeTwist.milestoneTitle}</strong></span>
                    <span>Format: {activeTwist.milestoneCategory} ({activeTwist.milestoneSegmentType})</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowTwistModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePlotTwist}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <Zap className="w-4 h-4" />
                <span>Execute & Apply Plot Twist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD CUSTOM MILESTONE STEP */}
      {/* ============================================================ */}
      {showAddMilestoneModal && selectedArcForMilestone && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  <span>Add Custom Milestone Step</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Arc: <strong className="text-amber-300 font-mono">{selectedArcForMilestone.title}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMilestoneModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Step Title</label>
              <input
                type="text"
                value={customMsTitle}
                onChange={e => setCustomMsTitle(e.target.value)}
                placeholder="e.g. The Face-Off Contract Signing, Steel Cage War..."
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Category</label>
                <select
                  value={customMsCategory}
                  onChange={e => {
                    const cat = e.target.value as 'Match' | 'Angle';
                    setCustomMsCategory(cat);
                    setCustomMsType(cat === 'Match' ? 'Singles' : 'In-Ring Promo');
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  <option value="Angle">Angle / Promo / Brawl</option>
                  <option value="Match">In-Ring Match</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Segment Format</label>
                <select
                  value={customMsType}
                  onChange={e => setCustomMsType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  {customMsCategory === 'Angle' ? (
                    <>
                      <option value="In-Ring Promo">In-Ring Promo</option>
                      <option value="Backstage Interview">Backstage Interview</option>
                      <option value="Brawl / Pull-Apart">Brawl / Pull-Apart</option>
                      <option value="Contract Signing">Contract Signing</option>
                      <option value="Confrontation / Staredown">Confrontation / Staredown</option>
                      <option value="Parking Lot Brawl">Parking Lot Brawl</option>
                      <option value="Faction Beatdown">Faction Beatdown</option>
                    </>
                  ) : (
                    <>
                      <option value="Singles">Singles Match</option>
                      <option value="Steel Cage">Steel Cage Match</option>
                      <option value="No Holds Barred">No Holds Barred / Street Fight</option>
                      <option value="Ladder Match">Ladder Match</option>
                      <option value="Submission Match">Submission Match</option>
                      <option value="Last Man Standing">Last Man Standing</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {customMsCategory === 'Match' && (
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Suggested Finish</label>
                <select
                  value={customMsFinish}
                  onChange={e => setCustomMsFinish(e.target.value as FinishType)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  <option value="Clean Pinfall">Clean Pinfall</option>
                  <option value="Submission">Submission</option>
                  <option value="Distraction Rollup">Distraction Rollup</option>
                  <option value="Disqualification (DQ)">Disqualification (DQ)</option>
                  <option value="Weapon / Foreign Object">Weapon / Foreign Object</option>
                  <option value="Referee Stoppage">Referee Stoppage</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Chapter Description / Booking Directive</label>
              <textarea
                value={customMsDesc}
                onChange={e => setCustomMsDesc(e.target.value)}
                placeholder="Outline what needs to happen in this episode..."
                className="w-full h-24 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddMilestoneModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomMilestone}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition shadow"
              >
                Add Step to Storyline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

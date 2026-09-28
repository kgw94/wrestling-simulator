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
  GameView
} from '../types';
import { 
  STORYLINE_ARCHETYPES_CATALOG, 
  PROMO_PITCH_PRESETS, 
  DEFAULT_CREATIVE_NOTES, 
  WRITERS_ROOM_AGENTS,
  generateDefaultStorylines
} from '../data/customDefaults';
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
  Send
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

type WritersTab = 'storylines' | 'pitches' | 'synergy_lab' | 'notebook' | 'committee';

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
  // STORYLINE CREATION MODAL STATE
  // ----------------------------------------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newArcTitle, setNewArcTitle] = useState('');
  const [newArcArchetype, setNewArcArchetype] = useState<StorylineArchetype>('Underdog Title Chase');
  const [newProtagonistId, setNewProtagonistId] = useState<string>(promotion.roster[0]?.id || '');
  const [newAntagonistId, setNewAntagonistId] = useState<string>(promotion.roster[1]?.id || '');
  const [newTargetTitleId, setNewTargetTitleId] = useState<string>('');
  const [newTargetPPV, setNewTargetPPV] = useState<string>(
    promotion.ppvSchedule?.[0]?.name || 'Genesis Supercard'
  );

  // ----------------------------------------------------
  // PROMO PITCH GENERATOR STATE
  // ----------------------------------------------------
  const [selectedPitchId, setSelectedPitchId] = useState<string>(PROMO_PITCH_PRESETS[0].id);
  const [pitchWrestlerA, setPitchWrestlerA] = useState<string>(promotion.roster[0]?.id || '');
  const [pitchWrestlerB, setPitchWrestlerB] = useState<string>(promotion.roster[1]?.id || '');
  const [pitchDuration, setPitchDuration] = useState<number>(8);
  const [customPitchNotes, setCustomPitchNotes] = useState<string>('');

  // ----------------------------------------------------
  // SYNERGY / DREAM MATCH LAB STATE
  // ----------------------------------------------------
  const [labWrestlerA, setLabWrestlerA] = useState<string>(promotion.roster[0]?.id || '');
  const [labWrestlerB, setLabWrestlerB] = useState<string>(promotion.roster[1]?.id || '');
  const [labMatchType, setLabMatchType] = useState<MatchType>('Singles');
  const [labFinishType, setLabFinishType] = useState<FinishType>('Clean Pinfall');
  const [labDuration, setLabDuration] = useState<number>(18);
  const [labTitleId, setLabTitleId] = useState<string>('');

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

    const newArc: StorylineArc = {
      id: `arc-${Date.now()}`,
      title: newArcTitle.trim(),
      archetype: newArcArchetype,
      protagonistIds: [newProtagonistId],
      antagonistIds: [newAntagonistId],
      targetPPVName: newTargetPPV,
      targetTitleId: newTargetTitleId || undefined,
      heat: 75,
      momentum: 'Boiling Hot',
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

                    {/* Arc Footer Actions */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-500">
                      <span>{arc.notes || 'No custom booking notes.'}</span>
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
              <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                Head Booker Custom Script Notes (Appended to Show Card):
              </label>
              <textarea
                value={customPitchNotes}
                onChange={e => setCustomPitchNotes(e.target.value)}
                placeholder="Add custom dialogue cues, table spots, security names, or broadcast stipulations..."
                className="w-full h-20 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 font-mono"
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
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: FORGE NEW STORYLINE ARC */}
      {/* ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Forge New Storyline Arc</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Storyline Title</label>
              <input
                type="text"
                value={newArcTitle}
                onChange={e => setNewArcTitle(e.target.value)}
                placeholder="e.g. The Apex Championship Quest, Grudge Blood War..."
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Narrative Archetype</label>
              <select
                value={newArcArchetype}
                onChange={e => setNewArcArchetype(e.target.value as StorylineArchetype)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-3 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                {STORYLINE_ARCHETYPES_CATALOG.map(cat => (
                  <option key={cat.archetype} value={cat.archetype}>
                    {cat.name} ({cat.recommendedCategory})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                {STORYLINE_ARCHETYPES_CATALOG.find(c => c.archetype === newArcArchetype)?.tagline}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Protagonist / Face</label>
                <select
                  value={newProtagonistId}
                  onChange={e => setNewProtagonistId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  {promotion.roster.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.alignment})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Antagonist / Heel</label>
                <select
                  value={newAntagonistId}
                  onChange={e => setNewAntagonistId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  {promotion.roster.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.alignment})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Target Climax PPV</label>
                <select
                  value={newTargetPPV}
                  onChange={e => setNewTargetPPV(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  {(promotion.ppvSchedule || []).map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} (Wk {p.weekNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Championship at Stake</label>
                <select
                  value={newTargetTitleId}
                  onChange={e => setNewTargetTitleId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
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
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition shadow"
              >
                Launch Arc Into Production
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Promotion, 
  Tournament, 
  TournamentMatch, 
  TournamentType, 
  TournamentRewardType, 
  Wrestler, 
  Segment,
  NewsItem
} from '../types';
import { 
  TOURNAMENT_PRESETS, 
  TournamentTemplate,
  createSingleEliminationTournament, 
  createRoundRobinTournament, 
  simulateTournamentMatchOutcome, 
  resolveTournamentMatch, 
  applyTournamentCompletionEffects 
} from '../engine/tournamentEngine';
import { 
  Trophy, 
  Crown, 
  Swords, 
  Plus, 
  Check, 
  X, 
  ChevronLeft, 
  Play, 
  Zap, 
  Tv, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Award, 
  Star, 
  ArrowRight,
  Flame,
  Info
} from 'lucide-react';
import { formatNumber } from '../utils/format';

interface TournamentsViewProps {
  promotion: Promotion;
  currentWeek: number;
  currentYear: number;
  currentShowCard: Segment[];
  onUpdatePromotion: (newPromo: Promotion) => void;
  onUpdateShowCard: (newCard: Segment[]) => void;
  onBackToMenu: () => void;
  onAddNewsItem?: (item: NewsItem) => void;
  onNavigateToBookShow?: () => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  promotion,
  currentWeek,
  currentYear,
  currentShowCard,
  onUpdatePromotion,
  onUpdateShowCard,
  onBackToMenu,
  onAddNewsItem,
  onNavigateToBookShow
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  // Creation Wizard Modal State
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<TournamentTemplate | null>(TOURNAMENT_PRESETS[0]);
  const [customName, setCustomName] = useState(TOURNAMENT_PRESETS[0].name);
  const [customTagline, setCustomTagline] = useState(TOURNAMENT_PRESETS[0].tagline);
  const [customType, setCustomType] = useState<TournamentType>(TOURNAMENT_PRESETS[0].type);
  const [customGender, setCustomGender] = useState<'Male' | 'Female' | 'Open'>(TOURNAMENT_PRESETS[0].gender);
  const [customBracketSize, setCustomBracketSize] = useState<8 | 16>(8);
  const [customRewardType, setCustomRewardType] = useState<TournamentRewardType>(TOURNAMENT_PRESETS[0].rewardType);
  const [customRewardTitleId, setCustomRewardTitleId] = useState<string>(promotion.titles[0]?.id || '');
  const [customTrophyName, setCustomTrophyName] = useState(TOURNAMENT_PRESETS[0].trophyName);
  const [customTrophyIcon, setCustomTrophyIcon] = useState(TOURNAMENT_PRESETS[0].trophyIcon);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const activeTournaments = promotion.tournaments || [];
  const completedTournaments = promotion.completedTournaments || [];

  // Currently viewed tournament
  const currentTournament = activeTournaments.find(t => t.id === selectedTournamentId) || activeTournaments[0] || null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper to get wrestler by id
  const getWrestler = (id?: string): Wrestler | undefined => {
    if (!id) return undefined;
    return promotion.roster.find(w => w.id === id);
  };

  // Preset Selection handler
  const handleSelectPreset = (preset: TournamentTemplate) => {
    setSelectedPreset(preset);
    setCustomName(preset.name);
    setCustomTagline(preset.tagline);
    setCustomType(preset.type);
    setCustomGender(preset.gender);
    setCustomBracketSize(preset.bracketSize);
    setCustomRewardType(preset.rewardType);
    setCustomTrophyName(preset.trophyName);
    setCustomTrophyIcon(preset.trophyIcon);

    // Auto-select eligible participants based on gender
    const eligible = promotion.roster.filter(w => {
      if (w.isRetired || w.injury?.injured) return false;
      if (preset.gender === 'Open') return true;
      return w.gender === preset.gender;
    });

    // Auto pick top overness
    const sorted = [...eligible].sort((a, b) => b.overness - a.overness);
    setSelectedParticipantIds(sorted.slice(0, preset.bracketSize).map(w => w.id));
  };

  // Open Creation Modal
  const handleOpenCreateModal = () => {
    handleSelectPreset(TOURNAMENT_PRESETS[0]);
    setIsCreatingModalOpen(true);
  };

  // Auto-seed helper
  const handleAutoSeed = (criteria: 'overness' | 'workrate' | 'random' | 'rising') => {
    const eligible = promotion.roster.filter(w => {
      if (w.isRetired || w.injury?.injured) return false;
      if (customGender === 'Open') return true;
      return w.gender === customGender;
    });

    let chosen: Wrestler[] = [];
    if (criteria === 'overness') {
      chosen = [...eligible].sort((a, b) => b.overness - a.overness);
    } else if (criteria === 'workrate') {
      chosen = [...eligible].sort((a, b) => b.workrate - a.workrate);
    } else if (criteria === 'rising') {
      chosen = [...eligible].sort((a, b) => a.age - b.age || b.workrate - a.workrate);
    } else {
      chosen = [...eligible].sort(() => 0.5 - Math.random());
    }

    const needed = customBracketSize;
    setSelectedParticipantIds(chosen.slice(0, needed).map(w => w.id));
  };

  // Toggle participant selection
  const handleToggleParticipant = (id: string) => {
    if (selectedParticipantIds.includes(id)) {
      setSelectedParticipantIds(prev => prev.filter(pId => pId !== id));
    } else {
      if (selectedParticipantIds.length < customBracketSize) {
        setSelectedParticipantIds(prev => [...prev, id]);
      } else {
        showToast(`Maximum ${customBracketSize} participants reached.`);
      }
    }
  };

  // Finalize Creation
  const handleCreateTournament = () => {
    if (!customName.trim()) {
      showToast('Please enter a tournament title.');
      return;
    }

    if (selectedParticipantIds.length < customBracketSize) {
      showToast(`Please select exactly ${customBracketSize} wrestlers (${selectedParticipantIds.length}/${customBracketSize} selected).`);
      return;
    }

    const participants = selectedParticipantIds
      .map(id => promotion.roster.find(w => w.id === id))
      .filter((w): w is Wrestler => Boolean(w));

    let newTournament: Tournament;

    if (customType === 'single_elimination') {
      newTournament = createSingleEliminationTournament({
        name: customName,
        tagline: customTagline,
        gender: customGender,
        bracketSize: customBracketSize,
        rewardType: customRewardType,
        rewardTitleId: customRewardType === 'crown_title' ? customRewardTitleId : undefined,
        trophyName: customTrophyName,
        trophyIcon: customTrophyIcon,
        participants,
        currentWeek,
        currentYear
      });
    } else {
      newTournament = createRoundRobinTournament({
        name: customName,
        tagline: customTagline,
        gender: customGender,
        rewardType: customRewardType,
        rewardTitleId: customRewardType === 'crown_title' ? customRewardTitleId : undefined,
        trophyName: customTrophyName,
        trophyIcon: customTrophyIcon,
        participants,
        currentWeek,
        currentYear
      });
    }

    const updatedPromotion: Promotion = {
      ...promotion,
      tournaments: [newTournament, ...(promotion.tournaments || [])]
    };

    onUpdatePromotion(updatedPromotion);
    setSelectedTournamentId(newTournament.id);
    setIsCreatingModalOpen(false);
    showToast(`🏆 ${newTournament.name} officially launched! Bracket initialized.`);
  };

  // Instant Simulate Single Match (Zero AI quota, pure deterministic game logic)
  const handleSimulateMatch = (tournament: Tournament, match: TournamentMatch) => {
    if (match.completed) return;
    const w1 = getWrestler(match.wrestler1Id);
    const w2 = getWrestler(match.wrestler2Id);
    if (!w1 || !w2) {
      showToast('Both competitors must be determined before simulating this matchup.');
      return;
    }

    const outcome = simulateTournamentMatchOutcome(w1, w2, match.roundName);

    const resolvedTournament = resolveTournamentMatch(
      tournament,
      match.id,
      outcome.winnerId,
      outcome.loserId,
      outcome.isDraw,
      outcome.ratingStars,
      outcome.ratingScore,
      outcome.finishType,
      outcome.recap,
      currentWeek,
      currentYear
    );

    if (resolvedTournament.status === 'completed') {
      const effectResult = applyTournamentCompletionEffects(
        resolvedTournament,
        promotion,
        currentWeek,
        currentYear
      );
      onUpdatePromotion(effectResult.updatedPromotion);
      if (onAddNewsItem) onAddNewsItem(effectResult.newsItem);
      showToast(`👑 TOURNAMENT CHAMPION CROWNED! ${outcome.winnerId === w1.id ? w1.name : w2.name} wins ${tournament.trophyName}!`);
    } else {
      const updatedTournaments = (promotion.tournaments || []).map(t =>
        t.id === tournament.id ? resolvedTournament : t
      );
      onUpdatePromotion({ ...promotion, tournaments: updatedTournaments });
      showToast(`Match Simulated: ${w1.name} vs ${w2.name} • ${outcome.ratingStars}`);
    }
  };

  // Simulate Current Round
  const handleSimulateCurrentRound = (tournament: Tournament) => {
    // Find uncompleted matches where both wrestlers are set
    const pendingMatches = tournament.matches.filter(m => !m.completed && m.wrestler1Id && m.wrestler2Id);
    if (pendingMatches.length === 0) {
      showToast('No pending matches ready for simulation in this round.');
      return;
    }

    let runningTournament = { ...tournament };
    let finalEffectResult: { updatedPromotion: Promotion; newsItem: NewsItem } | null = null;

    for (const match of pendingMatches) {
      // Re-fetch match to ensure updated state
      const targetMatch = runningTournament.matches.find(m => m.id === match.id);
      if (!targetMatch || targetMatch.completed || !targetMatch.wrestler1Id || !targetMatch.wrestler2Id) continue;

      const w1 = getWrestler(targetMatch.wrestler1Id);
      const w2 = getWrestler(targetMatch.wrestler2Id);
      if (!w1 || !w2) continue;

      const outcome = simulateTournamentMatchOutcome(w1, w2, targetMatch.roundName);
      runningTournament = resolveTournamentMatch(
        runningTournament,
        targetMatch.id,
        outcome.winnerId,
        outcome.loserId,
        outcome.isDraw,
        outcome.ratingStars,
        outcome.ratingScore,
        outcome.finishType,
        outcome.recap,
        currentWeek,
        currentYear
      );

      if (runningTournament.status === 'completed') {
        finalEffectResult = applyTournamentCompletionEffects(
          runningTournament,
          promotion,
          currentWeek,
          currentYear
        );
        break;
      }
    }

    if (finalEffectResult) {
      onUpdatePromotion(finalEffectResult.updatedPromotion);
      if (onAddNewsItem) onAddNewsItem(finalEffectResult.newsItem);
      showToast(`👑 Tournament Completed! ${finalEffectResult.newsItem.headline}`);
    } else {
      const updatedTournaments = (promotion.tournaments || []).map(t =>
        t.id === tournament.id ? runningTournament : t
      );
      onUpdatePromotion({ ...promotion, tournaments: updatedTournaments });
      showToast(`Simulated ${pendingMatches.length} tournament matches.`);
    }
  };

  // Book Tournament Match directly onto Tonight's TV show card
  const handleBookOnShowCard = (tournament: Tournament, match: TournamentMatch) => {
    const w1 = getWrestler(match.wrestler1Id);
    const w2 = getWrestler(match.wrestler2Id);
    if (!w1 || !w2) {
      showToast('Both participants must be determined before booking.');
      return;
    }

    // Check if already booked
    const alreadyBooked = currentShowCard.some(s => s.tournamentMatchId === match.id);
    if (alreadyBooked) {
      showToast('This tournament match is already booked on tonight\'s card.');
      return;
    }

    const newSegment: Segment = {
      id: `seg-tourn-${Date.now()}-${match.id}`,
      segmentNumber: currentShowCard.length + 1,
      category: 'Match',
      matchType: 'Singles',
      participantIds: [w1.id, w2.id],
      durationMinutes: 15,
      notes: `${tournament.name}: ${match.roundName}`,
      tournamentId: tournament.id,
      tournamentMatchId: match.id,
      gmTag: '🏆 Tournament Match'
    };

    onUpdateShowCard([...currentShowCard, newSegment]);
    showToast(`Added ${w1.name} vs ${w2.name} (${match.roundName}) to tonight's card!`);
    if (onNavigateToBookShow) {
      onNavigateToBookShow();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Tournaments & Championship Cups • Season {currentYear}</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <span>Tournaments & Cups Showcase</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeTournaments.length} Active
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Host single-elimination brackets like <span className="text-zinc-200 font-semibold">King of the Ring</span> or round-robin block competitions like the <span className="text-zinc-200 font-semibold">Grand Prix Climax</span>. Book matches directly onto weekly TV and PPV supercards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition shadow-md shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>LAUNCH TOURNAMENT</span>
            </button>

            <button
              type="button"
              onClick={onBackToMenu}
              className="px-3.5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center gap-1.5 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to HQ</span>
            </button>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex items-center gap-2 mt-5 border-t border-zinc-800/80 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              activeTab === 'active'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Active Tournaments ({activeTournaments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Trophy Room & Hall of Champions ({completedTournaments.length})</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: ACTIVE TOURNAMENTS */}
      {/* ============================================================ */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activeTournaments.length === 0 ? (
            /* Empty State: Quick Presets */
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
                🏆
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white font-mono">No Active Tournaments</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Start an official championship tournament or cup series to crown contenders, elevate workrate, and create high-stakes television drama.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
                {TOURNAMENT_PRESETS.slice(0, 3).map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      handleSelectPreset(preset);
                      setIsCreatingModalOpen(true);
                    }}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/60 cursor-pointer transition flex flex-col justify-between group shadow-sm hover:shadow-amber-500/5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{preset.trophyIcon}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-zinc-800 text-amber-400">
                          {preset.type === 'single_elimination' ? 'Single Elimination' : 'Round Robin'}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition font-mono">
                        {preset.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-amber-400 font-mono font-bold">
                      <span>Launch Cup</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Tournament Display */
            currentTournament && (
              <div className="space-y-6">
                {/* Active Tournament Selector Bar */}
                {activeTournaments.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {activeTournaments.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTournamentId(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition whitespace-nowrap ${
                          currentTournament.id === t.id
                            ? 'bg-amber-500 text-black shadow'
                            : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{t.trophyIcon}</span>
                        <span>{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tournament Overview Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                        {currentTournament.trophyIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white font-mono">{currentTournament.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {currentTournament.type === 'single_elimination' ? 'Single Elimination' : 'Round Robin Blocks'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-zinc-800 text-zinc-400">
                            {currentTournament.gender} Division
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{currentTournament.tagline}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-mono">
                          <span>🏆 Prize: <strong className="text-amber-400">{currentTournament.trophyName}</strong></span>
                          <span>•</span>
                          <span>
                            {currentTournament.rewardType === 'title_shot' && 'Guaranteed World Title Shot at PPV'}
                            {currentTournament.rewardType === 'crown_title' && 'Immediate Championship Coronation'}
                            {currentTournament.rewardType === 'prestige_trophy' && 'Prestige & Hall of Fame Distinction'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Bulk Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-mono text-zinc-400">
                          Matches Completed: <strong className="text-white">{currentTournament.matches.filter(m => m.completed).length} / {currentTournament.matches.length}</strong>
                        </div>
                        <div className="w-36 h-2 bg-zinc-800 rounded-full overflow-hidden mt-1.5 ml-auto">
                          <div
                            className="h-full bg-amber-500 transition-all duration-300"
                            style={{
                              width: `${(currentTournament.matches.filter(m => m.completed).length / currentTournament.matches.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateCurrentRound(currentTournament)}
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                          title="Simulate all ready matches in the current round"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Simulate Round</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* SINGLE ELIMINATION BRACKET VIEW */}
                {/* ============================================================ */}
                {currentTournament.type === 'single_elimination' && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-inner overflow-x-auto">
                    <div className="flex items-start justify-between min-w-[760px] gap-8">
                      {/* Group matches by round */}
                      {Array.from(new Set(currentTournament.matches.map(m => m.round))).map(roundNum => {
                        const roundMatches = currentTournament.matches.filter(m => m.round === roundNum);
                        const roundTitle = roundMatches[0]?.roundName || `Round ${roundNum}`;

                        return (
                          <div key={roundNum} className="flex-1 space-y-4">
                            <div className="text-center pb-2 border-b border-zinc-800">
                              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                                {roundTitle}
                              </h4>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {roundMatches.filter(m => m.completed).length} / {roundMatches.length} Finished
                              </span>
                            </div>

                            <div className="space-y-4">
                              {roundMatches.map(match => {
                                const w1 = getWrestler(match.wrestler1Id);
                                const w2 = getWrestler(match.wrestler2Id);
                                const isReady = Boolean(w1 && w2);
                                const isBooked = currentShowCard.some(s => s.tournamentMatchId === match.id);

                                return (
                                  <div
                                    key={match.id}
                                    className={`p-3 rounded-xl border transition ${
                                      match.completed
                                        ? 'bg-zinc-900/90 border-zinc-800'
                                        : isReady
                                        ? 'bg-zinc-900 border-amber-500/40 shadow-sm shadow-amber-500/5'
                                        : 'bg-zinc-950 border-zinc-900 opacity-60'
                                    }`}
                                  >
                                    {/* Competitor 1 */}
                                    <div className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono mb-1.5 transition ${
                                      match.winnerId === w1?.id
                                        ? 'bg-amber-500/20 border border-amber-500 text-amber-300 font-bold'
                                        : match.completed && match.loserId === w1?.id
                                        ? 'text-zinc-600 line-through'
                                        : 'bg-zinc-950 text-zinc-200'
                                    }`}>
                                      <div className="flex items-center gap-2 truncate">
                                        {match.winnerId === w1?.id && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                                        <span className="truncate">{w1 ? w1.name : 'TBD'}</span>
                                      </div>
                                      {w1 && <span className="text-[10px] text-zinc-400 ml-2">{w1.overness} OVR</span>}
                                    </div>

                                    {/* Competitor 2 */}
                                    <div className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition ${
                                      match.winnerId === w2?.id
                                        ? 'bg-amber-500/20 border border-amber-500 text-amber-300 font-bold'
                                        : match.completed && match.loserId === w2?.id
                                        ? 'text-zinc-600 line-through'
                                        : 'bg-zinc-950 text-zinc-200'
                                    }`}>
                                      <div className="flex items-center gap-2 truncate">
                                        {match.winnerId === w2?.id && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                                        <span className="truncate">{w2 ? w2.name : 'TBD'}</span>
                                      </div>
                                      {w2 && <span className="text-[10px] text-zinc-400 ml-2">{w2.overness} OVR</span>}
                                    </div>

                                    {/* Status / Action Footer */}
                                    <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                                      {match.completed ? (
                                        <div className="flex items-center justify-between w-full text-zinc-400">
                                          <span className="text-amber-400 font-bold">{match.ratingStars || '★★★'}</span>
                                          <span className="text-zinc-500 text-[10px]">Wk {match.completedWeek}</span>
                                        </div>
                                      ) : isReady ? (
                                        <div className="flex items-center justify-between w-full gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleBookOnShowCard(currentTournament, match)}
                                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                                              isBooked
                                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                            }`}
                                            title="Add this tournament match to tonight's show card"
                                          >
                                            <Tv className="w-3 h-3 text-amber-400" />
                                            <span>{isBooked ? 'Booked Tonight' : 'Book on Card'}</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleSimulateMatch(currentTournament, match)}
                                            className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold flex items-center gap-1 transition"
                                          >
                                            <Play className="w-3 h-3 fill-current" />
                                            <span>Sim</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-zinc-600 text-[10px] italic">Awaiting round winners</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Finals Champion Crown Podium */}
                      <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3 min-w-[200px]">
                        <div className="text-4xl animate-bounce">
                          {currentTournament.trophyIcon}
                        </div>
                        <div>
                          <h4 className="font-mono text-xs text-amber-400 uppercase tracking-wider font-bold">
                            Championship Crown
                          </h4>
                          <div className="text-sm font-bold text-white mt-1">
                            {currentTournament.trophyName}
                          </div>
                        </div>

                        {currentTournament.winnerId ? (
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/40 w-full mt-2">
                            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Tournament Winner</span>
                            <div className="text-sm font-bold text-white font-mono mt-0.5">
                              {getWrestler(currentTournament.winnerId)?.name || 'Champion'}
                            </div>
                            <span className="text-[10px] text-zinc-400 block mt-1">
                              Crowned in Week {currentTournament.completedWeek}, {currentTournament.completedYear}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 font-mono italic">
                            Awaiting Grand Final
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* ROUND ROBIN BLOCKS & STANDINGS VIEW */}
                {/* ============================================================ */}
                {currentTournament.type === 'round_robin' && (
                  <div className="space-y-6">
                    {/* Standings Tables: Block A and Block B */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {(['A', 'B'] as const).map(blockName => {
                        const blockStandings = (currentTournament.standings || [])
                          .filter(s => s.block === blockName)
                          .sort((a, b) => b.points - a.points || b.wins - a.wins);

                        return (
                          <div key={blockName} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                              <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                <span>BLOCK {blockName} STANDINGS</span>
                              </h4>
                              <span className="text-[10px] font-mono text-zinc-400">
                                2 Pts Win • 1 Pt Draw • 0 Pt Loss
                              </span>
                            </div>

                            <table className="w-full text-left text-xs font-mono">
                              <thead>
                                <tr className="text-zinc-500 border-b border-zinc-800/80">
                                  <th className="pb-2 font-normal">#</th>
                                  <th className="pb-2 font-normal">Competitor</th>
                                  <th className="pb-2 font-normal text-center">MP</th>
                                  <th className="pb-2 font-normal text-center">W</th>
                                  <th className="pb-2 font-normal text-center">L</th>
                                  <th className="pb-2 font-normal text-center">D</th>
                                  <th className="pb-2 font-normal text-right text-amber-400">PTS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800/50">
                                {blockStandings.map((standing, idx) => {
                                  const wrestler = getWrestler(standing.wrestlerId);
                                  const isLeader = idx === 0 && standing.points > 0;

                                  return (
                                    <tr key={standing.wrestlerId} className={isLeader ? 'bg-amber-500/10' : ''}>
                                      <td className="py-2.5 text-zinc-500 font-bold">{idx + 1}</td>
                                      <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                                        {isLeader && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                                        <span>{wrestler ? wrestler.name : 'Unknown'}</span>
                                      </td>
                                      <td className="py-2.5 text-center text-zinc-400">{standing.matchesPlayed}</td>
                                      <td className="py-2.5 text-center text-emerald-400 font-bold">{standing.wins}</td>
                                      <td className="py-2.5 text-center text-rose-400">{standing.losses}</td>
                                      <td className="py-2.5 text-center text-zinc-400">{standing.draws}</td>
                                      <td className="py-2.5 text-right font-bold text-amber-400 text-sm">{standing.points}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>

                    {/* Championship Finals Node for Round Robin */}
                    {(() => {
                      const finalsMatch = currentTournament.matches.find(m => m.roundName.includes('Final'));
                      const w1 = getWrestler(finalsMatch?.wrestler1Id);
                      const w2 = getWrestler(finalsMatch?.wrestler2Id);
                      const isReady = Boolean(w1 && w2);

                      return (
                        <div className="bg-zinc-950 border-2 border-amber-500/60 rounded-xl p-5 shadow-xl text-center space-y-3">
                          <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold">
                            <Trophy className="w-4 h-4" />
                            <span>Grand Tournament Championship Final (Block A Winner vs Block B Winner)</span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto py-2">
                            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex-1 text-center">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Block A Winner</span>
                              <div className="font-bold text-white font-mono text-sm mt-0.5">
                                {w1 ? w1.name : 'Block A #1 (TBD)'}
                              </div>
                            </div>

                            <span className="text-amber-400 font-bold font-mono text-lg">VS</span>

                            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex-1 text-center">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">Block B Winner</span>
                              <div className="font-bold text-white font-mono text-sm mt-0.5">
                                {w2 ? w2.name : 'Block B #1 (TBD)'}
                              </div>
                            </div>
                          </div>

                          {finalsMatch?.completed ? (
                            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono max-w-md mx-auto">
                              🏆 Winner: <strong>{getWrestler(finalsMatch.winnerId)?.name}</strong> hoists the {currentTournament.trophyName}! ({finalsMatch.ratingStars})
                            </div>
                          ) : isReady && finalsMatch ? (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleBookOnShowCard(currentTournament, finalsMatch)}
                                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold flex items-center gap-2"
                              >
                                <Tv className="w-3.5 h-3.5 text-amber-400" />
                                <span>Book Finals on Show</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSimulateMatch(currentTournament, finalsMatch)}
                                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold flex items-center gap-2"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Simulate Finals Now</span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-500 font-mono">
                              Complete all Block A and Block B matches to unlock the Championship Final.
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Pending Block Matchups Schedule */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Swords className="w-4 h-4 text-amber-400" />
                          <span>Block Matches Schedule</span>
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {currentTournament.matches.filter(m => m.completed).length} / {currentTournament.matches.length} Finished
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentTournament.matches
                          .filter(m => !m.roundName.includes('Final'))
                          .map(match => {
                            const w1 = getWrestler(match.wrestler1Id);
                            const w2 = getWrestler(match.wrestler2Id);
                            const isBooked = currentShowCard.some(s => s.tournamentMatchId === match.id);

                            return (
                              <div
                                key={match.id}
                                className={`p-3 rounded-xl border text-xs font-mono flex flex-col justify-between space-y-2 transition ${
                                  match.completed
                                    ? 'bg-zinc-950 border-zinc-800 opacity-80'
                                    : 'bg-zinc-950 border-zinc-800 hover:border-amber-500/50'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-800/80 pb-1">
                                  <span>{match.roundName}</span>
                                  {match.completed && <span className="text-amber-400 font-bold">{match.ratingStars}</span>}
                                </div>

                                <div className="space-y-1">
                                  <div className={`flex items-center justify-between ${
                                    match.winnerId === w1?.id ? 'text-amber-300 font-bold' : 'text-zinc-300'
                                  }`}>
                                    <span>{w1 ? w1.name : 'Unknown'}</span>
                                    {match.winnerId === w1?.id && <span className="text-[10px] text-amber-400">WIN (2 Pts)</span>}
                                  </div>
                                  <div className="text-[10px] text-zinc-600">vs</div>
                                  <div className={`flex items-center justify-between ${
                                    match.winnerId === w2?.id ? 'text-amber-300 font-bold' : 'text-zinc-300'
                                  }`}>
                                    <span>{w2 ? w2.name : 'Unknown'}</span>
                                    {match.winnerId === w2?.id && <span className="text-[10px] text-amber-400">WIN (2 Pts)</span>}
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end gap-2">
                                  {match.completed ? (
                                    <span className="text-[10px] text-zinc-500">Completed (Wk {match.completedWeek})</span>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleBookOnShowCard(currentTournament, match)}
                                        className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${
                                          isBooked
                                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                        }`}
                                      >
                                        <Tv className="w-3 h-3 text-amber-400" />
                                        <span>{isBooked ? 'Booked' : 'Book'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSimulateMatch(currentTournament, match)}
                                        className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold flex items-center gap-1"
                                      >
                                        <Play className="w-3 h-3 fill-current" />
                                        <span>Sim</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: TROPHY ROOM & HALL OF CHAMPIONS */}
      {/* ============================================================ */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {completedTournaments.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center space-y-4">
              <div className="text-4xl">🏛️</div>
              <h3 className="font-bold text-white text-base font-mono">The Trophy Room is Empty</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No tournaments have concluded yet. When a superstar wins the finals of King of the Ring, Queen of the Ring, or Grand Prix Climax, their coronation will be permanently immortalized here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTournaments.map(tourn => {
                const winner = getWrestler(tourn.winnerId);
                const runnerUp = getWrestler(tourn.runnerUpId);
                const finalsMatch = tourn.matches.find(m => m.roundName.includes('Final'));

                return (
                  <div
                    key={tourn.id}
                    className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-md space-y-3 font-mono text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{tourn.trophyIcon}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {tourn.completedYear} Champion
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{tourn.name}</h4>
                      <p className="text-[11px] text-zinc-400 font-sans mt-0.5">{tourn.tagline}</p>
                    </div>

                    {/* Winner Showcase */}
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Crowned Winner</span>
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-sm font-bold text-amber-300 truncate">
                        {winner ? winner.name : 'Unknown Champion'}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Defeated {runnerUp ? runnerUp.name : 'Runner Up'} in Finals
                      </div>
                      {finalsMatch?.ratingStars && (
                        <div className="text-[10px] text-amber-400 font-bold">
                          Finals Rating: {finalsMatch.ratingStars}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Prize: {tourn.trophyName}</span>
                      <span>Wk {tourn.completedWeek}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TOURNAMENT CREATION WIZARD */}
      {/* ============================================================ */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-amber-500 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-mono text-base font-bold text-white">
                  Commission Official Championship Tournament
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Gallery */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2 uppercase font-bold">
                1. Select Blueprint / Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {TOURNAMENT_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      selectedPreset?.id === preset.id
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xl">{preset.trophyIcon}</span>
                    <span className="text-[11px] font-mono font-bold leading-tight line-clamp-1">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tournament Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Tournament Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Tournament Format</label>
                <select
                  value={customType}
                  onChange={e => setCustomType(e.target.value as TournamentType)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  <option value="single_elimination">Single Elimination Bracket</option>
                  <option value="round_robin">Round Robin Block Series (G1 Climax Style)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Division / Gender</label>
                <select
                  value={customGender}
                  onChange={e => {
                    const g = e.target.value as 'Male' | 'Female' | 'Open';
                    setCustomGender(g);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  <option value="Male">Men's Division</option>
                  <option value="Female">Women's Division</option>
                  <option value="Open">Openweight / All Divisions</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Field Size</label>
                <select
                  value={customBracketSize}
                  onChange={e => setCustomBracketSize(parseInt(e.target.value) as 8 | 16)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  <option value={8}>8 Competitors</option>
                  {customType === 'single_elimination' && <option value={16}>16 Competitors</option>}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Tournament Grand Reward</label>
                <select
                  value={customRewardType}
                  onChange={e => setCustomRewardType(e.target.value as TournamentRewardType)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                >
                  <option value="title_shot">Guaranteed World Title Shot at PPV</option>
                  <option value="crown_title">Crown Vacant Championship Gold</option>
                  <option value="prestige_trophy">Prestige Trophy & Hall of Fame Immortality</option>
                </select>
              </div>

              {customRewardType === 'crown_title' && (
                <div>
                  <label className="block text-zinc-400 mb-1">Championship to Award</label>
                  <select
                    value={customRewardTitleId}
                    onChange={e => setCustomRewardTitleId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                  >
                    {promotion.titles.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-zinc-400 mb-1">Trophy / Chalice Name</label>
                <input
                  type="text"
                  value={customTrophyName}
                  onChange={e => setCustomTrophyName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Trophy Icon</label>
                <input
                  type="text"
                  value={customTrophyIcon}
                  onChange={e => setCustomTrophyIcon(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 mb-1">Tagline / Narrative</label>
                <input
                  type="text"
                  value={customTagline}
                  onChange={e => setCustomTagline(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Participant Selection */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 font-bold uppercase">
                    2. Select Participants ({selectedParticipantIds.length} / {customBracketSize})
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Pick superstars from active roster or click an auto-seed button below.
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAutoSeed('overness')}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition"
                  >
                    Top Overness
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoSeed('workrate')}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition"
                  >
                    Top Workrate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoSeed('rising')}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition"
                  >
                    Rising Stars
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoSeed('random')}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition"
                  >
                    Random
                  </button>
                </div>
              </div>

              {/* Wrestler Checkbox Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-zinc-900/60 rounded-xl border border-zinc-800">
                {promotion.roster
                  .filter(w => !w.isRetired && (customGender === 'Open' || w.gender === customGender))
                  .map(w => {
                    const isSelected = selectedParticipantIds.includes(w.id);
                    const isInjured = w.injury?.injured;

                    return (
                      <div
                        key={w.id}
                        onClick={() => !isInjured && handleToggleParticipant(w.id)}
                        className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : isInjured
                            ? 'bg-zinc-950 border-zinc-900 opacity-40 cursor-not-allowed'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="truncate">
                          <span className="block truncate">{w.name}</span>
                          <span className="text-[10px] text-zinc-500">{w.overness} OVR • {w.style}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreatingModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTournament}
                disabled={selectedParticipantIds.length !== customBracketSize}
                className={`px-5 py-2 rounded-lg font-mono font-bold text-xs flex items-center gap-2 transition ${
                  selectedParticipantIds.length === customBracketSize
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>COMMENCE TOURNAMENT ({selectedParticipantIds.length}/{customBracketSize})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

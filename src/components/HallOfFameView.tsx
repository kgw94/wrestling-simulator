import React, { useState } from 'react';
import { 
  Promotion, 
  Wrestler, 
  Championship, 
  HallOfFameInductee, 
  HallOfFameCategory, 
  GameView,
  NewsItem
} from '../types';
import { 
  calculateHallOfFameScorecard, 
  DEFAULT_HALL_OF_FAME_INDUCTEES, 
  DEFAULT_RETIRED_WRESTLERS 
} from '../data/customDefaults';
import { 
  Trophy, 
  Award, 
  Flame, 
  Clock, 
  Users, 
  CheckCircle2, 
  ChevronLeft, 
  Search, 
  Sparkles, 
  Medal, 
  Star, 
  Scroll, 
  Plus, 
  RotateCcw, 
  Sliders,
  Shield,
  HelpCircle,
  TrendingUp,
  X
} from 'lucide-react';

interface HallOfFameViewProps {
  promotion: Promotion;
  currentWeek?: number;
  currentYear?: number;
  onUpdatePromotion: (newPromo: Promotion) => void;
  onNavigate: (view: GameView) => void;
  onBackToMenu: () => void;
  onAddNewsItem?: (news: NewsItem) => void;
}

type HallOfFameTab = 'plaques' | 'retirees' | 'active_watch' | 'criteria';

export const HallOfFameView: React.FC<HallOfFameViewProps> = ({
  promotion,
  currentWeek = 1,
  currentYear = 2026,
  onUpdatePromotion,
  onNavigate,
  onBackToMenu,
  onAddNewsItem
}) => {
  const [activeTab, setActiveTab] = useState<HallOfFameTab>('plaques');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Inductees and Retirees
  const inductees: HallOfFameInductee[] = promotion.hallOfFame && promotion.hallOfFame.length > 0
    ? promotion.hallOfFame
    : DEFAULT_HALL_OF_FAME_INDUCTEES;

  const retiredWrestlers: Wrestler[] = promotion.retiredRoster && promotion.retiredRoster.length > 0
    ? promotion.retiredRoster
    : DEFAULT_RETIRED_WRESTLERS;

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Induction Ceremony Modal State
  const [showCeremonyModal, setShowCeremonyModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [inductionClassTitle, setInductionClassTitle] = useState<string>(`Class of ${currentYear}`);
  const [inductionCategory, setInductionCategory] = useState<HallOfFameCategory>('Headliner');
  const [inductorName, setInductorName] = useState<string>(promotion.roster[0]?.name || 'Head Booker');
  const [speechQuote, setSpeechQuote] = useState<string>('');
  const [bioSummary, setBioSummary] = useState<string>('');

  // Manual Retirement Modal State
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [retiringWrestlerId, setRetiringWrestlerId] = useState<string>(promotion.roster[0]?.id || '');
  const [retirementReason, setRetirementReason] = useState<string>('Career Twilight / Culminating Farewell Tour');

  // Selected Inductee for Plaque Modal
  const [expandedPlaque, setExpandedPlaque] = useState<HallOfFameInductee | null>(null);

  // Available candidate pool for induction: retired wrestlers not yet inducted + active icons
  const availableCandidates: { id: string; name: string; isRetired: boolean; wrestler: Wrestler }[] = [
    ...retiredWrestlers
      .filter(w => !inductees.some(i => i.wrestlerId === w.id || i.name.toLowerCase() === w.name.toLowerCase()))
      .map(w => ({ id: w.id, name: w.name, isRetired: true, wrestler: w })),
    ...promotion.roster
      .filter(w => !inductees.some(i => i.wrestlerId === w.id || i.name.toLowerCase() === w.name.toLowerCase()))
      .map(w => ({ id: w.id, name: `${w.name} (Active Veteran)`, isRetired: false, wrestler: w }))
  ];

  // Helper to open induction ceremony pre-filled for a specific wrestler
  const handleOpenCeremonyForCandidate = (wrestler: Wrestler) => {
    setSelectedCandidateId(wrestler.id);
    setInductionClassTitle(`Class of ${currentYear}`);
    setSpeechQuote(
      `“I gave every ounce of my soul to this squared circle. The bruises fade, but the honor of being in this Hall of Fame alongside giants lives forever.”`
    );
    setBioSummary(
      `Iconic ${wrestler.style} competitor who amassed ${wrestler.wins} career victories and etched their name in wrestling lore.`
    );
    setShowCeremonyModal(true);
  };

  // Process Induction
  const handleConfirmInduction = () => {
    if (!selectedCandidateId) {
      showToast('Please select a wrestler to induct.');
      return;
    }

    const candidateObj = availableCandidates.find(c => c.id === selectedCandidateId);
    if (!candidateObj) return;

    const w = candidateObj.wrestler;
    const scorecard = calculateHallOfFameScorecard(w, promotion.titles);

    // Calculate career titles
    const titlesWon = new Set<string>();
    promotion.titles.forEach(t => {
      if (w.championshipIds?.includes(t.id)) titlesWon.add(t.name);
      t.history.forEach(h => {
        if (h.holderNames?.toLowerCase().includes(w.name.toLowerCase()) || h.holderIds?.includes(w.id)) {
          titlesWon.add(t.name);
        }
      });
    });

    const newInductee: HallOfFameInductee = {
      id: `hof-${Date.now()}`,
      wrestlerId: w.id,
      name: w.name,
      nickname: w.nickname || 'Living Legend',
      inductionYear: currentYear,
      inductionWeek: currentWeek,
      classTitle: inductionClassTitle.trim() || `Class of ${currentYear}`,
      category: inductionCategory,
      speechQuote: speechQuote.trim() || '“Thank you to the fans who made this journey possible.”',
      inductorName: inductorName.trim() || 'The Board of Directors',
      biographySummary: bioSummary.trim() || `${w.name} joins the immortal ranks of the Hall of Fame.`,
      careerStats: {
        totalWins: w.wins || 0,
        totalLosses: w.losses || 0,
        totalDraws: w.draws || 0,
        winPercentage: (w.wins + w.losses + w.draws) > 0 ? (w.wins / (w.wins + w.losses + w.draws)) : 0,
        careerTitles: Array.from(titlesWon),
        totalTitleReigns: titlesWon.size || (w.championshipIds ? w.championshipIds.length : 1),
        careerTitleDefenses: 8,
        peakOverness: w.peakOverness || w.overness || 85,
        careerLongevityWeeks: w.careerWeeksInSimulator || Math.max(20, (w.age - 20) * 10),
        finalAge: w.age
      },
      scorecard
    };

    const updatedInductees = [newInductee, ...inductees];

    // Mark wrestler as inducted
    const updatedRetired = retiredWrestlers.map(rw => rw.id === w.id ? { ...rw, hallOfFameInducted: true, hallOfFameYear: currentYear } : rw);
    const updatedRoster = promotion.roster.map(rw => rw.id === w.id ? { ...rw, hallOfFameInducted: true, hallOfFameYear: currentYear } : rw);

    onUpdatePromotion({
      ...promotion,
      hallOfFame: updatedInductees,
      retiredRoster: updatedRetired,
      roster: updatedRoster
    });

    // Add breaking news item
    if (onAddNewsItem) {
      onAddNewsItem({
        id: `news-hof-${Date.now()}`,
        week: currentWeek,
        category: 'Promotion',
        importance: 'High',
        headline: `HALL OF FAME: ${w.name} Inducted into ${newInductee.classTitle}!`,
        details: `${w.name} was officially enshrined into the Hall of Fame as a ${inductionCategory}, inducted by ${newInductee.inductorName} to a roaring standing ovation.`
      });
    }

    setShowCeremonyModal(false);
    showToast(`🏆 ${w.name} officially inducted into the Hall of Fame!`);
  };

  // Process Manual Retirement
  const handleConfirmRetirement = () => {
    const wrestler = promotion.roster.find(w => w.id === retiringWrestlerId);
    if (!wrestler) return;

    const retiredWrestler: Wrestler = {
      ...wrestler,
      isRetired: true,
      retiredWeek: currentWeek,
      retiredYear: currentYear,
      retirementReason: retirementReason.trim() || 'Culminating Farewell Tour',
      salary: 0,
      contractWeeks: 0,
      careerWeeksInSimulator: wrestler.careerWeeksInSimulator || Math.max(30, (wrestler.age - 20) * 12),
      peakOverness: Math.max(wrestler.overness, wrestler.peakOverness || wrestler.overness)
    };

    // Remove from active roster and add to retired roster
    const updatedRoster = promotion.roster.filter(w => w.id !== retiringWrestlerId);
    const updatedRetired = [retiredWrestler, ...retiredWrestlers];

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster,
      retiredRoster: updatedRetired,
      hallOfFame: inductees
    });

    if (onAddNewsItem) {
      onAddNewsItem({
        id: `news-retire-${Date.now()}`,
        week: currentWeek,
        category: 'Wrestler',
        importance: 'High',
        headline: `RETIREMENT: ${wrestler.name} Steps Away from the Ring!`,
        details: `After a storied career of ${wrestler.wins} victories, ${wrestler.name} officially announced their in-ring retirement (${retiredWrestler.retirementReason}).`
      });
    }

    setShowRetireModal(false);
    showToast(`${wrestler.name} has officially retired and moved to the Retired Legends wing.`);
  };

  // Comeback / Unretire
  const handleUnretire = (retiree: Wrestler) => {
    const activeW: Wrestler = {
      ...retiree,
      isRetired: false,
      retiredWeek: undefined,
      retiredYear: undefined,
      retirementReason: undefined,
      contractWeeks: 26,
      salary: 10000
    };

    const updatedRetired = retiredWrestlers.filter(r => r.id !== retiree.id);
    const updatedRoster = [...promotion.roster, activeW];

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster,
      retiredRoster: updatedRetired,
      hallOfFame: inductees
    });

    showToast(`⚡ ${retiree.name} has returned from retirement to the active roster!`);
  };

  // Distinct class titles for filter
  const classTitles = Array.from(new Set(inductees.map(i => i.classTitle)));

  // Filtered inductees
  const filteredInductees = inductees.filter(ind => {
    const matchesSearch = ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.classTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'All' || ind.classTitle === classFilter;
    const matchesCategory = categoryFilter === 'All' || ind.category === categoryFilter;
    return matchesSearch && matchesClass && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Rotunda Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/40 rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Sanctioned Hall of Immortals • {promotion.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-mono flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-400" />
              <span>Wrestling Hall of Fame</span>
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Enshrining the legends, innovators, and world champions who defined professional wrestling. Induction criteria tracks career victories, championship reigns, and overall simulator longevity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedCandidateId(availableCandidates[0]?.id || '');
                setShowCeremonyModal(true);
              }}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow shadow-amber-500/10"
            >
              <Award className="w-4 h-4" />
              <span>Host Induction Ceremony</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRetireModal(true)}
              className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs flex items-center gap-1.5 border border-zinc-700 transition"
            >
              <Scroll className="w-4 h-4 text-amber-400" />
              <span>Retire Superstar</span>
            </button>

            <button
              type="button"
              onClick={onBackToMenu}
              className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Booker Hub</span>
            </button>
          </div>
        </div>

        {/* Rotunda Fast Stats */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[11px] text-zinc-400">Total Enshrined</span>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              {inductees.length} Immortal Legends
            </div>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400">Headliners</span>
            <div className="text-base font-bold text-yellow-300 mt-0.5">
              {inductees.filter(i => i.category === 'Headliner').length} Diamond Tier
            </div>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400">Retired Veterans Wing</span>
            <div className="text-base font-bold text-sky-400 mt-0.5">
              {retiredWrestlers.length} Retired Superstars
            </div>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400">First-Ballot Active Locks</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {promotion.roster.filter(w => calculateHallOfFameScorecard(w, promotion.titles).eligibilityTier === 'First-Ballot Lock').length} On Roster
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active Induction Opportunities for Retired Superstars */}
      {(() => {
        const pendingCandidates = retiredWrestlers.filter(
          w => (w.hofNominationPending || calculateHallOfFameScorecard(w, promotion.titles).overallScore >= 45) &&
               !inductees.some(i => i.wrestlerId === w.id || i.name.toLowerCase() === w.name.toLowerCase())
        );

        if (pendingCandidates.length === 0) return null;

        const featured = pendingCandidates[0];
        const sc = calculateHallOfFameScorecard(featured, promotion.titles);

        return (
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-zinc-900 border border-amber-500/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-amber-300">
                    🏆 Hall of Fame Induction Opportunity ({pendingCandidates.length} Active Candidates)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/30 text-amber-200">
                    {sc.eligibilityTier}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Superstar <strong className="text-white">{featured.name}</strong> has retired from the ring ({featured.retirementReason || 'Decorated Career'}). With a {sc.overallScore}/100 legacy score, you can conduct their formal enshrinement now!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenCeremonyForCandidate(featured)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>Enshrine {featured.name}</span>
            </button>
          </div>
        );
      })()}

      {/* Tab Navigation Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('plaques')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'plaques'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Hall of Plaques ({inductees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('retirees')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'retirees'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Scroll className="w-4 h-4" />
          <span>Retired Legends Wing ({retiredWrestlers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active_watch')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'active_watch'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Active Roster HOF Watch ({promotion.roster.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('criteria')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'criteria'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Induction Criteria & Rules</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: HALL OF PLAQUES (ENSHRINED LEGENDS) */}
      {/* ============================================================ */}
      {activeTab === 'plaques' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/70 p-3 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-zinc-950 px-3 py-1.5 rounded border border-zinc-800">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search inductees by name or class..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-full font-mono"
              />
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">Class:</span>
                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500 font-sans"
                >
                  <option value="All">All Induction Classes</option>
                  {classTitles.map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500 font-sans"
                >
                  <option value="All">All Categories</option>
                  <option value="Headliner">Headliner</option>
                  <option value="Living Legend">Living Legend</option>
                  <option value="Icon">Icon</option>
                  <option value="Warrior">Warrior</option>
                  <option value="Trailblazer">Trailblazer</option>
                  <option value="Pioneer">Pioneer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plaque Gallery Grid */}
          {filteredInductees.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-500 font-mono text-xs">
              No Hall of Fame inductees found matching the filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredInductees.map(inductee => {
                const { winsScore, championshipsScore, longevityScore, overallScore } = inductee.scorecard;

                return (
                  <div
                    key={inductee.id}
                    className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/40 rounded-xl p-5 shadow-lg relative flex flex-col justify-between hover:border-amber-500/80 transition group"
                  >
                    <div>
                      {/* Top Plaque Header: Class & Category */}
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                          <Medal className="w-4 h-4 text-amber-400" />
                          <span className="font-bold">{inductee.classTitle}</span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400">Week {inductee.inductionWeek}</span>
                        </div>

                        <div className="text-xs font-mono px-2.5 py-0.5 rounded border border-amber-500/50 bg-amber-500/10 text-amber-300 font-bold">
                          {inductee.category}
                        </div>
                      </div>

                      {/* Name & Laurel Title */}
                      <div className="my-3">
                        <h3 className="text-xl font-bold text-white font-mono group-hover:text-amber-300 transition">
                          {inductee.name}
                        </h3>
                        <p className="text-xs text-amber-400/90 font-mono italic mt-0.5">
                          "{inductee.nickname}"
                        </p>
                        <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed line-clamp-2">
                          {inductee.biographySummary}
                        </p>
                      </div>

                      {/* Career Achievements Metrics */}
                      <div className="grid grid-cols-3 gap-2 bg-zinc-950/90 p-3 rounded-lg border border-zinc-800/80 text-xs font-mono mb-3">
                        <div>
                          <span className="text-[10px] text-zinc-500 block">CAREER RECORD</span>
                          <span className="text-sm font-bold text-emerald-400">
                            {inductee.careerStats.totalWins}W - {inductee.careerStats.totalLosses}L
                          </span>
                          <span className="text-[10px] text-zinc-400 block">
                            {Math.round(inductee.careerStats.winPercentage * 100)}% Win Rate
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 block">CHAMPIONSHIPS</span>
                          <span className="text-sm font-bold text-amber-400">
                            {inductee.careerStats.totalTitleReigns}x Champion
                          </span>
                          <span className="text-[10px] text-zinc-400 block">
                            {inductee.careerStats.careerTitleDefenses} Defenses
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 block">SIMULATOR LEGACY</span>
                          <span className="text-sm font-bold text-sky-400">
                            {inductee.careerStats.careerLongevityWeeks} Weeks
                          </span>
                          <span className="text-[10px] text-zinc-400 block">
                            Age {inductee.careerStats.finalAge} Retired
                          </span>
                        </div>
                      </div>

                      {/* 3-Pillar Criteria Scorecard Progress Bars */}
                      <div className="space-y-1.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs font-mono">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">1. Career Wins (30%)</span>
                          <span className="text-emerald-400 font-bold">{winsScore}/100</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${winsScore}%` }} />
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-zinc-400">2. Title Reigns & Defenses (40%)</span>
                          <span className="text-amber-400 font-bold">{championshipsScore}/100</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${championshipsScore}%` }} />
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-zinc-400">3. Longevity & Heritage (30%)</span>
                          <span className="text-sky-400 font-bold">{longevityScore}/100</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${longevityScore}%` }} />
                        </div>
                      </div>

                      {/* Acceptance Speech Quote */}
                      <blockquote className="mt-3 text-xs italic text-zinc-300 font-sans border-l-2 border-amber-500/60 pl-3 py-1 bg-zinc-950/40 rounded-r">
                        {inductee.speechQuote}
                      </blockquote>
                    </div>

                    {/* Plaque Footer */}
                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">
                        Inducted by: <strong className="text-zinc-200">{inductee.inductorName}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedPlaque(inductee)}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
                      >
                        <span>View Golden Plaque</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: RETIRED LEGENDS WING & ELIGIBILITY */}
      {/* ============================================================ */}
      {activeTab === 'retirees' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white font-mono text-base">Retired Superstars Wing</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every competitor who has officially retired from in-ring competition. Review their criteria scorecards and induct qualified icons into the Hall of Fame.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRetireModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shrink-0"
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>Announce New Retirement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {retiredWrestlers.map(retiree => {
              const scorecard = calculateHallOfFameScorecard(retiree, promotion.titles);
              const isAlreadyInducted = inductees.some(i => i.wrestlerId === retiree.id || i.name.toLowerCase() === retiree.name.toLowerCase());
              const isPendingNomination = retiree.hofNominationPending && !isAlreadyInducted;

              return (
                <div
                  key={retiree.id}
                  className={`border rounded-xl p-5 flex flex-col justify-between transition ${
                    isPendingNomination
                      ? 'border-amber-500/80 shadow-lg shadow-amber-500/10 bg-gradient-to-b from-amber-950/20 via-zinc-900 to-zinc-900'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-mono">
                      <span className="text-zinc-400">
                        Retired {retiree.retiredYear ? `Yr ${retiree.retiredYear}` : ''} • Age {retiree.age}
                      </span>
                      {isAlreadyInducted ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ★ IN HALL OF FAME
                        </span>
                      ) : isPendingNomination ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-400 text-black flex items-center gap-1 shadow animate-pulse">
                          <Trophy className="w-2.5 h-2.5" />
                          <span>HOF NOMINEE</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          scorecard.eligibilityTier === 'First-Ballot Lock'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : scorecard.eligibilityTier === 'Strong Candidate'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {scorecard.eligibilityTier}
                        </span>
                      )}
                    </div>

                    {/* Name & Reason */}
                    <div className="my-3">
                      <h4 className="text-lg font-bold text-white font-mono">{retiree.name}</h4>
                      <p className="text-xs text-amber-400/90 font-mono italic">{retiree.nickname}</p>
                      <p className="text-xs text-zinc-400 mt-1 font-sans">
                        Reason: <span className="text-zinc-300">{retiree.retirementReason || 'Farewell Tour'}</span>
                      </p>
                      {retiree.careerInjuriesCount && retiree.careerInjuriesCount > 0 ? (
                        <span className="inline-block mt-1 text-[11px] font-mono text-rose-400">
                          🚑 {retiree.careerInjuriesCount} Career Major Injuries
                        </span>
                      ) : null}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-2.5 rounded border border-zinc-800 text-xs font-mono mb-3 text-center">
                      <div>
                        <div className="text-[10px] text-zinc-500">WINS</div>
                        <div className="font-bold text-emerald-400">{retiree.wins}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">LOSSES</div>
                        <div className="font-bold text-zinc-400">{retiree.losses}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">FINAL AGE</div>
                        <div className="font-bold text-sky-400">{retiree.age}</div>
                      </div>
                    </div>

                    {/* Induction Criteria Checklist */}
                    <div className="space-y-1 bg-zinc-950/60 p-2.5 rounded border border-zinc-800/80 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Wins Benchmark (10+):</span>
                        <span className={scorecard.qualificationBreakdown.winsMet ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                          {retiree.wins} {scorecard.qualificationBreakdown.winsMet ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Championships Won:</span>
                        <span className={scorecard.qualificationBreakdown.championshipsMet ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                          {retiree.championshipIds?.length || 0} Belts {scorecard.qualificationBreakdown.championshipsMet ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Overall HOF Rating:</span>
                        <span className="text-amber-400 font-bold">{scorecard.overallScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                    {!isAlreadyInducted ? (
                      <button
                        type="button"
                        onClick={() => handleOpenCeremonyForCandidate(retiree)}
                        className="flex-1 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1 transition shadow"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Induct to HOF</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-zinc-500 italic">Enshrined in Museum</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleUnretire(retiree)}
                      className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center gap-1 transition"
                      title="Return from retirement for one more run"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Comeback</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ACTIVE ROSTER HOF WATCH */}
      {/* ============================================================ */}
      {activeTab === 'active_watch' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-bold text-white font-mono text-base">Active Roster Hall of Fame Watch</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live criteria scoreboard forecasting future Hall of Famers currently active on television. Stars aged 36+ or holding multiple world titles are prime candidates for retirement tours and immediate enshrinement.
            </p>
          </div>

          <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Superstar</th>
                  <th className="p-3">Push / Style</th>
                  <th className="p-3">Age / Retire</th>
                  <th className="p-3">Injuries</th>
                  <th className="p-3">Career Record</th>
                  <th className="p-3">Wins Score</th>
                  <th className="p-3">Titles Score</th>
                  <th className="p-3">Longevity</th>
                  <th className="p-3">HOF Rating</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {promotion.roster
                  .map(w => ({ wrestler: w, scorecard: calculateHallOfFameScorecard(w, promotion.titles) }))
                  .sort((a, b) => b.scorecard.overallScore - a.scorecard.overallScore)
                  .map(({ wrestler: w, scorecard }) => {
                    const targetRetire = w.retirementAge || (w.style === 'High Flyer' ? 40 : w.style === 'Hardcore' ? 41 : w.style === 'Powerhouse' ? 45 : 44);
                    return (
                      <tr key={w.id} className="hover:bg-zinc-800/40 transition">
                        <td className="p-3">
                          <div className="font-bold text-white text-sm">{w.name}</div>
                          <div className="text-[10px] text-zinc-400">{w.nickname}</div>
                        </td>
                        <td className="p-3 text-zinc-300">
                          {w.push} • {w.style}
                        </td>
                        <td className="p-3 font-bold text-zinc-200">
                          {w.age} <span className="text-amber-400 text-[11px] font-normal">/ ~{targetRetire}</span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          <span className={w.careerInjuriesCount && w.careerInjuriesCount >= 3 ? 'text-rose-400 font-bold' : ''}>
                            {w.careerInjuriesCount || 0}
                          </span>
                        </td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold">{w.wins}W</span>
                        <span className="text-zinc-500"> - </span>
                        <span className="text-zinc-400">{w.losses}L</span>
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">
                        {scorecard.winsScore}/100
                      </td>
                      <td className="p-3 text-amber-400 font-bold">
                        {scorecard.championshipsScore}/100
                      </td>
                      <td className="p-3 text-sky-400 font-bold">
                        {scorecard.longevityScore}/100
                      </td>
                      <td className="p-3 font-bold text-amber-300 text-sm">
                        {scorecard.overallScore}/100
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          scorecard.eligibilityTier === 'First-Ballot Lock'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : scorecard.eligibilityTier === 'Strong Candidate'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {scorecard.eligibilityTier}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setRetiringWrestlerId(w.id);
                              setShowRetireModal(true);
                            }}
                            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] border border-zinc-700 transition"
                          >
                            Retire
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCeremonyForCandidate(w)}
                            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition shadow"
                          >
                            Induct
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: INDUCTION CRITERIA & RULES BREAKDOWN */}
      {/* ============================================================ */}
      {activeTab === 'criteria' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Official Hall of Fame Induction Criteria & Algorithmic Scoring</span>
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
              To preserve the integrity and prestige of the Hall of Fame, the simulator calculates an algorithmic scorecard weighted across three fundamental pillars of wrestling greatness:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Pillar 1 */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <Trophy className="w-4 h-4" />
                  <span>1. Career Wins & Dominance (30%)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Rewards consistent in-ring dominance and prime-time victories.
                </p>
                <ul className="text-xs font-mono space-y-1 text-zinc-300 pt-1 border-t border-zinc-800">
                  <li>• Target: 10+ Career Wins to qualify</li>
                  <li>• Win Percentage multiplier (&gt;65% boost)</li>
                  <li>• Marquee Supercard and PPV victories</li>
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                  <Medal className="w-4 h-4" />
                  <span>2. Championship Heritage (40%)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  The primary hallmark of wrestling greatness. Multiple championship reigns and dominant defenses.
                </p>
                <ul className="text-xs font-mono space-y-1 text-zinc-300 pt-1 border-t border-zinc-800">
                  <li>• Target: At least 1 Championship reign</li>
                  <li>• Number of reigns: 1x (50), 3x (85), 5x+ (100)</li>
                  <li>• Defense bonus: +2.5 pts per title defense</li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400">
                  <Clock className="w-4 h-4" />
                  <span>3. Simulator Longevity (30%)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Rewards years of loyalty, matches contested, and staying at a high level without retiring early.
                </p>
                <ul className="text-xs font-mono space-y-1 text-zinc-300 pt-1 border-t border-zinc-800">
                  <li>• Age factor: Age 38+ (85 pts), Age 42+ (100 pts)</li>
                  <li>• Matches factor: 30+ total matches contested</li>
                  <li>• Continuous tenure in the simulator</li>
                </ul>
              </div>
            </div>

            {/* Eligibility Tiers */}
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold font-mono text-zinc-200 uppercase mb-3">
                Score Tiers & Committee Balloting:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-zinc-950 p-3 rounded-lg border border-emerald-500/40">
                  <div className="font-bold text-emerald-400">First-Ballot Lock (75 - 100)</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Automatic unanimous induction into the Headliner or Living Legend category.
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-amber-500/40">
                  <div className="font-bold text-amber-400">Strong Candidate (55 - 74)</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Multi-time champion with strong longevity; ideal class headliner or co-headliner.
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-700">
                  <div className="font-bold text-zinc-300">Borderline Candidate (40 - 54)</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Solid midcard workhorse or specialist who contributed to historic tag teams.
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-rose-950">
                  <div className="font-bold text-rose-400">Not Yet Eligible (&lt; 40)</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Younger talent or talent needing more matches and title reigns to qualify.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: HOST INDUCTION CEREMONY */}
      {/* ============================================================ */}
      {showCeremonyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Host Hall of Fame Induction Ceremony</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCeremonyModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Select Inductee / Candidate</label>
                <select
                  value={selectedCandidateId}
                  onChange={e => setSelectedCandidateId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  {availableCandidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isRetired ? '(Retired)' : '(Active)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Induction Class Title</label>
                  <input
                    type="text"
                    value={inductionClassTitle}
                    onChange={e => setInductionClassTitle(e.target.value)}
                    placeholder="e.g. Class of 2026"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Induction Category</label>
                  <select
                    value={inductionCategory}
                    onChange={e => setInductionCategory(e.target.value as HallOfFameCategory)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
                  >
                    <option value="Headliner">Diamond Headliner</option>
                    <option value="Living Legend">Living Legend</option>
                    <option value="Icon">Icon</option>
                    <option value="Warrior">Warrior</option>
                    <option value="Trailblazer">Trailblazer</option>
                    <option value="Pioneer">Pioneer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Inductor (Host / Speaker)</label>
                <input
                  type="text"
                  value={inductorName}
                  onChange={e => setInductorName(e.target.value)}
                  placeholder="e.g. Longtime rival, mentor, or General Manager"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Immortal Acceptance Speech Quote</label>
                <textarea
                  value={speechQuote}
                  onChange={e => setSpeechQuote(e.target.value)}
                  placeholder="The legendary quote delivered during the Hall of Fame enshrinement banquet..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Career Biography Summary</label>
                <textarea
                  value={bioSummary}
                  onChange={e => setBioSummary(e.target.value)}
                  placeholder="Highlights of the superstar's legacy, historic matches, and contributions to the territory..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCeremonyModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInduction}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition shadow"
              >
                Enshrine into Hall of Fame
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ANNOUNCE SUPERSTAR RETIREMENT */}
      {/* ============================================================ */}
      {showRetireModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Scroll className="w-5 h-5 text-amber-400" />
                <span>Announce Superstar Retirement</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRetireModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Superstar Stepping Away</label>
                <select
                  value={retiringWrestlerId}
                  onChange={e => setRetiringWrestlerId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-sans focus:outline-none focus:border-amber-500"
                >
                  {promotion.roster.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Age {w.age} • {w.wins}W-{w.losses}L)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Retirement Context / Farewell Reason</label>
                <select
                  value={retirementReason}
                  onChange={e => setRetirementReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-sans focus:outline-none focus:border-amber-500 mb-2"
                >
                  <option value="Culminating Farewell Tour & Voluntary Retirement">Culminating Farewell Tour & Voluntary Retirement</option>
                  <option value="Career vs Career Grudge Match Loss">Career vs Career Grudge Match Loss</option>
                  <option value="Chronic Wear-and-Tear & Medical Advice">Chronic Wear-and-Tear & Medical Advice</option>
                  <option value="Passing the Torch to the Next Generation">Passing the Torch to the Next Generation</option>
                  <option value="Transitioning to Head Coach / Backstage Producer">Transitioning to Head Coach / Backstage Producer</option>
                </select>
                <input
                  type="text"
                  value={retirementReason}
                  onChange={e => setRetirementReason(e.target.value)}
                  placeholder="Custom farewell reason..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 text-[11px] leading-relaxed">
                Retiring this superstar will relieve their weekly payroll obligations, move their career record to the Retired Legends Wing, and make them eligible for the Hall of Fame.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowRetireModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRetirement}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs transition shadow"
              >
                Hang Up the Boots
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EXPANDED GOLDEN PLAQUE VIEW */}
      {/* ============================================================ */}
      {expandedPlaque && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-gradient-to-b from-amber-950/60 via-zinc-950 to-zinc-950 border-2 border-amber-500 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative space-y-6 text-center animate-fade-in">
            <button
              type="button"
              onClick={() => setExpandedPlaque(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Plaque Crest */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 mx-auto flex items-center justify-center text-black shadow-lg shadow-amber-500/20 border-2 border-amber-300">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
                Official Hall of Fame Induction Plaque
              </div>
              <h2 className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {expandedPlaque.name}
              </h2>
              <div className="text-sm font-mono text-amber-300 italic mt-0.5">
                "{expandedPlaque.nickname}"
              </div>
              <div className="mt-2 text-xs font-mono text-zinc-400">
                <span>{expandedPlaque.classTitle}</span>
                <span className="mx-2">•</span>
                <span>{expandedPlaque.category}</span>
                <span className="mx-2">•</span>
                <span>Inducted by {expandedPlaque.inductorName}</span>
              </div>
            </div>

            {/* Plaque Biography */}
            <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-lg mx-auto">
              {expandedPlaque.biographySummary}
            </p>

            {/* Historic Career Metrics */}
            <div className="grid grid-cols-4 gap-2 bg-zinc-900/90 p-4 rounded-xl border border-amber-500/30 text-xs font-mono">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">CAREER RECORD</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {expandedPlaque.careerStats.totalWins}-{expandedPlaque.careerStats.totalLosses}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">CHAMPIONSHIPS</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {expandedPlaque.careerStats.totalTitleReigns}x Reigns
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">DEFENSES</div>
                <div className="text-base font-bold text-amber-300 mt-0.5">
                  {expandedPlaque.careerStats.careerTitleDefenses} Defenses
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">OVERALL RATING</div>
                <div className="text-base font-bold text-sky-400 mt-0.5">
                  {expandedPlaque.scorecard.overallScore}/100
                </div>
              </div>
            </div>

            {/* Speech Quote */}
            <blockquote className="text-xs italic text-amber-200 font-sans leading-relaxed max-w-md mx-auto">
              {expandedPlaque.speechQuote}
            </blockquote>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setExpandedPlaque(null)}
                className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition"
              >
                Close Plaque
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

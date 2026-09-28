import React, { useState } from 'react';
import { Wrestler, Promotion, PushLevel, Alignment, GameView, NewsItem } from '../types';
import { MarkdownTableView } from './MarkdownTableView';
import { calculateHallOfFameScorecard } from '../data/customDefaults';
import { 
  Users, 
  UserPlus, 
  RotateCcw, 
  ShieldAlert, 
  Heart, 
  Battery, 
  Zap, 
  ChevronLeft, 
  DollarSign, 
  UserX,
  Search,
  Trophy,
  Award,
  Clock,
  AlertTriangle,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Activity,
  Plus,
  Minus,
  X,
  Info,
  Pencil,
  Flame,
  Scroll,
  TrendingUp
} from 'lucide-react';
import { formatNumber } from '../utils/format';

interface RosterViewProps {
  promotion: Promotion;
  freeAgents: Wrestler[];
  onUpdateRoster: (newRoster: Wrestler[]) => void;
  onUpdateFreeAgents: (newFreeAgents: Wrestler[]) => void;
  onBackToMenu: () => void;
  onUpdatePromotion?: (newPromo: Promotion) => void;
  onNavigate?: (view: GameView) => void;
  onAddNewsItem?: (news: NewsItem) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  promotion,
  freeAgents,
  onUpdateRoster,
  onUpdateFreeAgents,
  onBackToMenu,
  onUpdatePromotion,
  onNavigate,
  onAddNewsItem
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'free_agents'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'overness' | 'retirement_risk' | 'age' | 'wins'>('overness');
  
  // Modals & State
  const [selectedRetirementWrestler, setSelectedRetirementWrestler] = useState<Wrestler | null>(null);
  const [customRetirementAgeInput, setCustomRetirementAgeInput] = useState<number>(44);
  const [customFarewellReason, setCustomFarewellReason] = useState<string>('Passing the torch after an iconic career');
  const [promptHofModal, setPromptHofModal] = useState<Wrestler | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to determine retirement risk badge
  const getRetirementRiskInfo = (w: Wrestler) => {
    const targetAge = w.retirementAge || (w.style === 'High Flyer' ? 40 : w.style === 'Hardcore' ? 41 : w.style === 'Powerhouse' ? 45 : 44);
    const injuries = w.careerInjuriesCount || 0;

    if (w.age >= targetAge) {
      return {
        level: 'Imminent',
        label: '⚠️ Retirement Imminent',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        description: `Reached or exceeded planned retirement age (${w.age}/${targetAge}). Superstars at this stage may retire naturally any week.`
      };
    }
    if (w.age >= targetAge - 2 || injuries >= 3) {
      return {
        level: 'High',
        label: 'High Retirement Risk',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        description: `Within 2 years of planned retirement or bearing heavy injury wear (${injuries} career injuries).`
      };
    }
    if (w.age >= targetAge - 4 || injuries >= 2) {
      return {
        level: 'Moderate',
        label: 'Approaching Twilight',
        badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        description: `Within 4 years of retirement. Time to consider feud culminations and championship runs.`
      };
    }
    return {
      level: 'Low',
      label: 'Prime Longevity',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: `In peak physical condition with minimal injury wear. Expected to compete for many seasons.`
    };
  };

  // Filtered and Sorted Roster
  const filteredRoster = promotion.roster
    .filter(w =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.style.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'overness') return b.overness - a.overness;
      if (sortBy === 'age') return b.age - a.age;
      if (sortBy === 'wins') return b.wins - a.wins;
      if (sortBy === 'retirement_risk') {
        const order = { 'Imminent': 4, 'High': 3, 'Moderate': 2, 'Low': 1 };
        const riskA = order[getRetirementRiskInfo(a).level as keyof typeof order] || 1;
        const riskB = order[getRetirementRiskInfo(b).level as keyof typeof order] || 1;
        return riskB - riskA || b.age - a.age;
      }
      return 0;
    });

  const filteredFreeAgents = freeAgents.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Turn Face / Heel
  const handleToggleAlignment = (wrestlerId: string) => {
    const updated = promotion.roster.map(w => {
      if (w.id === wrestlerId) {
        const newAlign: Alignment = w.alignment === 'Face' ? 'Heel' : 'Face';
        return {
          ...w,
          alignment: newAlign,
          morale: Math.min(100, w.morale + 5)
        };
      }
      return w;
    });
    onUpdateRoster(updated);
    if (onUpdatePromotion) {
      onUpdatePromotion({ ...promotion, roster: updated });
    }
    showToast(`Turned ${updated.find(w => w.id === wrestlerId)?.name} ${updated.find(w => w.id === wrestlerId)?.alignment}!`);
  };

  // Change Push Level
  const handleChangePush = (wrestlerId: string, newPush: PushLevel) => {
    const updated = promotion.roster.map(w => {
      if (w.id === wrestlerId) {
        return { ...w, push: newPush };
      }
      return w;
    });
    onUpdateRoster(updated);
    if (onUpdatePromotion) {
      onUpdatePromotion({ ...promotion, roster: updated });
    }
  };

  // Fire / Release talent
  const handleFireWrestler = (wrestlerId: string) => {
    const wrestler = promotion.roster.find(w => w.id === wrestlerId);
    if (!wrestler) return;

    const updatedRoster = promotion.roster.filter(w => w.id !== wrestlerId);
    const updatedFA = [...freeAgents, { ...wrestler, contractWeeks: 0 }];
    onUpdateRoster(updatedRoster);
    onUpdateFreeAgents(updatedFA);
    if (onUpdatePromotion) {
      onUpdatePromotion({ ...promotion, roster: updatedRoster });
    }
    if (selectedRetirementWrestler?.id === wrestlerId) setSelectedRetirementWrestler(null);
    showToast(`Released ${wrestler.name} from their contract.`);
  };

  // Sign Free Agent
  const handleSignFreeAgent = (faId: string) => {
    const fa = freeAgents.find(w => w.id === faId);
    if (!fa) return;

    const newWrestler: Wrestler = {
      ...fa,
      contractWeeks: 52,
      retirementAge: fa.retirementAge || Math.max(fa.age + 2, fa.style === 'High Flyer' ? 40 : fa.style === 'Hardcore' ? 41 : 44),
      careerInjuriesCount: fa.careerInjuriesCount || 0,
      injuryHistory: fa.injuryHistory || []
    };

    const newRoster = [...promotion.roster, newWrestler];
    onUpdateRoster(newRoster);
    onUpdateFreeAgents(freeAgents.filter(w => w.id !== faId));
    if (onUpdatePromotion) {
      onUpdatePromotion({ ...promotion, roster: newRoster });
    }
    showToast(`Signed ${fa.name} to a 52-week contract!`);
  };

  // Update Planned Retirement Age
  const handleUpdateRetirementAge = (wrestlerId: string, newRetireAge: number) => {
    const clamped = Math.max(35, Math.min(55, newRetireAge));
    const updated = promotion.roster.map(w => {
      if (w.id === wrestlerId) {
        return {
          ...w,
          retirementAge: clamped
        };
      }
      return w;
    });

    onUpdateRoster(updated);
    if (onUpdatePromotion) {
      onUpdatePromotion({ ...promotion, roster: updated });
    }
    const targetW = updated.find(w => w.id === wrestlerId);
    if (targetW) {
      setSelectedRetirementWrestler(targetW);
    }
    showToast(`Updated planned retirement age for ${targetW?.name} to ${clamped} years.`);
  };

  // Booker Career Action: Convince to Delay Retirement (+1 Year)
  const handleDelayRetirement = (wrestlerId: string) => {
    const wrestler = promotion.roster.find(w => w.id === wrestlerId);
    if (!wrestler) return;

    const bonusCost = 5000;
    if (promotion.budget < bonusCost) {
      showToast(`Insufficient funds ($${formatNumber(bonusCost)} required for veteran retention bonus).`);
      return;
    }

    const currentTarget = wrestler.retirementAge || Math.max(wrestler.age + 1, 44);
    const newTarget = currentTarget + 1;

    const updated = promotion.roster.map(w => {
      if (w.id === wrestlerId) {
        return {
          ...w,
          retirementAge: newTarget,
          morale: Math.min(100, w.morale + 8)
        };
      }
      return w;
    });

    onUpdateRoster(updated);
    if (onUpdatePromotion) {
      onUpdatePromotion({
        ...promotion,
        budget: promotion.budget - bonusCost,
        roster: updated
      });
    }
    const targetW = updated.find(w => w.id === wrestlerId);
    if (targetW) {
      setSelectedRetirementWrestler(targetW);
    }

    showToast(`Convinced ${wrestler.name} to delay retirement (+1 year to age ${newTarget}) with a $5,000 veteran bonus!`);
  };

  // Booker Career Action: Book Farewell Tour & Immediate Retirement
  const handleRetireWrestlerWithCeremony = (wrestlerId: string, reasonText?: string) => {
    const wrestler = promotion.roster.find(w => w.id === wrestlerId);
    if (!wrestler) return;

    const scorecard = calculateHallOfFameScorecard(wrestler, promotion.titles);
    const isHofEligible = scorecard.overallScore >= 45 || scorecard.eligibilityTier !== 'Not Yet Eligible';

    const reason = reasonText?.trim() || (
      (wrestler.careerInjuriesCount || 0) >= 3
        ? `Physical wear-and-tear after ${wrestler.careerInjuriesCount} major career injuries, stepping down at age ${wrestler.age}`
        : `Fulfilling planned retirement age milestone (${wrestler.age}) to mentor future stars`
    );

    const retiredW: Wrestler = {
      ...wrestler,
      isRetired: true,
      retiredWeek: 1,
      retiredYear: 2026,
      retirementReason: reason,
      salary: 0,
      contractWeeks: 0,
      careerWeeksInSimulator: wrestler.careerWeeksInSimulator || Math.max(30, (wrestler.age - 20) * 12),
      peakOverness: Math.max(wrestler.overness, wrestler.peakOverness || wrestler.overness),
      hofNominationPending: isHofEligible
    };

    const updatedRoster = promotion.roster.filter(w => w.id !== wrestlerId);
    const updatedRetired = [retiredW, ...(promotion.retiredRoster || [])];

    // Vacate any championships held
    let updatedTitles = [...promotion.titles];
    if (wrestler.championshipIds && wrestler.championshipIds.length > 0) {
      updatedTitles = updatedTitles.map(t => {
        if (t.currentHolderIds.includes(wrestler.id)) {
          return {
            ...t,
            currentHolderIds: t.currentHolderIds.filter(id => id !== wrestler.id)
          };
        }
        return t;
      });
    }

    onUpdateRoster(updatedRoster);

    if (onUpdatePromotion) {
      onUpdatePromotion({
        ...promotion,
        roster: updatedRoster,
        retiredRoster: updatedRetired,
        titles: updatedTitles
      });
    }

    if (onAddNewsItem) {
      onAddNewsItem({
        id: `news-retire-farewell-${Date.now()}`,
        week: 1,
        category: 'Wrestler',
        importance: 'High',
        headline: isHofEligible
          ? `HALL OF FAME NOMINATION: ${wrestler.name} Retires with Immortal Pedigree!`
          : `RETIREMENT: ${wrestler.name} Officially Hangs Up the Boots`,
        details: `${wrestler.name} (age ${wrestler.age}) has officially stepped down from active competition (${reason}). ${
          isHofEligible
            ? `Boasting an overall legacy score of ${scorecard.overallScore}/100 (${scorecard.eligibilityTier}), an induction opportunity has opened in the Hall of Fame!`
            : `We celebrate their storied contributions to the promotion.`
        }`
      });
    }

    setSelectedRetirementWrestler(null);
    if (isHofEligible) {
      setPromptHofModal(retiredW);
    }
    showToast(`${wrestler.name} has officially retired and moved to the Retired Legends Wing!`);
  };

  // Open Retirement Planning modal
  const handleOpenRetirementModal = (w: Wrestler) => {
    setSelectedRetirementWrestler(w);
    setCustomRetirementAgeInput(w.retirementAge || Math.max(w.age + 2, w.style === 'High Flyer' ? 40 : w.style === 'Hardcore' ? 41 : 44));
    setCustomFarewellReason(
      (w.careerInjuriesCount || 0) >= 3
        ? `Physical wear-and-tear after ${w.careerInjuriesCount} major injuries`
        : `Passing the torch to future stars after an iconic career`
    );
  };

  // Build Markdown table of the roster
  let rosterMarkdown = `| Name & Gimmick | Style | Age / Retire | Injuries | HOF Trajectory | Record | Salary/Wk | Status |
|---|---|---|---|---|---|---|---|
`;
  promotion.roster.forEach(w => {
    const injuryStr = w.injury.injured ? `🚑 ${w.injury.name} (${w.injury.weeksRemaining}w)` : 'Active';
    const scorecard = calculateHallOfFameScorecard(w, promotion.titles);
    const retireTarget = w.retirementAge || 44;
    rosterMarkdown += `| ${w.name} ("${w.nickname}") | ${w.style} (${w.alignment}) | Age ${w.age} / Retires ~${retireTarget} | ${w.careerInjuriesCount || 0} major injuries | ${scorecard.eligibilityTier} (${scorecard.overallScore}/100) | ${w.wins}-${w.losses}-${w.draws} | $${formatNumber(w.salary)} | ${injuryStr} |\n`;
  });

  const agingTalentCount = promotion.roster.filter(w => {
    const risk = getRetirementRiskInfo(w).level;
    return risk === 'Imminent' || risk === 'High';
  }).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToMenu}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 mb-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Booker Hub
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              <span>[ 2 ] Roster & Career Longevity Management</span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {promotion.roster.length} Contracted
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage superstar pushes, turns, contracts, and planned retirement ages. Competitors naturally retire based on age and career injury toll, unlocking Hall of Fame induction opportunities.
          </p>
        </div>

        {/* Tab & Search controls */}
        <div className="flex items-center gap-2">
          <div className="flex rounded bg-zinc-900 border border-zinc-800 p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-sky-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Active Roster</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('free_agents')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                activeTab === 'free_agents'
                  ? 'bg-sky-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Free Agents ({freeAgents.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Longevity & Retirement Horizon Quick Digest */}
      {activeTab === 'roster' && (
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-amber-950/30 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white font-mono">Retirement & Natural Attrition Horizon</h4>
                {agingTalentCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {agingTalentCount} Superstars Near Retirement
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every competitor features a customizable <strong>Retirement Age</strong>. When age and injury wear culminate, stars naturally retire, creating Hall of Fame enshrinement opportunities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('hall_of_fame')}
                className="px-3.5 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-mono text-xs font-bold border border-yellow-500/40 flex items-center gap-1.5 transition"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Hall of Fame Wing ({promotion.retiredRoster?.length || 0} Retirees)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter roster by superstar name, gimmick, or wrestling style..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        {activeTab === 'roster' && (
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-zinc-500 text-[11px]">SORT BY:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-zinc-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="overness" className="bg-zinc-900">Highest Overness</option>
              <option value="retirement_risk" className="bg-zinc-900">Retirement Risk / Proximity</option>
              <option value="age" className="bg-zinc-900">Oldest Veterans First</option>
              <option value="wins" className="bg-zinc-900">Most Career Wins</option>
            </select>
          </div>
        )}
      </div>

      {/* Markdown View of Roster */}
      {activeTab === 'roster' && (
        <MarkdownTableView
          title={`ROSTER LEDGER & LONGEVITY BREAKDOWN (${promotion.roster.length} TALENT)`}
          markdown={rosterMarkdown}
          defaultToMarkdown={false}
        >
          <div className="text-xs text-zinc-400 font-mono">
            High Overness and high Mic Skills carry mainstream entertainment shows. High Workrate and Stamina rule technical and lucha showcases.
          </div>
        </MarkdownTableView>
      )}

      {/* Roster Cards Grid */}
      {activeTab === 'roster' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoster.map(w => {
            const isInjured = w.injury.injured;
            const targetRetire = w.retirementAge || (w.style === 'High Flyer' ? 40 : w.style === 'Hardcore' ? 41 : w.style === 'Powerhouse' ? 45 : 44);
            const riskInfo = getRetirementRiskInfo(w);
            const scorecard = calculateHallOfFameScorecard(w, promotion.titles);
            const isNearRetirement = w.age >= targetRetire - 2 || (w.careerInjuriesCount || 0) >= 3;

            return (
              <div
                key={w.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isInjured
                    ? 'bg-rose-950/20 border-rose-900/50'
                    : isNearRetirement
                    ? 'bg-zinc-900 border-amber-500/40 hover:border-amber-500/70 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Top Bar: Alignment and Push */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAlignment(w.id)}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold border transition flex items-center gap-1 ${
                        w.alignment === 'Face'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                      title="Click to execute Face/Heel Turn"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{w.alignment}</span>
                    </button>

                    <select
                      value={w.push}
                      onChange={e => handleChangePush(w.id, e.target.value as PushLevel)}
                      className="bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Main Eventer">Main Eventer</option>
                      <option value="Upper Midcard">Upper Midcard</option>
                      <option value="Midcard">Midcard</option>
                      <option value="Lower Midcard">Lower Midcard</option>
                      <option value="Opener">Opener</option>
                      <option value="Jobber">Jobber</option>
                    </select>
                  </div>

                  {/* Name & Gimmick */}
                  <div className="mb-2">
                    <h3 className="font-bold text-white font-mono text-base flex items-center justify-between">
                      <span className="truncate">{w.name}</span>
                      {w.championshipIds.length > 0 && <span title="Current Champion">🏆</span>}
                    </h3>
                    <p className="text-xs text-zinc-400 italic font-sans truncate">"{w.nickname}"</p>
                    <span className="text-[11px] font-mono text-zinc-500">{w.style}</span>
                  </div>

                  {/* Longevity & Retirement Age Bar */}
                  <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80 mb-3 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        Age: <strong className="text-white">{w.age}</strong> • Retires: <strong className="text-amber-400">~{targetRetire}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenRetirementModal(w)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 transition"
                        title="Adjust planned retirement age & career strategy"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        <span>Plan</span>
                      </button>
                    </div>

                    {/* Proximity / Risk pill & Injury Count */}
                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-zinc-900">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${riskInfo.badgeClass}`}>
                        {riskInfo.label}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenRetirementModal(w)}
                        className="text-[10px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition"
                        title="Click to view career injury history"
                      >
                        <span>🚑 {w.careerInjuriesCount || 0} Injuries</span>
                      </button>
                    </div>
                  </div>

                  {/* Stat Bars Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/60">
                      <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                        <span>Overness</span>
                        <span className="text-amber-400 font-bold">{w.overness}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${w.overness}%` }} />
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/60">
                      <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                        <span>Workrate</span>
                        <span className="text-cyan-400 font-bold">{w.workrate}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${w.workrate}%` }} />
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/60">
                      <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                        <span>Mic Skills</span>
                        <span className="text-purple-400 font-bold">{w.micSkills}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-purple-400 h-full rounded-full" style={{ width: `${w.micSkills}%` }} />
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/60">
                      <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                        <span>Stamina</span>
                        <span className="text-emerald-400 font-bold">{w.stamina}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${w.stamina}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Vitals: Morale & Fatigue */}
                  <div className="flex items-center justify-between text-xs font-mono px-1 text-zinc-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      Morale: <strong className={w.morale < 60 ? 'text-rose-400' : 'text-zinc-200'}>{w.morale}%</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-amber-400" />
                      Fatigue: <strong className={w.fatigue > 35 ? 'text-amber-400' : 'text-zinc-200'}>{w.fatigue}%</strong>
                    </span>
                  </div>

                  {/* Active Injury Alert */}
                  {isInjured && (
                    <div className="bg-rose-950/60 border border-rose-800/80 p-2 rounded text-xs font-mono text-rose-300 flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                      <div>
                        <strong>{w.injury.name}</strong> ({w.injury.weeksRemaining} wks out)
                      </div>
                    </div>
                  )}

                  {/* Hall of Fame Forecast Badge */}
                  <div className="flex items-center justify-between bg-zinc-950/60 px-2.5 py-1.5 rounded border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      HOF Forecast:
                    </span>
                    <span className={`font-bold ${
                      scorecard.eligibilityTier === 'First-Ballot Lock'
                        ? 'text-emerald-400'
                        : scorecard.eligibilityTier === 'Strong Candidate'
                        ? 'text-amber-400'
                        : 'text-zinc-300'
                    }`}>
                      {scorecard.eligibilityTier} ({scorecard.overallScore}/100)
                    </span>
                  </div>
                </div>

                {/* Bottom Bar: Record, Salary, Retirement & Release */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Record: <strong className="text-zinc-200">{w.wins}-{w.losses}-{w.draws}</strong></span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">${formatNumber(w.salary)}/wk</span>
                    <button
                      type="button"
                      onClick={() => handleOpenRetirementModal(w)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-zinc-700 transition font-mono text-[11px] font-bold flex items-center gap-1"
                      title="Manage retirement age and HOF trajectory"
                    >
                      <Award className="w-3 h-3" />
                      <span>Retirement</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFireWrestler(w.id)}
                      className="p-1.5 rounded hover:bg-rose-950 hover:text-rose-400 text-zinc-500 transition"
                      title="Release / Fire Talent"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Free Agent Scouting Market */
        <div className="space-y-4">
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-400">
            Sign hot independent free agents to bolster your roster, strengthen your workrate, or bring marquee star power.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFreeAgents.map(fa => {
              const targetRetire = fa.retirementAge || Math.max(fa.age + 2, fa.style === 'High Flyer' ? 40 : fa.style === 'Hardcore' ? 41 : 44);
              return (
                <div
                  key={fa.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        fa.alignment === 'Face' ? 'bg-sky-500/10 text-sky-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {fa.alignment} • {fa.push}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        ${formatNumber(fa.salary)} / week
                      </span>
                    </div>

                    <h3 className="font-bold text-white font-mono text-base">{fa.name}</h3>
                    <p className="text-xs text-zinc-400 italic mb-2">"{fa.nickname}" • {fa.style}</p>
                    <div className="text-[11px] font-mono text-zinc-400 mb-3 flex items-center justify-between">
                      <span>Age: <strong className="text-zinc-200">{fa.age}</strong></span>
                      <span>Target Retire: <strong className="text-amber-400">~{targetRetire}</strong></span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950 p-2.5 rounded border border-zinc-800/80 mb-3">
                      <div>Overness: <strong className="text-amber-400">{fa.overness}</strong></div>
                      <div>Workrate: <strong className="text-cyan-400">{fa.workrate}</strong></div>
                      <div>Mic Skills: <strong className="text-purple-400">{fa.micSkills}</strong></div>
                      <div>Stamina: <strong className="text-emerald-400">{fa.stamina}</strong></div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSignFreeAgent(fa.id)}
                    className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Offer 1-Year Contract</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CAREER LONGEVITY, RETIREMENT AGE & HOF STRATEGY */}
      {/* ============================================================ */}
      {selectedRetirementWrestler && (() => {
        const w = selectedRetirementWrestler;
        const targetRetire = w.retirementAge || (w.style === 'High Flyer' ? 40 : w.style === 'Hardcore' ? 41 : w.style === 'Powerhouse' ? 45 : 44);
        const riskInfo = getRetirementRiskInfo(w);
        const scorecard = calculateHallOfFameScorecard(w, promotion.titles);
        const injuries = w.careerInjuriesCount || 0;

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto font-sans">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                      <span>{w.name}</span>
                      <span className="text-xs text-zinc-400 font-normal">("{w.nickname}")</span>
                    </h3>
                    <div className="text-xs font-mono text-zinc-400">
                      {w.style} • {w.alignment} • Age {w.age} • Contract: {w.contractWeeks} weeks
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRetirementWrestler(null)}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Retirement Risk Status Box */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 uppercase text-[11px]">Natural Retirement Status:</span>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${riskInfo.badgeClass}`}>
                    {riskInfo.label}
                  </span>
                </div>
                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  {riskInfo.description}
                </p>
              </div>

              {/* Section 1: Retirement Age Setting */}
              <div className="space-y-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Target Natural Retirement Age</span>
                    </h4>
                    <p className="text-xs text-zinc-400 font-sans mt-0.5">
                      The simulation checks age vs retirement age and injury wear. When reached, natural retirement triggers.
                    </p>
                  </div>
                  <div className="text-xl font-bold text-amber-400 font-mono">
                    Age {targetRetire}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateRetirementAge(w.id, targetRetire - 1)}
                    disabled={targetRetire <= Math.max(35, w.age)}
                    className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-200 transition"
                    title="Lower retirement age"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min={Math.max(35, w.age)}
                    max={55}
                    value={targetRetire}
                    onChange={e => handleUpdateRetirementAge(w.id, parseInt(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={() => handleUpdateRetirementAge(w.id, targetRetire + 1)}
                    disabled={targetRetire >= 55}
                    className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-200 transition"
                    title="Raise retirement age"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 2: Career Injury History & Physical Wear */}
              <div className="space-y-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Career Injury History & Physical Toll</span>
                  </h4>
                  <span className="font-bold text-rose-400">{injuries} Major Injuries</span>
                </div>
                <p className="text-zinc-400 font-sans text-xs">
                  Repeated injuries accelerate fatigue and increase likelihood of retiring early before planned target age.
                </p>

                {w.injuryHistory && w.injuryHistory.length > 0 ? (
                  <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {w.injuryHistory.map((rec, idx) => (
                      <div key={idx} className="bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 flex items-center justify-between text-zinc-300">
                        <span>🚑 {rec}</span>
                        <span className="text-rose-400 text-[10px] font-bold">Medical Log</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-500 italic py-1">
                    No major career injuries logged yet. Peak durability.
                  </div>
                )}
              </div>

              {/* Section 3: Hall of Fame Trajectory Breakdown */}
              <div className="space-y-3 bg-gradient-to-br from-amber-950/30 to-zinc-950 p-4 rounded-xl border border-amber-500/30 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Hall of Fame Enshrinement Trajectory</span>
                  </h4>
                  <span className={`px-2 py-0.5 rounded font-bold border text-xs ${
                    scorecard.eligibilityTier === 'First-Ballot Lock'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : scorecard.eligibilityTier === 'Strong Candidate'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}>
                    {scorecard.eligibilityTier} ({scorecard.overallScore}/100)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-500">CAREER WINS (30%)</div>
                    <div className="text-base font-bold text-emerald-400">{scorecard.winsScore}/100</div>
                    <div className="text-[10px] text-zinc-400">{w.wins} Victories</div>
                  </div>

                  <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-500">CHAMPIONSHIPS (40%)</div>
                    <div className="text-base font-bold text-amber-400">{scorecard.championshipsScore}/100</div>
                    <div className="text-[10px] text-zinc-400">{w.championshipIds.length} Belts Won</div>
                  </div>

                  <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-500">SIMULATOR LONGEVITY (30%)</div>
                    <div className="text-base font-bold text-sky-400">{scorecard.longevityScore}/100</div>
                    <div className="text-[10px] text-zinc-400">{w.careerWeeksInSimulator || 50} Weeks Active</div>
                  </div>
                </div>
              </div>

              {/* Section 4: Booker Career Interventions */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider">
                  Booker Career Interventions
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Convince to Delay */}
                  <button
                    type="button"
                    onClick={() => handleDelayRetirement(w.id)}
                    className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-left transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-xs font-mono flex items-center justify-between">
                        <span>Convince to Delay Retirement (+1 Yr)</span>
                        <span className="text-[10px] text-amber-400">$5,000 Bonus</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                        Praise veteran leadership, award a financial incentive, and push retirement age target to {targetRetire + 1}. Boosts morale!
                      </p>
                    </div>
                  </button>

                  {/* Option B: Formal Retirement Tour */}
                  <button
                    type="button"
                    onClick={() => handleRetireWrestlerWithCeremony(w.id, customFarewellReason)}
                    className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-amber-300 text-xs font-mono flex items-center justify-between">
                        <span>Book Farewell Tour & Retire</span>
                        <Scroll className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 font-sans">
                        Retire superstar with ceremony, moving them to the Retired Legends Wing and unlocking immediate Hall of Fame nomination!
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================ */}
      {/* MODAL: POST-RETIREMENT HOF ENROLLMENT PROMPT */}
      {/* ============================================================ */}
      {promptHofModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-amber-950/60 to-zinc-950 border border-amber-500/70 rounded-2xl max-w-lg w-full p-6 text-center space-y-4 shadow-2xl font-mono">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mx-auto">
              <Trophy className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white">
              Immortal Opportunity Awaits!
            </h3>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Legendary superstar <strong className="text-amber-400">{promptHofModal.name}</strong> has officially retired from the squared circle with verified Hall of Fame credentials. Would you like to proceed to the Enshrinement Ceremony?
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPromptHofModal(null);
                  if (onNavigate) onNavigate('hall_of_fame');
                }}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <Award className="w-4 h-4" />
                <span>Go to Hall of Fame Enshrinement</span>
              </button>

              <button
                type="button"
                onClick={() => setPromptHofModal(null)}
                className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
              >
                Decide Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

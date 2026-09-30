import React, { useState } from 'react';
import { 
  Promotion, 
  Wrestler, 
  DevelopmentalTerritory, 
  DevelopmentalFocus,
  ExcursionDestination,
  DevelopmentalExcursion
} from '../types';
import { 
  getDefaultDevelopmentalTerritory, 
  generateScoutedProspect, 
  EXCURSION_DESTINATIONS,
  DEVELOPMENTAL_COACHES 
} from '../data/developmentalAndBrandDefaults';
import { formatNumber } from '../utils/format';
import { 
  GraduationCap, 
  Plane, 
  Users, 
  Award, 
  ChevronLeft, 
  Plus, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Flame, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Compass, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings, 
  HelpCircle,
  X,
  UserPlus,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface DevelopmentalViewProps {
  promotion: Promotion;
  currentWeek: number;
  currentYear: number;
  onUpdatePromotion: (newPromo: Promotion) => void;
  onBackToMenu: () => void;
}

export const DevelopmentalView: React.FC<DevelopmentalViewProps> = ({
  promotion,
  currentWeek,
  currentYear,
  onUpdatePromotion,
  onBackToMenu
}) => {
  const territory: DevelopmentalTerritory = promotion.developmentalTerritory || getDefaultDevelopmentalTerritory(promotion);

  const [activeTab, setActiveTab] = useState<'trainees' | 'excursions' | 'facility' | 'history'>('trainees');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [selectedExcursionWrestler, setSelectedExcursionWrestler] = useState<Wrestler | null>(null);
  const [selectedExcursionDestination, setSelectedExcursionDestination] = useState<ExcursionDestination>('Japan (Strong Style Dojo)');
  const [excursionWeeks, setExcursionWeeks] = useState<number>(12);

  const [selectedCallUpWrestler, setSelectedCallUpWrestler] = useState<Wrestler | null>(null);
  const [callUpMethod, setCallUpMethod] = useState<'hype_vignettes' | 'surprise_debut'>('hype_vignettes');

  const [isDemoteModalOpen, setIsDemoteModalOpen] = useState(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trainees on roster
  const trainees = promotion.roster.filter(w => territory.traineeIds.includes(w.id));
  const mainRosterStars = promotion.roster.filter(w => !territory.traineeIds.includes(w.id) && !w.isRetired);

  // 1. Scout and Sign New Prospect
  const handleScoutProspect = () => {
    const cost = 5000;
    if (promotion.budget < cost) {
      showToast(`Insufficient funds ($${formatNumber(cost)} required to scout indie talent).`);
      return;
    }

    const newProspect = generateScoutedProspect(promotion);
    const updatedRoster = [...promotion.roster, newProspect];
    const updatedTerritory: DevelopmentalTerritory = {
      ...territory,
      traineeIds: [...territory.traineeIds, newProspect.id],
      historyLogs: [
        {
          id: `log-${Date.now()}`,
          week: currentWeek,
          year: currentYear,
          wrestlerName: newProspect.name,
          type: 'scout',
          headline: `Scouted Prospect Signed: ${newProspect.name}`,
          details: `Signed 20-year-old ${newProspect.style} ${newProspect.name} ("${newProspect.nickname}") to a developmental contract.`
        },
        ...territory.historyLogs
      ]
    };

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - cost,
      roster: updatedRoster,
      developmentalTerritory: updatedTerritory
    });

    showToast(`Scouted and signed rookie sensation ${newProspect.name} to the Performance Center!`);
  };

  // 2. Call Up to Main Roster
  const handleExecuteCallUp = () => {
    if (!selectedCallUpWrestler) return;

    const w = selectedCallUpWrestler;
    const isVignette = callUpMethod === 'hype_vignettes';
    const vignetteCost = 5000;

    if (isVignette && promotion.budget < vignetteCost) {
      showToast(`Insufficient budget ($${formatNumber(vignetteCost)} needed for TV hype vignettes).`);
      return;
    }

    const overnessBoost = isVignette ? 6 : 2;
    const updatedRoster = promotion.roster.map(item => {
      if (item.id === w.id) {
        return {
          ...item,
          isDevelopmental: false,
          push: (item.push === 'Jobber' ? 'Opener' : item.push) as Wrestler['push'],
          overness: Math.min(100, item.overness + overnessBoost),
          morale: Math.min(100, item.morale + 10)
        };
      }
      return item;
    });

    const updatedTerritory: DevelopmentalTerritory = {
      ...territory,
      traineeIds: territory.traineeIds.filter(id => id !== w.id),
      graduatesCount: territory.graduatesCount + 1,
      historyLogs: [
        {
          id: `log-callup-${Date.now()}`,
          week: currentWeek,
          year: currentYear,
          wrestlerName: w.name,
          type: 'call_up',
          headline: `MAIN ROSTER CALL-UP: ${w.name}`,
          details: isVignette
            ? `Promoted to main televised roster backed by heavy prime-time video vignettes (+${overnessBoost} Overness)!`
            : `Promoted to main roster for a shocking surprise debut (+${overnessBoost} Overness)!`
        },
        ...territory.historyLogs
      ]
    };

    onUpdatePromotion({
      ...promotion,
      budget: isVignette ? promotion.budget - vignetteCost : promotion.budget,
      roster: updatedRoster,
      developmentalTerritory: updatedTerritory
    });

    setSelectedCallUpWrestler(null);
    showToast(`Called up ${w.name} to the main broadcast roster!`);
  };

  // 3. Send on Excursion
  const handleSendOnExcursion = () => {
    if (!selectedExcursionWrestler) return;

    const w = selectedExcursionWrestler;
    const destObj = EXCURSION_DESTINATIONS.find(d => d.destination === selectedExcursionDestination)!;
    const cost = 4000;

    if (promotion.budget < cost) {
      showToast(`Insufficient travel funds ($${formatNumber(cost)} needed for international work visas).`);
      return;
    }

    const newExcursion: DevelopmentalExcursion = {
      id: `exc-${Date.now()}`,
      wrestlerId: w.id,
      wrestlerName: w.name,
      destination: selectedExcursionDestination,
      weeksRemaining: excursionWeeks,
      totalWeeks: excursionWeeks,
      targetSkill: destObj.primaryBonus,
      departureWeek: currentWeek,
      departureYear: currentYear,
      projectedBonus: `+${Math.round(excursionWeeks * 0.7)} to ${destObj.primaryBonus}`
    };

    const updatedRoster = promotion.roster.map(item => {
      if (item.id === w.id) {
        return {
          ...item,
          excursion: {
            destination: selectedExcursionDestination,
            weeksRemaining: excursionWeeks,
            totalWeeks: excursionWeeks,
            targetSkill: destObj.primaryBonus,
            departureWeek: currentWeek,
            departureYear: currentYear
          }
        };
      }
      return item;
    });

    const updatedTerritory: DevelopmentalTerritory = {
      ...territory,
      traineeIds: territory.traineeIds.filter(id => id !== w.id), // temporarily off active campus
      excursions: [...territory.excursions, newExcursion],
      historyLogs: [
        {
          id: `log-exc-${Date.now()}`,
          week: currentWeek,
          year: currentYear,
          wrestlerName: w.name,
          type: 'excursion_depart',
          headline: `INTERNATIONAL EXCURSION: ${w.name} Departs for ${destObj.country}`,
          details: `Sent on a ${excursionWeeks}-week learning excursion with ${selectedExcursionDestination} to master ${destObj.primaryBonus}.`
        },
        ...territory.historyLogs
      ]
    };

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - cost,
      roster: updatedRoster,
      developmentalTerritory: updatedTerritory
    });

    setSelectedExcursionWrestler(null);
    showToast(`Dispatched ${w.name} on overseas excursion to ${destObj.country}!`);
  };

  // 4. Recall Excursion Early
  const handleRecallExcursion = (excursionId: string) => {
    const exc = territory.excursions.find(e => e.id === excursionId);
    if (!exc) return;

    const weeksCompleted = exc.totalWeeks - exc.weeksRemaining;
    const partialBonus = Math.max(2, Math.round(weeksCompleted * 0.5));

    const updatedRoster = promotion.roster.map(w => {
      if (w.id === exc.wrestlerId) {
        const target = exc.targetSkill;
        return {
          ...w,
          excursion: undefined,
          [target]: Math.min(100, ((w[target] as number) || 50) + partialBonus)
        };
      }
      return w;
    });

    const updatedTerritory: DevelopmentalTerritory = {
      ...territory,
      excursions: territory.excursions.filter(e => e.id !== excursionId),
      traineeIds: [...territory.traineeIds, exc.wrestlerId],
      historyLogs: [
        {
          id: `log-recall-${Date.now()}`,
          week: currentWeek,
          year: currentYear,
          wrestlerName: exc.wrestlerName,
          type: 'excursion_return',
          headline: `EXCURSION RECALL: ${exc.wrestlerName} Returns Early`,
          details: `Recalled from ${exc.destination} after ${weeksCompleted} weeks (+${partialBonus} to ${exc.targetSkill}). Rejoining developmental camp.`
        },
        ...territory.historyLogs
      ]
    };

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster,
      developmentalTerritory: updatedTerritory
    });

    showToast(`Recalled ${exc.wrestlerName} from overseas excursion (+${partialBonus} ${exc.targetSkill})!`);
  };

  // 5. Demote from Main Roster
  const handleDemoteToDevelopmental = (wrestlerId: string) => {
    const w = promotion.roster.find(item => item.id === wrestlerId);
    if (!w) return;

    const updatedRoster = promotion.roster.map(item => {
      if (item.id === wrestlerId) {
        return {
          ...item,
          isDevelopmental: true,
          morale: Math.max(30, item.morale - 8) // slight morale sting
        };
      }
      return item;
    });

    const updatedTerritory: DevelopmentalTerritory = {
      ...territory,
      traineeIds: [...territory.traineeIds, wrestlerId],
      historyLogs: [
        {
          id: `log-demote-${Date.now()}`,
          week: currentWeek,
          year: currentYear,
          wrestlerName: w.name,
          type: 'demote',
          headline: `REASSIGNMENT: ${w.name} Stationed in Developmental`,
          details: `Transferred from television roster to ${territory.name} for technical fine-tuning and character repackaging.`
        },
        ...territory.historyLogs
      ]
    };

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster,
      developmentalTerritory: updatedTerritory
    });

    setIsDemoteModalOpen(false);
    showToast(`Reassigned ${w.name} to ${territory.name}.`);
  };

  // 6. Change Training Focus
  const handleChangeFocus = (focus: DevelopmentalFocus) => {
    const updatedTerritory: DevelopmentalTerritory = {
      ...territory,
      focusArea: focus
    };

    onUpdatePromotion({
      ...promotion,
      developmentalTerritory: updatedTerritory
    });

    showToast(`Updated developmental training curriculum to "${focus.replace('_', ' ').toUpperCase()}".`);
  };

  // 7. Appoint Head Coach
  const handleAppointCoach = (coach: typeof DEVELOPMENTAL_COACHES[0]) => {
    const updatedTerritory: DevelopmentalTerritory = {
      ...territory,
      headCoachId: coach.id,
      headCoachName: coach.name,
      headCoachPerk: coach.perk
    };

    onUpdatePromotion({
      ...promotion,
      developmentalTerritory: updatedTerritory
    });

    setIsCoachModalOpen(false);
    showToast(`Appointed ${coach.name} as Head Coach of ${territory.name}!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-black px-4 py-3 rounded-xl font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-amber-400 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
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
              <span>[ D ] {territory.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {territory.location}
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            Cultivate green prospects and indie recruits without risking main TV ratings. Dispatch talent on overseas learning excursions, appoint legendary coaches, and execute high-impact call-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleScoutProspect}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <UserPlus className="w-4 h-4" />
            <span>Scout Rookie ($5k)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDemoteModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono font-bold text-xs flex items-center gap-1.5 transition border border-zinc-700"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Send Down Talent</span>
          </button>
        </div>
      </div>

      {/* Facility Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
            <span>Head Coach</span>
            <button
              type="button"
              onClick={() => setIsCoachModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold text-[10px]"
            >
              Change
            </button>
          </div>
          <div className="text-sm font-bold text-white truncate">{territory.headCoachName || 'Unassigned'}</div>
          <div className="text-[10px] text-amber-400/90 truncate">{territory.headCoachPerk?.split(':')[0]}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
            <span>Current Focus</span>
            <span className="text-sky-400 font-bold">{territory.focusArea.replace('_', ' ').toUpperCase()}</span>
          </div>
          <select
            value={territory.focusArea}
            onChange={e => handleChangeFocus(e.target.value as DevelopmentalFocus)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="balanced">Balanced Curriculum</option>
            <option value="workrate_drills">Workrate & Ring Drills (+Workrate)</option>
            <option value="promo_classes">Promo & Charisma (+Mic Skills)</option>
            <option value="stamina_conditioning">Stamina & Conditioning (+Stamina)</option>
            <option value="character_refinement">Gimmick Refinement (+Overness)</option>
          </select>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase">Operational Budget</div>
          <div className="text-sm font-bold text-emerald-400">${formatNumber(territory.weeklyBudgetCost)} / week</div>
          <div className="text-[10px] text-zinc-400">{trainees.length} Trainees • {territory.excursions.length} Overseas</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase">Academy Pedigree</div>
          <div className="text-sm font-bold text-amber-400">{territory.reputation}/100 Prestige</div>
          <div className="text-[10px] text-zinc-400">{territory.graduatesCount} Main Roster Graduates</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('trainees')}
          className={`px-4 py-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'trainees'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Trainees ({trainees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('excursions')}
          className={`px-4 py-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'excursions'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Overseas Excursions ({territory.excursions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facility')}
          className={`px-4 py-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'facility'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Coaching & Excursion Guides</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'history'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Academy Archives</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE TRAINEES */}
      {activeTab === 'trainees' && (
        <div className="space-y-4">
          {trainees.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center space-y-4">
              <GraduationCap className="w-12 h-12 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-mono">The Performance Center is Currently Vacant</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
                  Sign young blue-chip indie prospects or send struggling main roster stars down to polish their craft and rebuild momentum.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleScoutProspect}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Scout First Prospect ($5,000)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDemoteModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition border border-zinc-700"
                >
                  Reassign Main Roster Star
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainees.map(w => {
                // Readiness score: average of workrate and overness
                const readiness = Math.round((w.workrate * 0.6) + (w.overness * 0.4));
                const isCallUpReady = readiness >= 65 || w.workrate >= 72;

                return (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {w.style} • Age {w.age}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          isCallUpReady 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {isCallUpReady ? '⚡ Call-Up Ready' : 'In Training'}
                        </span>
                      </div>

                      <h3 className="font-bold text-white font-mono text-base">{w.name}</h3>
                      <p className="text-xs text-zinc-400 italic mb-2.5">"{w.nickname}"</p>

                      {/* Attribute Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Workrate:</span>
                          <strong className="text-cyan-400">{w.workrate}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Mic Skills:</span>
                          <strong className="text-purple-400">{w.micSkills}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Overness:</span>
                          <strong className="text-amber-400">{w.overness}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Stamina:</span>
                          <strong className="text-emerald-400">{w.stamina}</strong>
                        </div>
                      </div>

                      {/* TV Readiness Progress Bar */}
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-zinc-400">TV Readiness Score</span>
                          <span className={isCallUpReady ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{readiness}/100</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isCallUpReady ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, readiness)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setSelectedCallUpWrestler(w)}
                        className="py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 transition shadow"
                        title="Promote talent to main weekly TV show"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Call Up</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedExcursionWrestler(w)}
                        className="py-1.5 rounded bg-zinc-800 hover:bg-sky-500 hover:text-black text-sky-400 border border-zinc-700 font-bold flex items-center justify-center gap-1 transition"
                        title="Send on overseas learning excursion"
                      >
                        <Plane className="w-3.5 h-3.5" />
                        <span>Excursion</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OVERSEAS EXCURSIONS */}
      {activeTab === 'excursions' && (
        <div className="space-y-4">
          {territory.excursions.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
              <Globe className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white font-mono">No Superstars Currently Overseas</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
                Sending young talent on 8 to 16 week learning excursions to Japan, Mexico, or the UK accelerates their workrate, stamina, and international prestige.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {territory.excursions.map(exc => {
                const percentDone = Math.round(((exc.totalWeeks - exc.weeksRemaining) / exc.totalWeeks) * 100);
                const destDef = EXCURSION_DESTINATIONS.find(d => d.destination === exc.destination);

                return (
                  <div 
                    key={exc.id}
                    className="p-5 rounded-2xl bg-zinc-900 border border-sky-500/40 space-y-4 font-mono text-xs shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{destDef?.flag || '✈️'}</span>
                          <h4 className="text-base font-bold text-white">{exc.wrestlerName}</h4>
                        </div>
                        <p className="text-xs text-sky-400 font-sans">{exc.destination}</p>
                      </div>

                      <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 text-[11px]">
                        {exc.weeksRemaining} Weeks Left
                      </span>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
                      <div className="flex justify-between text-zinc-400">
                        <span>Target Focus:</span>
                        <strong className="text-emerald-400 uppercase">{exc.targetSkill} ({exc.projectedBonus})</strong>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Excursion Term:</span>
                        <span>{exc.totalWeeks - exc.weeksRemaining} / {exc.totalWeeks} Weeks Logged</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full rounded-full transition-all" style={{ width: `${percentDone}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-500">
                        Returns automatically upon term completion.
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRecallExcursion(exc.id)}
                        className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 border border-zinc-700 transition font-bold text-[11px]"
                      >
                        Recall Early
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COACHING STAFF & EXCURSION DESTINATIONS GUIDE */}
      {activeTab === 'facility' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Available Legendary Head Coaches</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
              {DEVELOPMENTAL_COACHES.map(coach => {
                const isSelected = territory.headCoachId === coach.id;
                return (
                  <div
                    key={coach.id}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500/60 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-bold text-white text-sm">{coach.name}</h4>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold">
                            ACTIVE COACH
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                        {coach.perk}
                      </p>
                    </div>

                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => handleAppointCoach(coach)}
                        className="w-full mt-2 py-1.5 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-zinc-700 font-bold transition text-xs"
                      >
                        Appoint Head Coach
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>International Excursion Partner Territories</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {EXCURSION_DESTINATIONS.map(dest => (
                <div key={dest.destination} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="text-lg">{dest.flag}</span>
                      <span>{dest.destination}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold text-[10px]">
                      +{dest.primaryBonus.toUpperCase()} FOCUS
                    </span>
                  </div>
                  <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                    {dest.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHIVE & GRADUATES LOG */}
      {activeTab === 'history' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Chronological Academy Activity Log</span>
            <span>Total Entries: {territory.historyLogs.length}</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {territory.historyLogs.map(log => (
              <div 
                key={log.id} 
                className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.type === 'call_up' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      log.type === 'scout' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      log.type === 'excursion_depart' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {log.type.replace('_', ' ')}
                    </span>
                    <strong className="text-white text-sm">{log.headline}</strong>
                  </div>
                  <span className="text-zinc-500 text-[11px]">Wk {log.week}, {log.year}</span>
                </div>
                <p className="text-zinc-400 font-sans text-xs pt-0.5">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CALL UP TO MAIN ROSTER */}
      {selectedCallUpWrestler && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Call Up {selectedCallUpWrestler.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCallUpWrestler(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-300 font-sans text-xs">
              Promoting {selectedCallUpWrestler.name} makes them immediately available on your weekly television show cards and PPVs. Choose your promotional rollout:
            </p>

            <div className="space-y-2">
              <label 
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  callUpMethod === 'hype_vignettes' 
                    ? 'bg-amber-500/10 border-amber-500/50 text-white' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="callUpMethod"
                  checked={callUpMethod === 'hype_vignettes'}
                  onChange={() => setCallUpMethod('hype_vignettes')}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <span>Prime-Time Video Vignette Campaign</span>
                    <span className="text-[10px] text-amber-400">$5,000</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Air cinematic teaser videos for 3 weeks prior to arrival. Generates massive anticipation and grants <strong>+6 Starting Overness</strong>.
                  </p>
                </div>
              </label>

              <label 
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  callUpMethod === 'surprise_debut' 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="callUpMethod"
                  checked={callUpMethod === 'surprise_debut'}
                  onChange={() => setCallUpMethod('surprise_debut')}
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <div className="font-bold text-emerald-300 flex items-center gap-2">
                    <span>Unannounced Shock Debut Attack</span>
                    <span className="text-[10px] text-emerald-400">Free</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Jump the guardrail or attack a top champion during a live broadcast promo segment. Grants <strong>+2 Starting Overness</strong> and high drama.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedCallUpWrestler(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCallUp}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition shadow"
              >
                Confirm Call-Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH ON EXCURSION */}
      {selectedExcursionWrestler && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-sky-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Send {selectedExcursionWrestler.name} on Excursion</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExcursionWrestler(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-zinc-400 uppercase text-[10px] block mb-1">Select Destination:</label>
                <select
                  value={selectedExcursionDestination}
                  onChange={e => setSelectedExcursionDestination(e.target.value as ExcursionDestination)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-sky-500"
                >
                  {EXCURSION_DESTINATIONS.map(d => (
                    <option key={d.destination} value={d.destination}>
                      {d.flag} {d.destination} — (+{d.primaryBonus.toUpperCase()} Focus)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 uppercase text-[10px] block mb-1">Excursion Duration:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[8, 12, 16].map(weeks => (
                    <button
                      key={weeks}
                      type="button"
                      onClick={() => setExcursionWeeks(weeks)}
                      className={`py-2 rounded-lg border font-bold transition ${
                        excursionWeeks === weeks
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {weeks} Weeks
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                <div className="text-zinc-400">Total Travel & Living Stipend: <strong className="text-emerald-400">$4,000</strong></div>
                <div className="text-[11px] text-zinc-500 font-sans">
                  The wrestler will be abroad and unable to be booked on TV until their term concludes or they are recalled.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedExcursionWrestler(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendOnExcursion}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold transition shadow"
              >
                Dispatch Superstar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DEMOTE MAIN ROSTER TALENT TO DEVELOPMENTAL */}
      {isDemoteModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Reassign Talent to Developmental</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoteModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-400 font-sans text-xs">
              Sending a superstar to {territory.name} allows them to sharpen skills without being exposed to TV fatigue or match losses. (Note: Causes minor initial morale dip).
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {mainRosterStars.map(w => (
                <div
                  key={w.id}
                  className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <strong className="text-white text-sm">{w.name}</strong>
                    <div className="text-[11px] text-zinc-400">
                      {w.style} • {w.push} • Overness: {w.overness} • Workrate: {w.workrate}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDemoteToDevelopmental(w.id)}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 font-bold text-xs transition border border-zinc-700 shrink-0"
                  >
                    Send Down
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsDemoteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

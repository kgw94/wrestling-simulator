import React, { useState, useEffect } from 'react';
import { Wrestler, Promotion, Championship, ChampionshipHistoryEntry } from '../types';
import { calculateHallOfFameScorecard } from '../data/customDefaults';
import { formatNumber } from '../utils/format';
import { 
  Trophy, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Activity, 
  X, 
  Heart, 
  Battery, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Percent, 
  Star, 
  Crown,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Medal,
  Users
} from 'lucide-react';

export interface WrestlerCareerModalProps {
  wrestler: Wrestler | null;
  promotion: Promotion;
  onClose: () => void;
  onOpenRetirementPlan?: (wrestler: Wrestler) => void;
  onTriggerFarewellTour?: (wrestler: Wrestler) => void;
}

export interface ExtractedTitleReign {
  titleId: string;
  titleName: string;
  titleType?: string;
  prestige: number;
  isTagTeam?: boolean;
  isCurrent: boolean;
  reignNumber?: number;
  wonWeek: number;
  wonYear?: number;
  lostWeek?: number;
  lostYear?: number;
  defenses: number;
  eventWonAt?: string;
  notes?: string;
  reignRating?: string;
}

export const WrestlerCareerModal: React.FC<WrestlerCareerModalProps> = ({
  wrestler,
  promotion,
  onClose,
  onOpenRetirementPlan,
  onTriggerFarewellTour
}) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!wrestler) return null;

  // Career Win / Loss Math
  const wins = wrestler.wins || 0;
  const losses = wrestler.losses || 0;
  const draws = wrestler.draws || 0;
  const totalMatches = wins + losses + draws;
  const winRate = totalMatches > 0 ? (wins / totalMatches) : 0;
  const winPercentage = Math.round(winRate * 100);
  const lossPercentage = totalMatches > 0 ? Math.round((losses / totalMatches) * 100) : 0;
  const drawPercentage = totalMatches > 0 ? Math.max(0, 100 - winPercentage - lossPercentage) : 0;
  const differential = wins - losses;

  // Hall of fame trajectory
  const scorecard = calculateHallOfFameScorecard(wrestler, promotion.titles);
  const targetRetire = wrestler.retirementAge || (
    wrestler.style === 'High Flyer' ? 40 : wrestler.style === 'Hardcore' ? 41 : wrestler.style === 'Powerhouse' ? 45 : 44
  );

  // Extract all titles held (current and historical)
  const currentTitles: Championship[] = [];
  const historicalReigns: ExtractedTitleReign[] = [];

  promotion.titles.forEach(title => {
    const isCurrentHolder = Boolean(
      wrestler.championshipIds?.includes(title.id) || 
      title.currentHolderIds?.includes(wrestler.id)
    );

    if (isCurrentHolder) {
      currentTitles.push(title);
    }

    // Check history entries
    if (title.history && title.history.length > 0) {
      title.history.forEach((h, index) => {
        const matchByName = h.holderNames?.toLowerCase().includes(wrestler.name.toLowerCase());
        const matchById = h.holderIds?.includes(wrestler.id);

        if (matchByName || matchById) {
          historicalReigns.push({
            titleId: title.id,
            titleName: title.name,
            titleType: title.type,
            prestige: title.prestige,
            isTagTeam: title.isTagTeam,
            isCurrent: Boolean(h.isCurrent || (isCurrentHolder && index === 0)),
            reignNumber: h.reignNumber || (title.history.length - index),
            wonWeek: h.wonWeek,
            wonYear: h.wonYear || 2026,
            lostWeek: h.lostWeek,
            lostYear: h.lostYear,
            defenses: h.defenses || 0,
            eventWonAt: h.eventWonAt,
            notes: h.notes,
            reignRating: h.reignRating
          });
        }
      });
    } else if (isCurrentHolder) {
      // Current holder but no history array item yet
      historicalReigns.push({
        titleId: title.id,
        titleName: title.name,
        titleType: title.type,
        prestige: title.prestige,
        isTagTeam: title.isTagTeam,
        isCurrent: true,
        reignNumber: 1,
        wonWeek: 1,
        wonYear: 2026,
        defenses: title.defenses || 0,
        notes: 'Inaugural / Reign in Progress'
      });
    }
  });

  // Calculate total historical defenses
  const totalDefensesLogged = historicalReigns.reduce((sum, r) => sum + r.defenses, 0);
  const distinctTitlesWonCount = new Set(historicalReigns.map(r => r.titleName)).size;

  // Injury details
  const isCurrentlyInjured = wrestler.injury?.injured;
  const injuryHistoryList = wrestler.injuryHistory || [];
  const careerInjuriesCount = wrestler.careerInjuriesCount || (isCurrentlyInjured ? 1 : 0) + injuryHistoryList.length;

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto font-sans relative my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Row */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4 gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-2xl border shadow-lg shrink-0 ${
              wrestler.alignment === 'Face'
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {wrestler.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                  {wrestler.name}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                  wrestler.alignment === 'Face'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {wrestler.alignment}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {wrestler.push}
                </span>
                {currentTitles.length > 0 && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>Reigning Champion</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 italic">
                "{wrestler.nickname}" • <span className="font-mono text-zinc-300">{wrestler.style}</span> ({wrestler.gender})
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400 pt-0.5">
                <span>Age: <strong className="text-white">{wrestler.age}</strong></span>
                <span>•</span>
                <span>Salary: <strong className="text-emerald-400">${formatNumber(wrestler.salary)}/wk</strong></span>
                <span>•</span>
                <span>Contract: <strong className="text-zinc-200">{wrestler.contractWeeks} wks</strong></span>
                <span>•</span>
                <span>Planned Retire: <strong className="text-amber-400">~{targetRetire}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenRetirementPlan && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRetirementPlan(wrestler);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-zinc-700 transition text-xs font-mono font-bold"
                title="Manage career longevity and planned retirement"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Retirement Planning</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Medical Status Notification Banner */}
        {isCurrentlyInjured ? (
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3 text-rose-300 text-xs font-mono shadow-sm">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-rose-200">Active Injury Sidelined:</span>{' '}
                <strong>{wrestler.injury.name || 'Severe Strain'}</strong> — Estimated recovery in{' '}
                <strong className="text-white">{wrestler.injury.weeksRemaining || 1} weeks</strong>.
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 text-[10px]">
              Unavailable for Matches
            </span>
          </div>
        ) : (
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-2.5 px-3.5 flex items-center justify-between gap-3 text-emerald-300 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full In-Ring Medical Clearance: 100% active and eligible for competition.</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              Fatigue: <strong className={wrestler.fatigue > 35 ? 'text-amber-400' : 'text-emerald-400'}>{wrestler.fatigue}%</strong>
            </span>
          </div>
        )}

        {/* FAREWELL TOUR ACTIVE DASHBOARD OR RETIREMENT TRIGGER BANNER */}
        {wrestler.farewellTour && wrestler.farewellTour.isActive ? (
          <div className="bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-zinc-950 border border-amber-500/50 rounded-xl p-4 space-y-3 font-mono text-xs shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                    Official Active Farewell Tour
                  </span>
                  <h4 className="text-base font-bold text-white font-mono">
                    "{wrestler.farewellTour.tourTitle}"
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase block">Company Prestige Boost</span>
                <span className="text-base font-bold text-amber-400">+{wrestler.farewellTour.prestigeAccumulated} Pts</span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-zinc-300 mb-1">
                <span>
                  Tour Matches Completed: <strong className="text-amber-400">{wrestler.farewellTour.matchesBookedCount}</strong> / {wrestler.farewellTour.targetMatchesCount}
                </span>
                <span className="text-zinc-400">
                  {Math.round((wrestler.farewellTour.matchesBookedCount / wrestler.farewellTour.targetMatchesCount) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
                  style={{ width: `${Math.min(100, Math.round((wrestler.farewellTour.matchesBookedCount / wrestler.farewellTour.targetMatchesCount) * 100))}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-zinc-800">
              <span className="text-zinc-400">
                Protege: <strong className="text-zinc-200">{wrestler.farewellTour.torchPassedWrestlerName || 'Open Roster'}</strong>
              </span>
              <span className="text-zinc-400 text-right">
                Stipulation: <strong className="text-zinc-200">{wrestler.farewellTour.farewellStipulation}</strong>
              </span>
            </div>

            {onTriggerFarewellTour && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTriggerFarewellTour(wrestler);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Manage Farewell Tour Details</span>
                </button>
              </div>
            )}
          </div>
        ) : (wrestler.age >= targetRetire - 3 || (wrestler.careerInjuriesCount || 0) >= 3 || wrestler.age >= 38) && !wrestler.isRetired ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 uppercase tracking-wider block">
                  Veteran Approaching Retirement: Farewell Tour Eligible
                </span>
                <p className="text-zinc-300 text-[11px] mt-0.5 font-sans">
                  Sanction an official multi-match farewell tour for {wrestler.name}. Every special farewell match booked boosts company prestige!
                </p>
              </div>
            </div>

            {onTriggerFarewellTour && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerFarewellTour(wrestler);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Launch Farewell Tour (+Prestige)</span>
              </button>
            )}
          </div>
        ) : null}

        {/* SECTION 1: CAREER WIN / LOSS RECORD & STATS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Career Win/Loss Record & In-Ring Efficiency</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              Total Matches: <strong className="text-white">{totalMatches}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center">
            {/* Wins */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Victories (W)</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{wins}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{winPercentage}% of card</div>
            </div>

            {/* Losses */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Defeats (L)</div>
              <div className="text-2xl font-black text-rose-400 mt-0.5">{losses}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{lossPercentage}% of card</div>
            </div>

            {/* Draws */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Draws / No Contest</div>
              <div className="text-2xl font-black text-zinc-300 mt-0.5">{draws}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{drawPercentage}% of card</div>
            </div>

            {/* Win Percentage */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-sky-500/30">
              <div className="text-[10px] text-sky-400 uppercase tracking-wider">Win Percentage</div>
              <div className="text-2xl font-black text-sky-300 mt-0.5">{winPercentage}%</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                {totalMatches > 0 ? (wins / totalMatches).toFixed(3) : '.000'} AVG
              </div>
            </div>

            {/* Differential / Momentum */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Differential (+/-)</div>
              <div className={`text-2xl font-black mt-0.5 ${
                differential > 0 ? 'text-emerald-400' : differential < 0 ? 'text-rose-400' : 'text-zinc-400'
              }`}>
                {differential > 0 ? `+${differential}` : differential}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Net record</div>
            </div>
          </div>

          {/* Visual Win/Loss Distribution Bar */}
          {totalMatches > 0 ? (
            <div className="space-y-1">
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all" 
                  style={{ width: `${winPercentage}%` }} 
                  title={`Wins: ${wins} (${winPercentage}%)`}
                />
                <div 
                  className="bg-rose-500 h-full transition-all" 
                  style={{ width: `${lossPercentage}%` }} 
                  title={`Losses: ${losses} (${lossPercentage}%)`}
                />
                <div 
                  className="bg-zinc-500 h-full transition-all" 
                  style={{ width: `${drawPercentage}%` }} 
                  title={`Draws: ${draws} (${drawPercentage}%)`}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-0.5">
                <span className="text-emerald-400">Wins ({winPercentage}%)</span>
                {draws > 0 && <span className="text-zinc-400">Draws ({drawPercentage}%)</span>}
                <span className="text-rose-400">Losses ({lossPercentage}%)</span>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 text-center text-xs font-mono text-zinc-500">
              No televised matches logged yet for this superstar. Book them in upcoming shows to start accumulating career wins!
            </div>
          )}
        </div>

        {/* SECTION 2: LIST OF TITLES & CHAMPIONSHIP REIGNS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Championships & Title History</span>
            </h3>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span>Distinct Titles: <strong className="text-amber-400">{distinctTitlesWonCount}</strong></span>
              <span>•</span>
              <span>Total Reigns: <strong className="text-white">{historicalReigns.length}</strong></span>
              <span>•</span>
              <span>Title Defenses: <strong className="text-emerald-400">{totalDefensesLogged}</strong></span>
            </div>
          </div>

          {/* Currently Held Championships Banner */}
          {currentTitles.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Reign in Possession:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentTitles.map(ct => (
                  <div 
                    key={ct.id}
                    className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/50 rounded-xl p-3.5 flex items-center justify-between shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold text-white font-mono text-sm">{ct.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                        <span>Prestige: <strong className="text-amber-400">{ct.prestige}/100</strong></span>
                        <span>•</span>
                        <span>Defenses: <strong className="text-emerald-400">{ct.defenses} successful</strong></span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/40 uppercase">
                      Current Champ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historical Reigns Log */}
          {historicalReigns.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Full Championship Reigns Ledger:
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {historicalReigns.map((reign, idx) => (
                  <div 
                    key={`${reign.titleId}-${idx}`}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono transition ${
                      reign.isCurrent 
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' 
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Medal className={`w-3.5 h-3.5 shrink-0 ${reign.isCurrent ? 'text-amber-400' : 'text-zinc-500'}`} />
                        <strong className="text-white font-mono">{reign.titleName}</strong>
                        {reign.reignNumber && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Reign #{reign.reignNumber}
                          </span>
                        )}
                        {reign.isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-400 font-sans">
                        {reign.notes || `Title reign in ${promotion.name}`}
                        {reign.eventWonAt && <span className="text-zinc-400"> • Won at {reign.eventWonAt}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] shrink-0">
                      <div className="text-right">
                        <div>
                          <strong className="text-emerald-400">{reign.defenses}</strong> defenses
                        </div>
                        <div className="text-zinc-500 text-[10px]">
                          {reign.wonWeek ? `Wk ${reign.wonWeek}` : 'Wk 1'}
                          {reign.lostWeek ? ` - Wk ${reign.lostWeek}` : reign.isCurrent ? ' - Present' : ''}
                        </div>
                      </div>

                      {reign.reignRating && (
                        <div className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-bold text-[10px]">
                          {reign.reignRating}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800 text-center space-y-1.5">
              <Trophy className="w-7 h-7 text-zinc-600 mx-auto" />
              <div className="text-xs font-mono font-bold text-zinc-300">
                No Championships Won Yet
              </div>
              <p className="text-[11px] text-zinc-500 font-sans max-w-md mx-auto">
                {wrestler.name} is currently pursuing their first title coronation. Put them in top feuds and title matches to etch their name in company history.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 3: INJURY HISTORY & PHYSICAL DURABILITY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Medical Dossier & Injury History</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              Major Career Injuries: <strong className={careerInjuriesCount > 2 ? 'text-rose-400' : 'text-zinc-200'}>{careerInjuriesCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Current Medical Status</div>
              <div className="text-sm font-bold mt-1 flex items-center gap-1.5">
                {isCurrentlyInjured ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Sidelined ({wrestler.injury.weeksRemaining}w)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cleared to Compete
                  </span>
                )}
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Physical Durability Toll</div>
              <div className="text-sm font-bold mt-1 text-zinc-200">
                {careerInjuriesCount === 0 
                  ? 'Pristine (No Wear)' 
                  : careerInjuriesCount <= 2 
                  ? 'Moderate Battle Toll' 
                  : 'High Wear & Tear'}
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Retirement Imminence</div>
              <div className="text-sm font-bold mt-1 text-amber-400">
                {wrestler.retirementRisk || (wrestler.age >= targetRetire ? 'Imminent' : wrestler.age >= targetRetire - 2 ? 'High' : 'Low')}
              </div>
            </div>
          </div>

          {/* Injury Log Records */}
          {injuryHistoryList.length > 0 || isCurrentlyInjured ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {isCurrentlyInjured && (
                <div className="bg-rose-950/30 border border-rose-800/60 p-2.5 rounded-lg text-xs font-mono text-rose-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span><strong>Current Active Injury:</strong> {wrestler.injury.name || 'Medical Protocol'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    {wrestler.injury.weeksRemaining} wks out
                  </span>
                </div>
              )}

              {injuryHistoryList.map((injuryStr, idx) => (
                <div 
                  key={idx}
                  className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-lg text-xs font-mono text-zinc-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400">🚑</span>
                    <span>{injuryStr}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Medical Archive
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 text-center text-xs font-mono text-zinc-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Clean Medical Record — No major career injuries sustained in active competition.</span>
            </div>
          )}
        </div>

        {/* SECTION 4: CORE ATTRIBUTES & LONGEVITY OVERVIEW */}
        <div className="space-y-3 pt-1 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Core In-Ring Attributes & Legacy Forecast</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              Hall of Fame Score: <strong className="text-amber-400">{scorecard.overallScore}/100</strong> ({scorecard.eligibilityTier})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                <span>Overness</span>
                <span className="text-amber-400 font-bold">{wrestler.overness}</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${wrestler.overness}%` }} />
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                <span>Workrate</span>
                <span className="text-cyan-400 font-bold">{wrestler.workrate}</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${wrestler.workrate}%` }} />
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                <span>Mic Skills</span>
                <span className="text-purple-400 font-bold">{wrestler.micSkills}</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: `${wrestler.micSkills}%` }} />
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
              <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                <span>Stamina</span>
                <span className="text-emerald-400 font-bold">{wrestler.stamina}</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${wrestler.stamina}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Morale: <strong className="text-zinc-200">{wrestler.morale}%</strong></span>
            <span>•</span>
            <span>Fatigue: <strong className={wrestler.fatigue > 35 ? 'text-amber-400' : 'text-zinc-200'}>{wrestler.fatigue}%</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold transition text-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

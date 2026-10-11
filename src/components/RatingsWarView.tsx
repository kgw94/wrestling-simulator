import React, { useState } from 'react';
import { Promotion, RatingsWarState, RivalPromotion, RivalWeeklyBattleResult } from '../types';
import { getDefaultRatingsWarState } from '../data/rivalPromotionsDefaults';
import { formatNumber } from '../utils/format';
import { 
  Swords, 
  Tv, 
  Trophy, 
  TrendingUp, 
  Flame, 
  Users, 
  ChevronLeft, 
  ShieldAlert, 
  CheckCircle2, 
  DollarSign, 
  AlertTriangle, 
  Zap, 
  Crown, 
  Radio, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  Info
} from 'lucide-react';

interface RatingsWarViewProps {
  promotion: Promotion;
  currentWeek: number;
  currentYear: number;
  onUpdatePromotion: (newPromo: Promotion) => void;
  onBackToMenu: () => void;
}

export const RatingsWarView: React.FC<RatingsWarViewProps> = ({
  promotion,
  currentWeek,
  currentYear,
  onUpdatePromotion,
  onBackToMenu
}) => {
  const ratingsWar: RatingsWarState = promotion.ratingsWar || getDefaultRatingsWarState(promotion);
  const { rivalPromotions, weeklyBattles, playerWins, rivalWins, ties, currentStreak, marketSharePercentage, warMoraleStatus } = ratingsWar;

  const [activeTab, setActiveTab] = useState<'battles' | 'rivals' | 'tactics'>('battles');
  const [selectedRivalId, setSelectedRivalId] = useState<string>(rivalPromotions[0]?.id || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedRival = rivalPromotions.find(r => r.id === selectedRivalId) || rivalPromotions[0];
  const latestBattle = weeklyBattles[0];

  // Tactical Actions
  const handleRunCounterProgramming = () => {
    const cost = 25000;
    if (promotion.budget < cost) {
      showToast(`Insufficient funds ($${formatNumber(cost)} needed to finance live counter-programming).`);
      return;
    }

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - cost,
      networkSatisfaction: Math.min(100, promotion.networkSatisfaction + 4)
    });

    showToast(`Purchased prime promotional airtime! Next week's broadcast will receive heavy cross-network ad blitz.`);
  };

  const handleDirtSheetCampaign = () => {
    const cost = 10000;
    if (promotion.budget < cost) {
      showToast(`Insufficient funds ($${formatNumber(cost)} needed for media leaks).`);
      return;
    }

    const updatedRivals = rivalPromotions.map(r => {
      if (r.id === selectedRival.id) {
        return {
          ...r,
          prestige: Math.max(60, r.prestige - 2),
          averageWeeklyRating: Number(Math.max(1.8, r.averageWeeklyRating - 0.05).toFixed(2))
        };
      }
      return r;
    });

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - cost,
      ratingsWar: {
        ...ratingsWar,
        rivalPromotions: updatedRivals
      }
    });

    showToast(`Planted anonymous backstage memos questioning ${selectedRival.name}'s creative trajectory! Competitor prestige trimmed by -2.`);
  };

  const handleNegotiateRightsBonus = () => {
    if (currentStreak < 2) {
      showToast(`Broadcasters require at least a 2-week winning streak before approving bonus rights fees.`);
      return;
    }

    const bonus = 40000;
    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget + bonus,
      ratingsWar: {
        ...ratingsWar,
        currentStreak: Math.max(0, currentStreak - 1)
      }
    });

    showToast(`Secured $${formatNumber(bonus)} in milestone rights bonus after capitalizing on your broadcast victory streak!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-black px-4 py-2.5 rounded-xl font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider mb-1">
            <Swords className="w-3.5 h-3.5 animate-pulse" />
            <span>Ratings Warfare Headquarters • Week {currentWeek}, Year {currentYear}</span>
          </div>
          <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
            AI Rival Promotion Ratings Battle
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Fight head-to-head against competing promotions in the battle for prime-time wrestling television supremacy.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToMenu}
          className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition self-start sm:self-auto border border-zinc-700 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Main Menu</span>
        </button>
      </div>

      {/* Monday Night Wars Style Scoreboard Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Player Side */}
          <div className="text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-amber-400">
              <Tv className="w-3.5 h-3.5" />
              <span>{promotion.shortName} Flagship</span>
            </div>
            <h3 className="text-2xl font-black text-white font-mono">
              {promotion.weeklyTVShow}
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Network: <span className="text-zinc-200">{promotion.tvNetwork}</span>
            </p>
            <div className="pt-2 text-emerald-400 font-mono font-bold text-sm">
              ★ {playerWins} Head-to-Head Wins
            </div>
          </div>

          {/* Center: The Scoreboard & Streak */}
          <div className="text-center space-y-2 py-4 px-6 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
              TELEVISION WAR RECORD
            </div>
            <div className="text-4xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-3">
              <span className="text-emerald-400">{playerWins}</span>
              <span className="text-zinc-600">-</span>
              <span className="text-rose-400">{rivalWins}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-mono">
              {currentStreak > 0 ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> 🔥 {currentStreak} Week Win Streak!
                </span>
              ) : currentStreak < 0 ? (
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> ⚠ Deficit Streak: {Math.abs(currentStreak)} Weeks
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">
                  Dead Heat
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-amber-300">
              Status: <strong>{warMoraleStatus}</strong>
            </div>
          </div>

          {/* Rival Side */}
          <div className="text-center md:text-right space-y-1">
            <div className="flex items-center justify-center md:justify-end gap-2 text-xs font-mono text-rose-400">
              <Swords className="w-3.5 h-3.5" />
              <span>Primary Competitor</span>
            </div>
            <h3 className="text-2xl font-black text-white font-mono">
              {selectedRival.name}
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              {selectedRival.weeklyShowName} on <span className="text-zinc-200">{selectedRival.networkName}</span>
            </p>
            <div className="pt-2 text-rose-400 font-mono font-bold text-sm">
              ★ {rivalWins} Rival Wins
            </div>
          </div>
        </div>

        {/* Market Share Progress Bar */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">
              National Viewership Market Share: <strong className="text-amber-400">{marketSharePercentage}%</strong>
            </span>
            <span className="text-zinc-500">
              Competitor Share: {(100 - marketSharePercentage).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500" 
              style={{ width: `${Math.min(95, Math.max(5, marketSharePercentage))}%` }} 
            />
            <div 
              className="h-full bg-rose-600 transition-all duration-500" 
              style={{ width: `${100 - Math.min(95, Math.max(5, marketSharePercentage))}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        {[
          { id: 'battles', label: 'Weekly War Timeline & Results', icon: Tv },
          { id: 'rivals', label: 'Rival Promotion Dossiers', icon: Users },
          { id: 'tactics', label: 'Counter-Programming & Countermeasures', icon: Zap }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-2 transition border ${
                activeTab === t.id
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BATTLES TIMELINE */}
      {activeTab === 'battles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-wider">
              Chronological Broadcast War Logs
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              Evaluated every week upon show simulation
            </span>
          </div>

          {weeklyBattles.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center space-y-2">
              <Tv className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400 font-mono">
                No head-to-head broadcast records logged yet. Advance a week to trigger the weekly ratings battle!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyBattles.map((battle, bIdx) => {
                const won = battle.isPlayerWinner;
                const margin = Math.abs(battle.marginViewers);

                return (
                  <div
                    key={`battle-${battle.year}-${battle.week}-${bIdx}`}
                    className={`border rounded-xl p-5 bg-zinc-900/90 shadow-sm space-y-4 ${
                      won ? 'border-emerald-500/50 hover:border-emerald-400' : 'border-rose-500/50 hover:border-rose-400'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                          Week {battle.week}, Year {battle.year}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[11px] flex items-center gap-1 ${
                          won ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {won ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          {won ? 'RATINGS WAR VICTORY' : 'RATINGS WAR LOSS'}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-zinc-400">
                        Audience Margin: <strong className={won ? 'text-emerald-400' : 'text-rose-400'}>
                          {won ? `+${formatNumber(margin)} Viewers` : `-${formatNumber(margin)} Viewers`}
                        </strong>
                      </div>
                    </div>

                    {/* Tale of the Tape: Our Show vs Rival Shows */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Our Card */}
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-amber-400 font-bold">{promotion.name}</span>
                          <span className="text-zinc-500">{battle.playerShowName}</span>
                        </div>
                        <div className="flex items-baseline gap-2 font-mono">
                          <span className="text-2xl font-black text-white">{battle.playerRating}</span>
                          <span className="text-xs text-zinc-400">Rating ({formatNumber(battle.playerViewers)} Viewers)</span>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">
                          Show Quality Score: <strong className="text-zinc-200">{battle.playerScore}/100</strong>
                        </div>
                      </div>

                      {/* Top Rival Card */}
                      {battle.rivals && battle.rivals[0] && (
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-rose-400 font-bold">{battle.rivals[0].rivalName}</span>
                            <span className="text-zinc-500">{battle.rivals[0].rivalShowName}</span>
                          </div>
                          <div className="flex items-baseline gap-2 font-mono">
                            <span className="text-2xl font-black text-zinc-200">{battle.rivals[0].rating}</span>
                            <span className="text-xs text-zinc-400">Rating ({formatNumber(battle.rivals[0].viewers)} Viewers)</span>
                          </div>
                          <div className="text-xs text-zinc-400 line-clamp-1 font-sans">
                            <strong className="text-zinc-300 font-mono">Main Event: </strong>
                            {battle.rivals[0].mainEvent}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Narrative Dirt Sheet Recap */}
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed pt-2 border-t border-zinc-800/80">
                      {battle.narrativeRecap}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RIVAL DOSSIERS */}
      {activeTab === 'rivals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rival Selector Sidebar */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider mb-2">
              Select Promotion Intel
            </h4>
            {rivalPromotions.map(rival => {
              const isSelected = rival.id === selectedRival.id;
              return (
                <button
                  key={rival.id}
                  type="button"
                  onClick={() => setSelectedRivalId(rival.id)}
                  className={`w-full text-left p-3.5 rounded-xl border font-mono transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-zinc-800 border-amber-500 text-white shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rival.primaryColor }} />
                      <span>{rival.name}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {rival.weeklyShowName}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-300">
                    {rival.averageWeeklyRating} TV
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dossier Detail Panel */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedRival.primaryColor }} />
                  <span>Competitor Dossier • {selectedRival.shortName}</span>
                </div>
                <h3 className="text-2xl font-black text-white font-mono">
                  {selectedRival.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Flagship: <span className="text-zinc-200">{selectedRival.weeklyShowName}</span> ({selectedRival.networkTimeSlot})
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-zinc-500 uppercase block">Company Prestige</span>
                <span className="text-xl font-black text-amber-400">{selectedRival.prestige}/100</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-center">
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Broadcaster</span>
                <span className="text-xs font-bold text-zinc-200 mt-1 block truncate">{selectedRival.networkName}</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Head Matchmaker</span>
                <span className="text-xs font-bold text-zinc-200 mt-1 block truncate">{selectedRival.headBooker}</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Avg TV Rating</span>
                <span className="text-xs font-bold text-sky-400 mt-1 block">{selectedRival.averageWeeklyRating} Rating</span>
              </div>
            </div>

            {/* Key Contracted Stars */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-zinc-400 uppercase font-mono">
                Marquee Main Event Roster
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {selectedRival.keyStars.map((star, i) => (
                  <div key={i} className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-medium">{star}</span>
                    <span className="text-[10px] text-amber-400">Main Eventer</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Champions */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-zinc-400 uppercase font-mono">
                Reigning Championship Belts
              </h5>
              <div className="space-y-2">
                {selectedRival.champions.map((c, i) => (
                  <div key={i} className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">{c.titleName}</span>
                    <span className="text-emerald-400 font-bold">{c.holderName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Top Feud */}
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono">
              <span className="text-zinc-500 uppercase block text-[10px]">Headliner Rivalry</span>
              <span className="text-amber-300 font-bold mt-0.5 block">{selectedRival.currentTopFeud}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TACTICS & COUNTER-PROGRAMMING */}
      {activeTab === 'tactics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Counter-Program Ad Blitz */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                  COST: $25,000
                </span>
                <Radio className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-base font-bold text-white font-mono">
                Cross-Network TV Ad Blitz
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Fund an aggressive prime-time marketing blitz promoting your upcoming main event to steal viewers directly from rival time slots. Boosts Network Satisfaction (+4).
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunCounterProgramming}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition shadow-md"
            >
              Launch Ad Campaign ($25,000)
            </button>
          </div>

          {/* Card 2: Dirt Sheet Media Leaks */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                  COST: $10,000
                </span>
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <h4 className="text-base font-bold text-white font-mono">
                Dirt Sheet Gossip Campaign
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Feed wrestling news sites with unflattering backstage reports on {selectedRival.name}'s internal locker room chaos, depressing their momentum and prestige (-2).
              </p>
            </div>
            <button
              type="button"
              onClick={handleDirtSheetCampaign}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition shadow-md"
            >
              Plant Leaks vs {selectedRival.shortName} ($10,000)
            </button>
          </div>

          {/* Card 3: Milestone Rights Bonus */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  BONUS: +$40,000
                </span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-white font-mono">
                Leverage Ratings Victory Streak
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Present your consecutive ratings wins to network executives and collect an emergency rights bonus cash payout ($40,000). Requires a 2+ week winning streak.
              </p>
            </div>
            <button
              type="button"
              onClick={handleNegotiateRightsBonus}
              disabled={currentStreak < 2}
              className={`w-full py-2.5 rounded-lg font-mono text-xs font-bold transition ${
                currentStreak >= 2
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              {currentStreak >= 2 ? 'Collect Rights Bonus (+$40k)' : 'Needs 2+ Win Streak'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

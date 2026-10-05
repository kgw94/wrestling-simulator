import React, { useState } from 'react';
import { Championship, Promotion } from '../types';
import { 
  simulateAutomatedTournamentForTitle, 
  simulateBattleRoyalForTitle, 
  getEligibleContendersForVacancy, 
  isTagChampionship,
  VacancyContender, 
  AutomatedTournamentResult, 
  BattleRoyalResult 
} from '../utils/titleVacancyEvents';
import { getChampionshipBeltImage } from '../utils/beltImageGenerator';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  X, 
  RotateCcw, 
  Play, 
  Swords, 
  Clock, 
  Users, 
  Activity 
} from 'lucide-react';

interface VacancyCrowningModalProps {
  vacatingTitle: Championship;
  promotion: Promotion;
  onClose: () => void;
  onInstantVacate: (titleId: string) => void;
  onCrownChampion: (
    title: Championship,
    winner: VacancyContender,
    runnerUp: VacancyContender,
    eventType: 'tournament' | 'battle_royal',
    eventDetails: {
      eventName: string;
      notes: string;
      reignRating: string;
      matchScore: number;
      participantsCount: number;
    }
  ) => void;
}

export const VacancyCrowningModal: React.FC<VacancyCrowningModalProps> = ({
  vacatingTitle,
  promotion,
  onClose,
  onInstantVacate,
  onCrownChampion
}) => {
  const isTag = isTagChampionship(vacatingTitle);

  const [vacancyEventType, setVacancyEventType] = useState<'tournament' | 'battle_royal' | 'instant'>('tournament');
  const [tournamentBracketSize, setTournamentBracketSize] = useState<4 | 8 | 16>(isTag ? 4 : 8);
  const [battleRoyalEntrantCount, setBattleRoyalEntrantCount] = useState<number>(isTag ? 8 : 15);
  const [tournamentResult, setTournamentResult] = useState<AutomatedTournamentResult | null>(null);
  const [battleRoyalResult, setBattleRoyalResult] = useState<BattleRoyalResult | null>(null);
  const [isSimulatingEvent, setIsSimulatingEvent] = useState<boolean>(false);
  const [activeTournamentRoundIndex, setActiveTournamentRoundIndex] = useState<number>(0);

  const handleSimulateTournament = () => {
    setIsSimulatingEvent(true);
    setTimeout(() => {
      const result = simulateAutomatedTournamentForTitle(
        vacatingTitle,
        promotion,
        tournamentBracketSize
      );
      setTournamentResult(result);
      setActiveTournamentRoundIndex(0);
      setIsSimulatingEvent(false);
    }, 200);
  };

  const handleSimulateBattleRoyal = () => {
    setIsSimulatingEvent(true);
    setTimeout(() => {
      const result = simulateBattleRoyalForTitle(
        vacatingTitle,
        promotion,
        battleRoyalEntrantCount
      );
      setBattleRoyalResult(result);
      setIsSimulatingEvent(false);
    }, 200);
  };

  const handleConfirmTournamentCrown = () => {
    if (!tournamentResult) return;
    onCrownChampion(
      vacatingTitle,
      tournamentResult.winner,
      tournamentResult.runnerUp,
      'tournament',
      {
        eventName: tournamentResult.tournamentName,
        notes: `Won ${tournamentResult.bracketSize}-superstar tournament to claim vacant championship`,
        reignRating: `${tournamentResult.averageMatchScore}/100 Tournament Rating`,
        matchScore: tournamentResult.averageMatchScore,
        participantsCount: tournamentResult.participants.length
      }
    );
  };

  const handleConfirmBattleRoyalCrown = () => {
    if (!battleRoyalResult) return;
    onCrownChampion(
      vacatingTitle,
      battleRoyalResult.winner,
      battleRoyalResult.runnerUp,
      'battle_royal',
      {
        eventName: battleRoyalResult.eventName,
        notes: `Last eliminated ${battleRoyalResult.runnerUp.name} in a ${battleRoyalResult.participantCount}-superstar Battle Royal to claim the vacant title`,
        reignRating: battleRoyalResult.ratingStars,
        matchScore: battleRoyalResult.matchScore,
        participantsCount: battleRoyalResult.participantCount
      }
    );
  };

  const activeHolders = vacatingTitle.currentHolderIds && vacatingTitle.currentHolderIds.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-10 rounded border border-amber-500/40 overflow-hidden bg-black shrink-0 shadow">
              <img
                src={getChampionshipBeltImage(vacatingTitle, promotion.name, promotion.style)}
                alt={vacatingTitle.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase font-bold tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                  <span>Vacant Title Crowning Event</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {vacatingTitle.type} • {vacatingTitle.division}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-mono leading-tight mt-0.5">
                {vacatingTitle.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-zinc-300 text-xs flex-1">
          {/* Context Banner */}
          {activeHolders ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Active Champion Will Be Stripped: </span>
                <span>
                  {vacatingTitle.history?.[0]?.holderNames || 'Current holder'} will have their active reign concluded in official promotion records. 
                  Choose whether to crown a successor immediately via an automated <strong>Gold Rush Tournament</strong>, an explosive <strong>Battle Royal</strong>, or leave the belt vacant for future booking.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3 text-zinc-300">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Championship Is Currently Vacant: </span>
                <span>
                  Select an event format below to crown the new undisputed champion of {promotion.name}.
                </span>
              </div>
            </div>
          )}

          {/* Mode Selection Tabs (shown when not viewing results) */}
          {!tournamentResult && !battleRoyalResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVacancyEventType('tournament')}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                    vacancyEventType === 'tournament'
                      ? 'bg-amber-500/15 border-amber-500/70 text-white shadow-lg shadow-amber-500/5'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Trophy className="w-4 h-4" />
                    </span>
                    {vacancyEventType === 'tournament' && (
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold font-mono text-sm text-white">Automated Tournament</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                      Single-elimination Gold Rush bracket with rounds, finishes, and star ratings.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVacancyEventType('battle_royal')}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                    vacancyEventType === 'battle_royal'
                      ? 'bg-purple-500/15 border-purple-500/70 text-white shadow-lg shadow-purple-500/5'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                      <Crown className="w-4 h-4" />
                    </span>
                    {vacancyEventType === 'battle_royal' && (
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold font-mono text-sm text-white">Battle Royal Event</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                      Over-The-Top-Rope spectacle with minute-by-minute eliminations and apron drama.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVacancyEventType('instant')}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                    vacancyEventType === 'instant'
                      ? 'bg-rose-500/15 border-rose-500/70 text-white shadow-lg shadow-rose-500/5'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    {vacancyEventType === 'instant' && (
                      <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold font-mono text-sm text-white">Instant Vacancy</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                      Strip the championship immediately by Booker decree without running an event.
                    </div>
                  </div>
                </button>
              </div>

              {/* TOURNAMENT SETUP */}
              {vacancyEventType === 'tournament' && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="text-white font-bold text-sm">Bracket Format & Size</h4>
                      <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        Contenders seeded using official rankings, streaks, and in-ring workrate.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {([4, 8, 16] as const).map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setTournamentBracketSize(size)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                            tournamentBracketSize === size
                              ? 'bg-amber-500 text-black border-amber-400 shadow'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                          }`}
                        >
                          {size} Contenders
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seeded Participants Lineup Preview */}
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold mb-2 flex items-center justify-between">
                      <span>Top Seeded Contenders ({tournamentBracketSize} Qualified):</span>
                      <span className="text-amber-400 font-sans lowercase font-normal">
                        seeded by contender score & momentum
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {getEligibleContendersForVacancy(vacatingTitle, promotion, tournamentBracketSize).map((c, i) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-2"
                        >
                          <div className="truncate">
                            <div className="text-white font-bold text-xs truncate">
                              <span className="text-amber-500 mr-1">#{i + 1}</span>
                              {c.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-sans">
                              Skill: {c.workrate} • Pop: {c.overness}
                            </div>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            c.momentum === 'Surging' ? 'bg-amber-500/20 text-amber-300' :
                            c.momentum === 'Hot' ? 'bg-orange-500/20 text-orange-300' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {c.momentum || 'Steady'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Run Action CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSimulatingEvent}
                      onClick={handleSimulateTournament}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
                    >
                      {isSimulatingEvent ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin text-black" />
                          <span>Simulating Gold Rush Tournament...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-black" />
                          <span>Simulate & Run {tournamentBracketSize}-Man Tournament</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* BATTLE ROYAL SETUP */}
              {vacancyEventType === 'battle_royal' && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="text-white font-bold text-sm">Entrant Field Size</h4>
                      <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        Competitors enter simultaneously. Minute-by-minute eliminations will be calculated.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {([8, 12, 15, 20] as const).map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setBattleRoyalEntrantCount(count)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                            battleRoyalEntrantCount === count
                              ? 'bg-purple-600 text-white border-purple-400 shadow'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                          }`}
                        >
                          {count} Entrants
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Entrants Preview */}
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold mb-2 flex items-center justify-between">
                      <span>Entrant Lineup Preview ({battleRoyalEntrantCount} Competitors):</span>
                      <span className="text-purple-400 font-sans lowercase font-normal">
                        over-the-top-rope elimination rules apply
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {getEligibleContendersForVacancy(vacatingTitle, promotion, battleRoyalEntrantCount).map((c, i) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-2"
                        >
                          <div className="truncate">
                            <div className="text-white font-bold text-xs truncate">
                              <span className="text-purple-400 mr-1">#{i + 1}</span>
                              {c.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-sans">
                              Overness: {c.overness}
                            </div>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                            In
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Run Action CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSimulatingEvent}
                      onClick={handleSimulateBattleRoyal}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
                    >
                      {isSimulatingEvent ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin text-white" />
                          <span>Simulating Battle Royal Chaos...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4" />
                          <span>Simulate & Run {battleRoyalEntrantCount}-Entrant Battle Royal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* INSTANT VACANCY SETUP */}
              {vacancyEventType === 'instant' && (
                <div className="bg-rose-950/20 border border-rose-500/40 rounded-xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base font-mono">Confirm Immediate Title Stripping</h4>
                      <p className="text-xs text-zinc-300 font-sans mt-1">
                        This will strip the champion immediately and record an official vacancy in championship lineage. 
                        The belt will remain VACANT until you crown a new champion manually or run a tournament at a later date.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-500/20">
                    <button
                      type="button"
                      onClick={() => setVacancyEventType('tournament')}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => onInstantVacate(vacatingTitle.id)}
                      className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition shadow"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Strip Champion & Leave Belt Vacant</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================================== */}
          {/* TOURNAMENT RESULTS DISPLAY                             */}
          {/* ====================================================== */}
          {tournamentResult && (
            <div className="space-y-5 animate-fadeIn">
              {/* Winner Spotlight Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-2 border-amber-500/60 p-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 shrink-0 shadow-lg">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-300" />
                        <span>Tournament Champion & New Title Holder</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono mt-0.5">
                        {tournamentResult.winner.name}
                      </h2>
                      <div className="text-xs text-zinc-300 font-sans mt-1 flex items-center gap-3 flex-wrap">
                        <span>Defeated finalist <strong>{tournamentResult.runnerUp.name}</strong></span>
                        <span>•</span>
                        <span className="text-amber-300">Tournament MVP: <strong>{tournamentResult.tournamentMVP.name}</strong></span>
                        <span>•</span>
                        <span>Rating: <strong className="text-amber-400">{tournamentResult.averageMatchScore}/100</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-amber-500 text-black font-bold uppercase tracking-wider shadow">
                      {tournamentResult.bracketSize}-Man Gold Rush Winner
                    </span>
                  </div>
                </div>
              </div>

              {/* Round-by-Round Breakdown */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3 flex-wrap">
                  <h4 className="font-mono font-bold text-white text-sm flex items-center gap-2">
                    <Swords className="w-4 h-4 text-amber-400" />
                    <span>Tournament Rounds Breakdown</span>
                  </h4>

                  {/* Round Selector Tabs */}
                  <div className="flex items-center gap-1">
                    {tournamentResult.roundResults.map((r, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveTournamentRoundIndex(idx)}
                        className={`px-3 py-1 rounded text-xs font-mono transition ${
                          activeTournamentRoundIndex === idx
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {r.roundName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Round Match Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tournamentResult.roundResults[activeTournamentRoundIndex]?.matches.map(m => (
                    <div
                      key={m.matchId}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="text-amber-400 font-bold">{m.roundName}</span>
                        <span className="text-amber-300 font-bold">{m.ratingStars}</span>
                      </div>

                      <div className="space-y-1.5 py-1">
                        <div className={`p-2 rounded flex items-center justify-between ${
                          m.winner.id === m.contender1.id
                            ? 'bg-amber-500/15 border border-amber-500/40 text-white font-bold'
                            : 'bg-zinc-900/60 text-zinc-400'
                        }`}>
                          <span className="truncate">{m.contender1.name}</span>
                          {m.winner.id === m.contender1.id && (
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Check className="w-3 h-3" /> Winner
                            </span>
                          )}
                        </div>

                        <div className={`p-2 rounded flex items-center justify-between ${
                          m.winner.id === m.contender2.id
                            ? 'bg-amber-500/15 border border-amber-500/40 text-white font-bold'
                            : 'bg-zinc-900/60 text-zinc-400'
                        }`}>
                          <span className="truncate">{m.contender2.name}</span>
                          {m.winner.id === m.contender2.id && (
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Check className="w-3 h-3" /> Winner
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-zinc-400 font-sans border-t border-zinc-800/80 pt-2 flex items-start gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono shrink-0">
                          {m.finishType}
                        </span>
                        <span className="line-clamp-2">{m.recap}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateTournament}
                    className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rerun Simulation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTournamentResult(null)}
                    className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-mono text-xs transition"
                  >
                    Back to Setup
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmTournamentCrown}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition"
                >
                  <Crown className="w-4 h-4" />
                  <span>Crown & Finalize {tournamentResult.winner.name} as Champion</span>
                </button>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* BATTLE ROYAL RESULTS DISPLAY                           */}
          {/* ====================================================== */}
          {battleRoyalResult && (
            <div className="space-y-5 animate-fadeIn">
              {/* Winner Spotlight Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-zinc-900 to-indigo-950 border-2 border-purple-500/60 p-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-400 shrink-0 shadow-lg">
                      <Crown className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-purple-300 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Battle Royal Winner & New Reigning Champion</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono mt-0.5">
                        {battleRoyalResult.winner.name}
                      </h2>
                      <div className="text-xs text-zinc-300 font-sans mt-1 flex items-center gap-3 flex-wrap">
                        <span>Last eliminated <strong>{battleRoyalResult.runnerUp.name}</strong></span>
                        <span>•</span>
                        <span className="text-purple-300">Match Rating: <strong>{battleRoyalResult.ratingStars}</strong></span>
                        <span>•</span>
                        <span>Outlasted <strong>{battleRoyalResult.participantCount} superstars</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-purple-600 text-white font-bold uppercase tracking-wider shadow">
                      Battle Royal Champion
                    </span>
                  </div>
                </div>
              </div>

              {/* Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>Most Eliminations</span>
                  </div>
                  <div className="font-bold text-white text-sm truncate">
                    {battleRoyalResult.mostEliminationsContender.name}
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    {battleRoyalResult.mostEliminationsCount} competitors eliminated
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Iron Man Performer</span>
                  </div>
                  <div className="font-bold text-white text-sm truncate">
                    {battleRoyalResult.ironManContender.name}
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Lasted the entire duration to claim victory
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>Final Four Survivors</span>
                  </div>
                  <div className="font-bold text-zinc-300 text-xs truncate">
                    {battleRoyalResult.finalFour.map(f => f.name.split(' ')[0]).join(', ')}
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Final apron & ring showdown
                  </div>
                </div>
              </div>

              {/* Dramatic Finale Card */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 font-sans text-xs text-zinc-300 leading-relaxed italic">
                <strong className="text-amber-400 not-italic block mb-1 font-mono uppercase text-[11px]">
                  Climactic Final Elimination Recap:
                </strong>
                "{battleRoyalResult.finishDramaRecap}"
              </div>

              {/* Ringside Elimination Log */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span>Ringside Elimination Ticker ({battleRoyalResult.eliminations.length} Eliminations):</span>
                  <span className="text-zinc-500 lowercase font-normal">chronological order</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                  {battleRoyalResult.eliminations.map(e => (
                    <div
                      key={e.order}
                      className="p-2 rounded bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <div className="truncate">
                        <span className="text-zinc-500 mr-2">#{e.order} [{e.timeInMatchMinutes}m]</span>
                        <span className="text-rose-400 font-bold mr-1">{e.eliminatedContender.name}</span>
                        <span className="text-zinc-400 font-sans">was {e.eliminationMethod} by</span>
                        <span className="text-amber-400 font-bold ml-1">{e.eliminatedBy.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateBattleRoyal}
                    className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                    <span>Rerun Simulation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBattleRoyalResult(null)}
                    className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-mono text-xs transition"
                  >
                    Back to Setup
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmBattleRoyalCrown}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition"
                >
                  <Crown className="w-4 h-4" />
                  <span>Crown & Finalize {battleRoyalResult.winner.name} as Champion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

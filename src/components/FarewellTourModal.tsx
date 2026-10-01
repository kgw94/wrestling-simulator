import React, { useState } from 'react';
import { Wrestler, Promotion, FarewellTour } from '../types';
import { 
  Trophy, 
  Sparkles, 
  Award, 
  UserCheck, 
  Calendar, 
  Flame, 
  Check, 
  X, 
  ArrowRight, 
  HeartHandshake, 
  HelpCircle 
} from 'lucide-react';
import { formatNumber } from '../utils/format';

interface FarewellTourModalProps {
  wrestler: Wrestler;
  promotion: Promotion;
  currentWeek: number;
  currentYear: number;
  onClose: () => void;
  onLaunchTour: (wrestlerId: string, tour: FarewellTour) => void;
  onConcludeTourEarly?: (wrestlerId: string) => void;
}

const TOUR_TITLE_PRESETS = [
  'The Last Ride',
  'Passing the Torch World Tour',
  'One Last Lap',
  'The Final Bell Tour',
  'Living Legend Farewell Showcase',
  'Golden Era Swan Song',
  'Legacy & Honor Send-Off'
];

const STIPULATION_PRESETS = [
  {
    id: 'Passing the Torch',
    title: 'Passing the Torch',
    description: 'Face promising young talent in marquee bouts, boosting their overness and company prestige.'
  },
  {
    id: 'Dream Match Showcase',
    title: 'Dream Match Showcase',
    description: 'Book cross-divisional technical clinics against elite rivals for maximum star ratings.'
  },
  {
    id: 'Career on the Line',
    title: 'Career on the Line',
    description: 'High drama high stakes encounters where every loss could bring down the final curtain.'
  },
  {
    id: 'Last Man Standing Climax',
    title: 'Hardcore / Last Man Standing',
    description: 'Unforgiving, gritty farewell wars testing the veteran\'s remaining resilience.'
  },
  {
    id: 'Respect & Pure Workrate Clinic',
    title: 'Respect & Pure Workrate Clinic',
    description: 'Traditional 20-minute pure athletic exhibitions showcasing master ring psychology.'
  }
];

export const FarewellTourModal: React.FC<FarewellTourModalProps> = ({
  wrestler,
  promotion,
  currentWeek,
  currentYear,
  onClose,
  onLaunchTour,
  onConcludeTourEarly
}) => {
  const isAlreadyActive = wrestler.farewellTour && wrestler.farewellTour.isActive;

  // Form State
  const [tourTitle, setTourTitle] = useState(
    wrestler.farewellTour?.tourTitle || `${wrestler.name}: The Last Ride`
  );
  const [targetMatchesCount, setTargetMatchesCount] = useState<number>(
    wrestler.farewellTour?.targetMatchesCount || 5
  );
  const [farewellStipulation, setFarewellStipulation] = useState<string>(
    wrestler.farewellTour?.farewellStipulation || 'Passing the Torch'
  );
  const [torchPassedWrestlerId, setTorchPassedWrestlerId] = useState<string>(
    wrestler.farewellTour?.torchPassedWrestlerId || ''
  );
  const [customTitleInput, setCustomTitleInput] = useState(false);

  // Eligible young candidates for passing the torch (prefer younger wrestlers under 34)
  const candidateProteges = promotion.roster
    .filter(w => w.id !== wrestler.id && !w.isRetired)
    .sort((a, b) => a.age - b.age);

  const selectedProtege = promotion.roster.find(w => w.id === torchPassedWrestlerId);

  const handleLaunch = () => {
    const finalTitle = tourTitle.trim() || `${wrestler.name}: The Final Bell`;
    const totalWeeks = Math.max(6, targetMatchesCount * 2);

    const newTour: FarewellTour = {
      isActive: true,
      tourTitle: finalTitle,
      startedWeek: currentWeek,
      startedYear: currentYear,
      weeksRemaining: totalWeeks,
      totalWeeks,
      matchesBookedCount: wrestler.farewellTour?.matchesBookedCount || 0,
      targetMatchesCount,
      prestigeAccumulated: wrestler.farewellTour?.prestigeAccumulated || 0,
      torchPassedWrestlerId: torchPassedWrestlerId || undefined,
      torchPassedWrestlerName: selectedProtege?.name,
      farewellStipulation,
      isCulminated: false
    };

    onLaunchTour(wrestler.id, newTour);
  };

  const targetRetire = wrestler.retirementAge || (
    wrestler.style === 'High Flyer' ? 40 : 
    wrestler.style === 'Hardcore' ? 41 : 
    wrestler.style === 'Powerhouse' ? 45 : 44
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-amber-500/40 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {isAlreadyActive ? 'Active Farewell Tour Dashboard' : 'Official Farewell Tour Sanction'}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Age {wrestler.age} (Planned: ~{targetRetire})
                </span>
              </div>
              <h2 className="text-xl font-bold font-mono text-white mt-0.5">
                {wrestler.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIVE TOUR OVERVIEW (If already running) */}
        {isAlreadyActive && wrestler.farewellTour && (
          <div className="bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-900 p-4 rounded-xl border border-amber-500/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 font-bold tracking-wider">
                  Tour in Progress
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  "{wrestler.farewellTour.tourTitle}"
                </h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-zinc-400">Company Prestige Earned:</span>
                <div className="text-lg font-bold text-amber-400">
                  +{wrestler.farewellTour.prestigeAccumulated} Pts
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-zinc-300 mb-1.5">
                <span>
                  Matches Completed: <strong className="text-amber-400">{wrestler.farewellTour.matchesBookedCount}</strong> / {wrestler.farewellTour.targetMatchesCount}
                </span>
                <span className="text-zinc-400">
                  {Math.round((wrestler.farewellTour.matchesBookedCount / wrestler.farewellTour.targetMatchesCount) * 100)}% Complete
                </span>
              </div>
              <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((wrestler.farewellTour.matchesBookedCount / wrestler.farewellTour.targetMatchesCount) * 100))}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase block">Designated Protege</span>
                <span className="text-zinc-200 font-bold">
                  {wrestler.farewellTour.torchPassedWrestlerName || 'Open Roster Showcase'}
                </span>
              </div>
              <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase block">Tour Stipulation</span>
                <span className="text-zinc-200 font-bold">
                  {wrestler.farewellTour.farewellStipulation || 'Passing the Torch'}
                </span>
              </div>
            </div>

            {onConcludeTourEarly && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onConcludeTourEarly(wrestler.id)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-700/60 border border-zinc-700 text-xs font-mono transition text-zinc-300"
                >
                  Conclude Tour Early & Grant Immediate Send-Off Ceremony
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feature Explainer Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-300 uppercase font-mono tracking-wider">
              Company Prestige Multiplier Mechanic
            </span>
            <p className="text-zinc-300 leading-relaxed font-sans">
              Sanctioning an official Farewell Tour allows you to book special send-off encounters on weekly TV and PPV.
              Every official farewell match increases <strong className="text-amber-300">{promotion.name}'s Company Prestige</strong> (+1 to +2 pts per match; +2 for 4+ star classics).
              Upon tour culmination, a massive <strong className="text-amber-300">+3 to +5 Prestige bonus</strong> is awarded and the superstar unlocks guaranteed Hall of Fame nomination!
            </p>
          </div>
        </div>

        {/* Tour Configuration Form */}
        <div className="space-y-5">
          {/* 1. Tour Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Official Tour Title</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomTitleInput(!customTitleInput)}
                className="text-[11px] font-mono text-amber-400 hover:underline"
              >
                {customTitleInput ? 'Select Presets' : 'Custom Title'}
              </button>
            </div>

            {customTitleInput ? (
              <input
                type="text"
                value={tourTitle}
                onChange={e => setTourTitle(e.target.value)}
                placeholder="e.g. The Final Stand Tour"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                {TOUR_TITLE_PRESETS.map(preset => {
                  const fullTitle = `${wrestler.name}: ${preset}`;
                  const isSelected = tourTitle === fullTitle;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTourTitle(fullTitle)}
                      className={`p-2.5 rounded-lg border text-left transition truncate ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Target Matches Count */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Send-Off Campaign Length</span>
              </label>
              <span className="text-amber-400 font-bold">
                {targetMatchesCount} Special Showcase Matches (~{targetMatchesCount * 2} Weeks)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { count: 3, label: 'Sprint Send-Off', desc: '3 Matches • Quick Impact' },
                { count: 5, label: 'Classic Tour', desc: '5 Matches • Balanced Drama' },
                { count: 8, label: 'Grand World Tour', desc: '8 Matches • Maximum Prestige' }
              ].map(opt => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setTargetMatchesCount(opt.count)}
                  className={`p-3 rounded-xl border text-left transition ${
                    targetMatchesCount === opt.count
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-sm font-bold text-white">{opt.count} Matches</div>
                  <div className="text-[11px] text-zinc-300 mt-0.5">{opt.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Core Stipulation / Theme */}
          <div className="space-y-2 font-mono text-xs">
            <label className="font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Primary Storyline Stipulation</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STIPULATION_PRESETS.map(stip => (
                <button
                  key={stip.id}
                  type="button"
                  onClick={() => setFarewellStipulation(stip.id)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    farewellStipulation === stip.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-bold">{stip.title}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{stip.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Chosen Protege (Passing the Torch) */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-sky-400" />
                <span>4. Chosen Successor / Protege (Optional)</span>
              </label>
              <span className="text-[11px] text-zinc-400">Receives Generational Overness Surge</span>
            </div>

            <select
              value={torchPassedWrestlerId}
              onChange={e => setTorchPassedWrestlerId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
            >
              <option value="">-- No Specific Protege (Open Roster Tour) --</option>
              {candidateProteges.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Age {p.age}, {p.style}, Overness {p.overness}/100, {p.push})
                </option>
              ))}
            </select>

            {selectedProtege && (
              <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-800/50 text-[11px] text-sky-300 flex items-center justify-between">
                <span>
                  🔥 <strong>Generational Clash:</strong> Booking matches between {wrestler.name} and {selectedProtege.name} will pass massive overness (+4) and momentum to {selectedProtege.name}!
                </span>
              </div>
            )}
          </div>

          {/* Estimated Prestige Return Breakdown */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 font-mono text-xs">
            <span className="text-zinc-400 font-bold uppercase block text-[11px]">
              Projected Prestige Impact For {promotion.name}
            </span>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500">PER MATCH BOOST</div>
                <div className="text-sm font-bold text-amber-400">+1 to +2 Pts</div>
                <div className="text-[10px] text-zinc-400">TV & PPV Ratings</div>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500">TOUR CULMINATION</div>
                <div className="text-sm font-bold text-emerald-400">+3 to +5 Pts</div>
                <div className="text-[10px] text-zinc-400">Grand Send-Off Bonus</div>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded border border-zinc-800">
                <div className="text-[10px] text-zinc-500">TOTAL ESTIMATE</div>
                <div className="text-sm font-bold text-sky-400">+{targetMatchesCount * 2 + 4} Prestige</div>
                <div className="text-[10px] text-zinc-400">Company Reputation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
          >
            <Trophy className="w-4 h-4" />
            <span>{isAlreadyActive ? 'Update Tour Sanction' : 'Launch Official Farewell Tour'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

      </div>
    </div>
  );
};

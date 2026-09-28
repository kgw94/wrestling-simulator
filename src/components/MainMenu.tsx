import React from 'react';
import { GameState } from '../types';
import { MarkdownTableView } from './MarkdownTableView';
import { 
  Tv, 
  Users, 
  Flame, 
  DollarSign, 
  FastForward, 
  Radio, 
  Newspaper, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Trophy,
  PenTool,
  Settings,
  Palette
} from 'lucide-react';
import { formatNumber } from '../utils/format';
import { getResolvedTheme } from '../data/themes';

interface MainMenuProps {
  gameState: GameState;
  onNavigate: (view: GameState['currentView']) => void;
  onAdvanceWeek: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  gameState,
  onNavigate,
  onAdvanceWeek
}) => {
  const { promotion, currentWeek, currentYear, currentShowCard, averageShowRating, topFeudHeat, newsArchive } = gameState;

  const topFeud = promotion.feuds.slice().sort((a, b) => b.heat - a.heat)[0];
  const championNames = promotion.titles.map(t => {
    const holder = promotion.roster.find(w => t.currentHolderIds.includes(w.id));
    return `${t.name}: ${holder ? holder.name : 'Vacant'}`;
  });

  const latestNews = newsArchive[0];

  const menuMarkdown = `| Option | Action Name | Primary Description | Status / Highlights |
|---|---|---|---|
| [1] | Book Show | Build card segment-by-segment (matches, promos, angles, finishes) | ${currentShowCard.length} Segments Booked |
| [2] | Roster Management | View detailed stats, adjust pushes, execute Face/Heel turns, scout free agents | ${promotion.roster.length} Active Wrestlers |
| [3] | Titles & Feuds | Manage championships, track rivalry heat, ignite new rivalries | ${promotion.titles.length} Belts, Top Heat: ${topFeudHeat}/100 |
| [4] | Finances & TV | Review balance sheet, TV ratings, and broadcaster satisfaction | Capital: $${formatNumber(promotion.budget)} |
| [5] | Advance Week | Run simulation engine, evaluate match quality, process fatigue & world events | Next: Week ${currentWeek + 1} |`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Broadcast Week Status Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Broadcast Headquarters • Week {currentWeek}, Year {currentYear}</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-mono">
              {promotion.weeklyTVShow}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Broadcasting on <span className="text-zinc-200 font-semibold">{promotion.tvNetwork}</span>. Current card contains{' '}
              <span className="text-amber-400 font-bold">{currentShowCard.length} segments</span>. Minimum rating required:{' '}
              <span className="text-zinc-200 font-mono font-bold">{promotion.minNetworkRating}/100</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('book_show')}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition shadow-md shadow-amber-500/10"
            >
              <Tv className="w-4 h-4" />
              <span>[1] BOOK CARD NOW</span>
            </button>
            <button
              type="button"
              onClick={onAdvanceWeek}
              disabled={currentShowCard.length === 0}
              className={`px-4 py-2.5 rounded-lg font-mono font-bold text-xs flex items-center gap-2 transition ${
                currentShowCard.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
              }`}
            >
              <FastForward className="w-4 h-4" />
              <span>[5] ADVANCE WEEK</span>
            </button>
          </div>
        </div>

        {/* Current Card Status summary bar */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            {currentShowCard.length >= 3 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>
              Card Status:{' '}
              <strong className={currentShowCard.length >= 3 ? 'text-emerald-400' : 'text-amber-400'}>
                {currentShowCard.length === 0
                  ? 'Empty (Needs Booking)'
                  : `${currentShowCard.length} Segments Ready`}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="truncate">
              Top Rivalry:{' '}
              <strong className="text-zinc-200">
                {topFeud ? `${topFeud.name} (${topFeud.heat})` : 'None Active'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Locker Room Morale:{' '}
              <strong className="text-zinc-200">
                {Math.round(
                  promotion.roster.reduce((acc, w) => acc + w.morale, 0) / promotion.roster.length
                )}% Avg
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Markdown Representation of Action Menu */}
      <MarkdownTableView
        title="HEAD BOOKER ACTIONS MENU"
        markdown={menuMarkdown}
        defaultToMarkdown={false}
      >
        <div className="text-xs text-zinc-400 font-mono">
          Select an action using the numbered cards below, or press keys 1 through 5 on your keyboard.
        </div>
      </MarkdownTableView>

      {/* The 5 Core Numbered Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Action 1: Book Show */}
        <button
          type="button"
          onClick={() => onNavigate('book_show')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/80 hover:bg-zinc-900/90 transition shadow-sm hover:shadow-md hover:shadow-amber-500/5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-black transition">
                [ 1 ]
              </span>
              <Tv className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-amber-300 transition">
              Book Show
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Assemble matches, promos, backstage attacks, and contract signings segment by segment. Assign winners, finishes, and title stakes.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-amber-400">
            <span>{currentShowCard.length} Segments on Card</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Action 2: Roster Management */}
        <button
          type="button"
          onClick={() => onNavigate('roster')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-500/80 hover:bg-zinc-900/90 transition shadow-sm hover:shadow-md hover:shadow-sky-500/5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold border border-sky-500/40 group-hover:bg-sky-500 group-hover:text-black transition">
                [ 2 ]
              </span>
              <Users className="w-5 h-5 text-zinc-500 group-hover:text-sky-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-sky-300 transition">
              Roster Management
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Inspect wrestler stats (Overness, Workrate, Mic, Stamina, Morale, Fatigue), adjust push levels, flip Face/Heel turns, and scout free agents.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-sky-400">
            <span>{promotion.roster.length} Contracted Stars</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Action 3: Titles & Feuds */}
        <button
          type="button"
          onClick={() => onNavigate('titles_feuds')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/80 hover:bg-zinc-900/90 transition shadow-sm hover:shadow-md hover:shadow-amber-500/5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-black transition">
                [ 3 ]
              </span>
              <Trophy className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-amber-300 transition">
              Championships & Feuds
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Forge custom championship belts (straps, plates & tiers), inspect multi-decade lineage histories, add past reigns, and manage blood feuds.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-amber-400">
            <span>{promotion.titles.filter(t => !t.isRetired).length} Belts • {promotion.feuds.length} Feuds</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Action 4: Finances & TV */}
        <button
          type="button"
          onClick={() => onNavigate('finances_tv')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/80 hover:bg-zinc-900/90 transition shadow-sm hover:shadow-md hover:shadow-emerald-500/5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-black transition">
                [ 4 ]
              </span>
              <DollarSign className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-emerald-300 transition">
              Finances & TV
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Analyze ticket sales, TV rights, merchandise, and wrestler payroll. Upgrade production quality and monitor network patience.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-emerald-400">
            <span>Network: {promotion.networkSatisfaction}% Satisfaction</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Action 5: Advance Week */}
        <button
          type="button"
          onClick={onAdvanceWeek}
          className="group text-left p-5 rounded-xl border bg-zinc-900 border-zinc-800 hover:border-purple-500/80 hover:bg-zinc-900/90 hover:shadow-md hover:shadow-purple-500/5 transition shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-400 font-mono text-xs font-bold border border-purple-500/40 group-hover:bg-purple-500 group-hover:text-black transition">
                [ 5 ]
              </span>
              <FastForward className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-purple-300 transition">
              Advance Week
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              {currentShowCard.length > 0
                ? `Process your ${currentShowCard.length} booked segments, calculate ratings & star reviews, roll for injuries/morale, and advance to next week.`
                : 'Simulate this week: automatically schedules a balanced television card featuring your top stars and feuds, then advances to next week.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-purple-400">
            <span>
              {currentShowCard.length === 0
                ? '⚡ 1-Click Simulate & Advance'
                : `★ Ready to Broadcast (${currentShowCard.length} Segs)`}
            </span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Feature 1: PPV & Supercards Calendar */}
        <button
          type="button"
          onClick={() => onNavigate('ppv_calendar')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/80 hover:bg-zinc-900/90 transition shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-black transition">
                [ P ]
              </span>
              <Radio className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-amber-300 transition">
              PPV & Supercards Calendar
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Schedule 12 monthly mega-events, customize stadium gates, set ticket prices, and configure flagship Supercard prestige multipliers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-amber-400">
            <span>{promotion.ppvSchedule?.length || 12} Scheduled Events</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Feature 2: Gimmick Lab & Customizer */}
        <button
          type="button"
          onClick={() => onNavigate('gimmick_lab')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/80 hover:bg-zinc-900/90 transition shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/40 group-hover:bg-indigo-500 group-hover:text-white transition">
                [ G ]
              </span>
              <Flame className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-indigo-300 transition">
              Gimmick Lab & Wrestler Customizer
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Repackage wrestler personas, roll S-to-F gimmick ratings, edit any wrestler's stats (overness, workrate, mic, salary), or create custom stars from scratch.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-indigo-400">
            <span>Repackaging & Stat Editor</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Feature 3: Tag Teams & Factions */}
        <button
          type="button"
          onClick={() => onNavigate('tag_factions')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-500/80 hover:bg-zinc-900/90 transition shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 font-mono text-xs font-bold border border-sky-500/40 group-hover:bg-sky-500 group-hover:text-black transition">
                [ T ]
              </span>
              <Users className="w-5 h-5 text-zinc-500 group-hover:text-sky-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-sky-300 transition">
              Tag Teams & Factions
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Form tag teams with tandem chemistry bonuses, track win-loss records, and build multi-man stables to dominate your television storylines.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-sky-400">
            <span>{promotion.tagTeams?.length || 0} Teams • {promotion.factions?.length || 0} Factions</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Feature 4: Backstage Locker Room Politics */}
        <button
          type="button"
          onClick={() => onNavigate('locker_room')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/80 hover:bg-zinc-900/90 transition shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-black transition">
                [ L ]
              </span>
              <AlertTriangle className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-emerald-300 transition">
              Locker Room Politics
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Resolve ego clashes, catering brawls, and contract disputes. Enforce discipline, deliver pep talks, and distribute bonuses.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-emerald-400">
            <span>{(promotion.activeIncidents || []).filter(i => !i.resolved).length} Pending Incidents</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Feature 5: Settings, Themes & Match Customizer */}
        {(() => {
          const resolvedTheme = getResolvedTheme(gameState.themeSettings || gameState.promotion?.themeSettings);
          return (
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/80 hover:bg-zinc-900/90 transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-black transition">
                      [ S ]
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: resolvedTheme.accentDef.hex }} />
                      <span>{resolvedTheme.presetDef.name.split(' ')[0]}</span>
                    </span>
                  </div>
                  <Settings className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition" />
                </div>
                <h3 className="font-bold text-white text-base font-mono group-hover:text-amber-300 transition">
                  Settings & Visual Themes
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
                  Customize visual themes (Attitude Noir, Monday Night Raw, SmackDown Sapphire, Strong Style Emerald, Studio Light), customize color accents, tweak capital, and configure match rules.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-amber-400">
                <span>Theme: {resolvedTheme.presetDef.eraTag} • {resolvedTheme.accentDef.name}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>
          );
        })()}

        {/* Feature 6: Writers' Room & Creative Hub */}
        <button
          type="button"
          onClick={() => onNavigate('writers_hub')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/80 hover:bg-zinc-900/90 transition shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-black transition">
                [ W ]
              </span>
              <PenTool className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-amber-300 transition">
              Writers’ Room & Creative Hub
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              Plan multi-week episodic story arcs, generate promo/angle treatments, simulate dream match chemistry, and organize booking bibles. Push creative straight to the show card!
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-amber-400">
            <span>{promotion.storylineArcs?.length || 3} Active Arcs • Writers' Pitches</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Feature 7: Hall of Fame & Legends Wing */}
        {(() => {
          const pendingHofCount = (promotion.retiredRoster || []).filter(
            w => w.hofNominationPending && !(promotion.hallOfFame || []).some(i => i.wrestlerId === w.id || i.name.toLowerCase() === w.name.toLowerCase())
          ).length;

          return (
            <button
              type="button"
              onClick={() => onNavigate('hall_of_fame')}
              className={`group text-left p-5 rounded-xl bg-zinc-900 border transition shadow-sm flex flex-col justify-between ${
                pendingHofCount > 0
                  ? 'border-yellow-500/80 shadow-md shadow-yellow-500/10 hover:border-yellow-400'
                  : 'border-zinc-800 hover:border-yellow-500/80 hover:bg-zinc-900/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 font-mono text-xs font-bold border border-yellow-500/40 group-hover:bg-yellow-500 group-hover:text-black transition">
                      [ H ]
                    </span>
                    {pendingHofCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-mono font-bold text-[10px] animate-pulse">
                        ★ {pendingHofCount} Inductee Pending!
                      </span>
                    )}
                  </div>
                  <Trophy className="w-5 h-5 text-zinc-500 group-hover:text-yellow-400 transition" />
                </div>
                <h3 className="font-bold text-white text-base font-mono group-hover:text-yellow-300 transition">
                  Hall of Fame & Legends Wing
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
                  Track legendary retirees, induction criteria (career wins, championship reigns, longevity in simulator), host formal enshrinement ceremonies, and manage farewell tours.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-yellow-400">
                <span>{promotion.hallOfFame?.length || 4} Immortal Plaques • {promotion.retiredRoster?.length || 3} Retirees</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>
          );
        })()}

        {/* Bonus Action: Industry News Wire */}
        <button
          type="button"
          onClick={() => onNavigate('news')}
          className="group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/90 transition shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-mono text-xs font-bold border border-zinc-700">
                [ N ]
              </span>
              <Newspaper className="w-5 h-5 text-zinc-500 group-hover:text-zinc-200 transition" />
            </div>
            <h3 className="font-bold text-white text-base font-mono group-hover:text-zinc-200 transition">
              Wrestling News Wire
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
              {latestNews ? (
                <span className="text-zinc-300 line-clamp-2">
                  <strong className="text-amber-400 font-normal">Headline: </strong>
                  {latestNews.headline}
                </span>
              ) : (
                'Review competitor headlines, backstage locker room leaks, and industry rumors.'
              )}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>{newsArchive.length} Wire Reports</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>

      {/* Championships Quick Digest */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4">
        <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider mb-2">
          Current Title Holders
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {championNames.map((text, i) => (
            <div key={i} className="text-xs font-mono bg-zinc-950 p-2.5 rounded border border-zinc-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-zinc-200 font-medium truncate">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

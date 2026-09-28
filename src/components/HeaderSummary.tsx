import React from 'react';
import { Promotion, GameState } from '../types';
import { DollarSign, Star, Flame, Calendar, Tv, Users, ShieldAlert, Palette, Settings } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { getResolvedTheme } from '../data/themes';

interface HeaderSummaryProps {
  gameState: GameState;
  onNavigate?: (view: GameState['currentView']) => void;
}

export const HeaderSummary: React.FC<HeaderSummaryProps> = ({ gameState, onNavigate }) => {
  const { promotion, currentWeek, currentYear, averageShowRating, topFeudHeat } = gameState;

  const topFeud = promotion.feuds.slice().sort((a, b) => b.heat - a.heat)[0];
  const injuredCount = promotion.roster.filter(w => w.injury.injured).length;
  const resolvedTheme = getResolvedTheme(gameState.themeSettings || gameState.promotion?.themeSettings);

  return (
    <header className={`${resolvedTheme.navBgClass} border-b ${resolvedTheme.navBorderClass} text-zinc-100 backdrop-blur sticky top-0 z-40 transition-colors duration-200`}>
      {/* Top Banner / Roster Summary Mandated Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Promotion & Schedule branding */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded flex items-center justify-center font-bold text-black text-lg tracking-wider border border-white/20 shadow-sm"
              style={{ backgroundColor: resolvedTheme.accentDef.hex }}
            >
              {promotion.shortName}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">{promotion.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700 font-medium">
                  {promotion.style}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate?.('settings')}
                  className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-mono transition"
                  title="Open Settings to customize Theme & Colors [S]"
                >
                  <Palette className="w-3 h-3 text-amber-400" />
                  <span>Theme: {resolvedTheme.presetDef.eraTag.split(' ')[0]}</span>
                  <span 
                    className="w-2 h-2 rounded-full inline-block border border-white/40" 
                    style={{ backgroundColor: resolvedTheme.accentDef.hex }} 
                  />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Week {currentWeek}, Year {currentYear}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Tv className="w-3.5 h-3.5 text-sky-400" />
                  {promotion.weeklyTVShow}
                </span>
                {promotion.ppvSchedule?.find(p => p.weekNumber === currentWeek) && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('ppv_calendar')}
                      className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 hover:bg-amber-500 hover:text-black transition"
                    >
                      🏆 PPV: {promotion.ppvSchedule.find(p => p.weekNumber === currentWeek)?.name}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Core Mandatory Roster Summary Metrics */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 bg-zinc-950/80 p-2 rounded-lg border border-zinc-800/80 font-mono text-xs">
            {/* Current Capital */}
            <div className="flex flex-col px-2 py-1">
              <span className="text-[10px] uppercase text-zinc-400 font-sans font-semibold flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" /> Current Capital
              </span>
              <span className={`text-sm font-bold ${(promotion.budget ?? 0) < 100000 ? 'text-red-400' : 'text-emerald-400'}`}>
                ${formatNumber(promotion.budget)}
              </span>
            </div>

            {/* Average Show Rating */}
            <div className="flex flex-col px-2 py-1 border-l border-zinc-800">
              <span className="text-[10px] uppercase text-zinc-400 font-sans font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" /> Avg Show Rating
              </span>
              <span className="text-sm font-bold text-amber-300">
                {averageShowRating > 0 ? `${averageShowRating}/100` : '-- / 100'}
              </span>
            </div>

            {/* Top Feud Heat */}
            <div className="flex flex-col px-2 py-1 border-l border-zinc-800">
              <span className="text-[10px] uppercase text-zinc-400 font-sans font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> Top Feud Heat
              </span>
              <span className={`text-sm font-bold ${topFeudHeat >= 80 ? 'text-orange-400' : 'text-zinc-200'}`}>
                {topFeud ? `${topFeudHeat}/100` : 'None'}
              </span>
            </div>

            {/* Roster Readiness */}
            <div className="hidden sm:flex flex-col px-2 py-1 border-l border-zinc-800">
              <span className="text-[10px] uppercase text-zinc-400 font-sans font-semibold flex items-center gap-1">
                <Users className="w-3 h-3 text-sky-400" /> Roster Active
              </span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-200">
                <span>{promotion.roster.length} Talent</span>
                {injuredCount > 0 && (
                  <span className="text-xs text-rose-400 flex items-center gap-0.5" title={`${injuredCount} injured`}>
                    <ShieldAlert className="w-3 h-3" /> {injuredCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Promotion, PPVEvent } from '../types';
import { DEFAULT_PPV_CALENDAR } from '../data/customDefaults';
import { formatNumber, formatCurrency } from '../utils/format';
import { 
  Calendar, 
  Trophy, 
  MapPin, 
  DollarSign, 
  Users, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ChevronLeft,
  Flame,
  Radio
} from 'lucide-react';

interface PPVCalendarViewProps {
  promotion: Promotion;
  currentWeek: number;
  currentYear: number;
  onUpdatePromotion: (newPromo: Promotion) => void;
  onBackToMenu: () => void;
}

export const PPVCalendarView: React.FC<PPVCalendarViewProps> = ({
  promotion,
  currentWeek,
  currentYear,
  onUpdatePromotion,
  onBackToMenu
}) => {
  const ppvSchedule: PPVEvent[] = (promotion.ppvSchedule && promotion.ppvSchedule.length > 0)
    ? promotion.ppvSchedule
    : DEFAULT_PPV_CALENDAR;

  const [editingPPV, setEditingPPV] = useState<PPVEvent | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states for create / edit
  const [formData, setFormData] = useState<PPVEvent>({
    id: '',
    name: '',
    weekNumber: 4,
    theme: '',
    venue: '',
    venueCapacity: 20000,
    ticketPrice: 90,
    isSupercard: false,
    prestigeBonus: 10,
    buyrateMultiplier: 1.3
  });

  const nextUpcomingPPV = ppvSchedule
    .slice()
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .find(p => p.weekNumber >= currentWeek) || ppvSchedule[0];

  const weeksUntilNext = nextUpcomingPPV
    ? nextUpcomingPPV.weekNumber >= currentWeek
      ? nextUpcomingPPV.weekNumber - currentWeek
      : 52 - currentWeek + nextUpcomingPPV.weekNumber
    : 0;

  const handleOpenEdit = (ppv: PPVEvent) => {
    setEditingPPV(ppv);
    setFormData({ ...ppv });
    setIsCreatingNew(false);
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingPPV(null);
    setFormData({
      id: `ppv-custom-${Date.now()}`,
      name: 'New Custom Supercard',
      weekNumber: Math.min(52, currentWeek + 3),
      theme: 'High Stakes Grudge Warfare & Spectacle',
      venue: 'Metropolitan Arena',
      venueCapacity: 22000,
      ticketPrice: 95,
      isSupercard: false,
      prestigeBonus: 12,
      buyrateMultiplier: 1.4
    });
  };

  const handleSavePPV = () => {
    if (!formData.name.trim()) return;

    let updatedList: PPVEvent[];
    if (isCreatingNew) {
      updatedList = [...ppvSchedule, formData].sort((a, b) => a.weekNumber - b.weekNumber);
    } else if (editingPPV) {
      updatedList = ppvSchedule.map(p => (p.id === editingPPV.id ? formData : p)).sort((a, b) => a.weekNumber - b.weekNumber);
    } else {
      return;
    }

    onUpdatePromotion({
      ...promotion,
      ppvSchedule: updatedList
    });

    setEditingPPV(null);
    setIsCreatingNew(false);
  };

  const handleDeletePPV = (id: string) => {
    if (window.confirm('Delete this PPV event from the annual calendar?')) {
      const updatedList = ppvSchedule.filter(p => p.id !== id);
      onUpdatePromotion({
        ...promotion,
        ppvSchedule: updatedList
      });
      if (editingPPV?.id === id) {
        setEditingPPV(null);
        setIsCreatingNew(false);
      }
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all PPVs to default standard calendar?')) {
      onUpdatePromotion({
        ...promotion,
        ppvSchedule: DEFAULT_PPV_CALENDAR
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Pay-Per-View & Premium Live Event Headquarters</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <span>Annual PPV Calendar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {ppvSchedule.length} Events Scheduled
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Monthly marquee spectacles deliver stadium gates, worldwide streaming buyrates, and career-defining moments.
            Every event name, venue, ticket price, and stipulation theme is fully customizable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToMenu}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>HQ Menu</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add PPV Event</span>
          </button>
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-2.5 py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition"
            title="Reset to default schedule"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Next Upcoming PPV Spotlight Banner */}
      {nextUpcomingPPV && (
        <div className={`p-5 rounded-xl border relative overflow-hidden shadow-md ${
          nextUpcomingPPV.isSupercard 
            ? 'bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-zinc-900 border-amber-500/40' 
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                  weeksUntilNext === 0 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {weeksUntilNext === 0 ? '🚨 HAPPENING THIS WEEK!' : `Next Up: In ${weeksUntilNext} Week${weeksUntilNext > 1 ? 's' : ''}`}
                </span>
                {nextUpcomingPPV.isSupercard && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3 text-purple-300" /> FLAGSHIP SUPERCARD
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-white font-mono tracking-tight">
                Week {nextUpcomingPPV.weekNumber}: {nextUpcomingPPV.name}
              </h3>
              <p className="text-xs text-zinc-300 mt-1 flex items-center gap-2 font-sans">
                <span className="text-amber-400 font-semibold">{nextUpcomingPPV.theme}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <MapPin className="w-3 h-3 text-zinc-400" /> {nextUpcomingPPV.venue}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4 bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">Venue Capacity</span>
                <span className="text-sm font-bold text-white">{formatNumber(nextUpcomingPPV.venueCapacity)} Seats</span>
              </div>
              <div className="border-l border-zinc-800 pl-4">
                <span className="text-[10px] text-zinc-400 uppercase block">Ticket Price</span>
                <span className="text-sm font-bold text-emerald-400">${nextUpcomingPPV.ticketPrice}</span>
              </div>
              <div className="border-l border-zinc-800 pl-4">
                <span className="text-[10px] text-zinc-400 uppercase block">Prestige Bonus</span>
                <span className="text-sm font-bold text-amber-400">+{nextUpcomingPPV.prestigeBonus} Pts</span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEdit(nextUpcomingPPV)}
                className="p-2 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 transition"
                title="Edit this PPV"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal / Drawer */}
      {(isCreatingNew || editingPPV) && (
        <div className="bg-zinc-900 border-2 border-amber-500/80 rounded-xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{isCreatingNew ? 'Create New PPV Event' : `Edit PPV: ${editingPPV?.name}`}</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingPPV(null);
                setIsCreatingNew(false);
              }}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
            {/* Event Name */}
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 mb-1">Event Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                placeholder="e.g. WrestleFest: The Grand Spectacle"
              />
            </div>

            {/* Scheduled Week */}
            <div>
              <label className="block text-zinc-400 mb-1">Scheduled Week (1-52)</label>
              <input
                type="number"
                min="1"
                max="52"
                value={formData.weekNumber}
                onChange={e => setFormData({ ...formData, weekNumber: Math.max(1, Math.min(52, parseInt(e.target.value) || 1)) })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Theme */}
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 mb-1">Event Theme / Stipulation Concept</label>
              <input
                type="text"
                value={formData.theme}
                onChange={e => setFormData({ ...formData, theme: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                placeholder="e.g. 30-Man Gauntlet Spectacle, Hell in a Cell Blowoffs"
              />
            </div>

            {/* Supercard Toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 border border-zinc-700 px-3 py-2 rounded text-zinc-200">
                <input
                  type="checkbox"
                  checked={formData.isSupercard}
                  onChange={e => setFormData({ ...formData, isSupercard: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="font-bold">Flagship Supercard</span>
              </label>
            </div>

            {/* Venue Name */}
            <div>
              <label className="block text-zinc-400 mb-1">Venue / Arena / Stadium</label>
              <input
                type="text"
                value={formData.venue}
                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                placeholder="e.g. MetLife Stadium (East Rutherford)"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-zinc-400 mb-1">Venue Capacity (Seats)</label>
              <input
                type="number"
                min="2000"
                max="100000"
                step="500"
                value={formData.venueCapacity}
                onChange={e => setFormData({ ...formData, venueCapacity: parseInt(e.target.value) || 15000 })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Ticket Price */}
            <div>
              <label className="block text-zinc-400 mb-1">Avg Ticket Price ($)</label>
              <input
                type="number"
                min="30"
                max="500"
                value={formData.ticketPrice}
                onChange={e => setFormData({ ...formData, ticketPrice: parseInt(e.target.value) || 75 })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Prestige Bonus */}
            <div>
              <label className="block text-zinc-400 mb-1">Prestige Rating Bonus (0-30)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.prestigeBonus}
                onChange={e => setFormData({ ...formData, prestigeBonus: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Buyrate Multiplier */}
            <div>
              <label className="block text-zinc-400 mb-1">Buyrate Multiplier (1.0 - 3.5x)</label>
              <input
                type="number"
                min="1.0"
                max="3.5"
                step="0.1"
                value={formData.buyrateMultiplier}
                onChange={e => setFormData({ ...formData, buyrateMultiplier: parseFloat(e.target.value) || 1.2 })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setEditingPPV(null);
                setIsCreatingNew(false);
              }}
              className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono hover:bg-zinc-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePPV}
              className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>Save Event</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid of all 12 PPVs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ppvSchedule.map(ppv => {
          const isPassed = ppv.weekNumber < currentWeek;
          const isThisWeek = ppv.weekNumber === currentWeek;

          return (
            <div
              key={ppv.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition group relative ${
                isThisWeek
                  ? 'bg-amber-950/20 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                  : isPassed
                  ? 'bg-zinc-900/50 border-zinc-800/80 opacity-75'
                  : ppv.isSupercard
                  ? 'bg-gradient-to-br from-zinc-900 to-purple-950/20 border-purple-500/40 hover:border-purple-400'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      isThisWeek
                        ? 'bg-amber-500 text-black animate-pulse'
                        : isPassed
                        ? 'bg-zinc-800 text-zinc-500'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      Week {ppv.weekNumber}
                    </span>
                    {ppv.isSupercard && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                        ★ Supercard
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(ppv)}
                      className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition"
                      title="Edit PPV"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {ppvSchedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePPV(ppv.id)}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
                        title="Delete PPV"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-white text-base font-mono group-hover:text-amber-300 transition">
                  {ppv.name}
                </h4>

                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {ppv.theme}
                </p>

                <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1 text-xs font-mono text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" /> Venue
                    </span>
                    <span className="text-zinc-200 truncate max-w-[170px]" title={ppv.venue}>
                      {ppv.venue}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-zinc-400" /> Capacity
                    </span>
                    <span className="text-zinc-200">
                      {formatNumber(ppv.venueCapacity)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-zinc-400" /> Ticket / Buyrate
                    </span>
                    <span className="text-emerald-400">
                      ${ppv.ticketPrice} • {ppv.buyrateMultiplier}x
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-400 font-medium">+{ppv.prestigeBonus} Prestige Bonus</span>
                <span className="text-zinc-500">
                  {isPassed ? 'Completed' : isThisWeek ? 'Broadcast Today' : `In ${ppv.weekNumber - currentWeek} wks`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

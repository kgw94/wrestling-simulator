import React, { useState } from 'react';
import { Promotion, WeeklyShow, DayOfWeek, BroadcastTier } from '../types';
import { 
  WEEKLY_SHOW_TEMPLATES, 
  WeeklyShowTemplate,
  getPromotionWeeklyShows 
} from '../utils/weeklyShowUtils';
import { formatNumber } from '../utils/format';
import { 
  Tv, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Star, 
  Calendar, 
  Clock, 
  DollarSign, 
  Radio, 
  Layers, 
  AlertCircle 
} from 'lucide-react';

interface WeeklyShowsSettingsViewProps {
  promotion: Promotion;
  weeklyShows: WeeklyShow[];
  onUpdateWeeklyShows: (updatedShows: WeeklyShow[]) => void;
  showNotification: (msg: string) => void;
}

export const WeeklyShowsSettingsView: React.FC<WeeklyShowsSettingsViewProps> = ({
  promotion,
  weeklyShows,
  onUpdateWeeklyShows,
  showNotification
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShowId, setEditingShowId] = useState<string | null>(null);

  const [formData, setFormData] = useState<WeeklyShow>({
    id: '',
    name: '',
    dayOfWeek: 'Saturday',
    tvNetwork: 'National Sports Cable',
    durationMinutes: 60,
    broadcastTier: 'Cable Prime-Time',
    productionCostWeekly: 28000,
    minNetworkRating: 58,
    isPrimary: false,
    description: ''
  });

  const handleOpenAddForm = () => {
    setEditingShowId(null);
    setFormData({
      id: `show-${Date.now()}`,
      name: `${promotion.shortName || promotion.name} Velocity`,
      dayOfWeek: 'Saturday',
      tvNetwork: 'USA Action Sports',
      durationMinutes: 60,
      broadcastTier: 'Cable Prime-Time',
      productionCostWeekly: 25000,
      minNetworkRating: 56,
      isPrimary: weeklyShows.length === 0,
      description: 'Secondary weekly showcase for midcard rivalries, rising prospects, and workrate clinic matches.'
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (show: WeeklyShow) => {
    setEditingShowId(show.id);
    setFormData({ ...show });
    setIsFormOpen(true);
  };

  const handleSaveShow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let updated: WeeklyShow[];
    if (editingShowId) {
      updated = weeklyShows.map(s => (s.id === editingShowId ? { ...formData } : s));
    } else {
      updated = [...weeklyShows, { ...formData, id: formData.id || `show-${Date.now()}` }];
    }

    // If marked primary, update all other shows
    if (formData.isPrimary) {
      updated = updated.map(s => ({
        ...s,
        isPrimary: s.id === formData.id
      }));
    } else if (!updated.some(s => s.isPrimary) && updated.length > 0) {
      updated[0].isPrimary = true;
    }

    onUpdateWeeklyShows(updated);
    setIsFormOpen(false);
    setEditingShowId(null);
    showNotification(`Weekly show "${formData.name}" saved successfully!`);
  };

  const handleQuickAddTemplate = (tpl: WeeklyShowTemplate) => {
    const newShow: WeeklyShow = {
      id: `show-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: tpl.nameTemplate(promotion.shortName || promotion.name),
      dayOfWeek: tpl.dayOfWeek,
      tvNetwork: tpl.tvNetwork,
      durationMinutes: tpl.durationMinutes,
      broadcastTier: tpl.broadcastTier,
      productionCostWeekly: tpl.productionCostWeekly,
      minNetworkRating: tpl.minNetworkRating,
      description: tpl.description,
      isPrimary: false
    };

    const updated = [...weeklyShows, newShow];
    onUpdateWeeklyShows(updated);
    showNotification(`Added "${newShow.name}" to weekly broadcast programming!`);
  };

  const handleSetPrimaryFlagship = (showId: string) => {
    const updated = weeklyShows.map(s => ({
      ...s,
      isPrimary: s.id === showId
    }));
    onUpdateWeeklyShows(updated);
    const primary = updated.find(s => s.isPrimary);
    showNotification(`"${primary?.name}" is now the primary flagship weekly broadcast!`);
  };

  const handleDeleteShow = (showId: string) => {
    if (weeklyShows.length <= 1) {
      alert('Your promotion must maintain at least one weekly show.');
      return;
    }

    const showToDelete = weeklyShows.find(s => s.id === showId);
    let updated = weeklyShows.filter(s => s.id !== showId);

    // If the deleted show was primary, designate the first remaining show
    if (showToDelete?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }

    onUpdateWeeklyShows(updated);
    showNotification(`Removed "${showToDelete?.name}" from schedule.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base font-mono flex items-center gap-2">
            <Tv className="w-5 h-5 text-amber-400" />
            <span>Weekly Television Broadcasts & Programming</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              {weeklyShows.length} {weeklyShows.length === 1 ? 'Show' : 'Shows'} Active
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans leading-relaxed">
            Expand your empire beyond a single broadcast. Add secondary B-shows for undercard talent, late-night hardcore programming, or global digital streams to build fanbase and boost television ratings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddForm}
          className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow self-start md:self-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Weekly Show</span>
        </button>
      </div>

      {/* Quick Add from Templates */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Quick-Add from Popular Show Formats</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">1-Click Instant Setup</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WEEKLY_SHOW_TEMPLATES.map((tpl, idx) => {
            const previewName = tpl.nameTemplate(promotion.shortName || promotion.name);
            const isAlreadyAdded = weeklyShows.some(s => s.name.toLowerCase() === previewName.toLowerCase());

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between gap-3 group hover:border-zinc-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                      {tpl.dayOfWeek}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400/90 font-semibold">
                      {tpl.durationMinutes} Min
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs font-mono leading-snug group-hover:text-amber-300 transition">
                    {previewName}
                  </h4>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                    📺 {tpl.tvNetwork}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 font-mono text-[10px] text-zinc-500">
                  <span>${formatNumber(tpl.productionCostWeekly)}/ep</span>
                  <button
                    type="button"
                    onClick={() => handleQuickAddTemplate(tpl)}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 font-bold transition flex items-center gap-1 border border-zinc-700"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAlreadyAdded ? 'Add Another' : 'Add Show'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Show Modal / Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <Tv className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  {editingShowId ? 'Edit Weekly Television Show' : 'Add New Weekly Television Show'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded bg-zinc-800 hover:bg-zinc-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShow} className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
              {/* Show Name */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Weekly Show Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. APW Saturday Slam, Wednesday Anarchy"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Day of Week & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Broadcast Day of the Week</label>
                  <select
                    value={formData.dayOfWeek || 'Saturday'}
                    onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Episode Airtime Duration</label>
                  <select
                    value={formData.durationMinutes || 60}
                    onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={45}>45 Minutes (Digital Showcase)</option>
                    <option value={60}>60 Minutes / 1 Hour (Standard B-Show)</option>
                    <option value={90}>90 Minutes / 1.5 Hours</option>
                    <option value={120}>120 Minutes / 2 Hours (Prime-Time Flagship)</option>
                    <option value={180}>180 Minutes / 3 Hours (Supercard)</option>
                  </select>
                </div>
              </div>

              {/* Network & Broadcast Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    TV Broadcaster / Network <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tvNetwork}
                    onChange={e => setFormData({ ...formData, tvNetwork: e.target.value })}
                    placeholder="e.g. USA Network, Spike TV, YouTube"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Broadcast Tier</label>
                  <select
                    value={formData.broadcastTier || 'Cable Prime-Time'}
                    onChange={e => setFormData({ ...formData, broadcastTier: e.target.value as BroadcastTier })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Cable Prime-Time">Cable Prime-Time</option>
                    <option value="Free-To-Air TV">Free-To-Air TV</option>
                    <option value="Premium Cable">Premium Cable</option>
                    <option value="Online Streaming">Online Streaming (YouTube / OTT)</option>
                    <option value="Late Night Underground">Late Night Underground (TV-MA)</option>
                  </select>
                </div>
              </div>

              {/* Production Cost & Min Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Weekly Production Cost ($)</label>
                  <input
                    type="number"
                    step="5000"
                    min="5000"
                    value={formData.productionCostWeekly || 25000}
                    onChange={e => setFormData({ ...formData, productionCostWeekly: parseInt(e.target.value) || 10000 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-zinc-500 font-sans">Deducted from budget each week</span>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Min Network Rating Expectation</label>
                  <input
                    type="number"
                    min="30"
                    max="90"
                    value={formData.minNetworkRating || 55}
                    onChange={e => setFormData({ ...formData, minNetworkRating: parseInt(e.target.value) || 50 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-zinc-500 font-sans">Lower ratings reduce broadcaster satisfaction</span>
                </div>
              </div>

              {/* Show Description */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Show Concept & Booking Objective</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Highlights cruiserweights, developing younger prospects, and secondary title rivalries."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              {/* Primary Flagship Toggle */}
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>Set as Primary Flagship Broadcast</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-sans">
                    Flagship show serves as the default anchor program for storylines and promotion prestige.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPrimary || false}
                  onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-zinc-700 focus:ring-amber-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingShowId ? 'Save Changes' : 'Create Weekly Show'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Current Configured Weekly Shows Schedule */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono text-xs text-zinc-400 uppercase tracking-wider font-bold">
          <span>Active Broadcast Schedule ({weeklyShows.length} Shows)</span>
          <span className="font-normal lowercase text-zinc-500">
            select a show below or click "Set Flagship"
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyShows.map(show => (
            <div
              key={show.id}
              className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                show.isPrimary
                  ? 'bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-950 border-amber-500/50 shadow-md'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {show.isPrimary && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                        <Star className="w-2.5 h-2.5 fill-black" />
                        <span>Flagship</span>
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-bold border border-zinc-700">
                      {show.dayOfWeek || 'Weekly'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700">
                      {show.durationMinutes || 120} Min
                    </span>
                    {show.broadcastTier && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {show.broadcastTier}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(show)}
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                      title="Edit Show Parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {weeklyShows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteShow(show.id)}
                        className="p-1.5 rounded hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition"
                        title="Remove Show"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="text-base font-bold text-white font-mono leading-tight">
                  {show.name}
                </h4>

                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Radio className="w-3 h-3 text-amber-400" />
                    <span>{show.tvNetwork}</span>
                  </span>
                  <span>•</span>
                  <span>Cost: ${formatNumber(show.productionCostWeekly || 0)}/wk</span>
                  <span>•</span>
                  <span>Min Rating: {show.minNetworkRating || 55}/100</span>
                </div>

                {show.description && (
                  <p className="text-xs text-zinc-400 font-sans mt-2 leading-relaxed">
                    {show.description}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between gap-2 font-mono text-xs">
                {!show.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryFlagship(show.id)}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[11px] font-bold transition flex items-center gap-1 border border-zinc-700"
                  >
                    <Star className="w-3 h-3" />
                    <span>Set as Primary Flagship</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Current Flagship Anchor</span>
                  </span>
                )}

                <span className="text-[11px] text-zinc-500 font-sans">
                  Available in Booking Terminal
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Promotion, 
  Wrestler, 
  Brand, 
  BrandSplitSettings, 
  DraftPick,
  Championship 
} from '../types';
import { getDefaultBrandSplit } from '../data/developmentalAndBrandDefaults';
import { formatNumber } from '../utils/format';
import { 
  Split, 
  Trophy, 
  Users, 
  ArrowRightLeft, 
  CheckCircle2, 
  ChevronLeft, 
  Play, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Crown, 
  Tv, 
  ShieldAlert, 
  Radio, 
  X, 
  ChevronRight, 
  Sliders, 
  Zap,
  Award,
  Layers
} from 'lucide-react';

interface BrandSplitViewProps {
  promotion: Promotion;
  currentWeek: number;
  currentYear: number;
  onUpdatePromotion: (newPromo: Promotion) => void;
  onBackToMenu: () => void;
}

export const BrandSplitView: React.FC<BrandSplitViewProps> = ({
  promotion,
  currentWeek,
  currentYear,
  onUpdatePromotion,
  onBackToMenu
}) => {
  const brandSplit: BrandSplitSettings = promotion.brandSplit || getDefaultBrandSplit(promotion);
  const brands = brandSplit.brands;

  const [activeTab, setActiveTab] = useState<'overview' | 'draft' | 'trades' | 'titles'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Draft Lottery State
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftRounds, setDraftRounds] = useState<number>(10);
  const [currentDraftPickIndex, setCurrentDraftPickIndex] = useState<number>(0);
  const [activeDraftPicks, setActiveDraftPicks] = useState<DraftPick[]>(brandSplit.draftHistory || []);
  const [lastDraftedWrestler, setLastDraftedWrestler] = useState<{ wrestler: Wrestler; brand: Brand; pickNum: number } | null>(null);

  // Trade State
  const [tradeWrestlerAId, setTradeWrestlerAId] = useState<string>('');
  const [tradeWrestlerBId, setTradeWrestlerBId] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const brandRed = brands[0] || {
    id: 'brand_red',
    name: 'Monday Night Raw',
    shortName: 'RAW',
    color: '#ef4444',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    borderClass: 'border-red-500/50',
    weeklyShowName: 'Monday Night Raw',
    tvNetwork: 'USA Network',
    exclusiveTitleIds: [],
    rosterIds: [],
    averageRating: 82,
    ratingsHistory: [80, 82, 81, 83],
    weeklyShowWins: 2
  };

  const brandBlue = brands[1] || {
    id: 'brand_blue',
    name: 'Friday Night SmackDown',
    shortName: 'SD',
    color: '#3b82f6',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderClass: 'border-blue-500/50',
    weeklyShowName: 'Friday Night SmackDown',
    tvNetwork: 'FOX Sports',
    exclusiveTitleIds: [],
    rosterIds: [],
    averageRating: 81,
    ratingsHistory: [82, 80, 83, 80],
    weeklyShowWins: 2
  };

  // Roster lists
  const brandRedRoster = promotion.roster.filter(w => w.brandId === brandRed.id || (!w.brandId && brandRed.rosterIds.includes(w.id)));
  const brandBlueRoster = promotion.roster.filter(w => w.brandId === brandBlue.id || (!w.brandId && brandBlue.rosterIds.includes(w.id)));
  const unassignedRoster = promotion.roster.filter(w => !brandRedRoster.some(r => r.id === w.id) && !brandBlueRoster.some(b => b.id === w.id));

  // Toggle Brand Split
  const handleToggleBrandSplit = () => {
    const newEnabled = !brandSplit.isEnabled;
    const updatedBrandSplit: BrandSplitSettings = {
      ...brandSplit,
      isEnabled: newEnabled
    };

    // If enabling for first time, initialize wrestler brand IDs
    let updatedRoster = [...promotion.roster];
    if (newEnabled) {
      updatedRoster = updatedRoster.map((w, index) => {
        if (!w.brandId) {
          return {
            ...w,
            brandId: index % 2 === 0 ? brandRed.id : brandBlue.id
          };
        }
        return w;
      });
    }

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster,
      brandSplit: updatedBrandSplit
    });

    showToast(newEnabled ? 'Dual Brand Split Activated! Roster divided between Raw and SmackDown.' : 'Brand Split deactivated. Universal unified roster active.');
  };

  // 1. DRAFT LOTTERY: Execute a Single Pick
  const handleMakeDraftPick = (pickedWrestlerId: string) => {
    const wrestler = promotion.roster.find(w => w.id === pickedWrestlerId);
    if (!wrestler) return;

    // Determine whose turn it is: alternate picks
    const totalPicksMade = activeDraftPicks.length;
    const isBrandRedTurn = totalPicksMade % 2 === 0;
    const targetBrand = isBrandRedTurn ? brandRed : brandBlue;

    const newPickNumber = totalPicksMade + 1;
    const currentRound = Math.floor(totalPicksMade / 2) + 1;

    const isChampion = wrestler.championshipIds.length > 0;
    const newPick: DraftPick = {
      id: `pick-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      round: currentRound,
      pickNumber: newPickNumber,
      brandId: targetBrand.id,
      brandName: targetBrand.name,
      wrestlerId: wrestler.id,
      wrestlerName: wrestler.name,
      overallRating: Math.round((wrestler.overness * 0.5) + (wrestler.workrate * 0.5)),
      isChampion,
      notes: isChampion ? `Drafted with active championship gold!` : undefined
    };

    const newPicks = [newPick, ...activeDraftPicks];
    setActiveDraftPicks(newPicks);
    setLastDraftedWrestler({ wrestler, brand: targetBrand, pickNum: newPickNumber });

    // Update wrestler's brandId
    const updatedRoster = promotion.roster.map(item => {
      if (item.id === wrestler.id) {
        return {
          ...item,
          brandId: targetBrand.id,
          morale: Math.min(100, item.morale + 5)
        };
      }
      return item;
    });

    // Update brand rosterIds
    const updatedBrands = brands.map(b => {
      if (b.id === targetBrand.id) {
        return {
          ...b,
          rosterIds: [...b.rosterIds.filter(id => id !== wrestler.id), wrestler.id]
        };
      } else {
        return {
          ...b,
          rosterIds: b.rosterIds.filter(id => id !== wrestler.id)
        };
      }
    });

    const updatedBrandSplit: BrandSplitSettings = {
      ...brandSplit,
      isEnabled: true,
      brands: updatedBrands,
      draftHistory: newPicks
    };

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster,
      brandSplit: updatedBrandSplit
    });

    showToast(`Round ${currentRound}, Pick #${newPickNumber}: ${targetBrand.name} selects ${wrestler.name}!`);
  };

  // 2. DRAFT LOTTERY: Auto-Simulate Remaining Rounds
  const handleAutoSimulateDraft = () => {
    let currentRoster = [...promotion.roster];
    let currentPicks = [...activeDraftPicks];
    const totalPicksTarget = draftRounds * 2;
    let picksRemaining = totalPicksTarget - currentPicks.length;

    if (picksRemaining <= 0) {
      showToast('Draft lottery is already complete for all specified rounds!');
      return;
    }

    // Available wrestlers sorted by overness/workrate
    const undrafted = currentRoster.filter(w => !currentPicks.some(p => p.wrestlerId === w.id));
    undrafted.sort((a, b) => (b.overness + b.workrate) - (a.overness + a.workrate));

    const simPicksCount = Math.min(picksRemaining, undrafted.length);
    for (let i = 0; i < simPicksCount; i++) {
      const wrestler = undrafted[i];
      const pickNum = currentPicks.length + 1;
      const isRed = (pickNum - 1) % 2 === 0;
      const targetBrand = isRed ? brandRed : brandBlue;
      const round = Math.floor((pickNum - 1) / 2) + 1;

      currentPicks.unshift({
        id: `pick-sim-${Date.now()}-${i}`,
        round,
        pickNumber: pickNum,
        brandId: targetBrand.id,
        brandName: targetBrand.name,
        wrestlerId: wrestler.id,
        wrestlerName: wrestler.name,
        overallRating: Math.round((wrestler.overness * 0.5) + (wrestler.workrate * 0.5)),
        isChampion: wrestler.championshipIds.length > 0
      });

      // Update brand on wrestler
      currentRoster = currentRoster.map(w => w.id === wrestler.id ? { ...w, brandId: targetBrand.id } : w);
    }

    const updatedBrands = brands.map(b => ({
      ...b,
      rosterIds: currentRoster.filter(w => w.brandId === b.id).map(w => w.id)
    }));

    const updatedBrandSplit: BrandSplitSettings = {
      ...brandSplit,
      isEnabled: true,
      brands: updatedBrands,
      draftHistory: currentPicks
    };

    onUpdatePromotion({
      ...promotion,
      roster: currentRoster,
      brandSplit: updatedBrandSplit
    });

    setActiveDraftPicks(currentPicks);
    showToast(`Draft Lottery completed! ${simPicksCount} picks executed across both brands.`);
  };

  // 3. EXECUTE SUPERSTAR TRADE
  const handleExecuteTrade = () => {
    if (!tradeWrestlerAId || !tradeWrestlerBId) {
      showToast('Select one superstar from each brand to propose a trade.');
      return;
    }

    const starA = promotion.roster.find(w => w.id === tradeWrestlerAId);
    const starB = promotion.roster.find(w => w.id === tradeWrestlerBId);
    if (!starA || !starB) return;

    const brandAId = starA.brandId || brandRed.id;
    const brandBId = starB.brandId || brandBlue.id;

    const updatedRoster = promotion.roster.map(item => {
      if (item.id === starA.id) {
        return { ...item, brandId: brandBId, morale: Math.min(100, item.morale + 3) };
      }
      if (item.id === starB.id) {
        return { ...item, brandId: brandAId, morale: Math.min(100, item.morale + 3) };
      }
      return item;
    });

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster
    });

    setTradeWrestlerAId('');
    setTradeWrestlerBId('');
    showToast(`TRADE CONFIRMED: ${starA.name} to ${brandBId === brandRed.id ? brandRed.name : brandBlue.name} in exchange for ${starB.name}!`);
  };

  // 4. ASSIGN CHAMPIONSHIP TO BRAND
  const handleAssignTitleToBrand = (titleId: string, brandId?: string) => {
    const updatedTitles = promotion.titles.map(t => {
      if (t.id === titleId) {
        return {
          ...t,
          brandId: brandId || undefined
        };
      }
      return t;
    });

    onUpdatePromotion({
      ...promotion,
      titles: updatedTitles
    });

    const targetTitle = updatedTitles.find(t => t.id === titleId);
    showToast(`Updated ${targetTitle?.name} brand exclusivity to ${brandId ? (brandId === brandRed.id ? brandRed.name : brandBlue.name) : 'Cross-Brand / Dual-Branded'}.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-500 text-black px-4 py-3 rounded-xl font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-sky-400 animate-in slide-in-from-bottom duration-200">
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
              <Split className="w-6 h-6 text-sky-400" />
              <span>[ B ] Dual Brand Split & Draft Lottery</span>
            </h2>
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
              brandSplit.isEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}>
              {brandSplit.isEnabled ? 'ACTIVE BRAND SPLIT' : 'UNIFIED ROSTER'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            Divide your promotion into two fierce rival touring brands with separate weekly broadcasts, brand-exclusive titles, live Draft Lotteries, and weekly TV ratings warfare.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleBrandSplit}
            className={`px-4 py-2 rounded-lg font-mono font-bold text-xs flex items-center gap-2 transition shadow ${
              brandSplit.isEnabled
                ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{brandSplit.isEnabled ? 'Deactivate Brand Split' : 'Activate Brand Split'}</span>
          </button>
        </div>
      </div>

      {/* Brand Head-to-Head Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand Red Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/50 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500 text-black flex items-center justify-center font-bold font-mono">
                {brandRed.shortName}
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">{brandRed.name}</h3>
                <span className="text-[10px] text-zinc-400">{brandRed.tvNetwork} • Weekly Broadcast</span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/40">
              {brandRedRoster.length} Superstars
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-zinc-950/80 p-2.5 rounded-xl border border-red-950">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase">Avg Show Score:</span>
              <div className="text-sm font-bold text-red-400">{brandRed.averageRating}/100</div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase">Exclusive Titles:</span>
              <div className="text-sm font-bold text-zinc-200">
                {promotion.titles.filter(t => t.brandId === brandRed.id).length} Belts
              </div>
            </div>
          </div>
        </div>

        {/* Brand Blue Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-zinc-900 to-zinc-900 border border-blue-500/50 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500 text-black flex items-center justify-center font-bold font-mono">
                {brandBlue.shortName}
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">{brandBlue.name}</h3>
                <span className="text-[10px] text-zinc-400">{brandBlue.tvNetwork} • Weekly Broadcast</span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
              {brandBlueRoster.length} Superstars
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-zinc-950/80 p-2.5 rounded-xl border border-blue-950">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase">Avg Show Score:</span>
              <div className="text-sm font-bold text-blue-400">{brandBlue.averageRating}/100</div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase">Exclusive Titles:</span>
              <div className="text-sm font-bold text-zinc-200">
                {promotion.titles.filter(t => t.brandId === brandBlue.id).length} Belts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'overview'
              ? 'border-sky-500 text-sky-400 bg-sky-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Brand Rosters ({promotion.roster.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('draft')}
          className={`px-4 py-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'draft'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Live Draft Lottery</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'trades'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Superstar Trades</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('titles')}
          className={`px-4 py-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'titles'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Brand Championship Belts</span>
        </button>
      </div>

      {/* TAB 1: BRAND ROSTERS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand Red Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-red-400 uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>{brandRed.name} Roster ({brandRedRoster.length})</span>
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {brandRedRoster.map(w => (
                  <div 
                    key={w.id}
                    className="p-3 rounded-xl bg-zinc-900 border border-red-950 flex items-center justify-between font-mono text-xs hover:border-red-500/40 transition"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{w.name}</span>
                        {w.championshipIds.length > 0 && <span>🏆</span>}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {w.push} • {w.style} • Overness: <strong className="text-amber-400">{w.overness}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = promotion.roster.map(item => item.id === w.id ? { ...item, brandId: brandBlue.id } : item);
                        onUpdatePromotion({ ...promotion, roster: updated });
                        showToast(`Transferred ${w.name} to ${brandBlue.name}.`);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white transition"
                      title="Move to SmackDown"
                    >
                      To {brandBlue.shortName} ➔
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Blue Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-blue-400 uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>{brandBlue.name} Roster ({brandBlueRoster.length})</span>
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {brandBlueRoster.map(w => (
                  <div 
                    key={w.id}
                    className="p-3 rounded-xl bg-zinc-900 border border-blue-950 flex items-center justify-between font-mono text-xs hover:border-blue-500/40 transition"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{w.name}</span>
                        {w.championshipIds.length > 0 && <span>🏆</span>}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {w.push} • {w.style} • Overness: <strong className="text-amber-400">{w.overness}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = promotion.roster.map(item => item.id === w.id ? { ...item, brandId: brandRed.id } : item);
                        onUpdatePromotion({ ...promotion, roster: updated });
                        showToast(`Transferred ${w.name} to ${brandRed.name}.`);
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white transition"
                      title="Move to Raw"
                    >
                      To {brandRed.shortName} ➔
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE DRAFT LOTTERY */}
      {activeTab === 'draft' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Draft Controller Card */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">Annual Superstar Draft Lottery</h3>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Execute alternating live draft picks between {brandRed.shortName} and {brandBlue.shortName}. Draft top champions to claim brand exclusivity!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={draftRounds}
                  onChange={e => setDraftRounds(parseInt(e.target.value))}
                  className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200"
                >
                  <option value={5}>5 Rounds (Shakeup - 10 Picks)</option>
                  <option value={10}>10 Rounds (Full Draft - 20 Picks)</option>
                  <option value={15}>15 Rounds (Franchise Reset - 30 Picks)</option>
                </select>

                <button
                  type="button"
                  onClick={handleAutoSimulateDraft}
                  className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold transition shadow"
                >
                  Auto-Simulate Draft
                </button>
              </div>
            </div>

            {/* Turn Indicator */}
            {(() => {
              const picksCount = activeDraftPicks.length;
              const isRedTurn = picksCount % 2 === 0;
              const onClockBrand = isRedTurn ? brandRed : brandBlue;

              return (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isRedTurn ? 'bg-red-950/30 border-red-500/40 text-red-300' : 'bg-blue-950/30 border-blue-500/40 text-blue-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full animate-ping bg-amber-400" />
                    <span>ON THE CLOCK: <strong>{onClockBrand.name}</strong> (Pick #{picksCount + 1})</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Round {Math.floor(picksCount / 2) + 1} of {draftRounds}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Draft Board: Pick Best Available */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Top Available Superstars on Draft Board</span>
              <span className="text-zinc-500 text-[11px]">Click superstar to draft to active brand</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {promotion.roster
                .filter(w => !activeDraftPicks.some(p => p.wrestlerId === w.id))
                .sort((a, b) => (b.overness + b.workrate) - (a.overness + a.workrate))
                .slice(0, 9)
                .map(w => {
                  const rating = Math.round((w.overness * 0.5) + (w.workrate * 0.5));
                  return (
                    <div
                      key={w.id}
                      onClick={() => handleMakeDraftPick(w.id)}
                      className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/70 cursor-pointer transition flex items-center justify-between group shadow-sm"
                    >
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-amber-300 transition flex items-center gap-1.5">
                          <span>{w.name}</span>
                          {w.championshipIds.length > 0 && <span>🏆</span>}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {w.push} • {w.style} • Overness: <strong className="text-amber-400">{w.overness}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-black transition">
                          Draft ➔
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Completed Draft Picks Log */}
          {activeDraftPicks.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Official Draft Lottery Ledger ({activeDraftPicks.length} Picks)
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeDraftPicks.map(pick => {
                  const isRed = pick.brandId === brandRed.id;
                  return (
                    <div
                      key={pick.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                        isRed ? 'bg-red-950/20 border-red-900/60' : 'bg-blue-950/20 border-blue-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center font-bold text-zinc-300">
                          #{pick.pickNumber}
                        </span>
                        <div>
                          <strong className="text-white text-sm">{pick.wrestlerName}</strong>
                          <div className="text-[11px] text-zinc-400">
                            Round {pick.round} Selection to <strong className={isRed ? 'text-red-400' : 'text-blue-400'}>{pick.brandName}</strong>
                            {pick.notes && <span className="text-amber-400 ml-1">({pick.notes})</span>}
                          </div>
                        </div>
                      </div>

                      <span className="font-bold text-zinc-300">
                        OVR: {pick.overallRating}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUPERSTAR TRADES */}
      {activeTab === 'trades' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">General Manager Trade Machine</h3>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Negotiate and execute 1-for-1 blockbuster trades between {brandRed.name} and {brandBlue.name} to balance workrate and headline star power.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select from Red */}
              <div className="space-y-2 p-4 rounded-xl bg-zinc-950 border border-red-950">
                <label className="font-bold text-red-400 block uppercase">
                  Select Superstar from {brandRed.name}:
                </label>
                <select
                  value={tradeWrestlerAId}
                  onChange={e => setTradeWrestlerAId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-red-500"
                >
                  <option value="">-- Choose {brandRed.shortName} Talent --</option>
                  {brandRedRoster.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.push} - Overness: {w.overness})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select from Blue */}
              <div className="space-y-2 p-4 rounded-xl bg-zinc-950 border border-blue-950">
                <label className="font-bold text-blue-400 block uppercase">
                  Select Superstar from {brandBlue.name}:
                </label>
                <select
                  value={tradeWrestlerBId}
                  onChange={e => setTradeWrestlerBId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose {brandBlue.shortName} Talent --</option>
                  {brandBlueRoster.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.push} - Overness: {w.overness})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleExecuteTrade}
                disabled={!tradeWrestlerAId || !tradeWrestlerBId}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black font-bold transition shadow"
              >
                Execute Blockbuster Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BRAND CHAMPIONSHIPS */}
      {activeTab === 'titles' && (
        <div className="space-y-4 font-mono text-xs">
          <p className="text-xs text-zinc-400 font-sans">
            Assign titles as brand-exclusive or cross-brand. Superstars competing on exclusive brands will only contest that brand's gold on weekly television.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotion.titles.map(title => {
              const currentBrand = brands.find(b => b.id === title.brandId);

              return (
                <div 
                  key={title.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <div>
                        <h4 className="font-bold text-white text-sm">{title.name}</h4>
                        <span className="text-[11px] text-zinc-400">Prestige: {title.prestige}/100</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      title.brandId === brandRed.id 
                        ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                        : title.brandId === brandBlue.id 
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {currentBrand ? currentBrand.shortName : 'CROSS-BRAND'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
                    <span className="text-zinc-500">Exclusivity:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAssignTitleToBrand(title.id, brandRed.id)}
                        className={`px-2 py-1 rounded transition ${
                          title.brandId === brandRed.id ? 'bg-red-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {brandRed.shortName}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAssignTitleToBrand(title.id, brandBlue.id)}
                        className={`px-2 py-1 rounded transition ${
                          title.brandId === brandBlue.id ? 'bg-blue-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {brandBlue.shortName}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAssignTitleToBrand(title.id, undefined)}
                        className={`px-2 py-1 rounded transition ${
                          !title.brandId ? 'bg-amber-600 text-black font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Dual
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

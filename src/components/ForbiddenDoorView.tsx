import React, { useState } from 'react';
import { 
  Promotion, 
  Wrestler, 
  ForbiddenDoorPartner, 
  ForbiddenDoorState, 
  ForbiddenDoorSupercard,
  AllianceTier,
  LoanedWrestlerRecord,
  BorrowedWrestlerRecord 
} from '../types';
import { formatNumber } from '../utils/format';
import { 
  Globe2, 
  Handshake, 
  Trophy, 
  Sparkles, 
  PlaneTakeoff, 
  Users, 
  Calendar, 
  ShieldAlert, 
  TrendingUp, 
  Award, 
  Flame, 
  Crown, 
  Plus, 
  Check, 
  X, 
  ChevronRight, 
  DollarSign, 
  Building2, 
  RotateCcw,
  Star,
  Swords
} from 'lucide-react';

interface ForbiddenDoorViewProps {
  promotion: Promotion;
  currentWeek: number;
  currentYear: number;
  onUpdatePromotion: (updatedPromo: Promotion) => void;
  onNavigate: (view: any) => void;
}

export const ForbiddenDoorView: React.FC<ForbiddenDoorViewProps> = ({
  promotion,
  currentWeek,
  currentYear,
  onUpdatePromotion,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'treaties' | 'exchange' | 'supercards' | 'champions'>('treaties');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isTreatyModalOpen, setIsTreatyModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isSupercardModalOpen, setIsSupercardModalOpen] = useState(false);

  // Modal temporary states
  const [treatyTargetTier, setTreatyTargetTier] = useState<AllianceTier>('Strategic Alliance');
  const [loanWrestlerId, setLoanWrestlerId] = useState<string>('');
  const [loanWeeks, setLoanWeeks] = useState<number>(6);
  const [loanFocus, setLoanFocus] = useState<'workrate' | 'overness' | 'stamina' | 'micSkills'>('workrate');
  const [borrowWrestlerId, setBorrowWrestlerId] = useState<string>('');
  const [borrowWeeks, setBorrowWeeks] = useState<number>(4);

  // Supercard state
  const [supercardName, setSupercardName] = useState<string>('');
  const [supercardPartnerId, setSupercardPartnerId] = useState<string>('');
  const [supercardWeek, setSupercardWeek] = useState<number>(currentWeek + 8 > 52 ? 24 : currentWeek + 8);
  const [supercardVenue, setSupercardVenue] = useState<string>('Tokyo Dome (Super Stadium)');
  const [supercardCapacity, setSupercardCapacity] = useState<number>(55000);
  const [supercardPrice, setSupercardPrice] = useState<number>(85);
  const [supercardTheme, setSupercardTheme] = useState<string>('World Supremacy & Interpromotional Showcase');
  const [supercardStipulation, setSupercardStipulation] = useState<ForbiddenDoorSupercard['stipulationType']>('Bragging Rights Interpromotional Cup');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fdState: ForbiddenDoorState = promotion.forbiddenDoor || {
    partners: [],
    supercards: [],
    loanedRoster: [],
    borrowedRoster: [],
    trophiesWon: 0,
    totalPrestigeGained: 0
  };

  const partners = fdState.partners || [];
  const selectedPartner = partners.find(p => p.id === selectedPartnerId) || partners[0];

  // Helper to commit updated ForbiddenDoorState to promotion
  const updateForbiddenDoorState = (updater: (prev: ForbiddenDoorState) => ForbiddenDoorState) => {
    const nextState = updater(fdState);
    onUpdatePromotion({
      ...promotion,
      forbiddenDoor: nextState
    });
  };

  // Treaty signing handler
  const handleSignTreaty = (partnerId: string, tier: AllianceTier) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    let cost = 0;
    if (tier === 'Talent Exchange') cost = 15000;
    if (tier === 'Strategic Alliance') cost = 35000;
    if (tier === 'The Forbidden Door') cost = 60000;
    if (tier === 'Hostile Rivalry / Invasion') cost = 10000;

    if (promotion.budget < cost) {
      showToast(`Insufficient funds ($${formatNumber(cost)} needed to ratify this agreement).`);
      return;
    }

    const updatedPartners = partners.map(p => {
      if (p.id === partnerId) {
        return {
          ...p,
          tier,
          relationshipScore: Math.min(100, Math.max(10, p.relationshipScore + (tier === 'Hostile Rivalry / Invasion' ? -40 : 15)))
        };
      }
      return p;
    });

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - cost,
      prestige: tier === 'The Forbidden Door' ? Math.min(100, promotion.prestige + 2) : promotion.prestige,
      forbiddenDoor: {
        ...fdState,
        partners: updatedPartners,
        totalPrestigeGained: tier === 'The Forbidden Door' ? fdState.totalPrestigeGained + 2 : fdState.totalPrestigeGained
      }
    });

    setIsTreatyModalOpen(false);
    showToast(`Signed "${tier}" agreement with ${partner.name}!`);
  };

  // Send diplomatic goodwill gift ($20,000 -> +15 relations)
  const handleSendGoodwill = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    const giftCost = 20000;
    if (promotion.budget < giftCost) {
      showToast('Insufficient budget to send executive delegation gift.');
      return;
    }

    const updatedPartners = partners.map(p => {
      if (p.id === partnerId) {
        return {
          ...p,
          relationshipScore: Math.min(100, p.relationshipScore + 15)
        };
      }
      return p;
    });

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - giftCost,
      forbiddenDoor: {
        ...fdState,
        partners: updatedPartners
      }
    });

    showToast(`Sent executive goodwill gift to ${partner.name} (+15 Relations)!`);
  };

  // Borrow talent for guest tour
  const handleBorrowTalent = (partner: ForbiddenDoorPartner, wrestler: Wrestler, weeks: number) => {
    const fee = wrestler.salary * weeks * 1.5;
    if (promotion.budget < fee) {
      showToast(`Insufficient funds ($${formatNumber(fee)} required for foreign loan fee).`);
      return;
    }

    const guestWrestler: Wrestler = {
      ...wrestler,
      id: `borrowed-${wrestler.id}-${Date.now()}`,
      isGuestStar: true,
      guestHomePromotionId: partner.id,
      guestHomePromotionName: partner.name,
      guestWeeksRemaining: weeks,
      contractWeeks: weeks
    };

    const newBorrowedRecord: BorrowedWrestlerRecord = {
      wrestler: guestWrestler,
      partnerId: partner.id,
      partnerName: partner.name,
      weeksRemaining: weeks,
      totalWeeks: weeks,
      feePaid: fee
    };

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - fee,
      roster: [guestWrestler, ...promotion.roster],
      forbiddenDoor: {
        ...fdState,
        borrowedRoster: [...(fdState.borrowedRoster || []), newBorrowedRecord]
      }
    });

    setIsBorrowModalOpen(false);
    showToast(`Acquired international guest star ${wrestler.name} for ${weeks} weeks!`);
  };

  // Loan talent to partner promotion for excursion
  const handleLoanTalent = (wrestlerId: string, partnerId: string, weeks: number, focus: 'workrate' | 'overness' | 'stamina' | 'micSkills') => {
    const wrestler = promotion.roster.find(w => w.id === wrestlerId);
    const partner = partners.find(p => p.id === partnerId);
    if (!wrestler || !partner) return;

    const loanRecord: LoanedWrestlerRecord = {
      wrestlerId: wrestler.id,
      wrestlerName: wrestler.name,
      partnerId: partner.id,
      partnerName: partner.name,
      weeksRemaining: weeks,
      totalWeeks: weeks,
      targetFocus: focus,
      startingWorkrate: wrestler.workrate,
      startingOverness: wrestler.overness
    };

    // Remove from active roster temporarily
    const updatedRoster = promotion.roster.filter(w => w.id !== wrestlerId);

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster,
      forbiddenDoor: {
        ...fdState,
        loanedRoster: [...(fdState.loanedRoster || []), loanRecord]
      }
    });

    setIsLoanModalOpen(false);
    showToast(`Sent ${wrestler.name} on foreign excursion to ${partner.name} for ${weeks} weeks!`);
  };

  // Recall loaned talent early
  const handleRecallTalent = (loanRecord: LoanedWrestlerRecord) => {
    const originalWrestler = promotion.roster.find(w => w.id === loanRecord.wrestlerId);
    
    // If not found in current roster, reconstruct with excursion development bonus
    const completedWeeks = loanRecord.totalWeeks - loanRecord.weeksRemaining;
    const statBonus = Math.max(1, Math.round(completedWeeks * 0.7));

    let returnedWrestler: Wrestler;
    if (originalWrestler) {
      returnedWrestler = {
        ...originalWrestler,
        [loanRecord.targetFocus]: Math.min(100, (originalWrestler[loanRecord.targetFocus] || 70) + statBonus),
        morale: 100
      };
    } else {
      returnedWrestler = {
        id: loanRecord.wrestlerId,
        name: loanRecord.wrestlerName,
        nickname: 'The Returning Traveler',
        age: 25,
        gender: 'Male',
        style: 'Technician',
        alignment: 'Face',
        push: 'Midcard',
        overness: Math.min(100, loanRecord.startingOverness + Math.round(statBonus * 0.8)),
        workrate: Math.min(100, loanRecord.startingWorkrate + statBonus),
        micSkills: 72,
        stamina: 85,
        morale: 95,
        fatigue: 0,
        salary: 2500,
        contractWeeks: 30,
        wins: 10,
        losses: 4,
        draws: 0,
        championshipIds: [],
        injury: { injured: false }
      };
    }

    const updatedRoster = [returnedWrestler, ...promotion.roster.filter(w => w.id !== returnedWrestler.id)];
    const updatedLoaned = (fdState.loanedRoster || []).filter(l => l.wrestlerId !== loanRecord.wrestlerId);

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster,
      forbiddenDoor: {
        ...fdState,
        loanedRoster: updatedLoaned
      }
    });

    showToast(`Recalled ${loanRecord.wrestlerName} from foreign excursion (+${statBonus} ${loanRecord.targetFocus})!`);
  };

  // Schedule new Supercard
  const handleScheduleSupercard = () => {
    const partner = partners.find(p => p.id === supercardPartnerId) || partners[0];
    if (!partner || !supercardName.trim()) return;

    const newSupercard: ForbiddenDoorSupercard = {
      id: `fd-card-${Date.now()}`,
      name: supercardName.trim(),
      partnerId: partner.id,
      partnerName: partner.name,
      scheduledWeek: supercardWeek,
      scheduledYear: currentYear,
      venue: supercardVenue,
      venueCapacity: supercardCapacity,
      ticketPrice: supercardPrice,
      theme: supercardTheme,
      stipulationType: supercardStipulation,
      isCompleted: false
    };

    onUpdatePromotion({
      ...promotion,
      forbiddenDoor: {
        ...fdState,
        supercards: [...(fdState.supercards || []), newSupercard]
      }
    });

    setIsSupercardModalOpen(false);
    showToast(`Scheduled interpromotional supercard "${newSupercard.name}" for Week ${supercardWeek}!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-4 py-3 rounded-xl shadow-2xl border border-amber-300 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & GLOBAL ALLIANCE SUMMARY */}
      <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/40 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                <span>GLOBAL WORKING AGREEMENTS</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                The Forbidden Door Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Forbidden Door & Global Alliances</span>
              <span className="text-amber-400 text-lg font-mono">🌐</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Negotiate international treaties, borrow world-renowned guest attractions, send young prospects on overseas excursions, and co-promote stadium mega-events against rival federations.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSupercardPartnerId(partners[0]?.id || '');
                setSupercardName(`${promotion.shortName} x ${partners[0]?.shortName || 'Global'}: Forbidden Door`);
                setIsSupercardModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-amber-500/10 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Supercard</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('book_show')}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs font-mono flex items-center gap-2 border border-zinc-700 transition"
            >
              <Swords className="w-4 h-4 text-amber-400" />
              <span>Book TV Card</span>
            </button>
          </div>
        </div>

        {/* Global Treaty KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
              <Handshake className="w-3.5 h-3.5 text-sky-400" />
              <span>Partner Federations</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {partners.filter(p => p.tier !== 'None').length} <span className="text-xs text-zinc-500 font-normal">/ {partners.length} Global</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Borrowed Attractions</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">
              {(fdState.borrowedRoster || []).length} <span className="text-xs text-zinc-500 font-normal">Active Guests</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
              <PlaneTakeoff className="w-3.5 h-3.5 text-emerald-400" />
              <span>Talent on Excursion</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
              {(fdState.loanedRoster || []).length} <span className="text-xs text-zinc-500 font-normal">Abroad Training</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
            <div className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Global Trophies & Prestige</span>
            </div>
            <div className="text-xl font-bold font-mono text-yellow-300 mt-1">
              +{fdState.totalPrestigeGained || 0} <span className="text-xs text-zinc-500 font-normal">Prestige Gained</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs font-mono overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('treaties')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'treaties'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Global Alliances & Treaties ({partners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exchange')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'exchange'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <PlaneTakeoff className="w-4 h-4" />
          <span>Talent Exchange & Loans ({(fdState.borrowedRoster || []).length + (fdState.loanedRoster || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('supercards')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'supercards'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Forbidden Door Supercards ({(fdState.supercards || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('champions')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'champions'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>International Belts & Roster Scouting</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: GLOBAL PARTNERS & TREATIES                              */}
      {/* ============================================================== */}
      {activeTab === 'treaties' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map(partner => {
              const isPartnerForbiddenDoor = partner.tier === 'The Forbidden Door';
              const isHostile = partner.tier === 'Hostile Rivalry / Invasion';
              const isAlliance = partner.tier === 'Strategic Alliance';
              const isExchange = partner.tier === 'Talent Exchange';

              return (
                <div
                  key={partner.id}
                  className={`rounded-xl bg-zinc-900/90 border p-5 flex flex-col justify-between transition relative overflow-hidden shadow-lg ${
                    isPartnerForbiddenDoor
                      ? 'border-amber-500/70 shadow-amber-500/5'
                      : isHostile
                      ? 'border-rose-500/70 shadow-rose-500/5'
                      : isAlliance
                      ? 'border-sky-500/60'
                      : isExchange
                      ? 'border-emerald-500/50'
                      : 'border-zinc-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          {partner.logoEmoji}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base font-mono">{partner.name}</h3>
                            <span className="text-xs text-zinc-500 font-mono">({partner.shortName})</span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                            <span>{partner.country}</span>
                            <span>•</span>
                            <span className="text-zinc-500">{partner.region}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border ${
                        isPartnerForbiddenDoor
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : isHostile
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isAlliance
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : isExchange
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {partner.tier}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {partner.description}
                    </p>

                    {/* Stats & Diplomatic Thermometer */}
                    <div className="bg-zinc-950/80 rounded-lg p-3 border border-zinc-800 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Promotion Prestige:</span>
                        <span className="text-amber-400 font-bold">{partner.prestige}/100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Wrestling Style:</span>
                        <span className="text-zinc-200 truncate max-w-[150px]">{partner.style}</span>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-zinc-800/60">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">Diplomatic Relations:</span>
                          <span className={`font-bold ${partner.relationshipScore >= 75 ? 'text-emerald-400' : partner.relationshipScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {partner.relationshipScore}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              partner.relationshipScore >= 75 ? 'bg-emerald-500' : partner.relationshipScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${partner.relationshipScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPartnerId(partner.id);
                          setTreatyTargetTier(partner.tier === 'None' ? 'Talent Exchange' : partner.tier);
                          setIsTreatyModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 font-bold text-xs font-mono transition flex items-center gap-1"
                        title="Negotiate Working Agreement"
                      >
                        <Handshake className="w-3.5 h-3.5" />
                        <span>Treaty</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendGoodwill(partner.id)}
                        className="px-2 py-1.5 rounded bg-zinc-800 hover:bg-emerald-600 hover:text-white text-zinc-400 font-bold text-xs font-mono transition flex items-center gap-1"
                        title="Send Goodwill Gift ($20,000 for +15 Relations)"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Gift</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPartnerId(partner.id);
                        setActiveTab('exchange');
                      }}
                      className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 font-bold text-xs font-mono transition flex items-center gap-1 border border-amber-500/40"
                    >
                      <span>Talent</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FOREIGN TALENT EXCHANGE & LOANS                         */}
      {/* ============================================================== */}
      {activeTab === 'exchange' && (
        <div className="space-y-6">
          {/* Active Borrowed Stars on Roster */}
          {(fdState.borrowedRoster || []).length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 font-mono text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Active Forbidden Door Guest Attractions on TV ({fdState.borrowedRoster.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('book_show')}
                  className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition"
                >
                  Book in Tonight's Show →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fdState.borrowedRoster.map(borrowed => (
                  <div key={borrowed.wrestler.id} className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{borrowed.wrestler.name}</div>
                      <div className="text-[11px] text-zinc-400">
                        From: <span className="text-amber-400">{borrowed.partnerName}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Overness: {borrowed.wrestler.overness} • Workrate: {borrowed.wrestler.workrate}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {borrowed.weeksRemaining} Wks Left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Loaned Talent on Excursion */}
          {(fdState.loanedRoster || []).length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 font-mono text-sm flex items-center gap-2">
                  <PlaneTakeoff className="w-4 h-4 text-emerald-400" />
                  <span>Home Talent on Foreign Excursions ({fdState.loanedRoster.length})</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fdState.loanedRoster.map(loan => (
                  <div key={loan.wrestlerId} className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{loan.wrestlerName}</div>
                      <div className="text-[11px] text-zinc-400">
                        At: <span className="text-emerald-400">{loan.partnerName}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Training Focus: <span className="text-zinc-300 uppercase">{loan.targetFocus}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold block">
                        {loan.weeksRemaining} Wks
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRecallTalent(loan)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-rose-950 text-zinc-300 hover:text-rose-300 border border-zinc-700 text-[10px] transition"
                      >
                        Recall Early
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Exchange Console */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Select Partner Promotion */}
            <div className="lg:col-span-1 space-y-3">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                1. Select Partner Promotion:
              </span>
              <div className="space-y-2">
                {partners.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPartnerId(p.id)}
                    className={`w-full p-3 rounded-xl border text-left font-mono transition flex items-center justify-between ${
                      selectedPartner.id === p.id
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/5'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{p.logoEmoji}</span>
                      <div>
                        <div className="font-bold text-sm text-white">{p.name}</div>
                        <div className="text-[11px] text-zinc-500">{p.country} • Tier: {p.tier}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </button>
                ))}
              </div>

              {/* Action Buttons to Launch Loans */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoanModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                >
                  <PlaneTakeoff className="w-4 h-4" />
                  <span>Send Roster Star on Excursion</span>
                </button>
              </div>
            </div>

            {/* Right Column: Browse Available Stars to Borrow */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    2. Borrow Foreign Attraction ({selectedPartner.name}):
                  </span>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Sign international superstars for short-term television programs or marquee PPV dream matches.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-mono font-bold">
                  {selectedPartner.roster.length} Stars Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedPartner.roster.map(star => {
                  const alreadyBorrowed = (fdState.borrowedRoster || []).some(b => b.wrestler.name === star.name);

                  return (
                    <div
                      key={star.id}
                      className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/60 transition space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white text-sm font-mono flex items-center gap-1.5">
                            <span>{star.name}</span>
                            {star.gender === 'Female' && <span className="text-pink-400 text-xs">♀</span>}
                          </div>
                          <div className="text-xs text-amber-400/90 italic font-sans">{star.nickname}</div>
                          <div className="text-[11px] text-zinc-400 font-mono mt-1">
                            {star.style} • {star.alignment} • {star.push}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded bg-zinc-950 text-amber-300 border border-zinc-800 text-xs font-mono font-bold">
                          ★ {star.overness} Over
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-zinc-950/80 p-2 rounded border border-zinc-800/80 text-[11px] font-mono text-center">
                        <div>
                          <span className="text-zinc-500 block text-[9px]">WORKRATE</span>
                          <span className="text-zinc-200 font-bold">{star.workrate}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px]">MIC</span>
                          <span className="text-zinc-200 font-bold">{star.micSkills}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px]">STAMINA</span>
                          <span className="text-zinc-200 font-bold">{star.stamina}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="text-xs font-mono text-emerald-400">
                          ${formatNumber(star.salary * 1.5)}/wk
                        </div>

                        <button
                          type="button"
                          disabled={alreadyBorrowed}
                          onClick={() => {
                            setBorrowWrestlerId(star.id);
                            setIsBorrowModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs font-mono transition flex items-center gap-1"
                        >
                          {alreadyBorrowed ? (
                            <span>Active on Tour</span>
                          ) : (
                            <>
                              <Handshake className="w-3.5 h-3.5" />
                              <span>Borrow Star</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: FORBIDDEN DOOR SUPERCARD CO-PROMOTIONS                  */}
      {/* ============================================================== */}
      {activeTab === 'supercards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Interpromotional Stadium Supercards</span>
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Co-promote massive cross-promotional stadium spectacles with partner federations. Every interpromotional clash impacts your promotional prestige!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSupercardPartnerId(partners[0]?.id || '');
                setSupercardName(`${promotion.shortName} x ${partners[0]?.shortName || 'Global'}: The Forbidden Door`);
                setIsSupercardModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Commission New Supercard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(fdState.supercards || []).map(sc => (
              <div
                key={sc.id}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 transition space-y-4 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/40">
                        Week {sc.scheduledWeek}, {sc.scheduledYear}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        Partner: <strong className="text-white">{sc.partnerName}</strong>
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg font-mono mt-1.5">{sc.name}</h3>
                    <p className="text-xs text-zinc-400 italic font-sans">{sc.theme}</p>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    sc.isCompleted 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  }`}>
                    {sc.isCompleted ? 'Completed' : 'Scheduled'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs font-mono text-center">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">HOST VENUE</span>
                    <span className="text-zinc-200 font-bold truncate block">{sc.venue}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">CAPACITY</span>
                    <span className="text-amber-400 font-bold">{formatNumber(sc.venueCapacity)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">TICKET PRICE</span>
                    <span className="text-emerald-400 font-bold">${sc.ticketPrice}</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-zinc-400 flex items-center justify-between pt-1">
                  <span>Stakes: <strong className="text-zinc-200">{sc.stipulationType}</strong></span>
                  <button
                    type="button"
                    onClick={() => onNavigate('book_show')}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Book Matches on TV</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: GLOBAL CHAMPIONSHIPS & ROSTER SCOUTING                  */}
      {/* ============================================================== */}
      {activeTab === 'champions' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>International Championship Belt Gallery</span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Inspect sacred championship belts held across partner federations around the wrestling globe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.flatMap(p => 
              (p.titles || []).map(t => (
                <div key={t.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {p.logoEmoji} {p.name}
                      </span>
                      <h3 className="font-bold text-white text-sm font-mono mt-1.5">{t.name}</h3>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {t.type} • {t.division}
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/40">
                      ★ {t.prestige}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2">
                    {t.description || 'A sacred international championship contested across the globe.'}
                  </p>

                  <div className="pt-2 border-t border-zinc-800 text-xs font-mono flex items-center justify-between text-zinc-400">
                    <span>Reigning Champions:</span>
                    <strong className="text-amber-300">
                      {t.history && t.history[0] ? t.history[0].holderNames : 'Reigning Titlist'}
                    </strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: NEGOTIATE / SIGN ALLIANCE TREATY                      */}
      {/* ============================================================== */}
      {isTreatyModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedPartner.logoEmoji}</span>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Alliance Treaty: {selectedPartner.name}
                  </h3>
                  <div className="text-[11px] text-zinc-400 font-sans">
                    Current Standing: {selectedPartner.tier} ({selectedPartner.relationshipScore}% Relations)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTreatyModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-zinc-300 font-bold">Select Working Agreement Tier:</label>

              <div className="space-y-2">
                {[
                  {
                    tier: 'Talent Exchange' as AllianceTier,
                    cost: 15000,
                    label: 'Talent Exchange Protocol',
                    desc: 'Borrow foreign guest attractions for television and loan youngsters abroad for development.'
                  },
                  {
                    tier: 'Strategic Alliance' as AllianceTier,
                    cost: 35000,
                    label: 'Strategic Global Alliance',
                    desc: 'Deeper diplomatic ties. Discounts on guest talent loans and joint training facility access.'
                  },
                  {
                    tier: 'The Forbidden Door' as AllianceTier,
                    cost: 60000,
                    label: 'The Forbidden Door (Full Partnership)',
                    desc: 'Pinnacle treaty. Co-promote stadium Supercards, title vs title unifications, and earn +2 Company Prestige.'
                  },
                  {
                    tier: 'Hostile Rivalry / Invasion' as AllianceTier,
                    cost: 10000,
                    label: 'Hostile Promotional War / Invasion Angle',
                    desc: 'Break diplomatic ties and trigger cross-promotional turf warfare for dramatic ratings spikes.'
                  }
                ].map(opt => (
                  <label
                    key={opt.tier}
                    className={`block p-3 rounded-xl border cursor-pointer transition ${
                      treatyTargetTier === opt.tier
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="treatyTier"
                          checked={treatyTargetTier === opt.tier}
                          onChange={() => setTreatyTargetTier(opt.tier)}
                          className="accent-amber-500"
                        />
                        <span className="font-bold text-white text-xs">{opt.label}</span>
                      </div>
                      <span className="text-emerald-400 font-bold">${formatNumber(opt.cost)}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans mt-1 ml-5">{opt.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsTreatyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSignTreaty(selectedPartner.id, treatyTargetTier)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5"
              >
                <Handshake className="w-4 h-4" />
                <span>Ratify Treaty</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: SEND ROSTER STAR ON FOREIGN EXCURSION                */}
      {/* ============================================================== */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlaneTakeoff className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Send Talent on Foreign Excursion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLoanModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Select Superstar to Send Abroad:</label>
                <select
                  value={loanWrestlerId}
                  onChange={e => setLoanWrestlerId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">-- Choose Roster Talent --</option>
                  {promotion.roster
                    .filter(w => !w.isGuestStar && !w.isRetired)
                    .map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} (Age {w.age} • Overness: {w.overness} • Workrate: {w.workrate})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Target Excursion Focus:</label>
                <select
                  value={loanFocus}
                  onChange={e => setLoanFocus(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="workrate">In-Ring Workrate & Stiff Striking</option>
                  <option value="stamina">Stamina & High-Flying Agility</option>
                  <option value="overness">Crowd Charisma & International Reputation</option>
                  <option value="micSkills">Psychology & Gimmick Edge</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Excursion Duration (Weeks):</label>
                <select
                  value={loanWeeks}
                  onChange={e => setLoanWeeks(parseInt(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value={4}>4 Weeks (Short Tour)</option>
                  <option value={8}>8 Weeks (Intensive Excursion)</option>
                  <option value={12}>12 Weeks (Full Foreign Sabbatical)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsLoanModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!loanWrestlerId}
                onClick={() => handleLoanTalent(loanWrestlerId, selectedPartner.id, loanWeeks, loanFocus)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5"
              >
                <PlaneTakeoff className="w-4 h-4" />
                <span>Dispatch on Excursion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: BORROW FOREIGN STAR                                   */}
      {/* ============================================================== */}
      {isBorrowModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            {(() => {
              const star = selectedPartner.roster.find(w => w.id === borrowWrestlerId);
              if (!star) return null;
              const fee = star.salary * borrowWeeks * 1.5;

              return (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Borrow Attraction: {star.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBorrowModalOpen(false)}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Home Promotion:</span>
                      <strong className="text-amber-400">{selectedPartner.name}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Overness / Workrate:</span>
                      <strong className="text-white">{star.overness} / {star.workrate}</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Select Guest Star Tour Length:</label>
                    <select
                      value={borrowWeeks}
                      onChange={e => setBorrowWeeks(parseInt(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value={1}>1 Week (Single Special Appearance)</option>
                      <option value={3}>3 Weeks (Short Storyline Mini-Arc)</option>
                      <option value={6}>6 Weeks (Marquee PPV Feud Cycle)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <span className="text-zinc-300">Total Foreign Loan Fee:</span>
                    <strong className="text-amber-300 font-bold text-sm">${formatNumber(fee)}</strong>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsBorrowModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBorrowTalent(selectedPartner, star, borrowWeeks)}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Guest Loan</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: COMMISSION SUPERCARD                                  */}
      {/* ============================================================== */}
      {isSupercardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Commission Forbidden Door Supercard
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSupercardModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Supercard Event Name:</label>
                <input
                  type="text"
                  value={supercardName}
                  onChange={e => setSupercardName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g. APW x SSPW: The Forbidden Door"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Co-Promoter Partner:</label>
                  <select
                    value={supercardPartnerId}
                    onChange={e => setSupercardPartnerId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  >
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.country})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Scheduled Target Week:</label>
                  <input
                    type="number"
                    min={currentWeek + 1}
                    max={52}
                    value={supercardWeek}
                    onChange={e => setSupercardWeek(parseInt(e.target.value) || currentWeek + 4)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Host Stadium Venue:</label>
                <select
                  value={supercardVenue}
                  onChange={e => {
                    const venue = e.target.value;
                    setSupercardVenue(venue);
                    if (venue.includes('Tokyo Dome')) setSupercardCapacity(55000);
                    else if (venue.includes('Azteca')) setSupercardCapacity(65000);
                    else if (venue.includes('Wembley')) setSupercardCapacity(70000);
                    else setSupercardCapacity(35000);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Tokyo Dome (Super Stadium)">Tokyo Dome (55,000 Capacity) - Japan</option>
                  <option value="Estadio Azteca Super Arena">Estadio Azteca (65,000 Capacity) - Mexico</option>
                  <option value="Wembley Empire Stadium">Wembley Empire Stadium (70,000 Capacity) - UK</option>
                  <option value="Madison Stadium Garden">Madison Stadium Garden (35,000 Capacity) - USA</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Interpromotional Series Stipulation:</label>
                <select
                  value={supercardStipulation}
                  onChange={e => setSupercardStipulation(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Bragging Rights Interpromotional Cup">Bragging Rights Interpromotional Cup (Best of 7 Series)</option>
                  <option value="Champion vs. Champion Unification">Champion vs. Champion Showcase</option>
                  <option value="Winner Take All Unified Supremacy">Winner Take All Unified Supremacy</option>
                  <option value="Promotional Invasion Showdown">Promotional Invasion War (Turf Feud)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsSupercardModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScheduleSupercard}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Sanction Supercard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

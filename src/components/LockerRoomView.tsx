import React, { useState } from 'react';
import { 
  Promotion, 
  Wrestler, 
  LockerRoomIncident, 
  IncidentOption,
  BackstageClique,
  ContractBiddingWar,
  ContractBid,
  WrestlerCourtCase,
  CliqueAgendaType
} from '../types';
import { SAMPLE_INCIDENTS_POOL } from '../data/customDefaults';
import { 
  getDefaultCliquesForPromotion, 
  SAMPLE_WRESTLER_COURT_CASES, 
  generateBiddingWarForWrestler, 
  evaluateWrestlerBiddingDecision 
} from '../data/backstageDefaults';
import { formatNumber, formatCurrency } from '../utils/format';
import { 
  HeartHandshake, 
  AlertTriangle, 
  Flame, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  Smile, 
  Frown, 
  Zap,
  Dice5,
  Gavel,
  Crown,
  Briefcase,
  Scale,
  Award,
  FileSignature,
  Plus,
  Trash2,
  Shield,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Clock,
  Check,
  X
} from 'lucide-react';

interface LockerRoomViewProps {
  promotion: Promotion;
  currentWeek: number;
  onUpdatePromotion: (newPromo: Promotion) => void;
  onBackToMenu: () => void;
}

type LockerRoomTab = 'cliques' | 'bidding_wars' | 'court' | 'culture';

export const LockerRoomView: React.FC<LockerRoomViewProps> = ({
  promotion,
  currentWeek,
  onUpdatePromotion,
  onBackToMenu
}) => {
  const [activeTab, setActiveTab] = useState<LockerRoomTab>('cliques');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4500);
  };

  const roster = promotion.roster || [];
  const avgMorale = Math.round(roster.reduce((sum, w) => sum + (w.morale || 70), 0) / (roster.length || 1));
  const unhappyWrestlers = roster.filter(w => w.morale < 50);
  const leaders = roster.filter(w => w.push === 'Main Eventer' && w.morale >= 80);

  // Initialize Backstage Cliques if empty
  const cliques: BackstageClique[] = (promotion.backstageCliques && promotion.backstageCliques.length > 0)
    ? promotion.backstageCliques
    : getDefaultCliquesForPromotion(promotion);

  // Initialize Active Bidding Wars if empty
  const biddingWars: ContractBiddingWar[] = promotion.activeBiddingWars || [];

  // Initialize Court Cases if empty
  const courtCases: WrestlerCourtCase[] = promotion.wrestlerCourtCases || [];
  const resolvedCourtCases: WrestlerCourtCase[] = promotion.resolvedCourtCases || [];

  // Incidents
  const activeIncidents: LockerRoomIncident[] = (promotion.activeIncidents || []).filter(i => !i.resolved);
  const resolvedIncidents: LockerRoomIncident[] = promotion.resolvedIncidents || [];

  // ----------------------------------------------------
  // MODAL STATES
  // ----------------------------------------------------
  // Counter-Offer Modal State
  const [activeWarForBid, setActiveWarForBid] = useState<ContractBiddingWar | null>(null);
  const [bidSalary, setBidSalary] = useState<number>(6000);
  const [bidBonus, setBidBonus] = useState<number>(30000);
  const [bidWeeks, setBidWeeks] = useState<number>(52);
  const [bidCreativeControl, setBidCreativeControl] = useState<boolean>(false);
  const [bidLimitedSchedule, setBidLimitedSchedule] = useState<boolean>(false);
  const [bidGuaranteedPush, setBidGuaranteedPush] = useState<boolean>(false);
  const [bidMerchRoyalty, setBidMerchRoyalty] = useState<number>(15);

  // New Clique Modal State
  const [showCreateCliqueModal, setShowCreateCliqueModal] = useState(false);
  const [newCliqueName, setNewCliqueName] = useState('');
  const [newCliqueLeaderId, setNewCliqueLeaderId] = useState<string>(roster[0]?.id || '');
  const [newCliqueMemberIds, setNewCliqueMemberIds] = useState<string[]>([]);
  const [newCliqueAgenda, setNewCliqueAgenda] = useState<CliqueAgendaType>('Title Chasers');

  // New Court Case Modal State
  const [showNewCourtModal, setShowNewCourtModal] = useState(false);
  const [courtDefendantId, setCourtDefendantId] = useState<string>(roster[0]?.id || '');
  const [courtPlaintiffId, setCourtPlaintiffId] = useState<string>(roster[1]?.id || '');

  // ----------------------------------------------------
  // ACTIONS: CLIQUES
  // ----------------------------------------------------
  const handleAppeaseClique = (clique: BackstageClique) => {
    if (promotion.budget < 15000) {
      showToast('Insufficient budget ($15,000 required) to grant discretionary perk.');
      return;
    }

    const updatedRoster = roster.map(w => {
      if (clique.memberIds.includes(w.id)) {
        return {
          ...w,
          morale: Math.min(100, w.morale + 12)
        };
      }
      return w;
    });

    const updatedCliques = cliques.map(c => {
      if (c.id === clique.id) {
        return {
          ...c,
          influence: Math.min(100, c.influence + 6),
          currentDemand: c.currentDemand ? { ...c.currentDemand, isSatisfied: true } : undefined
        };
      }
      return c;
    });

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - 15000,
      roster: updatedRoster,
      backstageCliques: updatedCliques
    });

    showToast(`Appeased "${clique.name}" with $15k travel perks! All members gained +12 Morale.`);
  };

  const handleReprimandClique = (clique: BackstageClique) => {
    const updatedRoster = roster.map(w => {
      if (clique.memberIds.includes(w.id)) {
        return {
          ...w,
          morale: Math.max(15, w.morale - 10)
        };
      }
      return w;
    });

    const updatedCliques = cliques.map(c => {
      if (c.id === clique.id) {
        return {
          ...c,
          influence: Math.max(10, c.influence - 18)
        };
      }
      return c;
    });

    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster,
      backstageCliques: updatedCliques
    });

    showToast(`Reprimanded "${clique.name}" for backstage politicking. Political influence curtailed (-18).`);
  };

  const handleCreateNewClique = () => {
    if (!newCliqueName.trim()) {
      showToast('Please enter a clique name.');
      return;
    }
    const allMemberIds = Array.from(new Set([newCliqueLeaderId, ...newCliqueMemberIds])).filter(Boolean);
    if (allMemberIds.length < 2) {
      showToast('A clique must contain at least 2 wrestlers.');
      return;
    }

    const newClique: BackstageClique = {
      id: `clique-${Date.now()}`,
      name: newCliqueName.trim(),
      leaderId: newCliqueLeaderId,
      memberIds: allMemberIds,
      influence: 70,
      solidarity: 80,
      agendaType: newCliqueAgenda,
      reputation: `Newly formed backstage alliance pursuing ${newCliqueAgenda.toLowerCase()}.`
    };

    const updatedCliques = [newClique, ...cliques];
    onUpdatePromotion({
      ...promotion,
      backstageCliques: updatedCliques
    });

    setShowCreateCliqueModal(false);
    setNewCliqueName('');
    showToast(`Formed new backstage coalition "${newClique.name}"!`);
  };

  // ----------------------------------------------------
  // ACTIONS: CONTRACT BIDDING WARS
  // ----------------------------------------------------
  const handleOpenBidModal = (war: ContractBiddingWar) => {
    setActiveWarForBid(war);
    const w = roster.find(r => r.id === war.wrestlerId);
    setBidSalary((w?.salary || 5000) + 1500);
    setBidBonus(25000);
    setBidWeeks(52);
    setBidCreativeControl(false);
    setBidLimitedSchedule(false);
    setBidGuaranteedPush(w?.push === 'Main Eventer');
    setBidMerchRoyalty(15);
  };

  const handleSubmitCounterBid = () => {
    if (!activeWarForBid) return;

    if (promotion.budget < bidBonus) {
      showToast(`Insufficient cash for signing bonus of ${formatCurrency(bidBonus)}!`);
      return;
    }

    const calculatedScore = Math.round(
      (bidSalary * 0.5) +
      (bidBonus * 0.06) +
      (bidCreativeControl ? 45 : 0) +
      (bidLimitedSchedule ? 35 : 0) +
      (bidGuaranteedPush ? 30 : 0) +
      (bidMerchRoyalty * 1.5)
    );

    const playerBid: ContractBid = {
      id: `bid-player-${Date.now()}`,
      bidderType: 'Player',
      bidderName: promotion.name,
      bidderColor: '#10b981',
      weeklySalary: bidSalary,
      signingBonus: bidBonus,
      contractWeeks: bidWeeks,
      perks: {
        creativeControl: bidCreativeControl,
        limitedSchedule: bidLimitedSchedule,
        guaranteedMainEventPush: bidGuaranteedPush,
        merchRoyaltyPct: bidMerchRoyalty,
        signingPerkNote: `${promotion.name} Official Extension: ${formatCurrency(bidSalary)}/wk + ${formatCurrency(bidBonus)} bonus.`
      },
      totalValueScore: calculatedScore,
      submittedWeek: currentWeek
    };

    // Filter out previous player bid if present
    const otherBids = activeWarForBid.bids.filter(b => b.bidderType !== 'Player');
    const updatedBids = [playerBid, ...otherBids];
    const leadingBid = [...updatedBids].sort((a, b) => b.totalValueScore - a.totalValueScore)[0];

    const updatedWars = biddingWars.map(war => {
      if (war.id === activeWarForBid.id) {
        return {
          ...war,
          status: 'Player Countered' as const,
          bids: updatedBids,
          leadingBidderName: leadingBid.bidderName
        };
      }
      return war;
    });

    onUpdatePromotion({
      ...promotion,
      activeBiddingWars: updatedWars
    });

    setActiveWarForBid(null);
    showToast(`Counter-offer submitted to ${activeWarForBid.wrestlerName}! You are currently leading the bidding war.`);
  };

  const handleFinalizeBiddingWar = (war: ContractBiddingWar) => {
    const decision = evaluateWrestlerBiddingDecision(war, promotion);

    if (decision.isPlayerWinner) {
      // Re-sign talent
      const winningBid = decision.winnerBid;
      const updatedRoster = roster.map(w => {
        if (w.id === war.wrestlerId) {
          return {
            ...w,
            salary: winningBid.weeklySalary,
            contractWeeks: (w.contractWeeks || 0) + winningBid.contractWeeks,
            morale: Math.min(100, w.morale + 15),
            creativeControlClause: !!winningBid.perks.creativeControl,
            limitedScheduleClause: !!winningBid.perks.limitedSchedule
          };
        }
        return w;
      });

      const updatedWars = biddingWars.filter(w => w.id !== war.id);
      const updatedResolved = [{ ...war, status: 'Re-Signed' as const, decisionNotes: decision.decisionSummary }, ...(promotion.resolvedBiddingWars || [])];

      onUpdatePromotion({
        ...promotion,
        budget: Math.max(0, promotion.budget - winningBid.signingBonus),
        roster: updatedRoster,
        activeBiddingWars: updatedWars,
        resolvedBiddingWars: updatedResolved
      });

      showToast(`🎉 RE-SIGNED! ${decision.decisionSummary}`);
    } else {
      // Talent defects to rival!
      const updatedRoster = roster.filter(w => w.id !== war.wrestlerId);
      const updatedWars = biddingWars.filter(w => w.id !== war.id);
      const updatedResolved = [{ ...war, status: 'Defected' as const, decisionNotes: decision.decisionSummary }, ...(promotion.resolvedBiddingWars || [])];

      onUpdatePromotion({
        ...promotion,
        roster: updatedRoster,
        activeBiddingWars: updatedWars,
        resolvedBiddingWars: updatedResolved
      });

      showToast(`🚨 DEFECTION: ${decision.decisionSummary}`);
    }
  };

  // Trigger Bidding War for expiring star
  const handleTriggerBiddingWarForStar = (w: Wrestler) => {
    const existing = biddingWars.find(bw => bw.wrestlerId === w.id);
    if (existing) {
      showToast(`${w.name} is already locked in a bidding war.`);
      return;
    }

    const newWar = generateBiddingWarForWrestler(w, currentWeek, promotion);
    onUpdatePromotion({
      ...promotion,
      activeBiddingWars: [newWar, ...biddingWars]
    });
    showToast(`Bidding war opened for ${w.name}! Rival promotions have entered the fray.`);
  };

  // ----------------------------------------------------
  // ACTIONS: WRESTLER'S COURT
  // ----------------------------------------------------
  const handleOpenSummonCourt = () => {
    if (roster.length < 3) {
      showToast('Not enough wrestlers to convene Wrestler’s Court.');
      return;
    }
    const shuffled = [...roster].sort(() => 0.5 - Math.random());
    setCourtDefendantId(shuffled[0].id);
    setCourtPlaintiffId(shuffled[1].id);
    setShowNewCourtModal(true);
  };

  const handleSummonCourtCase = () => {
    const def = roster.find(w => w.id === courtDefendantId);
    const pla = roster.find(w => w.id === courtPlaintiffId);
    if (!def || !pla || def.id === pla.id) {
      showToast('Select two different wrestlers for defendant and plaintiff.');
      return;
    }

    // Elected judge: Highest overness veteran
    const judge = [...roster].filter(w => w.id !== def.id && w.id !== pla.id).sort((a, b) => (b.age + b.overness) - (a.age + a.overness))[0] || roster[2];

    const template = SAMPLE_WRESTLER_COURT_CASES[Math.floor(Math.random() * SAMPLE_WRESTLER_COURT_CASES.length)];

    const newCase: WrestlerCourtCase = {
      id: `court-${Date.now()}`,
      week: currentWeek,
      title: template.title,
      defendantId: def.id,
      plaintiffId: pla.id,
      judgeId: judge.id,
      charge: template.charge,
      plea: template.plea,
      sentencingOptions: template.sentencingOptions,
      resolved: false
    };

    onUpdatePromotion({
      ...promotion,
      wrestlerCourtCases: [newCase, ...courtCases]
    });

    setShowNewCourtModal(false);
    showToast(`Wrestler’s Court convened: ${pla.name} brings charges against ${def.name}!`);
  };

  const handleExecuteSentence = (courtCase: WrestlerCourtCase, sentenceId: string) => {
    const sentence = courtCase.sentencingOptions.find(s => s.id === sentenceId);
    if (!sentence) return;

    if (sentence.cost > 0 && promotion.budget < sentence.cost) {
      showToast(`Insufficient promotion budget (${formatCurrency(sentence.cost)} needed) to pay court tab.`);
      return;
    }

    // Apply morale to defendant and plaintiff
    const updatedRoster = roster.map(w => {
      if (w.id === courtCase.defendantId) {
        return {
          ...w,
          morale: Math.max(20, Math.min(100, w.morale - 4))
        };
      }
      if (w.id === courtCase.plaintiffId) {
        return {
          ...w,
          morale: Math.min(100, w.morale + 10)
        };
      }
      return w;
    });

    const resolvedCase: WrestlerCourtCase = {
      ...courtCase,
      resolved: true,
      verdict: 'Guilty',
      chosenSentenceId: sentence.id
    };

    const remainingCases = courtCases.filter(c => c.id !== courtCase.id);
    const updatedResolved = [resolvedCase, ...resolvedCourtCases];

    onUpdatePromotion({
      ...promotion,
      budget: Math.max(0, promotion.budget - sentence.cost),
      roster: updatedRoster,
      wrestlerCourtCases: remainingCases,
      resolvedCourtCases: updatedResolved
    });

    showToast(`Sentence handed down: "${sentence.name}". ${sentence.moraleEffect}`);
  };

  // ----------------------------------------------------
  // ACTIONS: CULTURE & INCIDENTS
  // ----------------------------------------------------
  const handleChangeCulture = (rule: Promotion['lockerRoomRule']) => {
    onUpdatePromotion({
      ...promotion,
      lockerRoomRule: rule
    });
    showToast(`Locker room governance shifted to: ${rule}`);
  };

  const handleDeliverPepTalk = () => {
    const updatedRoster = roster.map(w => ({
      ...w,
      morale: Math.min(100, w.morale + 4)
    }));
    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster
    });
    showToast('Delivered an electrifying speech to the locker room! Morale +4 across the roster.');
  };

  const handleDistributeBonuses = () => {
    if (promotion.budget < 25000) {
      showToast('Insufficient funds ($25,000 required) to disburse bonuses.');
      return;
    }
    const updatedRoster = roster.map(w => ({
      ...w,
      morale: Math.min(100, w.morale + 9)
    }));
    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - 25000,
      roster: updatedRoster
    });
    showToast('Disbursed $25,000 in locker room bonuses! Morale surged (+9).');
  };

  const handleResolveIncident = (incident: LockerRoomIncident, option: IncidentOption) => {
    let updatedRoster = [...promotion.roster];

    updatedRoster = updatedRoster.map(w => {
      if (incident.involvedWrestlerIds.includes(w.id)) {
        return {
          ...w,
          morale: Math.max(10, Math.min(100, w.morale + option.moraleDelta)),
          overness: Math.max(10, Math.min(100, w.overness + (option.overnessDelta || 0)))
        };
      }
      return w;
    });

    const updatedBudget = Math.max(0, promotion.budget - option.budgetCost);
    const updatedNetwork = Math.min(100, Math.max(10, (promotion.networkSatisfaction || 70) + (option.networkDelta || 0)));

    const resolvedInc: LockerRoomIncident = {
      ...incident,
      resolved: true,
      chosenOptionId: option.id
    };

    const remainingActive = (promotion.activeIncidents || []).filter(i => i.id !== incident.id);
    const newResolved = [resolvedInc, ...(promotion.resolvedIncidents || [])];

    onUpdatePromotion({
      ...promotion,
      budget: updatedBudget,
      networkSatisfaction: updatedNetwork,
      roster: updatedRoster,
      activeIncidents: remainingActive,
      resolvedIncidents: newResolved
    });

    showToast(`Decision executed: ${option.consequenceText}`);
  };

  const handleTriggerRandomIncident = () => {
    if (roster.length < 2) return;
    const randomTemplate = SAMPLE_INCIDENTS_POOL[Math.floor(Math.random() * SAMPLE_INCIDENTS_POOL.length)];
    const shuffled = [...roster].sort(() => 0.5 - Math.random());
    const involvedIds = [shuffled[0].id, shuffled[1].id];

    const newInc: LockerRoomIncident = {
      id: `incident-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      week: currentWeek,
      title: randomTemplate.title,
      description: randomTemplate.description
        .replace('Two top stars', `${shuffled[0].name} and ${shuffled[1].name}`)
        .replace('A key midcarder', shuffled[0].name)
        .replace('A respected veteran', shuffled[0].name),
      involvedWrestlerIds: involvedIds,
      severity: randomTemplate.severity,
      resolved: false,
      options: randomTemplate.options
    };

    onUpdatePromotion({
      ...promotion,
      activeIncidents: [newInc, ...(promotion.activeIncidents || [])]
    });
    showToast(`Backstage incident erupted: "${newInc.title}"!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Executive Locker Room Suite • Week {currentWeek}</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            <span>Backstage Politics, Cliques & Contract Wars</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Manage fragile wrestling egos, mediate backstage cliques, convene Wrestler's Court, and fight off rival promotions in high-stakes contract bidding wars.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToMenu}
            className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Status Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Locker Room Morale</div>
            <div className={`text-xl font-bold mt-1 ${avgMorale >= 75 ? 'text-emerald-400' : avgMorale >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
              {avgMorale}% Avg
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            {avgMorale >= 75 ? <Smile className="w-4 h-4 text-emerald-400" /> : <Frown className="w-4 h-4 text-rose-400" />}
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Cliques</div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {cliques.length} Coalitions
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            <Users className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Bidding Wars</div>
            <div className={`text-xl font-bold mt-1 ${biddingWars.length > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {biddingWars.length} Expiring
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-rose-400" />
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Wrestler's Court</div>
            <div className="text-xl font-bold text-sky-400 mt-1">
              {courtCases.length} Cases
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            <Gavel className="w-4 h-4 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('cliques')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'cliques'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Backstage Cliques & Influence ({cliques.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bidding_wars')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'bidding_wars'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Contract Bidding Wars ({biddingWars.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('court')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'court'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Wrestler's Court & Disputes ({courtCases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('culture')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'culture'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Culture & Incidents ({activeIncidents.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: BACKSTAGE CLIQUES & INFLUENCE */}
      {/* ============================================================ */}
      {activeTab === 'cliques' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Locker Room Power Blocs & Cliques</span>
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Superstars form backstage cabals that lobby for title shots, protect their friends from clean pinfalls, and demand creative control.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewCliqueName('');
                setNewCliqueMemberIds([roster[1]?.id || '']);
                setShowCreateCliqueModal(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Form Backstage Coalition</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cliques.map(clique => {
              const leader = roster.find(w => w.id === clique.leaderId);
              const members = roster.filter(w => clique.memberIds.includes(w.id));

              return (
                <div 
                  key={clique.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm hover:border-zinc-700 transition"
                >
                  <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400 mb-0.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{clique.agendaType}</span>
                        <span>•</span>
                        <span>{members.length} Superstars</span>
                      </div>
                      <h4 className="text-lg font-bold text-white font-mono">{clique.name}</h4>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Backstage Power</div>
                      <div className={`text-lg font-bold font-mono ${
                        clique.influence >= 80 ? 'text-rose-400' : clique.influence >= 60 ? 'text-amber-400' : 'text-zinc-300'
                      }`}>
                        {clique.influence}/100
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {clique.reputation}
                  </p>

                  {/* Leader and Members Showcase */}
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Clique Leader:</span>
                      <strong className="text-amber-300">{leader ? leader.name : 'Unknown Leader'}</strong>
                    </div>

                    <div className="pt-1 border-t border-zinc-900 flex flex-wrap gap-1.5">
                      {members.map(m => (
                        <span 
                          key={m.id}
                          className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]"
                        >
                          {m.name} ({m.push})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Active Demands */}
                  {clique.currentDemand && (
                    <div className={`p-3 rounded-lg border text-xs font-mono space-y-1.5 ${
                      clique.currentDemand.isSatisfied
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                    }`}>
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>POLITICAL DEMAND:</span>
                        </span>
                        <span>{clique.currentDemand.isSatisfied ? 'SATISFIED' : 'PENDING'}</span>
                      </div>
                      <p className="text-zinc-300 font-sans text-xs">
                        {clique.currentDemand.description}
                      </p>
                      <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                        Consequence: {clique.currentDemand.penaltyText}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => handleAppeaseClique(clique)}
                      className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-emerald-900/40 text-emerald-300 border border-zinc-700 hover:border-emerald-500/40 transition"
                      title="Grant perks and concessions to boost morale"
                    >
                      Appease ($15k)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReprimandClique(clique)}
                      className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-rose-900/40 text-rose-300 border border-zinc-700 hover:border-rose-500/40 transition"
                      title="Curtain political power at the cost of morale"
                    >
                      Reprimand
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: CONTRACT BIDDING WARS & POACHING */}
      {/* ============================================================ */}
      {activeTab === 'bidding_wars' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-rose-400" />
                  <span>Free Agency Warfare & Impending Expirations</span>
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Rival federations and international promotions will submit aggressive offers for your expiring superstars. Counter-offer with bonuses, creative control, and salary perks to protect your roster.
                </p>
              </div>
            </div>
          </div>

          {/* Active Bidding Wars Floor */}
          {biddingWars.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs bg-zinc-900 rounded-xl border border-zinc-800">
              No active bidding wars currently underway. Review expiring contracts below to initiate preemptive extension talks!
            </div>
          ) : (
            <div className="space-y-4">
              {biddingWars.map(war => {
                const wrestler = roster.find(w => w.id === war.wrestlerId);
                const playerBid = war.bids.find(b => b.bidderType === 'Player');
                const highestRivalBid = war.bids.filter(b => b.bidderType !== 'Player').sort((a, b) => b.totalValueScore - a.totalValueScore)[0];

                return (
                  <div
                    key={war.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-0.5">
                          <Flame className="w-3.5 h-3.5" />
                          <span>CONTRACT HOLD-OUT • Priority: {war.wrestlerPriority}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-mono">{war.wrestlerName}</h4>
                        <div className="text-xs font-mono text-zinc-400 mt-0.5">
                          Current Pay: {formatCurrency(war.currentSalary)}/week • Overness: {war.startingOverness}/100
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenBidModal(war)}
                          className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow"
                        >
                          <FileSignature className="w-4 h-4" />
                          <span>Submit Counter-Offer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFinalizeBiddingWar(war)}
                          className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition border border-zinc-700"
                        >
                          Conclude Decision
                        </button>
                      </div>
                    </div>

                    {/* Bids Breakdown Table */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Submitted Competing Offers:</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {war.bids.map(bid => {
                          const isLeading = bid.bidderName === war.leadingBidderName;
                          return (
                            <div 
                              key={bid.id}
                              className={`p-3.5 rounded-lg border text-xs font-mono flex flex-col justify-between ${
                                isLeading 
                                  ? 'bg-amber-950/20 border-amber-500/60 text-amber-200' 
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-white text-xs">{bid.bidderName}</span>
                                  {isLeading && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-bold">
                                      LEADING
                                    </span>
                                  )}
                                </div>
                                <div className="text-base font-bold text-emerald-400 mt-1">
                                  {formatCurrency(bid.weeklySalary)}<span className="text-[10px] text-zinc-500">/wk</span>
                                </div>
                                <div className="text-[11px] text-zinc-400 mt-0.5">
                                  Bonus: {formatCurrency(bid.signingBonus)} • {bid.contractWeeks} Weeks
                                </div>
                                {bid.perks.signingPerkNote && (
                                  <div className="text-[10px] text-zinc-400 font-sans mt-2 pt-1 border-t border-zinc-800/60 leading-relaxed">
                                    {bid.perks.signingPerkNote}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Expiring Contracts Watchlist */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h4 className="font-mono font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Impending Contract Expirations (Roster Watchlist)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {roster
                .filter(w => (w.contractWeeks || 52) <= 12)
                .sort((a, b) => (a.contractWeeks || 52) - (b.contractWeeks || 52))
                .map(w => (
                  <div 
                    key={w.id}
                    className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-white">{w.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {w.contractWeeks || 0} weeks left • {formatCurrency(w.salary || 4000)}/wk
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTriggerBiddingWarForStar(w)}
                      className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono transition"
                    >
                      Initiate Talks
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: WRESTLER'S COURT & DISPUTES */}
      {/* ============================================================ */}
      {activeTab === 'court' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Gavel className="w-4 h-4 text-sky-400" />
                <span>The Honorable Wrestler's Court</span>
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                A sacred locker room tradition. Settle backstage transgressions, travel etiquette violations, and finisher disputes before an elected veteran judge.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenSummonCourt}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Convene New Hearing</span>
            </button>
          </div>

          {courtCases.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs bg-zinc-900 rounded-xl border border-zinc-800">
              No active grievances pending. Click "Convene New Hearing" above to bring a dispute before the judge!
            </div>
          ) : (
            <div className="space-y-4">
              {courtCases.map(c => {
                const def = roster.find(w => w.id === c.defendantId);
                const pla = roster.find(w => w.id === c.plaintiffId);
                const judge = roster.find(w => w.id === c.judgeId);

                return (
                  <div 
                    key={c.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-0.5">
                          <Scale className="w-3.5 h-3.5" />
                          <span>COURT DOCKET: Week {c.week} • Presided by Judge {judge?.name || 'Senior Veteran'}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white font-mono">{c.title}</h4>
                      </div>

                      <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-mono text-xs border border-zinc-700">
                        Plea: {c.plea}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 uppercase block">Accuser / Plaintiff:</span>
                        <strong className="text-white text-sm mt-0.5 block">{pla?.name}</strong>
                      </div>
                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-500 uppercase block">Accused / Defendant:</span>
                        <strong className="text-rose-400 text-sm mt-0.5 block">{def?.name}</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Formal Charge:</span>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {c.charge}
                      </p>
                    </div>

                    {/* Sentencing Decisions */}
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                        Deliver Judicial Sentence:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {c.sentencingOptions.map(sent => (
                          <button
                            key={sent.id}
                            type="button"
                            onClick={() => handleExecuteSentence(c, sent.id)}
                            className="p-3 rounded-lg bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-sky-500/60 text-left transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="font-bold text-sky-400 text-xs font-mono">{sent.name}</div>
                              <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">
                                {sent.description}
                              </p>
                            </div>
                            <div className="text-[10px] font-mono text-emerald-400 mt-2 pt-2 border-t border-zinc-900">
                              Cost: {formatCurrency(sent.cost)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: CULTURE & INCIDENTS */}
      {/* ============================================================ */}
      {activeTab === 'culture' && (
        <div className="space-y-6">
          {/* Locker Room Governance Rule */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Locker Room Culture & Governance Standard</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              {[
                { rule: 'Strict Discipline', desc: 'Zero tolerance for egos or late arrivals. Lower incident risk.' },
                { rule: 'Balanced Professionalism', desc: 'Standard sports management. High average morale balance.' },
                { rule: 'Creative Freedom', desc: 'Wrestlers control their promos. Higher heat, slightly more friction.' },
                { rule: 'Wild West', desc: 'Anything goes. High unpredictability and massive feud heat spikes.' }
              ].map(item => (
                <button
                  key={item.rule}
                  type="button"
                  onClick={() => handleChangeCulture(item.rule as any)}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                    promotion.lockerRoomRule === item.rule
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{item.rule}</div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Pre-Show Booker Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleDeliverPepTalk}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Deliver Pre-Show Pep Talk</span>
              </button>

              <button
                type="button"
                onClick={handleDistributeBonuses}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Distribute Bonuses ($25,000)</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerRandomIncident}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition ml-auto"
              >
                <Dice5 className="w-3.5 h-3.5 text-amber-400" />
                <span>Trigger Random Incident</span>
              </button>
            </div>
          </div>

          {/* Active Incidents */}
          <div className="space-y-4">
            <h4 className="font-mono font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Pending Locker Room Incidents ({activeIncidents.length})</span>
            </h4>

            {activeIncidents.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs bg-zinc-900 rounded-xl border border-zinc-800">
                Locker room is currently tranquil. No active disciplinary incidents pending.
              </div>
            ) : (
              <div className="space-y-3">
                {activeIncidents.map(inc => (
                  <div key={inc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-mono">
                      <span className="font-bold text-white text-sm">{inc.title}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">{inc.severity} Severity</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">{inc.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                      {inc.options.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleResolveIncident(inc, opt)}
                          className="p-2.5 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/60 text-left transition text-xs font-mono"
                        >
                          <div className="font-bold text-amber-400">{opt.text}</div>
                          <div className="text-[10px] text-zinc-400 mt-1 font-sans">{opt.consequenceText}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SUBMIT COUNTER-OFFER */}
      {/* ============================================================ */}
      {activeWarForBid && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-amber-400" />
                  <span>Contract Extension Negotiation</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Superstar: <strong className="text-amber-300 font-mono">{activeWarForBid.wrestlerName}</strong> • Motivation: {activeWarForBid.wrestlerPriority}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveWarForBid(null)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400">Weekly Salary Offer: {formatCurrency(bidSalary)}</label>
                  <span className="text-zinc-500">Current: {formatCurrency(activeWarForBid.currentSalary)}</span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={35000}
                  step={500}
                  value={bidSalary}
                  onChange={e => setBidSalary(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400">Guaranteed Upfront Signing Bonus: {formatCurrency(bidBonus)}</label>
                  <span className="text-zinc-500">Cash: {formatCurrency(promotion.budget)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={150000}
                  step={5000}
                  value={bidBonus}
                  onChange={e => setBidBonus(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Contract Duration</label>
                  <select
                    value={bidWeeks}
                    onChange={e => setBidWeeks(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-sans"
                  >
                    <option value={26}>26 Weeks (6 Months)</option>
                    <option value={52}>52 Weeks (1 Year)</option>
                    <option value={104}>104 Weeks (2 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Merchandise Royalty</label>
                  <select
                    value={bidMerchRoyalty}
                    onChange={e => setBidMerchRoyalty(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-sans"
                  >
                    <option value={10}>10% Standard</option>
                    <option value={15}>15% Generous</option>
                    <option value={25}>25% Superstar Royalty</option>
                  </select>
                </div>
              </div>

              {/* Special Clauses */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-zinc-400 block">Negotiable Perks & Special Clauses:</span>
                <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bidCreativeControl}
                    onChange={e => setBidCreativeControl(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>🛡️ Creative Control Clause (Talent can veto finishes)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bidLimitedSchedule}
                    onChange={e => setBidLimitedSchedule(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>🏖️ Limited Schedule (Reduced fatigue, no house shows)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded bg-zinc-950 border border-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bidGuaranteedPush}
                    onChange={e => setBidGuaranteedPush(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>👑 Guaranteed Main Event Push Guarantee</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveWarForBid(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitCounterBid}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition shadow"
              >
                Submit Official Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: FORM NEW COALITION */}
      {/* ============================================================ */}
      {showCreateCliqueModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Establish Backstage Clique</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateCliqueModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Coalition Name</label>
              <input
                type="text"
                value={newCliqueName}
                onChange={e => setNewCliqueName(e.target.value)}
                placeholder="e.g. The Wolfpack, The Enforcers, The Mat Purists..."
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Locker Room Leader</label>
              <select
                value={newCliqueLeaderId}
                onChange={e => setNewCliqueLeaderId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                {roster.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.push}, Overness: {w.overness})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Political Agenda & Philosophy</label>
              <select
                value={newCliqueAgenda}
                onChange={e => setNewCliqueAgenda(e.target.value as CliqueAgendaType)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                <option value="Title Chasers">Title Chasers (Relentlessly lobby for championship gold)</option>
                <option value="Creative Autonomy">Creative Autonomy (Demand finish control & high match times)</option>
                <option value="Veterans Gatekeepers">Veterans Gatekeepers (Enforce tradition, test young talent)</option>
                <option value="Company Loyalists">Company Loyalists (Boost locker room harmony & morale)</option>
                <option value="Money & Merch Syndicate">Money & Merch Syndicate (Lobby for top compensation & bonuses)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCreateCliqueModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewClique}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition shadow"
              >
                Found Clique
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONVENE WRESTLER'S COURT */}
      {/* ============================================================ */}
      {showNewCourtModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Gavel className="w-5 h-5 text-sky-400" />
                <span>Convene Wrestler’s Court</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewCourtModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Accuser / Plaintiff</label>
              <select
                value={courtPlaintiffId}
                onChange={e => setCourtPlaintiffId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                {roster.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.alignment}, Overness: {w.overness})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Accused / Defendant</label>
              <select
                value={courtDefendantId}
                onChange={e => setCourtDefendantId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1.5 text-xs font-sans focus:outline-none focus:border-amber-500"
              >
                {roster.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.alignment}, Overness: {w.overness})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowNewCourtModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSummonCourtCase}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs transition shadow"
              >
                Summon to Court
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

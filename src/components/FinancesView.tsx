import React, { useState } from 'react';
import { 
  Promotion, 
  FinancialReport, 
  TelevisionNetworkDeal, 
  AdRevenueTier, 
  AvailableNetworkOffer,
  NetworkDemand
} from '../types';
import { MarkdownTableView } from './MarkdownTableView';
import { 
  DollarSign, 
  Tv, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ChevronLeft,
  Calendar,
  Award,
  Flame,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Handshake,
  ArrowRight,
  RefreshCw,
  Clock,
  Target,
  Radio,
  Building2,
  X,
  BadgePercent
} from 'lucide-react';
import { formatNumber } from '../utils/format';
import { 
  getDefaultTelevisionDeal, 
  AVAILABLE_NETWORKS, 
  AD_REVENUE_TIERS_CONFIG, 
  evaluateContractNegotiation, 
  NegotiationResult 
} from '../data/televisionDealsDefaults';

interface FinancesViewProps {
  promotion: Promotion;
  financialHistory: FinancialReport[];
  onUpdatePromotion: (newPromotion: Promotion) => void;
  onBackToMenu: () => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  promotion,
  financialHistory,
  onUpdatePromotion,
  onBackToMenu
}) => {
  const [activeTab, setActiveTab] = useState<'tv_deals' | 'ledger'>('tv_deals');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Television Deal state
  const tvDeal: TelevisionNetworkDeal = promotion.tvDeal || getDefaultTelevisionDeal(promotion);
  
  // Negotiation Modal State
  const [isNegotiateModalOpen, setIsNegotiateModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<AvailableNetworkOffer>(AVAILABLE_NETWORKS[0]);
  const [proposedWeeks, setProposedWeeks] = useState<number>(24);
  const [proposedRightsFee, setProposedRightsFee] = useState<number>(AVAILABLE_NETWORKS[0].baseWeeklyRightsFee);
  const [proposedRatingTarget, setProposedRatingTarget] = useState<number>(AVAILABLE_NETWORKS[0].minRatingTarget);
  const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null);

  // Petition Mandate Modal State
  const [isPetitionModalOpen, setIsPetitionModalOpen] = useState(false);
  const [selectedDemandToSwap, setSelectedDemandToSwap] = useState<NetworkDemand | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const latestReport = financialHistory[financialHistory.length - 1];
  const totalRosterPayroll = promotion.roster.reduce((sum, w) => sum + w.salary, 0);

  // Calculate recent average rating
  const recentReports = financialHistory.slice(-4);
  const recentAverageRating = recentReports.length > 0
    ? recentReports.reduce((sum, r) => sum + (r.tvRevenue ? 70 : 65), 0) / recentReports.length
    : promotion.minNetworkRating || 68;

  // Ad calculations
  const adConfig = AD_REVENUE_TIERS_CONFIG[tvDeal.adRevenueTier] || AD_REVENUE_TIERS_CONFIG['Standard Ad Load'];
  const estimatedAdRevenue = Math.round((promotion.fanbase || 50000) * 0.45 * (1.5 / 2.0) * adConfig.multiplier);
  const totalProjectedWeeklyTvCash = tvDeal.weeklyRightsFee + estimatedAdRevenue;

  // Handle changing Ad Revenue Tier
  const handleSelectAdTier = (tier: AdRevenueTier) => {
    const updatedDeal: TelevisionNetworkDeal = {
      ...tvDeal,
      adRevenueTier: tier
    };
    onUpdatePromotion({
      ...promotion,
      tvDeal: updatedDeal
    });
    showToast(`Ad Revenue Strategy updated to: ${tier} (${AD_REVENUE_TIERS_CONFIG[tier].tagline})`);
  };

  // Open negotiation modal for specific network
  const handleOpenNegotiation = (network?: AvailableNetworkOffer) => {
    const net = network || AVAILABLE_NETWORKS.find(n => n.id === tvDeal.networkId) || AVAILABLE_NETWORKS[0];
    setSelectedNetwork(net);
    setProposedWeeks(net.suggestedContractWeeks[1] || net.suggestedContractWeeks[0] || 24);
    setProposedRightsFee(net.baseWeeklyRightsFee);
    setProposedRatingTarget(net.minRatingTarget);
    setNegotiationResult(null);
    setIsNegotiateModalOpen(true);
  };

  // Submit contract proposal to executives
  const handleSubmitProposal = () => {
    const result = evaluateContractNegotiation(
      selectedNetwork,
      proposedRightsFee,
      proposedWeeks,
      proposedRatingTarget,
      promotion,
      recentAverageRating
    );
    setNegotiationResult(result);
  };

  // Accept accepted deal or counter-offer
  const handleSignContract = (feeToSign: number, weeksToSign: number, targetToSign: number) => {
    const newDeal: TelevisionNetworkDeal = {
      networkId: selectedNetwork.id,
      networkName: selectedNetwork.name,
      tier: selectedNetwork.tier,
      broadcastSlot: selectedNetwork.preferredSlot,
      weeklyRightsFee: feeToSign,
      contractWeeksTotal: weeksToSign,
      contractWeeksRemaining: weeksToSign,
      minRatingTarget: targetToSign,
      penaltyPerRatingMiss: 3000,
      adRevenueTier: tvDeal.adRevenueTier || 'Standard Ad Load',
      networkDemands: selectedNetwork.demands.map(d => ({ ...d })),
      demandsComplianceHistory: tvDeal.demandsComplianceHistory || [],
      negotiationStatus: 'Active'
    };

    onUpdatePromotion({
      ...promotion,
      tvDeal: newDeal,
      tvNetwork: selectedNetwork.name,
      minNetworkRating: targetToSign
    });

    setIsNegotiateModalOpen(false);
    showToast(`BROADCAST CONTRACT SIGNED: ${selectedNetwork.name} locked in for ${weeksToSign} weeks at $${feeToSign.toLocaleString()}/week!`);
  };

  // Buy out / terminate contract early
  const handleEarlyTermination = () => {
    const penalty = Math.round(tvDeal.weeklyRightsFee * 1.5);
    if (promotion.budget < penalty) {
      showToast(`Cannot terminate contract: Requires $${penalty.toLocaleString()} buyout capital.`);
      return;
    }

    const syndicationDeal: TelevisionNetworkDeal = {
      networkId: 'metro-public-access',
      networkName: 'Metro Public Access (Interim Syndication)',
      tier: 'Local / Public Access',
      broadcastSlot: 'Tuesday Late Night (11:30 PM)',
      weeklyRightsFee: 18000,
      contractWeeksTotal: 12,
      contractWeeksRemaining: 12,
      minRatingTarget: 45,
      penaltyPerRatingMiss: 1000,
      adRevenueTier: 'Standard Ad Load',
      networkDemands: [
        {
          id: 'metro-demand-youth',
          type: 'youth_movement',
          title: 'Local Rookie Showcase',
          description: 'Book at least 1 wrestler aged 28 or under on the show.',
          targetValue: 1,
          ratingBonus: 2,
          ratingPenalty: 2,
          satisfactionImpact: 2
        }
      ],
      demandsComplianceHistory: [],
      negotiationStatus: 'Active'
    };

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - penalty,
      tvDeal: syndicationDeal,
      tvNetwork: syndicationDeal.networkName,
      minNetworkRating: 45,
      networkSatisfaction: 70
    });

    showToast(`Contract terminated early! Paid $${penalty.toLocaleString()} severance buyout fee.`);
  };

  // Petition to swap demand
  const handleExecuteDemandSwap = (replacementDemand: NetworkDemand) => {
    if (!selectedDemandToSwap) return;
    const goodwillCost = 25000;
    if (promotion.budget < goodwillCost) {
      showToast('Insufficient funds for executive petition fee ($25,000 required).');
      return;
    }

    const updatedDemands = tvDeal.networkDemands.map(d => 
      d.id === selectedDemandToSwap.id ? replacementDemand : d
    );

    const updatedDeal: TelevisionNetworkDeal = {
      ...tvDeal,
      networkDemands: updatedDemands
    };

    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - goodwillCost,
      tvDeal: updatedDeal
    });

    setIsPetitionModalOpen(false);
    setSelectedDemandToSwap(null);
    showToast(`Broadcaster approved demand swap to: "${replacementDemand.title}"!`);
  };

  // Production quality tier upgrade/downgrade
  const handleSetProductionTier = (tier: Promotion['productionTier'], cost: number) => {
    onUpdatePromotion({
      ...promotion,
      productionTier: tier,
      productionCostWeekly: cost
    });
    showToast(`Production tier updated to: ${tier} ($${cost.toLocaleString()}/wk)`);
  };

  // Build Markdown table of recent Financial Balance Sheets
  let balanceSheetMarkdown = `| Week | TV Rights Rev | TV Ad Inflow | Ticket Gate | Merch Sales | Total Inflow | Payroll Expense | Production | Net Profit/Loss | Ending Capital |
|---|---|---|---|---|---|---|---|---|---|
`;
  if (financialHistory.length === 0) {
    const estimatedTv = totalProjectedWeeklyTvCash;
    const estimatedGate = Math.round((promotion.fanbase || 50000) * 0.12 * 42);
    const estimatedMerch = Math.round((promotion.fanbase || 50000) * 0.12 * 7);
    const estimatedInflow = estimatedTv + estimatedGate + estimatedMerch;
    const estimatedExpenses = totalRosterPayroll + (promotion.productionCostWeekly || 25000) + 12000;
    const estimatedNet = estimatedInflow - estimatedExpenses;

    balanceSheetMarkdown += `| Projected | $${formatNumber(tvDeal.weeklyRightsFee)} | $${formatNumber(estimatedAdRevenue)} | $${formatNumber(estimatedGate)} | $${formatNumber(estimatedMerch)} | $${formatNumber(estimatedInflow)} | $${formatNumber(totalRosterPayroll)} | $${formatNumber(promotion.productionCostWeekly)} | ${estimatedNet >= 0 ? '+' : ''}$${formatNumber(estimatedNet)} | $${formatNumber(promotion.budget)} |\n`;
  } else {
    financialHistory.slice(-5).forEach(f => {
      const rightsRev = f.tvRightsFee || Math.round(f.tvRevenue * 0.7);
      const adRev = f.tvAdRevenue || Math.round(f.tvRevenue * 0.3);
      const totalRev = (f.tvRevenue || 0) + (f.ticketSales || 0) + (f.merchSales || 0);
      const netVal = f.netProfit || 0;
      const netStr = netVal >= 0 ? `+$${formatNumber(netVal)}` : `-$${formatNumber(Math.abs(netVal))}`;
      balanceSheetMarkdown += `| Wk ${f.week} | $${formatNumber(rightsRev)} | $${formatNumber(adRev)} | $${formatNumber(f.ticketSales)} | $${formatNumber(f.merchSales)} | $${formatNumber(totalRev)} | $${formatNumber(f.wrestlerPayroll)} | $${formatNumber(f.productionCost)} | ${netStr} | $${formatNumber(f.endingBalance)} |\n`;
    });
  }

  const contractElapsed = (tvDeal.contractWeeksTotal || 24) - (tvDeal.contractWeeksRemaining || 0);
  const contractPercent = Math.min(100, Math.round((contractElapsed / (tvDeal.contractWeeksTotal || 24)) * 100));

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950 border border-emerald-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToMenu}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 mb-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Booker Hub
          </button>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <span>[ 4 ] Corporate Finances & Broadcaster Relations</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Negotiate multi-week television rights contracts, manage commercial ad revenue tiers, and satisfy broadcast mandates.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl self-start sm:self-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('tv_deals')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeTab === 'tv_deals'
                ? 'bg-sky-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Television Network Deals & Ads</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-black font-extrabold">
              {tvDeal.contractWeeksRemaining} Wks
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeTab === 'ledger'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Balance Sheet & Production</span>
          </button>
        </div>
      </div>

      {/* Corporate Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Capital */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="uppercase font-sans font-semibold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Capital War Chest
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Solvent
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${formatNumber(promotion.budget)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            Weekly Payroll: <strong className="text-zinc-200">${formatNumber(totalRosterPayroll)}</strong>
          </div>
        </div>

        {/* Guaranteed Rights Fee */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="uppercase font-sans font-semibold flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-sky-400" /> Guaranteed Rights
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Contract
            </span>
          </div>
          <div className="text-2xl font-bold text-sky-400">
            ${formatNumber(tvDeal.weeklyRightsFee)} <span className="text-xs text-zinc-500 font-normal">/ wk</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Network: <strong className="text-zinc-200">{tvDeal.networkName.split(' ')[0]}</strong>
          </div>
        </div>

        {/* Ad Inflow & Strategy */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="uppercase font-sans font-semibold flex items-center gap-1.5">
              <BadgePercent className="w-4 h-4 text-purple-400" /> Projected Ad Cash
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              adConfig.ratingModifier > 0 
                ? 'bg-emerald-950 text-emerald-400' 
                : adConfig.ratingModifier < 0 
                  ? 'bg-rose-950 text-rose-400' 
                  : 'bg-zinc-800 text-zinc-400'
            }`}>
              {adConfig.ratingModifier >= 0 ? '+' : ''}{adConfig.ratingModifier} Rating
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-300">
            ~${formatNumber(estimatedAdRevenue)} <span className="text-xs text-zinc-500 font-normal">/ wk</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 truncate">
            Tier: <strong className="text-zinc-200">{tvDeal.adRevenueTier}</strong>
          </div>
        </div>

        {/* Broadcaster Satisfaction */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="uppercase font-sans font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Broadcaster Patience
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              promotion.networkSatisfaction >= 75
                ? 'bg-emerald-950 text-emerald-300'
                : 'bg-rose-950 text-rose-300'
            }`}>
              {promotion.networkSatisfaction >= 80 ? 'Ecstatic' : promotion.networkSatisfaction >= 60 ? 'Satisfied' : 'Risk'}
            </span>
          </div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{promotion.networkSatisfaction}%</span>
            {promotion.networkSatisfaction >= 80 ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Target: <strong className="text-amber-400">{tvDeal.minRatingTarget} Rating Score</strong>
          </div>
        </div>
      </div>

      {/* ===================== TAB 1: TELEVISION NETWORK DEALS ===================== */}
      {activeTab === 'tv_deals' && (
        <div className="space-y-6">
          {/* Active Contract Showcase Card */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Tv className="w-72 h-72 text-sky-400" />
            </div>

            <div className="relative z-10 space-y-6">
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800">
                      {tvDeal.tier}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      tvDeal.contractWeeksRemaining <= 0
                        ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                        : tvDeal.contractWeeksRemaining <= 4
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {tvDeal.contractWeeksRemaining <= 0
                        ? 'CONTRACT EXPIRED (Emergency Syndication)'
                        : tvDeal.contractWeeksRemaining <= 4
                          ? `RENEWAL WINDOW OPEN (${tvDeal.contractWeeksRemaining} Wks Left)`
                          : `ACTIVE BROADCAST AGREEMENT (${tvDeal.contractWeeksRemaining} Wks Left)`}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white font-mono flex items-center gap-2">
                    <span>{tvDeal.networkName}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-1 flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    <span>Time Slot: <strong className="text-zinc-200">{tvDeal.broadcastSlot}</strong></span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenNegotiation()}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-sky-500/20 transition cursor-pointer"
                  >
                    <Handshake className="w-4 h-4" />
                    <span>Negotiate Multi-Week Contract</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleEarlyTermination}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-rose-950 hover:text-rose-300 text-zinc-300 font-mono text-xs border border-zinc-700 hover:border-rose-800 transition cursor-pointer"
                  >
                    Buyout Contract
                  </button>
                </div>
              </div>

              {/* Progress & Financial Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 font-mono">
                  <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">
                    Contract Term Progress
                  </span>
                  <div className="flex items-center justify-between text-base font-bold text-white mt-1">
                    <span>Week {contractElapsed} of {tvDeal.contractWeeksTotal}</span>
                    <span className="text-xs text-sky-400">{contractPercent}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden">
                    <div 
                      className="bg-sky-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${contractPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-2">
                    {tvDeal.contractWeeksRemaining} broadcasts remaining on current terms
                  </div>
                </div>

                <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 font-mono">
                  <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">
                    Weekly Broadcaster Inflow
                  </span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    ${formatNumber(tvDeal.weeklyRightsFee)} <span className="text-xs text-zinc-500">Rights</span>
                  </div>
                  <div className="text-xs text-purple-300 mt-1">
                    +${formatNumber(estimatedAdRevenue)} Projected Ad Revenue
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 pt-1 border-t border-zinc-800/80 font-bold">
                    Total: ${formatNumber(totalProjectedWeeklyTvCash)} / week
                  </div>
                </div>

                <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 font-mono">
                  <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">
                    Contract Minimum Target
                  </span>
                  <div className="text-xl font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                    <Target className="w-5 h-5 text-amber-400" />
                    <span>{tvDeal.minRatingTarget} Rating Score</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Miss Penalty: ${formatNumber(tvDeal.penaltyPerRatingMiss || 3000)} / pt below target
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Network Patience: <strong className="text-emerald-400">{promotion.networkSatisfaction}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Commercial & Ad Revenue Tiers */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <BadgePercent className="w-5 h-5 text-purple-400" />
                  <span>Commercial & Ad Revenue Tiers Strategy</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                  Choose how aggressively to monetize television broadcasts. Fewer commercials improve match flow and ratings; heavy commercial loads maximize cash.
                </p>
              </div>
              <div className="text-xs font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 self-start sm:self-auto">
                Current Strategy: <strong className="text-purple-300">{tvDeal.adRevenueTier}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {(Object.keys(AD_REVENUE_TIERS_CONFIG) as AdRevenueTier[]).map(tierKey => {
                const config = AD_REVENUE_TIERS_CONFIG[tierKey];
                const isSelected = tvDeal.adRevenueTier === tierKey;
                const projectedCash = Math.round((promotion.fanbase || 50000) * 0.45 * (1.5 / 2.0) * config.multiplier);
                const isEligible = promotion.prestige >= config.minPrestigeRequired;

                return (
                  <div
                    key={tierKey}
                    onClick={() => {
                      if (isEligible) handleSelectAdTier(tierKey);
                    }}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition relative ${
                      !isEligible 
                        ? 'opacity-50 cursor-not-allowed bg-zinc-950/50 border-zinc-900' 
                        : isSelected
                          ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/50 shadow-lg cursor-pointer'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 cursor-pointer'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500 text-black font-extrabold">
                        ACTIVE
                      </span>
                    )}

                    <div>
                      <div className="text-xs font-mono font-bold text-zinc-300 mb-1">
                        {config.name}
                      </div>
                      <div className="text-[11px] text-purple-400 font-sans font-semibold mb-2">
                        {config.tagline}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mb-3">
                        {config.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 font-mono text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">Rating Impact:</span>
                        <span className={`font-bold ${
                          config.ratingModifier > 0 
                            ? 'text-emerald-400' 
                            : config.ratingModifier < 0 
                              ? 'text-rose-400' 
                              : 'text-zinc-400'
                        }`}>
                          {config.ratingModifier >= 0 ? '+' : ''}{config.ratingModifier} Show Rating
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">Ad Inflow:</span>
                        <span className="text-emerald-400 font-bold">
                          ~${formatNumber(projectedCash)} / wk
                        </span>
                      </div>
                      {!isEligible && (
                        <div className="text-[10px] text-rose-400 pt-1">
                          Requires {config.minPrestigeRequired}+ Prestige (Current: {promotion.prestige})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Mandated Network Demands */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>Broadcaster Network Demands (Weekly Directives)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                  Network suits enforce booking requirements on weekly broadcasts. Fulfilling directives yields rating bonuses and executive trust; failing docks your show score.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (tvDeal.networkDemands.length > 0) {
                    setSelectedDemandToSwap(tvDeal.networkDemands[0]);
                    setIsPetitionModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Petition to Swap Directive ($25k)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tvDeal.networkDemands.map((demand, index) => {
                return (
                  <div 
                    key={demand.id || index}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800/60">
                          Directive #{index + 1}
                        </span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-400 font-bold">+{demand.ratingBonus} Rating Bonus</span>
                          <span className="text-rose-400 font-bold">-{demand.ratingPenalty} Penalty</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">
                        {demand.title}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                        {demand.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-sans">
                        Executive Trust Impact: <strong className="text-amber-300">±{demand.satisfactionImpact}%</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDemandToSwap(demand);
                          setIsPetitionModalOpen(true);
                        }}
                        className="text-amber-400 hover:text-amber-300 text-[11px] underline cursor-pointer"
                      >
                        Petition Swap
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Demands Compliance History Log */}
          {tvDeal.demandsComplianceHistory && tvDeal.demandsComplianceHistory.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Broadcaster Compliance & Ratings History Log</span>
              </h3>

              <div className="space-y-2 font-mono text-xs">
                {tvDeal.demandsComplianceHistory.slice(0, 5).map((log, i) => (
                  <div 
                    key={i}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px]">
                        Wk {log.week}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.demandsMet === log.demandsTotal
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {log.demandsMet}/{log.demandsTotal} Directives Satisfied
                      </span>
                      <p className="text-zinc-300 font-sans text-xs">
                        {log.executiveNote}
                      </p>
                    </div>

                    <div className="shrink-0 font-bold">
                      <span className={log.ratingDeltaApplied >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {log.ratingDeltaApplied >= 0 ? '+' : ''}{log.ratingDeltaApplied} Rating Mod
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: FINANCIAL LEDGER & PRODUCTION ===================== */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Markdown Balance Sheet */}
          <MarkdownTableView
            title="FINANCIAL LEDGER & WEEKLY REVENUE BALANCE SHEET"
            markdown={balanceSheetMarkdown}
            defaultToMarkdown={false}
          >
            <div className="text-xs text-zinc-400 font-mono">
              Television Rights and Ad Inflow form the backbone of corporate stability, funding high-end production and superstar payroll.
            </div>
          </MarkdownTableView>

          {/* Production Tier Management */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Television Production Quality Tier</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-sans">
                Higher production quality boosts broadcast appeal, network satisfaction, and wrestler prestige, but increases weekly operational overhead.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              {[
                { tier: 'Low Indie' as const, cost: 14000, desc: 'Single-cam gritty video, warehouse lighting.' },
                { tier: 'Standard Broadcast' as const, cost: 32000, desc: 'Multi-cam setup, entrance ramp, clear commentary.' },
                { tier: 'High-End HD' as const, cost: 85000, desc: 'Jumbotron, laser pyro, high-definition broadcast audio.' },
                { tier: 'Global Stadium Tier' as const, cost: 175000, desc: 'State-of-the-art cinematic cameras, massive LED stage.' }
              ].map(p => {
                const isActive = promotion.productionTier === p.tier;
                return (
                  <div
                    key={p.tier}
                    onClick={() => handleSetProductionTier(p.tier, p.cost)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span>{p.tier}</span>
                        {isActive && <span className="text-amber-400 text-[10px]">Active</span>}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-zinc-800/80 text-emerald-400 font-bold">
                      ${formatNumber(p.cost)} / week
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CONTRACT NEGOTIATION MARKETPLACE ===================== */}
      {isNegotiateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl font-mono text-xs my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-sky-400" />
                  <span>Television Broadcaster Negotiation & Marketplace</span>
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Browse regional and national television broadcasters. Propose multi-week contract durations, rights fees, and ratings commitments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNegotiateModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Select Broadcaster */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-sans font-bold text-zinc-400">
                1. Select Target Television Network
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {AVAILABLE_NETWORKS.map(net => {
                  const isSelected = selectedNetwork.id === net.id;
                  const isQualified = promotion.prestige >= net.minPrestigeRequired;

                  return (
                    <div
                      key={net.id}
                      onClick={() => {
                        setSelectedNetwork(net);
                        setProposedRightsFee(net.baseWeeklyRightsFee);
                        setProposedRatingTarget(net.minRatingTarget);
                        setProposedWeeks(net.suggestedContractWeeks[1] || net.suggestedContractWeeks[0] || 24);
                        setNegotiationResult(null);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/40 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${net.badgeClass}`}>
                            {net.tier}
                          </span>
                          {isQualified ? (
                            <span className="text-emerald-400 text-[10px]">Qualified</span>
                          ) : (
                            <span className="text-rose-400 text-[10px]">Prestige Low</span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-xs mt-1">
                          {net.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-sans mt-1 line-clamp-2">
                          {net.flavorText}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold">
                          ${formatNumber(net.baseWeeklyRightsFee)}/wk
                        </span>
                        <span className="text-amber-400">
                          {net.minRatingTarget} Target
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Contract Structuring Parameters */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
              <span className="text-[11px] uppercase font-sans font-bold text-zinc-400">
                2. Structure Contract Terms for {selectedNetwork.name}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Contract Duration */}
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-sans">
                    Contract Duration (Multi-Week Agreement)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[12, 24, 52].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => {
                          setProposedWeeks(w);
                          setNegotiationResult(null);
                        }}
                        className={`py-2 rounded-lg font-bold border transition ${
                          proposedWeeks === w
                            ? 'bg-sky-500 text-black border-sky-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {w} Wks
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {proposedWeeks === 12 ? 'Short-term probationary deal' : proposedWeeks === 24 ? 'Standard half-year season' : 'Full-year multi-season mega deal'}
                  </span>
                </div>

                {/* Proposed Weekly Rights Fee */}
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-sans">
                    Proposed Weekly Rights Fee
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProposedRightsFee(Math.max(10000, proposedRightsFee - 10000));
                        setNegotiationResult(null);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-white"
                    >
                      -10k
                    </button>
                    <div className="flex-1 text-center py-1.5 bg-zinc-900 border border-zinc-800 rounded font-bold text-emerald-400">
                      ${formatNumber(proposedRightsFee)}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProposedRightsFee(proposedRightsFee + 10000);
                        setNegotiationResult(null);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-white"
                    >
                      +10k
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Base: ${formatNumber(selectedNetwork.baseWeeklyRightsFee)}/wk ({Math.round((proposedRightsFee / selectedNetwork.baseWeeklyRightsFee) * 100)}% of baseline)
                  </span>
                </div>

                {/* Proposed Minimum Rating Target */}
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1 font-sans">
                    Contractual Rating Target Commitment
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProposedRatingTarget(Math.max(40, proposedRatingTarget - 2));
                        setNegotiationResult(null);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-white"
                    >
                      -2
                    </button>
                    <div className="flex-1 text-center py-1.5 bg-zinc-900 border border-zinc-800 rounded font-bold text-amber-400">
                      {proposedRatingTarget} Rating
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProposedRatingTarget(Math.min(95, proposedRatingTarget + 2));
                        setNegotiationResult(null);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-white"
                    >
                      +2
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Higher commitments make executives accept higher rights fees
                  </span>
                </div>
              </div>

              {/* Network Demands Preview */}
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold block mb-1.5">
                  Mandatory Broadcast Directives Enforced by {selectedNetwork.name}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedNetwork.demands.map(d => (
                    <div key={d.id} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-sans">
                      <span className="text-amber-400 font-mono font-bold block">{d.title}</span>
                      <span className="text-zinc-400 text-[10px]">{d.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Negotiation Output / Feedback */}
            {negotiationResult && (
              <div className={`p-4 rounded-xl border space-y-3 ${
                negotiationResult.status === 'accepted'
                  ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200'
                  : negotiationResult.status === 'counter'
                    ? 'bg-amber-950/30 border-amber-500 text-amber-200'
                    : 'bg-rose-950/30 border-rose-500 text-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-bold uppercase">
                  {negotiationResult.status === 'accepted' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>PROPOSAL ACCEPTED BY BOARD OF DIRECTORS</span>
                    </>
                  ) : negotiationResult.status === 'counter' ? (
                    <>
                      <Handshake className="w-5 h-5 text-amber-400" />
                      <span>EXECUTIVE COUNTER-OFFER ON TABLE</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      <span>PROPOSAL REJECTED BY BROADCASTER</span>
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed font-sans">
                  {negotiationResult.feedback}
                </p>

                {negotiationResult.status === 'accepted' && (
                  <button
                    type="button"
                    onClick={() => handleSignContract(
                      negotiationResult.rightsFeeAgreed,
                      negotiationResult.contractWeeksAgreed,
                      negotiationResult.minRatingAgreed
                    )}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase transition"
                  >
                    Confirm & Sign {negotiationResult.contractWeeksAgreed}-Week Contract ($${formatNumber(negotiationResult.rightsFeeAgreed)}/wk)
                  </button>
                )}

                {negotiationResult.status === 'counter' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSignContract(
                        negotiationResult.rightsFeeAgreed,
                        negotiationResult.contractWeeksAgreed,
                        negotiationResult.minRatingAgreed
                      )}
                      className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase transition"
                    >
                      Accept Counter ($${formatNumber(negotiationResult.rightsFeeAgreed)}/wk • {negotiationResult.contractWeeksAgreed} Wks)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsNegotiateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSubmitProposal}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold flex items-center gap-2 shadow-lg"
              >
                <span>Submit Proposal to Network Board</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: PETITION DEMAND SWAP ===================== */}
      {isPetitionModalOpen && selectedDemandToSwap && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Petition Network Board: Swap Broadcast Directive</span>
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Replace a difficult directive by paying an executive petition consultation fee ($25,000).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPetitionModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] uppercase text-zinc-500 font-sans">Current Directive to Replace:</span>
              <div className="font-bold text-white mt-0.5">{selectedDemandToSwap.title}</div>
              <div className="text-[11px] text-zinc-400 font-sans mt-0.5">{selectedDemandToSwap.description}</div>
            </div>

            <span className="text-[10px] uppercase text-zinc-400 font-sans block pt-1 font-bold">
              Select Replacement Broadcast Directive:
            </span>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {[
                {
                  id: `swap-youth-${Date.now()}`,
                  type: 'youth_movement' as const,
                  title: 'Next-Gen Youth Movement',
                  description: 'Feature at least two athletes aged 28 or younger on the broadcast card.',
                  targetValue: 2,
                  ratingBonus: 3,
                  ratingPenalty: 3,
                  satisfactionImpact: 2
                },
                {
                  id: `swap-tag-${Date.now()}`,
                  type: 'tag_team_focus' as const,
                  title: 'Tag Team Division Feature',
                  description: 'Book at least one Tag Team or 6-Man Tag match on every episode.',
                  ratingBonus: 3,
                  ratingPenalty: 3,
                  satisfactionImpact: 2
                },
                {
                  id: `swap-main-${Date.now()}`,
                  type: 'main_event_quality' as const,
                  title: 'Prime Main Event Benchmark',
                  description: 'Deliver a Main Event segment scoring 74 or higher.',
                  targetValue: 74,
                  ratingBonus: 4,
                  ratingPenalty: 4,
                  satisfactionImpact: 3
                },
                {
                  id: `swap-women-${Date.now()}`,
                  type: 'women_division' as const,
                  title: 'Women’s Division Feature',
                  description: 'Book at least one match or angle featuring female talent.',
                  ratingBonus: 3,
                  ratingPenalty: 2,
                  satisfactionImpact: 2
                },
                {
                  id: `swap-gimmick-${Date.now()}`,
                  type: 'gimmick_carnage' as const,
                  title: 'High-Octane Stunts & Gimmicks',
                  description: 'Book at least one Steel Cage, Ladder, Hardcore, or TLC match.',
                  ratingBonus: 4,
                  ratingPenalty: 4,
                  satisfactionImpact: 3
                }
              ]
                .filter(c => c.type !== selectedDemandToSwap.type)
                .map(cand => (
                  <div
                    key={cand.id}
                    onClick={() => handleExecuteDemandSwap(cand)}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-500 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-amber-300">{cand.title}</div>
                      <div className="text-[10px] text-zinc-400 font-sans mt-0.5">{cand.description}</div>
                    </div>
                    <span className="text-emerald-400 font-bold shrink-0 ml-3">
                      +{cand.ratingBonus} Rating
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-zinc-500 text-[11px]">Fee: $25,000 Corporate Influence</span>
              <button
                type="button"
                onClick={() => setIsPetitionModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Promotion, FinancialReport } from '../types';
import { MarkdownTableView } from './MarkdownTableView';
import { 
  DollarSign, 
  Tv, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  ChevronLeft 
} from 'lucide-react';
import { formatNumber } from '../utils/format';

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
  const latestReport = financialHistory[financialHistory.length - 1];
  const totalRosterPayroll = promotion.roster.reduce((sum, w) => sum + w.salary, 0);

  // Production quality tier upgrade/downgrade
  const handleSetProductionTier = (tier: Promotion['productionTier'], cost: number) => {
    onUpdatePromotion({
      ...promotion,
      productionTier: tier,
      productionCostWeekly: cost
    });
  };

  // Build Markdown table of recent Financial Balance Sheets
  let balanceSheetMarkdown = `| Week | TV Rights Rev | Ticket Gate | Merch Sales | Total Inflow | Payroll Expense | Production | Net Profit/Loss | Ending Capital |
|---|---|---|---|---|---|---|---|---|
`;
  if (financialHistory.length === 0) {
    const estimatedTv = Math.round((promotion.budget || 2000000) * 0.02);
    const estimatedGate = Math.round((promotion.fanbase || 50000) * 0.12 * 42);
    const estimatedMerch = Math.round((promotion.fanbase || 50000) * 0.12 * 7);
    const estimatedInflow = estimatedTv + estimatedGate + estimatedMerch;
    const estimatedExpenses = totalRosterPayroll + (promotion.productionCostWeekly || 25000) + 12000;
    const estimatedNet = estimatedInflow - estimatedExpenses;

    balanceSheetMarkdown += `| Projected | $${formatNumber(estimatedTv)} | $${formatNumber(estimatedGate)} | $${formatNumber(estimatedMerch)} | $${formatNumber(estimatedInflow)} | $${formatNumber(totalRosterPayroll)} | $${formatNumber(promotion.productionCostWeekly)} | ${estimatedNet >= 0 ? '+' : ''}$${formatNumber(estimatedNet)} | $${formatNumber(promotion.budget)} |\n`;
  } else {
    financialHistory.slice(-5).forEach(f => {
      const totalRev = (f.tvRevenue || 0) + (f.ticketSales || 0) + (f.merchSales || 0);
      const netVal = f.netProfit || 0;
      const netStr = netVal >= 0 ? `+$${formatNumber(netVal)}` : `-$${formatNumber(Math.abs(netVal))}`;
      balanceSheetMarkdown += `| Wk ${f.week} | $${formatNumber(f.tvRevenue)} | $${formatNumber(f.ticketSales)} | $${formatNumber(f.merchSales)} | $${formatNumber(totalRev)} | $${formatNumber(f.wrestlerPayroll)} | $${formatNumber(f.productionCost)} | ${netStr} | $${formatNumber(f.endingBalance)} |\n`;
    });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
        </div>
      </div>

      {/* Corporate Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Capital */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="uppercase font-sans font-semibold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Current War Chest
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              Solvent
            </span>
          </div>
          <div className="text-3xl font-bold text-white">
            ${formatNumber(promotion.budget)}
          </div>
          <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
            Weekly Payroll: <strong className="text-zinc-200">${formatNumber(totalRosterPayroll)}</strong>
          </div>
        </div>

        {/* Broadcaster Satisfaction */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="uppercase font-sans font-semibold flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-sky-400" /> Broadcaster Satisfaction
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-sky-300">
              {promotion.tvNetwork.split(' ')[0]}
            </span>
          </div>
          <div className="text-3xl font-bold text-white flex items-center gap-2">
            <span>{promotion.networkSatisfaction}%</span>
            {promotion.networkSatisfaction >= 80 ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-400" />
            )}
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            Contract Threshold: <strong className="text-amber-400">{promotion.minNetworkRating}/100 Rating</strong>
          </div>
        </div>

        {/* Weekly Net Projection */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="uppercase font-sans font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Last Broadcast Net
            </span>
          </div>
          <div className={`text-3xl font-bold ${latestReport ? (latestReport.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-zinc-300'}`}>
            {latestReport ? (
              `${latestReport.netProfit >= 0 ? '+' : ''}$${formatNumber(latestReport.netProfit)}`
            ) : (
              '-- pending --'
            )}
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            Active Fanbase: <strong className="text-zinc-200">{formatNumber(promotion.fanbase)} Fans</strong>
          </div>
        </div>
      </div>

      {/* Markdown Balance Sheet */}
      <MarkdownTableView
        title="FINANCIAL LEDGER & WEEKLY REVENUE BALANCE SHEET"
        markdown={balanceSheetMarkdown}
        defaultToMarkdown={false}
      >
        <div className="text-xs text-zinc-400 font-mono">
          Consistently delivering high-rated main events grows television ad revenue and sells out arenas.
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
            Higher production quality boosts broadcast appeal and wrestler prestige, but increases weekly operational costs.
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
  );
};

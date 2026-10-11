import React from 'react';
import { ShowResult, Promotion } from '../types';
import { MarkdownTableView } from './MarkdownTableView';
import { formatNumber } from '../utils/format';
import { 
  Trophy, 
  Tv, 
  Users, 
  DollarSign, 
  Star, 
  CheckCircle, 
  TrendingUp, 
  Flame, 
  AlertTriangle,
  Swords,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

interface ShowResultModalProps {
  showResult: ShowResult;
  promotion: Promotion;
  onClose: () => void;
}

export const ShowResultModal: React.FC<ShowResultModalProps> = ({
  showResult,
  promotion,
  onClose
}) => {
  // Build Markdown table of the Show Results
  let resultsMarkdown = `| Seg # | Category | Stipulation / Angle | Rating (0-100) | Star Rating | Highlight Notes |
|---|---|---|---|---|---|
`;
  showResult.segmentEvaluations.forEach(ev => {
    const { segment, score, starString, notes } = ev;
    const desc = segment.category === 'Match' ? `Match: ${segment.matchType}` : `Angle: ${segment.angleType}`;
    const notesSnippet = notes.length > 0 ? notes[0] : 'Solid crowd reaction.';
    resultsMarkdown += `| #${segment.segmentNumber} | ${segment.category} | ${desc} | **${score} / 100** | ${starString} | ${notesSnippet} |\n`;
  });

  resultsMarkdown += `\n**OVERALL SHOW RATING**: ${showResult.overallScore} / 100 (${showResult.starRating})\n`;
  resultsMarkdown += `**TV VIEWERSHIP**: ${showResult.tvRating} Rating (${showResult.viewers} Viewers) on ${promotion.tvNetwork}\n`;
  resultsMarkdown += `**LIVE ATTENDANCE**: ${formatNumber(showResult.attendance)} Fans | Gate: $${formatNumber(showResult.gateRevenue)}\n`;
  resultsMarkdown += `**BROADCASTER VERDICT**: "${showResult.networkFeedback}"`;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2 border-b border-zinc-800 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>{showResult.isPPV ? '★ PAY-PER-VIEW SUPERCARD EVALUATION ★' : 'Official Broadcast Evaluation'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-mono uppercase">
            {showResult.showName}
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Week {showResult.week}, Year {showResult.year} {showResult.isPPV ? `Live Spectacle • ${showResult.ppvEvent?.venue || 'Major Arena'}` : 'Broadcast Evaluation & EWR Ratings'}
          </p>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Overall Show Rating */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 font-mono text-center">
            <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">Overall Rating</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              {showResult.overallScore} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] text-amber-300/90 mt-0.5">{showResult.starRating}</div>
          </div>

          {/* TV Rating or PPV Buys */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 font-mono text-center">
            <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">
              {showResult.isPPV ? 'PPV Buyrate' : 'TV Rating'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-sky-400 mt-1">
              {showResult.isPPV ? formatNumber(showResult.ppvBuys) : showResult.tvRating}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {showResult.isPPV ? `$${formatNumber(showResult.ppvRevenue)} PPV Gross` : `${showResult.viewers} Viewers`}
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 font-mono text-center">
            <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">
              {showResult.isPPV ? 'Stadium Gate' : 'Live Gate'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {formatNumber(showResult.attendance)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">${formatNumber(showResult.gateRevenue)} Gate</div>
          </div>

          {/* Main Event Score */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 font-mono text-center">
            <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">Main Event</span>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">
              {showResult.mainEventScore} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">35% Show Weight</div>
          </div>
        </div>

        {/* Network Memo & TV Demands Breakdown */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-xs">
          <div className="flex items-start gap-3">
            <Tv className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-zinc-400 uppercase font-sans font-bold">Network Executive Memo:</span>
              <p className="text-zinc-200 mt-0.5 leading-relaxed font-sans">{showResult.networkFeedback}</p>
            </div>
          </div>

          {showResult.tvDealOutcome && (
            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60 font-bold uppercase">
                    {showResult.tvDealOutcome.networkName}
                  </span>
                  <span className="text-zinc-400 font-sans">
                    Ad Tier: <strong className="text-zinc-200">{showResult.tvDealOutcome.adRevenueTier}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">
                    Rights: +${formatNumber(showResult.tvDealOutcome.rightsFeePaid)}
                  </span>
                  <span className="text-emerald-300 font-bold">
                    Ads: +${formatNumber(showResult.tvDealOutcome.adRevenueEarned)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    showResult.tvDealOutcome.netRatingModifier >= 0 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {showResult.tvDealOutcome.netRatingModifier >= 0 ? '+' : ''}{showResult.tvDealOutcome.netRatingModifier} Rating Impact
                  </span>
                </div>
              </div>

              {showResult.tvDealOutcome.demandResults && showResult.tvDealOutcome.demandResults.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] uppercase font-sans font-semibold text-zinc-400 flex items-center justify-between">
                    <span>Mandated Broadcast Demands ({showResult.tvDealOutcome.demandsMetCount}/{showResult.tvDealOutcome.demandsTotalCount} Met):</span>
                    <span className="text-zinc-400">{showResult.tvDealOutcome.weeksRemainingOnContract} Wks Left on Contract</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {showResult.tvDealOutcome.demandResults.map((dr, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 rounded-lg border text-[11px] font-sans flex items-start gap-2 ${
                          dr.met 
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' 
                            : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                        }`}
                      >
                        {dr.met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold font-mono text-[10px] uppercase tracking-wide">
                            {dr.demandTitle}
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            {dr.impactDescription}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* GM Post-Show Debrief */}
        {showResult.gmFeedback && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
            <span className="text-2xl shrink-0 mt-0.5">{showResult.gmFeedback.gmAvatar}</span>
            <div className="text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold uppercase">
                  {showResult.gmFeedback.gmName} (General Manager Debrief):
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-amber-500/30 text-amber-300 font-bold uppercase">
                  {showResult.gmFeedback.reaction}
                </span>
              </div>
              <p className="text-zinc-200 mt-1 leading-relaxed font-sans italic">
                &ldquo;{showResult.gmFeedback.quote}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Weekly Ratings War Battle Report */}
        {showResult.rivalWarBattle && (
          <div className={`p-4 rounded-xl border font-mono text-xs space-y-3 ${
            showResult.rivalWarBattle.isPlayerWinner
              ? 'bg-emerald-950/20 border-emerald-500/50'
              : 'bg-rose-950/20 border-rose-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400" />
                <span className="text-white font-bold uppercase tracking-wider">
                  TELEVISION RATINGS WAR • HEAD-TO-HEAD BATTLE
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] flex items-center gap-1 ${
                showResult.rivalWarBattle.isPlayerWinner
                  ? 'bg-emerald-500 text-black'
                  : 'bg-rose-500 text-white'
              }`}>
                {showResult.rivalWarBattle.isPlayerWinner ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>★ RATINGS VICTORY</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>⚠ RATINGS DEFEAT</span>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase">{promotion.shortName} Flagship</span>
                <div className="text-base font-bold text-white mt-0.5">{showResult.tvRating} Rating</div>
                <div className="text-[11px] text-sky-400">{formatNumber(showResult.rivalWarBattle.playerViewers)} Viewers</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase">{showResult.rivalWarBattle.rivals[0]?.rivalName || 'Rival'}</span>
                <div className="text-base font-bold text-zinc-300 mt-0.5">{showResult.rivalWarBattle.rivals[0]?.rating} Rating</div>
                <div className="text-[11px] text-zinc-400">{formatNumber(showResult.rivalWarBattle.rivals[0]?.viewers || 0)} Viewers</div>
              </div>
            </div>

            <p className="text-zinc-300 font-sans text-xs leading-relaxed">
              {showResult.rivalWarBattle.narrativeRecap}
            </p>
          </div>
        )}

        {/* Clean Markdown Table */}
        <MarkdownTableView
          title="SHOW RATINGS & SEGMENT BREAKDOWN (EWR METRICS)"
          markdown={resultsMarkdown}
          defaultToMarkdown={false}
        >
          <div className="text-xs text-zinc-400 font-mono">
            Matches are scored on Workrate (60%) + Overness (40%) + Feud bonus - Fatigue & Overuse penalties. Promos are scored on Mic Skills (70%) + Overness (30%).
          </div>
        </MarkdownTableView>

        {/* Segment Evaluator Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider">
            Segment-By-Segment Match Commentary
          </h4>

          {showResult.segmentEvaluations.map((ev, i) => {
            const { segment, score, starString, recap, notes } = ev;
            return (
              <div
                key={segment.id || i}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold">
                      SEG #{segment.segmentNumber}
                    </span>
                    <span className="text-white font-bold font-mono">
                      {segment.category === 'Match' ? segment.matchType : segment.angleType}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold text-sm">
                      {score} / 100
                    </span>
                    <span className="text-zinc-400 text-[11px]">
                      ({starString})
                    </span>
                  </div>
                </div>

                <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                  {recap}
                </p>

                {notes.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                    {notes.map((n, idx) => (
                      <div key={idx} className="text-[11px] text-amber-400/90 flex items-center gap-1.5">
                        <span>•</span>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Close & Continue Action */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>ACCEPT RESULTS & ENTER NEXT WEEK</span>
          </button>
        </div>
      </div>
    </div>
  );
};

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
  AlertTriangle 
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

        {/* Network Memo */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
          <Tv className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <span className="text-zinc-400 uppercase font-sans font-bold">Network Executive Memo:</span>
            <p className="text-zinc-200 mt-0.5 leading-relaxed font-sans">{showResult.networkFeedback}</p>
          </div>
        </div>

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

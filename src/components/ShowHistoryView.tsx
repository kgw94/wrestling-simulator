import React, { useState, useMemo } from 'react';
import { ShowResult, Promotion } from '../types';
import { formatNumber } from '../utils/format';
import { 
  Trophy, 
  Tv, 
  Calendar, 
  Star, 
  Users, 
  DollarSign, 
  Flame, 
  Search, 
  Filter, 
  ChevronLeft, 
  Eye, 
  X, 
  ArrowUpDown, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  TrendingUp, 
  Clock 
} from 'lucide-react';

interface ShowHistoryViewProps {
  promotion: Promotion;
  showHistory: ShowResult[];
  onBackToMenu: () => void;
}

export const ShowHistoryView: React.FC<ShowHistoryViewProps> = ({
  promotion,
  showHistory,
  onBackToMenu
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tv' | 'ppv' | 'five_star' | 'great'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'viewers' | 'gate'>('newest');
  const [inspectedShow, setInspectedShow] = useState<ShowResult | null>(null);

  // Available years in history
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(showHistory.map(s => s.year)));
    return years.sort((a, b) => b - a);
  }, [showHistory]);

  // Overall Historical Records
  const records = useMemo(() => {
    if (showHistory.length === 0) return null;

    let bestShow = showHistory[0];
    let topAttendanceShow = showHistory[0];
    let topViewersShow = showHistory[0];
    let bestMatch = {
      score: 0,
      starString: '',
      recap: '',
      showName: '',
      matchType: '',
      participants: ''
    };

    let totalAttendance = 0;
    let totalGate = 0;

    showHistory.forEach(s => {
      if (s.overallScore > bestShow.overallScore) bestShow = s;
      if (s.attendance > topAttendanceShow.attendance) topAttendanceShow = s;
      
      const sViewers = parseFloat(s.viewers) || (s.tvRating * 1.0);
      const topViewers = parseFloat(topViewersShow.viewers) || (topViewersShow.tvRating * 1.0);
      if (sViewers > topViewers) topViewersShow = s;

      totalAttendance += s.attendance;
      totalGate += s.gateRevenue;

      s.segmentEvaluations?.forEach(ev => {
        if (ev.segment.category === 'Match' && ev.score > bestMatch.score) {
          const names = ev.segment.participantIds
            .map(id => promotion.roster.find(w => w.id === id)?.name || id)
            .join(' vs. ');
          bestMatch = {
            score: ev.score,
            starString: ev.starString,
            recap: ev.recap,
            showName: s.showName,
            matchType: ev.segment.matchType || 'Match',
            participants: names
          };
        }
      });
    });

    const avgScore = Math.round(showHistory.reduce((acc, s) => acc + s.overallScore, 0) / showHistory.length);

    return {
      totalShows: showHistory.length,
      bestShow,
      topAttendanceShow,
      topViewersShow,
      bestMatch,
      totalAttendance,
      totalGate,
      avgScore
    };
  }, [showHistory, promotion.roster]);

  // Filtered & Sorted Shows
  const filteredShows = useMemo(() => {
    return showHistory.filter(show => {
      // Filter by TV or PPV
      if (filterType === 'tv' && show.isPPV) return false;
      if (filterType === 'ppv' && !show.isPPV) return false;
      if (filterType === 'five_star' && show.overallScore < 90) return false;
      if (filterType === 'great' && show.overallScore < 80) return false;

      // Filter by year
      if (selectedYear !== 'all' && show.year !== selectedYear) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = show.showName.toLowerCase().includes(q);
        const matchesFeedback = show.networkFeedback?.toLowerCase().includes(q);
        const matchesParticipants = show.segmentEvaluations?.some(ev => {
          return ev.segment.participantIds.some(id => {
            const w = promotion.roster.find(star => star.id === id);
            return w && w.name.toLowerCase().includes(q);
          }) || ev.recap.toLowerCase().includes(q);
        });

        if (!matchesName && !matchesFeedback && !matchesParticipants) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.overallScore - a.overallScore;
      if (sortBy === 'gate') return b.gateRevenue - a.gateRevenue;
      if (sortBy === 'viewers') {
        const va = parseFloat(a.viewers) || a.tvRating;
        const vb = parseFloat(b.viewers) || b.tvRating;
        return vb - va;
      }
      // 'newest' default: by year then week
      if (b.year !== a.year) return b.year - a.year;
      return b.week - a.week;
    });
  }, [showHistory, filterType, selectedYear, searchQuery, sortBy, promotion.roster]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Archive Hall of Records • {promotion.shortName}</span>
          </div>
          <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
            Company Show History & Match Archives
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Review every broadcast card, PPV supercard, attendance record, and 5-star classic in company history.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToMenu}
          className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition self-start sm:self-auto border border-zinc-700 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Main Menu</span>
        </button>
      </div>

      {/* Record Book Highlight Cards */}
      {records && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* All-Time Best Show */}
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-2">
              <span className="flex items-center gap-1.5 uppercase font-bold text-[11px]">
                <Award className="w-4 h-4" /> Best Show All-Time
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                {records.bestShow.overallScore}/100
              </span>
            </div>
            <h4 className="text-sm font-bold text-white line-clamp-1">
              {records.bestShow.showName}
            </h4>
            <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5 font-mono">
              <span>Wk {records.bestShow.week}, {records.bestShow.year}</span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">{records.bestShow.starRating.split(' ')[0]} ★</span>
            </div>
          </div>

          {/* Highest Rated Match */}
          <div className="bg-zinc-900/90 border border-purple-500/30 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-purple-400 mb-2">
              <span className="flex items-center gap-1.5 uppercase font-bold text-[11px]">
                <Star className="w-4 h-4" /> Match of the Century
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                {records.bestMatch.score}/100
              </span>
            </div>
            <h4 className="text-sm font-bold text-white line-clamp-1">
              {records.bestMatch.participants || 'Legendary Encounter'}
            </h4>
            <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5 font-mono truncate">
              <span className="text-purple-300 font-semibold">{records.bestMatch.starString.split(' ')[0]} ★</span>
              <span>•</span>
              <span className="truncate">{records.bestMatch.matchType}</span>
            </div>
          </div>

          {/* Attendance & Gate Record */}
          <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
              <span className="flex items-center gap-1.5 uppercase font-bold text-[11px]">
                <Users className="w-4 h-4" /> Record Stadium Gate
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {formatNumber(records.topAttendanceShow.attendance)} Fans
              </span>
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              ${formatNumber(records.topAttendanceShow.gateRevenue)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 font-mono truncate">
              {records.topAttendanceShow.showName}
            </div>
          </div>

          {/* Cumulative Milestones */}
          <div className="bg-zinc-900/90 border border-sky-500/30 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-sky-400 mb-2">
              <span className="flex items-center gap-1.5 uppercase font-bold text-[11px]">
                <Tv className="w-4 h-4" /> Shows Broadcast
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold text-[10px]">
                {records.totalShows} Events
              </span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {records.avgScore} <span className="text-xs text-zinc-500 font-normal">/ 100 Avg Score</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 font-mono">
              ${formatNumber(records.totalGate)} Total Career Live Gates
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by show title, PPV theme, wrestler name, or match..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition font-mono"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Shows' },
              { id: 'tv', label: 'Weekly TV' },
              { id: 'ppv', label: 'PPV Supercards' },
              { id: 'five_star', label: '5-Star (90+)' },
              { id: 'great', label: 'Acclaimed (80+)' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition border ${
                  filterType === tab.id
                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-zinc-500">
              <Filter className="w-3.5 h-3.5" /> Year:
            </span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Calendar Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>Year {yr}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-zinc-500">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="newest">Most Recent Broadcast First</option>
              <option value="rating">Highest Show Rating First</option>
              <option value="viewers">Highest TV Viewership First</option>
              <option value="gate">Largest Live Gate Revenue</option>
            </select>
          </div>

          <div className="text-zinc-500">
            Showing <strong className="text-zinc-200">{filteredShows.length}</strong> of {showHistory.length} shows
          </div>
        </div>
      </div>

      {/* Shows List */}
      {filteredShows.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
          <Tv className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-200 font-mono">No Archived Shows Found</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {searchQuery 
              ? `No broadcasts matched your search query "${searchQuery}". Try clearing filters.`
              : 'Advance weeks and broadcast television cards to build your company\'s multi-year historical archive.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredShows.map((show, idx) => {
            const isHighScore = show.overallScore >= 90;
            const isSolidScore = show.overallScore >= 80;
            const borderAccent = isHighScore 
              ? 'border-amber-500/60 bg-amber-950/10' 
              : isSolidScore 
              ? 'border-emerald-500/40 bg-zinc-900/80' 
              : 'border-zinc-800 bg-zinc-900/80';

            const mainEventSeg = show.segmentEvaluations?.slice(-1)[0];

            return (
              <div 
                key={`hist-${show.year}-${show.week}-${idx}`}
                className={`border rounded-xl p-4 sm:p-5 transition hover:border-zinc-600 hover:bg-zinc-900 shadow-sm ${borderAccent}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Show Title, Badges & Time */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold">
                        Week {show.week}, Year {show.year}
                      </span>
                      {show.isPPV ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> PAY-PER-VIEW SUPERCARD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-medium flex items-center gap-1">
                          <Tv className="w-3 h-3" /> TV BROADCAST
                        </span>
                      )}
                      {isHighScore && (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-mono font-bold text-[10px] uppercase">
                          ★ 5-Star Masterpiece
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white font-mono">
                      {show.showName}
                    </h3>

                    {/* Main Event Highlight */}
                    {mainEventSeg && (
                      <p className="text-xs text-zinc-400 line-clamp-1 font-sans">
                        <strong className="text-zinc-300 font-mono font-semibold">Main Event: </strong>
                        {mainEventSeg.recap || `${mainEventSeg.segment.matchType || 'Match'} (Rating: ${mainEventSeg.score}/100)`}
                      </p>
                    )}
                  </div>

                  {/* Middle: Show Metrics */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 font-mono text-center shrink-0 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80">
                    {/* Score */}
                    <div className="px-2">
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">Rating</span>
                      <span className={`text-base font-black ${isHighScore ? 'text-amber-400' : isSolidScore ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {show.overallScore} <span className="text-[10px] text-zinc-500 font-normal">/100</span>
                      </span>
                    </div>

                    {/* Viewers or PPV buys */}
                    <div className="px-2 border-l border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">
                        {show.isPPV ? 'Buys' : 'Viewers'}
                      </span>
                      <span className="text-base font-bold text-sky-400">
                        {show.isPPV ? formatNumber(show.ppvBuys || 0) : show.viewers}
                      </span>
                    </div>

                    {/* Attendance */}
                    <div className="px-2 border-l border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">Gate Fans</span>
                      <span className="text-base font-bold text-zinc-200">
                        {formatNumber(show.attendance)}
                      </span>
                    </div>

                    {/* Segments count */}
                    <div className="hidden sm:block px-2 border-l border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">Segments</span>
                      <span className="text-base font-bold text-purple-400">
                        {show.segmentEvaluations?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setInspectedShow(show)}
                      className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-200 font-mono text-xs font-bold flex items-center gap-1.5 transition border border-zinc-700"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect Match Card</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deep Show Scorecard & Match Inspector Modal */}
      {inspectedShow && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Week {inspectedShow.week}, Year {inspectedShow.year} • Official Broadcast Record</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase">
                  {inspectedShow.showName}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  {inspectedShow.isPPV ? `Pay-Per-View Supercard • ${inspectedShow.ppvEvent?.venue || 'Major Arena'}` : `Television Broadcast on ${promotion.tvNetwork}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectedShow(null)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Scorecard Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">Overall Rating</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {inspectedShow.overallScore} <span className="text-xs text-zinc-500 font-normal">/100</span>
                </div>
                <div className="text-[11px] text-amber-300/90 mt-0.5">{inspectedShow.starRating}</div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">
                  {inspectedShow.isPPV ? 'PPV Buyrate' : 'TV Rating'}
                </span>
                <div className="text-2xl font-black text-sky-400 mt-1">
                  {inspectedShow.isPPV ? formatNumber(inspectedShow.ppvBuys || 0) : inspectedShow.tvRating}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {inspectedShow.isPPV ? `$${formatNumber(inspectedShow.ppvRevenue || 0)} Gross` : `${inspectedShow.viewers} Viewers`}
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">Live Attendance</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {formatNumber(inspectedShow.attendance)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  ${formatNumber(inspectedShow.gateRevenue)} Gate
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">Main Event Score</span>
                <div className="text-2xl font-black text-purple-400 mt-1">
                  {inspectedShow.mainEventScore || inspectedShow.overallScore} <span className="text-xs text-zinc-500 font-normal">/100</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Show Headliner</div>
              </div>
            </div>

            {/* Network / GM Quotes */}
            {inspectedShow.networkFeedback && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                <Tv className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs font-mono">
                  <span className="text-zinc-400 uppercase font-sans font-bold">Broadcaster Executive Memo:</span>
                  <p className="text-zinc-200 mt-0.5 font-sans leading-relaxed">{inspectedShow.networkFeedback}</p>
                </div>
              </div>
            )}

            {inspectedShow.gmFeedback && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{inspectedShow.gmFeedback.gmAvatar}</span>
                <div className="text-xs font-mono">
                  <span className="text-amber-400 uppercase font-bold">
                    {inspectedShow.gmFeedback.gmName} (GM Debrief):
                  </span>
                  <p className="text-zinc-200 mt-0.5 font-sans italic leading-relaxed">
                    &ldquo;{inspectedShow.gmFeedback.quote}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Segment by Segment Card Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider">
                Full Segment Rundown & Match Ratings ({inspectedShow.segmentEvaluations?.length || 0} Segments)
              </h4>

              <div className="space-y-2.5">
                {inspectedShow.segmentEvaluations?.map((ev, sIdx) => {
                  const { segment, score, starString, recap, notes, breakdown } = ev;
                  const isMatch = segment.category === 'Match';
                  const winner = promotion.roster.find(w => w.id === segment.winnerId);
                  
                  return (
                    <div 
                      key={`seg-eval-${segment.id || sIdx}`}
                      className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-900 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-mono font-bold text-xs border border-zinc-700">
                            #{segment.segmentNumber || sIdx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isMatch ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          }`}>
                            {isMatch ? `Match: ${segment.matchType || 'Singles'}` : `Angle: ${segment.angleType || 'Promo'}`}
                          </span>
                          {segment.durationMinutes && (
                            <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {segment.durationMinutes}m
                            </span>
                          )}
                        </div>

                        {/* Rating Badges */}
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-sm font-black text-amber-400">
                            {score} / 100
                          </span>
                          <span className="text-xs text-zinc-400">
                            ({starString})
                          </span>
                        </div>
                      </div>

                      {/* Participants & Outcome */}
                      <div className="text-xs">
                        {isMatch && winner && (
                          <div className="text-emerald-400 font-mono font-bold mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Winner: {winner.name} via {segment.finishType || 'Pinfall'}</span>
                          </div>
                        )}

                        <p className="text-zinc-200 leading-relaxed font-sans">
                          {recap}
                        </p>
                      </div>

                      {/* Breakdown Tags & Notes */}
                      {notes && notes.length > 0 && (
                        <div className="pt-2 border-t border-zinc-900/80 flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-400">
                          {notes.map((nText, nIdx) => (
                            <span key={nIdx} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                              • {nText}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectedShow(null)}
                className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold transition"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

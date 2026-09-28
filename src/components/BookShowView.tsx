import React, { useState } from 'react';
import { 
  Segment, 
  Wrestler, 
  Promotion, 
  MatchType, 
  AngleType, 
  FinishType, 
  Feud, 
  Championship,
  PPVEvent
} from '../types';
import { evaluateSegment } from '../engine/simulation';
import { DEFAULT_PPV_CALENDAR } from '../data/customDefaults';
import { formatNumber } from '../utils/format';
import { MarkdownTableView } from './MarkdownTableView';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Trophy, 
  Sparkles, 
  Flame, 
  Clock, 
  ShieldAlert, 
  Wand2, 
  Play, 
  ChevronLeft,
  Users,
  Swords,
  Pencil
} from 'lucide-react';

interface BookShowViewProps {
  promotion: Promotion;
  currentWeek?: number;
  currentYear?: number;
  currentCard: Segment[];
  onUpdateCard: (newCard: Segment[]) => void;
  onBackToMenu: () => void;
  onAdvanceWeek: () => void;
}

const MATCH_TYPES: MatchType[] = [
  'Singles',
  'Tag Team',
  'Triple Threat',
  'Fatal 4-Way',
  'Hardcore / No DQ',
  'Steel Cage',
  'Ladder Match',
  'Submission Match',
  'Iron Man (30 Min)',
  'Hell in a Cell',
  'TLC (Tables Ladders Chairs)',
  'Last Man Standing',
  'Falls Count Anywhere',
  'Battle Royal / Royal Rumble',
  '6-Man Tag',
  'Elimination Chamber'
];

const ANGLE_TYPES: AngleType[] = [
  'In-Ring Promo',
  'Backstage Ambush',
  'Contract Signing',
  'Confrontation / Staredown',
  'Interview Segment',
  'Hype Video / Vignette',
  'Faction War / Gang Attack'
];

const FINISH_TYPES: FinishType[] = [
  'Clean Pinfall',
  'Submission',
  'Disqualification (DQ)',
  'Countout',
  'Distraction Rollup',
  'Weapon / Foreign Object',
  'Heel Turn / Screwjob',
  'Over The Top Rope',
  'Last Man Standing 10-Count'
];

export const BookShowView: React.FC<BookShowViewProps> = ({
  promotion,
  currentWeek = 1,
  currentYear = 2026,
  currentCard,
  onUpdateCard,
  onBackToMenu,
  onAdvanceWeek
}) => {
  // PPV Check
  const ppvSchedule = (promotion.ppvSchedule && promotion.ppvSchedule.length > 0)
    ? promotion.ppvSchedule
    : DEFAULT_PPV_CALENDAR;
  const currentPPV = ppvSchedule.find(p => p.weekNumber === currentWeek);

  // Segment Builder Drawer / Modal State
  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [category, setCategory] = useState<'Match' | 'Angle'>('Match');
  const [matchType, setMatchType] = useState<MatchType>('Singles');
  const [customMatchRuleId, setCustomMatchRuleId] = useState<string>('');
  const [angleType, setAngleType] = useState<AngleType>('In-Ring Promo');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [winnerId, setWinnerId] = useState<string>('');
  const [finishType, setFinishType] = useState<FinishType>('Clean Pinfall');
  const [durationMinutes, setDurationMinutes] = useState<number>(12);
  const [titleId, setTitleId] = useState<string>('');
  const [feudId, setFeudId] = useState<string>('');
  const [segmentNotes, setSegmentNotes] = useState<string>('');

  const activeRoster = promotion.roster.filter(w => !w.injury.injured);

  // Helper to start creating a new segment
  const handleStartAddSegment = () => {
    setEditingSegmentId(null);
    setCategory('Match');
    setMatchType('Singles');
    setCustomMatchRuleId('');
    setAngleType('In-Ring Promo');
    setSelectedParticipants([]);
    setWinnerId('');
    setFinishType('Clean Pinfall');
    setDurationMinutes(12);
    setTitleId('');
    setFeudId('');
    setSegmentNotes('');
    setIsAddingSegment(true);
  };

  // Helper to start editing an existing segment
  const handleStartEditSegment = (seg: Segment) => {
    setEditingSegmentId(seg.id);
    setCategory(seg.category);
    setMatchType(seg.matchType || 'Singles');
    setCustomMatchRuleId(seg.customMatchRuleId || '');
    setAngleType(seg.angleType || 'In-Ring Promo');
    setSelectedParticipants([...seg.participantIds]);
    setWinnerId(seg.winnerId || '');
    setFinishType(seg.finishType || 'Clean Pinfall');
    setDurationMinutes(seg.durationMinutes || 12);
    setTitleId(seg.titleId || '');
    setFeudId(seg.feudId || '');
    setSegmentNotes(seg.notes || '');
    setIsAddingSegment(true);
  };

  const handleCancelModal = () => {
    setIsAddingSegment(false);
    setEditingSegmentId(null);
    setSelectedParticipants([]);
    setWinnerId('');
    setTitleId('');
    setFeudId('');
    setCustomMatchRuleId('');
    setSegmentNotes('');
  };

  // Helper to toggle participant selection
  const toggleParticipant = (id: string) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter(p => p !== id));
      if (winnerId === id) setWinnerId('');
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
      if (!winnerId) setWinnerId(id);
    }
  };

  // Add or update segment on the card
  const handleSaveSegment = () => {
    if (selectedParticipants.length === 0) return;

    if (editingSegmentId) {
      // Update existing segment in place
      const updated = currentCard.map(s => {
        if (s.id !== editingSegmentId) return s;
        return {
          ...s,
          category,
          matchType: category === 'Match' ? matchType : undefined,
          customMatchRuleId: category === 'Match' && matchType === 'Custom Match' ? customMatchRuleId : undefined,
          angleType: category === 'Angle' ? angleType : undefined,
          participantIds: selectedParticipants,
          winnerId: category === 'Match' ? winnerId : undefined,
          finishType: category === 'Match' ? finishType : undefined,
          durationMinutes,
          titleId: titleId ? titleId : undefined,
          feudId: feudId ? feudId : undefined,
          notes: segmentNotes.trim() ? segmentNotes.trim() : undefined
        };
      });
      onUpdateCard(updated);
    } else {
      // Add new segment
      const newSegment: Segment = {
        id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        segmentNumber: currentCard.length + 1,
        category,
        matchType: category === 'Match' ? matchType : undefined,
        customMatchRuleId: category === 'Match' && matchType === 'Custom Match' ? customMatchRuleId : undefined,
        angleType: category === 'Angle' ? angleType : undefined,
        participantIds: selectedParticipants,
        winnerId: category === 'Match' ? winnerId : undefined,
        finishType: category === 'Match' ? finishType : undefined,
        durationMinutes,
        titleId: titleId ? titleId : undefined,
        feudId: feudId ? feudId : undefined,
        notes: segmentNotes.trim() ? segmentNotes.trim() : undefined
      };
      onUpdateCard([...currentCard, newSegment]);
    }

    handleCancelModal();
  };

  // Delete segment
  const handleDeleteSegment = (id: string) => {
    const updated = currentCard.filter(s => s.id !== id).map((s, idx) => ({
      ...s,
      segmentNumber: idx + 1
    }));
    onUpdateCard(updated);
  };

  // Move segment up or down
  const handleMoveSegment = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentCard.length) return;

    const newArr = [...currentCard];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;

    const reindexed = newArr.map((s, idx) => ({ ...s, segmentNumber: idx + 1 }));
    onUpdateCard(reindexed);
  };

  // Auto-Book Smart Card (Helper for GM)
  const handleAutoBookCard = () => {
    const available = [...activeRoster].sort((a, b) => b.overness - a.overness);
    if (available.length < 6) return;

    const autoSegments: Segment[] = [];
    const topFeud = promotion.feuds[0];
    const worldTitle = promotion.titles[0];

    // Segment 1: Opener Match (High energy)
    autoSegments.push({
      id: `auto-1-${Date.now()}`,
      segmentNumber: 1,
      category: 'Match',
      matchType: 'Singles',
      participantIds: [available[4]?.id || available[0].id, available[5]?.id || available[1].id],
      winnerId: available[4]?.id || available[0].id,
      finishType: 'Clean Pinfall',
      durationMinutes: 10
    });

    // Segment 2: Heated In-Ring Promo (Top Feud)
    if (topFeud && topFeud.wrestlerAIds[0] && topFeud.wrestlerBIds[0]) {
      autoSegments.push({
        id: `auto-2-${Date.now()}`,
        segmentNumber: 2,
        category: 'Angle',
        angleType: 'In-Ring Promo',
        participantIds: [topFeud.wrestlerAIds[0], topFeud.wrestlerBIds[0]],
        durationMinutes: 8,
        feudId: topFeud.id
      });
    }

    // Segment 3: Upper Midcard Match
    autoSegments.push({
      id: `auto-3-${Date.now()}`,
      segmentNumber: 3,
      category: 'Match',
      matchType: 'Hardcore / No DQ',
      participantIds: [available[2]?.id || available[0].id, available[3]?.id || available[1].id],
      winnerId: available[2]?.id || available[0].id,
      finishType: 'Weapon / Foreign Object',
      durationMinutes: 14
    });

    // Segment 4: Backstage Attack / Angle
    autoSegments.push({
      id: `auto-4-${Date.now()}`,
      segmentNumber: 4,
      category: 'Angle',
      angleType: 'Backstage Ambush',
      participantIds: [available[1]?.id || available[0].id, available[0]?.id],
      durationMinutes: 5,
      feudId: topFeud?.id
    });

    // Segment 5: Main Event (Championship match or marquee clash)
    const mainA = available[0]?.id;
    const mainB = available[1]?.id;
    autoSegments.push({
      id: `auto-5-${Date.now()}`,
      segmentNumber: 5,
      category: 'Match',
      matchType: 'Singles',
      participantIds: [mainA, mainB],
      winnerId: mainA,
      finishType: 'Clean Pinfall',
      durationMinutes: 20,
      titleId: worldTitle?.id,
      feudId: topFeud?.id
    });

    onUpdateCard(autoSegments);
  };

  // Build Markdown table of current show card
  let cardMarkdown = `| Seg # | Type | Stipulation / Format | Participants | Winner / Outcome | Duration | Stakes / Rivalry |
|---|---|---|---|---|---|---|
`;
  if (currentCard.length === 0) {
    cardMarkdown += `| - | No segments booked | - | - | - | - | - |`;
  } else {
    currentCard.forEach(seg => {
      const typeStr = seg.category === 'Match' ? `Match (${seg.matchType})` : `Angle (${seg.angleType})`;
      const participantNames = seg.participantIds
        .map(id => promotion.roster.find(w => w.id === id)?.name || id)
        .join(' vs. ');
      const winnerName = seg.winnerId
        ? promotion.roster.find(w => w.id === seg.winnerId)?.name || 'Undecided'
        : 'N/A';
      const finishStr = seg.category === 'Match' ? `${winnerName} (${seg.finishType})` : 'Promo Segment';
      const titleName = seg.titleId ? promotion.titles.find(t => t.id === seg.titleId)?.name : 'None';
      const feudName = seg.feudId ? promotion.feuds.find(f => f.id === seg.feudId)?.name : 'None';
      const stakes = titleName !== 'None' ? `🏆 ${titleName}` : feudName !== 'None' ? `🔥 ${feudName}` : '-';

      cardMarkdown += `| ${seg.segmentNumber} | ${seg.category} | ${seg.matchType || seg.angleType} | ${participantNames} | ${finishStr} | ${seg.durationMinutes}m | ${stakes} |\n`;
    });
  }

  // Real-time estimated evaluation of segment being configured
  const draftEvaluation = isAddingSegment && selectedParticipants.length > 0
    ? evaluateSegment(
        {
          id: editingSegmentId || 'draft',
          segmentNumber: editingSegmentId
            ? (currentCard.find(s => s.id === editingSegmentId)?.segmentNumber || currentCard.length)
            : currentCard.length + 1,
          category,
          matchType: category === 'Match' ? matchType : undefined,
          customMatchRuleId: category === 'Match' && matchType === 'Custom Match' ? customMatchRuleId : undefined,
          angleType: category === 'Angle' ? angleType : undefined,
          participantIds: selectedParticipants,
          winnerId: category === 'Match' ? winnerId : undefined,
          finishType: category === 'Match' ? finishType : undefined,
          durationMinutes,
          titleId: titleId || undefined,
          feudId: feudId || undefined,
          notes: segmentNotes || undefined
        },
        editingSegmentId
          ? currentCard.map(s => s.id === editingSegmentId ? {
              ...s,
              category,
              matchType: category === 'Match' ? matchType : undefined,
              customMatchRuleId: category === 'Match' && matchType === 'Custom Match' ? customMatchRuleId : undefined,
              angleType: category === 'Angle' ? angleType : undefined,
              participantIds: selectedParticipants,
              winnerId: category === 'Match' ? winnerId : undefined,
              finishType: category === 'Match' ? finishType : undefined,
              durationMinutes,
              titleId: titleId || undefined,
              feudId: feudId || undefined
            } : s)
          : currentCard,
        promotion.roster,
        promotion.feuds,
        promotion
      )
    : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* PPV Marquee Banner if current week is a PPV */}
      {currentPPV && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg ${
          currentPPV.isSupercard
            ? 'bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-zinc-900 border-amber-500/50'
            : 'bg-zinc-900 border-amber-500/40'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-amber-500 text-black">
                🏆 PPV BROADCAST WEEK
              </span>
              {currentPPV.isSupercard && (
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-purple-500 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> FLAGSHIP SUPERCARD
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-white font-mono">{currentPPV.name}</h3>
            <p className="text-xs text-zinc-300 font-sans mt-0.5">
              Theme: <span className="text-amber-400 font-semibold">{currentPPV.theme}</span> • Venue: {currentPPV.venue} ({formatNumber(currentPPV.venueCapacity)} Seats)
            </p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 font-mono text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase block">Ticket Price</span>
              <span className="text-emerald-400 font-bold">${currentPPV.ticketPrice}</span>
            </div>
            <div className="border-l border-zinc-800 pl-3">
              <span className="text-[10px] text-zinc-400 uppercase block">Buyrate Multiplier</span>
              <span className="text-amber-400 font-bold">{currentPPV.buyrateMultiplier}x</span>
            </div>
            <div className="border-l border-zinc-800 pl-3">
              <span className="text-[10px] text-zinc-400 uppercase block">Prestige Bonus</span>
              <span className="text-purple-400 font-bold">+{currentPPV.prestigeBonus} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Controls */}
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
            <span>[ 1 ] Show Booking Terminal</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {currentPPV ? currentPPV.name : promotion.weeklyTVShow}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoBookCard}
            className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 border border-zinc-700 transition"
            title="Automatically populate a balanced card with your top talent"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Book Card</span>
          </button>
          <button
            type="button"
            onClick={handleStartAddSegment}
            className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Segment</span>
          </button>
        </div>
      </div>

      {/* Markdown Table of the Card */}
      <MarkdownTableView
        title={`SHOW CARD: ${promotion.weeklyTVShow.toUpperCase()} (${currentCard.length} SEGMENTS)`}
        markdown={cardMarkdown}
        defaultToMarkdown={false}
      >
        <div className="text-xs text-zinc-400 font-mono">
          EWR Rule: The Main Event accounts for 35% of the show rating, while the Upper Midcard accounts for 25%. Arrange your marquee encounters at the bottom of the card.
        </div>
      </MarkdownTableView>

      {/* Segment Cards List */}
      <div className="space-y-3">
        {currentCard.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl p-8">
            <Trophy className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-200 font-mono">The Show Card is Empty</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4">
              Construct your television card segment by segment, or use the Auto-Book Assistant to draft an instant marquee card.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleStartAddSegment}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs"
              >
                + Add First Segment
              </button>
              <button
                type="button"
                onClick={handleAutoBookCard}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs border border-zinc-700"
              >
                Auto-Draft Card
              </button>
            </div>
          </div>
        ) : (
          currentCard.map((seg, idx) => {
            const isMainEvent = idx === currentCard.length - 1;
            const isUpperMidcard = idx === currentCard.length - 2 && currentCard.length >= 3;
            const participants = seg.participantIds
              .map(id => promotion.roster.find(w => w.id === id))
              .filter(Boolean) as Wrestler[];
            const winner = promotion.roster.find(w => w.id === seg.winnerId);
            const title = promotion.titles.find(t => t.id === seg.titleId);
            const feud = promotion.feuds.find(f => f.id === seg.feudId);
            const customRule = seg.customMatchRuleId
              ? promotion.customMatchRules?.find(r => r.id === seg.customMatchRuleId)
              : undefined;

            return (
              <div
                key={seg.id}
                className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                  isMainEvent
                    ? 'bg-zinc-900 border-amber-500/80 shadow-md shadow-amber-500/5'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded bg-zinc-950 border border-zinc-800 font-mono font-bold text-zinc-200 shrink-0">
                    <span className="text-[10px] text-zinc-500">SEG</span>
                    <span className="text-sm text-amber-400">#{seg.segmentNumber}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                        {seg.category === 'Match' ? seg.matchType : seg.angleType}
                      </span>
                      {customRule && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                          ⚡ {customRule.name}
                        </span>
                      )}
                      {isMainEvent && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                          ★ MAIN EVENT (35% Weight)
                        </span>
                      )}
                      {isUpperMidcard && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold border border-sky-500/30">
                          ★ UPPER MIDCARD (25% Weight)
                        </span>
                      )}
                      {title && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono flex items-center gap-1 border border-yellow-500/30">
                          <Trophy className="w-3 h-3" /> {title.name}
                        </span>
                      )}
                      {feud && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-mono flex items-center gap-1 border border-orange-500/30">
                          <Flame className="w-3 h-3" /> Feud ({feud.heat})
                        </span>
                      )}
                    </div>

                    {/* Participants & Match Details */}
                    <div className="text-sm font-semibold text-white font-mono">
                      {seg.category === 'Match' ? (
                        <span>
                          {participants.map(p => p.name).join(' vs. ')}
                        </span>
                      ) : (
                        <span>
                          Featuring {participants.map(p => p.name).join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {seg.durationMinutes} Minutes
                      </span>
                      {seg.category === 'Match' && winner && (
                        <span>
                          Winner: <strong className="text-emerald-400">{winner.name}</strong> via {seg.finishType}
                        </span>
                      )}
                    </div>

                    {/* Custom Segment Notes & Instructions */}
                    {seg.notes && (
                      <div className="text-xs text-zinc-300 font-sans bg-zinc-950/80 px-2.5 py-1.5 rounded border border-zinc-800/80 mt-1 max-w-xl">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase font-bold mr-1.5">Notes:</span>
                        {seg.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls: Edit, Move up/down, delete */}
                <div className="flex items-center gap-1.5 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleStartEditSegment(seg)}
                    className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-zinc-700 hover:border-amber-500 transition flex items-center gap-1 font-mono text-xs font-bold"
                    title="Edit & Customize this segment"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSegment(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-300 transition"
                    title="Move Segment Earlier in Card"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSegment(idx, 'down')}
                    disabled={idx === currentCard.length - 1}
                    className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-300 transition"
                    title="Move Segment Later in Card"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSegment(seg.id)}
                    className="p-2 rounded bg-zinc-800 hover:bg-rose-900/60 hover:text-rose-300 text-zinc-400 transition"
                    title="Delete Segment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Advance Broadcast Bottom Action */}
      {currentCard.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-zinc-400">
            Card is primed with <strong className="text-zinc-200">{currentCard.length} segments</strong>.
            Total Broadcast Time: <strong className="text-amber-400">{currentCard.reduce((a, b) => a + b.durationMinutes, 0)} minutes</strong>.
          </div>
          <button
            type="button"
            onClick={onAdvanceWeek}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PROCEED TO BROADCAST & ADVANCE WEEK</span>
          </button>
        </div>
      )}

      {/* Modal / Form for Adding a Segment */}
      {isAddingSegment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                {editingSegmentId ? (
                  <>
                    <Pencil className="w-5 h-5 text-amber-400" />
                    <span>
                      Edit & Customize Segment #{currentCard.find(s => s.id === editingSegmentId)?.segmentNumber || ''}
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-amber-400" />
                    <span>Book New Segment (#{currentCard.length + 1})</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={handleCancelModal}
                className="text-zinc-400 hover:text-white font-mono text-sm"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Category Toggle: Match vs Angle */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setCategory('Match')}
                className={`py-2.5 rounded border font-bold transition ${
                  category === 'Match'
                    ? 'bg-amber-500 text-black border-amber-500 shadow'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                1. Wrestling Match
              </button>
              <button
                type="button"
                onClick={() => setCategory('Angle')}
                className={`py-2.5 rounded border font-bold transition ${
                  category === 'Angle'
                    ? 'bg-amber-500 text-black border-amber-500 shadow'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                2. Angle / Promo / Backstage
              </button>
            </div>

            {/* Match or Angle Type Selection */}
            {category === 'Match' ? (
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-400">Match Stipulation & Format</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  {MATCH_TYPES.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMatchType(m);
                        setCustomMatchRuleId('');
                      }}
                      className={`p-2 rounded border text-center transition truncate ${
                        matchType === m && !customMatchRuleId
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Custom Built Match Rules */}
                {promotion.customMatchRules && promotion.customMatchRules.length > 0 && (
                  <div className="pt-2">
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">Custom Built Stipulations:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                      {promotion.customMatchRules.map(rule => (
                        <button
                          key={rule.id}
                          type="button"
                          onClick={() => {
                            setMatchType('Custom Match');
                            setCustomMatchRuleId(rule.id);
                          }}
                          className={`p-2 rounded border text-left transition ${
                            matchType === 'Custom Match' && customMatchRuleId === rule.id
                              ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-bold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="truncate font-bold">{rule.name}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{rule.dangerLevel} • +{rule.spectacleBonus} pts</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-400">Angle / Entertainment Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                  {ANGLE_TYPES.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAngleType(a)}
                      className={`p-2 rounded border text-center transition ${
                        angleType === a
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Participants Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-zinc-400">
                  Select Participants ({selectedParticipants.length} chosen)
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">Click to toggle wrestlers</span>
              </div>

              {/* Quick Tag Team Insert Helper */}
              {promotion.tagTeams && promotion.tagTeams.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs pb-1">
                  <span className="text-zinc-500 text-[11px]">Quick Insert Tag Team:</span>
                  {promotion.tagTeams.filter(t => t.isActive).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedParticipants(prev => Array.from(new Set([...prev, ...t.memberIds])));
                      }}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-sky-500/20 hover:text-sky-300 text-zinc-300 border border-zinc-700 text-[11px] transition"
                    >
                      + {t.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-zinc-950 rounded border border-zinc-800 font-mono text-xs">
                {activeRoster.map(w => {
                  const isSelected = selectedParticipants.includes(w.id);
                  const appearancesOnCard = currentCard.filter(s => s.participantIds.includes(w.id)).length;
                  const gimmickGrade = w.gimmick?.grade || 'B';

                  return (
                    <div
                      key={w.id}
                      onClick={() => toggleParticipant(w.id)}
                      className={`p-2 rounded border cursor-pointer flex flex-col justify-between transition ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate">{w.name}</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] px-1 rounded font-bold ${
                            gimmickGrade === 'S' ? 'bg-amber-400 text-black' :
                            gimmickGrade === 'A' ? 'bg-emerald-500 text-black' :
                            gimmickGrade === 'F' ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {gimmickGrade}
                          </span>
                          <span className={`text-[10px] px-1 rounded ${w.alignment === 'Face' ? 'text-sky-400 bg-sky-950' : 'text-rose-400 bg-rose-950'}`}>
                            {w.alignment}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                        <span>Pop: {w.overness} | Work: {w.workrate}</span>
                        {appearancesOnCard > 0 && (
                          <span className="text-amber-400" title={`Already on show card ${appearancesOnCard}x`}>
                            ⚠️ x{appearancesOnCard}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Match Specifics: Winner, Finish, Stakes */}
            {category === 'Match' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* Winner Selection */}
                <div>
                  <label className="block text-zinc-400 mb-1">Match Winner</label>
                  <select
                    value={winnerId}
                    onChange={e => setWinnerId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- No Winner (Draw / No Contest) --</option>
                    {selectedParticipants.map(id => {
                      const w = promotion.roster.find(w => w.id === id);
                      return w ? <option key={w.id} value={w.id}>{w.name}</option> : null;
                    })}
                  </select>
                </div>

                {/* Finish Type */}
                <div>
                  <label className="block text-zinc-400 mb-1">Finish Type</label>
                  <select
                    value={finishType}
                    onChange={e => setFinishType(e.target.value as FinishType)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {FINISH_TYPES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Championship on the line */}
                <div>
                  <label className="block text-zinc-400 mb-1">Title Defense (Optional)</label>
                  <select
                    value={titleId}
                    onChange={e => setTitleId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Non-Title Match --</option>
                    {promotion.titles.filter(t => !t.isRetired).map(t => {
                      const holderNames = t.currentHolderIds
                        .map(id => promotion.roster.find(w => w.id === id)?.name || id)
                        .join(' & ') || 'VACANT';
                      return (
                        <option key={t.id} value={t.id}>
                          🏆 {t.name} [{holderNames}] (Prestige: {t.prestige})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Feud Tie-in */}
                <div>
                  <label className="block text-zinc-400 mb-1">Active Rivalry Link (Optional)</label>
                  <select
                    value={feudId}
                    onChange={e => setFeudId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Standalone Exhibition --</option>
                    {promotion.feuds.map(f => (
                      <option key={f.id} value={f.id}>{f.name} (Heat: {f.heat})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Duration Slider */}
            <div className="font-mono text-xs">
              <div className="flex items-center justify-between mb-1 text-zinc-400">
                <span>Segment Duration</span>
                <span className="text-amber-400 font-bold">{durationMinutes} Minutes</span>
              </div>
              <input
                type="range"
                min={3}
                max={45}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Custom Notes & Producer Instructions */}
            <div className="font-mono text-xs">
              <label className="block text-zinc-400 mb-1">
                Segment Notes, Storyline Cues & Finish Instructions (Optional)
              </label>
              <textarea
                value={segmentNotes}
                onChange={e => setSegmentNotes(e.target.value)}
                placeholder="e.g. Referee bump at 14 mins, run-in by rival faction, pre-match mic promo, or special stipulation..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none font-mono text-xs"
              />
            </div>

            {/* Real-time EWR Engine Live Rating Predictor Preview */}
            {draftEvaluation && (
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Booker Estimate Rating:
                  </span>
                  <span className="text-amber-400 font-bold text-sm">
                    ~{draftEvaluation.score}/100 ({draftEvaluation.starString})
                  </span>
                </div>
                {draftEvaluation.notes.length > 0 && (
                  <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80 space-y-0.5">
                    {draftEvaluation.notes.map((note, i) => (
                      <div key={i} className="text-amber-300/80">• {note}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800 font-mono text-xs">
              <button
                type="button"
                onClick={handleCancelModal}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSegment}
                disabled={selectedParticipants.length === 0}
                className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black font-bold transition shadow"
              >
                {editingSegmentId ? 'Save Segment Changes' : 'Save Segment to Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

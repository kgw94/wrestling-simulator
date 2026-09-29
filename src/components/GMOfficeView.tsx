import React, { useState } from 'react';
import { 
  Promotion, 
  GeneralManager, 
  GMBookingDirective, 
  GMProposal, 
  Segment, 
  Wrestler,
  ShowResult
} from '../types';
import { 
  DEFAULT_AVAILABLE_GMS, 
  generateGMProposal, 
  getDefaultGMForPromotion 
} from '../engine/gmEngine';
import { formatNumber } from '../utils/format';
import { 
  Briefcase, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  Zap, 
  Award, 
  ChevronLeft, 
  Play, 
  Sliders, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Swords, 
  CheckCircle, 
  Check, 
  ArrowRight,
  Flame,
  UserCheck,
  RefreshCw,
  Edit3
} from 'lucide-react';

interface GMOfficeViewProps {
  promotion: Promotion;
  currentWeek: number;
  currentYear: number;
  currentCard: Segment[];
  onUpdatePromotion: (updatedPromo: Promotion) => void;
  onUpdateCard: (newCard: Segment[]) => void;
  onAdvanceWeek: () => void;
  onBackToMenu: () => void;
  onOpenBookShow: () => void;
}

const DIRECTIVES: { id: GMBookingDirective; name: string; tag: string; description: string; icon: string }[] = [
  {
    id: 'balanced',
    name: 'Balanced Showcase',
    tag: 'Standard TV Model',
    description: 'Presents a versatile broadcast balancing technical workrate, crowd-pleasing angles, and championship prestige.',
    icon: '⚖️'
  },
  {
    id: 'world_title_focus',
    name: 'World Title & Rivalry Climax',
    tag: 'Main Event Focus',
    description: 'Dedicates premium television time and promo slots to the World Championship and hottest active feuds.',
    icon: '🏆'
  },
  {
    id: 'rest_and_protect',
    name: 'Rest & Protect Fatigued Stars',
    tag: 'Injury Prevention',
    description: 'Strictly benches worn-down superstars (Fatigue > 35%) to avoid muscle tears and preserve stamina for PPVs.',
    icon: '🛡️'
  },
  {
    id: 'youth_movement',
    name: 'Youth Movement & Prospects',
    tag: 'Next Generation',
    description: 'Gives openers and high-workrate wrestlers under 30 prominent TV exposure to create tomorrow\'s franchise pillars.',
    icon: '🌱'
  },
  {
    id: 'high_drama_angles',
    name: 'High Drama & Spectacle',
    tag: 'Ratings War',
    description: 'Stacks the broadcast with mic battles, contract signings, backstage brawls, and faction confrontations.',
    icon: '🎭'
  },
  {
    id: 'workrate_clinic',
    name: 'Pure In-Ring Masterclass',
    tag: 'Wrestling Clinic',
    description: 'Features 15-20 minute technical singles bouts with clean pinfalls and submissions. Minimizes talking segments.',
    icon: '🤼'
  }
];

export const GMOfficeView: React.FC<GMOfficeViewProps> = ({
  promotion,
  currentWeek,
  currentYear,
  currentCard,
  onUpdatePromotion,
  onUpdateCard,
  onAdvanceWeek,
  onBackToMenu,
  onOpenBookShow
}) => {
  const currentGM: GeneralManager = promotion.currentGM || getDefaultGMForPromotion(promotion.style);
  const availableGMs: GeneralManager[] = promotion.availableGMs && promotion.availableGMs.length > 0 
    ? promotion.availableGMs 
    : DEFAULT_AVAILABLE_GMS;

  const [activeTab, setActiveTab] = useState<'proposal' | 'directives' | 'workload' | 'hire'>('proposal');
  const [activeProposal, setActiveProposal] = useState<GMProposal | null>(
    promotion.pendingGMProposal || generateGMProposal(promotion, currentGM.activeDirective, currentWeek, currentYear)
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper to re-generate proposal with current or new directive
  const handleRegenerateProposal = (directive?: GMBookingDirective) => {
    const dir = directive || currentGM.activeDirective || currentGM.preferredDirective;
    const newProposal = generateGMProposal(promotion, dir, currentWeek, currentYear);
    setActiveProposal(newProposal);
    
    // Save to promotion
    onUpdatePromotion({
      ...promotion,
      pendingGMProposal: newProposal
    });

    setSuccessMessage(`GM ${currentGM.name} has re-drafted the show card under the "${dir.replace(/_/g, ' ')}" directive!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Change directive
  const handleSelectDirective = (directive: GMBookingDirective) => {
    const updatedGM: GeneralManager = {
      ...currentGM,
      activeDirective: directive
    };

    const newProposal = generateGMProposal(promotion, directive, currentWeek, currentYear);
    setActiveProposal(newProposal);

    onUpdatePromotion({
      ...promotion,
      currentGM: updatedGM,
      pendingGMProposal: newProposal
    });

    setSuccessMessage(`Operational directive updated to "${directive.replace(/_/g, ' ').toUpperCase()}". New card drafted!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Approve card as-is and immediately run broadcast!
  const handleApproveAndRunShow = () => {
    if (!activeProposal) return;
    
    // Push the GM's drafted segments to currentCard
    onUpdateCard(activeProposal.segments);

    // Save proposal status as approved
    onUpdatePromotion({
      ...promotion,
      pendingGMProposal: {
        ...activeProposal,
        status: 'approved'
      }
    });

    // Advance the week!
    onAdvanceWeek();
  };

  // Push proposal to card builder for custom tweaking
  const handleSendToCardBuilder = () => {
    if (!activeProposal) return;
    onUpdateCard(activeProposal.segments);
    onOpenBookShow();
  };

  // Hire a different GM
  const handleHireGM = (candidate: GeneralManager) => {
    if (candidate.id === currentGM.id) return;
    if (window.confirm(`Hire ${candidate.name} as your new General Manager ($${formatNumber(candidate.salaryWeekly)}/week)? Current GM ${currentGM.name} will step down.`)) {
      const hiredGM: GeneralManager = {
        ...candidate,
        isHired: true,
        activeDirective: candidate.preferredDirective
      };

      const newAvailable = availableGMs.map(g => {
        if (g.id === candidate.id) return { ...g, isHired: true };
        if (g.id === currentGM.id) return { ...g, isHired: false };
        return g;
      });

      const newProposal = generateGMProposal(
        { ...promotion, currentGM: hiredGM },
        hiredGM.preferredDirective,
        currentWeek,
        currentYear
      );

      setActiveProposal(newProposal);
      onUpdatePromotion({
        ...promotion,
        currentGM: hiredGM,
        availableGMs: newAvailable,
        pendingGMProposal: newProposal
      });

      setSuccessMessage(`${hiredGM.name} is now the official General Manager of ${promotion.weeklyTVShow}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const fatiguedStars = promotion.roster.filter(w => w.fatigue >= 35 && !w.injury.injured);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToMenu}
              className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-amber-400 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              Executive Front Office
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase mt-1 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-amber-400" />
            <span>General Manager Booking Desk</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Your GM handles weekly matchmaking and segment scripting. Review their auto-booked television card, apply executive vetoes, or grant one-click broadcast approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenBookShow}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold border border-zinc-700 flex items-center gap-2 transition"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Open Manual Card Editor</span>
          </button>
          <button
            type="button"
            onClick={handleApproveAndRunShow}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Approve & Run Broadcast</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* GM Dossier Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* GM Bio & Avatar */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {currentGM.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white font-mono">{currentGM.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {currentGM.archetype.replace('_', ' ')}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  ${formatNumber(currentGM.salaryWeekly)}/wk
                </span>
              </div>
              <p className="text-xs text-amber-400/90 font-mono font-medium mt-0.5">
                {currentGM.title} • &ldquo;{currentGM.nickname}&rdquo;
              </p>
              <p className="text-xs text-zinc-400 font-sans mt-1.5 max-w-2xl leading-relaxed">
                {currentGM.bio}
              </p>
            </div>
          </div>

          {/* GM Relationship & Performance Meters */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 font-mono text-center">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">Executive Trust</span>
              <span className={`text-base font-bold ${currentGM.trustScore >= 75 ? 'text-emerald-400' : currentGM.trustScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {currentGM.trustScore}%
              </span>
              <span className="text-[9px] text-zinc-500">
                {currentGM.trustScore >= 80 ? 'Steadfast' : currentGM.trustScore >= 60 ? 'Cooperative' : 'Strained'}
              </span>
            </div>

            <div className="flex flex-col border-l border-zinc-800">
              <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">Shows Run</span>
              <span className="text-base font-bold text-white">
                {currentGM.showsRunCount}
              </span>
              <span className="text-[9px] text-zinc-500">Broadcasts</span>
            </div>

            <div className="flex flex-col border-l border-zinc-800">
              <span className="text-[10px] uppercase text-zinc-500 font-sans font-semibold">Card Approval</span>
              <span className="text-base font-bold text-amber-300">
                {currentGM.approvalRate}%
              </span>
              <span className="text-[9px] text-zinc-500">As-Is Rate</span>
            </div>
          </div>
        </div>

        {/* GM Perk Banner */}
        <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-white font-mono">Special Perk: {currentGM.perk.name}</span>
              <span className="text-xs text-zinc-400 font-sans block sm:inline sm:ml-2">
                {currentGM.perk.description}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-zinc-800 text-amber-400 border border-zinc-700 text-xs font-mono font-bold whitespace-nowrap self-start sm:self-auto">
            {currentGM.perk.effectBadge}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('proposal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
            activeTab === 'proposal'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Weekly Card Proposal (Review & Approve)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('directives')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
            activeTab === 'directives'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Operational Directives</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
            activeTab === 'workload'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Roster Workload & Fatigue ({fatiguedStars.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hire')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
            activeTab === 'hire'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Front Office Staff / Hire GM</span>
        </button>
      </div>

      {/* Tab 1: Weekly Card Proposal */}
      {activeTab === 'proposal' && (
        <div className="space-y-5">
          {activeProposal ? (
            <div className="space-y-4">
              {/* Proposal Header Banner */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                      Drafted by {activeProposal.gmName}
                    </span>
                    <span>•</span>
                    <span>Directive: {activeProposal.activeDirective.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    {promotion.weeklyTVShow} • Week {currentWeek}, Year {currentYear}
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
                    {activeProposal.executiveSummary}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800 text-center font-mono">
                    <div className="text-[10px] text-zinc-500 uppercase">Projected Rating</div>
                    <div className="text-base font-bold text-amber-400">
                      {activeProposal.projectedShowRating}/100
                    </div>
                    <div className="text-[9px] text-zinc-400">{activeProposal.projectedStarRating}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRegenerateProposal()}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition"
                    title="Ask GM to Re-Draft Card"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rested talent badge notification */}
              {activeProposal.restedStars && activeProposal.restedStars.length > 0 && (
                <div className="bg-sky-950/20 border border-sky-500/30 rounded-xl p-3.5 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-sky-300 font-mono">
                      GM Rest Advisory: {activeProposal.restedStars.length} Superstars Benched to Protect Health
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {activeProposal.restedStars.map(r => `${r.name} (Fatigue: ${r.currentFatigue}%)`).join(', ')} were kept off the card to prevent muscle strain and career wear-and-tear.
                    </p>
                  </div>
                </div>
              )}

              {/* Segment Cards List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                  <span>Scripted Match Card ({activeProposal.segments.length} Segments)</span>
                  <span>Awaiting Your Executive Sign-Off</span>
                </div>

                {activeProposal.segments.map((seg, idx) => {
                  const participants = seg.participantIds
                    .map(id => promotion.roster.find(w => w.id === id))
                    .filter((w): w is Wrestler => Boolean(w));
                  const winner = promotion.roster.find(w => w.id === seg.winnerId);
                  const title = promotion.titles.find(t => t.id === seg.titleId);
                  const feud = promotion.feuds.find(f => f.id === seg.feudId);

                  return (
                    <div 
                      key={seg.id}
                      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-mono text-xs font-bold border border-zinc-700">
                            #{seg.segmentNumber}
                          </span>
                          <span className="text-xs font-bold text-white font-mono">
                            {seg.category === 'Match' ? `MATCH: ${seg.matchType}` : `ANGLE: ${seg.angleType}`}
                          </span>
                          {seg.gmTag && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {seg.gmTag}
                            </span>
                          )}
                          {title && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1">
                              🏆 {title.name}
                            </span>
                          )}
                          {feud && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-400" />
                              {feud.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            {seg.durationMinutes} Mins
                          </span>
                          {seg.projectedScore && (
                            <span className="text-amber-400 font-bold">
                              Proj: ~{seg.projectedScore}/100
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Participants & Booking details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-zinc-500">Participants:</span>
                          {participants.map(p => (
                            <span 
                              key={p.id}
                              className={`px-2 py-1 rounded border ${
                                p.id === seg.winnerId
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                  : 'bg-zinc-950 text-zinc-300 border-zinc-800'
                              }`}
                            >
                              {p.name} {p.id === seg.winnerId && '★ Winner'}
                            </span>
                          ))}
                        </div>

                        {seg.category === 'Match' && seg.finishType && (
                          <div className="text-zinc-400">
                            Finish: <strong className="text-zinc-200">{seg.finishType}</strong>
                          </div>
                        )}
                      </div>

                      {/* GM Rationale Note */}
                      {seg.gmRationale && (
                        <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80 text-xs font-sans text-zinc-400 flex items-start gap-2">
                          <span className="text-amber-400 font-mono font-bold text-[11px] shrink-0">
                            GM RATIONALE:
                          </span>
                          <span>{seg.gmRationale}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Executive Approval Bar */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    Ready to Run {promotion.weeklyTVShow}?
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Granting approval will execute this exact card. Overriding segments is also supported in the editor.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSendToCardBuilder}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold border border-zinc-700 transition"
                  >
                    Edit / Override Segments
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveAndRunShow}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>One-Click Executive Approval & Broadcast</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
              <Briefcase className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-bold text-white font-mono">No Active GM Proposal</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Have General Manager {currentGM.name} draft a television show card tailored to your active roster and rivalries.
              </p>
              <button
                type="button"
                onClick={() => handleRegenerateProposal()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Draft Show Card</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Operational Directives */}
      {activeTab === 'directives' && (
        <div className="space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white font-mono">
              Operational Booking Directives
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Set the overarching philosophy for your General Manager. The GM will immediately assemble weekly cards aligned with this directive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIRECTIVES.map(d => {
              const isSelected = (currentGM.activeDirective || currentGM.preferredDirective) === d.id;

              return (
                <div
                  key={d.id}
                  onClick={() => handleSelectDirective(d.id)}
                  className={`cursor-pointer rounded-2xl p-5 border transition flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{d.icon}</span>
                      {isSelected ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-mono font-bold text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> ACTIVE DIRECTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">{d.tag}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-white font-mono text-base">{d.name}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">{d.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDirective(d.id);
                    }}
                    className={`w-full py-2 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700'
                    }`}
                  >
                    {isSelected ? 'Currently Assigned' : 'Assign to GM'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Roster Workload & Fatigue */}
      {activeTab === 'workload' && (
        <div className="space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white font-mono">
              Roster Fatigue & Injury Risk Advisory
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              General Manager {currentGM.name} monitors cumulative strain. Superstars with high fatigue risk acute injuries if booked in physical matches.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5">Superstar</th>
                    <th className="p-3.5">Age</th>
                    <th className="p-3.5">Fatigue Level</th>
                    <th className="p-3.5">Stamina</th>
                    <th className="p-3.5">Injury History</th>
                    <th className="p-3.5">GM Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {promotion.roster.map(w => {
                    const isHighFatigue = w.fatigue >= 50;
                    const isMediumFatigue = w.fatigue >= 30;

                    return (
                      <tr key={w.id} className="hover:bg-zinc-800/40 transition">
                        <td className="p-3.5 font-bold text-white flex items-center gap-2">
                          <span>{w.name}</span>
                          {w.injury.injured && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px]">
                              INJURED ({w.injury.weeksRemaining}w)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-zinc-400">{w.age} yrs</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full ${
                                  isHighFatigue ? 'bg-rose-500' : isMediumFatigue ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${w.fatigue}%` }}
                              />
                            </div>
                            <span className={isHighFatigue ? 'text-rose-400 font-bold' : isMediumFatigue ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
                              {w.fatigue}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-zinc-300">{w.stamina}/100</td>
                        <td className="p-3.5 text-zinc-400">
                          {w.careerInjuriesCount || 0} career injuries
                        </td>
                        <td className="p-3.5">
                          {w.injury.injured ? (
                            <span className="text-rose-400 font-medium">Rehabilitation required</span>
                          ) : isHighFatigue ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                              REST MANDATED (High Tear Risk)
                            </span>
                          ) : isMediumFatigue ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                              Monitor Minutes (Angle preferred)
                            </span>
                          ) : (
                            <span className="text-emerald-400">Ready for full in-ring duties</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Front Office / Hire GM */}
      {activeTab === 'hire' && (
        <div className="space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white font-mono">
              Front Office Candidates & Executive Matchmakers
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select a General Manager whose philosophy and perks best complement your promotion\'s broadcast strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableGMs.map(candidate => {
              const isCurrent = candidate.id === currentGM.id;

              return (
                <div 
                  key={candidate.id}
                  className={`bg-zinc-900 border rounded-2xl p-5 transition space-y-4 ${
                    isCurrent 
                      ? 'border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10' 
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-2xl shadow-inner">
                        {candidate.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white font-mono text-base">{candidate.name}</h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-mono font-bold">
                              CURRENT GM
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-400 font-mono">{candidate.title}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          Archetype: {candidate.archetype.replace('_', ' ')} • ${formatNumber(candidate.salaryWeekly)}/wk
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {candidate.bio}
                  </p>

                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Perk: <strong className="text-white">{candidate.perk.name}</strong></span>
                      <span className="text-amber-400 font-bold">{candidate.perk.effectBadge}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      {candidate.perk.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-xs font-mono text-zinc-400">
                      Preferred Style: <strong className="text-zinc-200">{candidate.preferredDirective.replace(/_/g, ' ')}</strong>
                    </span>

                    {isCurrent ? (
                      <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4 stroke-[3]" /> Active Under Contract
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleHireGM(candidate)}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition"
                      >
                        Hire as General Manager
                      </button>
                    )}
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

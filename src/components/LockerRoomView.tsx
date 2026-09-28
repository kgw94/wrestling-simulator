import React, { useState } from 'react';
import { Promotion, Wrestler, LockerRoomIncident, IncidentOption } from '../types';
import { SAMPLE_INCIDENTS_POOL } from '../data/customDefaults';
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
  Dice5
} from 'lucide-react';

interface LockerRoomViewProps {
  promotion: Promotion;
  currentWeek: number;
  onUpdatePromotion: (newPromo: Promotion) => void;
  onBackToMenu: () => void;
}

export const LockerRoomView: React.FC<LockerRoomViewProps> = ({
  promotion,
  currentWeek,
  onUpdatePromotion,
  onBackToMenu
}) => {
  const [meetingMessage, setMeetingMessage] = useState<string | null>(null);

  const activeIncidents: LockerRoomIncident[] = (promotion.activeIncidents || []).filter(i => !i.resolved);
  const resolvedIncidents: LockerRoomIncident[] = promotion.resolvedIncidents || [];

  const roster = promotion.roster;
  const avgMorale = Math.round(roster.reduce((sum, w) => sum + w.morale, 0) / (roster.length || 1));
  const unhappyWrestlers = roster.filter(w => w.morale < 50);
  const leaders = roster.filter(w => w.push === 'Main Eventer' && w.morale >= 80);

  // Locker room culture change
  const handleChangeCulture = (rule: 'Strict Discipline' | 'Balanced Professionalism' | 'Creative Freedom' | 'Wild West') => {
    onUpdatePromotion({
      ...promotion,
      lockerRoomRule: rule
    });
  };

  // Pre-Show Booker Actions
  const handleDeliverPepTalk = () => {
    const updatedRoster = roster.map(w => ({
      ...w,
      morale: Math.min(100, w.morale + 3)
    }));
    onUpdatePromotion({
      ...promotion,
      roster: updatedRoster
    });
    setMeetingMessage('Delivered an electrifying speech to the locker room! Morale +3 across the roster.');
    setTimeout(() => setMeetingMessage(null), 4000);
  };

  const handleDistributeBonuses = () => {
    if (promotion.budget < 25000) {
      alert('Insufficient funds to distribute locker room bonuses.');
      return;
    }
    const updatedRoster = roster.map(w => ({
      ...w,
      morale: Math.min(100, w.morale + 8)
    }));
    onUpdatePromotion({
      ...promotion,
      budget: promotion.budget - 25000,
      roster: updatedRoster
    });
    setMeetingMessage('Disbursed $25,000 in locker room merit bonuses! High morale surged (+8).');
    setTimeout(() => setMeetingMessage(null), 4000);
  };

  // Handle resolving an incident
  const handleResolveIncident = (incident: LockerRoomIncident, option: IncidentOption) => {
    let updatedRoster = [...promotion.roster];

    // Apply morale to involved wrestlers
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
    const updatedNetwork = Math.min(100, Math.max(10, promotion.networkSatisfaction + (option.networkDelta || 0)));

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

    setMeetingMessage(`Decision executed: ${option.consequenceText}`);
    setTimeout(() => setMeetingMessage(null), 5000);
  };

  // Trigger Random Incident on Demand
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
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Backstage Politics & Locker Room Culture</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <span>Locker Room Headquarters</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Manage fragile wrestling egos, mediate backstage disputes, enforce discipline, and reward top locker room leaders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToMenu}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>HQ Menu</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerRandomIncident}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-mono flex items-center gap-1.5 transition border border-zinc-700"
            title="Roll a test backstage incident"
          >
            <Dice5 className="w-4 h-4" />
            <span>Roll Incident</span>
          </button>
        </div>
      </div>

      {meetingMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{meetingMessage}</span>
        </div>
      )}

      {/* Locker Room Health Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Average Morale Gauge */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">Overall Locker Room Morale</span>
          <div className="flex items-center gap-3 my-2">
            <span className={`text-3xl font-black font-mono ${
              avgMorale >= 80 ? 'text-emerald-400' : avgMorale >= 60 ? 'text-amber-400' : 'text-rose-500'
            }`}>
              {avgMorale}%
            </span>
            <div className="text-xs font-mono text-zinc-400">
              {avgMorale >= 80 ? 'Harmonious & Fired Up' : avgMorale >= 60 ? 'Stable Dynamics' : 'Toxic & Discontent'}
            </div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                avgMorale >= 80 ? 'bg-emerald-500' : avgMorale >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${avgMorale}%` }}
            />
          </div>
        </div>

        {/* Culture Policy Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">Current Locker Room Rule</span>
          <div className="my-2">
            <div className="text-base font-bold text-white font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>{promotion.lockerRoomRule || 'Balanced Professionalism'}</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
              Defines fine severity and locker room boundaries.
            </p>
          </div>
          <select
            value={promotion.lockerRoomRule || 'Balanced Professionalism'}
            onChange={e => handleChangeCulture(e.target.value as any)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
          >
            <option value="Strict Discipline">Strict Discipline</option>
            <option value="Balanced Professionalism">Balanced Professionalism</option>
            <option value="Creative Freedom">Creative Freedom</option>
            <option value="Wild West">Wild West</option>
          </select>
        </div>

        {/* Pre-Show Locker Room Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between sm:col-span-2">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block mb-2">Pre-Show Booker Meetings</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDeliverPepTalk}
              className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold flex items-center gap-1.5 transition border border-zinc-700"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Deliver Pep Talk (+3 Morale)</span>
            </button>

            <button
              type="button"
              onClick={handleDistributeBonuses}
              className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Hand Out $25k Bonuses (+8 Morale)</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 font-mono">
            Boost morale before television tapings to maximize match workrate.
          </p>
        </div>
      </div>

      {/* Active Backstage Incidents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Active Backstage Incidents ({activeIncidents.length})</span>
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            {activeIncidents.length === 0 ? 'Peaceful backstage' : 'Requires immediate booker intervention'}
          </span>
        </div>

        {activeIncidents.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-zinc-200 font-mono font-bold text-sm">Locker Room in High Harmony</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              There are currently no active backstage incidents or ego clashes. Advancing weeks may roll new incidents.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeIncidents.map(incident => {
              const involvedWrestlers = incident.involvedWrestlerIds
                .map(id => roster.find(w => w.id === id))
                .filter(Boolean);

              return (
                <div
                  key={incident.id}
                  className="bg-zinc-900 border-2 border-amber-500/60 rounded-xl p-5 shadow-lg space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                          incident.severity === 'Crisis'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : incident.severity === 'Moderate'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}>
                          {incident.severity} SEVERITY
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">Week {incident.week}</span>
                      </div>
                      <h4 className="text-base font-bold text-white font-mono">
                        {incident.title}
                      </h4>
                      <p className="text-xs text-zinc-300 mt-1 font-sans leading-relaxed">
                        {incident.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 font-mono text-xs">
                      {involvedWrestlers.map(w => (
                        <span key={w?.id} className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-zinc-300">
                          {w?.name} ({w?.morale}% Morale)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Decision Options */}
                  <div className="pt-3 border-t border-zinc-800 space-y-2">
                    <span className="text-[11px] text-zinc-400 font-mono uppercase block font-bold">
                      Booker Response Options:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {incident.options.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleResolveIncident(incident, opt)}
                          className="text-left p-3 rounded-lg bg-zinc-950 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-400/80 transition flex flex-col justify-between group space-y-2"
                        >
                          <div className="text-xs font-mono font-bold text-zinc-200 group-hover:text-amber-300 transition">
                            {opt.text}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-sans">
                            {opt.consequenceText}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-850">
                            {opt.moraleDelta !== 0 && (
                              <span className={opt.moraleDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {opt.moraleDelta > 0 ? `+${opt.moraleDelta}` : opt.moraleDelta} Morale
                              </span>
                            )}
                            {opt.budgetCost !== 0 && (
                              <span className="text-amber-400">
                                {opt.budgetCost > 0 ? `-$${formatNumber(opt.budgetCost)}` : `+$${formatNumber(Math.abs(opt.budgetCost))} Fine`}
                              </span>
                            )}
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

      {/* Discontent Warnings & Leaders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unhappy Wrestlers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Frown className="w-3.5 h-3.5 text-rose-400" />
            <span>Discontent Roster Members ({unhappyWrestlers.length})</span>
          </h4>

          {unhappyWrestlers.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono">No stars currently in critical discontent.</p>
          ) : (
            <div className="space-y-2">
              {unhappyWrestlers.map(w => (
                <div key={w.id} className="p-2.5 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-white font-bold">{w.name}</span>
                    <span className="text-zinc-500 ml-2">({w.push})</span>
                  </div>
                  <span className="text-rose-400 font-bold">{w.morale}% Morale</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Respected Leaders */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-emerald-400" />
            <span>Locker Room Leaders ({leaders.length})</span>
          </h4>

          {leaders.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono">No main event leaders currently above 80% morale.</p>
          ) : (
            <div className="space-y-2">
              {leaders.map(w => (
                <div key={w.id} className="p-2.5 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-white font-bold">{w.name}</span>
                    <span className="text-amber-400 ml-2">★ Locker Room Anchor</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{w.morale}% Morale</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

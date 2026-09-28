import React, { useState } from 'react';
import { Promotion, TagTeam, Faction, Wrestler } from '../types';
import { 
  Users, 
  Shield, 
  Flame, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  Check, 
  X, 
  Sparkles,
  Trophy,
  Swords
} from 'lucide-react';

interface TagFactionsViewProps {
  promotion: Promotion;
  onUpdatePromotion: (newPromo: Promotion) => void;
  onBackToMenu: () => void;
}

export const TagFactionsView: React.FC<TagFactionsViewProps> = ({
  promotion,
  onUpdatePromotion,
  onBackToMenu
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'factions'>('teams');

  // Tag Team State
  const tagTeams: TagTeam[] = promotion.tagTeams || [];
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TagTeam | null>(null);
  const [teamForm, setTeamForm] = useState<{
    name: string;
    member1Id: string;
    member2Id: string;
    chemistry: number;
    finisher: string;
    isActive: boolean;
  }>({
    name: '',
    member1Id: '',
    member2Id: '',
    chemistry: 75,
    finisher: '',
    isActive: true
  });

  // Faction State
  const factions: Faction[] = promotion.factions || [];
  const [isCreatingFaction, setIsCreatingFaction] = useState(false);
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null);
  const [factionForm, setFactionForm] = useState<{
    name: string;
    leaderId: string;
    memberIds: string[];
    influence: number;
    description: string;
  }>({
    name: '',
    leaderId: '',
    memberIds: [],
    influence: 80,
    description: ''
  });

  const roster = promotion.roster;

  // --- Tag Team Handlers ---
  const handleOpenCreateTeam = () => {
    setIsCreatingTeam(true);
    setEditingTeam(null);
    setTeamForm({
      name: 'The New Alliance',
      member1Id: roster[0]?.id || '',
      member2Id: roster[1]?.id || '',
      chemistry: 75,
      finisher: 'Double Superkick',
      isActive: true
    });
  };

  const handleOpenEditTeam = (team: TagTeam) => {
    setEditingTeam(team);
    setIsCreatingTeam(false);
    setTeamForm({
      name: team.name,
      member1Id: team.memberIds[0] || '',
      member2Id: team.memberIds[1] || '',
      chemistry: team.chemistry,
      finisher: team.finisher || '',
      isActive: team.isActive
    });
  };

  const handleSaveTeam = () => {
    if (!teamForm.name.trim() || !teamForm.member1Id || !teamForm.member2Id || teamForm.member1Id === teamForm.member2Id) {
      alert('Please select two distinct wrestlers and provide a tag team name.');
      return;
    }

    let updatedTeams: TagTeam[];
    if (isCreatingTeam) {
      const newTeam: TagTeam = {
        id: `team-${Date.now()}`,
        name: teamForm.name,
        memberIds: [teamForm.member1Id, teamForm.member2Id],
        chemistry: teamForm.chemistry,
        wins: 0,
        losses: 0,
        finisher: teamForm.finisher,
        isActive: teamForm.isActive
      };
      updatedTeams = [...tagTeams, newTeam];
    } else if (editingTeam) {
      updatedTeams = tagTeams.map(t =>
        t.id === editingTeam.id
          ? {
              ...t,
              name: teamForm.name,
              memberIds: [teamForm.member1Id, teamForm.member2Id],
              chemistry: teamForm.chemistry,
              finisher: teamForm.finisher,
              isActive: teamForm.isActive
            }
          : t
      );
    } else {
      return;
    }

    onUpdatePromotion({ ...promotion, tagTeams: updatedTeams });
    setIsCreatingTeam(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (id: string) => {
    if (window.confirm('Disband this tag team? (History will be cleared).')) {
      const updatedTeams = tagTeams.filter(t => t.id !== id);
      onUpdatePromotion({ ...promotion, tagTeams: updatedTeams });
    }
  };

  // --- Faction Handlers ---
  const handleOpenCreateFaction = () => {
    setIsCreatingFaction(true);
    setEditingFaction(null);
    setFactionForm({
      name: 'The Empire',
      leaderId: roster[0]?.id || '',
      memberIds: [roster[1]?.id, roster[2]?.id].filter(Boolean),
      influence: 85,
      description: 'Dominant alliance controlling the top of the card.'
    });
  };

  const handleOpenEditFaction = (faction: Faction) => {
    setEditingFaction(faction);
    setIsCreatingFaction(false);
    setFactionForm({
      name: faction.name,
      leaderId: faction.leaderId,
      memberIds: faction.memberIds,
      influence: faction.influence,
      description: faction.description
    });
  };

  const handleToggleFactionMember = (id: string) => {
    if (factionForm.memberIds.includes(id)) {
      setFactionForm({
        ...factionForm,
        memberIds: factionForm.memberIds.filter(m => m !== id)
      });
    } else {
      setFactionForm({
        ...factionForm,
        memberIds: [...factionForm.memberIds, id]
      });
    }
  };

  const handleSaveFaction = () => {
    if (!factionForm.name.trim() || !factionForm.leaderId) {
      alert('Please specify a faction name and leader.');
      return;
    }

    let updatedFactions: Faction[];
    if (isCreatingFaction) {
      const newFaction: Faction = {
        id: `faction-${Date.now()}`,
        name: factionForm.name,
        leaderId: factionForm.leaderId,
        memberIds: Array.from(new Set([factionForm.leaderId, ...factionForm.memberIds])),
        influence: factionForm.influence,
        description: factionForm.description
      };
      updatedFactions = [...factions, newFaction];
    } else if (editingFaction) {
      updatedFactions = factions.map(f =>
        f.id === editingFaction.id
          ? {
              ...f,
              name: factionForm.name,
              leaderId: factionForm.leaderId,
              memberIds: Array.from(new Set([factionForm.leaderId, ...factionForm.memberIds])),
              influence: factionForm.influence,
              description: factionForm.description
            }
          : f
      );
    } else {
      return;
    }

    onUpdatePromotion({ ...promotion, factions: updatedFactions });
    setIsCreatingFaction(false);
    setEditingFaction(null);
  };

  const handleDeleteFaction = (id: string) => {
    if (window.confirm('Disband this faction / stable?')) {
      const updatedFactions = factions.filter(f => f.id !== id);
      onUpdatePromotion({ ...promotion, factions: updatedFactions });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Swords className="w-3.5 h-3.5" />
            <span>Alliance & Stable Headquarters</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <span>Tag Teams & Factions</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Synergize roster talent into coordinated tandems and dominant stables. High tag team chemistry grants segment score bonuses in tag warfare.
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

          {activeTab === 'teams' ? (
            <button
              type="button"
              onClick={handleOpenCreateTeam}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Form Tag Team</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateFaction}
              className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Found Faction</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition ${
            activeTab === 'teams'
              ? 'bg-sky-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tag Teams ({tagTeams.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('factions')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition ${
            activeTab === 'factions'
              ? 'bg-purple-600 text-white shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Factions & Stables ({factions.length})</span>
        </button>
      </div>

      {/* TAG TEAMS TAB */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          {/* Create / Edit Tag Team Drawer */}
          {(isCreatingTeam || editingTeam) && (
            <div className="bg-zinc-900 border-2 border-sky-500 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>{isCreatingTeam ? 'Form New Tag Team' : `Edit Team: ${editingTeam?.name}`}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingTeam(false);
                    setEditingTeam(null);
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1">Team Name</label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                    placeholder="e.g. The Road Warriors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Partner 1</label>
                  <select
                    value={teamForm.member1Id}
                    onChange={e => setTeamForm({ ...teamForm, member1Id: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  >
                    {roster.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.style})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Partner 2</label>
                  <select
                    value={teamForm.member2Id}
                    onChange={e => setTeamForm({ ...teamForm, member2Id: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  >
                    {roster.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.style})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Team Chemistry (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={teamForm.chemistry}
                    onChange={e => setTeamForm({ ...teamForm, chemistry: Math.max(0, Math.min(100, parseInt(e.target.value) || 50)) })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Signature Tag Finisher</label>
                  <input
                    type="text"
                    value={teamForm.finisher}
                    onChange={e => setTeamForm({ ...teamForm, finisher: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                    placeholder="e.g. 3D, Doomsday Device"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 border border-zinc-700 px-3 py-2 rounded text-zinc-200">
                    <input
                      type="checkbox"
                      checked={teamForm.isActive}
                      onChange={e => setTeamForm({ ...teamForm, isActive: e.target.checked })}
                      className="rounded text-sky-500"
                    />
                    <span className="font-bold">Active Tandem Unit</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingTeam(false);
                    setEditingTeam(null);
                  }}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeam}
                  className="px-4 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Team</span>
                </button>
              </div>
            </div>
          )}

          {/* Tag Teams List */}
          {tagTeams.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-3">
              <Users className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-zinc-300 font-mono font-bold text-sm">No Tag Teams Formed Yet</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Pair up compatible roster members into tag teams to unlock tandem chemistry bonuses on your shows.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateTeam}
                className="px-4 py-2 rounded bg-sky-500 text-black text-xs font-mono font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Form First Tag Team</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tagTeams.map(team => {
                const member1 = roster.find(w => w.id === team.memberIds[0]);
                const member2 = roster.find(w => w.id === team.memberIds[1]);

                return (
                  <div
                    key={team.id}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between transition shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          team.isActive ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {team.isActive ? 'ACTIVE TEAM' : 'INACTIVE'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTeam(team)}
                            className="p-1 rounded text-zinc-400 hover:text-sky-400 hover:bg-zinc-800"
                            title="Edit Team"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeam(team.id)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800"
                            title="Disband Team"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-white text-base font-mono">
                        {team.name}
                      </h4>

                      <div className="mt-2 space-y-1 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-zinc-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <span>{member1 ? member1.name : 'Unknown Wrestler'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <span>{member2 ? member2.name : 'Unknown Wrestler'}</span>
                        </div>
                      </div>

                      {team.finisher && (
                        <p className="text-[11px] text-zinc-400 mt-2 italic font-sans">
                          Finisher: <strong className="text-zinc-300 font-mono font-normal">{team.finisher}</strong>
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Chemistry</span>
                        <span className="font-bold text-sky-400">{team.chemistry}/100</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block uppercase">Tag Record</span>
                        <span className="font-bold text-zinc-200">{team.wins}W - {team.losses}L</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FACTIONS TAB */}
      {activeTab === 'factions' && (
        <div className="space-y-4">
          {/* Create / Edit Faction Drawer */}
          {(isCreatingFaction || editingFaction) && (
            <div className="bg-zinc-900 border-2 border-purple-500 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>{isCreatingFaction ? 'Found New Faction' : `Edit Faction: ${editingFaction?.name}`}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFaction(false);
                    setEditingFaction(null);
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1">Faction Name</label>
                  <input
                    type="text"
                    value={factionForm.name}
                    onChange={e => setFactionForm({ ...factionForm, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                    placeholder="e.g. The Bloodline, Evolution"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Faction Leader</label>
                  <select
                    value={factionForm.leaderId}
                    onChange={e => setFactionForm({ ...factionForm, leaderId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  >
                    {roster.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.push})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Influence / Clout (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={factionForm.influence}
                    onChange={e => setFactionForm({ ...factionForm, influence: Math.max(0, Math.min(100, parseInt(e.target.value) || 50)) })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-zinc-400 mb-1">Faction Manifesto / Description</label>
                  <input
                    type="text"
                    value={factionForm.description}
                    onChange={e => setFactionForm({ ...factionForm, description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
                    placeholder="e.g. A ruthlessly ambitious syndicate seeking total title domination."
                  />
                </div>
              </div>

              {/* Roster Multi-Member Selector */}
              <div>
                <label className="block text-zinc-400 text-xs font-mono mb-2">
                  Select Stable Members (Click to toggle):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {roster.map(w => {
                    const isSelected = factionForm.memberIds.includes(w.id);
                    const isLeader = factionForm.leaderId === w.id;

                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => handleToggleFactionMember(w.id)}
                        className={`text-left p-2 rounded border text-xs font-mono transition flex items-center justify-between ${
                          isLeader
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : isSelected
                            ? 'bg-purple-950/40 border-purple-500 text-white font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="truncate">{w.name}</span>
                        {isLeader ? (
                          <span className="text-[10px] bg-amber-500 text-black px-1 rounded">LEAD</span>
                        ) : isSelected ? (
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFaction(false);
                    setEditingFaction(null);
                  }}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFaction}
                  className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Faction</span>
                </button>
              </div>
            </div>
          )}

          {/* Factions List */}
          {factions.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-3">
              <Shield className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-zinc-300 font-mono font-bold text-sm">No Factions Formed Yet</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Band groups of wrestlers together under a unified banner for gang warfare angles and locker room dominance.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateFaction}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Found First Faction</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {factions.map(faction => {
                const leader = roster.find(w => w.id === faction.leaderId);
                const memberWrestlers = faction.memberIds.map(id => roster.find(w => w.id === id)).filter(Boolean);

                return (
                  <div
                    key={faction.id}
                    className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 flex flex-col justify-between transition shadow-sm space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          FACTION • {faction.influence}/100 INFLUENCE
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditFaction(faction)}
                            className="p-1 rounded text-zinc-400 hover:text-purple-400 hover:bg-zinc-800"
                            title="Edit Faction"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFaction(faction.id)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800"
                            title="Disband Faction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-white text-lg font-mono">
                        {faction.name}
                      </h4>

                      <p className="text-xs text-zinc-400 mt-1 font-sans">
                        {faction.description}
                      </p>

                      <div className="mt-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
                        <div className="text-xs font-mono">
                          <span className="text-zinc-500 uppercase text-[10px] block">Leader:</span>
                          <strong className="text-amber-400">{leader ? leader.name : 'Unknown'}</strong>
                        </div>

                        <div className="text-xs font-mono">
                          <span className="text-zinc-500 uppercase text-[10px] block mb-1">Members ({memberWrestlers.length}):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {memberWrestlers.map(w => (
                              <span
                                key={w?.id}
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  w?.id === faction.leaderId
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                }`}
                              >
                                {w?.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

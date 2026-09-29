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
  Swords,
  Wand2,
  Zap,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { 
  suggestTagTeams, 
  suggestStables, 
  TagTeamSuggestion, 
  StableSuggestion 
} from '../engine/autoSuggestEngine';

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

  // Tag Team Auto-Suggest Modal State
  const [isSuggestingTeams, setIsSuggestingTeams] = useState(false);
  const [teamFilter, setTeamFilter] = useState<'all' | 'unassigned_only' | 'same_gender' | 'odd_couple' | 'face_only' | 'heel_only'>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

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

  // Faction Auto-Suggest Modal State
  const [isSuggestingFactions, setIsSuggestingFactions] = useState(false);

  const roster = promotion.roster;

  // Flash notification helper
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

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
      showToast(`Formed new tag team: "${newTeam.name}"!`);
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
      showToast(`Updated tag team: "${teamForm.name}"!`);
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
      showToast('Tag team disbanded.');
    }
  };

  // --- Auto-Suggest Team Actions ---
  const generatedTeamSuggestions = isSuggestingTeams 
    ? suggestTagTeams(promotion, { filter: teamFilter, max: 12 })
    : [];

  const handleFormSuggestedTeam = (sug: TagTeamSuggestion) => {
    const newTeam: TagTeam = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: sug.name,
      memberIds: [sug.member1Id, sug.member2Id],
      chemistry: sug.chemistry,
      wins: 0,
      losses: 0,
      finisher: sug.finisher,
      isActive: true
    };
    onUpdatePromotion({ ...promotion, tagTeams: [...tagTeams, newTeam] });
    showToast(`Formed tag team "${sug.name}" with ${sug.chemistry}% Chemistry!`);
  };

  const handleCustomizeSuggestedTeam = (sug: TagTeamSuggestion) => {
    setIsSuggestingTeams(false);
    setIsCreatingTeam(true);
    setEditingTeam(null);
    setTeamForm({
      name: sug.name,
      member1Id: sug.member1Id,
      member2Id: sug.member2Id,
      chemistry: sug.chemistry,
      finisher: sug.finisher,
      isActive: true
    });
  };

  // Batch-form up to 4 non-overlapping teams
  const handleBatchFormTopTeams = () => {
    const suggestions = suggestTagTeams(promotion, { filter: 'unassigned_only', max: 15 });
    const usedIds = new Set<string>();
    const newTeamsToAdd: TagTeam[] = [];

    for (const sug of suggestions) {
      if (!usedIds.has(sug.member1Id) && !usedIds.has(sug.member2Id)) {
        usedIds.add(sug.member1Id);
        usedIds.add(sug.member2Id);
        newTeamsToAdd.push({
          id: `team-${Date.now()}-${newTeamsToAdd.length}`,
          name: sug.name,
          memberIds: [sug.member1Id, sug.member2Id],
          chemistry: sug.chemistry,
          wins: 0,
          losses: 0,
          finisher: sug.finisher,
          isActive: true
        });
        if (newTeamsToAdd.length >= 4) break;
      }
    }

    if (newTeamsToAdd.length === 0) {
      alert('Not enough unassigned roster members available to batch form teams.');
      return;
    }

    onUpdatePromotion({ ...promotion, tagTeams: [...tagTeams, ...newTeamsToAdd] });
    setIsSuggestingTeams(false);
    showToast(`Successfully auto-formed ${newTeamsToAdd.length} balanced tag teams!`);
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
      showToast(`Founded new stable: "${newFaction.name}"!`);
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
      showToast(`Updated stable: "${factionForm.name}"!`);
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
      showToast('Faction disbanded.');
    }
  };

  // --- Auto-Suggest Faction Actions ---
  const generatedFactionSuggestions = isSuggestingFactions 
    ? suggestStables(promotion, { max: 5 })
    : [];

  const handleFoundSuggestedFaction = (sug: StableSuggestion) => {
    const newFaction: Faction = {
      id: `faction-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: sug.name,
      leaderId: sug.leader.id,
      memberIds: sug.memberIds,
      influence: sug.influence,
      description: sug.description
    };
    onUpdatePromotion({ ...promotion, factions: [...factions, newFaction] });
    showToast(`Founded stable "${sug.name}" led by ${sug.leader.name}!`);
  };

  const handleCustomizeSuggestedFaction = (sug: StableSuggestion) => {
    setIsSuggestingFactions(false);
    setIsCreatingFaction(true);
    setEditingFaction(null);
    setFactionForm({
      name: sug.name,
      leaderId: sug.leader.id,
      memberIds: sug.memberIds.filter(id => id !== sug.leader.id),
      influence: sug.influence,
      description: sug.description
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-black px-4 py-3 rounded-xl font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBackToMenu}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>HQ Menu</span>
          </button>

          {activeTab === 'teams' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSuggestingTeams(true)}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
                title="Automatically analyze roster styles, chemistry, and narratives to suggest tag teams"
              >
                <Wand2 className="w-4 h-4" />
                <span>Auto-Suggest Teams</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCreateTeam}
                className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Form Tag Team</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSuggestingFactions(true)}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
                title="Generate dominant stable concepts and factions from your roster"
              >
                <Wand2 className="w-4 h-4" />
                <span>Auto-Suggest Stables</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCreateFaction}
                className="px-3.5 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Found Faction</span>
              </button>
            </div>
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-4">
              <Users className="w-10 h-10 text-zinc-600 mx-auto" />
              <div>
                <h4 className="text-zinc-200 font-mono font-bold text-base">No Tag Teams Formed Yet</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                  Pair up compatible roster members into tag teams to unlock tandem chemistry bonuses in tag warfare.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuggestingTeams(true)}
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-black text-xs font-mono font-bold inline-flex items-center gap-2 shadow-lg"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Auto-Suggest Best Tag Teams</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreateTeam}
                  className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold inline-flex items-center gap-2 border border-zinc-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Team Manually</span>
                </button>
              </div>
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-4">
              <Shield className="w-10 h-10 text-zinc-600 mx-auto" />
              <div>
                <h4 className="text-zinc-200 font-mono font-bold text-base">No Factions Formed Yet</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                  Band groups of wrestlers together under a unified banner for gang warfare angles and locker room dominance.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuggestingFactions(true)}
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-xs font-mono font-bold inline-flex items-center gap-2 shadow-lg"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Auto-Suggest Stable Concepts</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreateFaction}
                  className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold inline-flex items-center gap-2 border border-zinc-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Found Faction Manually</span>
                </button>
              </div>
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

      {/* ============================================================ */}
      {/* MODAL: AUTO-SUGGEST TAG TEAMS                                 */}
      {/* ============================================================ */}
      {isSuggestingTeams && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-zinc-900 border-2 border-sky-500/60 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-bold uppercase tracking-wider mb-1">
                  <Wand2 className="w-4 h-4 text-sky-400" />
                  <span>Matchmaker's AI Scouting Algorithm</span>
                </div>
                <h3 className="text-xl font-black text-white font-mono flex items-center gap-2">
                  <span>Auto-Suggested Tag Teams</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    {generatedTeamSuggestions.length} Tandems Evaluated
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Synthesizes stylistic synergies (Power & Speed, Technical Purists, High Flyers, Odd-Couples) to generate high-chemistry units with tailored double-team finishers.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleBatchFormTopTeams}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow transition"
                  title="Form up to 4 non-overlapping top tag teams in one click"
                >
                  <Zap className="w-4 h-4" />
                  <span>Batch Form Top 4 Teams</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSuggestingTeams(false)}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="px-5 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs font-mono">
              <span className="text-zinc-500 uppercase text-[10px] mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
              </span>
              {(
                [
                  { id: 'all', label: 'All Combinations' },
                  { id: 'unassigned_only', label: 'Unassigned Roster Only' },
                  { id: 'odd_couple', label: 'Odd-Couple Dynamic' },
                  { id: 'face_only', label: 'Face Duos' },
                  { id: 'heel_only', label: 'Heel Duos' }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTeamFilter(tab.id)}
                  className={`px-3 py-1 rounded-md transition font-mono whitespace-nowrap ${
                    teamFilter === tab.id
                      ? 'bg-sky-500 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Suggestions Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedTeamSuggestions.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-zinc-500 font-mono text-sm">
                  No matching tag team pairings found for this filter criteria. Try selecting "All Combinations".
                </div>
              ) : (
                generatedTeamSuggestions.map(sug => {
                  const isExisting1 = tagTeams.some(t => t.memberIds.includes(sug.member1Id));
                  const isExisting2 = tagTeams.some(t => t.memberIds.includes(sug.member2Id));

                  return (
                    <div
                      key={sug.id}
                      className="bg-zinc-950 border border-zinc-800 hover:border-sky-500/70 rounded-xl p-4 flex flex-col justify-between transition shadow-md group relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        {/* Top row */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase">
                            {sug.archetypeBadge}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">Chemistry:</span>
                            <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {sug.chemistry}%
                            </span>
                          </div>
                        </div>

                        {/* Team Name */}
                        <div>
                          <h4 className="text-base font-bold text-white font-mono group-hover:text-sky-300 transition">
                            {sug.name}
                          </h4>
                          <span className={`text-[10px] font-mono ${
                            sug.alignmentSynergy === 'Odd-Couple Face & Heel'
                              ? 'text-purple-400'
                              : sug.alignmentSynergy === 'Face Allies'
                              ? 'text-sky-400'
                              : 'text-rose-400'
                          }`}>
                            {sug.alignmentSynergy}
                          </span>
                        </div>

                        {/* Members Comparison Cards */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                          <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-100 truncate">{sug.member1.name}</span>
                              <span className={`text-[9px] px-1 rounded ${
                                sug.member1.alignment === 'Face' ? 'bg-sky-500/20 text-sky-300' : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {sug.member1.alignment}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-1">
                              Style: <strong className="text-zinc-200 font-normal">{sug.member1.style}</strong>
                            </div>
                            <div className="text-[10px] text-zinc-500 flex justify-between mt-1">
                              <span>Overness: {sug.member1.overness}</span>
                              <span>Workrate: {sug.member1.workrate}</span>
                            </div>
                            {isExisting1 && (
                              <span className="text-[9px] text-amber-400 mt-1 block">Already in another team</span>
                            )}
                          </div>

                          <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800/80">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-100 truncate">{sug.member2.name}</span>
                              <span className={`text-[9px] px-1 rounded ${
                                sug.member2.alignment === 'Face' ? 'bg-sky-500/20 text-sky-300' : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {sug.member2.alignment}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-1">
                              Style: <strong className="text-zinc-200 font-normal">{sug.member2.style}</strong>
                            </div>
                            <div className="text-[10px] text-zinc-500 flex justify-between mt-1">
                              <span>Overness: {sug.member2.overness}</span>
                              <span>Workrate: {sug.member2.workrate}</span>
                            </div>
                            {isExisting2 && (
                              <span className="text-[9px] text-amber-400 mt-1 block">Already in another team</span>
                            )}
                          </div>
                        </div>

                        {/* Signature Finisher & Rationale */}
                        <div className="space-y-1.5 pt-1 text-xs">
                          <p className="font-mono text-[11px] text-zinc-300">
                            <span className="text-zinc-500 uppercase text-[10px] block">Signature Finisher:</span>
                            <span className="text-amber-300 font-semibold">{sug.finisher}</span>
                          </p>
                          <p className="text-[11px] text-zinc-400 font-sans italic bg-zinc-900/60 p-2 rounded border border-zinc-800/60">
                            "{sug.rationale}"
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleCustomizeSuggestedTeam(sug)}
                          className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Customize</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFormSuggestedTeam(sug)}
                          className="px-4 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Form Team</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: AUTO-SUGGEST STABLES / FACTIONS                       */}
      {/* ============================================================ */}
      {isSuggestingFactions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-zinc-900 border-2 border-purple-500/60 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-1">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  <span>Faction Architect System</span>
                </div>
                <h3 className="text-xl font-black text-white font-mono flex items-center gap-2">
                  <span>Auto-Suggested Stables & Factions</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Constructs cohesive multi-man alliances featuring appointed Leaders, Enforcers, and workhorse divisions to dominate television narratives.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSuggestingFactions(false)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {generatedFactionSuggestions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 font-mono text-sm">
                  Insufficient uninjured roster members to assemble cohesive stables.
                </div>
              ) : (
                generatedFactionSuggestions.map(sug => (
                  <div
                    key={sug.id}
                    className="bg-zinc-950 border border-zinc-800 hover:border-purple-500/70 rounded-xl p-5 transition shadow-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                            {sug.archetype}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {sug.influence}/100 INFLUENCE
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-white font-mono">
                          {sug.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCustomizeSuggestedFaction(sug)}
                          className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Customize</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFoundSuggestedFaction(sug)}
                          className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Found Stable</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {sug.description}
                    </p>

                    {/* Member Hierarchy */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
                      <div className="bg-zinc-900 p-3 rounded-lg border border-amber-500/30">
                        <span className="text-[10px] text-amber-400 font-bold block uppercase mb-1">👑 Stable Leader</span>
                        <div className="font-bold text-white text-sm">{sug.leader.name}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{sug.leader.push} • {sug.leader.style}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{sug.leader.overness} Overness • {sug.leader.micSkills} Mic</div>
                      </div>

                      <div className="bg-zinc-900 p-3 rounded-lg border border-rose-500/30">
                        <span className="text-[10px] text-rose-400 font-bold block uppercase mb-1">⚔️ Muscle / Enforcer</span>
                        <div className="font-bold text-white text-sm">{sug.enforcer.name}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{sug.enforcer.push} • {sug.enforcer.style}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{sug.enforcer.workrate} Workrate</div>
                      </div>

                      <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-bold block uppercase mb-1">👥 Complementary Members</span>
                        <div className="space-y-1">
                          {sug.members.filter(m => m.id !== sug.leader.id && m.id !== sug.enforcer.id).map(m => (
                            <div key={m.id} className="text-zinc-200 text-xs flex justify-between">
                              <span>{m.name}</span>
                              <span className="text-zinc-500 text-[10px]">{m.style}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 font-sans italic">
                      <strong className="text-purple-300 font-mono font-normal uppercase not-italic mr-1">Booker Analysis:</strong>
                      {sug.rationale}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

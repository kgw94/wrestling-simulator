import React, { useState } from 'react';
import { 
  Wrestler, 
  Promotion, 
  PushLevel, 
  Alignment, 
  WrestlerStyle, 
  GimmickGrade,
  WrestlerGimmick
} from '../types';
import { GIMMICK_TEMPLATES } from '../data/customDefaults';
import { formatNumber, formatCurrency } from '../utils/format';
import { 
  Sparkles, 
  Wand2, 
  Edit3, 
  UserPlus, 
  Search, 
  ChevronLeft, 
  ShieldAlert, 
  Check, 
  X, 
  Flame, 
  Star, 
  RefreshCw,
  Trophy,
  Activity,
  HeartPulse
} from 'lucide-react';

interface GimmickLabViewProps {
  promotion: Promotion;
  freeAgents: Wrestler[];
  onUpdateRoster: (newRoster: Wrestler[]) => void;
  onUpdateFreeAgents?: (newFA: Wrestler[]) => void;
  onBackToMenu: () => void;
}

const PUSH_LEVELS: PushLevel[] = [
  'Main Eventer',
  'Upper Midcard',
  'Midcard',
  'Lower Midcard',
  'Opener',
  'Jobber'
];

const STYLES: WrestlerStyle[] = [
  'Technician',
  'Brawler',
  'High Flyer',
  'Powerhouse',
  'Hardcore',
  'Entertainer'
];

const GIMMICK_GRADES: GimmickGrade[] = ['S', 'A', 'B', 'C', 'D', 'F'];

export const GimmickLabView: React.FC<GimmickLabViewProps> = ({
  promotion,
  freeAgents,
  onUpdateRoster,
  onUpdateFreeAgents,
  onBackToMenu
}) => {
  const [selectedWrestlerId, setSelectedWrestlerId] = useState<string>(
    promotion.roster[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPush, setFilterPush] = useState<string>('ALL');

  // Repackage Modal state
  const [isRepackaging, setIsRepackaging] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
  const [customGimmickName, setCustomGimmickName] = useState('');
  const [customGimmickDesc, setCustomGimmickDesc] = useState('');
  const [repackageResult, setRepackageResult] = useState<{
    grade: GimmickGrade;
    message: string;
  } | null>(null);

  // Full Wrestler Stat Editor state
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [editForm, setEditForm] = useState<Wrestler | null>(null);

  // Create New Wrestler Modal state
  const [isCreatingWrestler, setIsCreatingWrestler] = useState(false);
  const [newWrestlerForm, setNewWrestlerForm] = useState<Partial<Wrestler>>({
    name: 'Apollo Stone',
    nickname: 'The Golden Prodigy',
    age: 26,
    gender: 'Male',
    style: 'Technician',
    alignment: 'Face',
    push: 'Upper Midcard',
    overness: 76,
    workrate: 82,
    micSkills: 78,
    stamina: 85,
    morale: 90,
    fatigue: 0,
    salary: 8500,
    contractWeeks: 40,
    wins: 10,
    losses: 2,
    draws: 0,
    championshipIds: [],
    injury: { injured: false },
    gimmick: {
      name: 'The Franchise Superstar',
      category: 'Main Event',
      description: 'The clean-cut athletic prodigy destined for glory.',
      grade: 'A',
      repackagesCount: 0
    }
  });

  const selectedWrestler = promotion.roster.find(w => w.id === selectedWrestlerId) || promotion.roster[0];

  const filteredRoster = promotion.roster.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.nickname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPush = filterPush === 'ALL' || w.push === filterPush;
    return matchesSearch && matchesPush;
  });

  const handleOpenRepackage = () => {
    if (!selectedWrestler) return;
    setIsRepackaging(true);
    setRepackageResult(null);
    setSelectedTemplateName(GIMMICK_TEMPLATES[0].name);
    setCustomGimmickName(GIMMICK_TEMPLATES[0].name);
    setCustomGimmickDesc(GIMMICK_TEMPLATES[0].description);
  };

  const handleSelectTemplate = (templateName: string) => {
    const tmpl = GIMMICK_TEMPLATES.find(t => t.name === templateName);
    if (tmpl) {
      setSelectedTemplateName(tmpl.name);
      setCustomGimmickName(tmpl.name);
      setCustomGimmickDesc(tmpl.description);
    }
  };

  const handleExecuteRepackage = (manualGrade?: GimmickGrade) => {
    if (!selectedWrestler) return;

    // Roll grade based on wrestler's charisma / mic skills if not manually forced
    let grade: GimmickGrade;
    if (manualGrade) {
      grade = manualGrade;
    } else {
      const roll = Math.random() * 100 + (selectedWrestler.micSkills * 0.3);
      if (roll >= 110) grade = 'S';
      else if (roll >= 85) grade = 'A';
      else if (roll >= 60) grade = 'B';
      else if (roll >= 40) grade = 'C';
      else if (roll >= 20) grade = 'D';
      else grade = 'F';
    }

    let overnessDelta = 0;
    let moraleDelta = 0;
    let message = '';

    if (grade === 'S') {
      overnessDelta = +5;
      moraleDelta = +15;
      message = `🌟 MASTERPIECE! The fans immediately went wild for '${customGimmickName}'! Overness surged by +5!`;
    } else if (grade === 'A') {
      overnessDelta = +3;
      moraleDelta = +10;
      message = `★ HIT! High praise from critics and fans alike! Overness increased by +3.`;
    } else if (grade === 'B') {
      overnessDelta = +1;
      moraleDelta = +5;
      message = `Solid execution! The new persona has taken hold comfortably.`;
    } else if (grade === 'C') {
      overnessDelta = 0;
      moraleDelta = 0;
      message = `Lukewarm reaction. The crowd is taking a wait-and-see approach.`;
    } else if (grade === 'D') {
      overnessDelta = -2;
      moraleDelta = -5;
      message = `Flat reception. Gimmick felt forced and lacked organic connection.`;
    } else {
      overnessDelta = -4;
      moraleDelta = -12;
      message = `💥 TOTAL DISASTER! Pundits mocked the new gimmick on television! Overness dropped by -4.`;
    }

    const newGimmick: WrestlerGimmick = {
      name: customGimmickName,
      category: 'Repackaged',
      description: customGimmickDesc,
      grade,
      repackagesCount: (selectedWrestler.gimmick?.repackagesCount || 0) + 1
    };

    const updatedRoster = promotion.roster.map(w => {
      if (w.id === selectedWrestler.id) {
        return {
          ...w,
          overness: Math.min(100, Math.max(10, w.overness + overnessDelta)),
          morale: Math.min(100, Math.max(10, w.morale + moraleDelta)),
          gimmick: newGimmick
        };
      }
      return w;
    });

    onUpdateRoster(updatedRoster);
    setRepackageResult({ grade, message });
  };

  const handleOpenEditStats = () => {
    if (!selectedWrestler) return;
    setEditForm({ ...selectedWrestler });
    setIsEditingStats(true);
  };

  const handleSaveStats = () => {
    if (!editForm) return;
    const updatedRoster = promotion.roster.map(w => (w.id === editForm.id ? editForm : w));
    onUpdateRoster(updatedRoster);
    setIsEditingStats(false);
  };

  const handleCreateNewWrestler = () => {
    if (!newWrestlerForm.name?.trim()) return;

    const fullWrestler: Wrestler = {
      id: `custom-wrestler-${Date.now()}`,
      name: newWrestlerForm.name || 'Custom Star',
      nickname: newWrestlerForm.nickname || '',
      age: newWrestlerForm.age || 26,
      gender: (newWrestlerForm.gender as any) || 'Male',
      style: newWrestlerForm.style || 'Technician',
      alignment: newWrestlerForm.alignment || 'Face',
      push: newWrestlerForm.push || 'Midcard',
      overness: newWrestlerForm.overness || 70,
      workrate: newWrestlerForm.workrate || 75,
      micSkills: newWrestlerForm.micSkills || 70,
      stamina: newWrestlerForm.stamina || 80,
      morale: newWrestlerForm.morale || 85,
      fatigue: 0,
      salary: newWrestlerForm.salary || 6500,
      contractWeeks: newWrestlerForm.contractWeeks || 36,
      wins: 0,
      losses: 0,
      draws: 0,
      championshipIds: [],
      injury: { injured: false },
      gimmick: newWrestlerForm.gimmick || {
        name: 'The Franchise Superstar',
        category: 'Main Event',
        description: 'Original wrestling prodigy.',
        grade: 'B',
        repackagesCount: 0
      }
    };

    onUpdateRoster([...promotion.roster, fullWrestler]);
    setSelectedWrestlerId(fullWrestler.id);
    setIsCreatingWrestler(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Creative Development & Character Engineering</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <span>Gimmick Lab & Wrestler Customizer</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Fine-tune personas, execute creative repackages with vignette buzz, or directly edit wrestler attributes,
            pushes, alignments, and salaries in full sandbox mode.
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
            onClick={() => setIsCreatingWrestler(true)}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Wrestler</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roster Selector (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                Select Wrestler ({filteredRoster.length})
              </h3>
            </div>

            {/* Search and Push Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name or nickname..."
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <select
                value={filterPush}
                onChange={e => setFilterPush(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="ALL">All Push Levels</option>
                {PUSH_LEVELS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="divide-y divide-zinc-800/80 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredRoster.map(w => {
                const isSelected = w.id === selectedWrestler?.id;
                const grade = w.gimmick?.grade || 'B';

                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setSelectedWrestlerId(w.id);
                      setIsEditingStats(false);
                      setIsRepackaging(false);
                      setRepackageResult(null);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                        : 'hover:bg-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${w.alignment === 'Face' ? 'bg-sky-400' : 'bg-rose-500'}`} />
                        <span className="font-bold text-xs font-mono">{w.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-sans truncate max-w-[180px]">
                        {w.gimmick ? w.gimmick.name : w.style}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        grade === 'S' ? 'bg-amber-400 text-black' :
                        grade === 'A' ? 'bg-emerald-500 text-black' :
                        grade === 'F' ? 'bg-rose-600 text-white' :
                        'bg-zinc-800 text-zinc-300'
                      }`}>
                        {grade}-Tier
                      </span>
                      <span className="text-amber-400 font-bold">{w.overness} OVR</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Wrestler Lab & Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedWrestler && (
            <>
              {/* Wrestler Overview Header */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        selectedWrestler.alignment === 'Face' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {selectedWrestler.alignment.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                        {selectedWrestler.style}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                        {selectedWrestler.push}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                      <span>{selectedWrestler.name}</span>
                      {selectedWrestler.nickname && (
                        <span className="text-xs text-amber-400 font-normal italic">
                          "{selectedWrestler.nickname}"
                        </span>
                      )}
                    </h3>

                    <p className="text-xs text-zinc-400 mt-1">
                      Age {selectedWrestler.age} • Salary: {formatCurrency(selectedWrestler.salary)}/wk • {selectedWrestler.contractWeeks} wks remaining
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenRepackage}
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Repackage</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenEditStats}
                      className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold flex items-center gap-1.5 transition border border-zinc-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Stats</span>
                    </button>
                  </div>
                </div>

                {/* Core Attributes Bar */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-3 border-t border-zinc-800 text-center font-mono">
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase block">Overness</span>
                    <span className="text-sm font-bold text-amber-400">{selectedWrestler.overness}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase block">Workrate</span>
                    <span className="text-sm font-bold text-sky-400">{selectedWrestler.workrate}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase block">Mic Skills</span>
                    <span className="text-sm font-bold text-emerald-400">{selectedWrestler.micSkills}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase block">Stamina</span>
                    <span className="text-sm font-bold text-zinc-200">{selectedWrestler.stamina}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase block">Morale</span>
                    <span className="text-sm font-bold text-purple-400">{selectedWrestler.morale}%</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase block">Fatigue</span>
                    <span className={`text-sm font-bold ${selectedWrestler.fatigue > 40 ? 'text-rose-400' : 'text-zinc-400'}`}>
                      {selectedWrestler.fatigue}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Gimmick Display Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>Current Gimmick Profile</span>
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    (selectedWrestler.gimmick?.grade || 'B') === 'S' ? 'bg-amber-400 text-black' :
                    (selectedWrestler.gimmick?.grade || 'B') === 'A' ? 'bg-emerald-500 text-black' :
                    (selectedWrestler.gimmick?.grade || 'B') === 'F' ? 'bg-rose-600 text-white' :
                    'bg-zinc-800 text-zinc-300'
                  }`}>
                    Grade: {selectedWrestler.gimmick?.grade || 'B'}-Tier
                  </span>
                </div>

                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-base text-white font-mono">
                      {selectedWrestler.gimmick?.name || 'Standard In-Ring Competitor'}
                    </h5>
                    <span className="text-xs text-zinc-500 font-mono">
                      Repackages: {selectedWrestler.gimmick?.repackagesCount || 0}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {selectedWrestler.gimmick?.description || 'Classic persona focusing on athletic excellence inside the ring.'}
                  </p>
                </div>
              </div>

              {/* Repackage Drawer / Active Panel */}
              {isRepackaging && (
                <div className="bg-zinc-900 border-2 border-purple-500/80 rounded-xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="font-bold text-white text-xs font-mono flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Repackage Persona: {selectedWrestler.name}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsRepackaging(false)}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {repackageResult ? (
                    <div className="space-y-4 text-center py-4">
                      <div className={`text-4xl font-black font-mono ${
                        repackageResult.grade === 'S' ? 'text-amber-400' :
                        repackageResult.grade === 'A' ? 'text-emerald-400' :
                        repackageResult.grade === 'F' ? 'text-rose-500' : 'text-zinc-200'
                      }`}>
                        GRADE {repackageResult.grade}
                      </div>
                      <p className="text-sm text-zinc-200 font-sans max-w-md mx-auto">
                        {repackageResult.message}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRepackaging(false);
                          setRepackageResult(null);
                        }}
                        className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold"
                      >
                        Accept & Finish
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs font-mono">
                      {/* Template Quick Selection */}
                      <div>
                        <label className="block text-zinc-400 mb-1.5">Select Gimmick Archetype Template</label>
                        <select
                          value={selectedTemplateName}
                          onChange={e => handleSelectTemplate(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                        >
                          {GIMMICK_TEMPLATES.map(t => (
                            <option key={t.name} value={t.name}>{t.name} ({t.category})</option>
                          ))}
                        </select>
                      </div>

                      {/* Custom Name */}
                      <div>
                        <label className="block text-zinc-400 mb-1">Gimmick Name</label>
                        <input
                          type="text"
                          value={customGimmickName}
                          onChange={e => setCustomGimmickName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      {/* Custom Description */}
                      <div>
                        <label className="block text-zinc-400 mb-1">Gimmick Description / Vignette Pitch</label>
                        <textarea
                          rows={2}
                          value={customGimmickDesc}
                          onChange={e => setCustomGimmickDesc(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-400 resize-none"
                        />
                      </div>

                      {/* Execution Buttons: Dynamic Roll or Sandbox Forced Grade */}
                      <div className="pt-2 border-t border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleExecuteRepackage()}
                            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition shadow"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Roll Gimmick Test (Mic-Skill Based)</span>
                          </button>

                          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                            <span>Or Force Grade:</span>
                            {GIMMICK_GRADES.map(g => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => handleExecuteRepackage(g)}
                                className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Edit Stats Drawer / Active Panel */}
              {isEditingStats && editForm && (
                <div className="bg-zinc-900 border-2 border-sky-500/80 rounded-xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="font-bold text-white text-xs font-mono flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-sky-400" />
                      <span>Full Wrestler Stats Customizer: {editForm.name}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingStats(false)}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                    {/* Name */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Nickname */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Nickname</label>
                      <input
                        type="text"
                        value={editForm.nickname}
                        onChange={e => setEditForm({ ...editForm, nickname: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Push Level */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Push Level</label>
                      <select
                        value={editForm.push}
                        onChange={e => setEditForm({ ...editForm, push: e.target.value as PushLevel })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      >
                        {PUSH_LEVELS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Alignment */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Alignment</label>
                      <select
                        value={editForm.alignment}
                        onChange={e => setEditForm({ ...editForm, alignment: e.target.value as Alignment })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      >
                        <option value="Face">Babyface</option>
                        <option value="Heel">Heel</option>
                      </select>
                    </div>

                    {/* Style */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Wrestling Style</label>
                      <select
                        value={editForm.style}
                        onChange={e => setEditForm({ ...editForm, style: e.target.value as WrestlerStyle })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      >
                        {STYLES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Age</label>
                      <input
                        type="number"
                        min="18"
                        max="65"
                        value={editForm.age}
                        onChange={e => setEditForm({ ...editForm, age: parseInt(e.target.value) || 25 })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Overness */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Overness (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.overness}
                        onChange={e => setEditForm({ ...editForm, overness: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Workrate */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Workrate (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.workrate}
                        onChange={e => setEditForm({ ...editForm, workrate: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Mic Skills */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Mic Skills (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.micSkills}
                        onChange={e => setEditForm({ ...editForm, micSkills: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Stamina */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Stamina (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.stamina}
                        onChange={e => setEditForm({ ...editForm, stamina: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Morale */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Morale (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.morale}
                        onChange={e => setEditForm({ ...editForm, morale: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Fatigue */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Fatigue (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.fatigue}
                        onChange={e => setEditForm({ ...editForm, fatigue: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Salary */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Weekly Salary ($)</label>
                      <input
                        type="number"
                        min="500"
                        max="100000"
                        value={editForm.salary}
                        onChange={e => setEditForm({ ...editForm, salary: parseInt(e.target.value) || 5000 })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Contract Weeks */}
                    <div>
                      <label className="block text-zinc-400 mb-1">Contract Weeks</label>
                      <input
                        type="number"
                        min="1"
                        max="104"
                        value={editForm.contractWeeks}
                        onChange={e => setEditForm({ ...editForm, contractWeeks: parseInt(e.target.value) || 52 })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                      />
                    </div>

                    {/* Injury Clearance Button */}
                    <div className="flex flex-col justify-end">
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, injury: { injured: false } })}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
                          editForm.injury.injured
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500 hover:bg-rose-900/50'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {editForm.injury.injured ? 'Clear Medical Injury' : 'Healthy (Uninjured)'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingStats(false)}
                      className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStats}
                      className="px-4 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save All Changes</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create New Wrestler Modal */}
      {isCreatingWrestler && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-amber-500 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base font-mono flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Create Original Wrestler</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingWrestler(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Name</label>
                <input
                  type="text"
                  value={newWrestlerForm.name}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Nickname</label>
                <input
                  type="text"
                  value={newWrestlerForm.nickname}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, nickname: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Gender</label>
                <select
                  value={newWrestlerForm.gender}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, gender: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Alignment</label>
                <select
                  value={newWrestlerForm.alignment}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, alignment: e.target.value as Alignment })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                >
                  <option value="Face">Babyface</option>
                  <option value="Heel">Heel</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Style</label>
                <select
                  value={newWrestlerForm.style}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, style: e.target.value as WrestlerStyle })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                >
                  {STYLES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Push Level</label>
                <select
                  value={newWrestlerForm.push}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, push: e.target.value as PushLevel })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                >
                  {PUSH_LEVELS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Overness (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newWrestlerForm.overness}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, overness: parseInt(e.target.value) || 50 })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Workrate (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newWrestlerForm.workrate}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, workrate: parseInt(e.target.value) || 50 })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Mic Skills (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newWrestlerForm.micSkills}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, micSkills: parseInt(e.target.value) || 50 })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Weekly Salary ($)</label>
                <input
                  type="number"
                  min="500"
                  max="100000"
                  value={newWrestlerForm.salary}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, salary: parseInt(e.target.value) || 6000 })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Contract (Weeks)</label>
                <input
                  type="number"
                  min="4"
                  max="104"
                  value={newWrestlerForm.contractWeeks}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, contractWeeks: parseInt(e.target.value) || 40 })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Age</label>
                <input
                  type="number"
                  min="18"
                  max="60"
                  value={newWrestlerForm.age}
                  onChange={e => setNewWrestlerForm({ ...newWrestlerForm, age: parseInt(e.target.value) || 26 })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCreatingWrestler(false)}
                className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 text-xs font-mono hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewWrestler}
                className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Add to Active Roster</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

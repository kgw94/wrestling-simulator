import React, { useState } from 'react';
import { Promotion, Difficulty } from '../types';
import { PRESET_PROMOTIONS } from '../data/promotions';
import { MarkdownTableView } from './MarkdownTableView';
import { Shield, Skull, Zap, Sparkles, Trophy, Tv, DollarSign, Users, Award, Play } from 'lucide-react';

interface SetupMenuProps {
  onStartGame: (selectedPromotion: Promotion, difficulty: Difficulty) => void;
}

export const SetupMenu: React.FC<SetupMenuProps> = ({ onStartGame }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('apw');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [isCustom, setIsCustom] = useState(false);

  // Custom promotion form state
  const [customName, setCustomName] = useState('Pro Wrestling Syndicate');
  const [customShort, setCustomShort] = useState('PWS');
  const [customStyle, setCustomStyle] = useState<Promotion['style']>('Custom Hybrid');
  const [customBudget, setCustomBudget] = useState(2000000);
  const [customShowName, setCustomShowName] = useState('PWS Prime Time');
  const [customNetwork, setCustomNetwork] = useState('National Cable Sports (Weekly)');

  const selectedPreset = PRESET_PROMOTIONS.find(p => p.id === selectedPresetId) || PRESET_PROMOTIONS[0];

  const handleStart = () => {
    if (isCustom) {
      // Build custom promotion by cloning template roster from the preset that closest matches style
      const basePreset = customStyle === 'Hardcore / Extreme' 
        ? PRESET_PROMOTIONS[1] 
        : customStyle === 'Lucha & Puroresu' 
        ? PRESET_PROMOTIONS[2] 
        : PRESET_PROMOTIONS[0];

      const customPromotion: Promotion = {
        ...basePreset,
        id: `custom-${Date.now()}`,
        name: customName.trim() || 'Custom Championship Wrestling',
        shortName: customShort.trim() || 'CCW',
        style: customStyle,
        budget: customBudget,
        weeklyTVShow: customShowName.trim() || 'Weekly Explosive',
        tvNetwork: customNetwork.trim() || 'Cable Syndication',
        description: `Player-founded promotion emphasizing ${customStyle} action. Head Booker at the helm.`,
        roster: basePreset.roster.map((w, i) => ({
          ...w,
          id: `custom-w-${i + 1}`,
          salary: Math.round(customBudget * 0.003) + 1500
        })),
        titles: [
          {
            id: 'custom-world',
            name: `${customShort} World Championship`,
            prestige: 80,
            currentHolderIds: [`custom-w-1`],
            defenses: 1,
            history: [{ holderNames: basePreset.roster[0]?.name || 'Champion', wonWeek: 1, defenses: 1 }]
          },
          {
            id: 'custom-tv',
            name: `${customShort} Television Title`,
            prestige: 68,
            currentHolderIds: [`custom-w-3`],
            defenses: 0,
            history: [{ holderNames: basePreset.roster[2]?.name || 'Champion', wonWeek: 1, defenses: 0 }]
          }
        ],
        feuds: [
          {
            id: 'custom-feud-1',
            name: `${basePreset.roster[0]?.name} vs. ${basePreset.roster[1]?.name}`,
            wrestlerAIds: ['custom-w-1'],
            wrestlerBIds: ['custom-w-2'],
            heat: 78,
            startedWeek: 1,
            momentum: 'Simmering',
            description: 'The premier rivalry battling for control and championship glory.'
          }
        ]
      };
      onStartGame(customPromotion, difficulty);
    } else {
      onStartGame(selectedPreset, difficulty);
    }
  };

  const setupMarkdown = `| # | Promotion Name | Style | Budget | Starter Roster | TV Network & Broadcast | Min Rating |
|---|---|---|---|---|---|---|
| [1] | Apex Pro Wrestling (APW) | Mainstream Giant | $5,000,000 | 16 Superstars | Global Sports Net (Prime Time) | 68 / 100 |
| [2] | Violence Underground (VU) | Hardcore / Extreme | $450,000 | 14 Renegades | Midnight Grind TV (Late Cable) | 46 / 100 |
| [3] | Shin-Sekai Pro Wrestling (SSPW) | Lucha & Puroresu | $1,200,000 | 14 Athletes | Neo-Tokyo Sports Cable | 58 / 100 |
| [4] | Custom Promotion | User-Defined | Configurable | 14-16 Roster | Custom Broadcaster | Flexible |

Difficulty Setting: [ ${difficulty.toUpperCase()} ]
- Easy: +20% Budget growth, forgiving TV executives, lower injury risk.
- Medium: Standard EWR/TEW simulation balance, authentic fatigue and crowd ratings.
- Hard: High operational expenses, impatient television networks, heightened injury frequency.`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start p-4 md:p-8">
      <div className="w-full max-w-5xl space-y-6">
        {/* Game Title & Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono tracking-wider uppercase">
            <Trophy className="w-3.5 h-3.5" /> Interactive EWR/TEW Booking Simulator
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-mono uppercase">
            Wrestling Booking Simulator
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Take the book. Manage locker room egos, craft rivalries, book match cards, and produce five-star wrestling television.
          </p>
        </div>

        {/* Markdown Specification View */}
        <MarkdownTableView
          title="PROMOTION SELECTION & SIMULATION SETUP MENU"
          markdown={setupMarkdown}
          defaultToMarkdown={false}
        >
          <div className="text-xs text-zinc-400 space-y-2 font-mono">
            <p className="text-zinc-300">
              Welcome, General Manager. Select an established federation below, or choose option [4] to charter a custom promotion from scratch.
            </p>
          </div>
        </MarkdownTableView>

        {/* Numbered Setup Options Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-mono">
              <Award className="w-5 h-5 text-amber-400" />
              <span>1. Promotion Selection</span>
            </h2>
            <span className="text-xs text-zinc-400 font-mono">Select a preset or build your own</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Preset 1: APW */}
            <div
              onClick={() => {
                setIsCustom(false);
                setSelectedPresetId('apw');
              }}
              className={`relative cursor-pointer rounded-xl p-5 border transition-all ${
                !isCustom && selectedPresetId === 'apw'
                  ? 'bg-zinc-900 border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/40">
                  [ 1 ]
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Mainstream Giant
                </span>
              </div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded bg-amber-500/10 text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Apex Pro Wrestling</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4 line-clamp-3">
                {PRESET_PROMOTIONS[0].description}
              </p>
              <div className="space-y-1.5 text-xs font-mono pt-3 border-t border-zinc-800/80 text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Starting Budget:</span>
                  <span className="text-emerald-400 font-bold">$5,000,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-sky-400" /> Starter Roster:</span>
                  <span>16 Superstars</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><Tv className="w-3.5 h-3.5 text-amber-400" /> Weekly TV:</span>
                  <span className="truncate max-w-[140px]" title="APW Friday Night Apex">Friday Night Apex</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Network: Global Sports Net</span>
                  <span className="text-amber-400 font-semibold">Req: 68+</span>
                </div>
              </div>
            </div>

            {/* Preset 2: VU */}
            <div
              onClick={() => {
                setIsCustom(false);
                setSelectedPresetId('vu');
              }}
              className={`relative cursor-pointer rounded-xl p-5 border transition-all ${
                !isCustom && selectedPresetId === 'vu'
                  ? 'bg-zinc-900 border-red-500 ring-1 ring-red-500/50 shadow-lg shadow-red-500/10'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 font-mono text-xs font-bold border border-red-500/40">
                  [ 2 ]
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Hardcore & Indie
                </span>
              </div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded bg-red-500/10 text-red-400">
                  <Skull className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Violence Underground</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4 line-clamp-3">
                {PRESET_PROMOTIONS[1].description}
              </p>
              <div className="space-y-1.5 text-xs font-mono pt-3 border-t border-zinc-800/80 text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Starting Budget:</span>
                  <span className="text-emerald-400 font-bold">$450,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-sky-400" /> Starter Roster:</span>
                  <span>14 Renegades</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><Tv className="w-3.5 h-3.5 text-amber-400" /> Weekly TV:</span>
                  <span className="truncate max-w-[140px]" title="VU Wednesday Night Anarchy">Wednesday Night Anarchy</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Network: Midnight Grind TV</span>
                  <span className="text-red-400 font-semibold">Req: 46+</span>
                </div>
              </div>
            </div>

            {/* Preset 3: SSPW */}
            <div
              onClick={() => {
                setIsCustom(false);
                setSelectedPresetId('sspw');
              }}
              className={`relative cursor-pointer rounded-xl p-5 border transition-all ${
                !isCustom && selectedPresetId === 'sspw'
                  ? 'bg-zinc-900 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/40">
                  [ 3 ]
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Lucha & Puroresu
                </span>
              </div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Shin-Sekai Pro Wrestling</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4 line-clamp-3">
                {PRESET_PROMOTIONS[2].description}
              </p>
              <div className="space-y-1.5 text-xs font-mono pt-3 border-t border-zinc-800/80 text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Starting Budget:</span>
                  <span className="text-emerald-400 font-bold">$1,200,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-sky-400" /> Starter Roster:</span>
                  <span>14 Athletes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><Tv className="w-3.5 h-3.5 text-amber-400" /> Weekly TV:</span>
                  <span className="truncate max-w-[140px]" title="SSPW Strong Style Saturday">Strong Style Saturday</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Network: Neo-Tokyo Sports</span>
                  <span className="text-cyan-400 font-semibold">Req: 58+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Option 4: Custom Promotion Section */}
        <div className="space-y-3">
          <div
            onClick={() => setIsCustom(!isCustom)}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              isCustom
                ? 'bg-zinc-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/40">
                  [ 4 ]
                </span>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Custom Promotion Option</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Create your own wrestling federation with custom branding, style, and war chest.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={`text-xs px-3 py-1 rounded font-mono font-semibold transition ${
                  isCustom ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {isCustom ? 'Active Custom' : 'Configure Custom'}
              </button>
            </div>

            {isCustom && (
              <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1">Promotion Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. Apex Championship Wrestling"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Short Initials / Tag</label>
                  <input
                    type="text"
                    value={customShort}
                    onChange={e => setCustomShort(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. ACW"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Wrestling Style</label>
                  <select
                    value={customStyle}
                    onChange={e => setCustomStyle(e.target.value as Promotion['style'])}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Mainstream Giant">Mainstream Sports Entertainment</option>
                    <option value="Hardcore / Extreme">Hardcore & Deathmatch</option>
                    <option value="Lucha & Puroresu">Lucha & Strong Style Puroresu</option>
                    <option value="Custom Hybrid">Modern Independent Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Starting Budget</label>
                  <select
                    value={customBudget}
                    onChange={e => setCustomBudget(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value={350000}>$350,000 (Scrappy Indie)</option>
                    <option value={1000000}>$1,000,000 (Growing Contender)</option>
                    <option value={2500000}>$2,500,000 (Funded Heavyweight)</option>
                    <option value={5000000}>$5,000,000 (Major Corporation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Weekly TV Show Name</label>
                  <input
                    type="text"
                    value={customShowName}
                    onChange={e => setCustomShowName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. Wednesday Night Warfare"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Broadcaster / Network</label>
                  <input
                    type="text"
                    value={customNetwork}
                    onChange={e => setCustomNetwork(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. Prime Cable Sports"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Option 5: Difficulty Setting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 text-xs font-bold">[ 5 ]</span>
              <span>Difficulty Level</span>
            </h2>
            <span className="text-xs text-zinc-400 font-mono">Select simulation tolerance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`p-3.5 rounded-lg border text-left transition flex flex-col justify-between ${
                  difficulty === diff
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm mb-1">
                  <span>{diff}</span>
                  {difficulty === diff && <span className="text-amber-400 text-xs">● Active</span>}
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400 font-sans">
                  {diff === 'Easy' && 'Generous budget, patient network executives, reduced injury rates.'}
                  {diff === 'Medium' && 'Realistic EWR/TEW balance, authentic crowd reactions, standard wear & tear.'}
                  {diff === 'Hard' && 'Strict broadcaster ratings demands, higher injury risk, aggressive salary overhead.'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Confirmation & Launch Action */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-zinc-400">Selected Charter:</div>
            <div className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="text-amber-400">
                {isCustom ? customName : selectedPreset.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-normal">
                {isCustom ? customStyle : selectedPreset.style}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-normal">
                {difficulty} Difficulty
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Initializes a roster of 14-16 fictional stars, 2-3 Championships, and weekly broadcast schedule.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="w-full md:w-auto px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>ENTER BOOKING OFFICE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

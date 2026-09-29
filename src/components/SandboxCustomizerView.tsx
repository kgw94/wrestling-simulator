import React, { useState } from 'react';
import { Promotion, Difficulty, CustomMatchRule, ThemeSettings, ThemePresetId, AccentColor, BackgroundStyle } from '../types';
import { DEFAULT_CUSTOM_MATCH_RULES } from '../data/customDefaults';
import { 
  THEME_PRESETS, 
  ACCENT_COLORS, 
  BACKGROUND_STYLES, 
  DEFAULT_THEME_SETTINGS, 
  getResolvedTheme 
} from '../data/themes';
import { formatNumber } from '../utils/format';
import { 
  Sliders, 
  Settings, 
  Tv, 
  DollarSign, 
  Trophy, 
  Swords, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ChevronLeft,
  Flame,
  ShieldCheck,
  RotateCcw,
  Palette,
  Sparkles,
  Layers,
  Eye,
  CheckCircle2,
  Calendar,
  Star,
  HardDrive
} from 'lucide-react';

interface SandboxCustomizerViewProps {
  promotion: Promotion;
  difficulty: Difficulty;
  onUpdatePromotion: (newPromo: Promotion) => void;
  onUpdateDifficulty: (newDiff: Difficulty) => void;
  onBackToMenu: () => void;
  themeSettings?: ThemeSettings;
  onUpdateThemeSettings?: (newTheme: ThemeSettings) => void;
  onOpenSaveModal?: () => void;
}

type SettingsTab = 'theme_colors' | 'promotion_params' | 'match_builder';

export const SandboxCustomizerView: React.FC<SandboxCustomizerViewProps> = ({
  promotion,
  difficulty,
  onUpdatePromotion,
  onUpdateDifficulty,
  onBackToMenu,
  themeSettings = DEFAULT_THEME_SETTINGS,
  onUpdateThemeSettings,
  onOpenSaveModal
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme_colors');
  const [promoForm, setPromoForm] = useState<Promotion>({ ...promotion });
  const [diffState, setDiffState] = useState<Difficulty>(difficulty);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Local theme state initialized from props
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(
    themeSettings || promotion.themeSettings || DEFAULT_THEME_SETTINGS
  );

  const activeThemeConfig = getResolvedTheme(currentTheme);

  // Custom Match Rules state
  const customMatchRules: CustomMatchRule[] = (promoForm.customMatchRules && promoForm.customMatchRules.length > 0)
    ? promoForm.customMatchRules
    : DEFAULT_CUSTOM_MATCH_RULES;

  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomMatchRule | null>(null);
  const [ruleForm, setRuleForm] = useState<CustomMatchRule>({
    id: '',
    name: 'Custom Deathmatch',
    description: 'Brutal encounter with unique combat conditions.',
    minParticipants: 2,
    maxParticipants: 4,
    dangerLevel: 'Dangerous',
    workrateMultiplier: 1.15,
    spectacleBonus: 10,
    injuryRiskBonus: 10,
    isElimination: false,
    isTitleEligible: true
  });

  const showNotification = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3500);
  };

  // Change Theme Preset
  const handleSelectPreset = (presetId: ThemePresetId) => {
    const presetDef = THEME_PRESETS.find(p => p.id === presetId);
    if (!presetDef) return;

    const newTheme: ThemeSettings = {
      ...currentTheme,
      preset: presetId,
      accentColor: presetDef.defaultAccent,
      backgroundStyle: presetDef.defaultBg
    };

    setCurrentTheme(newTheme);
    if (onUpdateThemeSettings) {
      onUpdateThemeSettings(newTheme);
    }
    const updatedPromo = { ...promoForm, themeSettings: newTheme };
    setPromoForm(updatedPromo);
    onUpdatePromotion(updatedPromo);

    showNotification(`Switched theme to ${presetDef.name}!`);
  };

  // Change Accent Color
  const handleSelectAccent = (accent: AccentColor) => {
    const newTheme: ThemeSettings = {
      ...currentTheme,
      accentColor: accent
    };

    setCurrentTheme(newTheme);
    if (onUpdateThemeSettings) {
      onUpdateThemeSettings(newTheme);
    }
    const updatedPromo = { ...promoForm, themeSettings: newTheme };
    setPromoForm(updatedPromo);
    onUpdatePromotion(updatedPromo);

    const accentDef = ACCENT_COLORS.find(a => a.id === accent);
    showNotification(`Applied accent color: ${accentDef?.name || accent}!`);
  };

  // Change Background Style
  const handleSelectBackground = (bg: BackgroundStyle) => {
    const newTheme: ThemeSettings = {
      ...currentTheme,
      backgroundStyle: bg
    };

    setCurrentTheme(newTheme);
    if (onUpdateThemeSettings) {
      onUpdateThemeSettings(newTheme);
    }
    const updatedPromo = { ...promoForm, themeSettings: newTheme };
    setPromoForm(updatedPromo);
    onUpdatePromotion(updatedPromo);

    const bgDef = BACKGROUND_STYLES.find(b => b.id === bg);
    showNotification(`Background density set to ${bgDef?.name || bg}!`);
  };

  // Reset to default theme
  const handleResetTheme = () => {
    setCurrentTheme(DEFAULT_THEME_SETTINGS);
    if (onUpdateThemeSettings) {
      onUpdateThemeSettings(DEFAULT_THEME_SETTINGS);
    }
    const updatedPromo = { ...promoForm, themeSettings: DEFAULT_THEME_SETTINGS };
    setPromoForm(updatedPromo);
    onUpdatePromotion(updatedPromo);
    showNotification('Visual theme reset to Attitude Noir & Gold.');
  };

  const handleSaveAllPromotion = () => {
    const finalPromo = {
      ...promoForm,
      themeSettings: currentTheme
    };
    onUpdatePromotion(finalPromo);
    onUpdateDifficulty(diffState);
    if (onUpdateThemeSettings) {
      onUpdateThemeSettings(currentTheme);
    }
    showNotification('Promotion parameters, visual themes & match rules saved successfully!');
  };

  // Rule Handlers
  const handleOpenCreateRule = () => {
    setIsCreatingRule(true);
    setEditingRule(null);
    setRuleForm({
      id: `match-rule-${Date.now()}`,
      name: 'Custom Gimmick Match',
      description: 'Customized combat rules and stipulations.',
      minParticipants: 2,
      maxParticipants: 4,
      dangerLevel: 'Dangerous',
      workrateMultiplier: 1.15,
      spectacleBonus: 10,
      injuryRiskBonus: 8,
      isElimination: false,
      isTitleEligible: true
    });
  };

  const handleOpenEditRule = (rule: CustomMatchRule) => {
    setEditingRule(rule);
    setIsCreatingRule(false);
    setRuleForm({ ...rule });
  };

  const handleSaveRule = () => {
    if (!ruleForm.name.trim()) return;

    let updatedRules: CustomMatchRule[];
    if (isCreatingRule) {
      updatedRules = [...customMatchRules, ruleForm];
    } else if (editingRule) {
      updatedRules = customMatchRules.map(r => (r.id === editingRule.id ? ruleForm : r));
    } else {
      return;
    }

    const updatedPromo = { ...promoForm, customMatchRules: updatedRules };
    setPromoForm(updatedPromo);
    onUpdatePromotion(updatedPromo);
    setIsCreatingRule(false);
    setEditingRule(null);
    showNotification(`Match rule "${ruleForm.name}" saved!`);
  };

  const handleDeleteRule = (id: string) => {
    const updatedRules = customMatchRules.filter(r => r.id !== id);
    const updatedPromo = { ...promoForm, customMatchRules: updatedRules };
    setPromoForm(updatedPromo);
    onUpdatePromotion(updatedPromo);
    showNotification('Custom match rule removed.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings & Sandbox Customizer</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <span>Settings, Themes & Match Customizer</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Personalize your simulator with era-specific visual themes (Attitude Gold, Monday Night Raw, SmackDown Sapphire, Puroresu Emerald), adjust accent colors, tweak financial capital, and create custom match rules.
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
            onClick={handleSaveAllPromotion}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition shadow shadow-amber-500/10"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('theme_colors')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'theme_colors'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Visual Theme & Color Accent</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promotion_params')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'promotion_params'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Promotion Identity & Network</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('match_builder')}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 ${
            activeTab === 'match_builder'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Custom Match Rules ({customMatchRules.length})</span>
        </button>

        {onOpenSaveModal && (
          <button
            type="button"
            onClick={onOpenSaveModal}
            className="px-4 py-2 text-xs font-mono font-bold rounded-md transition flex items-center gap-2 shrink-0 text-emerald-400 hover:text-white hover:bg-zinc-800/80 ml-auto border border-emerald-500/30"
          >
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Save & Load Game (JSON)</span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: VISUAL THEME & COLOR ACCENT STUDIO */}
      {/* ============================================================ */}
      {activeTab === 'theme_colors' && (
        <div className="space-y-6">
          {/* Active Palette Summary Box */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-amber-950/20 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner border border-white/20"
                style={{ 
                  backgroundColor: activeThemeConfig.accentDef.hex,
                  color: currentTheme.preset === 'clean_slate_light' ? '#ffffff' : '#000000' 
                }}
              >
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-mono">
                    {activeThemeConfig.presetDef.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-zinc-800 text-amber-400 border border-zinc-700">
                    {activeThemeConfig.presetDef.eraTag}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                  Active Accent: <strong className="text-zinc-200">{activeThemeConfig.accentDef.name}</strong> • Canvas: <strong className="text-zinc-200">{BACKGROUND_STYLES.find(b => b.id === currentTheme.backgroundStyle)?.name}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetTheme}
              className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center gap-1.5 border border-zinc-700 transition"
              title="Reset to default Attitude Noir & Gold theme"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Theme</span>
            </button>
          </div>

          {/* Section 1: Curated Wrestling Era Themes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1. Select Wrestling Era Theme Preset</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Each preset calibrates ambient backgrounds, borders, card surfaces, and typography for iconic wrestling eras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {THEME_PRESETS.map(preset => {
                const isActive = currentTheme.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`text-left p-4 rounded-xl border transition flex flex-col justify-between group relative overflow-hidden ${
                      isActive
                        ? 'border-amber-500 bg-zinc-950 shadow-md shadow-amber-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-950'
                    }`}
                  >
                    <div>
                      {/* Top Swatch Palette Indicator */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-4 h-4 rounded-full border border-zinc-700 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.bg }}
                            title="Canvas Background"
                          />
                          <span 
                            className="w-4 h-4 rounded-full border border-zinc-700 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.surface }}
                            title="Card Surface"
                          />
                          <span 
                            className="w-4 h-4 rounded-full border border-zinc-700 shadow-sm"
                            style={{ backgroundColor: preset.previewColors.accent }}
                            title="Primary Accent"
                          />
                        </div>

                        {isActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-black flex items-center gap-1 shadow">
                            <Check className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                            {preset.eraTag}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white font-mono text-sm group-hover:text-amber-300 transition">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                        {preset.tagline}
                      </p>
                      <p className="text-xs text-zinc-400 font-sans mt-1.5 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>Click to activate</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.previewColors.accent }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Accent Color Customizer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>2. Customize Primary Accent & Highlight Color</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Customize buttons, badges, key metrics, and broadcast highlights independently of the era theme preset.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACCENT_COLORS.map(accent => {
                const isSelected = currentTheme.accentColor === accent.id;
                return (
                  <button
                    key={accent.id}
                    type="button"
                    onClick={() => handleSelectAccent(accent.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-zinc-950 shadow-md ring-1 ring-amber-500/50'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-950'
                    }`}
                  >
                    <span 
                      className="w-7 h-7 rounded-lg shadow-sm flex items-center justify-center shrink-0 border border-white/20"
                      style={{ backgroundColor: accent.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-black drop-shadow" />}
                    </span>

                    <div>
                      <div className="font-bold text-white text-xs font-mono">
                        {accent.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {accent.hex.toUpperCase()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Canvas Background Density & Contrast */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>3. Canvas Background Density & Contrast</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Choose the base canvas tone: standard dark zinc, pure OLED black (#000000), deep midnight slate, or studio light mode.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BACKGROUND_STYLES.map(bg => {
                const isSelected = currentTheme.backgroundStyle === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => handleSelectBackground(bg.id)}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-zinc-950 shadow-md ring-1 ring-amber-500/50'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span 
                          className="w-5 h-5 rounded border border-zinc-700 shadow-sm"
                          style={{ backgroundColor: bg.hex }}
                        />
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white font-mono text-xs">
                        {bg.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        {bg.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Live Arena & Show Card Interactive Sandbox Preview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Live Arena & Booking Card Preview</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Simulated preview of how booked matches, badges, metrics, and actions look in the active theme.
                </p>
              </div>

              <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                Live Interactive Sandbox
              </span>
            </div>

            {/* Live Mock Segment Card */}
            <div className={`p-4 rounded-xl border transition ${activeThemeConfig.cardBgClass} ${activeThemeConfig.cardBorderClass} ${activeThemeConfig.glowClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="flex flex-col items-center justify-center w-11 h-11 rounded-lg font-mono font-bold shadow shrink-0"
                    style={{ 
                      backgroundColor: activeThemeConfig.accentDef.hex,
                      color: '#000000'
                    }}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-80">SEG</span>
                    <span className="text-base font-black">#5</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">
                        Singles (World Title Match)
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold border ${activeThemeConfig.accentBadgeClass}`}>
                        ★ MAIN EVENT (35% Weight)
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono flex items-center gap-1 border border-amber-500/30">
                        <Trophy className="w-3 h-3" /> World Heavyweight Championship
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-mono flex items-center gap-1 border border-orange-500/30">
                        <Flame className="w-3 h-3" /> Feud Heat: 92/100
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white font-mono pt-0.5">
                      Thunder Vance vs. "The Sovereign" Jack Sterling
                    </div>

                    <p className="text-xs text-zinc-400 font-sans">
                      Finish: Clean Pinfall via Thunder Driver (18 Minutes) • Projected Rating: <strong className="text-amber-400">★★★★3/4 (92/100)</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition shadow ${activeThemeConfig.accentButtonClass}`}
                  >
                    <span>Edit Segment</span>
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition"
                  >
                    <span>Simulate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PROMOTION IDENTITY & BROADCASTING PARAMETERS */}
      {/* ============================================================ */}
      {activeTab === 'promotion_params' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Promotion Identity & Broadcasting Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
            {/* Promotion Name */}
            <div>
              <label className="block text-zinc-400 mb-1">Promotion Name</label>
              <input
                type="text"
                value={promoForm.name}
                onChange={e => setPromoForm({ ...promoForm, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Short Name */}
            <div>
              <label className="block text-zinc-400 mb-1">Short Acronym</label>
              <input
                type="text"
                value={promoForm.shortName}
                onChange={e => setPromoForm({ ...promoForm, shortName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-zinc-400 mb-1">Promotion Style</label>
              <select
                value={promoForm.style}
                onChange={e => setPromoForm({ ...promoForm, style: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              >
                <option value="Mainstream Giant">Mainstream Giant</option>
                <option value="Hardcore / Extreme">Hardcore / Extreme</option>
                <option value="Lucha & Puroresu">Lucha & Puroresu</option>
                <option value="Custom Hybrid">Custom Hybrid</option>
              </select>
            </div>

            {/* Weekly TV Show */}
            <div>
              <label className="block text-zinc-400 mb-1">Weekly TV Show Name</label>
              <input
                type="text"
                value={promoForm.weeklyTVShow}
                onChange={e => setPromoForm({ ...promoForm, weeklyTVShow: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* TV Network */}
            <div>
              <label className="block text-zinc-400 mb-1">Broadcaster / Network</label>
              <input
                type="text"
                value={promoForm.tvNetwork}
                onChange={e => setPromoForm({ ...promoForm, tvNetwork: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Game Difficulty */}
            <div>
              <label className="block text-zinc-400 mb-1">Career Difficulty</label>
              <select
                value={diffState}
                onChange={e => setDiffState(e.target.value as Difficulty)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              >
                <option value="Easy">Easy (High budget & lenient network)</option>
                <option value="Medium">Medium (Balanced standard)</option>
                <option value="Hard">Hard (Severe injury risk & tough network)</option>
              </select>
            </div>

            {/* Current Budget */}
            <div>
              <label className="block text-zinc-400 mb-1">Current Capital Budget ($)</label>
              <input
                type="number"
                step="10000"
                value={promoForm.budget}
                onChange={e => setPromoForm({ ...promoForm, budget: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Fanbase */}
            <div>
              <label className="block text-zinc-400 mb-1">Fanbase Size</label>
              <input
                type="number"
                step="5000"
                value={promoForm.fanbase}
                onChange={e => setPromoForm({ ...promoForm, fanbase: parseInt(e.target.value) || 10000 })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Prestige */}
            <div>
              <label className="block text-zinc-400 mb-1">Promotion Prestige (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={promoForm.prestige}
                onChange={e => setPromoForm({ ...promoForm, prestige: Math.max(0, Math.min(100, parseInt(e.target.value) || 50)) })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Production Tier */}
            <div>
              <label className="block text-zinc-400 mb-1">Production Tier</label>
              <select
                value={promoForm.productionTier}
                onChange={e => setPromoForm({ ...promoForm, productionTier: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              >
                <option value="Low Indie">Low Indie</option>
                <option value="Standard Broadcast">Standard Broadcast</option>
                <option value="High-End HD">High-End HD</option>
                <option value="Global Stadium Tier">Global Stadium Tier</option>
              </select>
            </div>

            {/* Production Cost */}
            <div>
              <label className="block text-zinc-400 mb-1">Weekly Production Cost ($)</label>
              <input
                type="number"
                step="1000"
                value={promoForm.productionCostWeekly}
                onChange={e => setPromoForm({ ...promoForm, productionCostWeekly: parseInt(e.target.value) || 10000 })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>

            {/* Broadcaster Min Rating */}
            <div>
              <label className="block text-zinc-400 mb-1">Network Min Rating (0-100)</label>
              <input
                type="number"
                min="10"
                max="95"
                value={promoForm.minNetworkRating}
                onChange={e => setPromoForm({ ...promoForm, minNetworkRating: parseInt(e.target.value) || 60 })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CUSTOM MATCH RULE BUILDER */}
      {/* ============================================================ */}
      {activeTab === 'match_builder' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Custom Match Stipulation Builder ({customMatchRules.length} Stipulations)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Create dangerous match rules with customizable workrate multipliers, injury hazards, and crowd spectacle bonuses.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateRule}
              className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Match Rule</span>
            </button>
          </div>

          {/* Create / Edit Rule Drawer */}
          {(isCreatingRule || editingRule) && (
            <div className="bg-zinc-950 border-2 border-amber-500 rounded-xl p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h4 className="font-bold text-white text-xs font-mono">
                  {isCreatingRule ? 'Create New Match Stipulation' : `Edit Rule: ${editingRule?.name}`}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingRule(false);
                    setEditingRule(null);
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1">Stipulation Name</label>
                  <input
                    type="text"
                    value={ruleForm.name}
                    onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                    placeholder="e.g. Barbed Wire Deathmatch"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Danger Level</label>
                  <select
                    value={ruleForm.dangerLevel}
                    onChange={e => setRuleForm({ ...ruleForm, dangerLevel: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="Safe">Safe</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Dangerous">Dangerous</option>
                    <option value="Extremely Brutal">Extremely Brutal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Workrate Multiplier (0.8 - 1.5x)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.8"
                    max="1.5"
                    value={ruleForm.workrateMultiplier}
                    onChange={e => setRuleForm({ ...ruleForm, workrateMultiplier: parseFloat(e.target.value) || 1.0 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Spectacle Rating Bonus (0-25)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={ruleForm.spectacleBonus}
                    onChange={e => setRuleForm({ ...ruleForm, spectacleBonus: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Injury Risk Bonus (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={ruleForm.injuryRiskBonus}
                    onChange={e => setRuleForm({ ...ruleForm, injuryRiskBonus: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={ruleForm.isElimination}
                      onChange={e => setRuleForm({ ...ruleForm, isElimination: e.target.checked })}
                      className="rounded text-amber-500"
                    />
                    <span>Elimination Format</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={ruleForm.isTitleEligible}
                      onChange={e => setRuleForm({ ...ruleForm, isTitleEligible: e.target.checked })}
                      className="rounded text-amber-500"
                    />
                    <span>Title Eligible</span>
                  </label>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-zinc-400 mb-1">Description / Ring Psychology</label>
                  <input
                    type="text"
                    value={ruleForm.description}
                    onChange={e => setRuleForm({ ...ruleForm, description: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white"
                    placeholder="e.g. Weapon spots and high spots give massive crowd reaction."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingRule(false);
                    setEditingRule(null);
                  }}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRule}
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Stipulation</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Custom Match Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {customMatchRules.map(rule => (
              <div
                key={rule.id}
                className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between transition space-y-2 text-xs font-mono"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      rule.dangerLevel === 'Extremely Brutal' ? 'bg-rose-950 text-rose-300 border border-rose-500/50' :
                      rule.dangerLevel === 'Dangerous' ? 'bg-orange-950 text-orange-300 border border-orange-500/50' :
                      rule.dangerLevel === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-500/50' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {rule.dangerLevel.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditRule(rule)}
                        className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-900"
                        title="Edit Rule"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {customMatchRules.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-900"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-sm">
                    {rule.name}
                  </h4>

                  <p className="text-[11px] text-zinc-400 font-sans line-clamp-2 mt-1">
                    {rule.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="text-amber-400 font-bold">+{rule.spectacleBonus} Spectacle</span>
                  <span>{rule.workrateMultiplier}x Workrate</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

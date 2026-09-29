import { ThemeSettings, ThemePresetId, AccentColor, BackgroundStyle } from '../types';

export interface ThemePresetDefinition {
  id: ThemePresetId;
  name: string;
  eraTag: string;
  tagline: string;
  description: string;
  defaultAccent: AccentColor;
  defaultBg: BackgroundStyle;
  previewColors: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
    border: string;
  };
  rootBgClass: string;
  rootTextClass: string;
  navBgClass: string;
  navBorderClass: string;
  cardBgClass: string;
  cardBorderClass: string;
  accentBadgeClass: string;
  glowClass: string;
}

export const THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: 'attitude_gold',
    name: 'Attitude Noir & Gold',
    eraTag: 'Attitude Era',
    tagline: 'Iconic Dark Prestige & Championship Gold',
    description: 'Deep obsidian zinc backdrop paired with championship gold luster. The classic late-90s broadcast aesthetic with sharp contrast.',
    defaultAccent: 'gold',
    defaultBg: 'obsidian',
    previewColors: {
      bg: '#09090b',
      surface: '#18181b',
      accent: '#f59e0b',
      text: '#f4f4f5',
      border: '#27272a'
    },
    rootBgClass: 'bg-zinc-950',
    rootTextClass: 'text-zinc-100',
    navBgClass: 'bg-zinc-900/95',
    navBorderClass: 'border-zinc-800',
    cardBgClass: 'bg-zinc-900',
    cardBorderClass: 'border-zinc-800 hover:border-amber-500/60',
    accentBadgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    glowClass: 'shadow-amber-500/10'
  },
  {
    id: 'monday_night_raw',
    name: 'Monday Night War (Crimson Raw)',
    eraTag: 'Monday Night Flagship',
    tagline: 'High-Octane Velvet Crimson & Pyrotechnics',
    description: 'Dark ruby charcoal and blood-crimson highlights reminiscent of explosive Monday night television battlefields.',
    defaultAccent: 'red',
    defaultBg: 'obsidian',
    previewColors: {
      bg: '#0d0404',
      surface: '#1c0a0a',
      accent: '#ef4444',
      text: '#fee2e2',
      border: '#3f1212'
    },
    rootBgClass: 'bg-[#0d0404]',
    rootTextClass: 'text-zinc-100',
    navBgClass: 'bg-[#180909]/95',
    navBorderClass: 'border-red-900/50',
    cardBgClass: 'bg-[#1a0a0a]',
    cardBorderClass: 'border-red-900/40 hover:border-red-500/70',
    accentBadgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    glowClass: 'shadow-red-600/15'
  },
  {
    id: 'smackdown_sapphire',
    name: 'Friday Night Stadium (Electric Blue)',
    eraTag: 'Broadcast Sapphire',
    tagline: 'Midnight Cobalt & High-Definition Lasers',
    description: 'Deep navy midnight slate paired with electric cyan and sapphire arena lights for stadium supercards.',
    defaultAccent: 'blue',
    defaultBg: 'midnight',
    previewColors: {
      bg: '#030712',
      surface: '#0b1329',
      accent: '#38bdf8',
      text: '#e0f2fe',
      border: '#1e293b'
    },
    rootBgClass: 'bg-[#030712]',
    rootTextClass: 'text-slate-100',
    navBgClass: 'bg-[#091124]/95',
    navBorderClass: 'border-blue-900/50',
    cardBgClass: 'bg-[#0b152d]',
    cardBorderClass: 'border-blue-900/40 hover:border-sky-400/70',
    accentBadgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    glowClass: 'shadow-sky-500/15'
  },
  {
    id: 'strong_style_emerald',
    name: 'Strong Style Puroresu (Emerald Jade)',
    eraTag: 'Tokyo Dome Fighting Spirit',
    tagline: 'Deep Forest Jade & Combat Honor',
    description: 'Restrained, dignified dark forest obsidian with sharp mint emerald lines inspired by premier Japanese puroresu federations.',
    defaultAccent: 'emerald',
    defaultBg: 'obsidian',
    previewColors: {
      bg: '#020b05',
      surface: '#081a0e',
      accent: '#10b981',
      text: '#d1fae5',
      border: '#064e3b'
    },
    rootBgClass: 'bg-[#020b05]',
    rootTextClass: 'text-zinc-100',
    navBgClass: 'bg-[#07170c]/95',
    navBorderClass: 'border-emerald-900/50',
    cardBgClass: 'bg-[#091f11]',
    cardBorderClass: 'border-emerald-900/40 hover:border-emerald-400/70',
    accentBadgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    glowClass: 'shadow-emerald-500/15'
  },
  {
    id: 'lucha_neon_purple',
    name: 'Lucha Libre & Extreme (Neon Amethyst)',
    eraTag: 'Lucha & ECW Rebellion',
    tagline: 'High-Flying Velvet Violet & Neon Drama',
    description: 'Electric amethyst and hot magenta hues honoring masked high-fliers, hardcore rebellion, and late-night underground supercards.',
    defaultAccent: 'purple',
    defaultBg: 'obsidian',
    previewColors: {
      bg: '#0b0312',
      surface: '#1b0928',
      accent: '#c084fc',
      text: '#fae8ff',
      border: '#3b0764'
    },
    rootBgClass: 'bg-[#0b0312]',
    rootTextClass: 'text-purple-50',
    navBgClass: 'bg-[#160620]/95',
    navBorderClass: 'border-purple-900/50',
    cardBgClass: 'bg-[#1b0928]',
    cardBorderClass: 'border-purple-900/40 hover:border-purple-400/70',
    accentBadgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    glowClass: 'shadow-purple-500/15'
  },
  {
    id: 'vintage_territory',
    name: 'Vintage Territory 80s (Warm Sepia & Bronze)',
    eraTag: 'Golden Age Territory',
    tagline: 'Weathered Brass, Leather & Tobacco Smoke',
    description: 'Warm sepia-tinted charcoal and weathered brass accents celebrating the historic southern territory booking circuits.',
    defaultAccent: 'orange',
    defaultBg: 'obsidian',
    previewColors: {
      bg: '#0d0a07',
      surface: '#1a140e',
      accent: '#f59e0b',
      text: '#fef3c7',
      border: '#451a03'
    },
    rootBgClass: 'bg-[#0d0a07]',
    rootTextClass: 'text-amber-50',
    navBgClass: 'bg-[#18130d]/95',
    navBorderClass: 'border-amber-900/50',
    cardBgClass: 'bg-[#1c160f]',
    cardBorderClass: 'border-amber-900/40 hover:border-amber-400/70',
    accentBadgeClass: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
    glowClass: 'shadow-amber-600/15'
  },
  {
    id: 'clean_slate_light',
    name: 'Executive Studio Light (Clean Slate)',
    eraTag: 'Corporate HQ & Broadcast',
    tagline: 'Crisp Platinum White & Corporate Slate',
    description: 'Clean, modern executive suite interface for bookers who prefer high-legibility spreadsheet aesthetics with deep slate contrasts.',
    defaultAccent: 'blue',
    defaultBg: 'clean_light',
    previewColors: {
      bg: '#f8fafc',
      surface: '#ffffff',
      accent: '#2563eb',
      text: '#0f172a',
      border: '#cbd5e1'
    },
    rootBgClass: 'bg-slate-100',
    rootTextClass: 'text-slate-900',
    navBgClass: 'bg-white/95',
    navBorderClass: 'border-slate-200',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-slate-200 hover:border-blue-400 text-slate-800 shadow-sm',
    accentBadgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    glowClass: 'shadow-slate-300/40'
  }
];

export interface AccentColorDefinition {
  id: AccentColor;
  name: string;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
  ringClass: string;
}

export const ACCENT_COLORS: AccentColorDefinition[] = [
  {
    id: 'gold',
    name: 'Championship Gold',
    hex: '#f59e0b',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    ringClass: 'ring-amber-500'
  },
  {
    id: 'red',
    name: 'Crimson Raw',
    hex: '#ef4444',
    bgClass: 'bg-red-500',
    textClass: 'text-red-400',
    borderClass: 'border-red-500',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    ringClass: 'ring-red-500'
  },
  {
    id: 'blue',
    name: 'Electric Sapphire',
    hex: '#0ea5e9',
    bgClass: 'bg-sky-500',
    textClass: 'text-sky-400',
    borderClass: 'border-sky-500',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    ringClass: 'ring-sky-500'
  },
  {
    id: 'purple',
    name: 'Royal Amethyst',
    hex: '#a855f7',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    ringClass: 'ring-purple-500'
  },
  {
    id: 'emerald',
    name: 'Strong Style Emerald',
    hex: '#10b981',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    ringClass: 'ring-emerald-500'
  },
  {
    id: 'pink',
    name: 'Neon Cyber Lucha',
    hex: '#ec4899',
    bgClass: 'bg-pink-500',
    textClass: 'text-pink-400',
    borderClass: 'border-pink-500',
    badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    ringClass: 'ring-pink-500'
  },
  {
    id: 'orange',
    name: 'Territory Bronze',
    hex: '#f97316',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    ringClass: 'ring-orange-500'
  },
  {
    id: 'lime',
    name: 'Radioactive Lime',
    hex: '#84cc16',
    bgClass: 'bg-lime-500',
    textClass: 'text-lime-400',
    borderClass: 'border-lime-500',
    badgeClass: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
    ringClass: 'ring-lime-500'
  }
];

export interface BackgroundStyleDefinition {
  id: BackgroundStyle;
  name: string;
  tagline: string;
  hex: string;
}

export const BACKGROUND_STYLES: BackgroundStyleDefinition[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Zinc',
    tagline: 'Deep dark zinc with balanced contrast (Default)',
    hex: '#09090b'
  },
  {
    id: 'oled',
    name: 'Pitch OLED Black',
    tagline: 'Pure black (#000000) for maximal OLED battery & pop',
    hex: '#000000'
  },
  {
    id: 'midnight',
    name: 'Midnight Navy',
    tagline: 'Subtle deep blue-slate stadium undertones',
    hex: '#030712'
  },
  {
    id: 'clean_light',
    name: 'Studio Light Slate',
    tagline: 'High-contrast clean executive light office theme',
    hex: '#f8fafc'
  }
];

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  preset: 'attitude_gold',
  accentColor: 'gold',
  backgroundStyle: 'obsidian',
  enableGlowEffects: true
};

export function getResolvedTheme(settings?: ThemeSettings) {
  const current = settings || DEFAULT_THEME_SETTINGS;
  const presetDef = THEME_PRESETS.find(p => p.id === current.preset) || THEME_PRESETS[0];
  const accentDef = ACCENT_COLORS.find(a => a.id === current.accentColor) || ACCENT_COLORS[0];
  const isLight = current.preset === 'clean_slate_light' || current.backgroundStyle === 'clean_light';

  // Dynamic root classes
  let rootBgClass = presetDef.rootBgClass;
  if (current.backgroundStyle === 'oled') {
    rootBgClass = 'bg-black';
  } else if (current.backgroundStyle === 'midnight') {
    rootBgClass = 'bg-[#030712]';
  } else if (current.backgroundStyle === 'clean_light') {
    rootBgClass = 'bg-slate-100';
  }

  const rootTextClass = isLight ? 'text-slate-900' : presetDef.rootTextClass;

  return {
    presetDef,
    accentDef,
    isLight,
    rootBgClass,
    rootTextClass,
    navBgClass: presetDef.navBgClass,
    navBorderClass: presetDef.navBorderClass,
    cardBgClass: presetDef.cardBgClass,
    cardBorderClass: presetDef.cardBorderClass,
    accentBadgeClass: accentDef.badgeClass,
    accentButtonClass: `${accentDef.bgClass} text-black font-bold hover:opacity-90`,
    accentTextClass: accentDef.textClass,
    accentBorderClass: accentDef.borderClass,
    glowClass: presetDef.glowClass
  };
}

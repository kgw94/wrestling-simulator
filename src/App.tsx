/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  GameState, 
  Promotion, 
  Difficulty, 
  Segment, 
  Wrestler, 
  ShowResult,
  GameView
} from './types';
import { PRESET_PROMOTIONS, INITIAL_FREE_AGENTS } from './data/promotions';
import { 
  DEFAULT_PPV_CALENDAR, 
  DEFAULT_CUSTOM_MATCH_RULES, 
  DEFAULT_CREATIVE_NOTES, 
  DEFAULT_HALL_OF_FAME_INDUCTEES,
  DEFAULT_RETIRED_WRESTLERS,
  generateDefaultStorylines 
} from './data/customDefaults';
import { calculateShowResult, advanceWeekEngine, autoGenerateShowCard } from './engine/simulation';
import { HeaderSummary } from './components/HeaderSummary';
import { SetupMenu } from './components/SetupMenu';
import { MainMenu } from './components/MainMenu';
import { BookShowView } from './components/BookShowView';
import { RosterView } from './components/RosterView';
import { TitlesFeudsView } from './components/TitlesFeudsView';
import { FinancesView } from './components/FinancesView';
import { NewsView } from './components/NewsView';
import { ShowResultModal } from './components/ShowResultModal';
import { PPVCalendarView } from './components/PPVCalendarView';
import { GimmickLabView } from './components/GimmickLabView';
import { TagFactionsView } from './components/TagFactionsView';
import { LockerRoomView } from './components/LockerRoomView';
import { SandboxCustomizerView } from './components/SandboxCustomizerView';
import { WritersHubView } from './components/WritersHubView';
import { HallOfFameView } from './components/HallOfFameView';
import { GMOfficeView } from './components/GMOfficeView';
import { TournamentsView } from './components/TournamentsView';
import { DevelopmentalView } from './components/DevelopmentalView';
import { BrandSplitView } from './components/BrandSplitView';
import { SaveGameModal } from './components/SaveGameModal';
import { getDefaultDevelopmentalTerritory, getDefaultBrandSplit } from './data/developmentalAndBrandDefaults';
import { getDefaultGMForPromotion, DEFAULT_AVAILABLE_GMS } from './engine/gmEngine';
import { ThemeSettings } from './types';
import { DEFAULT_THEME_SETTINGS, getResolvedTheme } from './data/themes';
import { 
  Tv, 
  Users, 
  Flame, 
  DollarSign, 
  FastForward, 
  Home, 
  RotateCcw, 
  Newspaper, 
  Radio, 
  Sparkles, 
  Swords, 
  HeartHandshake, 
  Sliders, 
  PenTool, 
  Trophy, 
  Palette,
  Settings,
  Briefcase,
  HardDrive,
  GraduationCap,
  Split
} from 'lucide-react';

const STORAGE_KEY = 'ewr_wrestling_simulator_state_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hasStarted && parsed.promotion) {
          // Heal state in case previous null/NaN numbers were saved
          if (parsed.promotion.budget === null || isNaN(parsed.promotion.budget)) {
            parsed.promotion.budget = 2000000;
          }
          if (parsed.promotion.fanbase === null || isNaN(parsed.promotion.fanbase)) {
            parsed.promotion.fanbase = 50000;
          }
          if (parsed.promotion.prestige === null || isNaN(parsed.promotion.prestige)) {
            parsed.promotion.prestige = 75;
          }
          if (parsed.promotion.productionCostWeekly === null || isNaN(parsed.promotion.productionCostWeekly)) {
            parsed.promotion.productionCostWeekly = 25000;
          }
          if (parsed.promotion.networkSatisfaction === null || isNaN(parsed.promotion.networkSatisfaction)) {
            parsed.promotion.networkSatisfaction = 80;
          }
          if (Array.isArray(parsed.promotion.roster)) {
            parsed.promotion.roster = parsed.promotion.roster.map((w: any) => ({
              ...w,
              salary: (w.salary === null || isNaN(w.salary)) ? 5000 : w.salary,
              wins: (w.wins === null || isNaN(w.wins)) ? 0 : w.wins,
              losses: (w.losses === null || isNaN(w.losses)) ? 0 : w.losses,
              draws: (w.draws === null || isNaN(w.draws)) ? 0 : w.draws,
              morale: (w.morale === null || isNaN(w.morale)) ? 80 : w.morale,
              fatigue: (w.fatigue === null || isNaN(w.fatigue)) ? 0 : w.fatigue,
              injury: w.injury || { injured: false },
              retirementAge: (w.retirementAge === null || isNaN(w.retirementAge)) 
                ? Math.max(w.age + 2, w.style === 'High Flyer' ? 40 : w.style === 'Hardcore' ? 41 : w.style === 'Powerhouse' ? 45 : 44) 
                : w.retirementAge,
              careerInjuriesCount: w.careerInjuriesCount || 0,
              injuryHistory: w.injuryHistory || []
            }));
          }
          if (Array.isArray(parsed.financialHistory)) {
            parsed.financialHistory = parsed.financialHistory.map((f: any) => ({
              ...f,
              netProfit: (f.netProfit === null || isNaN(f.netProfit)) ? 0 : f.netProfit,
              endingBalance: (f.endingBalance === null || isNaN(f.endingBalance)) ? parsed.promotion.budget : f.endingBalance
            }));
          }
          if (parsed.latestShowResult) {
            parsed.latestShowResult.attendance = (parsed.latestShowResult.attendance === null || isNaN(parsed.latestShowResult.attendance)) ? 2500 : parsed.latestShowResult.attendance;
            parsed.latestShowResult.gateRevenue = (parsed.latestShowResult.gateRevenue === null || isNaN(parsed.latestShowResult.gateRevenue)) ? 50000 : parsed.latestShowResult.gateRevenue;
          }
          if (!parsed.promotion.ppvSchedule || parsed.promotion.ppvSchedule.length === 0) {
            parsed.promotion.ppvSchedule = DEFAULT_PPV_CALENDAR;
          }
          if (!parsed.promotion.customMatchRules || parsed.promotion.customMatchRules.length === 0) {
            parsed.promotion.customMatchRules = DEFAULT_CUSTOM_MATCH_RULES;
          }
          if (!parsed.promotion.tagTeams) {
            parsed.promotion.tagTeams = [];
          }
          if (!parsed.promotion.factions) {
            parsed.promotion.factions = [];
          }
          if (!parsed.promotion.activeIncidents) {
            parsed.promotion.activeIncidents = [];
          }
          if (!parsed.promotion.resolvedIncidents) {
            parsed.promotion.resolvedIncidents = [];
          }
          if (!parsed.promotion.lockerRoomRule) {
            parsed.promotion.lockerRoomRule = 'Balanced Professionalism';
          }
          if (!parsed.promotion.storylineArcs || parsed.promotion.storylineArcs.length === 0) {
            parsed.promotion.storylineArcs = generateDefaultStorylines(parsed.promotion, parsed.currentWeek || 1, parsed.currentYear || 2026);
          }
          if (!parsed.promotion.creativeNotes) {
            parsed.promotion.creativeNotes = DEFAULT_CREATIVE_NOTES;
          }
          if (!parsed.promotion.creativePhilosophy) {
            parsed.promotion.creativePhilosophy = 'Sports Entertainment Spectacle';
          }
          if (!parsed.promotion.hallOfFame || parsed.promotion.hallOfFame.length === 0) {
            parsed.promotion.hallOfFame = DEFAULT_HALL_OF_FAME_INDUCTEES;
          }
          if (!parsed.promotion.retiredRoster || parsed.promotion.retiredRoster.length === 0) {
            parsed.promotion.retiredRoster = DEFAULT_RETIRED_WRESTLERS;
          }
          if (!parsed.themeSettings) {
            parsed.themeSettings = parsed.promotion.themeSettings || DEFAULT_THEME_SETTINGS;
          }
          if (!parsed.promotion.themeSettings) {
            parsed.promotion.themeSettings = parsed.themeSettings;
          }
          if (!parsed.promotion.currentGM) {
            parsed.promotion.currentGM = getDefaultGMForPromotion(parsed.promotion.style);
          }
          if (!parsed.promotion.availableGMs || parsed.promotion.availableGMs.length === 0) {
            parsed.promotion.availableGMs = DEFAULT_AVAILABLE_GMS;
          }
          if (!parsed.promotion.tournaments) {
            parsed.promotion.tournaments = [];
          }
          if (!parsed.promotion.completedTournaments) {
            parsed.promotion.completedTournaments = [];
          }
          if (!parsed.promotion.developmentalTerritory) {
            parsed.promotion.developmentalTerritory = getDefaultDevelopmentalTerritory(parsed.promotion);
          }
          if (!parsed.promotion.brandSplit) {
            parsed.promotion.brandSplit = getDefaultBrandSplit(parsed.promotion);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load saved game state', e);
    }

    const initPromo = {
      ...PRESET_PROMOTIONS[0],
      ppvSchedule: DEFAULT_PPV_CALENDAR,
      customMatchRules: DEFAULT_CUSTOM_MATCH_RULES,
      tagTeams: [],
      factions: [],
      activeIncidents: [],
      resolvedIncidents: [],
      lockerRoomRule: 'Balanced Professionalism' as const,
      storylineArcs: generateDefaultStorylines(PRESET_PROMOTIONS[0], 1, 2026),
      creativeNotes: DEFAULT_CREATIVE_NOTES,
      creativePhilosophy: 'Sports Entertainment Spectacle' as const,
      hallOfFame: DEFAULT_HALL_OF_FAME_INDUCTEES,
      retiredRoster: DEFAULT_RETIRED_WRESTLERS,
      tournaments: [],
      completedTournaments: [],
      developmentalTerritory: getDefaultDevelopmentalTerritory(PRESET_PROMOTIONS[0]),
      brandSplit: getDefaultBrandSplit(PRESET_PROMOTIONS[0]),
      themeSettings: DEFAULT_THEME_SETTINGS,
      currentGM: getDefaultGMForPromotion(PRESET_PROMOTIONS[0].style),
      availableGMs: DEFAULT_AVAILABLE_GMS
    };

    return {
      hasStarted: false,
      difficulty: 'Medium',
      currentWeek: 1,
      currentYear: 2026,
      promotion: initPromo,
      freeAgents: INITIAL_FREE_AGENTS,
      currentShowCard: [],
      showHistory: [],
      financialHistory: [],
      newsArchive: [
        {
          id: 'news-init-1',
          week: 1,
          category: 'Promotion',
          importance: 'High',
          headline: 'New Head Booker Appointed!',
          details: 'Management officially hands complete booking authority and roster control to the new General Manager for the upcoming television season.'
        },
        {
          id: 'news-init-2',
          week: 1,
          category: 'Industry',
          importance: 'Medium',
          headline: 'Television Network Demands Stellar Ratings',
          details: 'Broadcaster representatives released their quarterly ratings expectations, urging management to produce electric weekly main events.'
        }
      ],
      averageShowRating: 0,
      topFeudHeat: 0,
      currentView: 'menu',
      themeSettings: DEFAULT_THEME_SETTINGS
    };
  });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Save game state changes to localStorage
  useEffect(() => {
    try {
      if (gameState.hasStarted) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      }
    } catch (e) {
      console.warn('Could not save game state', e);
    }
  }, [gameState]);

  // Start the game after promotion selection
  const handleStartGame = (selectedPromotion: Promotion, difficulty: Difficulty) => {
    const activeTheme = gameState.themeSettings || selectedPromotion.themeSettings || DEFAULT_THEME_SETTINGS;
    const promoWithDefaults: Promotion = {
      ...selectedPromotion,
      ppvSchedule: selectedPromotion.ppvSchedule || DEFAULT_PPV_CALENDAR,
      customMatchRules: selectedPromotion.customMatchRules || DEFAULT_CUSTOM_MATCH_RULES,
      tagTeams: selectedPromotion.tagTeams || [],
      factions: selectedPromotion.factions || [],
      activeIncidents: selectedPromotion.activeIncidents || [],
      resolvedIncidents: selectedPromotion.resolvedIncidents || [],
      lockerRoomRule: selectedPromotion.lockerRoomRule || 'Balanced Professionalism',
      storylineArcs: selectedPromotion.storylineArcs || generateDefaultStorylines(selectedPromotion, 1, 2026),
      creativeNotes: selectedPromotion.creativeNotes || DEFAULT_CREATIVE_NOTES,
      creativePhilosophy: selectedPromotion.creativePhilosophy || 'Sports Entertainment Spectacle',
      hallOfFame: selectedPromotion.hallOfFame || DEFAULT_HALL_OF_FAME_INDUCTEES,
      retiredRoster: selectedPromotion.retiredRoster || DEFAULT_RETIRED_WRESTLERS,
      developmentalTerritory: selectedPromotion.developmentalTerritory || getDefaultDevelopmentalTerritory(selectedPromotion),
      brandSplit: selectedPromotion.brandSplit || getDefaultBrandSplit(selectedPromotion),
      themeSettings: activeTheme,
      currentGM: selectedPromotion.currentGM || getDefaultGMForPromotion(selectedPromotion.style),
      availableGMs: selectedPromotion.availableGMs || DEFAULT_AVAILABLE_GMS
    };
    const topFeud = promoWithDefaults.feuds.slice().sort((a, b) => b.heat - a.heat)[0];
    setGameState({
      hasStarted: true,
      difficulty,
      currentWeek: 1,
      currentYear: 2026,
      promotion: promoWithDefaults,
      freeAgents: INITIAL_FREE_AGENTS,
      currentShowCard: [],
      showHistory: [],
      financialHistory: [],
      newsArchive: [
        {
          id: `news-start-${Date.now()}`,
          week: 1,
          category: 'Promotion',
          importance: 'High',
          headline: `${promoWithDefaults.name} Ushers in New Booking Era!`,
          details: `The board has officially confirmed the new Head Booker taking the helm of ${promoWithDefaults.weeklyTVShow}.`
        }
      ],
      averageShowRating: 0,
      topFeudHeat: topFeud ? topFeud.heat : 0,
      currentView: 'menu',
      themeSettings: activeTheme
    });
  };

  // Reset / New Game
  const handleResetGame = () => {
    if (window.confirm('Reset current career and return to Promotion Selection? All progress will be cleared.')) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
      setGameState({
        hasStarted: false,
        difficulty: 'Medium',
        currentWeek: 1,
        currentYear: 2026,
        promotion: {
          ...PRESET_PROMOTIONS[0],
          themeSettings: DEFAULT_THEME_SETTINGS
        },
        freeAgents: INITIAL_FREE_AGENTS,
        currentShowCard: [],
        showHistory: [],
        financialHistory: [],
        newsArchive: [],
        averageShowRating: 0,
        topFeudHeat: 0,
        currentView: 'menu',
        themeSettings: DEFAULT_THEME_SETTINGS
      });
    }
  };

  // Advance Week Action
  const handleAdvanceWeek = useCallback(() => {
    // If the booker has hand-booked segments, use them.
    // If the card is empty, auto-generate a balanced card with top stars & feuds.
    const cardToSimulate =
      gameState.currentShowCard.length > 0
        ? gameState.currentShowCard
        : autoGenerateShowCard(gameState.promotion, gameState.currentWeek, gameState.currentYear);

    if (cardToSimulate.length === 0) return;

    // 1. Calculate show results using EWR formula
    const showResult = calculateShowResult(
      cardToSimulate,
      gameState.promotion.roster,
      gameState.promotion.feuds,
      gameState.promotion,
      gameState.currentWeek,
      gameState.currentYear
    );

    // 2. Advance dynamic engine (injuries, overness, fatigue, morale, finances, news)
    const {
      updatedPromotion,
      updatedFreeAgents,
      financialReport,
      newNews,
      nextWeek,
      nextYear
    } = advanceWeekEngine({
      promotion: gameState.promotion,
      currentWeek: gameState.currentWeek,
      currentYear: gameState.currentYear,
      currentShowCard: cardToSimulate,
      showResult,
      freeAgents: gameState.freeAgents,
      difficulty: gameState.difficulty
    });

    const newShowHistory = [showResult, ...gameState.showHistory];
    const totalScores = newShowHistory.reduce((acc, s) => acc + s.overallScore, 0);
    const avgScore = Math.round(totalScores / newShowHistory.length);

    const topFeud = updatedPromotion.feuds.slice().sort((a, b) => b.heat - a.heat)[0];

    setGameState(prev => ({
      ...prev,
      currentWeek: nextWeek,
      currentYear: nextYear,
      promotion: updatedPromotion,
      freeAgents: updatedFreeAgents,
      currentShowCard: [], // reset card for next week
      showHistory: newShowHistory,
      financialHistory: [...prev.financialHistory, financialReport],
      newsArchive: [...newNews, ...prev.newsArchive],
      averageShowRating: avgScore,
      topFeudHeat: topFeud ? topFeud.heat : 0,
      latestShowResult: showResult
    }));
  }, [gameState]);

  // Global Keyboard Shortcuts (1, 2, 3, 4, 5, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing in inputs or textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!gameState.hasStarted) return;

      if (e.key === '1') {
        setGameState(prev => ({ ...prev, currentView: 'book_show' }));
      } else if (e.key === '2') {
        setGameState(prev => ({ ...prev, currentView: 'roster' }));
      } else if (e.key === '3') {
        setGameState(prev => ({ ...prev, currentView: 'titles_feuds' }));
      } else if (e.key === '4') {
        setGameState(prev => ({ ...prev, currentView: 'finances_tv' }));
      } else if (e.key === '5') {
        handleAdvanceWeek();
      } else if (e.key === 'p' || e.key === 'P') {
        setGameState(prev => ({ ...prev, currentView: 'ppv_calendar' }));
      } else if (e.key === 'g' || e.key === 'G') {
        setGameState(prev => ({ ...prev, currentView: 'gm_office' }));
      } else if (e.key === 'k' || e.key === 'K') {
        setGameState(prev => ({ ...prev, currentView: 'gimmick_lab' }));
      } else if (e.key === 't' || e.key === 'T') {
        setGameState(prev => ({ ...prev, currentView: 'tag_factions' }));
      } else if (e.key === 'l' || e.key === 'L') {
        setGameState(prev => ({ ...prev, currentView: 'locker_room' }));
      } else if (e.key === 'o' || e.key === 'O') {
        setGameState(prev => ({ ...prev, currentView: 'tournaments' }));
      } else if (e.key === 's' || e.key === 'S') {
        setGameState(prev => ({ ...prev, currentView: 'settings' }));
      } else if (e.key === 'w' || e.key === 'W') {
        setGameState(prev => ({ ...prev, currentView: 'writers_hub' }));
      } else if (e.key === 'h' || e.key === 'H') {
        setGameState(prev => ({ ...prev, currentView: 'hall_of_fame' }));
      } else if (e.key === 'n' || e.key === 'N') {
        setGameState(prev => ({ ...prev, currentView: 'news' }));
      } else if (e.key === 'Escape') {
        setGameState(prev => ({ ...prev, currentView: 'menu' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.hasStarted, gameState.currentShowCard.length, handleAdvanceWeek]);

  const currentThemeSettings = gameState.themeSettings || gameState.promotion?.themeSettings || DEFAULT_THEME_SETTINGS;
  const resolvedTheme = getResolvedTheme(currentThemeSettings);

  // Sync theme colors with body & document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-accent', resolvedTheme.accentDef.hex);
    root.style.setProperty('--theme-accent-text', resolvedTheme.accentDef.hex);
    if (resolvedTheme.isLight) {
      document.body.className = `${resolvedTheme.rootBgClass} ${resolvedTheme.rootTextClass} antialiased selection:bg-blue-500 selection:text-white`;
    } else {
      document.body.className = `${resolvedTheme.rootBgClass} ${resolvedTheme.rootTextClass} antialiased selection:bg-amber-500 selection:text-black`;
    }
  }, [resolvedTheme]);

  // If promotion not yet chosen, show initial setup screen
  if (!gameState.hasStarted) {
    return (
      <>
        <SetupMenu 
          onStartGame={handleStartGame} 
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
        />
        {isSaveModalOpen && (
          <SaveGameModal
            gameState={gameState}
            onRestoreSave={restored => {
              setGameState(restored);
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
              } catch (e) {
                console.error(e);
              }
              setIsSaveModalOpen(false);
            }}
            onClose={() => setIsSaveModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className={`min-h-screen ${resolvedTheme.rootBgClass} ${resolvedTheme.rootTextClass} flex flex-col font-sans transition-colors duration-200`}>
      {/* Mandated Roster Summary Header */}
      <HeaderSummary
        gameState={gameState}
        onNavigate={view => setGameState(prev => ({ ...prev, currentView: view }))}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
      />

      {/* Main Action Navigation Bar with Numbered Options */}
      <nav className={`${resolvedTheme.navBgClass} border-b ${resolvedTheme.navBorderClass} text-xs font-mono sticky top-[69px] z-30 shadow-sm transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto py-1.5 gap-2 scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1.5 font-bold ${
                gameState.currentView === 'menu'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>HQ</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'book_show' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1.5 font-bold ${
                gameState.currentView === 'book_show'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className="text-[10px] px-1 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700">1</span>
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Book Show</span>
              {gameState.currentShowCard.length > 0 && (
                <span className="ml-0.5 px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                  {gameState.currentShowCard.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'roster' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1.5 font-bold ${
                gameState.currentView === 'roster'
                  ? 'bg-sky-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className="text-[10px] px-1 rounded bg-zinc-800 text-sky-400 font-bold border border-zinc-700">2</span>
              <Users className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Roster</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'titles_feuds' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1.5 font-bold ${
                gameState.currentView === 'titles_feuds'
                  ? 'bg-orange-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className="text-[10px] px-1 rounded bg-zinc-800 text-orange-400 font-bold border border-zinc-700">3</span>
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Titles & Feuds</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'finances_tv' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1.5 font-bold ${
                gameState.currentView === 'finances_tv'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className="text-[10px] px-1 rounded bg-zinc-800 text-emerald-400 font-bold border border-zinc-700">4</span>
              <DollarSign className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Finances</span>
            </button>

            {/* Custom Features in Nav Bar */}
            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'ppv_calendar' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'ppv_calendar'
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="PPV & Supercards Calendar [P]"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">PPV Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'gimmick_lab' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'gimmick_lab'
                  ? 'bg-indigo-500 text-white shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Gimmick Lab & Wrestler Customizer [G]"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">Gimmicks</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'tag_factions' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'tag_factions'
                  ? 'bg-sky-400 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Tag Teams & Factions [T]"
            >
              <Swords className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">Tag & Stables</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'locker_room' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'locker_room'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Locker Room Politics & Morale [L]"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Locker Room</span>
              {(gameState.promotion.activeIncidents || []).filter(i => !i.resolved).length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'tournaments' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'tournaments'
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Tournaments & Championship Cups [O]"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Tournaments</span>
              {(gameState.promotion.tournaments || []).length > 0 && (
                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  {(gameState.promotion.tournaments || []).length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'developmental' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'developmental'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Developmental Territory & Training Dojo [D]"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Dojo</span>
              {(gameState.promotion.developmentalTerritory?.traineeIds || []).length > 0 && (
                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  {(gameState.promotion.developmentalTerritory?.traineeIds || []).length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'brand_split' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'brand_split'
                  ? 'bg-sky-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Dual Brand Split & Draft Lottery [B]"
            >
              <Split className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">Brands</span>
              {gameState.promotion.brandSplit?.isEnabled && (
                <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  ON
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'settings' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'settings' || gameState.currentView === 'sandbox_customizer'
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Settings: Themes, Colors & Customizer [S]"
            >
              <Settings className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden lg:inline">Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'writers_hub' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'writers_hub'
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Writers' Room & Storylines [W]"
            >
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Writers' Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'hall_of_fame' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'hall_of_fame'
                  ? 'bg-yellow-400 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Hall of Fame & Retired Legends [H]"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden lg:inline">Hall of Fame</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'news' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1.5 font-bold ${
                gameState.currentView === 'news'
                  ? 'bg-purple-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span className="hidden md:inline">News</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState(prev => ({ ...prev, currentView: 'gm_office' }))}
              className={`px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold ${
                gameState.currentView === 'gm_office'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="General Manager Booking Desk [G]"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">GM Desk</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSaveModalOpen(true)}
              className="px-2.5 py-1.5 rounded transition flex items-center gap-1 font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700/60"
              title="Save & Load Game (JSON Import/Export)"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Save/Load</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdvanceWeek}
              className="px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95"
              title={
                gameState.currentShowCard.length > 0
                  ? `Broadcast ${gameState.currentShowCard.length} booked segments & advance to Week ${gameState.currentWeek + 1}`
                  : `Simulate TV show & advance to Week ${gameState.currentWeek + 1}`
              }
            >
              <span className="text-[10px] px-1 rounded bg-black/40 text-emerald-300 font-bold">5</span>
              <FastForward className="w-3.5 h-3.5" />
              <span>Advance Week</span>
            </button>

            <button
              type="button"
              onClick={handleResetGame}
              className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition"
              title="Reset Game / New Promotion"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {gameState.currentView === 'menu' && (
          <MainMenu
            gameState={gameState}
            onNavigate={view => setGameState(prev => ({ ...prev, currentView: view }))}
            onAdvanceWeek={handleAdvanceWeek}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
          />
        )}

        {gameState.currentView === 'book_show' && (
          <BookShowView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            currentYear={gameState.currentYear}
            currentCard={gameState.currentShowCard}
            onUpdateCard={newCard => setGameState(prev => ({ ...prev, currentShowCard: newCard }))}
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
            onAdvanceWeek={handleAdvanceWeek}
            onOpenGMOffice={() => setGameState(prev => ({ ...prev, currentView: 'gm_office' }))}
          />
        )}

        {gameState.currentView === 'roster' && (
          <RosterView
            promotion={gameState.promotion}
            freeAgents={gameState.freeAgents}
            onUpdateRoster={newRoster =>
              setGameState(prev => ({
                ...prev,
                promotion: { ...prev.promotion, roster: newRoster }
              }))
            }
            onUpdateFreeAgents={newFA => setGameState(prev => ({ ...prev, freeAgents: newFA }))}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onNavigate={view => setGameState(prev => ({ ...prev, currentView: view }))}
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
            onAddNewsItem={news =>
              setGameState(prev => ({
                ...prev,
                newsArchive: [news, ...prev.newsArchive]
              }))
            }
          />
        )}

        {gameState.currentView === 'titles_feuds' && (
          <TitlesFeudsView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            currentYear={gameState.currentYear}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}

        {gameState.currentView === 'finances_tv' && (
          <FinancesView
            promotion={gameState.promotion}
            financialHistory={gameState.financialHistory}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}

        {gameState.currentView === 'ppv_calendar' && (
          <PPVCalendarView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            currentYear={gameState.currentYear}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}

        {gameState.currentView === 'gimmick_lab' && (
          <GimmickLabView
            promotion={gameState.promotion}
            freeAgents={gameState.freeAgents}
            onUpdateRoster={newRoster =>
              setGameState(prev => ({
                ...prev,
                promotion: { ...prev.promotion, roster: newRoster }
              }))
            }
            onUpdateFreeAgents={newFA => setGameState(prev => ({ ...prev, freeAgents: newFA }))}
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}

        {gameState.currentView === 'tag_factions' && (
          <TagFactionsView
            promotion={gameState.promotion}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}

        {gameState.currentView === 'locker_room' && (
          <LockerRoomView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}

        {gameState.currentView === 'tournaments' && (
          <TournamentsView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            currentYear={gameState.currentYear}
            currentShowCard={gameState.currentShowCard}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onUpdateShowCard={newCard =>
              setGameState(prev => ({
                ...prev,
                currentShowCard: newCard
              }))
            }
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
            onAddNewsItem={news =>
              setGameState(prev => ({
                ...prev,
                newsArchive: [news, ...prev.newsArchive]
              }))
            }
            onNavigateToBookShow={() => setGameState(prev => ({ ...prev, currentView: 'book_show' }))}
          />
        )}

        {(gameState.currentView === 'settings' || gameState.currentView === 'sandbox_customizer') && (
          <SandboxCustomizerView
            promotion={gameState.promotion}
            difficulty={gameState.difficulty}
            themeSettings={currentThemeSettings}
            onUpdateThemeSettings={newTheme =>
              setGameState(prev => ({
                ...prev,
                themeSettings: newTheme,
                promotion: { ...prev.promotion, themeSettings: newTheme }
              }))
            }
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo,
                themeSettings: newPromo.themeSettings || prev.themeSettings
              }))
            }
            onUpdateDifficulty={newDiff =>
              setGameState(prev => ({
                ...prev,
                difficulty: newDiff
              }))
            }
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
          />
        )}

        {gameState.currentView === 'gm_office' && (
          <GMOfficeView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            currentYear={gameState.currentYear}
            currentCard={gameState.currentShowCard}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onUpdateCard={newCard =>
              setGameState(prev => ({
                ...prev,
                currentShowCard: newCard
              }))
            }
            onAdvanceWeek={handleAdvanceWeek}
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
            onOpenBookShow={() => setGameState(prev => ({ ...prev, currentView: 'book_show' }))}
          />
        )}

        {gameState.currentView === 'writers_hub' && (
          <WritersHubView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            currentYear={gameState.currentYear}
            currentShowCard={gameState.currentShowCard}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onUpdateShowCard={newCard =>
              setGameState(prev => ({
                ...prev,
                currentShowCard: newCard
              }))
            }
            onNavigate={view => setGameState(prev => ({ ...prev, currentView: view }))}
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}

        {gameState.currentView === 'hall_of_fame' && (
          <HallOfFameView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            currentYear={gameState.currentYear}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onNavigate={view => setGameState(prev => ({ ...prev, currentView: view }))}
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
            onAddNewsItem={news =>
              setGameState(prev => ({
                ...prev,
                newsArchive: [news, ...prev.newsArchive]
              }))
            }
          />
        )}

        {gameState.currentView === 'developmental' && (
          <DevelopmentalView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            currentYear={gameState.currentYear}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}

        {gameState.currentView === 'brand_split' && (
          <BrandSplitView
            promotion={gameState.promotion}
            currentWeek={gameState.currentWeek}
            currentYear={gameState.currentYear}
            onUpdatePromotion={newPromo =>
              setGameState(prev => ({
                ...prev,
                promotion: newPromo
              }))
            }
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}

        {gameState.currentView === 'news' && (
          <NewsView
            newsArchive={gameState.newsArchive}
            onBackToMenu={() => setGameState(prev => ({ ...prev, currentView: 'menu' }))}
          />
        )}
      </main>

      {/* Show Result Modal (Displayed automatically after advancing week) */}
      {gameState.latestShowResult && (
        <ShowResultModal
          showResult={gameState.latestShowResult}
          promotion={gameState.promotion}
          onClose={() => setGameState(prev => ({ ...prev, latestShowResult: undefined }))}
        />
      )}

      {/* Save Game Import / Export Modal */}
      {isSaveModalOpen && (
        <SaveGameModal
          gameState={gameState}
          onRestoreSave={restored => {
            setGameState(restored);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
            } catch (e) {
              console.error(e);
            }
            setIsSaveModalOpen(false);
          }}
          onClose={() => setIsSaveModalOpen(false)}
        />
      )}
    </div>
  );
}

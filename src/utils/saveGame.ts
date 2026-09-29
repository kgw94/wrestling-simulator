import { GameState } from '../types';
import { 
  DEFAULT_PPV_CALENDAR, 
  DEFAULT_CUSTOM_MATCH_RULES, 
  DEFAULT_CREATIVE_NOTES, 
  DEFAULT_HALL_OF_FAME_INDUCTEES, 
  DEFAULT_RETIRED_WRESTLERS, 
  generateDefaultStorylines 
} from '../data/customDefaults';
import { DEFAULT_THEME_SETTINGS } from '../data/themes';
import { getDefaultGMForPromotion, DEFAULT_AVAILABLE_GMS } from '../engine/gmEngine';

export interface SaveGamePayload {
  saveVersion: number;
  exportedAt: string;
  gameMetadata: {
    promotionName: string;
    promotionShortName: string;
    currentWeek: number;
    currentYear: number;
    rosterCount: number;
    budget: number;
    gmName?: string;
  };
  gameState: GameState;
}

export const QUICK_SAVE_KEY = 'wrestling_booking_quicksave_slot';

/**
 * Downloads the current GameState as a JSON file.
 */
export function exportSaveGameToFile(gameState: GameState): string {
  const payload: SaveGamePayload = {
    saveVersion: 1,
    exportedAt: new Date().toISOString(),
    gameMetadata: {
      promotionName: gameState.promotion?.name || 'Wrestling Promotion',
      promotionShortName: gameState.promotion?.shortName || 'WRESTLING',
      currentWeek: gameState.currentWeek,
      currentYear: gameState.currentYear,
      rosterCount: gameState.promotion?.roster?.length || 0,
      budget: gameState.promotion?.budget || 0,
      gmName: gameState.promotion?.currentGM?.name
    },
    gameState
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const sanitizedShort = (gameState.promotion?.shortName || 'save')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filename = `wrestling-save-${sanitizedShort}-W${gameState.currentWeek}-Y${gameState.currentYear}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Generates raw JSON string for copy to clipboard.
 */
export function exportSaveGameToString(gameState: GameState): string {
  const payload: SaveGamePayload = {
    saveVersion: 1,
    exportedAt: new Date().toISOString(),
    gameMetadata: {
      promotionName: gameState.promotion?.name || 'Wrestling Promotion',
      promotionShortName: gameState.promotion?.shortName || 'WRESTLING',
      currentWeek: gameState.currentWeek,
      currentYear: gameState.currentYear,
      rosterCount: gameState.promotion?.roster?.length || 0,
      budget: gameState.promotion?.budget || 0,
      gmName: gameState.promotion?.currentGM?.name
    },
    gameState
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Validates and restores a save game from JSON text.
 */
export function validateAndParseSaveGame(jsonText: string): { success: boolean; gameState?: GameState; error?: string } {
  try {
    const raw = JSON.parse(jsonText);
    
    // Support either direct GameState or wrapped SaveGamePayload
    const stateCandidate: GameState = raw.gameState ? raw.gameState : raw;

    if (!stateCandidate || typeof stateCandidate !== 'object') {
      return { success: false, error: 'File does not contain valid JSON object.' };
    }

    if (!stateCandidate.promotion || typeof stateCandidate.promotion !== 'object') {
      return { success: false, error: 'Corrupt save: Missing promotion data.' };
    }

    if (!Array.isArray(stateCandidate.promotion.roster)) {
      return { success: false, error: 'Corrupt save: Promotion roster is missing or invalid.' };
    }

    if (!Array.isArray(stateCandidate.promotion.titles)) {
      return { success: false, error: 'Corrupt save: Promotion titles are missing or invalid.' };
    }

    // Ensure all required default arrays and settings are backfilled
    const promo = stateCandidate.promotion;
    if (!promo.feuds) promo.feuds = [];
    if (!promo.tagTeams) promo.tagTeams = [];
    if (!promo.factions) promo.factions = [];
    if (!promo.activeIncidents) promo.activeIncidents = [];
    if (!promo.resolvedIncidents) promo.resolvedIncidents = [];
    if (!promo.ppvSchedule || promo.ppvSchedule.length === 0) promo.ppvSchedule = DEFAULT_PPV_CALENDAR;
    if (!promo.customMatchRules || promo.customMatchRules.length === 0) promo.customMatchRules = DEFAULT_CUSTOM_MATCH_RULES;
    if (!promo.creativeNotes) promo.creativeNotes = DEFAULT_CREATIVE_NOTES;
    if (!promo.storylineArcs || promo.storylineArcs.length === 0) {
      promo.storylineArcs = generateDefaultStorylines(promo, stateCandidate.currentWeek || 1, stateCandidate.currentYear || 2026);
    }
    if (!promo.hallOfFame || promo.hallOfFame.length === 0) promo.hallOfFame = DEFAULT_HALL_OF_FAME_INDUCTEES;
    if (!promo.retiredRoster || promo.retiredRoster.length === 0) promo.retiredRoster = DEFAULT_RETIRED_WRESTLERS;
    if (!promo.creativePhilosophy) promo.creativePhilosophy = 'Sports Entertainment Spectacle';
    if (!promo.lockerRoomRule) promo.lockerRoomRule = 'Balanced Professionalism';

    // GM initialization if absent
    if (!promo.currentGM) {
      promo.currentGM = getDefaultGMForPromotion(promo.style);
    }
    if (!promo.availableGMs || promo.availableGMs.length === 0) {
      promo.availableGMs = DEFAULT_AVAILABLE_GMS;
    }

    // Themes
    if (!stateCandidate.themeSettings) {
      stateCandidate.themeSettings = promo.themeSettings || DEFAULT_THEME_SETTINGS;
    }
    if (!promo.themeSettings) {
      promo.themeSettings = stateCandidate.themeSettings;
    }

    // Top-level arrays
    if (!Array.isArray(stateCandidate.freeAgents)) stateCandidate.freeAgents = [];
    if (!Array.isArray(stateCandidate.currentShowCard)) stateCandidate.currentShowCard = [];
    if (!Array.isArray(stateCandidate.showHistory)) stateCandidate.showHistory = [];
    if (!Array.isArray(stateCandidate.financialHistory)) stateCandidate.financialHistory = [];
    if (!Array.isArray(stateCandidate.newsArchive)) stateCandidate.newsArchive = [];

    // Valid state
    const restoredState: GameState = {
      hasStarted: true,
      difficulty: stateCandidate.difficulty || 'Medium',
      currentWeek: stateCandidate.currentWeek || 1,
      currentYear: stateCandidate.currentYear || 2026,
      promotion: promo,
      freeAgents: stateCandidate.freeAgents,
      currentShowCard: stateCandidate.currentShowCard,
      showHistory: stateCandidate.showHistory,
      financialHistory: stateCandidate.financialHistory,
      newsArchive: stateCandidate.newsArchive,
      averageShowRating: stateCandidate.averageShowRating || 0,
      topFeudHeat: stateCandidate.topFeudHeat || 0,
      currentView: 'menu',
      latestShowResult: stateCandidate.latestShowResult,
      themeSettings: stateCandidate.themeSettings
    };

    return { success: true, gameState: restoredState };
  } catch (err: any) {
    return { success: false, error: `JSON Parse error: ${err.message || 'Invalid format'}` };
  }
}

/**
 * Saves current state to browser QuickSave slot.
 */
export function quickSaveToLocalStorage(gameState: GameState): boolean {
  try {
    const json = JSON.stringify(gameState);
    localStorage.setItem(QUICK_SAVE_KEY, json);
    localStorage.setItem(`${QUICK_SAVE_KEY}_time`, new Date().toISOString());
    return true;
  } catch (err) {
    console.error('QuickSave failed:', err);
    return false;
  }
}

/**
 * Loads current state from browser QuickSave slot.
 */
export function quickLoadFromLocalStorage(): { success: boolean; gameState?: GameState; savedAt?: string; error?: string } {
  try {
    const json = localStorage.getItem(QUICK_SAVE_KEY);
    const savedAt = localStorage.getItem(`${QUICK_SAVE_KEY}_time`);
    if (!json) {
      return { success: false, error: 'No QuickSave data found in browser storage.' };
    }
    const result = validateAndParseSaveGame(json);
    if (!result.success || !result.gameState) {
      return { success: false, error: result.error || 'Failed to restore QuickSave.' };
    }
    return { success: true, gameState: result.gameState, savedAt: savedAt || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to read QuickSave.' };
  }
}

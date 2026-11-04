import { GameState } from './types';

export const SAVE_STORAGE_KEY = 'absent_minute_save_v1';
export const CURRENT_SAVE_VERSION = 1;

export function createInitialGameState(): GameState {
  return {
    version: CURRENT_SAVE_VERSION,
    started: false,
    currentScene: 'vestibulo',
    visitedScenes: ['vestibulo'],
    channel: 'A',
    inventory: [],
    documentsFound: [],
    transcriptsFound: [],
    puzzlesSolved: [],
    flags: {},
    hintLevels: {
      circuito_emergencia: 0,
      registros_incompatibles: 0,
      secuencia_calibracion: 0,
      pasillo_discontinuo: 0,
      reconstruir_minuto: 0,
    },
    inspectedObjects: [],
    endingReached: null,
    settings: {
      volume: 0.75,
      muted: false,
      subtitles: true,
      reducedMotion: false,
    },
  };
}

const VALID_SCENES = new Set([
  'vestibulo',
  'vigilancia',
  'archivo',
  'laboratorio',
  'pasillo',
  'camara',
]);

const VALID_CHANNELS = new Set(['A', 'B', 'C']);

export function isValidGameState(candidate: unknown): candidate is GameState {
  if (!candidate || typeof candidate !== 'object') return false;
  const obj = candidate as Record<string, unknown>;

  if (obj.version !== CURRENT_SAVE_VERSION) return false;
  if (typeof obj.started !== 'boolean') return false;
  if (typeof obj.currentScene !== 'string' || !VALID_SCENES.has(obj.currentScene)) {
    return false;
  }
  if (typeof obj.channel !== 'string' || !VALID_CHANNELS.has(obj.channel)) {
    return false;
  }
  if (!Array.isArray(obj.inventory) || obj.inventory.length > 4) return false;
  if (!Array.isArray(obj.documentsFound)) return false;
  if (!Array.isArray(obj.transcriptsFound)) return false;
  if (!Array.isArray(obj.puzzlesSolved)) return false;
  if (!obj.settings || typeof obj.settings !== 'object') return false;

  return true;
}

export interface LoadSaveResult {
  state: GameState | null;
  corrupted: boolean;
}

export function loadGameStateFromStorage(): LoadSaveResult {
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) {
      return { state: null, corrupted: false };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isValidGameState(parsed)) {
      return { state: null, corrupted: true };
    }
    return { state: parsed, corrupted: false };
  } catch {
    return { state: null, corrupted: true };
  }
}

export function saveGameStateToStorage(state: GameState): boolean {
  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(SAVE_STORAGE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}

export function clearSavedGameStorage(): void {
  try {
    window.localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch {
    // Ignorar fallos de almacenamiento restringido
  }
}

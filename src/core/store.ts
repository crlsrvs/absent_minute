import { create } from 'zustand';
import {
  DocumentId,
  EchoChannel,
  EndingId,
  GameState,
  HotspotDefinition,
  ItemId,
  PuzzleId,
  SceneId,
  StoryFlag,
  SubtitleCue,
  TranscriptId,
  UserSettings,
} from './types';
import {
  clearSavedGameStorage,
  createInitialGameState,
  loadGameStateFromStorage,
  saveGameStateToStorage,
} from './persistence';
import { gameEventBus } from './events';
import { SCENES_DATA } from '../narrative/scenesData';
import {
  AUDIO_TRANSCRIPTS,
  INVENTORY_CATALOG,
  NARRATIVE_DOCUMENTS,
} from '../narrative/documents';

export interface ActiveModalState {
  type: 'none' | 'briefing' | 'dossier' | 'puzzle' | 'options' | 'credits' | 'hints';
  puzzleId?: PuzzleId;
  initialDossierTab?: 'documents' | 'transcripts' | 'notes';
  selectedDocumentId?: DocumentId;
  selectedTranscriptId?: TranscriptId;
}

export interface GameStore extends GameState {
  hasSavedGame: boolean;
  saveCorruptedWarning: boolean;
  activeModal: ActiveModalState;
  focusedHotspotId: string | null;
  inspectionMessage: { title: string; body: string } | null;
  subtitleCue: SubtitleCue | null;

  // Actions
  initFromStorage: () => void;
  startNewGame: () => void;
  continueSavedGame: () => void;
  returnToMainMenu: () => void;
  setChannel: (channel: EchoChannel) => void;
  enterScene: (sceneId: SceneId) => { ok: boolean; reason?: string };
  interactWithHotspot: (hotspot: HotspotDefinition) => void;
  collectItem: (itemId: ItemId) => void;
  unlockDocument: (docId: DocumentId) => void;
  unlockTranscript: (transcriptId: TranscriptId) => void;
  completePuzzle: (puzzleId: PuzzleId) => void;
  setStoryFlag: (flag: StoryFlag, value?: boolean) => void;
  requestNextHint: (puzzleId: PuzzleId) => number;
  selectEnding: (ending: EndingId) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  setActiveModal: (modal: ActiveModalState) => void;
  setFocusedHotspotId: (id: string | null) => void;
  setInspectionMessage: (msg: { title: string; body: string } | null) => void;
  pushSubtitle: (cue: Omit<SubtitleCue, 'id'>) => void;
  dismissCorruptedWarning: () => void;
}

function extractPersistableState(store: GameState): GameState {
  return {
    version: store.version,
    started: store.started,
    currentScene: store.currentScene,
    visitedScenes: store.visitedScenes,
    channel: store.channel,
    inventory: store.inventory,
    documentsFound: store.documentsFound,
    transcriptsFound: store.transcriptsFound,
    puzzlesSolved: store.puzzlesSolved,
    flags: store.flags,
    hintLevels: store.hintLevels,
    inspectedObjects: store.inspectedObjects,
    endingReached: store.endingReached,
    settings: store.settings,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialGameState(),
  hasSavedGame: false,
  saveCorruptedWarning: false,
  activeModal: { type: 'none' },
  focusedHotspotId: null,
  inspectionMessage: null,
  subtitleCue: null,

  initFromStorage: () => {
    const { state, corrupted } = loadGameStateFromStorage();
    if (corrupted) {
      set({ hasSavedGame: false, saveCorruptedWarning: true });
      return;
    }
    if (state && state.started) {
      set({
        hasSavedGame: true,
        saveCorruptedWarning: false,
        settings: state.settings,
      });
    } else {
      set({ hasSavedGame: false, saveCorruptedWarning: false });
    }
  },

  dismissCorruptedWarning: () => {
    clearSavedGameStorage();
    set({ saveCorruptedWarning: false });
  },

  startNewGame: () => {
    const currentSettings = get().settings;
    const fresh = createInitialGameState();
    fresh.started = true;
    fresh.settings = currentSettings;
    saveGameStateToStorage(fresh);

    set({
      ...fresh,
      hasSavedGame: true,
      saveCorruptedWarning: false,
      activeModal: { type: 'briefing' },
      focusedHotspotId: 'vest_mostrador_credencial',
      inspectionMessage: {
        title: 'Paso 1 recomendado: Mostrador de Recepción',
        body: 'Recoge primero la Credencial de Turno Nocturno sobre el mostrador iluminado a la izquierda y luego lee el Acta de Suspensión.',
      },
    });

    gameEventBus.emit('ROOM_ENTERED', { scene: 'vestibulo', isNewGame: true });
    get().pushSubtitle({
      text: '[Zumbido eléctrico de 50 Hz. Un reloj detenido intenta escapar un diente a tus espaldas.]',
      source: 'AMBIENTE — VESTÍBULO',
      direction: 'centro',
    });
  },

  continueSavedGame: () => {
    const { state, corrupted } = loadGameStateFromStorage();
    if (corrupted || !state) {
      set({ saveCorruptedWarning: true, hasSavedGame: false });
      return;
    }
    set({
      ...state,
      started: true,
      hasSavedGame: true,
      activeModal: { type: 'none' },
      focusedHotspotId: null,
      inspectionMessage: {
        title: SCENES_DATA[state.currentScene].title,
        body: 'Sesión de investigación restaurada desde la memoria local.',
      },
    });
    gameEventBus.emit('ROOM_ENTERED', { scene: state.currentScene, restored: true });
  },

  returnToMainMenu: () => {
    const persisted = extractPersistableState(get());
    if (persisted.started && !persisted.endingReached) {
      saveGameStateToStorage(persisted);
    }
    set({
      started: false,
      endingReached: null,
      activeModal: { type: 'none' },
      inspectionMessage: null,
      hasSavedGame: Boolean(loadGameStateFromStorage().state?.started),
    });
  },

  setChannel: (channel: EchoChannel) => {
    const state = get();
    if (!state.inventory.includes('sintonizador_ecos') && channel !== 'A') {
      set({
        inspectionMessage: {
          title: 'Sintonizador requerido',
          body: 'Aún no dispones del Sintonizador de Ecos SE-99 para separar frecuencias no oficiales.',
        },
      });
      return;
    }

    if (state.channel === channel) return;

    set((prev) => {
      const updated = { ...prev, channel };
      saveGameStateToStorage(extractPersistableState(updated));
      return updated;
    });

    gameEventBus.emit('CHANNEL_CHANGED', { channel, scene: state.currentScene });

    const channelLabels: Record<EchoChannel, string> = {
      A: '[Sintonizador: Canal A — Registro Oficial (440 Hz). Zumbido estable.]',
      B: '[Sintonizador: Canal B — Residuo Acústico (432 Hz). Ecos latentes emergen en la sala.]',
      C: '[Sintonizador: Canal C — Discordancia (417 Hz). Interferencia armónica entre dos registros.]',
    };

    get().pushSubtitle({
      text: channelLabels[channel],
      source: 'SINTONIZADOR SE-99',
      direction: 'centro',
      isParanormal: channel !== 'A',
    });
  },

  enterScene: (sceneId: SceneId) => {
    const state = get();
    const visited = state.visitedScenes.includes(sceneId)
      ? state.visitedScenes
      : [...state.visitedScenes, sceneId];

    set((prev) => {
      const next: GameStore = {
        ...prev,
        currentScene: sceneId,
        visitedScenes: visited,
        focusedHotspotId: null,
        inspectionMessage: {
          title: SCENES_DATA[sceneId].title,
          body: SCENES_DATA[sceneId].ambientDescription[prev.channel],
        },
      };
      saveGameStateToStorage(extractPersistableState(next));
      return next;
    });

    gameEventBus.emit('ROOM_ENTERED', { scene: sceneId });

    const sceneSubtitles: Record<SceneId, string> = {
      vestibulo: '[El reloj patrón sobre el mostrador se detiene de golpe cuando lo miras.]',
      vigilancia: '[Zumbido de tubos de rayos catódicos y giro lento de carretes magnéticos.]',
      archivo: '[Aire estancado entre estanterías. En el rincón izquierdo el sonido parece absorberse.]',
      laboratorio: '[Resonancia metálica de diapasones patrón en suspensión.]',
      pasillo: '[Tus propios pasos se repiten con cuatro segundos de retraso a lo largo del corredor.]',
      camara: '[El gran Péndulo Maestro vibra conteniendo el segundo 59 del minuto excluido.]',
    };

    get().pushSubtitle({
      text: sceneSubtitles[sceneId],
      source: SCENES_DATA[sceneId].title.toUpperCase(),
      direction: 'ambiente',
    });

    return { ok: true };
  },

  interactWithHotspot: (hotspot: HotspotDefinition) => {
    const state = get();
    const inspected = state.inspectedObjects.includes(hotspot.id)
      ? state.inspectedObjects
      : [...state.inspectedObjects, hotspot.id];

    set({ inspectedObjects: inspected });
    gameEventBus.emit('OBJECT_INSPECTED', { hotspotId: hotspot.id, scene: state.currentScene });

    // Primer evento sobrenatural del Vestíbulo: el reloj detenido que funciona al apartar la vista
    if (hotspot.id === 'vest_reloj_patron' && !state.flags.clock_anomaly_witnessed) {
      get().setStoryFlag('clock_anomaly_witnessed', true);
      gameEventBus.emit('ENTITY_TRIGGERED', {
        entity: 'el_contador',
        event: 'clock_tick_stopped',
      });
      get().pushSubtitle({
        text: '[Tres tictacs metálicos resuenan dentro del reloj y se cortan en seco al enfocarlo.]',
        source: 'RELOJ PATRÓN (02:15:59)',
        direction: 'centro',
        isParanormal: true,
      });
    }

    if (hotspot.type === 'pickup' && hotspot.itemId) {
      // Verificar si la llave de archivo o la bobina requieren su puzle previo
      if (
        hotspot.itemId === 'llave_archivo' &&
        !state.puzzlesSolved.includes('registros_incompatibles')
      ) {
        set({
          inspectionMessage: {
            title: 'Archivador Bloqueado',
            body: 'El cajón de seguridad permanece cerrado hasta que verifiques la discrepancia de registros en el Banco de Monitores (Puzle 2).',
          },
        });
        return;
      }

      if (
        hotspot.itemId === 'bobina_maestra' &&
        !state.puzzlesSolved.includes('secuencia_calibracion')
      ) {
        set({
          inspectionMessage: {
            title: 'Cámara de Vacío Sellada',
            body: 'Debes sincronizar primero la secuencia armónica 3-1-4-2-5 en la Consola de Frecuencias (Puzle 3) para liberar la Bobina Maestra 02:16.',
          },
        });
        return;
      }

      get().collectItem(hotspot.itemId);
      return;
    }

    if (hotspot.type === 'document' && hotspot.documentId) {
      get().unlockDocument(hotspot.documentId);
      set({
        activeModal: {
          type: 'dossier',
          initialDossierTab: 'documents',
          selectedDocumentId: hotspot.documentId,
        },
      });
      return;
    }

    if (hotspot.type === 'transcript' && hotspot.transcriptId) {
      get().unlockTranscript(hotspot.transcriptId);
      set({
        activeModal: {
          type: 'dossier',
          initialDossierTab: 'transcripts',
          selectedTranscriptId: hotspot.transcriptId,
        },
      });
      return;
    }

    if (hotspot.type === 'puzzle' && hotspot.puzzleId) {
      set({
        activeModal: {
          type: 'puzzle',
          puzzleId: hotspot.puzzleId,
        },
      });
      return;
    }

    if (hotspot.type === 'door' && hotspot.targetScene) {
      if (
        hotspot.requiredPuzzleForDoor &&
        !state.puzzlesSolved.includes(hotspot.requiredPuzzleForDoor)
      ) {
        set({
          inspectionMessage: {
            title: 'Acceso Bloqueado',
            body:
              hotspot.descriptions[state.channel] ??
              hotspot.descriptions.A ??
              'Debes resolver el mecanismo de esta sala antes de continuar.',
          },
        });
        return;
      }
      if (
        hotspot.requiredItemForDoor &&
        !state.inventory.includes(hotspot.requiredItemForDoor)
      ) {
        const itemName = INVENTORY_CATALOG[hotspot.requiredItemForDoor].name;
        set({
          inspectionMessage: {
            title: 'Llave Requerida',
            body: `Necesitas portar «${itemName}» en tu inventario para franquear esta esclusa.`,
          },
        });
        return;
      }
      get().enterScene(hotspot.targetScene);
      return;
    }

    if (hotspot.type === 'entity') {
      gameEventBus.emit('ENTITY_TRIGGERED', {
        hotspotId: hotspot.id,
        scene: state.currentScene,
        channel: state.channel,
      });
      if (state.currentScene === 'archivo') {
        get().setStoryFlag('witness_seen_archivo', true);
        get().pushSubtitle({
          text: '[El Testigo absorbe el ruido ambiental a su alrededor, señalando en silencio el gavetero del fondo.]',
          source: 'MANIFESTACIÓN — TESTIGO',
          direction: 'derecha',
          isParanormal: true,
        });
      } else if (state.currentScene === 'pasillo') {
        get().setStoryFlag('corridor_echo_seen', true);
        get().pushSubtitle({
          text: '[Tu propio Residual gira hacia la Esclusa de Mantenimiento lateral en el Canal B.]',
          source: 'MANIFESTACIÓN — RESIDUAL',
          direction: 'derecha',
          isParanormal: true,
        });
      } else if (state.currentScene === 'camara') {
        get().pushSubtitle({
          text: '[Doce relojes laten al unísono: 02:16:59. El Contador espera la resolución del intervalo.]',
          source: 'EL CONTADOR',
          direction: 'centro',
          isParanormal: true,
        });
      }
    }

    const desc =
      hotspot.descriptions[state.channel] ??
      hotspot.descriptions.B ??
      hotspot.descriptions.A;

    set({
      inspectionMessage: {
        title: hotspot.label,
        body: desc,
      },
    });
  },

  collectItem: (itemId: ItemId) => {
    const state = get();
    if (state.inventory.includes(itemId)) {
      set({
        inspectionMessage: {
          title: INVENTORY_CATALOG[itemId].name,
          body: 'Ya has recogido este objeto y se encuentra en tu inventario.',
        },
      });
      return;
    }

    if (state.inventory.length >= 4) {
      set({
        inspectionMessage: {
          title: 'Inventario Completo',
          body: 'Ya llevas el máximo de cuatro objetos técnicos.',
        },
      });
      return;
    }

    const nextInventory = [...state.inventory, itemId];
    const nextFlags = { ...state.flags };
    if (itemId === 'sintonizador_ecos') {
      nextFlags.tuner_obtained = true;
    }

    set((prev) => {
      const updated = {
        ...prev,
        inventory: nextInventory,
        flags: nextFlags,
        inspectionMessage: {
          title: `Objeto Obtenido: ${INVENTORY_CATALOG[itemId].name}`,
          body: INVENTORY_CATALOG[itemId].description,
        },
      };
      saveGameStateToStorage(extractPersistableState(updated));
      return updated;
    });

    gameEventBus.emit('ITEM_COLLECTED', { itemId });
  },

  unlockDocument: (docId: DocumentId) => {
    const state = get();
    const isNew = !state.documentsFound.includes(docId);
    const nextDocs = isNew ? [...state.documentsFound, docId] : state.documentsFound;

    set((prev) => {
      const updated = {
        ...prev,
        documentsFound: nextDocs,
      };
      saveGameStateToStorage(extractPersistableState(updated));
      return updated;
    });

    if (isNew) {
      gameEventBus.emit('DOCUMENT_FOUND', {
        docId,
        title: NARRATIVE_DOCUMENTS[docId].title,
      });
    }
  },

  unlockTranscript: (transcriptId: TranscriptId) => {
    const state = get();
    const isNew = !state.transcriptsFound.includes(transcriptId);
    const nextTranscripts = isNew
      ? [...state.transcriptsFound, transcriptId]
      : state.transcriptsFound;

    set((prev) => {
      const updated = {
        ...prev,
        transcriptsFound: nextTranscripts,
      };
      saveGameStateToStorage(extractPersistableState(updated));
      return updated;
    });

    if (isNew) {
      gameEventBus.emit('DOCUMENT_FOUND', {
        transcriptId,
        title: AUDIO_TRANSCRIPTS[transcriptId].title,
      });
    }

    get().pushSubtitle({
      text: AUDIO_TRANSCRIPTS[transcriptId].segments[0].text,
      source: AUDIO_TRANSCRIPTS[transcriptId].code,
      direction: 'centro',
      isParanormal: true,
    });
  },

  completePuzzle: (puzzleId: PuzzleId) => {
    const state = get();
    const nextSolved = state.puzzlesSolved.includes(puzzleId)
      ? state.puzzlesSolved
      : [...state.puzzlesSolved, puzzleId];

    const nextFlags = { ...state.flags };
    if (puzzleId === 'circuito_emergencia') nextFlags.power_restored = true;
    if (puzzleId === 'reconstruir_minuto') nextFlags.console_unlocked = true;

    set((prev) => {
      const updated = {
        ...prev,
        puzzlesSolved: nextSolved,
        flags: nextFlags,
      };
      saveGameStateToStorage(extractPersistableState(updated));
      return updated;
    });

    gameEventBus.emit('PUZZLE_SOLVED', { puzzleId });
  },

  setStoryFlag: (flag: StoryFlag, value = true) => {
    set((prev) => {
      const updated = {
        ...prev,
        flags: { ...prev.flags, [flag]: value },
      };
      saveGameStateToStorage(extractPersistableState(updated));
      return updated;
    });
    gameEventBus.emit('STORY_FLAG_UPDATED', { flag, value });
  },

  requestNextHint: (puzzleId: PuzzleId) => {
    const current = get().hintLevels[puzzleId] ?? 0;
    const next = (Math.min(3, current + 1) as 0 | 1 | 2 | 3);
    set((prev) => {
      const updated = {
        ...prev,
        hintLevels: {
          ...prev.hintLevels,
          [puzzleId]: next,
        },
      };
      saveGameStateToStorage(extractPersistableState(updated));
      return updated;
    });
    return next;
  },

  selectEnding: (ending: EndingId) => {
    set((prev) => {
      const updated = {
        ...prev,
        endingReached: ending,
        activeModal: { type: 'none' as const },
      };
      saveGameStateToStorage(extractPersistableState(updated));
      return updated;
    });
    gameEventBus.emit('ENDING_SELECTED', { ending });
  },

  updateSettings: (partial: Partial<UserSettings>) => {
    set((prev) => {
      const updated = {
        ...prev,
        settings: { ...prev.settings, ...partial },
      };
      saveGameStateToStorage(extractPersistableState(updated));
      return updated;
    });
  },

  setActiveModal: (modal: ActiveModalState) => {
    set({ activeModal: modal });
  },

  setFocusedHotspotId: (id: string | null) => {
    set({ focusedHotspotId: id });
  },

  setInspectionMessage: (msg: { title: string; body: string } | null) => {
    set({ inspectionMessage: msg });
  },

  pushSubtitle: (cue: Omit<SubtitleCue, 'id'>) => {
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set({ subtitleCue: { ...cue, id } });
  },
}));

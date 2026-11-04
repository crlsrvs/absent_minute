export type SceneId =
  | 'vestibulo'
  | 'vigilancia'
  | 'archivo'
  | 'laboratorio'
  | 'pasillo'
  | 'camara';

export type EchoChannel = 'A' | 'B' | 'C';

export type PuzzleId =
  | 'circuito_emergencia'
  | 'registros_incompatibles'
  | 'secuencia_calibracion'
  | 'pasillo_discontinuo'
  | 'reconstruir_minuto';

export type ItemId =
  | 'credencial_acceso'
  | 'sintonizador_ecos'
  | 'llave_archivo'
  | 'bobina_maestra';

export type DocumentId =
  | 'doc_01_registro_turno'
  | 'doc_02_informe_calibracion'
  | 'doc_03_nota_trabajador'
  | 'doc_04_acta_suspension'
  | 'doc_05_reporte_residual'
  | 'doc_06_contradiccion_espacial'
  | 'doc_07_memorando_eliminacion'
  | 'doc_08_transcripcion_incidente';

export type TranscriptId =
  | 'rec_01_pasos_anticipados'
  | 'rec_02_impulsos_calibracion'
  | 'rec_03_corte_sincronia';

export type EntityType = 'residual' | 'testigo' | 'contador';

export type EndingId = 'silencio_preservado' | 'la_transmision';

export type StoryFlag =
  | 'clock_anomaly_witnessed'
  | 'power_restored'
  | 'tuner_obtained'
  | 'witness_seen_archivo'
  | 'residual_seen_lab'
  | 'corridor_echo_seen'
  | 'console_unlocked';

export interface InventoryItem {
  id: ItemId;
  name: string;
  description: string;
  foundIn: SceneId;
}

export interface NarrativeDocument {
  id: DocumentId;
  code: string;
  title: string;
  date: string;
  author: string;
  location: SceneId;
  channelRequired?: EchoChannel;
  content: string[];
  mysteryConnection: string;
}

export interface AudioTranscript {
  id: TranscriptId;
  code: string;
  title: string;
  timestamp: string;
  duration: string;
  location: SceneId;
  channelRequired: EchoChannel;
  segments: { speaker: string; text: string; soundCue?: string }[];
  mysteryConnection: string;
}

export interface HotspotDefinition {
  id: string;
  label: string;
  actionLabel: string;
  position: [number, number, number];
  size?: [number, number, number];
  visibleInChannels?: EchoChannel[];
  requiredFlag?: StoryFlag;
  hideWhenPuzzleSolved?: PuzzleId;
  type: 'inspect' | 'pickup' | 'document' | 'transcript' | 'puzzle' | 'door' | 'entity';
  targetScene?: SceneId;
  requiredPuzzleForDoor?: PuzzleId;
  requiredItemForDoor?: ItemId;
  documentId?: DocumentId;
  transcriptId?: TranscriptId;
  itemId?: ItemId;
  puzzleId?: PuzzleId;
  descriptions: {
    A: string;
    B?: string;
    C?: string;
  };
}

export interface SceneDefinition {
  id: SceneId;
  act: 1 | 2 | 3;
  actTitle: string;
  title: string;
  subtitle: string;
  objective: string;
  ambientDescription: {
    A: string;
    B: string;
    C: string;
  };
  hotspots: HotspotDefinition[];
}

export interface UserSettings {
  volume: number;
  muted: boolean;
  subtitles: boolean;
  reducedMotion: boolean;
}

export type GameEventType =
  | 'OBJECT_INSPECTED'
  | 'ITEM_COLLECTED'
  | 'DOCUMENT_FOUND'
  | 'CHANNEL_CHANGED'
  | 'PUZZLE_SOLVED'
  | 'ROOM_ENTERED'
  | 'ENTITY_TRIGGERED'
  | 'STORY_FLAG_UPDATED'
  | 'ENDING_SELECTED';

export interface GameEvent {
  type: GameEventType;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface SubtitleCue {
  id: string;
  text: string;
  source: string;
  direction?: 'izquierda' | 'derecha' | 'centro' | 'ambiente';
  isParanormal?: boolean;
}

export interface GameState {
  version: number;
  started: boolean;
  currentScene: SceneId;
  visitedScenes: SceneId[];
  channel: EchoChannel;
  inventory: ItemId[];
  documentsFound: DocumentId[];
  transcriptsFound: TranscriptId[];
  puzzlesSolved: PuzzleId[];
  flags: Partial<Record<StoryFlag, boolean>>;
  hintLevels: Record<PuzzleId, 0 | 1 | 2 | 3>;
  inspectedObjects: string[];
  endingReached: EndingId | null;
  settings: UserSettings;
}

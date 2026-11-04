import { beforeEach, describe, expect, it } from 'vitest';
import {
  calculateCircuitVoltage,
  validateCalibrationSequence,
  validateDiscontinuousCorridor,
  validateEmergencyCircuit,
  validateIncompatibleRecords,
  validateReconstructMinute,
} from '../core/puzzles';
import {
  SAVE_STORAGE_KEY,
  clearSavedGameStorage,
  createInitialGameState,
  isValidGameState,
  loadGameStateFromStorage,
  saveGameStateToStorage,
} from '../core/persistence';
import { useGameStore } from '../core/store';
import { gameEventBus } from '../core/events';
import {
  AUDIO_TRANSCRIPTS,
  INVENTORY_CATALOG,
  NARRATIVE_DOCUMENTS,
} from '../narrative/documents';
import { SCENES_DATA } from '../narrative/scenesData';
import { PUZZLE_HINTS } from '../narrative/hints';
import {
  getBuildingMapNodes,
  getSceneGuideSteps,
} from '../narrative/progressionGuide';
import { PARANORMAL_ENTITIES, evaluateEntityFSM } from '../paranormal/entities';

describe('absent_minute — Validación de los 5 Acertijos', () => {
  it('Puzle 1 (Circuito de emergencia): rechaza sin credencial, por sobrecarga o sin B3, y aprueba con 24V exactos (B1+B3+B4)', () => {
    const solution = { b1_12v: true, b2_18v: false, b3_8v: true, b4_4v: true };
    expect(calculateCircuitVoltage(solution)).toBe(24);

    // Sin credencial
    const noCred = validateEmergencyCircuit(solution, false);
    expect(noCred.solved).toBe(false);

    // Sobrecarga (12 + 18 = 30V)
    const overload = validateEmergencyCircuit(
      { b1_12v: true, b2_18v: true, b3_8v: false, b4_4v: false },
      true
    );
    expect(overload.solved).toBe(false);

    // Solución correcta
    const valid = validateEmergencyCircuit(solution, true);
    expect(valid.solved).toBe(true);
  });

  it('Puzle 2 (Dos registros incompatibles): exige CAM_04, Canal B y marca 02:16', () => {
    expect(
      validateIncompatibleRecords({
        cameraId: 'CAM_01',
        channel: 'B',
        timestamp: '02:16',
      }).solved
    ).toBe(false);

    expect(
      validateIncompatibleRecords({
        cameraId: 'CAM_04',
        channel: 'A',
        timestamp: '02:16',
      }).solved
    ).toBe(false);

    expect(
      validateIncompatibleRecords({
        cameraId: 'CAM_04',
        channel: 'B',
        timestamp: '02:16',
      }).solved
    ).toBe(true);
  });

  it('Puzle 3 (Secuencia de calibración): verifica el patrón armónico determinista [3, 1, 4, 2, 5]', () => {
    expect(validateCalibrationSequence([3, 1, 4]).solved).toBe(false);
    expect(validateCalibrationSequence([1, 2, 3, 4, 5]).solved).toBe(false);
    expect(validateCalibrationSequence([3, 1, 4, 2, 5]).solved).toBe(true);
  });

  it('Puzle 4 (Pasillo discontinuo): verifica la ruta [A-NORTE, B-ESCLUSA, C-UMBRAL]', () => {
    expect(
      validateDiscontinuousCorridor([
        { channel: 'A', door: 'NORTE' },
        { channel: 'A', door: 'NORTE' },
        { channel: 'A', door: 'NORTE' },
      ]).solved
    ).toBe(false);

    expect(
      validateDiscontinuousCorridor([
        { channel: 'A', door: 'NORTE' },
        { channel: 'B', door: 'ESCLUSA' },
        { channel: 'C', door: 'UMBRAL' },
      ]).solved
    ).toBe(true);
  });

  it('Puzle 5 (Reconstruir el minuto): requiere Bobina Maestra y orden cronológico (:12 -> :33 -> :48)', () => {
    const correctOrder = [
      'RESONANCIA_02_16_12',
      'ESCLUSA_02_16_33',
      'EXCLUSION_02_16_48',
    ] as const;

    expect(validateReconstructMinute(correctOrder, false).solved).toBe(false);
    expect(
      validateReconstructMinute(
        ['ESCLUSA_02_16_33', 'RESONANCIA_02_16_12', 'EXCLUSION_02_16_48'],
        true
      ).solved
    ).toBe(false);
    expect(validateReconstructMinute(correctOrder, true).solved).toBe(true);
  });
});

describe('absent_minute — Integridad Narrativa, Entidades y Persistencia', () => {
  beforeEach(() => {
    clearSavedGameStorage();
    gameEventBus.clearHistory();
  });

  it('contiene exactamente 6 áreas, 8 documentos originales, 3 transcripciones, 4 objetos de inventario y 5 sets de pistas de 3 niveles', () => {
    expect(Object.keys(SCENES_DATA)).toHaveLength(6);
    expect(Object.keys(NARRATIVE_DOCUMENTS)).toHaveLength(8);
    expect(Object.keys(AUDIO_TRANSCRIPTS)).toHaveLength(3);
    expect(Object.keys(INVENTORY_CATALOG)).toHaveLength(4);
    expect(Object.keys(PUZZLE_HINTS)).toHaveLength(5);

    Object.values(PUZZLE_HINTS).forEach((hintSet) => {
      expect(hintSet.levels).toHaveLength(3);
    });
  });

  it('evalúa correctamente la máquina de estados finitos (FSM) de las entidades paranormales', () => {
    expect(evaluateEntityFSM('testigo_archivo', 'archivo', 'A', [])).toBe('DORMANT');
    expect(evaluateEntityFSM('testigo_archivo', 'archivo', 'B', [])).toBe('ACTIVE_LOOP');
    expect(evaluateEntityFSM('residual_laboratorio', 'laboratorio', 'B', [])).toBe(
      'ACTIVE_LOOP'
    );
    expect(
      evaluateEntityFSM('residual_pasillo', 'pasillo', 'B', ['pasillo_discontinuo'])
    ).toBe('STABILIZED');
    expect(Object.keys(PARANORMAL_ENTITIES)).toHaveLength(4);
  });

  it('guarda, recupera y detecta estados corruptos en localStorage sin bloquear la aplicación', () => {
    const initial = createInitialGameState();
    initial.started = true;
    initial.currentScene = 'archivo';
    expect(isValidGameState(initial)).toBe(true);

    saveGameStateToStorage(initial);
    const loaded = loadGameStateFromStorage();
    expect(loaded.corrupted).toBe(false);
    expect(loaded.state?.currentScene).toBe('archivo');

    // Simular corrupción de JSON
    window.localStorage.setItem(SAVE_STORAGE_KEY, '{corrupted_json');
    const corruptedLoad = loadGameStateFromStorage();
    expect(corruptedLoad.corrupted).toBe(true);
    expect(corruptedLoad.state).toBeNull();
  });

  it('permite completar la historia de principio a fin (6 escenas, 5 puzles y ambos finales) mediante el store', () => {
    const store = useGameStore.getState();
    store.startNewGame();
    expect(useGameStore.getState().currentScene).toBe('vestibulo');

    // Acto I: Vestíbulo -> Recoger credencial y resolver Puzle 1
    store.collectItem('credencial_acceso');
    store.completePuzzle('circuito_emergencia');
    store.enterScene('vigilancia');
    expect(useGameStore.getState().currentScene).toBe('vigilancia');

    // Sala de Vigilancia -> Recoger Sintonizador, cambiar a Canal B, resolver Puzle 2 y recoger llave
    store.collectItem('sintonizador_ecos');
    store.setChannel('B');
    expect(useGameStore.getState().channel).toBe('B');
    store.completePuzzle('registros_incompatibles');
    store.collectItem('llave_archivo');

    // Acto II: Archivo -> Desbloquear Doc 07 y avanzar a Laboratorio
    store.enterScene('archivo');
    store.unlockDocument('doc_07_memorando_eliminacion');
    expect(useGameStore.getState().documentsFound).toContain(
      'doc_07_memorando_eliminacion'
    );

    // Laboratorio -> Resolver Puzle 3 y recoger Bobina Maestra
    store.enterScene('laboratorio');
    store.completePuzzle('secuencia_calibracion');
    store.collectItem('bobina_maestra');
    expect(useGameStore.getState().inventory).toHaveLength(4);

    // Acto III: Pasillo Discontinuo -> Resolver Puzle 4 y entrar a Cámara de Sincronización
    store.enterScene('pasillo');
    store.completePuzzle('pasillo_discontinuo');
    store.enterScene('camara');
    expect(useGameStore.getState().currentScene).toBe('camara');

    // Cámara de Sincronización -> Resolver Puzle 5 y alcanzar Final A y Final B
    store.completePuzzle('reconstruir_minuto');
    store.selectEnding('silencio_preservado');
    expect(useGameStore.getState().endingReached).toBe('silencio_preservado');

    store.selectEnding('la_transmision');
    expect(useGameStore.getState().endingReached).toBe('la_transmision');

    const historyTypes = gameEventBus.getHistory().map((e) => e.type);
    expect(historyTypes).toContain('ROOM_ENTERED');
    expect(historyTypes).toContain('ITEM_COLLECTED');
    expect(historyTypes).toContain('CHANNEL_CHANGED');
    expect(historyTypes).toContain('PUZZLE_SOLVED');
    expect(historyTypes).toContain('ENDING_SELECTED');
  });

  it('desbloquea pistas gradualmente (niveles 1 -> 2 -> 3) sin exceder el nivel máximo', () => {
    const store = useGameStore.getState();
    store.startNewGame();

    expect(useGameStore.getState().hintLevels.circuito_emergencia).toBe(0);
    expect(store.requestNextHint('circuito_emergencia')).toBe(1);
    expect(store.requestNextHint('circuito_emergencia')).toBe(2);
    expect(store.requestNextHint('circuito_emergencia')).toBe(3);
    expect(store.requestNextHint('circuito_emergencia')).toBe(3);
  });

  it('actualiza dinámicamente la Guía Paso a Paso y el Mapa de las 6 salas conforme avanza el jugador', () => {
    const store = useGameStore.getState();
    store.startNewGame();

    // Al iniciar una partida nueva se muestra el briefing de misión
    expect(useGameStore.getState().activeModal.type).toBe('briefing');

    const initialSteps = getSceneGuideSteps(useGameStore.getState());
    expect(initialSteps).toHaveLength(4);
    expect(initialSteps[0].completed).toBe(false);

    // Recoger la credencial marca el Paso 1 del Vestíbulo como completado
    store.collectItem('credencial_acceso');
    const afterCredSteps = getSceneGuideSteps(useGameStore.getState());
    expect(afterCredSteps[0].completed).toBe(true);

    // Resolver el circuito desbloquea la Sala 2 (Vigilancia) en el minimapa
    store.completePuzzle('circuito_emergencia');
    const mapNodes = getBuildingMapNodes(useGameStore.getState());
    expect(mapNodes).toHaveLength(6);
    expect(mapNodes[1].id).toBe('vigilancia');
    expect(mapNodes[1].unlocked).toBe(true);
  });
});

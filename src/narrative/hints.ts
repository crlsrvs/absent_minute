import { PuzzleId, SceneId } from '../core/types';

export interface PuzzleHintSet {
  puzzleId: PuzzleId;
  title: string;
  scene: SceneId;
  levels: [string, string, string];
}

export const PUZZLE_HINTS: Record<PuzzleId, PuzzleHintSet> = {
  circuito_emergencia: {
    puzzleId: 'circuito_emergencia',
    title: 'Puzle 1 — Circuito de emergencia (Vestíbulo)',
    scene: 'vestibulo',
    levels: [
      'Pista 1 (Conceptual): Antes de manipular los disyuntores del cuadro eléctrico, necesitas recoger la Credencial de Turno Nocturno sobre el mostrador y revisar el Acta de Suspensión en el tablón.',
      'Pista 2 (Específica): El sistema requiere exactamente 24V sin superar ese límite y manteniendo activa la Línea de Vigilancia (B3: 8V). Si conectas la Turbina Principal (18V) provocarás sobrecarga.',
      'Pista 3 (Orientación directa): Con la credencial en tu inventario, activa los interruptores B1 (12V), B3 (8V) y B4 (4V), dejando B2 (18V) apagado para sumar exactamente 24V.',
    ],
  },
  registros_incompatibles: {
    puzzleId: 'registros_incompatibles',
    title: 'Puzle 2 — Dos registros incompatibles (Sala de vigilancia)',
    scene: 'vigilancia',
    levels: [
      'Pista 1 (Conceptual): Recoge primero el Sintonizador de Ecos SE-99 sobre la mesa de control y lee el Registro de Turno. Compara lo que afirma el documento con lo que ves al cambiar de canal.',
      'Pista 2 (Específica): El Registro de Turno asegura que el sector de la Cámara 04 permaneció vacío y que el reloj saltó de 02:15 a 02:17. Sin embargo, al sintonizar el Canal B (Residuo) aparece una grabación oculta.',
      'Pista 3 (Orientación directa): En la consola de verificación de vigilancia, selecciona Cámara: CAM-04, Canal: B (Residuo) y Marca Horaria: 02:16.',
    ],
  },
  secuencia_calibracion: {
    puzzleId: 'secuencia_calibracion',
    title: 'Puzle 3 — Secuencia de calibración (Laboratorio de calibración)',
    scene: 'laboratorio',
    levels: [
      'Pista 1 (Conceptual): Los diapasones maestros responden a un patrón de cinco niveles armónicos. Puedes descubrirlo leyendo el Informe de Calibración (Doc 02), escuchando la Grabación 02 o mirando las barras del oscilógrafo.',
      'Pista 2 (Específica): El patrón alterna niveles medios, graves y agudos sin repetir ningún número del 1 al 5. Empieza en el nivel 3 y luego baja al 1.',
      'Pista 3 (Orientación directa): Introduce en la consola de calibración la secuencia exacta de cinco impulsos: 3 — 1 — 4 — 2 — 5.',
    ],
  },
  pasillo_discontinuo: {
    puzzleId: 'pasillo_discontinuo',
    title: 'Puzle 4 — El pasillo discontinuo (Pasillo norte)',
    scene: 'pasillo',
    levels: [
      'Pista 1 (Conceptual): Este corredor cambia su geometría según el canal del Sintonizador. Consulta el Registro de Contradicción Espacial (Doc 06) y observa el rastro del Residual en el Canal B.',
      'Pista 2 (Específica): El primer tramo sigue el plano oficial (Canal A). El segundo tramo está tapiado oficialmente, por lo que debes seguir al Residual en Canal B. El último tramo exige Canal C donde convergen las marcas de El Contador.',
      'Pista 3 (Orientación directa): Configura los tres tramos así: Tramo 1 = Canal A + Puerta Norte; Tramo 2 = Canal B + Esclusa de Mantenimiento; Tramo 3 = Canal C + Umbral de Sincronía.',
    ],
  },
  reconstruir_minuto: {
    puzzleId: 'reconstruir_minuto',
    title: 'Puzle 5 — Reconstruir el minuto (Cámara de sincronización)',
    scene: 'camara',
    levels: [
      'Pista 1 (Conceptual): Para desbloquear la consola central necesitas haber traído la Bobina Maestra 02:16 del Laboratorio y ordenar los tres sucesos ocurridos durante el minuto ausente.',
      'Pista 2 (Específica): Revisa el Memorando sobre la Eliminación del Minuto (Doc 07, en el Archivo bajo Canal B) y la Grabación 03 (en esta Cámara bajo Canal C) para ver qué ocurrió en los segundos :12, :33 y :48.',
      'Pista 3 (Orientación directa): Ordena la secuencia así: 1.º (02:16:12) La señal anticipada pliega el espacio; 2.º (02:16:33) Soria y Vega quedan atrapados en la esclusa; 3.º (02:16:48) Elena Vance corta el registro horario.',
    ],
  },
};

export const SCENE_PRIMARY_PUZZLE: Record<SceneId, PuzzleId> = {
  vestibulo: 'circuito_emergencia',
  vigilancia: 'registros_incompatibles',
  archivo: 'reconstruir_minuto',
  laboratorio: 'secuencia_calibracion',
  pasillo: 'pasillo_discontinuo',
  camara: 'reconstruir_minuto',
};

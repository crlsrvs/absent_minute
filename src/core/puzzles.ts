export interface PuzzleValidationResult {
  solved: boolean;
  feedback: string;
}

/**
 * Puzle 1 — Circuito de emergencia (Vestíbulo)
 * El panel eléctrico tiene 4 disyuntores:
 * - B1 (Reserva Sur): +12V
 * - B2 (Turbina Principal): +18V
 * - B3 (Línea de Vigilancia): +8V
 * - B4 (Estabilizador Auxiliar): +4V
 *
 * Para alimentar la consola del vestíbulo y la esclusa hacia Vigilancia se requieren exactamente 24V
 * y que la Línea de Vigilancia (B3) esté activa.
 * Solución determinista: B1 (12V) + B3 (8V) + B4 (4V) = 24V con B2 apagado.
 */
export interface EmergencyCircuitInput {
  b1_12v: boolean;
  b2_18v: boolean;
  b3_8v: boolean;
  b4_4v: boolean;
}

export function calculateCircuitVoltage(input: EmergencyCircuitInput): number {
  let total = 0;
  if (input.b1_12v) total += 12;
  if (input.b2_18v) total += 18;
  if (input.b3_8v) total += 8;
  if (input.b4_4v) total += 4;
  return total;
}

export function validateEmergencyCircuit(
  input: EmergencyCircuitInput,
  hasCredential: boolean
): PuzzleValidationResult {
  if (!hasCredential) {
    return {
      solved: false,
      feedback:
        'El bloqueo electromecánico exige insertar primero la Credencial de Mantenimiento Nocturno (encontrada en el mostrador).',
    };
  }

  const voltage = calculateCircuitVoltage(input);

  if (voltage > 24) {
    return {
      solved: false,
      feedback: `Sobrecarga detectada (${voltage}V / 24V máx.). El relé térmico salta cuando se conecta la Turbina Principal (18V) junto a las líneas auxiliares.`,
    };
  }

  if (voltage < 24) {
    return {
      solved: false,
      feedback: `Tensión insuficiente (${voltage}V / 24V requeridos). Ajusta los disyuntores hasta alcanzar exactamente 24V.`,
    };
  }

  if (!input.b3_8v) {
    return {
      solved: false,
      feedback:
        'Hay 24V en línea, pero el disyuntor B3 (Línea de Vigilancia) está desconectado.',
    };
  }

  return {
    solved: true,
    feedback:
      'Suministro estabilizado a 24V. La cerradura solenoide de la Sala de Vigilancia se ha desbloqueado.',
  };
}

/**
 * Puzle 2 — Dos registros incompatibles (Sala de vigilancia)
 * El jugador contrasta la Bitácora Oficial (Doc 01) con los monitores y los canales del Sintonizador.
 * Debe identificar:
 * - Cámara donde existe contradicción: 'CAM_04' (Pasillo Norte / Archivo)
 * - Canal donde aparece la figura omitida: 'B' (Residuo)
 * - Marca horaria omitida en el acta oficial: '02:16'
 */
export interface IncompatibleRecordsInput {
  cameraId: 'CAM_01' | 'CAM_02' | 'CAM_03' | 'CAM_04';
  channel: 'A' | 'B' | 'C';
  timestamp: '02:14' | '02:15' | '02:16' | '02:17';
}

export function validateIncompatibleRecords(
  input: IncompatibleRecordsInput
): PuzzleValidationResult {
  if (input.cameraId !== 'CAM_04') {
    return {
      solved: false,
      feedback:
        'Esa cámara coincide con el parte ordinario. Revisa qué sector figuraba como "vacío y sellado" en el Registro de Turno pero muestra movimiento en el monitor.',
    };
  }

  if (input.channel !== 'B') {
    return {
      solved: false,
      feedback:
        'En ese canal el fotograma aparece en blanco. Recuerda qué canal del Sintonizador revela las impresiones acústicas no oficiales.',
    };
  }

  if (input.timestamp !== '02:16') {
    return {
      solved: false,
      feedback:
        'La cámara e impresión son correctas, pero la marca temporal no corresponde al intervalo excluido entre las 02:15 y las 02:17.',
    };
  }

  return {
    solved: true,
    feedback:
      'Discrepancia verificada: CAM-04 registró a Mateo Soria en el Canal B a las 02:16. El cajón de seguridad del archivador se ha abierto.',
  };
}

/**
 * Puzle 3 — Secuencia de calibración (Laboratorio de calibración)
 * La grabación de referencia y el Informe de Calibración (Doc 02) establecen una secuencia de 5 impulsos
 * medidos en armónicos de diapasón: [3, 1, 4, 2, 5].
 * El oscilógrafo muestra visualmente las barras de amplitud (3 - 1 - 4 - 2 - 5) para accesibilidad total.
 */
export const TARGET_CALIBRATION_SEQUENCE: ReadonlyArray<number> = [3, 1, 4, 2, 5];

export function validateCalibrationSequence(
  sequence: ReadonlyArray<number>
): PuzzleValidationResult {
  if (sequence.length !== TARGET_CALIBRATION_SEQUENCE.length) {
    return {
      solved: false,
      feedback: `La secuencia requiere exactamente ${TARGET_CALIBRATION_SEQUENCE.length} pulsos armónicos (actual: ${sequence.length}).`,
    };
  }

  for (let i = 0; i < TARGET_CALIBRATION_SEQUENCE.length; i++) {
    if (sequence[i] !== TARGET_CALIBRATION_SEQUENCE[i]) {
      return {
        solved: false,
        feedback: `Desfase acústico en el pulso #${i + 1}: el oscilógrafo esperaba nivel ${TARGET_CALIBRATION_SEQUENCE[i]} y recibió ${sequence[i]}. Observa la gráfica del oscilógrafo o consulta la Transcripción 02.`,
      };
    }
  }

  return {
    solved: true,
    feedback:
      'Frecuencia sincronizada con el patrón 3-1-4-2-5. El compartimento de la Bobina Maestra 02:16 se ha liberado y el acceso al Pasillo Discontinuo está activo.',
  };
}

/**
 * Puzle 4 — El pasillo discontinuo (Pasillo discontinuo)
 * El corredor se pliega sobre sí mismo. Para cruzar los 3 tramos hacia la Cámara de Sincronización sin regresar al inicio:
 * - Tramo 1: Según el Plano del Edificio, el primer arco sigue el trazado oficial -> Canal 'A' (Puerta Norte).
 * - Tramo 2: El muro bloquea el paso oficial, pero el Residual atraviesa la esclusa lateral -> Canal 'B' (Esclusa de Mantenimiento).
 * - Tramo 3: Ambos registros colisionan frente a la Cámara Central marcada con "02:16" -> Canal 'C' (Umbral de Sincronía).
 */
export interface CorridorStep {
  channel: 'A' | 'B' | 'C';
  door: 'NORTE' | 'ESCLUSA' | 'UMBRAL';
}

export const TARGET_CORRIDOR_ROUTE: ReadonlyArray<CorridorStep> = [
  { channel: 'A', door: 'NORTE' },
  { channel: 'B', door: 'ESCLUSA' },
  { channel: 'C', door: 'UMBRAL' },
];

export function validateDiscontinuousCorridor(
  steps: ReadonlyArray<CorridorStep>
): PuzzleValidationResult {
  if (steps.length !== 3) {
    return {
      solved: false,
      feedback: 'Debes definir los tres tramos de cruce del corredor antes de atravesarlo.',
    };
  }

  if (steps[0].channel !== 'A' || steps[0].door !== 'NORTE') {
    return {
      solved: false,
      feedback:
        'En el Tramo 1 la geometría del pasillo aún respeta el plano original de la estación: debes cruzar la Puerta Norte en Canal A (Registro).',
    };
  }

  if (steps[1].channel !== 'B' || steps[1].door !== 'ESCLUSA') {
    return {
      solved: false,
      feedback:
        'En el Tramo 2 el tabique oficial cierra el paso. Debes seguir la huella del Residual por la Esclusa de Mantenimiento en Canal B (Residuo).',
    };
  }

  if (steps[2].channel !== 'C' || steps[2].door !== 'UMBRAL') {
    return {
      solved: false,
      feedback:
        'En el Tramo 3 las dos versiones del edificio se superponen frente a la marca 02:16: necesitas el Canal C (Discordancia) para cruzar el Umbral de Sincronía.',
    };
  }

  return {
    solved: true,
    feedback:
      'Topología estabilizada. Has atravesado la fractura espacial y accedido a la Cámara de Sincronización.',
  };
}

/**
 * Puzle 5 — Reconstruir el minuto (Cámara de sincronización)
 * El jugador debe ordenar cronológicamente los 3 acontecimientos reales ocurridos durante el minuto 02:16
 * antes de desbloquear la Consola Maestro de Decisión Final:
 * 1. 'RESONANCIA_02_16_12': La señal acústica se adelanta tres segundos a los relés y pliega el corredor norte.
 * 2. 'ESCLUSA_02_16_33': Mateo Soria y Clara Vega quedan atrapados en el bucle de la esclusa al intentar aislar la bobina.
 * 3. 'EXCLUSION_02_16_48': Elena Vance acciona el disyuntor de exclusión horaria, saltando los relojes de 02:15 a 02:17.
 */
export type MinuteEventId =
  | 'RESONANCIA_02_16_12'
  | 'ESCLUSA_02_16_33'
  | 'EXCLUSION_02_16_48';

export const TARGET_MINUTE_ORDER: ReadonlyArray<MinuteEventId> = [
  'RESONANCIA_02_16_12',
  'ESCLUSA_02_16_33',
  'EXCLUSION_02_16_48',
];

export function validateReconstructMinute(
  order: ReadonlyArray<MinuteEventId>,
  hasMasterReel: boolean
): PuzzleValidationResult {
  if (!hasMasterReel) {
    return {
      solved: false,
      feedback:
        'La consola maestra requiere insertar primero la Bobina de Sincronía 02:16 obtenida en el Laboratorio de Calibración.',
    };
  }

  if (order.length !== 3) {
    return {
      solved: false,
      feedback: 'Selecciona los tres acontecimientos para reconstruir la cronología del minuto.',
    };
  }

  if (order[0] !== 'RESONANCIA_02_16_12') {
    return {
      solved: false,
      feedback:
        'El primer suceso (02:16:12) no es correcto. ¿Qué fenómeno acústico inició la anomalía antes de que intentaran evacuar?',
    };
  }

  if (order[1] !== 'ESCLUSA_02_16_33') {
    return {
      solved: false,
      feedback:
        'El segundo suceso (02:16:33) no coincide. Antes del corte definitivo, Soria y Vega quedaron atrapados en la esclusa.',
    };
  }

  if (order[2] !== 'EXCLUSION_02_16_48') {
    return {
      solved: false,
      feedback:
        'El último suceso (02:16:48) debe ser el acto deliberado que borró el minuto de los registros oficiales.',
    };
  }

  return {
    solved: true,
    feedback:
      'El minuto 02:16 ha sido reconstruido en el registro maestro. Los relojes de la cámara aguardan tu decisión final.',
  };
}

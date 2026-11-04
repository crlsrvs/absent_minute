import { useState } from 'react';
import { useGameStore } from '../core/store';
import {
  CorridorStep,
  EmergencyCircuitInput,
  IncompatibleRecordsInput,
  MinuteEventId,
  calculateCircuitVoltage,
  validateCalibrationSequence,
  validateDiscontinuousCorridor,
  validateEmergencyCircuit,
  validateIncompatibleRecords,
  validateReconstructMinute,
} from '../core/puzzles';
import { PUZZLE_HINTS } from '../narrative/hints';
import { soundEngine } from '../audio/soundEngine';

export function PuzzleModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const inventory = useGameStore((s) => s.inventory);
  const documentsFound = useGameStore((s) => s.documentsFound);
  const transcriptsFound = useGameStore((s) => s.transcriptsFound);
  const puzzlesSolved = useGameStore((s) => s.puzzlesSolved);
  const hintLevels = useGameStore((s) => s.hintLevels);
  const completePuzzle = useGameStore((s) => s.completePuzzle);
  const requestNextHint = useGameStore((s) => s.requestNextHint);
  const selectEnding = useGameStore((s) => s.selectEnding);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const puzzleId = activeModal.puzzleId ?? 'circuito_emergencia';
  const isAlreadySolved = puzzlesSolved.includes(puzzleId);
  const [showInlineHints, setShowInlineHints] = useState(false);

  const hintSet = PUZZLE_HINTS[puzzleId];
  const currentHintLevel = hintLevels[puzzleId] ?? 0;

  // Estado Puzle 1 (Circuito de emergencia)
  const [circuit, setCircuit] = useState<EmergencyCircuitInput>({
    b1_12v: false,
    b2_18v: false,
    b3_8v: false,
    b4_4v: false,
  });

  // Estado Puzle 2 (Dos registros incompatibles)
  const [recordsInput, setRecordsInput] = useState<IncompatibleRecordsInput>({
    cameraId: 'CAM_01',
    channel: 'A',
    timestamp: '02:15',
  });

  // Estado Puzle 3 (Secuencia de calibración 3-1-4-2-5)
  const [calibSeq, setCalibSeq] = useState<number[]>([]);

  // Estado Puzle 4 (Pasillo discontinuo)
  const [corridorSteps, setCorridorSteps] = useState<CorridorStep[]>([
    { channel: 'A', door: 'NORTE' },
    { channel: 'A', door: 'NORTE' },
    { channel: 'A', door: 'NORTE' },
  ]);

  // Estado Puzle 5 (Reconstruir el minuto)
  const [minuteOrder, setMinuteOrder] = useState<MinuteEventId[]>([
    'ESCLUSA_02_16_33',
    'RESONANCIA_02_16_12',
    'EXCLUSION_02_16_48',
  ]);

  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    isAlreadySolved
      ? { ok: true, text: 'Este mecanismo ya se encuentra estabilizado y resuelto.' }
      : null
  );

  // Handlers de verificación
  const handleVerifyCircuit = () => {
    const res = validateEmergencyCircuit(
      circuit,
      inventory.includes('credencial_acceso')
    );
    setFeedback({ ok: res.solved, text: res.feedback });
    if (res.solved) {
      completePuzzle('circuito_emergencia');
    }
  };

  const handleVerifyRecords = () => {
    const res = validateIncompatibleRecords(recordsInput);
    setFeedback({ ok: res.solved, text: res.feedback });
    if (res.solved) {
      completePuzzle('registros_incompatibles');
    }
  };

  const handleAddHarmonic = (level: number) => {
    soundEngine.playCalibrationHarmonic(level);
    if (calibSeq.length >= 5) return;
    setCalibSeq([...calibSeq, level]);
  };

  const handlePlayReferencePattern = () => {
    [3, 1, 4, 2, 5].forEach((lvl, idx) => {
      window.setTimeout(() => {
        soundEngine.playCalibrationHarmonic(lvl);
      }, idx * 420);
    });
  };

  const handleVerifyCalibration = () => {
    const res = validateCalibrationSequence(calibSeq);
    setFeedback({ ok: res.solved, text: res.feedback });
    if (res.solved) {
      completePuzzle('secuencia_calibracion');
    }
  };

  const handleVerifyCorridor = () => {
    const res = validateDiscontinuousCorridor(corridorSteps);
    setFeedback({ ok: res.solved, text: res.feedback });
    if (res.solved) {
      completePuzzle('pasillo_discontinuo');
    }
  };

  const moveMinuteEvent = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= minuteOrder.length) return;
    const copy = [...minuteOrder];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setMinuteOrder(copy);
  };

  const handleVerifyMinute = () => {
    const res = validateReconstructMinute(
      minuteOrder,
      inventory.includes('bobina_maestra')
    );
    setFeedback({ ok: res.solved, text: res.feedback });
    if (res.solved) {
      completePuzzle('reconstruir_minuto');
    }
  };

  const minuteEventLabels: Record<MinuteEventId, { code: string; desc: string }> = {
    RESONANCIA_02_16_12: {
      code: 'Hito Alfa (02:16:12)',
      desc: 'La señal acústica anticipada toma el control del Péndulo Maestro y pliega la geometría del corredor norte.',
    },
    ESCLUSA_02_16_33: {
      code: 'Hito Beta (02:16:33)',
      desc: 'Mateo Soria y Clara Vega quedan atrapados en la esclusa al intentar aislar manualmente las bobinas.',
    },
    EXCLUSION_02_16_48: {
      code: 'Hito Gamma (02:16:48)',
      desc: 'Elena Vance acciona el Disyuntor de Exclusión Horaria, haciendo saltar los relojes oficiales de 02:15 a 02:17.',
    },
  };

  const currentVoltage = calculateCircuitVoltage(circuit);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="puzzle-modal-title"
    >
      <div className="modal-window">
        <header className="modal-header">
          <div>
            <span className="modal-kicker">SISTEMA DE CONTROL — EMSH-4</span>
            <h2 id="puzzle-modal-title">
              {puzzleId === 'circuito_emergencia' &&
                'Puzle 1: Cuadro de Circuito de Emergencia (24V)'}
              {puzzleId === 'registros_incompatibles' &&
                'Puzle 2: Verificador de Registros Incompatibles'}
              {puzzleId === 'secuencia_calibracion' &&
                'Puzle 3: Oscilógrafo de Secuencia Armónica'}
              {puzzleId === 'pasillo_discontinuo' &&
                'Puzle 4: Estabilizador de Topología del Pasillo'}
              {puzzleId === 'reconstruir_minuto' &&
                'Puzle 5: Consola Maestra de Sincronización 02:16'}
            </h2>
          </div>

          <div className="modal-header__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setShowInlineHints((v) => !v)}
              aria-expanded={showInlineHints}
            >
              {showInlineHints
                ? 'Ocultar Pistas'
                : `Ver Pista (${currentHintLevel}/3)`}
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setActiveModal({ type: 'none' })}
            >
              Cerrar [Esc]
            </button>
          </div>
        </header>

        <div className="puzzle-body scroller">
          {showInlineHints && (
            <section
              className="inline-hints-drawer"
              aria-label="Pistas graduales del acertijo"
            >
              <div className="inline-hints-drawer__header">
                <strong>Asistencia Gradual — {hintSet.title}</strong>
                {currentHintLevel < 3 && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => requestNextHint(puzzleId)}
                  >
                    Desbloquear Pista Nivel {currentHintLevel + 1} de 3
                  </button>
                )}
              </div>
              <div className="hint-cards">
                {[0, 1, 2].map((idx) => {
                  const unlocked = currentHintLevel >= idx + 1;
                  return (
                    <div
                      key={idx}
                      className={`hint-card ${unlocked ? 'is-unlocked' : 'is-locked'}`}
                    >
                      <strong>Nivel {idx + 1}:</strong>{' '}
                      <span>
                        {unlocked
                          ? hintSet.levels[idx]
                          : 'Bloqueada (solicita el siguiente nivel si necesitas más ayuda).'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {/* PUZLE 1 */}
          {puzzleId === 'circuito_emergencia' && (
            <div className="puzzle-panel">
              <div className="puzzle-clue-summary">
                <strong>Evidencia en tu Expediente:</strong>{' '}
                {documentsFound.includes('doc_04_acta_suspension') ? (
                  <span>
                    Según el <em>Acta de Suspensión (Doc 04)</em>, la línea de 24V se
                    activa combinando los disyuntores{' '}
                    <strong>B1 (12V) + B3 (8V) + B4 (4V) = 24V</strong> (dejando B2
                    apagado).
                  </span>
                ) : (
                  <span>
                    Aún no has leído el <em>Acta de Suspensión</em> en el Tablón de
                    Avisos izquierdo (o puedes sumar 24V activando B1, B3 y B4).
                  </span>
                )}
              </div>
              <p className="puzzle-instructions">
                Conecta los disyuntores necesarios para alcanzar exactamente{' '}
                <strong>24V</strong> en el bus auxiliar manteniendo activa la{' '}
                <strong>Línea de Vigilancia (B3)</strong>. Estado de Credencial:{' '}
                <strong>
                  {inventory.includes('credencial_acceso')
                    ? 'INSERTADA ✓'
                    : 'NO INSERTADA (Busca en el mostrador)'}
                </strong>
              </p>

              <div className="voltage-meter" aria-live="polite">
                <span>TENSIÓN ACTUAL EN LÍNEA:</span>
                <strong
                  className={
                    currentVoltage === 24
                      ? 'voltage-ok'
                      : currentVoltage > 24
                        ? 'voltage-overload'
                        : ''
                  }
                >
                  {currentVoltage} V / 24 V
                </strong>
              </div>

              <div className="breaker-grid">
                <label className="breaker-toggle">
                  <input
                    type="checkbox"
                    checked={circuit.b1_12v}
                    onChange={(e) =>
                      setCircuit({ ...circuit, b1_12v: e.target.checked })
                    }
                  />
                  <span>Disyuntor B1 — Reserva Sur (+12V)</span>
                </label>

                <label className="breaker-toggle">
                  <input
                    type="checkbox"
                    checked={circuit.b2_18v}
                    onChange={(e) =>
                      setCircuit({ ...circuit, b2_18v: e.target.checked })
                    }
                  />
                  <span>Disyuntor B2 — Turbina Principal (+18V)</span>
                </label>

                <label className="breaker-toggle">
                  <input
                    type="checkbox"
                    checked={circuit.b3_8v}
                    onChange={(e) =>
                      setCircuit({ ...circuit, b3_8v: e.target.checked })
                    }
                  />
                  <span>Disyuntor B3 — Línea de Vigilancia (+8V)</span>
                </label>

                <label className="breaker-toggle">
                  <input
                    type="checkbox"
                    checked={circuit.b4_4v}
                    onChange={(e) =>
                      setCircuit({ ...circuit, b4_4v: e.target.checked })
                    }
                  />
                  <span>Disyuntor B4 — Estabilizador Auxiliar (+4V)</span>
                </label>
              </div>

              <button
                type="button"
                className="btn btn--primary"
                onClick={handleVerifyCircuit}
              >
                Estabilizar Suministro de 24V
              </button>
            </div>
          )}

          {/* PUZLE 2 */}
          {puzzleId === 'registros_incompatibles' && (
            <div className="puzzle-panel">
              <div className="puzzle-clue-summary">
                <strong>Evidencia en tu Expediente:</strong>{' '}
                {documentsFound.includes('doc_01_registro_turno') ||
                transcriptsFound.includes('rec_01_pasos_anticipados') ? (
                  <span>
                    La nota al margen del <em>Registro de Turno (Doc 01)</em> y la{' '}
                    <em>Grabación 01</em> revelan que el monitor{' '}
                    <strong>CAM-04</strong> en el <strong>Canal B (Residuo)</strong>{' '}
                    grabó a Mateo Soria a las <strong>02:16</strong>.
                  </span>
                ) : (
                  <span>
                    Revisa el <em>Libro de Guardia</em> sobre la mesa y escucha el{' '}
                    <em>Magnetófono en Canal B</em> para ver qué cámara (CAM-04) y hora
                    (02:16) fueron ocultadas.
                  </span>
                )}
              </div>
              <p className="puzzle-instructions">
                El Registro de Turno oficial (Doc 01) asegura que ningún operario cruzó
                hacia el norte y que el reloj saltó de las 02:15 a las 02:17. Selecciona
                qué <strong>Cámara</strong>, qué <strong>Canal del Sintonizador</strong> y
                qué <strong>Marca Horaria</strong> desmienten el documento oficial.
              </p>

              <div className="selector-row">
                <label>
                  <span>Cámara de vigilancia:</span>
                  <select
                    value={recordsInput.cameraId}
                    onChange={(e) =>
                      setRecordsInput({
                        ...recordsInput,
                        cameraId: e.target.value as IncompatibleRecordsInput['cameraId'],
                      })
                    }
                  >
                    <option value="CAM_01">CAM-01 (Vestíbulo Exterior)</option>
                    <option value="CAM_02">CAM-02 (Subestación Sur)</option>
                    <option value="CAM_03">CAM-03 (Descansillo Central)</option>
                    <option value="CAM_04">CAM-04 (Acceso Norte / Archivo)</option>
                  </select>
                </label>

                <label>
                  <span>Canal de impresión acústica:</span>
                  <select
                    value={recordsInput.channel}
                    onChange={(e) =>
                      setRecordsInput({
                        ...recordsInput,
                        channel: e.target.value as IncompatibleRecordsInput['channel'],
                      })
                    }
                  >
                    <option value="A">Canal A — Registro Oficial (440 Hz)</option>
                    <option value="B">Canal B — Residuo Acústico (432 Hz)</option>
                    <option value="C">Canal C — Discordancia (417 Hz)</option>
                  </select>
                </label>

                <label>
                  <span>Marca horaria omitida:</span>
                  <select
                    value={recordsInput.timestamp}
                    onChange={(e) =>
                      setRecordsInput({
                        ...recordsInput,
                        timestamp: e.target.value as IncompatibleRecordsInput['timestamp'],
                      })
                    }
                  >
                    <option value="02:14">02:14</option>
                    <option value="02:15">02:15</option>
                    <option value="02:16">02:16</option>
                    <option value="02:17">02:17</option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                className="btn btn--primary"
                onClick={handleVerifyRecords}
              >
                Registrar Contradicción y Abrir Archivador
              </button>
            </div>
          )}

          {/* PUZLE 3 */}
          {puzzleId === 'secuencia_calibracion' && (
            <div className="puzzle-panel">
              <p className="puzzle-instructions">
                Introduce la secuencia de <strong>cinco impulsos armónicos</strong> de la
                cinta maestra. Puedes guiarte tanto por el oído como por la gráfica del
                oscilógrafo estilizado (accesibilidad visual).
              </p>

              {/* Oscilógrafo visual accesible */}
              <div
                className="oscillograph-box"
                aria-label="Gráfica visual del oscilógrafo: barras de amplitud 3, 1, 4, 2, 5"
              >
                <div className="oscillograph-box__header">
                  <span>PATRÓN DE REFERENCIA (OSCILÓGRAFO):</span>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={handlePlayReferencePattern}
                  >
                    Escuchar Patrón de Referencia
                  </button>
                </div>
                <div className="oscillograph-bars">
                  {[3, 1, 4, 2, 5].map((lvl, idx) => (
                    <div key={idx} className="oscillograph-bar-col">
                      <div
                        className="oscillograph-bar-fill"
                        style={{ height: `${lvl * 18}%` }}
                      />
                      <span className="oscillograph-bar-label">
                        Pulso {idx + 1}: Niv. {lvl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="harmonic-keypad" role="group" aria-label="Selector de niveles armónicos">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => handleAddHarmonic(lvl)}
                  >
                    Impulso Nivel {lvl}
                  </button>
                ))}
              </div>

              <div className="sequence-readout">
                <span>Secuencia introducida:</span>
                <strong>
                  {calibSeq.length > 0 ? calibSeq.join(' — ') : '(Vacía)'}
                </strong>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setCalibSeq([])}
                >
                  Reiniciar secuencia
                </button>
              </div>

              <button
                type="button"
                className="btn btn--primary"
                onClick={handleVerifyCalibration}
              >
                Sincronizar Diapasones Maestros
              </button>
            </div>
          )}

          {/* PUZLE 4 */}
          {puzzleId === 'pasillo_discontinuo' && (
            <div className="puzzle-panel">
              <div className="puzzle-clue-summary">
                <strong>Evidencia en tu Expediente:</strong>{' '}
                {documentsFound.includes('doc_06_contradiccion_espacial') ? (
                  <span>
                    Según el <em>Registro de Contradicción Espacial (Doc 06)</em>:{' '}
                    <strong>Tramo 1 = Canal A + Puerta Norte</strong> ·{' '}
                    <strong>Tramo 2 = Canal B + Esclusa Lateral</strong> ·{' '}
                    <strong>Tramo 3 = Canal C + Umbral de Sincronía</strong>.
                  </span>
                ) : (
                  <span>
                    Lee primero el <em>Registro de Contradicción Espacial (Doc 06)</em>{' '}
                    en el pupitre izquierdo de este pasillo para conocer la combinación
                    de los tres tramos.
                  </span>
                )}
              </div>
              <p className="puzzle-instructions">
                Combina el Plano del Edificio, el Registro de Contradicción Espacial (Doc
                06) y el movimiento del Residual para asignar el{' '}
                <strong>Canal Acústico</strong> y la <strong>Compuerta</strong> de cada
                tramo del corredor.
              </p>

              {[0, 1, 2].map((stepIdx) => (
                <div key={stepIdx} className="corridor-step-row">
                  <strong>Tramo {stepIdx + 1}:</strong>
                  <label>
                    <span>Canal:</span>
                    <select
                      value={corridorSteps[stepIdx].channel}
                      onChange={(e) => {
                        const next = [...corridorSteps];
                        next[stepIdx] = {
                          ...next[stepIdx],
                          channel: e.target.value as CorridorStep['channel'],
                        };
                        setCorridorSteps(next);
                      }}
                    >
                      <option value="A">Canal A (Registro)</option>
                      <option value="B">Canal B (Residuo)</option>
                      <option value="C">Canal C (Discordancia)</option>
                    </select>
                  </label>

                  <label>
                    <span>Paso a cruzar:</span>
                    <select
                      value={corridorSteps[stepIdx].door}
                      onChange={(e) => {
                        const next = [...corridorSteps];
                        next[stepIdx] = {
                          ...next[stepIdx],
                          door: e.target.value as CorridorStep['door'],
                        };
                        setCorridorSteps(next);
                      }}
                    >
                      <option value="NORTE">Puerta Norte (Plano Oficial)</option>
                      <option value="ESCLUSA">Esclusa Lateral (Rastro Residual)</option>
                      <option value="UMBRAL">Umbral de Sincronía (Marca 02:16)</option>
                    </select>
                  </label>
                </div>
              ))}

              <button
                type="button"
                className="btn btn--primary"
                onClick={handleVerifyCorridor}
              >
                Fijar Ruta y Cruzar el Corredor
              </button>
            </div>
          )}

          {/* PUZLE 5 */}
          {puzzleId === 'reconstruir_minuto' && (
            <div className="puzzle-panel">
              <div className="puzzle-clue-summary">
                <strong>Evidencia en tu Expediente:</strong>{' '}
                {documentsFound.includes('doc_07_memorando_eliminacion') ||
                transcriptsFound.includes('rec_03_corte_sincronia') ? (
                  <span>
                    Orden cronológico real según el <em>Memorando 0216 (Doc 07)</em>:{' '}
                    <strong>1.º Hito Alfa (02:16:12)</strong> Señal anticipada →{' '}
                    <strong>2.º Hito Beta (02:16:33)</strong> Soria y Vega atrapados en
                    esclusa → <strong>3.º Hito Gamma (02:16:48)</strong> Elena Vance
                    acciona la exclusión horaria.
                  </span>
                ) : (
                  <span>
                    Revisa el <em>Memorando 0216</em> (en el Archivo bajo Canal B) y la{' '}
                    <em>Caja Negra</em> (en esta sala bajo Canal C) para ordenar los
                    sucesos :12, :33 y :48.
                  </span>
                )}
              </div>
              <p className="puzzle-instructions">
                Ordena cronológicamente los tres acontecimientos ocurridos durante el
                minuto <strong>02:16</strong> según el Memorando de Eliminación (Doc 07) y
                las tres grabaciones. Estado de Bobina Maestra 02:16:{' '}
                <strong>
                  {inventory.includes('bobina_maestra')
                    ? 'CARGADA EN CONSOLA ✓'
                    : 'FALTA BOBINA (En Laboratorio de Calibración)'}
                </strong>
              </p>

              <ol className="minute-order-list">
                {minuteOrder.map((evId, idx) => {
                  const info = minuteEventLabels[evId];
                  return (
                    <li key={evId} className="minute-order-card">
                      <div className="minute-order-card__text">
                        <span className="minute-order-card__step">
                          Posición #{idx + 1} — {info.code}
                        </span>
                        <p>{info.desc}</p>
                      </div>
                      <div className="minute-order-card__controls">
                        <button
                          type="button"
                          className="btn btn--secondary"
                          disabled={idx === 0}
                          onClick={() => moveMinuteEvent(idx, -1)}
                          aria-label={`Subir ${info.code}`}
                        >
                          ↑ Subir
                        </button>
                        <button
                          type="button"
                          className="btn btn--secondary"
                          disabled={idx === minuteOrder.length - 1}
                          onClick={() => moveMinuteEvent(idx, 1)}
                          aria-label={`Bajar ${info.code}`}
                        >
                          ↓ Bajar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {!puzzlesSolved.includes('reconstruir_minuto') ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleVerifyMinute}
                >
                  Reconstruir el Minuto 02:16 en el Reloj Patrón
                </button>
              ) : (
                <div className="ending-choice-box" role="region" aria-label="Decisión final">
                  <h3>DIRECTIVA FINAL DE SINCRONIZACIÓN</h3>
                  <p>
                    El minuto 02:16 está completo en el tambor magnético. El Contador late
                    a dos décimas del segundo sesenta. ¿Qué decisión tomas?
                  </p>
                  <div className="ending-choice-buttons">
                    <button
                      type="button"
                      className="btn btn--ending-a"
                      onClick={() => selectEnding('silencio_preservado')}
                    >
                      <strong>Final A — El silencio preservado</strong>
                      <span>
                        Aislar las grabaciones y sellar la estación. La anomalía queda
                        contenida, pero quienes quedaron en el minuto 02:16 jamás serán
                        recordados.
                      </span>
                    </button>

                    <button
                      type="button"
                      className="btn btn--ending-b"
                      onClick={() => selectEnding('la_transmision')}
                    >
                      <strong>Final B — La transmisión</strong>
                      <span>
                        Sincronizar el sistema y reproducir el minuto completo. La verdad y
                        los registros se recuperan, pero el patrón de El Contador se propaga
                        al exterior.
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {feedback && (
            <div
              className={`puzzle-feedback ${
                feedback.ok ? 'puzzle-feedback--ok' : 'puzzle-feedback--error'
              }`}
              role="status"
              aria-live="polite"
            >
              {feedback.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

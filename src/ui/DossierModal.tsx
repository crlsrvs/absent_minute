import { useState } from 'react';
import { useGameStore } from '../core/store';
import {
  AUDIO_TRANSCRIPTS,
  NARRATIVE_DOCUMENTS,
} from '../narrative/documents';
import { SCENES_DATA } from '../narrative/scenesData';
import { DocumentId, TranscriptId } from '../core/types';
import { soundEngine } from '../audio/soundEngine';

export function DossierModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const documentsFound = useGameStore((s) => s.documentsFound);
  const transcriptsFound = useGameStore((s) => s.transcriptsFound);
  const puzzlesSolved = useGameStore((s) => s.puzzlesSolved);
  const currentScene = useGameStore((s) => s.currentScene);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const [tab, setTab] = useState<'documents' | 'transcripts' | 'notes'>(
    activeModal.initialDossierTab ?? 'documents'
  );
  const [selectedDoc, setSelectedDoc] = useState<DocumentId | null>(
    activeModal.selectedDocumentId ?? documentsFound[0] ?? null
  );
  const [selectedRec, setSelectedRec] = useState<TranscriptId | null>(
    activeModal.selectedTranscriptId ?? transcriptsFound[0] ?? null
  );

  const allDocIds = Object.keys(NARRATIVE_DOCUMENTS) as DocumentId[];
  const allRecIds = Object.keys(AUDIO_TRANSCRIPTS) as TranscriptId[];

  const currentDocObj =
    selectedDoc && documentsFound.includes(selectedDoc)
      ? NARRATIVE_DOCUMENTS[selectedDoc]
      : null;

  const currentRecObj =
    selectedRec && transcriptsFound.includes(selectedRec)
      ? AUDIO_TRANSCRIPTS[selectedRec]
      : null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
    >
      <div className="modal-window modal-window--wide">
        <header className="modal-header">
          <div>
            <span className="modal-kicker">EXPEDIENTE DE CAMPO — EMSH-4</span>
            <h2 id="dossier-title">Archivo Personal y Evidencias</h2>
          </div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setActiveModal({ type: 'none' })}
          >
            Cerrar [Esc]
          </button>
        </header>

        <nav className="dossier-tabs" aria-label="Secciones del expediente">
          <button
            type="button"
            className={`dossier-tab ${tab === 'documents' ? 'is-active' : ''}`}
            onClick={() => setTab('documents')}
          >
            Documentos ({documentsFound.length}/8)
          </button>
          <button
            type="button"
            className={`dossier-tab ${tab === 'transcripts' ? 'is-active' : ''}`}
            onClick={() => setTab('transcripts')}
          >
            Grabaciones ({transcriptsFound.length}/3)
          </button>
          <button
            type="button"
            className={`dossier-tab ${tab === 'notes' ? 'is-active' : ''}`}
            onClick={() => setTab('notes')}
          >
            Cronología y Objetivos
          </button>
        </nav>

        <div className="dossier-body scroller">
          {tab === 'documents' && (
            <div className="dossier-split">
              <ul className="dossier-list" aria-label="Lista de documentos">
                {allDocIds.map((docId) => {
                  const found = documentsFound.includes(docId);
                  const doc = NARRATIVE_DOCUMENTS[docId];
                  return (
                    <li key={docId}>
                      <button
                        type="button"
                        className={`dossier-list-item ${
                          selectedDoc === docId ? 'is-selected' : ''
                        }`}
                        disabled={!found}
                        onClick={() => setSelectedDoc(docId)}
                      >
                        <span className="dossier-list-item__code">{doc.code}</span>
                        <span className="dossier-list-item__title">
                          {found ? doc.title : 'Documento aún no recuperado'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <article className="dossier-reader">
                {currentDocObj ? (
                  <>
                    <div className="dossier-reader__meta">
                      <span>CÓDIGO: {currentDocObj.code}</span>
                      <span>FECHA: {currentDocObj.date}</span>
                      <span>AUTOR: {currentDocObj.author}</span>
                    </div>
                    <h3>{currentDocObj.title}</h3>
                    <div className="dossier-reader__content">
                      {currentDocObj.content.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                    <div className="dossier-reader__deduction">
                      <strong>Observación del investigador:</strong>{' '}
                      {currentDocObj.mysteryConnection}
                    </div>
                  </>
                ) : (
                  <p className="dossier-empty">
                    Selecciona un documento recuperado de la columna izquierda para
                    inspeccionar su contenido.
                  </p>
                )}
              </article>
            </div>
          )}

          {tab === 'transcripts' && (
            <div className="dossier-split">
              <ul className="dossier-list" aria-label="Lista de grabaciones">
                {allRecIds.map((recId) => {
                  const found = transcriptsFound.includes(recId);
                  const rec = AUDIO_TRANSCRIPTS[recId];
                  return (
                    <li key={recId}>
                      <button
                        type="button"
                        className={`dossier-list-item ${
                          selectedRec === recId ? 'is-selected' : ''
                        }`}
                        disabled={!found}
                        onClick={() => setSelectedRec(recId)}
                      >
                        <span className="dossier-list-item__code">{rec.code}</span>
                        <span className="dossier-list-item__title">
                          {found ? rec.title : 'Cinta magnetofónica no registrada'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <article className="dossier-reader">
                {currentRecObj ? (
                  <>
                    <div className="dossier-reader__meta">
                      <span>CINTA: {currentRecObj.code}</span>
                      <span>INTERVALO: {currentRecObj.timestamp}</span>
                      <span>CANAL: {currentRecObj.channelRequired}</span>
                    </div>
                    <div className="dossier-reader__title-row">
                      <h3>{currentRecObj.title}</h3>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() =>
                          soundEngine.playTranscriptRecording(currentRecObj.id)
                        }
                      >
                        ▶ Reproducir grabación magnética
                      </button>
                    </div>
                    <div className="dossier-reader__content">
                      {currentRecObj.segments.map((seg, idx) => (
                        <blockquote key={idx} className="transcript-segment">
                          <strong>{seg.speaker}:</strong> {seg.text}
                        </blockquote>
                      ))}
                    </div>
                    <div className="dossier-reader__deduction">
                      <strong>Análisis acústico:</strong> {currentRecObj.mysteryConnection}
                    </div>
                  </>
                ) : (
                  <p className="dossier-empty">
                    Explora las salas con el Sintonizador de Ecos para localizar y
                    reproducir las grabaciones magnetofónicas.
                  </p>
                )}
              </article>
            </div>
          )}

          {tab === 'notes' && (
            <div className="dossier-notes">
              <section className="dossier-notes__block">
                <h3>Objetivo Actual ({SCENES_DATA[currentScene].title})</h3>
                <p>{SCENES_DATA[currentScene].objective}</p>
              </section>

              <section className="dossier-notes__block">
                <h3>Reglas de La Discontinuidad verificadas</h3>
                <ul>
                  <li>
                    <strong>Canal A — Registro (440 Hz):</strong> Muestra la versión
                    oficial del edificio tras el cierre de 1999.
                  </li>
                  <li>
                    <strong>Canal B — Residuo (432 Hz):</strong> Revela las impresiones
                    acústicas del minuto 02:16, incluyendo a <em>Los Residuales</em> y a{' '}
                    <em>Los Testigos</em>.
                  </li>
                  <li>
                    <strong>Canal C — Discordancia (417 Hz):</strong> Expone el choque
                    entre ambos registros y las marcas numéricas de <em>El Contador</em>.
                  </li>
                </ul>
              </section>

              <section className="dossier-notes__block">
                <h3>Hitos de Progreso ({puzzlesSolved.length}/5 Acertijos resueltos)</h3>
                <ul>
                  <li>
                    [{puzzlesSolved.includes('circuito_emergencia') ? '✓' : ' '}] Puzle 1:
                    Circuito de emergencia de 24V (Vestíbulo)
                  </li>
                  <li>
                    [{puzzlesSolved.includes('registros_incompatibles') ? '✓' : ' '}] Puzle
                    2: Dos registros incompatibles en CAM-04 (Sala de Vigilancia)
                  </li>
                  <li>
                    [{puzzlesSolved.includes('secuencia_calibracion') ? '✓' : ' '}] Puzle 3:
                    Secuencia armónica 3-1-4-2-5 (Laboratorio de Calibración)
                  </li>
                  <li>
                    [{puzzlesSolved.includes('pasillo_discontinuo') ? '✓' : ' '}] Puzle 4:
                    Tránsito por el Pasillo Discontinuo (A: Norte → B: Esclusa → C: Umbral)
                  </li>
                  <li>
                    [{puzzlesSolved.includes('reconstruir_minuto') ? '✓' : ' '}] Puzle 5:
                    Reconstrucción cronológica del minuto 02:16 (Cámara de Sincronización)
                  </li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

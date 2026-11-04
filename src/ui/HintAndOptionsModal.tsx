import { useGameStore } from '../core/store';
import { PUZZLE_HINTS, SCENE_PRIMARY_PUZZLE } from '../narrative/hints';
import { soundEngine } from '../audio/soundEngine';

export function HintAndOptionsModal() {
  const activeModal = useGameStore((s) => s.activeModal);
  const currentScene = useGameStore((s) => s.currentScene);
  const hintLevels = useGameStore((s) => s.hintLevels);
  const settings = useGameStore((s) => s.settings);
  const requestNextHint = useGameStore((s) => s.requestNextHint);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  if (activeModal.type === 'hints') {
    const targetPuzzle = activeModal.puzzleId ?? SCENE_PRIMARY_PUZZLE[currentScene];
    const hintSet = PUZZLE_HINTS[targetPuzzle];
    const currentLevel = hintLevels[targetPuzzle] ?? 0;

    return (
      <div
        className="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hints-title"
      >
        <div className="modal-window">
          <header className="modal-header">
            <div>
              <span className="modal-kicker">ASISTENCIA GRADUAL DE INVESTIGACIÓN</span>
              <h2 id="hints-title">{hintSet.title}</h2>
            </div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setActiveModal({ type: 'none' })}
            >
              Cerrar [Esc]
            </button>
          </header>

          <div className="modal-content scroller">
            <p className="hint-intro">
              El sistema desbloquea orientaciones de forma progresiva (Conceptual →
              Específica → Directa) para no arruinar tu deducción.
            </p>

            <div className="hint-cards">
              {[0, 1, 2].map((idx) => {
                const unlocked = currentLevel >= idx + 1;
                return (
                  <div
                    key={idx}
                    className={`hint-card ${unlocked ? 'is-unlocked' : 'is-locked'}`}
                  >
                    <strong>Nivel {idx + 1}</strong>
                    <p>
                      {unlocked
                        ? hintSet.levels[idx]
                        : 'Pista bloqueada. Solicita el siguiente nivel si necesitas más orientación.'}
                    </p>
                  </div>
                );
              })}
            </div>

            {currentLevel < 3 && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => requestNextHint(targetPuzzle)}
              >
                Desbloquear Pista Nivel {currentLevel + 1} de 3
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeModal.type === 'options') {
    const handleVolumeChange = (val: number) => {
      updateSettings({ volume: val });
      soundEngine.setVolumeAndMute(val, settings.muted);
    };

    const handleMuteToggle = (muted: boolean) => {
      updateSettings({ muted });
      soundEngine.setVolumeAndMute(settings.volume, muted);
    };

    return (
      <div
        className="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="options-title"
      >
        <div className="modal-window">
          <header className="modal-header">
            <div>
              <span className="modal-kicker">CONFIGURACIÓN Y ACCESIBILIDAD</span>
              <h2 id="options-title">Opciones del Sistema</h2>
            </div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setActiveModal({ type: 'none' })}
            >
              Guardar y Cerrar [Esc]
            </button>
          </header>

          <form
            className="options-form scroller"
            onSubmit={(e) => {
              e.preventDefault();
              setActiveModal({ type: 'none' });
            }}
          >
            <div className="option-row">
              <label htmlFor="opt-volume">
                <span>Volumen general ({Math.round(settings.volume * 100)}%)</span>
              </label>
              <input
                id="opt-volume"
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.volume * 100)}
                style={
                  {
                    '--progress': `${Math.round(settings.volume * 100)}%`,
                  } as React.CSSProperties
                }
                onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
              />
            </div>

            <div className="option-row">
              <label htmlFor="opt-mute">
                <input
                  id="opt-mute"
                  type="checkbox"
                  className="visually-hidden-fallback"
                  checked={settings.muted}
                  onChange={(e) => handleMuteToggle(e.target.checked)}
                />
                <span>Silenciar todo el audio (Modo Silencioso)</span>
              </label>
            </div>

            <div className="option-row">
              <label htmlFor="opt-subtitles">
                <input
                  id="opt-subtitles"
                  type="checkbox"
                  className="visually-hidden-fallback"
                  checked={settings.subtitles}
                  onChange={(e) => updateSettings({ subtitles: e.target.checked })}
                />
                <span>
                  Mostrar subtítulos descriptivos e indicadores de procedencia sonora
                </span>
              </label>
            </div>

            <div className="option-row">
              <label htmlFor="opt-motion">
                <input
                  id="opt-motion"
                  type="checkbox"
                  className="visually-hidden-fallback"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                />
                <span>
                  Reducción de movimiento (fija la cámara 3D y desactiva oscilaciones)
                </span>
              </label>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (activeModal.type === 'credits') {
    return (
      <div
        className="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-title"
      >
        <div className="modal-window">
          <header className="modal-header">
            <div>
              <span className="modal-kicker">PROPIEDAD INTELECTUAL ORIGINAL</span>
              <h2 id="credits-title">Créditos — absent_minute</h2>
            </div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setActiveModal({ type: 'none' })}
            >
              Cerrar [Esc]
            </button>
          </header>

          <div className="modal-content scroller">
            <p>
              <strong>absent_minute</strong> es una obra interactiva original de
              misterio paranormal y terror psicológico desarrollada con React, TypeScript,
              Three.js (React Three Fiber) y síntesis acústica procedural mediante Web
              Audio API.
            </p>
            <ul>
              <li>
                <strong>Dirección Creativa y Narrativa:</strong> Universo original de{' '}
                <em>La Discontinuidad</em> y la Estación Municipal de Sincronía Horaria de
                Valdehornos (EMSH-4).
              </li>
              <li>
                <strong>Escenarios 3D y Sonido:</strong> Geometría procedural generada en
                tiempo real y motor acústico sintético local (sin recursos propietarios
                externos).
              </li>
              <li>
                <strong>Controles de teclado:</strong> <code>1 / 2 / 3</code> cambiar
                canales del Sintonizador, <code>Tab</code> abrir Expediente,{' '}
                <code>E</code> interactuar con punto enfocado, <code>Esc</code> cerrar
                paneles.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

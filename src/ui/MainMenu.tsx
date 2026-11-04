import { useGameStore } from '../core/store';
import { soundEngine } from '../audio/soundEngine';

export function MainMenu() {
  const hasSavedGame = useGameStore((s) => s.hasSavedGame);
  const saveCorruptedWarning = useGameStore((s) => s.saveCorruptedWarning);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const continueSavedGame = useGameStore((s) => s.continueSavedGame);
  const dismissCorruptedWarning = useGameStore((s) => s.dismissCorruptedWarning);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const handleStartNew = () => {
    soundEngine.initOnUserGesture();
    startNewGame();
  };

  const handleContinue = () => {
    soundEngine.initOnUserGesture();
    continueSavedGame();
  };

  return (
    <main className="main-menu" aria-labelledby="game-title">
      <div className="main-menu__backdrop" aria-hidden="true">
        <div className="main-menu__clock-ring">
          <span className="main-menu__time-stamp">02:15:59</span>
          <span className="main-menu__time-gap">// 02:16 AUSENTE //</span>
          <span className="main-menu__time-stamp">02:17:00</span>
        </div>
      </div>

      <section className="main-menu__panel">
        <p className="main-menu__kicker">
          ESTACIÓN MUNICIPAL DE SINCRONÍA HORARIA N.º 4 — VALDEHORNOS
        </p>
        <h1 id="game-title" className="main-menu__title">
          absent_minute
        </h1>
        <p className="main-menu__subtitle">
          Un misterio sobre aquello que la realidad decidió olvidar
        </p>

        {saveCorruptedWarning && (
          <div className="alert-banner" role="alert">
            <p>
              <strong>Registro local dañado:</strong> Se detectó un archivo de guardado
              incompleto o incompatible. Puedes descartarlo e iniciar una nueva
              investigación sin afectar el sistema.
            </p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={dismissCorruptedWarning}
            >
              Limpiar registro e iniciar de cero
            </button>
          </div>
        )}

        <nav className="main-menu__actions" aria-label="Menú principal">
          {hasSavedGame && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleContinue}
            >
              Continuar investigación
            </button>
          )}

          <button
            type="button"
            className={`btn ${hasSavedGame ? 'btn--secondary' : 'btn--primary'}`}
            onClick={handleStartNew}
          >
            Nueva partida
          </button>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setActiveModal({ type: 'options' })}
          >
            Opciones y Accesibilidad
          </button>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setActiveModal({ type: 'credits' })}
          >
            Créditos y Archivo Técnico
          </button>
        </nav>

        <footer className="main-menu__footer">
          <p className="main-menu__notice">
            <strong>Nota de experiencia y accesibilidad:</strong> Se recomienda el uso de
            auriculares. Todos los acertijos sonoros incluyen representación visual y
            subtítulos descriptivos. Esta obra contiene distorsiones visuales moderadas
            (puedes activar <em>Reducción de movimiento</em> en Opciones).
          </p>
        </footer>
      </section>
    </main>
  );
}

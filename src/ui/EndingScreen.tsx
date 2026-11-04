import { useGameStore } from '../core/store';

export function EndingScreen() {
  const endingReached = useGameStore((s) => s.endingReached);
  const documentsFound = useGameStore((s) => s.documentsFound);
  const transcriptsFound = useGameStore((s) => s.transcriptsFound);
  const returnToMainMenu = useGameStore((s) => s.returnToMainMenu);
  const startNewGame = useGameStore((s) => s.startNewGame);

  if (!endingReached) return null;

  const isSilence = endingReached === 'silencio_preservado';

  return (
    <main className="ending-screen" aria-labelledby="ending-title">
      <article className="ending-card">
        <span className="ending-card__kicker">
          {isSilence
            ? 'DESENLACE A — PROTOCOLO DE CONTENCIÓN EJECUTADO'
            : 'DESENLACE B — SINCRONIZACIÓN COMPLETADA (02:16:60)'}
        </span>

        <h1 id="ending-title" className="ending-card__title">
          {isSilence ? 'El silencio preservado' : 'La transmisión'}
        </h1>

        <div className="ending-card__clock">
          {isSilence ? '02:15:59 ── // ── 02:17:00' : '02:16:59 ──► 02:17:00'}
        </div>

        {isSilence ? (
          <div className="ending-card__narrative">
            <p>
              Accionas el seccionador de purga y bloqueas definitivamente el tambor
              magnético. En la bóveda, los doce relojes esclavos se detienen con un golpe
              seco y el gran Péndulo Maestro queda inmóvil.
            </p>
            <p>
              La estación recupera una calma densa, casi mineral. El patrón de{' '}
              <em>El Contador</em> no saldrá jamás hacia las líneas eléctricas de
              Valdehornos; las calles dormidas seguirán creyendo que aquella noche de 1999
              solo hubo una tormenta pasajera.
            </p>
            <p>
              Sin embargo, al cruzar el vestíbulo hacia la salida, escuchas por última vez
              un golpe apagado detrás del tabique del archivo. Mateo Soria y Clara Vega
              permanecerán para siempre dentro de un minuto que ningún reloj del mundo
              volverá a contar.
            </p>
          </div>
        ) : (
          <div className="ending-card__narrative">
            <p>
              Liberas el embrague del Péndulo Maestro y conectas la Bobina 02:16 a la red
              de distribución municipal. Por primera vez en veintisiete años, el segundero
              cruza la marca prohibida y completa el segundo sesenta.
            </p>
            <p>
              Las paredes del pasillo norte recuperan sus dieciocho metros exactos. En los
              monitores de vigilancia y en las cajas negras quedan grabados con nitidez
              los nombres, las voces y el sacrificio de Mateo Soria y Clara Vega: la
              realidad ya no puede fingir que no estuvieron allí.
            </p>
            <p>
              Pero cuando sales al exterior de la estación y miras hacia el valle de
              Valdehornos, escuchas a lo lejos las sirenas de las fábricas y los relojes
              de la estación ferroviaria dando las campanadas tres segundos antes de que
              sus agujas toquen la hora. Algo ha aprendido a contar fuera del edificio.
            </p>
          </div>
        )}

        <div className="ending-card__summary">
          <span>
            Evidencias documentales recuperadas: <strong>{documentsFound.length} / 8</strong>
          </span>
          <span>
            Grabaciones magnetofónicas analizadas:{' '}
            <strong>{transcriptsFound.length} / 3</strong>
          </span>
        </div>

        <div className="ending-card__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={startNewGame}
          >
            Jugar de nuevo (Explorar otro desenlace)
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={returnToMainMenu}
          >
            Regresar al menú principal
          </button>
        </div>
      </article>
    </main>
  );
}

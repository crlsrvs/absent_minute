import { useGameStore } from '../core/store';
import { soundEngine } from '../audio/soundEngine';

export function IntroBriefingModal() {
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const handleClose = () => {
    soundEngine.initOnUserGesture();
    setActiveModal({ type: 'none' });
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-title"
    >
      <div className="modal-window modal-window--wide">
        <header className="modal-header">
          <div>
            <span className="modal-kicker">
              ORDEN DE TRABAJO NOCTURNO — EXPEDIENTE EMSH-4
            </span>
            <h2 id="briefing-title">
              Informe de Misión: ¿Qué haces aquí y cómo jugar?
            </h2>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleClose}
          >
            Entendido — Comenzar Investigación
          </button>
        </header>

        <div className="dossier-body scroller briefing-content">
          <div className="briefing-grid">
            <section className="briefing-card">
              <span className="briefing-card__badge">1. LA HISTORIA Y TU META</span>
              <h3>El Minuto que Desapareció (02:16)</h3>
              <p>
                Eres un <strong>técnico auditor</strong> contratado para recuperar la
                caja negra de la <strong>Estación Horaria de Valdehornos</strong> antes
                de su demolición.
              </p>
              <p>
                Hace 27 años (el 14 de noviembre de 1999), todos los relojes de la
                ciudad saltaron de golpe de las <strong>02:15</strong> a las{' '}
                <strong>02:17</strong>. El minuto <strong>02:16</strong> fue eliminado
                de los registros oficiales, pero las bobinas magnéticas del edificio
                siguieron grabando sonidos imposibles y dejaron a dos trabajadores
                atrapados en una anomalía acústica llamada <em>La Discontinuidad</em>.
              </p>
              <p className="briefing-highlight">
                <strong>Finalidad del juego:</strong> Avanzar por las{' '}
                <strong>6 salas del edificio</strong>, recuperar la{' '}
                <strong>Bobina Maestra 02:16</strong>, reconstruir qué ocurrió en ese
                minuto y tomar la decisión final en la <strong>Cámara Central</strong>.
              </p>
            </section>

            <section className="briefing-card">
              <span className="briefing-card__badge">2. CÓMO SE JUEGA</span>
              <h3>Guía Rápida de Controles y Mecánicas</h3>
              <ul className="briefing-steps-list">
                <li>
                  <strong>Sigue la «Guía Paso a Paso» (arriba a la izquierda):</strong>{' '}
                  En todo momento verás una lista de tareas numeradas para la sala en la
                  que estás. Puedes incluso <strong>hacer clic sobre cualquier paso</strong>{' '}
                  para enfocar o activar ese objeto directamente.
                </li>
                <li>
                  <strong>Interactúa con los objetos 3D:</strong> Haz clic sobre los
                  objetos iluminados en la escena 3D (o usa los botones de{' '}
                  <em>Explorar Sala</em> en la parte inferior) para recoger llaves, leer
                  documentos y abrir paneles de control.
                </li>
                <li>
                  <strong>Usa el Sintonizador de Ecos (Canales A, B y C):</strong> En la{' '}
                  <em>Sala 2 (Vigilancia)</em> encontrarás el Sintonizador. Cambiar entre{' '}
                  <strong>Canal A (Oficial)</strong>, <strong>Canal B (Residuo 02:16)</strong>{' '}
                  y <strong>Canal C (Discordancia)</strong> revelará grabaciones ocultas,
                  siluetas fantasmales (<em>Testigos y Residuales</em>) y puertas que no
                  existen en el plano oficial.
                </li>
              </ul>
            </section>
          </div>

          <div className="briefing-footer">
            <span>
              Puedes volver a abrir esta guía cuando quieras pulsando el botón{' '}
              <strong>«¿Qué hacer? / Guía»</strong> en la barra superior.
            </span>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleClose}
            >
              Entrar al Vestíbulo de Recepción →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

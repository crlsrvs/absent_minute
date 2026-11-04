import { useGameStore } from '../core/store';
import { SCENES_DATA } from '../narrative/scenesData';
import { INVENTORY_CATALOG } from '../narrative/documents';
import {
  GuideStep,
  getBuildingMapNodes,
  getSceneGuideSteps,
} from '../narrative/progressionGuide';
import { EchoChannel } from '../core/types';
import { soundEngine } from '../audio/soundEngine';
import { FacilityCanvas } from '../scenes/FacilityCanvas';

export function HUD() {
  const gameState = useGameStore();
  const {
    currentScene,
    channel,
    inventory,
    documentsFound,
    transcriptsFound,
    focusedHotspotId,
    inspectionMessage,
    subtitleCue,
    settings,
    setChannel,
    enterScene,
    setActiveModal,
    setFocusedHotspotId,
    interactWithHotspot,
    returnToMainMenu,
  } = gameState;

  const sceneDef = SCENES_DATA[currentScene];
  const hasTuner = inventory.includes('sintonizador_ecos');

  const guideSteps = getSceneGuideSteps(gameState);
  const mapNodes = getBuildingMapNodes(gameState);
  const firstPendingStepId = guideSteps.find((st) => !st.completed)?.id ?? null;

  const focusedHotspot = sceneDef.hotspots.find((h) => h.id === focusedHotspotId);

  const visibleHotspots = sceneDef.hotspots.filter((h) => {
    if (h.visibleInChannels && !h.visibleInChannels.includes(channel)) return false;
    if (h.type === 'pickup' && h.itemId && inventory.includes(h.itemId)) return false;
    return true;
  });

  const handleChannelChange = (ch: EchoChannel) => {
    soundEngine.initOnUserGesture();
    setChannel(ch);
  };

  const handleStepClick = (step: GuideStep) => {
    soundEngine.initOnUserGesture();
    if (
      step.channelHint &&
      channel !== step.channelHint &&
      inventory.includes('sintonizador_ecos')
    ) {
      setChannel(step.channelHint);
    }
    if (step.hotspotId) {
      setFocusedHotspotId(step.hotspotId);
      const targetHotspot = sceneDef.hotspots.find((h) => h.id === step.hotspotId);
      if (targetHotspot) {
        interactWithHotspot(targetHotspot);
      }
    }
  };

  return (
    <div className="game-layout">
      {/* 1. CABECERA SUPERIOR DEDICADA (Sin superposición con el 3D) */}
      <header className="hud-header">
        <div className="hud-location">
          <div className="hud-location__title-row">
            <span className="hud-location__act">{sceneDef.actTitle}</span>
            <h2 className="hud-location__title">{sceneDef.title}</h2>
          </div>

          <nav className="hud-minimap" aria-label="Mapa de las 6 salas de la estación">
            {mapNodes.map((node) => {
              const isCurrent = node.id === currentScene;
              return (
                <button
                  key={node.id}
                  type="button"
                  className={`hud-minimap__node ${
                    isCurrent ? 'is-current' : ''
                  } ${node.completed ? 'is-completed' : ''} ${
                    !node.unlocked ? 'is-locked' : ''
                  }`}
                  disabled={!node.unlocked}
                  onClick={() => {
                    if (node.unlocked && !isCurrent) {
                      soundEngine.initOnUserGesture();
                      enterScene(node.id);
                    }
                  }}
                  title={
                    node.unlocked
                      ? `Ir a ${node.shortName}`
                      : `${node.shortName} (Aún bloqueada)`
                  }
                >
                  <span>{node.shortName}</span>
                  <small>
                    {isCurrent
                      ? '● AQUÍ'
                      : node.completed
                        ? '✓'
                        : node.unlocked
                          ? 'Abierta'
                          : '🔒'}
                  </small>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="hud-btn hud-btn--guide"
            onClick={() => setActiveModal({ type: 'briefing' })}
          >
            ¿Qué hacer? / Misión
          </button>

          <button
            type="button"
            className="hud-btn"
            onClick={() =>
              setActiveModal({ type: 'dossier', initialDossierTab: 'documents' })
            }
            title="Atajo: Tecla Tab"
          >
            Expediente ({documentsFound.length}/8 Docs · {transcriptsFound.length}/3 Cintas)
          </button>

          <button
            type="button"
            className="hud-btn hud-btn--hint"
            onClick={() => setActiveModal({ type: 'hints' })}
            title="Solicitar pista gradual"
          >
            Pistas
          </button>

          <button
            type="button"
            className="hud-btn"
            onClick={() => setActiveModal({ type: 'options' })}
          >
            Opciones
          </button>

          <button
            type="button"
            className="hud-btn hud-btn--Ghost"
            onClick={returnToMainMenu}
          >
            Menú
          </button>
        </div>
      </header>

      {/* 2. CUERPO CENTRAL EN DOS COLUMNAS SEPARADAS: Barra Lateral Izquierda + Visor 3D Limpio */}
      <div className="game-main-area">
        {/* Columna izquierda dedicada: Guía Paso a Paso + Inspección + Equipo */}
        <aside className="hud-sidebar scroller" aria-label="Panel de guía e inspección">
          <section className="hud-step-checklist">
            <div className="hud-step-checklist__header">
              <span>GUÍA PASO A PASO</span>
              <small>Haz clic en un paso</small>
            </div>
            <ul className="hud-step-checklist__list">
              {guideSteps.map((step) => {
                const isNext = step.id === firstPendingStepId;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      className={`hud-step-btn ${
                        step.completed
                          ? 'is-done'
                          : isNext
                            ? 'is-next'
                            : 'is-pending'
                      }`}
                      onMouseEnter={() => {
                        if (step.hotspotId) setFocusedHotspotId(step.hotspotId);
                      }}
                      onMouseLeave={() => setFocusedHotspotId(null)}
                      onClick={() => handleStepClick(step)}
                    >
                      <span className="hud-step-btn__icon" aria-hidden="true">
                        {step.completed ? '✓' : isNext ? '►' : '○'}
                      </span>
                      <span className="hud-step-btn__text">{step.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Tarjeta de observación / detalle del objeto seleccionado */}
          <section className="hud-inspection-card" aria-live="polite">
            <div className="hud-inspection-card__header">
              <h3>
                {inspectionMessage
                  ? inspectionMessage.title
                  : 'Observación de la Sala'}
              </h3>
            </div>
            <p className="hud-inspection-card__body">
              {inspectionMessage
                ? inspectionMessage.body
                : sceneDef.ambientDescription[channel]}
            </p>
          </section>

          {/* Inventario (máximo 4 objetos relevantes) */}
          <section className="inventory-strip" aria-label="Inventario técnico (máx. 4)">
            <span className="inventory-strip__title">
              TU EQUIPO ({inventory.length}/4)
            </span>
            <div className="inventory-strip__slots">
              {[0, 1, 2, 3].map((slotIdx) => {
                const itemId = inventory[slotIdx];
                const item = itemId ? INVENTORY_CATALOG[itemId] : null;
                return (
                  <button
                    key={slotIdx}
                    type="button"
                    className={`inventory-slot ${item ? 'is-filled' : ''}`}
                    disabled={!item}
                    onClick={() => {
                      if (item) {
                        gameState.setInspectionMessage({
                          title: item.name,
                          body: item.description,
                        });
                      }
                    }}
                  >
                    {item ? `✓ ${item.name}` : 'Ranura vacía'}
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        {/* Visor 3D dedicado y despejado (sin cajas de texto flotantes encima) */}
        <main className="game-viewport-column">
          <div className="viewport-canvas-wrapper">
            <FacilityCanvas />

            {/* Banner compacto en la parte superior del visor cuando enfocas un objeto */}
            {focusedHotspot && (
              <div className="hud-reticle-banner" role="status" aria-live="polite">
                <span className="hud-reticle-banner__name">
                  {focusedHotspot.label}
                </span>
                <span className="hud-reticle-banner__action">
                  {focusedHotspot.actionLabel} [Clic / E]
                </span>
              </div>
            )}

            {/* Subtítulos en la base del visor 3D */}
            {settings.subtitles && subtitleCue && (
              <div
                key={subtitleCue.id}
                className={`hud-subtitle ${
                  subtitleCue.isParanormal ? 'hud-subtitle--paranormal' : ''
                }`}
                role="region"
                aria-label="Subtítulos acústicos"
              >
                <span className="hud-subtitle__meta">
                  {subtitleCue.source}
                  {subtitleCue.direction
                    ? ` · [${subtitleCue.direction.toUpperCase()}]`
                    : ''}
                </span>
                <p className="hud-subtitle__text">{subtitleCue.text}</p>
              </div>
            )}
          </div>

          {/* 3. BARRA INFERIOR DE CONTROLES (Sintonizador + Botones directos de la sala) */}
          <footer className="hud-footer">
            <section
              className={`tuner-widget ${!hasTuner ? 'tuner-widget--locked' : ''}`}
              aria-label="Sintonizador de Ecos"
            >
              <div className="tuner-widget__header">
                <span className="tuner-widget__title">
                  SINTONIZADOR DE ECOS SE-99
                </span>
                <span className="tuner-widget__status">
                  {hasTuner
                    ? `CANAL ACTIVO: ${channel}`
                    : 'SE OBTIENE EN SALA 2 (VIGILANCIA)'}
                </span>
              </div>

              <div
                className="tuner-widget__channels"
                role="group"
                aria-label="Canales acústicos"
              >
                <button
                  type="button"
                  className={`tuner-channel-btn ${channel === 'A' ? 'is-active' : ''}`}
                  onClick={() => handleChannelChange('A')}
                  aria-pressed={channel === 'A'}
                >
                  <span className="tuner-channel-btn__code">Canal A [1]</span>
                  <span className="tuner-channel-btn__desc">Registro · 440 Hz</span>
                </button>

                <button
                  type="button"
                  className={`tuner-channel-btn tuner-channel-btn--b ${
                    channel === 'B' ? 'is-active' : ''
                  }`}
                  onClick={() => handleChannelChange('B')}
                  disabled={!hasTuner}
                  aria-pressed={channel === 'B'}
                >
                  <span className="tuner-channel-btn__code">Canal B [2]</span>
                  <span className="tuner-channel-btn__desc">Residuo · 432 Hz</span>
                </button>

                <button
                  type="button"
                  className={`tuner-channel-btn tuner-channel-btn--c ${
                    channel === 'C' ? 'is-active' : ''
                  }`}
                  onClick={() => handleChannelChange('C')}
                  disabled={!hasTuner}
                  aria-pressed={channel === 'C'}
                >
                  <span className="tuner-channel-btn__code">Canal C [3]</span>
                  <span className="tuner-channel-btn__desc">
                    Discordancia · 417 Hz
                  </span>
                </button>
              </div>
            </section>

            <section
              className="scene-hotspots-bar"
              aria-label="Puntos interactivos de la sala"
            >
              <span className="scene-hotspots-bar__label">
                INTERACTUAR CON OBJETOS DE ESTA SALA:
              </span>
              <div className="scene-hotspots-bar__list">
                {visibleHotspots.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={`scene-hotspot-pill scene-hotspot-pill--${h.type}`}
                    onMouseEnter={() => setFocusedHotspotId(h.id)}
                    onMouseLeave={() => setFocusedHotspotId(null)}
                    onClick={() => {
                      soundEngine.initOnUserGesture();
                      interactWithHotspot(h);
                    }}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </section>
          </footer>
        </main>
      </div>
    </div>
  );
}

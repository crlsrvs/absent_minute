import { useEffect, useState } from 'react';
import { useGameStore } from './core/store';
import { gameEventBus } from './core/events';
import { SCENES_DATA } from './narrative/scenesData';
import { MainMenu } from './ui/MainMenu';
import { HUD } from './ui/HUD';
import { IntroBriefingModal } from './ui/IntroBriefingModal';
import { DossierModal } from './ui/DossierModal';
import { PuzzleModal } from './ui/PuzzleModal';
import { HintAndOptionsModal } from './ui/HintAndOptionsModal';
import { EndingScreen } from './ui/EndingScreen';
import { soundEngine } from './audio/soundEngine';

export function App() {
  const started = useGameStore((s) => s.started);
  const endingReached = useGameStore((s) => s.endingReached);
  const activeModal = useGameStore((s) => s.activeModal);
  const currentScene = useGameStore((s) => s.currentScene);
  const focusedHotspotId = useGameStore((s) => s.focusedHotspotId);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const initFromStorage = useGameStore((s) => s.initFromStorage);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setChannel = useGameStore((s) => s.setChannel);
  const interactWithHotspot = useGameStore((s) => s.interactWithHotspot);

  const [transitionType, setTransitionType] = useState<'none' | 'room' | 'channel'>(
    'none'
  );

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  // Transiciones audiovisuales suaves al cambiar de sala o de canal acústico
  useEffect(() => {
    if (reducedMotion) return;

    const unsubRoom = gameEventBus.on('ROOM_ENTERED', () => {
      setTransitionType('room');
      const timer = window.setTimeout(() => setTransitionType('none'), 380);
      return () => window.clearTimeout(timer);
    });

    const unsubChannel = gameEventBus.on('CHANNEL_CHANGED', () => {
      setTransitionType('channel');
      const timer = window.setTimeout(() => setTransitionType('none'), 260);
      return () => window.clearTimeout(timer);
    });

    return () => {
      unsubRoom();
      unsubChannel();
    };
  }, [reducedMotion]);

  // Atajos de teclado globales (E, Tab, Escape, 1/2/3 para el Sintonizador)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal.type !== 'none') {
          e.preventDefault();
          setActiveModal({ type: 'none' });
        }
        return;
      }

      if (!started || endingReached) return;

      if (e.key === 'Tab' && activeModal.type === 'none') {
        e.preventDefault();
        setActiveModal({ type: 'dossier', initialDossierTab: 'documents' });
        return;
      }

      if (activeModal.type !== 'none') return;

      if (e.key === '1') {
        soundEngine.initOnUserGesture();
        setChannel('A');
      } else if (e.key === '2') {
        soundEngine.initOnUserGesture();
        setChannel('B');
      } else if (e.key === '3') {
        soundEngine.initOnUserGesture();
        setChannel('C');
      } else if ((e.key === 'e' || e.key === 'E') && focusedHotspotId) {
        const hotspot = SCENES_DATA[currentScene].hotspots.find(
          (h) => h.id === focusedHotspotId
        );
        if (hotspot) {
          soundEngine.initOnUserGesture();
          interactWithHotspot(hotspot);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    started,
    endingReached,
    activeModal.type,
    focusedHotspotId,
    currentScene,
    setActiveModal,
    setChannel,
    interactWithHotspot,
  ]);

  if (endingReached) {
    return <EndingScreen />;
  }

  return (
    <div className="app-shell">
      {!started ? (
        <MainMenu />
      ) : (
        <>
          <HUD />
          {transitionType !== 'none' && (
            <div
              className={`scene-transition-veil scene-transition-veil--${transitionType}`}
              aria-hidden="true"
            />
          )}
        </>
      )}

      {activeModal.type === 'briefing' && <IntroBriefingModal />}
      {activeModal.type === 'dossier' && <DossierModal />}
      {activeModal.type === 'puzzle' && <PuzzleModal />}
      {(activeModal.type === 'hints' ||
        activeModal.type === 'options' ||
        activeModal.type === 'credits') && <HintAndOptionsModal />}
    </div>
  );
}

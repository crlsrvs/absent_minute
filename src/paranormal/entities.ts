import { EchoChannel, EntityType, PuzzleId, SceneId } from '../core/types';

export type EntityFSMState = 'DORMANT' | 'MANIFESTING' | 'ACTIVE_LOOP' | 'STABILIZED';

export interface ParanormalEntityDefinition {
  id: string;
  name: string;
  type: EntityType;
  scene: SceneId;
  activeChannels: EchoChannel[];
  behaviors: string[];
  audiovisualCues: {
    visual: string;
    audio: string;
  };
  deactivationRule: string;
}

export const PARANORMAL_ENTITIES: Record<string, ParanormalEntityDefinition> = {
  testigo_archivo: {
    id: 'testigo_archivo',
    name: 'El Testigo del Archivo',
    type: 'testigo',
    scene: 'archivo',
    activeChannels: ['B', 'C'],
    behaviors: [
      'Permanece completamente inmóvil frente al gavetero falsificado.',
      'No persigue ni ataca al jugador.',
      'Atenúa el ruido ambiental de la sala cuando se sintoniza el Canal B.',
      'Señala la ubicación del Memorando sobre la Eliminación del Minuto (Doc 07).',
    ],
    audiovisualCues: {
      visual: 'Contorno humano sin profundidad compuesto de polvo suspendido y vacío óptico.',
      audio: 'Reducción localizada del zumbido eléctrico y textura hueca de absorción acústica.',
    },
    deactivationRule: 'Se disuelve al regresar al Canal A (Registro) o al estabilizar la estación.',
  },
  residual_laboratorio: {
    id: 'residual_laboratorio',
    name: 'Residual de Mateo Soria',
    type: 'residual',
    scene: 'laboratorio',
    activeChannels: ['B', 'C'],
    behaviors: [
      'Repite en bucle un desplazamiento corto entre el oscilógrafo y los cinco diales.',
      'Sus extremidades presentan un ligero desfase temporal respecto al torso.',
      'Permite al jugador observar la cadencia de calibración sin hostilidad.',
    ],
    audiovisualCues: {
      visual: 'Silueta semitransparente de partículas oscuras con estela cinética desfasada.',
      audio: 'Pasos amortiguados con eco invertido y chasquidos de diales.',
    },
    deactivationRule: 'Permanece en su bucle de memoria en el Canal B; no es visible en el Canal A.',
  },
  residual_pasillo: {
    id: 'residual_pasillo',
    name: 'Eco Residual del Propio Jugador',
    type: 'residual',
    scene: 'pasillo',
    activeChannels: ['B', 'C'],
    behaviors: [
      'Reproduce con cuatro segundos de retraso la entrada del jugador al corredor.',
      'Gira hacia la Esclusa de Mantenimiento lateral en el Canal B, revelando la ruta del Tramo 2.',
    ],
    audiovisualCues: {
      visual: 'Figura de partículas oscuras que replica el ritmo de marcha del protagonista.',
      audio: 'Tus propios pasos reproducidos con retraso sobre el hormigón.',
    },
    deactivationRule: 'Se estabiliza una vez resuelto el Puzle 4 (El pasillo discontinuo).',
  },
  el_contador: {
    id: 'el_contador',
    name: 'El Contador',
    type: 'contador',
    scene: 'camara',
    activeChannels: ['A', 'B', 'C'],
    behaviors: [
      'Carece de forma corpórea humana o monstruosa.',
      'En el Vestíbulo hace arrancar brevemente el reloj detenido cuando el jugador desvía la mirada.',
      'Incrementa su presencia rítmica a medida que se resuelven acertijos y se acercan los registros a la verdad de las 02:16.',
      'Proyecta marcas numéricas incandescentes (02:16:12, 02:16:33, 02:16:48) en el Canal C.',
    ],
    audiovisualCues: {
      visual: 'Sincronización súbita de agujas horarias, vibración de péndulos y marcas numéricas luminosas.',
      audio: 'Golpes metálicos síncronos y silencios abruptos de corte de cinta.',
    },
    deactivationRule: 'Solo concluye al elegir uno de los dos desenlaces en la Cámara de Sincronización.',
  },
};

export function evaluateEntityFSM(
  entityId: string,
  currentScene: SceneId,
  channel: EchoChannel,
  puzzlesSolved: ReadonlyArray<PuzzleId>
): EntityFSMState {
  const def = PARANORMAL_ENTITIES[entityId];
  if (!def) return 'DORMANT';

  if (entityId === 'el_contador') {
    if (puzzlesSolved.includes('reconstruir_minuto')) {
      return 'STABILIZED';
    }
    if (channel === 'C' || currentScene === 'camara') {
      return 'ACTIVE_LOOP';
    }
    if (puzzlesSolved.length >= 2) {
      return 'MANIFESTING';
    }
    return 'DORMANT';
  }

  if (def.scene !== currentScene) {
    return 'DORMANT';
  }

  if (!def.activeChannels.includes(channel)) {
    return 'DORMANT';
  }

  if (entityId === 'residual_pasillo' && puzzlesSolved.includes('pasillo_discontinuo')) {
    return 'STABILIZED';
  }

  return channel === 'B' ? 'ACTIVE_LOOP' : 'MANIFESTING';
}

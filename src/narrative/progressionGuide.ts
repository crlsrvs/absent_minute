import { GameState, SceneId } from '../core/types';

export interface GuideStep {
  id: string;
  text: string;
  completed: boolean;
  hotspotId?: string;
  channelHint?: 'A' | 'B' | 'C';
}

export interface RoomMapNode {
  id: SceneId;
  number: number;
  shortName: string;
  unlocked: boolean;
  completed: boolean;
}

export function getSceneGuideSteps(state: GameState): GuideStep[] {
  const {
    currentScene,
    inventory,
    documentsFound,
    transcriptsFound,
    puzzlesSolved,
    channel,
    flags,
  } = state;

  switch (currentScene) {
    case 'vestibulo': {
      const hasCred = inventory.includes('credencial_acceso');
      const readActa = documentsFound.includes('doc_04_acta_suspension');
      const solvedCircuit = puzzlesSolved.includes('circuito_emergencia');

      return [
        {
          id: 'vest_step_1',
          text: '1. Recoge la «Credencial de Turno» sobre el mostrador izquierdo.',
          completed: hasCred,
          hotspotId: 'vest_mostrador_credencial',
        },
        {
          id: 'vest_step_2',
          text: '2. Lee el «Acta de Suspensión» en el tablón izquierdo (indica los voltajes 12V + 8V + 4V).',
          completed: readActa,
          hotspotId: 'vest_acta_clausura',
        },
        {
          id: 'vest_step_3',
          text: '3. Abre el «Cuadro de Circuito de Emergencia» y activa los disyuntores B1 (12V), B3 (8V) y B4 (4V) para sumar 24V.',
          completed: solvedCircuit,
          hotspotId: 'vest_panel_electrico',
        },
        {
          id: 'vest_step_4',
          text: '4. Cruza la «Puerta Blindada» central hacia la Sala de Vigilancia.',
          completed: state.visitedScenes.includes('vigilancia'),
          hotspotId: 'vest_puerta_vigilancia',
        },
      ];
    }

    case 'vigilancia': {
      const hasTuner = inventory.includes('sintonizador_ecos');
      const readLog = documentsFound.includes('doc_01_registro_turno');
      const switchedToB = channel === 'B' || transcriptsFound.includes('rec_01_pasos_anticipados');
      const solvedMonitors = puzzlesSolved.includes('registros_incompatibles');
      const hasKey = inventory.includes('llave_archivo');

      return [
        {
          id: 'vig_step_1',
          text: '1. Recoge el «Sintonizador de Ecos SE-99» en el maletín sobre la mesa izquierda.',
          completed: hasTuner,
          hotspotId: 'vig_sintonizador',
        },
        {
          id: 'vig_step_2',
          text: '2. Lee el «Libro de Guardia Nocturna» sobre la mesa central.',
          completed: readLog,
          hotspotId: 'vig_bitacora_turno',
        },
        {
          id: 'vig_step_3',
          text: '3. Cambia al «Canal B (Residuo · 432 Hz)» abajo a la izquierda o con la tecla [2] y escucha el Magnetófono.',
          completed: switchedToB && transcriptsFound.includes('rec_01_pasos_anticipados'),
          hotspotId: 'vig_cinta_pasos',
          channelHint: 'B',
        },
        {
          id: 'vig_step_4',
          text: '4. En el «Banco de Monitores», registra la contradicción (CAM-04 · Canal B · 02:16).',
          completed: solvedMonitors,
          hotspotId: 'vig_consola_monitores',
        },
        {
          id: 'vig_step_5',
          text: '5. Recoge la «Llave de Esclusa Documental» en el archivador derecho y entra al Archivo.',
          completed: hasKey && state.visitedScenes.includes('archivo'),
          hotspotId: hasKey ? 'vig_puerta_archivo' : 'vig_archivador_llave',
        },
      ];
    }

    case 'archivo': {
      const readClara = documentsFound.includes('doc_03_nota_trabajador');
      const seenWitness = Boolean(flags.witness_seen_archivo);
      const readMemo = documentsFound.includes('doc_07_memorando_eliminacion');

      return [
        {
          id: 'arc_step_1',
          text: '1. Lee la «Nota Privada de Clara Vega» en el escritorio izquierdo.',
          completed: readClara,
          hotspotId: 'arc_nota_clara',
        },
        {
          id: 'arc_step_2',
          text: '2. Activa el «Canal B (Residuo)» [Tecla 2] y observa la silueta de «El Testigo» junto a las estanterías derechas.',
          completed: seenWitness || readMemo,
          hotspotId: 'arc_entidad_testigo',
          channelHint: 'B',
        },
        {
          id: 'arc_step_3',
          text: '3. En Canal B, inspecciona el «Gavetero Señalado por el Testigo» para obtener el Memorando 0216.',
          completed: readMemo,
          hotspotId: 'arc_memorando_oculto',
          channelHint: 'B',
        },
        {
          id: 'arc_step_4',
          text: '4. Cruza la «Puerta Norte» central hacia el Laboratorio de Calibración.',
          completed: state.visitedScenes.includes('laboratorio'),
          hotspotId: 'arc_puerta_laboratorio',
        },
      ];
    }

    case 'laboratorio': {
      const readCalib = documentsFound.includes('doc_02_informe_calibracion');
      const heardTape2 = transcriptsFound.includes('rec_02_impulsos_calibracion');
      const readResidual = documentsFound.includes('doc_05_reporte_residual');
      const solvedCalib = puzzlesSolved.includes('secuencia_calibracion');
      const hasReel = inventory.includes('bobina_maestra');

      return [
        {
          id: 'lab_step_1',
          text: '1. Lee el «Informe de Calibración» en el atril izquierdo y escucha la «Grabación 02» (patrón 3-1-4-2-5).',
          completed: readCalib && heardTape2,
          hotspotId: !readCalib ? 'lab_informe_calibracion' : 'lab_grabadora_impulsos',
        },
        {
          id: 'lab_step_2',
          text: '2. Cambia a «Canal B (Residuo)» [Tecla 2] para observar al Residual de Mateo Soria y recoger su reporte (Doc 05).',
          completed: readResidual,
          hotspotId: 'lab_entidad_residual',
          channelHint: 'B',
        },
        {
          id: 'lab_step_3',
          text: '3. En el «Oscilógrafo Central», introduce la secuencia armónica 3 — 1 — 4 — 2 — 5.',
          completed: solvedCalib,
          hotspotId: 'lab_consola_frecuencias',
        },
        {
          id: 'lab_step_4',
          text: '4. Recoge la «Bobina Maestra 02:16» en la cámara de vacío derecha y avanza al Pasillo Discontinuo.',
          completed: hasReel && state.visitedScenes.includes('pasillo'),
          hotspotId: hasReel ? 'lab_puerta_pasillo' : 'lab_bobina_maestra',
        },
      ];
    }

    case 'pasillo': {
      const readSpatial = documentsFound.includes('doc_06_contradiccion_espacial');
      const seenEcho = Boolean(flags.corridor_echo_seen);
      const solvedCorridor = puzzlesSolved.includes('pasillo_discontinuo');

      return [
        {
          id: 'pas_step_1',
          text: '1. Lee el «Registro de Contradicción Espacial» en el pupitre izquierdo (explica la ruta de los 3 tramos).',
          completed: readSpatial,
          hotspotId: 'pas_doc_contradiccion',
        },
        {
          id: 'pas_step_2',
          text: '2. En «Canal B (Residuo)» [Tecla 2], observa el «Rastro Residual en la Esclusa» a la derecha.',
          completed: seenEcho || solvedCorridor,
          hotspotId: 'pas_eco_propio',
          channelHint: 'B',
        },
        {
          id: 'pas_step_3',
          text: '3. En el «Estabilizador del Corredor», configura: Tramo 1 (Canal A · Puerta Norte), Tramo 2 (Canal B · Esclusa Lateral), Tramo 3 (Canal C · Umbral).',
          completed: solvedCorridor,
          hotspotId: 'pas_consola_transito',
        },
        {
          id: 'pas_step_4',
          text: '4. Atraviesa el «Umbral de Sincronía» hacia la Cámara Central.',
          completed: state.visitedScenes.includes('camara'),
          hotspotId: 'pas_puerta_camara',
        },
      ];
    }

    case 'camara': {
      const readProtocol = documentsFound.includes('doc_08_transcripcion_incidente');
      const heardFinalTape = transcriptsFound.includes('rec_03_corte_sincronia');
      const solvedFinal = puzzlesSolved.includes('reconstruir_minuto');

      return [
        {
          id: 'cam_step_1',
          text: '1. Lee la «Transcripción Final del Incidente» en el atril izquierdo.',
          completed: readProtocol,
          hotspotId: 'cam_doc_protocolo',
        },
        {
          id: 'cam_step_2',
          text: '2. Cambia a «Canal C (Discordancia · 417 Hz)» [Tecla 3] y escucha la «Caja Negra de Sincronía» a la derecha.',
          completed: heardFinalTape,
          hotspotId: 'cam_grabacion_final',
          channelHint: 'C',
        },
        {
          id: 'cam_step_3',
          text: '3. En la «Consola Central», ordena los 3 hitos (:12 Resonancia → :33 Esclusa → :48 Exclusión) y elige el desenlace final.',
          completed: solvedFinal,
          hotspotId: 'cam_consola_final',
        },
      ];
    }
  }
}

export function getBuildingMapNodes(state: GameState): RoomMapNode[] {
  const { puzzlesSolved, inventory } = state;
  const vigUnlocked = puzzlesSolved.includes('circuito_emergencia');
  const arcUnlocked =
    puzzlesSolved.includes('registros_incompatibles') &&
    inventory.includes('llave_archivo');
  const labUnlocked = arcUnlocked;
  const pasUnlocked = puzzlesSolved.includes('secuencia_calibracion');
  const camUnlocked = puzzlesSolved.includes('pasillo_discontinuo');

  return [
    {
      id: 'vestibulo',
      number: 1,
      shortName: '1. Vestíbulo',
      unlocked: true,
      completed: vigUnlocked,
    },
    {
      id: 'vigilancia',
      number: 2,
      shortName: '2. Vigilancia',
      unlocked: vigUnlocked,
      completed: arcUnlocked,
    },
    {
      id: 'archivo',
      number: 3,
      shortName: '3. Archivo',
      unlocked: arcUnlocked,
      completed: state.documentsFound.includes('doc_07_memorando_eliminacion'),
    },
    {
      id: 'laboratorio',
      number: 4,
      shortName: '4. Laboratorio',
      unlocked: labUnlocked,
      completed: pasUnlocked && inventory.includes('bobina_maestra'),
    },
    {
      id: 'pasillo',
      number: 5,
      shortName: '5. Pasillo',
      unlocked: pasUnlocked,
      completed: camUnlocked,
    },
    {
      id: 'camara',
      number: 6,
      shortName: '6. Cámara Final',
      unlocked: camUnlocked,
      completed: puzzlesSolved.includes('reconstruir_minuto'),
    },
  ];
}

import { SceneDefinition, SceneId } from '../core/types';

export const SCENES_DATA: Record<SceneId, SceneDefinition> = {
  vestibulo: {
    id: 'vestibulo',
    act: 1,
    actTitle: 'Acto I — El edificio que todavía trabaja',
    title: 'Escena 1: Vestíbulo de Recepción',
    subtitle: 'Estación Municipal de Sincronía Horaria N.º 4 — 02:15 h',
    objective:
      'Inspecciona el vestíbulo, localiza la credencial de turno y restaura los 24V del circuito de emergencia para acceder a la Sala de Vigilancia.',
    ambientDescription: {
      A: 'La luz ámbar de emergencia recorta el hormigón húmedo. El gran reloj patrón sobre el mostrador marca las 02:15:59 con el segundero inmóvil.',
      B: 'En la frecuencia de Residuo (432 Hz), el aire huele a ozono antiguo. Se escuchan pasos apresurados que cruzan el vestíbulo aunque no hay nadie.',
      C: 'En Discordancia (417 Hz), las agujas del reloj patrón vibran entre las 02:15 y las 02:17 al mismo tiempo.',
    },
    hotspots: [
      {
        id: 'vest_reloj_patron',
        label: 'Reloj Patrón Municipal',
        actionLabel: 'Inspeccionar reloj detenido',
        position: [0, 2.3, -4.6],
        type: 'inspect',
        descriptions: {
          A: 'Las agujas de latón están clavadas en las 02:15:59. Cuando apartas la vista un instante, jurarías haber oído escapar un único diente del engranaje.',
          B: 'Bajo el Canal B, el cristal empañado muestra una marca grabada desde dentro: «02:16:12 — NO MIRAR CUANDO CUENTA».',
          C: 'Las agujas se desdoblan en dos sombras superpuestas: 02:15 y 02:17 latiendo a la vez.',
        },
      },
      {
        id: 'vest_mostrador_credencial',
        label: 'Mostrador de Recepción',
        actionLabel: 'Recoger Credencial de Turno',
        position: [-1.8, 0.9, -2.5],
        type: 'pickup',
        itemId: 'credencial_acceso',
        descriptions: {
          A: 'Sobre el secante verde descansa la Credencial de Turno Nocturno de Arturo Méndez. Todavía está tibia.',
          B: 'El eco acústico conserva el golpe metálico de alguien dejando la tarjeta con prisa.',
          C: 'El número de serie de la credencial parpadea bajo la interferencia.',
        },
      },
      {
        id: 'vest_acta_clausura',
        label: 'Tablón de Avisos Oficiales',
        actionLabel: 'Leer Acta de Suspensión (Doc 04)',
        position: [-3.4, 1.5, -1.8],
        type: 'document',
        documentId: 'doc_04_acta_suspension',
        descriptions: {
          A: 'Un documento sellado en 1999 declara la clausura inmediata de la estación y detalla los valores del cuadro eléctrico auxiliar (12V, 8V y 4V).',
        },
      },
      {
        id: 'vest_plano_edificio',
        label: 'Plano Arquitectónico de la EMSH-4',
        actionLabel: 'Examinar distribución de salas',
        position: [3.3, 1.6, -2.2],
        type: 'inspect',
        descriptions: {
          A: 'El plano muestra seis sectores: 1. Vestíbulo, 2. Sala de Vigilancia, 3. Archivo Documental, 4. Laboratorio de Calibración, 5. Pasillo Norte y 6. Cámara de Sincronización.',
          B: 'Sobre el acrílico aparece trazada una línea discontinua que atraviesa el muro del Pasillo Norte hacia una esclusa no declarada.',
          C: 'Las cotas métricas del pasillo norte se superponen: «18 m / 74 m».',
        },
      },
      {
        id: 'vest_panel_electrico',
        label: 'Cuadro de Circuito de Emergencia',
        actionLabel: 'Manipular disyuntores (Puzle 1)',
        position: [2.4, 1.3, -4.4],
        type: 'puzzle',
        puzzleId: 'circuito_emergencia',
        descriptions: {
          A: 'Panel de alimentación auxiliar de 24V. Controla el solenoide de apertura hacia la Sala de Vigilancia.',
        },
      },
      {
        id: 'vest_puerta_vigilancia',
        label: 'Puerta Blindada — Sala de Vigilancia',
        actionLabel: 'Entrar a la Sala de Vigilancia',
        position: [0, 1.2, -4.7],
        type: 'door',
        targetScene: 'vigilancia',
        requiredPuzzleForDoor: 'circuito_emergencia',
        descriptions: {
          A: 'Puerta de acero con cerradura electromagnética de 24V que conduce a la Sala de Vigilancia.',
        },
      },
    ],
  },

  vigilancia: {
    id: 'vigilancia',
    act: 1,
    actTitle: 'Acto I — El edificio que todavía trabaja',
    title: 'Escena 2: Sala de Vigilancia',
    subtitle: 'Control de Circuito Cerrado y Bitácoras',
    objective:
      'Obtén el Sintonizador de Ecos SE-99, revisa los registros de turno y resuelve la contradicción del monitor CAM-04 para abrir el archivador de llaves.',
    ambientDescription: {
      A: 'Cuatro monitores de fósforo verde parpadean en penumbra. En el Canal A (Registro), el monitor CAM-04 muestra un pasillo vacío con la hora congelada en 02:15.',
      B: 'En el Canal B (Residuo), el monitor CAM-04 revela una silueta cruzando hacia el Archivo con el código de tiempo 02:16:12.',
      C: 'En el Canal C (Discordancia), los monitores superponen la sala vacía y la figura en tránsito mientras un golpe seco resuena tras el cristal.',
    },
    hotspots: [
      {
        id: 'vig_sintonizador',
        label: 'Maletín Técnico Experimental',
        actionLabel: 'Recoger Sintonizador de Ecos SE-99',
        position: [-2.2, 1.0, -2.6],
        type: 'pickup',
        itemId: 'sintonizador_ecos',
        descriptions: {
          A: 'Un receptor de latón y baquelita con tres selectores de frecuencia: Canal A (Registro), Canal B (Residuo) y Canal C (Discordancia).',
        },
      },
      {
        id: 'vig_bitacora_turno',
        label: 'Libro de Guardia Nocturna',
        actionLabel: 'Leer Registro de Turno (Doc 01)',
        position: [-0.6, 0.95, -2.8],
        type: 'document',
        documentId: 'doc_01_registro_turno',
        descriptions: {
          A: 'El parte oficial firmado por Arturo Méndez afirma que nadie entró al sector de la Cámara 04 y que el reloj pasó de 02:15 a 02:17.',
        },
      },
      {
        id: 'vig_cinta_pasos',
        label: 'Magnetófono de Respaldo (Canal B)',
        actionLabel: 'Escuchar Grabación 01 (Pasos anticipados)',
        position: [1.9, 1.05, -2.7],
        visibleInChannels: ['B', 'C'],
        type: 'transcript',
        transcriptId: 'rec_01_pasos_anticipados',
        descriptions: {
          A: 'Un carrete aparentemente vacío.',
          B: 'En el Canal B la cinta gira sola: reproduce pasos que anteceden a la apertura de la puerta y menciona la anomalía en CAM-04 a las 02:16.',
          C: 'Los doce golpes de El Contador saturan el vúmetro analógico.',
        },
      },
      {
        id: 'vig_consola_monitores',
        label: 'Banco de Monitores y Verificador',
        actionLabel: 'Contrastar registros (Puzle 2)',
        position: [0.2, 1.5, -4.3],
        type: 'puzzle',
        puzzleId: 'registros_incompatibles',
        descriptions: {
          A: 'En Canal A (Registro), las cámaras CAM-01 a CAM-04 muestran pasillos desiertos a las 02:15 y 02:17.',
          B: '¡Anomalía detectada! En el Canal B (Residuo), el monitor CAM-04 muestra claramente a Mateo Soria en el pasillo norte con marca horaria 02:16.',
          C: 'La imagen de CAM-04 tiembla entre el pasillo vacío (02:15) y la figura de Soria (02:16).',
        },
      },
      {
        id: 'vig_archivador_llave',
        label: 'Archivador de Seguridad Desbloqueado',
        actionLabel: 'Recoger Llave de Esclusa Documental',
        position: [3.1, 1.2, -3.2],
        type: 'pickup',
        itemId: 'llave_archivo',
        descriptions: {
          A: 'Contiene la Llave de Esclusa Documental necesaria para abrir el Archivo Documental y el Laboratorio de Calibración.',
        },
      },
      {
        id: 'vig_puerta_vestibulo',
        label: 'Puerta Sur — Regresar al Vestíbulo',
        actionLabel: 'Volver al Vestíbulo',
        position: [-3.6, 1.2, -1.0],
        type: 'door',
        targetScene: 'vestibulo',
        descriptions: {
          A: 'Comunica de vuelta con el Vestíbulo de Recepción.',
        },
      },
      {
        id: 'vig_puerta_archivo',
        label: 'Puerta Este — Archivo Documental',
        actionLabel: 'Entrar al Archivo Documental',
        position: [3.6, 1.2, -1.2],
        type: 'door',
        targetScene: 'archivo',
        requiredPuzzleForDoor: 'registros_incompatibles',
        requiredItemForDoor: 'llave_archivo',
        descriptions: {
          A: 'Conduce al Archivo Documental (Acto II). Requiere haber verificado los registros incompatibles y portar la Llave de Esclusa.',
        },
      },
    ],
  },

  archivo: {
    id: 'archivo',
    act: 2,
    actTitle: 'Acto II — Los registros no coinciden',
    title: 'Escena 3: Archivo Documental',
    subtitle: 'Depósito de Expedientes y Cronologías Clasificadas',
    objective:
      'Investiga los ficheros, observa la manifestación del Testigo junto al armario censurado en Canal B y recupera el Memorando sobre la eliminación del minuto.',
    ambientDescription: {
      A: 'Hileras de estanterías metálicas guardan miles de cintas perforadas. Todo parece inmóvil bajo la luz fría.',
      B: 'En el Canal B, el ruido de ventilación se apaga de golpe en el rincón izquierdo: una silueta de polvo suspendido —un Testigo— señala en silencio un cajón falsificado.',
      C: 'En el Canal C, los folios caídos flotan a escasos centímetros del suelo y los relojes de pared marcan fechas contradictorias.',
    },
    hotspots: [
      {
        id: 'arc_nota_clara',
        label: 'Escritorio de Clasificación Manual',
        actionLabel: 'Leer Nota Privada de Clara Vega (Doc 03)',
        position: [-2.0, 1.0, -2.5],
        type: 'document',
        documentId: 'doc_03_nota_trabajador',
        descriptions: {
          A: 'Una carta manuscrita oculta bajo el tampón de lacre explica qué son Los Testigos y por qué aparecen junto a documentos alterados.',
        },
      },
      {
        id: 'arc_entidad_testigo',
        label: 'Silueta de Polvo en Suspensión (Testigo)',
        actionLabel: 'Observar al Testigo',
        position: [1.8, 1.4, -3.8],
        visibleInChannels: ['B', 'C'],
        type: 'entity',
        descriptions: {
          A: 'En el Canal A solo se aprecia una corriente de polvo iluminada por el fluorescente.',
          B: 'Un contorno humano hueco, hecho de ceniza quieta y silencio acústico, permanece de pie señalando el gavetero blindado del fondo. A su alrededor no se oye ni el roce del aire.',
          C: 'El contorno del Testigo vibra sin rostro junto al cajón fechado el 14 de noviembre de 1999.',
        },
      },
      {
        id: 'arc_memorando_oculto',
        label: 'Gavetero Señalado por el Testigo (Canal B)',
        actionLabel: 'Leer Memorando sobre la Eliminación (Doc 07)',
        position: [2.3, 1.1, -4.1],
        visibleInChannels: ['B', 'C'],
        type: 'document',
        documentId: 'doc_07_memorando_eliminacion',
        descriptions: {
          A: 'En el Canal A el cajón figura como vacío y sellado con lacre municipal.',
          B: 'Al sintonizar el Canal B donde señala el Testigo, el falso fondo cede y muestra el Memorando Confidencial 0216 de Elena Vance con los tres hitos del minuto ausente (:12, :33 y :48).',
          C: 'Las letras del memorando parecen reescribirse bajo la interferencia.',
        },
      },
      {
        id: 'arc_puerta_vigilancia',
        label: 'Puerta Oeste — Sala de Vigilancia',
        actionLabel: 'Volver a Sala de Vigilancia',
        position: [-3.6, 1.2, -1.2],
        type: 'door',
        targetScene: 'vigilancia',
        descriptions: {
          A: 'Regresa a la Sala de Vigilancia.',
        },
      },
      {
        id: 'arc_puerta_laboratorio',
        label: 'Puerta Norte — Laboratorio de Calibración',
        actionLabel: 'Entrar al Laboratorio de Calibración',
        position: [0, 1.2, -4.7],
        type: 'door',
        targetScene: 'laboratorio',
        requiredItemForDoor: 'llave_archivo',
        descriptions: {
          A: 'Esclusa acústica que conduce al Laboratorio de Calibración.',
        },
      },
    ],
  },

  laboratorio: {
    id: 'laboratorio',
    act: 2,
    actTitle: 'Acto II — Los registros no coinciden',
    title: 'Escena 4: Laboratorio de Calibración',
    subtitle: 'Banco de Diapasones Patrón y Oscilografía Acústica',
    objective:
      'Analiza el Informe de Calibración y la Grabación 02, observa al Residual y sincroniza la secuencia armónica (3-1-4-2-5) para extraer la Bobina Maestra 02:16.',
    ambientDescription: {
      A: 'Grandes cilindros resonadores y un oscilógrafo de rayos catódicos ocupan el centro de la estancia. El compartimento de la Bobina Maestra está bloqueado.',
      B: 'En el Canal B aparece un Residual: la silueta translúcida de Mateo Soria repite en bucle el gesto de calibrar los cinco diales antes de mirar hacia el pasillo norte.',
      C: 'En el Canal C los diapasones emiten un armónico grave que curva ligeramente las líneas de la cuadrícula del suelo.',
    },
    hotspots: [
      {
        id: 'lab_informe_calibracion',
        label: 'Atril de Ensayos Acústicos',
        actionLabel: 'Leer Informe de Calibración (Doc 02)',
        position: [-2.5, 1.1, -2.6],
        type: 'document',
        documentId: 'doc_02_informe_calibracion',
        descriptions: {
          A: 'Documento técnico de Mateo Soria donde explica el eco anticipado y registra la secuencia armónica 3 — 1 — 4 — 2 — 5.',
        },
      },
      {
        id: 'lab_grabadora_impulsos',
        label: 'Consola Magnetofónica de Referencia',
        actionLabel: 'Escuchar Grabación 02 (Impulsos 3-1-4-2-5)',
        position: [-1.1, 1.1, -3.8],
        type: 'transcript',
        transcriptId: 'rec_02_impulsos_calibracion',
        descriptions: {
          A: 'Reproduce los cinco impulsos metálicos de calibración y la voz de Clara Vega advirtiendo que a las 02:16:33 han quedado atrapados en la esclusa.',
        },
      },
      {
        id: 'lab_entidad_residual',
        label: 'Manifestación Residual de Mateo Soria (Canal B)',
        actionLabel: 'Observar bucle del Residual y leer Reporte (Doc 05)',
        position: [1.6, 1.3, -3.2],
        visibleInChannels: ['B', 'C'],
        type: 'document',
        documentId: 'doc_05_reporte_residual',
        descriptions: {
          A: 'Un banco de trabajo desierto.',
          B: 'Una figura de partículas oscuras sin rostro repite cada seis segundos el mismo movimiento sobre los cinco diales. A sus pies yace el Reporte de Manifestación Residual (Doc 05).',
          C: 'Las extremidades del Residual dejan estelas dobles en el aire.',
        },
      },
      {
        id: 'lab_consola_frecuencias',
        label: 'Oscilógrafo y Consola de Frecuencias',
        actionLabel: 'Calibrar secuencia armónica (Puzle 3)',
        position: [0, 1.3, -4.4],
        type: 'puzzle',
        puzzleId: 'secuencia_calibracion',
        descriptions: {
          A: 'Consola de cinco canales armónicos con pantalla oscilográfica visual y generador de tonos.',
        },
      },
      {
        id: 'lab_bobina_maestra',
        label: 'Cámara de Vacío de la Bobina Maestra',
        actionLabel: 'Recoger Bobina Maestra 02:16',
        position: [2.7, 1.2, -3.9],
        type: 'pickup',
        itemId: 'bobina_maestra',
        descriptions: {
          A: 'Contiene el carrete magnético original donde quedaron grabados los sesenta segundos excluidos.',
        },
      },
      {
        id: 'lab_puerta_archivo',
        label: 'Puerta Sur — Archivo Documental',
        actionLabel: 'Volver al Archivo Documental',
        position: [-3.6, 1.2, -1.2],
        type: 'door',
        targetScene: 'archivo',
        descriptions: {
          A: 'Regresa al Archivo Documental.',
        },
      },
      {
        id: 'lab_puerta_pasillo',
        label: 'Compuerta Norte — Pasillo Discontinuo',
        actionLabel: 'Entrar al Pasillo Discontinuo',
        position: [3.6, 1.2, -1.2],
        type: 'door',
        targetScene: 'pasillo',
        requiredPuzzleForDoor: 'secuencia_calibracion',
        descriptions: {
          A: 'Da paso al corredor norte hacia la Cámara de Sincronización (Acto III).',
        },
      },
    ],
  },

  pasillo: {
    id: 'pasillo',
    act: 3,
    actTitle: 'Acto III — El minuto que no terminó',
    title: 'Escena 5: Pasillo Discontinuo',
    subtitle: 'Corredor de Enlace Norte — Topología Inestable',
    objective:
      'Estudia el Registro de Contradicción Espacial, observa tu propio eco Residual y combina los tres canales acústicos para cruzar hacia la Cámara de Sincronización.',
    ambientDescription: {
      A: 'En el Canal A, el pasillo parece terminar abruptamente en un muro de hormigón tras la primera Puerta Norte.',
      B: 'En el Canal B, el muro derecho desaparece revelando una Esclusa de Mantenimiento por la que se desliza un Residual que imita tus propios pasos.',
      C: 'En el Canal C, el fondo del corredor se abre en un Umbral de Sincronía coronado por los dígitos incandescentes «02:16» de El Contador.',
    },
    hotspots: [
      {
        id: 'pas_doc_contradiccion',
        label: ' Pupitre de Medición Topográfica',
        actionLabel: 'Leer Registro de Contradicción Espacial (Doc 06)',
        position: [-2.3, 1.05, -2.4],
        type: 'document',
        documentId: 'doc_06_contradiccion_espacial',
        descriptions: {
          A: 'Notas de la ingeniera Elena Vance detallando qué canal y qué puerta corresponden a cada uno de los tres tramos del corredor.',
        },
      },
      {
        id: 'pas_eco_propio',
        label: 'Rastro Residual en la Esclusa (Canal B)',
        actionLabel: 'Inspeccionar repetición de tus propios pasos',
        position: [2.0, 1.3, -3.3],
        visibleInChannels: ['B', 'C'],
        type: 'entity',
        descriptions: {
          A: 'Un muro frío de bloques de cemento.',
          B: 'Una silueta idéntica a ti repite el movimiento que acabas de hacer hace cuatro segundos y atraviesa la Esclusa de Mantenimiento lateral.',
          C: 'Sobre el dintel brillan los números «02:16:33» trazados por El Contador.',
        },
      },
      {
        id: 'pas_consola_transito',
        label: 'Estabilizador de Esclusas del Corredor',
        actionLabel: 'Configurar ruta de cruce (Puzle 4)',
        position: [0, 1.3, -4.3],
        type: 'puzzle',
        puzzleId: 'pasillo_discontinuo',
        descriptions: {
          A: 'Permite alinear la secuencia de canales y compuertas para atravesar los tres tramos sin quedar atrapado en el bucle espacial.',
        },
      },
      {
        id: 'pas_puerta_laboratorio',
        label: 'Compuerta Sur — Laboratorio de Calibración',
        actionLabel: 'Volver al Laboratorio',
        position: [-3.6, 1.2, -1.2],
        type: 'door',
        targetScene: 'laboratorio',
        descriptions: {
          A: 'Regresa al Laboratorio de Calibración.',
        },
      },
      {
        id: 'pas_puerta_camara',
        label: 'Umbral de Sincronía — Cámara Central',
        actionLabel: 'Entrar a la Cámara de Sincronización',
        position: [3.6, 1.2, -1.2],
        type: 'door',
        targetScene: 'camara',
        requiredPuzzleForDoor: 'pasillo_discontinuo',
        descriptions: {
          A: 'Acceso directo al corazón de la estación: la Cámara de Sincronización.',
        },
      },
    ],
  },

  camara: {
    id: 'camara',
    act: 3,
    actTitle: 'Acto III — El minuto que no terminó',
    title: 'Escena 6: Cámara de Sincronización',
    subtitle: 'Péndulo Maestro y Consola de Exclusión Horaria',
    objective:
      'Escucha la última grabación en el Canal C, reconstruye el orden de los acontecimientos del minuto 02:16 en la consola central y toma la decisión final.',
    ambientDescription: {
      A: 'Una bóveda circular dominada por el gigantesco Péndulo Maestro detenido a las 02:15:59 y un anillo de relojes esclavos.',
      B: 'En el Canal B, las sombras de Mateo Soria y Clara Vega golpean el cristal interior de la esclusa a las 02:16:33.',
      C: 'En el Canal C, El Contador hace latir toda la estructura metálica a 59,8 segundos del minuto oculto, aguardando que alguien complete o selle la cuenta.',
    },
    hotspots: [
      {
        id: 'cam_doc_protocolo',
        label: 'Atril del Protocolo Maestro',
        actionLabel: 'Leer Transcripción Final del Incidente (Doc 08)',
        position: [-2.4, 1.1, -2.5],
        type: 'document',
        documentId: 'doc_08_transcripcion_incidente',
        descriptions: {
          A: 'Expone el estado del bucle 02:16 y las consecuencias de las dos directivas finales: El silencio preservado o La transmisión.',
        },
      },
      {
        id: 'cam_grabacion_final',
        label: 'Caja Negra de Sincronía (Canal C)',
        actionLabel: 'Escuchar Grabación 03 (Amputación del intervalo)',
        position: [2.4, 1.1, -2.5],
        visibleInChannels: ['C', 'B'],
        type: 'transcript',
        transcriptId: 'rec_03_corte_sincronia',
        descriptions: {
          A: 'El cabezal blindado parece inerte en el Canal A.',
          B: 'Se distingue un murmullo lejano tras el blindaje.',
          C: 'En el Canal C reproduce los últimos segundos antes del corte de las 02:16:48 ejecutado por Elena Vance.',
        },
      },
      {
        id: 'cam_manifestacion_contador',
        label: 'Anillo Horario de El Contador',
        actionLabel: 'Inspeccionar la presencia de El Contador',
        position: [0, 2.5, -4.2],
        type: 'entity',
        descriptions: {
          A: 'Doce relojes industriales aguardan en silencio alrededor de la columna central.',
          B: 'Las agujas tiemblan al unísono buscando el segundo que les fue amputado.',
          C: 'Los dígitos «02:16:59» arden en el aire. No es una criatura de carne, sino una ley acústica incompleta que exige resolución.',
        },
      },
      {
        id: 'cam_consola_final',
        label: 'Consola Central de Sincronización',
        actionLabel: 'Reconstruir el minuto y decidir el desenlace (Puzle 5)',
        position: [0, 1.15, -3.5],
        type: 'puzzle',
        puzzleId: 'reconstruir_minuto',
        descriptions: {
          A: 'Requiere la Bobina Maestra 02:16 y el orden cronológico exacto de los tres hitos del incidente para habilitar la directiva final.',
        },
      },
      {
        id: 'cam_puerta_pasillo',
        label: 'Umbral Sur — Pasillo Discontinuo',
        actionLabel: 'Volver al Pasillo Discontinuo',
        position: [-3.6, 1.2, -1.2],
        type: 'door',
        targetScene: 'pasillo',
        descriptions: {
          A: 'Permite regresar a las salas anteriores si aún te falta algún documento o la Bobina Maestra.',
        },
      },
    ],
  },
};

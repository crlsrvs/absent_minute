import {
  AudioTranscript,
  DocumentId,
  InventoryItem,
  ItemId,
  NarrativeDocument,
  TranscriptId,
} from '../core/types';

export const INVENTORY_CATALOG: Record<ItemId, InventoryItem> = {
  credencial_acceso: {
    id: 'credencial_acceso',
    name: 'Credencial de Turno Nocturno',
    description:
      'Tarjeta perforada de cobre perteneciente a A. Méndez. Autoriza desbloquear el cuadro eléctrico del vestíbulo.',
    foundIn: 'vestibulo',
  },
  sintonizador_ecos: {
    id: 'sintonizador_ecos',
    name: 'Sintonizador de Ecos SE-99',
    description:
      'Receptor portátil de triple frecuencia (A: Registro 440 Hz, B: Residuo 432 Hz, C: Discordancia 417 Hz). Separa impresiones acústicas superpuestas.',
    foundIn: 'vigilancia',
  },
  llave_archivo: {
    id: 'llave_archivo',
    name: 'Llave de Esclusa Documental',
    description:
      'Llave magnética bifásica recuperada del archivador de vigilancia. Abre el Archivo Documental y el Laboratorio de Calibración.',
    foundIn: 'vigilancia',
  },
  bobina_maestra: {
    id: 'bobina_maestra',
    name: 'Bobina Maestra 02:16',
    description:
      'Carrete de cinta de óxido férrico sellado en plomo. Contiene los sesenta segundos excluidos del reloj municipal.',
    foundIn: 'laboratorio',
  },
};

export const NARRATIVE_DOCUMENTS: Record<DocumentId, NarrativeDocument> = {
  doc_01_registro_turno: {
    id: 'doc_01_registro_turno',
    code: 'EMSH-REG-1999-114',
    title: '1. Registro de turno de la noche del incidente',
    date: '14 de noviembre de 1999 — 02:20 h',
    author: 'Arturo Méndez (Inspector de Guardia)',
    location: 'vigilancia',
    content: [
      '01:45 h — Ronda ordinaria completada. El pasillo norte y el Archivo Documental permanecen cerrados con llave y sin personal en su interior.',
      '02:15 h — Lectura de línea estable (24V). Todos los cronógrafos esclavos en fase.',
      '02:17 h — Se registra caída breve de tensión atmosférica. Los relojes patrones retoman la marcha sin novedad. Ningún operario transitó por el sector vigilado por la Cámara 04.',
      'NOTA MANUSCRITA AL MARGEN (tinta corrida): «Arturo: olvidaste arrancar la cinta del monitor 04. Si alguien sintoniza el canal de residuo, verá a Mateo cruzando hacia el Archivo en el minuto que juramos que no existió.»',
    ],
    mysteryConnection:
      'Contradice frontalmente lo que muestra el monitor CAM-04 en el Canal B (Residuo) a las 02:16: el sector norte no estaba vacío.',
  },
  doc_02_informe_calibracion: {
    id: 'doc_02_informe_calibracion',
    code: 'EMSH-LAB-088',
    title: '2. Informe de calibración de instrumentos',
    date: '12 de octubre de 1999',
    author: 'Mateo Soria (Técnico Acústico)',
    location: 'laboratorio',
    content: [
      'Asunto: Fenómeno de pre-resonancia en los diapasones maestros de níquel-acero.',
      'Durante las pruebas de sincronización nocturna hemos detectado que las bobinas de verificación graban el chasquido de los relés exactamente 3,2 segundos antes de que el martinete golpee el yunque.',
      'Cuando intentamos compensar el desfase aplicando la serie armónica de calibración [ 3 — 1 — 4 — 2 — 5 ], el eco dentro del laboratorio dejó de corresponder con las dimensiones físicas de la sala: un sonido emitido a tres metros tardaba en volver como si la pared estuviera a cuarenta.',
      'Recomiendo suspender la sincronía automática antes de que el banco de relojes intente corregir la geometría del edificio para adaptarla al eco.',
    ],
    mysteryConnection:
      'Explica cómo las impresiones acústicas alteran el espacio físico y proporciona la secuencia armónica 3-1-4-2-5 del Laboratorio.',
  },
  doc_03_nota_trabajador: {
    id: 'doc_03_nota_trabajador',
    code: 'NOTA-SIN-FOLIO',
    title: '3. Nota privada de una trabajadora',
    date: '13 de noviembre de 1999',
    author: 'Clara Vega (Auxiliar de Archivo)',
    location: 'archivo',
    content: [
      'No se lo he dicho a la ingeniera Vance porque pensará que llevo demasiadas noches de guardia, pero hay gente de polvo junto a los ficheros.',
      'Aparecen únicamente delante de los cajones donde Arturo nos obligó a cambiar las fechas de los partes. No se mueven. No respiran. Pero cuando te acercas a ellos, hasta el zumbido de los tubos fluorescentes se apaga, como si absorbieran toda mentira impresa.',
      'Mateo los llama «Testigos». Dice que la estación no tolera que un papel diga una cosa y el metal haya escuchado otra. Si alguna vez te pierdes entre dos versiones, busca dónde se detiene una de esas siluetas.',
    ],
    mysteryConnection:
      'Describe la naturaleza y regla de Los Testigos: se condensan allí donde existe una contradicción documental.',
  },
  doc_04_acta_suspension: {
    id: 'doc_04_acta_suspension',
    code: 'ACTA-MUN-1999-C',
    title: '4. Acta de suspensión de operaciones',
    date: '15 de noviembre de 1999 — 08:00 h',
    author: 'Dirección Técnica Municipal / Elena Vance',
    location: 'vestibulo',
    content: [
      'Por orden de la Dirección de Sincronía Civil, queda clausurada de forma indefinida la Estación Municipal de Sincronía Horaria N.º 4 de Valdehornos.',
      'Causa oficial: Avería irreversible en el péndulo barométrico central tras tormenta eléctrica registrada entre las 02:15 y las 02:17 del 14 de noviembre.',
      'Se hace constar que todo el personal abandonó las instalaciones sin bajas ni incidentes. Queda prohibido reconectar la línea auxiliar de 24V (Disyuntores B1-12V, B3-8V y B4-4V) sin autorización escrita.',
    ],
    mysteryConnection:
      'Presenta la versión oficial encubierta y revela la combinación de tensión (12V + 8V + 4V = 24V) del cuadro de emergencia del Vestíbulo.',
  },
  doc_05_reporte_residual: {
    id: 'doc_05_reporte_residual',
    code: 'EMSH-EXP-RES-04',
    title: '5. Reporte de una manifestación Residual',
    date: '14 de noviembre de 1999 — 01:55 h',
    author: 'Mateo Soria (Técnico Acústico)',
    location: 'laboratorio',
    channelRequired: 'B',
    content: [
      'He vuelto a verme a mí mismo junto a la consola de frecuencias. La silueta de ceniza repite el gesto que hice hace cuatro minutos al ajustar el oscilógrafo, con los brazos desfasados medio segundo respecto al torso.',
      'Los «Residuales» no tienen ojos ni memoria. Son como un surco de vinilo grabado en el aire húmedo: solo conservan el movimiento que alguien ejecutó mientras la frecuencia de 432 Hz (Canal B) estaba saturada.',
      'Si el pasillo del ala norte vuelve a plegarse, no mires las señales pintadas en los muros. Sintoniza el Canal B y observa qué compuerta atraviesa el Residual: la huella siempre recuerda por dónde había salida.',
    ],
    mysteryConnection:
      'Define la naturaleza de Los Residuales e indica cómo usarlos como guía en el Pasillo Discontinuo (Tramo 2: Canal B, Esclusa).',
  },
  doc_06_contradiccion_espacial: {
    id: 'doc_06_contradiccion_espacial',
    code: 'EMSH-ARQ-204',
    title: '6. Registro de una contradicción espacial',
    date: '14 de noviembre de 1999 — 02:10 h',
    author: 'Elena Vance (Ingeniera Jefa)',
    location: 'pasillo',
    content: [
      'El corredor de enlace entre el Laboratorio y la Cámara de Sincronización mide 18 metros en el plano municipal, pero la sonda acústica acaba de medir 74 metros y tres esclusas distintas.',
      'He comprobado el protocolo de paso para no quedar atrapada en un bucle de retorno:',
      '— Primer tramo: la arquitectura aún obedece al plano oficial; debe cruzarse por la Puerta Norte en Canal A (Registro).',
      '— Segundo tramo: el muro de contención oficial está sellado; hay que cambiar a Canal B (Residuo) y seguir el rastro cinético por la Esclusa Lateral.',
      '— Tercer tramo: donde ambas realidades chocan y aparece grabada la cifra del Contador, solo el Canal C (Discordancia) abre el Umbral de Sincronía.',
    ],
    mysteryConnection:
      'Proporciona las reglas exactas de tránsito para resolver el Puzle 4 (El Pasillo Discontinuo).',
  },
  doc_07_memorando_eliminacion: {
    id: 'doc_07_memorando_eliminacion',
    code: 'CONFIDENCIAL-0216',
    title: '7. Memorando sobre la eliminación del minuto',
    date: '14 de noviembre de 1999 — 03:10 h',
    author: 'Elena Vance (Ingeniera Jefa)',
    location: 'archivo',
    channelRequired: 'B',
    content: [
      'Para: Archivo Reservado (Sintonía de Residuo).',
      'No hubo tormenta eléctrica. A las 02:16:12, el pulso que llamamos «El Contador» tomó el mando del reloj patrón y comenzó a reescribir la posición de las salas según ecos que aún no habían ocurrido.',
      'A las 02:16:33, Mateo Soria y Clara Vega intentaron cruzar la esclusa de la Cámara de Sincronización para desconectar las bobinas manualmente, pero el desfase cerró el tabique sobre su propio eco.',
      'A las 02:16:48 tomé la única decisión posible: accioné el Disyuntor de Exclusión Horaria. Forcé a todos los relojes de Valdehornos a saltar de las 02:15:59 a las 02:17:00. Si ese minuto no figura en ningún reloj oficial, El Contador no tiene carril por donde salir a la ciudad. Dios me perdone por dejar a Mateo y a Clara dentro de un minuto que ya no existe.',
    ],
    mysteryConnection:
      'Revela el secreto central del juego y establece el orden cronológico exacto (02:16:12 -> 02:16:33 -> 02:16:48) para el Puzle 5.',
  },
  doc_08_transcripcion_incidente: {
    id: 'doc_08_transcripcion_incidente',
    code: 'EMSH-CAJA-NEGRA-FINAL',
    title: '8. Transcripción final del incidente y protocolo de clausura',
    date: '14 de noviembre de 1999 — 02:16:59 h',
    author: 'Consola Central de Sincronía',
    location: 'camara',
    content: [
      'ESTADO DEL SISTEMA: INTERVALO 02:16 AISLADO EN BUCLE LOCAL (59,8 SEGUNDOS).',
      'ADVERTENCIA DE CONTENCIÓN: Mientras la Bobina Maestra permanezca desincronizada de la red exterior, el fenómeno quedará confinado a los muros de la EMSH-4, pero las impresiones de M. Soria y C. Vega jamás podrán reintegrarse al registro histórico.',
      'OPCIÓN A [AISLAR Y PRESERVAR EL SILENCIO]: Purgar el puente de transmisión y sellar permanentemente el bucle 02:16. La ciudad seguirá a salvo; lo ocurrido aquí quedará olvidado para siempre.',
      'OPCIÓN B [SINCRONIZAR Y TRANSMITIR]: Permitir que el reloj maestro termine de contar el segundo 60 y emita el registro íntegro de las 02:16. La verdad y las voces de quienes quedaron atrás serán recuperadas, pero el patrón de El Contador saldrá por la línea municipal.',
    ],
    mysteryConnection:
      'Plantea el dilema moral e intelectual de los dos finales del juego en la Cámara de Sincronización.',
  },
};

export const AUDIO_TRANSCRIPTS: Record<TranscriptId, AudioTranscript> = {
  rec_01_pasos_anticipados: {
    id: 'rec_01_pasos_anticipados',
    code: 'CINTA-VIG-01',
    title: 'Grabación 01 — Eco de recepción (Pasos anticipados)',
    timestamp: '02:15:54 -> 02:16:12',
    duration: '00:18',
    location: 'vigilancia',
    channelRequired: 'B',
    segments: [
      {
        speaker: 'AMBIENTE',
        text: '[Zumbido de bobina a 432 Hz. Cinco pasos pesados resuenan sobre las baldosas del vestíbulo tres segundos antes de que se abra la puerta exterior.]',
        soundCue: 'Pasos metálicos adelantados',
      },
      {
        speaker: 'VOZ DE MATEO SORIA',
        text: '«¿Arturo? Mira el monitor 04. La cinta está grabando a alguien entrando al edificio... pero la puerta principal todavía tiene echado el cerrojo.»',
      },
      {
        speaker: 'EL CONTADOR',
        text: '[Doce golpes secos de péndulo al unísono. El reloj salta a las 02:16:12.]',
        soundCue: '12 golpes metálicos síncronos',
      },
    ],
    mysteryConnection:
      'Confirma que la anomalía comenzó a las 02:16:12 con sonidos que precedían a sus causas y fue captada por la Cámara 04 en el Canal B.',
  },
  rec_02_impulsos_calibracion: {
    id: 'rec_02_impulsos_calibracion',
    code: 'CINTA-LAB-02',
    title: 'Grabación 02 — Patrón de diapasones maestros',
    timestamp: '02:16:20 -> 02:16:33',
    duration: '00:13',
    location: 'laboratorio',
    channelRequired: 'A',
    segments: [
      {
        speaker: 'AMBIENTE',
        text: '[Secuencia de cinco impulsos de campana tubular: Nivel 3 (Medio) — Nivel 1 (Grave) — Nivel 4 (Alto) — Nivel 2 (Bajo) — Nivel 5 (Agudo).]',
        soundCue: 'Impulsos: 3 - 1 - 4 - 2 - 5',
      },
      {
        speaker: 'VOZ DE CLARA VEGA',
        text: '«¡Mateo, la secuencia 3-1-4-2-5 ha abierto el compartimento, pero el pasillo de fuera ya no lleva al vestíbulo! ¡Estamos encerrados en la esclusa, son las 02:16:33!»',
      },
    ],
    mysteryConnection:
      'Contiene la pista sonora y transcrita de la secuencia 3-1-4-2-5 (Puzle 3) y documenta el segundo hito del minuto (02:16:33).',
  },
  rec_03_corte_sincronia: {
    id: 'rec_03_corte_sincronia',
    code: 'CINTA-CAM-03',
    title: 'Grabación 03 — Amputación del intervalo',
    timestamp: '02:16:45 -> 02:17:00',
    duration: '00:15',
    location: 'camara',
    channelRequired: 'C',
    segments: [
      {
        speaker: 'VOZ DE ELENA VANCE',
        text: '«Faltan doce segundos para que El Contador complete el minuto y emita la señal por la red de Valdehornos. ¡Tengo que cortar el registro ahora, a las 02:16:48!»',
      },
      {
        speaker: 'VOZ DE MATEO SORIA (DISTORSIONADA)',
        text: '«¡Elena, espera, si borras el minuto de los relojes mientras estamos en la esclusa no podremos salir de la cinta—!»',
      },
      {
        speaker: 'AMBIENTE',
        text: '[Estallido de arco voltaico. Silencio absoluto de tres segundos. Un reloj marca las 02:17:00.]',
        soundCue: 'Descarga de disyuntor y silencio abrupto',
      },
    ],
    mysteryConnection:
      'Confirma el tercer hito cronológico (02:16:48: corte deliberado del minuto por Elena Vance) y el destino de Soria y Vega.',
  },
};

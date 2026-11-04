# absent_minute
### Un misterio sobre aquello que la realidad decidió olvidar

**absent_minute** es un videojuego web narrativo en 3D de terror psicológico, misterio paranormal, exploración y acertijos ambientales construido con **React 18, TypeScript (strict mode), Three.js / React Three Fiber, Zustand y Web Audio API**.

---

## 1. Requisitos e Instalación

Asegúrate de contar con **Node.js 18+** y **npm**.

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción (verifica TypeScript + bundle Vite)
npm run build

# 4. Ejecutar pruebas automatizadas (Vitest)
npm test

# 5. Ejecutar análisis estático de código (ESLint)
npm run lint
```

---

## 2. Cómo Jugar y Controles

- **Ratón / Puntero:** Mover suavemente la cámara dentro de cada sala 3D e inspeccionar puntos de interés (*hotspots*).
- **Clic izquierdo o tecla `E`:** Interactuar con el objeto, documento, puerta o consola enfocada.
- **Teclas `1`, `2`, `3` (o panel inferior):** Cambiar entre los tres canales del **Sintonizador de Ecos SE-99** una vez obtenido en la Sala de Vigilancia:
  - **Canal A — Registro (`440 Hz`):** Estado oficial de la instalación.
  - **Canal B — Residuo (`432 Hz`):** Huellas acústicas del minuto excluido (`02:16`), *Residuales* y *Testigos*.
  - **Canal C — Discordancia (`417 Hz`):** Interferencia entre registros incompatibles y marcas numéricas de *El Contador*.
- **Tecla `Tab`:** Abrir el **Expediente Personal** (8 documentos, 3 grabaciones magnetofónicas y notas cronológicas).
- **Botón `Pistas`:** Sistema de ayuda progresiva en 3 niveles (Conceptual → Específica → Directa) para cada acertijo.
- **Tecla `Escape`:** Cerrar cualquier ventana o panel activo.

---

## 3. Estructura del Proyecto y Documentación

- [`LORE.md`](./LORE.md): Biblia narrativa original, reglas de *La Discontinuidad*, entidades (*Los Residuales*, *Los Testigos*, *El Contador*) y cronología verdadera del 14 de noviembre de 1999.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md): Diseño técnico modular desacoplado (`Game Core`, `Narrative Engine`, `Paranormal Systems`, `Scene Rendering`, `Audio System`, `UI`).
- [`ROADMAP.md`](./ROADMAP.md): Cinco expansiones futuras documentadas dentro del universo original.

---

## 4. Registro de Recursos y Licencias

- **Geometría 3D y Materiales:** 100% generados de forma procedural en tiempo real mediante primitivas y materiales de **Three.js / React Three Fiber** (sin modelos externos propietarios).
- **Audio y Paisaje Sonoro:** 100% sintetizado en tiempo real en el navegador mediante **Web Audio API** (`src/audio/soundEngine.ts`), sin archivos de audio ni música de terceros.
- **Código y Textos Narrativos:** Contenido 100% original desarrollado específicamente para **absent_minute**.

import { EchoChannel, SceneId, TranscriptId } from '../core/types';
import { gameEventBus } from '../core/events';

class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOscA: OscillatorNode | null = null;
  private ambientOscB: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private tickIntervalId: number | null = null;
  private initialized = false;
  private currentVolume = 0.75;
  private isMuted = false;
  private currentChannel: EchoChannel = 'A';
  private currentScene: SceneId = 'vestibulo';

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    gameEventBus.on('CHANNEL_CHANGED', (ev) => {
      const channel = (ev.payload.channel as EchoChannel) ?? 'A';
      this.currentChannel = channel;
      this.updateAmbientParameters();
      this.playChannelSwitchTone(channel);
    });

    gameEventBus.on('ROOM_ENTERED', (ev) => {
      const scene = (ev.payload.scene as SceneId) ?? 'vestibulo';
      this.currentScene = scene;
      this.updateAmbientParameters();
      this.playDoorTransitionSound();
    });

    gameEventBus.on('ITEM_COLLECTED', () => {
      this.playChime([523.25, 659.25]);
    });

    gameEventBus.on('DOCUMENT_FOUND', () => {
      this.playPaperRustleTone();
    });

    gameEventBus.on('PUZZLE_SOLVED', () => {
      this.playChime([440, 554.37, 659.25]);
    });

    gameEventBus.on('ENTITY_TRIGGERED', (ev) => {
      if (ev.payload.event === 'clock_tick_stopped') {
        this.playClockBurstAndSilence();
      } else {
        this.playParanormalPulse();
      }
    });

    gameEventBus.on('ENDING_SELECTED', (ev) => {
      if (ev.payload.ending === 'silencio_preservado') {
        this.playChime([293.66, 220.0]);
      } else {
        this.playChime([220.0, 329.63, 440.0, 659.25]);
      }
    });
  }

  public initOnUserGesture(): void {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.currentVolume * 0.25;
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.18;
      this.ambientGain.connect(this.masterGain);

      this.ambientOscA = this.ctx.createOscillator();
      this.ambientOscB = this.ctx.createOscillator();
      this.ambientOscA.type = 'sine';
      this.ambientOscB.type = 'triangle';

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 190;

      this.ambientOscA.connect(filter);
      this.ambientOscB.connect(filter);
      filter.connect(this.ambientGain);

      this.ambientOscA.start();
      this.ambientOscB.start();
      this.initialized = true;

      this.updateAmbientParameters();
      this.startIrregularClockTicks();
    } catch {
      // Ignorar si Web Audio API está bloqueado en entorno de test
    }
  }

  public setVolumeAndMute(volume: number, muted: boolean): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const target = muted ? 0 : this.currentVolume * 0.25;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  private updateAmbientParameters(): void {
    if (!this.ctx || !this.ambientOscA || !this.ambientOscB || !this.ambientGain) return;
    const now = this.ctx.currentTime;

    const sceneBaseFreq: Record<SceneId, number> = {
      vestibulo: 55,
      vigilancia: 62,
      archivo: 48,
      laboratorio: 73.4,
      pasillo: 51.9,
      camara: 65.4,
    };

    const base = sceneBaseFreq[this.currentScene] ?? 55;

    if (this.currentChannel === 'A') {
      this.ambientOscA.frequency.setTargetAtTime(base, now, 0.2);
      this.ambientOscB.frequency.setTargetAtTime(base * 1.5, now, 0.2);
      this.ambientGain.gain.setTargetAtTime(0.16, now, 0.2);
    } else if (this.currentChannel === 'B') {
      // En Archivo con el Testigo presente en Canal B, el ruido ambiental se reduce notablemente
      const gainLevel = this.currentScene === 'archivo' ? 0.05 : 0.22;
      this.ambientOscA.frequency.setTargetAtTime(base * 0.98, now, 0.2);
      this.ambientOscB.frequency.setTargetAtTime(base * 1.48, now, 0.2);
      this.ambientGain.gain.setTargetAtTime(gainLevel, now, 0.2);
    } else {
      // Canal C — Discordancia: batimento binaural inestable
      this.ambientOscA.frequency.setTargetAtTime(base * 0.94, now, 0.2);
      this.ambientOscB.frequency.setTargetAtTime(base * 1.03, now, 0.2);
      this.ambientGain.gain.setTargetAtTime(0.24, now, 0.2);
    }
  }

  private startIrregularClockTicks(): void {
    if (this.tickIntervalId !== null) {
      window.clearInterval(this.tickIntervalId);
    }
    this.tickIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      if (this.currentScene === 'archivo' && this.currentChannel === 'B') {
        // Silencio absorbido alrededor del Testigo
        return;
      }
      this.playSingleClockTick();
    }, 1450);
  }

  private playSingleClockTick(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(
      this.currentChannel === 'C' ? 920 : 780,
      now
    );

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playCalibrationHarmonic(level: number): void {
    this.initOnUserGesture();
    if (!this.ctx || !this.masterGain) return;

    const freqMap: Record<number, number> = {
      1: 220.0,
      2: 293.66,
      3: 349.23,
      4: 440.0,
      5: 523.25,
    };

    const freq = freqMap[level] ?? 349.23;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playChannelSwitchTone(channel: EchoChannel): void {
    this.initOnUserGesture();
    if (!this.ctx || !this.masterGain) return;

    const freqByChannel: Record<EchoChannel, number> = {
      A: 440,
      B: 432,
      C: 417,
    };

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = channel === 'C' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freqByChannel[channel], now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playTranscriptRecording(transcriptId: TranscriptId): void {
    this.initOnUserGesture();
    if (!this.ctx || !this.masterGain) return;

    if (transcriptId === 'rec_01_pasos_anticipados') {
      // Cinco pasos anticipados seguidos de pulsos síncronos de El Contador
      const now = this.ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110 + (i % 2) * 18, now + i * 0.28);
        gain.gain.setValueAtTime(0.22, now + i * 0.28);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.28 + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.28);
        osc.stop(now + i * 0.28 + 0.13);
      }
      this.playClockBurstAndSilence();
    } else if (transcriptId === 'rec_02_impulsos_calibracion') {
      // Secuencia armónica 3 - 1 - 4 - 2 - 5
      [3, 1, 4, 2, 5].forEach((lvl, idx) => {
        window.setTimeout(() => {
          this.playCalibrationHarmonic(lvl);
        }, idx * 360);
      });
    } else if (transcriptId === 'rec_03_corte_sincronia') {
      // Arco voltaico de exclusión horaria y golpe seco final a las 02:17
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.45);
      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  }

  private playClockBurstAndSilence(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640 - i * 80, now + i * 0.14);
      gain.gain.setValueAtTime(0.18, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.09);
    }
  }

  private playParanormalPulse(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(146.83, now);
    osc.frequency.exponentialRampToValueAtTime(98.0, now + 0.6);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.66);
  }

  private playDoorTransitionSound(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.33);
  }

  private playPaperRustleTone(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  private playChime(freqs: number[]): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.11);
      gain.gain.setValueAtTime(0.16, now + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.36);
    });
  }
}

export const soundEngine = new ProceduralSoundEngine();

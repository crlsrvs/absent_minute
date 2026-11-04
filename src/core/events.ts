import { GameEvent, GameEventType } from './types';

type EventListener = (event: GameEvent) => void;

class TypedEventBus {
  private listeners: Map<GameEventType | '*', Set<EventListener>> = new Map();
  private history: GameEvent[] = [];

  public on(type: GameEventType | '*', listener: EventListener): () => void {
    const set = this.listeners.get(type) ?? new Set<EventListener>();
    set.add(listener);
    this.listeners.set(type, set);
    return () => {
      set.delete(listener);
    };
  }

  public emit(type: GameEventType, payload: Record<string, unknown> = {}): GameEvent {
    const event: GameEvent = {
      type,
      payload,
      timestamp: Date.now(),
    };
    this.history.push(event);
    if (this.history.length > 100) {
      this.history.shift();
    }

    const specific = this.listeners.get(type);
    if (specific) {
      specific.forEach((fn) => fn(event));
    }

    const wildcard = this.listeners.get('*');
    if (wildcard) {
      wildcard.forEach((fn) => fn(event));
    }

    return event;
  }

  public getHistory(): ReadonlyArray<GameEvent> {
    return this.history;
  }

  public clearHistory(): void {
    this.history = [];
  }
}

export const gameEventBus = new TypedEventBus();

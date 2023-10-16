export type MatchingKeys<
    TRecord,
    TMatch,
    K extends keyof TRecord = keyof TRecord
> = K extends ( TRecord[K] extends TMatch ? K : never ) ? K : never;

export type VoidKeys<Record> = MatchingKeys<Record, void>;


/**
 * @public
 */
type Listener<T> = {
    fn: (v: T ) => any;
    priority: number;
  };
  
  export class TypeEmitter<T> {
    #listeners = new Map<
      keyof T,
      Array<Listener<T[keyof T]>>
    >();
  
    on<K extends keyof T>(
      s: K,
      listener: Listener<T[K]>["fn"],
      priority: number = 0
    ) {
      const existingListeners: Array<Listener<T[K]>> = this.#listeners.get(s) as Array<Listener<T[K]>> ?? [];
      const newListener: Listener<T[K]> = { fn: listener, priority };
  
      existingListeners.push(newListener);
      existingListeners.sort((a, b) => a.priority - b.priority);
  
      this.#listeners.set(s, existingListeners as unknown as Array<Listener<T[keyof T]>>);
      return () => this.off(s, listener);
    }
  
    off<K extends keyof T>(
      s: K,
      listener: Listener<T[K]>["fn"]
    ): void {
      const existingListeners = this.#listeners.get(s) ?? [];
      const filteredListeners = existingListeners.filter((l) => l.fn !== listener);
  
      this.#listeners.set(s, filteredListeners);
    }
  
    emit(s: keyof T, v?: T[keyof T]): undefined | boolean {
      const existingListeners = this.#listeners.get(s) ?? [];
      for (const { fn } of existingListeners) {
        if (fn(v!) === false) {
          return false;
        }
      }
    }
  
    dispose() {
      this.#listeners.clear();
    }
  }
  
  

/**
 * @public
 */
export class TypeEmitterProxy<T> {
    #host: TypeEmitter<T>;
    #disposers: (() => void)[] = [];
  
    constructor(host: TypeEmitter<T>) {
      this.#host = host;
    }
  
    on<K extends keyof T>(
      s: K,
      listener: Listener<T[K]>["fn"],
      priority: number = 0
    ) {
      const dispose = this.#host.on(s, listener, priority);
      this.#disposers.push(dispose);
      return dispose;
    }
  
    dispose() {
      for (const dispose of this.#disposers) dispose();
      this.#disposers = [];
    }
  }
  
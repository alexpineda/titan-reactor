export type MatchingKeys<
    TRecord,
    TMatch,
    K extends keyof TRecord = keyof TRecord
    > = K extends (TRecord[K] extends TMatch ? K : never) ? K : never;

export type VoidKeys<Record> = MatchingKeys<Record, void>;

export class TypeEmitter<T>  {
    #listeners: Map<keyof T, ((v: T[keyof T] | undefined) => void)[]> = new Map();

    on<K extends keyof T>(s: K, listener: (v: T[K]) => void): void {
        this.#listeners.set(s, (this.#listeners.get(s) || []).concat(listener));
    }

    off<K extends keyof T>(s: K, listener: (v: T[K]) => void): void {
        this.#listeners.set(s, (this.#listeners.get(s) || []).filter(l => l !== listener));
    }

    emit(s: keyof T, v?: T[keyof T]): void {
        this.#listeners.get(s)?.forEach(l => l(v));
    }


    dispose() {
        this.#listeners.clear();
    }

}
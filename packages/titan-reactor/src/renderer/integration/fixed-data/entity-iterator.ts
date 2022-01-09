export interface EntityIterator<T> {
    items: (count?:number) => IterableIterator<T>;
    reverse: (count?:number) => IterableIterator<T>;
    instances: (count?:number) => T[];
}
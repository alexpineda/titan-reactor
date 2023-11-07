import { Vector2 } from "three";

export type NormalizedCoordinate = number;

// simple quadrant for items
/**
 * @public
 */
export class SimpleQuadtree<T> {
    #size: number;
    #scale: Vector2;
    #offset: Vector2;
    #items: Record<string, T[]> = {};

    #normalized = new Vector2();
    #radius = new Vector2();

    get size() {
        return this.#size;
    }

    constructor(size: number, scale = new Vector2(1, 1), offset = new Vector2(0, 0), ) {
        this.#size = size;

        for (let i = 0; i < this.#size; i++) {
            for (let j = 0; j < this.#size; j++) {
                this.#items[`${i},${j}`] = [];
            }
        }

        this.#scale = scale;
        this.#offset = offset;

    }

    #normalize(out: Vector2, x: number, y: number, useOffset = true) {
        out.set(
            Math.floor(((x + (useOffset ? this.#offset.x : 0)) / this.#scale.x) * this.size), Math.floor(((y + (useOffset ? this.#offset.y : 0)) / this.#scale.y) * this.size));
    }

    add(x: number, y: number, item: T) {
        this.#normalize(this.#normalized, x, y);
        this.#items[`${this.#normalized.x},${this.#normalized.y}`].push(item);
    }

    getNearby(x: number, y: number, radius = 0) {
        this.#normalize(this.#normalized, x, y);

        if (radius === 0) {
            return this.#items[`${this.#normalized.x},${this.#normalized.y}`];
        } else {
            const items: T[] = [];

            this.#normalize(this.#radius, radius, radius, false);

            const minX = Math.floor(Math.max(0, this.#normalized.x - this.#radius.x));
            const minY = Math.floor(Math.max(0, this.#normalized.y - this.#radius.y));
            const maxX = Math.floor(Math.min(this.#size - 1, this.#normalized.x + this.#radius.x));
            const maxY = Math.floor(Math.min(this.#size - 1, this.#normalized.y + this.#radius.y));

            for (let i = minX; i <= maxX; i++) {
                for (let j = minY; j <= maxY; j++) {
                    items.push(...this.#items[`${i},${j}`]);
                }
            }

            return items;
        }
    }

    clear() {
        for (let i = 0; i < this.#size; i++) {
            for (let j = 0; j < this.#size; j++) {
                this.#items[`${i},${j}`].length = 0;
            }
        }
    }
}
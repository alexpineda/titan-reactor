import { Vector2 } from "three";

export class VisualSelectionBox {
    selectElement: HTMLSpanElement;
    #enabled = true;
    #start = new Vector2

    set color(value: string) {
        this.selectElement.style.outline = `2px solid ${value}`;
    }

    constructor(color: string) {
        this.selectElement = document.createElement("span");
        this.selectElement.style.position = "absolute";
        this.selectElement.style.display = "none";
        this.selectElement.style.pointerEvents = "none";
        document.body.appendChild(this.selectElement);
        this.color = color;
    }

    start(x: number, y: number) {
        this.#start.set(x, y);
    }

    end(x: number, y: number) {

        const l = Math.min(x, this.#start.x);
        const r = Math.max(x, this.#start.x);
        const t = Math.min(y, this.#start.y);
        const b = Math.max(y, this.#start.y);

        this.selectElement.style.display = "block";
        this.selectElement.style.left = `${l}px`;
        this.selectElement.style.top = `${t}px`;
        this.selectElement.style.width = `${r - l}px`;
        this.selectElement.style.height = `${b - t}px`;
    }

    isMinDragSize(x: number, y: number) {
        return (Math.abs(x - this.#start.x) > 10 &&
            Math.abs(y - this.#start.y) > 10);
    }

    update(x: number, y: number, x2: number, y2: number) {
        if (!this.#enabled) return;

        const l = Math.min(x, x2);
        const r = Math.max(x, x2);
        const t = Math.min(y, y2);
        const b = Math.max(y, y2);

        this.selectElement.style.display = "block";
        this.selectElement.style.left = `${l}px`;
        this.selectElement.style.top = `${t}px`;
        this.selectElement.style.width = `${r - l}px`;
        this.selectElement.style.height = `${b - t}px`;
    };

    get enabled() {
        return this.#enabled;
    }

    set enabled(value: boolean) {
        this.#enabled = value;
        if (value === false)
            this.clear();
    }

    clear() {
        this.selectElement.style.display = "none";
    }

    dispose() {
        this.selectElement.remove();
    }
}
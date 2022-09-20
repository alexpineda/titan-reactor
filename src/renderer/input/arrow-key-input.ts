import { Vector2 } from "three";

import { Janitor } from "@utils/janitor";
import { testKeys } from "@utils/key-utils";

const keyForward = "ArrowUp";
const keyBackward = "ArrowDown";
const keyLeft = "ArrowLeft";
const keyRight = "ArrowRight";
export class ArrowKeyInput {
    #el: HTMLElement;
    #vector = new Vector2();
    #janitor: Janitor;

    constructor(el: HTMLElement) {
        this.#el = el;
        this.#janitor = new Janitor("ArrowKeyInput");

        const keyDown = (e: KeyboardEvent) => {
            if (this.#vector.y == 0) {
                if (testKeys(e, keyForward)) {
                    this.#vector.y = 1;
                } else if (testKeys(e, keyBackward)) {
                    this.#vector.y = -1;
                }
            }

            if (this.#vector.x == 0) {
                if (testKeys(e, keyLeft)) {
                    this.#vector.x = -1;
                } else if (testKeys(e, keyRight)) {
                    this.#vector.x = 1;
                }
            }

        }

        const keyUp = (e: KeyboardEvent) => {
            if (testKeys(e, keyForward) || testKeys(e, keyBackward)) {
                this.#vector.y = 0;
            }

            if (testKeys(e, keyLeft) || testKeys(e, keyRight)) {
                this.#vector.x = 0;
            }

            if (testKeys(e, keyLeft) || testKeys(e, keyRight)) {
                this.#vector.x = 0;
            }

        }

        this.#janitor.addEventListener(this.#el, "keydown", "keydown", keyDown);
        this.#janitor.addEventListener(this.#el, "keyup", "keyup", keyUp);
    }

    get vector() {
        return this.#vector;
    }

    dispose() {
        this.#janitor.dispose();
    }
}
import { Vector2 } from "three";

import Janitor from "@utils/janitor";
import { testKeys } from "@utils/key-utils";

import { CameraModePlugin } from "./camera-mode";

const keyForward = "ArrowUp";
const keyBackward = "ArrowDown";
const keyLeft = "ArrowLeft";
const keyRight = "ArrowRight";
const keyFollow = "KeyF";
export class CameraKeys {
    #el: HTMLElement;
    #move = new Vector2();
    #janitor: Janitor;
    #onToggleFollowUnit: () => void;

    constructor(el: HTMLElement, onToggleFollowUnit: () => void) {
        this.#el = el;
        this.#janitor = new Janitor();
        this.#onToggleFollowUnit = onToggleFollowUnit;

        const keyDown = (e: KeyboardEvent) => {
            if (this.#move.y == 0) {
                if (testKeys(e, keyForward)) {
                    this.#move.y = 1;
                } else if (testKeys(e, keyBackward)) {
                    this.#move.y = -1;
                }
            }

            if (this.#move.x == 0) {
                if (testKeys(e, keyLeft)) {
                    this.#move.x = -1;
                } else if (testKeys(e, keyRight)) {
                    this.#move.x = 1;
                }
            }

        }

        this.#el.addEventListener("keydown", keyDown);
        this.#janitor.callback(() => this.#el.removeEventListener("keydown", keyDown));

        const keyUp = (e: KeyboardEvent) => {
            if (testKeys(e, keyForward) || testKeys(e, keyBackward)) {
                this.#move.y = 0;
            }

            if (testKeys(e, keyLeft) || testKeys(e, keyRight)) {
                this.#move.x = 0;
            }

            if (testKeys(e, keyLeft) || testKeys(e, keyRight)) {
                this.#move.x = 0;
            }

            if (testKeys(e, keyFollow)) {
                this.#onToggleFollowUnit();
            }
        }
        this.#el.addEventListener("keyup", keyUp);
        this.#janitor.callback(() => this.#el.removeEventListener("keyup", keyUp));
    }

    update(delta: number, elapsed: number, cameraMode: CameraModePlugin) {
        cameraMode.onCameraKeyboardUpdate && cameraMode.onCameraKeyboardUpdate(delta, elapsed, this.#move);
    }

    dispose() {
        this.#janitor.mopUp();
    }
}
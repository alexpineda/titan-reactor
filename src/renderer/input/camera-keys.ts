import { Vector2 } from "three";
import { Settings } from "common/types";

import Janitor from "@utils/janitor";
import { testKeys } from "@utils/key-utils";

import { CameraModePlugin } from "./camera-mode";


export class CameraKeys {
    #el: HTMLElement;
    #move = new Vector2();
    #janitor: Janitor;
    #dolly = 0;

    #cameraMode: CameraModePlugin;

    enabled = true;

    onFocusPress?: () => void;

    constructor(el: HTMLElement, settings: Settings, cameraMode: CameraModePlugin) {
        this.#el = el;
        this.#janitor = new Janitor();
        this.#cameraMode = cameraMode;

        const keyDown = (e: KeyboardEvent) => {
            if (this.#move.y == 0) {
                if (testKeys(e, settings.controls.camera.forward)) {
                    this.#move.y = 1;
                } else if (testKeys(e, settings.controls.camera.backward)) {
                    this.#move.y = -1;
                }
            }

            if (this.#move.x == 0) {
                if (testKeys(e, settings.controls.camera.truckLeft)) {
                    this.#move.x = -1;
                } else if (testKeys(e, settings.controls.camera.truckRight)) {
                    this.#move.x = 1;
                }
            }

        }

        this.#el.addEventListener("keydown", keyDown);
        this.#janitor.callback(() => this.#el.removeEventListener("keydown", keyDown));

        const keyUp = (e: KeyboardEvent) => {
            if (testKeys(e, settings.controls.camera.forward) || testKeys(e, settings.controls.camera.backward)) {
                this.#move.y = 0;
            }

            if (testKeys(e, settings.controls.camera.truckLeft) || testKeys(e, settings.controls.camera.truckRight)) {
                this.#move.x = 0;
            }

            // todo support ESCAPE as default camera mode escape key

        }
        this.#el.addEventListener("keyup", keyUp);
        this.#janitor.callback(() => this.#el.removeEventListener("keyup", keyUp));
    }

    update(delta: number, elapsed: number) {
        if (!this.enabled) return;

        this.#cameraMode.onCameraKeyboardUpdate && this.#cameraMode.onCameraKeyboardUpdate(delta, elapsed, this.#move);
        this.#move.x = 0;
        this.#move.y = 0;

    }

    dispose() {
        this.#janitor.mopUp();
    }
}
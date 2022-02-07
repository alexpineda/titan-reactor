import CameraControls from "camera-controls";
import { Settings } from "../../common/types";
import { Vector3 } from "three";
import Janitor from "../utils/janitor";
import { testKeys } from "../utils/key-utils";
import { smoothDollyIn, smoothDollyOut } from "./camera-presets";

const MAX_ACCELERATION = 2;
const ACCELERATION = 1.01;

export class CameraKeys {
    private _el: HTMLElement;
    private _vector = new Vector3();
    private _janitor: Janitor;
    private _controls: CameraControls;
    private _accel = 1;
    private _keyOnce = false;
    battleCam = false;

    onFocusPress?: () => void;
    onToggleBattleCam?: (escape?: boolean) => void;

    constructor(el: HTMLElement, control: CameraControls, settings: Settings) {
        this._el = el;
        this._janitor = new Janitor();
        this._controls = control;


        const kd = (e: KeyboardEvent) => {
            if (!this._keyOnce) {
                this._keyOnce = true;
            }

            if (this._vector.y == 0) {
                if (testKeys(e, settings.controls.keyboard.camera.forward)) {
                    this._vector.y = 1;
                } else if (testKeys(e, settings.controls.keyboard.camera.backward)) {
                    this._vector.y = -1;
                }
            }

            if (this._vector.x == 0) {
                if (testKeys(e, settings.controls.keyboard.camera.truckLeft)) {
                    this._vector.x = -1;
                } else if (testKeys(e, settings.controls.keyboard.camera.truckRight)) {
                    this._vector.x = 1;
                }
            }

        }

        this._el.addEventListener("keydown", kd);
        this._janitor.callback(() => this._el.removeEventListener("keydown", kd));

        const keyUp = (e: KeyboardEvent) => {
            this._keyOnce = false;

            if (testKeys(e, settings.controls.keyboard.camera.forward) || testKeys(e, settings.controls.keyboard.camera.backward)) {
                this._vector.y = 0;
            }

            if (testKeys(e, settings.controls.keyboard.camera.truckLeft) || testKeys(e, settings.controls.keyboard.camera.truckRight)) {
                this._vector.x = 0;
            }

            if (testKeys(e, settings.controls.keyboard.camera.zoomIn)) {
                smoothDollyIn(control, 1, !this.battleCam);
            } else if (testKeys(e, settings.controls.keyboard.camera.zoomOut)) {
                smoothDollyOut(control, 1, !this.battleCam);
            }

            // @todo battle cam on / off keys specifically
            if (testKeys(e, settings.controls.keyboard.game.battleCam)) {
                this.onToggleBattleCam && this.onToggleBattleCam();
            } else if (testKeys(e, "Escape")) { // bonus helper key for users who forget the other key
                this.onToggleBattleCam && this.onToggleBattleCam(true);
            }

        }
        this._el.addEventListener("keyup", keyUp);
        this._janitor.callback(() => this._el.removeEventListener("keyup", keyUp));
    }

    update(delta: number) {
        if (this._vector.x !== 0) {
            this._controls.truck(this._vector.x * delta * this._accel, 0, this._controls.mouseButtons.wheel === CameraControls.ACTION.NONE);
        }

        if (this._vector.y !== 0) {
            this._controls.forward(this._vector.y * delta * this._accel, this._controls.mouseButtons.wheel === CameraControls.ACTION.NONE);
        }

        if (this._vector.y === 0 && this._vector.x === 0) {
            this._accel = 1;
        } else {
            this._accel = Math.min(MAX_ACCELERATION, this._accel * ACCELERATION);
        }
    }

    dispose() {
        this._janitor.mopUp();
    }
}
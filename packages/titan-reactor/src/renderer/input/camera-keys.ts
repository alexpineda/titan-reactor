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
    private _readjustmentTarget = new Vector3();
    private _janitor: Janitor;
    private _control: CameraControls;
    private _accel = 1;

    onFocusPress?: () => void;

    constructor(el: HTMLElement, control: CameraControls, settings: Settings) {
        this._el = el;
        this._janitor = new Janitor();
        this._control = control;

        const kd = (e: KeyboardEvent) => {


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

        const ku = (e: KeyboardEvent) => {
            if (testKeys(e, settings.controls.keyboard.camera.forward) || testKeys(e, settings.controls.keyboard.camera.backward)) {
                this._vector.y = 0;
            }

            if (testKeys(e, settings.controls.keyboard.camera.truckLeft) || testKeys(e, settings.controls.keyboard.camera.truckRight)) {
                this._vector.x = 0;
            }

            // @todo split into two functions, big-zoom-in/out, small-zoom-in/out
            if (testKeys(e, settings.controls.keyboard.camera.zoomIn)) {
                smoothDollyIn(control);
            } else if (testKeys(e, settings.controls.keyboard.camera.zoomOut)) {
                smoothDollyOut(control);
            }

        }
        this._el.addEventListener("keyup", ku);
        this._janitor.callback(() => this._el.removeEventListener("keyup", ku));
    }

    update(delta: number) {
        if (this._vector.x !== 0) {
            this._control.truck(this._vector.x * delta * this._accel, 0, true);
        }

        if (this._vector.y !== 0) {
            this._control.forward(this._vector.y * delta * this._accel, true);
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
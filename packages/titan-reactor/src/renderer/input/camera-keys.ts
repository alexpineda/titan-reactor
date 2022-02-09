import CameraControls from "camera-controls";
import { Settings } from "../../common/types";
import { Vector3 } from "three";
import Janitor from "../utils/janitor";
import { testKeys } from "../utils/key-utils";
import { smoothDollyIn, smoothDollyOut } from "./camera-presets";
import { CameraMode, Controls } from "./camera-mode";

const MAX_ACCELERATION = 2;
const ACCELERATION = 1.01;

export class CameraKeys {
    private _el: HTMLElement;
    private _vector = new Vector3();
    private _janitor: Janitor;
    private _accel = 1;
    private _keyOnce = false;
    private _dolly = 0;
    enabled = true;

    onFocusPress?: () => void;
    onToggleCameraMode?: (cm: CameraMode) => void;

    constructor(el: HTMLElement, settings: Settings) {
        this._el = el;
        this._janitor = new Janitor();

        const kd = (e: KeyboardEvent) => {
            if (!this._keyOnce) {
                this._keyOnce = true;
            }

            if (this._vector.y == 0) {
                if (testKeys(e, settings.controls.camera.forward)) {
                    this._vector.y = 1;
                } else if (testKeys(e, settings.controls.camera.backward)) {
                    this._vector.y = -1;
                }
            }

            if (this._vector.x == 0) {
                if (testKeys(e, settings.controls.camera.truckLeft)) {
                    this._vector.x = -1;
                } else if (testKeys(e, settings.controls.camera.truckRight)) {
                    this._vector.x = 1;
                }
            }

        }

        this._el.addEventListener("keydown", kd);
        this._janitor.callback(() => this._el.removeEventListener("keydown", kd));

        const keyUp = (e: KeyboardEvent) => {
            this._keyOnce = false;

            if (testKeys(e, settings.controls.camera.forward) || testKeys(e, settings.controls.camera.backward)) {
                this._vector.y = 0;
            }

            if (testKeys(e, settings.controls.camera.truckLeft) || testKeys(e, settings.controls.camera.truckRight)) {
                this._vector.x = 0;
            }

            if (testKeys(e, settings.controls.camera.zoomIn)) {
                this._dolly = 1;
            } else if (testKeys(e, settings.controls.camera.zoomOut)) {
                this._dolly = -1;
            }

            if (testKeys(e, settings.controls.mode.battle)) {
                this.onToggleCameraMode && this.onToggleCameraMode(CameraMode.Battle);
            }
            if (testKeys(e, settings.controls.mode.default)) { // bonus helper key for users who forget the other key
                this.onToggleCameraMode && this.onToggleCameraMode(CameraMode.Default);
            }
            if (testKeys(e, settings.controls.mode.overview)) { // bonus helper key for users who forget the other key
                this.onToggleCameraMode && this.onToggleCameraMode(CameraMode.Overview);
            }


        }
        this._el.addEventListener("keyup", keyUp);
        this._janitor.callback(() => this._el.removeEventListener("keyup", keyUp));
    }

    update(delta: number, controls: Controls) {
        if (!this.enabled) return;

        if (this._vector.x !== 0) {
            controls.standard.truck(this._vector.x * delta * this._accel, 0, controls.standard.mouseButtons.wheel === CameraControls.ACTION.NONE);
        }

        if (this._vector.y !== 0) {
            controls.standard.forward(this._vector.y * delta * this._accel, controls.standard.mouseButtons.wheel === CameraControls.ACTION.NONE);
        }

        if (this._vector.y === 0 && this._vector.x === 0) {
            this._accel = 1;
        } else {
            this._accel = Math.min(MAX_ACCELERATION, this._accel * ACCELERATION);
        }

        if (this._dolly === 1) {
            smoothDollyIn(controls.standard, 1, controls.cameraMode === CameraMode.Default);
            this._dolly = 0;
        } else if (this._dolly === -1) {
            smoothDollyOut(controls.standard, 1, controls.cameraMode === CameraMode.Default);
            this._dolly = 0;
        }
    }

    dispose() {
        this._janitor.mopUp();
    }
}
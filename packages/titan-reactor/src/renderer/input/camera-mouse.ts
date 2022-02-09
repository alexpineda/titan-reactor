
import CameraControls from "camera-controls";
import { Camera, Vector2, Vector3 } from "three";
import Janitor from "../utils/janitor";
import { CameraMode, Controls } from "./camera-mode";
import { smoothDollyIn, smoothDollyOut } from "./camera-presets";

const MAX_ACCELERATION = 2;
const ACCELERATION = 1.01;
const passive = { passive: true };

const deltaYP = new Vector3();

export class CameraMouse {
    private _mouseWheelTimeout?: NodeJS.Timeout;
    private _mouseWheelDelay = 200;
    private _janitor = new Janitor();
    private _vector = new Vector3();
    private _accel = 1;
    private _zoomFactor = 0;
    private _lookAt = new Vector2()
    private _deltaY = 0;
    enabled = true;


    direction = new Vector3();

    constructor(domElement: HTMLElement) {


        const onWheel = (evt: WheelEvent) => {
            if (this._mouseWheelTimeout) return;
            this._deltaY = evt.deltaY;
            this._mouseWheelTimeout = setTimeout(() => {
                this._mouseWheelTimeout = undefined;
            }, this._mouseWheelDelay);
        };

        domElement.addEventListener("wheel", onWheel, passive);
        this._janitor.callback(() => {
            domElement.removeEventListener("wheel", onWheel);
            this._mouseWheelTimeout && clearTimeout(this._mouseWheelTimeout);
        });

        const onMouseMove = (evt: MouseEvent) => {
            const x = evt.clientX / window.innerWidth;
            const y = evt.clientY / window.innerHeight;

            if (x < 0.01 && x > -0.01) {
                this._vector.x = -1;
            } else if (x > 0.99 && x < 1.01) {
                this._vector.x = 1;
            } else {
                this._vector.x = 0;
            }

            if (y < 0.01 && y > -0.01) {
                this._vector.y = 1;
            } else if (y > 0.99 && y < 1.01) {
                this._vector.y = -1;
            } else {
                this._vector.y = 0;
            }

            this._lookAt.x = evt.movementX;
            this._lookAt.y = evt.movementY;
        }
        domElement.addEventListener("pointermove", onMouseMove, passive);
        this._janitor.callback(() => {
            domElement.removeEventListener("pointermove", onMouseMove);
        });

        const pointerUp = (evt: PointerEvent) => {
            this._zoomFactor = evt.button === 0 ? 2 : 1 / 2;
        }
        domElement.addEventListener("pointerup", pointerUp, passive);
        this._janitor.callback(() => {
            domElement.removeEventListener("pointerup", pointerUp);
        }
        );

    }

    update(delta: number, controls: Controls) {
        if (!this.enabled) return;

        if (controls.cameraMode === CameraMode.Battle) {
            if (this._zoomFactor) {
                controls.standard.zoomTo(controls.standard.camera.zoom * this._zoomFactor, false);
                this._zoomFactor = 0;
            }
            if (this._lookAt.x || this._lookAt.y) {
                controls.standard.rotate(-this._lookAt.x / 1000, -this._lookAt.y / 1000, true);
                this._lookAt.x = 0;
                this._lookAt.y = 0;
            }

            if (this._deltaY) {
                controls.standard.getPosition(deltaYP);

                if (this._deltaY < 0) {
                    controls.standard.setPosition(deltaYP.x, deltaYP.y - 2, deltaYP.z, true);
                } else {
                    controls.standard.setPosition(deltaYP.x, deltaYP.y + 2, deltaYP.z, true);
                }
                this._deltaY = 0;
            }
        } else if (controls.cameraMode === CameraMode.Default) {

            if (this._deltaY) {
                if (this._deltaY < 0) {
                    smoothDollyIn(controls.standard, 3);
                } else {
                    smoothDollyOut(controls.standard, 3);
                }
                this._deltaY = 0;
            }

            if (this._vector.x !== 0) {
                controls.standard.truck(this._vector.x * delta * this._accel, 0, true);
            }

            if (this._vector.y !== 0) {
                controls.standard.forward(this._vector.y * delta * this._accel, true);
            }


            if (this._vector.y === 0 && this._vector.x === 0) {
                this._accel = 1;
            } else {
                this._accel = Math.min(MAX_ACCELERATION, this._accel * ACCELERATION);
            }
        }
    }

    dispose() {
        this._mouseWheelTimeout && clearTimeout(this._mouseWheelTimeout);
        this._janitor.mopUp();
    }

}
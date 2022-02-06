
import CameraControls from "camera-controls";
import { Camera, Event, Intersection, Mesh, Object3D, Raycaster, Vector2, Vector3 } from "three";
import Janitor from "../utils/janitor";
import { smoothDollyIn, smoothDollyOut } from "./camera-presets";

const MAX_ACCELERATION = 2;
const ACCELERATION = 1.01;
export class CameraMouse {
    private _mouseWheelTimeout?: NodeJS.Timeout;
    private _mouseWheelDelay = 200;
    private _janitor = new Janitor();
    private _rayCaster = new Raycaster();
    private _mouseCoords = new Vector2();
    private _vector = new Vector3();
    private _mouseDown = false;
    private _controls: CameraControls;
    private _mouseIntersection: Intersection<Object3D<Event>>[] = [];
    private _accel = 1;
    wheelDollyEnabled = true;
    lookAtMouseEnabled = false;
    edgeScrollEnabled = true;
    battleCam = false;
    direction = new Vector3();

    constructor(controls: CameraControls, domElement: HTMLElement) {

        this._controls = controls;

        const onWheel = (evt: WheelEvent) => {
            if (this._mouseWheelTimeout || !this.wheelDollyEnabled) return;

            if (evt.deltaY < 0) {
                smoothDollyIn(controls, 3);
            } else {
                smoothDollyOut(controls, 3);
            }

            this._mouseWheelTimeout = setTimeout(() => {
                this._mouseWheelTimeout = undefined;
            }, this._mouseWheelDelay);
        };

        domElement.addEventListener("wheel", onWheel, { passive: true });
        this._janitor.callback(() => {
            domElement.removeEventListener("wheel", onWheel);
            this._mouseWheelTimeout && clearTimeout(this._mouseWheelTimeout);
        });

        const onMouseMove = (evt: MouseEvent) => {
            if (this.edgeScrollEnabled) {
                const x = evt.clientX / window.innerWidth;
                const y = evt.clientY / window.innerHeight;

                if (x < 0.02 && x > -0.01) {
                    this._vector.x = -1;
                } else if (x > 0.98 && x < 1.01) {
                    this._vector.x = 1;
                } else {
                    this._vector.x = 0;
                }

                if (y < 0.02 && y > -0.01) {
                    this._vector.y = 1;
                } else if (y > 0.98 && y < 1.01) {
                    this._vector.y = -1;
                } else {
                    this._vector.y = 0;
                }
            }
            if (this.lookAtMouseEnabled) {
                this._mouseCoords.set((evt.clientX / window.innerWidth) * 2 - 1, - (evt.clientY / window.innerHeight) * 2 + 1);
            }
        }
        domElement.addEventListener("pointermove", onMouseMove, { passive: true });
        this._janitor.callback(() => {
            domElement.removeEventListener("pointermove", onMouseMove);
        });

        const ptrDown = (evt: PointerEvent) => {
            if (evt.button === 2) {
                this._mouseDown = true;
            }
        };
        domElement.addEventListener("pointerdown", ptrDown);
        this._janitor.callback(() => domElement.removeEventListener("pointerdown", ptrDown));

        const ptrUp = () => {
            this._mouseDown = false;
        }
        domElement.addEventListener("pointerup", ptrUp);
        this._janitor.callback(() => domElement.removeEventListener("pointerup", ptrUp));
    }

    update(camera: Camera, terrain: any, delta: number) {
        if (this.edgeScrollEnabled) {
            if (this._vector.x !== 0) {
                this._controls.truck(this._vector.x * delta * this._accel, 0, true);
            }

            if (this._vector.y !== 0) {
                this._controls.forward(this._vector.y * delta * this._accel, true);
            }

            if (this._vector.y === 0 && this._vector.x === 0) {
                this._accel = 1;
            } else {
                this._accel = Math.min(MAX_ACCELERATION, this._accel * ACCELERATION);
            }
        }

        if (this.lookAtMouseEnabled && this._mouseDown) {
            this._rayCaster.setFromCamera(this._mouseCoords, camera);
            this.direction.copy(this._rayCaster.ray.direction);
            const v = new Vector3();
            v.copy(this.direction);
            v.multiplyScalar(20);
            v.add(camera.position);
            this._controls.setTarget(v.x, v.y, v.z, true);
        }
    }

    resetTarget(camera: Camera) {
        if (this._mouseIntersection.length) {
            this._controls.setTarget(this._mouseIntersection[0].point.x, 0, this._mouseIntersection[0].point.z, true)
        } else {
            this._controls.setTarget(camera.position.x, 0, camera.position.z, true)
        }
    }

    dispose() {
        this._janitor.mopUp();
    }

}
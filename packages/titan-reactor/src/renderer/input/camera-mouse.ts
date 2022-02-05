
import CameraControls from "camera-controls";
import { Camera, Event, Intersection, Mesh, Object3D, Raycaster, Vector2, Vector3 } from "three";
import Janitor from "../utils/janitor";
import { smoothDollyIn, smoothDollyOut } from "./camera-presets";

export class CameraMouse {
    private _mouseWheelTimeout?: NodeJS.Timeout;
    private _mouseWheelDelay = 200;
    private _janitor = new Janitor();
    private _rayCaster = new Raycaster();
    private _mouseCoords = new Vector2();
    private _mouseDown = false;
    private _controls: CameraControls;
    private _mouseIntersection: Intersection<Object3D<Event>>[] = [];
    wheelDollyEnabled = true;
    lookAtMouseEnabled = false;

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
            if (!this.lookAtMouseEnabled) return;
            this._mouseCoords.set((evt.clientX / window.innerWidth) * 2 - 1, - (evt.clientY / window.innerHeight) * 2 + 1);
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

    update(camera: Camera, terrain: Mesh) {
        if (!this.lookAtMouseEnabled || !this._mouseDown) return;
        this._rayCaster.setFromCamera(this._mouseCoords, camera);

        // const v = new Vector3();
        // v.copy(this._rayCaster.ray.direction);
        // v.multiplyScalar(10);
        // v.add(camera.position);
        // this._controls.setTarget(v.x, v.y, v.z, true);
        this._mouseIntersection.length = 0;
        this._rayCaster.intersectObject(terrain, false, this._mouseIntersection);
        if (this._mouseIntersection.length) {
            this._controls.setTarget(this._mouseIntersection[0].point.x, this._mouseIntersection[0].point.y, this._mouseIntersection[0].point.z, true);
        }
    }

    resetTarget() {
        this._controls.setTarget(this._mouseIntersection[0].point.x, 0, this._mouseIntersection[0].point.z, true)
    }

    dispose() {
        this._janitor.mopUp();
    }

}
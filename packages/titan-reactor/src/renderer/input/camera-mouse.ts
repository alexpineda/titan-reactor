
import CameraControls from "camera-controls";
import { Settings } from "../../common/types";
import { Camera, Intersection, Mesh, Object3D, Raycaster, Vector2, Vector3 } from "three";
import Janitor from "../utils/janitor";
import { CameraMode, Controls } from "./camera-mode";
import { smoothDollyIn, smoothDollyOut } from "./camera-presets";

const MAX_ACCELERATION = 2;
const ACCELERATION = 1.01;
const passive = { passive: true };

const deltaYP = new Vector3();
const clicked = new Vector3();

const rayCaster = new Raycaster();
const intersections: Intersection<Object3D<Event>>[] = [];
export class CameraMouse {
    private _mouseWheelTimeout?: NodeJS.Timeout;
    private _mouseWheelDelay = 200;
    private _janitor = new Janitor();
    private _vector = new Vector3();
    private _accel = 1;
    private _lookAt = new Vector2()
    private _deltaY = 0;
    private _clicked?: Vector3;
    private _mouse = new Vector3(0, 0, -1)
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

            this._mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
            this._mouse.y = - (evt.clientY / window.innerHeight) * 2 + 1;
        }
        domElement.addEventListener("pointermove", onMouseMove, passive);
        this._janitor.callback(() => {
            domElement.removeEventListener("pointermove", onMouseMove);
        });

        const pointerDown = (evt: PointerEvent) => {
            this._mouse.z = evt.button;
        }
        domElement.addEventListener("pointerdown", pointerDown, passive);
        this._janitor.callback(() => {
            domElement.removeEventListener("pointerdown", pointerDown);
        });

        const pointerUp = (evt: PointerEvent) => {
            this._clicked = clicked.copy(this._mouse);
            this._clicked.z = evt.button;
            this._mouse.z = -1;
        }
        domElement.addEventListener("pointerup", pointerUp, passive);
        this._janitor.callback(() => {
            domElement.removeEventListener("pointerup", pointerUp);
        }
        );

    }

    update(delta: number, controls: Controls, settings: Settings, terrain: Mesh) {
        if (!this.enabled) return;

        if (controls.cameraMode === CameraMode.Battle) {
            if (this._clicked) {
                controls.standard.zoomTo(controls.standard.camera.zoom * (this._clicked.z === 0 ? 2 : 1 / 2), false);
            }
            if (this._lookAt.x || this._lookAt.y) {
                controls.standard.rotate((-this._lookAt.x / 1000) * settings.controls.camera.helicopterRotateSpeed, (-this._lookAt.y / 1000) * settings.controls.camera.helicopterRotateSpeed, true);
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
        } else if (controls.cameraMode === CameraMode.Overview) {
            if (this._clicked && this._clicked.z === 0) {
                rayCaster.setFromCamera(this._clicked, controls.standard.camera);
                intersections.length = 0;
                rayCaster.intersectObject(terrain, false, intersections);
                if (intersections.length) {
                    controls.standard.moveTo(intersections[0].point.x, 0, intersections[0].point.z, false);
                    controls.keys.onToggleCameraMode(CameraMode.Default);
                }
            }

            if (!this._clicked && this._mouse.z === 2) {
                controls.PIP.enabled = true;
                rayCaster.setFromCamera(this._mouse, controls.standard.camera);
                intersections.length = 0;
                rayCaster.intersectObject(terrain, false, intersections);
                if (intersections.length) {
                    controls.PIP.camera.position.set(intersections[0].point.x, controls.PIP.camera.position.y, intersections[0].point.z);
                    controls.PIP.camera.lookAt(intersections[0].point.x, 0, intersections[0].point.z)
                }
            } else {
                controls.PIP.enabled = false;
            }
        }

        this._clicked = undefined;
    }

    dispose() {
        this._mouseWheelTimeout && clearTimeout(this._mouseWheelTimeout);
        this._janitor.mopUp();
    }

}
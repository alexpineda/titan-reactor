import { Surface } from "@image/canvas";
import { getDirection32 } from "@utils/camera-utils";
import CameraControls from "camera-controls";
import { MathUtils, OrthographicCamera, PerspectiveCamera, Vector2, Vector3, Vector4 } from "three";
import CameraShake from "./camera-shake";
import ProjectedCameraView from "./projected-camera-view";

const _target = new Vector3;

const isNumber = (value: any): value is Number => {
    return typeof value === "number";
}
export class GameViewPort {
    #enabled = false;
    camera: PerspectiveCamera | OrthographicCamera;
    projectedView = new ProjectedCameraView();
    orbit: CameraControls;
    viewport = new Vector4(0, 0, 300, 200);
    cameraShake = new CameraShake;
    shakeCalculation = {
        frequency: new Vector3(10, 20, 7.5),
        duration: new Vector3(1000, 1000, 1000),
        strength: new Vector3(),
        needsUpdate: false
    }
    #height = 300;
    #width = 300;
    #left?: number | null;
    #right?: number | null;
    #top?: number | null;
    #bottom?: number | null;
    #center?: Vector2 | null;
    #surface: Surface;
    readonly #isPrimary: boolean;

    constrainToAspect = true;
    renderMode3D = false;
    freezeCamera = false;

    get enabled() {
        return this.#enabled;
    }

    set enabled(val: boolean) {
        if (val === false && this.#isPrimary) {
            console.warn("Cannot disable primary viewport");
            return;
        }
        this.#enabled = val;
    }

    constructor(surface: Surface, isPrimaryViewport: boolean) {
        this.#surface = surface;
        this.camera = new PerspectiveCamera(15, surface.aspect, 0.1, 500);
        this.camera.userData.direction = 0;
        this.camera.userData.prevDirection = -1;

        this.orbit = new CameraControls(this.camera, this.#surface.canvas);

        this.#isPrimary = isPrimaryViewport;
        this.enabled = isPrimaryViewport;
        this.reset();
    }

    reset() {
        this.orbit?.dispose();

        this.orbit = new CameraControls(this.camera, this.#surface.canvas);
        this.orbit.mouseButtons.left = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.right = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.middle = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.wheel = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
        this.orbit.setLookAt(0, 50, 0, 0, 0, 0, false);
        return this.orbit;
    }

    set orthographic(value: boolean) {
        this.camera = value ? new OrthographicCamera() : new PerspectiveCamera(15, this.#surface.aspect, 0.1, 500);
        this.constrainToAspect = !value;
        this.reset()
    }


    set center(val: Vector2 | undefined | null) {
        this.#center = val;
        this.update();
    }

    get center() {
        return this.#center;
    }

    set height(val: number) {
        this.#height = val <= 1 ? this.#surface.bufferHeight * val : val;
        if (this.constrainToAspect) {
            this.#width = this.#height * this.aspect;
        }
        this.update();
    }

    set width(val: number) {
        this.#width = val <= 1 ? this.#surface.bufferWidth * val : val;
        if (this.constrainToAspect) {
            this.#height = this.#width / this.aspect;
        }
        this.update();
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get left() {
        return this.#left;
    }

    set left(val: number | undefined | null) {
        this.#left = val;
        if (typeof val === "number") {
            this.#left = val <= 1 ? this.#surface.bufferWidth * val : val;
        }
        this.update();
    }

    set right(val: number | undefined | null) {
        this.#right = val;
        if (typeof val === "number") {
            this.#right = val <= 1 ? this.#surface.bufferWidth * val : val;
        }
        this.update();
    }

    get right() {
        return this.#right;
    }

    get top() {
        return this.#top;
    }

    set top(val: number | undefined | null) {
        this.#top = val;
        if (typeof val === "number") {
            this.#top = val <= 1 ? this.#surface.bufferHeight * val : val;
        }
        this.update();
    }

    set bottom(val: number | undefined | null) {
        this.#bottom = val;
        if (typeof val === "number") {
            this.#bottom = val <= 1 ? this.#surface.bufferHeight * val : val;
        }
        this.update();
    }

    get bottom() {
        return this.#bottom;
    }

    update() {

        if (this.center) {
            const x = this.center.x - this.width / 2;
            const y = this.surfaceHeight - this.center.y - (this.height / 2);

            this.viewport.set(MathUtils.clamp(x, this.#width / 2, this.surfaceWidth - this.#width / 2), MathUtils.clamp(y, this.height / 2, this.surfaceHeight - this.height / 2), this.width, this.height);
        } else {
            let x = 0, y = 0;

            if (isNumber(this.left) && !isNumber(this.right)) {
                x = this.left;
            } else if (isNumber(this.right) && !isNumber(this.left)) {
                x = this.surfaceWidth - this.width - this.right;
            } else if (isNumber(this.left) && isNumber(this.right)) {
                x = this.left;
                this.width = this.surfaceWidth - this.left - this.right;
            }

            if (isNumber(this.bottom) && !isNumber(this.top)) {
                y = this.bottom;
            } else if (isNumber(this.top) && !isNumber(this.bottom)) {
                y = this.surfaceHeight - this.height - this.top;
            } else if (isNumber(this.bottom) && isNumber(this.top)) {
                y = this.bottom;
                this.height = this.surfaceWidth - this.bottom - this.top;
            }

            this.viewport.set(x, y, this.width, this.height);
        }
    }

    get surfaceWidth() {
        return this.#surface.bufferWidth;
    }

    get surfaceHeight() {
        return this.#surface.bufferHeight;
    }

    get aspect() {
        return this.camera instanceof PerspectiveCamera ? this.camera.aspect : 1;
    }

    set aspect(aspect: number) {
        if (this.camera instanceof PerspectiveCamera) {
            this.camera.aspect = aspect;
        }
        this.camera.updateProjectionMatrix();
        if (this.constrainToAspect) {
            this.height = this.#height;
        } else {
            this.update();
        }
    }

    dispose() {
        this.orbit?.dispose();
    }

    generatePrevData() {
        const target = new Vector3();
        const position = new Vector3();

        this.orbit!.getTarget(target);
        this.orbit!.getPosition(position);
        return {
            target: target,
            position: position
        }
    }

    shakeStart(elapsed: number) {
        if (this.cameraShake.enabled && this.shakeCalculation.needsUpdate) {
            this.cameraShake.shake(elapsed, this.shakeCalculation.duration, this.shakeCalculation.frequency, this.shakeCalculation.strength);
            this.shakeCalculation.needsUpdate = false;
            this.shakeCalculation.strength.setScalar(0);
        }
        if (!this.freezeCamera)
            this.cameraShake.update(elapsed, this.camera);
    }

    shakeEnd() {
        this.cameraShake.restore(this.camera);
    }

    updateCamera(targetDamping: number, delta: number) {
        this.orbit.dampingFactor = MathUtils.damp(this.orbit.dampingFactor, targetDamping, 0.0001, delta);

        const dir = this.renderMode3D ? getDirection32(this.projectedView.center ?? this.orbit.getTarget(_target), this.camera.position) : 0;
        if (dir != this.camera.userData.direction) {
            this.camera.userData.prevDirection = this.camera.userData.direction;
            this.camera.userData.direction = dir;
        }
    }
}
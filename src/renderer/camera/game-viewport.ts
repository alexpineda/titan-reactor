import { Surface } from "@image/canvas";
import CameraControls from "camera-controls";
import { SpriteRenderOptions, PostProcessingBundleDTO } from "common/types";
import { MathUtils, Vector2, Vector3, Vector4 } from "three";
import CameraShake from "./camera-shake";
import DirectionalCamera from "./directional-camera";
import ProjectedCameraView from "./projected-camera-view";


const isNumber = (value: any): value is Number => {
    return typeof value === "number";
}
export class GameViewPort {
    enabled = false;
    camera = new DirectionalCamera(15, 1, 0.1, 1000);
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
    constrainToAspect = true;

    spriteRenderOptions: SpriteRenderOptions
    postProcessing: PostProcessingBundleDTO;

    constructor(surface: Surface, bundle: PostProcessingBundleDTO) {
        this.#surface = surface;
        this.camera = new DirectionalCamera(15, surface.aspect, 0.1, 500);
        this.orbit = new CameraControls(this.camera, this.#surface.canvas);
        this.orbit = this.reset();

        this.postProcessing = {
            ...bundle,
            passes: [...bundle.passes],
            effects: [...bundle.effects]
        };

        this.spriteRenderOptions = {
            unitScale: 1,
            rotateSprites: false,
        }
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
            this.#width = this.#height * this.camera.aspect;
        }
        this.update();
    }

    set width(val: number) {
        this.#width = val <= 1 ? this.#surface.bufferWidth * val : val;
        if (this.constrainToAspect) {
            this.#height = this.#width / this.camera.aspect;
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
        return this.camera.aspect;
    }

    set aspect(aspect: number) {
        this.camera.aspect = aspect;
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
}
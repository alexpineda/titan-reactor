import { Surface } from "@image/canvas";
import { getDirection32 } from "@utils/camera-utils";
import CameraControls from "camera-controls";
import {
    MathUtils,
    OrthographicCamera,
    PerspectiveCamera,
    Vector3,
    Vector4,
} from "three";
import CameraShake from "./camera-shake";
import { ProjectedCameraView } from "./projected-camera-view";
import { Sizeable } from "./sizeable";

type DirectionalCamera = ( PerspectiveCamera | OrthographicCamera ) & {
    userData: { direction: number; prevDirection: number };
};

/**
 * @public
 * A "view" into the game. Every viewport contains it's own camera, dimensions, and additional properties.
 */
export class GameViewPort extends Sizeable {
    #enabled = false;
    name = "GameViewPort";
    camera: DirectionalCamera;
    projectedView = new ProjectedCameraView();
    orbit!: CameraControls;
    viewport = new Vector4( 0, 0, 300, 200 );
    cameraShake = new CameraShake();
    shakeCalculation = {
        frequency: new Vector3( 10, 20, 7.5 ),
        duration: new Vector3( 1000, 1000, 1000 ),
        strength: new Vector3(),
        needsUpdate: false,
    };
    #surface: Surface;

    constrainToAspect = true;
    #renderMode3D = false;
    freezeCamera = false;

    needsUpdate = true;
    rotateSprites = false;
    audioType: "stereo" | "3d" | null = "stereo";

    set renderMode3D( val: boolean ) {
        if ( val !== this.#renderMode3D ) {
            this.#renderMode3D = val;
            this.needsUpdate = true;
        }
    }

    get renderMode3D() {
        return this.#renderMode3D;
    }

    get enabled() {
        return this.#enabled;
    }

    set enabled( val: boolean ) {
        this.#enabled = val;
    }

    constructor( surface: Surface, enabled = false ) {
        super( surface );
        this.#surface = surface;
        this.camera = new PerspectiveCamera(
            15,
            surface.aspect,
            0.1,
            500
        ) as DirectionalCamera;
        this.camera.userData.direction = 0;
        this.camera.userData.prevDirection = -1;

        this.enabled = enabled;
        this.#bindOrbitControls();
    }

    #bindOrbitControls() {
        this.orbit = new CameraControls( this.camera, this.#surface.canvas );
        this.orbit.mouseButtons.left = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.right = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.middle = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.wheel = CameraControls.ACTION.NONE;
    }

    set orthographic( value: boolean ) {
        this.camera = (
            value
                ? new OrthographicCamera()
                : new PerspectiveCamera( 15, this.#surface.aspect, 0.1, 500 )
        ) as DirectionalCamera;
        this.constrainToAspect = !value;
        this.orbit.dispose();
        this.#bindOrbitControls();
    }

    dispose() {
        this.orbit.dispose();
    }

    generatePrevData() {
        const target = new Vector3();
        const position = new Vector3();

        this.orbit.getTarget( target );
        this.orbit.getPosition( position );
        return {
            target: target,
            position: position,
        };
    }

    shakeStart( elapsed: number, strength: number ) {
        if ( strength && this.shakeCalculation.needsUpdate ) {
            this.shakeCalculation.strength.multiplyScalar( strength );
            this.cameraShake.shake(
                elapsed,
                this.shakeCalculation.duration,
                this.shakeCalculation.frequency,
                this.shakeCalculation.strength
            );
            this.shakeCalculation.needsUpdate = false;
            this.shakeCalculation.strength.setScalar( 0 );
        }
        if ( !this.freezeCamera ) this.cameraShake.update( elapsed, this.camera );
    }

    shakeEnd() {
        this.cameraShake.restore( this.camera );
    }

    update( targetDamping: number, delta: number ) {

        this.viewport.copy(this.getActualSize());
        this.updateDirection32();
        this.orbit.dampingFactor = MathUtils.damp(
            this.orbit.dampingFactor,
            targetDamping,
            0.0001,
            delta
        );
    }

    updateDirection32() {
        const dir = this.rotateSprites
            ? getDirection32( this.projectedView.center, this.camera.position )
            : 0;
        if ( dir != this.camera.userData.direction ) {
            this.camera.userData.prevDirection = this.camera.userData.direction;
            this.camera.userData.direction = dir;
        }
    }
}

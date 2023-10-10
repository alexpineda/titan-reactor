import { Surface } from "@image/canvas";
import { getDirection32 } from "@utils/camera-utils";
import CameraControls from "camera-controls";
import {
    MathUtils,
    OrthographicCamera,
    PerspectiveCamera,
    Vector2,
    Vector3,
    Vector4,
} from "three";
import CameraShake from "./camera-shake";
import { ProjectedCameraView } from "./projected-camera-view";

const isNumber = ( value: any ): value is number => {
    return typeof value === "number";
};

type DirectionalCamera = ( PerspectiveCamera | OrthographicCamera ) & {
    userData: { direction: number; prevDirection: number };
};

/**
 * @public
 * A "view" into the game. Every viewport contains it's own camera, dimensions, and additional properties.
 */
export class GameViewPort {
    #enabled = false;
    camera: DirectionalCamera;
    projectedView = new ProjectedCameraView();
    orbit: CameraControls;
    viewport = new Vector4( 0, 0, 300, 200 );
    cameraShake = new CameraShake();
    shakeCalculation = {
        frequency: new Vector3( 10, 20, 7.5 ),
        duration: new Vector3( 1000, 1000, 1000 ),
        strength: new Vector3(),
        needsUpdate: false,
    };
    #height = 300;
    #width = 300;
    #left?: number | null;
    #right?: number | null;
    #top?: number | null;
    #bottom?: number | null;
    #center?: Vector2 | null;
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
        this.#surface = surface;
        this.camera = new PerspectiveCamera(
            15,
            surface.aspect,
            0.1,
            500
        ) as DirectionalCamera;
        this.camera.userData.direction = 0;
        this.camera.userData.prevDirection = -1;

        this.orbit = new CameraControls( this.camera, this.#surface.canvas );

        this.enabled = enabled;
        this.reset( true );
    }

    reset( firstRun = false ) {
        if ( firstRun ) {
            this.orbit.dispose();
            this.orbit = new CameraControls( this.camera, this.#surface.canvas );
        }

        this.orbit.mouseButtons.left = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.right = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.middle = CameraControls.ACTION.NONE;
        this.orbit.mouseButtons.wheel = CameraControls.ACTION.NONE;
        this.orbit.setLookAt( 0, 50, 0, 0, 0, 0, false );

        this.cameraShake = new CameraShake();

        this.needsUpdate = true;
        return this.orbit;
    }

    set orthographic( value: boolean ) {
        this.camera = (
            value
                ? new OrthographicCamera()
                : new PerspectiveCamera( 15, this.#surface.aspect, 0.1, 500 )
        ) as DirectionalCamera;
        this.constrainToAspect = !value;
        this.reset();
    }

    set center( val: Vector2 | undefined | null ) {
        this.#center = val;
        this.#updateViewport();
    }

    get center() {
        return this.#center;
    }

    get height() {
        return this.#height;
    }

    set height( val: number ) {
        this.#height = val <= 1 ? this.#surface.bufferHeight * val : val;
        if ( this.constrainToAspect ) {
            this.#width = this.#height * this.aspect;
        }
        this.#updateViewport();
    }

    set width( val: number ) {
        this.#width = val <= 1 ? this.#surface.bufferWidth * val : val;
        if ( this.constrainToAspect ) {
            this.#height = this.#width / this.aspect;
        }
        this.#updateViewport();
    }

    get width() {
        return this.#width;
    }

    get left() {
        return this.#left;
    }

    set left( val: number | undefined | null ) {
        this.#left = val;
        if ( typeof val === "number" ) {
            this.#left = val <= 1 ? this.#surface.bufferWidth * val : val;
        }
        this.#updateViewport();
    }

    set right( val: number | undefined | null ) {
        this.#right = val;
        if ( typeof val === "number" ) {
            this.#right = val <= 1 ? this.#surface.bufferWidth * val : val;
        }
        this.#updateViewport();
    }

    get right() {
        return this.#right;
    }

    get top() {
        return this.#top;
    }

    set top( val: number | undefined | null ) {
        this.#top = val;
        if ( typeof val === "number" ) {
            this.#top = val <= 1 ? this.#surface.bufferHeight * val : val;
        }
        this.#updateViewport();
    }

    set bottom( val: number | undefined | null ) {
        this.#bottom = val;
        if ( typeof val === "number" ) {
            this.#bottom = val <= 1 ? this.#surface.bufferHeight * val : val;
        }
        this.#updateViewport();
    }

    get bottom() {
        return this.#bottom;
    }

    #updateViewport() {
        const surfaceWidth = this.#surface.bufferWidth;
        const surfaceHeight = this.#surface.bufferHeight;

        if ( this.center ) {
            const x = this.center.x - this.width / 2;
            const y = surfaceHeight - this.center.y - this.height / 2;

            this.viewport.set(
                MathUtils.clamp( x, this.#width / 2, surfaceWidth - this.#width / 2 ),
                MathUtils.clamp( y, this.height / 2, surfaceHeight - this.height / 2 ),
                this.width,
                this.height
            );
        } else {
            let x = 0,
                y = 0;

            if ( isNumber( this.left ) && !isNumber( this.right ) ) {
                x = this.left;
            } else if ( isNumber( this.right ) && !isNumber( this.left ) ) {
                x = surfaceWidth - this.width - this.right;
            } else if ( isNumber( this.left ) && isNumber( this.right ) ) {
                x = this.left;
                this.width = surfaceWidth - this.left - this.right;
            }

            if ( isNumber( this.bottom ) && !isNumber( this.top ) ) {
                y = this.bottom;
            } else if ( isNumber( this.top ) && !isNumber( this.bottom ) ) {
                y = surfaceHeight - this.height - this.top;
            } else if ( isNumber( this.bottom ) && isNumber( this.top ) ) {
                y = this.bottom;
                this.height = surfaceWidth - this.bottom - this.top;
            }

            this.viewport.set( x, y, this.width, this.height );
        }
    }

    get aspect() {
        return this.camera instanceof PerspectiveCamera ? this.camera.aspect : 1;
    }

    set aspect( aspect: number ) {
        if ( this.camera instanceof PerspectiveCamera ) {
            this.camera.aspect = aspect;
        }
        this.camera.updateProjectionMatrix();
        if ( this.constrainToAspect ) {
            this.height = this.#height;
        } else {
            this.#updateViewport();
        }
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

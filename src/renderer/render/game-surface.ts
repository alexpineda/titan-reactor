import { GameAspect } from "common/types";
import { Vector3 } from "three";
import { Surface } from "../image";
import { MinimapDimensions } from "./minimap-dimensions";

const _aspect = new Vector3();

export class GameSurface extends Surface {
    top = 0;
    left = 0;
    right = 0;
    bottom = 0;

    #mapWidth: number;
    #mapHeight: number;
    #shouldHavePointerLock = false;

    constructor( mapWidth: number, mapHeight: number, canvas: HTMLCanvasElement ) {
        super( canvas, false );
        this.#mapHeight = mapHeight;
        this.#mapWidth = mapWidth;

        document.addEventListener( "pointerlockerror", () => {
            this.#shouldHavePointerLock = false;
        } );

        document.addEventListener( "onpointerlockchange", () => {
            if ( document.pointerLockElement ) {
                this.#shouldHavePointerLock = true;
            }
        } );
    }

    override setDimensions(
        screenWidth: number,
        screenHeight: number,
        pixelRatio: number
    ) {
        const gameAspect = GameAspect.Fit;

        const maxWidth = screenWidth;
        const maxHeight = screenHeight;

        const aspects = {
            [GameAspect.Native]: screen.width / screen.height,
            [GameAspect.FourThree]: 4 / 3,
            [GameAspect.SixteenNine]: 16 / 9,
        };

        this.left = 0;
        this.right = 0;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if ( gameAspect === GameAspect.Fit ) {
            this.top = 0;
            this.bottom = 0;

            super.setDimensions(
                Math.floor( maxWidth ),
                Math.floor( maxHeight ),
                pixelRatio
            );
        } else {
            const aspect = aspects[gameAspect];
            let width = maxWidth;
            if ( width / aspect > maxHeight ) {
                width = maxHeight * aspect;
            }

            const height = width / aspect;

            this.top = ( maxHeight - height ) / 2;
            this.left = this.left + ( maxWidth - width ) / 2;
            this.right = this.right + ( maxWidth - width ) / 2;

            super.setDimensions( Math.floor( width ), Math.floor( height ), pixelRatio );
        }
    }

    isPointerLockLost() {
        return (
            this.#shouldHavePointerLock && document.pointerLockElement !== this.canvas
        );
    }

    togglePointerLock( val: boolean ) {
        if ( val ) {
            this.requestPointerLock();
        } else {
            this.exitPointerLock();
        }
    }

    requestPointerLock() {
        this.canvas.requestPointerLock();
    }

    exitPointerLock() {
        this.#shouldHavePointerLock = false;
        document.exitPointerLock();
    }

    get screenAspect() {
        const screenAspectF = this.bufferWidth / this.bufferHeight;

        // fyi this is inversed aspect ratio y,x
        return _aspect.set(
            screenAspectF < 1.0 ? screenAspectF : 1.0,
            screenAspectF > 1.0 ? 1.0 / screenAspectF : 1.0,
            1
        );
    }

    getMinimapDimensions(
        minimapScale: number
    ): Pick<MinimapDimensions, "minimapWidth" | "minimapHeight"> {
        const max = Math.max( this.#mapWidth, this.#mapHeight );
        const wAspect = this.#mapWidth / max;
        const hAspect = this.#mapHeight / max;
        const minimapSize = this.height * 0.25 * minimapScale;

        return {
            minimapWidth: Math.floor( minimapSize * wAspect ),
            minimapHeight: Math.floor( minimapSize * hAspect ),
        };
    }

    override dispose() {
        this.canvas.remove();
    }

    show() {
        this.canvas.style.display = "block";
        return this.canvas;
    }

    hide() {
        this.canvas.style.display = "none";
    }
}

export default GameSurface;

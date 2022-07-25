import { Surface } from "@image/canvas";
import Janitor from "@utils/janitor";
import { SceneInputHandler, UserInputCallbacks } from "common/types";
import { GameSurface } from "renderer/render";
import { Scene, Vector3 } from "three";
import { GameViewPort } from "./game-viewport";
import { activateUnitSelection } from "./game-viewport-unit-selection";
import * as log from "@ipc/log";

const _target = new Vector3;
const _position = new Vector3;

export class GameViewportsDirector implements UserInputCallbacks {
    viewports: GameViewPort[] = [];
    // #macros: MacrosDTO;
    #surface: GameSurface;
    #minimapSurface: Surface;
    #scene: Scene;
    #janitor = new Janitor();
    #inputHandler?: SceneInputHandler | null;
    #lastAudioPositon = new Vector3;

    onActivate?: (viewport: SceneInputHandler) => void;


    get usePointerLock() {
        return this.#inputHandler?.gameOptions?.usePointerLock ?? false;
    }

    get allowUnitSelection() {
        return this.#inputHandler?.gameOptions?.allowUnitSelection ?? false;
    }

    get showMinimap() {
        return this.#inputHandler?.gameOptions?.showMinimap ?? true;
    }

    get audio(): SceneInputHandler["gameOptions"]["audio"] | null {
        return this.#inputHandler?.gameOptions?.audio ?? null;
    }

    constructor(scene: Scene, gameSurface: GameSurface, minimapSurface: Surface) {
        this.#scene = scene;
        this.#surface = gameSurface;
        this.#minimapSurface = minimapSurface;

        const _regainPointerLock = () => {
            if (gameSurface.pointerLockInvalidState) {
                gameSurface.requestPointerLock();
            }
        }
        this.#janitor.addEventListener(gameSurface.canvas, 'pointerdown', _regainPointerLock);

    }

    onShouldHideUnit(...args: Parameters<UserInputCallbacks["onShouldHideUnit"]>) {
        return this.#inputHandler?.onShouldHideUnit && this.#inputHandler.onShouldHideUnit(...args);
    }

    onCameraKeyboardUpdate(...args: Parameters<UserInputCallbacks["onCameraKeyboardUpdate"]>) {
        this.#inputHandler?.onCameraKeyboardUpdate && this.#inputHandler.onCameraKeyboardUpdate(...args);
    }

    onCameraMouseUpdate(...args: Parameters<UserInputCallbacks["onCameraMouseUpdate"]>) {
        this.#inputHandler?.onCameraMouseUpdate && this.#inputHandler.onCameraMouseUpdate(...args);
    }


    onUpdateAudioMixerLocation(delta: number, elapsed: number) {
        if (this.#inputHandler?.onUpdateAudioMixerLocation) {
            this.primaryViewport.orbit?.getTarget(_target);
            this.primaryViewport.orbit?.getPosition(_position);
            this.#lastAudioPositon.copy(this.#inputHandler.onUpdateAudioMixerLocation(delta, elapsed, _target, _position));
        }
        return this.#lastAudioPositon;
    }

    onMinimapDragUpdate(...args: Parameters<UserInputCallbacks["onMinimapDragUpdate"]>) {
        this.#inputHandler?.onMinimapDragUpdate && this.#inputHandler.onMinimapDragUpdate(...args);
    }

    onDrawMinimap(...args: Parameters<UserInputCallbacks["onDrawMinimap"]>) {
        this.#inputHandler?.onDrawMinimap && this.#inputHandler.onDrawMinimap(...args);
    }

    #activating = false;

    async activate(inputHandler: SceneInputHandler) {
        if (inputHandler === undefined) {
            log.warning("GameViewportsDirector.activate: inputHandler is undefined");
            return;
        }
        if (this.#activating) {
            return;
        }
        this.#activating = true;
        let prevData: any;
        if (this.#inputHandler && this.#inputHandler.onExitScene) {
            prevData = this.#inputHandler.onExitScene(this.generatePrevData());
        }
        this.#janitor.mopUp();
        this.#inputHandler = null;

        this.viewports = [
            new GameViewPort(this.#surface),
            new GameViewPort(this.#surface),
        ]
        for (const viewport of this.viewports) {
            this.#janitor.add(viewport)
            viewport.width = this.#surface.bufferWidth;
            viewport.height = this.#surface.bufferHeight;
            viewport.aspect = this.#surface.aspect;
            viewport.cameraShake.enabled = viewport.renderOptions.useCameraShake;
        };

        await inputHandler.onEnterScene(prevData);
        this.#inputHandler = inputHandler;

        if (this.allowUnitSelection) {
            this.#janitor.add(activateUnitSelection(this.viewports[0].camera, this.#scene, this.#surface, this.#minimapSurface));
        }

        this.#surface.togglePointerLock(this.usePointerLock);

        this.onActivate && this.onActivate(inputHandler);
        this.#activating = false;
    }

    get primaryViewport() {
        return this.viewports[0];
    }

    get secondaryViewport() {
        return this.viewports[1];
    }

    set aspect(val: number) {
        for (const viewport of this.viewports) {
            viewport.aspect = val;
        }
    }

    get name() {
        return this.#inputHandler?.name ?? "";
    }

    serialize() {

    }

    deserialize() {

    }

    dispose() {
        this.#janitor.mopUp();
    }


    generatePrevData() {
        return this.viewports[0].generatePrevData();
    }

}


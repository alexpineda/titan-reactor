import { Surface } from "@image/canvas";
import Janitor from "@utils/janitor";
import { PostProcessingBundleDTO, SceneInputHandler, UserInputCallbacks } from "common/types";
import { GameSurface } from "renderer/render";
import { Scene, Vector3 } from "three";
import { GameViewPort } from "./game-viewport";
import { activateUnitSelection } from "./game-viewport-unit-selection";
import * as log from "@ipc/log";

const _target = new Vector3;
const _position = new Vector3;

export class GameViewportsDirector implements UserInputCallbacks {
    viewports: GameViewPort[] = [];
    #surface: GameSurface;
    #minimapSurface: Surface;
    #scene: Scene;
    #janitor = new Janitor();
    #inputHandler?: SceneInputHandler | null;
    #lastAudioPositon = new Vector3;
    #defaultPostProcessingBundle: PostProcessingBundleDTO;

    onActivate?: (viewport: SceneInputHandler) => void;

    *activeViewports() {
        for (const viewport of this.viewports) {
            if (viewport.enabled) {
                yield viewport;
            }
        }
    }

    get disabled() {
        return this.#inputHandler === null;
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

    constructor(scene: Scene, gameSurface: GameSurface, minimapSurface: Surface, defaultPostProcessingBundle: PostProcessingBundleDTO) {
        this.#scene = scene;
        this.#surface = gameSurface;
        this.#minimapSurface = minimapSurface;
        this.#defaultPostProcessingBundle = defaultPostProcessingBundle;

        this.#janitor.callback = () => {
            defaultPostProcessingBundle.effects.forEach(effect => effect.dispose());
            defaultPostProcessingBundle.passes.forEach(pass => pass.dispose());
        }
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
            this.primaryViewport.orbit.getTarget(_target);
            this.primaryViewport.orbit.getPosition(_position);
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

    async activate(inputHandler: SceneInputHandler | null) {
        if (inputHandler === null) {
            this.#janitor.mopUp();
            this.#inputHandler = null;
            return;
        }
        if (inputHandler === undefined) {
            log.warning("GameViewportsDirector.activate: inputHandler is undefined");
            return;
        }
        if (this.#activating) {
            return;
        }
        this.#activating = true;
        let prevData: any = this.generatePrevData();
        if (this.#inputHandler && this.#inputHandler.onExitScene) {
            prevData = this.#inputHandler.onExitScene(prevData);
        }
        this.#janitor.mopUp();
        this.#inputHandler = null;
        this.#surface.togglePointerLock(false);

        this.#defaultPostProcessingBundle.fogOfWarEffect.blendMode.setOpacity(1);

        this.viewports = [
            new GameViewPort(this.#surface, this.#defaultPostProcessingBundle),
            new GameViewPort(this.#surface, this.#defaultPostProcessingBundle),
        ]
        this.viewports[0].enabled = true;

        for (const viewport of this.viewports) {
            this.#janitor.add(viewport)
            viewport.width = this.#surface.bufferWidth;
            viewport.height = this.#surface.bufferHeight;
            viewport.aspect = this.#surface.aspect;
        };

        await inputHandler.onEnterScene(prevData);
        this.#inputHandler = inputHandler;

        if (this.allowUnitSelection) {
            this.#janitor.add(activateUnitSelection(this.viewports[0].camera, this.#scene, this.#surface, this.#minimapSurface));
        }

        this.onActivate && this.onActivate(inputHandler);
        this.#activating = false;
    }

    get primaryViewport() {
        return this.viewports[0];
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
        return this.viewports.length ? this.viewports[0].generatePrevData() : null;
    }

}


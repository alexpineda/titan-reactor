import { SceneInputHandler, UserInputCallbacks } from "common/types";
import { GameSurface } from "../render";
import { Vector3 } from "three";
import { GameViewPort } from "./game-viewport";
import * as log from "@ipc/log";
import { MouseCursor } from "../input";
import { Macros } from "@macros";
import { DamageType, Explosion } from "common/enums";
import { easeCubicIn } from "d3-ease";
import { SceneController } from "@plugins/plugin-system-native";

const _target = new Vector3;
const _position = new Vector3;

// frequency, duration, strength multiplier
const explosionFrequencyDuration = {
    [Explosion.Splash_Radial]: [6, 1.25, 1],
    [Explosion.Splash_Enemy]: [8, 1.25, 1],
    [Explosion.SplashAir]: [10, 1, 1],
    [Explosion.CorrosiveAcid]: [20, 0.75, 1],
    [Explosion.Normal]: [15, 0.75, 1],
    [Explosion.NuclearMissile]: [2, 3, 2],
    [Explosion.YamatoGun]: [4, 2, 1],
};
// strength, xyz index
const bulletStrength = {
    [DamageType.Explosive]: [1, 0],
    [DamageType.Concussive]: [0.5, 1],
    [DamageType.Normal]: [0.25, 2],
};

const empty: GameViewPort[] = [];

export class GameViewportsDirector implements UserInputCallbacks {
    #surface: GameSurface;
    #sceneController?: SceneController | null;
    #lastAudioPositon = new Vector3;
    #mouseCursor = new MouseCursor();
    #macros: Macros;

    constructor(gameSurface: GameSurface, macros: Macros) {
        this.#surface = gameSurface;
        this.#macros = macros;
    }

    onActivate?: (viewport: SceneController) => void;
    beforeActivate?: (viewport: SceneController) => void;
    onCameraMouseUpdateCallback?: UserInputCallbacks["onCameraMouseUpdate"];

    get viewports() {
        return this.#sceneController?.viewports ?? empty;
    }

    get activeSceneController() {
        return this.#sceneController;
    }

    *activeViewports() {
        for (const viewport of this.viewports) {
            if (viewport.enabled) {
                yield viewport;
            }
        }
    }

    get numActiveViewports() {
        let count = 0;
        for (const viewport of this.viewports) {
            if (viewport.enabled) {
                count++;
            }
        }
        return count;
    }

    get disabled() {
        return this.#sceneController === null;
    }

    get audio(): SceneInputHandler["gameOptions"]["audio"] | null {
        return this.#sceneController?.gameOptions?.audio ?? null;
    }

    onShouldHideUnit(...args: Parameters<UserInputCallbacks["onShouldHideUnit"]>) {
        return this.#sceneController?.onShouldHideUnit && this.#sceneController.onShouldHideUnit(...args);
    }

    onCameraKeyboardUpdate(...args: Parameters<UserInputCallbacks["onCameraKeyboardUpdate"]>) {
        this.#sceneController?.onCameraKeyboardUpdate && this.#sceneController.onCameraKeyboardUpdate(...args);
    }

    onCameraMouseUpdate(...args: Parameters<UserInputCallbacks["onCameraMouseUpdate"]>) {
        this.onCameraMouseUpdateCallback && this.onCameraMouseUpdateCallback(...args);
        this.#sceneController?.onCameraMouseUpdate && this.#sceneController.onCameraMouseUpdate(...args);
    }

    onUpdateAudioMixerLocation(delta: number, elapsed: number) {
        if (this.#sceneController?.onUpdateAudioMixerLocation) {
            this.primaryViewport.orbit.getTarget(_target);
            this.primaryViewport.orbit.getPosition(_position);
            this.#lastAudioPositon.copy(this.#sceneController.onUpdateAudioMixerLocation(delta, elapsed, _target, _position));
        }
        return this.#lastAudioPositon;
    }

    onMinimapDragUpdate(...args: Parameters<UserInputCallbacks["onMinimapDragUpdate"]>) {
        this.#sceneController?.onMinimapDragUpdate && this.#sceneController.onMinimapDragUpdate(...args);
    }

    onDrawMinimap(...args: Parameters<UserInputCallbacks["onDrawMinimap"]>) {
        this.#sceneController?.onDrawMinimap && this.#sceneController.onDrawMinimap(...args);
    }

    #activating = false;

    async activate(inputHandler: SceneController | null, firstRunData?: any) {
        if (inputHandler === null) {
            this.#sceneController = null;
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
        let prevData: any = firstRunData ?? this.generatePrevData();
        if (this.#sceneController && this.#sceneController.onExitScene) {
            prevData = this.#sceneController.onExitScene(prevData);
        }
        this.#sceneController && this.#macros.callFromHook("onExitScene", this.#sceneController.name);
        this.#sceneController = null;
        this.#surface.togglePointerLock(false);

        if (inputHandler.viewports.length === 0) {
            inputHandler.viewports = [
                new GameViewPort(this.#surface, true),
                new GameViewPort(this.#surface, false),
            ]
        }

        for (const viewport of inputHandler.viewports) {
            viewport.reset();
            viewport.width = this.#surface.bufferWidth;
            viewport.height = this.#surface.bufferHeight;
            viewport.aspect = this.#surface.aspect;
        };

        this.beforeActivate && this.beforeActivate(inputHandler);
        await inputHandler.onEnterScene(prevData);
        this.#macros.callFromHook("onEnterScene", inputHandler.name);
        this.#sceneController = inputHandler;

        this.onActivate && this.onActivate(inputHandler);
        this.#activating = false;
    }

    get mouseCursor() {
        return this.#mouseCursor?.enabled ?? false;
    }

    set mouseCursor(value: boolean) {
        this.#mouseCursor.enabled = value;
    }

    get primaryViewport() {
        return this.viewports[0];
    }

    set aspect(val: number) {
        for (const viewport of this.viewports) {
            if (viewport.aspect !== val) {
                viewport.aspect = val;
            }
        }
    }

    dispose() {
        this.#mouseCursor.dispose();
    }

    generatePrevData() {
        return this.viewports.length ? this.viewports[0].generatePrevData() : null;
    }

    doShakeCalculation = (explosionType: Explosion, damageType: DamageType, spritePos: Vector3) => {
        const exp = explosionFrequencyDuration[explosionType as keyof typeof explosionFrequencyDuration];
        const _bulletStrength = bulletStrength[damageType as keyof typeof bulletStrength];

        if (_bulletStrength && !(exp === undefined || damageType === DamageType.IgnoreArmor || damageType === DamageType.Independent)) {
            for (const v of this.activeViewports()) {
                if (!v.cameraShake.enabled) {
                    continue;
                }
                const distance = v.camera.position.distanceTo(spritePos);
                if (distance < v.cameraShake.maxShakeDistance) {
                    const calcStrength = _bulletStrength[0] * easeCubicIn(1 - distance / v.cameraShake.maxShakeDistance) * exp[2];
                    if (calcStrength > v.shakeCalculation.strength.getComponent(_bulletStrength[1])) {
                        v.shakeCalculation.strength.setComponent(_bulletStrength[1], calcStrength);
                        v.shakeCalculation.duration.setComponent(_bulletStrength[1], exp[1] * 1000);
                        v.shakeCalculation.frequency.setComponent(_bulletStrength[1], exp[0]);
                        v.shakeCalculation.needsUpdate = true;
                    }
                }
            }
        }

    }
}
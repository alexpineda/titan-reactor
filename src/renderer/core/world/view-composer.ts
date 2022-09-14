import { mixer } from "@audio/main-mixer";
import { ReactiveSessionVariables } from "@core/world/reactive-session-variables";
import { SurfaceComposer } from "@core/world/surface-composer";
import * as log from "@ipc/log";
import { SceneController } from "@plugins/plugin-system-native";
import { DamageType, Explosion } from "common/enums";
import { SceneInputHandler, UserInputCallbacks } from "common/types";
import { easeCubicIn } from "d3-ease";
import { Vector3 } from "three";
import { GameViewPort } from "../../camera/game-viewport";

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

export type ViewComposer = ReturnType<typeof createViewComposer>;

export const createViewComposer = ({ gameSurface }: SurfaceComposer, sessionApi: ReactiveSessionVariables) => {

    let activating = false;

    let sceneController: SceneController | null = null;

    const _target = new Vector3();
    const _position = new Vector3();
    const _audioPositon = new Vector3();

    // viewports.externalOnExitScene = (sceneController) => macros.callFromHook("onExitScene", sceneController);
    // viewports.aspect = gameSurface.aspect;

    const viewports = () => sceneController?.viewports ?? empty;


    return {
        viewportsGameTimeApi: {
            get viewport() {
                return viewports()[0];
            },
            get secondViewport() {
                return viewports()[1];
            },
            changeRenderMode(renderMode3D?: boolean) {
                viewports()[0]!.renderMode3D = renderMode3D ?? !viewports()[0]!.renderMode3D;
            },
        },
        update(delta: number, elapsed: number) {

            this.onUpdateAudioMixerLocation(delta, elapsed);

            for (const viewport of this.activeViewports()) {

                if (!viewport.freezeCamera) {
                    viewport.orbit.update(delta / 1000);
                    viewport.projectedView.update(viewport.camera, viewport.orbit.getTarget(_target));
                }

            }
        },

        onUpdateAudioMixerLocation(delta: number, elapsed: number) {
            if (sceneController?.onUpdateAudioMixerLocation) {
                this.primaryViewport!.orbit.getTarget(_target);
                this.primaryViewport!.orbit.getPosition(_position);
                _audioPositon.copy(sceneController.onUpdateAudioMixerLocation(delta, elapsed, _target, _position));
                mixer.updateFromVector3(_audioPositon, delta);
            }
            return _audioPositon;
        },

        get viewports() {
            return viewports();
        },

        get activeSceneController() {
            return sceneController;
        },

        *activeViewports() {
            for (const viewport of this.viewports) {
                if (viewport.enabled) {
                    yield viewport;
                }
            }
        },

        get numActiveViewports() {
            let count = 0;
            for (const viewport of this.viewports) {
                if (viewport.enabled) {
                    count++;
                }
            }
            return count;
        },

        get audio(): SceneInputHandler["gameOptions"]["audio"] | null {
            return sceneController?.gameOptions?.audio ?? null;
        },

        onCameraKeyboardUpdate(...args: Parameters<UserInputCallbacks["onCameraKeyboardUpdate"]>) {
            // if (this.externalOnCameraKeyboardUpdate!(...args) === false) {
            //     return;
            // }
            sceneController?.onCameraKeyboardUpdate && sceneController.onCameraKeyboardUpdate(...args);
        },

        onCameraMouseUpdate(...args: Parameters<UserInputCallbacks["onCameraMouseUpdate"]>) {
            // if (this.externalOnCameraMouseUpdate!(...args) === false) {
            //     return;
            // }
            sceneController?.onCameraMouseUpdate && sceneController.onCameraMouseUpdate(...args);
        },

        onMinimapDragUpdate(...args: Parameters<UserInputCallbacks["onMinimapDragUpdate"]>) {
            // if (this.externalOnMinimapDragUpdate!(...args) === false) {
            //     return;
            // }
            sceneController?.onMinimapDragUpdate && sceneController.onMinimapDragUpdate(...args);
        },

        async activateSceneController(inputHandler: SceneController | null, firstRunData?: any) {
            if (inputHandler === null) {
                sceneController = null;
                return;
            }
            if (inputHandler === undefined) {
                log.warning("GameViewportsDirector.activate: inputHandler is undefined");
                return;
            }
            if (activating) {
                return;
            }
            activating = true;
            let prevData: any = firstRunData ?? this.generatePrevData();
            if (sceneController && sceneController.onExitScene) {
                prevData = sceneController.onExitScene(prevData);
            }
            // this.externalOnExitScene && this.externalOnExitScene(sceneController?.name);
            sceneController = null;
            gameSurface.togglePointerLock(false);

            if (inputHandler.viewports.length === 0) {
                inputHandler.viewports = [
                    new GameViewPort(gameSurface, true),
                    new GameViewPort(gameSurface, false),
                ]
            }

            for (const viewport of inputHandler.viewports) {
                viewport.reset();
                viewport.width = gameSurface.bufferWidth;
                viewport.height = gameSurface.bufferHeight;
                viewport.aspect = gameSurface.aspect;
            };

            sessionApi.sessionVars.game.minimapSize.setToDefault();
            sessionApi.sessionVars.game.minimapEnabled.setToDefault();

            await inputHandler.onEnterScene(prevData);
            sceneController = inputHandler;

            activating = false;
        },

        get primaryViewport(): GameViewPort | undefined {
            return viewports()[0];
        },

        set aspect(val: number) {
            for (const viewport of this.viewports) {
                if (viewport.aspect !== val) {
                    viewport.aspect = val;
                }
            }
        },

        get sceneController() {
            return this.activeSceneController;
        },

        get primaryCamera() {
            return this.primaryViewport?.camera;
        },

        get primaryRenderMode3D() {
            return this.primaryViewport?.renderMode3D ?? false;
        },

        changeRenderMode(renderMode3D?: boolean) {
            this.primaryViewport!.renderMode3D = renderMode3D ?? !this.primaryViewport!.renderMode3D;
        },

        generatePrevData() {
            return this.viewports.length ? viewports()[0].generatePrevData() : null;
        },

        doShakeCalculation(explosionType: Explosion, damageType: DamageType, spritePos: Vector3) {
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
}
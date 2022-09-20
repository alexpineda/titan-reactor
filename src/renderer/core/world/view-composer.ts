import { mixer } from "@core/global";
import { SurfaceComposer } from "@core/world/surface-composer";
import * as log from "@ipc/log";
import { SceneController } from "@plugins/plugin-system-native";
import { Janitor } from "@utils/janitor";
import { Borrowed } from "@utils/object-utils";
import { DamageType, Explosion } from "common/enums";
import { SceneInputHandler, UserInputCallbacks } from "common/types";
import { easeCubicIn } from "d3-ease";
import { Vector3 } from "three";
import { GameViewPort } from "../../camera/game-viewport";
import { createInputComposer } from "./input-composer";
import { World } from "./world";

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

export type ViewInputComposer = ReturnType<typeof createViewInputComposer>;

export const createViewInputComposer = (world: Borrowed<World>, { gameSurface }: Pick<SurfaceComposer, "gameSurface">) => {

    let activating = false;

    let sceneController: WeakRef<SceneController> | null = null;
    const getSceneController = () => sceneController ? sceneController.deref() : null;
    const getViewports = () => getSceneController()?.viewports ?? empty;

    const _target = new Vector3();
    const _position = new Vector3();
    const _audioPositon = new Vector3();

    const janitor = new Janitor("ViewInputComposer");
    const inputs = janitor.mop(createInputComposer(world), "inputs");

    world.events!.on("resize", (surface) => {
        for (const viewport of getViewports()) {
            viewport.width = surface.bufferWidth;
            viewport.height = surface.bufferHeight;
            viewport.aspect = surface.aspect;
        };
    });

    world.events!.on("dispose", () => {
        janitor.dispose();
    });

    return {
        inputs,
        viewportsGameTimeApi: {
            get viewport() {
                return getViewports()[0];
            },
            get secondViewport() {
                return getViewports()[1];
            },
            changeRenderMode(renderMode3D?: boolean) {
                getViewports()[0]!.renderMode3D = renderMode3D ?? !getViewports()[0]!.renderMode3D;
            },
            ...inputs.inputGameTimeApi,
        },
        update(delta: number, elapsed: number) {

            const sceneController = getSceneController();

            if (!sceneController) {
                inputs.mouse.interrupted = true;
                return;
            };

            inputs.update();

            if (!inputs.mouse.interrupted) {
                sceneController.onCameraMouseUpdate && sceneController.onCameraMouseUpdate(delta / 100, elapsed, inputs.mouse.mouseScrollY, inputs.mouse.screenDrag, inputs.mouse.lookAt, inputs.mouse.move, inputs.mouse.clientX, inputs.mouse.clientY, inputs.mouse.clicked, inputs.mouse.modifiers);
            }

            sceneController.onCameraKeyboardUpdate && sceneController.onCameraKeyboardUpdate(delta / 100, elapsed, inputs.keyboard.vector);

            if (sceneController?.onUpdateAudioMixerLocation) {
                sceneController.viewport.orbit.getTarget(_target);
                sceneController.viewport.orbit.getPosition(_position);
                _audioPositon.copy(sceneController.onUpdateAudioMixerLocation(delta, elapsed, _target, _position));
                mixer.updateFromVector3(_audioPositon, delta);
            }

            for (const viewport of this.activeViewports()) {

                if (!viewport.freezeCamera) {
                    viewport.orbit.update(delta / 1000);
                    viewport.projectedView.update(viewport.camera, viewport.orbit.getTarget(_target));
                }

            }
        },

        onAfterUpdate() {
            inputs.resetState();
        },

        get viewports() {
            return getViewports();
        },

        get getSceneController() {
            return getSceneController();
        },

        deactivate() {
            sceneController = null;
        },

        *activeViewports() {
            for (const viewport of getViewports()) {
                if (viewport.enabled) {
                    yield viewport;
                }
            }
        },

        get numActiveViewports() {
            let count = 0;
            for (const viewport of getViewports()) {
                if (viewport.enabled) {
                    count++;
                }
            }
            return count;
        },

        get audio(): SceneInputHandler["gameOptions"]["audio"] | null {

            const sceneController = getSceneController();

            return sceneController?.gameOptions?.audio ?? null;

        },

        onMinimapDragUpdate(...args: Parameters<UserInputCallbacks["onMinimapDragUpdate"]>) {

            const sceneController = getSceneController();

            sceneController?.onMinimapDragUpdate && sceneController.onMinimapDragUpdate(...args);
        },

        async activate(newController: SceneController | null, firstRunData?: any) {
            if (newController === null) {
                sceneController = null;
                return;
            }
            if (newController === undefined) {
                log.warning("GameViewportsDirector.activate: inputHandler is undefined");
                return;
            }
            if (activating) {
                return;
            }
            activating = true;
            let prevData: any = firstRunData ?? this.generatePrevData();
            const prevSceneController = getSceneController();

            if (prevSceneController?.onExitScene) {
                try {
                    world.events!.emit("scene-exit", prevSceneController?.name);
                    prevData = prevSceneController.onExitScene!(prevData);
                } catch (e) {
                    log.error(e);
                }
            }

            sceneController = null;
            gameSurface.togglePointerLock(false);

            if (newController.viewports.length === 0) {
                newController.viewports = [
                    new GameViewPort(gameSurface, true),
                    new GameViewPort(gameSurface, false),
                ]
            }

            for (const viewport of newController.viewports) {
                viewport.reset();
                viewport.width = gameSurface.bufferWidth;
                viewport.height = gameSurface.bufferHeight;
                viewport.aspect = gameSurface.aspect;
            };

            await newController.onEnterScene(prevData);
            sceneController = new WeakRef(newController);

            world.events!.emit("scene-enter", newController.name);

            activating = false;
        },

        get primaryViewport(): GameViewPort | undefined {
            return getViewports()[0];
        },

        set aspect(val: number) {
            for (const viewport of this.viewports) {
                if (viewport.aspect !== val) {
                    viewport.aspect = val;
                }
            }
        },

        get sceneController() {
            return this.getSceneController;
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
            return this.viewports.length ? getViewports()[0].generatePrevData() : null;
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
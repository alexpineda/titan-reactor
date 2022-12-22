import { mixer } from "@core/global";
import { SurfaceComposer } from "@core/world/surface-composer";
import { log } from "@ipc/log";
import { Janitor } from "three-janitor";
import { DamageType, Explosion } from "common/enums";
import { Vector3 } from "three";
import { GameViewPort } from "../../camera/game-viewport";
import { World } from "./world";
import { SceneController } from "@plugins/scene-controller";
import { easeInCubic } from "@utils/function-utils";

// frequency, duration, strength multiplier
const explosionFrequencyDuration = {
    [Explosion.Splash_Radial]: [ 6, 1.25, 1 ],
    [Explosion.Splash_Enemy]: [ 8, 1.25, 1 ],
    [Explosion.SplashAir]: [ 10, 1, 1 ],
    [Explosion.CorrosiveAcid]: [ 20, 0.75, 1 ],
    [Explosion.Normal]: [ 15, 0.75, 1 ],
    [Explosion.NuclearMissile]: [ 2, 3, 2 ],
    [Explosion.YamatoGun]: [ 4, 2, 1 ],
};
// strength, xyz index
const bulletStrength = {
    [DamageType.Explosive]: [ 1, 0 ],
    [DamageType.Concussive]: [ 0.5, 1 ],
    [DamageType.Normal]: [ 0.25, 2 ],
};

const empty: GameViewPort[] = [];

export type ViewControllerComposer = ReturnType<typeof createViewControllerComposer>;
export type ViewControllerComposerApi = ViewControllerComposer["api"];

export const createViewControllerComposer = (
    world: World,
    { gameSurface }: SurfaceComposer
) => {
    let activating = false;

    let sceneController: SceneController | null = null;
    const getViewports = () => sceneController?.viewports ?? empty;

    const _target = new Vector3();
    const _position = new Vector3();
    const _audioPosition = new Vector3();

    const janitor = new Janitor( "ViewInputComposer" );

    world.events.on( "resize", ( surface ) => {
        for ( const viewport of getViewports() ) {
            viewport.width = surface.bufferWidth;
            viewport.height = surface.bufferHeight;
            viewport.aspect = surface.aspect;
        }
    } );

    world.events.on( "dispose", () => {
        janitor.dispose();
    } );

    return {
        api: {
            get viewport() {
                return getViewports()[0];
            },
            get secondViewport() {
                return getViewports()[1];
            },
        },
        update( delta: number ) {
            if ( !sceneController ) {
                return;
            }

            sceneController.viewport.orbit.getTarget( _target );
            sceneController.viewport.orbit.getPosition( _position );

            _audioPosition.copy(
                sceneController.onUpdateAudioMixerLocation( _target, _position )
            );

            mixer.update(
                _audioPosition,
                sceneController.onUpdateAudioMixerOrientation(),
                delta
            );

            for ( const viewport of this.activeViewports() ) {
                if ( !viewport.freezeCamera ) {
                    viewport.orbit.update( delta / 1000 );
                    viewport.projectedView.update(
                        viewport.camera,
                        viewport.orbit.getTarget( _target )
                    );
                }
            }
        },

        get viewports() {
            return getViewports();
        },

        deactivate() {
            sceneController = null;
        },

        *activeViewports() {
            for ( const viewport of getViewports() ) {
                if ( viewport.enabled ) {
                    yield viewport;
                }
            }
        },

        get numActiveViewports() {
            let count = 0;
            for ( const viewport of getViewports() ) {
                if ( viewport.enabled ) {
                    count++;
                }
            }
            return count;
        },

        async activate(
            newController: SceneController | null | undefined,
            firstRunData?: any
        ) {
            if ( newController === null ) {
                sceneController = null;
                return;
            }
            if ( newController === undefined ) {
                log.warn( "GameViewportsDirector.activate: inputHandler is undefined" );
                return;
            }
            if ( activating ) {
                return;
            }
            activating = true;
            let prevData: unknown = firstRunData ?? this.generatePrevData();

            if ( sceneController?.onExitScene ) {
                try {
                    world.events.emit( "scene-controller-exit", sceneController.name );
                    prevData = sceneController.onExitScene( prevData );
                } catch ( e ) {
                    log.error( e );
                }
            }

            sceneController = null;
            gameSurface.togglePointerLock( false );

            if ( newController.viewports.length === 0 ) {
                newController.viewports = [
                    new GameViewPort( gameSurface, true ),
                    new GameViewPort( gameSurface, false ),
                ];
            }

            for ( const viewport of newController.viewports ) {
                viewport.reset();
                viewport.width = gameSurface.bufferWidth;
                viewport.height = gameSurface.bufferHeight;
                viewport.aspect = gameSurface.aspect;
            }

            await newController.onEnterScene( prevData );
            sceneController = newController;

            world.events.emit( "scene-controller-enter", newController.name );

            activating = false;
        },

        get primaryViewport(): GameViewPort | undefined {
            return getViewports()[0];
        },

        set aspect( val: number ) {
            for ( const viewport of this.viewports ) {
                if ( viewport.aspect !== val ) {
                    viewport.aspect = val;
                }
            }
        },

        get sceneController() {
            return sceneController;
        },

        get primaryCamera() {
            return this.primaryViewport?.camera;
        },

        get primaryRenderMode3D() {
            return this.primaryViewport?.renderMode3D ?? false;
        },

        changeRenderMode( renderMode3D?: boolean ) {
            this.primaryViewport!.renderMode3D =
                renderMode3D ?? !this.primaryViewport!.renderMode3D;
        },

        generatePrevData() {
            return this.viewports.length ? getViewports()[0].generatePrevData() : null;
        },

        doShakeCalculation(
            explosionType: Explosion,
            damageType: DamageType,
            spritePos: Vector3
        ) {
            const exp =
                explosionFrequencyDuration[
                    explosionType as keyof typeof explosionFrequencyDuration
                ];
            const _bulletStrength =
                bulletStrength[damageType as keyof typeof bulletStrength];

            if (
                _bulletStrength &&
                !(
                    exp === undefined ||
                    damageType === DamageType.IgnoreArmor ||
                    damageType === DamageType.Independent
                )
            ) {
                for ( const v of this.activeViewports() ) {
                    if ( !v.cameraShake.enabled ) {
                        continue;
                    }
                    const distance = v.camera.position.distanceTo( spritePos );
                    if ( distance < v.cameraShake.maxShakeDistance ) {
                        const calcStrength =
                            _bulletStrength[0] *
                            easeInCubic( 1 - distance / v.cameraShake.maxShakeDistance ) *
                            exp[2];
                        if (
                            calcStrength >
                            v.shakeCalculation.strength.getComponent( _bulletStrength[1] )
                        ) {
                            v.shakeCalculation.strength.setComponent(
                                _bulletStrength[1],
                                calcStrength
                            );
                            v.shakeCalculation.duration.setComponent(
                                _bulletStrength[1],
                                exp[1] * 1000
                            );
                            v.shakeCalculation.frequency.setComponent(
                                _bulletStrength[1],
                                exp[0]
                            );
                            v.shakeCalculation.needsUpdate = true;
                        }
                    }
                }
            }
        },
    };
};

import { SurfaceComposer } from "@core/world/surface-composer";
import { log } from "@ipc/log";
import { Janitor } from "three-janitor";
import { DamageType, Explosion } from "common/enums";
import { PerspectiveCamera, Vector3 } from "three";
import { GameViewPort } from "../../camera/game-viewport";
import { World } from "./world";
import type { SceneController } from "@plugins/scene-controller";
import { easeInCubic } from "@utils/function-utils";
import range from "common/utils/range";
import { mixer } from "@audio/main-mixer";

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

export type ViewControllerComposer = ReturnType<typeof createViewControllerComposer>;
export type ViewControllerComposerApi = ViewControllerComposer["api"];

/**
 * The Scene Controller plugin is responsible for managing the game viewports.
 * This composer helps activate those plugins, as well as update the viewports and their orbiting camera controls.
 * 
 * @param world 
 * @param param1 
 * @returns 
 */
export const createViewControllerComposer = (
    world: World,
    { gameSurface }: SurfaceComposer,
    initialStartLocation: Vector3
) => {
    let activating = false;

    // for when no scene controller is loaded initially
    const initViewport = new GameViewPort( gameSurface, true );
    initViewport.fullScreen();
    initViewport.orbit.setTarget(initialStartLocation.x, initialStartLocation.y, initialStartLocation.z);
    const viewports: GameViewPort[] = [initViewport]

    const createViewports = (n = 4) => range( 0, n ).map( i => new GameViewPort( gameSurface, i === 0 ) );

    let sceneController: SceneController | null = null;

    const _target = new Vector3();
    const _position = new Vector3();
    const _audioPosition = new Vector3();

    const janitor = new Janitor( "ViewInputComposer" );

    world.events.on( "resize", ( ) => {
        for ( const viewport of viewports ) {
            if ( viewport.camera instanceof PerspectiveCamera ) {
                viewport.camera.aspect = viewport.aspect;
            }
            viewport.camera.updateProjectionMatrix();
        }
    } );

    world.events.on( "dispose", () => {
        janitor.dispose();
    } );

    return {
        api: {
            get viewport() {
                return viewports[0];
            },
            get secondViewport() {
                return viewports[1];
            },
            viewports,
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
            
        },

        get viewports() {
            return viewports;
        },

        deactivate() {
            sceneController = null;
        },

        /**
         * Activates a scene controller plugin. 
         * Runs events on the previous scene controller if it exists.
         * Resets all viewports.
         * 
         * @param newController 
         * @param globalData 
         * @returns 
         */
        async activate(
            newController: SceneController,
        ) {
            if ( activating ) {
                return;
            }
            activating = true;

            let prevData = this.generatePrevData() 

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
            
            for (const viewport of viewports) {
                viewport.dispose();
            }

            viewports.length = 0;
            viewports.push(...createViewports(newController.viewportsCount));

            await newController.onEnterScene( prevData );
            sceneController = newController;
        
            world.events.emit( "scene-controller-enter", newController.name );

            activating = false;
        },

        /**
         * Primary viewport is necessary because audio will require a camera position, and depth of field will only apply in one viewport for performance.
         */
        get primaryViewport(): GameViewPort  {
            return viewports[0];
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
            return  viewports[0].generatePrevData();
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
                for ( const v of viewports ) {
                    if ( !v.enabled || !v.cameraShake.enabled ) {
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

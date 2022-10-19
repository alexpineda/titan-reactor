import { ImageBufferView } from "@buffer-view/images-buffer-view";
import { SpritesBufferViewIterator } from "@buffer-view/sprites-buffer-view-iterator";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
import { applyRenderModeToImageHD } from "@core/model-effects";
import { PostProcessingBundler } from "@render/postprocessing-bundler";
import { renderComposer } from "@render/render-composer";
import { settingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { spriteSortOrder } from "@utils/sprite-utils";
import { Settings } from "common/types";
import { Assets } from "@image/assets";
import {
    MathUtils,
    Object3D,
    OrthographicCamera,
    PerspectiveCamera,
    Vector3,
} from "three";
import { SceneComposer } from "./scene-composer";
import shallow from "zustand/shallow";
import { ViewControllerComposer } from "@core/world/view-composer";
import { World } from "./world";
import { isMesh } from "@utils/image-utils";

//tank base, minerals
const ignoreRecieveShadow = [ 250, 253, 347, 349, 351 ];
const ignoreCastShadow = [ 347, 349, 351 ];

export type PostProcessingComposer = ReturnType<typeof createPostProcessingComposer>;

export const createPostProcessingComposer = (
    world: World,
    { scene, images, sprites, terrain, ...sceneComposer }: SceneComposer,
    viewports: ViewControllerComposer,
    assets: Assets
) => {
    const janitor = new Janitor( "PostProcessingComposer" );

    const postProcessingBundle = janitor.mop(
        new PostProcessingBundler(
            settingsStore().data.postprocessing,
            world.fogOfWarEffect
        ),
        "postProcessingBundle"
    );

    const updatePostProcessingOptions = (
        options: Settings["postprocessing"] | Settings["postprocessing3d"]
    ) => {
        postProcessingBundle.options = options;
        postProcessingBundle.update();

        if ( postProcessingBundle.options3d ) {
            for ( const image of images ) {
                if ( image instanceof Image3D ) {
                    image.image3dMaterial.envMapIntensity =
                        postProcessingBundle.options3d.envMap;
                }
            }

            if (
                postProcessingBundle.options3d.shadowQuality !==
                scene.sunlight.shadowQuality
            ) {
                scene.createSunlight();
                scene.sunlight.shadowQuality =
                    postProcessingBundle.options3d.shadowQuality;
            }

            scene.sunlight.setPosition(
                postProcessingBundle.options3d.sunlightDirection[0],
                postProcessingBundle.options3d.sunlightDirection[1],
                postProcessingBundle.options3d.sunlightDirection[2]
            );
            scene.sunlight.intensity = postProcessingBundle.options3d.sunlightIntensity;
            scene.sunlight.setColor( postProcessingBundle.options3d.sunlightColor );
            scene.sunlight.needsUpdate();

            terrain.envMapIntensity = postProcessingBundle.options3d.envMap;
        }
    };

    const addToBloom = ( image: Object3D ) => {
        if ( isMesh( image ) ) {
            postProcessingBundle.addBloomSelection( image );
        }

        for ( const child of image.children ) {
            addToBloom( child );
        }
    };

    world.events.on( "image-created", ( image ) => {
        addToBloom( image );

        if ( image instanceof Image3D && postProcessingBundle.options3d ) {
            image.image3dMaterial.envMapIntensity =
                postProcessingBundle.options3d.envMap;
            image.castShadow = !ignoreCastShadow.includes(
                assets.refId( image.dat.index )
            );
            image.receiveShadow = !ignoreRecieveShadow.includes(
                assets.refId( image.dat.index )
            );
        }
    } );

    const _transition = {
        enabled: false,
        progress: 0,
        onComplete: () => {},
    };

    const _startTransition = ( fn: () => void ) => {
        if ( _transition.enabled ) {
            return;
        }
        _transition.progress = 0;
        _transition.onComplete = fn;
        _transition.enabled = true;

        postProcessingBundle.enablePixelation( true );
        postProcessingBundle.setPixelation( 0 );
    };

    const _updateTransition = ( delta: number ) => {
        if ( !_transition.enabled ) {
            return;
        }
        _transition.progress += 0.005 * Math.min( delta, 16 );
        postProcessingBundle.setPixelation(
            MathUtils.pingpong( _transition.progress ) * 8
        );

        if ( _transition.progress > 2 ) {
            _transition.enabled = false;
            postProcessingBundle.enablePixelation( false );
        } else if ( _transition.progress > 1 ) {
            _transition.onComplete();
        }
    };

    const _changeRenderMode = ( renderMode3D: boolean ) => {
        const postprocessing = renderMode3D
            ? world.settings.getState().postprocessing3d
            : world.settings.getState().postprocessing;

        terrain.setTerrainQuality( renderMode3D, postprocessing.anisotropy );
        scene.setBorderTileColor( renderMode3D ? 0xffffff : 0x999999 );
        scene.sunlight.enabled = renderMode3D;
        images.use3dImages = renderMode3D;
        updatePostProcessingOptions( postprocessing );
    };

    const _target = new Vector3();
    const spritesIterator = new SpritesBufferViewIterator( world.openBW );
    const imageBufferView = new ImageBufferView( world.openBW );

    world.events.on( "settings-changed", ( { settings, rhs } ) => {
        if ( viewports.primaryRenderMode3D && rhs.postprocessing3d ) {
            if ( !shallow( postProcessingBundle.options, settings.postprocessing3d ) ) {
                updatePostProcessingOptions( settings.postprocessing3d );
            }
        } else if ( !viewports.primaryRenderMode3D && rhs.postprocessing ) {
            if ( !shallow( postProcessingBundle.options, settings.postprocessing ) ) {
                updatePostProcessingOptions( settings.postprocessing );
            }
        }
    } );

    world.events.on( "dispose", () => janitor.dispose() );

    return {
        precompile( camera: PerspectiveCamera | OrthographicCamera ) {
            _changeRenderMode( true );
            renderComposer.setBundlePasses( postProcessingBundle );
            renderComposer.composer.setMainScene( scene );
            renderComposer.composer.setMainCamera( camera );

            sceneComposer.onFrame( 0, 0, true, 0 );

            renderComposer.getWebGLRenderer().compile( scene, camera );

            _changeRenderMode( false );
            renderComposer.setBundlePasses( postProcessingBundle );
            renderComposer.composer.setMainScene( scene );
            renderComposer.composer.setMainCamera( camera );

            sceneComposer.onFrame( 0, 0, false, 0 );

            renderComposer.getWebGLRenderer().compile( scene, camera );

            renderComposer.render( 0 );
        },
        api: {
            changeRenderMode( renderMode3D?: boolean ) {
                const newRenderMode = renderMode3D ?? !viewports.primaryRenderMode3D;
                _startTransition( () => viewports.changeRenderMode( newRenderMode ) );
            },
        },
        startTransition( fn: () => void ) {
            _startTransition( fn );
        },
        get overlayScene() {
            return postProcessingBundle.overlayScene;
        },

        get overlayCamera() {
            return postProcessingBundle.overlayCamera;
        },

        render( delta: number, elapsed: number ) {
            _updateTransition( delta );

            viewports.primaryViewport!.orbit.getTarget( _target );
            _target.setY( terrain.getTerrainY( _target.x, _target.z ) );

            for ( const v of viewports.activeViewports() ) {
                v.update( world.settings.getState().input.dampingFactor, delta );

                if ( v === viewports.primaryViewport ) {
                    if ( v.needsUpdate ) {
                        _changeRenderMode( v.renderMode3D );
                        // world.reset!();
                        v.needsUpdate = false;
                    }
                    postProcessingBundle.updateDofTarget( _target );
                } else {
                    // iterate all images again and update image frames according to different view camera
                    //TODO: iterate over image objects and add image address to get buffer view

                    v.updateDirection32();

                    for ( const spriteBuffer of spritesIterator ) {
                        const object = sprites.get( spriteBuffer.index );

                        if ( !object || !object.visible ) continue;

                        object.renderOrder = v.renderMode3D
                            ? 0
                            : spriteSortOrder( spriteBuffer );

                        for ( const imgAddr of spriteBuffer.images.reverse() ) {
                            const imageBuffer = imageBufferView.get( imgAddr );
                            const image = images.get( imageBuffer.index );

                            if ( image instanceof ImageHD ) {
                                applyRenderModeToImageHD(
                                    imageBuffer,
                                    image,
                                    v.renderMode3D,
                                    v.camera.userData.direction
                                );
                            }
                        }
                    }
                }

                v.shakeStart(
                    elapsed,
                    world.settings.getState().input.cameraShakeStrength
                );
                renderComposer.setBundlePasses( postProcessingBundle );
                renderComposer.composer.setMainCamera( v.camera );
                renderComposer.composer.setMainScene( scene );

                renderComposer.render( delta, v.viewport );
                v.shakeEnd();
            }

            renderComposer.renderBuffer();
        },
    };
};

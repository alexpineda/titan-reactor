import { ImageBufferView } from "@buffer-view/images-buffer-view";
import { SpritesBufferViewIterator } from "@buffer-view/sprites-buffer-view-iterator";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
import { applyRenderModeToImageHD } from "@core/model-effects";
import { EffectivePasses, PostProcessingBundler } from "@render/postprocessing-bundler";
import { renderComposer } from "@render/render-composer";
import { settingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { spriteSortOrder } from "@utils/sprite-utils";
import { Settings } from "common/types";
import { Assets } from "@image/assets";
import { Mesh, Object3D, PerspectiveCamera, Vector3 } from "three";
import { SceneComposer } from "./scene-composer";
import shallow from "zustand/shallow";
import { ViewInputComposer } from "@core/world/view-composer";
import { World } from "./world";

//tank base, minerals
const ignoreRecieveShadow = [250, 253, 347, 349, 351];
const ignoreCastShadow = [347, 349, 351];

export type PostProcessingComposer = ReturnType<typeof createPostProcessingComposer>;

export const createPostProcessingComposer = (
    world: World,
    { scene, images, sprites, terrain }: SceneComposer,
    viewportsComposer: ViewInputComposer,
    assets: Assets
) => {
    const janitor = new Janitor( "PostProcessingComposer" );

    const postProcessingBundle = janitor.mop(
        new PostProcessingBundler(
            new PerspectiveCamera(),
            scene,
            settingsStore().data.postprocessing,
            world.fogOfWarEffect
        ),
        "postProcessingBundle"
    );

    const updatePostProcessingOptions = (
        options: Settings["postprocessing"] | Settings["postprocessing3d"]
    ) => {
        postProcessingBundle.camera = viewportsComposer.primaryCamera!;
        postProcessingBundle.scene = scene;
        postProcessingBundle.options = options;
        postProcessingBundle.needsUpdate = true;

        // do this after changing render mode as Extended differs
        postProcessingBundle.effectivePasses =
            viewportsComposer.numActiveViewports > 1
                ? EffectivePasses.Standard
                : EffectivePasses.Extended;

        if ( postProcessingBundle.options3d ) {
            for ( const image of images ) {
                if ( image instanceof Image3D ) {
                    image.material.envMapIntensity =
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

    world.events.on( "image-destroyed", ( image ) => {
        if ( postProcessingBundle.debugSelection ) {
            postProcessingBundle.debugSelection.delete( image );
        }
    } );

    const addToBloom = ( image: Object3D ) => {
        if ( image instanceof Mesh ) {
            postProcessingBundle.addBloomSelection( image );
        }

        for ( const child of image.children ) {
            addToBloom( child );
        }
    };

    world.events.on( "image-created", ( image ) => {
        addToBloom( image );

        if ( image instanceof Image3D && postProcessingBundle.options3d ) {
            image.material.envMapIntensity = postProcessingBundle.options3d.envMap;
            image.castShadow = !ignoreCastShadow.includes(
                assets.refId( image.dat.index )
            );
            image.receiveShadow = !ignoreRecieveShadow.includes(
                assets.refId( image.dat.index )
            );
        }
    } );

    const changeRenderMode = ( renderMode3D: boolean ) => {
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

    world.events.on( "dispose", () => janitor.dispose() );

    return Object.freeze( {
        changeRenderMode,
        get overlayScene() {
            return postProcessingBundle.overlayScene;
        },

        get overlayCamera() {
            return postProcessingBundle.overlayCamera;
        },

        updatePostProcessingOptions(
            options: Settings["postprocessing"] | Settings["postprocessing3d"]
        ) {
            if ( !shallow( postProcessingBundle.options, options ) ) {
                updatePostProcessingOptions( options );
            }
        },

        render( delta: number, elapsed: number ) {
            for ( const v of viewportsComposer.activeViewports() ) {
                if ( v === viewportsComposer.primaryViewport ) {
                    if ( v.needsUpdate ) {
                        changeRenderMode( v.renderMode3D );
                        // world.reset!();
                        v.needsUpdate = false;
                    }

                    v.orbit.getTarget( _target );
                    _target.setY( terrain.getTerrainY( _target.x, _target.z ) );
                    postProcessingBundle.updateExtended( v.camera, _target );
                } else {
                    // iterate all images again and update image frames according to different view camera
                    //TODO: iterate over image objects and add image address to get buffer view

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

                v.updateCamera( world.settings.getState().input.dampingFactor, delta );
                v.shakeStart(
                    elapsed,
                    world.settings.getState().input.cameraShakeStrength
                );
                postProcessingBundle.updateCamera( v.camera );
                renderComposer.setBundlePasses( postProcessingBundle );
                renderComposer.render( delta, v.viewport );
                v.shakeEnd();
            }

            renderComposer.renderBuffer();
        },
    } );
};

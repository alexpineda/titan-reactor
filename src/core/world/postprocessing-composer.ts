import { Image3D } from "@core/image-3d";
import { applyRenderModeToImageHD } from "@core/model-effects";
import { PostProcessingBundler } from "@render/postprocessing-bundler";
import { renderComposer } from "@render/render-composer";
import { settingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { spriteSortOrder } from "@utils/sprite-utils";
import { Settings } from "common/types";
import { Assets } from "@image/assets";
import { Object3D, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { SceneComposer } from "./scene-composer";
import shallow from "zustand/shallow";
import { ViewControllerComposer } from "@core/world/view-controller-composer";
import { World } from "./world";
import { isImageHd, isMesh } from "@utils/image-utils";
import { createTransition } from "./transition";

//tank base, minerals
const ignoreRecieveShadow = [250, 253, 347, 349, 351];
const ignoreCastShadow = [347, 349, 351];

export type PostProcessingComposer = ReturnType<typeof createPostProcessingComposer>;
export type PostProcessingComposerApi = PostProcessingComposer["api"];

// TODO: Change to ViewPortsRenderer
// Manages all our post processing options and ensures we render all our 2.5D stuff in the correct camera directions per viewport.
// Renders each viewport.
export const createPostProcessingComposer = (
    world: World,
    { scene, images, sprites, terrain, ...sceneComposer }: SceneComposer,
    viewportsComposer: ViewControllerComposer,
    assets: Assets
) => {
    const janitor = new Janitor("PostProcessingComposer");

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
        postProcessingBundle.update(renderComposer);

        if (postProcessingBundle.options3d) {
            for (const image of images) {
                if (image instanceof Image3D) {
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
            scene.sunlight.setColor(postProcessingBundle.options3d.sunlightColor);
            scene.sunlight.needsUpdate();

            terrain.envMapIntensity = postProcessingBundle.options3d.envMap;
        }
    };

    const addToBloom = (image: Object3D) => {
        if (isMesh(image)) {
            postProcessingBundle.addBloomSelection(image);
        }

        for (const child of image.children) {
            addToBloom(child);
        }
    };

    world.events.on("image-created", (image) => {
        addToBloom(image);

        if (image instanceof Image3D && postProcessingBundle.options3d) {
            image.image3dMaterial.envMapIntensity =
                postProcessingBundle.options3d.envMap;
            image.castShadow = !ignoreCastShadow.includes(
                assets.refId(image.dat.index)
            );
            image.receiveShadow = !ignoreRecieveShadow.includes(
                assets.refId(image.dat.index)
            );
        }
    });

    const transition = createTransition(
        () => {
            postProcessingBundle.enablePixelation(true);
            postProcessingBundle.setPixelation(0);
        },
        (progress) => {
            postProcessingBundle.setPixelation(progress * 16);
        },
        () => {
            postProcessingBundle.enablePixelation(false);
        }
    );

    const _changeRenderMode = (renderMode3D: boolean) => {
        const postprocessing = renderMode3D
            ? world.settings.getState().postprocessing3d
            : world.settings.getState().postprocessing;

        terrain.setTerrainQuality(renderMode3D, postprocessing.anisotropy);
        terrain.shadowsEnabled = renderMode3D;
        scene.setBorderTileColor(renderMode3D ? 0xffffff : 0x999999);
        scene.sunlight.enabled = renderMode3D;
        images.use3dImages = renderMode3D;
        updatePostProcessingOptions(postprocessing);
    };

    const _target = new Vector3();

    world.events.on("settings-changed", ({ settings, rhs }) => {
        if (viewportsComposer.primaryRenderMode3D && rhs.postprocessing3d) {
            if (!shallow(postProcessingBundle.options, settings.postprocessing3d)) {
                updatePostProcessingOptions(settings.postprocessing3d);
            }
        } else if (!viewportsComposer.primaryRenderMode3D && rhs.postprocessing) {
            if (!shallow(postProcessingBundle.options, settings.postprocessing)) {
                updatePostProcessingOptions(settings.postprocessing);
            }
        }
    });

    world.events.on("dispose", () => janitor.dispose());

    return {
        precompile(camera: PerspectiveCamera | OrthographicCamera) {
            _changeRenderMode(false);
            sceneComposer.onFrame(0, 0, false);

            renderComposer.glRenderer.compile(scene, camera);
        },
        api: {
            changeRenderMode(renderMode3D?: boolean) {
                const newRenderMode =
                    renderMode3D ?? !viewportsComposer.primaryRenderMode3D;
                transition.start(() =>
                    viewportsComposer.changeRenderMode(newRenderMode)
                );
            },
        },
        startTransition(fn: () => void) {
            transition.start(fn);
        },

        get overlayScene() {
            return postProcessingBundle.overlayScene;
        },

        get overlayCamera() {
            return postProcessingBundle.overlayCamera;
        },

        render(delta: number, elapsed: number) {
            transition.update(delta);

            viewportsComposer.primaryViewport!.orbit.getTarget(_target);
            _target.setY(terrain.getTerrainY(_target.x, _target.z));

            for (const v of viewportsComposer.viewports) {
                if (!v.enabled) continue;

                v.update(world.settings.getState().input.dampingFactor, delta);

                if (v === viewportsComposer.primaryViewport) {
                    if (v.needsUpdate) {
                        _changeRenderMode(v.renderMode3D);
                        // world.reset!();
                        v.needsUpdate = false;
                    }
                    postProcessingBundle.updateDofTarget(_target);
                }

                //todo; make this bettta?
                postProcessingBundle.overlayScene.getObjectByName("minimap")!.visible =
                    v === viewportsComposer.primaryViewport;

                // iterate all images again and update image frames according to different view camera
                for (const spriteStruct of world.openBW.iterators.sprites) {
                    const object = sprites.get(spriteStruct.index);

                    if (!object || !object.visible) continue;

                    object.renderOrder = v.renderMode3D
                        ? 0
                        : spriteSortOrder(spriteStruct);

                    for (const imgAddr of spriteStruct.images.reverse()) {
                        const imageStruct = world.openBW.structs.image.get(imgAddr);
                        //TODO: why would image not exist here?
                        const image = images.get(imageStruct.index);

                        if (image && isImageHd(image)) {
                            //todo: remove the necessity for imageStruct by copying it into image
                            applyRenderModeToImageHD(
                                imageStruct,
                                image,
                                v.renderMode3D,
                                v.direction32
                            );
                        }
                    }
                }

                v.shakeStart(
                    elapsed,
                    world.settings.getState().input.cameraShakeStrength
                );

                renderComposer.render(
                    delta,
                    scene,
                    v.camera,
                    v.viewport,
                    postProcessingBundle
                );
                v.shakeEnd();
            }
        },
    };
};

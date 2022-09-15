import { ImageBufferView } from "@buffer-view/images-buffer-view";
import { SpritesBufferViewIterator } from "@buffer-view/sprites-buffer-view-iterator";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
import { applyViewportToFrameOnImageHD } from "@core/model-effects";
import { EffectivePasses, PostProcessingBundler } from "@render/postprocessing-bundler";
import { renderComposer } from "@render/render-composer";
import settingsStore from "@stores/settings-store";
import Janitor from "@utils/janitor";
import { spriteSortOrder } from "@utils/sprite-utils";
import { Assets, Settings } from "common/types";
import { PerspectiveCamera, Vector3 } from "three";
import { SceneComposer } from "./scene-composer";
import shallow from "zustand/shallow";
import { ViewComposer } from "@core/world/view-composer";
import { World } from "./world";
import { InputComposer } from "./input-composer";
import { SurfaceComposer } from "./surface-composer";
import { UnitSelectionStatus } from "@input/";

//tank base, minerals
const ignoreRecieveShadow = [250, 253, 347, 349, 351];
const ignoreCastShadow = [347, 349, 351];

export const createPostProcessingComposer = ({ settings, fogOfWarEffect, openBW, events }: World, { scene, images, sprites, terrain }: SceneComposer, { gameSurface }: SurfaceComposer, viewportsComposer: ViewComposer, inputs: InputComposer, assets: Assets) => {
    const janitor = new Janitor();

    const postProcessingBundle = janitor.mop(
        new PostProcessingBundler(
            new PerspectiveCamera,
            scene,
            settingsStore().data.postprocessing,
            fogOfWarEffect, assets)
    );


    const updatePostProcessingOptions = (options: Settings["postprocessing"] | Settings["postprocessing3d"]) => {

        postProcessingBundle.camera = viewportsComposer.primaryCamera!;
        postProcessingBundle.scene = scene;
        postProcessingBundle.options = options;
        postProcessingBundle.needsUpdate = true;

        // do this after changing render mode as Extended differs
        postProcessingBundle.effectivePasses = viewportsComposer.numActiveViewports > 1 ? EffectivePasses.Standard : EffectivePasses.Extended;

        if (postProcessingBundle.options3d) {

            for (const image of images) {
                if (image instanceof Image3D) {
                    image.material.envMapIntensity = postProcessingBundle.options3d.envMap;
                }
            }

            if (postProcessingBundle.options3d.shadowQuality !== scene.sunlight.shadowQuality) {
                scene.createSunlight();
                scene.sunlight.shadowQuality = postProcessingBundle.options3d.shadowQuality;
            }
            scene.sunlight.shadowIntensity = postProcessingBundle.options3d.shadowIntensity;
            scene.sunlight.setPosition(postProcessingBundle.options3d.sunlightDirection[0], postProcessingBundle.options3d.sunlightDirection[1], postProcessingBundle.options3d.sunlightDirection[2]);
            scene.sunlight.intensity = postProcessingBundle.options3d.sunlightIntensity;
            scene.sunlight.setColor(postProcessingBundle.options3d.sunlightColor);
            scene.sunlight.needsUpdate();

            terrain.envMapIntensity = postProcessingBundle.options3d.envMap;

        }

    }

    events.on("image-destroyed", (image) => {
        postProcessingBundle.removeBloomSelection(image);
        if (postProcessingBundle.debugSelection)
            postProcessingBundle.debugSelection.delete(image);
    });

    events.on("image-created", (image) => {
        postProcessingBundle.addBloomSelection(image);
        if (image instanceof Image3D && postProcessingBundle.options3d) {
            image.material.envMapIntensity = postProcessingBundle.options3d.envMap;
            image.castShadow = !ignoreCastShadow.includes(assets.refId(image.dat.index));
            image.receiveShadow = !ignoreRecieveShadow.includes(assets.refId(image.dat.index));;
        }
    });

    postProcessingBundle.cursorEffect.resolution.set(gameSurface.bufferWidth, gameSurface.bufferHeight);
    events.on("resize", (surface) => {
        postProcessingBundle.cursorEffect.resolution.set(surface.bufferWidth, surface.bufferHeight);
    })

    const changeRenderMode = (renderMode3D: boolean) => {

        const postprocessing = renderMode3D ? settings.getState().postprocessing3d : settings.getState().postprocessing;

        terrain.setTerrainQuality(renderMode3D, postprocessing.anisotropy);
        scene.setBorderTileColor(renderMode3D ? 0xffffff : 0x999999);
        scene.sunlight.enabled = renderMode3D;
        images.use3dImages = renderMode3D;
        updatePostProcessingOptions(postprocessing);

    }

    const _target = new Vector3();
    const spritesIterator = new SpritesBufferViewIterator(openBW);
    const imageBufferView = new ImageBufferView(openBW);
    let _onRenderModeChange = () => { };

    return Object.freeze({
        get cursorEffect() {
            return postProcessingBundle.cursorEffect
        },
        onRenderModeChange(listener: () => void) {
            _onRenderModeChange = listener;
        },
        changeRenderMode,
        updatePostProcessingOptions(options: Settings["postprocessing"] | Settings["postprocessing3d"]) {
            if (shallow(postProcessingBundle.options, options) === false) {
                updatePostProcessingOptions(options)
            }
        },
        dispose() {
            janitor.dispose();
        },
        onFrameReset() {
            postProcessingBundle.clearBloomSelection();
        },
        render(delta: number, elapsed: number) {

            postProcessingBundle.cursorEffect.cursorPosition.set(inputs.mousePosition.x, inputs.mousePosition.y);
            if (inputs.unitSelectionStatus === UnitSelectionStatus.Dragging) {
                postProcessingBundle.cursorEffect.drag();
            } else if (inputs.unitSelectionStatus === UnitSelectionStatus.Hovering) {
                postProcessingBundle.cursorEffect.hover();
            } else {
                postProcessingBundle.cursorEffect.pointer();
            }

            // global won't use camera so we can set it to any
            for (const v of viewportsComposer.activeViewports()) {

                if (v === viewportsComposer.primaryViewport) {

                    if (v.needsUpdate) {
                        changeRenderMode(v.renderMode3D);
                        _onRenderModeChange();
                        v.needsUpdate = false;
                    }

                    v.orbit.getTarget(_target);
                    _target.setY(terrain.getTerrainY(_target.x, _target.z));
                    postProcessingBundle.updateExtended(v.camera, _target)

                } else {
                    // iterate all images again and update image frames according to different view camera
                    //TODO: iterate over image objects and add image address to get buffer view
                    for (const spriteBuffer of spritesIterator) {

                        const object = sprites.get(spriteBuffer.index);
                        if (!object || object.visible === false) continue;

                        object.renderOrder = v.renderMode3D ? 0 : spriteSortOrder(spriteBuffer);

                        for (const imgAddr of spriteBuffer.images.reverse()) {

                            const imageBuffer = imageBufferView.get(imgAddr);
                            const image = images.get(imageBuffer.index);

                            if (image instanceof ImageHD) {
                                applyViewportToFrameOnImageHD(imageBuffer, image, v);
                            }

                        }
                    }
                }

                v.updateCamera(settings.getState().game.dampingFactor, delta);
                v.shakeStart(elapsed, settings.getState().game.cameraShakeStrength);
                postProcessingBundle.updateCamera(v.camera)
                renderComposer.setBundlePasses(postProcessingBundle);
                renderComposer.render(delta, v.viewport);
                v.shakeEnd();

            }

            renderComposer.renderBuffer();
        }
    })
}
import { ImageBufferView } from "@buffer-view/images-buffer-view";
import gameStore from "@stores/game-store";
import { applyCameraDirectionToImageFrame } from "@utils/camera-utils";
import { imageHasDirectionalFrames, imageIsFlipped, imageIsHidden } from "@utils/image-utils";
import { getAngle } from "@utils/unit-utils";
import { Image3D } from "./image-3d";
import { ImageHD } from "./image-hd";
import { ImageHDInstanced } from "./image-hd-instanced";
import { spriteModelEffects } from "./model-effects-configuration";
import { Unit } from "./unit";

if (module.hot) {
    module.hot.accept(
        "./model-effects-configuration",
    )
}

export const overlayEffectsMainImage: { image: Image3D | null } = { image: null };

/**
 * 
 * 3D models require additional contextual information to render and cooperate with overlays properly
*
*/
let imageTypeId: number;
export const applyOverlayEffectsToImageHD = (imageBuffer: ImageBufferView, image: ImageHD | ImageHDInstanced) => {

    imageTypeId = gameStore().assets!.refId(imageBuffer.typeId);

    if (spriteModelEffects.images[imageTypeId]) {
        for (const effect of spriteModelEffects.images[imageTypeId]) {
            switch (effect.type) {
                // set emissive on main image if I'm visible
                case "emissive:overlay-visible":
                    if (overlayEffectsMainImage.image) {
                        overlayEffectsMainImage.image.setEmissive(imageIsHidden(imageBuffer) ? 0 : 1);
                    }
                    break;
                case "flat-on-ground":
                    image.material.flatProjection = false;
                    image.rotation.x = -Math.PI / 2;
                    break;
            }
        }
    }

}

let _frameInfo: { frame: number, flipped: boolean } = { frame: 0, flipped: false };
let _needsUpdateFrame = false;

export const applyViewportToFrameOnImageHD = (imageBuffer: ImageBufferView, image: ImageHD, renderMode3D: boolean, direction: number) => {

    imageTypeId = gameStore().assets!.refId(imageBuffer.typeId);


    // if (image.material.depthTest !== viewport.renderMode3D) {

    image.material.depthTest = renderMode3D;
    image.material.depthWrite = false;

    // }

    if (imageHasDirectionalFrames(imageBuffer)) {

        //TODO: applyCameraDirectionToImageFrameOffset?
        _frameInfo = applyCameraDirectionToImageFrame(direction, imageBuffer);

    } else {

        _frameInfo.frame = imageBuffer.frameIndex;
        _frameInfo.flipped = imageIsFlipped(imageBuffer);

    }

    if (renderMode3D && spriteModelEffects.images[imageTypeId]) {

        for (const effect of spriteModelEffects.images[imageTypeId]) {
            switch (effect.type) {
                case "fixed-frame":
                    _frameInfo.frame = effect.frame;
                    _frameInfo.flipped = false;
                    break;
                case "hide-sprite":
                    image.visible = false;
                    break;

            }
        }

    }

    image.setFrame(_frameInfo.frame, _frameInfo.flipped);

}

export const applyModelEffectsOnImage3d = (imageBufferView: ImageBufferView, image: Image3D, unit: Unit | undefined) => {

    imageTypeId = gameStore().assets!.refId(imageBufferView.typeId);
    _needsUpdateFrame = true;

    if (unit && image === overlayEffectsMainImage.image) {
        image.rotation.y = !image.isLooseFrame ? getAngle(unit.direction) : 0;
    }

    if (spriteModelEffects.images[imageTypeId]) {

        for (const effect of spriteModelEffects.images[imageTypeId]) {

            switch (effect.type) {
                // set emissive to myself if I'm on the right animation frame
                case "remap-frames":
                    image.setFrame(effect.remap(imageBufferView.frameIndex));
                    _needsUpdateFrame = false;
                    break;

                case "rotate":
                    image.rotation.y = image.rotation.y + effect.rotation;
                    break;

                case "emissive:frames":
                    if (image.setEmissive) {
                        image.setEmissive(effect.frames.includes(image.frameSet) ? 1 : 0);
                    }
                    break;
                case "scale":
                    image.scale.setScalar(effect.scale);
                    break;

            }
        }

    }

    if (_needsUpdateFrame) {

        image.setFrame(imageBufferView.frameIndex);

    }

}
import { ImageBufferView } from "@buffer-view/images-buffer-view";
import gameStore from "@stores/game-store";
import { applyCameraDirectionToImageFrame } from "@utils/camera-utils";
import { imageHasDirectionalFrames, imageIsFlipped, imageIsHidden } from "@utils/image-utils";
import { getAngle } from "@utils/unit-utils";
import { ImageStruct } from "common/types";
import { GameViewPort } from "../camera/game-viewport";
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
                // hide me
                case "hide-sprite":
                    if (overlayEffectsMainImage.image) {
                        image.visible = false;
                    }
                    break;
                case "flat-on-ground":
                    image.material.flatProjection = false;
                    image.rotation.x = -Math.PI / 2;
            }
        }
    }

}

export const applyOverlayEffectsToImage3D = (imageBufferView: ImageBufferView, image: Image3D) => {

    imageTypeId = gameStore().assets!.refId(imageBufferView.typeId);

    if (spriteModelEffects.images[imageTypeId]) {
        for (const effect of spriteModelEffects.images[imageTypeId]) {
            switch (effect.type) {
                // set emissive to myself if I'm on the right animation frame
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
}

let _frameInfo: { frame: number, flipped: boolean } = { frame: 0, flipped: false };
let _needsUpdateFrame = false;

export const applyViewportToFrameOnImageHD = (imageBuffer: ImageBufferView, image: ImageHD, viewport: GameViewPort) => {

    if (image.material.depthTest !== viewport.renderMode3D) {

        image.material.depthTest = viewport.renderMode3D;

    }

    if (imageHasDirectionalFrames(imageBuffer)) {

        _frameInfo = applyCameraDirectionToImageFrame(viewport.camera.userData.direction, imageBuffer);
        image.setFrame(_frameInfo.frame, _frameInfo.flipped);

    } else {

        image.setFrame(imageBuffer.frameIndex, imageIsFlipped(imageBuffer as ImageStruct));

    }

}

export const applyViewportToFrameOnImage3d = (imageBufferView: ImageBufferView, image: Image3D, unit: Unit | undefined) => {

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
            }
        }

    }

    if (_needsUpdateFrame) {

        // ignore camera direction since we are rotating the 3d model
        image.setFrame(imageBufferView.frameIndex);

    }

}
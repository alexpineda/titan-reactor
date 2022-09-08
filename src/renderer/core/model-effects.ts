import { ImageBufferView } from "@buffer-view/images-buffer-view";
import gameStore from "@stores/game-store";
import { applyCameraDirectionToImageFrame } from "@utils/camera-utils";
import { imageHasDirectionalFrames, imageIsFlipped, imageIsHidden } from "@utils/image-utils";
import { ImageStruct } from "common/types";
import { GameViewPort } from "../camera/game-viewport";
import { Image3D } from "./image-3d";
import { ImageHD } from "./image-hd";
import { ImageHDInstanced } from "./image-hd-instanced";

type SpriteModelImageEffectEmissiveFrames = {
    type: "emissive:frames";
    frames: number[];
}

type SpriteModelImageEffectEmissiveOverlay = {
    type: "emissive:overlay-visible";
}

type SpriteModelImageEffectHideSprite = {
    type: "hide-sprite";
}

type SpriteModelImageEffectFixedRotation = {
    type: "fixed-rotation";
    frames: number[];
}

type SpriteModelImageEffectFlatOnGround = {
    type: "flat-on-ground";
}

type SpriteModelImageEffectRemapFrame = {
    type: "remap-frames";
    remap: (frame: number) => number;
}


type SpriteModelImageEffects = SpriteModelImageEffectEmissiveFrames | SpriteModelImageEffectEmissiveOverlay | SpriteModelImageEffectHideSprite | SpriteModelImageEffectFixedRotation | SpriteModelImageEffectFlatOnGround | SpriteModelImageEffectRemapFrame;

type SpriteModelEffects = {
    images: {
        [key: number]: SpriteModelImageEffects[];
    }
}

const remnants = [7, 16, 20, 24, 32, 37, 53, 57, 89, 124, 230, 241, 920, 946].map(id => ({ [id]: [{ type: "flat-on-ground" }] })).reduce((a, b) => ({ ...a, ...b }), {});

const spriteModelEffects: SpriteModelEffects = {
    images: {
        // marine + marine death (242)
        239: [
            {
                type: "emissive:frames",
                frames: [3]
            },

            //FIXME we are setting this automatically via isLooseFrame testing, deprecate?
            // {
            //     type: "fixed-rotation",
            //     frames: [13, 14, 15, 16, 17, 18, 19, 20]
            // }
        ],
        //command center overlay
        276: [
            {
                // set emissive to main image (eg. 275) if this overlay is visible
                type: "emissive:overlay-visible",
            },
            {
                // never draw this image
                type: "hide-sprite"
            }
        ],
        251: [
            {
                // regular tank turret uses siege tank turret frame 1
                type: "remap-frames",
                remap: (frame: number) => frame + 17
            }
        ],
        ...remnants
    }
}

export const modelSetFileRefIds = new Map([
    // siege turret -> siege base
    [251, 254],
    // lurker egg -> egg,
    [914, 21]

]);

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
                case "fixed-rotation":
                    if (effect.frames.includes(image.frameSet)) {
                        image.rotation.y = 0;
                    }
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

export const applyViewportToFrameOnImage3d = (imageBufferView: ImageBufferView, image: Image3D) => {

    imageTypeId = gameStore().assets!.refId(imageBufferView.typeId);
    _needsUpdateFrame = true;

    if (spriteModelEffects.images[imageTypeId]) {

        for (const effect of spriteModelEffects.images[imageTypeId]) {
            switch (effect.type) {
                // set emissive to myself if I'm on the right animation frame
                case "remap-frames":
                    image.setFrame(effect.remap(imageBufferView.frameIndex));
                    _needsUpdateFrame = false;
                    break;
            }
        }

    }

    if (_needsUpdateFrame && imageHasDirectionalFrames(imageBufferView)) {

        // ignore camera direction since we are rotating the 3d model
        image.setFrame(imageBufferView.frameIndex);

    }

}
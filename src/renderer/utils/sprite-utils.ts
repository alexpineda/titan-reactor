import { SpriteFlags } from "common/enums";
import { SpriteRenderOptions, SpriteStruct, SpriteType } from "common/types";
import { ImageBufferView } from "../buffer-view/images-buffer-view";
import { imageHasDirectionalFrames } from "./image-utils";
import { applyCameraDirectionToImageFrame } from "./camera-utils";
import DirectionalCamera from "../camera/directional-camera";
import { ImageHD } from "@core/image-hd";
import { SpritesBufferView } from "@buffer-view/sprites-buffer-view";
import { ImageBase } from "@core/image";
import { Image3D } from "@core/image-3d";


export const spriteSortOrder = (sprite: SpriteStruct) => {
    let score = 0;
    score |= sprite.elevation;
    score <<= 13;
    score |= sprite.elevation <= 4 ? sprite.y : 0;
    score <<= 1;
    score |= sprite.flags & SpriteFlags.Turret ? 1 : 0;
    return score;
}

export const spriteIsHidden = (sprite: SpriteStruct) => {
    return (sprite.flags & SpriteFlags.Hidden) !== 0;
}

let frameInfo: { frame: number, flipped: boolean } = { frame: 0, flipped: false };

/**
 * Apply viewport specific transformations before rendering a sprite.
 */
export const updateSpritesForViewport = (camera: DirectionalCamera, options: SpriteRenderOptions, spriteIterator: () => Generator<{
    bufferView: SpritesBufferView,
    object: SpriteType
}>, imageIterator: (spriteData: SpritesBufferView) => Generator<{
    bufferView: ImageBufferView,
    object: ImageBase
}>) => {

    ImageHD.useDepth = options.rotateSprites;

    for (const sprite of spriteIterator()) {
        if (sprite.object?.visible === false) {
            continue;
        }
        sprite.object!.renderOrder = ImageHD.useDepth ? 0 : sprite.object!.userData.renderOrder;

        for (const image of imageIterator(sprite.bufferView)) {

            if (image.object instanceof ImageHD) {
                if (image.object.material.depthTest !== ImageHD.useDepth) {
                    image.object.material.depthTest = ImageHD.useDepth;
                    image.object.setFrame(image.object.frame, image.object.flip)
                }
            }

            if (imageHasDirectionalFrames(image.bufferView)) {
                if (image.object instanceof ImageHD) {
                    frameInfo = applyCameraDirectionToImageFrame(camera, image.bufferView);
                } else {
                    // ignore camera direction since we are rotating the 3d model
                    frameInfo.frame = image.bufferView.frameIndex;
                }
                image.object.setFrame(frameInfo.frame, frameInfo.flipped);
            }
        }
    }
}
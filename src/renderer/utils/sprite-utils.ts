import { SpriteFlags } from "common/enums";
import { SpriteStruct, SpriteType } from "common/types";
import { ImageBufferView } from "../buffer-view/images-buffer-view";
import { imageHasDirectionalFrames } from "./image-utils";
import { applyCameraDirectionToImageFrame } from "./camera-utils";
import { ImageHD } from "@core/image-hd";
import { SpritesBufferView } from "@buffer-view/sprites-buffer-view";
import { ImageBase } from "@core/image";
import { Image3D } from "@core/image-3d";
import { applyViewportToFrameOnImage3d, applyViewportToFrameOnImageHD } from "@core/model-effects";

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


/**
 * Apply viewport specific transformations before rendering a sprite.
 */
export const updateSpritesForViewport = (cameraDirection: number, useDepth: boolean, spriteIterator: () => Generator<{
    bufferView: SpritesBufferView,
    object: SpriteType
}>, imageIterator: (spriteData: SpritesBufferView) => Generator<{
    bufferView: ImageBufferView,
    object: ImageBase
}>) => {

    ImageHD.useDepth = useDepth;

    for (const sprite of spriteIterator()) {

        if (sprite.object?.visible === false) {
            continue;
        }
        sprite.object!.renderOrder = useDepth ? 0 : sprite.object!.userData.renderOrder;

        for (const image of imageIterator(sprite.bufferView)) {

            if (image.object instanceof ImageHD) {

                applyViewportToFrameOnImageHD(image.bufferView, image.object as ImageHD, useDepth, cameraDirection);

            } else if (image.object instanceof Image3D) {

                applyViewportToFrameOnImage3d(image.bufferView, image.object);

            }


        }
    }
}
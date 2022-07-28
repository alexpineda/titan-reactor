import { SpriteFlags } from "common/enums";
import { SpriteRenderOptions, SpriteStruct, SpriteType } from "common/types";
import { ImageBufferView, SpritesBufferView } from "../buffer-view";
import { Vector3 } from "three";
import { Image } from "@core/image";
import { imageHasDirectionalFrames } from "./image-utils";
import { applyCameraDirectionToImageFrame } from "./camera-utils";
import DirectionalCamera from "../camera/directional-camera";
import ImageHD from "@core/image-hd";

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

const _cameraWorldDirection = new Vector3();

export const updateSpritesForViewport = (camera: DirectionalCamera, options: SpriteRenderOptions, spriteIterator: () => Generator<SpriteType | SpritesBufferView>, imageIterator: (spriteData: SpritesBufferView) => Generator<Image | ImageBufferView>) => {

    ImageHD.useDepth = options.rotateSprites;
    ImageHD.useScale = options.unitScale;

    camera.getWorldDirection(_cameraWorldDirection);
    let frameInfo: { frame: number, flipped: boolean } | null = null;

    for (const sprite of spriteIterator()) {
        if (sprite instanceof SpritesBufferView) {
            for (const image of imageIterator(sprite)) {

                if (image instanceof ImageBufferView) {
                    if (imageHasDirectionalFrames(image)) {
                        frameInfo = applyCameraDirectionToImageFrame(camera, image);
                    }
                } else {
                    if (image instanceof ImageHD) {
                        image.material.depthTest = ImageHD.useDepth;

                        if (image.scale.x !== ImageHD.useScale) {
                            image.scale.copy(image.originalScale);
                            image.scale.multiplyScalar(ImageHD.useScale);
                            image.matrixWorldNeedsUpdate = true;
                        }
                    }

                    if (frameInfo !== null) {
                        image.setFrame(frameInfo.frame, frameInfo.flipped);
                    }
                    if (image.matrixWorldNeedsUpdate) {
                        image.updateMatrix();
                        image.updateMatrixWorld();
                    }
                    frameInfo = null;
                }


            }
        } else {
            sprite.lookAt(sprite.position.x - _cameraWorldDirection.x, sprite.position.y - _cameraWorldDirection.y, sprite.position.z - _cameraWorldDirection.z);
            sprite.updateMatrix();
            sprite.updateMatrixWorld();
        }
    }
}
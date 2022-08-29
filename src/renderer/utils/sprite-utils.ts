import { SpriteFlags } from "common/enums";
import { SpriteRenderOptions, SpriteStruct, SpriteType } from "common/types";
import { ImageBufferView } from "../buffer-view/images-buffer-view";
import { Vector3 } from "three";
import { imageHasDirectionalFrames, imageIsHidden } from "./image-utils";
import { applyCameraDirectionToImageFrame } from "./camera-utils";
import DirectionalCamera from "../camera/directional-camera";
import { ImageHD } from "@core/image-hd";
import { GameViewportsDirector } from "renderer/camera/game-viewport-director";
import { SpritesBufferView } from "@buffer-view/sprites-buffer-view";
import { Image3D } from "@core/image-3d";

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

type SpriteModelImageEffects = SpriteModelImageEffectEmissiveFrames | SpriteModelImageEffectEmissiveOverlay | SpriteModelImageEffectHideSprite;

type SpriteModelEffects = {
    [key: number]: {
        images: {
            [key: number]: SpriteModelImageEffects[];
        }
    }
}

const spriteModelEffects: SpriteModelEffects = {
    // marine
    235: {
        images: {
            // marine
            239: [
                {
                    type: "emissive:frames",
                    frames: [3]
                }
            ]
        }
    },
    // command center
    252: {
        images: {
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
            ]
        }
    }
}

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

export const updateSpritesForViewport = (camera: DirectionalCamera, options: SpriteRenderOptions, spriteIterator: () => Generator<{
    bufferView: SpritesBufferView,
    object: SpriteType
}>, imageIterator: (spriteData: SpritesBufferView) => Generator<{
    bufferView: ImageBufferView,
    object: ImageHD | Image3D
}>) => {

    ImageHD.useDepth = options.rotateSprites;
    ImageHD.useScale = options.unitScale;

    let frameInfo: { frame: number, flipped: boolean } | null = null;
    let mainImage: ImageHD | Image3D | null = null;

    for (const sprite of spriteIterator()) {
        if (sprite.object?.visible) {
            for (const image of imageIterator(sprite.bufferView)) {

                if (sprite.bufferView.mainImageIndex === image.bufferView.index) {
                    mainImage = image.object;
                }

                if (imageHasDirectionalFrames(image.bufferView)) {
                    frameInfo = applyCameraDirectionToImageFrame(camera, image.bufferView);
                }
                if (frameInfo !== null) {
                    image.object.setFrame(frameInfo.frame, frameInfo.flipped);
                }

                if (image.object instanceof ImageHD) {
                    image.object.material.depthTest = ImageHD.useDepth;

                    if (image.object.scale.x !== ImageHD.useScale) {
                        image.object.scale.copy(image.object.originalScale);
                        image.object.scale.multiplyScalar(ImageHD.useScale);
                        image.object.matrixWorldNeedsUpdate = true;
                    }

                    if (spriteModelEffects[sprite.bufferView.typeId]) {
                        if (spriteModelEffects[sprite.bufferView.typeId]!.images[image.bufferView.typeId]) {
                            for (const effect of spriteModelEffects[sprite.bufferView.typeId]!.images[image.bufferView.typeId]) {
                                switch (effect.type) {
                                    case "emissive:overlay-visible":
                                        if (mainImage instanceof Image3D) {
                                            mainImage?.setEmissive(imageIsHidden(image.bufferView) ? 0 : 1);
                                        }
                                        break;
                                    case "hide-sprite":
                                        image.object.visible = false;
                                        break;
                                }
                            }
                        }
                    }
                } else if (image.object instanceof Image3D) {
                    if (spriteModelEffects[sprite.bufferView.typeId]) {
                        if (spriteModelEffects[sprite.bufferView.typeId]!.images[image.bufferView.typeId]) {
                            for (const effect of spriteModelEffects[sprite.bufferView.typeId]!.images[image.bufferView.typeId]) {
                                switch (effect.type) {
                                    case "emissive:frames":
                                        if (mainImage instanceof Image3D) {
                                            image.object.setEmissive(effect.frames.includes(image.object.frame) ? 1 : 0);
                                        }
                                        break;
                                }
                            }
                        }
                    }
                }



                if (image.object.visible && image.object.matrixWorldNeedsUpdate) {
                    image.object.updateMatrix();
                    image.object.updateMatrixWorld();
                }
                frameInfo = null;
            }

            sprite.object!.renderOrder = ImageHD.useDepth ? 0 : sprite.object!.userData.renderOrder;
            sprite.object!.updateMatrix();
            sprite.object!.updateMatrixWorld();
        }
    }
}

const _lowCameraPosition = new Vector3();

export const throttleSpriteUpdate = (gameViewportsDirector: GameViewportsDirector, spritePos: Vector3, spriteIsVisible: boolean, spriteUserData: any) => {
    let v = Infinity;
    for (const viewport of gameViewportsDirector.activeViewports()) {
        const a = viewport.orbit.getPosition(_lowCameraPosition).setY(spritePos.y).distanceTo(spritePos) / Math.min(500, viewport.orbit.maxDistance);
        v = Math.min(v, Math.floor((a * a * a * a)));
    }

    if (!spriteIsVisible || v > 0 && spriteUserData.renderTestCount > 0) {
        if (spriteUserData.renderTestCount < v) {
            spriteUserData.renderTestCount++;
        } else {
            spriteUserData.renderTestCount = 0;
        }
        return true;
    } else {
        spriteUserData.renderTestCount++;
        return false;
    }
}
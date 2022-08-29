import { SpriteFlags } from "common/enums";
import { SpriteRenderOptions, SpriteStruct, SpriteType } from "common/types";
import { ImageBufferView } from "../buffer-view/images-buffer-view";
import { Vector3 } from "three";
import { imageHasDirectionalFrames } from "./image-utils";
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

type SpriteModelImageEffectEmissiveVisibility = {
    type: "emissive:visibility";
    affects: number;
}

type SpriteModelImageEffectHideSprite = {
    type: "hide-sprite";
}

type SpriteModelImageEffects = SpriteModelImageEffectEmissiveFrames | SpriteModelImageEffectEmissiveVisibility | SpriteModelImageEffectHideSprite;

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
                    type: "emissive:visibility",
                    affects: 275
                },
                {
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
    object: SpriteType | undefined
}>, imageIterator: (spriteData: SpritesBufferView) => Generator<ImageHD | Image3D | ImageBufferView>) => {

    ImageHD.useDepth = options.rotateSprites;
    ImageHD.useScale = options.unitScale;

    let frameInfo: { frame: number, flipped: boolean } | null = null;

    for (const sprite of spriteIterator()) {
        for (const image of imageIterator(sprite.bufferView)) {

            if (image instanceof ImageBufferView) {
                if (imageHasDirectionalFrames(image)) {
                    frameInfo = applyCameraDirectionToImageFrame(camera, image);
                }
                // command center overlay
                // if (image.iscript.typeId === 103) {
                //     const bwDat = gameStore().assets!.bwDat;
                //     const iscript = bwDat.iscript.iscripts[image.iscript.typeId];
                //     debugger;
                // }
            } else {
                if (frameInfo !== null) {
                    image.setFrame(frameInfo.frame, frameInfo.flipped);
                }

                if (image instanceof ImageHD) {
                    image.material.depthTest = ImageHD.useDepth;

                    if (image.scale.x !== ImageHD.useScale) {
                        image.scale.copy(image.originalScale);
                        image.scale.multiplyScalar(ImageHD.useScale);
                        image.matrixWorldNeedsUpdate = true;
                    }
                } else if (spriteModelEffects[sprite.bufferView.typeId]) {
                    if (spriteModelEffects[sprite.bufferView.typeId]!.images[image.userData.typeId]) {
                        for (const effect of spriteModelEffects[sprite.bufferView.typeId]!.images[image.userData.typeId]) {
                            switch (effect.type) {
                                case "emissive:frames":
                                    image.setEmissive(effect.frames[image.frame] ? 1 : 0);
                                    break;
                                case "emissive:visibility":
                                    break;
                                case "hide-sprite":
                                    image.visible = false;
                                    break;
                            }
                        }
                    }
                }

                if (image.visible && image.matrixWorldNeedsUpdate) {
                    image.updateMatrix();
                    image.updateMatrixWorld();
                }
                frameInfo = null;
            }
        }

        if (sprite.object?.visible) {
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
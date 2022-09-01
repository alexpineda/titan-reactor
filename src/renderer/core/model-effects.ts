import { ImageBufferView } from "@buffer-view/images-buffer-view";
import { imageIsHidden } from "@utils/image-utils";
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

export const overlayEffectsMainImage: { setEmissive: Image3D["setEmissive"] | null, is3dAsset: boolean } = {
    setEmissive: null,
    is3dAsset: false
}

/**
 * 
 * 3D models require additional contextual information to render and cooperate with overlays properly
*
*/
export const applyOverlayEffectsToImageHD = (spriteTypeId: number, imageBufferView: ImageBufferView, image: ImageHD | ImageHDInstanced) => {
    if (spriteModelEffects[spriteTypeId]) {
        if (spriteModelEffects[spriteTypeId]!.images[imageBufferView.typeId]) {
            for (const effect of spriteModelEffects[spriteTypeId]!.images[imageBufferView.typeId]) {
                switch (effect.type) {
                    // set emissive on main image if I'm visible
                    case "emissive:overlay-visible":
                        if (overlayEffectsMainImage?.setEmissive) {
                            overlayEffectsMainImage?.setEmissive(imageIsHidden(imageBufferView) ? 0 : 1);
                        }
                        break;
                    // hide me
                    case "hide-sprite":
                        if (overlayEffectsMainImage.is3dAsset) {
                            image.visible = false;
                        }
                        break;
                }
            }
        }
    }
}

export const applyOverlayEffectsToImage3D = (spriteTypeId: number, imageTypeId: number, image: Image3D) => {
    if (spriteModelEffects[spriteTypeId]) {
        if (spriteModelEffects[spriteTypeId]!.images[imageTypeId]) {
            for (const effect of spriteModelEffects[spriteTypeId]!.images[imageTypeId]) {
                switch (effect.type) {
                    // set emissive to myself if I'm on the right animation frame
                    case "emissive:frames":
                        if (image.setEmissive) {
                            image.setEmissive(effect.frames.includes(image.frame) ? 1 : 0);
                        }
                        break;
                }
            }
        }
    }
}
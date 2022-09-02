import { ImageBufferView } from "@buffer-view/images-buffer-view";
import gameStore from "@stores/game-store";
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

type SpriteModelImageEffectFixedRotation = {
    type: "fixed-rotation";
    frames: number[];
}

type SpriteModelImageEffectFlatOnGround = {
    type: "flat-on-ground";
}

type SpriteModelImageEffects = SpriteModelImageEffectEmissiveFrames | SpriteModelImageEffectEmissiveOverlay | SpriteModelImageEffectHideSprite | SpriteModelImageEffectFixedRotation | SpriteModelImageEffectFlatOnGround;

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
        ...remnants
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
let imageTypeId: number;
export const applyOverlayEffectsToImageHD = (imageBufferView: ImageBufferView, image: ImageHD | ImageHDInstanced) => {
    imageTypeId = gameStore().assets!.refId(imageBufferView.typeId);

    if (spriteModelEffects.images[imageTypeId]) {
        for (const effect of spriteModelEffects.images[imageTypeId]) {
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
                        image.setEmissive(effect.frames.includes(image.frame) ? 1 : 0);
                    }
                    break;
                case "fixed-rotation":
                    if (effect.frames.includes(image.frame)) {
                        image.rotation.y = 0;
                    }
            }
        }
    }
}
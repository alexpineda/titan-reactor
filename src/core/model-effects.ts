/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ImageBufferView } from "@openbw/structs/images-buffer-view";
import gameStore from "@stores/game-store";
import { applyCameraDirectionToImageFrame } from "@utils/camera-utils";
import {
    imageHasDirectionalFrames,
    imageIsFlipped,
    imageIsHidden,
} from "@utils/image-utils";
import { getAngle } from "@utils/unit-utils";
import { imageTypes } from "common/enums";
import { SpriteType } from "common/types";
import { Image3D } from "./image-3d";
import { ImageHD } from "./image-hd";
import { modelSetModifiers } from "./model-effects-configuration";
import { Unit } from "./unit";

export const overlayEffectsMainImage: { image: Image3D | null } = { image: null };

export const applyRenderModeToSprite = (
    spriteTypeId: number,
    sprite: SpriteType,
) => {
    sprite.rotation.x = 0;
    if ( modelSetModifiers.sprites[spriteTypeId] ) {
        for ( const effect of modelSetModifiers.sprites[spriteTypeId] ) {
            switch ( effect.type ) {
                // set emissive on main image if I'm visible
                case "flat-on-ground":
                    // deprecated once we moved to shader based billboarding
                    // sprite.rotation.x = Math.PI / 2;
                    // sprite.position.y = terrainY + 0.1;
                    break;
            }
        }
    }
};

let imageTypeId: number;
export const applyOverlayEffectsToImageHD = ( imageBuffer: ImageBufferView ) => {
    imageTypeId = gameStore().assets!.refId( imageBuffer.typeId );

    if ( modelSetModifiers.images[imageTypeId] ) {
        for ( const effect of modelSetModifiers.images[imageTypeId] ) {
            switch ( effect.type ) {
                // set emissive on main image if I'm visible
                case "emissive:overlay-visible":
                    if ( overlayEffectsMainImage.image ) {
                        overlayEffectsMainImage.image.setEmissive(
                            imageIsHidden( imageBuffer ) ? 0 : 1
                        );
                    }
                    break;
            }
        }
    }
};

let _frameInfo: { frame: number; flipped: boolean } = { frame: 0, flipped: false };
let _needsUpdateFrame = false;

export const applyRenderModeToImageHD = (
    imageStruct: ImageBufferView,
    image: ImageHD,
    renderMode3D: boolean,
    direction: number
) => {
    imageTypeId = gameStore().assets!.refId( imageStruct.typeId );

    image.material.depthTest = renderMode3D;
    image.material.depthWrite = false;

    //TODO: don't set directional on firebat flame (421) if eminating from bunker (see: bwgame.h:12513)
    if (
        imageHasDirectionalFrames( imageStruct ) &&
        imageStruct.typeId !== imageTypes.bunkerOverlay
    ) {
        _frameInfo = applyCameraDirectionToImageFrame( direction, imageStruct );
    } else {
        _frameInfo.frame = imageStruct.frameIndex;
        _frameInfo.flipped = imageIsFlipped( imageStruct );
    }

    if ( renderMode3D && modelSetModifiers.images[imageTypeId] ) {
        for ( const effect of modelSetModifiers.images[imageTypeId] ) {
            switch ( effect.type ) {
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

    image.setFrame( _frameInfo.frame, _frameInfo.flipped );

    if ( renderMode3D ) {
        applyOverlayEffectsToImageHD( imageStruct );
    }
};

export const applyModelEffectsToImage3d = (
    imageBufferView: ImageBufferView,
    image: Image3D,
    unit: Unit | undefined
) => {
    imageTypeId = gameStore().assets!.refId( imageBufferView.typeId );
    _needsUpdateFrame = true;

    if ( unit && image === overlayEffectsMainImage.image ) {
        image.rotation.y = !image.isLooseFrame ? getAngle( unit.direction ) : 0;
    } else {
        image.rotation.y = 0;
    }

    if ( modelSetModifiers.images[imageTypeId] ) {
        for ( const effect of modelSetModifiers.images[imageTypeId] ) {
            switch ( effect.type ) {
                // set emissive to myself if I'm on the right animation frame
                case "remap-frames":
                    image.setFrame( effect.remap( imageBufferView.frameIndex ) );
                    _needsUpdateFrame = false;
                    break;

                case "rotate":
                    image.rotation.y = image.rotation.y + effect.rotation;
                    break;

                case "emissive:frames":
                    if ( image.setEmissive ) {
                        image.setEmissive(
                            effect.frames.includes( image.frameSet ) ? 1 : 0
                        );
                    }
                    break;
                case "scale":
                    image.scale.setScalar( effect.scale );
                    break;
            }
        }
    }

    if ( _needsUpdateFrame ) {
        image.setFrame( imageBufferView.frameIndex );
    }
};

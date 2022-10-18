import { BwDAT, GltfAtlas, ImageDAT, ImageStruct } from "common/types";
import { ImageFlags, drawFunctions } from "common/enums";
import { applyCameraDirectionToImageFrame } from "./camera-utils";
import { Mesh, Object3D, Vector2 } from "three";
import gameStore from "@stores/game-store";
import { ImageBase } from "@core/image-base";
import { ImageHD } from "@core/image-hd";
import { Image3D } from "@core/image-3d";
import { ImageHDInstanced } from "@core/image-hd-instanced";

export const imageIsShadow = ( image: ImageStruct, bwDat: BwDAT ) => {
    return bwDat.images[image.typeId].drawFunction === drawFunctions.rleShadow;
};

export const imageIsFlipped = ( image: ImageStruct ) => {
    return ( image.flags & ImageFlags.Flipped ) !== 0;
};

export const imageIsHidden = ( image: ImageStruct ) => {
    return ( image.flags & ImageFlags.Hidden ) !== 0;
};

export const imageIsFrozen = ( image: ImageStruct ) => {
    return ( image.flags & ImageFlags.Frozen ) !== 0;
};

export const imageNeedsRedraw = ( image: ImageStruct ) => {
    return !!( image.flags & ImageFlags.Redraw );
};

export const imageHasDirectionalFrames = ( image: ImageStruct ) => {
    return image.flags & ImageFlags.Directional;
};

export const imageIsClickable = ( image: ImageStruct ) => {
    return image.flags & ImageFlags.Clickable;
};

export const imageIsDoodad = ( dat: ImageDAT ) => {
    return dat.iscript === 336 || dat.iscript === 337;
};

export const isGltfAtlas = ( obj: any ): obj is GltfAtlas =>
    obj !== undefined && "model" in obj;

export const getImageLoOffset = (
    out: Vector2,
    cameraDirection: number,
    image: ImageStruct,
    offsetIndex: number,
    useFrameIndexOffset = false
) => {
    const frameInfo = applyCameraDirectionToImageFrame( cameraDirection, image );
    if ( useFrameIndexOffset ) {
        frameInfo.frame = frameInfo.frame % 17;
    }
    const dat = gameStore().assets!.bwDat.images[image.typeId];
    out.set(
        gameStore().assets!.bwDat.los[dat.specialOverlay - 1][frameInfo.frame][
            offsetIndex
        ][0],
        gameStore().assets!.bwDat.los[dat.specialOverlay - 1][frameInfo.frame][
            offsetIndex
        ][1]
    );
    out.x = frameInfo.flipped ? -out.x : out.x;
    out.y = -out.y;
    return out;
};

export const isInstancedImageHd = ( image: Object3D ): image is ImageHDInstanced =>
    ( image as ImageHDInstanced ).isImageHd && ( image as ImageHDInstanced ).isInstanced;
export const isImageHd = ( image: Object3D ): image is ImageHD =>
    ( image as ImageBase ).isImageHd;
export const isImage3d = ( image: Object3D ): image is Image3D =>
    ( image as ImageBase ).isImage3d;
export const isMesh = ( image: Object3D ): image is Mesh => ( image as Mesh ).isMesh;

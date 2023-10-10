import { AnimFrame, BwDAT, ImageDAT, ImageStruct } from "common/types";
import { ImageFlags, drawFunctions } from "common/enums";
import { applyCameraDirectionToImageFrame } from "./camera-utils";
import { Mesh, Object3D, Vector2 } from "three";
import gameStore from "@stores/game-store";
import { ImageBase } from "@core/image-base";
import { ImageHD } from "@core/image-hd";
import { Image3D } from "@core/image-3d";
import { ImageHDInstanced } from "@core/image-hd-instanced";
import { GltfAtlas } from "@image/atlas";

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

//dds is flipped y so we don't do it in our uvs
export const calculateFrame = (
    frame: AnimFrame,
    flipFrame: boolean,
    textureWidth: number,
    textureHeight: number,
    spriteWidth: number,
    spriteHeight: number,
    pos: {
        setX: ( index: number, value: number ) => void;
        setY: ( index: number, value: number ) => void;
    },
    uv: { setXY: ( index: number, x: number, y: number ) => void }
) => {
    const yOff = 0.5;

    const _leftU = frame.x / textureWidth;
    const _rightU = ( frame.x + frame.w ) / textureWidth;
    const u0 = flipFrame ? _rightU : _leftU;
    const u1 = flipFrame ? _leftU : _rightU;

    const v1 = frame.y / textureHeight;
    const v0 = ( frame.y + frame.h ) / textureHeight;

    const py0 = 1 - ( frame.yoff + frame.h ) / spriteHeight - yOff;
    const py1 = 1 - frame.yoff / spriteHeight - yOff;

    if ( flipFrame ) {
        pos.setX( 0, ( spriteWidth - ( frame.xoff + frame.w ) ) / spriteWidth - 0.5 );
        pos.setX( 1, ( spriteWidth - frame.xoff ) / spriteWidth - 0.5 );
        pos.setX( 2, ( spriteWidth - frame.xoff ) / spriteWidth - 0.5 );
        pos.setX( 3, ( spriteWidth - ( frame.xoff + frame.w ) ) / spriteWidth - 0.5 );
    } else {
        pos.setX( 0, frame.xoff / spriteWidth - 0.5 );
        pos.setX( 1, ( frame.xoff + frame.w ) / spriteWidth - 0.5 );
        pos.setX( 2, ( frame.xoff + frame.w ) / spriteWidth - 0.5 );
        pos.setX( 3, frame.xoff / spriteWidth - 0.5 );
    }

    //0,0 bottom left -> 0,1 bottom right -> 1,1 top right ->0,1 top left
    uv.setXY( 0, u0, v0 );
    uv.setXY( 1, u1, v0 );
    uv.setXY( 2, u1, v1 );
    uv.setXY( 3, u0, v1 );

    pos.setY( 0, py0 );
    pos.setY( 1, py0 );
    pos.setY( 2, py1 );
    pos.setY( 3, py1 );
};

export default {
    imageIsShadow,
    imageIsFlipped,
    imageIsHidden,
    imageIsFrozen,
    imageNeedsRedraw,
    imageHasDirectionalFrames,
    imageIsClickable,
    imageIsDoodad,
    isGltfAtlas,
    getImageLoOffset,
    isInstancedImageHd,
    isImageHd,
    isImage3d,
    isMesh,
    calculateFrame,
}
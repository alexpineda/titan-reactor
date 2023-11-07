import { AnimAtlas } from "@image/atlas";
import { UnitTileScale, ImageDAT } from "common/types";
import type { Color, Object3D } from "three";

/**
 * Base structure for how starcraft image objects are represented in three.js
 */
export interface ImageBase extends Object3D {
    atlas?: AnimAtlas;
    isImageHd: boolean;
    isImage3d: boolean;
    isInstanced?: boolean;
    dat: ImageDAT;
    _zOff: number;
    frame: number;

    setModifiers: (
        modifier: number,
        modifierData1: number,
        modifierData2: number
    ) => void;
    setTeamColor: ( color: Color | undefined ) => void;
    setEmissive?( val: number ): void;
    updateImageType( atlas: AnimAtlas, force?: boolean ): ImageBase;
    setFrame: ( frame: number, flip: boolean ) => void;

    // for iscript sprite
    readonly unitTileScale: UnitTileScale;
}

import { UnitTileScale } from "../../../renderer/core";
import { CompressedTexture, Texture } from "three";

import { GrpFrameType, GRPInterface } from "../../types";


export class NewAnimAtlas implements GRPInterface {
    unitTileScale: UnitTileScale = UnitTileScale.HD;
    textureWidth = 0;
    textureHeight = 0;
    spriteWidth = 0;
    spriteHeight = 0;
    imageIndex = -1;
    frames: GrpFrameType[] = [];
    diffuse: Texture;
    teamcolor?: Texture;

    constructor(diffuse: Texture, vals: GRPInterface, teamcolor?: Texture,) {
        this.diffuse = diffuse;
        this.teamcolor = teamcolor;

        this.unitTileScale = vals.unitTileScale;
        this.textureWidth = vals.textureWidth;
        this.textureHeight = vals.textureHeight;
        this.spriteWidth = vals.spriteWidth;
        this.spriteHeight = vals.spriteHeight;
        this.imageIndex = vals.imageIndex;
        this.frames = vals.frames;
    }

    dispose() {
        this.diffuse && this.diffuse.dispose();
        this.teamcolor && this.teamcolor.dispose();
    }
}
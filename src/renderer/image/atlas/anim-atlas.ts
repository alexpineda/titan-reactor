import { Texture } from "three";

import { GrpFrameType, GRPInterface, GrpType } from "common/types";
import { UnitTileScale } from "@core";

export class AnimAtlas implements GRPInterface {
    unitTileScale: UnitTileScale = UnitTileScale.HD;
    textureWidth = 0;
    textureHeight = 0;
    spriteWidth = 0;
    spriteHeight = 0;
    imageIndex = -1;
    frames: GrpFrameType[] = [];
    diffuse: Texture;
    teammask?: Texture;
    brightness?: Texture;
    normal?: Texture;
    specular?: Texture;
    aoDepth?: Texture;
    emissive?: Texture;

    grp: GrpType;

    constructor(diffuse: Texture, vals: GRPInterface, teamcolor?: Texture, brightness?: Texture, normal?: Texture, specular?: Texture, aoDepth?: Texture, emissive?: Texture) {
        this.diffuse = diffuse;
        this.brightness = brightness;
        this.normal = normal;
        this.specular = specular;
        this.aoDepth = aoDepth;
        this.emissive = emissive;
        this.teammask = teamcolor;

        this.grp = vals.grp;
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
        this.teammask && this.teammask.dispose();
    }
}
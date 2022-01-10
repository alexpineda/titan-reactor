import { NewAnimAtlas } from "./new-anim";
import { AnimationClip, CubeTexture, Group } from "three";

export class GlbAtlas extends NewAnimAtlas {
    envMap: CubeTexture | null = null;
    model: Group;
    animations: AnimationClip[] = [];
    fixedFrames: number[] = [];

    constructor(atlas: NewAnimAtlas, model: Group, animations: AnimationClip[], fixedFrames: number[]) {
        super(atlas.diffuse, atlas, atlas.teamcolor);
        this.model = model;
        this.animations = animations;
        this.fixedFrames = fixedFrames;
    }
}
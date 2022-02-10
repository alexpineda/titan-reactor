import { AnimAtlas } from "./anim-atlas";
import { AnimationClip, CubeTexture, Group } from "three";

export class GlbAtlas extends AnimAtlas {
    envMap: CubeTexture | null = null;
    model: Group;
    animations: AnimationClip[] = [];
    fixedFrames: number[] = [];

    constructor(atlas: AnimAtlas, model: Group, animations: AnimationClip[], fixedFrames: number[]) {
        super(atlas.diffuse, atlas, atlas.teammask);
        this.model = model;
        this.animations = animations;
        this.fixedFrames = fixedFrames;
    }
}
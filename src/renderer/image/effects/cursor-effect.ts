import {
    Uniform,
    Vector2,
} from "three";

import { Effect, BlendFunction } from "postprocessing";
import fragmentShader from "./cursor.frag";
import vertexShader from "./cursor.vert";
import { Assets } from "common/types";
import { LegacyGRP } from "..";

export class CursorEffect extends Effect {
    #assets: Assets;
    constructor(assets: Assets) {
        const cursor = assets.hoverIconsGPU;

        super("CursorEffect", fragmentShader, {
            blendFunction: BlendFunction.NORMAL,
            vertexShader: vertexShader,
            uniforms: new Map([
                ["uArrowTex", new Uniform(cursor.texture)],
                ["uArrowSize", new Uniform(new Vector2(cursor.texture.image.width, cursor.texture.image.height))],
                ["uResolution", new Uniform(new Vector2())],
                ["uCursorPosition", new Uniform(new Vector2())],
                ["uFrame", new Uniform(new Vector2(cursor.frames?.length!, 1))],
                ["uGraphicOffset", new Uniform(new Vector2(-0.01, -0.01))],
            ]),
        });

        this.#assets = assets;
    }

    #setCursor(cursor: LegacyGRP) {
        if (cursor.texture !== this.uniforms.get("uArrowTex")!.value) {
            this.uniforms.get("uArrowTex")!.value = cursor.texture;
            this.uniforms.get("uArrowSize")!.value.set(cursor.texture.image.width, cursor.texture.image.height);
            this.uniforms.get("uFrame")!.value.set(cursor.frames?.length!, 1);
        }
    }

    pointer() {
        this.#setCursor(this.#assets.arrowIconsGPU);
    }

    hover() {
        this.#setCursor(this.#assets.hoverIconsGPU);
    }

    drag() {
        this.#setCursor(this.#assets.dragIconsGPU);
    }

    set opacity(value: number) {
        this.blendMode.opacity.value = value;
    }

    get opacity() {
        return this.blendMode.opacity.value;
    }

    get cursorSize() {
        return this.uniforms.get("uSize")!.value;
    }


    set cursorSize(value) {
        this.uniforms.get("uSize")!.value = value;
    }

    get cursorPosition(): Vector2 {
        return this.uniforms.get("uCursorPosition")!.value;
    }

    get resolution(): Vector2 {
        return this.uniforms.get("uResolution")!.value;
    }

}

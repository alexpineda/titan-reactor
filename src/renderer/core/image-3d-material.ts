import { Atlas } from "common/types";
import { Color, MeshStandardMaterial, Shader, ShaderChunk, SpriteMaterialParameters, Texture } from "three";

type DynamicUniforms = {
    uTeamColor: {
        value: Color;
    };
    warpInFlashTexture: {
        value?: Texture,
    },
    modifier: {
        value: number;
    },
    modifierData1: {
        value: number;
    },
    modifierData2: {
        value: number;
    },
};

export class Image3DMaterial extends MeshStandardMaterial {
    #dynamicUniforms: DynamicUniforms;
    isTeamSpriteMaterial = true;
    #customCacheKey = "";

    constructor(parameters?: SpriteMaterialParameters) {
        super(parameters);
        this.isTeamSpriteMaterial = true;
        this.defines = {};

        this.#dynamicUniforms = {
            uTeamColor: {
                value: new Color(0xffffff),
            },
            warpInFlashTexture: {
                value: undefined,
            },
            modifierData1: {
                value: 0
            },
            modifierData2: {
                value: 0
            },
            modifier: {
                value: 0
            }
        };
    }

    set teamColor(val) {
        this.#dynamicUniforms.uTeamColor.value = val;
    }

    get teamColor() {
        return this.#dynamicUniforms.uTeamColor.value;
    }

    set warpInFlashGRP(val: Atlas | undefined) {
        this.#dynamicUniforms.warpInFlashTexture.value = val?.diffuse;
    }

    set modifierData1(val: number) {
        this.#dynamicUniforms.modifierData1.value = val;
    }

    get modifierData1() {
        return this.#dynamicUniforms.modifierData1.value;
    }

    set modifierData2(val: number) {
        this.#dynamicUniforms.modifierData2.value = val;
    }

    get modifierData2() {
        return this.#dynamicUniforms.modifierData2.value;
    }

    set modifier(val: number) {
        this.#dynamicUniforms.modifier.value = val;
        this.#generateProgramCacheKey();
    }

    get modifier() {
        return this.#dynamicUniforms.modifier.value;
    }

    override onBeforeCompile(shader: Shader) {
        shader.fragmentShader = `
        uniform vec3 uTeamColor;
        ${shader.fragmentShader}
    `;
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',

            ShaderChunk.map_fragment.replace(
                'diffuseColor *= sampledDiffuseColor;',
                `
        diffuseColor *= vec4(mix(sampledDiffuseColor.rgb, sampledDiffuseColor.rgb * uTeamColor, sampledDiffuseColor.a), 1.);
    `
            )
        );
        Object.assign(shader.uniforms, this.#dynamicUniforms);

    }

    #generateProgramCacheKey() {
        const newKey = `${this.modifier}`;
        if (this.#customCacheKey !== newKey) {
            this.needsUpdate = true;
            this.#customCacheKey = newKey;
        }
    }

    override customProgramCacheKey() {
        return this.#customCacheKey;
    }
}
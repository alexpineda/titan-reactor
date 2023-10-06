import { AnimAtlas } from "@image/atlas";
import { extend_withSpriteImageProjection } from "@utils/shader-utils/sprite-image-projection";
import { drawFunctions } from "common/enums";
import {
    Color,
    MeshBasicMaterial,
    Shader,
    SpriteMaterialParameters,
    Texture,
    Vector2,
} from "three";

interface DynamicUniforms {
    uTeamColor: {
        value: Color;
    };
    teamMask: {
        value?: Texture;
    };
    warpInFlashTexture: {
        value?: Texture;
    };
    modifier: {
        value: number;
    };
    modifierData: {
        value: Vector2;
    };
    uvPosTex: {
        value: Texture | undefined;
    };
}

export class ImageHDInstancedMaterial extends MeshBasicMaterial {
    #dynamicUniforms: DynamicUniforms;
    isTeamSpriteMaterial = true;
    #customCacheKey = "";
    flatProjection = true;

    constructor( parameters?: SpriteMaterialParameters ) {
        super( parameters );
        this.isTeamSpriteMaterial = true;

        this.#dynamicUniforms = {
            uTeamColor: {
                value: new Color( 0xffffff ),
            },
            teamMask: {
                value: undefined,
            },
            warpInFlashTexture: {
                value: undefined,
            },
            modifierData: {
                value: new Vector2(),
            },
            modifier: {
                value: 0,
            },
            uvPosTex: {
                value: undefined,
            },
        };
    }

    set teamMask( val: Texture | undefined ) {
        this.#dynamicUniforms.teamMask.value = val;
        this.#generateProgramCacheKey();
    }

    get teamMask() {
        return this.#dynamicUniforms.teamMask.value;
    }

    set teamColor( val ) {
        this.#dynamicUniforms.uTeamColor.value = val;
    }

    get teamColor() {
        return this.#dynamicUniforms.uTeamColor.value;
    }

    set warpInFlashGRP( val: AnimAtlas | undefined ) {
        this.#dynamicUniforms.warpInFlashTexture.value = val?.diffuse;
    }

    set modifierData( val: Vector2 ) {
        this.#dynamicUniforms.modifierData.value = val;
    }

    get modifierData() {
        return this.#dynamicUniforms.modifierData.value;
    }

    set modifier( val: number ) {
        this.#dynamicUniforms.modifier.value = val;
        this.#generateProgramCacheKey();
    }

    get modifier() {
        return this.#dynamicUniforms.modifier.value;
    }

    set uvPosTex( val: Texture ) {
        this.#dynamicUniforms.uvPosTex.value = val;
    }

    override onBeforeCompile( shader: Shader ) {
        function extend(
            prop: "fragmentShader" | "vertexShader",
            replace: string,
            chunks: string[][],
            keep = true
        ) {
            if ( chunks.length === 0 ) {
                return;
            }

            const header = [];
            const content = [];
            if ( keep ) {
                content.push( replace );
            }

            for ( const [ contentChunk, headerChunk ] of chunks ) {
                if ( contentChunk ) {
                    content.push( contentChunk );
                }
                if ( headerChunk ) {
                    header.push( headerChunk );
                }
            }

            shader[prop] = `${header.join( "\n" )}
        ${shader[prop].replace( replace, content.join( "\n" ) )}`;
        }

        const mapFragments = [];

        // opacity
        mapFragments.push( [
            `
            diffuseColor.a = diffuseColor.a * vModifierData.z;
            `,
        ] );

        if ( this.teamMask ) {
            mapFragments.push( [
                `
                float maskValue = texture2D( teamMask, vMapUv ).r;
                diffuseColor = vec4(mix(diffuseColor.rgb, diffuseColor.rgb * vTeamColor, maskValue), diffuseColor.a);
                `,
                "uniform sampler2D teamMask;",
            ] );
        }

        if ( this.modifier === drawFunctions.rleShadow ) {
            mapFragments.push( [
                "\ndiffuseColor = vec4((vec3(diffuseColor.a)) * 0.5, diffuseColor.a);\n",
            ] );
        }

        //todo DEFINE PROTOSS_BUILDING
        mapFragments.push( [
            `
        // // warp1
        // vec2 warpUv = vMapUv * 0.2 + vec2(0.2 * mod(modifierData1, 5.), 0.2 * floor(modifierData1 / 5.));
        // vec4 warp = texture2D( warpInFlashTexture, warpUv );
        // diffuseColor = vec4(mix(diffuseColor.rgb, warp.rgb, vModifierType.x), diffuseColor.a);

        // // warp2
        // float flashPower = 1. - ((modifierData1 - 48.) / 15.);
        // diffuseColor = vec4(mix(diffuseColor.rgb, vec3(1.), flashPower * vModifierType.y), diffuseColor.a);

        // // halluc
        // float b = dot(diffuseColor.rgb, vec3(.3, .6, .1));
        // diffuseColor = vec4(mix(diffuseColor.rgb, vec3(0.75, 1.125, 2.65) * b, vModifierType.z), diffuseColor.a);`,

            `
            uniform float modifier;
            uniform float modifierData1;
            uniform float modifierData2;
            uniform sampler2D warpInFlashTexture;
            
            varying vec3 vTeamColor;
            varying mat4 vUvPos;
            varying vec3 vModifierData;
            varying vec3 vModifierType;
        `,
        ] );

        extend( "fragmentShader", "#include <map_fragment>", mapFragments );

        extend_withSpriteImageProjection( shader, {
            post: `
            vTeamColor = aTeamColor;
            vModifierData = aModifierData;
            vModifierType = aModifierType;
            vUvPos = aUvPos;
        `,
        } );
        shader.vertexShader = `
            attribute vec3 aTeamColor;
            attribute vec3 aModifierData;
            attribute vec3 aModifierType;
            attribute mat4 aUvPos;

            varying vec3 vTeamColor;
            varying mat4 vUvPos;
            varying vec3 vModifierData;
            varying vec3 vModifierType;

            ${shader.vertexShader}
        `;

        Object.assign( shader.uniforms, this.#dynamicUniforms );
    }

    #generateProgramCacheKey() {
        const newKey = `${Boolean( this.teamMask )}${this.modifier}`;
        if ( this.#customCacheKey !== newKey ) {
            this.needsUpdate = true;
            this.#customCacheKey = newKey;
        }
    }

    override customProgramCacheKey() {
        return this.#customCacheKey;
    }
}

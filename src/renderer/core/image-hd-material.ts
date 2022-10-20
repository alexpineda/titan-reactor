import { AnimAtlas } from "@image/atlas";
import { extend_withSpriteImageProjection } from "@utils/shader-utils/sprite-image-projection";
import { drawFunctions } from "common/enums";
import {
    Color,
    Matrix4,
    MeshBasicMaterial,
    Shader,
    SpriteMaterialParameters,
    Texture,
    Vector2,
} from "three";

interface DynamicUniforms {
    //TODO: change to palette
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
    uLocalMatrix: {
        value: Matrix4;
    };
    uParentMatrix: {
        value: Matrix4;
    };
    uvPosTex: {
        value: Texture | undefined;
    };
    uFrameFlipped: {
        value: Vector2;
    };
}

export class ImageHDMaterial extends MeshBasicMaterial {
    #dynamicUniforms: DynamicUniforms;
    isTeamSpriteMaterial = true;
    #customCacheKey = "";

    constructor( parameters?: SpriteMaterialParameters ) {
        super( parameters );
        this.isTeamSpriteMaterial = true;
        this.defines = {};

        this.#dynamicUniforms = {
            uTeamColor: {
                value: new Color( 0xffffff ),
            },
            teamMask: {
                value: undefined,
            },
            uvPosTex: {
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
            uLocalMatrix: {
                value: new Matrix4(),
            },
            uParentMatrix: {
                value: new Matrix4(),
            },
            uFrameFlipped: {
                value: new Vector2(),
            },
        };
    }

    set teamMask( val: Texture | undefined ) {
        if ( val !== this.#dynamicUniforms.teamMask.value ) {
            this.#dynamicUniforms.teamMask.value = val;
            this.#generateProgramCacheKey();
        }
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

    set uvPosTex( val: Texture ) {
        this.#dynamicUniforms.uvPosTex.value = val;
    }

    set frame( val: number ) {
        this.#dynamicUniforms.uFrameFlipped.value.x = val;
    }

    set flipped( val: boolean ) {
        this.#dynamicUniforms.uFrameFlipped.value.y = val ? 1 : 0;
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
        if ( val !== this.#dynamicUniforms.modifier.value ) {
            this.#dynamicUniforms.modifier.value = val;
            this.#generateProgramCacheKey();
        }
    }

    get modifier() {
        return this.#dynamicUniforms.modifier.value;
    }

    set localMatrix( val: Matrix4 ) {
        this.#dynamicUniforms.uLocalMatrix.value = val;
    }

    get localMatrix() {
        return this.#dynamicUniforms.uLocalMatrix.value;
    }

    set parentMatrix( val: Matrix4 ) {
        this.#dynamicUniforms.uParentMatrix.value = val;
    }

    get parentMatrix() {
        return this.#dynamicUniforms.uParentMatrix.value;
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

        if ( this.teamMask ) {
            mapFragments.push( [
                `
        float maskValue = texture2D( teamMask, vUv ).r;
        diffuseColor = vec4(mix(diffuseColor.rgb, diffuseColor.rgb * uTeamColor, maskValue), diffuseColor.a);
        `,
                `uniform sampler2D teamMask;
           uniform vec3 uTeamColor;`,
            ] );
        }

        if ( this.modifier === drawFunctions.rleShadow ) {
            mapFragments.push( [
                "\ndiffuseColor = vec4((vec3(diffuseColor.a)) * 0.5, diffuseColor.a);\n",
            ] );
        } else if ( this.modifier === drawFunctions.warpFlash ) {
            mapFragments.push( [
                `
        vec2 warpUv = vUv * 0.2 + vec2(0.2 * mod(modifierData.x, 5.), 0.2 * floor(modifierData.x / 5.));
        vec4 warp = texture2D( warpInFlashTexture, warpUv );
        diffuseColor = vec4(warp.rgb, diffuseColor.a);
      `,
            ] );
        } else if ( this.modifier === drawFunctions.warpFlash2 ) {
            mapFragments.push( [
                `
        float flashPower = 1. - ((modifierData.x - 48.) / 15.);
        diffuseColor = vec4( mix( diffuseColor.rgb, vec3(1.), flashPower ), diffuseColor.a );
      `,
            ] );
        } else if ( this.modifier === drawFunctions.hallucination ) {
            mapFragments.push( [
                `
        float b = dot(diffuseColor, vec3(.3, .6, .1));
        diffuseColor = mix(diffuseColor, vec3(0.75, 1.125, 2.65) * b, diffuseColor.a);
      `,
            ] );
        }

        mapFragments.push( [
            `
            // diffuseColor = mix( diffuseColor, vec4(1.), 1. -  step(0.1, vUv.x) * step(0.1, vUv.y) * step(vUv.x, 0.9) * step(vUv.y, 0.9) );
        `,
            `
    uniform float modifier;
    uniform vec2 modifierData;
    uniform sampler2D warpInFlashTexture;
    `,
        ] );

        extend( "fragmentShader", "#include <map_fragment>", mapFragments );

        //                       frame 0   frame 1
        //
        //  glVertID 0               rgba     rgba
        //  glVertID 1               0.0     0.5
        //  glVertID 2               0.0     1.0
        //  glVertID 3               0.0     1.5
        //  glVertID 0 flipped       0.0     2.0
        //  glVertID 1 flipped       0.0     2.5
        //  glVertID 2 flipped       0.0     3.0
        //  glVertID 3 flipped       0.0     3.5

        extend_withSpriteImageProjection( shader, {
            header: `
                precision highp sampler2DArray;
            
                uniform vec2 uFrameFlipped;
                uniform sampler2DArray uvPosTex;

            `,
            pre: `

                vec3 fUv = vec3(uFrameFlipped.x, 0., gl_VertexID + int(uFrameFlipped.y) * 4);
                vec4 posUv = texture(uvPosTex, fUv);

                transformed = vec3(posUv.x, posUv.y, transformed.z);
                vUv = vec2(posUv.z, posUv.w);
            `,
        } );

        Object.assign( shader.uniforms, this.#dynamicUniforms );
    }

    #generateProgramCacheKey() {
        const newKey = `${!!this.teamMask}${this.modifier}`;
        if ( this.#customCacheKey !== newKey ) {
            this.needsUpdate = true;
            this.#customCacheKey = newKey;
        }
    }

    override customProgramCacheKey() {
        return this.#customCacheKey;
    }
}

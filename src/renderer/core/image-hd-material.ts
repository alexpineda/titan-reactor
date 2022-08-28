import { drawFunctions } from "common/enums";
import { Atlas } from "common/types";
import {
  Color,
  MeshBasicMaterial,
  Shader,
  ShaderChunk,
  SpriteMaterialParameters,
  Texture,
} from "three";

type DynamicUniforms = {
  teamColor: {
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
  modifierData1: {
    value: number;
  };
  modifierData2: {
    value: number;
  };
};

export class TeamSpriteMaterial extends MeshBasicMaterial {
  #dynamicUniforms: DynamicUniforms;
  isTeamSpriteMaterial = true;
  #customCacheKey = "";

  constructor(parameters?: SpriteMaterialParameters) {
    super(parameters);
    this.isTeamSpriteMaterial = true;
    this.defines = {};

    this.#dynamicUniforms = {
      teamColor: {
        value: new Color(0xffffff),
      },
      teamMask: {
        value: undefined,
      },
      warpInFlashTexture: {
        value: undefined,
      },
      modifierData1: {
        value: 0,
      },
      modifierData2: {
        value: 0,
      },
      modifier: {
        value: 0,
      },
    };
  }

  set teamMask(val: Texture | undefined) {
    this.#dynamicUniforms.teamMask.value = val;
    this.#generateProgramCacheKey();
  }

  get teamMask() {
    return this.#dynamicUniforms.teamMask.value;
  }

  set teamColor(val) {
    this.#dynamicUniforms.teamColor.value = val;
  }

  get teamColor() {
    return this.#dynamicUniforms.teamColor.value;
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
    function extend(
      prop: "fragmentShader" | "vertexShader",
      replace: string,
      chunks: string[][],
      keep = true
    ) {
      if (chunks.length === 0) {
        return;
      }

      const header = [];
      const content = [];
      if (keep) {
        content.push(replace);
      }

      for (const [contentChunk, headerChunk] of chunks) {
        if (contentChunk) {
          content.push(contentChunk);
        }
        if (headerChunk) {
          header.push(headerChunk);
        }
      }

      shader[prop] = `${header.join("\n")}
        ${shader[prop].replace(replace, content.join("\n"))}`;
    }

    const mapFragments = [];

    if (this.teamMask) {
      mapFragments.push([
        `
        float maskValue = texture2D( teamMask, vUv ).r;
        diffuseColor = vec4(mix(diffuseColor.rgb, diffuseColor.rgb * teamColor, maskValue), diffuseColor.a);
        `,
        `uniform sampler2D teamMask;
           uniform vec3 teamColor;`,
      ]);
    }

    if (this.modifier === drawFunctions.rleShadow) {
      mapFragments.push([
        "\ndiffuseColor = vec4((vec3(diffuseColor.a)) * 0.5, diffuseColor.a);\n",
      ]);
    } else if (this.modifier === drawFunctions.warpFlash) {
      mapFragments.push([
        `
        vec2 warpUv = vUv * 0.2 + vec2(0.2 * mod(modifierData1, 5.), 0.2 * floor(modifierData1 / 5.));
        vec4 warp = texture2D( warpInFlashTexture, warpUv );
        diffuseColor = vec4(warp.rgb, diffuseColor.a);
      `,
      ]);
    } else if (this.modifier === drawFunctions.warpFlash2) {
      mapFragments.push([
        `
        float flashPower = 1. - ((modifierData1 - 48.) / 15.);
        diffuseColor = vec4(mix(diffuseColor.rgb, vec3(1.), flashPower), diffuseColor.a);
      `,
      ]);
    } else if (this.modifier === drawFunctions.hallucination) {
      mapFragments.push([
        `
        float b = dot(diffuseColor, vec3(.3, .6, .1));
        diffuseColor = mix(diffuseColor, vec3(0.75, 1.125, 2.65) * b, diffuseColor.a);
      `,
      ]);
    }

    mapFragments.push([
      "",
      `
    uniform float modifier;
    uniform float modifierData1;
    uniform float modifierData2;
    uniform sampler2D warpInFlashTexture;`,
    ]);

    extend("fragmentShader", "#include <map_fragment>", mapFragments);

    shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", ShaderChunk.project_vertex.replace(
      "gl_Position = projectionMatrix * mvPosition;",
      `
        mat4 mv = modelViewMatrix;

        mv[0][0] = modelMatrix[0][0];
        mv[0][1] = 0.;
        mv[0][2] = 0.;
        mv[1][0] = 0.;
        mv[1][1] = modelMatrix[1][1];
        mv[1][2] = 0.;
        mv[2][0] = 0.;
        mv[2][1] = 0.;
        mv[2][2] = modelMatrix[2][2];

        gl_Position = projectionMatrix * mv * vec4(transformed, 1.);
  
      `
    ));

    Object.assign(shader.uniforms, this.#dynamicUniforms);
  }

  #generateProgramCacheKey() {
    const newKey = `${Boolean(this.teamMask)}${this.modifier}`;
    if (this.#customCacheKey !== newKey) {
      this.needsUpdate = true;
      this.#customCacheKey = newKey;
    }
  }

  override customProgramCacheKey() {
    return this.#customCacheKey;
  }
}

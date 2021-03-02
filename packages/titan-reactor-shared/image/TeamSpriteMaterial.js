import { Color, SpriteMaterial } from "three";
import * as THREE from "three";
import initExtendMaterial from "./ExtendMaterial";

const { extendMaterial } = initExtendMaterial(THREE);

/*
 * SpriteMaterial has a lot of hardcoded items in three.js
 * see: WebGLMaterials.js -> refreshUniformsSprites() on top of other things
 * so extending the material with ExtendMaterial is not so straightforward
 * See below for TeamSpriteMaterial for a more straightforward approach
 */
const ExtendTeamSpriteMaterial = extendMaterial(SpriteMaterial, {
  class: SpriteMaterial,
  header: `
  uniform sampler2D teamMask;
  uniform vec3 teamColor;
  `,
  fragment: {
    "#include <map_fragment>": `
    float maskValue = texture2D( teamMask, vUv ).r;

    diffuseColor = vec4(mix(diffuseColor.rgb, diffuseColor.rgb * teamColor, maskValue), diffuseColor.a);

    // diffuseColor = vec4(maskValue, 1., 1., 1.);
    `,
  },
  uniforms: {
    teamColor: { value: new Color(0xffffff) },
    teamMask: {
      value: null,
    },
  },
});
ExtendTeamSpriteMaterial.isTeamSpriteMaterial = true;

class TeamSpriteMaterial extends SpriteMaterial {
  constructor(opts) {
    super(opts);
    this.isTeamSpriteMaterial = true;
    this.defines = {};
    this._dynamicUniforms = {
      warpingIn: {
        value: 0,
      },
      teamColor: {
        value: new Color(0xffffff),
      },
    };
  }

  set teamColor(val) {
    this._dynamicUniforms.teamColor.value = val;
  }

  set warpingIn(val) {
    this._dynamicUniforms.warpingIn.value = val;
  }

  onBeforeCompile(shader) {
    function extend(replace, chunks, keep = true) {
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
      shader.fragmentShader = `${header.join("\n")}
        ${shader.fragmentShader.replace(replace, content.join("\n"))}`;
    }

    const mapFragments = [];

    if (this.isShadow) {
      mapFragments.push([
        "\ndiffuseColor = vec4((vec3(diffuseColor.a)) * 0.5, diffuseColor.a);\n",
      ]);
    }
    //get the diffuseColor from map_fragment and mix with team mask
    else if (this.teamMask) {
      mapFragments.push([
        `
        float maskValue = texture2D( teamMask, vUv ).r;
        diffuseColor = vec4(mix(diffuseColor.rgb, diffuseColor.rgb * teamColor, maskValue), diffuseColor.a);
        `,
        `uniform sampler2D teamMask;
           uniform vec3 teamColor;`,
      ]);

      shader.uniforms.teamColor = this._dynamicUniforms.teamColor;
      shader.uniforms.teamMask = {
        value: this.teamMask,
      };
    }

    // mapFragments.push([
    //   `
    //   diffuseColor = vec4(mix(vec3(1.), diffuseColor.rgb, warpingIn), diffuseColor.a);
    //   `,
    //   `uniform float warpingIn;`,
    // ]);
    extend("#include <map_fragment>", mapFragments);
    // shader.uniforms.warpingIn = this._dynamicUniforms.warpingIn;

    /*
    // hallucination effect
    float b = dot(sourceColor, vec3(0.30196078, 0.59215686, 0.10980392));
    vec3 hallucinateColor = vec3(0.75, 1.125, 2.65) * b;
    return mix(blendTarget, hallucinateColor, halT);
    */
  }

  customProgramCacheKey() {
    const flags = [!!this.teamMask, this.isShadow];
    return flags.join("");
  }
}

export default TeamSpriteMaterial;

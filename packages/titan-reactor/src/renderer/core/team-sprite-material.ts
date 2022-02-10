import { Color, SpriteMaterial, SpriteMaterialParameters, Texture } from "three";

import warp from "../../common/image/effect/warp";

type dynamicUniforms = {
  delta: {
    value: number;
  };
  warpingIn: {
    value: number;
  };
  warpingInLen: {
    value: number;
  };
  teamColor: {
    value: Color;
  };
  teamMask: {
    value: Texture | null;
  };
};

export class TeamSpriteMaterial extends SpriteMaterial {
  isTeamSpriteMaterial = true;
  _dynamicUniforms: dynamicUniforms;
  isShadow = false;
  teamMask?: Texture;

  constructor(parameters?: SpriteMaterialParameters) {
    super(parameters);
    this.isTeamSpriteMaterial = true;
    this.defines = {};
    this._dynamicUniforms = {
      delta: {
        value: 0,
      },
      warpingIn: {
        value: 0,
      },
      warpingInLen: {
        value: 0,
      },
      teamColor: {
        value: new Color(0xffffff),
      },
      teamMask: {
        value: null,
      },
    };
  }

  set teamColor(val) {
    this._dynamicUniforms.teamColor.value = val;
  }

  get teamColor() {
    return this._dynamicUniforms.teamColor.value;
  }

  set warpingIn(val) {
    this._dynamicUniforms.warpingIn.value = val;
  }

  get warpingIn() {
    return this._dynamicUniforms.warpingIn.value;
  }

  set warpingInLen(val) {
    this._dynamicUniforms.warpingInLen.value = val;
  }

  get warpingInLen() {
    return this._dynamicUniforms.warpingInLen.value;
  }

  set delta(val) {
    this._dynamicUniforms.delta.value = val;
  }

  get delta() {
    return this._dynamicUniforms.delta.value;
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  override onBeforeCompile(shader: any) {
    function extendVertex(replace: string, chunks: string[][]) {
      return extend("vertexShader", replace, chunks);
    }

    function extendFragment(replace: string, chunks: string[][]) {
      return extend("fragmentShader", replace, chunks);
    }

    function extend(
      prop: string,
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
    const vertFragments = [];

    if (this.isShadow) {
      mapFragments.push([
        "\ndiffuseColor = vec4((vec3(diffuseColor.a)) * 0.5, diffuseColor.a);\n",
      ]);
    } else if (this.teamMask) {
      mapFragments.push([
        `
        float maskValue = texture2D( teamMask, vUv ).r;
        diffuseColor = vec4(mix(diffuseColor.rgb, diffuseColor.rgb * teamColor, maskValue), diffuseColor.a);
        `,
        `uniform sampler2D teamMask;
           uniform vec3 teamColor;`,
      ]);

      Object.assign(shader.uniforms, this._dynamicUniforms);
      shader.uniforms.teamMask = {
        value: this.teamMask,
      };
    }

    if (this.warpingIn) {
      vertFragments.push(warp.vertex);
      mapFragments.push(warp.fragment);

      mapFragments.push([
        `
      if (warpingIn > 0.){
        // draw warp texture
        diffuseColor = vec4(
          mix(diffuseColor.rgb, vec3(1.), warpingIn),
          diffuseColor.a
        );
      }

      `,
        `
        uniform float warpingIn;
        uniform float warpingInLen;
        uniform float delta;
        `,
      ]);
    }

    extendVertex("gl_Position = projectionMatrix * mvPosition;", vertFragments);
    extendFragment("#include <map_fragment>", mapFragments);
    // shader.uniforms.warpingIn = this._dynamicUniforms.warpingIn;

    /*
    // hallucination effect
    float b = dot(sourceColor, vec3(0.30196078, 0.59215686, 0.10980392));
    vec3 hallucinateColor = vec3(0.75, 1.125, 2.65) * b;
    return mix(blendTarget, hallucinateColor, halT);
    */
  }

  //FIXME: compute when updating fields rather than ehre
  override customProgramCacheKey() {
    const flags = [
      Boolean(this.teamMask),
      this.isShadow,
      Boolean(this.warpingIn),
    ];
    return flags.join("");
  }
}

export default TeamSpriteMaterial;

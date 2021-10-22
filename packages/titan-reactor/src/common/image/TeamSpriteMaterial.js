import { Color, SpriteMaterial } from "three";
import warp from "./effect/warp";

class TeamSpriteMaterial extends SpriteMaterial {
  constructor(opts) {
    super(opts);
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

  onBeforeCompile(shader) {
    function extendVertex(replace, chunks) {
      return extend("vertexShader", replace, chunks);
    }

    function extendFragment(replace, chunks) {
      return extend("fragmentShader", replace, chunks);
    }

    function extend(prop, replace, chunks, keep = true) {
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
      float offset = 150. - 21.;
      // vec3 warpColor = vec3(24./255., 172./255., 183./255.);
      // vec3 warpDarkColor = vec3(0., 8./255., 79./255.);
      // vec3 warpBgColor = vec3(5./255., 32./255., 101./255.);

      // if (warpingIn > offset) {
      //   float warpState = (warpingInLen - warpingIn - offset) / (warpingInLen - offset);

      //   vec3 tPos = warpPosition* 0.1 * (warpState * 0.125);
      //   tPos -= vec3(0, delta * 0.125, 0);
      //   float n1 = snoise(vec3(tPos));
      //   n1 = (n1 + 1.0) * 0.5;
        
      //   float n2 = snoise(vec3(n1 * 10., 1, 1));
      //   n2 = sin(((n2 + 1.0) * 0.5) * 3.1415926 * 2.);
        
      //   float effect = smoothstep(0.1, 0.125, n1) * (1. - smoothstep(0.375, 0.4, n2));
      //   float coef = sin(n2 * 3.141526 * 0.5) * 0.125;
      //   float e = effect - abs(coef);
      //   e = n1 > 0.25 && n1 < 0.75? e * e : pow(e, 16.);
      //   diffuseColor = vec4( max(warpBgColor * warpState, mix(warpDarkColor, warpColor, warpState) * e), diffuseColor.a * (warpState));
      // } else 
      if (warpingIn > 0.){
        // draw warp texture
        diffuseColor = vec4(
          mix(diffuseColor.rgb, vec3(1.), warpingIn / offset),
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

  customProgramCacheKey() {
    const flags = [
      Boolean(this.teamMask),
      this.isShadow,
      Boolean(this.warpingIn),
    ];
    return flags.join("");
  }
}

export default TeamSpriteMaterial;

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
    this.teamColor = new Color(0xffffff);
    this.addOnBeforeCompile = () => {};
  }

  onBeforeCompile(shader) {
    let fs = shader.fragmentShader;

    //get the diffuseColor from map_fragment and mix with team mask
    fs = fs.replace(
      "#include <map_fragment>",
      `
      #include <map_fragment>
      #ifdef TEAM_MASK
        float maskValue = texture2D( teamMask, vUv ).r;
        diffuseColor = vec4(mix(diffuseColor.rgb, diffuseColor.rgb * teamColor, maskValue), diffuseColor.a);
      #endif
`
    );

    shader.fragmentShader = `
    ${this.teamMask ? "#define TEAM_MASK" : ""}
    #ifdef TEAM_MASK
      uniform sampler2D teamMask;
      uniform vec3 teamColor;
    #endif
  ${fs}
`;

    shader.uniforms.teamColor = { value: this.teamColor };
    shader.uniforms.teamMask = {
      value: this.teamMask,
    };

    this.addOnBeforeCompile(shader);
  }
}

export default TeamSpriteMaterial;

import { Color, SpriteMaterial } from "three";
import * as THREE from "three";
import initExtendMaterial from "./ExtendMaterial";

const { extendMaterial } = initExtendMaterial(THREE);

const TeamSpriteMaterial = extendMaterial(SpriteMaterial, {
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

TeamSpriteMaterial.isTeamSpriteMaterial = true;
export default TeamSpriteMaterial;

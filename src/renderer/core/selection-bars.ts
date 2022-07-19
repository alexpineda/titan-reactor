import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  RedFormat,
  Shader,
  StaticDrawUsage,
  Uniform,
  UnsignedByteType,
  WebGLRenderer,
} from "three";

import { SpriteDAT } from "common/types";
import { getMaxUnitEnergy } from "@utils/unit-utils";
import { Unit } from "./unit";
import gameStore from "@stores/game-store";

// dummy map till I figure out how to get uv attribute in shader
const map = new DataTexture(
  new Uint8Array([0]),
  1,
  1,
  RedFormat,
  UnsignedByteType
);
map.needsUpdate = true;

class SelectionBarMaterial extends MeshBasicMaterial {
  customUniforms: {
    hp: Uniform;
    bwGreenColor: Uniform;
    bwRedColor: Uniform;
    bwYellowColor: Uniform;
    hasShields: Uniform;
    shields: Uniform;
    shieldsColor: Uniform;
    energyColor: Uniform;
    energy: Uniform;
    hasEnergy: Uniform;
  };

  constructor() {
    super({ map, transparent: true, depthTest: false });

    this.customUniforms = {
      hp: new Uniform(0),
      bwGreenColor: new Uniform(hpColorGreen),
      bwRedColor: new Uniform(hpColorRed),
      bwYellowColor: new Uniform(hpColorYellow),

      hasShields: new Uniform(0),
      shields: new Uniform(0),
      shieldsColor: new Uniform(shieldsColor),

      energyColor: new Uniform(energyColor),
      energy: new Uniform(0),
      hasEnergy: new Uniform(0),
    };
  }

  override onBeforeCompile(shader: Shader, _: WebGLRenderer): void {
    // @ts-ignore
    Object.assign(shader.uniforms, this.customUniforms);
    const fs = shader.fragmentShader;
    shader.fragmentShader =
      `
      uniform float hp;
      uniform vec3 bwGreenColor;
      uniform vec3 bwRedColor;
      uniform vec3 bwYellowColor;

      uniform float hasShields;
      uniform float shields;
      uniform vec3 shieldsColor;

      uniform float hasEnergy;
      uniform float energy;
      uniform vec3 energyColor;

      float barHeight = 0.2;

      vec3 borderize(vec3 color, vec3 darker, vec2 uv) {
        vec3 newColor = mix(color, darker, pow(uv.x, 50.) );    
        newColor = mix(newColor, darker, pow(1.-uv.x, 50.) );

        newColor = mix(newColor, darker, pow(uv.y , 40.) );    
        newColor = mix(newColor, darker, pow(1.-uv.y , 40.) );
        return newColor;
      }

      ` +
      fs.replace(
        "#include <map_fragment>",
        `
            vec3 gray = vec3(0.4);
            float ty = 1. - vUv.y;

            vec2 shieldsPos = vec2(0., barHeight) * hasShields;
            vec2 hpPos = shieldsPos + vec2(0.33 * hasShields,  mix(barHeight, 0.33, hasShields));
            vec2 energyPos = (hpPos + vec2(0.33,  0.33));

            float drawShield = (1. - step(shieldsPos.y, ty));    
            float drawHp = (step(hpPos.x, ty) * (1. - step(hpPos.y, ty)) );
            float drawEnergy = (step(energyPos.x, ty) * (1. - step(energyPos.y, ty)));

            vec3 hpC1 = mix(bwRedColor, bwYellowColor, step(1./3., hp));
            hpC1 = mix(hpC1, bwGreenColor, step(2./3., hp));
            hpC1 =  mix(hpC1, gray, step(hp, vUv.x));

            vec2 borderModifier =  vec2(1., clamp(abs(ty - hpPos.x) / barHeight * abs(ty - hpPos.y)  / barHeight, 0., 1.));
            hpC1 = borderize(hpC1, hpC1 * 0.3, vUv * borderModifier);
            
            vec4 hpC = vec4(hpC1, 1.);

            borderModifier = vec2(1., clamp(abs(ty - shieldsPos.x) / barHeight * abs(ty - shieldsPos.y)  / barHeight, 0., 1.));
            vec3 shield1C = mix(shieldsColor, gray, step(shields, vUv.x));
            vec4 shieldC =  vec4(borderize(shield1C, shield1C * 0.3, vUv * borderModifier), 1.)  * hasShields;

            borderModifier = vec2(1., clamp(abs(ty - energyPos.x) / barHeight * abs(ty - energyPos.y)  / barHeight, 0., 1.));
            vec3 energyC1 = mix(energyColor, gray, step(energy, vUv.x));
            vec4 energyC =  vec4(borderize(energyC1, energyC1 * 0.3, vUv * borderModifier), 1.) * hasEnergy;

            diffuseColor = shieldC * drawShield + hpC * drawHp + energyC * drawEnergy;

        `
      );
  }
}

const hpColorGreen = new Color(16 / 255, 195 / 255, 16 / 255).convertSRGBToLinear();
const hpColorRed = new Color(234 / 255, 25 / 255, 25 / 255).convertSRGBToLinear();
const hpColorYellow = new Color(188 / 255, 193 / 255, 35 / 255).convertSRGBToLinear();
const shieldsColor = new Color(10 / 255, 58 / 255, 200 / 255).convertSRGBToLinear();
const energyColor = new Color(158 / 255, 34 / 255, 189 / 255).convertSRGBToLinear();



export class SelectionBars extends Mesh<BufferGeometry, MeshBasicMaterial> {

  constructor() {
    const _geometry = new BufferGeometry();
    _geometry.setIndex([0, 1, 2, 0, 2, 3]);

    const posAttribute = new BufferAttribute(
      new Float32Array([
        -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
      ]),
      3,
      false
    );
    posAttribute.usage = StaticDrawUsage;
    _geometry.setAttribute("position", posAttribute);

    const uvAttribute = new BufferAttribute(
      new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      2,
      false
    );
    uvAttribute.usage = StaticDrawUsage;
    _geometry.setAttribute("uv", uvAttribute);

    super(_geometry, new SelectionBarMaterial())

    this.visible = false;
  }

  update(
    unit: Unit,
    sprite: SpriteDAT,
    completedUpgrades: number[],
    renderOrder: number,
  ) {
    if (unit.owner > 7) {
      this.visible = false;
      return;
    }
    this.visible = true;

    const frameY = gameStore().assets!.bwDat.grps[561 + sprite.selectionCircle.index].frames[0].h / 2;
    this.position.y =
      -(sprite.selectionCircleOffset + frameY + 8) / 32;
    this.scale.set(sprite.healthBar / 32, 0.4, 1);

    this.renderOrder = renderOrder + 10;

    const material = this.material as SelectionBarMaterial;
    material.needsUpdate = true;

    material.customUniforms.hp.value =
      unit.hp / unit.extras.dat.hp;

    const hasShields = unit.extras.dat.shieldsEnabled;
    const hasEnergy = unit.extras.dat.isSpellcaster;

    material.customUniforms.hasEnergy.value = hasEnergy ? 1 : 0;
    material.customUniforms.hasShields.value = hasShields ? 1 : 0;

    if (hasShields) {
      material.customUniforms.shields.value =
        unit.shields / unit.extras.dat.shields;
    }

    if (hasEnergy) {
      material.customUniforms.energy.value =
        unit.energy /
        getMaxUnitEnergy(unit.extras.dat, completedUpgrades);
    }
  }
}
export default SelectionBars;

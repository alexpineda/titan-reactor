import { UpgradeCompleted } from "../../common/types";
import {
  Color,
  DataTexture,
  Group,
  RedFormat,
  Sprite as ThreeSprite,
  SpriteMaterial,
  Uniform,
  UnsignedByteType,
} from "three";

import getMaxEnergy from "../../common/bwdat/core/get-max-energy";
import { Sprite } from ".";

const getTypeIds = ({ typeId }: { typeId: number }) => typeId;

function onBeforeCompile(shader: any) {
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
            vec3 gray = vec3(0.5);
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

            vec4 barColor = shieldC * drawShield + hpC * drawHp + energyC * drawEnergy;
            diffuseColor = mapTexelToLinear(barColor);

        `
    );
}

const hpColorGreen = new Color(16 / 255, 135 / 255, 16 / 255);
const hpColorRed = new Color(234 / 255, 25 / 255, 25 / 255);
const hpColorYellow = new Color(188 / 255, 193 / 255, 35 / 255);
const shieldsColor = new Color(10 / 255, 58 / 255, 200 / 255);
const energyColor = new Color(158 / 255, 34 / 255, 189 / 255);

// dummy map till I figure out how to get uv attribute in shader
const map = new DataTexture(
  new Uint8Array([0]),
  1,
  1,
  RedFormat,
  UnsignedByteType
);

const createSprite = () => {
  const sprite = new ThreeSprite(
    new SpriteMaterial({
      map,
    })
  );
  sprite.userData = {
    customUniforms: {
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
    },
  };
  sprite.material.onBeforeCompile = onBeforeCompile.bind(sprite);
  sprite.material.depthTest = false;
  sprite.material.transparent = true;

  return sprite;
};

export class SelectionBars extends Group {
  bar = createSprite();

  constructor() {
    super();
    this.add(this.bar);
  }

  update(
    sprite: Sprite,
    completedUpgrades: UpgradeCompleted[],
    renderOrder: number,
    grpOffset: number
  ) {
    if (!sprite.unit || !sprite.unit.owner) {
      this.visible = false;
      return;
    }

    this.visible = true;

    this.position.z =
      sprite.spriteDAT.selectionCircleOffset / 32 + grpOffset + 0.4;
    this.scale.set(sprite.spriteDAT.healthBar / 32, 0.3, 1);

    this.bar.material.needsUpdate = true;
    this.bar.renderOrder = renderOrder;

    this.bar.userData.customUniforms.hp.value =
      sprite.unit.hp / sprite.unit.dat.hp;

    const hasShields = sprite.unit.dat.shieldsEnabled;
    const hasEnergy = sprite.unit.dat.isSpellcaster;

    this.bar.userData.customUniforms.hasEnergy.value = hasEnergy ? 1 : 0;
    this.bar.userData.customUniforms.hasShields.value = hasShields ? 1 : 0;

    if (hasShields) {
      this.bar.userData.customUniforms.shields.value =
        sprite.unit.shields / sprite.unit.dat.shields;
    }

    if (hasEnergy) {
      this.bar.userData.customUniforms.energy.value =
        sprite.unit.energy /
        getMaxEnergy(sprite.unit.dat, completedUpgrades.map(getTypeIds));
    }
  }
}
export default SelectionBars;

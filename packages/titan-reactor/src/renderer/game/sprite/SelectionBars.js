import {
  Color,
  DataTexture,
  Group,
  RedFormat,
  Sprite,
  SpriteMaterial,
  Uniform,
  UnsignedByteType,
  Vector2,
} from "three";
import getMaxEnergy from "titan-reactor-shared/dat/getMaxEnergy";

window.grpOffset = 10;

function onBeforeCompile(shader) {
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

      ` +
    fs.replace(
      "#include <map_fragment>",
      `
            // #include <map_fragment>
            vec3 gray = vec3(0.5);

            vec3 hpC1 = mix(bwRedColor, bwYellowColor, step(1./3., hp));
            hpC1 = mix(hpC1, bwGreenColor, step(2./3., hp));
            hpC1 =  mix(hpC1, gray, step(hp, vUv.x));

            vec4 hpC = vec4(hpC1, 1.);
            vec4 shieldC =  vec4(mix(shieldsColor, gray, step(shields, vUv.x)), 1.)  * hasShields;
            vec4 energyC =  vec4(mix(energyColor, gray, step(energy, vUv.x)), 1.) * hasEnergy;

            vec2 shieldsPos = vec2(0., .25) * hasShields;
            vec2 hpPos = shieldsPos + vec2(0.33 * hasShields, 0.25);
            vec2 energyPos = (hpPos + vec2(0.33, 0.25));
            
            float ty = 1. - vUv.y;

            vec4 barColor = shieldC * (1. - step(shieldsPos.y, ty)) + 
              hpC * ((1. - step(hpPos.y, ty)) * step(hpPos.x, ty) ) +
              energyC * ((1. - step(energyPos.y, ty)) * step(energyPos.x, ty));

            diffuseColor = mapTexelToLinear(barColor);

        `
    );
}

const hpColorGreen = new Color(16 / 255, 115 / 255, 16 / 255);
const hpColorRed = new Color(204 / 255, 153 / 255, 35 / 255);
const hpColorYellow = new Color(188 / 255, 193 / 255, 35 / 255);
const shieldsColor = new Color(10 / 255, 51 / 255, 150 / 255);
const energyColor = new Color(135 / 255, 61 / 255, 153 / 255);

// dummy map till I figure out how to get uv attribute in shader
const map = new DataTexture(
  new Uint8Array([0]),
  1,
  1,
  RedFormat,
  UnsignedByteType
);

const createSprite = () => {
  const sprite = new Sprite(
    new SpriteMaterial({
      map,
    })
  );
  sprite.customUniforms = {
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
  sprite.material.onBeforeCompile = onBeforeCompile.bind(sprite);
  sprite.material.depthTest = false;
  sprite.material.transparent = true;

  return sprite;
};

export default class SelectionBars extends Group {
  constructor() {
    super();
    this.bar = createSprite();
    this.add(this.bar);
  }

  update(sprite, completedUpgrades, renderOrder, grpOffset) {
    if (!sprite.unit || !sprite.unit.owner) {
      this.visible = false;
      return;
    }

    this.visible = true;

    if (sprite.spriteType !== this.spriteType) {
      this.position.z =
        sprite.spriteType.selectionCircleOffset / 32 + grpOffset + 0.3;
      this.scale.set(sprite.spriteType.healthBar / 32, 0.3);
    }
    this.spriteType = sprite.spriteType;

    this.bar.material.needsUpdate = true;
    this.bar.renderOrder = renderOrder;

    this.bar.customUniforms.hp.value = sprite.unit.hp / sprite.unit.unitType.hp;

    const hasShields = sprite.unit.unitType.shieldsEnabled;
    const hasEnergy = sprite.unit.unitType.isSpellcaster;

    this.bar.customUniforms.hasEnergy.value = hasEnergy ? 1 : 0;
    this.bar.customUniforms.hasShields.value = hasShields ? 1 : 0;

    if (hasShields) {
      this.bar.customUniforms.shields.value =
        sprite.unit.shields / sprite.unit.unitType.shields;
    }

    if (hasEnergy) {
      this.bar.customUniforms.energy.value =
        sprite.unit.energy /
        getMaxEnergy(sprite.unit.unitType, completedUpgrades);
    }
  }
}

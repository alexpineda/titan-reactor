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
      uniform float bwValue;
      uniform vec3 bwColor;
      ` +
    fs.replace(
      "#include <map_fragment>",
      `
            #include <map_fragment>
            vec3 gray = vec3(0.5);
            diffuseColor = vec4( mix(bwColor, gray, step(bwValue, vUv.x)), 1.);
        `
    );
}

const hpColor = new Color(0.14, 0.6, 0.14);
const shieldColor = new Color(0.04, 0.27, 0.78);
const energyColor = new Color(0.53, 0.24, 0.6);

// dummy map till I figure out how to get uv attribute in shader
const map = new DataTexture(
  new Uint8Array([0]),
  1,
  1,
  RedFormat,
  UnsignedByteType
);

const createUniforms = (color) => ({
  bwColor: new Uniform(color),
  bwValue: new Uniform(0),
});

const createSprite = (color) => {
  const sprite = new Sprite(
    new SpriteMaterial({
      map,
    })
  );
  sprite.customUniforms = createUniforms(color);
  sprite.material.onBeforeCompile = onBeforeCompile.bind(sprite);
  sprite.material.depthTest = false;
  sprite.material.transparent = true;
  return sprite;
};

export default class SelectionBars extends Group {
  constructor() {
    super();

    this.hpBar = createSprite(hpColor);
    this.energyBar = createSprite(energyColor);
    this.shieldsBar = createSprite(shieldColor);

    this.add(this.hpBar);
    this.add(this.energyBar);
    this.add(this.shieldsBar);
  }

  update(sprite, completedUpgrades, renderOrder, grpOffset) {
    if (!sprite.unit || !sprite.unit.owner) {
      this.visible = false;
      return;
    }

    this.visible = true;

    if (sprite.spriteType !== this.spriteType) {
      this.position.z =
        sprite.spriteType.selectionCircleOffset / 32 + grpOffset;
      this.scale.set(sprite.spriteType.healthBar / 32, 0.06);
    }
    this.spriteType = sprite.spriteType;

    this.hpBar.customUniforms.bwValue.value =
      sprite.unit.hp / sprite.unit.unitType.hp;

    this.hpBar.material.needsUpdate = true;
    this.hpBar.renderOrder = renderOrder;

    const hasShields = sprite.unit.unitType.shieldsEnabled;
    const hasEnergy = sprite.unit.unitType.isSpellcaster;

    this.shieldsBar.visible = hasShields;
    if (hasShields) {
      this.shieldsBar.customUniforms.bwValue.value =
        sprite.unit.shields / sprite.unit.unitType.shields;
      this.shieldsBar.material.needsUpdate = true;
      this.shieldsBar.renderOrder = renderOrder;
    }

    this.energyBar.visible = hasEnergy;
    if (hasEnergy) {
      this.energyBar.customUniforms.bwValue.value =
        sprite.unit.energy /
        getMaxEnergy(sprite.unit.unitType, completedUpgrades);
      this.energyBar.material.needsUpdate = true;
      this.energyBar.renderOrder = renderOrder;
    }

    if (hasShields && hasEnergy) {
      this.shieldsBar.position.z = 0;
      this.hpBar.position.z = 0.15;
      this.energyBar.position.z = 0.3;
    } else if (hasEnergy) {
      this.hpBar.position.z = 0;
      this.energyBar.position.z = 0.15;
    } else if (hasShields) {
      this.shieldsBar.position.z = 0;
      this.hpBar.position.z = 0.15;
    } else {
      this.hpBar.position.z = 0;
    }
  }
}

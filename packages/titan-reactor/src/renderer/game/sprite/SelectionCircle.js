import { Sprite, SpriteMaterial } from "three";

export default class SelectionCircle extends Sprite {
  constructor() {
    super(
      new SpriteMaterial({
        onBeforeCompile: (shader) => {
          const fs = shader.fragmentShader;
          shader.fragmentShader = fs.replace(
            "#include <map_fragment>",
            `
                #include <map_fragment>
                diffuseColor = vec4(0., 1., 0., diffuseColor.a * 0.5);
            `
          );
        },
      })
    );
    this.material.depthTest = false;
    this.material.transparent = true;
  }

  update(spriteDef) {
    const circle = spriteDef.selectionCircle;
    if (spriteDef !== this.spriteDef) {
      const grp = this.selectionCirclesHD[circle.index];
      this.material.map = grp.diffuse;
      this.material.needsUpdate = true;
      this.position.z = spriteDef.selectionCircleOffset / 32;
      this.scale.set(grp.width / 128, grp.height / 128);
      this.grp = grp;
    }
    this.spriteDef = spriteDef;
  }
}

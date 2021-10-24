import { SpriteDATType } from "../../common/bwdat/core/SpritesDAT";
import { Sprite, SpriteMaterial } from "three";
import { getSelectionCircle } from "../stores/gameStore";

export default class SelectionCircle extends Sprite {
  spriteDef?: SpriteDATType;
  grp: any;

  constructor() {
    super(
      new SpriteMaterial({
        // @ts-ignore
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

  update(spriteDef: SpriteDATType) {
    const circle = spriteDef.selectionCircle;
    if (spriteDef !== this.spriteDef) {
      const grp = getSelectionCircle(circle.index);
      this.material.map = grp.diffuse;
      this.material.needsUpdate = true;
      this.position.z = spriteDef.selectionCircleOffset / 32;
      this.scale.set(grp.width / 128, grp.height / 128, 1);
      this.grp = grp;
    }
    this.spriteDef = spriteDef;
  }
}

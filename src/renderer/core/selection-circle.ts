import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, StaticDrawUsage, Shader } from "three";

import { SpriteDAT } from "common/bwdat/sprites-dat";
import gameStore from "@stores/game-store";

export class SelectionCircle extends Mesh<BufferGeometry, MeshBasicMaterial> {
  #spriteDat?: SpriteDAT;

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

    super(
      _geometry,
      new MeshBasicMaterial({
        // @ts-ignore
        onBeforeCompile: (shader: Shader) => {
          const fs = shader.fragmentShader;
          shader.fragmentShader = fs.replace(
            "#include <map_fragment>",
            `
                #include <map_fragment>
                diffuseColor = vec4(0., 1., 0., diffuseColor.a * 0.5);
            `
          );

          // flatProjection(shader);
        },
      })
    );

    this.material.depthTest = false;
    this.material.transparent = true;
    this.name = "SelectionCircle";
  }

  update(spriteDat: SpriteDAT) {
    if (spriteDat !== this.#spriteDat) {
      const circle = spriteDat.selectionCircle;
      const grp = gameStore().assets!.selectionCircles[circle.index];
      this.material.map = grp.diffuse;
      this.material.needsUpdate = true;
      this.position.y = -spriteDat.selectionCircleOffset / 32;

      const unitTileScale = (grp.unitTileScale / 4) * 128;
      this.scale.set(
        (grp?.textureWidth as number) / unitTileScale,
        (grp?.textureHeight as number) / unitTileScale,
        1
      );
      this.#spriteDat = spriteDat;
    }
  }

}

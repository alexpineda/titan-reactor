import { BufferGeometry, Mesh, MeshBasicMaterial, Shader, RingGeometry } from "three";

import { SpriteDAT } from "common/bwdat/sprites-dat";
import gameStore from "@stores/game-store";

export class SelectionCircle3D extends Mesh<BufferGeometry, MeshBasicMaterial> {
    #spriteDat?: SpriteDAT;

    constructor() {
        const _geometry = new RingGeometry();

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

                },
            })
        );

        this.material.depthTest = false;
        this.material.transparent = true;
        this.name = "SelectionCircle3D";
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

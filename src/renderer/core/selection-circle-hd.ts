import {
    BufferAttribute,
    BufferGeometry,
    Mesh,
    MeshBasicMaterial,
    StaticDrawUsage,
    Shader,
    Matrix4,
} from "three";

import { SpriteDAT } from "common/bwdat/sprites-dat";
import gameStore from "@stores/game-store";
import { spriteImageProjection } from "@utils/shader-utils/sprite-image-projection";
import { SpriteType } from "common/types";

//TODO: change to shader material
class SelectionCircleMaterial extends MeshBasicMaterial {
    customUniforms = {
        uLocalMatrix: { value: new Matrix4() },
        uParentMatrix: { value: new Matrix4() },
    };
    override onBeforeCompile( shader: Shader ) {
        Object.assign( shader.uniforms, this.customUniforms );

        const fs = shader.fragmentShader;
        shader.fragmentShader = fs.replace(
            "#include <map_fragment>",
            `
        #include <map_fragment>
        diffuseColor = vec4(0., 1., 0., diffuseColor.a * 0.5);
    `
        );

        spriteImageProjection( shader );
    }
}

export class SelectionCircleHD extends Mesh<BufferGeometry, SelectionCircleMaterial> {
    #spriteDat?: SpriteDAT;

    constructor() {
        const _geometry = new BufferGeometry();
        _geometry.setIndex( [ 0, 1, 2, 0, 2, 3 ] );

        const posAttribute = new BufferAttribute(
            new Float32Array( [ -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0 ] ),
            3,
            false
        );
        posAttribute.usage = StaticDrawUsage;
        _geometry.setAttribute( "position", posAttribute );

        const uvAttribute = new BufferAttribute(
            new Float32Array( [ 0, 0, 1, 0, 1, 1, 0, 1 ] ),
            2,
            false
        );
        uvAttribute.usage = StaticDrawUsage;
        _geometry.setAttribute( "uv", uvAttribute );

        const _material = new SelectionCircleMaterial();

        super( _geometry, _material );

        this.material.depthTest = false;
        this.material.transparent = true;
        this.name = "SelectionCircleHD";
        this.frustumCulled = false;
    }

    update( sprite: SpriteType, spriteDat: SpriteDAT ) {
        if ( spriteDat !== this.#spriteDat ) {
            const circle = spriteDat.selectionCircle;
            const grp = gameStore().assets!.selectionCircles[circle.index];
            this.material.map = grp.diffuse;
            this.material.needsUpdate = true;

            const unitTileScale = ( grp.unitTileScale / 4 ) * 128;

            this.#spriteDat = spriteDat;

            this.position.y = -spriteDat.selectionCircleOffset / 32;
            this.scale.set(
                grp.textureWidth / unitTileScale,
                grp.textureHeight / unitTileScale,
                1
            );
            this.updateMatrix();
            this.matrixWorldNeedsUpdate = false;
        }

        this.material.customUniforms.uParentMatrix.value.copy( sprite.matrixWorld );
        this.material.customUniforms.uLocalMatrix.value.copy( this.matrix );
    }
}

import { BufferGeometry, Mesh, MeshBasicMaterial, Shader, PlaneGeometry } from "three";

import { SpriteDAT } from "common/bwdat/sprites-dat";
import { Image3D } from "./image-3d";

export class SelectionCircle3D extends Mesh<BufferGeometry, MeshBasicMaterial> {
    #spriteDat?: SpriteDAT;
    #uniforms = {
        uSize: { value: 1 },
    };

    constructor() {
        const _geometry = new PlaneGeometry( 1, 1 );

        super(
            _geometry,
            new MeshBasicMaterial( {
                // @ts-expect-error
                onBeforeCompile: ( shader: Shader ) => {
                    const fs = shader.fragmentShader;
                    shader.fragmentShader = fs.replace(
                        "#include <map_fragment>",
                        `
                #include <map_fragment>

                float dst = distance(vUv, vec2(0.5, 0.5)) / 0.5;

                float thickness = 0.05 * uSize;
                diffuseColor = vec4(0., 1., 0., smoothstep(0.98 - thickness, 1. - thickness, dst) * smoothstep(0., 0.02, 1. - dst));
            `
                    );
                    shader.fragmentShader = `
                uniform float uSize;
                                ${shader.fragmentShader}
                            `;

                    shader.uniforms.uSize = this.#uniforms.uSize;
                },
            } )
        );
        this.material.defines = {
            USE_UV: "",
        };
        this.material.transparent = true;
        this.rotation.x = -Math.PI / 2;
        this.name = "SelectionCircle3D";
    }

    update( spriteDat: SpriteDAT, image: Image3D ) {
        if ( spriteDat !== this.#spriteDat ) {
            const r = image.boundingSphere.radius;
            const m = r > 1 ? r * 1.6 : r * 1.1;
            this.geometry.dispose();

            this.#uniforms.uSize.value = 1 / m;
            //TODO: don't
            this.geometry = new PlaneGeometry( m, m );

            this.material.needsUpdate = true;
            this.#spriteDat = spriteDat;

            this.position.setY( image.boundingBox.min.y );

            this.updateMatrix();
        }
        this.updateMatrixWorld();
    }
}

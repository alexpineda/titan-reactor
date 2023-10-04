import { BufferGeometry, Mesh, PlaneGeometry, ShaderMaterial } from "three";

import { SpriteDAT } from "common/bwdat/sprites-dat";
import { Image3D } from "./image-3d";

class SelectionMaterial extends ShaderMaterial {
    set size( value: number ) {
        this.uniforms.uSize.value = value;
        this.uniformsNeedUpdate = true;
    }

    constructor() {
        super( {
            defines: {
                USE_UV: "",
            },
            uniforms: {
                uSize: { value: 1 },
            },
            fragmentShader: `
                uniform float uSize;
                varying vec2 vUv;

                void main() {

                    float dst = distance(vUv, vec2(0.5, 0.5)) / 0.5;

                    float thickness = 0.05 * (1. / uSize);
                    gl_FragColor = vec4(0., 1., 0., smoothstep(0.98 - thickness, 1. - thickness, dst) * smoothstep(0., 0.02, 1. - dst));

                    
                }
            `,
            vertexShader: `
                uniform float uSize;
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * uSize , 1.0);
                }

            `,
        } );

        this.transparent = true;
    }
}

/**
 * a selection circle for 3d images
 */
export class SelectionCircle3D extends Mesh<BufferGeometry, SelectionMaterial> {
    #spriteDat?: SpriteDAT;

    constructor() {
        const _geometry = new PlaneGeometry( 1, 1 );
        super( _geometry, new SelectionMaterial() );
        this.rotation.x = -Math.PI / 2;
        this.name = "SelectionCircle3D";
    }

    update( spriteDat: SpriteDAT, image: Image3D ) {
        if ( spriteDat !== this.#spriteDat ) {
            const r = image.boundingSphere.radius;
            const m = r > 1 ? r * 1.6 : r * 1.1;

            this.material.size = m;

            this.#spriteDat = spriteDat;

            this.position.setY( image.boundingBox.min.y );

            this.updateMatrix();
        }
        this.updateMatrixWorld();
    }
}

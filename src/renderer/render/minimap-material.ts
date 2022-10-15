import { FogOfWar } from "@core/fogofwar";
import { Unit } from "@core/unit";
import { unitTypes } from "common/enums";
import { UnitDAT } from "common/types";
import { floor32 } from "common/utils/conversions";
import { Color, Matrix4, ShaderMaterial, Texture, Vector2 } from "three";
import fragmentShader from "./minimap-frag.glsl?raw";
import vertexShader from "./minimap-vert.glsl?raw";

// if ( module.hot ) {
//     module.hot.accept( "./minimap-frag.glsl?raw" );
//     module.hot.accept( "./minimap-vert.glsl?raw" );
// }

export class MinimapMaterial extends ShaderMaterial {
    #resourceColor = new Color( 0, 55, 55 );
    #flashColor = new Color( 200, 200, 200 );
    #mapWidth: number;
    #mapHeight: number;
    localMatrix = new Matrix4();
    worldMatrix = new Matrix4();

    override uniforms = {
        fogBitmap: { value: new Texture() },
        unitsBitmap: { value: new Texture() },
        resourcesBitmap: { value: new Texture() },
        creepBitmap: { value: new Texture() },
        terrainBitmap: { value: new Texture() },
        fogOfWarOpacity: { value: 0 },
        uMapResolution: { value: new Vector2() },
        uResolution: { value: new Vector2() },
        uOpacity: { value: 1 },
        uSoftEdges: { value: 0 },
    };

    constructor( mapWidth: number, mapHeight: number, terrain: Texture ) {
        super();

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.#mapWidth = mapWidth;
        this.#mapHeight = mapHeight;

        this.uniforms.terrainBitmap.value = terrain;
        this.uniforms.unitsBitmap.value.image = new ImageData( mapWidth, mapHeight );
        this.uniforms.resourcesBitmap.value.image = new ImageData( mapWidth, mapHeight );
        this.uniforms.fogBitmap.value.image = new ImageData( mapWidth, mapHeight );
        this.uniforms.uMapResolution.value.set( mapWidth, mapHeight );

        this.depthTest = false;
        this.depthWrite = false;
        this.transparent = true;
    }

    update( fogOfWarBuffer: Uint8Array, creepImage: ImageData, fogOfWarOpacity: number ) {
        for ( let i = 0; i < this.#mapWidth * this.#mapHeight; i = i + 1 ) {
            ( this.uniforms.fogBitmap.value.image as ImageData ).data[i * 4 - 1] =
                Math.max( 50, 255 - fogOfWarBuffer[i] );
        }

        ( this.uniforms.unitsBitmap.value.image as ImageData ).data.fill( 0 );
        ( this.uniforms.resourcesBitmap.value.image as ImageData ).data.fill( 0 );

        this.uniforms.fogOfWarOpacity.value = fogOfWarOpacity;
        this.uniforms.unitsBitmap.value.needsUpdate = true;
        this.uniforms.resourcesBitmap.value.needsUpdate = true;
        this.uniforms.fogBitmap.value.needsUpdate = true;
        this.uniforms.creepBitmap.value.image = creepImage;
    }

    buildUnitMinimap(
        unit: Unit,
        unitType: UnitDAT,
        fogOfWar: FogOfWar,
        getPlayerColor: ( id: number ) => Color
    ) {
        const isResourceContainer = unitType.isResourceContainer && unit.owner === 11;

        if (
            !isResourceContainer &&
            !fogOfWar.isVisible( floor32( unit.x ), floor32( unit.y ) )
        ) {
            return;
        }
        if ( unitType.index === unitTypes.scannerSweep ) {
            return;
        }

        let color;

        if ( isResourceContainer ) {
            color = this.#resourceColor;
        } else if ( unit.owner < 8 ) {
            color =
                unit.extras.recievingDamage & 1
                    ? this.#flashColor
                    : getPlayerColor( unit.owner );
        } else {
            return;
        }

        let w = Math.floor( unitType.placementWidth / 32 );
        let h = Math.floor( unitType.placementHeight / 32 );

        if ( unitType.isBuilding ) {
            if ( w > 4 ) w = 4;
            if ( h > 4 ) h = 4;
        }
        if ( w < 2 ) w = 2;
        if ( h < 2 ) h = 2;

        const unitX = Math.floor( unit.x / 32 );
        const unitY = Math.floor( unit.y / 32 );
        const wX = Math.floor( w / 2 );
        const wY = Math.floor( w / 2 );

        const _out = isResourceContainer
            ? ( this.uniforms.resourcesBitmap.value.image as ImageData )
            : ( this.uniforms.unitsBitmap.value.image as ImageData );
        const alpha = isResourceContainer ? 150 : 255;

        for ( let x = -wX; x < wX; x++ ) {
            for ( let y = -wY; y < wY; y++ ) {
                if ( unitY + y < 0 ) continue;
                if ( unitX + x < 0 ) continue;
                if ( unitX + x >= this.#mapWidth ) continue;
                if ( unitY + y >= this.#mapHeight ) continue;

                const pos = ( ( unitY + y ) * this.#mapWidth + unitX + x ) * 4;

                _out.data[pos] = Math.floor( color.r * 255 );
                _out.data[pos + 1] = Math.floor( color.g * 255 );
                _out.data[pos + 2] = Math.floor( color.b * 255 );
                _out.data[pos + 3] = alpha;
            }
        }
    }
}

export class BasicOverlayMaterial extends ShaderMaterial {
    worldMatrix = new Matrix4();

    override uniforms = {
        uTex: { value: new Texture() },
        uOpacity: { value: 1 },
    };

    constructor( tex: Texture ) {
        super();

        this.uniforms.uTex.value = tex;

        this.vertexShader = `
            varying vec2 vUv;
            uniform mat4 uMatrix;

            void main() {

                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                vUv = uv;

            }
        `;
        this.fragmentShader = `
            uniform float uOpacity;
            uniform sampler2D uTex;
            varying vec2 vUv;

            void main() {

                vec4 tex = texture2D(uTex, vUv);
                gl_FragColor = vec4(tex.rgb, tex.a * uOpacity * step(0.05, tex.rgb/3.0));

            }

        `;

        this.depthTest = false;
        this.depthWrite = false;
        this.transparent = true;
    }
}

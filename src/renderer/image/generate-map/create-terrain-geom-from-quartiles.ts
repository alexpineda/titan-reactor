import {
    Vector2,
    MeshStandardMaterial,
    Mesh,
    ShaderChunk,
    MeshBasicMaterial,
    Shader,
    Vector4,
    Vector3,
} from "three";

import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils";

import { CreepTexture, WrappedQuartileTextures, GeometryOptions } from "common/types";

import { createDisplacementGeometryQuartile } from "./create-displacement-geometry-quartile";
import { LookupTextures } from "./lookup-textures";

import hdMapFrag from "./hd/hd.frag.glsl?raw";
import hdHeaderFrag from "./hd/hd-header.frag.glsl?raw";
import { Terrain } from "@core/terrain";
import { HeightMaps } from "./height-maps/render-height-maps";
import gameStore from "@stores/game-store";
import { getTerrainY } from "./get-terrain-y";
import processStore from "@stores/process-store";

export const createTerrainGeometryFromQuartiles = (
    mapWidth: number,
    mapHeight: number,
    creepTexture: CreepTexture,
    creepEdgesTexture: CreepTexture,
    geomOptions: GeometryOptions,
    {
        creepEdgesTexUniform,
        creepTexUniform /*, occlussionRoughnessMetallicMap*/,
        effectsTextures,
    }: LookupTextures,
    { singleChannel, texture, displaceCanvas }: HeightMaps,
    mapTextures: WrappedQuartileTextures
) => {
    const terrain = new Terrain(
        geomOptions,
        getTerrainY(
            {
                data: singleChannel,
                width: ( texture.image as ImageData ).width,
                height: ( texture.image as ImageData ).height,
            },
            geomOptions.maxTerrainHeight,
            mapWidth,
            mapHeight
        ),
        ( anisotropy: number ) => {
            creepTexture.texture.anisotropy = anisotropy;
            creepEdgesTexture.texture.anisotropy = anisotropy;
        }
    );

    const qw = mapTextures.quartileWidth;
    const qh = mapTextures.quartileHeight;

    const genProcess = processStore().create( "generate-geometry", qw * qh );

    const tilesX = mapWidth / qw;
    const tilesY = mapHeight / qh;

    let _uNormal1 = 0,
        _uNormal2 = 0,
        _uTick = 0;

    const waterNormal1 = {
        value: effectsTextures.waterNormal1.slice( 0, 2 ),
    };

    const waterNormal2 = {
        value: effectsTextures.waterNormal2.slice( 0, 2 ),
    };

    const uTime = {
        value: 0,
    };

    const uResolution = {
        value: new Vector2( window.innerWidth, window.innerHeight ),
    };

    // const displacementMap = new DataTexture(out, texture.image.width, texture.image.height, RedFormat);
    // displacementMap.needsUpdate = true;

    for ( let qy = 0; qy < tilesY; qy++ ) {
        for ( let qx = 0; qx < tilesX; qx++ ) {
            // const g =
            //     new PlaneBufferGeometry(qw,
            //         qh,
            //         qw * geomOptions.meshDetail,
            //         qh * geomOptions.meshDetail);
            const g = mergeVertices(
                createDisplacementGeometryQuartile(
                    qw,
                    qh,
                    qw * geomOptions.tesselation,
                    qh * geomOptions.tesselation,
                    displaceCanvas,
                    geomOptions.maxTerrainHeight,
                    0,
                    qw / mapWidth,
                    qh / mapHeight,
                    qx * qw * geomOptions.texPxPerTile,
                    qy * qh * geomOptions.texPxPerTile
                )
            );

            g.computeVertexNormals();

            const standardMaterial = new MeshStandardMaterial( {
                map: mapTextures.mapQuartiles[qx][qy],
                roughness: 1,
                bumpMap: mapTextures.mapQuartiles[qx][qy],
                bumpScale: geomOptions.bumpScale,
                envMap: gameStore().assets!.envMap,
                // displacementMap: displacementMap,
                // displacementScale: geomOptions.maxTerrainHeight,
                // roughnessMap: occlussionRoughnessMetallicMap,
                fog: false,
            } );

            if ( mapTextures.waterMaskQuartiles.length > 0 ) {
                Object.assign( standardMaterial.defines, {
                    USE_WATER_MASK: 1,
                } );
            }

            const basicMaterial = new MeshBasicMaterial( {
                map: mapTextures.mapQuartiles[qx][qy],
            } );

            const materialOnBeforeCompile = function ( shader: Shader ) {
                let fs = shader.fragmentShader;

                fs = fs.replace( "#include <map_fragment>", hdMapFrag );
                fs = fs.replace(
                    "#include <roughnessmap_fragment>",
                    ShaderChunk.roughnessmap_fragment.replace( "vUv", "qUv" )
                );
                fs = fs.replace(
                    "#include <normal_fragment_begin>",
                    `

                    #include <normal_fragment_begin>

                    #ifdef USE_WATER_MASK

	                // normal = mix(normal, normalize(vec3(waterNormal.x, 1.0, waterNormal.z)) * 2.0 - 1.0, destWaterMask);

                    #endif
                
                `
                );

                shader.fragmentShader = [ hdHeaderFrag, fs ].join( "\n" );

                let vs = shader.vertexShader;

                vs = vs.replace(
                    "#include <uv_vertex>",
                    `

                    ${ShaderChunk.uv_vertex}

                    qUv = vUv * quartileSize.xy + vec2(quartileSize.z, (1. - quartileSize.y) - quartileSize.w);`
                );

                vs = vs.replace(
                    "#include <displacementmap_vertex>",
                    ShaderChunk.displacementmap_vertex.replace( "vUv", "qUv" )
                );

                vs = vs.replace(
                    "varying vec3 vViewPosition;",
                    `
                    varying vec3 vViewPosition;
                    varying vec3 v_Position;
                `
                );

                vs = vs.replace(
                    "gl_Position = projectionMatrix * mvPosition;",
                    `
                    gl_Position = projectionMatrix * mvPosition;
                    v_Position = projectionMatrix * mvPosition;
                `
                );

                shader.vertexShader = `

                uniform vec4 quartileSize;
                varying vec2 qUv;

                ${vs}`;

                shader.uniforms.quartileSize = {
                    value: new Vector4(
                        // normalized quartile size
                        qw / mapWidth,
                        qh / mapHeight,
                        // offsets
                        ( qw * qx ) / mapWidth,
                        ( qh * qy ) / mapHeight
                    ),
                };

                shader.uniforms.tileUnit = {
                    value: new Vector4( 1 / qw, 1 / qh, mapWidth, mapHeight ),
                };

                shader.uniforms.mapToCreepResolution = {
                    value: new Vector3(
                        qw / creepTexture.count,
                        qh / 1,
                        qw / creepEdgesTexture.count
                    ),
                };
                shader.uniforms.creepResolution = {
                    value: new Vector2( creepTexture.count, creepEdgesTexture.count ),
                };

                shader.uniforms.creepEdges = creepEdgesTexUniform;
                shader.uniforms.creep = creepTexUniform;
                shader.uniforms.creepEdgesTexture = {
                    value: creepEdgesTexture.texture,
                };
                shader.uniforms.creepTexture = {
                    value: creepTexture.texture,
                };

                shader.uniforms.waterMask = {
                    value: mapTextures.waterMaskQuartiles.length
                        ? mapTextures.waterMaskQuartiles[qx][qy]
                        : null,
                };

                shader.uniforms.waterNormal1 = waterNormal1;
                shader.uniforms.waterNormal2 = waterNormal2;
                shader.uniforms.uTime = uTime;
                shader.uniforms.uResolution = uResolution;
            };
            standardMaterial.onBeforeCompile = materialOnBeforeCompile;
            basicMaterial.onBeforeCompile = materialOnBeforeCompile;

            const terrainQuartile = new Mesh( g, standardMaterial );
            terrainQuartile.castShadow = true;
            terrainQuartile.receiveShadow = true;
            terrainQuartile.userData = {
                basicMaterial,
                standardMaterial,
                qx,
                qy,
            };

            terrainQuartile.position.set(
                qx * qw + qw / 2 - mapWidth / 2,
                -( qy * qh + qh / 2 ) + mapHeight / 2,
                0
            );
            terrainQuartile.name = `terrain-${qx}-${qy}`;
            terrain.add( terrainQuartile );
            genProcess.increment();
        }
    }

    const WATER_SPEED = 4000;

    terrain.castShadow = true;
    terrain.receiveShadow = true;
    terrain.rotation.x = -Math.PI / 2;
    terrain.matrixAutoUpdate = false;
    terrain.updateMatrix();
    terrain.visible = true;
    terrain.name = "TerrainHD";
    terrain.userData = {
        quartileWidth: qw,
        quartileHeight: qh,
        tilesX,
        tilesY,
        update( delta: number ) {
            _uTick += delta;

            if ( _uTick >= WATER_SPEED ) {
                _uTick = _uTick - WATER_SPEED;

                _uNormal1++;

                if ( _uNormal1 >= effectsTextures.waterNormal1.length ) _uNormal1 = 0;

                _uNormal2++;

                if ( _uNormal2 >= effectsTextures.waterNormal2.length ) _uNormal2 = 0;

                waterNormal1.value[0] = effectsTextures.waterNormal1[_uNormal1];
                waterNormal1.value[1] =
                    effectsTextures.waterNormal1[
                        ( _uNormal1 + 1 ) % effectsTextures.waterNormal1.length
                    ];

                waterNormal2.value[0] = effectsTextures.waterNormal2[_uNormal2];
                waterNormal2.value[1] =
                    effectsTextures.waterNormal2[
                        ( _uNormal2 + 1 ) % effectsTextures.waterNormal2.length
                    ];
            }

            uTime.value += delta / WATER_SPEED;

            uResolution.value.x = window.innerWidth;
            uResolution.value.y = window.innerHeight;
        },
    };

    return terrain;
};
export default createTerrainGeometryFromQuartiles;

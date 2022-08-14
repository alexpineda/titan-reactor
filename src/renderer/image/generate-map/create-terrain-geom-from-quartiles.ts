import { Vector2, MeshStandardMaterial, Mesh, ShaderChunk } from "three";


import { CreepTexture, WrappedQuartileTextures, GeometryOptions, EffectsTextures } from "common/types";

import { createDisplacementGeometryQuartile } from "./create-displacement-geometry-quartile";
import { MapDataTextures } from "./create-data-textures";

import hdMapFrag from "./glsl/hd.frag";
import hdHeaderFrag from "./glsl/hd-header.frag";
import { Terrain } from "@core/terrain";
import { HeightMaps } from "./height-maps";

export const createTerrainGeometryFromQuartiles = async (
    mapWidth: number,
    mapHeight: number,
    creepTexture: CreepTexture,
    creepEdgesTexture: CreepTexture,
    geomOptions: GeometryOptions,
    { creepEdgesTextureUniform, creepTextureUniform, occlussionRoughnessMetallicMap }: MapDataTextures,
    { displacementImage, displaceCanvas }: HeightMaps,
    mapTextures: WrappedQuartileTextures,
    effectsTextures: EffectsTextures
) => {
    const terrain = new Terrain({ geomOptions, mapWidth, mapHeight, displacementImage });

    const qw = mapTextures.quartileWidth;
    const qh = mapTextures.quartileHeight;

    const tilesX = mapWidth / qw;
    const tilesY = mapHeight / qh;

    for (let qy = 0; qy < tilesY; qy++) {
        for (let qx = 0; qx < tilesX; qx++) {
            const g = createDisplacementGeometryQuartile(
                qw,
                qh,
                qw * geomOptions.meshDetail,
                qh * geomOptions.meshDetail,
                displaceCanvas,
                geomOptions.maxTerrainHeight,
                0,
                qw / mapWidth,
                qh / mapHeight,
                qx * qw * geomOptions.textureDetail,
                qy * qh * geomOptions.textureDetail,
            );

            const mat = new MeshStandardMaterial({
                map: mapTextures.mapQuartiles[qx][qy],
                roughness: 1,
                bumpMap: mapTextures.mapQuartiles[qx][qy],
                bumpScale: geomOptions.bumpScale,
                // roughnessMap: occlussionRoughnessMetallicMap,
                fog: false
            });

            mat.onBeforeCompile = function (shader) {
                let fs = shader.fragmentShader;

                fs = fs.replace("#include <map_fragment>", hdMapFrag);
                fs = fs.replace("#include <roughnessmap_fragment>", ShaderChunk.roughnessmap_fragment.replace("vec4 texelRoughness = texture2D( roughnessMap, vUv );", "vec4 texelRoughness = texture2D( roughnessMap, qUv );"));
                ;

                shader.fragmentShader = [hdHeaderFrag, fs].join("\n");

                shader.uniforms.quartileSize = {
                    value: new Vector2(qw / mapWidth, qh / mapHeight),
                };
                shader.uniforms.quartileOffset = {
                    value: new Vector2((qw * qx) / mapWidth, (qh * qy) / mapHeight),
                };

                shader.uniforms.tileUnit = {
                    value: new Vector2(1 / qw, 1 / qh),
                };

                shader.uniforms.mapToCreepResolution = {
                    value: new Vector2(
                        qw / (creepTexture.count),
                        qh / 1
                    ),
                };
                shader.uniforms.creepResolution = {
                    value: new Vector2(creepTexture.count, 1)
                };

                shader.uniforms.mapToCreepEdgesResolution = {
                    value: new Vector2(
                        qw / (creepEdgesTexture.count),
                        qh / 1
                    ),
                };
                shader.uniforms.creepEdges = creepEdgesTextureUniform;
                shader.uniforms.creep = creepTextureUniform;
                shader.uniforms.creepEdgesTexture = {
                    value: creepEdgesTexture.texture,
                };
                shader.uniforms.creepEdgesResolution = {
                    value: new Vector2(
                        creepEdgesTexture.count,
                        1
                    ),
                };
                shader.uniforms.creepTexture = {
                    value: creepTexture.texture,
                };

                shader.uniforms.waterMask = {
                    value: effectsTextures.waterMask
                };

                shader.uniforms.waterNormal1_0 = {
                    value: effectsTextures.waterNormal1[0]
                };

                shader.uniforms.waterNormal1_1 = {
                    value: effectsTextures.waterNormal1[1]
                };

                shader.uniforms.waterNormal2_0 = {
                    value: effectsTextures.waterNormal2[0]
                };

                shader.uniforms.waterNormal2_1 = {
                    value: effectsTextures.waterNormal2[1]
                };

                shader.uniforms.tileMask = {
                    value: effectsTextures.tileMask
                };

                let vs = shader.vertexShader;
                vs = vs.replace("varying vec3 vViewPosition;", `
                    varying vec3 vViewPosition;
                    varying vec3 v_Position;
                `);
                ;
                vs = vs.replace("gl_Position = projectionMatrix * mvPosition;", `
                    gl_Position = projectionMatrix * mvPosition;
                    v_Position = projectionMatrix * mvPosition;
                `);
                shader.vertexShader = vs;

            };
            const terrainQuartile = new Mesh(g, mat);
            terrainQuartile.castShadow = true;
            terrainQuartile.receiveShadow = true;
            terrainQuartile.userData = {
                qx,
                qy,
            };

            terrainQuartile.position.set(
                qx * qw + qw / 2 - mapWidth / 2,
                -(qy * qh + qh / 2) + mapHeight / 2,
                0
            );
            terrain.add(terrainQuartile);
        }
    }

    terrain.rotation.x = -Math.PI / 2;
    terrain.matrixAutoUpdate = false;
    terrain.updateMatrix();
    terrain.visible = true;
    terrain.name = "TerrainHD";
    terrain.userData = {
        quartileWidth: qw, quartileHeight: qh, tilesX, tilesY
    }


    return terrain;
};
export default createTerrainGeometryFromQuartiles;

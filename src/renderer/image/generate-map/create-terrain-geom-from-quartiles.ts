import { Vector2, MeshStandardMaterial, Mesh, ShaderChunk, MeshBasicMaterial, Shader } from "three";


import { CreepTexture, WrappedQuartileTextures, GeometryOptions, EffectsTextures } from "common/types";

import { createDisplacementGeometryQuartile } from "./create-displacement-geometry-quartile";
import { MapDataTextures } from "./create-data-textures";

import hdMapFrag from "./hd/hd.frag.glsl?raw";
import hdHeaderFrag from "./hd/hd-header.frag.glsl?raw";
import { Terrain } from "@core/terrain";
import { HeightMaps } from "./height-maps/render-height-maps";
import gameStore from "@stores/game-store";
import { getTerrainY } from "./get-terrain-y";
import processStore from "@stores/process-store";

export const createTerrainGeometryFromQuartiles = async (
    mapWidth: number,
    mapHeight: number,
    creepTexture: CreepTexture,
    creepEdgesTexture: CreepTexture,
    geomOptions: GeometryOptions,
    { creepEdgesTextureUniform, creepTextureUniform /*, occlussionRoughnessMetallicMap*/ }: MapDataTextures,
    { singleChannel, texture, displaceCanvas }: HeightMaps,
    mapTextures: WrappedQuartileTextures,
    effectsTextures: EffectsTextures
) => {
    const terrain = new Terrain(geomOptions, getTerrainY({
        data: singleChannel, width: texture.image.width, height: texture.image.height
    }, geomOptions.maxTerrainHeight, mapWidth, mapHeight), (anisotropy: number) => {
        creepTexture.texture.anisotropy = anisotropy;
        creepEdgesTexture.texture.anisotropy = anisotropy;
    });

    const qw = mapTextures.quartileWidth;
    const qh = mapTextures.quartileHeight;

    const genProcess = processStore().create("generate-geometry", qw * qh);

    const tilesX = mapWidth / qw;
    const tilesY = mapHeight / qh;

    // const displacementMap = new DataTexture(out, texture.image.width, texture.image.height, RedFormat);
    // displacementMap.needsUpdate = true;

    for (let qy = 0; qy < tilesY; qy++) {
        for (let qx = 0; qx < tilesX; qx++) {
            // const g =
            //     new PlaneBufferGeometry(qw,
            //         qh,
            //         qw * geomOptions.meshDetail,
            //         qh * geomOptions.meshDetail);
            const g = createDisplacementGeometryQuartile(
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
                qy * qh * geomOptions.texPxPerTile,
            );
            g.computeVertexNormals();

            const standardMaterial = new MeshStandardMaterial({
                map: mapTextures.mapQuartiles[qx][qy],
                roughness: 1,
                bumpMap: mapTextures.mapQuartiles[qx][qy],
                bumpScale: geomOptions.bumpScale,
                envMap: gameStore().assets!.envMap,
                // displacementMap: displacementMap,
                // displacementScale: geomOptions.maxTerrainHeight,
                // roughnessMap: occlussionRoughnessMetallicMap,
                fog: false
            });

            const basicMaterial = new MeshBasicMaterial({
                map: mapTextures.mapQuartiles[qx][qy],
            })

            const materialOnBeforeCompile = function (shader: Shader) {
                let fs = shader.fragmentShader;

                fs = fs.replace("#include <map_fragment>", hdMapFrag);
                fs = fs.replace("#include <roughnessmap_fragment>", ShaderChunk.roughnessmap_fragment.replace("vUv", "qUv"));

                shader.fragmentShader = [hdHeaderFrag, fs].join("\n");

                let vs = shader.vertexShader;

                vs = vs.replace("#include <uv_vertex>", `${ShaderChunk.uv_vertex}\nqUv = vUv * quartileSize + vec2(quartileOffset.x, (1. - quartileSize.y) - quartileOffset.y);`);
                vs = vs.replace("#include <displacementmap_vertex>", ShaderChunk.displacementmap_vertex.replace("vUv", "qUv"));

                vs = vs.replace("varying vec3 vViewPosition;", `
                    varying vec3 vViewPosition;
                    varying vec3 v_Position;
                `);

                vs = vs.replace("gl_Position = projectionMatrix * mvPosition;", `
                    gl_Position = projectionMatrix * mvPosition;
                    v_Position = projectionMatrix * mvPosition;
                `);

                shader.vertexShader = `
                uniform vec2 quartileSize;
                uniform vec2 quartileOffset;
                varying vec2 qUv;

                ${vs}`;

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

            };
            standardMaterial.onBeforeCompile = materialOnBeforeCompile;
            basicMaterial.onBeforeCompile = materialOnBeforeCompile;

            const terrainQuartile = new Mesh(g, standardMaterial);
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
                -(qy * qh + qh / 2) + mapHeight / 2,
                0
            );
            terrainQuartile.name = `terrain-${qx}-${qy}`;
            terrain.add(terrainQuartile);
            genProcess.increment();
        }
    }

    terrain.castShadow = true;
    terrain.receiveShadow = true;
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

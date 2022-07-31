import { Vector2, MeshStandardMaterial, Mesh } from "three";


import { WrappedTexture, WrappedQuartileTextures, Terrain, GeometryOptions } from "common/types";

import { createDisplacementGeometryQuartile } from "./create-displacement-geometry-quartile";
import { MapDataTextures } from "./create-data-textures";

import hdMapFrag from "./glsl/hd.frag";
import hdHeaderFrag from "./glsl/hd-header.frag";

export const createTerrainGeometryFromQuartiles = async (
    mapWidth: number,
    mapHeight: number,
    creepTexture: WrappedTexture,
    creepEdgesTexture: WrappedTexture,
    geomOptions: GeometryOptions,
    { creepEdgesTextureUniform, creepTextureUniform }: MapDataTextures,
    displaceCanvas: HTMLCanvasElement,
    mapTextures: WrappedQuartileTextures,
) => {
    const terrain = new Terrain();

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
                fog: false
            });

            mat.onBeforeCompile = function (shader) {
                let fs = shader.fragmentShader;

                fs = fs.replace("#include <map_fragment>", hdMapFrag);
                shader.fragmentShader = [hdHeaderFrag, fs].join("\n");

                shader.uniforms.quartileResolution = {
                    value: new Vector2(qw / mapWidth, qh / mapHeight),
                };
                shader.uniforms.quartileOffset = {
                    value: new Vector2((qw * qx) / mapWidth, (qh * qy) / mapHeight),
                };
                shader.uniforms.invMapResolution = {
                    value: new Vector2(1 / qw, 1 / qh),
                };
                shader.uniforms.mapToCreepResolution = {
                    value: new Vector2(
                        qw / (creepTexture.width / creepTexture.pxPerTile),
                        qh / (creepTexture.height / creepTexture.pxPerTile)
                    ),
                };
                shader.uniforms.creepResolution = {
                    value: new Vector2(
                        creepTexture.width / creepTexture.pxPerTile,
                        creepTexture.height / creepTexture.pxPerTile
                    ),
                };

                shader.uniforms.mapToCreepEdgesResolution = {
                    value: new Vector2(
                        qw / (creepEdgesTexture.width / creepEdgesTexture.pxPerTile),
                        qh / (creepEdgesTexture.height / creepEdgesTexture.pxPerTile)
                    ),
                };
                shader.uniforms.creepEdges = creepEdgesTextureUniform;
                shader.uniforms.creep = creepTextureUniform;
                shader.uniforms.creepEdgesTexture = {
                    value: creepEdgesTexture.texture,
                };
                shader.uniforms.creepEdgesResolution = {
                    value: new Vector2(
                        creepEdgesTexture.width / creepEdgesTexture.pxPerTile,
                        creepEdgesTexture.height / creepEdgesTexture.pxPerTile
                    ),
                };
                shader.uniforms.creepTexture = {
                    value: creepTexture.texture,
                };
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
        quartileWidth: qw, quartileHeight: qh, tilesX, tilesY, geomOptions
    }


    return terrain;
};
export default createTerrainGeometryFromQuartiles;

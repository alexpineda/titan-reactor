import { Group, Vector2, LOD, MeshStandardMaterial, Mesh, EdgesGeometry, LineSegments, LineBasicMaterial } from "three";


import { WrappedTexture, WrappedQuartileTextures } from "common/types";
import processStore, { Process } from "@stores/process-store";

import { createDisplacementGeometryQuartile } from "./create-displacement-geometry-quartile";
import { MapDataTextures } from "./generate-map-data-textures";

import hdMapFrag from "./glsl/hd.frag";
import hdHeaderFrag from "./glsl/hd-header.frag";
import { GeometryOptions } from "./geometry-options";
import range from "common/utils/range";

export const createTerrainMesh = async (
    mapWidth: number,
    mapHeight: number,
    creepTexture: WrappedTexture,
    creepEdgesTexture: WrappedTexture,
    geomOptions: GeometryOptions,
    { creepEdgesTextureUniform, creepTextureUniform }: MapDataTextures,
    displaceCanvas: HTMLCanvasElement,
    mapTextures: WrappedQuartileTextures,
    terrainChunky: boolean,
    terrainShadows: boolean
) => {
    const terrain = new Group();

    const qw = mapTextures.quartileWidth;
    const qh = mapTextures.quartileHeight;

    const tilesX = mapWidth / qw;
    const tilesY = mapHeight / qh;

    // one LOD object per quartile
    const levels = range(0, tilesX * tilesY).map(() => new LOD());

    for (const levelIndex of [0, 1, 2]) {

        for (let qy = 0; qy < tilesY; qy++) {
            for (let qx = 0; qx < tilesX; qx++) {
                processStore().increment(Process.TerrainGeneration);

                const levelFactor = Math.max(1, levelIndex * 2);
                //0 -> 1
                //1 -> 2
                //2 -> 4

                const g = createDisplacementGeometryQuartile(
                    qw,
                    qh,
                    qw * geomOptions.displaceVertexScale / levelFactor,
                    qh * geomOptions.displaceVertexScale / levelFactor,
                    displaceCanvas,
                    geomOptions.displacementScale,
                    0,
                    qw / mapWidth,
                    qh / mapHeight,
                    qx * qw * geomOptions.displaceDimensionScale,
                    qy * qh * geomOptions.displaceDimensionScale
                );

                if (terrainChunky) {
                    g.computeVertexNormals();
                }

                const mat = new MeshStandardMaterial({
                    map: mapTextures.mapQuartiles[qx][qy],
                    roughness: 1,
                    // @ts-ignore
                    onBeforeCompile: function (shader) {
                        let fs = shader.fragmentShader;

                        //FIXME: chop up map rather than customize shader
                        // vs = vs.replace(
                        //     "#include <displacementmap_vertex>",
                        //     hdDisplaceVert
                        // );
                        // shader.vertexShader = [hdDisplaceVertHeader, vs].join("\n");

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
                    },
                });

                const edges = new EdgesGeometry(g);
                const line = new LineSegments(edges, new LineBasicMaterial({ color: 0xffffff }));
                line.position.set(
                    qx * qw + qw / 2 - mapWidth / 2,
                    -(qy * qh + qh / 2) + mapHeight / 2,
                    0
                );
                line.visible = false;
                terrain.add(line);

                const terrainQuartile = new Mesh(g, mat);
                terrainQuartile.castShadow = terrainShadows;
                terrainQuartile.receiveShadow = terrainShadows;

                terrainQuartile.position.set(
                    qx * qw + qw / 2 - mapWidth / 2,
                    -(qy * qh + qh / 2) + mapHeight / 2,
                    0
                );

                levels[qy * tilesX + qx].addLevel(terrainQuartile, levelIndex * 140);
            }
        }

    }

    terrain.add(...levels);
    terrain.rotation.x = -Math.PI / 2;
    terrain.matrixAutoUpdate = false;
    terrain.updateMatrix();
    terrain.visible = true;
    terrain.name = "TerrainHD";


    return terrain;
};
export default createTerrainMesh;

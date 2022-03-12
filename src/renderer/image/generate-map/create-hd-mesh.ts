import * as THREE from "three";
import { Mesh, Vector2 } from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { strict as assert } from "assert";

import { WrappedTexture, WrappedQuartileTextures } from "common/types";
import processStore, { Process } from "@stores/process-store";

import { createDisplacementGeometryQuartile } from "./create-displacement-geometry-quartile";
import { DataTexturesResult } from "./generate-map-data-textures";

import hdMapFrag from "./glsl/hd.frag";
import hdHeaderFrag from "./glsl/hd-header.frag";

const DEFAULT_GEOM_OPTIONS = {
    //low, walkable, mid, mid-walkable, high, high-walkable, mid/high/walkable
    elevationLevels: [0, 0.05, 0.25, 0.25, 0.4, 0.4, 0.25],
    ignoreLevels: [0, 1, 0, 1, 0, 1, 0],
    normalizeLevels: true,
    displaceDimensionScale: 16,
    displaceVertexScale: 2,
    blendNonWalkableBase: true,
    firstPass: true,
    secondPass: true,
    processWater: true,
    displacementScale: 4,
    drawMode: { value: 1 },
    detailsMix: 0.05,
    bumpScale: 0.1,
    firstBlur: 4,
};

export const createHDMesh = async (
    mapWidth: number,
    mapHeight: number,
    creepTexture: WrappedTexture,
    creepEdgesTexture: WrappedTexture,
    geomOptions = DEFAULT_GEOM_OPTIONS,
    { creepEdgesTextureUniform, creepTextureUniform }: DataTexturesResult,
    displaceCanvas: HTMLCanvasElement,
    hdQuartileTextures: WrappedQuartileTextures
) => {
    assert(hdQuartileTextures);

    //#region hd map
    const hdDisplace = new THREE.CanvasTexture(displaceCanvas);
    hdDisplace.flipY = false;
    const hdMaterials = [];
    const hdGeometries = [];
    const qw = hdQuartileTextures.quartileWidth;
    const qh = hdQuartileTextures.quartileHeight;

    for (let qy = 0; qy < hdQuartileTextures.quartileStrideH; qy++) {
        for (let qx = 0; qx < hdQuartileTextures.quartileStrideW; qx++) {
            processStore().increment(Process.TerrainGeneration);

            // const g = new THREE.PlaneBufferGeometry(
            //   qw,
            //   qh,
            //   qw * geomOptions.displaceVertexScale,
            //   qh * geomOptions.displaceVertexScale
            // );

            const g = createDisplacementGeometryQuartile(
                null,
                qw,
                qh,
                qw * geomOptions.displaceVertexScale,
                qh * geomOptions.displaceVertexScale,
                displaceCanvas,
                geomOptions.displacementScale,
                0,
                qw / mapWidth,
                qh / mapHeight,
                qx * qw * geomOptions.displaceDimensionScale,
                qy * qh * geomOptions.displaceDimensionScale
            );

            // g.rotateX(-Math.PI / 2);
            g.translate(
                qx * qw + qw / 2 - mapWidth / 2,
                -(qy * qh + qh / 2) + mapHeight / 2,
                0
            );

            hdGeometries.push(g);
            const mat = new THREE.MeshStandardMaterial({
                map: hdQuartileTextures.mapQuartiles[qx][qy],
                roughness: 1,
                //FIXME: roughnessMap + shader patch
                //FIXME: fix displacementMap shadow issue, requires custom depth material on entire mesh
                // displacementScale: geomOptions.displacementScale,
                // displacementMap: hdDisplace,
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
                            qw / (creepTexture.width / 128),
                            qh / (creepTexture.height / 128)
                        ),
                    };
                    shader.uniforms.creepResolution = {
                        value: new Vector2(
                            creepTexture.width / 128,
                            creepTexture.height / 128
                        ),
                    };

                    shader.uniforms.mapToCreepEdgesResolution = {
                        value: new Vector2(
                            qw / (creepEdgesTexture.width / 128),
                            qh / (creepEdgesTexture.height / 128)
                        ),
                    };
                    shader.uniforms.creepEdges = creepEdgesTextureUniform;
                    shader.uniforms.creep = creepTextureUniform;
                    shader.uniforms.creepEdgesTexture = {
                        value: creepEdgesTexture.texture,
                    };
                    shader.uniforms.creepEdgesResolution = {
                        value: new Vector2(
                            creepEdgesTexture.width / 128,
                            creepEdgesTexture.height / 128
                        ),
                    };
                    shader.uniforms.creepTexture = {
                        value: creepTexture.texture,
                    };
                },
            });

            hdMaterials.push(mat);
        }
    }

    const hdGeometry = mergeBufferGeometries(hdGeometries, true);
    // new THREE.PlaneBufferGeometry(
    //   mapWidth,
    //   mapHeight,
    //   mapWidth * geomOptions.displaceVertexScale,
    //   mapHeight * geomOptions.displaceVertexScale
    // );
    const terrain = new Mesh(hdGeometry, hdMaterials);
    // hdTerrain.customDepthMaterial = hdDepthMaterial;
    terrain.rotation.x = -Math.PI / 2;
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    // const indicesPerMaterial = hdGeometry.index.count / hdMaterials.length;
    // hdMaterials.forEach((_, i) => {
    //   hdGeometry.addGroup(i * indicesPerMaterial, indicesPerMaterial, i);
    // });

    //#endregion hd map

    terrain.visible = true;

    terrain.name = "TerrainHD";

    terrain.matrixAutoUpdate = false;
    terrain.updateMatrix();

    return terrain;
};
export default createHDMesh;

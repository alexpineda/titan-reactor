import * as THREE from "three";
import {
    Mesh,
    Vector2,
    MeshDepthMaterial,
} from "three";

import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { createDisplacementGeometryQuartile } from "./create-displacement-geometry-quartile";
import { DataTexturesResult } from "./create-data-textures";

import {
    updateLoadingProcess,
} from "../../../renderer/stores";
import { GenerateTexturesResult } from "./generate-map-tile-textures";

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

//@todo separate sd and hd
export const createHDMaterials = async (
    tileData: GenerateTexturesResult,
    geomOptions = DEFAULT_GEOM_OPTIONS,
    { creepEdgesTextureUniform, creepTextureUniform }: DataTexturesResult,
    displaceCanvas: HTMLCanvasElement
) => {
    const {
        mapWidth,
        mapHeight,
        mapHd: hdMaps,
        creepEdgesTextureHD,
        creepTextureHD,
    } = tileData;

    //#region hd map
    const hdDisplace = new THREE.CanvasTexture(displaceCanvas);
    hdDisplace.flipY = false;
    const hdMaterials = [];
    const hdGeometries = [];
    const qw = hdMaps.quartileWidth;
    const qh = hdMaps.quartileHeight;

    const hdDepthMaterial = new MeshDepthMaterial({
        // displacementScale: geomOptions.displacementScale,
        map: hdDisplace,
        // onBeforeCompile: function (shader) {
        //   let vs = shader.vertexShader;
        //   vs = vs.replace(
        //     "#include <displacementmap_vertex>",
        //     `
        //   #ifdef USE_DISPLACEMENTMAP

        //       vec2 duv = (vUv * quartileResolution) ;
        //       // flip on y axis per quartile
        //       duv.x += quartileOffset.x;
        //       duv.y = quartileResolution.y - duv.y + quartileOffset.y;
        //       transformed += normalize( objectNormal ) * ( texture2D( displacementMap, duv ).x * displacementScale + displacementBias );

        //     #endif
        //   `
        //   );
        //   shader.vertexShader = `
        //     precision highp isampler2D;
        //     uniform vec2 quartileResolution;
        //     uniform vec2 quartileOffset;

        //   ${vs}`;
        //   shader.uniforms.quartileResolution = {
        //     value: new Vector2(qw / mapWidth, qh / mapHeight),
        //   };
        //   shader.uniforms.quartileOffset = {
        //     value: new Vector2((qw * qx) / mapWidth, (qh * qy) / mapHeight),
        //   };
        // },
    });

    for (let qy = 0; qy < hdMaps.quartileStrideH; qy++) {
        for (let qx = 0; qx < hdMaps.quartileStrideW; qx++) {
            updateLoadingProcess("terrain");

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
                map: hdMaps.mapQuartiles[qx][qy],
                roughness: 1,
                //@todo roughnessMap + shader patch
                //@todo fix displacementMap shadow issue, requires custom depth material on entire mesh
                // displacementScale: geomOptions.displacementScale,
                // displacementMap: hdDisplace,
                // @ts-ignore
                onBeforeCompile: function (shader) {
                    let fs = shader.fragmentShader;
                    let vs = shader.vertexShader;
                    vs = vs.replace(
                        "#include <displacementmap_vertex>",
                        `
          #ifdef USE_DISPLACEMENTMAP

              vec2 duv = (vUv * quartileResolution) ;
              // flip on y axis per quartile
              duv.x += quartileOffset.x;
              duv.y = quartileResolution.y - duv.y + quartileOffset.y;
              transformed += normalize( objectNormal ) * ( texture2D( displacementMap, duv ).x * displacementScale + displacementBias );

            #endif
          `
                    );
                    shader.vertexShader = `
            precision highp isampler2D;
            uniform vec2 quartileResolution;
            uniform vec2 quartileOffset;
          
          ${vs}`;

                    fs = fs.replace(
                        "#include <map_fragment>",
                        `
            #include <map_fragment>

          //creep hd

          //reposition the quartile y offset, yeah shits getting weird :S
          vec2 qo = vec2(quartileOffset.x, (1. - quartileResolution.y) - quartileOffset.y);

          vec2 creepUv = vUv * quartileResolution + qo;
          float creepF = texture2D(creep, creepUv).r;
          float creepEdge = texture2D(creepEdges, creepUv).r;

          if (creepF > 0.) {
            vec4 creepColor = getSampledCreep(creepUv, vUv, creep, creepResolution, mapToCreepResolution);
            vec4 creepLinear = mapTexelToLinear(creepColor);
            diffuseColor =  creepLinear;
          }

          if (creepEdge > 0.) {
            vec2 creepUv = getCreepUv(vUv, creepEdge, creepEdgesResolution, mapToCreepEdgesResolution);
            vec4 creepEdgeColor = texture2D(creepEdgesTexture, creepUv);
            vec4 creepEdgeLinear = mapTexelToLinear(creepEdgeColor);
            diffuseColor = mix(diffuseColor, creepEdgeLinear, creepEdgeColor.a);
          }


          `
                    );
                    shader.fragmentShader = `
            precision highp isampler2D;
            uniform vec2 quartileResolution;
            uniform vec2 quartileOffset;
            uniform vec2 invMapResolution;
            uniform vec2 mapToCreepResolution;
            
            // creep
            uniform sampler2D creep;
            uniform sampler2D creepTexture;
            uniform vec2 creepResolution;
            uniform vec2 mapToCreepEdgesResolution;

            uniform sampler2D creepEdges;
            uniform sampler2D creepEdgesTexture;
            uniform vec2 creepEdgesResolution;

            vec2 getCreepUv( vec2 uv, in float value, in vec2 res, in vec2 invRes ) {
              float creepS = (value - 1./255.) * 255./res.x ; 
    
              float tilex = mod(uv.x, invMapResolution.x)  * invRes.x + creepS;
              float tiley = mod(uv.y, invMapResolution.y) * invRes.y;
    
              return vec2(tilex, tiley);
            }
    
            vec4 getCreepColor( vec2 uv, vec2 mapUv, in sampler2D tex, in vec2 res, in vec2 invRes, in vec4 oColor) {
              float creepF = texture2D(tex, uv ).r;
    
              if (creepF > 0.) {
                vec2 creepUv = getCreepUv(mapUv, creepF, creepResolution, mapToCreepResolution);
                return texture2D(creepTexture,creepUv);
              }
    
              return oColor;
            }

            vec4 getSampledCreep(const in vec2 uv, vec2 mapUv, in sampler2D tex, in vec2 res, in vec2 invRes) {

              vec2 texelSize = vec2(1.0) / res * 128.;
              float r = 2.;
            
              float dx0 = -texelSize.x * r;
              float dy0 = -texelSize.y * r;
              float dx1 = texelSize.x * r;
              float dy1 = texelSize.y * r;
              vec4 oColor = getCreepColor(uv, mapUv, tex, res, invRes, vec4(0.));
              return (
                getCreepColor(uv + vec2(dx0, dy0), mapUv,  tex, res, invRes, oColor) +
                getCreepColor(uv + vec2(0.0, dy0), mapUv, tex, res, invRes, oColor) +
                getCreepColor(uv + vec2(dx1, dy0), mapUv, tex, res, invRes, oColor) +
                getCreepColor(uv + vec2(dx0, 0.0), mapUv, tex, res, invRes, oColor) +
                oColor +
                getCreepColor(uv + vec2(dx1, 0.0), mapUv, tex, res, invRes, oColor) +
                getCreepColor(uv + vec2(dx0, dy1), mapUv, tex, res, invRes, oColor) +
                getCreepColor(uv + vec2(0.0, dy1), mapUv, tex, res, invRes, oColor) +
                getCreepColor(uv + vec2(dx1, dy1), mapUv, tex, res, invRes, oColor)
              ) * (1.0 / 9.0);
                
            }

            ${fs}
        `;
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
                            qw / (creepTextureHD.width / 128),
                            qh / (creepTextureHD.height / 128)
                        ),
                    };
                    shader.uniforms.creepResolution = {
                        value: new Vector2(
                            creepTextureHD.width / 128,
                            creepTextureHD.height / 128
                        ),
                    };

                    shader.uniforms.mapToCreepEdgesResolution = {
                        value: new Vector2(
                            qw / (creepEdgesTextureHD.width / 128),
                            qh / (creepEdgesTextureHD.height / 128)
                        ),
                    };
                    shader.uniforms.creepEdges = creepEdgesTextureUniform;
                    shader.uniforms.creep = creepTextureUniform;
                    shader.uniforms.creepEdgesTexture = {
                        value: creepEdgesTextureHD.texture,
                    };
                    shader.uniforms.creepEdgesResolution = {
                        value: new Vector2(
                            creepEdgesTextureHD.width / 128,
                            creepEdgesTextureHD.height / 128
                        ),
                    };
                    shader.uniforms.creepTexture = {
                        value: creepTextureHD.texture,
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
export default createHDMaterials;

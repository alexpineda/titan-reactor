import { DataTexturesResult } from "./generate-map-data-textures";
import * as THREE from "three";
import {
  Mesh,
  Vector2,
} from "three";

import { GeometryOptions } from "./geometry-options";
import { WrappedTexture } from "common/types";
import sdMapFrag from "./glsl/sd-map.frag";
import sdMapFragHeader from "./glsl/sd-map-header.frag";
import elevationFrag from "./glsl/elevation.frag";
import elevationHeader from "./glsl/elevation-header.frag";


export const createSDMesh = async (
  mapWidth: number,
  mapHeight: number,
  creepTexture: WrappedTexture,
  creepEdgesTexture: WrappedTexture,
  geomOptions: GeometryOptions,
  { paletteIndicesMap, paletteMap, creepEdgesTextureUniform, creepTextureUniform, sdMap, elevationsMap, mapTilesMap, roughnessMap }: DataTexturesResult,
  displacementCanvas: HTMLCanvasElement,
) => {

  const tileAnimationCounterUniform = { value: 0 };
  const sdMapMaterial = new THREE.MeshStandardMaterial({
    map: sdMap,
    displacementScale: geomOptions.displacementScale,
    displacementMap: new THREE.CanvasTexture(displacementCanvas),
    // @ts-ignore
    onBeforeCompile: function (shader) {
      let fs = shader.fragmentShader;

      fs = fs.replace(
        "#include <map_fragment>",
        sdMapFrag
      );

      shader.fragmentShader = `
        ${sdMapFragHeader}
        ${fs}
      `;

      shader.uniforms.palette = { value: paletteMap };
      shader.uniforms.paletteIndices = { value: paletteIndicesMap };
      shader.uniforms.counter = tileAnimationCounterUniform;

      shader.uniforms.mapResolution = {
        value: new Vector2(mapWidth, mapHeight),
      };
      shader.uniforms.invMapResolution = {
        value: new Vector2(1 / mapWidth, 1 / mapHeight),
      };
      shader.uniforms.mapToCreepResolution = {
        value: new Vector2(
          mapWidth / (creepTexture.width / 32),
          mapHeight / (creepTexture.height / 32)
        ),
      };
      shader.uniforms.creepResolution = {
        value: new Vector2(
          creepTexture.width / 32,
          creepTexture.height / 32
        ),
      };
      shader.uniforms.creepEdgesResolution = {
        value: new Vector2(
          creepEdgesTexture.width / 32,
          creepEdgesTexture.height / 32
        ),
      };
      shader.uniforms.mapToCreepEdgesResolution = {
        value: new Vector2(
          mapWidth / (creepEdgesTexture.width / 32),
          mapHeight / (creepEdgesTexture.height / 32)
        ),
      };
      shader.uniforms.creep = creepTextureUniform;
      shader.uniforms.creepEdges = creepEdgesTextureUniform;
      shader.uniforms.creepEdgesTexture = {
        value: creepEdgesTexture.texture,
      };
      shader.uniforms.creepTexture = {
        value: creepTexture.texture,
      };
    },
  });
  sdMapMaterial.userData.tileAnimationCounter = tileAnimationCounterUniform;

  const elevationOptions = {
    drawMode: { value: 0 },
  };

  const elevationsMaterial = new THREE.MeshStandardMaterial({
    displacementScale: geomOptions.displacementScale,
    displacementMap: new THREE.CanvasTexture(displacementCanvas),
    map: sdMap,
    roughness: 1,
    bumpMap: roughnessMap,
    bumpScale: 0.3,
    // @ts-ignore
    onBeforeCompile: function (shader) {
      let fs = shader.fragmentShader;

      fs = fs.replace(
        "#include <map_fragment>",
        elevationFrag
      );

      shader.fragmentShader = `
        ${elevationHeader}
        ${fs}
      `;

      shader.uniforms.elevations = { value: elevationsMap };
      shader.uniforms.drawMode = elevationOptions.drawMode;
      shader.uniforms.mapTiles = { value: mapTilesMap };
    },
  });
  elevationsMaterial.userData = elevationOptions;

  const geometry = new THREE.PlaneBufferGeometry(
    mapWidth,
    mapHeight,
    mapWidth * geomOptions.displaceVertexScale,
    mapHeight * geomOptions.displaceVertexScale
  );
  // const geometry = createDisplacementGeometry(
  //   null,
  //   mapWidth,
  //   mapHeight,
  // mapWidth * options.displaceVertexScale,
  // mapHeight * options.displaceVertexScale,
  //   displaceCanvas,
  //   options.displacementScale,
  //   0
  // );

  const sdTerrain = new Mesh();
  sdTerrain.geometry = geometry;
  sdTerrain.material = sdMapMaterial;
  sdTerrain.castShadow = true;
  sdTerrain.receiveShadow = true;
  sdTerrain.rotation.x = -Math.PI / 2;
  sdTerrain.userData.displace = new THREE.CanvasTexture(displacementCanvas);
  sdTerrain.userData.map = sdMap;
  sdTerrain.userData.mat = sdMapMaterial;
  sdTerrain.userData.elevationsMaterial = elevationsMaterial;
  sdTerrain.userData.textures = [
    sdTerrain.userData.displace,
    sdTerrain.userData.map,
    sdTerrain.userData.elevationsMaterial,
    sdTerrain.userData.mat,
  ];

  sdTerrain.visible = true;

  sdTerrain.name = "SDTerrain";

  sdTerrain.matrixAutoUpdate = false;
  sdTerrain.updateMatrix();

  return sdTerrain;
};
export default createSDMesh;

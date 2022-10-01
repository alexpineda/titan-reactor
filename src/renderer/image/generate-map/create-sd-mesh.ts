import { MapLookupTextures } from "./create-data-textures";
import * as THREE from "three";
import {
  Mesh,
  Vector2,
} from "three";

import { CreepTexture, GeometryOptions } from "common/types";
import sdMapFrag from "./sd/sd-map.frag.glsl?raw";
import sdMapFragHeader from "./sd/sd-map-header.frag.glsl?raw";
import elevationFrag from "./sd/elevation.frag.glsl?raw";
import elevationHeader from "./sd/elevation-header.frag.glsl?raw";


export const createSDMesh = async (
  mapWidth: number,
  mapHeight: number,
  creepTexture: CreepTexture,
  creepEdgesTexture: CreepTexture,
  geomOptions: GeometryOptions,
  { paletteIndicesTex: paletteIndicesMap, paletteTex: paletteMap, creepEdgesTexUniform: creepEdgesTextureUniform, creepTexUniform: creepTextureUniform, mapDiffuseTex: sdMap, elevationsTex: elevationsMap, tilesTex: mapTilesMap }: MapLookupTextures,
  displacementCanvas: HTMLCanvasElement,
) => {

  const tileAnimationCounterUniform = { value: 0 };
  const sdMapMaterial = new THREE.MeshStandardMaterial({
    map: sdMap,
    displacementScale: geomOptions.maxTerrainHeight,
    displacementMap: new THREE.CanvasTexture(displacementCanvas)

  });
  sdMapMaterial.onBeforeCompile = function (shader) {
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
        mapWidth / creepTexture.count,
        mapHeight / 1
      ),
    };
    shader.uniforms.creepResolution = {
      value: new Vector2(
        creepTexture.count,
        1
      ),
    };
    shader.uniforms.creepEdgesResolution = {
      value: new Vector2(
        creepEdgesTexture.count,
        1
      ),
    };
    shader.uniforms.mapToCreepEdgesResolution = {
      value: new Vector2(
        mapWidth / (creepEdgesTexture.count),
        mapHeight / 1
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
    sdMapMaterial.userData.tileAnimationCounter = tileAnimationCounterUniform;

  const elevationOptions = {
    drawMode: { value: 0 },
  };

  const elevationsMaterial = new THREE.MeshStandardMaterial({
    displacementScale: geomOptions.maxTerrainHeight,
    displacementMap: new THREE.CanvasTexture(displacementCanvas),
    map: sdMap,
    roughness: 1,
  });
  elevationsMaterial.onBeforeCompile = function (shader) {
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
  };
  elevationsMaterial.userData = elevationOptions;

  const geometry = new THREE.PlaneBufferGeometry(
    mapWidth,
    mapHeight,
    mapWidth * geomOptions.tesselation,
    mapHeight * geomOptions.tesselation
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

import * as THREE from "three";
import { terrainMesh } from "./meshes/terrainMesh";
import { backgroundTerrainMesh } from "./meshes/backgroundTerrainMesh";
import { rgbToCanvas } from "../2d-map-rendering/image/canvas";
import { mapCanvasTexture } from "./textures/mapCanvasTexture";
import { bgMapCanvasTexture } from "./textures/bgMapCanvasTexture";
import { displacementCanvasTexture } from "./textures/displacementCanvasTexture";
import { roughnessCanvasTexture } from "./textures/roughnessCanvasTexture";

const Cache = {
  restore: (filepath) => Promise.reject(),
  save: (filepath, data) => Promise.resolve(data),
  convertAndSaveMapTexture: (id, data, width, height) =>
    Promise.resolve(
      new THREE.CanvasTexture(rgbToCanvas({ data, width, height }))
    ),
};

export async function loadAllTerrain(chk) {
  return Promise.all([
    mapCanvasTexture(chk, {}),
    bgMapCanvasTexture(chk, {}),
    displacementCanvasTexture(chk, {}),
    roughnessCanvasTexture(chk, {}),
    Promise.resolve(
      new THREE.TextureLoader().load("_alex/fs-nodoodads_normal.png")
    ),
  ]).then(([map, bg, displace, roughness, normal]) => {
    const terrain = terrainMesh(
      chk.size[0],
      chk.size[1],
      map,
      displace,
      roughness,
      normal
    );
    const bgTerrain = backgroundTerrainMesh(chk.size[0], chk.size[1], bg);

    return [terrain, bgTerrain];
  });
}

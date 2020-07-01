import { terrainMesh } from "./meshes/terrainMesh";
import { backgroundTerrainMesh } from "./meshes/backgroundTerrainMesh";
import { mapCanvasTexture } from "./textures/mapCanvasTexture";
import { bgMapCanvasTexture } from "./textures/bgMapCanvasTexture";
import { displacementCanvasTexture } from "./textures/displacementCanvasTexture";
import { roughnessCanvasTexture } from "./textures/roughnessCanvasTexture";
import { normalCanvasTexture } from "./textures/normalCanvasTexture";

export async function loadAllTerrain(chk) {
  const map = await mapCanvasTexture(chk, {});
  const bg = await bgMapCanvasTexture(chk, {});
  const displace = await displacementCanvasTexture(chk, {});
  const roughness = await roughnessCanvasTexture(chk, {});
  const normal = await normalCanvasTexture(chk, {});

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
}

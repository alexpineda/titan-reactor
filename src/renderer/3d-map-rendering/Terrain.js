import { displacementCanvasTexture } from "./textures/displacementCanvasTexture";
import { roughnessCanvasTexture } from "./textures/roughnessCanvasTexture";
import { normalCanvasTexture } from "./textures/normalCanvasTexture";
import { emissiveCanvasTexture } from "./textures/emissiveCanvasTexture";

import { createDisplacementGeometry } from "./displacementGeometry";
import { mapCanvasTexture } from "./textures/mapCanvasTexture";
import { terrainMesh } from "./meshes/terrainMesh";
export class Terrain {
  constructor(chk, cache) {
    this.chk = chk;
    this.cache = cache;
  }

  async displace(baseOptions, overlayOptions) {
    const displace = await displacementCanvasTexture(
      this.chk,
      baseOptions,
      overlayOptions
    );
    this.generate(
      this.terrain.material.map,
      displace,
      this.terrain.material.roughnessMap,
      this.terrain.material.normalMap
    );
  }

  async roughness(options) {
    const roughness = await roughnessCanvasTexture(this.chk, options);
    this.generate(
      this.terrain.material.map,
      this.terrain.userData.displacementMap,
      roughness,
      this.terrain.material.normalMap
    );
  }

  async generate(defaultMap, defaultDisplace, defaultRoughness, defaultNormal) {
    const map =
      defaultMap ||
      (await this.cache.get("map")) ||
      (await mapCanvasTexture(this.chk));
    const displace =
      defaultDisplace ||
      (await this.cache.get("displace")) ||
      (await displacementCanvasTexture(this.chk));
    const roughness =
      defaultRoughness ||
      (await this.cache.get("roughness")) ||
      (await roughnessCanvasTexture(this.chk));
    const normal =
      defaultNormal ||
      (await this.cache.get("normal")) ||
      (await normalCanvasTexture(this.chk));

    this.terrain = terrainMesh(
      this.chk.size[0],
      this.chk.size[1],
      map,
      displace,
      roughness,
      normal
    );
    this.terrain.name = "floor";

    this.terrain.userData.originalMap = this.terrain.material.map;

    return this.terrain;
  }

  dispose() {
    if (this.terrain) {
      this.terrain.material.map.dispose();
      this.terrain.material.bumpMap.dispose();
      this.terrain.material.roughnessMap.dispose();
      this.terrain.userData.displacementMap.dispose();

      this.terrain.material.dispose();
      this.terrain.geometry.dispose();
    }
  }
}

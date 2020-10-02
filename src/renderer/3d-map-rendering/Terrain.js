import { displacementImage } from "./textures/displacementImage";
import { roughnessImage } from "./textures/roughnessImage";
import { mapImage } from "./textures/mapImage";
import { terrainMesh } from "./meshes/terrainMesh";
import { imageToCanvasTexture } from "./textures/imageToCanvasTexture";

export class Terrain {
  constructor(chk, cache) {
    this.chk = chk;
    this.cache = cache;
  }

  async displace(save, baseOptions = {}, overlayOptions = {}) {
    const displace = await displacementImage(
      this.chk,
      save,
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
    const roughness = await roughnessImage(this.chk, options);
    this.generate(
      this.terrain.material.map,
      this.terrain.userData.displacementMap,
      roughness,
      this.terrain.material.normalMap
    );
  }

  async generate(defaultMap, defaultDisplace, defaultRoughness, defaultNormal) {
    const get = async (name, generate, defaultImage = null) => {
      let image = defaultImage;
      let format = "rgb";
      if (!defaultImage) {
        if (await this.cache.exists(name)) {
          image = await this.cache.get(name);
          format = "rgba";
        } else {
          image = await generate(this.chk);
          this.cache.save(name, image.data, image.width, image.height);
        }
      }
      return imageToCanvasTexture(
        image.data,
        image.width,
        image.height,
        format
      );
    };

    const map = await get("map", mapImage, defaultMap);
    const displace = await get("displace", displacementImage, defaultDisplace);
    const roughness = await get("roughness", roughnessImage, defaultRoughness);

    this.terrain = terrainMesh(
      this.chk.size[0],
      this.chk.size[1],
      map,
      displace,
      roughness
    );

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

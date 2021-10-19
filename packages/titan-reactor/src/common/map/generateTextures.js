import { WebGLRenderer } from "three";

import MapHD from "./MapHD";
import MapSD from "./MapSD";
import MapData from "./MapData";

export default async (
  mapWidth,
  mapHeight,
  {
    mapTiles,
    megatiles,
    minitilesFlags,
    minitiles,
    palette,
    tileset,
    hdTiles,
    tilegroupU16,
    tilegroupBuf,
    creepGrpHD,
    creepGrpSD,
  }
) => {
  const renderer = new WebGLRenderer({
    depth: false,
    stencil: false,
    alpha: true,
  });
  renderer.autoClear = false;

  const mapData = MapData.generate(mapWidth, mapHeight, {
    mapTiles,
    palette,
    megatiles,
    minitilesFlags,
    minitiles,
    tilegroupU16,
    tilegroupBuf,
  });

  const mapHd = MapHD.renderTilesToQuartiles(renderer, mapWidth, mapHeight, {
    hdTiles,
    ...mapData,
  });

  const creepEdgesTextureHD = MapHD.renderCreepEdgesTexture(
    renderer,
    creepGrpHD
  );

  const creepTextureHD = MapHD.renderCreepTexture(
    renderer,
    hdTiles,
    tilegroupU16
  );

  const creepEdgesTextureSD = await MapSD.renderCreepEdgesTexture(
    creepGrpSD,
    palette
  );

  const creepTextureSD = MapSD.renderCreepTexture(
    palette,
    megatiles,
    minitiles,
    tilegroupU16,
    renderer.capabilities.getMaxAnisotropy()
  );

  renderer.dispose();

  return {
    palette,
    tileset,
    mapWidth,
    mapHeight,
    mapData,
    mapHd,
    creepEdgesTextureSD,
    creepEdgesTextureHD,
    creepTextureHD,
    creepTextureSD,
  };
};

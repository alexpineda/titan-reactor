import {
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector3,
  PlaneBufferGeometry,
  Mesh,
  CanvasTexture,
  sRGBEncoding,
} from "three";
import { loadHdTile, PX_PER_TILE } from "./common";

// generates map textures
// splits up textures into quadrants if a single texture would be
// over max supported size
export const mapDataToTextures = (
  renderer,
  mapWidth,
  mapHeight,
  { hdTiles, mapTilesData }
) => {
  const mapQuartiles = [];

  const webGlMaxTextureSize = renderer.capabilities.maxTextureSize;
  //16384, 8192, 4096

  // tile units
  const maxQuartileSize = Math.min(32, webGlMaxTextureSize / PX_PER_TILE);
  // 64; //64, 64, 32    0.5->1, 1, 2
  // 96; //96, 48, 32    0.75->1, 1.5->2, 3
  // 128; //128, 64, 32   1, 2, 4
  // 192; //96, 64, 32    1.5->2, 3, 6
  // 256; //128,64,32     2, 4, 8

  const quartileStrideW = Math.ceil(mapWidth / maxQuartileSize);
  const quartileWidth = mapWidth / quartileStrideW;

  const quartileStrideH = Math.ceil(mapHeight / maxQuartileSize);
  const quartileHeight = mapHeight / quartileStrideH;

  const far = Math.max(quartileWidth, quartileHeight);
  const ortho = new OrthographicCamera(
    -quartileWidth / 2,
    quartileWidth / 2,
    -quartileHeight / 2,
    quartileHeight / 2,
    0,
    far * 2
  );
  ortho.position.y = far;
  ortho.lookAt(new Vector3());

  const hdCache = new Map();
  const renderWidth = quartileWidth * PX_PER_TILE;
  const renderHeight = quartileHeight * PX_PER_TILE;
  renderer.setSize(renderWidth, renderHeight);

  const quartileScene = new Scene();
  const plane = new PlaneBufferGeometry();
  const mat = new MeshBasicMaterial({});
  const mesh = new Mesh(plane, mat);
  quartileScene.add(mesh);

  for (let qx = 0; qx < quartileStrideW; qx++) {
    mapQuartiles[qx] = [];
    for (let qy = 0; qy < quartileStrideH; qy++) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      // const rt = new WebGLRenderTarget(renderWidth, renderHeight);

      for (let x = 0; x < quartileWidth; x++) {
        for (let y = 0; y < quartileHeight; y++) {
          const my = y + qy * quartileHeight;
          const mx = x + qx * quartileWidth;
          const tile = mapTilesData[my * mapWidth + mx];
          if (hdTiles[tile]) {
            const texture = hdCache.get(tile) || loadHdTile(hdTiles[tile]);
            if (!hdCache.has(tile)) {
              hdCache.set(tile, texture);
            }
            mat.map = texture;
            mat.needsUpdate = true;
            mesh.position.x = x - quartileWidth / 2 + 0.5;
            mesh.position.z = y - quartileHeight / 2 + 0.5;
            mesh.rotation.x = Math.PI / 2;
            // renderer.setRenderTarget(rt);
            renderer.render(quartileScene, ortho);
            // renderer.setRenderTarget(null);
          } else {
            console.error("no tile", tile);
          }
        }
      }

      ctx.drawImage(renderer.domElement, 0, 0);
      mapQuartiles[qx][qy] = new CanvasTexture(canvas);
      // mapQuartiles[qx][qy] = rt.texture;
      mapQuartiles[qx][qy].encoding = sRGBEncoding;
      mapQuartiles[qx][qy].anisotropy =
        renderer.capabilities.getMaxAnisotropy();
      mapQuartiles[qx][qy].flipY = false;
    }
  }

  mat.dispose();
  hdCache.forEach((t) => t.dispose());

  return {
    mapQuartiles,
    quartileHeight,
    quartileStrideH,
    quartileStrideW,
    quartileWidth,
  };
};
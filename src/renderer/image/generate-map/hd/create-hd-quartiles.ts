import {
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector3,
  PlaneBufferGeometry,
  Mesh,
  sRGBEncoding,
  WebGLRenderer,
  Texture,
  WebGLRenderTarget,
  NearestFilter,
  DoubleSide,
} from "three";
import { parseDdsGrp } from "../../formats/parse-dds-grp";
import { WrappedQuartileTextures, UnitTileScale } from "common/types";
import { createCompressedTexture } from "./common";
import { Janitor, JanitorLogLevel } from "@utils/janitor";

// generates map textures
// splits up textures into quadrants if a single texture would be
// over max supported size
export const createHdQuartiles = (
  mapWidth: number,
  mapHeight: number,
  imageData: Buffer,
  mapTilesData: Uint16Array,
  res: UnitTileScale,
  renderer: WebGLRenderer
): WrappedQuartileTextures => {


  const PX_PER_TILE_HD = res === UnitTileScale.HD ? 128 : 64;


  const mapQuartiles: Texture[][] = [];
  const hdTiles = parseDdsGrp(imageData);
  const webGlMaxTextureSize = renderer.capabilities.maxTextureSize;
  //16384, 8192, 4096

  // tile units
  const maxQuartileSize = Math.min(32, webGlMaxTextureSize / PX_PER_TILE_HD);
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
  const renderWidth = quartileWidth * PX_PER_TILE_HD;
  const renderHeight = quartileHeight * PX_PER_TILE_HD;
  renderer.setSize(renderWidth, renderHeight);

  const plane = new PlaneBufferGeometry();
  for (let qx = 0; qx < quartileStrideW; qx++) {
    mapQuartiles[qx] = [];
    for (let qy = 0; qy < quartileStrideH; qy++) {

      const quartileScene = new Scene();
      quartileScene.name = "quartile-ortho-scene";

      for (let x = 0; x < quartileWidth; x++) {
        for (let y = 0; y < quartileHeight; y++) {
          const my = y + qy * quartileHeight;
          const mx = x + qx * quartileWidth;
          const tile = mapTilesData[my * mapWidth + mx];
          if (hdTiles[tile]) {
            const texture = hdCache.get(tile) || createCompressedTexture(hdTiles[tile]);
            if (!hdCache.has(tile)) {
              hdCache.set(tile, texture);
            }
            texture.encoding = sRGBEncoding;
            const mat = new MeshBasicMaterial({
              map: texture,
              side: DoubleSide,
            });
            const mesh = new Mesh(plane, mat);
            mesh.name = "hd-tile";
            quartileScene.add(mesh);
            mesh.position.x = x - quartileWidth / 2 + 0.5;
            mesh.position.z = y - quartileHeight / 2 + 0.5;
            mesh.rotation.x = Math.PI / 2;
          } else {
            console.error("no tile", tile);
          }
        }
      }

      const rt = new WebGLRenderTarget(renderWidth, renderHeight, {
        anisotropy: renderer.capabilities.getMaxAnisotropy(),
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        encoding: sRGBEncoding,
      });
      renderer.setRenderTarget(rt)
      quartileScene.scale.set(1, 1, -1);
      renderer.render(quartileScene, ortho);

      mapQuartiles[qx][qy] = rt.texture;
      mapQuartiles[qx][qy].encoding = sRGBEncoding;

      Janitor.logLevel = JanitorLogLevel.Janitor;
      Janitor.trash("quartileScene", quartileScene);
      Janitor.logLevel = JanitorLogLevel.All;
    }
  }

  renderer.setRenderTarget(null)
  hdCache.forEach((t) => t.dispose());

  return {
    mapQuartiles,
    quartileHeight,
    quartileWidth,
  };
};

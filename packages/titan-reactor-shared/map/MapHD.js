import { DataTexture } from "three";
import { FloatType } from "three";
import {
  MeshBasicMaterial,
  RGBAFormat,
  OrthographicCamera,
  Scene,
  Vector3,
  WebGLRenderTarget,
  UnsignedByteType,
  PlaneBufferGeometry,
  Mesh,
  CanvasTexture,
  CompressedTexture,
  LinearFilter,
  ClampToEdgeWrapping,
  sRGBEncoding,
} from "three";

import { DDSLoader } from "./TileDDSLoader";

const ddsLoader = new DDSLoader();

const loadHdTile = (buf) => {
  const hdTexture = new CompressedTexture();
  const texDatas = ddsLoader.parse(buf, false);

  hdTexture.mipmaps = texDatas.mipmaps;
  hdTexture.image.width = texDatas.width;
  hdTexture.image.height = texDatas.height;

  hdTexture.format = texDatas.format;
  hdTexture.minFilter = LinearFilter;
  hdTexture.magFilter = LinearFilter;
  hdTexture.wrapT = ClampToEdgeWrapping;
  hdTexture.wrapS = ClampToEdgeWrapping;
  hdTexture.needsUpdate = true;

  return hdTexture;
};

export default class MapHD {
  static renderTilesToQuartiles(
    renderer,
    mapWidth,
    mapHeight,
    { hdTiles, mapTilesData }
  ) {
    const mapQuartiles = [];

    const quartileStrideW = mapWidth / 16;
    const quartileStrideH = mapHeight / 16;
    const quartileWidth = Math.floor(mapWidth / quartileStrideW);
    const quartileHeight = Math.floor(mapHeight / quartileStrideH);
    const ortho = new OrthographicCamera(
      -quartileWidth / 2,
      quartileWidth / 2,
      -quartileHeight / 2,
      quartileHeight / 2
    );
    ortho.position.y = quartileWidth;
    ortho.lookAt(new Vector3());
    const startTime = Date.now();

    const hdCache = new Map();
    renderer.setSize(quartileWidth * 128, quartileHeight * 128);

    const quartileScene = new Scene();
    const plane = new PlaneBufferGeometry();
    const mat = new MeshBasicMaterial({});
    const mesh = new Mesh(plane, mat);

    for (let qx = 0; qx < quartileStrideW; qx++) {
      mapQuartiles[qx] = [];
      for (let qy = 0; qy < quartileStrideH; qy++) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = quartileWidth * 128;
        canvas.height = quartileHeight * 128;

        for (let x = 0; x < quartileWidth; x++) {
          for (let y = 0; y < quartileHeight; y++) {
            const my = y + qy * quartileHeight;
            const mx = x + qx * quartileWidth;
            const tile = mapTilesData[my * mapWidth + mx];
            if (hdTiles[tile]) {
              //   const texture = loadHdTile(hdTiles[tile]);
              const texture = hdCache.get(tile) || loadHdTile(hdTiles[tile]);
              if (!hdCache.has(tile)) {
                hdCache.set(tile, texture);
              }
              mat.map = texture;
              mat.needsUpdate = true;
              mesh.position.x = x - quartileWidth / 2 + 0.5;
              mesh.position.z = y - quartileHeight / 2 + 0.5;
              mesh.rotation.x = Math.PI / 2;
              quartileScene.add(mesh);
              renderer.render(quartileScene, ortho);
              quartileScene.remove(mesh);
            }
          }
        }
        ctx.drawImage(renderer.domElement, 0, 0);
        mapQuartiles[qx][qy] = new CanvasTexture(canvas);
        mapQuartiles[qx][qy].encoding = sRGBEncoding;
        mapQuartiles[qx][qy].anisotropy = 16;
        mapQuartiles[qx][qy].flipY = false;
      }
    }
    console.log("elapsed", Date.now() - startTime);

    mat.dispose();
    hdCache.forEach((t) => t.dispose());

    renderer.setRenderTarget(null);

    return {
      mapQuartiles,
      quartileHeight,
      quartileStrideH,
      quartileStrideW,
      quartileWidth,
    };
  }

  static renderCreepTexture(renderer, creepAnim) {
    const mapQuartiles = [];

    const quartileStrideW = mapWidth / 16;
    const quartileStrideH = mapHeight / 16;
    const quartileWidth = Math.floor(mapWidth / quartileStrideW);
    const quartileHeight = Math.floor(mapHeight / quartileStrideH);
    const ortho = new OrthographicCamera(
      -quartileWidth / 2,
      quartileWidth / 2,
      -quartileHeight / 2,
      quartileHeight / 2
    );
    ortho.position.y = quartileWidth;
    ortho.lookAt(new Vector3());
    const startTime = Date.now();

    const hdCache = new Map();
    renderer.setSize(quartileWidth * 128, quartileHeight * 128);

    const quartileScene = new Scene();
    const plane = new PlaneBufferGeometry();
    const mat = new MeshBasicMaterial({});
    const mesh = new Mesh(plane, mat);

    for (let qx = 0; qx < quartileStrideW; qx++) {
      mapQuartiles[qx] = [];
      for (let qy = 0; qy < quartileStrideH; qy++) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = quartileWidth * 128;
        canvas.height = quartileHeight * 128;

        for (let x = 0; x < quartileWidth; x++) {
          for (let y = 0; y < quartileHeight; y++) {
            const my = y + qy * quartileHeight;
            const mx = x + qx * quartileWidth;
            const tile = mapTilesData[my * mapWidth + mx];
            if (hdTiles[tile]) {
              //   const texture = loadHdTile(hdTiles[tile]);
              const texture = hdCache.get(tile) || loadHdTile(hdTiles[tile]);
              if (!hdCache.has(tile)) {
                hdCache.set(tile, texture);
              }
              mat.map = texture;
              mat.needsUpdate = true;
              mesh.position.x = x - quartileWidth / 2 + 0.5;
              mesh.position.z = y - quartileHeight / 2 + 0.5;
              mesh.rotation.x = Math.PI / 2;
              quartileScene.add(mesh);
              renderer.render(quartileScene, ortho);
              quartileScene.remove(mesh);
            }
          }
        }
        ctx.drawImage(renderer.domElement, 0, 0);
        mapQuartiles[qx][qy] = new CanvasTexture(canvas);
        mapQuartiles[qx][qy].encoding = sRGBEncoding;
        mapQuartiles[qx][qy].anisotropy = 16;
        mapQuartiles[qx][qy].flipY = false;
      }
    }
    console.log("elapsed", Date.now() - startTime);

    mat.dispose();
    hdCache.forEach((t) => t.dispose());

    renderer.setRenderTarget(null);

    return {
      mapQuartiles,
      quartileHeight,
      quartileStrideH,
      quartileStrideW,
      quartileWidth,
    };
  }
}

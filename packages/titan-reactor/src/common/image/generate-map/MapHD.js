import {
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  Vector3,
  PlaneBufferGeometry,
  Mesh,
  CanvasTexture,
  CompressedTexture,
  LinearFilter,
  ClampToEdgeWrapping,
  sRGBEncoding,
  DoubleSide,
  WebGLRenderTarget,
} from "three";

import { DDSLoader } from "../DDSLoader";

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

const PX_PER_TILE = 128;

export default class MapHD {
  static renderTilesToQuartiles(
    renderer,
    mapWidth,
    mapHeight,
    { hdTiles, mapTilesData }
  ) {
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
    const startTime = Date.now();

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
    console.log("maphd elapsed", Date.now() - startTime);

    mat.dispose();
    hdCache.forEach((t) => t.dispose());

    return {
      mapQuartiles,
      quartileHeight,
      quartileStrideH,
      quartileStrideW,
      quartileWidth,
    };
  }

  static renderCreepEdgesTexture(renderer, creepGrp) {
    //0-3 bottomEdge
    //4 rightEdge
    //6,11,17,21 top edge
    //15 left edge

    const bottomEdges = [0, 1, 2, 3];
    const rightEdges = [4];
    const topEdges = [6, 11, 17, 21];
    const leftEdges = [15];

    const getOffset = (grp, tileId) => {
      const x = 0.5;
      const y = 0.5;

      if (topEdges.includes(tileId)) {
        return {
          x,
          y: grp.h / 256,
        };
      }

      if (bottomEdges.includes(tileId)) {
        return {
          x,
          y: 1 - grp.h / 256,
        };
      }

      if (leftEdges.includes(tileId)) {
        return {
          y,
          x: 1 - grp.w / 256,
        };
      }

      if (rightEdges.includes(tileId)) {
        return {
          y,
          x: grp.w / 256,
        };
      }

      return {
        x,
        y,
      };
    };

    const width = 37;
    const height = 1;
    const ortho = new OrthographicCamera(
      -width / 2,
      width / 2,
      -height / 2,
      height / 2
    );
    ortho.position.y = width;
    ortho.lookAt(new Vector3());

    renderer.setSize(width * 128, height * 128);

    const scene = new Scene();
    const plane = new PlaneBufferGeometry();
    const mat = new MeshBasicMaterial({});
    const mesh = new Mesh(plane, mat);
    mesh.rotation.x = Math.PI / 2;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width * 128;
    canvas.height = height * 128;

    for (let i = 0; i < creepGrp.length; i++) {
      const x = i;
      const y = 0;
      const grp = creepGrp[i];
      const texture = loadHdTile(grp.dds);

      mat.map = texture;
      mat.needsUpdate = true;
      mat.side = DoubleSide;
      mesh.scale.set(grp.w / 128, grp.h / 128, 1);
      mesh.position.x = x - width / 2 + getOffset(grp, i).x;
      // if (x >= 1 && x <= 4) {
      //   mesh.position.z = y - height / 2 + 1;
      // } else {
      mesh.position.z = y - height / 2 + getOffset(grp, i).y;
      // }
      mesh.rotation.z = Math.PI;
      mesh.rotation.y = Math.PI;
      scene.add(mesh);
      renderer.render(scene, ortho);
      scene.remove(mesh);
    }

    ctx.drawImage(renderer.domElement, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.encoding = sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // texture.flipY = true;

    mat.dispose();

    return { texture, width: width * 128, height: height * 128 };
  }

  static renderCreepTexture(renderer, hdTiles, tilegroupU16) {
    const width = 13;
    const height = 1;
    const ortho = new OrthographicCamera(
      -width / 2,
      width / 2,
      -height / 2,
      height / 2
    );
    ortho.position.y = width;
    ortho.lookAt(new Vector3());

    renderer.setSize(width * 128, height * 128);

    const scene = new Scene();
    const plane = new PlaneBufferGeometry();
    const mat = new MeshBasicMaterial({});
    const mesh = new Mesh(plane, mat);
    mesh.rotation.x = Math.PI / 2;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width * 128;
    canvas.height = height * 128;

    for (let i = 0; i < width; i++) {
      const x = i;
      const y = 0;
      // get the 13 creep tiles in the 2nd tile group including a first empty tile
      const texture = loadHdTile(hdTiles[tilegroupU16[36 + i]]);

      mat.map = texture;
      mat.needsUpdate = true;
      mesh.position.x = x - width / 2 + 0.5;
      mesh.position.z = y - height / 2 + 0.5;
      scene.add(mesh);
      renderer.render(scene, ortho);
      scene.remove(mesh);
    }

    ctx.drawImage(renderer.domElement, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.encoding = sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.flipY = true;

    mat.dispose();

    return { texture, width: width * 128, height: height * 128 };
  }

  static renderWarpIn(renderer, warpIn) {
    const width = 5;
    const height = 5;
    const ortho = new OrthographicCamera(
      -width / 2,
      width / 2,
      -height / 2,
      height / 2
    );
    ortho.position.y = width;
    ortho.lookAt(new Vector3());

    renderer.setSize(width * 768, height * 768);

    const scene = new Scene();
    const plane = new PlaneBufferGeometry();
    const mat = new MeshBasicMaterial({});
    const mesh = new Mesh(plane, mat);
    mesh.rotation.x = Math.PI / 2;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width * 128;
    canvas.height = height * 128;

    for (let i = 0; i < width; i++) {
      const x = i;
      const y = 0;
      // get the 13 creep tiles in the 2nd tile group including a first empty tile
      const texture = loadHdTile(hdTiles[tilegroupU16[36 + i]]);

      mat.map = texture;
      mat.needsUpdate = true;
      mesh.position.x = x - width / 2 + 0.5;
      mesh.position.z = y - height / 2 + 0.5;
      scene.add(mesh);
      renderer.render(scene, ortho);
      scene.remove(mesh);
    }

    ctx.drawImage(renderer.domElement, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.encoding = sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.flipY = true;

    mat.dispose();

    return { texture, width: width * 128, height: height * 128 };
  }
}

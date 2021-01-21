import * as THREE from "three";
// import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import { Mesh, HalfFloatType, CanvasTexture, CompressedTexture } from "three";
import ExtendMaterial from "../../utils/ExtendMaterial";
import CameraControls from "camera-controls";
import React, { useState } from "react";
import { render } from "react-dom";
import { createDisplacementGeometry } from "../displacementGeometry";
import { createDisplacementGeometryChunk } from "../displacementGeometryChunk";
import { KernelSize, BlendFunction } from "postprocessing";
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  BlurPass,
  TextureEffect,
  SavePass,
  SMAAImageLoader,
  SMAAEffect,
  SMAAPreset,
  EdgeDetectionMode,
  ClearPass,
} from "postprocessing";
import { blendNonZeroPixels } from "./blend";
import { MapEffect } from "./effects/MapEffect";
import readDdsGrp from "../../image/ddsGrp";
import { DDSLoader } from "./DDSLoader";

CameraControls.install({ THREE });

const extendMaterial = ExtendMaterial(THREE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight
);
camera.position.y = 100;
camera.position.z = 120;
camera.lookAt(new THREE.Vector3());
const renderer = new THREE.WebGLRenderer({ depth: true, stencil: false });
renderer.setSize(window.innerWidth, window.innerHeight);

// renderer.autoClear = false;

const controls = new CameraControls(camera, renderer.domElement);
controls.verticalDragToForward = true;

const dirlight = new THREE.DirectionalLight(0xffffff, 3);
dirlight.castShadow = true;
dirlight.position.set(-32, 13, -26);
dirlight.target = new THREE.Object3D();

const amblight = new THREE.AmbientLight(0xffffff, 5);
scene.add(dirlight);
scene.add(amblight);

const composer = new EffectComposer(renderer, {
  frameBufferType: HalfFloatType,
});
composer.autoRenderToScreen = true;

const mapWidth = 128;
const mapHeight = 128;

//low, walkable, mid, mid-walkable, high, high-walkable, mid/high/walkable
// const elevationLevels = [0, 0.3, 0.69, 0.69, 1, 1, 0.85];
// const elevationLevels = [0, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3];
const elevationLevels = [0, 0.05, 0.25, 0.25, 0.5, 0.5, 0.25];
// const elevationLevels = [0, 0.3, 0.69, 0.69, 1, 1, 0.85];

const terrain = new Mesh();
const hdTerrains = [];
document.body.append(renderer.domElement);

let _mapData;

const loadMapData = async () => {
  if (_mapData) {
    return _mapData;
  }
  const tilesets = [
    "badlands",
    "platform",
    "install",
    "ashworld",
    "jungle",
    "desert",
    "ice",
    "twilight",
  ];

  const tileset = tilesets.findIndex((s) => s === "jungle");
  console.log("tileset", tileset);
  const mapTiles = new Uint16Array(
    await fetch("/poly.mtxm").then((res) => res.arrayBuffer())
  );
  console.log("mapTiles", mapTiles.length);

  const mapIsom = new Uint16Array(
    await fetch("/poly.isom").then((res) => res.arrayBuffer())
  );
  console.log("mapIsom", mapIsom.length);

  const tilesetName = tilesets[tileset];
  const tilegroupArrayBuffer = await fetch(`/${tilesetName}.cv5`).then((res) =>
    res.arrayBuffer()
  );
  const tilegroup = new Uint16Array(tilegroupArrayBuffer);
  const tilegroupBuf = Buffer.from(tilegroupArrayBuffer);
  const megatiles = new Uint32Array(
    await fetch(`/${tilesetName}.vx4ex`).then((res) => res.arrayBuffer())
  );
  const minitilesFlags = new Uint16Array(
    await fetch(`/${tilesetName}.vf4`).then((res) => res.arrayBuffer())
  );
  const minitiles = new Uint8Array(
    await fetch(`/${tilesetName}.vr4`).then((res) => res.arrayBuffer())
  );
  const palette = new Uint8Array(
    await fetch(`/${tilesetName}.wpe`).then((res) => res.arrayBuffer())
  );
  const hdTiles = readDdsGrp(
    Buffer.from(
      await fetch(`/${tilesetName}.dds.vr4`).then((res) => res.arrayBuffer())
    ),
    true
  );

  const normalMap = await new Promise((res) => {
    new THREE.ImageLoader().load("/sylnorm.jpg", (image) => res(image));
  });

  const mapTilesData = new Uint16Array(mapWidth * mapHeight);

  const diffuse = Buffer.alloc(mapWidth * mapHeight * 32 * 32 * 3, 255);
  const layers = Buffer.alloc(mapWidth * mapHeight * 32 * 32);
  const paletteIndices = new Uint8Array(
    Buffer.alloc(mapWidth * mapHeight * 32 * 32)
  );
  const fogOfWarArray = new Uint8Array(
    Buffer.alloc(mapWidth * mapHeight * 32 * 32)
  );
  const displacement = Buffer.alloc(mapWidth * mapHeight * 32 * 32);
  const displacementDetail = Buffer.alloc(mapWidth * mapHeight * 32 * 32);

  for (let mapY = 0; mapY < mapHeight; mapY++) {
    for (let mapX = 0; mapX < mapWidth; mapX++) {
      const mapTile = mapY * mapWidth + mapX;
      let tileId = 0;
      if (mapTile > mapTiles.length) {
        tileId = 0;
      } else {
        tileId = mapTiles[mapTile];
      }

      const tileGroup = tileId >> 4;
      if (tileGroup * 52 < tilegroupBuf.byteLength) {
        const flags = tilegroupBuf.readUInt8(tileGroup * 52 + 2) & 0x0f;
        const buildable = tilegroupBuf.readUInt8(tileGroup * 52 + 2) >> 4 !== 8;
        const leftEdge = tilegroupBuf.readUInt16LE(tileGroup * 52 + 4);
        const topEdge = tilegroupBuf.readUInt16LE(tileGroup * 52 + 6);
        const rightEdge = tilegroupBuf.readUInt16LE(tileGroup * 52 + 8);
        const bottomEdge = tilegroupBuf.readUInt16LE(tileGroup * 52 + 10);
        const edgeUp = tilegroupBuf.readUInt16LE(tileGroup * 52 + 14);
        const edgeDown = tilegroupBuf.readUInt16LE(tileGroup * 52 + 18);
      }
      const groupIndex = tileId & 0xf;
      const groupOffset = tileGroup * 26 + groupIndex + 10;
      let megatileId = 0;
      if (groupOffset > tilegroup.length) {
        megatileId = 0;
      } else {
        megatileId = tilegroup[groupOffset];
      }

      mapTilesData[mapY * mapWidth + mapX] = megatileId;

      for (let miniY = 0; miniY < 4; miniY++) {
        for (let miniX = 0; miniX < 4; miniX++) {
          const mini = megatiles[megatileId * 16 + (miniY * 4 + miniX)];
          const minitile = mini & 0xfffffffe;
          const flipped = mini & 1;
          const meta = minitilesFlags[megatileId * 16 + (miniY * 4 + miniX)];
          const walkable = meta & 0x01;
          const mid = meta & 0x02;
          const high = meta & 0x04;
          const blocksView = meta & 0x08;

          for (let colorY = 0; colorY < 8; colorY++) {
            for (let colorX = 0; colorX < 8; colorX++) {
              let color = 0;
              if (flipped) {
                color = minitiles[minitile * 0x20 + colorY * 8 + (7 - colorX)];
              } else {
                color = minitiles[minitile * 0x20 + colorY * 8 + colorX];
              }

              const [r, g, b] = palette.slice(color * 4, color * 4 + 3);
              // const pixelPos = mapY * mapWidth * 32 + mapX * 32;
              // console.log(pixelPos);
              const pixelPos =
                mapY * 32 * mapWidth * 32 +
                mapX * 32 +
                miniY * 8 * mapWidth * 32 +
                miniX * 8 +
                colorY * mapWidth * 32 +
                colorX;

              paletteIndices[pixelPos] = color;

              let details = Math.floor((r + g + b) / 3);

              let elevation = 0;

              if (high && walkable && mid) {
                elevation = 6;
              } else if (high && walkable) {
                elevation = 5;
              } else if (high) {
                elevation = 4;
              } else if (mid && walkable) {
                elevation = 3;
              } else if (mid) {
                elevation = 2;
              } else if (walkable) {
                elevation = 1;
              }

              let elevationNormal = elevationLevels[elevation];

              let value = elevationNormal * 255;

              // if (
              //   (miniX === 0 && colorX === 0) ||
              //   (miniY == 0 && colorY == 0)
              // ) {
              //   diffuse[pixelPos * 3] = r;
              //   diffuse[pixelPos * 3 + 1] = 200;
              //   diffuse[pixelPos * 3 + 2] = b;
              // } else {
              diffuse[pixelPos * 3] = r;
              diffuse[pixelPos * 3 + 1] = g;
              diffuse[pixelPos * 3 + 2] = b;
              // }

              displacementDetail[pixelPos] = details;
              displacement[pixelPos] = value;

              layers[pixelPos] = elevation;
            }
          }
        }
      }
    }
  }

  const ddsLoader = new DDSLoader();
  const hdTexture = new CompressedTexture();

  const loadHdTile = (buf) => {
    const texDatas = ddsLoader.parse(buf, false);

    hdTexture.mipmaps = texDatas.mipmaps;
    hdTexture.image.width = texDatas.width;
    hdTexture.image.height = texDatas.height;

    hdTexture.format = texDatas.format;
    hdTexture.minFilter = THREE.LinearFilter;
    hdTexture.magFilter = THREE.LinearFilter;
    hdTexture.wrapT = THREE.ClampToEdgeWrapping;
    hdTexture.wrapS = THREE.ClampToEdgeWrapping;
    hdTexture.needsUpdate = true;

    return hdTexture;
  };

  const mapQuartiles = [];

  const quartileStrideW = mapWidth / 32;
  const quartileStrideH = mapHeight / 32;
  const quartileWidth = Math.floor(mapWidth / quartileStrideW);
  const quartileHeight = Math.floor(mapHeight / quartileStrideH);
  const ortho = new THREE.OrthographicCamera(
    -quartileWidth / 2,
    quartileWidth / 2,
    -quartileHeight / 2,
    quartileHeight / 2
  );
  ortho.position.y = quartileWidth;
  ortho.lookAt(new THREE.Vector3());
  window.renderer = renderer;
  const startTime = Date.now();
  for (let qx = 0; qx < quartileStrideW; qx++) {
    mapQuartiles[qx] = [];
    for (let qy = 0; qy < quartileStrideH; qy++) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      renderer.setSize(quartileWidth * 128, quartileHeight * 128);

      canvas.width = quartileWidth * 128;
      canvas.height = quartileHeight * 128;
      const quartileScene = new THREE.Scene();
      const plane = new THREE.PlaneBufferGeometry();
      const mat = new THREE.MeshBasicMaterial({});
      const mesh = new THREE.Mesh(plane, mat);
      for (let x = 0; x < quartileWidth; x++) {
        for (let y = 0; y < quartileHeight; y++) {
          const my = y + qy * quartileHeight;
          const mx = x + qx * quartileWidth;
          const tile = mapTilesData[my * mapWidth + mx];
          if (hdTiles[tile]) {
            const texture = loadHdTile(hdTiles[tile]);
            mat.map = texture;
            mat.needsUpdate = true;
            mesh.position.x = x - quartileWidth / 2 + 0.5;
            mesh.position.z = y - quartileHeight / 2 + 0.5;
            mesh.rotation.x = Math.PI / 2;
            quartileScene.add(mesh);
            renderer.render(quartileScene, ortho);
            texture.dispose();
            quartileScene.remove(mesh);
          }
        }
      }
      mat.dispose();
      ctx.drawImage(renderer.domElement, 0, 0);
      mapQuartiles[qx][qy] = new CanvasTexture(canvas);
      mapQuartiles[qx][qy].encoding = THREE.sRGBEncoding;
      mapQuartiles[qx][qy].anisotropy = 16;
      mapQuartiles[qx][qy].flipY = false;
    }
  }
  console.log("elapsed", Date.now() - startTime);

  _mapData = {
    diffuse,
    mapTilesData,
    displacement,
    displacementDetail,
    layers,
    palette,
    paletteIndices,
    fogOfWarArray,
    normalMap,
    tileset,
    mapQuartiles,
    quartileStrideW,
    quartileStrideH,
    quartileWidth,
    quartileHeight,
  };
  return _mapData;
};

const load = async () => {
  const {
    diffuse,
    mapTilesData,
    displacement,
    displacementDetail,
    layers,
    palette,
    paletteIndices,
    fogOfWarArray,
    normalMap,
    tileset,
    mapQuartiles,
    quartileStrideW,
    quartileStrideH,
    quartileWidth,
    quartileHeight,
  } = await loadMapData();

  if (terrain.userData.textures) {
    terrain.userData.textures.forEach((t) => t.dispose());
  }

  scene.remove(terrain);
  hdTerrains.forEach((t) => scene.remove(t));

  renderer.outputEncoding = THREE.LinearEncoding;
  renderer.shadowMap.enabled = false;
  renderer.physicallyCorrectLights = false;
  renderer.toneMapping = THREE.NoToneMapping;

  const map = new THREE.DataTexture(
    new Uint8Array(diffuse),
    mapWidth * 32,
    mapHeight * 32,
    THREE.RGBFormat,
    THREE.UnsignedByteType
  );
  map.flipY = true;
  map.encoding = THREE.sRGBEncoding;
  map.anisotropy = 16;

  const displaceArray = new Uint8Array(displacement);

  const displacementMap = new THREE.DataTexture(
    displaceArray,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  displacementMap.flipY = true;

  const mapTilesMap = new THREE.DataTexture(
    mapTilesData,
    mapWidth,
    mapHeight,
    THREE.RedIntegerFormat,
    THREE.UnsignedShortType
  );
  mapTilesMap.internalFormat = "R16UI";
  mapTilesMap.flipY = true;

  const detailsArray = new Uint8Array(displacementDetail);
  const displacementDetailsMap = new THREE.DataTexture(
    detailsArray,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  displacementDetailsMap.internalFormat = "R8UI";
  displacementDetailsMap.flipY = true;

  const elevationsArray = new Uint8Array(layers);
  const elevationsMap = new THREE.DataTexture(
    elevationsArray,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  elevationsMap.internalFormat = "R8UI";
  elevationsMap.flipY = true;

  const nonZeroLayers = Buffer.alloc(layers.byteLength);
  layers.copy(nonZeroLayers);
  const nonZeroLayersArray = new Uint8Array(nonZeroLayers);
  blendNonZeroPixels(nonZeroLayersArray, mapWidth * 32, mapHeight * 32);

  const nonZeroElevationsMap = new THREE.DataTexture(
    nonZeroLayersArray,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  nonZeroElevationsMap.internalFormat = "R8UI";
  nonZeroElevationsMap.flipY = true;

  const paletteIndicesMap = new THREE.DataTexture(
    paletteIndices,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  paletteIndicesMap.internalFormat = "R8UI";
  paletteIndicesMap.flipY = true;

  const fogOfWarMap = new THREE.DataTexture(
    fogOfWarArray,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  fogOfWarMap.internalFormat = "R8UI";
  fogOfWarMap.flipY = true;

  const levelsMtx = new THREE.Matrix3();
  const max = elevationLevels.reduce(
    (memo, val) => (val > memo ? val : memo),
    0
  );
  const normalLevels = elevationLevels.map((v) => v / max);
  levelsMtx.set(...normalLevels, 0, 0);
  // levelsMtx.set(1, 0, 0, 0, 0, 0, 0, 0, 0);

  const displaceDimensionScale = 3;
  composer.setSize(
    mapWidth * displaceDimensionScale,
    mapHeight * displaceDimensionScale,
    true
  );
  const savePass = new SavePass();
  const blurPassHuge = new BlurPass();
  blurPassHuge.kernelSize = KernelSize.SMALL;
  const blurPassMed = new BlurPass();
  blurPassMed.kernelSize = KernelSize.VERY_SMALL;

  composer.removeAllPasses();
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new ClearPass());

  composer.addPass(
    new EffectPass(
      camera,
      new MapEffect({
        texture: map,
        elevations: nonZeroElevationsMap,
        details: displacementDetailsMap,
        detailsMix: 0,
        levels: levelsMtx,
        mapTiles: mapTilesMap,
        ignoreDoodads: 0,
        tileset,
        palette,
        paletteIndices: paletteIndicesMap,
        blendFunction: BlendFunction.NORMAL,
      })
    )
  );
  composer.addPass(blurPassHuge);
  composer.addPass(savePass);
  composer.addPass(new SavePass());
  composer.render(0.01);
  composer.removeAllPasses();

  levelsMtx.set(
    ...normalLevels.map((v, i) => ([1, 3, 6].includes(i) ? -1 : v)),
    0,
    0
  );

  composer.addPass(
    new EffectPass(
      camera,
      new MapEffect({
        texture: map,
        elevations: elevationsMap,
        details: displacementDetailsMap,
        detailsMix: 0,
        mapTiles: mapTilesMap,
        ignoreDoodads: 1,
        levels: levelsMtx,
        tileset,
        palette,
        paletteIndices: paletteIndicesMap,
        blendFunction: BlendFunction.NORMAL,
      })
    )
  );
  // composer.addPass(blurPassMed);
  composer.render(0.01);

  const displacementScale = 6;

  const mat = new THREE.MeshStandardMaterial({
    map,
    dithering: true,
  });

  const displaceCanvas = document.createElement("canvas");
  displaceCanvas.width = mapWidth * displaceDimensionScale;
  displaceCanvas.height = mapHeight * displaceDimensionScale;

  displaceCanvas.getContext("2d").drawImage(renderer.domElement, 0, 0);

  const geometry = createDisplacementGeometry(
    null,
    mapWidth,
    mapHeight,
    mapWidth * displaceDimensionScale,
    mapHeight * displaceDimensionScale,
    displaceCanvas,
    // displaceArray,
    displacementScale,
    0
  );

  const elevationsMaterial = new THREE.MeshBasicMaterial({
    map,
    onBeforeCompile: function (shader) {
      THREE.patchShader(shader, {
        header: `
      precision highp usampler2D;
      uniform usampler2D elevations;
      
      vec3 heatmapGradient(float t) {
        return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
      }
      `,
        fragment: {
          "@#include <map_fragment>": `
        uvec4 elevation = texture2D(elevations, vUv);
        // vec4 texelColor = texture2D( map, vUv );
    
        // texelColor = mapTexelToLinear( texelColor );
        diffuseColor *= vec4(1., 0., 0., 1.);
          
          `,
        },
        uniforms: { elevations: { value: elevationsMap } },
      });
    },
  });

  terrain.geometry = geometry;
  terrain.material = mat;
  terrain.castShadow = true;
  terrain.receiveShadow = true;
  terrain.rotation.x = -Math.PI / 2;
  terrain.userData.displace = new THREE.CanvasTexture(displaceCanvas);
  terrain.userData.map = map;
  terrain.userData.mat = mat;
  terrain.userData.elevationsMaterial = elevationsMaterial;
  terrain.userData.textures = [
    terrain.userData.displace,
    terrain.userData.map,
    terrain.userData.elevationsMaterial,
    terrain.userData.mat,
  ];

  for (let x = 0; x < quartileStrideW; x++) {
    for (let y = 0; y < quartileStrideH; y++) {
      // const qDisplace = document.createElement("canvas");
      // qDisplace.width = quartileW * displaceDimensionScale;
      // qDisplace.height = quartileH * displaceDimensionScale;
      // qDisplace
      //   .getContext("2d")
      //   .drawImage(
      //     displaceCanvas,
      //     x * displaceDimensionScale,
      //     y * displaceDimensionScale
      //   );

      const hdTerrain = new Mesh();
      const geometry = createDisplacementGeometryChunk(
        null,
        quartileWidth,
        quartileHeight,
        quartileWidth * displaceDimensionScale,
        quartileHeight * displaceDimensionScale,
        displaceCanvas,
        displacementScale,
        0,
        quartileWidth / mapWidth,
        quartileHeight / mapHeight,
        x * quartileWidth * displaceDimensionScale,
        y * quartileHeight * displaceDimensionScale
      );

      hdTerrain.geometry = geometry;

      const mat = new THREE.MeshStandardMaterial({
        map: mapQuartiles[x][y],
        dithering: true,
      });

      hdTerrain.material = mat;
      hdTerrain.castShadow = true;
      hdTerrain.receiveShadow = true;
      hdTerrain.rotation.x = -Math.PI / 2;
      hdTerrain.position.x =
        x * quartileWidth + quartileWidth / 2 - mapWidth / 2;
      hdTerrain.position.z =
        y * quartileHeight + quartileHeight / 2 - mapHeight / 2;

      hdTerrains.push(hdTerrain);
      hdTerrain.visible = false;
      scene.add(hdTerrain);
    }
  }

  scene.add(terrain);

  composer.removeAllPasses();
  composer.addPass(new RenderPass(scene, camera));
  const smaaEffect = await new Promise((res) => {
    new SMAAImageLoader().load(([searchImage, areaImage]) => {
      res(
        new SMAAEffect(
          searchImage,
          areaImage,
          SMAAPreset.ULTRA,
          EdgeDetectionMode.DEPTH
        )
      );
    });
  });
  composer.addPass(new EffectPass(camera, smaaEffect));

  composer.setSize(window.innerWidth, window.innerHeight, true);

  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.CineonToneMapping;

  renderer.setAnimationLoop(loop);
  console.log("Rendered");
};

let last = 0;
const loop = (elapsed) => {
  const delta = elapsed - last;
  // renderer.render(scene, camera);
  composer.render(delta);
  controls.update(delta);
  last = elapsed;
};

const App = () => {
  const [levels, setLevels] = useState(elevationLevels.join(","));

  return (
    <div
      style={{
        position: "absolute",
        bottom: "0",
        width: "100vw",
        height: "10vh",
        backgroundColor: "#9a9a9a00",
      }}
    >
      <div>
        <button
          onClick={() => {
            terrain.material = terrain.userData.mat;
            terrain.material.map = terrain.userData.map;
            terrain.userData.displace.encoding = THREE.LinearEncoding;
            terrain.material.needsUpdate = true;
          }}
        >
          map
        </button>
        <button
          onClick={() => {
            terrain.material = terrain.userData.mat;
            terrain.material.map = terrain.userData.displace;
            terrain.material.map.encoding = THREE.sRGBEncoding;
            terrain.material.needsUpdate = true;
          }}
        >
          displace
        </button>
        <button
          onClick={() => {
            terrain.material = terrain.userData.mat;
            terrain.material.wireframe = !terrain.material.wireframe;
            terrain.material.wireframeLinewidth = 5;
            terrain.material.needsUpdate = true;
          }}
        >
          wireframe
        </button>
        <button
          onClick={() => {
            if (terrain.material === terrain.userData.mat) {
              terrain.material = terrain.userData.elevationsMaterial;
            } else {
              terrain.material = terrain.userData.mat;
            }
          }}
        >
          elevations
        </button>
        <button
          onClick={() => {
            if (scene.background) {
              scene.background = null;
            } else {
              scene.background = terrain.userData.displace;
            }
          }}
        >
          background
        </button>
      </div>

      <div>
        <div>
          ratios{" "}
          <input
            type="text"
            value={levels}
            onChange={(evt) => {
              setLevels(evt.target.value);
            }}
          />
          <button
            onClick={() => {
              levels.split(",").forEach((v, i) => {
                elevationLevels[i] = Number(v);
              });
              load();
            }}
          >
            update
          </button>
          <button
            onClick={() => {
              if (terrain.visible) {
                terrain.visible = false;
                hdTerrains.forEach((t) => (t.visible = true));
              } else {
                terrain.visible = true;
                hdTerrains.forEach((t) => (t.visible = false));
              }
            }}
          >
            SD/HD
          </button>
        </div>
        <div>
          low, walkable, mid, mid-walkable, high, high-walkable,
          mid/high/walkable
        </div>
      </div>
    </div>
  );
};
const div = document.createElement("div");
document.body.append(div);
render(<App />, div);

// setTimeout(load, 10000);
load();

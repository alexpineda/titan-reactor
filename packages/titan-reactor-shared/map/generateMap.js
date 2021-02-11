import * as THREE from "three";
import { Mesh, HalfFloatType, CanvasTexture, CompressedTexture } from "three";
import { createDisplacementGeometry } from "./displacementGeometry";
import { createDisplacementGeometryChunk } from "./displacementGeometryChunk";
import { KernelSize, BlendFunction } from "postprocessing";
import {
  EffectComposer,
  EffectPass,
  BlurPass,
  SavePass,
  ClearPass,
  BloomEffect,
} from "postprocessing";
import { BypassingConvolutionMaterial } from "./effects/BypassingConvolutionMaterial";
import { blendNonZeroPixels } from "../image/blend";
import { MapEffect } from "./effects/MapEffect";
import { DDSLoader } from "./TileDDSLoader";

//low, walkable, mid, mid-walkable, high, high-walkable, mid/high/walkable
const _rendererO = {};

const restoreRenderer = (renderer) => {
  Object.assign(renderer, _rendererO);
};

const clearRenderer = (renderer) => {
  _rendererO.outputEncoding = renderer.outputEncoding;
  _rendererO.physicallyCorrectLights = renderer.physicallyCorrectLights;
  _rendererO.toneMapping = renderer.toneMapping;
  _rendererO.dithering = renderer.dithering;

  renderer.outputEncoding = THREE.LinearEncoding;
  renderer.physicallyCorrectLights = false;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.dithering = false;
};

export const generateTileData = (
  renderer,
  mapWidth,
  mapHeight,
  mapTiles,
  megatiles,
  minitilesFlags,
  minitiles,
  palette,
  tileset,
  hdTiles,
  tilegroup,
  tilegroupBuf,
  options
) => {
  clearRenderer(renderer);

  const mapTilesData = new Uint16Array(mapWidth * mapHeight);

  const diffuse = new Uint8Array(mapWidth * mapHeight * 32 * 32 * 4, 255);
  const layers = new Uint8Array(mapWidth * mapHeight * 4 * 4);
  const paletteIndices = new Uint8Array(mapWidth * mapHeight * 32 * 32);
  const fogOfWarArray = new Uint8Array(mapWidth * mapHeight);
  const roughness = new Uint8Array(mapWidth * mapHeight * 32 * 32);
  const displacementDetail = new Uint8Array(mapWidth * mapHeight * 32 * 32);

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

          const miniPos =
            mapY * 4 * mapWidth * 4 + mapX * 4 + miniY * mapWidth * 4 + miniX;

          layers[miniPos] = elevation;

          for (let colorY = 0; colorY < 8; colorY++) {
            for (let colorX = 0; colorX < 8; colorX++) {
              let color = 0;
              if (flipped) {
                color = minitiles[minitile * 0x20 + colorY * 8 + (7 - colorX)];
              } else {
                color = minitiles[minitile * 0x20 + colorY * 8 + colorX];
              }

              const [r, g, b] = palette.slice(color * 4, color * 4 + 3);

              const pixelPos =
                mapY * 32 * mapWidth * 32 +
                mapX * 32 +
                miniY * 8 * mapWidth * 32 +
                miniX * 8 +
                colorY * mapWidth * 32 +
                colorX;

              paletteIndices[pixelPos] = color;

              let details = Math.floor((r + g + b) / 3);

              // if (
              //   (miniX === 0 && colorX === 0) ||
              //   (miniY == 0 && colorY == 0)
              // ) {
              //   diffuse[pixelPos * 3] = r;
              //   diffuse[pixelPos * 3 + 1] = 200;
              //   diffuse[pixelPos * 3 + 2] = b;
              // } else {
              diffuse[pixelPos * 4] = r;
              diffuse[pixelPos * 4 + 1] = g;
              diffuse[pixelPos * 4 + 2] = b;
              diffuse[pixelPos * 4 + 3] = 255;
              // }

              displacementDetail[pixelPos] = details;
              roughness[pixelPos] = elevation == 0 ? 0 : details / 3;
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

  const quartileStrideW = mapWidth / 16;
  const quartileStrideH = mapHeight / 16;
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

  restoreRenderer(renderer);

  return {
    diffuse,
    mapTilesData,
    roughness,
    displacementDetail,
    layers,
    palette,
    paletteIndices,
    fogOfWarArray,
    tileset,
    mapQuartiles,
    quartileStrideW,
    quartileStrideH,
    quartileWidth,
    quartileHeight,
    options,
    mapWidth,
    mapHeight,
  };
};

export const generateMesh = (renderer, tileData) => {
  const {
    diffuse,
    mapTilesData,
    roughness,
    displacementDetail,
    layers,
    palette,
    paletteIndices,
    fogOfWarArray,
    tileset,
    mapQuartiles,
    quartileStrideW,
    quartileStrideH,
    quartileWidth,
    quartileHeight,
    options,
    mapWidth,
    mapHeight,
    waterMasks,
    waterMasksDds,
    waterNormal1,
    waterNormal2,
    noise,
  } = tileData;

  const camera = new THREE.PerspectiveCamera();
  clearRenderer(renderer);

  const composer = new EffectComposer(renderer, {
    frameBufferType: HalfFloatType,
  });
  composer.autoRenderToScreen = true;

  const map = new THREE.DataTexture(
    diffuse,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );
  map.flipY = true;
  map.encoding = THREE.sRGBEncoding;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const roughnessMap = new THREE.DataTexture(
    roughness,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  roughnessMap.flipY = true;

  const mapTilesMap = new THREE.DataTexture(
    mapTilesData,
    mapWidth,
    mapHeight,
    THREE.RedIntegerFormat,
    THREE.UnsignedShortType
  );
  mapTilesMap.internalFormat = "R16UI";
  mapTilesMap.flipY = true;

  const displacementDetailsMap = new THREE.DataTexture(
    displacementDetail,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  displacementDetailsMap.internalFormat = "R8UI";
  displacementDetailsMap.flipY = true;

  const elevationsMap = new THREE.DataTexture(
    layers,
    mapWidth * 4,
    mapHeight * 4,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  elevationsMap.internalFormat = "R8UI";
  elevationsMap.flipY = true;

  const nonZeroLayers = layers.slice(0);

  for (let x = 0; x < mapWidth * 4; x++) {
    for (let y = 0; y < mapHeight * 4; y++) {
      const pos = y * mapWidth * 4 + x;
      if ([0, 2, 4].includes(nonZeroLayers[pos])) {
        nonZeroLayers[pos] = 0;
      }
    }
  }

  if (options.blendNonWalkableBase) {
    blendNonZeroPixels(nonZeroLayers, mapWidth * 4, mapHeight * 4);
  }

  const nonZeroElevationsMap = new THREE.DataTexture(
    nonZeroLayers,
    mapWidth * 4,
    mapHeight * 4,
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

  const floatPalette = new Float32Array(palette.length);
  for (let i = 0; i < palette.length; i++) {
    floatPalette[i] = palette[i] / 255;
  }
  const paletteMap = new THREE.DataTexture(
    floatPalette,
    palette.length / 4,
    1,
    THREE.RGBAFormat,
    THREE.FloatType
  );

  const fogOfWarMap = new THREE.DataTexture(
    fogOfWarArray,
    mapWidth,
    mapHeight,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  fogOfWarMap.internalFormat = "R8UI";
  fogOfWarMap.flipY = true;

  const levelsMtx = new THREE.Matrix3();
  const max = options.elevationLevels.reduce(
    (memo, val) => (val > memo ? val : memo),
    0
  );
  const normalLevels = options.elevationLevels.map((v) =>
    options.normalizeLevels ? v / max : v
  );
  levelsMtx.set(...normalLevels, 0, 0);

  composer.setSize(
    mapWidth * options.displaceDimensionScale,
    mapHeight * options.displaceDimensionScale,
    true
  );
  const savePass = new SavePass();
  const blurPassHuge = new BlurPass();
  blurPassHuge.convolutionMaterial = new BypassingConvolutionMaterial();
  blurPassHuge.kernelSize = options.firstBlur;

  composer.removeAllPasses();
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
        ignoreLevels: new THREE.Matrix3(),
        mapTiles: mapTilesMap,
        ignoreDoodads: 0,
        tileset,
        palette,
        paletteIndices: paletteIndicesMap,
        blendFunction: BlendFunction.NORMAL,
      })
    )
  );
  // composer.addPass(new EffectPass(camera, new BloomEffect(options.bloom)));
  composer.addPass(blurPassHuge);
  composer.addPass(savePass);
  composer.addPass(new SavePass());
  if (options.firstPass) {
    composer.render(0.01);
  }

  composer.removeAllPasses();

  const ignoreLevels = new THREE.Matrix3();
  ignoreLevels.set(...options.ignoreLevels, 0, 0);

  composer.addPass(
    new EffectPass(
      camera,
      new MapEffect({
        texture: map,
        elevations: elevationsMap,
        details: displacementDetailsMap,
        detailsMix: options.detailsMix,
        mapTiles: mapTilesMap,
        ignoreDoodads: 1,
        levels: levelsMtx,
        ignoreLevels,
        tileset,
        palette,
        processWater: options.processWater,
        paletteIndices: paletteIndicesMap,
        blendFunction: BlendFunction.NORMAL,
      })
    )
  );

  const blurPassMed = new BlurPass();
  blurPassMed.kernelSize = KernelSize.VERY_SMALL;
  composer.addPass(blurPassMed);
  if (options.secondPass) {
    composer.render(0.01);
  }

  const tileAnimationCounter = { value: 0 };
  const mat = new THREE.MeshStandardMaterial({
    map,
    bumpMap: map,
    bumpScale: options.bumpScale,
    onBeforeCompile: function (shader) {
      let fs = shader.fragmentShader;

      let index1;
      let index2;
      let index3;

      if (tileset === 4 || tileset === 0) {
        //jungle, badlands
        index1 = [1, 6];
        index2 = [7, 7];
        index3 = [248, 7];
      } else if (tileset === 3) {
        //ashworld
        index1 = [1, 4];
        index2 = [5, 4];
        index3 = [9, 5];
      } else if (tileset > 4) {
        //desert, ice, twighlight
        index1 = [1, 13];
        index2 = [248, 7];
      }

      fs = fs.replace(
        "#include <map_fragment>",
        `
        int index = int(texture2D(paletteIndices, vUv).r);

        #ifdef ROTATE_1
          if (index >= index1.x && index < index1.x + index1.y) {
            index = index1.x + ((index - index1.x + counter) % index1.y);
          }
        #endif

        #ifdef ROTATE_2
          if (index >= index2.x && index < index2.x + index2.y) {
            index = index2.x + ((index - index2.x + counter) % index2.y);
          }
        #endif

        #ifdef ROTATE_3
          if (index >= index3.x && index < index3.x + index3.y) {
            index = index3.x + ((index - index3.x + counter) % index3.y);
          }
        #endif

        // #ifdef NO_ROTATE
        //   vec4 paletteColor = vec4(triplanarMapping(map, vNormal, vViewPosition) , 1.);
        // #else
          float indexF = float(index);
          vec4 paletteColor = texture2D(palette, vec2(indexF/256.,0));
        // #endif

        vec4 texelColor = mapTexelToLinear(paletteColor);
        diffuseColor *= texelColor;
      `
      );

      shader.fragmentShader = `
        precision highp usampler2D;
        uniform sampler2D palette;
        uniform usampler2D paletteIndices;
        uniform ivec2 index1;
        uniform ivec2 index2;
        uniform ivec2 index3;
        uniform int counter;

        // vec3 blendNormal(vec3 normal){
        //   vec3 blending = abs(normal);
        //   blending = normalize(max(blending, 0.00001));
        //   blending /= vec3(blending.x + blending.y + blending.z);
        //   return blending;
        // }
        
        // vec3 triplanarMapping (sampler2D texture, vec3 normal, vec3 position) {
        //   vec3 normalBlend = blendNormal(normal);
        //   vec3 xColor = texture2D(texture, position.yz).rgb;
        //   vec3 yColor = texture2D(texture, position.xz).rgb;
        //   vec3 zColor = texture2D(texture, position.xy).rgb;
        
        //   return (xColor * normalBlend.x + yColor * normalBlend.y + zColor * normalBlend.z);
        // }

        ${index1 ? "#define ROTATE_1" : ""}
        ${index2 ? "#define ROTATE_2" : ""}
        ${index3 ? "#define ROTATE_3" : ""}
        ${!index1 && !index2 && !index3 ? "#define NO_ROTATE" : ""}
        ${fs}
      `;

      shader.uniforms.palette = { value: paletteMap };
      shader.uniforms.paletteIndices = { value: paletteIndicesMap };
      shader.uniforms.counter = tileAnimationCounter;
      if (index1) {
        shader.uniforms.index1 = { value: index1 };
      }
      if (index2) {
        shader.uniforms.index2 = { value: index2 };
      }
      if (index3) {
        shader.uniforms.index3 = { value: index3 };
      }
    },
  });
  mat.userData.tileAnimationCounter = tileAnimationCounter;

  const displaceCanvas = document.createElement("canvas");
  displaceCanvas.width = mapWidth * options.displaceDimensionScale;
  displaceCanvas.height = mapHeight * options.displaceDimensionScale;

  displaceCanvas.getContext("2d").drawImage(renderer.domElement, 0, 0);

  const elevationsMaterial = new THREE.MeshBasicMaterial({
    map,
    onBeforeCompile: function (shader) {
      let fs = shader.fragmentShader;

      fs = fs.replace(
        "#include <map_fragment>",
        `
        int elevation = int(texture2D(elevations, vUv).r);
        float elevationF = float(elevation) / 6.;

        bool isWalkable = elevation == 1 || elevation == 3 || elevation == 5 || elevation == 7;


        if (drawMode == 1 && !isWalkable) {
          elevationF = 0.;
        }

        if (drawMode == 2 && isWalkable) {
         elevationF = 0.;
        }

        if (drawMode == 3) {
          uint mapTile = texture2D(mapTiles, vUv).r;
          elevationF = mapTile > uint(1023) ? 1. : 0.; //doodad
        }

        if (drawMode >= 4) {
          elevationF = 1.;
          if (elevation != drawMode - 4) {
            elevationF = 0.2;
          }
          diffuseColor *= vec4(vec3(elevationF), 1.);
        } else {
         diffuseColor *= vec4(heatmapGradient(elevationF), 1.);
        }

        diffuseColor *= (texture2D(map, vUv));

      `
      );

      shader.fragmentShader = `
        precision highp usampler2D;
        uniform usampler2D elevations;
        uniform int drawMode;
        uniform usampler2D mapTiles;

        vec3 heatmapGradient(float t) {
          return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
        }
        ${fs}
      `;

      shader.uniforms.elevations = { value: elevationsMap };
      shader.uniforms.drawMode = options.drawMode;
      shader.uniforms.mapTiles = { value: mapTilesMap };
    },
  });

  const geometry = createDisplacementGeometry(
    null,
    mapWidth,
    mapHeight,
    mapWidth * options.displaceVertexScale,
    mapHeight * options.displaceVertexScale,
    displaceCanvas,
    options.displacementScale,
    0
  );

  const terrain = new Mesh();
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

  const hdTerrainGroup = new THREE.Group();
  for (let x = 0; x < quartileStrideW; x++) {
    for (let y = 0; y < quartileStrideH; y++) {
      const hdTerrain = new Mesh();
      const w = quartileWidth;
      const h = quartileHeight;

      const geometry = createDisplacementGeometryChunk(
        null,
        w,
        h,
        w * options.displaceVertexScale,
        h * options.displaceVertexScale,
        displaceCanvas,
        options.displacementScale,
        0,
        w / mapWidth,
        h / mapHeight,
        x * w * options.displaceDimensionScale,
        y * h * options.displaceDimensionScale
      );

      hdTerrain.geometry = geometry;

      const mat = new THREE.MeshStandardMaterial({
        map: mapQuartiles[x][y],
        bumpMap: mapQuartiles[x][y],
        bumpScale: options.bumpScale,
        onBeforeCompile: function (shader) {
          // let fs = shader.fragmentShader;
          // fs = fs.replace(
          //   "#include <map_fragment>",
          //   `
        },
      });

      hdTerrain.material = mat;
      hdTerrain.castShadow = true;
      hdTerrain.receiveShadow = true;
      hdTerrain.rotation.x = -Math.PI / 2;
      hdTerrain.position.x =
        x * quartileWidth + quartileWidth / 2 - mapWidth / 2;
      hdTerrain.position.z =
        y * quartileHeight + quartileHeight / 2 - mapHeight / 2;

      hdTerrain.userData.map = map;
      hdTerrain.userData.mat = mat;
      hdTerrain.userData.elevationsMaterial = elevationsMaterial;
      hdTerrain.userData.textures = [mat];

      hdTerrainGroup.add(hdTerrain);
      //   hdTerrains.push(hdTerrain);
    }
  }
  terrain.visible = true;
  hdTerrainGroup.visible = true;

  terrain.name = "Terrain";
  hdTerrainGroup.name = "TerrainHD";
  restoreRenderer(renderer);

  return [terrain, hdTerrainGroup, displaceCanvas];
};

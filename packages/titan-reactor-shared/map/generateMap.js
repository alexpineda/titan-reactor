import * as THREE from "three";
import { Mesh, HalfFloatType, Vector2 } from "three";
import { createDisplacementGeometry } from "./displacementGeometry";
import { createDisplacementGeometryChunk } from "./displacementGeometryChunk";
import { KernelSize, BlendFunction } from "postprocessing";
import {
  EffectComposer,
  EffectPass,
  BlurPass,
  SavePass,
  ClearPass,
} from "postprocessing";
import { BypassingConvolutionMaterial } from "./effects/BypassingConvolutionMaterial";
import { blendNonZeroPixels } from "../image/blend";
import { MapEffect } from "./effects/MapEffect";
import MapHD from "./MapHD";
import MapSD from "./MapSD";
import MapData from "./MapData";
import { rgbToCanvas } from "../image/canvas";

//low, walkable, mid, mid-walkable, high, high-walkable, mid/high/walkable
const _rendererO = {};

const restoreRenderer = (renderer) => {
  Object.assign(renderer, _rendererO);
};

const clearRenderer = (renderer) => {
  _rendererO.outputEncoding = renderer.outputEncoding;
  _rendererO.physicallyCorrectLights = renderer.physicallyCorrectLights;
  _rendererO.toneMapping = renderer.toneMapping;

  renderer.outputEncoding = THREE.LinearEncoding;
  renderer.physicallyCorrectLights = false;
  renderer.toneMapping = THREE.NoToneMapping;
};

export const generateTileData = async (
  renderer,
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
    options,
  }
) => {
  clearRenderer(renderer);

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

  restoreRenderer(renderer);

  return {
    palette,
    tileset,
    options,
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

export const generateMesh = async (renderer, tileData) => {
  const {
    palette,
    tileset,
    options,
    mapWidth,
    mapHeight,
    mapData,
    mapHd,
    creepEdgesTextureSD,
    creepEdgesTextureHD,
    creepTextureHD,
    creepTextureSD,
    waterMasks,
    waterMasksDds,
    waterNormal1,
    waterNormal2,
    noise,
  } = tileData;

  const camera = new THREE.PerspectiveCamera();
  clearRenderer(renderer);

  //#region texture definitions
  const map = new THREE.DataTexture(
    mapData.diffuse,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );
  map.flipY = true;
  map.encoding = THREE.sRGBEncoding;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const roughnessMap = new THREE.DataTexture(
    mapData.roughness,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  roughnessMap.flipY = true;

  const mapTilesMap = new THREE.DataTexture(
    mapData.mapTilesData,
    mapWidth,
    mapHeight,
    THREE.RedIntegerFormat,
    THREE.UnsignedShortType
  );
  mapTilesMap.internalFormat = "R16UI";
  mapTilesMap.flipY = true;

  const creepEdgesBytes = new Uint8Array(mapWidth * mapHeight);
  const creepEdgesValues = new THREE.DataTexture(
    creepEdgesBytes,
    mapWidth,
    mapHeight,
    THREE.LuminanceFormat,
    THREE.UnsignedByteType
  );
  creepEdgesValues.flipY = true;

  const creepBytes = new Uint8Array(mapWidth * mapHeight);
  const creepValues = new THREE.DataTexture(
    creepBytes,
    mapWidth,
    mapHeight,
    THREE.LuminanceFormat,
    THREE.UnsignedByteType
  );
  creepValues.flipY = true;

  const displacementDetailsMap = new THREE.DataTexture(
    mapData.displacementDetail,
    mapWidth * 32,
    mapHeight * 32,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  displacementDetailsMap.internalFormat = "R8UI";
  displacementDetailsMap.flipY = true;

  const elevationsMap = new THREE.DataTexture(
    mapData.layers,
    mapWidth * 4,
    mapHeight * 4,
    THREE.RedIntegerFormat,
    THREE.UnsignedByteType
  );
  elevationsMap.internalFormat = "R8UI";
  elevationsMap.flipY = true;

  const nonZeroLayers = mapData.layers.slice(0);

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
    mapData.paletteIndices,
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

  //#endregion texture definitions

  const levelsMtx = new THREE.Matrix3();
  const max = options.elevationLevels.reduce(
    (memo, val) => (val > memo ? val : memo),
    0
  );
  const normalLevels = options.elevationLevels.map((v) =>
    options.normalizeLevels ? v / max : v
  );

  const maxLevel = normalLevels.reduce(
    (max, lvl) => (lvl > max ? lvl : max),
    0
  );

  levelsMtx.set(...normalLevels, 0, 0);

  //#region composer
  const composer = new EffectComposer(renderer, {
    frameBufferType: HalfFloatType,
  });
  composer.autoRenderToScreen = true;

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
  //#endregion composer

  //#region sd map
  const tileAnimationCounter = { value: 0 };
  const sharedCreepValues = { value: creepValues };
  const sharedCreepEdgesValues = { value: creepEdgesValues };
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


        //sd creep
        float creepF = texture2D(creep, vUv).r;
        float creepEdge = texture2D(creepEdges, vUv).r;

        // scale 0->13 0->1
        float creepS = creepF * 255./creepResolution.x; 
        float tilex = mod(vUv.x, invMapResolution.x)  * mapToCreepResolution.x + creepS;

        float tiley = mod(vUv.y, invMapResolution.y) * mapToCreepResolution.y;
        vec4 creepColor = texture2D(creepTexture, vec2(tilex,tiley));
        vec4 creepLinear = mapTexelToLinear(creepColor);
        diffuseColor =  mix(diffuseColor, creepLinear, creepColor.a);

        //creep edges
        creepS = creepEdge * 255./creepEdgesResolution.x; 
        tilex = mod(vUv.x, invMapResolution.x)  * mapToCreepEdgesResolution.x + creepS;
        tiley = mod(vUv.y, invMapResolution.y) * mapToCreepEdgesResolution.y;

        vec4 creepEdgeColor = texture2D(creepEdgesTexture, vec2(tilex,tiley));
        vec4 creepEdgeLinear = mapTexelToLinear(creepEdgeColor);
        diffuseColor = mix(diffuseColor, creepEdgeLinear, creepEdgeColor.a);

      `
      );

      shader.fragmentShader = `
        precision highp usampler2D;
        precision highp isampler2D;
        uniform sampler2D palette;
        uniform usampler2D paletteIndices;
        uniform ivec2 index1;
        uniform ivec2 index2;
        uniform ivec2 index3;
        uniform int counter;


        //sd creep
        uniform vec2 invMapResolution;
        uniform vec2 mapResolution;
        uniform sampler2D creep;
        uniform sampler2D creepTexture;
        uniform vec2 creepResolution;
        uniform vec2 mapToCreepResolution;

        uniform sampler2D creepEdges;
        uniform sampler2D creepEdgesTexture;
        uniform vec2 mapToCreepEdgesResolution;
        uniform vec2 creepEdgesResolution;
        
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

      shader.uniforms.mapResolution = {
        value: new Vector2(mapWidth, mapHeight),
      };
      shader.uniforms.invMapResolution = {
        value: new Vector2(1 / mapWidth, 1 / mapHeight),
      };
      shader.uniforms.mapToCreepResolution = {
        value: new Vector2(
          mapWidth / (creepTextureSD.width / 32),
          mapHeight / (creepTextureSD.height / 32)
        ),
      };
      shader.uniforms.creepResolution = {
        value: new Vector2(
          creepTextureSD.width / 32,
          creepTextureSD.height / 32
        ),
      };
      shader.uniforms.creepEdgesResolution = {
        value: new Vector2(
          creepEdgesTextureSD.width / 32,
          creepEdgesTextureSD.height / 32
        ),
      };
      shader.uniforms.mapToCreepEdgesResolution = {
        value: new Vector2(
          mapWidth / (creepEdgesTextureSD.width / 32),
          mapHeight / (creepEdgesTextureSD.height / 32)
        ),
      };
      shader.uniforms.creep = sharedCreepValues;
      shader.uniforms.creepEdges = sharedCreepEdgesValues;
      shader.uniforms.creepEdgesTexture = {
        value: creepEdgesTextureSD.texture,
      };
      shader.uniforms.creepTexture = {
        value: creepTextureSD.texture,
      };
      console.log(shader);
    },
  });
  mat.userData.tileAnimationCounter = tileAnimationCounter;

  const displaceCanvas = document.createElement("canvas");
  displaceCanvas.width = mapWidth * options.displaceDimensionScale;
  displaceCanvas.height = mapHeight * options.displaceDimensionScale;

  displaceCanvas.getContext("2d").drawImage(renderer.domElement, 0, 0);

  // small optimization: scale down for getTerrainY
  const displaceForGetTerrainY = document.createElement("canvas");
  displaceForGetTerrainY.width = mapWidth * 4;
  displaceForGetTerrainY.height = mapHeight * 4;
  displaceForGetTerrainY
    .getContext("2d")
    .drawImage(displaceCanvas, 0, 0, mapWidth * 4, mapHeight * 4);

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
  //#endregion sd map

  //#region hd map
  const hdTerrainGroup = new THREE.Group();
  for (let x = 0; x < mapHd.quartileStrideW; x++) {
    for (let y = 0; y < mapHd.quartileStrideH; y++) {
      const hdTerrain = new Mesh();
      const w = mapHd.quartileWidth;
      const h = mapHd.quartileHeight;

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
        map: mapHd.mapQuartiles[x][y],
        bumpMap: mapHd.mapQuartiles[x][y],
        bumpScale: options.bumpScale,
        onBeforeCompile: function (shader) {
          let fs = shader.fragmentShader;
          fs = fs.replace(
            "#include <map_fragment>",
            `
            #include <map_fragment>

          //creep hd

          //reposition the quartile y offset, yeah shits getting weird :S
          vec2 qo = vec2(quartileOffset.x, (1. - quartileResolution.y) - quartileOffset.y);

          vec2 creepUv = vUv * quartileResolution + qo;
          float creepF = texture2D(creep, creepUv).r;
          float creepEdge = texture2D(creepEdges, creepUv).r;

          // scale 0->13 0->1
          float creepS = creepF * 255./creepResolution.x; 
          float tilex = mod(vUv.x, invMapResolution.x)   * mapToCreepResolution.x + creepS;
          float tiley = mod(vUv.y, invMapResolution.y) * mapToCreepResolution.y;
          vec4 creepColor = texture2D(creepTexture, vec2(tilex,tiley));
          vec4 creepLinear = mapTexelToLinear(creepColor);
          diffuseColor =  mix(diffuseColor, creepLinear, creepColor.a);
      
          //creep edges
          creepS = creepEdge * 255./creepEdgesResolution.x; 
          tilex = mod(vUv.x, invMapResolution.x)  * 1.05 * mapToCreepEdgesResolution.x + creepS;
          tiley = mod(vUv.y, invMapResolution.y) * 1.05 * mapToCreepEdgesResolution.y;
  
          vec4 creepEdgeColor = texture2D(creepEdgesTexture, vec2(tilex,tiley));
          vec4 creepEdgeLinear = mapTexelToLinear(creepEdgeColor);
          diffuseColor = mix(diffuseColor, creepEdgeLinear, creepEdgeColor.a);

          `
          );
          shader.fragmentShader = `
            precision highp isampler2D;
            uniform vec2 quartileResolution;
            uniform vec2 quartileOffset;
            uniform vec2 invMapResolution;
            uniform vec2 mapToCreepResolution;
            
            // creep
            uniform sampler2D creep;
            uniform sampler2D creepTexture;
            uniform vec2 creepResolution;
            uniform vec2 mapToCreepEdgesResolution;

            uniform sampler2D creepEdges;
            uniform sampler2D creepEdgesTexture;
            uniform vec2 creepEdgesResolution;

            ${fs}
        `;
          shader.uniforms.quartileResolution = {
            value: new Vector2(w / mapWidth, h / mapHeight),
          };
          shader.uniforms.quartileOffset = {
            value: new Vector2((w * x) / mapWidth, (h * y) / mapHeight),
          };
          shader.uniforms.invMapResolution = {
            value: new Vector2(1 / w, 1 / h),
          };
          shader.uniforms.mapToCreepResolution = {
            value: new Vector2(
              w / (creepTextureHD.width / 128),
              h / (creepTextureHD.height / 128)
            ),
          };
          shader.uniforms.creepResolution = {
            value: new Vector2(
              creepTextureHD.width / 128,
              creepTextureHD.height / 128
            ),
          };

          shader.uniforms.mapToCreepEdgesResolution = {
            value: new Vector2(
              w / (creepEdgesTextureHD.width / 128),
              h / (creepEdgesTextureHD.height / 128)
            ),
          };
          shader.uniforms.creepEdges = sharedCreepEdgesValues;
          shader.uniforms.creep = sharedCreepValues;
          shader.uniforms.creepEdgesTexture = {
            value: creepEdgesTextureHD.texture,
          };
          shader.uniforms.creepEdgesResolution = {
            value: new Vector2(
              creepEdgesTextureHD.width / 128,
              creepEdgesTextureHD.height / 128
            ),
          };
          shader.uniforms.creepTexture = {
            value: creepTextureHD.texture,
          };
        },
      });

      hdTerrain.material = mat;
      hdTerrain.castShadow = true;
      hdTerrain.receiveShadow = true;
      hdTerrain.rotation.x = -Math.PI / 2;
      hdTerrain.position.x =
        x * mapHd.quartileWidth + mapHd.quartileWidth / 2 - mapWidth / 2;
      hdTerrain.position.z =
        y * mapHd.quartileHeight + mapHd.quartileHeight / 2 - mapHeight / 2;

      hdTerrain.userData.map = map;
      hdTerrain.userData.mat = mat;
      hdTerrain.userData.elevationsMaterial = elevationsMaterial;
      hdTerrain.userData.textures = [mat];

      hdTerrainGroup.add(hdTerrain);
      //   hdTerrains.push(hdTerrain);
    }
  }
  //#endregion hd map

  terrain.visible = true;
  hdTerrainGroup.visible = true;

  // DEBUGGGG
  hdTerrainGroup.creepEdgesTextureHD = creepEdgesTextureHD.texture.image;
  hdTerrainGroup.creepEdgesTextureSD = rgbToCanvas(
    creepEdgesTextureSD.texture.image,
    "rgba"
  );
  hdTerrainGroup.creepTextureHD = creepTextureHD.texture.image;
  hdTerrainGroup.creepTextureSD = rgbToCanvas(
    creepTextureSD.texture.image,
    "rgba"
  );

  terrain.name = "Terrain";
  hdTerrainGroup.name = "TerrainHD";
  restoreRenderer(renderer);

  terrain.matrixAutoUpdate = false;
  terrain.updateMatrix();

  hdTerrainGroup.matrixAutoUpdate = false;
  hdTerrainGroup.updateMatrix();

  const minimapBitmap = await MapSD.createMinimap(
    mapData.diffuse,
    mapWidth,
    mapHeight
  );

  return [
    terrain,
    hdTerrainGroup,
    displaceForGetTerrainY,
    sharedCreepValues,
    sharedCreepEdgesValues,
    minimapBitmap,
  ];
};

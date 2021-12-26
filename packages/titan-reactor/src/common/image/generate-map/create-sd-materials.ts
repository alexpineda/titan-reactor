import { DataTexturesResult } from "./create-data-textures";
import * as THREE from "three";
import {
  Mesh,
  Vector2,
} from "three";

import { GenerateTexturesResult } from "./generate-map-tile-textures";
import { GeometryOptions } from "./geometry-options";

export const createSDMaterials = async (
  tileData: GenerateTexturesResult,
  geomOptions: GeometryOptions,
  { paletteIndicesMap, paletteMap, creepEdgesTextureUniform, creepTextureUniform, sdMap, elevationsMap, mapTilesMap }: DataTexturesResult,
  displacementCanvas: HTMLCanvasElement,
) => {
  const {
    tileset,
    mapWidth,
    mapHeight,
    creepEdgesTextureSD,
    creepTextureSD,
    // waterMasks,
    // waterMasksDds,
    // waterNormal1,
    // waterNormal2,
    // noise,
  } = tileData;

  //#region sd map
  const tileAnimationCounterUniform = { value: 0 };
  const sdMapMaterial = new THREE.MeshStandardMaterial({
    map: sdMap,
    displacementScale: geomOptions.displacementScale,
    displacementMap: new THREE.CanvasTexture(displacementCanvas),
    // @ts-ignore
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
        float creepF = texture2D(creep, vUv ).r;
        float creepEdge = texture2D(creepEdges, vUv).r ;

         if (creepF > 0.) {
          vec4 creepColor = getCreepColor(vUv, creep, creepResolution, mapToCreepResolution, vec4(0.));
          vec4 creepLinear = mapTexelToLinear(creepColor);
          diffuseColor =  creepLinear;
        }

        if (creepEdge > 0.) {
          vec2 creepUv = getCreepUv(vUv, creepEdge, creepEdgesResolution, mapToCreepEdgesResolution);
          vec4 creepEdgeColor = texture2D(creepEdgesTexture, creepUv);
          vec4 creepEdgeLinear = mapTexelToLinear(creepEdgeColor);
          diffuseColor = mix(diffuseColor, creepEdgeLinear, creepEdgeColor.a);
        }
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
        
        vec2 getCreepUv(in vec2 uv, in float value, in vec2 res, in vec2 invRes ) {
          float creepS = (value - 1./255.) * 255./res.x ; 

          float tilex = mod(uv.x, invMapResolution.x)  * invRes.x + creepS;
          float tiley = mod(uv.y, invMapResolution.y) * invRes.y;

          return vec2(tilex, tiley);
        }

        vec4 getCreepColor(in vec2 uv, in sampler2D tex, in vec2 res, in vec2 invRes, in vec4 oColor) {
          float creepF = texture2D(tex, uv ).r;

          // scale 0->13 0->1
          if (creepF > 0.) {
            vec2 creepUv = getCreepUv(uv, creepF, creepResolution, mapToCreepResolution);
            return texture2D(creepTexture,creepUv);
          }

          return oColor;
        }

        vec4 getSampledCreep(const in vec2 uv, in sampler2D tex, in vec2 res, in vec2 invRes) {

          vec2 texelSize = vec2(1.0) / res * 32.;
          float r = 2.;
        
          float dx0 = -texelSize.x * r;
          float dy0 = -texelSize.y * r;
          float dx1 = texelSize.x * r;
          float dy1 = texelSize.y * r;
          vec4 oColor = vec4(0.);
          // vec4 oColor = getCreepColor(uv, tex, res, invRes, vec4(0.));
          return (
            getCreepColor(uv + vec2(dx0, dy0), tex, res, invRes, oColor) +
            getCreepColor(uv + vec2(0.0, dy0), tex, res, invRes, oColor) +
            getCreepColor(uv + vec2(dx1, dy0), tex, res, invRes, oColor) +
            getCreepColor(uv + vec2(dx0, 0.0), tex, res, invRes, oColor) +
            getCreepColor(uv, tex, res, invRes, vec4(0.)) +
            getCreepColor(uv + vec2(dx1, 0.0), tex, res, invRes, oColor) +
            getCreepColor(uv + vec2(dx0, dy1), tex, res, invRes, oColor) +
            getCreepColor(uv + vec2(0.0, dy1), tex, res, invRes, oColor) +
            getCreepColor(uv + vec2(dx1, dy1), tex, res, invRes, oColor)
          ) * (1.0 / 9.0);
            
        }

  
        

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
      shader.uniforms.counter = tileAnimationCounterUniform;
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
      shader.uniforms.creep = creepTextureUniform;
      shader.uniforms.creepEdges = creepEdgesTextureUniform;
      shader.uniforms.creepEdgesTexture = {
        value: creepEdgesTextureSD.texture,
      };
      shader.uniforms.creepTexture = {
        value: creepTextureSD.texture,
      };
      console.log(shader);
    },
  });
  sdMapMaterial.userData.tileAnimationCounter = tileAnimationCounterUniform;

  const elevationOptions = {
    drawMode: { value: 0 },
  };

  const elevationsMaterial = new THREE.MeshStandardMaterial({
    displacementScale: geomOptions.displacementScale,
    displacementMap: new THREE.CanvasTexture(displacementCanvas),
    map: sdMap,
    // @ts-ignore
    onBeforeCompile: function (shader) {
      let fs = shader.fragmentShader;

      fs = fs.replace(
        "#include <map_fragment>",
        `
        int elevation = int(texture2D(elevations, vUv).r);

        bool isWalkable = elevation == 1 || elevation == 3 || elevation == 5 || elevation == 7;

        float elevationF = float(elevation) / 6.;

        if (!isWalkable) {
          elevationF = 0.;
        }

        diffuseColor *= (texture2D(map, vUv));

        if (drawMode == 1) {
          diffuseColor *= vec4(heatmapGradient(elevationF), 1.);
        }
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
      shader.uniforms.drawMode = elevationOptions.drawMode;
      shader.uniforms.mapTiles = { value: mapTilesMap };
    },
  });
  elevationsMaterial.userData = elevationOptions;

  const geometry = new THREE.PlaneBufferGeometry(
    mapWidth,
    mapHeight,
    mapWidth * geomOptions.displaceVertexScale,
    mapHeight * geomOptions.displaceVertexScale
  );
  // const geometry = createDisplacementGeometry(
  //   null,
  //   mapWidth,
  //   mapHeight,
  // mapWidth * options.displaceVertexScale,
  // mapHeight * options.displaceVertexScale,
  //   displaceCanvas,
  //   options.displacementScale,
  //   0
  // );

  const sdTerrain = new Mesh();
  sdTerrain.geometry = geometry;
  sdTerrain.material = elevationsMaterial;
  sdTerrain.castShadow = true;
  sdTerrain.receiveShadow = true;
  sdTerrain.rotation.x = -Math.PI / 2;
  sdTerrain.userData.displace = new THREE.CanvasTexture(displacementCanvas);
  sdTerrain.userData.map = sdMap;
  sdTerrain.userData.mat = sdMapMaterial;
  sdTerrain.userData.elevationsMaterial = elevationsMaterial;
  sdTerrain.userData.textures = [
    sdTerrain.userData.displace,
    sdTerrain.userData.map,
    sdTerrain.userData.elevationsMaterial,
    sdTerrain.userData.mat,
  ];
  //#endregion sd map


  sdTerrain.visible = true;

  sdTerrain.name = "Terrain";

  sdTerrain.matrixAutoUpdate = false;
  sdTerrain.updateMatrix();

  return sdTerrain;
};
export default createSDMaterials;

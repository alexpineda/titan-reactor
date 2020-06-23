import { generateDisplacementMap } from "../2d-map-rendering/generators/generateDisplacementMap";
import { generateEmissiveMap } from "../2d-map-rendering/generators/generateEmissiveMap";
import { generateMap } from "../2d-map-rendering/generators/generateMap";
import { generateRoughnessMap } from "../2d-map-rendering/generators/generateRoughnessMap";

import { generateMapDetails } from "../2d-map-rendering/generators/generateMapDetails";

import { rgbToCanvas } from "../2d-map-rendering/image/canvas";

import createScmExtractor from "scm-extractor";
import concat from "concat-stream";
import * as THREE from "three";
const fs = window.require("fs");

export function loadMapDetails(map) {}

export function loadTerrain(map) {}

export function loadTerrainBackground(map) {}

export function loadDisplacement(map) {}

export function loadRoughness(map) {}

export function generateMapMeshes(mapDetails, map, bg, displace, rough) {
  const [width, height] = mapDetails.size;
  const floor = (function () {
    const geometry = new THREE.PlaneBufferGeometry(
      width,
      height,
      width * 2,
      height * 2
    );
    const material = new THREE.MeshStandardMaterial({
      map: map,
      displacementMap: displace,
      displacementScale: 6,
      bumpMap: map,
      bumpScale: 0.1,
      // normalMap: normal,
      // normalScale: new THREE.Vector2(1.3, 1.6),
      // normalMapType: THREE.TangentSpaceNormalMap,
      dithering: true,
      roughness: 1,
      roughnessMap: rough,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;

    plane.castShadow = true;
    plane.receiveShadow = true;
    plane.material.map.anisotropy = 16;
    plane.name = "floor";
    return plane;
  })();

  const backingFloor = (function () {
    const geometry = new THREE.PlaneBufferGeometry(width, height, 4, 4);
    const material = new THREE.MeshLambertMaterial({
      map: bg,
      transparent: true,
      opacity: 0.5,
      toneMapped: false,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.scale.x = 10;
    plane.scale.y = 10;
    plane.rotation.x = -Math.PI / 2;

    plane.position.z = 32;
    plane.material.map.anisotropy = 1;
    plane.name = "backing-floor";
    return plane;
  })();

  return [floor, backingFloor];
}

export function loadAllTerrain(map) {
  const flip = (texture) => {
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.repeat.x = -1;
    // texture.flipY = false;
    console.log("no flip");
    return texture;
  };

  const encoding = (texture) => {
    texture.encoding = THREE.sRGBEncoding;
    return texture;
  };
  const toDataTexture = ({ data, width, height }) =>
    new THREE.DataTexture(data, width, height, THREE.RGBFormat);

  const mapDetailsLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          res(generateMapDetails(data));
        })
      );
  });

  const mapLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateMap({
            bwDataPath: "./bwdata",
            scmData: data,
            scale: 1,
            blurFactor: 0,
          })
            .then(rgbToCanvas)
            .then((canvas) => new THREE.CanvasTexture(canvas))
            .then(encoding)
            .then(res, rej);
        })
      );
  });

  const bgLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateMap({
            bwDataPath: "./bwdata",
            scmData: data,
            scale: 0.25 * 0.25,
            blurFactor: 32,
          })
            .then(rgbToCanvas)
            .then((canvas) => new THREE.CanvasTexture(canvas))
            .then(encoding)
            .then(res, rej);
        })
      );
  });

  const displaceLoader = new Promise((res, rej) => {
    fs.createReadStream(`./maps/${map}`)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateDisplacementMap({
            bwDataPath: "./bwdata",
            scmData: data,
            scale: 0.25,
            elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
            detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
            detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
            walkableLayerBlur: 24,
            allLayersBlur: 8,
          })
            .then(rgbToCanvas)
            .then((canvas) => new THREE.CanvasTexture(canvas))
            .then(res, rej);
        })
      );
  });

  const roughnessLoader = (opts = {}) =>
    new Promise((res, rej) => {
      fs.createReadStream(`./maps/${map}`)
        .pipe(createScmExtractor())
        .pipe(
          concat((data) => {
            generateRoughnessMap({
              bwDataPath: "./bwdata",
              scmData: data,
              elevations: [1, 1, 1, 1, 1, 1, 1],
              detailsElevations: [1, 0, 0, 0, 0, 0, 0],
              detailsRatio: [0.5, 0, 0, 0, 0, 0, 0],
              scale: 0.5,
              blur: 0,
              water: true,
              lava: false,
              twilight: false,
              skipDetails: false,
              onlyWalkable: false,
              ...opts,
            })
              .then(rgbToCanvas)
              .then((canvas) => new THREE.CanvasTexture(canvas))
              .then(res, rej);
          })
        );
    });

  return Promise.all([
    mapDetailsLoader,
    mapLoader,
    bgLoader,
    displaceLoader,
    roughnessLoader(),
  ]).then((args) => generateMapMeshes(...args));
}

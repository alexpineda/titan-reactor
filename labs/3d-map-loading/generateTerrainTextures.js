import { generateDisplacementMap } from "../2d-map-rendering/generators/generateDisplacementMap";
import { generateEmissiveMap } from "../2d-map-rendering/generators/generateEmissiveMap";
import { generateMap } from "../2d-map-rendering/generators/generateMap";
import { generateRoughnessMap } from "../2d-map-rendering/generators/generateRoughnessMap";
import Chk from "bw-chk";

import createScmExtractor from "scm-extractor";
import concat from "concat-stream";
import * as THREE from "three";
// import { Cache } from "../utils/electron/cache";
import { gameOptions } from "../utils/gameOptions";
import { generateTerrainMesh } from "./generateTerrainMesh";
import { rgbToCanvas } from "../2d-map-rendering/image/canvas";

const fs = window.require("fs");

const Cache = {
  restore: (filepath) => Promise.reject(),
  save: (filepath, data) => Promise.resolve(data),
  convertAndSaveMapTexture: (filepath, id, data, width, height) =>
    Promise.resolve(
      new THREE.CanvasTexture(rgbToCanvas({ data, width, height }))
    ),
};

const encoding = (texture) => {
  texture.encoding = THREE.sRGBEncoding;
  return texture;
};

export const chkLoader = (filepath, ignoreCache = false) => {
  const load = () =>
    new Promise((res, rej) => {
      fs.createReadStream(filepath)
        .pipe(createScmExtractor())
        .pipe(
          concat((data) => {
            Cache.save(filepath, data).then(res);
          })
        );
    });

  const process = (data) => new Chk(data);

  if (ignoreCache) {
    return load().then(process);
  } else {
    return Cache.restore(filepath).catch(load).then(process);
  }
};

export const mapPreviewLoader = (filepath, canvas, ignoreCache = false) =>
  new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((chkData) => {
          generateMap({
            bwDataPath: gameOptions.bwDataPath,
            scmData: chkData,
            scale: 0.25 * 0.25,
            blurFactor: 0,
          }).then(({ data, width, height }) => {
            res({
              canvas: rgbToCanvas({
                data,
                width,
                height,
                defaultCanvas: canvas,
              }),
              chk: new Chk(chkData),
            });
          });
        })
      );
  });

export const mapElevationsLoader = (filepath, ignoreCache = false) =>
  new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((chkData) => {
          generateMap({
            bwDataPath: gameOptions.bwDataPath,
            scmData: chkData,
            scale: 0.25 * 0.5,
            blurFactor: 0,
            renderElevations: true,
          })
            .then(({ data, width, height }) =>
              Cache.convertAndSaveMapTexture(
                filepath,
                "map",
                data,
                width,
                height
              )
            )
            .then(encoding)
            .then(res, rej);
        })
      );
  });

export const mapLoader = (filepath, renderer, opts = {}, ignoreCache = false) =>
  new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateMap({
            bwDataPath: gameOptions.bwDataPath,
            scmData: data,
            scale: 1,
            blurFactor: 0,
            ...opts,
          })
            .then(({ data, width, height }) =>
              Cache.convertAndSaveMapTexture(
                filepath,
                "map",
                data,
                width,
                height
              )
            )
            .then(encoding)
            .then((texture) => {
              renderer.initTexture(texture);
              return texture;
            })
            .then(res, rej);
        })
      );
  });

export const bgLoader = (filepath, renderer, opts = {}, ignoreCache = false) =>
  new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateMap({
            bwDataPath: gameOptions.bwDataPath,
            scmData: data,
            scale: 0.25 * 0.25,
            blurFactor: 16,
            ...opts,
          })
            .then(({ data, width, height }) =>
              Cache.convertAndSaveMapTexture(
                filepath,
                "bg",
                data,
                width,
                height
              )
            )
            .then(encoding)
            .then(res, rej);
        })
      );
  });

export const displaceLoader = (
  filepath,
  renderer,
  opts = {},
  ignoreCache = false
) =>
  new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateDisplacementMap({
            bwDataPath: gameOptions.bwDataPath,
            scmData: data,
            scale: 0.25,
            elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
            detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
            detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
            walkableLayerBlur: 16,
            allLayersBlur: 8,
            ...opts,
          })
            .then(({ data, width, height }) =>
              Cache.convertAndSaveMapTexture(
                filepath,
                "displace",
                data,
                width,
                height
              )
            )
            .then(res, rej);
        })
      );
  });

export const roughnessLoader = (filepath, renderer, opts = {}, ignoreCache) =>
  new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateRoughnessMap({
            bwDataPath: gameOptions.bwDataPath,
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
            .then(({ data, width, height }) =>
              Cache.convertAndSaveMapTexture(
                filepath,
                "rough",
                data,
                width,
                height
              )
            )
            .then(res, rej);
        })
      );
  });

export function loadAllTerrain(filepath, renderer, ignoreCache = true) {
  const flip = (texture) => {
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.repeat.x = -1;
    // texture.flipY = false;
    console.log("no flip");
    return texture;
  };

  return chkLoader(filepath, ignoreCache).then(({ size }) => {
    return Promise.all([
      mapLoader(filepath, renderer, ignoreCache),
      bgLoader(filepath, renderer, ignoreCache),
      displaceLoader(filepath, renderer, ignoreCache),
      roughnessLoader(filepath, renderer, ignoreCache),
    ]).then((args) => generateTerrainMesh(renderer, size[0], size[1], ...args));
  });
}

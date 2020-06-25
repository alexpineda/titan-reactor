import { generateDisplacementMap } from "../2d-map-rendering/generators/generateDisplacementMap";
import { generateEmissiveMap } from "../2d-map-rendering/generators/generateEmissiveMap";
import { generateMap } from "../2d-map-rendering/generators/generateMap";
import { generateRoughnessMap } from "../2d-map-rendering/generators/generateRoughnessMap";
import Chk from "bw-chk";

import createScmExtractor from "scm-extractor";
import concat from "concat-stream";
import * as THREE from "three";
import { Cache } from "../utils/cache";
import { gameOptions } from "../utils/options";
import { generateTerrainMesh } from "./generateTerrainMesh";

const fs = window.require("fs");

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

export function loadAllTerrain(filepath, ignoreCache = true) {
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

  const mapLoader = new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateMap({
            bwDataPath: gameOptions.bwDataPath,
            scmData: data,
            scale: 1,
            blurFactor: 0,
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

  const bgLoader = new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateMap({
            bwDataPath: gameOptions.bwDataPath,
            scmData: data,
            scale: 0.25 * 0.25,
            blurFactor: 32,
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

  const displaceLoader = new Promise((res, rej) => {
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
            walkableLayerBlur: 24,
            allLayersBlur: 8,
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

  const roughnessLoader = (opts = {}) =>
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

  return chkLoader(filepath, ignoreCache).then(({ size }) => {
    return Promise.all([
      mapLoader,
      bgLoader,
      displaceLoader,
      roughnessLoader(),
    ]).then((args) => generateTerrainMesh(size[0], size[1], ...args));
  });
}

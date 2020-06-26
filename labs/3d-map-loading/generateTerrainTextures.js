import { generateLayeredDisplacementMap } from "../2d-map-rendering/generators/generateLayeredDisplacementMap";
import { generateMap } from "../2d-map-rendering/generators/generateMap";
import { generateElevationBasedMap } from "../2d-map-rendering/generators/generateElevationBaseMap";
import Chk from "bw-chk";
import { imageChk, extractChk } from "../utils/loadChk";

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

export const chkLoader = async (filepath, ignoreCache = false) => {
  const load = async () => {
    const chkData = await extractChk(filepath);
    return Cache.save(filepath, chkData);
  };

  const process = (data) => new Chk(data);

  if (ignoreCache) {
    return load().then(process);
  } else {
    return Cache.restore(filepath).catch(load).then(process);
  }
};

export const mapPreviewLoader = async (
  filepath,
  canvas,
  ignoreCache = false
) => {
  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  const { data, width, height } = await generateMap({
    chk,
    scale: 0.25 * 0.25,
    blur: 0,
  });

  return {
    canvas: rgbToCanvas({
      data,
      width,
      height,
      defaultCanvas: canvas,
    }),
    chk,
  };
};

export const mapElevationsLoader = async (filepath, ignoreCache = false) => {
  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  const { data, width, height } = await generateMap({
    chk,
    scale: 0.25 * 0.5,
    blur: 0,
    renderElevations: true,
  });

  const texture = await Cache.convertAndSaveMapTexture(
    filepath,
    "map",
    data,
    width,
    height
  );
  return encoding(texture);
};

export const mapLoader = async (
  filepath,
  renderer,
  preset = {},
  ignoreCache = false
) => {
  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  const { data, width, height } = await generateMap({
    chk,
    scale: 1,
    blur: 0,
    ...preset,
  });

  const texture = Cache.convertAndSaveMapTexture(
    filepath,
    "map",
    data,
    width,
    height
  );

  return encoding(texture);
};

export const bgLoader = async (
  filepath,
  renderer,
  preset = {},
  ignoreCache = false
) => {
  const chk = await imageChk(filepath, gameOptions.bwDataPath);

  const { data, width, height } = await generateMap({
    chk,
    scale: 0.25 * 0.25,
    blur: 16,
    ...preset,
  });

  const texture = await Cache.convertAndSaveMapTexture(
    filepath,
    "bg",
    data,
    width,
    height
  );
  return encoding(texture);
};

export const displaceLoader = (
  filepath,
  renderer,
  preset = {},
  ignoreCache = false
) =>
  new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateLayeredDisplacementMap({
            bwDataPath: gameOptions.bwDataPath,
            scmData: data,
            scale: 0.25,
            elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
            detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
            detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
            walkableLayerBlur: 16,
            allLayersBlur: 8,
            ...preset,
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

export const roughnessLoader = (filepath, renderer, preset = {}, ignoreCache) =>
  new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          generateElevationBasedMap({
            bwDataPath: gameOptions.bwDataPath,
            scmData: data,
            elevations: [1, 1, 1, 1, 1, 1, 1],
            detailsRatio: [0.5, 0, 0, 0, 0, 0, 0],
            scale: 0.5,
            blur: 0,
            water: true,
            lava: false,
            twilight: false,
            skipDetails: false,
            onlyWalkable: false,
            ...preset,
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

export function loadAllTerrain(filepath, renderer, preset, ignoreCache = true) {
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

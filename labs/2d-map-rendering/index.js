import createScmExtractor from "scm-extractor";
import Chk from "bw-chk";
import concat from "concat-stream";
import { generateLayeredDisplacementMap } from "./generators/generateLayeredDisplacementMap";
import { generateMap } from "./generators/generateMap";
import { generateElevationBasedMap } from "./generators/generateElevationBaseMap";
import { writeToContext2d } from "./image/canvas";
import { createGui } from "../3d-map-loading/gui";

const { control } = createGui(true);
control.on("roughness", () => console.log("roughness"));

const fs = window.require("fs");

const { ipcRenderer } = window.require("electron");

console.log(new Date().toLocaleString());

ipcRenderer.on("open-map", (event, [newMap]) => {
  map = newMap;
  functions[mode](map);
});

const canvas = document.getElementById("canvas");
canvas.style.transformOrigin = "0 0";
canvas.style.transform = "scale(0.25)";

const ctx = canvas.getContext("2d");

let mode = "terrain";
let map = "/Users/ricardopineda/dev/jssuh-test/fs.scx";

document.querySelectorAll('[name="mode"]').forEach((el) => {
  el.addEventListener("change", function () {
    mode = this.value;
    functions[mode](map);
  });
});

console.log("bw-chk-test:start", new Date().toLocaleString());

canvas.addEventListener("click", ({ offsetX, offsetY }) => {
  console.log(
    offsetX,
    offsetY,
    Math.floor(offsetX / 8),
    Math.floor(offsetY / 8),
    Math.floor(offsetX / 32),
    Math.floor(offsetY / 32)
  );
  window.chk
    .getTileInfoFromXY(
      Chk.fsFileAccess("./bwdata"),
      window.chk.size[0],
      window.chk.size[1],
      offsetX,
      offsetY
    )
    .then((data) => console.log(data));
});

const functions = {
  terrain: terrain,
  displacement: displacement,
  background: background,
  emissive: emissive,
  roughness: roughness,
  fast: fastTerrain,
};

function displacement(filename) {
  fs.createReadStream(filename)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("displacement", filename);

        generateLayeredDisplacementMap({
          bwDataPath: "./bwdata",
          scmData: data,
          scale: 0.25,
          elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
          detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
          detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
          walkableLayerBlur: 16,
          allLayersBlur: 8,
        }).then(({ data, width, height, chk }) => {
          window.chk = chk;
          canvas.width = width;
          canvas.height = height;
          writeToContext2d(ctx, data, width, height, false);
          // drawGrid(ctx, width, height);
          addDownloadLink();
        });
      })
    );
}

function emissive(filename) {
  fs.createReadStream(filename)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("emissive", filename);
        generateEmissiveMap({
          bwDataPath: "./bwdata",
          scmData: data,
          elevations: [0.7, 1, 1, 1, 1, 1, 1],
          detailsElevations: [1, 0, 0, 0, 0, 0, 0],
          detailsRatio: [0.5, 0, 0, 0, 0, 0, 0],
          scale: 0.5, //0.25 * 0.5,
          lava: true,
        }).then(({ data, width, height, chk }) => {
          window.chk = chk;
          canvas.width = width;
          canvas.height = height;
          writeToContext2d(ctx, data, width, height, false);
          // drawGrid(ctx, width, height);
          addDownloadLink();
        });
      })
    );
}

function roughness(filename) {
  fs.createReadStream(filename)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("roughness", filename);

        generateElevationBasedMap({
          bwDataPath: "./bwdata",
          scmData: data,
          elevations: [0.7, 1, 1, 1, 1, 1, 1],
          detailsElevations: [1, 0, 0, 0, 0, 0, 0],
          detailsRatio: [0.5, 0, 0, 0, 0, 0, 0],
          scale: 0.5, //0.25 * 0.5,
          lava: true,
        }).then(({ data, width, height, chk }) => {
          window.chk = chk;
          canvas.width = width;
          canvas.height = height;
          writeToContext2d(ctx, data, width, height, false);
          // drawGrid(ctx, width, height);
          addDownloadLink();
        });
      })
    );
}

function terrain(filename) {
  fs.createReadStream(filename)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("terrain", filename);
        const start = Date.now();
        generateMap({
          bwDataPath: "./bwdata",
          scmData: data,
          scale: 1,
          blurFactor: 0,
        }).then(({ data, width, height, chk }) => {
          window.chk = chk;
          canvas.width = width;
          canvas.height = height;
          writeToContext2d(ctx, data, width, height, false);
          // drawGrid(ctx, width, height);
          addDownloadLink();
        });
        console.log("finish", Date.now() - start);
      })
    );
}

function fastTerrain(filename) {
  fs.createReadStream(filename)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("fast terrain", filename);
        generateMap({
          bwDataPath: "./bwdata",
          scmData: data,
          scale: 0.25,
          blurFactor: 0,
          sampled: true,
        }).then(({ data, width, height, chk }) => {
          window.chk = chk;
          canvas.width = width;
          canvas.height = height;
          writeToContext2d(ctx, data, width, height, false);
          // drawGrid(ctx, width, height);
          addDownloadLink();
        });
      })
    );
}

function background(filename) {
  fs.createReadStream(filename)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        generateMap({
          bwDataPath: "./bwdata",
          scmData: data,
          scale: 0.25,
          blurFactor: 16,
          sampled: true,
        }).then(({ data, width, height, chk }) => {
          window.chk = chk;
          canvas.width = width;
          canvas.height = height;
          writeToContext2d(ctx, data, width, height, false);
          // drawGrid(ctx, width, height);
          addDownloadLink();
        });
      })
    );
}

function addDownloadLink() {
  const el = document.getElementById("download");
  el.setAttribute("href", canvas.toDataURL("image/png"));
}

function drawGrid(ctx, width, height) {
  ctx.strokeStyle = "#999";
  ctx.globalAlpha = 0.5;
  for (let x = 0; x < width; x = x + 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y = y + 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

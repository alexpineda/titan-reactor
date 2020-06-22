import createScmExtractor from "scm-extractor";
import Chk from "bw-chk";
import concat from "concat-stream";
import { generateDisplacementMap } from "./generators/generateDisplacementMap";
import { generateMap } from "./generators/generateMap";
import { generateEmissiveMap } from "./generators/generateEmissiveMap";
import { generateRoughnessMap } from "./generators/generateRoughnessMap";

// import { ipcRenderer } from "electron";
// ipc.send("hello", "a string", 10);

const fs = window.require("fs");

const canvas = document.getElementById("canvas");
canvas.style.transformOrigin = "0 0";
canvas.style.transform = "scale(0.25)";

const ctx = canvas.getContext("2d");

let mode = "terrain";
let map = "(4)Fighting Spirit.scx";

document.querySelectorAll('[name="mode"]').forEach((el) => {
  el.addEventListener("change", function () {
    mode = this.value;
    functions[mode](map);
  });
});

document.querySelector("#maps").addEventListener("change", function () {
  map = this.value;
  functions[mode](map);
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
};

function displacement(filename) {
  fs.createReadStream(`./maps/${filename}`)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("displacement", filename);
        generateDisplacementMap("./bwdata", data).then(
          ({ data, width, height }) => {
            canvas.width = width;
            canvas.height = height;
            writeToCanvas(ctx, data, width, height, false);
            // drawGrid(ctx, width, height);
            addDownloadLink();
          }
        );
      })
    );
}

function emissive(filename) {
  fs.createReadStream(`./maps/${filename}`)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("emissive", filename);
        generateEmissiveMap("./bwdata", data).then(
          ({ data, width, height }) => {
            canvas.width = width;
            canvas.height = height;
            writeToCanvas(ctx, data, width, height, false);
            // drawGrid(ctx, width, height);
            addDownloadLink();
          }
        );
      })
    );
}

function roughness(filename) {
  fs.createReadStream(`./maps/${filename}`)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("roughness", filename);
        generateRoughnessMap("./bwdata", data).then(
          ({ data, width, height }) => {
            canvas.width = width;
            canvas.height = height;
            writeToCanvas(ctx, data, width, height, false);
            // drawGrid(ctx, width, height);
            addDownloadLink();
          }
        );
      })
    );
}

function terrain(filename) {
  fs.createReadStream(`./maps/${filename}`)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("terrain", filename);
        generateMap("./bwdata", data, 1, 0).then(({ data, width, height }) => {
          canvas.width = width;
          canvas.height = height;
          writeToCanvas(ctx, data, width, height, false);
          // drawGrid(ctx, width, height);
          addDownloadLink();
        });
      })
    );
}

function background(filename) {
  fs.createReadStream(`./maps/${filename}`)
    .pipe(createScmExtractor())
    .pipe(
      concat((data) => {
        console.log("background", filename);
        generateMap("./bwdata", data, 0.25, 32).then(
          ({ data, width, height }) => {
            canvas.width = width;
            canvas.height = height;
            writeToCanvas(ctx, data, width, height, false);
            // drawGrid(ctx, width, height);
            addDownloadLink();
          }
        );
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
function writeToCanvas(ctx, data, width, height, blend = false) {
  const srcPixelWidth = "rgb".length;
  const dstPixelWidth = 4;

  const prevdata = ctx.getImageData(0, 0, width, height);
  const imagedata = ctx.createImageData(width, height);

  if (blend) {
    for (
      let src = 0, dst = 0;
      src < data.length;
      src += srcPixelWidth, dst += dstPixelWidth
    ) {
      imagedata.data[dst] = (data[src] + prevdata.data[dst]) / 2;
      imagedata.data[dst + 1] = (data[src + 1] + prevdata.data[dst + 1]) / 2;
      imagedata.data[dst + 2] = (data[src + 2] + prevdata.data[dst + 2]) / 2;
      imagedata.data[dst + 3] = srcPixelWidth === 4 ? data[src + 3] : 255;
    }
  } else {
    for (
      let src = 0, dst = 0;
      src < data.length;
      src += srcPixelWidth, dst += dstPixelWidth
    ) {
      imagedata.data[dst] = data[src];
      imagedata.data[dst + 1] = data[src + 1];
      imagedata.data[dst + 2] = data[src + 2];
      imagedata.data[dst + 3] = srcPixelWidth === 4 ? data[src + 3] : 255;
    }
  }

  ctx.putImageData(imagedata, 0, 0);
}

// functions[mode](map);

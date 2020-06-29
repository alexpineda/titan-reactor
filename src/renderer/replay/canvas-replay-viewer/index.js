import { FrameData, readUnitsFrameData } from "./frames";

const inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);

let frameCount = 0;
let frameData = [];

function handleFiles() {
  const [file] = this.files; /* now you can work with the file list */
  console.log(file);

  if (file) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function ({ target: { result } }) {
      const { frameCount: fc, frameData: fd } = readUnitsFrameData(result);
      frameCount = fc;
      window.frameData = frameData = fd;
      console.log("loaded", frameData);
      requestAnimationFrame(animate);
    };
    reader.onerror = function (evt) {
      console.error(evt);
    };
  }
}

let prevTime;
let index = 0;
let units = [];

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.save();
let gameFrame = 0;

let lastGameFrameChange = 0;
let gfps = 0;
let fps = 0;
let gameFrameSkip = 10;

function animate(time) {
  if (prevTime === undefined) {
    prevTime = time;
  }
  if (lastGameFrameChange === undefined) {
    lastGameFrameChange = time;
  }

  const dt = time - prevTime;
  fps = Math.trunc((1 / dt) * 1000);
  gfps = Math.trunc(time / gameFrame);

  if (time - lastGameFrameChange <= 42) {
    requestAnimationFrame(animate);
    return;
  }

  for (let gf = 0; gf < gameFrameSkip; gf++) {
    while (true) {
      const unit = frameData[index];

      if (unit) {
        units.push(unit);
        index = index + 1;
        prevTime = time;
        if (gameFrame != unit.frame) {
          gameFrame = unit.frame;
          break;
        }
      } else {
        index = 0;
        gameFrame = 0;
        break;
      }
    }
  }

  drawAll();
  units = [];
  requestAnimationFrame(animate);
}

let lastDrawnGameFrame = 0;

function drawAll() {
  const colors = ["#ff0000", "#0000ff"];
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillRect(0, 0, 128 * 8, 128 * 8);

  if (gameFrame % 100 == 0) {
    lastDrawnGameFrame = gameFrame;
  }
  ctx.font = "16px Arial";
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillText(`fps ${fps}, mspgf ${gfps}`, 10, 20);
  ctx.fillText(lastDrawnGameFrame, 10, 40);
  fps;

  for (const unit of units) {
    ctx.strokeStyle = colors[unit.playerId];
    ctx.beginPath();
    ctx.moveTo(unit.x / 4, unit.y / 4); //convert to our scale (map tile * 8px) from 32px scale
    ctx.lineTo(
      unit.x / 4 + Math.cos(unit.angle) * 10,
      unit.y / 4 + Math.sin(unit.angle) * 10
    );
    ctx.stroke();
  }
}

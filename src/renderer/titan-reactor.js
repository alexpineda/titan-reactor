import { TitanReactorMap } from "./TitanReactorMap";
import { TitanReactorReplay } from "./replay/TitanReactorReplay";
import { TitanReactorSandbox } from "./3d-map-rendering/TitanReactorSandbox";
import { TitanReactorAudioSandbox } from "./audio/TitanReactorAudioSandbox";
import { imageChk } from "./utils/loadChk";
import { gameOptions } from "./utils/gameOptions";
import { jssuhLoadReplay } from "./replay/loaders/JssuhLoadReplay";
import { fromJssuhJSON } from "./replay/loaders/TransformReplay";
import { ipcRenderer } from "electron";
import React from "react";
import { render } from "react-dom";
import { App } from "./react-ui/App";
import { mapPreviewCanvas } from "./3d-map-rendering/textures/mapPreviewCanvas";

console.log("renderer");
console.log(new Date().toLocaleString());

// if (module.hot) {
//   module.hot.accept();
// }

let scene = null;
let appIsReady = true;

async function bootup() {
  let starcraftFont = new FontFace(
    "Blizzard Regular",
    "url(BLIZZARD-REGULAR.TTF)"
    // "url(./bwdata/font/BLIZZARD-REGULAR.TTF)"
  );

  try {
    const loadedFont = await starcraftFont.load();
    document.fonts.add(loadedFont);
  } catch (e) {}

  render(<App />, document.getElementById("app"));
  // if (!(await fs.promises.exists(gameOptions.bwDataPath))) {
  //   // please point us to your starcraft install directory
  // }

  appIsReady = true;
}

ipcRenderer.on("open-map", async (event, [map]) => {
  if (!appIsReady) {
    return alert("Please configure your Starcraft path first");
  }
  if (scene) {
    scene.dispose();
  }
  console.log("open-map");
  scene = await loadMap(map);
});

let replayPlaylist = [];
let replayIndex = 0;
ipcRenderer.on("open-replay", (event, replays) => {
  if (!appIsReady) {
    return alert("Please configure your Starcraft path first");
  }
  replayPlaylist = replays;
  replayIndex = 0;
  loadReplay(replays[0]);
});

ipcRenderer.on("add-replay", (event, replays) => {
  if (!appIsReady) {
    return alert("Please configure your Starcraft path first");
  }
  replayPlaylist = replayPlaylist.concat(replays);
});

ipcRenderer.on("save-image", (event) => {
  var strMime = "image/jpeg";
  const data = renderer.domElement.toDataURL(strMime);

  var saveFile = function (strData, filename) {
    var link = document.createElement("a");
    link.download = "Screenshot";
    link.href = strData;
    link.click();
  };
  saveFile(data);
});
ipcRenderer.on("save-gltf", (event, file) => {
  // Instantiate a exporter
  var exporter = new GLTFExporter();

  // Parse the input and generate the glTF output
  console.log("export scene", file, scene);
  exporter.parse(
    scene,
    function (gltf) {
      fs.writeFile(file, gltf, () => {});
    },
    {}
  );
});

ipcRenderer.on("open-env-settings", (event, [file]) => {
  console.log("open-env", file);
});

ipcRenderer.on("save-env-settings", (event, file) => {
  console.log("save-env", file);
});

//map
//replay
//realtime
//terrain

const loadMap = async (filepath) => {
  const mapPreviewEl = document.getElementById("map--preview-canvas");
  const mapNameEl = document.getElementById("map-name");
  const mapDescriptionEl = document.getElementById("map-description");
  const loadOverlayEl = document.getElementById("load-overlay");

  // hide loading ui elements
  mapNameEl.innerText = "initializing...";
  mapDescriptionEl.innerText = "";
  mapPreviewEl.style.display = "none";
  loadOverlayEl.style.display = "flex";

  console.log("load chk", filepath);
  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  console.log("chk loaded", filepath, chk);

  await mapPreviewCanvas(chk, mapPreviewEl);

  await new Promise((res, rej) => {
    mapNameEl.innerText = chk.title;
    document.title = `Titan Reactor - ${chk.title}`;
    // mapDescriptionEl.innerText = chk.description;
    mapDescriptionEl.innerText = chk.tilesetName;
    mapPreviewEl.style.display = "block";
    setTimeout(res, 100);
  });

  document.title = `Titan Reactor - ${chk.title}`;

  return await TitanReactorReplay(
    chk,
    document.getElementById("three-js"),
    () => (loadOverlayEl.style.display = "none")
  );
};

const loadReplay = async (filepath) => {
  const { headers, commands, chk } = await jssuhLoadReplay(
    filepath,
    gameOptions.bwDataPath
  );
  // const replay = fromJssuhJSON(headers, commands, chk);

  // const frameStream = await generateFrameStream(filepath);

  return await TitanReactorReplay(
    chk,
    frames,
    document.getElementById("three-js")
    // () => (loadOverlayEl.style.display = "none")
  );
};

bootup();

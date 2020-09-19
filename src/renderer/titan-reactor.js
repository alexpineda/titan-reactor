import { TitanReactorMap } from "./TitanReactorMap";
import {
  TitanReactorReplay,
  hot as hotReplay,
} from "./replay/TitanReactorReplay";
import {
  TitanReactorSandbox,
  hot as hotSandbox,
} from "./3d-map-rendering/TitanReactorSandbox";
import { imageChk } from "./utils/loadChk";
import { gameOptions } from "./utils/gameOptions";
import { jssuhLoadReplay } from "./replay/loaders/JssuhLoadReplay";
import { loadAllDataFiles } from "./invoke";
import { ipcRenderer } from "electron";
import React from "react";
import { render } from "react-dom";
import { App, LoadingOverlay } from "./react-ui/App";
import { mapPreviewCanvas } from "./3d-map-rendering/textures/mapPreviewCanvas";
import { DefaultLoadingManager } from "three";

console.log("renderer");
console.log(new Date().toLocaleString());

if (module.hot) {
  module.hot.decline();

  module.hot.accept("./replay/TitanReactorReplay.js", (data) => {
    if (hotReplay) {
      console.log("hot loading replay", hotReplay.filepath);
      scene = loadReplay(hotReplay.filepath);
    }
  });

  module.hot.accept("./3d-map-rendering/TitanReactorSandbox.js", () => {
    if (hotSandbox) {
      console.log("hot loading map", hotSandbox.filepath);
      scene = loadMap(hotSandbox.filepath);
    }
  });
}

let bwDat = null;
let scene = null;
let appIsReady = true;
let overlay = {
  state: "bootup",
  mapName: "",
  description: "",
  preview: null,
};

const updateUi = () =>
  render(
    <App loadingOverlay={<LoadingOverlay {...overlay} />} />,
    document.getElementById("app")
  );

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

  // if (!(await fs.promises.exists(gameOptions.bwDataPath))) {
  //   // please point us to your starcraft install directory
  // }

  appIsReady = true;

  bwDat = await loadAllDataFiles(gameOptions.bwDataPath);
  console.log("bwDat", bwDat);
  updateUi();
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
  console.log("open-replay");
  if (!appIsReady) {
    return alert("Please configure your Starcraft path first");
  }
  if (scene) {
    scene.dispose();
  }
  replayPlaylist = replays;
  replayIndex = 0;
  scene = loadReplay(replays[0]);
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

const loadMap = async (filepath) => {
  overlay = {
    state: "initializing",
    mapName: "",
    description: "",
    preview: "",
  };

  updateUi();

  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  overlay.preview = mapPreviewCanvas.bind(null, chk);

  await new Promise((res, rej) => {
    Object.assign(overlay, {
      state: "loading",
      mapName: chk.title,
      description: chk.tilesetName,
    });

    document.title = `Titan Reactor - ${chk.title}`;
    console.log(overlay);
    // mapDescriptionEl.innerText = chk.description;
    updateUi();

    setTimeout(res, 100);
  });

  return TitanReactorSandbox(
    filepath,
    chk,
    document.getElementById("three-js"),
    () => {
      overlay.state = "";
      updateUi();
    }
  );
};

const loadReplay = async (filepath) => {
  overlay = {
    state: "initializing",
    mapName: "initializing",
    description: "",
    preview: "",
  };

  updateUi();

  const jssuh = await jssuhLoadReplay(filepath, gameOptions.bwDataPath);

  return TitanReactorReplay(
    filepath,
    jssuh,
    document.getElementById("three-js"),
    bwDat,
    () => {
      overlay.state = "";
      updateUi();
    }
  );
};

bootup();

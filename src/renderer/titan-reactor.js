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
import { getAppCachePath, loadAllDataFiles, openFile } from "./invoke";
import { ipcRenderer } from "electron";
import React, { useState } from "react";
import { render } from "react-dom";
import { App, LoadingOverlay } from "./react-ui/App";
import { mapPreviewCanvas } from "./3d-map-rendering/textures/mapPreviewCanvas";
import { UnitDAT } from "../main/units/UnitsDAT";
import { Tileset } from "./bwdat/Tileset";
import { RenderUnit2D } from "./replay/RenderUnit2D";
import { RenderUnit3D } from "./replay/RenderUnit3D";
import { LoadSprite } from "./utils/meshes/LoadSprites";
import { TextureCache } from "./3d-map-rendering/textures/TextureCache";
import { JsonCache } from "./utils/jsonCache";

console.log("renderer");
console.log(new Date().toLocaleString());

const canvas = document.createElement("canvas");
canvas.id = "three-canvas";

if (module.hot) {
  module.hot.decline();

  module.hot.accept("./replay/TitanReactorReplay.js", (data) => {
    if (hotReplay && hotReplay.filepath) {
      console.log("hot loading replay", hotReplay.filepath);
      scene = loadReplay(hotReplay.filepath);
    }
  });

  module.hot.accept("./3d-map-rendering/TitanReactorSandbox.js", () => {
    if (hotSandbox && hotSandbox.filepath) {
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
    <App loadingOverlay={<LoadingOverlay {...overlay} />} canvas={canvas} />,
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

  //@todo move parsing to renderer so I don't have to reassign shit
  const origBwDat = await loadAllDataFiles(gameOptions.bwDataPath);
  bwDat = {
    ...origBwDat,
    units: origBwDat.units.map((unit) => new UnitDAT(unit)),
  };
  console.log("bwDat", bwDat);
  window.bwDat = bwDat;

  updateUi();
}

ipcRenderer.on("open-map", async (event, [map]) => {
  if (!appIsReady) {
    return alert("Please configure your Starcraft path first");
  }

  if (scene && scene.dispose) {
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
  if (scene && scene.dispose) {
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

  window.chk = chk;
  console.log("chk", chk);
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

  return TitanReactorSandbox(filepath, chk, canvas, () => {
    overlay.state = "";
    updateUi();
  });
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

  gameOptions.experience = {
    sprites: true,
    remastered: false,
  };

  const tileset = new Tileset(
    jssuh.chk.tileset,
    gameOptions.bwDataPath,
    openFile
  );
  await tileset.load();

  let renderUnit;
  if (gameOptions.experience.sprites) {
    const spritesTextureCache = new TextureCache(
      "sprite-",
      await getAppCachePath(),
      "rgba"
    );

    const jsonCache = new JsonCache("sprite-", await getAppCachePath());
    const loadSprite = new LoadSprite(
      tileset,
      bwDat.images,
      (file) => openFile(`${gameOptions.bwDataPath}/unit/${file}`),
      spritesTextureCache,
      jsonCache,
      //@todo init renderer here and get renderer.capabilities.maxTextureSize
      8192
    );

    overlay = {
      state: "initializing",
      mapName: "loading sprites",
      description: "",
      preview: "",
    };

    updateUi();
    await loadSprite.loadAll();
    renderUnit = new RenderUnit2D(bwDat, gameOptions.bwDataPath, loadSprite);
  } else {
    renderUnit = new RenderUnit3D();
  }

  return;

  const mapTexturesCache = new TextureCache(
    jssuh.chk.title,
    await getAppCachePath()
  );

  return TitanReactorReplay(
    filepath,
    jssuh,
    renderUnit,
    canvas,
    bwDat,
    mapTexturesCache,
    () => {
      overlay.state = "";
      updateUi();
    }
  );
};

bootup();

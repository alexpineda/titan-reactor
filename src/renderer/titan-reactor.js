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
import { jssuhLoadReplay } from "./replay/LoadReplay";
import { getAppCachePath, loadAllDataFiles, openFile } from "./invoke";
import { ipcRenderer } from "electron";
import React, { useState } from "react";
import { render } from "react-dom";
import { App } from "./react-ui/App";
import { LoadingOverlay } from "./react-ui/LoadingOverlay";
import { mapPreviewCanvas } from "./3d-map-rendering/textures/mapPreviewCanvas";
import { UnitDAT } from "../main/units/UnitsDAT";
import { Tileset } from "./bwdat/Tileset";
import { ImageSD } from "./mesh/ImageSD";
import { Image3D } from "./mesh/Image3D";
import { LoadSprite } from "./mesh/LoadSprites";
import { TextureCache } from "./3d-map-rendering/textures/TextureCache";
import { JsonCache } from "./utils/jsonCache";
import { initRenderer } from "./renderer";

console.log("renderer");
console.log(new Date().toLocaleString());

const canvas = document.createElement("canvas");
canvas.id = "three-canvas";
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.right = "0";
canvas.style.bottom = "0";
canvas.style.zIndex = "-10";

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

const updateUi = (children) =>
  render(
    <App loadingOverlay={<LoadingOverlay {...overlay} />} canvas={canvas}>
      {children}
    </App>,

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

  const jssuh = await jssuhLoadReplay(
    `./maps/other/replays/game.rep`,
    gameOptions.bwDataPath
  );

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

  let renderImage;
  if (gameOptions.experience.sprites) {
    const spritesTextureCache = new TextureCache(
      "sd",
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
    renderImage = new ImageSD(bwDat, gameOptions.bwDataPath, loadSprite);
  } else {
    renderImage = new Image3D();
  }

  const mapTexturesCache = new TextureCache(
    jssuh.chk.title,
    await getAppCachePath()
  );

  const frames = await openFile(filepath);
  // const frames = await openFile(filepath);

  const renderer = initRenderer({
    canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    shadowMap: true,
    //@todo refactor out with renderer in 2d only
    logarithmicDepthBuffer: true,
  });

  return TitanReactorReplay(
    filepath,
    updateUi,
    jssuh,
    new DataView(frames.buffer),
    renderImage,
    renderer,
    bwDat,
    mapTexturesCache,
    () => {
      overlay.state = "";
    }
  );
};

bootup();

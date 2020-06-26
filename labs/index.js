import { TitanReactorMap } from "./TitanReactorMap";
import { TitanReactorReplay } from "./TitanReactorReplay";
import { imageChk } from "./utils/loadChk";
import { gameOptions } from "./utils/gameOptions";
import { jssuhLoadReplay } from "./replay/loaders/JssuhLoadReplay";
import { fromJssuhJSON } from "./replay/loaders/TransformReplay";

const { ipcRenderer } = window.require("electron");

console.log(new Date().toLocaleString());

let scene = null;
let appIsReady = false;

async function bootup() {
  let starcraftFont = new FontFace(
    "Blizzard Regular",
    "url(BLIZZARD-REGULAR.TTF)"
    // "url(./bwdata/font/BLIZZARD-REGULAR.TTF)"
  );

  const loadedFont = await starcraftFont.load();
  document.fonts.add(loadedFont);

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

//map
//replay
//realtime
//terrain

const loadMap = async (filepath) => {
  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  console.log("chk loaded", filepath, chk);

  // await mapPreviewLoader(chk, mapPreviewEl);
  document.title = `Titan Reactor - ${chk.title}`;

  return await TitanReactorMap(chk, document.getElementById("three-js"));
};

const loadReplay = async (filepath) => {
  const { headers, commands, chk } = await jssuhLoadReplay(
    filepath,
    gameOptions.bwDataPath
  );
  // const replay = fromJssuhJSON(headers, commands, chk);

  // const frameStream = await generateFrameStream(filepath);

  return await TitanReactorReplay(
    null,
    null,
    chk,
    document.getElementById("three-js")
  );
};

bootup();

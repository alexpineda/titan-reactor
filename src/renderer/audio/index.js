import * as THREE from "three";
import { handleResize } from "../utils/resize";
import { initRenderer } from "../3d-map-loading/renderer";
import { initOrbitControls } from "../camera-minimap/orbitControl";
import { loadAllTerrain } from "../3d-map-loading/generateTerrainTextures";
import { imageChk } from "../utils/loadChk";
import { gameOptions } from "../utils/gameOptions";
import { loadTerrainPreset } from "../3d-map-loading/terrainPresets";
import { PositionalAudioHelper } from "three/examples/jsm/helpers/PositionalAudioHelper";
import React from "react";
import { render } from "react-dom";
import { App } from "./ui";
import { ipcRenderer } from "electron";
import { BgMusic } from "./BgMusic";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { Vector3 } from "three";

console.log(new Date().toLocaleString());

render(<App />, document.getElementById("app"));

ipcRenderer.on("open-map", (event, [map]) => {
  console.log("open map");
  loadMap(map);
});

function createStartLocation(mapX, mapY, color) {
  var geometry = new THREE.CircleBufferGeometry(2, 32);
  var material = new THREE.MeshBasicMaterial({
    color,
  });
  var circle = new THREE.Mesh(geometry, material);
  circle.rotation.x = Math.PI / -2;
  circle.position.x = mapX;
  circle.position.z = mapY;
  circle.position.y = 0.01;
  return circle;
}

function createUnitLocation(mapX, mapY, color) {
  var geometry = new THREE.CircleBufferGeometry(1, 16);
  var material = new THREE.MeshBasicMaterial({
    color,
  });
  var circle = new THREE.Mesh(geometry, material);
  circle.rotation.x = Math.PI / -2;
  circle.position.x = mapX;
  circle.position.z = mapY;
  circle.position.y = 0.01;
  return circle;
}

const mapWidth = 128;
const mapHeight = 128;

const scene = new THREE.Scene();

// @ts-ignore
window.scene = scene;

const sceneWidth = window.innerWidth;
const sceneHeight = window.innerHeight;

let renderer = initRenderer({
  canvas: document.getElementById("three-js"),
  width: sceneWidth,
  height: sceneHeight,
  antialias: true,
  shadowMap: true,
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
window.camera = camera;
camera.position.set(13.313427680971873, 19.58336565195161, 56.716490281);
camera.rotation.set(
  -0.9353944571799614,
  0.0735893206705483,
  0.09937435112806427
);

var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const world = new THREE.Group();
const startPos = createStartLocation(-60, -60, 0xff0000);
const startPos2 = createStartLocation(60, 60, 0x0000ff);
const gridHelper = new THREE.GridHelper(128, 64);

world.add(gridHelper);
world.add(startPos);
world.add(startPos2);
scene.add(world);

const light = new THREE.DirectionalLight(0xffffff, 10);
scene.add(light);

async function loadMap(filepath) {
  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  const preset = loadTerrainPreset(chk.tilesetName);
  loadAllTerrain(chk, renderer, preset).then(([floor]) => {
    // world.remove(gridHelper);
    world.add(floor);
  });
}

const orbitControls = initOrbitControls(camera, renderer.domElement);
orbitControls.target = new Vector3();
orbitControls.update();

var audioListener = new THREE.AudioListener();
camera.add(audioListener);

var audioListener2 = new THREE.AudioListener();
camera.add(audioListener2);

var audioLoader = new THREE.AudioLoader();
// var bgMusic = new THREE.Audio(listener);

const bgMusic = new BgMusic(gameOptions.bwDataPath, audioListener);
bgMusic.setVolume(0.1);
bgMusic.playGame();
world.add(bgMusic.getAudio());

const player1Sound = new THREE.PositionalAudio(audioListener2);
audioLoader.load("./sound/misc/intonydus.wav", function (buffer) {
  player1Sound.setBuffer(buffer);
  player1Sound.setRefDistance(ctrlSound.refDistance);
  player1Sound.setRolloffFactor(ctrlSound.rolloff);
  player1Sound.setDistanceModel(ctrlSound.distanceModel);
  player1Sound.setVolume(1);
});
startPos.add(player1Sound);

const gui = new GUI();
const ctrlSound = {
  refDistance: 10,
  rolloff: 2.2,
  volume: 1,
  maxDistance: 10000,
  distanceModel: "exponential",
  bgVolume: 0.08,
};
gui
  .add(ctrlSound, "refDistance")
  .onFinishChange((v) => player1Sound.setRefDistance(v));
gui
  .add(ctrlSound, "rolloff")
  .onFinishChange((v) => player1Sound.setRolloffFactor(v));
gui.add(ctrlSound, "volume").onFinishChange((v) => player1Sound.setVolume(v));
gui.add(ctrlSound, "bgVolume").onFinishChange((v) => bgMusic.setVolume(v));
gui
  .add(ctrlSound, "distanceModel", ["linear", "inverse", "exponential"])
  .onFinishChange((v) => player1Sound.setDistanceModel(v));
gui
  .add(ctrlSound, "maxDistance")
  .onFinishChange((v) => player1Sound.setMaxDistance(v));

["linear", "inverse", "exponential"];
var helper = new PositionalAudioHelper(player1Sound, 2);
player1Sound.add(helper);

setInterval(() => player1Sound.play(), 2000);

setInterval(() => {
  // lower ref distance by scale of 4 vs camera y scale of 20
  // player1Sound.setRolloffFactor(
  //   ctrlSound.rolloff - 0.8 * (camera.position.y / 20)
  // );
  console.log(camera.position.distanceTo(orbitControls.target));
  // console.log(d.subVectors(camera.position, orbitControls.target));
}, 100);

function gameLoop() {
  requestAnimationFrame(gameLoop);

  orbitControls.update();

  renderer.clear();
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}
handleResize(camera, renderer);
requestAnimationFrame(gameLoop);

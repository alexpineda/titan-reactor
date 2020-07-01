import React from "react";
import * as THREE from "three";
import { render } from "react-dom";
import { ipcRenderer } from "electron";
import { createStats, SceneGui } from "./gui/gui";
import { handleResize } from "../utils/resize";
import { initOrbitControls } from "../camera-minimap/orbitControl";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";
import { mapElevationsCanvasTexture } from "./textures/mapElevationsCanvasTexture";

import { initRenderer } from "./renderer";
import { imageChk } from "../utils/loadChk";
import { gameOptions } from "../utils/gameOptions";
import { App } from "../ui";
import { sunlight } from "./environment/sunlight";
import { backgroundTerrainMesh } from "./meshes/backgroundTerrainMesh";
import { bgMapCanvasTexture } from "./textures/bgMapCanvasTexture";
import { mapPreviewCanvas } from "./textures/mapPreviewCanvas";

import { LoadModel } from "../utils/meshes/LoadModels";
import { Terrain } from "./Terrain";

console.log("3d-map-loading", new Date().toLocaleString());

render(<App />, document.getElementById("app"));

ipcRenderer.on("open-map", (event, [map]) => {
  console.log("open map");
  loadMap(map);
});

const renderer = initRenderer({
  width: window.innerWidth,
  height: window.innerHeight,
});

let controls = initOrbitControls(camera, renderer.domElement, false);

camera.position.set(33.63475259896081, 17.37837820247766, 40.53771830914678);

controls.update();
camera.lookAt(new THREE.Vector3());

const light = sunlight(128, 128);
scene.add(light);

document.body.appendChild(renderer.domElement);

let terrainMesh;

let currentMapFilePath;
const loadMap = async (filepath) => {
  currentMapFilePath = filepath;
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
  scene.userData.chk = chk;

  const gui = new SceneGui();
  await gui.load(chk.tilesetName);

  const control = gui.control;
  const controllers = gui.controllers;

  await mapPreviewCanvas(chk, mapPreviewEl);

  await new Promise((res, rej) => {
    mapNameEl.innerText = chk.title;
    document.title = `Titan Reactor - ${chk.title}`;
    // mapDescriptionEl.innerText = chk.description;
    mapDescriptionEl.innerText = chk.tilesetName;
    mapPreviewEl.style.display = "block";
    setTimeout(res, 100);
  });

  const bg = await bgMapCanvasTexture(chk);
  const newFloorBg = backgroundTerrainMesh(chk.size[0], chk.size[1], bg);
  newFloorBg.name = "backing-floor";

  if (terrainMesh) {
    terrainMesh.dispose();
  }

  terrainMesh = new Terrain(chk, opt);
  const newFloor = await terrainMesh.generate();

  const elevationsTexture = await mapElevationsCanvasTexture(chk);
  newFloor.userData.elevationsTexture = elevationsTexture;

  const floor = findMeshByName("floor");
  const floorBg = findMeshByName("backing-floor");
  if (floor) {
    scene.remove(floor);
  }
  if (floorBg) {
    scene.remove(floorBg);
  }
  scene.add(newFloor);
  scene.add(newFloorBg);

  // var vertexHelper = new VertexNormalsHelper(newFloor, 2, 0x00ff00, 1);
  // scene.add(vertexHelper);

  var sampler = new MeshSurfaceSampler(newFloor)
    .setWeightAttribute("uv")
    .build();

  units.children.forEach((unit) => {
    let position = new THREE.Vector3(),
      normal = new THREE.Vector3();
    sampler.sample(position, normal);
    unit.position.set(position.x, position.z, position.y);
  });

  loadOverlayEl.style.display = "none";
};

handleResize(camera, renderer);

module.hot.removeDisposeHandler(() => {});

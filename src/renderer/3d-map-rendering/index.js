import { createStats, createGui } from "./gui";
import * as THREE from "three";
import { handleResize } from "../utils/resize";
import { initOrbitControls } from "../camera-minimap/orbitControl";
import { Vector3 } from "three";
import {
  loadAllTerrain,
  mapPreviewLoader,
  displaceLoader,
  mapElevationsLoader,
  roughnessLoader,
} from "./generateTerrainTextures";
import { initRenderer } from "./renderer";
import { loadTerrainPreset } from "./terrainPresets";
import { imageChk } from "../utils/loadChk";
import { gameOptions } from "../utils/gameOptions";
import React from "react";
import { render } from "react-dom";
import { App } from "./ui";
import { sunlight } from "./sunlight";
import { ipcRenderer } from "electron";
import { terrainMesh } from "./generateTerrainMesh";

console.log("3d-map-loading", new Date().toLocaleString());

render(<App />, document.getElementById("app"));

ipcRenderer.on("open-map", (event, [map]) => {
  console.log("open map");
  loadMap(map);
});

const scene = new THREE.Scene();
window.scene = scene;

const fogColor = new THREE.Color(0x080820);
scene.background = fogColor;

scene.fog = new THREE.Fog(fogColor, 256, 512);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
window.camera = camera;

const renderer = initRenderer({
  width: window.innerWidth,
  height: window.innerHeight,
});

const findMeshByName = (name) => {
  let mesh;
  scene.traverse((o) => {
    if (o.name === name) {
      mesh = o;
      return false;
    }
  });
  return mesh;
};

const controls = initOrbitControls(camera, renderer.domElement);

camera.position.set(33.63475259896081, 17.37837820247766, 40.53771830914678);

controls.update();
camera.lookAt(new Vector3());

const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 3);
scene.add(hemi);

const light = sunlight(128, 128);
scene.add(light);

var h = new THREE.CameraHelper(light.shadow.camera);
scene.add(h);
var helper = new THREE.DirectionalLightHelper(light, 5);
scene.add(helper);

const spotlight = new THREE.SpotLight(0xffa95c, 100);
spotlight.position.y = 50;
spotlight.position.z = 80;
spotlight.castShadow = true;
spotlight.shadow.bias = -0.0001;
spotlight.shadow.mapSize.width = 1024 * 4;
spotlight.shadow.mapSize.height = 1024 * 4;

scene.add(spotlight);

var pointLight = new THREE.PointLight(0xedd89f, 1, 100);
pointLight.position.set(-64, 10, -64);
pointLight.power = 16 * Math.PI;
pointLight.decay = 2;
scene.add(pointLight);

document.body.appendChild(renderer.domElement);

const stats = createStats();

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

  await mapPreviewLoader(chk, mapPreviewEl);

  await new Promise((res, rej) => {
    mapNameEl.innerText = chk.title;
    document.title = `Titan Reactor - ${chk.title}`;
    // mapDescriptionEl.innerText = chk.description;
    mapDescriptionEl.innerText = chk.tilesetName;
    mapPreviewEl.style.display = "block";
    setTimeout(res, 100);
  });

  const preset = loadTerrainPreset(chk.tilesetName);
  const [newFloor, newFloorBg] = await loadAllTerrain(chk, renderer, preset);
  const elevationsTexture = await mapElevationsLoader(chk);

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

  newFloor.userData.originalMap = newFloor.material.map;
  newFloor.userData.elevationsTexture = elevationsTexture;
  loadOverlayEl.style.display = "none";
};

const { control } = createGui();

let f = 0;
let cycle = 0;
function animate() {
  stats.begin();

  cycle++;

  if (cycle % 10) {
    spotlight.position.set(
      camera.position.x + 10,
      camera.position.y + 10,
      spotlight.position.z
    );
    f += 0.01;
    pointLight.position.x = Math.cos(f) * 64;
    pointLight.position.z = Math.sin(f) * 64;

    spotlight.castShadow = control.spotlight.castShadow;
    spotlight.shadow.bias = control.spotlight.shadowBias;
    spotlight.decay = control.spotlight.decay;
    spotlight.distance = control.spotlight.distance;
    spotlight.penumbra = control.spotlight.penumbra;
    spotlight.power = control.spotlight.power;
    spotlight.color = new THREE.Color(
      parseInt(control.spotlight.color.substr(1), 16)
    );

    pointLight.power = control.pointlight.power;
    pointLight.color = new THREE.Color(
      parseInt(control.pointlight.color.substr(1), 16)
    );

    light.intensity = control.dirlight.power;
    light.color = new THREE.Color(
      parseInt(control.dirlight.color.substr(1), 16)
    );
    light.position.set(
      control.dirlight.x,
      control.dirlight.y,
      control.dirlight.z
    );

    hemi.intensity = control.hemilight.power;
    hemi.groundColor = new THREE.Color(
      parseInt(control.hemilight.color2.substr(1), 16)
    );
    hemi.skyColor = new THREE.Color(
      parseInt(control.hemilight.color1.substr(1), 16)
    );

    renderer.toneMappingExposure = control.renderer.toneMappingExposure;
    renderer.gammaFactor = control.renderer.gamma;
    scene.background = new THREE.Color(
      parseInt(control.renderer.fogColor.substr(1), 16)
    );
    scene.fog.color = scene.background;
    renderer.toneMapping = THREE[control.renderer.toneMapping];

    camera.fov = control.camera.fov;
    camera.zoom = control.camera.zoom;
    camera.updateProjectionMatrix();

    control.toneMappingChanged(() => {
      scene.traverse((o) => {
        if (o.type === "Mesh") {
          o.material.needsUpdate = true;
        }
      });
    });

    const floor = findMeshByName("floor");
    if (floor) {
      floor.material.wireframe = control.map.showWireframe;

      const { material } = floor;
      if (material.map) {
        if (control.displacement.showMap) {
          material.map = floor.userData.displacementMap;
        } else if (control.map.showElevations) {
          material.map = floor.userData.elevationsTexture;
        } else {
          material.map = floor.userData.originalMap;
        }
      }
    }
  }

  stats.end();
  renderer.render(scene, camera);
  setTimeout(() => requestAnimationFrame(animate), 100);
}
animate();

console.log("toneMapping", control.renderer.toneMapping);
document.getElementById("map-name").onclick = function () {
  loadMap(
    "/Users/ricardopineda/Library/Application Support/Blizzard/StarCraft/Maps/iCCup Map Pack v39.0/Observer/Blue Storm 1.2_iccOB.scx"
  );
};

control.on("displacement", async () => {
  const d = control.displacement;

  const d2 = {
    ...control.displacement,
    elevations: d.elevations.split(", ").map(Number),
    detailsRatio: d.detailsRatio.split(", ").map(Number),
    scale: d.textureScale,
  };

  const chk = await imageChk(currentMapFilePath, gameOptions.bwDataPath);
  displaceLoader(chk, renderer, d2).then((map) => {
    const floor = findMeshByName("floor");

    const newFloor = terrainMesh(
      chk.size[0],
      chk.size[1],
      floor.material.map.clone(),
      map,
      floor.material.roughnessMap.clone(),
      null,
      control.displacement.effectScale
    );

    scene.add(newFloor);

    scene.remove(floor);

    console.log("done");
  });

  console.log("on:displacement");
});

handleResize(camera, renderer);

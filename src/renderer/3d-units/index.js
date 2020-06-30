import * as THREE from "three";
import { handleResize } from "../utils/resize";
import { initRenderer } from "../3d-map-rendering/renderer";
import { initOrbitControls } from "../camera-minimap/orbitControl";
import { loadAllTerrain } from "../3d-map-rendering/generateTerrainTextures";
import { imageChk } from "../utils/loadChk";
import { gameOptions } from "../utils/gameOptions";
import { loadTerrainPreset } from "../3d-map-rendering/terrainPresets";
import React from "react";
import { render } from "react-dom";
import { App } from "./ui";
import { ipcRenderer } from "electron";
import { LoadModel } from "../meshes/LoadModels";
import { Vector3, OrthographicCamera, Object3D } from "three";
import { openFile } from "../invoke";
import { BWAPIFrameFromBuffer } from "../replay/BWAPIFrames";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { sunlight } from "../3d-map-rendering/sunlight";

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

// const camera = new THREE.OrthographicCamera(-64, 64, 64, -64, 0.01, 10000);
// camera.position.set(0, 64, 0);

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
const gridHelper = new THREE.GridHelper(128, 128, 0xff0000, 0x009900);
gridHelper.position.set(0, 6, 0);
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.5;
world.add(gridHelper);

world.add(new THREE.GridHelper(128, 64, 0x666666, 0x666666));
scene.add(world);

const light = sunlight(128, 128);
scene.add(light);

scene.add(new THREE.AmbientLight(0xaa99ff, 0.5));

// const addModelRandom = (model) => {
//   const modelParent = model;
//   // const modelParent = new THREE.Object3D();
//   // modelParent.add(model);

//   world.add(modelParent);

//   modelParent.userData.assertForge = true;
//   modelParent.position.set(
//     Math.random() * 128 - 64,
//     20,
//     Math.random() * 128 - 64
//   );

//   modelParent.userData.movement = new Vector3(
//     Math.random() * 2 - 1,
//     0,
//     Math.random() * 2 - 1
//   );
//   modelParent.userData.movement.multiplyScalar(0.1);

//   modelParent.add(new THREE.AxesHelper(5));
// };
let unitsParent = new THREE.Object3D();
world.add(unitsParent);
const spawnUnitMesh = (frameData) => {
  // if (
  //   [0x7, 0x40, 0x6d, 0x9c, 0x9a, 0x6a, 0x6f, 0xa0].includes(
  //     frameData.typeId
  //   ) === false
  // ) {
  //   debugger;
  // }

  const prefab = prefabs[frameData.typeId] || prefabs[999];
  const model = prefab.clone();
  model.add(new THREE.AxesHelper(2));
  model.userData.frameData = frameData;
  unitsParent.add(model);
  return model;
};

window.angleAdd = 0;
window.angleMult = 1;

const updateUnitMesh = (model, frameData) => {
  model.position.set(
    frameData.x / 32 - 64,
    getTerrainY(model.position),
    frameData.y / 32 - 64
  );

  model.rotation.y = frameData.angle * window.angleMult + window.angleAdd;
  model.userData.movement = new Vector3();
  model.userData.nextPosition = new Vector3();
  model.userData.nextPosition.copy(model.position);
  model.userData.typeId = frameData.typeId;
  model.userData.hp = frameData.hp;
  model.userData.shields = frameData.shields;
  model.userData.energy = frameData.energy;
};

const prefabs = {
  999: new THREE.Mesh(
    new THREE.SphereBufferGeometry(1),
    new THREE.MeshStandardMaterial({ color: 0x999999 })
  ),
};

prefabs[999].castShadow = true;
prefabs[999].receiveShadow = true;

const loadModel = new LoadModel();
const assignModel = (id) => (model) => (prefabs[id] = model);

loadModel.load(`_alex/scvm.glb`).then(assignModel(0x7));
loadModel.load(`_alex/probe.glb`).then(assignModel(0x40));
loadModel.load(`_alex/supply.glb`).then(assignModel(0x6d));
loadModel.load(`_alex/pylon.glb`).then(assignModel(0x9c));
loadModel.load(`_alex/nexus.glb`).then(assignModel(0x9a));
loadModel.load(`_alex/command-center.glb`).then(assignModel(0x6a));
loadModel.load(`_alex/refinery.glb`).then(assignModel(0x6e));
loadModel.load(`_alex/barracks.glb`).then(assignModel(0x6f));
loadModel.load(`_alex/assimilator.glb`).then(assignModel(0x9d));
loadModel.load(`_alex/gateway.glb`).then(assignModel(0xa0));
loadModel.load(`_alex/dropshiplarge.glb`).then(assignModel(0xb));

let displacement = null;
let worldFloor = null;

let BWAPIFramesDataView = null;

openFile("./bwdata/_alex/drop.rep.bin").then((frames) => {
  BWAPIFramesDataView = new DataView(frames.buffer);
});

async function loadMap(filepath) {
  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  const preset = loadTerrainPreset(chk.tilesetName);
  loadAllTerrain(chk, renderer, preset).then(([floor]) => {
    world.add(floor);
    worldFloor = floor;

    // const image = floor.material.displacementMap.image
    //   .getContext("2d")
    //   .getImageData(
    //     0,
    //     0,
    //     floor.material.displacementMap.image.width,
    //     floor.material.displacementMap.image.height
    //   );

    // window.displacement = displacement = {
    //   image,
    //   scale: floor.material.displacementScale,
    // };
  });
}

const orbitControls = initOrbitControls(camera, renderer.domElement, false);
orbitControls.update();

let worldFrame = 0;
let BWAPIFrame = 0;
let numSkipGameFrames = 1;
let gameFrame = 0;
let unitMeshes = {};

const physicsFrameSkip = 20;

let paused = false;
console.log(paused ? "PAUSED" : "NOT PAUSED");

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyP") {
    paused = !paused;
    console.log("BWAPIFrame", gameFrame);
  }

  if (e.code === "KeyG") {
    gridHelper.visible = !gridHelper.visible;
  }

  if (e.code === "KeyR") {
    gameFrame = 0;
    BWAPIFrame = 0;
    unitsParent.children.forEach((c) => {
      c.material.map.dispose();
      c.material.dispose();
      c.geometry.dispose();
      c.dispose();
    });
    unitsParent.dispose();
    unitsParent = new Object3D();
    unitMeshes = {};
  }
});

document.addEventListener("mousedown", (event) => {
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(unitsParent.children);
  intersects.forEach(({ object }) => {
    console.log("intersect", object, object.typeId);
    if (object.typeId) {
      console.log(object.typeId);
    }
  });
});

const stats = new Stats();
document.body.appendChild(stats.dom);

function gameLoop() {
  worldFrame++;
  //#region BWAPIFrames interpretation
  if (BWAPIFramesDataView && worldFrame % 10 === 0 && !paused) {
    for (let gf = 0; gf < numSkipGameFrames; gf++) {
      while (true) {
        const frameData = BWAPIFrameFromBuffer(BWAPIFramesDataView, BWAPIFrame);

        if (frameData) {
          const { repId } = frameData;
          if (!unitMeshes[repId]) {
            unitMeshes[repId] = spawnUnitMesh(frameData);
          }
          updateUnitMesh(unitMeshes[repId], frameData);

          BWAPIFrame = BWAPIFrame + 1;
          if (gameFrame != frameData.frame) {
            gameFrame = frameData.frame;
            break;
          }
        } else {
          BWAPIFrame = 0;
          gameFrame = 0;
          break;
        }
      }
    }
  }
  //#endregion

  //#region physics & movement
  if (world) {
    unitsParent.children
      .filter((model) => model.userData.typeId)
      .forEach((model) => {
        // model.rotation.y += 0.01;

        model.rotation.y =
          model.userData.frameData.angle * window.angleMult + window.angleAdd;

        if (worldFloor && worldFrame % physicsFrameSkip === 0 && false) {
          if (model.position.x > 64 || model.position.x < -64) {
            model.userData.movement = new Vector3(
              model.userData.movement.x * -1,
              0,
              model.userData.movement.z
            );
          } else if (model.position.z < -64 || model.position.z > 64) {
            model.userData.movement = new Vector3(
              model.userData.movement.x,
              0,
              model.userData.movement.z * -1
            );
          }

          model.userData.nextPosition = new Vector3(
            model.position.x,
            model.position.y,
            model.position.z
          );
          const movement = new Vector3(
            model.userData.movement.x,
            model.userData.movement.y,
            model.userData.movement.z
          );
          movement.multiplyScalar(physicsFrameSkip);
          model.userData.nextPosition.add(movement);

          model.userData.startPosition = model.position.clone();
          model.userData.nextPosition = new Vector3(
            model.userData.nextPosition.x,
            (model.userData.nextPosition.y = d),
            model.userData.nextPosition.z
          );
        } else if (worldFloor && false) {
          if (model.userData.nextPosition) {
            model.position.lerpVectors(
              model.userData.startPosition,
              model.userData.nextPosition,
              (worldFrame % physicsFrameSkip) / physicsFrameSkip
            );
          }
        }

        // displacement = {
        //   image: floor.material.displacementMap.image
        //     .getContext("2d")
        //     .getImageData(0, 0, disp.width, disp.height),
        //   width: disp.width,
        //   scale: floor.material.displacementScale,
        // };

        // if (worldFloor && worldFrame % 50 === 0) {
        //   const testPoint = new Vector3();
        //   const raycaster = new THREE.Raycaster(
        //     testPoint.addVectors(model.position, new Vector3(0, 20, 0)),
        //     new Vector3(0, -1, 0)
        //   );
        //   const result = raycaster.intersectObject(worldFloor, false);
        //   if (result && result.length) {
        //     const point = result[0].point;
        //     model.position.copy(point.add);
        //   }
        // }
      });
    //#endregion
  }
  renderer.clear();
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  stats.update();
  requestAnimationFrame(gameLoop);
}
handleResize(camera, renderer);
requestAnimationFrame(gameLoop);

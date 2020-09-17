import * as THREE from "three";
import { initRenderer } from "../3d-map-rendering/renderer";
import { initCamera } from "../camera-minimap/camera";
import { handleResize } from "../utils/resize";
import { sunlight, fog } from "../3d-map-rendering/environment";
import { backgroundTerrainMesh } from "../3d-map-rendering/meshes/backgroundTerrainMesh";
import { bgMapCanvasTexture } from "../3d-map-rendering/textures/bgMapCanvasTexture";
import { Terrain } from "../3d-map-rendering/Terrain";
import { BWAPIFrameFromBuffer } from "./BWAPIFrames";
import { ReplayUnits3D } from "./ReplayUnits3D";
import { ReplayUnits2D } from "./ReplayUnits2D";
import { getTerrainY } from "../3d-map-rendering/displacementGeometry";
import { disposeMeshes } from "../utils/meshes/dispose";
//todo refactor out
import { openFile } from "../invoke";

export async function TitanReactorReplay(chk, canvas, bwDat, loaded) {
  const gameId = Math.random();
  console.log("replay game id", gameId);
  const scene = new THREE.Scene();

  let running = false;
  THREE.DefaultLoadingManager.onLoad = () => {
    console.log("loaded");
    loaded();
    running = true;
  };

  const sceneWidth = window.innerWidth;
  const sceneHeight = window.innerHeight;
  window.angleAdd = 0;
  window.angleMult = 1;

  const renderer = initRenderer({
    canvas,
    width: sceneWidth,
    height: sceneHeight,
    antialias: true,
    shadowMap: true,
  });

  const [camera, cameraControls] = initCamera(renderer.domElement);

  var axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const gridHelper = new THREE.GridHelper(128, 128, 0xff0000, 0x009900);
  gridHelper.position.set(0, 6, 0);
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.5;
  gridHelper.visible = false;
  scene.add(gridHelper);

  const light = sunlight(chk.size[0], chk.size[1]);
  scene.add(light);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 12);
  scene.add(hemi);

  const terrainMesh = new Terrain(chk);
  const terrain = await terrainMesh.generate();
  const bg = await bgMapCanvasTexture(chk);
  const bgTerrain = backgroundTerrainMesh(chk.size[0], chk.size[1], bg);

  scene.add(terrain);
  scene.add(bgTerrain);

  scene.fog = fog(chk.size[0], chk.size[1]);
  scene.background = scene.fog.color;

  const terrainY = getTerrainY(
    terrain.userData.displacementMap.image
      .getContext("2d")
      .getImageData(
        0,
        0,
        terrain.userData.displacementMap.image.width,
        terrain.userData.displacementMap.image.height
      ),
    terrain.userData.displacementScale,
    chk.size[0],
    chk.size[1]
  );

  const units = new ReplayUnits2D(bwDat, terrainY, openFile);
  scene.add(units.units);

  const cancelResize = handleResize(camera, renderer);

  let BWAPIFramesDataView = null;

  const tempReplayFile = "./bwdata/_alex/0006 ramiyerP ScanKaLT.rep.bin";

  THREE.DefaultLoadingManager.itemStart(tempReplayFile);
  openFile(tempReplayFile).then((frames) => {
    BWAPIFramesDataView = new DataView(frames.buffer);
    THREE.DefaultLoadingManager.itemEnd(tempReplayFile);
  });

  let requestAnimationFrameId = null;

  let worldFrame = 0;
  let BWAPIFrame = 0;
  let numSkipGameFrames = 10;
  let gameFrame = 0;
  const physicsFrameSkip = 20;

  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyP") {
      running = !running;
      console.log("BWAPIFrame", gameFrame);
    }

    if (e.code === "KeyG") {
      gridHelper.visible = !gridHelper.visible;
    }

    if (e.code === "KeyS") {
      if (numSkipGameFrames === 10) {
        numSkipGameFrames = 1;
      } else {
        numSkipGameFrames = 10;
      }
    }

    if (e.code === "KeyR") {
      gameFrame = 0;
      BWAPIFrame = 0;
      units.dispose();
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
    const intersects = raycaster.intersectObjects(units.getUnits(), true);
    const getAsUnit = (mesh) => {
      if (!mesh) return null;
      if (mesh.userData && mesh.userData.typeId) {
        return mesh;
      } else {
        return getAsUnit(mesh.parent);
      }
    };

    if (intersects[0]) {
      const unit = getAsUnit(intersects[0].object);

      if (unit) {
        console.log(unit);
        // var geometry = new THREE.CircleGeometry(1, 8);
        // var material = new THREE.MeshBasicMaterial({
        //   color: new THREE.Color("0xffff00"),
        // });
        // var circle = new THREE.Mesh(geometry, material);
        // circle.rotation.x = Math.PI / -2;
        // circle.name = "Selection";
        // unit.add(circle);
      }
    }
  });

  function gameLoop() {
    worldFrame++;

    units.cameraUpdate(camera, cameraControls);

    //#region BWAPIFrames interpretation
    if (running && BWAPIFramesDataView) {
      // if (BWAPIFramesDataView) {
      for (let gf = 0; gf < numSkipGameFrames; gf++) {
        while (true) {
          const frameData = BWAPIFrameFromBuffer(
            BWAPIFramesDataView,
            BWAPIFrame
          );

          if (frameData) {
            const unit = units.spawnIfNotExists(frameData);
            units.update(unit, frameData);

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
        // units.units.updateMatrixWorld(true);
      }
      // units.clear(BWAPIFrame);
    }
    //#endregion

    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    setTimeout(() => {
      requestAnimationFrameId = requestAnimationFrame(gameLoop);
    }, 10);
  }

  gameLoop();
  return {
    dispose: () => {
      running = false;
      cancelAnimationFrame(requestAnimationFrameId);
      //dispose all
      cancelResize();
      disposeMeshes(scene);
      //textures

      //materials

      //geometries

      //scene dispose
    },
  };
}

import * as THREE from "three";
import { initRenderer } from "../3d-map-rendering/renderer";
import { initCamera } from "../camera-minimap/camera";
import { handleResize } from "../utils/resize";
import { sunlight } from "../3d-map-rendering/environment";
import { backgroundTerrainMesh } from "../3d-map-rendering/meshes/backgroundTerrainMesh";
import { bgMapCanvasTexture } from "../3d-map-rendering/textures/bgMapCanvasTexture";
import { Terrain } from "../3d-map-rendering/Terrain";
import { BWAPIFrameFromBuffer } from "./BWAPIFrames";
import { ReplayUnits3D } from "./ReplayUnits3D";
import { Units2D } from "./ReplayUnits2D";
import { getTerrainY } from "../3d-map-rendering/displacementGeometry";
import { disposeMeshes } from "../utils/meshes/dispose";
//todo refactor out
import { openFile } from "../invoke";

export async function TitanReactorReplay(chk, canvas, loaded) {
  const scene = new THREE.Scene();

  let running = false;
  THREE.DefaultLoadingManager.onLoad = () => {
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
  scene.add(gridHelper);

  const light = sunlight(chk.size[0], chk.size[1]);
  scene.add(light);

  const terrainMesh = new Terrain(chk);
  const terrain = await terrainMesh.generate();
  const bg = await bgMapCanvasTexture(chk);
  const bgTerrain = backgroundTerrainMesh(chk.size[0], chk.size[1], bg);

  scene.add(terrain);
  scene.add(bgTerrain);

  const terrainY = getTerrainY(
    terrain.userData.displacementMap.image.getContext("2d"),
    terrain.userData.displacementScale,
    chk.size[0],
    chk.size[1]
  );

  const units = new ReplayUnits3D(terrainY);
  scene.add(units.units);

  const cancelResize = handleResize(camera, renderer);

  let BWAPIFramesDataView = null;

  THREE.DefaultLoadingManager.itemStart("./bwdata/_alex/drop.rep.bin");
  openFile("./bwdata/_alex/drop.rep.bin").then((frames) => {
    BWAPIFramesDataView = new DataView(frames.buffer);
    THREE.DefaultLoadingManager.itemEnd("./bwdata/_alex/drop.rep.bin");
  });

  let requestAnimationFrameId = null;

  let worldFrame = 0;
  let BWAPIFrame = 0;
  let numSkipGameFrames = 10;
  let gameFrame = 0;
  const physicsFrameSkip = 20;

  console.log(running ? "NOT PAUSED" : "PAUSED");

  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyP") {
      running = !running;
      console.log("BWAPIFrame", gameFrame);
    }

    if (e.code === "KeyG") {
      gridHelper.visible = !gridHelper.visible;
    }

    if (e.code === "KeyR") {
      gameFrame = 0;
      BWAPIFrame = 0;
      units.dispose();
    }
  });

  //todo make item select work!
  document.addEventListener("mousedown", (event) => {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(units.getUnits());
    intersects.forEach(({ object }) => {
      console.log("intersect", object, object.typeId);
      if (object.typeId) {
        console.log(object.typeId);
      }
    });
  });

  function gameLoop() {
    if (!running) {
      setTimeout(() => {
        requestAnimationFrameId = requestAnimationFrame(gameLoop);
      }, 100);
      return;
    }

    worldFrame++;

    units.cameraUpdate(camera, cameraControls);

    //#region BWAPIFrames interpretation
    if (BWAPIFramesDataView && worldFrame % 10 === 0) {
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
    }
    //#endregion

    //#region lepring movement and adjusting position according to terrain
    units.getUnits().forEach((model) => {
      if (worldFrame % physicsFrameSkip === 0 && false) {
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
      } else if (false) {
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

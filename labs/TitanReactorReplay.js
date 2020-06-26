import * as THREE from "three";
import { initRenderer } from "./3d-map-loading/renderer";
import { Vector3, OrthographicCamera, CameraHelper } from "three";
import { Minimap } from "./camera-minimap/Minimap";
import { initOrbitControls } from "./camera-minimap/orbitControl";
import { loadAllTerrain } from "./3d-map-loading/generateTerrainTextures";
import { loadTerrainPreset } from "./3d-map-loading/terrainPresets";
import { createMiniMapPlane } from "./meshes/BasicObjects";
import { LAYER_MINIMAP } from "./scene/Layers";
import { handleResize } from "./utils/resize";

export async function TitanReactorReplay(replay, frameStream, chk, canvas) {
  const scene = new THREE.Scene();

  const sceneWidth = window.innerWidth;
  const sceneHeight = window.innerHeight;
  const mapWidth = chk.size[0];
  const mapHeight = chk.size[1];

  const renderer = initRenderer({
    canvas,
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
  camera.position.set(13.313427680971873, 19.58336565195161, 56.716490281);
  camera.rotation.set(
    -0.9353944571799614,
    0.0735893206705483,
    0.09937435112806427
  );
  camera.lookAt(new THREE.Vector3());

  const minimapCamera = new OrthographicCamera(
    -mapWidth / 2,
    mapWidth / 2,
    mapHeight / 2,
    -mapHeight / 2,
    1,
    500
  );
  minimapCamera.position.set(0, 12, 0);
  minimapCamera.lookAt(new Vector3());
  minimapCamera.layers.set(LAYER_MINIMAP);

  var axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const world = new THREE.Group();
  const miniMapPlane = createMiniMapPlane(128, 128, null);
  miniMapPlane.layers.set(LAYER_MINIMAP);
  const gridHelper = new THREE.GridHelper(128, 64);

  world.add(gridHelper);
  world.add(miniMapPlane);
  scene.add(world);

  const light = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(light);

  const preset = loadTerrainPreset(chk.tilesetName);
  loadAllTerrain(chk, renderer, preset).then(([floor]) => {
    world.remove(gridHelper);
    world.add(floor);
    miniMapPlane.material.map = floor.material.map;
    miniMapPlane.material.needsUpdate = true;
  });

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  orbitControls.update();

  const cameraHelper = new THREE.CameraHelper(camera);
  cameraHelper.layers.set(LAYER_MINIMAP);
  scene.add(cameraHelper);

  const updateGlobalCamera = (pos) => {
    camera.position.set(pos.x, 10, pos.z + 10);
    orbitControls.target.copy(pos);
  };

  const updateMouseHover = (pos) => {
    cameraHelper.position.set(pos.x, 10, pos.z + 10);
    cameraHelper.lookAt(pos);
  };

  const minimap = new Minimap(
    document.getElementById("minimap"),
    mapWidth,
    mapHeight,
    updateGlobalCamera,
    updateMouseHover
  );

  const cancelResize = handleResize(camera, renderer);
  const m = Math.max(mapWidth, mapHeight);
  const r = mapWidth / m;

  let running = true;
  let id = null;
  function gameLoop() {
    if (!running) return;
    orbitControls.update();

    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.setViewport(0, 0, 300 * r, (300 * mapHeight) / mapWidth / r);
    renderer.render(scene, minimapCamera);

    setTimeout(() => {
      id = requestAnimationFrame(gameLoop);
    }, 100);
  }

  gameLoop();
  return {
    dispose: () => {
      running = false;
      cancelAnimationFrame(id);
      //dispose all
      minimapCamera.dispose();
      minimap.dispose();
      cancelResize();

      //textures

      //materials

      //geometries

      //scene dispose
    },
  };
}

import * as THREE from "three";
import { initRenderer } from "./3d-map-loading/renderer";
import { initOrbitControls } from "./camera-minimap/orbitControl";
import { loadAllTerrain } from "./3d-map-loading/generateTerrainTextures";
import { loadTerrainPreset } from "./3d-map-loading/terrainPresets";
import { handleResize } from "./utils/resize";
import { LoadModel } from "./meshes/LoadModels";

export async function TitanReactorMap(chk, canvas) {
  console.log("haaaaalp");
  const scene = new THREE.Scene();

  const sceneWidth = window.innerWidth;
  const sceneHeight = window.innerHeight;

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

  var axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const world = new THREE.Group();
  const gridHelper = new THREE.GridHelper(128, 64);

  world.add(gridHelper);
  scene.add(world);

  const light = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(light);

  const preset = loadTerrainPreset(chk.tilesetName);
  const [floor, bgFloor] = await loadAllTerrain(chk, renderer, preset);

  world.remove(gridHelper);
  world.add(floor);
  world.add(bgFloor);

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  orbitControls.update();

  const cancelResize = handleResize(camera, renderer);

  const loadModel = new LoadModel();
  const scv = await loadModel.load(`${__static}/modifiedscv.glb`);
  scene.add(scv);

  let running = true;
  let id = null;
  function gameLoop() {
    if (!running) return;
    orbitControls.update();

    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

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
      cancelResize();

      //textures

      //materials

      //geometries

      //scene dispose
    },
  };
}

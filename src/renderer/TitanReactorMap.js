import * as THREE from "three";
import { initRenderer } from "./3d-map-rendering/renderer";
import { initCamera } from "./camera-minimap/camera";
import { handleResize } from "./utils/resize";
import { sunlight } from "./3d-map-rendering/environment";
import { backgroundTerrainMesh } from "./3d-map-rendering/meshes/backgroundTerrainMesh";
import { bgMapCanvasTexture } from "./3d-map-rendering/textures/bgMapCanvasTexture";
import { Terrain } from "./3d-map-rendering/Terrain";

export async function TitanReactorMap(chk, canvas, loaded) {
  const scene = new THREE.Scene();

  THREE.DefaultLoadingManager.onLoad = () => loaded();

  const sceneWidth = window.innerWidth;
  const sceneHeight = window.innerHeight;

  const renderer = initRenderer({
    canvas,
    width: sceneWidth,
    height: sceneHeight,
    antialias: true,
    shadowMap: true,
  });

  const [camera, orbitControls] = initCamera(renderer.domElement);

  var axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const world = new THREE.Group();
  const gridHelper = new THREE.GridHelper(128, 64);

  world.add(gridHelper);
  scene.add(world);

  const light = sunlight(chk.size[0], chk.size[1]);
  scene.add(light);

  const terrainMesh = new Terrain(chk);
  const terrain = await terrainMesh.generate();
  const bg = await bgMapCanvasTexture(chk);
  const bgTerrain = backgroundTerrainMesh(chk.size[0], chk.size[1], bg);

  world.remove(gridHelper);
  world.add(terrain);
  world.add(bgTerrain);

  const cancelResize = handleResize(camera, renderer);

  let running = true;
  let id = null;
  function gameLoop() {
    if (!running) return;

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

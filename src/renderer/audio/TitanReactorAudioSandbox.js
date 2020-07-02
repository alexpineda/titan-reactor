import * as THREE from "three";
import { initRenderer } from "../3d-map-rendering/renderer";
import { initCamera } from "../camera-minimap/camera";
import { handleResize } from "../utils/resize";
import { sunlight } from "../3d-map-rendering/environment";
import { BgMusic } from "./BgMusic";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { PositionalAudioHelper } from "three/examples/jsm/helpers/PositionalAudioHelper";

export async function TitanReactorAudioSandbox(chk, canvas, loaded) {
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

  const [camera, cameraControls] = initCamera(renderer.domElement);

  scene.add(new THREE.GridHelper(128, 64));
  scene.add(sunlight(chk.size[0], chk.size[1]));

  const dummyUnit = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshBasicMaterial({ color: 0xcc99aa })
  );
  dummyUnit.position.set(-60, 5, -60);
  scene.add(dummyUnit);

  const cancelResize = handleResize(camera, renderer);

  const audioListener = new THREE.AudioListener();
  camera.add(audioListener);

  const audioListener2 = new THREE.AudioListener();
  camera.add(audioListener2);

  const audioLoader = new THREE.AudioLoader();

  const bgMusic = new BgMusic(audioListener);
  bgMusic.setVolume(0.1);
  bgMusic.playGame();
  scene.add(bgMusic.getAudio());

  const unitSound = new THREE.PositionalAudio(audioListener);
  audioLoader.load("./sound/misc/intonydus.wav", function (buffer) {
    unitSound.setBuffer(buffer);
    unitSound.setRefDistance(ctrlSound.refDistance);
    unitSound.setRolloffFactor(ctrlSound.rolloff);
    unitSound.setDistanceModel(ctrlSound.distanceModel);
    unitSound.setVolume(1);
  });
  dummyUnit.add(unitSound);

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
    .onFinishChange((v) => unitSound.setRefDistance(v));
  gui
    .add(ctrlSound, "rolloff")
    .onFinishChange((v) => unitSound.setRolloffFactor(v));
  gui.add(ctrlSound, "volume").onFinishChange((v) => unitSound.setVolume(v));
  gui.add(ctrlSound, "bgVolume").onFinishChange((v) => bgMusic.setVolume(v));
  gui
    .add(ctrlSound, "distanceModel", ["linear", "inverse", "exponential"])
    .onFinishChange((v) => unitSound.setDistanceModel(v));
  gui
    .add(ctrlSound, "maxDistance")
    .onFinishChange((v) => unitSound.setMaxDistance(v));

  ["linear", "inverse", "exponential"];
  var helper = new PositionalAudioHelper(unitSound, 2);
  unitSound.add(helper);

  setInterval(() => unitSound.play(), 2000);

  let running = true;
  let id = null;
  function gameLoop() {
    if (!running) return;
    cameraControls.update();

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

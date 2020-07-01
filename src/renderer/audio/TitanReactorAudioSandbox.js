import * as THREE from "three";
import { initRenderer } from "../3d-map-rendering/renderer";
import { initOrbitControls } from "../camera-minimap/orbitControl";
import { handleResize } from "../utils/resize";
import { sunlight } from "../3d-map-rendering/environment/sunlight";
import { BgMusic } from "./BgMusic";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { PositionalAudioHelper } from "three/examples/jsm/helpers/PositionalAudioHelper";

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

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const world = new THREE.Group();
  const startPos = createStartLocation(-60, -60, 0xff0000);
  const startPos2 = createStartLocation(60, 60, 0x0000ff);
  const gridHelper = new THREE.GridHelper(128, 64);

  world.add(gridHelper);
  scene.add(world);
  world.add(startPos);
  world.add(startPos2);

  const light = sunlight(chk.size[0], chk.size[1]);
  scene.add(light);

  const orbitControls = initOrbitControls(camera, renderer.domElement, true);
  orbitControls.update();

  const cancelResize = handleResize(camera, renderer);

  var audioListener = new THREE.AudioListener();
  camera.add(audioListener);

  var audioListener2 = new THREE.AudioListener();
  camera.add(audioListener2);

  var audioLoader = new THREE.AudioLoader();
  // var bgMusic = new THREE.Audio(listener);

  const bgMusic = new BgMusic(audioListener);
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

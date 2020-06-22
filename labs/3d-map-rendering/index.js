import { createStats, createGui } from "./gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { DotScreenShader } from "three/examples/jsm/shaders/DotScreenShader.js";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

import { Vector3 } from "three";
import { loadAllTerrain } from "./loadTerrain";

console.log(new Date().toLocaleString());
const fs = window.require("fs");

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

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.Uncharted2ToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.gammaFactor = 2.2;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

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

const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(33.63475259896081, 17.37837820247766, 40.53771830914678);

controls.update();
camera.lookAt(new Vector3());

const hemi = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1);
scene.add(hemi);

const spotlight = new THREE.SpotLight(0xffa95c, 2);
// spotlight.position.y = 50;
// spotlight.position.z = 80;
spotlight.castShadow = true;
spotlight.shadow.bias = -0.0001;
spotlight.shadow.mapSize.width = 1024 * 4;
spotlight.shadow.mapSize.height = 1024 * 4;
spotlight.decay = 2;
spotlight.distance = 1000;
spotlight.penumbra = 0.2;

scene.add(spotlight);

var pointLight = new THREE.PointLight(0xedd89f, 1, 100);
pointLight.position.set(-64, 10, -64);
pointLight.power = 8 * Math.PI;
scene.add(pointLight);

document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

(function () {
  const effect = new ShaderPass(DotScreenShader);
  effect.uniforms["scale"].value = 4;
  composer.addPass(effect);
})();

(function () {
  const effect = new ShaderPass(RGBShiftShader);
  effect.uniforms["amount"].value = 0.0015;
  composer.addPass(effect);
})();

const control = createGui();
const stats = createStats();

control.on("map:reload", (map) => {
  loadAllTerrain(map).then(([newFloor, newFloorBg]) => {
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
  });
});

let f = 0;
function animate() {
  stats.begin();
  //   plane.rotation.z += 0.0005;
  spotlight.position.set(
    camera.position.x + 10,
    camera.position.y + 10,
    spotlight.position.z
  );
  f += 0.01;
  pointLight.position.x = Math.cos(f) * 64;
  pointLight.position.z = Math.sin(f) * 64;

  controls.update();
  stats.end();
  renderer.render(scene, camera);
  //   composer.render();
  requestAnimationFrame(animate);
}
animate();

control.on("scene:save", (map) => {
  var exporter = new GLTFExporter();
  exporter.parse(
    scene,
    function (gltf) {
      fs.writeFile("./scene.glb", gltf, () => {});
    },
    {
      binary: true,
    }
  );
});

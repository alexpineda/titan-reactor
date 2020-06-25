import { createStats, createGui } from "./gui";
import * as THREE from "three";
import { initOrbitControls } from "../camera-minimap/orbitControl";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { DotScreenShader } from "three/examples/jsm/shaders/DotScreenShader.js";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

import { Vector3 } from "three";
import { loadAllTerrain, mapPreviewLoader } from "./generateTerrainTextures";
import { initRenderer } from "./renderer";

const fs = window.require("fs");
const { ipcRenderer } = window.require("electron");

console.log(new Date().toLocaleString());

ipcRenderer.on("open-map", (event, [map]) => {
  loadMap(map);
});

ipcRenderer.on("save-image", (event) => {
  var strMime = "image/jpeg";
  const data = renderer.domElement.toDataURL(strMime);

  var saveFile = function (strData, filename) {
    var link = document.createElement("a");
    link.download = "Screenshot";
    link.href = strData;
    link.click();
  };
  saveFile(data);
});
ipcRenderer.on("save-gltf", (event, file) => {
  // Instantiate a exporter
  var exporter = new GLTFExporter();

  // Parse the input and generate the glTF output
  console.log("export scene", file, scene);
  exporter.parse(
    scene,
    function (gltf) {
      fs.writeFile(file, gltf, () => {});
    },
    {}
  );
});

var starcraftFont = new FontFace(
  "Blizzard Regular",
  "url(BLIZZARD-REGULAR.TTF)"
  // "url(./bwdata/font/BLIZZARD-REGULAR.TTF)"
);
starcraftFont.load().then(function (loaded_face) {
  document.fonts.add(loaded_face);
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

// const hemi = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1);
// scene.add(hemi);

const light = new THREE.DirectionalLight(0xffffff, 8);
// light.castShadow = true;
light.name = "directional";
scene.add(light);

const spotlight = new THREE.SpotLight(0xffa95c, 100);
spotlight.position.y = 50;
spotlight.position.z = 80;
spotlight.castShadow = true;
spotlight.shadow.bias = -0.0001;
spotlight.shadow.mapSize.width = 1024 * 4;
spotlight.shadow.mapSize.height = 1024 * 4;
spotlight.decay = 2;
spotlight.distance = 10;
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
console.log("creategui", control);
const stats = createStats();

const loadMap = (filepath) => {
  console.log("load map", filepath);
  const mapPreviewEl = document.getElementById("map--preview-canvas");
  const mapNameEl = document.getElementById("map-name");
  const mapDescriptionEl = document.getElementById("map-description");
  const loadOverlayEl = document.getElementById("load-overlay");

  // hide loading ui elements
  mapNameEl.innerText = "initializing...";
  mapDescriptionEl.innerText = "";
  mapPreviewEl.style.display = "none";
  loadOverlayEl.style.display = "flex";

  mapPreviewLoader(filepath, mapPreviewEl)
    .then(({ chk }) => {
      console.log("mapPreviewLoader:completed", chk);
      mapNameEl.innerText = chk.title;
      mapDescriptionEl.innerText = chk.description;
      mapPreviewEl.style.display = "block";
    })
    .then(() => loadAllTerrain(filepath, renderer))
    .then(([newFloor, newFloorBg]) => {
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
      loadOverlayEl.style.display = "none";
    });
};

control.on("map:reload", loadMap);

let f = 0;
let res = 0;
function animate() {
  stats.begin();
  //   plane.rotation.z += 0.0005;
  res++;
  if (res % 10) {
    spotlight.position.set(
      camera.position.x + 10,
      camera.position.y + 10,
      spotlight.position.z
    );
    f += 0.01;
    pointLight.position.x = Math.cos(f) * 64;
    pointLight.position.z = Math.sin(f) * 64;
  }

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

loadMap(
  "/Users/ricardopineda/Library/Application Support/Blizzard/StarCraft/Maps/iCCup Map Pack v39.0/Observer/Blue Storm 1.2_iccOB.scx"
);

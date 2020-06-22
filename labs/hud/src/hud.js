import * as THREE from "three";
import React from "react";
import { render } from "react-dom";

import { handleResize } from "../../utils/resize";

import ResourcesHUD from "./resources";
import ProductionHUD from "./production";
import ReplayHUD from "./replay";

console.log("lab:hud", new Date().toLocaleString());

const scene = new THREE.Scene();

// @ts-ignore
window.scene = scene;

let renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("three-js"),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 10);
var cameraHelper = new THREE.CameraHelper(camera);
scene.add(cameraHelper);

const mapMesh = (function () {
  const geo = new THREE.PlaneGeometry(10, 10, 10, 10);
  const mat = new THREE.MeshBasicMaterial({
    color: "#e4b4b4",
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotateX(-Math.PI / 2);
  return mesh;
})();

scene.add(mapMesh);

function gameLoop() {
  mapMesh.rotation.z += 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}
handleResize(camera, renderer);
window.document.body.appendChild(renderer.domElement);
requestAnimationFrame(gameLoop);

// render(<MiniPlayerHUD />, document.getElementById("minimap-players"))

const players = [
  { name: "Dark", race: "terran", minerals: 55, gas: 100, apm: 250 },
  { name: "Snipe", race: "protoss", minerals: 88, gas: 120, apm: 140 },
];
render(
  <ResourcesHUD players={players} />,
  document.getElementById("resources")
);

const production = [
  {
    name: "Marine",
    progress: 20,
    icon: "🧨",
  },
];
render(
  <ProductionHUD production={production} />,
  document.getElementById("production")
);

const replay = [
  {
    progress: 0,
    userSetSpeed: "Normal",
    speed: "Fastest",
    cinematic: false,
    followPlayer: null,
    skipSlowParts: 0, //0-10 ramp modes
  },
];
render(<ReplayHUD replay={replay} />, document.getElementById("replay"));

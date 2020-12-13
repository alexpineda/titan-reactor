import * as THREE from "three";
import React from "react";
import { render, createPortal } from "react-dom";
import MinimapControl from "../MinimapControl";
import RenderMan from "../../render/RenderMan";
import CanvasTarget from "../../render/CanvasTarget";
import Cameras from "../../camera/Cameras";
import { MinimapLayer } from "../Layers";
import KeyboardShortcuts from "../../input/KeyboardShortcuts";

import { Color } from "three";
import { WrappedCanvas } from "../../react-ui/WrappedCanvas";

if (window.location.search.includes("producer")) {
  return;
}

const mapWidth = 256;
const mapHeight = 128;

const gameSurface = new CanvasTarget({ position: "absolute", zIndex: "-10" });
gameSurface.setDimensions(
  Math.floor(window.innerWidth * 0.5),
  Math.floor(window.innerHeight * 0.5)
);
document.body.appendChild(gameSurface.canvas);

const minimapSurface = new CanvasTarget();
minimapSurface.setDimensions(
  Math.floor(window.innerHeight / 30),
  Math.floor(window.innerHeight / 30)
);
document.body.appendChild(minimapSurface.canvas);

const previewSurface = new CanvasTarget();

const producerWindow = window.open(
  "http://localhost:1234?producer",
  "Producer",
  "menubar,toolbar,location,resizable,scrollbars"
);

producerWindow.onload = () => {
  const div = producerWindow.document.createElement("div");
  producerWindow.document.body.appendChild(div);

  const Producer = () => {
    return (
      <div>
        <h1>Producer</h1>
        <WrappedCanvas canvas={previewSurface.canvas} />
      </div>
    );
  };
  // const WindowProducer = createPortal(<Producer />, div);
  // render(<WindowProducer />, document.getElementById("app"));
  render(<Producer />, div);
};

class Context extends THREE.EventDispatcher {
  constructor() {
    super();
    const SUPPORTED_WINDOW_SIZES = [
      { width: 640, height: 480 },
      { width: 800, height: 600 },
      { width: 1024, height: 768 },
      { width: 1152, height: 864 },
      { width: 1280, height: 960 },
      { width: 1400, height: 1050 },
      { width: 1600, height: 1200 },
      { width: 2048, height: 1536 },
      { width: 3200, height: 2400 },
      { width: 4000, height: 3000 },
      { width: 6400, height: 4800 },
    ];
    const sizes = SUPPORTED_WINDOW_SIZES.filter(
      (r) => r.width <= screen.width && r.height <= screen.height
    );
    const largestSize = sizes[sizes.length - 1];
    this.gameScreenWidth = largestSize.width;
    this.gameScreenHeight = largestSize.height;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
}
const context = new Context();
context.settings = {
  antialias: true,
  gamma: 2,
  shadows: 0,
  orthoCamera: false,
};

const renderMan = new RenderMan(context);
renderMan.initRenderer();

const cameraConstraints = {};
const minimapControl = new MinimapControl(minimapSurface, mapWidth, mapHeight);
minimapControl.setConstraints(cameraConstraints);

const keyboardShortcuts = new KeyboardShortcuts(document);
const cameras = new Cameras(
  context,
  gameSurface,
  minimapControl,
  keyboardShortcuts
);
cameras.control.setMapBoundary(mapWidth, mapHeight);
cameras.control.setConstraints(cameraConstraints);
cameras.control.resetCamera();

console.log("producerWindow", producerWindow);

function createFloor(mapWidth, mapHeight) {
  const w = mapWidth;
  const h = mapHeight;

  const geo = new THREE.PlaneGeometry(w, h, w, h);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: false,
    wireframeLinewidth: 10,
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.rotateX(-0.5 * Math.PI);
  return mesh;
}

function createBall(mapWidth, mapHeight) {
  const colors = [0xff000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  const size = Math.floor(Math.random() * 2 + 1);
  const geo = new THREE.SphereGeometry(size);
  const mat = new THREE.MeshBasicMaterial({
    color: colors[Math.floor(Math.random() * colors.length)],
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(
    Math.floor(Math.random() * mapWidth) - mapWidth / 2,
    size / 2,
    Math.floor(Math.random() * mapHeight) - mapHeight / 2
  );
  return mesh;
}

function createStartLocation(mapX, mapY, color) {
  var geometry = new THREE.CircleGeometry(10, 32);
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
document.addEventListener("contextmenu", (event) => event.preventDefault());
const scene = new THREE.Scene();
scene.add(cameras.minimapCameraHelper);

var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const world = new THREE.Group();
const mapMesh = createFloor(mapWidth, mapHeight, null);
const startPos = createStartLocation(-60, -60, 0xff0000);
const startPos2 = createStartLocation(60, 60, 0x0000ff);
const gridHelper = new THREE.GridHelper(Math.max(mapWidth, mapHeight), 32);

for (let i = 0; i < 100; i++) {
  const m = createBall(mapWidth, mapHeight);
  m.layers.enable(MinimapLayer);
  scene.add(m);
}
world.layers.enable(MinimapLayer);
mapMesh.layers.enable(MinimapLayer);
startPos.layers.enable(MinimapLayer);
startPos2.layers.enable(MinimapLayer);

world.add(gridHelper);
world.add(mapMesh);
world.add(startPos);
world.add(startPos2);
scene.add(world);

const sceneResizeHandler = () => {
  gameSurface.setDimensions(
    Math.floor(window.innerWidth * 0.8),
    Math.floor(window.innerHeight * 0.8)
  );
  cameras.updateGameScreenAspect(
    gameSurface.getWidth(),
    gameSurface.getHeight()
  );
  minimapSurface.setDimensions(
    Math.floor(window.innerHeight * 0.3),
    Math.floor(window.innerHeight * 0.3)
  );
  cameras.updatePreviewScreenAspect(
    minimapSurface.getWidth(),
    minimapSurface.getHeight()
  );
};
sceneResizeHandler();
window.addEventListener("resize", sceneResizeHandler, false);

const clock = new THREE.Clock(true);

function gameLoop() {
  cameras.update();

  cameras.control.getTarget(axesHelper.position);

  renderMan.setCanvas(gameSurface.canvas);
  renderMan.renderer.clear();
  scene.background = new Color(0x772222);
  renderMan.render(scene, cameras.camera);
  renderMan.renderer.clear();
  scene.background = new Color(0x222277);
  renderMan.setCanvas(minimapSurface.canvas);

  if (cameras.previewOn) {
    renderMan.render(scene, cameras.previewCamera);
  } else {
    renderMan.render(scene, cameras.minimapCamera);
  }

  //if producer mode on
  //renderMan.setCanvas(previewSurface.canvas);
}

renderMan.renderer.setAnimationLoop(gameLoop);

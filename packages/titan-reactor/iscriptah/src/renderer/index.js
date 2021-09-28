import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import {
  Scene,
  OrthographicCamera,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  WebGLRenderer,
  sRGBEncoding,
  MOUSE,
  LinearFilter,
  Vector3,
  Vector4,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  CineonToneMapping,
  LinearEncoding,
  ReinhardToneMapping,
  AxesHelper,
  Group,
  AnimationMixer,
  MeshStandardMaterial,
} from "three";
import { remote } from "electron";
import "balloon-css/balloon.min.css";
import "pattern.css/dist/pattern.min.css";
import "tailwindcss/dist/tailwind.min.css";
import "../../css/icon.css";
import "../../css/app.css";
import App from "./ui/App";
import ClockMs from "titan-reactor-shared/utils/ClockMs";
import { loadAllDataFiles } from "titan-reactor-shared/dat/loadAllDataFiles";
import { openFileBinary } from "titan-reactor-shared/utils/fs";
import CanvasTarget from "titan-reactor-shared/image/CanvasTarget";
import "titan-reactor-shared/utils/electronFileLoader";

import { OrbitControls } from "./OrbitalControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

import store from "./store";
import {
  onGameTick,
  errorOccurred,
  cameraDirectionChanged,
  bwDataPathChanged,
} from "./appReducer";
import { frameSelected } from "./iscriptReducer";
import loadEnvironmentMap from "titan-reactor-shared/image/envMap";

// const state = store.getState();

const surface = new CanvasTarget();
surface.setDimensions(300, 300, window.devicePixelRatio);

const scene = new Scene();
const renderer = new WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setClearColor(0x0000ff);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = sRGBEncoding;
renderer.toneMapping = CineonToneMapping;

const renderToCanvas = (canvasTarget, scene, camera) => {
  renderer.setPixelRatio(canvasTarget.pixelRatio);
  renderer.setSize(canvasTarget.width, canvasTarget.height, false);
  renderer.setViewport(
    new Vector4(0, 0, canvasTarget.width, canvasTarget.height)
  );
  renderer.render(scene, camera);
  canvasTarget.canvas.getContext("2d").drawImage(renderer.domElement, 0, 0);
};

const camera = new PerspectiveCamera(
  22,
  surface.width / surface.height,
  1,
  256
); //new OrthographicCamera(-1, 1, 1, -1, 0.1, 10000);
camera.userData.direction = 0;
camera.position.set(0, 30, 10);
camera.lookAt(new Vector3());

const controls = new OrbitControls(camera, surface.canvas);
controls.mouseButtons = {
  LEFT: MOUSE.PAN,
  MIDDLE: MOUSE.DOLLY,
  RIGHT: MOUSE.ROTATE,
};
const ambLight = new AmbientLight(0xffffff, 1);
scene.add(ambLight);

const dirLight = new DirectionalLight(0xffffff, 3);
dirLight.position.set(-32, 13, -26);
dirLight.castShadow = true;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 200;
dirLight.shadow.bias = 0.0001;
scene.add(dirLight);

const plane = new Mesh(
  new PlaneBufferGeometry(3, 3),
  new MeshStandardMaterial({ color: 0x339933 })
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0;
plane.visible = false;
scene.add(plane);

const axes = new AxesHelper();
axes.visible = false;
scene.add(axes);

const parent = new Group();
scene.add(parent);

const transformControls = new TransformControls(camera, surface.canvas);
transformControls.addEventListener("dragging-changed", function (event) {
  controls.enabled = !event.value;
});
transformControls.setSpace("local");
scene.add(transformControls);
let runner = {};

const clock = new ClockMs(true);

const addTitanSpriteCb = (titanSprite) => {
  parent.add(titanSprite);
  transformControls.attach(titanSprite);
  three.thingies = [...three.thingies, titanSprite];
};

const removeTitanSprite = (titanSprite) => {
  if (transformControls.object === titanSprite) {
    transformControls.detach();
  }
  parent.remove(titanSprite);
};

const three = {
  runner,
  clock,
  tileset: 0,
  camera,
  renderer,
  controls,
  scene,
  plane,
  axes,
  parent,
  transformControls,
  thingies: [],
  preload: [],
  dispose: () => {
    three.thingies.forEach(removeTitanSprite);
    three.thingies = [];
  },
};
window.app = three;

const updateDirection32 = () => {
  let dir;
  const adj = three.controls.target.z - three.camera.position.z;
  const opp = three.controls.target.x - three.camera.position.x;
  const a = Math.atan2(opp, adj) / Math.PI;
  if (a < 0) {
    dir = Math.floor((a + 2) * 16);
  } else {
    dir = Math.floor(a * 16);
  }
  if (dir != three.camera.userData.direction) {
    three.camera.userData.prevDirection = three.camera.userData.direction;
    three.camera.userData.direction = dir;
    store.dispatch(cameraDirectionChanged(dir));
  }
};

const updateEntities = (entities, delta) => {
  let removeEntities = [];
  removeEntities.length = 0;

  for (let entity of entities) {
    if (entity.mainImage) {
      if (entity.userData.direction !== three.camera.userData.direction) {
        entity.setDirection(three.camera.userData.direction);
      }
      //@todo return list of new entities and process them!!
      entity.update(delta);
    }
    if (entity.images.length === 0) {
      removeEntities.push(entity);
    }
  }

  removeEntities.forEach(removeTitanSprite);

  return entities.filter((entity) => !removeEntities.includes(entity));
};

const forceRefresh = new ClockMs();

const animLoop = () => {
  const state = store.getState();
  updateDirection32();

  if (state.iscript.frame !== null) {
    three.thingies.forEach((thingy) => {
      if (thingy.mainImage) {
        try {
          thingy.mainImage.setFrame(
            state.iscript.frame,
            state.iscript.flipFrame
          );
        } catch (e) {
          store.dispatch(
            errorOccurred(
              "can't set frame to this image, try selecting init animation again"
            )
          );
          store.dispatch(frameSelected(null));
        }
      }
    });
  } else {
    if (clock.getElapsedTime() > state.app.gamespeed && state.app.autoUpdate) {
      updateEntities(three.thingies, clock.getElapsedTime());

      clock.elapsedTime = 0;
      store.dispatch(onGameTick());
    }
  }
  if (state.app.transform) {
    if (!transformControls.object && three.thingies.length) {
      transformControls.attach(three.thingies[0]);
    }
    transformControls.setMode(state.app.transform);
    transformControls.showX = state.app.transformEnabled.x;
    transformControls.showY = state.app.transformEnabled.y;
    transformControls.showZ = state.app.transformEnabled.z;
    if (forceRefresh.getElapsedTime() > 500) {
      forceRefresh.elapsedTime = 0;
    }
  } else {
    transformControls.detach();
  }
  three.controls.update();
  renderToCanvas(surface, three.scene, three.camera);
};

const bootup = async (bwDataPath) => {
  try {
    const bwDat = await loadAllDataFiles((file) =>
      openFileBinary(`${bwDataPath}/${file}`)
    );
    three.bwDat = Object.keys(bwDat).reduce((memo, key) => {
      memo[key] = Object.freeze(bwDat[key]);
      return memo;
    }, {});
    three.renderer.setAnimationLoop(animLoop);
    window.three = three;

    store.dispatch(errorOccurred(null));

    store.dispatch(bwDataPathChanged(bwDataPath));
    localStorage.setItem("bwDataPath", bwDataPath);

    try {
      const envMap = await loadEnvironmentMap(
        three.renderer,
        `${__static}/envmap.hdr`
      );
      three.scene.environment = envMap;
    } catch (e) {
      console.error(e);
    }
  } catch (e) {
    store.dispatch(errorOccurred(e.message));
    store.dispatch(bwDataPathChanged(""));
    localStorage.setItem("bwDataPath", "");
    return;
  }
};

const resizeHandler = () => {
  surface.setDimensions(
    (window.innerWidth * 8) / 20,
    (window.innerHeight * 3) / 4,
    window.devicePixelRatio
  );
  // const m = Math.max(surface.width, surface.height);
  // const w = surface.width / m;
  // const h = surface.height / m;
  // camera.left = -w;
  // camera.right = w;
  // camera.top = h;
  // camera.bottom = -h;
  camera.aspect = surface.width / surface.height;
  camera.updateProjectionMatrix();
};
window.addEventListener("resize", resizeHandler, false);
resizeHandler();

render(
  <Provider store={store}>
    <App
      surface={surface}
      three={three}
      bootup={bootup}
      addTitanSpriteCb={addTitanSpriteCb}
    />
  </Provider>,
  document.getElementById("app")
);

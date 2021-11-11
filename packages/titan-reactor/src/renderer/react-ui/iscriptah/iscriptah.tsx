import React from "react";
import {
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  WebGLRenderer,
  sRGBEncoding,
  MOUSE,
  Vector3,
  Vector4,
  Mesh,
  PlaneBufferGeometry,
  CineonToneMapping,
  AxesHelper,
  Group,
  MeshStandardMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

// import "balloon-css/balloon.min.css";
// import "pattern.css/dist/pattern.min.css";
import App from "./components/app";
import { ClockMs } from "../../../common/utils/clock-ms";
import { CanvasTarget } from "../../../common/image";
import "../../../common/utils/electron-file-loader";
import TitanSprite from "../../../common/image/titan-sprite";
import {
  incGameTick,
  setFrame,
  useIScriptahStore,
  useIscriptStore,
  setTransformVector,
} from "./stores";
import { updateDirection32 } from "./camera";
import { updateEntities } from "./entities";
// import loadEnvironmentMap from "../../../common/utils/";

// const state = store.getState();

export const IScriptah = () => {
  const surface = new CanvasTarget();
  surface.setDimensions(300, 300, window.devicePixelRatio);

  const scene = new Scene();

  // @todo use render/renderer
  const renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x0000ff);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = CineonToneMapping;

  const renderToCanvas = (
    canvasTarget: CanvasTarget,
    scene: Scene,
    camera: PerspectiveCamera
  ) => {
    renderer.setPixelRatio(canvasTarget.pixelRatio);
    renderer.setSize(canvasTarget.width, canvasTarget.height, false);
    renderer.setViewport(
      new Vector4(0, 0, canvasTarget.width, canvasTarget.height)
    );
    renderer.render(scene, camera);
    canvasTarget.canvas.getContext("2d")?.drawImage(renderer.domElement, 0, 0);
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
  const dragChangedHandler = function (event) {
    controls.enabled = !event.value;
  };
  transformControls.addEventListener("dragging-changed", dragChangedHandler);
  transformControls.setSpace("local");
  //@todo attach?
  scene.add(transformControls);
  const thingies: TitanSprite[] = [];

  const disposeThingies = () => {
    thingies.forEach(removeTitanSprite);
    thingies.length = 0;
  };

  const clock = new ClockMs(true);

  const addTitanSpriteCb = (titanSprite: TitanSprite) => {
    parent.add(titanSprite);
    transformControls.attach(titanSprite);
    thingies.push(titanSprite);
  };

  const removeTitanSprite = (titanSprite: TitanSprite) => {
    if (transformControls.object === titanSprite) {
      transformControls.detach();
    }
    const i = thingies.indexOf(titanSprite);
    if (i >= 0) {
      thingies.splice(i, 1);
      parent.remove(titanSprite);
    }
  };

  const forceRefresh = new ClockMs();

  const animLoop = () => {
    updateDirection32(controls.target, camera);

    controls.update();
    renderToCanvas(surface, scene, camera);
  };

  useIscriptStore.subscribe((state) => {
    if (typeof state.frame === "number") {
      thingies.forEach((thingy: TitanSprite) => {
        if (thingy.mainImage) {
          try {
            thingy.mainImage.setFrame(state.frame as number, state.flipFrame);
          } catch (e) {
            // store.dispatch(
            //   errorOccurred(
            //     "can't set frame to this image, try selecting init animation again"
            //   )
            // );
            setFrame(null);
          }
        }
      });
    } else {
      const { autoUpdate, gamespeed } = useIScriptahStore.getState();
      if (clock.getElapsedTime() > gamespeed && autoUpdate) {
        updateEntities(
          thingies,
          clock.getElapsedTime(),
          camera.userData.direction,
          removeTitanSprite
        );

        clock.elapsedTime = 0;
        incGameTick();
      }
    }
  });

  useIScriptahStore.subscribe((state, prevState) => {
    renderer.toneMappingExposure = state.exposure;
    plane.visible = state.showFloorAxes;
    axes.visible = state.showFloorAxes;

    if (state.transform !== prevState.transform) {
      if (state.transform) {
        if (!transformControls.object && thingies.length) {
          transformControls.attach(thingies[0]);
        }
        transformControls.setMode(state.transform);
        transformControls.showX = state.transformEnabled.x;
        transformControls.showY = state.transformEnabled.y;
        transformControls.showZ = state.transformEnabled.z;
        if (forceRefresh.getElapsedTime() > 500) {
          forceRefresh.elapsedTime = 0;
        }
        if (state.transform === "translate") {
          setTransformVector(transformControls.object?.position);
        } else if (state.transform === "rotate") {
          setTransformVector(transformControls.object?.rotation);
        } else if (state.transform === "scale") {
          setTransformVector(transformControls.object?.scale);
        }
      } else {
        setTransformVector(null);
        transformControls.detach();
      }
    }
  });

  // const bootup = async () => {
  //   try {
  //     three.renderer.setAnimationLoop(animLoop);
  //     // @ts-ignore
  //     window.three = three;

  //     try {
  //       // const envMap = await loadEnvironmentMap(
  //       //   three.renderer,
  //       //   `${__static}/envmap.hdr`
  //       // );
  //       // three.scene.environment = envMap;
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   } catch (e: any) {
  //     return;
  //   }
  // };

  const resizeHandler = () => {
    surface.setDimensions(
      (window.innerWidth * 8) / 20,
      (window.innerHeight * 3) / 4,
      window.devicePixelRatio
    );
    camera.aspect = surface.width / surface.height;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", resizeHandler, false);
  resizeHandler();

  renderer.setAnimationLoop(animLoop);

  //@ts-ignore
  window.iscriptah = three;

  const dispose = () => {
    renderer.setAnimationLoop(null);
    renderer.dispose();
    disposeThingies();
    // @ts-ignore
    window.iscriptah = null;
    window.removeEventListener("resize", resizeHandler);
    transformControls.removeEventListener(
      "dragging-changed",
      dragChangedHandler
    );
    transformControls.dispose();
    controls.dispose();
  };

  return {
    component: <App surface={surface} addTitanSpriteCb={addTitanSpriteCb} />,
    dispose,
  };
};

export default IScriptah;

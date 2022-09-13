import {
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  MOUSE,
  Vector3,
  Mesh,
  PlaneBufferGeometry,
  AxesHelper,
  Group,
  MeshStandardMaterial,
  Clock,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

import App from "./components/app";
import { Surface } from "@image";
import "common/utils/electron-file-loader";
import IScriptSprite from "./iscript-sprite";
import {
  incGameTick,
  setFrame,
  useIScriptahStore,
  useIscriptStore,
  setTransformVector,
} from "./stores";
import { updateDirection32 } from "./camera";
import { updateEntities } from "./entities";
import { SceneState } from "../scene";
import Janitor from "@utils/janitor";
import { RenderPass } from "postprocessing";
import { renderComposer } from "@render/render-composer";
import { root } from "@render/root";

export function createIScriptahScene(): SceneState {
  const janitor = new Janitor();
  const surface = new Surface();
  surface.setDimensions(300, 300, window.devicePixelRatio);

  const scene = new Scene();
  janitor.mop(scene);

  const camera = new PerspectiveCamera(22, surface.aspect, 1, 256);
  camera.userData.direction = 0;
  camera.position.set(0, 30, 10);
  camera.lookAt(new Vector3());

  const controls = janitor.mop(new OrbitControls(camera, surface.canvas));
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
  const dragChangedHandler = function (event: any) {
    controls.enabled = !event.value;
  };
  janitor.addEventListener(
    transformControls,
    "dragging-changed",
    dragChangedHandler
  );
  transformControls.setSpace("local");
  janitor.mop(transformControls);

  scene.add(transformControls);
  const thingies: IScriptSprite[] = [];

  // const disposeThingies = () => {
  //   thingies.forEach(removeTitanSprite);
  //   thingies.length = 0;
  // };

  const clock = new Clock(true);

  const addTitanSpriteCb = (titanSprite: IScriptSprite) => {
    parent.add(titanSprite);
    transformControls.attach(titanSprite);
    thingies.push(titanSprite);
  };

  const removeTitanSprite = (titanSprite: IScriptSprite) => {
    if (transformControls.object === titanSprite) {
      transformControls.detach();
    }
    const i = thingies.indexOf(titanSprite);
    if (i >= 0) {
      thingies.splice(i, 1);
      parent.remove(titanSprite);
    }
  };

  useIscriptStore.subscribe((state) => {
    if (typeof state.frame === "number") {
      thingies.forEach((thingy: IScriptSprite) => {
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

  const resizeHandler = () => {
    surface.setDimensions(
      (window.innerWidth * 8) / 20,
      (window.innerHeight * 3) / 4,
      window.devicePixelRatio
    );
    camera.aspect = surface.aspect;
    camera.updateProjectionMatrix();
    renderComposer.setSize(surface.bufferWidth, surface.bufferHeight);
  };
  janitor.addEventListener(window, "resize", resizeHandler);
  resizeHandler();

  // const dispose = () => {
  //   disposeThingies();
  // };

  const renderPass = new RenderPass(scene, camera);
  const postProcessingBundle = {
    enabled: true,
    passes: [renderPass],
    effects: [],
  };
  renderComposer.setBundlePasses(postProcessingBundle);
  janitor.mop(() => renderComposer.getWebGLRenderer().setAnimationLoop(null));

  let lastTime = 0;
  let delta = 0;
  const ISCRIPTAH_LOOP = (elapsed: number) => {
    delta = elapsed - lastTime;
    lastTime = elapsed;
    updateDirection32(controls.target, camera);
    renderComposer.render(delta);
    controls.update();
  };

  return {
    id: "@iscriptah",
    beforeNext: () => {
      root.render(null);
    },
    start: () => {
      renderComposer.targetSurface = surface;
      renderComposer.getWebGLRenderer().setAnimationLoop(ISCRIPTAH_LOOP);
      root.render(
        <App surface={surface} addTitanSpriteCb={addTitanSpriteCb} />
      );
    },
    dispose: () => janitor.dispose(),
  };
}

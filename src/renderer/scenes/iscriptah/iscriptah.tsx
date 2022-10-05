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
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "../../../../bundled/assets/open-props.1.4.min.css";
import "../../../../bundled/assets/normalize.min.css";
import "../pre-home-scene/styles.css";

import App from "./components/app";
import { Surface } from "@image/canvas/surface";
import "common/utils/electron-file-loader";
import { updateDirection32 } from "./camera";
import { Janitor } from "three-janitor";
import { RenderPass } from "postprocessing";
import { renderComposer } from "@render/render-composer";
import { root } from "@render/root";
import { settingsStore } from "@stores/settings-store";
import { createAssets, loadImageAtlasDirect } from "@image/assets";
import gameStore from "@stores/game-store";
import { IScriptRunner } from "./iscript-runner";
import {
  incGameTick,
  setBlockFrameCount,
  useIScriptahStore,
  useIscriptStore,
} from "./stores";
import { isGltfAtlas } from "@utils/image-utils";
import { Image3D } from "@core/image-3d";
import { ImageHD } from "@core/image-hd";
import { IScriptState } from "./iscript-state";
import { IScriptImage } from "./iscript-sprite";

const bootup = async () => {
  const settings = await settingsStore().load();
  gameStore().setAssets(await createAssets(settings.data.directories));

  const janitor = new Janitor("iscriptah-scene-loader");

  const surface = new Surface(
    renderComposer.getWebGLRenderer().domElement,
    false
  );
  surface.setDimensions(300, 300, window.devicePixelRatio);
  renderComposer.targetSurface = surface;

  const scene = new Scene();
  janitor.mop(scene, "scene");

  const camera = new PerspectiveCamera(22, surface.aspect, 1, 256);
  camera.userData.direction = 0;
  camera.position.set(0, 30, 10);
  camera.lookAt(new Vector3());

  const controls = janitor.mop(
    new OrbitControls(camera, surface.canvas),
    "controls"
  );

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

  const runner = new IScriptRunner(gameStore().assets!.bwDat, 0);

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
  janitor.addEventListener(window, "resize", "resize", resizeHandler);
  resizeHandler();

  const renderPass = new RenderPass(scene, camera);

  const postProcessingBundle = {
    passes: [renderPass],
  };

  renderComposer.setBundlePasses(postProcessingBundle);
  janitor.mop(
    () => renderComposer.getWebGLRenderer().setAnimationLoop(null),
    "renderLoop"
  );

  let _image: IScriptImage | null = null;
  let _imageLoading = false;

  useIscriptStore.subscribe(({ block }) => {
    if (!block || _imageLoading) return;

    if (_image && block.image.index === _image.image.dat.index) {
      runner.run(block.header, _image.state);
      return;
    }

    console.log("remove", block.header);
    for (const child of parent.children) {
      janitor.dispose(child);
    }
    parent.clear();
    _image = null;
    _imageLoading = true;

    const preload = async () => {
      const { header } = block;

      const atlas = await loadImageAtlasDirect(block.image.index, true);

      const image = isGltfAtlas(atlas)
        ? new Image3D(atlas)
        : new ImageHD().updateImageType(atlas, true);

      image.matrixAutoUpdate = true;
      image.matrixWorldNeedsUpdate = true;

      const iscriptImage: IScriptImage = {
        image: image,
        state: new IScriptState(
          gameStore().assets!.bwDat.iscript.iscripts[block.image.iscript],
          block.image
        ),
        sprite: null,
      };

      runner.run(header, iscriptImage.state);

      setBlockFrameCount(atlas.frames.length);

      console.log("add");
      parent.add(iscriptImage.image);

      _image = iscriptImage;
      _imageLoading = false;
    };
    preload();
  });

  let lastTime = 0;
  let gametick = 0;
  let delta = 0;
  const ISCRIPTAH_LOOP = (elapsed: number) => {
    delta = elapsed - lastTime;
    gametick += delta;
    lastTime = elapsed;

    const { autoUpdate, gamespeed } = useIScriptahStore.getState();

    if (gametick > gamespeed && autoUpdate) {
      gametick = 0;

      const { frame, flipFrame } = useIscriptStore.getState();

      if (!_image) return;

      if (typeof frame === "number") {
        _image.image.setFrame(frame as number, flipFrame);
      } else {
        // if (image.image.userData.direction !== camera.userData.direction) {
        //   this.runner.setDirection(direction, this.mainImage.state);
        //   this.runner.setFrame(this.mainImage.state.frame, this.mainImage.state.flip, this.mainImage.state);
        // }
        const dispatched = runner.update(_image.state);
        //@ts-ignore
        for (const [key, val] of dispatched) {
          switch (key) {
            case "playfram":
              {
                console.log("playfram", val[0], val[1]);
                _image.image.setFrame(val[0], val[1]);
              }
              break;
          }
        }
      }

      incGameTick();
    }

    updateDirection32(controls.target, camera);
    renderComposer.render(delta);
    controls.update();
  };

  renderComposer.getWebGLRenderer().setAnimationLoop(ISCRIPTAH_LOOP);

  root.render(<App surface={surface} />);

  if (module.hot) {
    module.hot.accept("./components/app", () => {
      root.render(<App surface={surface} />);
    });
  }
};

bootup();

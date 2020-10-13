import {
  CubeCamera,
  MOUSE,
  OrthographicCamera,
  PerspectiveCamera,
  Vector3,
  WebGLCubeRenderTarget,
} from "three";
import { OrbitControls } from "../utils/OrbitalControls";
import { MinimapLayer } from "./Layers";
import { MinimapCameraHelper } from "./Minimap";
import { PlayerPovCamera } from "./PlayerPovCamera";

export const CameraControlType = {
  none: 0,
  planeOrbit: 1,
  free: 2,
  unitPov: 3,
  playerPov: 4,
};

export class Cameras {
  constructor(context, map, minimap = null) {
    this.main = this._initPerspectiveCamera();
    this.playerCameras = [new PlayerPovCamera(0), new PlayerPovCamera(1)];

    this.context = context;
    this.map = map;
    if (map) {
      this.cubeCamera = this._initCubeCamera();
    }
    this.control = this._initOrbitControls(false);

    this.minimap = minimap;
    this._delta = new Vector3();

    if (this.minimap) {
      this.minimapCameraHelper = new MinimapCameraHelper(this.main);
      this.minimapCameraHelper.layers.set(MinimapLayer);

      minimap.addEventListener("start", ({ message: pos }) => {
        this._delta.subVectors(this.control.target, this.main.position);
        this.control.target.copy(pos);
        this.main.position.subVectors(pos, this._delta);
      });

      minimap.addEventListener("update", ({ message: pos }) => {
        this.control.target.copy(pos);
        this.main.position.subVectors(pos, this._delta);
      });

      minimap.addEventListener("hover", ({ message: pos }) => {
        console.log("hover");
        this._delta.subVectors(this.control.target, this.main.position);
        this.minimapCameraHelper.position.set(pos.x, 10, pos.z + 10);
        this.minimapCameraHelper.lookAt(pos);
      });
    }

    this.resetMainCamera();
  }

  _initPerspectiveCamera() {
    return new PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      5,
      100
    );
  }

  _initOrthoCamera() {
    return new OrthographicCamera(16, 0, 16, 0, 1, 10000);
  }

  _initCubeCamera() {
    const cubeRenderTargetGenerator = new WebGLCubeRenderTarget(128, {});

    const renderTarget = cubeRenderTargetGenerator.fromEquirectangularTexture(
      this.context.renderer,
      this.map
    );
    cubeRenderTargetGenerator.dispose();
    const cubeCamera = new CubeCamera(1, 100000, renderTarget);
    return cubeCamera;
  }

  _initOrbitControls(limitControl = false) {
    const orbitControl = new OrbitControls(this.main, this.context.gameCanvas);
    orbitControl.mouseButtons = {
      LEFT: MOUSE.PAN,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.ROTATE,
    };
    if (limitControl) {
      orbitControl.panSpeed = 2;
      orbitControl.rotateSpeed = 0.4;
      orbitControl.maxDistance = 80;
      orbitControl.minDistance = 15;
      orbitControl.enableDamping = true;
      orbitControl.dampingFactor = 0.2;
      orbitControl.keyPanSpeed = 50;
      orbitControl.zoomSpeed = 1;

      orbitControl.maxPolarAngle = Math.PI / 3;
      // option to disable for 360 view
      orbitControl.maxAzimuthAngle = Math.PI / 5;
      orbitControl.minAzimuthAngle = -Math.PI / 5;
      // camera.position.clampLength(5, 60);
    }
    orbitControl.screenSpacePanning = false;
    orbitControl.update();
    return orbitControl;
  }

  resetMainCamera() {
    this.main.position.set(0, 100, 0);
    this.main.lookAt(new Vector3());
  }

  onResize() {
    const [width, height] = this.context.getSceneDimensions();
    this.main.aspect = width / height;
    this.main.updateProjectionMatrix();
  }

  onRestoreContext(scene) {
    scene.remove(this.cubeCamera);
    this.cubeCamera.renderTarget.dispose();
    this.cubeCamera = this._initCubeCamera();
    scene.add(this.cubeCamera);
    //@todo update env maps
  }

  getShear() {
    const delta = new Vector3();
    return delta.subVectors(this.main.position, this.control.target);
  }

  getDirection32() {
    const adj = this.control.target.z - this.main.position.z;
    const opp = this.control.target.x - this.main.position.x;
    const a = Math.atan2(opp, adj) / Math.PI;
    if (a < 0) {
      return Math.floor((a + 2) * 16 + 16);
    } else {
      return Math.floor(a * 16 + 16);
    }
  }

  updateEnvMap(obj) {
    obj.material.envMap = this.cubeCamera.renderTarget.texture;
  }

  updateCubeCamera(scene) {
    this.cubeCamera.position.copy(this.main.position);
    this.cubeCamera.rotation.copy(this.main.rotation);
    this.cubeCamera.update(this.context.renderer, scene);
  }

  dispose() {
    this.control.dispose();
    this.cubeCamera.renderTarget.dispose();
  }
}

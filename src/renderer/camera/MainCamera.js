import { is } from "ramda";
import { MOUSE, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { CinematicCamera } from "three/examples/jsm/cameras/CinematicCamera";
import { OrbitControls } from "../utils/OrbitalControls";
import { MinimapLayer } from "./Layers";
import MinimapCameraHelper from "./MinimapCameraHelper";

export const CameraControlType = {
  none: 0,
  planeOrbit: 1,
  free: 2,
  unitPov: 3,
  playerPov: 4,
};

class MainCamera {
  constructor(context, gameSurface, aspect, minimap = null) {
    this.context = context;
    this.gameSurface = gameSurface;
    this.camera = this.context.settings.orthoCamera
      ? this._initOrthoCamera()
      : this._initPerspectiveCamera(aspect); //this._initCinematicCamera(); // this._initPerspectiveCamera(); //this._initCinematicCamera(); // this.; //

    this.control = this._initOrbitControls(gameSurface.canvas, false);

    this.minimap = minimap;
    this._delta = new Vector3();

    if (this.minimap) {
      this.minimapCameraHelper = new MinimapCameraHelper(this.camera);
      this.minimapCameraHelper.layers.set(MinimapLayer);

      minimap.addEventListener("start", ({ message: pos }) => {
        this._delta.subVectors(this.control.target, this.camera.position);
        this.control.target.copy(pos);
        this.camera.position.subVectors(pos, this._delta);
      });

      minimap.addEventListener("update", ({ message: pos }) => {
        this.control.target.copy(pos);
        this.camera.position.subVectors(pos, this._delta);
      });

      minimap.addEventListener("hover", ({ message: pos }) => {
        this._delta.subVectors(this.control.target, this.camera.position);
        this.minimapCameraHelper.position.set(pos.x, 10, pos.z + 10);
        this.minimapCameraHelper.lookAt(pos);
      });
    }

    this.resetMainCamera();
  }

  _initPerspectiveCamera(aspect) {
    return new PerspectiveCamera(22, aspect, 1, 1000);
  }

  _initCinematicCamera(aspect) {
    return new CinematicCamera(90, aspect, 1, 1000);
    // setFocalLength
    // filmGuage
  }

  _initOrthoCamera() {
    return new OrthographicCamera(-16, 16, 16, -16, 1, 10000);
  }

  _initOrbitControls(canvas, limitControl = true) {
    const orbitControl = new OrbitControls(this.camera, canvas);
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
    this.camera.position.set(0, 100, 0);
    this.camera.lookAt(new Vector3());
  }

  updateAspect(width, height) {
    if (is(OrthographicCamera, this.camera)) {
      const m = Math.max(width, height);

      this.camera.left = (-16 * width) / m;
      this.camera.right = (16 * width) / m;
      this.camera.top = (16 * height) / m;
      this.camera.bottom = (-16 * height) / m;
    } else {
      this.camera.aspect = width / height;
    }

    this.camera.updateProjectionMatrix();
  }

  getShear() {
    const delta = new Vector3();
    return delta.subVectors(this.camera.position, this.control.target);
  }

  getDirection32() {
    const adj = this.control.target.z - this.camera.position.z;
    const opp = this.control.target.x - this.camera.position.x;
    const a = Math.atan2(opp, adj) / Math.PI;
    if (a < 0) {
      return Math.floor((a + 2) * 16 + 16);
    } else {
      return Math.floor(a * 16 + 16);
    }
  }

  dispose() {
    this.control.dispose();
  }
}

export default MainCamera;

import { is } from "ramda";
import { Clock, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { CinematicCamera } from "three/examples/jsm/cameras/CinematicCamera";
import {
  MinimapLayer,
  MinimapUnitLayer,
  MinimapPingLayer,
  MinimapFogLayer,
} from "./Layers";
import MinimapCameraHelper from "./MinimapCameraHelper";
import CameraControls from "./TitanReactorCameraControls";

export const CameraControlType = {
  none: 0,
  planeOrbit: 1,
  free: 2,
  unitPov: 3,
  playerPov: 4,
};

class Cameras {
  constructor(context, gameSurface, aspect, minimapControl = null) {
    this.context = context;
    this.gameSurface = gameSurface;
    this.camera = this._createCamera(aspect);
    this.previewCamera = this._createCamera(aspect);
    this.minimapCamera = this._initMinimapCamera();

    this.control = new CameraControls(this.camera, gameSurface.canvas);
    this.previewControl = new CameraControls(
      this.previewCamera,
      gameSurface.canvas
    );
    this.controlClock = new Clock();

    this.minimap = minimapControl;
    this._delta = new Vector3();

    if (this.minimap) {
      this.minimapCameraHelper = new MinimapCameraHelper(this.camera);
      this.minimapCameraHelper.layers.set(MinimapLayer);

      minimapControl.addEventListener("start", ({ message: { pos, cut } }) => {
        const target = new Vector3();
        this.control.getTarget(target);

        this._delta.subVectors(target, this.camera.position);
        this.control.moveTo(pos.x, pos.y, pos.z, !cut);
        this.camera.position.subVectors(pos, this._delta);
      });

      minimapControl.addEventListener("update", ({ message: { pos } }) => {
        this.control.moveTo(pos.x, pos.y, pos.z, true);
        this.camera.position.subVectors(pos, this._delta);
      });

      minimapControl.addEventListener(
        "hover",
        ({ message: { pos, preview } }) => {
          this.previewOn = preview;
          if (preview) {
            const target = new Vector3();
            this.control.getTarget(target);

            const delta = new Vector3();
            delta.subVectors(target, this.camera.position);
            this.previewControl.moveTo(pos.x, pos.y, pos.z, true);

            const newCameraPosition = new Vector3();
            newCameraPosition.subVectors(pos, delta);

            this.previewControl.setLookAt(
              newCameraPosition.x,
              newCameraPosition.y,
              newCameraPosition.z,
              pos.x,
              pos.y,
              pos.z,
              true
            );
          }
        }
      );

      minimapControl.addEventListener("stop", () => {
        this.previewOn = false;
      });
    }

    this.resetMainCamera();
  }

  _createCamera(aspect) {
    return this.context.settings.orthoCamera
      ? this._initOrthoCamera()
      : this._initPerspectiveCamera(aspect);
  }

  _initPerspectiveCamera(aspect) {
    return new PerspectiveCamera(22, aspect, 1, 1000);
  }

  _initCinematicCamera(aspect) {
    return new CinematicCamera(3, aspect, 1, 1000);
    // setFocalLength
    // filmGuage
  }

  _initOrthoCamera() {
    return new OrthographicCamera(-16, 16, 16, -16, 1, 10000);
  }

  _initMinimapCamera() {
    const camera = new OrthographicCamera(
      -this.mapWidth / 2,
      this.mapWidth / 2,
      this.mapHeight / 2,
      -this.mapHeight / 2,
      0.1,
      10000
    );
    camera.position.set(0, 128, 0);
    camera.lookAt(new Vector3());
    camera.layers.disableAll();
    camera.layers.enable(MinimapLayer);
    camera.layers.enable(MinimapUnitLayer);
    camera.layers.enable(MinimapPingLayer);
    camera.layers.enable(MinimapFogLayer);

    return camera;
  }

  enableControls(val) {
    this.control.enabled = val;
  }

  update() {
    this.control.update(this.controlClock.getDelta());
    this.previewControl.update(this.controlClock.getDelta());
  }

  resetMainCamera() {
    this.camera.position.set(0, 100, 0);
    this.camera.lookAt(new Vector3());
  }

  updateGameScreenAspect(width, height) {
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

  updatePreviewScreenAspect(width, height) {
    this.previewCamera.aspect = width / height;
    this.previewCamera.updateProjectionMatrix();
  }

  getShear() {
    const delta = new Vector3();
    const target = new Vector3();
    this.control.getTarget(target);
    return delta.subVectors(this.camera.position, target);
  }

  getDirection32() {
    const target = new Vector3();
    this.control.getTarget(target);
    const adj = target.z - this.camera.position.z;
    const opp = target.x - this.camera.position.x;
    const a = Math.atan2(opp, adj) / Math.PI;
    if (a < 0) {
      return Math.floor((a + 2) * 16 + 16);
    } else {
      return Math.floor(a * 16 + 16);
    }
  }

  dispose() {
    this.control.dispose();
    this.previewControl.dispose();
  }
}

export default Cameras;

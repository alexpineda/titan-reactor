import { is } from "ramda";
import { Clock, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";

import {
  MinimapLayer,
  MinimapUnitLayer,
  MinimapPingLayer,
  MinimapFogLayer,
} from "./Layers";
import MinimapCameraHelper from "./MinimapCameraHelper";
import StandardCameraControls from "./controls/StandardCameraControls";

export const CameraControlType = {
  none: 0,
  planeOrbit: 1,
  free: 2,
  unitPov: 3,
  playerPov: 4,
};

class Cameras {
  constructor(
    settings,
    renderMan,
    gameSurface,
    minimapControl,
    keyboardShortcuts
  ) {
    this.settings = settings;
    this.renderMan = renderMan;
    this.gameSurface = gameSurface;
    const aspect = gameSurface.width / gameSurface.height;
    this.camera = this._createCamera(aspect);
    this.previewCamera = this._createCamera(aspect);
    this.cinematicOptions = {
      gammaBoost: 1.5,
    };

    this.control = new StandardCameraControls(
      this.camera,
      gameSurface.canvas,
      keyboardShortcuts
    );
    this.control.setConstraints();
    this.control.initNumpadControls();
    this.control.execNumpad(7);

    this.previewControl = new StandardCameraControls(
      this.previewCamera,
      gameSurface.canvas,
      keyboardShortcuts
    );

    this.controlClock = new Clock();

    this._delta = new Vector3();

    if (minimapControl) {
      this.minimapCamera = this._initMinimapCamera(
        minimapControl.mapWidth,
        minimapControl.mapHeight
      );
      this.minimapCameraHelper = new MinimapCameraHelper(this.camera);
      this.minimapCameraHelper.layers.set(MinimapLayer);

      minimapControl.addEventListener(
        "start",
        ({ message: { pos, rightMouse, e } }) => {
          const target = new Vector3();
          this.control.getTarget(target);

          this._delta.subVectors(target, this.camera.position);
          this.control.moveTo(pos.x, pos.y, pos.z, rightMouse);
          this.camera.position.subVectors(pos, this._delta);
        }
      );

      minimapControl.addEventListener("update", ({ message: { pos, e } }) => {
        this.control.moveTo(pos.x, pos.y, pos.z, true);
        this.camera.position.subVectors(pos, this._delta);
      });
    }

    this.useCinematic(false);
  }

  _createCamera(aspect) {
    return this._initPerspectiveCamera(aspect);
    // this.settings.orthoCamera
    //   ? this._initOrthoCamera()
  }

  _initPerspectiveCamera(aspect) {
    return new PerspectiveCamera(22, aspect, 3, 256);
  }

  _initOrthoCamera() {
    return new OrthographicCamera(-16, 16, 16, -16, 1, 10000);
  }

  _initMinimapCamera(mapWidth, mapHeight) {
    const maxDim = Math.max(mapWidth, mapHeight);
    const camera = new OrthographicCamera(
      -maxDim / 2,
      maxDim / 2,
      maxDim / 2,
      -maxDim / 2,
      0.1,
      130
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
    const delta = this.controlClock.getDelta();
    this.control.update(delta);
    this.previewControl.update(delta);
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
    const target = this.getTarget();
    return delta.subVectors(this.camera.position, target);
  }

  getDirection32() {
    const target = this.getTarget();
    const adj = target.z - this.camera.position.z;
    const opp = target.x - this.camera.position.x;
    const a = Math.atan2(opp, adj) / Math.PI;
    if (a < 0) {
      return Math.floor((a + 2) * 16 + 16);
    } else {
      return Math.floor(a * 16 + 16);
    }
  }

  isCinematic() {
    return this.camera.renderCinematic;
  }

  useCinematic(cinematicEnabled) {
    this.camera.renderCinematic = cinematicEnabled;

    if (cinematicEnabled) {
      this.renderMan.renderer.toneMappingExposure =
        this.settings.gamma + this.cinematicOptions.gammaBoost;
    } else {
      this.renderMan.renderer.toneMappingExposure = this.settings.gamma;
    }
  }

  getTarget() {
    const target = new Vector3();
    this.control.getTarget(target);
    return target;
  }

  setTarget(x, y, z, enableTransition = false) {
    this.control.setTarget(x, y, z, enableTransition);
  }

  dispose() {
    this.control.dispose();
    this.previewControl.dispose();
    this.gameSurface.canvas.removeEventListener(
      "wheel",
      this._fpControlsListener
    );
  }
}

export default Cameras;

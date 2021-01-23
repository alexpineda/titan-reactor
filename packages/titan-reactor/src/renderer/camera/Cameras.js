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
    previewSurface,
    minimapControl,
    keyboardShortcuts,
    freeControl = false
  ) {
    this.settings = settings;
    this.renderMan = renderMan;
    this.gameSurface = gameSurface;
    const aspect = gameSurface.width / gameSurface.height;
    this.camera = this._createCamera(aspect);
    this.previewCameras = [
      this._createCamera(aspect),
      this._createCamera(aspect),
      this._createCamera(aspect),
      this._createCamera(aspect),
    ];
    this.previewCamera = this.previewCameras[0];
    this.previewCamera.isPreviewCamera = true;
    this.cinematicOptions = {
      gammaBoost: 1.5,
    };

    this.control = new StandardCameraControls(
      this.camera,
      gameSurface.canvas,
      keyboardShortcuts,
      freeControl
    );
    this.control.setConstraints();
    this.control.initNumpadControls();
    this.control.execNumpad(7);

    this.controlClock = new Clock();

    this._delta = new Vector3();

    if (minimapControl) {
      this.previewControl = new StandardCameraControls(
        this.previewCamera,
        previewSurface.canvas,
        keyboardShortcuts
      );
      this.previewControl.setConstraints();
      this.previewControl.initNumpadControls();
      this.previewControl.execNumpad(7);
      this.previewControl.keyboardTruckingEnabled = false;

      this.minimapCamera = this._initMinimapCamera(
        minimapControl.mapWidth,
        minimapControl.mapHeight
      );
      this.minimapCameraHelper = new MinimapCameraHelper(this.camera);
      this.minimapCameraHelper.layers.set(MinimapLayer);

      minimapControl.addEventListener("start", ({ message: { speed } }) => {
        const target = new Vector3();
        const position = new Vector3();
        this.previewControl.getTarget(target);
        this.previewControl.getPosition(position);

        const transition = speed < 2;
        this.control.dampingFactor = speed === 0 ? 0.005 : 0.05;
        this.camera.fov = this.previewCamera.fov;
        this.camera.updateProjectionMatrix();
        this.control.setLookAt(
          position.x,
          position.y,
          position.z,
          target.x,
          target.y,
          target.z,
          transition
        );
      });

      minimapControl.addEventListener("update", ({ message: { pos, e } }) => {
        this.control.moveTo(pos.x, pos.y, pos.z, true);
        this.camera.position.subVectors(pos, this._delta);
      });

      minimapControl.addEventListener("hover", ({ message: { pos, e } }) => {
        const target = new Vector3();
        this.control.getTarget(target);
        this._delta.subVectors(target, this.camera.position);
        this.previewControl.moveTo(pos.x, pos.y, pos.z, false);
        this.previewCamera.position.subVectors(pos, this._delta);
      });

      minimapControl.addEventListener("enter", () => {
        const target = new Vector3();
        const position = new Vector3();
        this.control.getTarget(target);
        this.control.getPosition(position);

        this.previewCamera.fov = this.camera.fov;
        this.previewCamera.updateProjectionMatrix();
        this.previewControl.setLookAt(
          position.x,
          position.y,
          position.z,
          target.x,
          target.y,
          target.z,
          false
        );
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
    this.previewControl && this.previewControl.update(delta);
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
    this.previewCameras.forEach((previewCamera) => {
      previewCamera.aspect = width / height;
      previewCamera.updateProjectionMatrix();
    });
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
      // this.renderMan.renderer.toneMappingExposure =
      //   this.settings.gamma + this.cinematicOptions.gammaBoost;
    } else {
      // this.renderMan.renderer.toneMappingExposure = this.settings.gamma;
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

import { is } from "ramda";
import { Clock, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { CinematicCamera } from "three/examples/jsm/cameras/CinematicCamera";

// import { FirstPersonControls } from "../utils/FirstPersonControls";

import {
  MinimapLayer,
  MinimapUnitLayer,
  MinimapPingLayer,
  MinimapFogLayer,
} from "./Layers";
import MinimapCameraHelper from "./MinimapCameraHelper";
import StandardCameraControls from "./StandardCameraControls";

export const CameraControlType = {
  none: 0,
  planeOrbit: 1,
  free: 2,
  unitPov: 3,
  playerPov: 4,
};

class Cameras {
  constructor(
    context,
    renderMan,
    gameSurface,
    minimapControl,
    keyboardShortcuts
  ) {
    this.context = context;
    this.renderMan = renderMan;
    this.gameSurface = gameSurface;
    const aspect = gameSurface.width / gameSurface.height;
    this.camera = this._createCamera(aspect);
    this.previewCamera = this._createCamera(aspect);
    this.cinematicOptions = {
      far: this.camera.far,
      focalDepth: 100,
      focalLength: 40,
      fstop: 20,
      near: 1,
      showFocus: 0,
      gammaBoost: 1.5,
    };

    this.cinematicCamera = this._initCinematicCamera(aspect);

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

      this.cinematicCameraHelper = new MinimapCameraHelper(
        this.cinematicCamera
      );
      this.cinematicCameraHelper.layers.set(MinimapLayer);

      //start-drag update-drag stop-drag
      //start-preview update-preview stop-preview

      minimapControl.addEventListener(
        "start",
        ({ message: { pos, rightMouse, e } }) => {
          const target = new Vector3();
          this.control.getTarget(target);

          this._delta.subVectors(target, this.camera.position);
          this.control.moveTo(pos.x, pos.y, pos.z, rightMouse);
          this.camera.position.subVectors(pos, this._delta);

          // this.control.rotateTo(Math.PI / 4, Math.PI / 4, true);
          // const newCameraPosition = new Vector3();
          // newCameraPosition.subVectors(pos, this._delta);

          // this.control.setLookAt(
          //   newCameraPosition.x,
          //   newCameraPosition.y,
          //   newCameraPosition.z,
          //   pos.x,
          //   pos.y,
          //   pos.z,
          //   rightMouse
          // );
        }
      );

      minimapControl.addEventListener("update", ({ message: { pos, e } }) => {
        this.control.moveTo(pos.x, pos.y, pos.z, true);
        this.camera.position.subVectors(pos, this._delta);
        // this.control.rotateTo(Math.PI / 4, Math.PI / 4, true);

        // const newCameraPosition = new Vector3();
        // newCameraPosition.subVectors(pos, this._delta);

        // this.control.setLookAt(
        //   newCameraPosition.x,
        //   newCameraPosition.y,
        //   newCameraPosition.z,
        //   pos.x,
        //   pos.y,
        //   pos.z,
        //   true
        // );
      });

      // minimapControl.addEventListener(
      //   "hover",
      //   ({ message: { pos, preview } }) => {
      //     this.previewOn = preview;
      //     if (preview) {
      //       const target = new Vector3();
      //       this.control.getTarget(target);

      //       const delta = new Vector3();
      //       delta.subVectors(target, this.previewCamera.position);

      //       const newCameraPosition = new Vector3();
      //       newCameraPosition.subVectors(pos, delta);

      //       this.previewControl.setLookAt(
      //         newCameraPosition.x,
      //         newCameraPosition.y,
      //         newCameraPosition.z,
      //         pos.x,
      //         pos.y,
      //         pos.z,
      //         true
      //       );
      //     }
      //   }
      // );

      // minimapControl.addEventListener("stop", () => {
      //   this.previewOn = false;
      // });
    }

    this.setActiveCamera(this.camera);
  }

  setActiveCamera(camera) {
    if (camera === this.cinematicCamera) {
      this.cinematicOptions.focalLength = this.control.distance;

      this.renderMan.renderer.toneMappingExposure =
        this.context.settings.gamma + this.cinematicOptions.gammaBoost;
      this.firstPersonControls.connect();
      this.firstPersonControls.lock();
      this.control.enabled = false;

      this.cinematicCamera.position.copy(this.camera.position);
      this.cinematicCamera.rotation.copy(this.camera.rotation);
      this.cinematicCamera.fov = this.camera.fov;
      if (this.minimapControl) {
        this.cinematicCameraHelper.visible = true;
        this.minimapCameraHelper.visible = false;
      }
    } else {
      this.renderMan.renderer.toneMappingExposure = this.context.settings.gamma;
      this.firstPersonControls.unlock();
      this.firstPersonControls.disconnect();
      this.control.enabled = true;

      if (this.minimapControl) {
        this.cinematicCameraHelper.visible = false;
        this.minimapCameraHelper.visible = true;
      }
    }
    this.activeCamera = camera;
  }
  _createCamera(aspect) {
    return this._initPerspectiveCamera(aspect);
    // this.context.settings.orthoCamera
    //   ? this._initOrthoCamera()
  }

  _initPerspectiveCamera(aspect) {
    return new PerspectiveCamera(22, aspect, 3, 256);
  }

  _initCinematicCamera(aspect) {
    return new CinematicCamera(3, aspect, 0.1, 256);
  }

  _initOrthoCamera() {
    return new OrthographicCamera(-16, 16, 16, -16, 1, 10000);
  }

  _initMinimapCamera(mapWidth, mapHeight) {
    const dim = Math.max(mapWidth, mapHeight);

    const camera = new OrthographicCamera(
      -mapWidth / 2,
      mapWidth / 2,
      mapHeight / 2,
      -mapHeight / 2,
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
    // this.firstPersonControls.update(delta);
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
      this.cinematicCamera.aspect = width / height;
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

  getActiveCamera() {
    return this.activeCamera;
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

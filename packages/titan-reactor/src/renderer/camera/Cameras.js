import { is } from "ramda";
import { Clock, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";

import StandardCameraControls from "./controls/StandardCameraControls";
import { ProducerWindowPosition } from "../../common/settings";

export const CameraControlType = {
  none: 0,
  planeOrbit: 1,
  free: 2,
  unitPov: 3,
  playerPov: 4,
};

// manages camera and camera controls as well as updating aspect ratio on screen resize and other camera operations
class Cameras {
  constructor(
    settings,
    mapWidth,
    mapHeight,
    gameSurface,
    previewSurface,
    minimapControl,
    keyboardShortcuts,
    freeControl = false
  ) {
    this.settings = settings;
    this.gameSurface = gameSurface;
    this.freeControl = freeControl;
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

    this.control.setConstraints(freeControl);
    this.control.initNumpadControls();
    this.control.execNumpad(1);

    // this.lookAtLocation();

    this.cameraClock = new Clock();
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

      minimapControl.addEventListener("start", ({ message: { speed } }) => {
        const target = new Vector3();
        const position = new Vector3();

        // preview control is set on hover, copy the values
        if (settings.producerWindowPosition === ProducerWindowPosition.None) {
          this.camera.fov = this.previewCamera.fov;
          this.previewControl.getTarget(target);
          this.previewControl.getPosition(position);
        } else {
          this.camera.fov = this.previewCamera.fov;
          this.previewControl.getTarget(target);
          this.previewControl.getPosition(position);
        }

        const transition = speed < 2;
        this.control.dampingFactor = speed === 0 ? 0.005 : 0.05;

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
  }

  _createCamera(aspect) {
    return this._initPerspectiveCamera(aspect);
  }

  _initPerspectiveCamera(aspect) {
    if (this.freeControl) {
      return new PerspectiveCamera(22, aspect);
    }
    return new PerspectiveCamera(22, aspect, 3, 256);
  }

  lookAtLocation(x, y) {
    const p = new Vector3();
    const t = new Vector3();
    const d = new Vector3();

    this.control.getPosition(p);
    this.control.getTarget(t);

    d.subVectors(t, p);
    this.control.moveTo(x, 0, y, false);
    this.control.position.subVectors(p, d);
  }

  enableControls(val) {
    this.control.enabled = val;
  }

  update() {
    const delta = this.cameraClock.getDelta();
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

  updateDirection32() {
    let dir;
    const target = this.getTarget();
    const adj = target.z - this.camera.position.z;
    const opp = target.x - this.camera.position.x;
    const a = Math.atan2(opp, adj) / Math.PI;
    if (a < 0) {
      dir = Math.floor((a + 2) * 16 + 16);
    } else {
      dir = Math.floor(a * 16 + 16);
    }
    if (dir != this.camera.userData.direction) {
      this.camera.userData.prevDirection = this.camera.userData.direction;
      this.camera.userData.direction = dir;
    }
  }

  updateFromSettings() {
    // .azimuthRotateSpeed	number	1.0	Speed of azimuth rotation.
    // .polarRotateSpeed	number	1.0	Speed of polar rotation.
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
    this.previewControl && this.previewControl.dispose();
  }
}

export default Cameras;
